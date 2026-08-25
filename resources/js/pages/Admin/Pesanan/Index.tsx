import type { PageProps } from '@inertiajs/core';
import { Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    CirclePlus,
    Layers3,
    Printer,
    ShoppingBag,
} from 'lucide-react';
import React, { useEffect } from 'react';
import PesananTable from '@/Components/Admin/Pesanan/PesananTable';
import PesananFilterBar from '@/Components/Admin/PesananFilterBar';
import PaginationControls from '@/Components/PaginationControls';
import AdminLayout from '@/Layouts/AdminLayout';

interface Props extends PageProps {
    orders: {
        data: React.ComponentProps<typeof PesananTable>['orders'];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
        source?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ orders, filters }: Props) {
    useEffect(() => {
        const refreshOrders = (): void => {
            router.reload({
                only: ['orders'],
            });
        };

        refreshOrders();

        window.addEventListener('pageshow', refreshOrders);
        window.addEventListener('focus', refreshOrders);

        return () => {
            window.removeEventListener('pageshow', refreshOrders);
            window.removeEventListener('focus', refreshOrders);
        };
    }, []);

    const handlePageChange = (newPage: number) => {
        const queryParams = new URLSearchParams(
            Object.entries(filters).reduce(
                (acc, [k, v]) => {
                    if (v) {
                        acc[k] = String(v);
                    }

                    return acc;
                },
                {} as Record<string, string>,
            ),
        );
        queryParams.set('page', String(newPage));
        router.get(
            `/admin/pesanan?${queryParams.toString()}`,
            {},
            { preserveState: true },
        );
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;
    const visibleOrders = orders.data.length;

    return (
        <AdminLayout>
            <div className="flex w-full flex-col gap-6 p-4">
                {/* Header */}
                <div className="relative overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_30px_30px_-48px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                                <Layers3 className="h-3.5 w-3.5" />
                                Manajemen Pesanan
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-5xl">
                                    Kelola Pesanan
                                </h1>
                                <p className="max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                                    Pantau pesanan masuk, filter data penting,
                                    lalu buka detail tanpa kehilangan konteks.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/admin/pesanan/create"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(122,143,107,0.85)] transition hover:-translate-y-0.5 hover:bg-primary-600"
                                >
                                    <CirclePlus className="h-4 w-4" />
                                    Pesanan Baru
                                </Link>
                                <Link
                                    href="/admin/print"
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print Rekap
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:w-130">
                            <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Total Pesanan
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                    {orders.total}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                                    Tercatat di sistem
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Ditampilkan
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                    {visibleOrders}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                                    Halaman aktif
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Filter Aktif
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                    {activeFilterCount}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                    Pencarian tersaring
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div>
                    <PesananFilterBar currentFilters={filters} />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
                    <PesananTable orders={orders.data} />
                </div>

                {/* Pagination */}
                <PaginationControls
                    currentPage={orders.current_page}
                    lastPage={orders.last_page}
                    total={orders.total}
                    itemLabel="pesanan"
                    onPageChange={handlePageChange}
                />
            </div>
        </AdminLayout>
    );
}
