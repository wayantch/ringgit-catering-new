import React from 'react';
import { Package, Weight, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    id: number;
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    menu_sub_type?:
        | 'babi_adat'
        | 'paket_pass'
        | 'paket_nasi_box'
        | 'saksang'
        | 'panggang'
        | 'sop_tulang'
        | null;
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
    totalAmount?: number;
}

type ParsedNotes = {
    adatLabel: string | null;
    detailLabel: string | null;
    sisaDaging: string | null;
    catatan: string | null;
    rawNotes: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

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

const CATEGORY_STYLE: Record<string, { label: string; cls: string }> = {
    timbang_hidup: {
        label: 'Timbang Hidup',
        cls: 'bg-amber-50 text-amber-700',
    },
    olahan: { label: 'Olahan', cls: 'bg-emerald-50 text-emerald-700' },
    eceran: { label: 'Eceran', cls: 'bg-blue-50 text-blue-700' },
};

const SUB_TYPE_STYLE: Record<string, { label: string; cls: string }> = {
    babi_adat: { label: 'Babi Adat', cls: 'bg-rose-50 text-rose-700' },
    paket_pass: { label: 'Paket PASS', cls: 'bg-violet-50 text-violet-700' },
    paket_nasi_box: { label: 'Nasi Box', cls: 'bg-amber-50 text-amber-700' },
    saksang: { label: 'Saksang', cls: 'bg-red-50 text-red-600' },
    panggang: { label: 'Panggang', cls: 'bg-orange-50 text-orange-600' },
    sop_tulang: { label: 'Sop Tulang', cls: 'bg-emerald-50 text-emerald-600' },
};

const KONDISI_STYLE: Record<string, { label: string; cls: string }> = {
    mentah: { label: 'Mentah', cls: 'bg-amber-50 text-amber-700' },
    mateng: { label: 'Mateng', cls: 'bg-emerald-50 text-emerald-700' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number) => {
    if (n === null || n === undefined) return null;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);
};

function parseNotes(item: OrderItem): ParsedNotes {
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
        const catatan = notes.match(/^Catatan:\s*(.+)$/m)?.[1]?.trim() ?? null;

        if (adatMain === 'Batak') {
            parsed.adatLabel = 'Adat Batak';
            if (batakDetail) {
                const parts = batakDetail
                    .split(',')
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p) => ADAT_LABEL[p] ?? p);
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
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p) => ADAT_LABEL[p] ?? p);
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

    if (item.adat_type === 'batak') parsed.adatLabel = 'Adat Batak';
    else if (item.adat_type === 'nias') parsed.adatLabel = 'Adat Nias';
    else if (item.adat_type === 'tanpa_adat') parsed.adatLabel = 'Tanpa Adat';
    else if (item.adat_type) parsed.adatLabel = item.adat_type;

    return parsed;
}

function shouldShowKondisi(item: OrderItem): boolean {
    return (
        item.menu_category_type === 'timbang_hidup' ||
        item.menu_sub_type === 'babi_adat'
    );
}

