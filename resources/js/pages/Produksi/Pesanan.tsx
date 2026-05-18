import ProduksiLayout from '@/Layouts/ProduksiLayout';
import PaginationControls from '@/Components/PaginationControls';
import { Head, router, usePage } from '@inertiajs/react';
import { ClipboardList, ListFilter } from 'lucide-react';
import PesananCard from '@/Components/Produksi/PesananCard';
import EmptyState from '@/Components/Produksi/EmptyState';
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
    const { props } = usePage();
    const user = props.auth?.user || { name: 'Produksi' };

    const tabs = [
        { key: 'semua' as const, label: 'Semua' },
        { key: 'baru' as const, label: 'Baru' },
        { key: 'diproses' as const, label: 'Diproses' },
    ];

    const handleFilterClick = (status: typeof filter_status) => {
        router.get(
            '/produksi/pesanan',
            { status, page: 1 },
            { preserveState: true },
        );
    };

    const handlePageChange = (newPage: number) => {
        router.get(
            '/produksi/pesanan',
            { status: filter_status, page: newPage },
            { preserveState: true },
        );
    };

    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const getTabCount = (key: typeof filter_status) => {
        if (key === 'semua') return pesanan.total;
        return pesanan.data.filter((p) => p.status === key).length;
    };

    return (
        <ProduksiLayout>
            <Head title="Pesanan - Produksi" />

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
                                Lihat Pesanan
                            </p>
                            <h1 className="mt-1.5 text-2xl leading-snug font-bold sm:text-3xl">
                                Pesanan Aktif
                            </h1>
                            <p className="mt-2 text-sm text-white/60">
                                {pesanan.total} pesanan menunggu diproses
                            </p>
                        </div>

                        {/* Avatar */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold text-white ring-2 ring-white/30 backdrop-blur-sm">
                            {initials}
                        </div>
                    </div>

                    {/* Filter chips */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleFilterClick(tab.key)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                    filter_status === tab.key
                                        ? 'bg-white text-primary shadow-lg'
                                        : 'bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30'
                                }`}
                            >
                                {tab.label}
                                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
                                    {getTabCount(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="relative -mt-6">
                <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-8 sm:px-8">
                    {pesanan.data.length === 0 ? (
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                            <EmptyState
                                icon={ListFilter}
                                title="Tidak ada pesanan ditemukan"
                                description={
                                    filter_status === 'semua'
                                        ? 'Semua pesanan sudah ditangani'
                                        : `Tidak ada pesanan dengan status "${filter_status}"`
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {pesanan.data.map((item) => (
                                    <PesananCard key={item.id} {...item} />
                                ))}
                            </div>

                            {/* ── Pagination ── */}
                            <PaginationControls
                                currentPage={pesanan.current_page}
                                lastPage={pesanan.last_page}
                                total={pesanan.total}
                                itemLabel="pesanan"
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </div>
        </ProduksiLayout>
    );
}
