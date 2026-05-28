import React, { useEffect, useMemo, useState } from 'react';

type FilterMode = 'tanggal' | 'range';

interface Filters {
    tanggal?: string;
    dari?: string;
    sampai?: string;
}

interface PrintFilterBarProps {
    filters: Filters;
    onApply: (filters: Filters) => void;
    onReset: () => void;
}

function getInitialMode(filters: Filters): FilterMode {
    return filters.dari || filters.sampai ? 'range' : 'tanggal';
}

function getDayDiff(start: string, end: string): number {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    return Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
}

export default function PrintFilterBar({
    filters,
    onApply,
    onReset,
}: PrintFilterBarProps) {
    const [mode, setMode] = useState<FilterMode>(getInitialMode(filters));
    const [tanggal, setTanggal] = useState(filters.tanggal ?? '');
    const [dari, setDari] = useState(filters.dari ?? '');
    const [sampai, setSampai] = useState(filters.sampai ?? '');
    const [error, setError] = useState('');

    useEffect(() => {
        setMode(getInitialMode(filters));
        setTanggal(filters.tanggal ?? '');
        setDari(filters.dari ?? '');
        setSampai(filters.sampai ?? '');
        setError('');
    }, [filters.dari, filters.sampai, filters.tanggal]);

    const hasActiveFilter = useMemo(
        () => Boolean(tanggal || dari || sampai),
        [dari, sampai, tanggal],
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (mode === 'tanggal') {
            if (!tanggal) {
                setError('Pilih tanggal spesifik terlebih dahulu.');

                return;
            }

            onApply({ tanggal });

            return;
        }

        if (!dari || !sampai) {
            setError('Pilih tanggal mulai dan tanggal selesai.');

            return;
        }

        if (getDayDiff(dari, sampai) > 7) {
            setError('Range tanggal maksimal 7 hari.');

            return;
        }

        onApply({ dari, sampai });
    };

    const handleReset = () => {
        setMode('tanggal');
        setTanggal('');
        setDari('');
        setSampai('');
        setError('');
        onReset();
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setMode('tanggal')}
                        className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                            mode === 'tanggal'
                                ? 'bg-primary text-white'
                                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Tanggal spesifik
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('range')}
                        className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                            mode === 'range'
                                ? 'bg-primary text-white'
                                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Range tanggal
                    </button>
                </div>

                {mode === 'tanggal' ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                Tanggal
                            </span>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(event) =>
                                    setTanggal(event.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                            />
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-600"
                            >
                                Terapkan
                            </button>
                            {hasActiveFilter ? (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Reset
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                Dari
                            </span>
                            <input
                                type="date"
                                value={dari}
                                onChange={(event) =>
                                    setDari(event.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                Sampai
                            </span>
                            <input
                                type="date"
                                value={sampai}
                                onChange={(event) =>
                                    setSampai(event.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                            />
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-600"
                            >
                                Terapkan
                            </button>
                            {hasActiveFilter ? (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Reset
                                </button>
                            ) : null}
                        </div>
                    </div>
                )}

                {error ? (
                    <p className="text-sm text-rose-600">{error}</p>
                ) : (
                    <p className="text-sm text-slate-500">
                        Range tanggal yang diizinkan maksimal 7 hari.
                    </p>
                )}
            </form>
        </div>
    );
}
