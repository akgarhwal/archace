/**
 * Pick ~N items for a session:
 *  1. recently-wrong (still in the 7-day window)
 *  2. never-seen / expired
 *  3. recently-correct only if the bank is too small
 */

export function questionId(text: string): string {
    const s = text.trim().replace(/\s+/g, ' ');
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

export function shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function selectSessionItems<T extends { id: string }>(
    all: T[],
    progress: { correct: Set<string>; wrong: Set<string> },
    count: number
): T[] {
    if (all.length <= count) return shuffleInPlace([...all]);

    const wrong: T[] = [];
    const fresh: T[] = [];
    const recentCorrect: T[] = [];

    for (const item of all) {
        if (progress.wrong.has(item.id)) wrong.push(item);
        else if (progress.correct.has(item.id)) recentCorrect.push(item);
        else fresh.push(item);
    }

    const picked: T[] = [];
    const take = (pool: T[]) => {
        shuffleInPlace(pool);
        for (const item of pool) {
            if (picked.length >= count) return;
            picked.push(item);
        }
    };

    take(wrong);
    take(fresh);
    take(recentCorrect);
    return picked;
}
