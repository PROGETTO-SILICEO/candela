'use client';

import React, { useState, FormEvent } from 'react';

interface FactCheckFormProps {
    onSubmit: (input: string) => void;
    isLoading: boolean;
    remainingChecks?: number;
}

export default function FactCheckForm({ onSubmit, isLoading, remainingChecks }: FactCheckFormProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSubmit(input.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <textarea
                    id="fact-check-input"
                    name="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Incolla URL o testo della notizia da verificare...

Es: https://example.com/articolo
oppure: &quot;Il governo ha approvato una nuova legge che...&quot;"
                    className="w-full h-40 p-4 font-mono text-sm bg-candela-gray border-2 border-candela-muted rounded-lg 
                     text-candela-white placeholder:text-candela-muted
                     focus:border-candela-orange focus:outline-none focus:ring-0
                     resize-none transition-colors"
                    disabled={isLoading}
                    maxLength={5000}
                />

                <div className="absolute bottom-3 right-3 text-xs text-candela-muted">
                    {input.length}/5000
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-candela-orange text-candela-black font-mono font-bold
                     rounded-lg hover:bg-opacity-90 transition-all
                     disabled:bg-candela-muted disabled:text-candela-gray disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="animate-pulse">🔍</span>
                            Verificando...
                        </>
                    ) : (
                        <>
                            🕯️ Verifica con CANDELA
                        </>
                    )}
                </button>

                {remainingChecks !== undefined && (
                    <span className="text-xs text-candela-muted font-mono">
                        {remainingChecks} verifiche rimanenti oggi
                    </span>
                )}
            </div>

            <p className="mt-4 text-center text-xs text-candela-muted font-mono">
                Premi Ctrl+Enter (o ⌘+Enter) per inviare
            </p>
        </form>
    );
}
