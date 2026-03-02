import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, CheckCircle, XCircle, Trophy, RefreshCcw, LogOut } from 'lucide-react';
import { fetchQuizData, type QuizQuestion } from '../../../services/sheetService';
import { clsx } from 'clsx';
import type { Level } from '../types';

interface QuizGameProps {
    sheetGid: string;
    technologyName: string;
    level: Level | null;
    onExit: () => void;
}

type QuizState = 'loading' | 'playing' | 'finished';

const TIMER_BY_LEVEL: Record<Level, number> = {
    junior: 30,  // Easy: 30 seconds
    senior: 45,  // Medium: 45 seconds
    staff: 60,  // Hard: 60 seconds
};
const QUESTIONS_COUNT = 20;

export const QuizGame: React.FC<QuizGameProps> = ({ sheetGid, technologyName, level, onExit }) => {
    const [gameState, setGameState] = useState<QuizState>('loading');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const questionTimer = level ? TIMER_BY_LEVEL[level] : 30;
    const [timeLeft, setTimeLeft] = useState(questionTimer);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    const isInitialized = useRef(false);

    // Fetch and prepare questions
    useEffect(() => {
        const loadQuestions = async () => {
            if (isInitialized.current) return;
            isInitialized.current = true;

            setGameState('loading');
            try {
                const allQuestions = await fetchQuizData(sheetGid);

                // No client-side difficulty filtering needed — each sheet GID
                // already points to a sheet containing only that difficulty's questions.

                // Shuffle and pick 20
                const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
                setQuestions(shuffled.slice(0, QUESTIONS_COUNT));
                setGameState('playing');
            } catch (error) {
                console.error("Failed to load quiz:", error);
                // Handle error gracefully - maybe show an error state or exit
                onExit();
            }
        };
        loadQuestions();
    }, [sheetGid, level, onExit]);

    // Timer logic
    useEffect(() => {
        if (gameState !== 'playing' || isAnswerRevealed) return;

        if (timeLeft <= 0) {
            handleTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameState, isAnswerRevealed]);

    const nextQuestion = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTimeLeft(questionTimer);
            setSelectedAnswer(null);
            setIsAnswerRevealed(false);
        } else {
            setGameState('finished');
        }
    }, [currentIndex, questions.length]);

    const handleAnswer = useCallback((optionIndex: number) => {
        if (isAnswerRevealed) return;

        setSelectedAnswer(optionIndex);
        setIsAnswerRevealed(true);

        const currentQuestion = questions[currentIndex];

        // Safety check to prevent crash if questions aren't loaded or index is out of bounds
        if (!currentQuestion) {
            console.error("Attempted to answer but no question found at index", currentIndex);
            return;
        }

        const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setTimeout(nextQuestion, 2000);
    }, [isAnswerRevealed, questions, currentIndex, nextQuestion]);

    const handleTimeUp = useCallback(() => {
        if (!isAnswerRevealed) {
            handleAnswer(-1); // -1 indicates timeout
        }
    }, [isAnswerRevealed, handleAnswer]);

    const restartGame = () => {
        setGameState('loading');
        setScore(0);
        setCurrentIndex(0);
        setTimeLeft(questionTimer);
        setSelectedAnswer(null);
        setIsAnswerRevealed(false);
        const loadQuestions = async () => {
            const allQuestions = await fetchQuizData(sheetGid);
            const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, QUESTIONS_COUNT));
            setGameState('playing');
        };
        loadQuestions();
    };

    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Preparing your quiz...</p>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mb-6 shadow-lg">
                    <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                <p className="text-xl text-gray-600 mb-8">
                    You scored <span className="font-bold text-emerald-600 text-2xl">{score}</span> out of <span className="font-bold text-gray-800 text-2xl">{questions.length}</span>
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        <LogOut size={20} />
                        Exit
                    </button>
                    <button
                        onClick={restartGame}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-200"
                    >
                        <RefreshCcw size={20} />
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="max-w-3xl mx-auto w-full min-h-[70vh] flex flex-col justify-center py-12">
            {/* Header: Tech Name & Progress */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-emerald-700">{technologyName} Quiz</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
                        Question {currentIndex + 1} / {questions.length}
                    </div>

                    <div className={clsx(
                        "flex items-center gap-2 font-mono text-lg font-bold transition-colors bg-white px-3 py-1 rounded-lg border",
                        timeLeft <= 5 ? "text-red-600 border-red-100 animate-pulse" : "text-emerald-600 border-emerald-100"
                    )}>
                        <Clock size={20} />
                        <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-snug">
                        {currentQuestion.question}
                    </h3>

                    <div className="flex flex-col gap-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === currentQuestion.correctAnswerIndex;
                            const isWrong = isSelected && !isCorrect;

                            // Determine style based on state
                            let buttonStyle = "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50";
                            let icon = null;
                            let labelStyle = "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-700";

                            if (isAnswerRevealed) {
                                if (isCorrect) {
                                    buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                                    icon = <CheckCircle size={20} className="text-emerald-600" />;
                                    labelStyle = "bg-emerald-200 text-emerald-800";
                                } else if (isWrong) {
                                    buttonStyle = "border-red-500 bg-red-50 text-red-900";
                                    icon = <XCircle size={20} className="text-red-600" />;
                                    labelStyle = "bg-red-200 text-red-800";
                                } else {
                                    buttonStyle = "border-gray-200 opacity-50";
                                }
                            } else if (isSelected) {
                                buttonStyle = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
                                labelStyle = "bg-emerald-600 text-white";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={isAnswerRevealed}
                                    className={clsx(
                                        "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group",
                                        buttonStyle
                                    )}
                                >
                                    <span className={clsx(
                                        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                                        labelStyle
                                    )}>
                                        {optionLabels[index]}
                                    </span>
                                    <span className="flex-1 font-medium text-lg">{option}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
