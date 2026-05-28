import React from 'react';

interface PrintRow {
    customer_name: string;
    name: string;
    qty_label: string;
    price: number;
    payment_method: string;
    payment_date: string;
}

interface PrintGroup {
    booking_date: string;
    booking_date_label: string;
    rows: PrintRow[];
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
                                {group.rows.length} baris
                            </span>
                        </div>

                        <table className="w-full border-collapse text-[10pt]">
                            <thead>
                                <tr>
                                    <th className="px-2 py-2 text-left">
                                        Pelanggan
                                    </th>
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
                                {group.rows.map((row, rowIndex) => (
                                    <tr
                                        key={`${group.booking_date}-${rowIndex}`}
                                    >
                                        <td className="px-2 py-2 align-top font-semibold">
                                            {row.customer_name}
                                        </td>
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
                                            {row.payment_method}
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                            {row.payment_date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                );
            })}
        </div>
    );
}
