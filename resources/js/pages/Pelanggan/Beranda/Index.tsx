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
    const activeOrderCount = recentOrders.length;

    return (
        <>
            <Head title="Beranda" />

            <div className="bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.12),transparent_30%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)] text-text">
                <BerandaHeader user={user} />

                <div className="relative -mt-8 sm:-mt-10">
                    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-8">
                        {recentOrders.length > 0 && (
                            <PesananAktifStrip orders={recentOrders} />
                        )}

                        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur">
                            <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                            Ringkasan
                                        </p>
                                        <h2 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
                                            Pesanan dan aktivitas terbaru
                                        </h2>
                                        <p className="text-sm leading-6 text-slate-500">
                                            Semua info penting ada di beranda,
                                            tanpa menampilkan daftar menu.
                                        </p>
                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/10">
                                        {activeOrderCount} pesanan aktif
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-5 sm:px-6">
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <div className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Pesanan aktif
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-text">
                                            {activeOrderCount}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Akses cepat
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-600">
                                            Menu, pesanan, dan profil tersedia
                                            di navigasi bawah.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100 sm:col-span-2 xl:col-span-1">
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Status
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-600">
                                            Pantau pesanan terbaru dan lanjutkan
                                            checkout dengan cepat.
                                        </p>
                                    </div>
                                </div>
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
