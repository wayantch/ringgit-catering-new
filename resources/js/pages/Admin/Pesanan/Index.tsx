import { Link, router } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/react';
import { Plus, Printer } from 'lucide-react';
import React, { useEffect } from 'react';
import PesananTable from '@/Components/Admin/Pesanan/PesananTable';
import PesananFilterBar from '@/Components/Admin/PesananFilterBar';
import PaginationControls from '@/Components/PaginationControls';
import AdminLayout from '@/Layouts/AdminLayout';

interface Order {
    id: number;
    order_number: string;
    source: 'pembeli' | 'admin';
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    order_status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
    total_amount: string;
}

interface Props extends PageProps {
    orders: {
        data: Order[];
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
                preserveScroll: true,
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
            <div className="p-4">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                            Manajemen Pesanan
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
                            Manajemen Pesanan
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Kelola pesanan yang masuk.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/print"
                            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_10px_24px_-14px_rgba(122,143,107,0.55)] outline-1 outline-slate-200 transition hover:bg-primary-600 hover:text-white"
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
                <div className="mb-6">
                    <PesananFilterBar currentFilters={filters} />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
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