function formatQty(item: OrderItem): string {
    return item.menu_category_type === 'timbang_hidup'
        ? `${item.qty} kg`
        : `${item.qty} ${item.menu_unit}`;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, cls }: { label: string; cls: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
        >
            {label}
        </span>
    );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyItems() {
    return (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <Package className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">
                Tidak ada item pesanan
            </p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderItemsTable({
    items,
    isEditable = false,
    totalAmount,
}: OrderItemsTableProps) {
    if (items.length === 0) return <EmptyItems />;

    // Pisah timbang hidup & eceran
    const timbangItems = items.filter(
        (i) => i.menu_category_type === 'timbang_hidup',
    );
    const eceranItems = items.filter(
        (i) => i.menu_category_type !== 'timbang_hidup',
    );

    return (
        <div className="space-y-1">
            {/* ── Timbang Hidup ── */}
            {timbangItems.length > 0 && (
                <div>
                    <div className="mb-2 flex items-center gap-2 px-1">
                        <Weight className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                            Timbang Hidup
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        {timbangItems.map((item) => (
                            <ItemRow key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            {timbangItems.length > 0 && eceranItems.length > 0 && (
                <div className="my-1 h-px bg-slate-100" />
            )}

            {/* ── Eceran ── */}
            {eceranItems.length > 0 && (
                <div>
                    {timbangItems.length > 0 && (
                        <div className="mb-2 flex items-center gap-2 px-1 pt-1">
                            <Package className="h-3.5 w-3.5 text-slate-400" />
                            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                Eceran & Paket
                            </p>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        {eceranItems.map((item) => (
                            <ItemRow key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Total ── */}
            {totalAmount !== undefined && (
                <div className="mt-3 rounded-2xl bg-primary/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-600">
                            Total Pesanan
                        </p>
                        <p className="text-base font-bold text-primary">
                            {fmt(totalAmount) ?? 'Harga Menyusul'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: OrderItem }) {
    const parsed = parseNotes(item);
    const showKondisi = shouldShowKondisi(item);
    const catStyle = CATEGORY_STYLE[item.menu_category_type];
    const subStyle = item.menu_sub_type
        ? SUB_TYPE_STYLE[item.menu_sub_type]
        : null;
    const kondisiStyle = KONDISI_STYLE[item.kondisi_produk];
    const hasDetail =
        parsed.detailLabel ||
        parsed.sisaDaging ||
        parsed.catatan ||
        (!parsed.detailLabel &&
            !parsed.sisaDaging &&
            !parsed.catatan &&
            parsed.rawNotes);

    return (
        <div className="group rounded-2xl bg-white px-4 py-3.5 ring-1 ring-black/[0.06] transition-all duration-150 hover:shadow-sm hover:ring-primary/20">
            <div className="flex items-start justify-between gap-4">
                {/* Kiri */}
                <div className="min-w-0 flex-1">
                    {/* Nama + badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-text">
                            {item.menu_name}
                        </p>

                        {/* Kategori badge — tampil sub_type jika ada, fallback ke category */}
                        {subStyle ? (
                            <Chip label={subStyle.label} cls={subStyle.cls} />
                        ) : (
                            <Chip label={catStyle.label} cls={catStyle.cls} />
                        )}

                        {/* Kondisi */}
                        {showKondisi && (
                            <Chip
                                label={kondisiStyle.label}
                                cls={kondisiStyle.cls}
                            />
                        )}

                        {/* Adat group */}
                        {parsed.adatLabel && (
                            <Chip
                                label={parsed.adatLabel}
                                cls="bg-violet-50 text-violet-700"
                            />
                        )}
                    </div>

                    {/* Info row: qty + harga unit */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                            {formatQty(item)}
                        </span>

                        {item.unit_price !== undefined &&
                        item.unit_price !== null ? (
                            <span className="text-slate-400">
                                × {fmt(item.unit_price)}
                                {item.menu_category_type === 'timbang_hidup'
                                    ? '/kg'
                                    : ''}
                            </span>
                        ) : (
                            <span className="rounded-full bg-accent-2/10 px-2 py-0.5 text-[10px] font-semibold text-accent-2">
                                Harga Menyusul
                            </span>
                        )}
                    </div>

                    {/* Detail adat / catatan */}
                    {hasDetail && (
                        <div className="mt-2.5 space-y-1 rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                            {parsed.detailLabel && (
                                <p className="text-slate-600">
                                    <span className="font-medium text-slate-700">
                                        Detail adat:{' '}
                                    </span>
                                    {parsed.detailLabel}
                                </p>
                            )}
                            {parsed.sisaDaging && (
                                <p className="text-slate-600">
                                    <span className="font-medium text-slate-700">
                                        Sisa daging:{' '}
                                    </span>
                                    {parsed.sisaDaging}
                                </p>
                            )}
                            {parsed.catatan && (
                                <p className="text-slate-600">
                                    <span className="font-medium text-slate-700">
                                        Catatan:{' '}
                                    </span>
                                    {parsed.catatan}
                                </p>
                            )}
                            {!parsed.detailLabel &&
                                !parsed.sisaDaging &&
                                !parsed.catatan &&
                                parsed.rawNotes && (
                                    <p className="text-slate-500 italic">
                                        {parsed.rawNotes}
                                    </p>
                                )}
                        </div>
                    )}
                </div>

                {/* Kanan — subtotal */}
                <div className="shrink-0 text-right">
                    {item.subtotal !== undefined && item.subtotal !== null ? (
                        <p className="text-sm font-bold text-primary">
                            {fmt(item.subtotal)}
                        </p>
                    ) : (
                        <p className="text-xs font-medium text-slate-400">—</p>
                    )}
                </div>
            </div>
        </div>
    );
}
