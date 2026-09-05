import Papa from 'papaparse';
import type { Level, RevisionMode } from '../components/Wizard/types';
import { SHEET_GID_MAP, localCsvUrl, sheetCsvUrl } from '../data/sheetConfig';
import { questionId } from './questionSelector';

export interface QuizQuestion {
    id: string;
    section: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface Flashcard {
    id: string;
    section: string;
    question: string;
    answer: string;
}

interface QuizRow {
    Section?: string;
    Question: string;
    'Option A': string;
    'Option B': string;
    'Option C': string;
    'Option D': string;
    'Correct Answer': string;
}

interface FlashcardRow {
    Section?: string;
    Question: string;
    'Correct Answer': string;
}

const mapLetterToIndex = (letter: string): number => {
    const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    return map[letter.trim().toUpperCase()] ?? -1;
};

async function loadCsvText(level: Level, mode: RevisionMode): Promise<string> {
    const localUrl = localCsvUrl(level, mode);
    try {
        const local = await fetch(localUrl);
        if (local.ok) {
            const text = await local.text();
            if (text.trim() && !text.trimStart().startsWith('<')) return text;
        }
    } catch {
        // Fall through to the published sheet.
    }

    const gid = SHEET_GID_MAP[level][mode];
    const remote = await fetch(sheetCsvUrl(gid));
    return remote.text();
}

export const fetchQuizData = async (level: Level): Promise<QuizQuestion[]> => {
    try {
        const csvText = await loadCsvText(level, 'quiz');
        return new Promise((resolve, reject) => {
            Papa.parse<QuizRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const questions: QuizQuestion[] = results.data
                        .map((row) => {
                            const question = row.Question?.trim() || '';
                            return {
                                id: questionId(question),
                                section: row.Section?.trim() || '',
                                question,
                                options: [row['Option A'], row['Option B'], row['Option C'], row['Option D']],
                                correctAnswerIndex: mapLetterToIndex(row['Correct Answer'] || ''),
                            };
                        })
                        .filter((q) => q.question && q.correctAnswerIndex !== -1);
                    resolve(questions);
                },
                error: (error: Error) => reject(error),
            });
        });
    } catch (error) {
        console.error('Failed to fetch quiz data:', error);
        return [];
    }
};

export const fetchFlashcardData = async (level: Level): Promise<Flashcard[]> => {
    try {
        const csvText = await loadCsvText(level, 'flashcards');
        return new Promise((resolve, reject) => {
            Papa.parse<FlashcardRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const cards: Flashcard[] = results.data
                        .map((row) => {
                            const question = row.Question?.trim() || '';
                            return {
                                id: questionId(question),
                                section: row.Section?.trim() || '',
                                question,
                                answer: row['Correct Answer']?.trim() || '',
                            };
                        })
                        .filter((c) => c.question && c.answer);
                    resolve(cards);
                },
                error: (error: Error) => reject(error),
            });
        });
    } catch (error) {
        console.error('Failed to fetch flashcard data:', error);
        return [];
    }
};
