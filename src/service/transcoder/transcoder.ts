import { Sequelize, Op } from "sequelize";
import Queue from "bee-queue";
import File, {FileStatus, FileType} from '../../models/file';
import FfmpegWrapper from "../../lib/ffmpegWrapper/ffmpegWrapper";
import {existsSync, Stats, statSync} from "node:fs";
import {mkdirSync} from "fs";
import {readdir} from "fs/promises"
import path from "node:path";
import recursiveReadDir from "recursive-readdir";
import {createOutPath, verifyIfPathValid} from "./helpers";

export default class Transcoder {
    declare db: Sequelize;
    declare queue: Queue;
    declare scanTimer: NodeJS.Timeout;

    constructor(db: Sequelize) {
        this.db = db;
        this.queue = new Queue('transcoder', {
            activateDelayedJobs: true
        })
    }

    async start() {
        this.queue.on('job progress', async (jobId, progress) => {
            const job = await this.queue.getJob(jobId);
            console.log("job reports progress", job)
        });

        await this.fetchDBJob();
        this.queue.process(this.processJob.bind(this));
        this.scanTimer = setInterval(this.intervalJob.bind(this), 1000 * (process.env.SCAN_INTERVAL ? parseInt(process.env.SCAN_INTERVAL) : 120));
    }

    async intervalJob() {
        this.fetchDBJob.bind(this)
        this.scanFiles();
    }

    async fetchDBJob() {
        const files = await File.findAll({
            where : {
                [Op.or]: [
                    { status: FileStatus.ARRIVED },
                    { status: FileStatus.NOT_READY },
                    { status: FileStatus.ENCODING },
                ]
            }
        })

        const creatingJobs: File[] = [];

        await Promise.all(files.map(async (file: File) => {
            if (!file.queueJobId) {
                creatingJobs.push(file);
            } else {
                try {
                    await this.queue.getJob(file.queueJobId.toString());
                    /**
                     * TODO: Track job status and error to file db
                     * */
                } catch (e) {
                    console.log("Failed to fetch job details, creating new job", file.id, e)
                    creatingJobs.push(file);
                }

            }
        }));

        await this.createJobs(...creatingJobs);
    }

    processJob(job: any, done: any) {
        (async () => {
            const file: File = job.data?.file;

            if (!process.env.FFMPEG_PATH) {
                return done(new Error("FFMPEG_PATH is not defined in .env file"));
            }

            if (!existsSync(file.path)) {
                await File.update({
                    status: FileStatus.NOT_EXIST
                }, { where: { id: file.id }});
                return done(null);
            }

            const ffmpeg = new FfmpegWrapper(process.env.FFMPEG_PATH, file.path);

            const valid = await ffmpeg.validate();
            if (!valid) {
                await File.update({
                    status: FileStatus.NOT_READY
                }, { where: { id: file.id }});
                console.log("File is not ready to be encoded", file.path)
                return done(new Error(`File is not ready to be encoded: ${file.path}`));
            }

            if (file.status !== FileStatus.ENCODING) {
                // ARRIVED or NOT_READY
                // ENCODING means it's already ready to be encoded
                const fileStat: Stats = statSync(file.path);
                await File.update({
                    size: fileStat.size,
                }, { where: { id: file.id }});
            }

            const outPath: string = await this.prepareJob(file);

            ffmpeg.execute(outPath);

            ffmpeg.on('progress', async (progress: Map<string, string>) => {
                console.log("Job Progress", progress)
                await File.update({
                    status: FileStatus.ENCODING,
                    encodingProgress: parseInt(progress.get('progress_percent') || '0')
                }, { where: { id: file.id }});
            });
            ffmpeg.on('finish', (data) => {
                console.log("Job Finished", data)
                File.update({
                    status: FileStatus.ENCODED,
                    encodingProgress: 10000,
                    encodedAt: new Date()
                }, { where: { id: file.id }});
                done(null, data)
            });
        })();
    }

    async prepareJob(file: File): Promise<string> {
        if (!process.env.OUTPUT_PATH) throw new Error("OUTPUT_PATH is not defined in .env file");
        const outPath = `${process.env.OUTPUT_PATH}/${createOutPath(file.path)}`;
        await File.update({
            outPath: outPath
        }, { where: { id: file.id }})

        if (!existsSync(outPath)) {
            mkdirSync(outPath);
        }
        return outPath;
    }

    async jobFailed(job: any, error: Error) {

    }

    async createJobs(...files: File[]): Promise<Queue.Job<{ file: File }>[]> {
        const serial: Promise<any> = Promise.resolve();
        const jobs: Queue.Job<{ file: File }>[] = [];

        files.forEach((file: File) => {
            serial.then(async (): Promise<Queue.Job<{ file: File }>> => {
                const job = await this.queue.createJob({ file })
                    .retries(3)
                    .backoff('fixed', 1000)
                    .on('failed', (err) => {
                        console.log(`Job failed with error ${err.message}`);
                    })
                    .save()

                jobs.push(job);

                await File.update({
                    queueJobId: job.id,
                }, { where: { id: job.data.file.id } });
                return job;
            })
        })

        await serial;

        return jobs;
    }

    async scanFiles() {
        const files = await File.findAll({
            attributes: ['id', 'path'],
        });
        const dbFilePaths = files.map(path => path.path)

        let filesInFS = await recursiveReadDir(process.env.INPUT_PATH || 'input')

        filesInFS = filesInFS
            .filter(verifyIfPathValid)
            .filter(path => !dbFilePaths.includes(path))

        const filesInDB: File[] = await this.createFilesInDB(filesInFS)
        const jobs = await this.createJobs(...filesInDB)
        console.log("Created Jobs:", jobs)
    }

    async createFilesInDB(paths: string[]) {
        return File.bulkCreate(paths.map((filePath) => {
            const fileStat = statSync(filePath)
            return {
                name: path.basename(filePath),
                type: FileType.VIDEO,
                status: FileStatus.ARRIVED,
                path: filePath,
                size: fileStat.size,
                createdAt: new Date()
            }
        }))
    }

    async _fileRetrieval(): Promise<File[]> {
        const filesInPath = await readdir(process.env.INPUT_PATH || 'input');

        const files: File[] = [];
        const filenameQueue: string[] = filesInPath.map(filePath => path.resolve(process.env.INPUT_PATH || 'input', filePath));
        console.log(filenameQueue)
        return files;
    }
}
