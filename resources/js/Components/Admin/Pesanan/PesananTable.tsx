import { Link } from '@inertiajs/react';
import React from 'react';
import PesananSourceBadge from '@/Components/Admin/PesananSourceBadge';
import PesananStatusBadge from '@/Components/Admin/PesananStatusBadge';

interface OrderSummary {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    source: 'admin' | 'pembeli';
    booking_date: string;
    order_type: 'takeaway' | 'delivery';
    status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
    total_amount: number | null;
    cashback_eligible: boolean;
    total_after_cashback: number;
    payment_method: 'full' | 'dp' | null;
    is_price_pending: boolean;
    total_cashback: number;
    ongkir_subsidi_max: number | null;
    payment_status: {
        dp: 'pending' | 'verified' | 'rejected' | null;
        pelunasan: 'pending' | 'verified' | null;
    };
    items_summary: string;
    items_count: number;
}

const fmt = (n: number | null) =>
    n === null
        ? '—'
        : new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
          }).format(n);

export default function PesananTable({ orders }: { orders: OrderSummary[] }) {
    const formatDateShort = (d: string) =>
        new Date(d).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        });

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-black/5 text-left text-sm">
                    <thead>
                        <tr>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                No. Pesanan
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Pelanggan
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Item
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Tgl Booking
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Total
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Jenis
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Pembayaran
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Status
                            </th>
                            <th className="p-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-8 text-center text-primary/50"
                                >
                                    Tidak ada pesanan
                                </td>
                            </tr>
                        ) : (
                            orders.map((o) => (
                                <tr
                                    key={o.id}
                                    className="border-t border-slate-100 hover:bg-primary/5"
                                >
                                    <td className="p-4 align-top">
                                        <div className="font-mono font-semibold text-primary">
                                            {o.order_number}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-semibold">
                                            {o.customer_name}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="max-w-60 truncate">
                                            {o.items_summary}
                                        </div>
                                        <div className="mt-2">
                                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                                                {o.items_count} item
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div>
                                            {formatDateShort(o.booking_date)}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        {o.is_price_pending ? (
                                            <div className="inline-flex items-center gap-2">
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                    Harga Menyusul
                                                </span>
                                            </div>
                                        ) : o.payment_method === 'full' &&
                                          o.cashback_eligible &&
                                          o.total_cashback > 0 ? (
                                            <div className="space-y-1">
                                                <div className="font-semibold text-primary">
                                                    {fmt(
                                                        o.total_after_cashback,
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 line-through">
                                                    {fmt(o.total_amount)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="font-semibold">
                                                {fmt(o.total_amount)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="mt-1 text-xs">
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                                {o.order_type === 'takeaway'
                                                    ? 'Pickup'
                                                    : 'Delivery'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="mt-1 text-xs">
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-semibold ${o.payment_method === 'dp' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
                                            >
                                                {o.payment_method === 'dp'
                                                    ? 'DP'
                                                    : 'Full Payment'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <PesananStatusBadge status={o.status} />
                                    </td>
                                    <td className="p-4 align-top">
                                        <Link
                                            href={`/admin/pesanan/${o.id}`}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                                        >
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
