import { Link } from '@inertiajs/react';
import pesanan from '@/routes/produksi/pesanan';
import StatusBadge from './StatusBadge';

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
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
}

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

const statusAccentClass = (
    currentStatus: PesananCardProps['status'],
): string => (currentStatus === 'diproses' ? 'bg-amber-500' : 'bg-slate-300');

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
            className="group relative block cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:shadow-md"
        >
            <div
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-1.5 rounded-l-2xl ${statusAccentClass(status)}`}
            />
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
            </div>
        </Link>
    );
}
