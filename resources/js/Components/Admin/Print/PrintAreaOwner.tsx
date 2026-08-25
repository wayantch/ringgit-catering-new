import React from 'react';

interface PrintRow {
    name: string;
    qty_label: string;
    price: number;
}

interface PrintGroup {
    booking_date: string;
    booking_date_label: string;
    orders: Array<{
        order_id: number;
        customer_name: string;
        payment_method: string;
        payment_date: string;
        jam: string;
        pickup_delivery: string;
        item_count: number;
        grand_total: number;
        items: PrintRow[];
    }>;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
interface PrintAreaOwnerProps {
    groups: PrintGroup[];
}

export default function PrintAreaOwner({ groups }: PrintAreaOwnerProps) {
    if (groups.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 text-[11pt] text-black">
            <header className="border-b border-black pb-3 text-center">
                <p className="text-xs tracking-[0.35em] uppercase">
                    Ringgit Catering
                </p>
                <h2 className="mt-1 text-xl font-bold">Print Owner</h2>
                <p className="mt-1 text-sm">
                    Ringkasan biaya pesanan yang sedang diproses
                </p>
            </header>

            {groups.map((group, index) => {
                return (
                    <section
                        key={group.booking_date}
                        className={index > 0 ? 'page-break-before' : ''}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-[0.18em] uppercase">
                                Tanggal: {group.booking_date_label}
                            </h3>
                            <span className="text-xs">
                                {group.orders.length} pesanan
                            </span>
                        </div>

                        <table className="w-full border-collapse text-[10pt]">
                            <thead>
                                <tr>
                                    <th className="px-2 py-2 text-left">
                                        Menu
                                    </th>
                                    <th className="px-2 py-2 text-left">
                                        Qty/Timbangan
                                    </th>
                                    <th className="px-2 py-2 text-left">
                                        Harga
                                    </th>
                                    <th className="px-2 py-2 text-left">
                                        Metode Pembayaran
                                    </th>
                                    <th className="px-2 py-2 text-left">
                                        Tanggal Transfer
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.orders.map((order) => (
                                    <React.Fragment key={order.order_id}>
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="bg-slate-100 px-2 py-2 font-semibold"
                                            >
                                                {order.customer_name}
                                                <span className="ml-2 font-normal text-slate-600">
                                                    · {order.item_count} item ·{' '}
                                                    {order.payment_method}
                                                </span>
                                            </td>
                                        </tr>
                                        {order.items.map((row, rowIndex) => (
                                            <tr
                                                key={`${order.order_id}-${rowIndex}`}
                                            >
                                                <td className="px-2 py-2 align-top">
                                                    {row.name}
                                                </td>
                                                <td className="px-2 py-2 align-top">
                                                    {row.qty_label}
                                                </td>
                                                <td className="px-2 py-2 align-top">
                                                    {formatCurrency(row.price)}
                                                </td>
                                                <td className="px-2 py-2 align-top capitalize">
                                                    {order.payment_method}
                                                </td>
                                                <td className="px-2 py-2 align-top">
                                                    {order.payment_date}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </section>
                );
            })}
        </div>
    );
}
