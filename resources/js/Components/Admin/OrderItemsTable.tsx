import { Package, Weight, ChevronRight } from 'lucide-react';
import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    id: number;
    menu_name: string;
    menu_image?: string | null;
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
    if (n === null || n === undefined) {
        return null;
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);
};

function resolveMenuImageUrl(item: OrderItem): string | null {
    const rawImage =
        item.menu_image ??
        (item as { menu_image_url?: string | null }).menu_image_url ??
        (item as { menu_item?: { image_url?: string | null } }).menu_item
            ?.image_url ??
        (item as { menuItem?: { image_url?: string | null } }).menuItem
            ?.image_url ??
        null;

    if (!rawImage) {
        return null;
    }

    if (
        rawImage.startsWith('http://') ||
        rawImage.startsWith('https://') ||
        rawImage.startsWith('/')
    ) {
        return rawImage;
    }

    return `/storage/${rawImage}`;
}

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

    if (item.menu_category_type === 'timbang_hidup') {
        return `${item.qty} kg`;
    }

    return `${item.qty} ${item.menu_unit}`;
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
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <Package className="h-6 w-6 text-slate-400" />
            </div>
            <div>
                <p className="text-sm font-semibold text-text">
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
        <div className="mb-3 flex items-center gap-2 px-1">
            {Icon}
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                {label}
            </p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderItemsTable({
    items,
    subtotalAmount,
    totalAmount,
    uniqueCode = null,
    totalAfterCashback,
    cashbackAmount = 0,
    paymentMethod = null,
}: OrderItemsTableProps) {
    if (items.length === 0) {
        return <EmptyItems />;
    }

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
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-slate-50/70 px-4 py-4 ring-1 ring-slate-100">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Rincian Item
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-text">
                        {items.length} item pesanan
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        {timbangItems.length} timbang hidup
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        {eceranItems.length} eceran & paket
                    </span>
                </div>
            </div>

            {/* ── Timbang Hidup ── */}
            {timbangItems.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <SectionHeader
                        icon={<Weight className="h-4 w-4 text-slate-400" />}
                        label="Timbang Hidup"
                    />
                    <div className="space-y-3">
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
                <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
            )}

            {/* ── Eceran & Paket ── */}
            {eceranItems.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <SectionHeader
                        icon={<Package className="h-4 w-4 text-slate-400" />}
                        label="Eceran & Paket"
                    />
                    <div className="space-y-3">
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
                <div className="rounded-3xl border border-primary/10 bg-linear-to-br from-white via-[#fbfcf8] to-primary/5 p-4 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Ringkasan Harga
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Perhitungan akhir pesanan
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Total Bayar
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-text">
                                {fmt(
                                    shouldShowCashback &&
                                        totalAfterCashback !== undefined
                                        ? totalAfterCashback
                                        : resolvedTotal,
                                ) ?? 'Harga Menyusul'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Subtotal
                            </p>
                            <p className="mt-1 text-sm font-semibold text-text">
                                {fmt(resolvedSubtotal) ?? 'Harga Menyusul'}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Kode unik
                            </p>
                            <p className="mt-1 text-sm font-semibold text-text">
                                {uniqueCode !== null && uniqueCode !== undefined
                                    ? (fmt(uniqueCode) ?? '0')
                                    : '0'}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Cashback
                            </p>
                            <p
                                className={`mt-1 text-sm font-semibold ${shouldShowCashback ? 'text-emerald-600' : 'text-slate-400'}`}
                            >
                                {shouldShowCashback
                                    ? `−${fmt(cashbackAmount)}`
                                    : 'Tidak ada'}
                            </p>
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
    const subStyle = item.menu_sub_type
        ? SUB_TYPE_STYLE[item.menu_sub_type]
        : null;
    const kondisiStyle = KONDISI_STYLE[item.kondisi_produk];
    const cashbackAmount =
        item.menu_category_type === 'timbang_hidup' && paymentMethod === 'full'
            ? (item.cashback ?? 0)
            : 0;
    const menuImageUrl = resolveMenuImageUrl(item);
    const hasDetail =
        parsed.detailLabel ||
        parsed.sisaDaging ||
        parsed.catatan ||
        (!parsed.detailLabel &&
            !parsed.sisaDaging &&
            !parsed.catatan &&
            parsed.rawNotes);

    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex gap-3">
                        <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-100">
                            {menuImageUrl ? (
                                <img
                                    src={menuImageUrl}
                                    alt={item.menu_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <Package className="size-5 text-slate-400" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-text">
                                    {item.menu_name}
                                </p>
                                {showKondisi && (
                                    <Chip
                                        label={kondisiStyle.label}
                                        cls={kondisiStyle.cls}
                                    />
                                )}
                                {parsed.adatLabel && (
                                    <Chip
                                        label={parsed.adatLabel}
                                        cls="bg-violet-100 text-violet-700"
                                    />
                                )}
                                {item.menu_sub_type && subStyle && (
                                    <Chip
                                        label={subStyle.label}
                                        cls={subStyle.cls}
                                    />
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                                    {formatQty(item)}
                                </span>

                                {item.unit_price !== undefined &&
                                item.unit_price !== null ? (
                                    <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                                        {fmt(item.unit_price)}
                                        {item.menu_category_type ===
                                        'timbang_hidup'
                                            ? '/kg'
                                            : ''}
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700 ring-1 ring-amber-100">
                                        Harga menyusul
                                    </span>
                                )}

                                {cashbackAmount > 0 && (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-emerald-100">
                                        Cashback {fmt(cashbackAmount)}
                                    </span>
                                )}

                                {item.menu_category_type === 'timbang_hidup' &&
                                    paymentMethod === 'full' && (
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 ring-1 ring-blue-100">
                                            Pembayaran penuh
                                        </span>
                                    )}
                            </div>

                            {hasDetail && (
                                <div className="rounded-2xl bg-slate-50/80 p-3 text-xs ring-1 ring-slate-100">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {parsed.detailLabel && (
                                            <div>
                                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                    Detail adat
                                                </p>
                                                <p className="mt-1 text-slate-700">
                                                    {parsed.detailLabel}
                                                </p>
                                            </div>
                                        )}
                                        {parsed.sisaDaging && (
                                            <div>
                                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                    Sisa daging
                                                </p>
                                                <p className="mt-1 text-slate-700">
                                                    {parsed.sisaDaging}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {parsed.catatan && (
                                        <div className="mt-3 border-t border-slate-200/80 pt-3">
                                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                Catatan
                                            </p>
                                            <p className="mt-1 text-slate-600">
                                                {parsed.catatan}
                                            </p>
                                        </div>
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
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 lg:flex-col lg:items-end lg:text-right">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Subtotal
                        </p>
                        {item.subtotal !== undefined &&
                        item.subtotal !== null ? (
                            <p className="mt-1 text-lg font-semibold text-text">
                                {fmt(item.subtotal)}
                            </p>
                        ) : (
                            <p className="mt-1 text-sm font-medium text-slate-400">
                                —
                            </p>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
            </div>
        </div>
    );
}
