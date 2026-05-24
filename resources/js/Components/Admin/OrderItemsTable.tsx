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
    cashback?: number;
}

interface OrderItemsTableProps {
    items: OrderItem[];
    isEditable?: boolean;
    subtotalAmount?: number;
    totalAmount?: number;
    uniqueCode?: number | null;
    totalAfterCashback?: number;
    cashbackAmount?: number;
    paymentMethod?: 'full' | 'dp' | null;
}

type ParsedNotes = {
    adatLabel: string | null;
    detailLabel: string | null;
    sisaDaging: string | null;
    catatan: string | null;
    rawNotes: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────

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
        cls: 'bg-amber-100 text-amber-700',
    },
    olahan: { label: 'Olahan', cls: 'bg-emerald-100 text-emerald-700' },
    eceran: { label: 'Eceran', cls: 'bg-blue-100 text-blue-700' },
};

const SUB_TYPE_STYLE: Record<string, { label: string; cls: string }> = {
    babi_adat: { label: 'Babi Adat', cls: 'bg-rose-100 text-rose-700' },
    paket_pass: { label: 'Paket PASS', cls: 'bg-violet-100 text-violet-700' },
    paket_nasi_box: { label: 'Napass', cls: 'bg-amber-100 text-amber-700' },
    saksang: { label: 'Saksang', cls: 'bg-red-100 text-red-700' },
    panggang: { label: 'Panggang', cls: 'bg-orange-100 text-orange-700' },
    sop_tulang: { label: 'Sop Tulang', cls: 'bg-emerald-100 text-emerald-700' },
};

