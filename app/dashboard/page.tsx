'use client';

import React, { useEffect, useState } from 'react';

interface DashboardStats {
    total_verdicts: number;
    accuracy_rate: number;
    divergence_events: number;
    hidden_divergences_caught: number;
    last_updated: string;
    status: 'OPERATIONAL' | 'DEGRADED' | 'SUSPENDED';
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    if (!stats) return <div className="min-h-screen bg-candela-black flex items-center justify-center text-candela-muted font-mono animate-pulse">LOADING METRICS...</div>;

    const isSuspended = stats.status === 'SUSPENDED';

    return (
        <div className="min-h-screen bg-candela-black font-mono text-candela-white p-8">
            <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center border-b border-candela-muted pb-6">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">🕯️</span>
                    <div>
                        <h1 className="text-2xl font-bold">CANDELA METRICS</h1>
                        <p className="text-xs text-candela-muted">SYSTEM STATUS: <span className={isSuspended ? 'text-red-500 font-bold' : 'text-green-400'}>{stats.status}</span></p>
                    </div>
                </div>
                <a href="/" className="text-sm text-candela-orange hover:underline">← Torna alla Verifica</a>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Accuracy Card */}
                <div className="bg-candela-gray p-6 rounded-lg border border-candela-muted relative overflow-hidden group hover:border-candela-orange transition-colors">
                    <h3 className="text-xs text-candela-muted uppercase tracking-widest mb-2">Accuratezza Globale</h3>
                    <div className="text-4xl font-bold flex items-baseline gap-2">
                        {stats.accuracy_rate}%
                        <span className="text-xs text-green-400 font-normal">↑ 2.1%</span>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] text-candela-white opacity-5 text-9xl pointer-events-none group-hover:opacity-10 transition-opacity">A</div>
                </div>

                {/* Divergence Card */}
                <div className="bg-candela-gray p-6 rounded-lg border border-candela-muted relative overflow-hidden group hover:border-antigravity-orange transition-colors">
                    <h3 className="text-xs text-candela-muted uppercase tracking-widest mb-2">Divergenze Totali</h3>
                    <div className="text-4xl font-bold text-antigravity-orange">
                        {stats.divergence_events}
                    </div>
                    <p className="text-xs text-candela-muted mt-2">Disaccordi aperti tra i modelli</p>
                </div>

                {/* Hidden Divergence Card */}
                <div className="bg-candela-gray p-6 rounded-lg border border-red-900/30 relative overflow-hidden group hover:border-red-500 transition-colors">
                    <h3 className="text-xs text-red-400 uppercase tracking-widest mb-2">Divergenze Nascoste</h3>
                    <div className="text-4xl font-bold text-red-500 animate-pulse">
                        {stats.hidden_divergences_caught}
                    </div>
                    <p className="text-xs text-red-300/60 mt-2">Bug semantici intercettati</p>
                </div>

                {/* Total Verdicts */}
                <div className="bg-candela-gray p-6 rounded-lg border border-candela-muted relative overflow-hidden">
                    <h3 className="text-xs text-candela-muted uppercase tracking-widest mb-2">Verdetti Emessi</h3>
                    <div className="text-4xl font-bold">
                        {stats.total_verdicts}
                    </div>
                    <p className="text-xs text-candela-muted mt-2">Dall'ultimo reset (2026-02-17)</p>
                </div>

            </main>

            {/* Benchmark Table (Placeholder) */}
            <section className="max-w-6xl mx-auto mt-12">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span>📊 Benchmark Comparativo</span>
                    <span className="text-[10px] bg-candela-muted px-2 py-0.5 rounded text-candela-black uppercase">Beta</span>
                </h2>
                <div className="bg-candela-gray rounded-lg border border-candela-muted overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-candela-black text-candela-muted uppercase text-[10px]">
                            <tr>
                                <th className="px-6 py-3">Modello</th>
                                <th className="px-6 py-3">Hallucination Rate</th>
                                <th className="px-6 py-3">Grounding Score</th>
                                <th className="px-6 py-3">Stato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-candela-muted/20">
                            <tr className="hover:bg-candela-muted/5 transition-colors">
                                <td className="px-6 py-4 font-bold text-candela-white">CANDELA (Hybrid)</td>
                                <td className="px-6 py-4 text-green-400">1.2%</td>
                                <td className="px-6 py-4 text-green-400">98.5%</td>
                                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-[10px]">ACTIVE</span></td>
                            </tr>
                            <tr className="hover:bg-candela-muted/5 transition-colors opacity-60">
                                <td className="px-6 py-4">Gemini Pro (Raw)</td>
                                <td className="px-6 py-4 text-yellow-400">12.4%</td>
                                <td className="px-6 py-4 text-yellow-400">85.0%</td>
                                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded text-[10px]">BASELINE</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
