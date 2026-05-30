import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, ShoppingBag, Sparkles } from 'lucide-react';
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
        address: string | null;
        status: 'aktif' | 'tidak_aktif';
        email_verified_at: string | null;
        last_login_at: string | null;
        created_at: string;
        total_orders: number;
        total_spent: number;
        tier: 'bronze' | 'silver' | 'gold' | 'platinum';
        loyalty_completed_orders: number;
        loyalty_min_orders: number | null;
        loyalty_progress_percent: number | null;
        is_eligible: boolean;
        has_redeemed: boolean;
        orders: any;
    };
}

function formatCurrency(amount: number | null): string {
    if (!amount) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

function getOrderStatusClass(status: string): string {
    if (status === 'selesai') {
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    }

    if (status === 'diproses') {
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    }

    if (status === 'dibatalkan') {
        return 'bg-red-50 text-red-600 ring-1 ring-red-200';
    }

    return 'bg-blue-50 text-blue-600 ring-1 ring-blue-200';
}

function getOrderStatusLabel(status: string): string {
    if (status === 'selesai') {
        return 'Selesai';
    }

    if (status === 'diproses') {
        return 'Diproses';
    }

    if (status === 'dibatalkan') {
        return 'Dibatalkan';
    }

    return status;
}

function getOrderTypeLabel(type: Order['order_type']): string {
    return type === 'takeaway' ? 'Pickup' : 'Delivery';
}

function getLoginStatusClass(status: 'aktif' | 'tidak_aktif'): string {
    return status === 'aktif'
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function getLoginStatusLabel(status: 'aktif' | 'tidak_aktif'): string {
    return status === 'aktif' ? 'Aktif' : 'Tidak Aktif';
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

    return (
        <AdminLayout>
            <div className="space-y-6 p-4 lg:p-6">
                <header className="relative overflow-hidden rounded-[32px] border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase ring-1 ring-primary/10">
                                <Sparkles className="h-3.5 w-3.5" />
                                Detail Pelanggan
                            </span>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                                {pelanggan.name}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Ringkasan identitas, loyalti, dan riwayat
                                pesanan pelanggan dalam satu tampilan yang lebih
                                bersih.
                            </p>
                        </div>

                        <Link
                            href="/admin/pelanggan"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                    </div>
                </header>

                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary ring-1 ring-primary/10">
                                {pelanggan.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                                    Informasi
                                </p>
                                <h2 className="truncate text-lg font-semibold text-slate-900">
                                    {pelanggan.name}
                                </h2>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${getLoginStatusClass(
                                        pelanggan.status,
                                    )}`}
                                >
                                    {getLoginStatusLabel(pelanggan.status)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                            <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Email
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-900">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span className="break-all">
                                        {pelanggan.email}
                                    </span>
                                </div>
                            </div>

                            {pelanggan.phone && (
                                <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Nomor HP
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-900">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span>{pelanggan.phone}</span>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    TGL Bergabung
                                </p>
                                <p className="mt-2 text-sm font-medium text-slate-900">
                                    {formatDate(pelanggan.created_at)}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Loyalti
                                    </p>
                                    <div className="mt-2">
                                        <TierBadge
                                            tier={pelanggan.tier}
                                            orderCount={
                                                pelanggan.loyalty_completed_orders
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Status Loyalti
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {pelanggan.is_eligible && (
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                                Eligible
                                            </span>
                                        )}
                                        {(pelanggan.has_redeemed && (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                Sudah redeem
                                            </span>
                                        )) || (
                                            <p className="text-sm font-medium text-slate-500">
                                                Belum redeem
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Alamat
                                </p>
                                <p className="mt-2 text-sm leading-6 font-medium text-slate-900">
                                    {pelanggan.address?.trim() ||
                                        'Alamat belum diisi'}
                                </p>
                            </div>

                            {pelanggan.loyalty_min_orders !== null && (
                                <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                                    <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
                                        <span>
                                            {pelanggan.loyalty_completed_orders}{' '}
                                            dari {pelanggan.loyalty_min_orders}{' '}
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
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                                    Aktivitas
                                </p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                    Riwayat Pesanan
                                </h2>
                            </div>
                            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {metaTotal} pesanan
                            </div>
                        </div>

                        <div className="p-5">
                            {orders.length === 0 ? (
                                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-slate-500">
                                    <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-3 text-sm font-semibold text-slate-900">
                                        Belum ada pesanan
                                    </p>
                                    <p className="mt-1 text-xs leading-6 text-slate-500">
                                        Pesanan pelanggan akan tampil di sini
                                        setelah ada transaksi.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-[24px] ring-1 ring-slate-100">
                                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                        <thead className="bg-linear-to-r from-slate-50 to-white">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    No. Pesanan
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    tgl booking
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    Jenis
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    Item
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="transition-colors hover:bg-slate-50/70"
                                                >
                                                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatDate(
                                                            order.booking_date,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/10">
                                                            {getOrderTypeLabel(
                                                                order.order_type,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {order.items_count} item
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-900">
                                                        {order.is_price_pending
                                                            ? 'Harga Menyusul'
                                                            : formatCurrency(
                                                                  order.total_amount,
                                                              )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getOrderStatusClass(order.status)}`}
                                                        >
                                                            {getOrderStatusLabel(
                                                                order.status,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={`/admin/pesanan/${order.id}`}
                                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                                        >
                                                            Lihat
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {metaCurrent && metaLast && (
                                <div className="mt-5">
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
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
