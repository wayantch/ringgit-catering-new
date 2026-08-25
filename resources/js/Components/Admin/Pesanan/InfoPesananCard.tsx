import { Clock, Calendar, MapPin } from 'lucide-react';
import React from 'react';

interface Props {
    order: any;
}

const fmt = (n: number | null) =>
    n === null
        ? '—'
        : new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
          }).format(n);

export default function InfoPesananCard({ order }: Props) {
    const displayTime = (type: string, time: string | null) => {
        if (!time) {
            return '—';
        }

        const t = time.substring(0, 5);

        return type === 'takeaway'
            ? `Ambil di outlet pukul ${t}`
            : `Kirim dari outlet jam ${t}`;
    };

    const formatDate = (d: string | null) => {
        if (!d) {
            return '—';
        }

        return new Date(d).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Info Pesanan</h3>
            <div className="space-y-3 text-sm text-slate-700">
                <div>
                    <div className="text-xs text-slate-400">No. Pesanan</div>
                    <div className="font-mono font-semibold">
                        {order.order_number}
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-400">Sumber</div>
                    <div className="font-semibold">
                        {order.source === 'pembeli' ? 'Pelanggan' : 'Admin'}
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-400">Jenis</div>
                    <div className="font-semibold">
                        {order.order_type === 'takeaway'
                            ? 'Pickup'
                            : 'Delivery'}
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-400">Tgl Booking</div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-4 text-slate-400" />{' '}
                        {formatDate(order.booking_date)}
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-400">Jam</div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-slate-400" />{' '}
                        {displayTime(
                            order.order_type,
                            order.order_type === 'takeaway'
                                ? order.pickup_time
                                : order.delivery_time,
                        )}
                    </div>
                </div>

                {order.order_type === 'delivery' && (
                    <div>
                        <div className="text-xs text-slate-400">Alamat</div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="size-4 text-slate-400" />{' '}
                            {order.delivery_address ?? '—'}
                        </div>
                    </div>
                )}

                {order.ongkir_subsidi_max != null && (
                    <div className="mt-2">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                            🚚 Subsidi ongkir s/d{' '}
                            {fmt(order.ongkir_subsidi_max)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
