import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import BerandaHeader from '@/Components/Pelanggan/BerandaHeader';
import PesananAktifStrip from '@/Components/Pelanggan/PesananAktifStrip';
import PelangganLayout from '@/Layouts/PelangganLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BerandaOrder {
    id: string;
    hashid: string;
    order_number: string;
    order_status: 'baru' | 'diproses' | 'selesai' | 'menunggu_verifikasi';
    total_amount: string | number;
    booking_date: string;
}

interface Props extends PageProps {
    recentOrders: BerandaOrder[];
    user: { name: string };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Index({ recentOrders, user }: Props) {
    return (
        <>
            <Head title="Beranda" />

            <div className="text-text">
                {/* Header full-bleed, konten di dalamnya sudah max-w-7xl */}
                <BerandaHeader user={user} />

                {/* Wrapper konten utama — overlap ke atas header */}
                <div className="relative -mt-6 sm:-mt-8">
                    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-8">
                        {/* ── Pesanan Aktif (jika ada) ── */}
                        {recentOrders.length > 0 && (
                            <PesananAktifStrip orders={recentOrders} />
                        )}

                        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Ringkasan
                                </p>
                                <h2 className="text-lg font-semibold text-text sm:text-xl">
                                    Pesanan dan aktivitas terbaru
                                </h2>
                                <p className="text-sm leading-6 text-slate-500">
                                    Semua info penting ada di beranda, tanpa
                                    menampilkan daftar menu.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
