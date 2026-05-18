import ProduksiLayout from '@/Layouts/ProduksiLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import KondisiBadge from '@/Components/Produksi/KondisiBadge';
import StatusBadge from '@/Components/Produksi/StatusBadge';
import KonfirmasiModal from '@/Components/Produksi/KonfirmasiModal';
import type { PageProps } from '@inertiajs/core';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    id: number;
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    menu_unit: string;
    qty: number;
    kondisi_produk: string;
    adat_type: string | null;
    notes: string | null;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    booking_date: string;
    pickup_time: string | null;
    delivery_time: string | null;
    delivery_address: string | null;
    order_type: 'takeaway' | 'delivery';
    status: 'baru' | 'diproses' | 'selesai';
    notes: string | null;
    items: OrderItem[];
}

interface Props extends PageProps {
    order: Order;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const displayType = (t: string) => (t === 'takeaway' ? 'Pickup' : 'Delivery');

const fmtDate = (v: string): string =>
    new Date(v).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const fmtTime = (v: string | null): string => {
    if (!v) return '-';
    return new Date(`2000-01-01T${v}`).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PesananDetail({ order }: Props) {
    const { props } = usePage();
    const user = props.auth?.user || { name: 'Produksi' };
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'proses' | 'selesai'>('proses');
    const [isLoading, setIsLoading] = useState(false);

    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleConfirmAction = () => {
        setIsLoading(true);
        const endpoint =
            modalType === 'proses'
                ? `/produksi/pesanan/${order.id}/proses`
                : `/produksi/pesanan/${order.id}/selesai`;

        router.patch(
            endpoint,
            {},
            {
                onSuccess: () => {
                    setShowModal(false);
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    const handleActionClick = (type: 'proses' | 'selesai') => {
        setModalType(type);
        setShowModal(true);
    };

    return (
        <ProduksiLayout>
            <Head title={`Pesanan ${order.order_number} - Produksi`} />

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
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="font-mono text-sm font-medium text-white/75">
                                {order.order_number}
                            </p>
                            <h1 className="mt-1.5 text-2xl leading-snug font-bold sm:text-3xl">
                                Detail Pesanan
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <StatusBadge status={order.status} />
                                <span className="text-xs font-medium text-white/60">
                                    {displayType(order.order_type)}
                                </span>
                            </div>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold text-white ring-2 ring-white/30 backdrop-blur-sm">
                            {initials}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="relative -mt-6">
                <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-8 sm:px-8">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
                        {/* Left: Items */}
                        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
                            <div className="border-b border-slate-200 pb-4">
                                <h2 className="flex items-center justify-between text-base font-bold text-slate-900">
                                    Daftar Item
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                        {order.items.length}
                                    </span>
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="space-y-2 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 transition hover:bg-slate-100/50"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-slate-900">
                                                {item.menu_name}
                                            </h3>
                                            <span className="shrink-0 text-xs font-bold text-slate-500 tabular-nums">
                                                {item.qty} {item.menu_unit}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <KondisiBadge
                                                kondisi={item.kondisi_produk}
                                                adatType={item.adat_type}
                                            />
                                        </div>
                                        {item.notes && (
                                            <p className="text-xs text-slate-500 italic">
                                                💬 {item.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Right: Info & Actions */}
                        <div className="flex flex-col gap-4">
                            {/* Info Card */}
                            <section className="sticky top-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                        <p className="text-xs font-semibold text-slate-500 uppercase">
                                            Pelanggan
                                        </p>
                                    </div>
                                    <p className="mt-1.5 font-semibold text-slate-900">
                                        {order.customer_name}
                                    </p>
                                    {order.customer_phone && (
                                        <a
                                            href={`tel:${order.customer_phone}`}
                                            className="mt-0.5 text-xs text-slate-600 hover:text-primary"
                                        >
                                            {order.customer_phone}
                                        </a>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        <p className="text-xs font-semibold text-slate-500 uppercase">
                                            {displayType(order.order_type)}
                                        </p>
                                    </div>
                                    <p className="mt-1.5 font-semibold text-slate-900">
                                        {fmtDate(order.booking_date)}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {fmtTime(
                                            order.order_type === 'delivery'
                                                ? order.delivery_time
                                                : order.pickup_time,
                                        )}
                                    </p>
                                </div>

                                {order.delivery_address && (
                                    <div className="border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                            <p className="text-xs font-semibold text-slate-500 uppercase">
                                                Alamat
                                            </p>
                                        </div>
                                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                                            {order.delivery_address}
                                        </p>
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="border-t border-slate-100 pt-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">
                                            Catatan
                                        </p>
                                        <p className="mt-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Actions */}
                            <section className="sticky top-80 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
                                {order.status === 'baru' && (
                                    <button
                                        onClick={() =>
                                            handleActionClick('proses')
                                        }
                                        className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary/90 active:scale-95"
                                    >
                                        Mulai Proses
                                    </button>
                                )}

                                {order.status === 'diproses' && (
                                    <button
                                        onClick={() =>
                                            handleActionClick('selesai')
                                        }
                                        className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
                                    >
                                        Tandai Selesai ✓
                                    </button>
                                )}

                                {order.status === 'selesai' && (
                                    <div className="space-y-2 rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200">
                                        <p className="text-sm font-semibold text-emerald-700">
                                            ✓ Pesanan Selesai
                                        </p>
                                        <p className="text-xs text-emerald-600">
                                            Pesanan telah diproses dan selesai
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <KonfirmasiModal
                isOpen={showModal}
                title={
                    modalType === 'proses'
                        ? 'Mulai Proses Pesanan?'
                        : 'Tandai Pesanan Selesai?'
                }
                description={
                    modalType === 'proses'
                        ? 'Pesanan akan dipindahkan ke status diproses'
                        : 'Pesanan akan dipindahkan ke status selesai'
                }
                onConfirm={handleConfirmAction}
                onCancel={() => setShowModal(false)}
                confirmLabel={modalType === 'proses' ? 'Proses' : 'Selesai'}
                confirmClass={
                    modalType === 'proses'
                        ? 'bg-primary hover:bg-primary-600'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                }
                isLoading={isLoading}
            />
        </ProduksiLayout>
    );
}
