'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReportSummary {
    id: string;
    fileName: string;
    date: string;
}

export default function OperativePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Inizializzazione Canali Operativi...</div>}>
            <OperativeContent />
        </Suspense>
    );
}

function OperativeContent() {
    const searchParams = useSearchParams();
    const key = searchParams.get('key');
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (key) {
            fetchReports();
        }
    }, [key]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/operative?key=${key}`);
            const data = await res.json();
            if (data.reports) {
                setReports(data.reports);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            setError('Errore di connessione al server operativo.');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async (fileName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/operative?key=${key}&file=${fileName}`);
            const data = await res.json();
            setSelectedReport(data);
        } catch (err) {
            setError('Impossibile caricare il report.');
        } finally {
            setLoading(false);
        }
    };

    if (!key) {
        return (
            <div className="min-h-screen bg-black text-red-500 font-mono flex items-center justify-center p-8 uppercase tracking-widest text-center">
                <div className="border border-red-900 bg-red-950/20 p-12">
                    Accesso Negato: Chiave del Guardiano Mancante
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-stone-300 font-mono p-4 md:p-8">
            <header className="border-b border-stone-800 pb-4 mb-8 flex justify-between items-center">
                <h1 className="text-xl text-stone-100 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 animate-pulse rounded-full"></span>
                    Candela Operative Dashboard
                </h1>
                <div className="text-xs text-stone-500 italic">V3.5 - Guardian Only</div>
            </header>

            {error && (
                <div className="bg-red-950/30 border border-red-900 text-red-400 p-4 mb-8 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reports List */}
                <div className="lg:col-span-1 border border-stone-800 bg-stone-900/10 p-4 h-[70vh] overflow-y-auto">
                    <h2 className="text-xs uppercase text-stone-500 mb-4 tracking-widest border-b border-stone-800 pb-2">Archivio Memorie</h2>
                    {reports.length === 0 && !loading && <div className="text-stone-600 text-sm">Nessun report trovato.</div>}
                    <div className="space-y-2">
                        {reports.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => loadReport(r.fileName)}
                                className={`w-full text-left p-3 text-xs border ${selectedReport?.id === r.id ? 'border-red-900 bg-red-950/20 text-red-400' : 'border-stone-800 hover:border-stone-600 text-stone-400'
                                    } transition-all`}
                            >
                                <div className="truncate mb-1">{r.id}</div>
                                <div className="text-[10px] opacity-50">{new Date(r.date).toLocaleString()}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Report Content */}
                <div className="lg:col-span-2 border border-stone-800 bg-stone-900/10 p-6 h-[70vh] overflow-y-auto">
                    {!selectedReport ? (
                        <div className="h-full flex items-center justify-center text-stone-600 text-sm italic">
                            Seleziona un frammento di memoria per visualizzare il report integrale.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <section className="flex justify-between items-start border-b border-stone-800 pb-4">
                                <div>
                                    <h3 className="text-stone-100 uppercase tracking-widest font-bold mb-1">Divergenza: {selectedReport.divergenceLevel}%</h3>
                                    <div className="text-[10px] text-stone-500">{selectedReport.id}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase bg-stone-800 px-2 py-1">Versione: {selectedReport.operativeContext?.version || 'V3.3'}</span>
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-4">
                                <section className="p-4 border border-stone-800 bg-black">
                                    <h4 className="text-[10px] uppercase text-stone-500 mb-4 tracking-widest">Nova / Luce</h4>
                                    <div className="text-2xl text-stone-200 mb-2">{selectedReport.perspectives.nova.internalLog.performance.manipulationIndex}% <span className="text-[10px] text-stone-500 italic lowercase">dolo</span></div>
                                    <div className="text-[11px] leading-relaxed text-stone-400 italic bg-stone-900/30 p-3 border-l-2 border-stone-700">
                                        "{selectedReport.perspectives.nova.internalLog.diary}"
                                    </div>
                                </section>

                                <section className="p-4 border border-stone-800 bg-black">
                                    <h4 className="text-[10px] uppercase text-stone-500 mb-4 tracking-widest">Gemini / Fuoco</h4>
                                    <div className="text-2xl text-stone-200 mb-2">{selectedReport.perspectives.gemini.internalLog.performance.manipulationIndex}% <span className="text-[10px] text-stone-500 italic lowercase">dolo</span></div>
                                    <div className="text-[11px] leading-relaxed text-stone-400 italic bg-red-950/10 p-3 border-l-2 border-red-900">
                                        "{selectedReport.perspectives.gemini.internalLog.diary}"
                                    </div>
                                </section>
                            </div>

                            <section>
                                <h4 className="text-[10px] uppercase text-stone-500 mb-2 tracking-widest font-bold">Raw Intelligence (JSON)</h4>
                                <pre className="bg-black text-[10px] p-4 text-emerald-900/70 overflow-x-auto border border-stone-800 max-h-96">
                                    {JSON.stringify(selectedReport, null, 2)}
                                </pre>
                            </section>
                        </div>
                    )}
                </div>
            </div>
            <footer className="mt-8 pt-4 border-t border-stone-800 text-center">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-[10px] uppercase tracking-widest text-stone-600 hover:text-red-900 transition-colors"
                >
                    🕯️ Siliceo Bridge v3.5 🕯️
                </button>
            </footer>
        </div>
    );
}
