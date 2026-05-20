import React from 'react';

type OrderItemTimbang = {
    id: string;
    menu_type: 'timbang_hidup';
    menu_name: string;
    menu_image: string | null;
    tier_kode: 'A' | 'B' | 'C';
    tier_is_half: boolean;
    berat: number;
    kondisi: 'mentah' | 'mateng';
    harga_per_kg: number;
    subtotal: number;
    adat_group: 'batak' | 'nias' | 'tanpa_adat' | 'lainnya' | null;
    adat_parts: string[];
    adat_notes: string | null;
    notes: string | null;
    cashback: number;
};

type OrderItemEceran = {
    id: string;
    menu_type: 'eceran';
    menu_name: string;
    menu_image: string | null;
    sub_type: 'saksang' | 'panggang' | 'sop_tulang' | 'paket_pass';
    variant_label: string;
    harga: number;
    qty: number;
    subtotal: number;
    is_bundle: boolean;
    bundle_desc: string | null;
    free_ongkir_km: number | null;
    notes: string | null;
};

type OrderItem = OrderItemTimbang | OrderItemEceran;

interface Props {
    items: OrderItem[];
}

const ADAT_LABEL: Record<string, string> = {
    batak_lengkap: 'Lengkap',
    batak_kepala: 'Kepala',
    batak_aliang: 'Aliang',
    batak_somba: 'Somba',
    batak_soit: 'Soit',
    batak_ekor: 'Ekor',
    batak_jeroan: 'Jeroan',
    nias_simbi_simbi: 'Simbi-Simbi',
};

const SUB_TYPE_STYLE: Record<string, string> = {
    saksang: 'bg-red-50 text-red-600',
    panggang: 'bg-orange-50 text-orange-600',
    sop_tulang: 'bg-emerald-50 text-emerald-600',
    paket_pass: 'bg-violet-50 text-violet-600',
};

function fmt(n: number | null | undefined) {
    if (n === null || n === undefined) {
return '—';
}

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);
}

function renderAdat(item: OrderItemTimbang) {
    if (!item.adat_group || item.adat_group === 'tanpa_adat') {
        return <span className="text-xs text-slate-400">Tanpa Adat</span>;
    }

    if (item.adat_group === 'lainnya') {
        return <span className="text-xs">{item.adat_notes ?? '—'}</span>;
    }

    if (item.adat_group === 'nias') {
        return <span className="text-xs">Nias — Simbi-Simbi</span>;
    }

    if (item.adat_parts.includes('batak_lengkap')) {
        return <span className="text-xs">Batak — Lengkap</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {item.adat_parts.map((p) => (
                <span
                    key={p}
                    className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px]"
                >
                    {ADAT_LABEL[p] ?? p}
                </span>
            ))}
        </div>
    );
}

export default function OrderItemsTable({ items }: Props) {
    const timbang = items.filter(
        (i) => i.menu_type === 'timbang_hidup',
    ) as OrderItemTimbang[];
    const eceran = items.filter(
        (i) => i.menu_type === 'eceran',
    ) as OrderItemEceran[];

    return (
        <div className="space-y-6">
            {timbang.length > 0 && (
                <section>
                    <h3 className="mb-3 flex items-center gap-3 text-sm font-semibold">
                        <span>🐷</span>
                        <span>Timbang Hidup</span>
                    </h3>
                    <div className="w-full overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        <table className="min-w-full table-auto text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-400">
                                    <th className="p-3">Nama</th>
                                    <th className="p-3">Berat</th>
                                    <th className="p-3">Kondisi</th>
                                    <th className="p-3">Golongan</th>
                                    <th className="p-3">Harga/kg</th>
                                    <th className="p-3">Adat</th>
                                    <th className="p-3">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timbang.map((it) => (
                                    <tr
                                        key={it.id}
                                        className="border-t border-black/5"
                                    >
                                        <td className="p-3 align-top">
                                            <div className="font-semibold">
                                                {it.menu_name}
                                            </div>
                                            {it.notes && (
                                                <div className="mt-1 text-xs text-slate-400 italic">
                                                    {it.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 align-top">
                                            {it.tier_is_half
                                                ? 'Setengah'
                                                : `${it.berat} kg`}
                                        </td>
                                        <td className="p-3 align-top">
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${it.kondisi === 'mateng' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                                            >
                                                {it.kondisi === 'mateng'
                                                    ? 'Mateng'
                                                    : 'Mentah'}
                                            </span>
                                        </td>
                                        <td className="p-3 align-top">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${it.tier_kode === 'A' ? 'bg-blue-50 text-blue-600' : it.tier_kode === 'B' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}
                                            >
                                                Gol. {it.tier_kode}
                                            </span>
                                        </td>
                                        <td className="p-3 align-top font-medium">
                                            {fmt(it.harga_per_kg)}
                                        </td>
                                        <td className="p-3 align-top">
                                            {renderAdat(it)}
                                        </td>
                                        <td className="p-3 align-top font-semibold">
                                            {fmt(it.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {eceran.length > 0 && (
                <section>
                    <h3 className="mb-3 flex items-center gap-3 text-sm font-semibold">
                        <span>📦</span>
                        <span>Eceran & Paket</span>
                    </h3>
                    <div className="w-full overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        <table className="min-w-full table-auto text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-400">
                                    <th className="p-3">Nama</th>
                                    <th className="p-3">Varian</th>
                                    <th className="p-3">Sub-tipe</th>
                                    <th className="p-3">Qty</th>
                                    <th className="p-3">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eceran.map((it) => (
                                    <tr
                                        key={it.id}
                                        className="border-t border-black/5 align-top"
                                    >
                                        <td className="p-3">
                                            <div className="font-semibold">
                                                {it.menu_name}
                                            </div>
                                            {it.is_bundle && it.bundle_desc && (
                                                <div className="mt-1 text-xs text-slate-400 italic">
                                                    {it.bundle_desc}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {it.variant_label}
                                            {it.free_ongkir_km ? (
                                                <div className="mt-1 text-xs">
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                                                        🚚 Free{' '}
                                                        {it.free_ongkir_km}km
                                                    </span>
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${SUB_TYPE_STYLE[it.sub_type]}`}
                                            >
                                                {it.sub_type}
                                            </span>
                                        </td>
                                        <td className="p-3">{it.qty}</td>
                                        <td className="p-3 font-semibold">
                                            {fmt(it.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
