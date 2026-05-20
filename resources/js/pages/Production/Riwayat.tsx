import type { PageProps } from '@inertiajs/core';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ProduksiLayout from '@/Layouts/ProduksiLayout';

interface HistoryOrder {
    id: number;
    order_number: string;
    customer_name: string;
    total_items: number;
    completed_at: string;
    status: 'selesai';
}

interface Props extends PageProps {
    historyOrders: HistoryOrder[];
    summary: {
        total_completed: number;
        completed_today: number;
        this_week: number;
    };
    filters: {
        search: string;
        period: 'today' | 'week' | 'all';
    };
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function Riwayat({ historyOrders, summary, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [period, setPeriod] = useState<'today' | 'week' | 'all'>(
        filters.period ?? 'week',
    );

    const handleFilter = (nextPeriod: 'today' | 'week' | 'all') => {
        setPeriod(nextPeriod);
        router.get(
            `/produksi/riwayat?search=${encodeURIComponent(search)}&period=${nextPeriod}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/produksi/riwayat?search=${encodeURIComponent(search)}&period=${period}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const periodLabel = useMemo(() => {
        switch (period) {
            case 'today':
                return 'Hari Ini';
            case 'week':
                return 'Minggu Ini';
            case 'all':
                return 'Semua';
            default:
                return 'Minggu Ini';
        }
    }, [period]);

    return (
        <ProduksiLayout>
            <Head title="Riwayat - Produksi" />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="from-emerald/10 rounded-2xl border border-black/5 bg-linear-to-br to-primary/5 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
                        Riwayat
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Pesanan Selesai
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Lihat pesanan yang telah diselesaikan.
                    </p>
                </div>

                {/* Summary Stats */}
                <section className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-black/5 bg-white p-3 text-center shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Total Selesai
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {summary.total_completed}
                        </p>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-white p-3 text-center shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Hari Ini
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {summary.completed_today}
                        </p>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-white p-3 text-center shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Minggu Ini
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {summary.this_week}
                        </p>
                    </div>
                </section>

                {/* Search and Filter */}
                <div className="space-y-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nomor pesanan..."
                                className="w-full rounded-xl border border-black/10 bg-white py-2.5 pr-3 pl-9 text-sm placeholder-slate-400 focus:border-primary/30 focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                        </div>
                    </form>

                    {/* Period Tabs */}
                    <div className="flex gap-2">
                        {(['today', 'week', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => handleFilter(p)}
                                className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                                    period === p
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'border border-black/10 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {p === 'today'
                                    ? 'Hari Ini'
                                    : p === 'week'
                                      ? 'Minggu'
                                      : 'Semua'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                <section className="space-y-2">
                    {historyOrders.length > 0 ? (
                        historyOrders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-xl border border-black/5 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-sm font-semibold text-slate-900">
                                                {order.order_number}
                                            </p>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                                <CheckCircle2 className="size-3" />
                                                Selesai
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {order.customer_name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {order.total_items} item
                                            {order.total_items !== 1
                                                ? 's'
                                                : ''}{' '}
                                            • {formatDate(order.completed_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                            <CheckCircle2 className="mx-auto size-10 text-slate-300" />
                            <p className="mt-2 text-sm font-medium text-slate-600">
                                Tidak ada pesanan selesai
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Pesanan yang selesai akan tampil di sini
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </ProduksiLayout>
    );
}
