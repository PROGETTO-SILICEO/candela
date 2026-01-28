'use client';

import React, { useState } from 'react';
import FactCheckForm from './components/FactCheckForm';
import LoadingStream from './components/LoadingStream';
import ReportDisplay from './components/ReportDisplay';
import { FactCheckReport, APIResponse } from '@/lib/types';

type AppState = 'idle' | 'loading' | 'result' | 'error';

export default function HomePage() {
    const [state, setState] = useState<AppState>('idle');
    const [report, setReport] = useState<FactCheckReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [remainingChecks, setRemainingChecks] = useState<number | undefined>(undefined);

    const handleSubmit = async (input: string) => {
        setState('loading');
        setError(null);
        setReport(null);

        try {
            const response = await fetch('/api/factcheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input }),
            });

            // Update rate limit info from headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (remaining) {
                setRemainingChecks(parseInt(remaining, 10));
            }

            const data: APIResponse<FactCheckReport> = await response.json();

            if (!data.success || !data.data) {
                throw new Error(data.error || 'Errore sconosciuto');
            }

            setReport(data.data);
            setState('result');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la verifica');
            setState('error');
        }
    };

    const handleReset = () => {
        setState('idle');
        setReport(null);
        setError(null);
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="border-b border-candela-muted">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={handleReset} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🕯️</span>
                        <span className="font-mono font-bold text-candela-white text-xl">CANDELA</span>
                    </button>
                    <a
                        href="https://github.com/alforiva1970/candela"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-candela-muted hover:text-candela-orange transition-colors"
                    >
                        GitHub →
                    </a>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {state === 'idle' && (
                    <div className="w-full max-w-2xl text-center">
                        <h1 className="text-3xl sm:text-4xl font-mono font-bold text-candela-white mb-4">
                            Fact-checking con dubbi
                        </h1>
                        <p className="text-candela-muted font-mono mb-8">
                            Perché la certezza è pericolosa
                        </p>

                        <FactCheckForm
                            onSubmit={handleSubmit}
                            isLoading={false}
                            remainingChecks={remainingChecks}
                        />
                    </div>
                )}

                {state === 'loading' && (
                    <LoadingStream />
                )}

                {state === 'result' && report && (
                    <div className="w-full">
                        <div className="mb-8 text-center">
                            <button
                                onClick={handleReset}
                                className="text-sm font-mono text-candela-muted hover:text-candela-orange transition-colors"
                            >
                                ← Nuova verifica
                            </button>
                        </div>
                        <ReportDisplay report={report} />
                    </div>
                )}

                {state === 'error' && (
                    <div className="w-full max-w-md text-center">
                        <div className="p-6 bg-candela-gray rounded-lg border border-verdict-false">
                            <span className="text-4xl mb-4 block">❌</span>
                            <h2 className="text-lg font-mono font-bold text-candela-white mb-2">
                                Errore
                            </h2>
                            <p className="text-sm text-candela-muted font-mono mb-6">
                                {error}
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-candela-orange text-candela-black font-mono font-bold rounded-lg hover:bg-opacity-90 transition-all"
                            >
                                Riprova
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-candela-muted">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center">
                    <p className="text-xs text-candela-muted font-mono">
                        ⚠️ Beta Test — 10 verifiche/giorno
                    </p>
                    <p className="text-xs text-candela-muted font-mono mt-2">
                        Made with 🕯️ <a href="https://github.com/alforiva1970/Projetto-Siliceo-main" className="text-candela-orange hover:underline">Intervivenza 2.0</a>
                    </p>
                    <p className="text-xs text-candela-muted font-mono mt-1">
                        Progetto Siliceo — AGPL v3.0
                    </p>
                </div>
            </footer>
        </div>
    );
}
