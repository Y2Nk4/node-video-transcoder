import { createHash } from "node:crypto";

export const SupportedExtension = [
    '.mp4',
    '.mov'
]

export function verifyIfPathValid(path: string): boolean {
    path = path.toLowerCase();

    for (const ext of SupportedExtension) {
        if (path.endsWith(ext)) {
            return true
        }
    }

    return false;
}

export function createOutPath(path: string): string {
    return createHash('sha1')
        .update((process.env.OUTPATH_HASH_SALT || 'path:') + path)
        .digest('hex')
}
