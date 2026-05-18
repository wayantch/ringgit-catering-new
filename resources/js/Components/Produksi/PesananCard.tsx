import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import pesanan from '@/routes/produksi/pesanan';

interface PesananCardProps {
    id: number;
    order_number: string;
    customer_name: string;
    booking_date: string;
    pickup_time: string | null;
    delivery_time: string | null;
    order_type: 'takeaway' | 'delivery';
    items_count: number;
    kondisi_summary: string;
    status: 'baru' | 'diproses';
}

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

export default function PesananCard({
    id,
    order_number,
    customer_name,
    booking_date,
    pickup_time,
    delivery_time,
    order_type,
    items_count,
    kondisi_summary,
    status,
}: PesananCardProps) {
    const scheduleTime =
        order_type === 'delivery' ? delivery_time : pickup_time;

    return (
        <Link
            href={pesanan.detail({ order: id }) as any}
            className="group block rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
        >
            <div className="space-y-3 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-semibold text-primary">
                        {order_number}
                    </span>
                    <StatusBadge status={status} />
                </div>

                {/* Customer Name */}
                <h3 className="font-semibold text-slate-900">
                    {customer_name}
                </h3>

                {/* Chips Row */}
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-lg bg-secondary px-2 py-1 text-xs font-medium text-primary">
                        {displayType(order_type)}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {fmtDate(booking_date)}
                    </span>
                    {scheduleTime && (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {fmtTime(scheduleTime)}
                        </span>
                    )}
                </div>

                {/* Item Summary */}
                <p className="text-xs text-slate-600">
                    <span className="font-semibold">{items_count} item</span> ·{' '}
                    {kondisi_summary}
                </p>

                {/* CTA */}
                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-all group-hover:bg-primary-600">
                    Lihat & Proses
                    <ChevronRight size={16} />
                </button>
            </div>
        </Link>
    );
}