const KONDISI_STYLE: Record<string, { label: string; cls: string }> = {
    mentah: { label: 'Mentah', cls: 'bg-amber-100 text-amber-700' },
    mateng: { label: 'Mateng', cls: 'bg-emerald-100 text-emerald-700' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────

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
    const isEceranPackage =
        item.menu_category_type === 'eceran' &&
        (item.menu_sub_type === 'paket_pass' ||
            item.menu_sub_type === 'paket_nasi_box' ||
            item.menu_sub_type === 'babi_adat');

    if (isEceranPackage) {
        return `${item.qty}`;
    }

    return item.menu_category_type === 'timbang_hidup'
        ? `${item.qty} kg`
        : `${item.qty} ${item.menu_unit}`;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, cls }: { label: string; cls: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${cls}`}
        >
            {label}
        </span>
    );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyItems() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                <Package className="h-6 w-6 text-slate-500" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-600">
                    Tidak ada item pesanan
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    Tambahkan item untuk memulai
                </p>
            </div>
        </div>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
    icon: Icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="mb-3 flex items-center gap-2 px-2">
            {Icon}
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {label}
            </p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderItemsTable({
    items,
    isEditable = false,
    subtotalAmount,
    totalAmount,
    uniqueCode = null,
    totalAfterCashback,
    cashbackAmount = 0,
    paymentMethod = null,
}: OrderItemsTableProps) {
    if (items.length === 0) return <EmptyItems />;

    // Pisah timbang hidup & eceran
    const timbangItems = items.filter(
        (i) => i.menu_category_type === 'timbang_hidup',
    );
    const eceranItems = items.filter(
        (i) => i.menu_category_type !== 'timbang_hidup',
    );
    const shouldShowCashback = paymentMethod === 'full' && cashbackAmount > 0;
    const resolvedSubtotal = subtotalAmount ?? totalAmount ?? 0;
    const resolvedTotal =
        resolvedSubtotal +
        (uniqueCode ?? 0) -
        (shouldShowCashback ? cashbackAmount : 0);

    return (
        <div className="space-y-2.5">
            {/* ── Timbang Hidup ── */}
            {timbangItems.length > 0 && (
                <div>
                    <SectionHeader
                        icon={<Weight className="h-4 w-4 text-slate-400" />}
                        label="Timbang Hidup"
                    />
                    <div className="space-y-2.5">
                        {timbangItems.map((item) => (
                            <ItemRow
                                key={item.id}
                                item={item}
                                paymentMethod={paymentMethod}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            {timbangItems.length > 0 && eceranItems.length > 0 && (
                <div className="my-2 h-px bg-slate-100" />
            )}

            {/* ── Eceran & Paket ── */}
            {eceranItems.length > 0 && (
                <div>
                    <SectionHeader
                        icon={<Package className="h-4 w-4 text-slate-400" />}
                        label="Eceran & Paket"
                    />
                    <div className="space-y-2.5">
                        {eceranItems.map((item) => (
                            <ItemRow
                                key={item.id}
                                item={item}
                                paymentMethod={paymentMethod}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Total Summary ── */}
            {(subtotalAmount !== undefined || totalAmount !== undefined) && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 px-4 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                                Subtotal pesanan
                            </span>
                            <span className="font-semibold text-slate-700">
                                {fmt(resolvedSubtotal) ?? 'Harga Menyusul'}
                            </span>
                        </div>
                        {uniqueCode !== null && uniqueCode !== undefined && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                    Kode unik
                                </span>
                                <span className="font-semibold text-slate-700">
                                    {fmt(uniqueCode) ?? '0'}
                                </span>
                            </div>
                        )}
                        {shouldShowCashback && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Cashback</span>
                                <span className="font-semibold text-emerald-600">
                                    −{fmt(cashbackAmount)}
                                </span>
                            </div>
                        )}
                        <div className="my-2 h-px bg-slate-200" />
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">
                                Total
                            </span>
                            <span className="text-lg font-bold text-slate-900">
                                {fmt(
                                    shouldShowCashback &&
                                        totalAfterCashback !== undefined
                                        ? totalAfterCashback
                                        : resolvedTotal,
                                ) ?? 'Harga Menyusul'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({
    item,
    paymentMethod,
}: {
    item: OrderItem;
    paymentMethod: 'full' | 'dp' | null;
}) {
    const parsed = parseNotes(item);
    const showKondisi = shouldShowKondisi(item);
    const catStyle = CATEGORY_STYLE[item.menu_category_type];
    const subStyle = item.menu_sub_type
        ? SUB_TYPE_STYLE[item.menu_sub_type]
        : null;
    const kondisiStyle = KONDISI_STYLE[item.kondisi_produk];
    const cashbackAmount =
        item.menu_category_type === 'timbang_hidup' && paymentMethod === 'full'
            ? (item.cashback ?? 0)
            : 0;
    const hasDetail =
        parsed.detailLabel ||
        parsed.sisaDaging ||
        parsed.catatan ||
        (!parsed.detailLabel &&
            !parsed.sisaDaging &&
            !parsed.catatan &&
            parsed.rawNotes);

    return (
        <div className="group rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                {/* Kiri */}
                <div className="min-w-0 flex-1">
                    {/* Nama + badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-900">
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
                                cls="bg-violet-100 text-violet-700"
                            />
                        )}
                    </div>

                    {/* Info row: qty + harga unit */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            {formatQty(item)}
                        </span>

                        {item.unit_price !== undefined &&
                        item.unit_price !== null ? (
                            <span className="text-slate-500">
                                {fmt(item.unit_price)}
                                {item.menu_category_type === 'timbang_hidup'
                                    ? '/kg'
                                    : ''}
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Harga Menyusul
                            </span>
                        )}

                        {cashbackAmount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                Cashback {fmt(cashbackAmount)}
                            </span>
                        )}

                        {item.menu_category_type === 'timbang_hidup' &&
                            paymentMethod === 'full' && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    Pembayaran Penuh
                                </span>
                            )}
                    </div>

                    {/* Detail adat / catatan */}
                    {hasDetail && (
                        <div className="mt-3 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs">
                            {parsed.detailLabel && (
                                <p className="text-slate-700">
                                    <span className="font-semibold text-slate-800">
                                        Detail adat:
                                    </span>{' '}
                                    <span className="text-slate-600">
                                        {parsed.detailLabel}
                                    </span>
                                </p>
                            )}
                            {parsed.sisaDaging && (
                                <p className="text-slate-700">
                                    <span className="font-semibold text-slate-800">
                                        Sisa daging:
                                    </span>{' '}
                                    <span className="text-slate-600">
                                        {parsed.sisaDaging}
                                    </span>
                                </p>
                            )}
                            {parsed.catatan && (
                                <p className="text-slate-700">
                                    <span className="font-semibold text-slate-800">
                                        Catatan:
                                    </span>{' '}
                                    <span className="text-slate-600">
                                        {parsed.catatan}
                                    </span>
                                </p>
                            )}
                            {!parsed.detailLabel &&
                                !parsed.sisaDaging &&
                                !parsed.catatan &&
                                parsed.rawNotes && (
                                    <p className="text-slate-500 italic">
                                        "{parsed.rawNotes}"
                                    </p>
                                )}
                        </div>
                    )}
                </div>

                {/* Kanan — subtotal */}
                <div className="shrink-0 text-right">
                    {item.subtotal !== undefined && item.subtotal !== null ? (
                        <div className="flex flex-col items-end gap-0.5">
                            <p className="text-sm font-bold text-slate-900">
                                {fmt(item.subtotal)}
                            </p>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    ) : (
                        <p className="text-xs font-medium text-slate-400">—</p>
                    )}
                </div>
            </div>
        </div>
    );
}
