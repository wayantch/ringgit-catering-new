import { Link, router } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { Plus, Printer } from 'lucide-react';
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

    return (
        <AdminLayout>
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                            Manajemen Pesanan
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
                            Pesanan
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Kelola pesanan yang masuk dengan tampilan yang lebih
                            bersih, modern, dan mudah dipindai.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/admin/print"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <Printer className="size-4" />
                            <span className="text-sm font-medium">
                                Print Rekap
                            </span>
                        </Link>
                        <Link
                            href="/admin/pesanan/create"
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-14px_rgba(122,143,107,0.55)] transition hover:bg-primary-600"
                        >
                            <Plus className="size-4" /> Pesanan Baru
                        </Link>
                    </div>
                </div>

                {/* Filter Bar */}
                <div>
                    <PesananFilterBar currentFilters={filters} />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
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
