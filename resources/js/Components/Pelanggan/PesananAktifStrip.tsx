import { Link } from '@inertiajs/react';
import pesanan from '@/routes/user/pesanan';

interface PesananAktifStripProps {
    orders: Array<{
        id: string;
        hashid: string;
        order_number: string;
        order_status: 'baru' | 'diproses' | 'selesai' | 'menunggu_verifikasi';
        total_amount: string | number;
        booking_date: string;
    }>;
}

function formatCurrency(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function statusClass(
    status: PesananAktifStripProps['orders'][number]['order_status'],
): string {
    if (status === 'baru') {
        return 'bg-blue-50 text-blue-600';
    }

    if (status === 'diproses' || status === 'menunggu_verifikasi') {
        return 'bg-amber-50 text-amber-600';
    }

    return 'bg-emerald-50 text-emerald-600';
}

export default function PesananAktifStrip({ orders }: PesananAktifStripProps) {
    return (
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                        Pesanan aktif
                    </p>
                    <h2 className="text-base font-semibold tracking-tight text-text">
                        Lanjutkan pesanan Anda
                    </h2>
                </div>
                <Link
                    href={pesanan.index()}
                    className="rounded-full border border-primary/10 bg-secondary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                    Lihat semua
                </Link>
            </div>

            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                {orders.slice(0, 5).map((order) => (
                    <Link
                        key={order.id}
                        href={pesanan.show({ order: order.hashid })}
                        className="min-w-64 rounded-3xl border border-slate-100 bg-linear-to-br from-[#fcfbf7] to-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold tracking-wide text-slate-500">
                                {order.order_number}
                            </p>
                            <span
                                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(order.order_status)}`}
                            >
                                {order.order_status}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            {order.booking_date}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <p className="text-sm font-semibold text-primary">
                                {formatCurrency(order.total_amount)}
                            </p>
                            <span className="text-xs text-slate-400">
                                Tap untuk detail
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
