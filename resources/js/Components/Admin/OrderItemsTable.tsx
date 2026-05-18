import React from 'react';

interface OrderItem {
    id: number;
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    menu_unit: string;
    kondisi_produk: 'mentah' | 'mateng';
    adat_type?: string;
    qty: number;
    unit_price?: number;
    subtotal?: number;
    notes?: string;
}

interface OrderItemsTableProps {
    items: OrderItem[];
    isEditable?: boolean;
}

type ParsedNotes = {
    adatLabel: string | null;
    detailLabel: string | null;
    sisaDaging: string | null;
    catatan: string | null;
    rawNotes: string | null;
};

const ADAT_LABEL: Record<string, string> = {
    batak_lengkap: 'Lengkap',
    batak_kepala: 'Kepala',
    batak_aliang: 'Aliang',
    batak_somba: 'Somba',
    batak_soit: 'Soit',
    batak_ekor: 'Ekor',
    batak_jeroan: 'Jeroan',
    nias_barat: 'Nias Barat',
    nias_kota: 'Nias Kota',
    nias_sekitar: 'Nias Sekitar',
    nias_simbi_simbi: 'Simbi-Simbi',
};

export default function OrderItemsTable({
    items,
    isEditable = false,
}: OrderItemsTableProps) {
    const formatCurrency = (amount?: number) => {
        if (amount === null || amount === undefined) {
            return 'Harga Menyusul';
        }

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const categoryLabel = (type: string) => {
        const labels: Record<string, string> = {
            timbang_hidup: 'Timbang Hidup',
            olahan: 'Olahan',
            eceran: 'Eceran',
        };

        return labels[type] || type;
    };

    const kondisiLabel = (k: string) => {
        return k === 'mentah' ? 'Mentah' : 'Mateng';
    };

    const parseNotes = (item: OrderItem): ParsedNotes => {
        const notes = item.notes?.trim() ?? '';
        const parsed: ParsedNotes = {
            adatLabel: null,
            detailLabel: null,
            sisaDaging: null,
            catatan: null,
            rawNotes: notes === '' ? null : notes,
        };

        if (notes !== '') {
            const adatMain =
                notes.match(/^Adat utama:\s*(.+)$/m)?.[1]?.trim() ?? null;
            const batakDetail =
                notes.match(/^Batak detail:\s*(.+)$/m)?.[1]?.trim() ?? null;
            const niasDetail =
                notes.match(/^Nias detail:\s*(.+)$/m)?.[1]?.trim() ?? null;
            const sisaDaging =
                notes.match(/^Sisa daging:\s*(.+)$/m)?.[1]?.trim() ?? null;
            const catatan =
                notes.match(/^Catatan:\s*(.+)$/m)?.[1]?.trim() ?? null;

            if (adatMain === 'Batak') {
                parsed.adatLabel = 'Adat Batak';

                if (batakDetail) {
                    const parts = batakDetail
                        .split(',')
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .map((part) => ADAT_LABEL[part] ?? part);

                    parsed.detailLabel =
                        parts.length > 0
                            ? `Batak — ${parts.join(', ')}`
                            : 'Adat Batak';
                }
            } else if (adatMain === 'Nias') {
                parsed.adatLabel = 'Adat Nias';

                if (niasDetail) {
                    const parts = niasDetail
                        .split(',')
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .map((part) => ADAT_LABEL[part] ?? part);

                    parsed.detailLabel =
                        parts.length > 0
                            ? `Nias — ${parts.join(', ')}`
                            : 'Adat Nias';
                }
            } else if (adatMain === 'Tanpa adat') {
                parsed.adatLabel = 'Tanpa Adat';
            } else if (adatMain) {
                parsed.adatLabel = adatMain;
            }

            parsed.sisaDaging = sisaDaging;
            parsed.catatan = catatan;

            return parsed;
        }

        if (item.adat_type === 'batak') {
            parsed.adatLabel = 'Adat Batak';
        } else if (item.adat_type === 'nias') {
            parsed.adatLabel = 'Adat Nias';
        } else if (item.adat_type === 'tanpa_adat') {
            parsed.adatLabel = 'Tanpa Adat';
        } else if (item.adat_type) {
            parsed.adatLabel = item.adat_type;
        }

        return parsed;
    };

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const parsedNotes = parseNotes(item);

                return (
                    <article
                        key={item.id}
                        className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate text-base font-semibold text-slate-900">
                                        {item.menu_name}
                                    </h3>
                                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                        {categoryLabel(item.menu_category_type)}
                                    </span>
                                    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-black/5">
                                        {kondisiLabel(item.kondisi_produk)}
                                    </span>
                                    {parsedNotes.adatLabel && (
                                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                                            {parsedNotes.adatLabel}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-black/5">
                                        Qty: {item.qty} {item.menu_unit}
                                    </span>
                                    <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-black/5">
                                        Harga unit:{' '}
                                        {formatCurrency(item.unit_price)}
                                    </span>
                                </div>

                                {(parsedNotes.detailLabel ||
                                    parsedNotes.sisaDaging ||
                                    parsedNotes.catatan ||
                                    parsedNotes.rawNotes) && (
                                    <div className="mt-3 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 ring-1 ring-slate-100">
                                        {parsedNotes.detailLabel && (
                                            <p>
                                                <span className="font-semibold text-slate-700">
                                                    Detail adat:
                                                </span>{' '}
                                                {parsedNotes.detailLabel}
                                            </p>
                                        )}
                                        {parsedNotes.sisaDaging && (
                                            <p>
                                                <span className="font-semibold text-slate-700">
                                                    Sisa daging:
                                                </span>{' '}
                                                {parsedNotes.sisaDaging}
                                            </p>
                                        )}
                                        {parsedNotes.catatan && (
                                            <p>
                                                <span className="font-semibold text-slate-700">
                                                    Catatan:
                                                </span>{' '}
                                                {parsedNotes.catatan}
                                            </p>
                                        )}
                                        {!parsedNotes.detailLabel &&
                                            !parsedNotes.sisaDaging &&
                                            !parsedNotes.catatan &&
                                            parsedNotes.rawNotes && (
                                                <p>{parsedNotes.rawNotes}</p>
                                            )}
                                    </div>
                                )}
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                    Subtotal
                                </p>
                                <p className="mt-1 text-lg font-bold text-primary">
                                    {formatCurrency(item.subtotal)}
                                </p>
                            </div>
                        </div>
                    </article>
                );
            })}

            {items.length === 0 && (
                <div className="py-8 text-center text-primary/50">
                    Tidak ada item pesanan
                </div>
            )}
        </div>
    );
}
