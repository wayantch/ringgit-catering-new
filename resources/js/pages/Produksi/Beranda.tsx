import type { PageProps } from '@inertiajs/core';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChefHat,
    ClipboardCheck,
    ClipboardList,
    Clock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '@/Components/Produksi/EmptyState';
import PesananCard from '@/Components/Produksi/PesananCard';
import StatCard from '@/Components/Produksi/StatCard';
import ProduksiLayout from '@/Layouts/ProduksiLayout';
import pesanan from '@/routes/produksi/pesanan';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PesananAktif {
    id: number;
    order_number: string;
    customer_name: string;
    booking_date: string;
    pickup_time: string | null;
    delivery_time: string | null;
    order_type: 'takeaway' | 'delivery';
    items_count: number;
    kondisi_summary: string;
    status: 'baru' | 'diproses';
}

interface Props extends PageProps {
    user: { name: string };
    stats: {
        pesanan_diproses: number;
        selesai_hari_ini: number;
        menunggu_besok: number;
    };
    pesanan_aktif: PesananAktif[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Beranda({ user, stats, pesanan_aktif }: Props) {
    const todayDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const totalAktif = pesanan_aktif.length;
    const diproses = pesanan_aktif.filter(
        (p) => p.status === 'diproses',
    ).length;
    const menunggu = pesanan_aktif.filter((p) => p.status === 'baru').length;
    const totalSelesai = stats.selesai_hari_ini;
    const progressPct =
        totalSelesai + totalAktif > 0
            ? Math.round((totalSelesai / (totalSelesai + totalAktif)) * 100)
            : 0;

    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        if (!autoRefresh) {
            return;
        }

        const id = setInterval(() => {
            router.get(
                pesanan.index.url(),
                {},
                { preserveState: true, preserveScroll: true },
            );
        }, 10000);

        return () => clearInterval(id);
    }, [autoRefresh]);

    return (
        <ProduksiLayout>
            <Head title="Beranda — Produksi" />

            {/* ── Header ── */}
            <header className="relative overflow-hidden bg-primary text-white">
                {/* Blobs dekoratif */}
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

                <div className="relative mx-auto w-full max-w-7xl px-5 pt-10 pb-14 sm:px-8">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-white/75">
                                Halo, {user.name} 👋
                            </p>
                            <h1 className="mt-1.5 text-2xl leading-snug font-bold sm:text-3xl">
                                Dapur Produksi
                            </h1>
                            <p className="mt-2 text-sm text-white/60">
                                {todayDate}
                            </p>
                        </div>

                        {/* Avatar */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold text-white ring-2 ring-white/30 backdrop-blur-sm">
                            {initials}
                        </div>
                    </div>

                    {/* Progress bar hari ini */}
                    <div className="mt-5 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-sm">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <ChefHat className="h-3.5 w-3.5 text-white/70" />
                                <p className="text-xs font-medium text-white/80">
                                    Progress hari ini
                                </p>
                            </div>
                            <p className="text-xs font-bold text-white">
                                {progressPct}%
                            </p>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-white transition-all duration-700"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-white/60">
                            <span>
                                <span className="font-semibold text-white">
                                    {totalSelesai}
                                </span>{' '}
                                selesai
                            </span>
                            <span className="text-white/30">·</span>
                            <span>
                                <span className="font-semibold text-white">
                                    {totalAktif}
                                </span>{' '}
                                aktif
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="relative -mt-6">
                <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-8 sm:px-8">
                    {/* ── Stat Grid 3 kolom ── */}
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard
                            icon={ClipboardList}
                            label="Diproses"
                            value={stats.pesanan_diproses}
                            valueColor="text-primary"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Selesai"
                            value={stats.selesai_hari_ini}
                            valueColor="text-emerald-600"
                        />
                        <StatCard
                            icon={Clock}
                            label="Besok"
                            value={stats.menunggu_besok}
                            valueColor="text-amber-600"
                        />
                    </div>

                    {/* ── Status ringkasan ── */}
                    {totalAktif > 0 && (
                        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                            <div className="flex flex-1 flex-wrap items-center gap-1.5 text-xs">
                                <span className="font-semibold text-text">
                                    {totalAktif} pesanan aktif
                                </span>
                                {diproses > 0 && (
                                    <>
                                        <span className="text-slate-300">
                                            ·
                                        </span>
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">
                                            {diproses} diproses
                                        </span>
                                    </>
                                )}
                                {menunggu > 0 && (
                                    <>
                                        <span className="text-slate-300">
                                            ·
                                        </span>
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600">
                                            {menunggu} menunggu
                                        </span>
                                    </>
                                )}
                            </div>
                            <Link
                                href={pesanan.index()}
                                className="shrink-0 text-xs font-semibold text-primary"
                            >
                                Lihat semua
                            </Link>
                        </div>
                    )}

                    {/* ── Pesanan Aktif ── */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-text">
                                    Perlu Diproses
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {totalAktif > 0
                                        ? `${totalAktif} pesanan menunggu tindakan`
                                        : 'Semua sudah beres!'}
                                </p>
                            </div>
                            {totalAktif > 0 && (
                                <Link
                                    href={pesanan.index()}
                                    className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                                >
                                    Semua
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            )}
                        </div>

                        {pesanan_aktif.length === 0 ? (
                            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                                <EmptyState
                                    icon={ClipboardCheck}
                                    title="Semua pesanan sudah diproses 🎉"
                                    description="Tidak ada pesanan yang menunggu saat ini"
                                />
                            </div>
                        ) : (
                            <div>
                                <div className="mb-2 flex items-center justify-end">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={autoRefresh}
                                            onChange={(e) =>
                                                setAutoRefresh(e.target.checked)
                                            }
                                            className="h-4 w-4"
                                        />
                                        Auto-refresh (10s)
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {pesanan_aktif.map((item) => (
                                        <PesananCard key={item.id} {...item} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </ProduksiLayout>
    );
}
