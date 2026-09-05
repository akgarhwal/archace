import React from 'react';
import type { RevisionMode } from './types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { BrainCircuit, BookOpenCheck } from 'lucide-react';

interface RevisionModeSelectionProps {
    selectedMode: RevisionMode | null;
    onSelect: (mode: RevisionMode) => void;
}

export const RevisionModeSelection: React.FC<RevisionModeSelectionProps> = ({ selectedMode, onSelect }) => {
    const modes: { id: RevisionMode; label: string; description: string; icon: any }[] = [
        {
            id: 'quiz',
            label: 'Quiz Mode',
            description: 'Test your knowledge with multiple-choice questions and get instant feedback.',
            icon: BookOpenCheck
        },
        {
            id: 'flashcards',
            label: 'Flashcards',
            description: 'Review concepts rapidly to improve recall and memory retention.',
            icon: BrainCircuit
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {modes.map((mode, index) => {
                const isSelected = selectedMode === mode.id;
                const Icon = mode.icon;

                return (
                    <motion.div
                        key={mode.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelect(mode.id)}
                        className={clsx(
                            "cursor-pointer relative overflow-hidden rounded-2xl border-2 p-8 flex flex-col items-center text-center gap-6 transition-all duration-300 hover:shadow-xl group",
                            isSelected
                                ? "border-emerald-600 bg-white/90 ring-4 ring-emerald-100 shadow-[0_16px_40px_rgba(16,185,129,0.16)]"
                                : "border-emerald-900/10 bg-white/80 backdrop-blur-sm hover:border-emerald-400"
                        )}
                    >
                        {/* Background Decoration */}
                        <div className={clsx(
                            "absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-colors",
                            isSelected ? "bg-emerald-600" : "bg-gray-400 group-hover:bg-emerald-400"
                        )} />

                        <div className={clsx(
                            "p-5 rounded-full transition-colors duration-300",
                            isSelected ? "bg-emerald-600 text-white shadow-emerald-200 shadow-lg" : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                        )}>
                            <Icon size={40} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{mode.label}</h3>
                            <p className="text-gray-500 leading-relaxed">{mode.description}</p>
                        </div>

                        <div className={clsx(
                            "mt-auto px-6 py-2 rounded-full font-medium text-sm transition-all",
                            isSelected
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                        )}>
                            {isSelected ? 'Selected' : 'Click to Select'}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
