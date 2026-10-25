import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
/**
 * The user's Downloads folder (~/Downloads on Windows, macOS and Linux), or the
 * current directory when there is no such folder — the file is always written
 * somewhere predictable.
 */
export function downloadsDir(home = homedir(), cwd = process.cwd()) {
    const dir = join(home, 'Downloads');
    try {
        if (existsSync(dir) && statSync(dir).isDirectory())
            return dir;
    }
    catch {
        // unreadable home: fall through to cwd
    }
    return cwd;
}
/** `crawlcove-<host>-<YYYY-MM-DD-HHMMSS>.<ext>`, local time, filesystem-safe on every OS. */
export function defaultFileName(seedUrl, format, when = new Date()) {
    let host;
    try {
        host = new URL(seedUrl).hostname;
    }
    catch {
        host = 'site';
    }
    host = host.replace(/^www\./, '').replace(/[^a-z0-9.-]+/gi, '-') || 'site';
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}` +
        `-${pad(when.getHours())}${pad(when.getMinutes())}${pad(when.getSeconds())}`;
    return `crawlcove-${host}-${stamp}.${format}`;
}
/** `name.ext`, or `name-2.ext`, `name-3.ext`… if a file with that name already exists in `dir`. */
export function unusedPath(dir, fileName, exists = existsSync) {
    const dot = fileName.lastIndexOf('.');
    const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
    const ext = dot > 0 ? fileName.slice(dot) : '';
    let candidate = join(dir, fileName);
    for (let n = 2; exists(candidate); n++)
        candidate = join(dir, `${stem}-${n}${ext}`);
    return candidate;
}
/** Where a crawl result should go when no --file is given. */
export function defaultDestination(format, seedUrl, stdoutIsTTY, when = new Date()) {
    // CSV typed into a terminal is for opening in a spreadsheet, not reading as
    // text, so it goes to Downloads. Piped or redirected output (a script, CI,
    // `> file.csv`) still streams to stdout, and JSON stays on stdout everywhere.
    if (format === 'csv' && stdoutIsTTY) {
        return { kind: 'file', path: unusedPath(downloadsDir(), defaultFileName(seedUrl, format, when)) };
    }
    return { kind: 'stdout' };
}
