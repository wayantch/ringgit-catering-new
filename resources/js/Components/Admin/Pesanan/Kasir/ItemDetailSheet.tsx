import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import TierPicker from '@/Components/Pelanggan/TierPicker';
import { KONDISI_OPTIONS } from '@/constants/kondisiProduk';
import type { CategoryType, KondisiValue } from '@/constants/kondisiProduk';
import type { MenuPickerCardItem } from './MenuPickerCard';

export interface ItemDetailPayload {
    menuItem: MenuPickerCardItem;
    menu_item_id: number;
    menu_name: string;
    menu_category_type: CategoryType;
    menu_unit: string;
    menu_image: string | null;
    base_price: number | null;
    qty: number;
    price: number | null;
    kondisi_produk: KondisiValue | '';
    adat_type: string | null;
    notes: string;
    quantityStep: number;
    quantityBounds?: { min: number; max: number | null } | null;
    cashback: number | null;
}

type TimbangAdatFlow = 'batak' | 'nias' | 'tanpa_adat' | '';
type BatakPart =
    | 'batak_lengkap'
    | 'batak_kepala'
    | 'batak_aliang'
    | 'batak_somba'
    | 'batak_soit'
    | 'batak_ekor'
    | 'batak_jeroan';
type NiasPart = 'nias_barat' | 'nias_kota' | 'nias_selatan';

const BATAK_PARTS: Array<{ value: BatakPart; label: string }> = [
    { value: 'batak_lengkap', label: 'Lengkap' },
    { value: 'batak_kepala', label: 'Kepala' },
    { value: 'batak_aliang', label: 'Aliang' },
    { value: 'batak_somba', label: 'Somba' },
    { value: 'batak_soit', label: 'Soit' },
    { value: 'batak_ekor', label: 'Ekor' },
    { value: 'batak_jeroan', label: 'Jeroan' },
];

const NIAS_PARTS: Array<{ value: NiasPart; label: string }> = [
    { value: 'nias_barat', label: 'Nias Barat' },
    { value: 'nias_kota', label: 'Nias Kota' },
    { value: 'nias_selatan', label: 'Nias Selatan' },
];

const NIAS_PART_LABELS: Record<NiasPart, string> = {
    nias_barat: 'Nias Barat',
    nias_kota: 'Nias Kota',
    nias_selatan: 'Nias Selatan',
};

const SACRIFICE_PERCENTS = [0, 25, 50, 75, 100] as const;

interface Props {
    isOpen: boolean;
    item: MenuPickerCardItem | null;
    onClose: () => void;
    onSave: (payload: ItemDetailPayload) => void;
}

