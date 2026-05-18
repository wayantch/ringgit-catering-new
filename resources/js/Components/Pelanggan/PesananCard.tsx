import { Link } from '@inertiajs/react';
import pesanan from '@/routes/user/pesanan';

interface PesananCardProps {
    order: {
        id: number;
        order_number: string;
        booking_date: string;
        booking_time: string;
        order_type: string;
        order_status:
            | 'baru'
            | 'diproses'
            | 'selesai'
            | 'menunggu_verifikasi'
            | 'dibatalkan';
        total_amount: string | number;
        items_count: number;
    };
}

function statusClass(
    status: PesananCardProps['order']['order_status'],
): string {
    if (status === 'baru') {
        return 'bg-blue-50 text-blue-600';
    }

    if (status === 'diproses' || status === 'menunggu_verifikasi') {
        return 'bg-amber-50 text-amber-600';
    }

    if (status === 'dibatalkan') {
        return 'bg-red-50 text-red-600';
    }

    return 'bg-emerald-50 text-emerald-600';
}

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export default function PesananCard({ order }: PesananCardProps) {
    return (
        <article className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
            {/* Header: nomor order + badge status */}
            <div className="flex items-center justify-between gap-2">
                <p className="truncate font-mono text-xs font-medium tracking-wide text-slate-700">
                    {order.order_number}
                </p>
                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClass(order.order_status)}`}
                >
                    {order.order_status.replace('_', ' ')}
                </span>
            </div>

            {/* Divider */}
            <hr className="my-3 border-black/5" />

            {/* Meta info dalam grid 2 kolom */}
            <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-slate-400">Tanggal</p>
                    <p className="text-[13px] font-medium text-slate-700">
                        {formatDate(order.booking_date)}
                    </p>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-slate-400">Waktu</p>
                    <p className="text-[13px] font-medium text-slate-700">
                        {order.booking_time}
                    </p>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-slate-400">Tipe</p>
                    <p className="text-[13px] font-medium text-slate-700">
                        {order.order_type === 'takeaway'
                            ? 'Pickup'
                            : 'Delivery'}
                    </p>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-slate-400">Item</p>
                    <p className="text-[13px] font-medium text-slate-700">
                        {order.items_count} item
                    </p>
                </div>
            </div>

            {/* Footer: total + tombol */}
            <div className="flex items-center justify-between border-t border-black/5 pt-3">
                <p className="text-base font-semibold text-primary">
                    {formatCurrency(order.total_amount)}
                </p>
                <Link
                    href={pesanan.show({ order: order.id })}
                    className="rounded-2xl border border-primary/10 bg-secondary px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                    Lihat Detail →
                </Link>
            </div>
        </article>
    );
}
