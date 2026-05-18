import ProduksiLayout from '@/Layouts/ProduksiLayout';
import { Head, router } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import PesananCard from '@/Components/Produksi/PesananCard';
import type { PageProps } from '@inertiajs/core';

interface PesananItem {
    id: number;
    order_number: string;
    customer_name: string;
    booking_date: string;
    pickup_time: string | null;
    delivery_time: string | null;
    order_type: 'takeaway' | 'delivery';
    status: 'baru' | 'diproses';
    items_count: number;
    kondisi_summary: string;
}

interface Props extends PageProps {
    pesanan: {
        data: PesananItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filter_status: 'semua' | 'baru' | 'diproses';
}
export default function Pesanan({ pesanan, filter_status }: Props) {
    const tabs = [
        { key: 'semua' as const, label: 'Semua' },
        { key: 'baru' as const, label: 'Baru' },
        { key: 'diproses' as const, label: 'Diproses' },
    ];

    const handleFilterClick = (status: typeof filter_status) => {
        router.get('/produksi/pesanan', { status }, { preserveState: true });
    };

    return (
        <ProduksiLayout>
            <Head title="Pesanan - Produksi" />

            {/* Header */}
            <div className="relative bg-primary pb-14">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

                <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-white/75">
                                Pesanan Aktif
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-white">
                                Pesanan Aktif
                            </h1>
                            <p className="mt-2 text-sm text-white/60">
                                {pesanan.total} pesanan menunggu
                            </p>
                        </div>
                        <ClipboardList size={32} className="text-white/30" />
                    </div>
                </div>

                <div className="absolute right-12 bottom-0 h-20 w-20 rounded-full border-4 border-white/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 sm:px-8">
                {/* Filter Tabs */}
                <div className="sticky top-0 z-20 -mx-4 rounded-t-2xl bg-white p-4 px-4 shadow-sm ring-1 ring-black/5 sm:-mx-8 sm:px-8">
                    <div className="flex gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleFilterClick(tab.key)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                    filter_status === tab.key
                                        ? 'bg-primary text-white'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pesanan Grid */}
                <div className="mt-0 pb-6">
                    {pesanan.data.length === 0 ? (
                        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
                            <p className="text-sm text-slate-500">
                                Tidak ada pesanan ditemukan
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pesanan.data.map((item) => (
                                <PesananCard key={item.id} {...item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProduksiLayout>
    );
}
