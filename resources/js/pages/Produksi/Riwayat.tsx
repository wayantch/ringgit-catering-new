import type { PageProps } from '@inertiajs/core';
import { Head, Link, router } from '@inertiajs/react';
import { History } from 'lucide-react';
import { useState } from 'react';
import PaginationControls from '@/Components/PaginationControls';
import Select from '@/Components/UI/Select';
import ProduksiLayout from '@/Layouts/ProduksiLayout';

interface RiwayatItem {
    id: number;
    order_number: string;
    customer_name: string;
    booking_date: string;
    order_type: 'takeaway' | 'delivery';
    status: 'selesai' | 'dibatalkan';
    items_count: number;
    total_amount: number | null;
    is_price_pending: boolean;
    selesai_at: string | null;
}

const fmt = (n: number | null): string => {
    if (n === null) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);
};

const fmtDate = (v: string): string =>
    new Date(v).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const displayType = (t: string) => (t === 'takeaway' ? 'Pickup' : 'Delivery');

interface Props extends PageProps {
    riwayat: {
        data: RiwayatItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        booking_date?: string;
        status?: string;
    };
}

export default function Riwayat({ riwayat, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [bookingDate, setBookingDate] = useState(filters.booking_date ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'semua');

    const handleFilter = (
        newSearch?: string,
        newDate?: string,
        newStatus?: string,
    ) => {
        router.get(
            '/produksi/riwayat',
            {
                search: newSearch ?? search,
                booking_date: newDate ?? bookingDate,
                status: newStatus ?? statusFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (newPage: number) => {
        router.get(
            `/produksi/riwayat?page=${newPage}&search=${search}&booking_date=${bookingDate}&status=${statusFilter}`,
            {},
            { preserveState: true },
        );
    };

    return (
        <ProduksiLayout>
            <Head title="Riwayat - Produksi" />

            {/* Header */}
            <div className="relative bg-primary pb-14">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

                <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-white/75">
                                Riwayat
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-white">
                                Riwayat Pesanan
                            </h1>
                            <p className="mt-2 text-sm text-white/60">
                                {riwayat.total} pesanan tercatat
                            </p>
                        </div>
                        <History size={32} className="text-white/30" />
                    </div>
                </div>

                <div className="absolute right-12 bottom-0 h-20 w-20 rounded-full border-4 border-white/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto -mt-6 mb-10 max-w-7xl px-4 sm:px-8">
                {/* Filter Bar */}
                <div className="sticky top-0 z-20 -mx-4 space-y-3 rounded-2xl bg-white p-4 px-4 shadow-sm ring-1 ring-slate-100 sm:-mx-8 sm:px-8">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={() => handleFilter(search)}
                            placeholder="Cari nomor pesanan atau nama"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                        />
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => {
                                setBookingDate(e.target.value);
                                handleFilter(search, e.target.value);
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                        />
                        <Select
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                handleFilter(search, bookingDate, val);
                            }}
                            options={[
                                { value: 'semua', label: 'Semua Status' },
                                { value: 'selesai', label: 'Selesai' },
                                { value: 'dibatalkan', label: 'Dibatalkan' },
                            ]}
                        />
                    </div>
                </div>

                {/* Table -> Modern responsive cards */}
                <div className="mt-5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                    {riwayat.data.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <History
                                size={48}
                                className="mx-auto mb-3 text-slate-300"
                            />
                            <p className="font-medium">Belum ada riwayat</p>
                            <p className="text-sm">
                                Pesanan yang selesai akan muncul di sini
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                            {riwayat.data.map((order) => {
                                const isCompleted = order.status === 'selesai';
                                const accentClass = isCompleted
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500';
                                const statusChipClass = isCompleted
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-rose-50 text-rose-600';

                                return (
                                    <div
                                        key={order.id}
                                        className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div
                                            className={`absolute inset-y-0 left-0 w-1.5 ${accentClass}`}
                                        />

                                        <div className="flex h-full flex-col gap-4 p-4 pl-5">
                                            <div className="flex items-start justify-between gap-3 ">
                                                <div className="min-w-0">
                                                    <p className="font-mono text-sm font-semibold text-primary">
                                                        {order.order_number}
                                                    </p>
                                                    <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                                                        {order.customer_name}
                                                    </h3>
                                                </div>

                                                <div className="text-right ">
                                                    <span
                                                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusChipClass}`}
                                                    >
                                                        {isCompleted
                                                            ? 'Selesai'
                                                            : 'Dibatalkan'}
                                                    </span>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {fmtDate(
                                                            order.booking_date,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-2 rounded-2xl bg-slate-50 p-3">
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="text-slate-500">
                                                        Tipe
                                                    </span>
                                                    <span className="font-medium text-slate-900">
                                                        {displayType(
                                                            order.order_type,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="text-slate-500">
                                                        Item
                                                    </span>
                                                    <span className="font-medium text-slate-900">
                                                        {order.items_count} menu
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="text-slate-500">
                                                        Total
                                                    </span>
                                                    <span className="text-base font-bold text-slate-900">
                                                        {order.is_price_pending ? (
                                                            <span className="inline-flex items-center rounded-full bg-accent-2/10 px-2 py-1 text-xs font-medium text-accent-2">
                                                                Harga Menyusul
                                                            </span>
                                                        ) : (
                                                            fmt(
                                                                order.total_amount,
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                                                <Link
                                                    href={`/produksi/pesanan/${order.id}`}
                                                    className="text-sm font-semibold text-primary hover:underline"
                                                >
                                                    Detail
                                                </Link>
                                                <div className="text-right text-xs text-slate-400">
                                                    <span className="block text-[11px] tracking-wide text-slate-300 uppercase">
                                                        Selesai pada
                                                    </span>
                                                    {order.selesai_at
                                                        ? new Date(
                                                              order.selesai_at,
                                                          ).toLocaleString(
                                                              'id-ID',
                                                          )
                                                        : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <PaginationControls
                    currentPage={riwayat.current_page}
                    lastPage={riwayat.last_page}
                    total={riwayat.total}
                    itemLabel="pesanan"
                    onPageChange={handlePageChange}
                />
            </div>
        </ProduksiLayout>
    );
}
