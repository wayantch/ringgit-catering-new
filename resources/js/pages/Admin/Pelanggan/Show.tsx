import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, ShoppingBag } from 'lucide-react';
import React from 'react';
import TierBadge from '@/Components/Admin/Pelanggan/TierBadge';
import PaginationControls from '@/Components/PaginationControls';
import AdminLayout from '@/Layouts/AdminLayout';

interface Order {
    id: string | number;
    order_number: string;
    booking_date: string;
    order_type: 'takeaway' | 'delivery';
    status: string;
    total_amount: number | null;
    is_price_pending: boolean;
    items_count: number;
}

interface Props {
    pelanggan: {
        id: string | number;
        name: string;
        email: string;
        phone: string | null;
        email_verified_at: string | null;
        created_at: string;
        total_orders: number;
        total_spent: number;
        tier: 'bronze' | 'silver' | 'gold' | 'platinum';
        loyalty_completed_orders: number;
        loyalty_min_orders: number | null;
        loyalty_progress_percent: number | null;
        is_eligible: boolean;
        has_redeemed: boolean;
        orders: any; // could be array or paginator object
    };
}

export default function Show({ pelanggan }: Props) {
    const rawOrders = pelanggan.orders;
    const orders: Order[] = Array.isArray(rawOrders)
        ? rawOrders
        : (rawOrders && (rawOrders.data ?? rawOrders.items ?? [])) || [];

    const ordersMeta = (() => {
        if (!rawOrders || Array.isArray(rawOrders)) {
            return null;
        }

        if (rawOrders.meta && rawOrders.meta.current_page) {
            return rawOrders.meta;
        }

        if (rawOrders.current_page) {
            return {
                current_page: rawOrders.current_page,
                last_page: rawOrders.last_page ?? rawOrders.lastPage ?? 1,
                per_page: rawOrders.per_page ?? rawOrders.perPage ?? 10,
                total: rawOrders.total ?? 0,
            };
        }

        if (rawOrders.pagination) {
            return rawOrders.pagination;
        }

        return null;
    })();

    const metaCurrent =
        ordersMeta?.current_page ?? ordersMeta?.currentPage ?? null;
    const metaLast = ordersMeta?.last_page ?? ordersMeta?.lastPage ?? null;
    const metaTotal = ordersMeta?.total ?? 0;

    const formatCurrency = (amount: number | null) => {
        if (!amount) {
            return 'Rp 0';
        }

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/pelanggan"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                            Detail Pelanggan
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {pelanggan.name}
                        </h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    <div>
                        <div className="sticky top-4 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                                {pelanggan.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                        Nama
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {pelanggan.name}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <p className="text-xs text-blue-700">
                                        {pelanggan.email}
                                    </p>
                                </div>

                                {pelanggan.phone && (
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
                                        <Phone className="h-4 w-4 text-slate-600" />
                                        <p className="text-xs text-slate-700">
                                            {pelanggan.phone}
                                        </p>
                                    </div>
                                )}

                                

                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                        Bergabung
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {formatDate(pelanggan.created_at)}
                                    </p>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">
                                                Total Pesanan
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {pelanggan.total_orders}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">
                                                Total Belanja
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(
                                                    pelanggan.total_spent,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                                Loyalti
                                            </p>
                                            <TierBadge
                                                tier={pelanggan.tier}
                                                orderCount={
                                                    pelanggan.loyalty_completed_orders
                                                }
                                            />
                                        </div>

                                        {pelanggan.loyalty_min_orders !==
                                            null && (
                                            <div>
                                                <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>
                                                        {
                                                            pelanggan.loyalty_completed_orders
                                                        }{' '}
                                                        dari{' '}
                                                        {
                                                            pelanggan.loyalty_min_orders
                                                        }{' '}
                                                        pesanan selesai
                                                    </span>
                                                    <span>
                                                        {pelanggan.loyalty_progress_percent ??
                                                            0}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${pelanggan.loyalty_progress_percent ?? 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {pelanggan.is_eligible && (
                                                <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                    Eligible
                                                </span>
                                            )}
                                            {pelanggan.has_redeemed && (
                                                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                                                    Sudah redeem
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        <div className="border-b border-slate-100 p-6">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                Riwayat Pesanan
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            {orders.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <p>Belum ada pesanan</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                No. Pesanan
                                            </th>
                                            <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                Jenis
                                            </th>
                                            <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-3 font-mono font-semibold text-primary">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-6 py-3 text-slate-600">
                                                    {formatDate(
                                                        order.booking_date,
                                                    )}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary">
                                                        {order.order_type ===
                                                        'takeaway'
                                                            ? 'Pickup'
                                                            : 'Delivery'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-semibold">
                                                    {order.is_price_pending ? (
                                                        <span className="inline-flex items-center rounded-full bg-accent-2/10 px-2 py-1 text-xs font-medium text-accent-2">
                                                            Harga Menyusul
                                                        </span>
                                                    ) : (
                                                        formatCurrency(
                                                            order.total_amount,
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            order.status ===
                                                            'selesai'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : order.status ===
                                                                    'diproses'
                                                                  ? 'bg-blue-50 text-blue-700'
                                                                  : order.status ===
                                                                      'dibatalkan'
                                                                    ? 'bg-red-50 text-red-600'
                                                                    : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {order.status ===
                                                        'selesai'
                                                            ? 'Selesai'
                                                            : order.status ===
                                                                'diproses'
                                                              ? 'Diproses'
                                                              : order.status ===
                                                                  'dibatalkan'
                                                                ? 'Dibatalkan'
                                                                : order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <Link
                                                        href={`/admin/pesanan/${order.id}`}
                                                        className="text-xs font-medium text-primary hover:underline"
                                                    >
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {metaCurrent && metaLast && (
                                <PaginationControls
                                    currentPage={metaCurrent}
                                    lastPage={metaLast}
                                    total={metaTotal}
                                    itemLabel="pesanan"
                                    onPageChange={(page) =>
                                        router.get(
                                            `/admin/pelanggan/${pelanggan.id}`,
                                            { page },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
