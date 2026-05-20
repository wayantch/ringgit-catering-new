import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';
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
    const [showDateRange, setShowDateRange] = useState(false);
    const form = useForm({
        search: currentFilters.search || '',
        status: currentFilters.status || '',
        source: currentFilters.source || '',
        date_from: currentFilters.date_from || '',
        date_to: currentFilters.date_to || '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (form.data.search) {
params.append('search', form.data.search);
}

        if (form.data.status) {
params.append('status', form.data.status);
}

        if (form.data.source) {
params.append('source', form.data.source);
}

        if (form.data.date_from) {
params.append('date_from', form.data.date_from);
}

        if (form.data.date_to) {
params.append('date_to', form.data.date_to);
}

        router.get(`/admin/pesanan?${params.toString()}`);
    };

    const handleReset = () => {
        form.reset();
        router.get('/admin/pesanan');
    };

    return (
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
            <form onSubmit={handleFilter} className="space-y-4">
                {/* Search */}
                <div>
                    <input
                        type="text"
                        placeholder="Cari nomor pesanan, nama, atau no HP..."
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                        className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    {/* Status */}
                    <Select
                        value={form.data.status}
                        onChange={(val) => form.setData('status', val)}
                        placeholder="Semua Status"
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'baru', label: 'Baru' },
                            { value: 'diproses', label: 'Diproses' },
                            { value: 'selesai', label: 'Selesai' },
                            { value: 'dibatalkan', label: 'Dibatalkan' },
                        ]}
                    />

                    {/* Source */}
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

                    {/* Date Range Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowDateRange(!showDateRange)}
                        className="rounded-xl bg-secondary px-4 py-2 font-medium text-primary transition-colors hover:bg-secondary/80"
                    >
                        {showDateRange
                            ? 'Sembunyikan Tanggal'
                            : 'Pilih Tanggal'}
                    </button>

                    {/* Filter Button */}
                    <button
                        type="submit"
                        className="rounded-xl bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
                    >
                        Filter
                    </button>
                </div>

                {/* Date Range */}
                {showDateRange && (
                    <div className="grid grid-cols-1 gap-3 border-t border-primary/10 pt-2 md:grid-cols-2">
                        <input
                            type="date"
                            value={form.data.date_from}
                            onChange={(e) =>
                                form.setData('date_from', e.target.value)
                            }
                            className="rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input
                            type="date"
                            value={form.data.date_to}
                            onChange={(e) =>
                                form.setData('date_to', e.target.value)
                            }
                            className="rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                )}

                {/* Active Filters */}
                {(form.data.search ||
                    form.data.status ||
                    form.data.source ||
                    form.data.date_from ||
                    form.data.date_to) && (
                    <div className="flex items-center justify-between border-t border-primary/10 pt-2">
                        <span className="text-sm text-primary/60">
                            Filter aktif
                        </span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
