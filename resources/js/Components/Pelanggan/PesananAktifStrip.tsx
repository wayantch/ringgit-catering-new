import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { orderStatusBadge, orderStatusLabel } from '@/constants/orderStatus';
import type { OrderStatus } from '@/constants/orderStatus';
import pesanan from '@/routes/user/pesanan';

interface PesananAktifStripProps {
    orders: Array<{
        id: string;
        hashid: string;
        order_number: string;
        order_status: OrderStatus;
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

export default function PesananAktifStrip({ orders }: PesananAktifStripProps) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold tracking-tight text-text">
                    Pesanan terbaru
                </h2>
                <Link
                    href={pesanan.index()}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-1.5"
                >
                    Lihat semua
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                {orders.slice(0, 6).map((order) => (
                    <Link
                        key={order.id}
                        href={pesanan.show({ order: order.hashid })}
                        className="min-w-60 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40 sm:min-w-0"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-text">
                                {order.order_number}
                            </p>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${orderStatusBadge(order.order_status)}`}
                            >
                                {orderStatusLabel(order.order_status)}
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            {order.booking_date}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-text">
                            {formatCurrency(order.total_amount)}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
