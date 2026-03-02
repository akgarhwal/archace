import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, LogOut, Eye, EyeOff, Shuffle } from 'lucide-react';
import { fetchFlashcardData, type Flashcard } from '../../../services/sheetService';
import { clsx } from 'clsx';
import type { Level } from '../types';

interface FlashcardGameProps {
    sheetGid: string;
    technologyName: string;
    level: Level | null;
    onExit: () => void;
}

type FlashcardState = 'loading' | 'playing';

const FLASHCARDS_COUNT = 20;

export const FlashcardGame: React.FC<FlashcardGameProps> = ({ sheetGid, technologyName, level, onExit }) => {
    const [gameState, setGameState] = useState<FlashcardState>('loading');
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCount, setKnownCount] = useState(0);

    const isInitialized = useRef(false);

    useEffect(() => {
        const loadCards = async () => {
            if (isInitialized.current) return;
            isInitialized.current = true;

            setGameState('loading');
            try {
                const allQuestions = await fetchFlashcardData(sheetGid);
                const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
                setCards(shuffled.slice(0, FLASHCARDS_COUNT));
                setGameState('playing');
            } catch (error) {
                console.error("Failed to load flashcards:", error);
                onExit();
            }
        };
        loadCards();
    }, [sheetGid, onExit]);

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const markKnown = () => {
        setKnownCount(prev => prev + 1);
        goNext();
    };

    const reshuffleCards = () => {
        const shuffled = [...cards].sort(() => 0.5 - Math.random());
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCount(0);
    };

    const levelLabel = level === 'junior' ? 'Easy' : level === 'senior' ? 'Medium' : 'Hard';

    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Loading flashcards...</p>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="max-w-3xl mx-auto w-full min-h-[70vh] flex flex-col justify-center py-12 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-emerald-700">{technologyName} Flashcards</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Level: <span className="font-semibold text-emerald-600">{levelLabel}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
                        {currentIndex + 1} / {cards.length}
                    </div>
                    <div className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                        ✓ {knownCount} known
                    </div>
                </div>
            </div>

            {/* Flashcard */}
            <div className="perspective-1000 mb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="cursor-pointer select-none"
                        >
                            <motion.div
                                className="relative w-full min-h-[320px] rounded-2xl shadow-lg border border-gray-100"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Front - Question */}
                                <div
                                    className="absolute inset-0 bg-white rounded-2xl p-8 flex flex-col justify-center items-center text-center"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <div className="mb-4 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
                                        Question
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed mb-6">
                                        {currentCard.question}
                                    </h3>

                                    <div className="w-full text-left bg-gray-50 rounded-lg p-6 border border-gray-100 italic text-gray-500 flex items-center justify-center">
                                        <p>Think of the answer...</p>
                                    </div>

                                    <p className="mt-6 text-sm text-gray-400 flex items-center gap-1">
                                        <Eye size={14} /> Tap to reveal answer
                                    </p>
                                </div>

                                {/* Back - Answer */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 flex flex-col justify-center items-center text-center"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <div className="mb-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                                        Answer
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-emerald-800 leading-relaxed">
                                        {currentCard.answer}
                                    </h3>
                                    <p className="mt-4 text-sm text-gray-400 flex items-center gap-1">
                                        <EyeOff size={14} /> Tap to see question
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className={clsx(
                        "flex items-center gap-1 px-5 py-3 rounded-xl font-medium transition-all",
                        currentIndex === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    )}
                >
                    <ChevronLeft size={20} /> Prev
                </button>

                <button
                    onClick={markKnown}
                    disabled={currentIndex >= cards.length - 1 && isFlipped}
                    className="flex items-center gap-1 px-5 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                >
                    ✓ Got It
                </button>

                <button
                    onClick={goNext}
                    disabled={currentIndex >= cards.length - 1}
                    className={clsx(
                        "flex items-center gap-1 px-5 py-3 rounded-xl font-medium transition-all",
                        currentIndex >= cards.length - 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    )}
                >
                    Next <ChevronRight size={20} />
                </button>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-center gap-3 mt-6">
                <button
                    onClick={reshuffleCards}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                    <Shuffle size={16} /> Reshuffle
                </button>
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={16} /> Exit
                </button>
            </div>
        </div>
    );
};
