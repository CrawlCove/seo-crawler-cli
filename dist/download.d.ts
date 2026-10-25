/**
 * The user's Downloads folder (~/Downloads on Windows, macOS and Linux), or the
 * current directory when there is no such folder — the file is always written
 * somewhere predictable.
 */
export declare function downloadsDir(home?: string, cwd?: string): string;
/** `crawlcove-<host>-<YYYY-MM-DD-HHMMSS>.<ext>`, local time, filesystem-safe on every OS. */
export declare function defaultFileName(seedUrl: string, format: 'csv' | 'json', when?: Date): string;
/** `name.ext`, or `name-2.ext`, `name-3.ext`… if a file with that name already exists in `dir`. */
export declare function unusedPath(dir: string, fileName: string, exists?: (p: string) => boolean): string;
/** Where a crawl result should go when no --file is given. */
export declare function defaultDestination(format: 'csv' | 'json', seedUrl: string, stdoutIsTTY: boolean, when?: Date): {
    kind: 'stdout';
} | {
    kind: 'file';
    path: string;
};
