import type { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import KondisiBadge from '@/Components/Produksi/KondisiBadge';
import KonfirmasiModal from '@/Components/Produksi/KonfirmasiModal';
import StatusBadge from '@/Components/Produksi/StatusBadge';
import ProduksiLayout from '@/Layouts/ProduksiLayout';

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
    if (!v) {
        return '-';
    }

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
    const [, setIsLoading] = useState(false);

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

    const scheduleTime =
        order.order_type === 'delivery'
            ? order.delivery_time
            : order.pickup_time;

    return (
        <ProduksiLayout>
            <Head title={`Pesanan ${order.order_number} - Produksi`} />

            <div className="relative overflow-hidden bg-slate-50">
                <header className="relative overflow-hidden bg-primary text-white">
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

                    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:py-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-3xl space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white uppercase">
                                        {order.order_number}
                                    </span>
                                    <StatusBadge status={order.status} />
                                    <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                                        {displayType(order.order_type)}
                                    </span>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        Detail Pesanan
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                        Tampilan ringkas untuk mengecek item,
                                        jadwal, alamat, dan tindakan produksi.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold text-white ring-1 ring-white/20">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-white/65 uppercase">
                                        Pelanggan
                                    </p>
                                    <p className="mt-0.5 font-semibold text-white">
                                        {order.customer_name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                                <p className="text-xs font-semibold tracking-[0.18em] text-white/65 uppercase">
                                    tgl booking
                                </p>
                                <p className="mt-2 text-lg font-semibold text-white">
                                    {fmtDate(order.booking_date)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                                <p className="text-xs font-semibold tracking-[0.18em] text-white/65 uppercase">
                                    Jam{' '}
                                    {order.order_type === 'delivery'
                                        ? 'Kirim'
                                        : 'ambil'}
                                </p>
                                <p className="mt-2 text-lg font-semibold text-white">
                                    {fmtTime(scheduleTime)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                                <p className="text-xs font-semibold tracking-[0.18em] text-white/65 uppercase">
                                    Item
                                </p>
                                <p className="mt-2 text-lg font-semibold text-white">
                                    {order.items.length} item
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:py-8 lg:pt-0">
                    <div className="-mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
                        <section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Daftar Item
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Item yang harus diproses untuk pesanan
                                        ini.
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    {order.items.length}
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                {order.items.map((item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {item.menu_name}
                                                </h3>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <KondisiBadge
                                                        kondisi={
                                                            item.kondisi_produk
                                                        }
                                                        adatType={
                                                            item.adat_type
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-white px-3 py-1.5 text-right ring-1 ring-slate-200">
                                                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                    Qty
                                                </p>
                                                <p className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                                                    {item.qty} {item.menu_unit}
                                                </p>
                                            </div>
                                        </div>

                                        {item.notes && (
                                            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                                {item.notes}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>

                        <aside className="space-y-4 lg:sticky lg:top-4">
                            <section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                        Informasi Pelanggan
                                    </p>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {order.customer_name}
                                        </p>
                                        {order.customer_phone && (
                                            <a
                                                href={`tel:${order.customer_phone}`}
                                                className="mt-1 inline-block text-sm text-slate-600 transition hover:text-primary"
                                            >
                                                {order.customer_phone}
                                            </a>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                Jadwal
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {fmtDate(order.booking_date)}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {fmtTime(scheduleTime)}
                                        </p>
                                    </div>

                                    {order.delivery_address && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                    Alamat
                                                </p>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {order.delivery_address}
                                            </p>
                                        </div>
                                    )}

                                    {order.notes && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
                                                Catatan
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-amber-800">
                                                {order.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                                {order.status === 'baru' && (
                                    <button
                                        onClick={() =>
                                            handleActionClick('proses')
                                        }
                                        className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(122,143,107,0.8)] transition hover:bg-primary-600 active:scale-[0.99]"
                                    >
                                        Mulai Proses
                                    </button>
                                )}

                                {order.status === 'diproses' && (
                                    <button
                                        onClick={() =>
                                            handleActionClick('selesai')
                                        }
                                        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(16,185,129,0.8)] transition hover:bg-emerald-700 active:scale-[0.99]"
                                    >
                                        Tandai Selesai ✓
                                    </button>
                                )}

                                {order.status === 'selesai' && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                        <p className="text-sm font-semibold text-emerald-700">
                                            ✓ Pesanan Selesai
                                        </p>
                                        <p className="mt-1 text-sm text-emerald-600">
                                            Pesanan telah diproses dan selesai.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </aside>
                    </div>
                </div>
            </div>

            <KonfirmasiModal
                isOpen={showModal}
                title={
                    modalType === 'proses'
                        ? 'Mulai Proses Pesanan?'
                        : 'Tandai Selesai?'
                }
                description={
                    modalType === 'proses'
                        ? 'Pesanan akan dipindahkan ke status diproses'
                        : 'Pesanan akan dipindahkan ke status selesai'
                }
                onConfirm={handleConfirmAction}
                onCancel={() => setShowModal(false)}
                confirmLabel={modalType === 'proses' ? 'Proses' : 'Selesai'}
                isDanger={false}
            />
        </ProduksiLayout>
    );
}
