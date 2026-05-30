import type { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { UtensilsCrossed } from 'lucide-react';
import type { ReactNode } from 'react';

import PaginationControls from '@/Components/PaginationControls';
import PesananCard from '@/Components/Pelanggan/PesananCard';
import PelangganLayout from '@/Layouts/PelangganLayout';

type OrderFilter = 'all' | 'today' | 'yesterday' | 'last_week' | 'date';

interface OrderData {
    id: number;
    order_number: string;
    booking_date: string;
    booking_time: string;
    order_type: string;
    order_status: 'baru' | 'diproses' | 'selesai' | 'menunggu_verifikasi';
    total_amount: string | number;
    items_count: number;
}

interface Props extends PageProps {
    orders: {
        data: OrderData[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        filter: OrderFilter;
        date: string | null;
    };
}

function formatDateLabel(dateString: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${dateString}T00:00:00`));
}

function getFilterLabel(filter: OrderFilter, date: string | null): string {
    if (filter === 'today') {
        return 'Hari ini';
    }

    if (filter === 'yesterday') {
        return 'Kemarin';
    }

    if (filter === 'last_week') {
        return 'Minggu lalu';
    }

    if (filter === 'date' && date) {
        return formatDateLabel(date);
    }

    return 'Semua pesanan';
}

function PesananPageHeader({ totalItems }: { totalItems: number }) {
    return (
        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f7465_0%,#88a07d_52%,#dfd3be_100%)] text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%), radial-gradient(circle at 60% 80%, rgba(0,0,0,0.08), transparent 50%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-10"
                style={{ background: 'rgba(255,255,255,0.5)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full opacity-10"
                style={{ background: 'rgba(255,255,255,0.5)' }}
            />

            <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14">
                <div className="flex items-center justify-between gap-6">
                    <div className="max-w-2xl space-y-4">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/85 uppercase backdrop-blur-sm">
                            Ringgit Catering
                        </span>
                        <p className="text-sm font-medium text-white/75 sm:text-base">
                            {totalItems} pesanan
                        </p>
                        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                            Pesanan saya.
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-base">
                            Pantau status pesananmu dengan tampilan yang lebih
                            ringkas.
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Semua pesanan
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Filter tanggal
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Status terbaru
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16">
                            <UtensilsCrossed className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function Index({ orders, filters }: Props) {
    const page = usePage();
    const currentPath = page.url.split('?')[0];

    const applyFilter = (
        filter: OrderFilter,
        date: string | null = null,
    ): void => {
        router.get(
            currentPath,
            {
                filter,
                ...(date ? { date } : {}),
                page: 1,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Pesanan" />
            <PesananPageHeader totalItems={orders.total} />
            <div className="bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_28%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)] text-text">
                <div className="relative -mt-6 sm:-mt-8">
                    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-10 sm:px-8">
                        <section className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm sm:p-5">
                            <div className="no-scrollbar flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
                                <button
                                    type="button"
                                    onClick={() => applyFilter('all')}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${filters.filter === 'all' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-black/5 bg-[#fbfaf6] text-slate-600 hover:border-primary/20 hover:text-primary'}`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilter('today')}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${filters.filter === 'today' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-black/5 bg-[#fbfaf6] text-slate-600 hover:border-primary/20 hover:text-primary'}`}
                                >
                                    Hari ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilter('yesterday')}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${filters.filter === 'yesterday' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-black/5 bg-[#fbfaf6] text-slate-600 hover:border-primary/20 hover:text-primary'}`}
                                >
                                    Kemarin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilter('last_week')}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${filters.filter === 'last_week' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-black/5 bg-[#fbfaf6] text-slate-600 hover:border-primary/20 hover:text-primary'}`}
                                >
                                    Minggu lalu
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        applyFilter(
                                            'date',
                                            filters.date ??
                                                new Date()
                                                    .toISOString()
                                                    .slice(0, 10),
                                        )
                                    }
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${filters.filter === 'date' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-black/5 bg-[#fbfaf6] text-slate-600 hover:border-primary/20 hover:text-primary'}`}
                                >
                                    Tanggal
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-[#fbfaf6] px-4 py-3 ring-1 ring-black/5">
                                <div>
                                    <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                                        Filter aktif
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-text">
                                        {getFilterLabel(
                                            filters.filter,
                                            filters.date,
                                        )}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                                        Total
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-primary">
                                        {orders.total} pesanan
                                    </p>
                                </div>
                            </div>

                            {filters.filter === 'date' && (
                                <div className="mt-3 flex items-center gap-3">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Pilih tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date ?? ''}
                                        onChange={(event) =>
                                            applyFilter(
                                                'date',
                                                event.target.value || null,
                                            )
                                        }
                                        className="rounded-2xl border border-black/5 bg-[#fbfaf6] px-3.5 py-2.5 text-sm text-text transition outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                                    />
                                </div>
                            )}
                        </section>

                        {orders.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {orders.data.map((order) => (
                                        <PesananCard
                                            key={order.id}
                                            order={order}
                                        />
                                    ))}
                                </div>

                                <PaginationControls
                                    currentPage={orders.current_page}
                                    lastPage={orders.last_page}
                                    total={orders.total}
                                    itemLabel="pesanan"
                                    onPageChange={(page) =>
                                        router.get(
                                            currentPath,
                                            {
                                                filter: filters.filter,
                                                ...(filters.date
                                                    ? { date: filters.date }
                                                    : {}),
                                                page,
                                            },
                                            {
                                                preserveScroll: true,
                                                preserveState: true,
                                                replace: true,
                                            },
                                        )
                                    }
                                />
                            </>
                        ) : (
                            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 text-center shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
                                <p className="text-sm font-semibold text-text">
                                    Tidak ada pesanan untuk filter ini.
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Coba pilih filter tanggal lain atau lihat
                                    semua pesanan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
