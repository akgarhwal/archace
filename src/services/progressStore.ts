/**
 * Compact 7-day progress for a lecture path (level + mode).
 *
 * Only short hashes of question text are stored — never the question itself.
 * Entries older than 7 days are dropped so any question can appear again.
 */

const STORAGE_KEY = 'aa.p.v1';
const TTL_DAYS = 7;

type Day = number;
type Hash = string;

export interface PathProgress {
    /** hash -> unix day last marked correct */
    c: Record<Hash, Day>;
    /** hash -> unix day last marked wrong */
    w: Record<Hash, Day>;
}

type StoreFile = Record<string, PathProgress>;

export function unixDay(now = Date.now()): Day {
    return Math.floor(now / 86_400_000);
}

export function lecturePathKey(level: string, mode: string): string {
    return `${level}|${mode}`;
}

function emptyProgress(): PathProgress {
    return { c: {}, w: {} };
}

function readStore(): StoreFile {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as StoreFile;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeStore(store: StoreFile): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Private mode / quota — practice still works without memory.
    }
}

function pruneProgress(progress: PathProgress, today: Day): PathProgress {
    const minDay = today - TTL_DAYS;
    const c: Record<Hash, Day> = {};
    const w: Record<Hash, Day> = {};
    for (const [id, day] of Object.entries(progress.c ?? {})) {
        if (day >= minDay) c[id] = day;
    }
    for (const [id, day] of Object.entries(progress.w ?? {})) {
        if (day >= minDay) w[id] = day;
    }
    return { c, w };
}

function pruneStore(store: StoreFile, today: Day): StoreFile {
    const next: StoreFile = {};
    for (const [key, progress] of Object.entries(store)) {
        const pruned = pruneProgress(progress, today);
        if (Object.keys(pruned.c).length || Object.keys(pruned.w).length) {
            next[key] = pruned;
        }
    }
    return next;
}

export function loadPathProgress(pathKey: string): PathProgress {
    const today = unixDay();
    const store = pruneStore(readStore(), today);
    writeStore(store);
    return store[pathKey] ? pruneProgress(store[pathKey], today) : emptyProgress();
}

function mutatePath(pathKey: string, fn: (p: PathProgress, today: Day) => void): void {
    const today = unixDay();
    const store = pruneStore(readStore(), today);
    const current = store[pathKey] ? pruneProgress(store[pathKey], today) : emptyProgress();
    fn(current, today);
    store[pathKey] = current;
    writeStore(store);
}

export function markCorrect(pathKey: string, questionId: string): void {
    mutatePath(pathKey, (p, today) => {
        p.c[questionId] = today;
        delete p.w[questionId];
    });
}

export function markWrong(pathKey: string, questionId: string): void {
    mutatePath(pathKey, (p, today) => {
        p.w[questionId] = today;
        delete p.c[questionId];
    });
}

export function progressSets(progress: PathProgress): { correct: Set<string>; wrong: Set<string> } {
    return {
        correct: new Set(Object.keys(progress.c)),
        wrong: new Set(Object.keys(progress.w)),
    };
}
