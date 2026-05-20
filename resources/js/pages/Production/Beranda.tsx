import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
import EmptyState from '@/Components/Produksi/EmptyState';
import PesananCard from '@/Components/Produksi/PesananCard';
import ProduksiLayout from '@/Layouts/ProduksiLayout';

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

export default function Beranda({ user, stats, pesanan_aktif }: Props) {
    const todayDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <ProduksiLayout>
            <Head title="Beranda - Produksi" />

            {/* Header */}
            <div className="relative bg-primary pb-14">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

                <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-white/75">
                                Halo, {user.name} 👋
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-white">
                                Dapur Produksi
                            </h1>
                            <p className="mt-2 text-sm text-white/60">
                                {todayDate}
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-white/20 ring-2 ring-white/30" />
                    </div>
                </div>

                {/* Circle Ornament */}
                <div className="absolute right-12 bottom-0 h-20 w-20 rounded-full border-4 border-white/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 sm:px-8">
                {/* Stats Grid */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                        <p className="text-xs font-medium text-slate-600">
                            Diproses
                        </p>
                        <p className="mt-2 text-2xl font-bold text-primary">
                            {stats.pesanan_diproses}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                        <p className="text-xs font-medium text-slate-600">
                            Selesai
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                            {stats.selesai_hari_ini}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                        <p className="text-xs font-medium text-slate-600">
                            Besok
                        </p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {stats.menunggu_besok}
                        </p>
                    </div>
                </div>

                {/* Pesanan Aktif */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                    <div className="border-b border-slate-100 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900">
                                Perlu Diproses
                            </h2>
                            {pesanan_aktif.length > 0 && (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
                                    {pesanan_aktif.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        {pesanan_aktif.length === 0 ? (
                            <EmptyState
                                icon={ClipboardCheck}
                                title="Semua pesanan sudah diproses 🎉"
                                description="Tidak ada pesanan yang menunggu saat ini"
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {pesanan_aktif.map((item) => (
                                    <PesananCard key={item.id} {...item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProduksiLayout>
    );
}
