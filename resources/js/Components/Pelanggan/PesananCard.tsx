import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { orderStatusBadge, orderStatusLabel } from '@/constants/orderStatus';
import type { OrderStatus } from '@/constants/orderStatus';
import pesanan from '@/routes/user/pesanan';

interface PesananCardProps {
    order: {
        id: number;
        order_number: string;
        booking_date: string;
        booking_time: string;
        order_type: string;
        order_status: OrderStatus;
        total_amount: string | number;
        items_count: number;
    };
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

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export default function PesananCard({ order }: PesananCardProps) {
    return (
        <Link
            href={pesanan.show({ order: order.id })}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40"
        >
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-text">
                    {order.order_number}
                </p>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${orderStatusBadge(order.order_status)}`}
                >
                    {orderStatusLabel(order.order_status)}
                </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                <div>
                    <dt className="text-xs text-slate-400">Tanggal</dt>
                    <dd className="text-slate-700">
                        {formatDate(order.booking_date)}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-slate-400">Jam</dt>
                    <dd className="text-slate-700">{order.booking_time}</dd>
                </div>
                <div>
                    <dt className="text-xs text-slate-400">Tipe</dt>
                    <dd className="text-slate-700">
                        {order.order_type === 'takeaway'
                            ? 'Pickup'
                            : 'Delivery'}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-slate-400">Item</dt>
                    <dd className="text-slate-700">{order.items_count} item</dd>
                </div>
            </dl>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <p className="text-base font-semibold text-text">
                    {formatCurrency(order.total_amount)}
                </p>
                <span className="inline-flex items-center gap-0.5 text-sm font-medium text-primary">
                    Detail
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}
