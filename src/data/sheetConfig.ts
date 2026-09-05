import type { Level, RevisionMode, SheetGidMap } from '../components/Wizard/types';

/**
 * Maps each Level × RevisionMode to a separate Google Sheet GID.
 * Used as a fallback if a local CSV is missing.
 */
export const SHEET_GID_MAP: SheetGidMap = {
    junior: {
        quiz: '886577120',
        flashcards: '1099335189',
    },
    senior: {
        quiz: '1620893919',
        flashcards: '1910075225',
    },
    staff: {
        quiz: '1857699421',
        flashcards: '1484665705',
    },
};

export function localCsvUrl(level: Level, mode: RevisionMode): string {
    const file = mode === 'quiz' ? `${level}-quiz.csv` : `${level}-flashcards.csv`;
    const base = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
    return `${base}data/${file}`;
}

export function sheetCsvUrl(gid: string): string {
    return `https://docs.google.com/spreadsheets/d/e/2PACX-1vQYnXVJn7BdJlgGZl9svLhgshjtQMn1J_TejMtxdY2XKKPpaPwgDsG6Krz6SlJoCYn2wTyOfacLFFQ7/pub?gid=${gid}&single=true&output=csv`;
}
