import {spawn} from "node:child_process";
import { EventEmitter } from "node:events";
import path from "node:path";

export default class FfmpegWrapper extends EventEmitter{
    declare cmd: string;
    declare source: string;

    INVALID_FILE_REGEXP: RegExp = /Invalid data found when processing input/;
    VALID_FILE_REGEXP: RegExp = /At least one output file must be specified/;
    FILE_NOT_EXIST_REGEXP: RegExp = /Error opening input files: No such file or directory/;

    constructor(cmd: string, source: string) {
        super();

        if (!cmd) throw new Error("FFMPEG Path is required")

        this.cmd = cmd;
        this.source = source;
    }

    async execute(outputPath: string) {
        const duration = await this.getDuration();
        console.log("duration->", duration);
        console.log("path->", outputPath);


        const transcodeArgs: string[] = [
            '-i', this.source,
            '-hls_list_size', '0',
            '-f', 'hls', path.resolve(outputPath, 'video.m3u8'),
            '-v', 'warning',
            '-progress', 'pipe:1',
            '-nostats'
        ];
        const thread = spawn(this.cmd, transcodeArgs);

        thread.stdout.on('data', async (data) => {
            // console.log("stdout->", data.toString())
            const progress = this.parseFfmpegProgress(data.toString());
            let outTimeMicroSec = 0;
            if (progress.has('out_time_ms') && progress.get('out_time_ms') !== 'N/A') {
                outTimeMicroSec = Math.ceil(parseInt( progress.get('out_time_ms') || '0') / 1000);
            }
            console.log("outTimeMicroSec->", outTimeMicroSec, duration)
            const progressPercent = outTimeMicroSec === 0 ? 0 : Math.ceil(outTimeMicroSec / duration * 10000);
            progress.set('progress_percent', progressPercent.toString());
            this.emit('progress', progress);
        })
        thread.stderr.on('data', (data) => {
            console.log("stderr->", data.toString())
        })
        thread.on('close', (code) => {
            console.log("child process exited with code", code)
            if (code === 0) {
                this.emit('finish', {
                    path: outputPath
                });
            }
        })
    }

    parseFfmpegProgress(progress: string): Map<string, string> {
        const map = new Map<string, string>();

        progress.replace(/\r/g, '')
            .split('\n').forEach((line) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    map.set(key, value);
                }
            });

        return map;
    }

    async validate(): Promise<boolean> {
        const args = [ '-v', 'error',
            '-i', this.source,
            '-f', 'null'];
        const result = await this.execCommand(args);

        if (this.INVALID_FILE_REGEXP.test(result.output)) {
            return false;
        } else if (this.VALID_FILE_REGEXP.test(result.output)) {
            return true;
        } else if (this.FILE_NOT_EXIST_REGEXP.test(result.output)) {
            return false;
        } else {
            throw new Error("Unknown FFMPEG error: " + result.output);
        }
    }

    async getDuration(): Promise<number> {
        const DURATION_REGEXP: RegExp = /Duration: (\d{2}:\d{2}:\d{2}.\d{2})/;
        const args = [ '-i', this.source ];
        const result = await this.execCommand(args);

        if (!DURATION_REGEXP.test(result.output)) {
            throw new Error("Duration not found in FFMPEG output");
        } else {
            const match = result.output.match(DURATION_REGEXP);
            if (match) {
                const duration = match[1];
                const [hours, minutes, seconds] = duration.split(':');
                const durationInSec = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
                return durationInSec * 1000;
            } else {
                throw new Error("Duration not found in FFMPEG output");
            }
        }
    }

    execCommand(args: string[]): Promise<ExecuteResult> {
        return new Promise((resolve, reject) => {
            const thread = spawn(this.cmd, args)
            let output = '';
            thread.stderr.on('data', (message) => {
                output += message.toString();
            })

            thread.on('close', (code) => {
                return resolve({output, code: code || -1});
            })
        });
    }
}

interface ExecuteResult {
    output: string;
    code: number;
}
