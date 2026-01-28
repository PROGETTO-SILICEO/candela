'use client';

import React from 'react';

interface LoadingStep {
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
}

interface LoadingStreamProps {
    steps?: LoadingStep[];
}

const DEFAULT_STEPS: LoadingStep[] = [
    { id: 'extract', label: 'Estrazione claim...', completed: false, current: true },
    { id: 'search', label: 'Ricerca fonti...', completed: false, current: false },
    { id: 'analyze', label: 'Analisi con Nova-CANDELA...', completed: false, current: false },
    { id: 'candle', label: 'Candle Test...', completed: false, current: false },
    { id: 'report', label: 'Generazione report...', completed: false, current: false },
];

export default function LoadingStream({ steps = DEFAULT_STEPS }: LoadingStreamProps) {
    // Animate through steps
    const [activeStep, setActiveStep] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => {
                if (prev < DEFAULT_STEPS.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-candela-gray rounded-lg border-2 border-candela-muted">
            <div className="flex items-center gap-3 mb-6">
                <div className="animate-spin text-2xl">🕯️</div>
                <span className="font-mono text-candela-white">Verificando...</span>
            </div>

            <div className="space-y-3">
                {DEFAULT_STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 font-mono text-sm">
                        <span className="w-5 text-center">
                            {index < activeStep ? (
                                <span className="text-verdict-verified">✓</span>
                            ) : index === activeStep ? (
                                <span className="animate-pulse text-candela-orange">○</span>
                            ) : (
                                <span className="text-candela-muted">○</span>
                            )}
                        </span>
                        <span className={
                            index < activeStep
                                ? 'text-candela-white'
                                : index === activeStep
                                    ? 'text-candela-orange'
                                    : 'text-candela-muted'
                        }>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-candela-muted">
                <p className="text-xs text-candela-muted font-mono text-center">
                    ⏱️ Tempo stimato: 10-15 secondi
                </p>
            </div>
        </div>
    );
}
