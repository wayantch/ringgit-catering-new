import React from 'react';

function formatTimbangan(type: string) {
    return type === 'timbang_hidup'
        ? 'Timbang Hidup'
        : type === 'olahan'
          ? 'Olahan'
          : 'Eceran';
}

export default function PrintPreview({ printData }: { printData: any[] }) {
    return (
        <div className="space-y-4">
            {printData.map((group) => (
                <section
                    key={group.customer_name}
                    className="rounded-2xl bg-white p-4 shadow-sm"
                >
                    {/* Customer Header */}
                    <div className="mb-3 border-b border-slate-200 pb-3">
                        <h2 className="text-base font-semibold text-text">
                            {group.customer_name}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {group.total_order} pesanan • {group.total_items}{' '}
                            item
                        </p>
                    </div>

                    {/* Menu Items Table */}
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-300">
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Menu
                                </th>
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Keterangan
                                </th>
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Qty
                                </th>
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Unit
                                </th>
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Pesanan
                                </th>
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Tanggal
                                </th>
                                <th className="px-2 py-1.5 text-left font-medium text-slate-700">
                                    Jam
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.items.map((it: any, idx: number) => (
                                <React.Fragment key={idx}>
                                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-2 py-1.5 text-slate-800">
                                            {it.menu_name}{' '}
                                            <span className="text-xs text-slate-400">
                                                (
                                                {formatTimbangan(
                                                    it.menu_category_type,
                                                )}
                                                )
                                            </span>
                                        </td>
                                        <td className="px-2 py-1.5 text-slate-600 italic">
                                            {it.keterangan}
                                        </td>
                                        <td className="px-2 py-1.5 font-medium">
                                            {it.qty}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {it.unit}
                                        </td>
                                        <td className="px-2 py-1.5 font-mono text-xs text-slate-700">
                                            {it.order_number}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {it.booking_date}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {it.jam}
                                        </td>
                                    </tr>
                                    {it.notes && (
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            <td
                                                colSpan={7}
                                                className="px-2 py-1.5 text-xs text-slate-600"
                                            >
                                                <span className="font-medium text-slate-700">
                                                    Catatan:
                                                </span>{' '}
                                                {it.notes}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </div>
    );
}
