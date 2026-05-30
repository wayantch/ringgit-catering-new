import { Link, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    Users,
    TrendingUp,
    AlertCircle,
    DollarSign,
    Gift,
    ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import TierBadge from '@/Components/Admin/Pelanggan/TierBadge';
import PaginationControls from '@/Components/PaginationControls';
import AdminLayout from '@/Layouts/AdminLayout';

interface Pelanggan {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: 'aktif' | 'tidak_aktif';
    email_verified_at: string | null;
    last_login_at: string | null;
    orders_count: number;
    orders_sum_total_amount: number | null;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    is_eligible: boolean;
    has_redeemed: boolean;
    created_at: string;
}

interface Stats {
    total_pelanggan: number;
    aktif_bulan_ini: number;
    tidak_aktif: number;
    total_revenue: number;
}

interface Props {
    pelanggan: {
        data: Pelanggan[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    stats: Stats;
    loyaltyStats: {
        program_active: boolean;
        program_description: string | null;
        min_orders: number;
        period_end: string | null;
        total_eligible: number;
        total_redeemed: number;
        total_discount_given: number;
    };
}

export default function Index({
    pelanggan,
    filters,
    stats,
    loyaltyStats,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearchInput(value);
        router.get(
            '/admin/pelanggan',
            { search: value, status: filters.status },
            { preserveState: true },
        );
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            '/admin/pelanggan',
            { search: searchInput, status },
            { preserveState: true },
        );
    };

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

    return (
        <AdminLayout>
            <div className="space-y-6 p-4 lg:p-6">
                <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl space-y-3">
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
                                Manajemen Pelanggan
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
                                Pelanggan
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Kelola data pelanggan, pantau loyalti, dan lihat
                                aktivitas mereka dalam tampilan yang lebih
                                bersih.
                            </p>
                        </div>

                        <Link
                            href="/admin/pelanggan/create"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(122,143,107,0.9)] transition hover:-translate-y-0.5 hover:bg-primary-600"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pelanggan
                        </Link>
                    </div>
                </section>

                {loyaltyStats.program_active && (
                    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                                    <Gift className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                                        Program Loyalti Aktif
                                    </p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                        {loyaltyStats.program_description ||
                                            'Program Loyalti Ringgit Catering'}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Berlaku sampai{' '}
                                        {loyaltyStats.period_end ||
                                            'tidak dibatasi'}{' '}
                                        · Minimum {loyaltyStats.min_orders}{' '}
                                        pesanan.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    {
                                        label: 'Eligible',
                                        value: loyaltyStats.total_eligible,
                                        color: 'bg-primary/10 text-primary',
                                    },
                                    {
                                        label: 'Redeem',
                                        value: loyaltyStats.total_redeemed,
                                        color: 'bg-emerald-50 text-emerald-600',
                                    },
                                    {
                                        label: 'Diskon',
                                        value: formatCurrency(
                                            loyaltyStats.total_discount_given,
                                        ),
                                        color: 'bg-slate-100 text-slate-600',
                                        amount: true,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className={`rounded-2xl px-4 py-3 shadow-sm ring-1 ring-black/5 ${item.color}`}
                                    >
                                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-70">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm font-bold">
                                            {item.amount
                                                ? item.value
                                                : item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Total Pelanggan',
                            value: stats.total_pelanggan,
                            icon: Users,
                            color: 'bg-blue-50 text-blue-600',
                        },
                        {
                            label: 'Aktif',
                            value: stats.aktif_bulan_ini,
                            icon: TrendingUp,
                            color: 'bg-emerald-50 text-emerald-600',
                        },
                        {
                            label: 'Tidak Aktif',
                            value: stats.tidak_aktif,
                            icon: AlertCircle,
                            color: 'bg-amber-50 text-amber-600',
                        },
                        {
                            label: 'Total Revenue',
                            value: formatCurrency(stats.total_revenue),
                            icon: DollarSign,
                            color: 'bg-primary/10 text-primary',
                            isAmount: true,
                        },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={idx}
                                className="group rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                            {stat.isAmount
                                                ? stat.value
                                                : stat.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.color} ring-1 ring-black/5 transition-transform group-hover:scale-105`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex-1">
                        <label className="mb-2 block text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                            Cari Pelanggan
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={searchInput}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['semua', 'aktif', 'tidak_aktif'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    (filters.status || 'semua') === status
                                        ? 'bg-primary text-white shadow-[0_10px_24px_-16px_rgba(122,143,107,0.7)]'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {status === 'semua'
                                    ? 'Semua'
                                    : status === 'aktif'
                                      ? 'Aktif'
                                      : 'Tidak Aktif'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Responsive List: cards on small screens, table on lg+ */}
                <div className="space-y-4">
                    {/* Card list for small screens */}
                    <div className="space-y-3 lg:hidden">
                        {pelanggan.data.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 p-6 text-center text-slate-500 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                                Tidak ada pelanggan ditemukan
                            </div>
                        ) : (
                            pelanggan.data.map((p) => (
                                <div
                                    key={p.id}
                                    className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/10">
                                                {p.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {p.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {p.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {p.orders_count} pesanan
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatCurrency(
                                                    p.orders_sum_total_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${p.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}
                                            >
                                                {p.status === 'aktif'
                                                    ? 'Aktif'
                                                    : 'Tidak Aktif'}
                                            </span>

                                            <TierBadge
                                                tier={p.tier}
                                                orderCount={p.orders_count}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/pelanggan/${p.id}`}
                                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                            >
                                                Detail
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Table for large screens */}
                    <div className="hidden overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 lg:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                <thead>
                                    <tr className="bg-linear-to-r from-slate-50 to-white">
                                        <th className="px-6 py-4 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Pelanggan
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Pesanan
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Total Belanja
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Loyalti
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pelanggan.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-slate-500"
                                            >
                                                Tidak ada pelanggan ditemukan
                                            </td>
                                        </tr>
                                    ) : (
                                        pelanggan.data.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="transition-colors hover:bg-slate-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/10">
                                                            {p.name
                                                                .split(' ')
                                                                .map(
                                                                    (n) => n[0],
                                                                )
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {p.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {p.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {p.orders_count} pesanan
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {formatCurrency(
                                                        p.orders_sum_total_amount,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <span
                                                        className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${p.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}
                                                    >
                                                        {p.status === 'aktif'
                                                            ? 'Aktif'
                                                            : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <TierBadge
                                                            tier={p.tier}
                                                            orderCount={
                                                                p.orders_count
                                                            }
                                                        />
                                                        {loyaltyStats.program_active && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                                                    <div
                                                                        className="h-full rounded-full bg-primary transition-all"
                                                                        style={{
                                                                            width: `${Math.min(100, (p.orders_count / loyaltyStats.min_orders) * 100)}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {
                                                                        p.orders_count
                                                                    }
                                                                    /
                                                                    {
                                                                        loyaltyStats.min_orders
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {p.has_redeemed && (
                                                            <span className="inline-flex items-center gap-1 self-start rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                                <ShieldCheck className="h-3 w-3" />
                                                                Sudah redeem
                                                            </span>
                                                        )}
                                                        {p.is_eligible &&
                                                            !p.has_redeemed && (
                                                                <span className="inline-flex items-center self-start rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
                                                                    ★ Eligible
                                                                    diskon
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/pelanggan/${p.id}`}
                                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <PaginationControls
                    currentPage={pelanggan.current_page}
                    lastPage={pelanggan.last_page}
                    total={pelanggan.total}
                    itemLabel="pelanggan"
                    onPageChange={(page) =>
                        router.get(
                            '/admin/pelanggan',
                            {
                                search: searchInput,
                                status: filters.status,
                                page,
                            },
                            { preserveState: true },
                        )
                    }
                />
            </div>
        </AdminLayout>
    );
}
