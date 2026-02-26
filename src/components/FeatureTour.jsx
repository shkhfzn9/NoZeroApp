import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export default function FeatureTour({ steps, onDone }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

    const step = steps[currentStep];

    const updateRect = () => {
        if (!step?.target) return;
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (el) {
            setTargetRect(el.getBoundingClientRect());
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTargetRect(null);
        }
    };

    useEffect(() => {
        // Delay to ensure the target element has rendered and layout is calculated
        const timer = setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
        };
    }, [currentStep, step]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            onDone();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:justify-center items-center pointer-events-auto overflow-hidden">
            {/* Overlay with Cutout */}
            <div className="absolute inset-0 pointer-events-none">
                {targetRect ? (
                    <div
                        className="absolute transition-all duration-500 ease-in-out border-2 border-primary/50 rounded-2xl pointer-events-none"
                        style={{
                            top: Math.max(0, targetRect.top - 8),
                            left: Math.max(0, targetRect.left - 8),
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-black/75 transition-opacity duration-500" />
                )}
            </div>

            {/* Click catcher for skipping when clicking outside (optional UX) */}
            <div className="absolute inset-0 z-0" onClick={onDone} />

            {/* Tour Card */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-t-[32px] lg:rounded-[32px] p-6 w-full max-w-sm m-4 lg:m-0 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-start gap-4 mb-4">
                    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shrink-0", step.iconBg, step.iconColor)}>
                        <span className="material-icons-outlined text-2xl">{step.icon}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                            {step.tag}
                        </span>
                        <h3 className="text-xl font-extrabold text-charcoal dark:text-white leading-tight">
                            {step.title}
                        </h3>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 leading-relaxed font-medium">
                    {step.body}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <button onClick={onDone} className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 uppercase tracking-wider">
                        Skip
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-primary text-charcoal px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform uppercase tracking-wider flex items-center gap-2"
                    >
                        <span>{currentStep < steps.length - 1 ? 'Next' : 'Done'}</span>
                        {currentStep < steps.length - 1 && <span className="material-icons-outlined text-[16px]">arrow_forward</span>}
                    </button>
                </div>

                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-3 rounded-b-xl bg-primary"></div>
            </div>
        </div>,
        document.body
    );
}
