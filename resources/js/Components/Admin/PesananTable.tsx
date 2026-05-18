import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import React from 'react';
import PesananSourceBadge from './PesananSourceBadge';
import PesananStatusBadge from './PesananStatusBadge';

interface Order {
    id: number;
    order_number: string;
    source: 'pembeli' | 'admin';
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    order_status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
    total_amount: string;
}

interface PesananTableProps {
    orders: Order[];
}

export default function PesananTable({ orders }: PesananTableProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-15px_rgba(46,46,46,0.1)] ring-1 ring-black/5">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-black/5 text-left text-sm">
                    <thead>
                        <tr>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                No. Pesanan
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Pelanggan
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Tanggal Booking
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Total
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Sumber
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Status
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="py-8 text-center text-primary/50"
                                >
                                    Tidak ada pesanan
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-slate-100/50 capitalize transition-all duration-200 hover:bg-primary/5"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/pesanan/${order.id}`}
                                            className="hover:text-primary\ font-semibold text-text transition-colors"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-semibold text-text">
                                                {order.customer_name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {order.customer_phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-text">
                                        {formatDate(order.booking_date)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-text">
                                        {formatCurrency(order.total_amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <PesananSourceBadge
                                            source={order.source}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <PesananStatusBadge
                                            status={order.order_status}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/pesanan/${order.id}`}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                                        >
                                            <Eye className="size-4" />
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
