import type { SheetGidMap } from '../components/Wizard/types';

/**
 * Maps each Level × RevisionMode to a separate Google Sheet GID.
 * 3 levels × 2 modes = 6 sheets total.
 *
 * Replace the placeholder GID strings with your actual Google Sheet GIDs.
 */
export const SHEET_GID_MAP: SheetGidMap = {
    junior: {
        quiz: '886577120',          // Easy Quiz sheet
        flashcards: '1099335189',     // Easy Flashcards sheet (placeholder)
    },
    senior: {
        quiz: '1620893919',    // Medium Quiz sheet (placeholder)
        flashcards: '1910075225',   // Medium Flashcards sheet (placeholder)
    },
    staff: {
        quiz: '1857699421',      // Hard Quiz sheet (placeholder)
        flashcards: '1484665705',     // Hard Flashcards sheet (placeholder)
    },
};
