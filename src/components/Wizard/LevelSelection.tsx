import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Award } from 'lucide-react';
import { clsx } from 'clsx';
import type { Level } from './types';

interface LevelSelectionProps {
    selectedLevel: Level | null;
    onSelect: (level: Level) => void;
}

export const LevelSelection: React.FC<LevelSelectionProps> = ({ selectedLevel, onSelect }) => {
    const levels: { id: Level; title: string; description: string; icon: React.ElementType }[] = [
        {
            id: 'junior',
            title: 'Junior',
            description: 'Fundamental concepts and basic architectural patterns.',
            icon: User,
        },
        {
            id: 'senior',
            title: 'Senior',
            description: 'System design, trade-offs, and scaling strategies.',
            icon: Briefcase,
        },
        {
            id: 'staff',
            title: 'Staff+',
            description: 'Complex distributed systems, organizational impact, and high-level strategy.',
            icon: Award,
        },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Your Experience Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {levels.map((level) => {
                    const isSelected = selectedLevel === level.id;
                    const Icon = level.icon;

                    return (
                        <motion.button
                            key={level.id}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(level.id)}
                            className={clsx(
                                "flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group text-left",
                                isSelected
                                    ? "border-emerald-500 bg-emerald-50 shadow-emerald-100 shadow-lg"
                                    : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-lg"
                            )}
                        >
                            <div className={clsx(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300",
                                isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                            )}>
                                <Icon size={32} />
                            </div>

                            <h3 className={clsx(
                                "text-xl font-bold mb-3 transition-colors",
                                isSelected ? "text-emerald-800" : "text-gray-800"
                            )}>
                                {level.title}
                            </h3>

                            <p className={clsx(
                                "text-sm leading-relaxed text-center",
                                isSelected ? "text-emerald-700" : "text-gray-500"
                            )}>
                                {level.description}
                            </p>

                            {isSelected && (
                                <motion.div
                                    layoutId="outline"
                                    className="absolute inset-0 border-2 border-emerald-500 rounded-2xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
