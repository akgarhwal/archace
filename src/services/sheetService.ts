import Papa from 'papaparse';

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    correctAnswerIndex: number;
}

interface QuizRow {
    Question: string;
    'Option A': string;
    'Option B': string;
    'Option C': string;
    'Option D': string;
    'Correct Answer': string; // 'A', 'B', 'C', 'D'
    'Correct Answer': string; // 'A', 'B', 'C', 'D'
}

const mapLetterToIndex = (letter: string): number => {
    const map: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    return map[letter.toUpperCase()] ?? -1;
};

export const fetchQuizData = async (gid: string): Promise<QuizQuestion[]> => {
    // Construct URL with GID
    // Base URL is the same, just need to switch query params or use the full URL if simplified
    // The provided URL format was: .../pub?gid=...&single=true&output=csv
    const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYnXVJn7BdJlgGZl9svLhgshjtQMn1J_TejMtxdY2XKKPpaPwgDsG6Krz6SlJoCYn2wTyOfacLFFQ7/pub';
    const url = `${baseUrl}?gid=${gid}&single=true&output=csv`;

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse<QuizRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const questions: QuizQuestion[] = results.data.map(row => ({
                        question: row.Question,
                        options: [row['Option A'], row['Option B'], row['Option C'], row['Option D']],
                        correctAnswerIndex: mapLetterToIndex(row['Correct Answer'])
                    })).filter(q => q.question && q.correctAnswerIndex !== -1); // Basic validation

                    resolve(questions);
                },
                error: (error: Error) => reject(error)
            });
        });
    } catch (error) {
        console.error("Failed to fetch quiz data:", error);
        return [];
    }
};

export interface Flashcard {
    question: string;
    answer: string;
}

interface FlashcardRow {
    Question: string;
    'Correct Answer': string;
}

export const fetchFlashcardData = async (gid: string): Promise<Flashcard[]> => {
    const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYnXVJn7BdJlgGZl9svLhgshjtQMn1J_TejMtxdY2XKKPpaPwgDsG6Krz6SlJoCYn2wTyOfacLFFQ7/pub';
    const url = `${baseUrl}?gid=${gid}&single=true&output=csv`;

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse<FlashcardRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const cards: Flashcard[] = results.data
                        .map(row => ({
                            question: row.Question?.trim() || '',
                            answer: row['Correct Answer']?.trim() || ''
                        }))
                        .filter(c => c.question && c.answer); // Basic validation

                    resolve(cards);
                },
                error: (error: Error) => reject(error)
            });
        });
    } catch (error) {
        console.error("Failed to fetch flashcard data:", error);
        return [];
    }
};
