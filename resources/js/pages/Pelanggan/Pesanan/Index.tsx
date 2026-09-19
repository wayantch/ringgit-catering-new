import type { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import PaginationControls from '@/Components/PaginationControls';
import PageContainer from '@/Components/Pelanggan/PageContainer';
import PageHeader from '@/Components/Pelanggan/PageHeader';
import PesananCard from '@/Components/Pelanggan/PesananCard';
import { PesananListSkeleton } from '@/Components/Pelanggan/Skeletons';
import type { OrderStatus } from '@/constants/orderStatus';
import { useIsRefetching } from '@/hooks/useIsRefetching';
import PelangganLayout from '@/Layouts/PelangganLayout';
import { cn } from '@/lib/utils';

type OrderFilter = 'all' | 'today' | 'yesterday' | 'last_week' | 'date';

interface OrderData {
    id: number;
    order_number: string;
    booking_date: string;
    booking_time: string;
    order_type: string;
    order_status: OrderStatus;
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

const FILTERS: Array<{ value: OrderFilter; label: string }> = [
    { value: 'all', label: 'Semua' },
    { value: 'today', label: 'Hari ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'last_week', label: 'Minggu lalu' },
    { value: 'date', label: 'Tanggal' },
];

function Index({ orders, filters }: Props) {
    const page = usePage();
    const currentPath = page.url.split('?')[0];
    const isRefetching = useIsRefetching();

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

            <PageContainer className="space-y-5 lg:space-y-6">
                <PageHeader
                    title="Pesanan saya"
                    description={`${orders.total} pesanan`}
                />

                <div className="space-y-3">
                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() =>
                                    applyFilter(
                                        filter.value,
                                        filter.value === 'date'
                                            ? (filters.date ??
                                                  new Date()
                                                      .toISOString()
                                                      .slice(0, 10))
                                            : null,
                                    )
                                }
                                className={cn(
                                    'shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition',
                                    filters.filter === filter.value
                                        ? 'border-primary bg-primary font-semibold text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary',
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {filters.filter === 'date' && (
                        <input
                            type="date"
                            value={filters.date ?? ''}
                            onChange={(event) =>
                                applyFilter('date', event.target.value || null)
                            }
                            aria-label="Pilih tanggal pesanan"
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-text transition outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                        />
                    )}
                </div>

                {isRefetching ? (
                    <PesananListSkeleton
                        count={Math.max(orders.data.length, 3)}
                    />
                ) : orders.data.length > 0 ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                            {orders.data.map((order) => (
                                <PesananCard key={order.id} order={order} />
                            ))}
                        </div>

                        <PaginationControls
                            currentPage={orders.current_page}
                            lastPage={orders.last_page}
                            total={orders.total}
                            itemLabel="pesanan"
                            onPageChange={(nextPage) =>
                                router.get(
                                    currentPath,
                                    {
                                        filter: filters.filter,
                                        ...(filters.date
                                            ? { date: filters.date }
                                            : {}),
                                        page: nextPage,
                                    },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                        replace: true,
                                    },
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <p className="text-sm font-medium text-text">
                            Tidak ada pesanan
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Coba filter lain atau lihat semua pesanan.
                        </p>
                    </div>
                )}
            </PageContainer>
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