const formatCurrency = (value: number | null): string => {
    if (value === null) {
        return 'Harga menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatKg = (value: number): string => {
    return `${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 1,
    }).format(value)} kg`;
};

const formatTierRange = (tier: MenuPickerCardItem['tiers'][number]): string => {
    if (tier.berat_max === null) {
        return `${formatKg(tier.berat_min)} ke atas`;
    }

    return `${formatKg(tier.berat_min)} - ${formatKg(tier.berat_max)}`;
};

const formatTierPriceByCondition = (
    tier: MenuPickerCardItem['tiers'][number],
    kondisiProduk: KondisiValue | '',
): string => {
    if (kondisiProduk === 'mateng') {
        return formatCurrency(tier.harga_matang);
    }

    return formatCurrency(tier.harga_mentah);
};

const formatTierCashback = (
    tier: MenuPickerCardItem['tiers'][number],
): string | undefined => {
    if (tier.cashback <= 0) {
        return undefined;
    }

    return `Cashback ${formatCurrency(tier.cashback)}`;
};

const getBabiAdatPriceByCondition = (
    item: MenuPickerCardItem,
    kondisiProduk: KondisiValue | '',
): number | null => {
    if (kondisiProduk === 'mateng') {
        return item.babi_matang_price ?? item.base_price ?? null;
    }

    if (kondisiProduk === 'mentah') {
        return item.babi_mentah_price ?? item.base_price ?? null;
    }

    return (
        item.base_price ??
        item.babi_mentah_price ??
        item.babi_matang_price ??
        null
    );
};

const getTierQuantityBounds = (
    tier: MenuPickerCardItem['tiers'][number] | null,
): { min: number; max: number | null } | null => {
    if (!tier) {
        return null;
    }

    const min = Math.max(1, Math.ceil(Number(tier.berat_min)));
    const max =
        tier.berat_max === null
            ? null
            : Math.max(min, Math.floor(tier.berat_max));

    return { min, max };
};

const clampQuantityToBounds = (
    value: number,
    bounds: { min: number; max: number | null },
): number => {
    const clampedMinimum = Math.max(bounds.min, value);

    if (bounds.max === null) {
        return Number(clampedMinimum.toFixed(2));
    }

    return Number(Math.min(bounds.max, clampedMinimum).toFixed(2));
};

function getDefaultKondisiProduk(
    item: MenuPickerCardItem | null,
): KondisiValue | '' {
    if (!item) {
        return '';
    }

    if (item.menu_type === 'timbang_hidup') {
        return 'mentah';
    }

    if (item.menu_type === 'eceran' && item.sub_type === 'babi_adat') {
        return 'mentah';
    }

    if (item.menu_type === 'eceran') {
        return 'satuan';
    }

    return '';
}

function buildSummaryLines(params: {
    item: MenuPickerCardItem;
    tier: MenuPickerCardItem['tiers'][number] | null;
    quantity: number;
    estimatedTotal: number | null;
    flow: TimbangAdatFlow;
    batakParts: BatakPart[];
    niasPart: NiasPart | '';
    saksangPercent: number;
    panggangPercent: number;
    batakRemainingPercent: number;
    remainderText: string;
    notes: string;
}): string {
    const {
        item,
        tier,
        quantity,
        estimatedTotal,
        flow,
        batakParts,
        niasPart,
        saksangPercent,
        panggangPercent,
        batakRemainingPercent,
        remainderText,
        notes,
    } = params;

    const lines: string[] = [];

    if (item.menu_type === 'timbang_hidup' && tier) {
        lines.push(`Range berat: ${formatTierRange(tier)}`);
        lines.push(`Jumlah dipilih: ${formatKg(quantity)}`);
        lines.push(`Estimasi harga: ${formatCurrency(estimatedTotal)}`);
    }

    if (flow === 'batak') {
        lines.push('Adat utama: Batak');
        lines.push(
            batakParts.length > 0
                ? `Batak detail: ${batakParts.join(', ')}`
                : 'Batak detail: belum dipilih',
        );
        lines.push(
            `Sisa daging: Saksang ${saksangPercent}%, Panggang ${panggangPercent}%${batakRemainingPercent > 0 ? `, Sisa ${batakRemainingPercent}%: ${remainderText}` : ''}`,
        );
    } else if (flow === 'nias') {
        lines.push('Adat utama: Nias');
        lines.push(
            niasPart
                ? `Nias detail: ${NIAS_PART_LABELS[niasPart]}`
                : 'Nias detail: belum dipilih',
        );
        lines.push(
            `Sisa daging: Rebusan Nias${remainderText ? `, ${remainderText}` : ''}`,
        );
    } else if (flow === 'tanpa_adat') {
        lines.push('Adat utama: Tanpa adat');
        lines.push(
            `Sisa daging: ${remainderText || 'Tidak ada pembagian khusus'}`,
        );
    }

    if (notes.trim() !== '') {
        lines.push(`Catatan: ${notes.trim()}`);
    }

    return lines.join('\n');
}

function OptionChips({
    label,
    helperText,
    options,
    value,
    onChange,
}: {
    label: string;
    helperText?: string;
    options: Array<{ value: string; label: string }>;
    value: string | null;
    onChange: (value: string) => void;
}) {
    return (
        <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="mb-3">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    {label}
                </p>
                {helperText && (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {options.map((option) => {
                    const active = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                                active
                                    ? 'border-primary bg-primary text-white shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-secondary/60'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function MultiSelectChips({
    label,
    helperText,
    options,
    value,
    onToggle,
    disableOthersWhenComplete,
}: {
    label: string;
    helperText?: string;
    options: Array<{ value: string; label: string }>;
    value: string[];
    onToggle: (option: string) => void;
    disableOthersWhenComplete?: boolean;
}) {
    const isComplete = value.includes('batak_lengkap');

    return (
        <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="mb-3">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    {label}
                </p>
                {helperText && (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const active = value.includes(option.value);
                    const disabled =
                        disableOthersWhenComplete &&
                        ((option.value !== 'batak_lengkap' && isComplete) ||
                            (option.value === 'batak_lengkap' &&
                                value.length > 0 &&
                                !isComplete));

                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => onToggle(option.value)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                                active
                                    ? 'border-primary bg-primary text-white shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-secondary/60'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function WeightAdjuster({
    value,
    minValue,
    maxValue,
    onChange,
}: {
    value: number;
    minValue: number;
    maxValue: number | null;
    onChange: (value: number) => void;
}) {
    return (
        <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                        Berat pesanan
                    </p>
                    <p className="mt-1 text-sm font-medium text-text">
                        Atur bobot per kg sesuai range yang dipilih
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Kurangi berat"
                        onClick={() => {
                            const next = Number((value - 1).toFixed(2));
                            const clamped = Math.max(minValue, next);
                            const finalValue =
                                maxValue === null
                                    ? clamped
                                    : Math.min(maxValue, clamped);

                            onChange(finalValue);
                        }}
                        className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-primary/20 hover:text-primary"
                    >
                        -
                    </button>

                    <div className="min-w-32 rounded-xl bg-secondary/50 px-4 py-2 text-center text-sm font-semibold text-text">
                        {formatKg(value)}
                    </div>

                    <button
                        type="button"
                        aria-label="Tambah berat"
                        onClick={() => {
                            const next = Number((value + 1).toFixed(2));
                            const clamped = Math.max(minValue, next);
                            const finalValue =
                                maxValue === null
                                    ? clamped
                                    : Math.min(maxValue, clamped);

                            onChange(finalValue);
                        }}
                        className="flex size-9 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-600"
                    >
                        +
                    </button>
                    <span className="text-xs font-medium text-slate-500">
                        kg
                    </span>
                </div>
            </div>
        </section>
    );
}

export default function ItemDetailSheet({
    isOpen,
    item,
    onClose,
    onSave,
}: Props) {
    const isTimbangHidup = item?.menu_type === 'timbang_hidup';
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        () =>
            item?.menu_type === 'eceran'
                ? (item.variants[0]?.id ?? null)
                : null,
    );
    const [kondisiProduk, setKondisiProduk] = useState<KondisiValue | ''>(() =>
        getDefaultKondisiProduk(item),
    );
    const [adatFlow, setAdatFlow] = useState<TimbangAdatFlow>('');
    const [selectedBatakParts, setSelectedBatakParts] = useState<BatakPart[]>(
        [],
    );
    const [selectedNiasPart, setSelectedNiasPart] = useState<NiasPart | ''>('');
    const [saksangPercent, setSaksangPercent] = useState<number>(25);
    const [panggangPercent, setPanggangPercent] = useState<number>(75);
    const [remainderText, setRemainderText] = useState<string>('');
    const [qty, setQty] = useState(1);
    const [notes, setNotes] = useState('');

    const kategori = (item?.category.type ?? 'olahan') as CategoryType;
    const kondisiOptions = isTimbangHidup
        ? KONDISI_OPTIONS.olahan
        : (KONDISI_OPTIONS[kategori] ?? KONDISI_OPTIONS.olahan);
    const selectedTier = useMemo(() => {
        if (!item || !isTimbangHidup || !selectedTierId) {
            return null;
        }

        return item.tiers.find((tier) => tier.id === selectedTierId) ?? null;
    }, [item, isTimbangHidup, selectedTierId]);

    const selectedTierQuantityBounds = useMemo(
        () => getTierQuantityBounds(selectedTier),
        [selectedTier],
    );
    const selectedTierQuantityMax = selectedTierQuantityBounds?.max ?? null;
    const selectedTierNeedsAdat = Boolean(
        selectedTier && !selectedTier.is_half,
    );
    const batakRemainingPercent = Math.max(
        0,
        100 - saksangPercent - panggangPercent,
    );
    const batakNeedsRemainder =
        adatFlow === 'batak' && batakRemainingPercent > 0;

    const selectedVariant = useMemo(() => {
        if (!item || item.menu_type !== 'eceran') {
            return null;
        }

        return (
            item.variants.find((variant) => variant.id === selectedVariantId) ??
            item.variants[0] ??
            null
        );
    }, [item, selectedVariantId]);

    const displayedEceranPrice = useMemo(() => {
        if (!item || item.menu_type !== 'eceran') {
            return null;
        }

        if (item.sub_type === 'babi_adat') {
            return getBabiAdatPriceByCondition(item, kondisiProduk);
        }

        const availablePrices = [
            ...item.variants.map((variant) => variant.harga),
            item.base_price,
        ].filter((price): price is number => price !== null);

        if (availablePrices.length > 0) {
            return Math.min(...availablePrices);
        }

        return selectedVariant?.harga ?? item.base_price ?? null;
    }, [item, kondisiProduk, selectedVariant]);

    const quantityStep = 1;

    const canSave =
        item !== null &&
        ((isTimbangHidup &&
            kondisiProduk !== '' &&
            selectedTier !== null &&
            (!selectedTierNeedsAdat || adatFlow !== '') &&
            (adatFlow !== 'nias' || selectedNiasPart !== '') &&
            (!batakNeedsRemainder || remainderText.trim() !== '')) ||
            (item.menu_type === 'eceran' &&
                kondisiProduk !== '' &&
                (item.sub_type === 'babi_adat'
                    ? displayedEceranPrice !== null
                    : item.variants.length === 0 || selectedVariant !== null)));

    const adjustQty = (delta: number): void => {
        setQty((current) => {
            const nextValue = Number((current + delta).toFixed(2));

            if (isTimbangHidup && selectedTierQuantityBounds) {
                return clampQuantityToBounds(nextValue, {
                    min: selectedTierQuantityBounds.min,
                    max: selectedTierQuantityBounds.max,
                });
            }

            return Math.max(quantityStep, nextValue);
        });
    };

    const handleSave = (): void => {
        if (!item || !canSave) {
            return;
        }

        const resolvedAdatType = isTimbangHidup
            ? !selectedTierNeedsAdat
                ? null
                : adatFlow === 'batak'
                  ? (selectedBatakParts[0] ?? 'batak_lengkap')
                  : adatFlow === 'nias'
                    ? 'nias_simbi_simbi'
                    : 'lainnya'
            : null;

        const resolvedUnitPrice =
            isTimbangHidup && selectedTier
                ? kondisiProduk === 'mateng'
                    ? Number(selectedTier.harga_matang)
                    : Number(selectedTier.harga_mentah)
                : displayedEceranPrice;

        const estimatedTotal =
            resolvedUnitPrice === null
                ? null
                : Number((resolvedUnitPrice * qty).toFixed(2));

        const summaryNotes = isTimbangHidup
            ? buildSummaryLines({
                  item,
                  tier: selectedTier,
                  quantity: qty,
                  estimatedTotal,
                  flow: selectedTierNeedsAdat ? adatFlow : '',
                  batakParts: selectedBatakParts,
                  niasPart: selectedNiasPart,
                  saksangPercent,
                  panggangPercent,
                  batakRemainingPercent,
                  remainderText: remainderText.trim(),
                  notes,
              })
            : notes;

        onSave({
            menuItem: item,
            menu_item_id: item.id,
            menu_name: item.name,
            menu_category_type: item.menu_type,
            menu_unit: item.unit,
            menu_image: item.image,
            base_price: item.base_price,
            qty,
            price: resolvedUnitPrice,
            kondisi_produk: kondisiProduk,
            adat_type: resolvedAdatType,
            notes: summaryNotes,
            quantityStep,
            quantityBounds: isTimbangHidup ? selectedTierQuantityBounds : null,
            cashback:
                isTimbangHidup && selectedTier && selectedTier.cashback > 0
                    ? selectedTier.cashback
                    : null,
        });
    };

    if (!isOpen || !item) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-60">
            <button
                type="button"
                aria-label="Tutup"
                className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="absolute right-0 bottom-0 left-0 mx-auto w-full max-w-3xl overflow-hidden rounded-t-[30px] border border-black/5 bg-white shadow-[0_-28px_90px_rgba(15,23,42,0.24)]">
                <div className="border-b border-slate-100 bg-linear-to-br from-white via-[#fcfcfa] to-primary/5 px-4 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                                    Detail Item
                                </span>
                                <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold text-slate-600">
                                    {item.category.name}
                                </span>
                                {!item.is_available && (
                                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600">
                                        Tidak tersedia
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="truncate text-lg font-semibold tracking-tight text-text sm:text-2xl">
                                    {item.name}
                                </h3>
                                <p className="text-sm leading-6 text-slate-500">
                                    Pilih kondisi, varian, adat, dan catatan
                                    sebelum menambahkan item ke pesanan.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-text"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[calc(80vh-128px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                    {isTimbangHidup ? (
                        <>
                            <OptionChips
                                label="Pilih kondisi"
                                helperText="Pilih kondisi daging sebelum memilih range berat."
                                options={kondisiOptions.map((opt) => ({
                                    value: opt.value,
                                    label: `${opt.emoji} ${opt.label}`,
                                }))}
                                value={kondisiProduk || null}
                                onChange={(value) => {
                                    setKondisiProduk(value as KondisiValue);
                                }}
                            />

                            <TierPicker
                                label="Pilih range berat"
                                helperText="Pilih range yang sudah diinput admin sebelum mengatur berat pesanan."
                                options={(item?.tiers ?? []).map((tier) => ({
                                    id: tier.id,
                                    title: `Kode ${tier.kode} - ${tier.is_half ? 'Setengah ekor' : 'Utuh/satu ekor'}`,
                                    description: formatTierRange(tier),
                                    price: formatTierPriceByCondition(
                                        tier,
                                        kondisiProduk,
                                    ),
                                    cashback: formatTierCashback(tier),
                                    meta: tier.is_half ? 'Setengah' : 'Utuh',
                                }))}
                                value={selectedTierId}
                                onChange={(value) => {
                                    setSelectedTierId(value);

                                    if (!value || !item) {
                                        return;
                                    }

                                    const nextTier =
                                        item.tiers.find(
                                            (tier) => tier.id === value,
                                        ) ?? null;

                                    if (!nextTier) {
                                        return;
                                    }

                                    const nextBounds =
                                        getTierQuantityBounds(nextTier);

                                    if (nextBounds) {
                                        setQty(Math.max(1, nextBounds.min));
                                    }

                                    setAdatFlow('');
                                    setSelectedBatakParts([]);
                                    setSelectedNiasPart('');
                                    setRemainderText('');
                                }}
                            />

                            {selectedTier && (
                                <div className="space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-3 sm:p-4">
                                    <WeightAdjuster
                                        value={qty}
                                        minValue={
                                            selectedTierQuantityBounds?.min ?? 1
                                        }
                                        maxValue={
                                            selectedTierQuantityBounds?.max ??
                                            null
                                        }
                                        onChange={setQty}
                                    />
                                    <section className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-600">
                                        Range kg dari admin untuk tier ini:{' '}
                                        {formatTierRange(selectedTier)}
                                        <span className="mt-1 block text-xs text-slate-500">
                                            Total estimasi saat ini:{' '}
                                            {formatCurrency(
                                                (kondisiProduk === 'mateng'
                                                    ? selectedTier.harga_matang
                                                    : selectedTier.harga_mentah) *
                                                    qty,
                                            )}
                                        </span>
                                    </section>
                                </div>
                            )}

                            {!selectedTier && (
                                <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 shadow-sm">
                                    <p className="font-medium text-text">
                                        Pilih range terlebih dahulu untuk
                                        melanjutkan pengaturan pesanan.
                                    </p>
                                </section>
                            )}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="grid gap-0 sm:grid-cols-[1.2fr_0.8fr] sm:items-stretch">
                                    <div className="p-4 sm:p-5">
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            Ringkasan menu
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-slate-500">
                                            {isTimbangHidup
                                                ? 'Pilih kondisi, range, adat, lalu catatan agar detail pesanan mirip flow customer.'
                                                : 'Pilih kondisi dan catatan sebelum menyimpan pesanan.'}
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100 bg-[linear-gradient(180deg,#fbfaf6_0%,#f7f8f5_100%)] p-4 sm:border-t-0 sm:border-l sm:border-slate-100 sm:p-5">
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            {isTimbangHidup && selectedTier
                                                ? 'Estimasi harga'
                                                : 'Harga mulai'}
                                        </p>
                                        {isTimbangHidup && selectedTier ? (
                                            <>
                                                <p className="mt-1 text-lg font-semibold text-primary">
                                                    {formatCurrency(
                                                        kondisiProduk ===
                                                            'mateng'
                                                            ? selectedTier.harga_matang *
                                                                  qty
                                                            : selectedTier.harga_mentah *
                                                                  qty,
                                                    )}
                                                </p>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </section>

                            {selectedTier && selectedTierNeedsAdat && (
                                <>
                                    <OptionChips
                                        label="Pilih adat"
                                        helperText="Pilih adat (mis. Batak, Nias, atau lainnya) setelah memilih range."
                                        options={[
                                            { value: 'batak', label: 'Batak' },
                                            { value: 'nias', label: 'Nias' },
                                            {
                                                value: 'tanpa_adat',
                                                label: 'Lainnya',
                                            },
                                        ]}
                                        value={adatFlow}
                                        onChange={(value) => {
                                            setAdatFlow(
                                                value as TimbangAdatFlow,
                                            );
                                            setSelectedBatakParts([]);
                                            setSelectedNiasPart('');
                                            setRemainderText('');

                                            if (value === 'batak') {
                                                setSaksangPercent(25);
                                                setPanggangPercent(75);
                                            } else {
                                                setSaksangPercent(25);
                                                setPanggangPercent(75);
                                            }
                                        }}
                                    />

                                    {adatFlow === 'batak' && (
                                        <MultiSelectChips
                                            label="Detail Batak"
                                            helperText="Pilih satu atau beberapa. Jika Lengkap dipilih, opsi lain akan dinonaktifkan."
                                            options={BATAK_PARTS}
                                            value={selectedBatakParts}
                                            onToggle={(value) => {
                                                setSelectedBatakParts(
                                                    (current) => {
                                                        if (
                                                            value ===
                                                            'batak_lengkap'
                                                        ) {
                                                            return current.includes(
                                                                value,
                                                            )
                                                                ? []
                                                                : [
                                                                      'batak_lengkap',
                                                                  ];
                                                        }

                                                        if (
                                                            current.includes(
                                                                'batak_lengkap',
                                                            )
                                                        ) {
                                                            return [
                                                                value as BatakPart,
                                                            ];
                                                        }

                                                        if (
                                                            current.includes(
                                                                value as BatakPart,
                                                            )
                                                        ) {
                                                            return current.filter(
                                                                (entry) =>
                                                                    entry !==
                                                                    value,
                                                            );
                                                        }

                                                        return [
                                                            ...current,
                                                            value as BatakPart,
                                                        ];
                                                    },
                                                );
                                            }}
                                            disableOthersWhenComplete
                                        />
                                    )}

                                    {adatFlow === 'nias' && (
                                        <OptionChips
                                            label="Detail Nias"
                                            helperText="Pilih satu wilayah adat saja."
                                            options={NIAS_PARTS}
                                            value={selectedNiasPart || null}
                                            onChange={(value) => {
                                                setSelectedNiasPart(
                                                    value as NiasPart,
                                                );
                                            }}
                                        />
                                    )}

                                    {adatFlow && (
                                        <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                                            <div className="mb-3">
                                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                                    Sisa daging
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-text">
                                                    Atur pembagian sisa daging
                                                    setelah adat dipilih
                                                </p>
                                            </div>

                                            {adatFlow === 'batak' && (
                                                <div className="space-y-4">
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <div>
                                                            <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                                Saksang %
                                                            </label>
                                                            <select
                                                                value={
                                                                    saksangPercent
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const percent =
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        );

                                                                    setSaksangPercent(
                                                                        Math.min(
                                                                            100,
                                                                            Math.max(
                                                                                0,
                                                                                percent,
                                                                            ),
                                                                        ),
                                                                    );

                                                                    if (
                                                                        percent +
                                                                            panggangPercent >
                                                                        100
                                                                    ) {
                                                                        setPanggangPercent(
                                                                            Math.max(
                                                                                0,
                                                                                100 -
                                                                                    percent,
                                                                            ),
                                                                        );
                                                                    }
                                                                }}
                                                                className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-3 text-sm transition outline-none focus:border-primary/30"
                                                            >
                                                                {SACRIFICE_PERCENTS.map(
                                                                    (
                                                                        percent,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                percent
                                                                            }
                                                                            value={
                                                                                percent
                                                                            }
                                                                        >
                                                                            {
                                                                                percent
                                                                            }
                                                                            %
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                                Panggang %
                                                            </label>
                                                            <select
                                                                value={
                                                                    panggangPercent
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const percent =
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        );

                                                                    setPanggangPercent(
                                                                        Math.min(
                                                                            100,
                                                                            Math.max(
                                                                                0,
                                                                                percent,
                                                                            ),
                                                                        ),
                                                                    );

                                                                    if (
                                                                        saksangPercent +
                                                                            percent >
                                                                        100
                                                                    ) {
                                                                        setSaksangPercent(
                                                                            Math.max(
                                                                                0,
                                                                                100 -
                                                                                    percent,
                                                                            ),
                                                                        );
                                                                    }
                                                                }}
                                                                className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-3 text-sm transition outline-none focus:border-primary/30"
                                                            >
                                                                {SACRIFICE_PERCENTS.map(
                                                                    (
                                                                        percent,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                percent
                                                                            }
                                                                            value={
                                                                                percent
                                                                            }
                                                                        >
                                                                            {
                                                                                percent
                                                                            }
                                                                            %
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-600">
                                                        Saksang akan dibuat{' '}
                                                        {saksangPercent}%,
                                                        panggang akan dibuat{' '}
                                                        {panggangPercent}%.
                                                        {batakRemainingPercent >
                                                        0
                                                            ? ` Silahkan input sisa daging lainnya sebesar ${batakRemainingPercent}%.`
                                                            : ' Pembagian sudah mencapai 100%.'}
                                                    </div>

                                                    {batakNeedsRemainder && (
                                                        <div>
                                                            <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                                Sisa daging
                                                                lainnya
                                                            </label>
                                                            <input
                                                                value={
                                                                    remainderText
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setRemainderText(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-3 text-sm transition outline-none focus:border-primary/30"
                                                                placeholder="Contoh: babi kecap"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {adatFlow === 'nias' && (
                                                <div className="space-y-3">
                                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                                        Rebusan Nias
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                            Catatan sisa
                                                        </label>
                                                        <input
                                                            value={
                                                                remainderText
                                                            }
                                                            onChange={(event) =>
                                                                setRemainderText(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-3 text-sm transition outline-none focus:border-primary/30"
                                                            placeholder="Contoh: rebusan untuk keluarga"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {adatFlow === 'tanpa_adat' && (
                                                <div>
                                                    <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                        Keterangan sisa /
                                                        catatan
                                                    </label>
                                                    <input
                                                        value={remainderText}
                                                        onChange={(event) =>
                                                            setRemainderText(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-3 text-sm transition outline-none focus:border-primary/30"
                                                        placeholder="Tuliskan keterangan pembagian sisa"
                                                    />
                                                </div>
                                            )}
                                        </section>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {item.sub_type === 'babi_adat' && (
                                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="mb-3">
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            Kondisi produk
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-text">
                                            Pilih kondisi produk sebelum
                                            menyimpan pesanan
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {KONDISI_OPTIONS.olahan.map(
                                            (option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setKondisiProduk(
                                                            option.value,
                                                        )
                                                    }
                                                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                                        kondisiProduk ===
                                                        option.value
                                                            ? 'border-primary bg-primary text-white'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
                                                    }`}
                                                >
                                                    <span className="mr-2">
                                                        {option.emoji}
                                                    </span>
                                                    {option.label}
                                                    <span
                                                        className={`mt-1 block text-xs font-medium ${
                                                            kondisiProduk ===
                                                            option.value
                                                                ? 'text-white/80'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {formatCurrency(
                                                            option.value ===
                                                                'mateng'
                                                                ? (item.babi_matang_price ??
                                                                      item.base_price ??
                                                                      null)
                                                                : (item.babi_mentah_price ??
                                                                      item.base_price ??
                                                                      null),
                                                        )}
                                                    </span>
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}

                            {item.sub_type !== 'babi_adat' &&
                                item.variants.length > 0 && (
                                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-3">
                                            <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                                Pilih varian
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-text">
                                                Pilih varian yang sama seperti
                                                flow add to cart user
                                            </p>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {item.variants.map((variant) => (
                                                <button
                                                    key={variant.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedVariantId(
                                                            variant.id,
                                                        )
                                                    }
                                                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                                        selectedVariant?.id ===
                                                        variant.id
                                                            ? 'border-primary bg-primary text-white'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
                                                    }`}
                                                >
                                                    <span className="block">
                                                        {variant.label}
                                                    </span>
                                                    <span
                                                        className={`mt-1 block text-xs font-medium ${selectedVariant?.id === variant.id ? 'text-white/80' : 'text-slate-400'}`}
                                                    >
                                                        {formatCurrency(
                                                            variant.harga,
                                                        )}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                            {item.sub_type === 'paket_pass' && (
                                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="mb-2">
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            Isi Paket
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {item.bundle_desc ?? 'Paket pass'}
                                        </p>
                                    </div>
                                    {item.free_ongkir_km ? (
                                        <div className="mt-3 rounded-2xl bg-[#fbfaf6] p-3 text-sm text-slate-500">
                                            🚚 Free ongkir {item.free_ongkir_km}{' '}
                                            km
                                        </div>
                                    ) : null}
                                </section>
                            )}

                            {item.sub_type === 'paket_nasi_box' && (
                                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="mb-2">
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            Isi Paket
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {item.bundle_desc ?? 'Paket Napass'}
                                        </p>
                                    </div>
                                    {item.free_ongkir_km ? (
                                        <div className="mt-3 rounded-2xl bg-[#fbfaf6] p-3 text-sm text-slate-500">
                                            🚚 Free ongkir {item.free_ongkir_km}{' '}
                                            km
                                        </div>
                                    ) : null}
                                </section>
                            )}

                            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            Qty
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-text">
                                            Atur jumlah pesanan
                                        </p>
                                    </div>

                                    <div className="flex items-center rounded-full border border-slate-200 bg-secondary/50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => adjustQty(-1)}
                                            disabled={
                                                isTimbangHidup &&
                                                selectedTierQuantityBounds
                                                    ? qty <=
                                                      selectedTierQuantityBounds.min
                                                    : qty <= 1
                                            }
                                            className="flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                                        >
                                            -
                                        </button>
                                        <span className="min-w-14 px-2 text-center text-sm font-semibold text-text">
                                            {qty}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => adjustQty(1)}
                                            disabled={
                                                isTimbangHidup &&
                                                selectedTierQuantityMax !== null
                                                    ? qty >=
                                                      selectedTierQuantityMax
                                                    : false
                                            }
                                            className="flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#fbfaf6] px-3 py-2 text-xs text-slate-500">
                                    <Check className="h-4 w-4 text-emerald-600" />
                                    Jumlah dapat disesuaikan sebelum menyimpan
                                    pesanan.
                                </div>
                            </section>
                        </>
                    )}

                    <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-text">
                            Catatan tambahan
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-4 py-3 text-sm transition outline-none focus:border-primary/30"
                            placeholder="Contoh: potong kecil, kemasan terpisah"
                        />
                    </section>
                </div>

                <div className="border-t border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fafaf7_100%)] px-4 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(122,143,107,0.6)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                        Tambah ke Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
}
