import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import Select from '@/Components/UI/Select';

interface Filters {
    search?: string;
    status?: string;
    source?: string;
    date_from?: string;
    date_to?: string;
}

interface PesananFilterBarProps {
    currentFilters: Filters;
}

export default function PesananFilterBar({
    currentFilters,
}: PesananFilterBarProps) {
    const [showDateRange, setShowDateRange] = useState(
        Boolean(currentFilters.date_from || currentFilters.date_to),
    );
    const form = useForm({
        search: currentFilters.search || '',
        status: currentFilters.status || '',
        source: currentFilters.source || '',
        date_from: currentFilters.date_from || '',
        date_to: currentFilters.date_to || '',
    });

    const activeFilterCount = useMemo(() => {
        return [
            form.data.search,
            form.data.status,
            form.data.source,
            form.data.date_from,
            form.data.date_to,
        ].filter(Boolean).length;
    }, [
        form.data.search,
        form.data.status,
        form.data.source,
        form.data.date_from,
        form.data.date_to,
    ]);

    const hasDateFilter = Boolean(form.data.date_from || form.data.date_to);
    const isDateRangeInvalid =
        Boolean(form.data.date_from) &&
        Boolean(form.data.date_to) &&
        form.data.date_from > form.data.date_to;

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();

        if (isDateRangeInvalid) {
            return;
        }

        const query = {
            search: form.data.search || undefined,
            status: form.data.status || undefined,
            source: form.data.source || undefined,
            date_from: form.data.date_from || undefined,
            date_to: form.data.date_to || undefined,
        };

        router.get('/admin/pesanan', query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        form.reset();
        setShowDateRange(false);
        router.get('/admin/pesanan');
    };

    return (
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 sm:p-6">
            <form onSubmit={handleFilter} className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                            Filter Pesanan
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {activeFilterCount > 0
                                ? `${activeFilterCount} filter sedang aktif`
                                : 'Belum ada filter aktif'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowDateRange(!showDateRange)}
                            className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                        >
                            {showDateRange
                                ? 'Sembunyikan Tanggal'
                                : 'Atur Tanggal'}
                            {hasDateFilter ? ' (aktif)' : ''}
                        </button>

                        <button
                            type="submit"
                            disabled={isDateRangeInvalid}
                            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(122,143,107,0.85)] transition hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div>
                    <label className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Cari Pesanan
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute top-1/2 left-4 flex size-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-secondary/70 text-primary">
                            <Search className="size-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nomor pesanan, nama, atau no HP..."
                            value={form.data.search}
                            onChange={(e) =>
                                form.setData('search', e.target.value)
                            }
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-14 text-sm transition outline-none placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Status
                        </label>
                        <Select
                            value={form.data.status}
                            onChange={(val) => form.setData('status', val)}
                            placeholder="Semua Status"
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'baru', label: 'Baru' },
                                { value: 'diproses', label: 'Diproses' },
                                { value: 'selesai', label: 'Selesai' },
                                {
                                    value: 'dibatalkan',
                                    label: 'Dibatalkan',
                                },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Sumber
                        </label>
                        <Select
                            value={form.data.source}
                            onChange={(val) => form.setData('source', val)}
                            placeholder="Semua Sumber"
                            options={[
                                { value: '', label: 'Semua Sumber' },
                                { value: 'pembeli', label: 'Pelanggan' },
                                { value: 'admin', label: 'Admin' },
                            ]}
                        />
                    </div>
                </div>

                {/* Date Range */}
                {showDateRange && (
                    <div className="space-y-3 border-t border-slate-100 pt-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Dari Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={form.data.date_from}
                                    onChange={(e) =>
                                        form.setData(
                                            'date_from',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={form.data.date_to}
                                    onChange={(e) =>
                                        form.setData('date_to', e.target.value)
                                    }
                                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                        </div>
                        {isDateRangeInvalid && (
                            <p className="text-sm font-medium text-rose-600">
                                Tanggal akhir tidak boleh lebih kecil dari
                                tanggal awal.
                            </p>
                        )}
                    </div>
                )}

                {(form.data.search ||
                    form.data.status ||
                    form.data.source ||
                    form.data.date_from ||
                    form.data.date_to) && (
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-slate-500">
                            Filter aktif. Gunakan reset untuk kembali ke semua
                            pesanan.
                        </span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-600"
                        >
                            Reset Filter
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
