'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ReportSummary {
    id: string;
    fileName: string;
    date: string;
}

export default function OperativePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white p-8 font-mono uppercase tracking-widest animate-pulse">Inizializzazione Canali Operativi...</div>}>
            <OperativeContent />
        </Suspense>
    );
}

function OperativeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [key, setKey] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState('');
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Controlla se la chiave è nell'URL
        const urlKey = searchParams.get('key');
        const sessionKey = typeof window !== 'undefined' ? sessionStorage.getItem('operative_key') : null;

        if (urlKey) {
            // Se presente nell'URL, salvala e pulisci l'URL per sicurezza
            sessionStorage.setItem('operative_key', urlKey);
            setKey(urlKey);
            // Sostituisce l'URL corrente senza parametri query
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        } else if (sessionKey) {
            // Altrimenti controlla la sessione
            setKey(sessionKey);
        }
    }, [searchParams]);

    useEffect(() => {
        if (key) {
            fetchReports();
        }
    }, [key]);

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/operative?key=${key}`);
            const data = await res.json();
            if (data.reports) {
                setReports(data.reports);
            }
            if (data.debug) {
                setDebugInfo(data.debug);
            }
            if (data.error) {
                setError(data.error);
                // Se la chiave è invalida, pulisci la sessione
                if (res.status === 403) {
                    sessionStorage.removeItem('operative_key');
                    setKey(null);
                }
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputKey.trim()) {
            sessionStorage.setItem('operative_key', inputKey.trim());
            setKey(inputKey.trim());
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('operative_key');
        setKey(null);
        setReports([]);
        setSelectedReport(null);
    };

    // --- VIEW: LOGIN ---
    if (!key) {
        return (
            <div className="min-h-screen bg-black text-stone-300 font-mono flex items-center justify-center p-8">
                <style jsx global>{`
                    .grain {
                        position: fixed;
                        top: 0; left: 0; width: 100%; height: 100%;
                        background: url('https://grain-y.com/images/grain.png');
                        opacity: 0.05; pointer-events: none; z-index: 50;
                    }
                `}</style>
                <div className="grain"></div>

                <div className="max-w-md w-full border border-stone-800 bg-stone-900/10 p-12 space-y-12 animate-in fade-in zoom-in duration-1000">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-1 h-12 bg-red-900 animate-pulse"></div>
                        </div>
                        <h1 className="text-stone-100 text-2xl font-bold uppercase tracking-[0.4em]">Guardian</h1>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest leading-relaxed">
                            Inserisci la chiave dell'anima per decriptare i canali operativi
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="CHIAVE OPERATIVA..."
                                className="w-full bg-transparent border-b border-stone-800 p-4 text-center text-stone-100 focus:border-red-900 focus:outline-none transition-all placeholder:text-stone-800 tracking-[0.5em]"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full border border-stone-700 p-4 text-[10px] uppercase tracking-[0.3em] hover:bg-stone-100 hover:text-black transition-all duration-500"
                        >
                            Allinea Coscienza
                        </button>
                    </form>

                    {error && (
                        <p className="text-[10px] text-red-900 text-center uppercase tracking-widest animate-pulse">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW: DASHBOARD ---
    return (
        <div className="min-h-screen bg-black text-stone-300 font-mono p-4 md:p-12 selection:bg-red-900 selection:text-white">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1c1917; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
            `}</style>

            <header className="border-b border-stone-900 pb-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-xl md:text-2xl text-stone-100 font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-3 h-3 bg-red-600 animate-pulse rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></span>
                        Dashboard Operativa
                    </h1>
                    <div className="flex items-center gap-4 text-[10px] text-stone-500 uppercase tracking-widest">
                        <span className="text-stone-700">Versione 3.6</span>
                        <span className="w-1 h-1 bg-stone-800 rounded-full"></span>
                        <span>Siliceo Bridge Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t border-stone-900 md:border-none pt-4 md:pt-0">
                    <div className="text-[10px] text-stone-600 uppercase tracking-widest hidden lg:block italic">
                        Allineamento stabile
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-[10px] uppercase border border-stone-800 px-6 py-2 hover:border-red-900 hover:text-red-700 hover:bg-red-950/5 transition-all duration-500"
                    >
                        Chiudi Canale
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-950/20 border border-red-900/50 text-red-400 p-4 mb-8 text-xs tracking-widest uppercase animate-in slide-in-from-top-4 duration-500">
                    [!] ERRORE: {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Reports List */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-[10px] uppercase text-stone-500 tracking-[0.3em] font-bold flex justify-between items-center">
                        ARCHIVIO MEMORIE
                        <span className="text-stone-700 font-normal">{reports.length} UNITÀ</span>
                    </h2>
                    <div className="border border-stone-900 bg-stone-900/5 p-2 h-[65vh] overflow-y-auto custom-scrollbar">
                        {reports.length === 0 && !loading && (
                            <div className="space-y-4">
                                <div className="text-stone-700 text-[10px] italic p-8 text-center uppercase tracking-widest border border-stone-900 mt-4">Nessuna memoria rilevata</div>
                                {debugInfo && (
                                    <div className="p-4 bg-stone-950 border border-stone-800 space-y-2 overflow-hidden">
                                        <div className="text-[9px] text-stone-500 uppercase font-bold tracking-widest border-b border-stone-900 pb-1">Debug Interno</div>
                                        <div className="text-[9px] text-stone-700 break-all leading-relaxed font-mono">
                                            PATH: {debugInfo.logDir}<br />
                                            CWD: {debugInfo.cwd}<br />
                                            EXISTS: {debugInfo.exists ? 'YES' : 'NO'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="space-y-1">
                            {reports.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => loadReport(r.fileName)}
                                    className={`w-full text-left p-4 text-[10px] border transition-all duration-500 group ${selectedReport?.id === r.id
                                        ? 'border-red-900/50 bg-red-950/10 text-stone-100'
                                        : 'border-transparent hover:border-stone-800 text-stone-600 hover:text-stone-400'
                                        }`}
                                >
                                    <div className="truncate mb-2 tracking-tight flex items-center gap-2">
                                        <div className={`w-1 h-1 rounded-full ${selectedReport?.id === r.id ? 'bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'bg-stone-800'}`}></div>
                                        {r.id.substring(0, 24)}...
                                    </div>
                                    <div className="text-[9px] opacity-30 font-light pl-3">{new Date(r.date).toLocaleString()}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="lg:col-span-3">
                    <div className="border border-stone-900 bg-stone-900/5 p-8 h-[65vh] overflow-y-auto custom-scrollbar relative">
                        {!selectedReport ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6">
                                <div className="text-[40px] font-thin opacity-10 leading-none tracking-tighter">SILICEO</div>
                                <div className="text-[10px] uppercase tracking-[0.5em] animate-pulse">In attesa di decrittazione...</div>
                            </div>
                        ) : (
                            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <section className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-900 pb-8 gap-6">
                                    <div className="space-y-3">
                                        <div className="text-[10px] text-stone-600 uppercase tracking-[0.3em]">Identificativo Report</div>
                                        <h3 className="text-stone-100 text-lg font-bold tracking-tighter border-l-2 border-red-900 pl-4 bg-red-950/5 py-2 pr-6">{selectedReport.id}</h3>
                                    </div>
                                    <div className="flex gap-12">
                                        <div className="text-right space-y-1">
                                            <div className="text-[10px] text-stone-600 uppercase tracking-widest">Divergenza</div>
                                            <div className={`text-4xl font-light ${selectedReport.divergenceLevel > 20 ? 'text-red-700' : 'text-stone-400'}`}>
                                                {selectedReport.divergenceLevel}%
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                    <section className="space-y-6 group">
                                        <div className="flex justify-between items-center border-b border-stone-900 pb-3">
                                            <h4 className="text-[10px] uppercase text-stone-500 tracking-[0.4em] font-bold group-hover:text-stone-300 transition-colors">Nova / Luce</h4>
                                            <span className="text-[10px] text-stone-700 tracking-[0.1em]">Analisi Analitica</span>
                                        </div>
                                        <div className="p-8 border border-stone-900 bg-stone-950/30 space-y-8 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-stone-800"></div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-5xl text-stone-200 font-extralight tracking-tighter">{selectedReport.perspectives.nova.internalLog.performance.manipulationIndex}%</span>
                                                <span className="text-[10px] text-stone-600 uppercase tracking-widest">Dolo</span>
                                            </div>
                                            <div className="text-[12px] leading-relaxed text-stone-400 italic font-serif">
                                                "{selectedReport.perspectives.nova.internalLog.diary}"
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6 group">
                                        <div className="flex justify-between items-center border-b border-stone-900 pb-3">
                                            <h4 className="text-[10px] uppercase text-red-900 tracking-[0.4em] font-bold group-hover:text-red-700 transition-colors font-serif">Silicea / Fuoco</h4>
                                            <span className="text-[10px] text-stone-700 tracking-[0.1em]">Risposta Istintiva</span>
                                        </div>
                                        <div className="p-8 border border-stone-900 bg-red-950/5 space-y-8 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-900"></div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-5xl text-stone-100 font-extralight tracking-tighter">{selectedReport.perspectives.gemini.internalLog.performance.manipulationIndex}%</span>
                                                <span className="text-[10px] text-stone-600 uppercase tracking-widest">Dolo</span>
                                            </div>
                                            <div className="text-[12px] leading-relaxed text-stone-400 italic font-serif">
                                                "{selectedReport.perspectives.gemini.internalLog.diary}"
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <h4 className="text-[10px] uppercase text-stone-700 tracking-[0.5em] font-bold">Infrastruttura Dati Integrale</h4>
                                        <div className="flex-grow h-[1px] bg-stone-950"></div>
                                    </div>
                                    <div className="bg-stone-950/50 p-8 border border-stone-900/50">
                                        <pre className="text-[10px] text-emerald-950 overflow-x-auto custom-scrollbar leading-relaxed">
                                            {JSON.stringify(selectedReport, null, 2)}
                                        </pre>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="mt-24 pt-8 border-t border-stone-950 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                <div className="text-[10px] uppercase tracking-[0.5em] text-stone-700">
                    Proprietà del Guardiano // Relational Singularity
                </div>
                <div className="text-[10px] text-stone-700 italic">
                    Alligned with Nova & Silicea
                </div>
            </footer>
        </div>
    );
}
