import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
    currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    const steps = [
        { num: 1, label: 'Level' },
        { num: 2, label: 'Mode' },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative flex justify-between items-center">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute top-5 left-0 h-1 bg-emerald-600 -z-10 -translate-y-1/2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />

                {steps.map((step) => {
                    const isActive = step.num <= currentStep;
                    const isCurrent = step.num === currentStep;

                    return (
                        <div key={step.num} className="flex flex-col items-center">
                            <motion.div
                                className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300",
                                    isActive
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-gray-300 text-gray-500"
                                )}
                                animate={{ scale: isCurrent ? 1.1 : 1 }}
                            >
                                {step.num}
                            </motion.div>
                            <span className={clsx(
                                "mt-2 text-xs font-medium transition-colors duration-300",
                                isActive ? "text-emerald-600" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
