import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { RevisionMode, Step, Level } from './types';
import { StepIndicator } from './StepIndicator';
import { LevelSelection } from './LevelSelection';
import { RevisionModeSelection } from './RevisionModeSelection';
import { clsx } from 'clsx';
import { QuizGame } from './Quiz/QuizGame';
import { FlashcardGame } from './Flashcard/FlashcardGame';
import { SHEET_GID_MAP } from '../../data/sheetConfig';

export const WizardContainer: React.FC = () => {
    const [step, setStep] = useState<Step>(1);
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [selectedMode, setSelectedMode] = useState<RevisionMode | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const handleNext = () => {
        if (step < 2) {
            setStep((prev) => (prev + 1) as Step);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((prev) => (prev - 1) as Step);
        }
    };

    const handleFinish = () => {
        setIsFinished(true);
        console.log('Finished with:', { selectedLevel, selectedMode });
    };

    // Validation for Next button
    const canProceed = () => {
        if (step === 1) return !!selectedLevel;
        if (step === 2) return !!selectedMode;
        return false;
    };

    if (isFinished && selectedLevel && selectedMode) {
        const sheetGid = SHEET_GID_MAP[selectedLevel][selectedMode];

        if (selectedMode === 'quiz') {
            return (
                <QuizGame
                    sheetGid={sheetGid}
                    technologyName="General Architecture"
                    level={selectedLevel}
                    onExit={() => setIsFinished(false)}
                />
            );
        }

        // Flashcards mode
        return (
            <FlashcardGame
                sheetGid={sheetGid}
                technologyName="General Architecture"
                level={selectedLevel}
                onExit={() => setIsFinished(false)}
            />
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 min-h-screen flex flex-col justify-center py-12 pb-32">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                    archeace Learning Path
                </h1>
                <p className="text-lg text-gray-600">Select your level and start practicing.</p>
            </div>

            <StepIndicator currentStep={step} />

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 1 && (
                            <LevelSelection
                                selectedLevel={selectedLevel}
                                onSelect={setSelectedLevel}
                            />
                        )}
                        {step === 2 && (
                            <RevisionModeSelection
                                selectedMode={selectedMode}
                                onSelect={setSelectedMode}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sticky Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
                            step === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={clsx(
                            "flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg",
                            !canProceed()
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95"
                        )}
                    >
                        {step === 2 ? 'Start' : 'Next'}
                        {step !== 2 && <ArrowRight size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
