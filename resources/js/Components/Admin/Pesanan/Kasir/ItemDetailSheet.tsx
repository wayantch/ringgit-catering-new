import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import TierPicker from '@/Components/Pelanggan/TierPicker';
import { ADAT_OPTIONS, KONDISI_OPTIONS } from '@/constants/kondisiProduk';
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
type NiasPart = 'nias_barat' | 'nias_kota' | 'nias_sekitar';

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
    { value: 'nias_sekitar', label: 'Nias Sekitar' },
];

const SACRIFICE_PERCENTS = [25, 50, 75, 100] as const;

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

const formatTierPricePair = (
    tier: MenuPickerCardItem['tiers'][number],
): string => {
    return `Mentah ${formatCurrency(tier.harga_mentah)} · Matang ${formatCurrency(tier.harga_matang)}`;
};

const getTierQuantityBounds = (
    tier: MenuPickerCardItem['tiers'][number] | null,
): { min: number; max: number | null } | null => {
    if (!tier) {
        return null;
    }

    const min = Number(Math.max(0.5, Number(tier.berat_min)).toFixed(2));
    const max =
        tier.berat_max === null ? null : Number(tier.berat_max.toFixed(2));

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

function buildSummaryLines(params: {
    item: MenuPickerCardItem;
    tier: MenuPickerCardItem['tiers'][number] | null;
    quantity: number;
    estimatedTotal: number | null;
    flow: TimbangAdatFlow;
    batakParts: BatakPart[];
    niasParts: NiasPart[];
    saksangPercent: number;
    panggangPercent: number;
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
        niasParts,
        saksangPercent,
        panggangPercent,
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
            `Sisa daging: Saksang ${saksangPercent}%, Panggang ${panggangPercent}%${remainderText ? `, ${remainderText}` : ''}`,
        );
    } else if (flow === 'nias') {
        lines.push('Adat utama: Nias');
        lines.push(
            niasParts.length > 0
                ? `Nias detail: ${niasParts.join(', ')}`
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
                        Atur bobot untuk pesanan timbang hidup
                    </p>
                </div>

                <div className="flex items-center rounded-full border border-black/5 bg-[#fbfaf6] p-1 shadow-sm">
                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                Number(
                                    Math.max(minValue, value - 0.5).toFixed(2),
                                ),
                            )
                        }
                        disabled={value <= minValue}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                        -
                    </button>
                    <span className="min-w-16 px-2 text-center text-sm font-semibold text-text">
                        {formatKg(value)}
                    </span>
                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                clampQuantityToBounds(value + 0.5, {
                                    min: minValue,
                                    max: maxValue,
                                }),
                            )
                        }
                        disabled={maxValue !== null && value >= maxValue}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                    >
                        +
                    </button>
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
    const isTimbangHidup = item?.category.type === 'timbang_hidup';
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
    const [kondisiProduk, setKondisiProduk] = useState<KondisiValue | ''>('');
    const [adatFlow, setAdatFlow] = useState<TimbangAdatFlow>('');
    const [selectedBatakParts, setSelectedBatakParts] = useState<BatakPart[]>(
        [],
    );
    const [selectedNiasParts, setSelectedNiasParts] = useState<NiasPart[]>([]);
    const [saksangPercent, setSaksangPercent] = useState<number>(25);
    const [panggangPercent, setPanggangPercent] = useState<number>(75);
    const [remainderText, setRemainderText] = useState<string>('');
    const [qty, setQty] = useState(0.5);
    const [priceInput, setPriceInput] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!isOpen || !item) {
            return;
        }

        setKondisiProduk('');
        setSelectedTierId(null);
        setAdatFlow('');
        setSelectedBatakParts([]);
        setSelectedNiasParts([]);
        setSaksangPercent(25);
        setPanggangPercent(75);
        setRemainderText('');
        setQty(isTimbangHidup ? 0.5 : 1);
        setPriceInput(item.base_price === null ? '' : String(item.base_price));
        setNotes('');
    }, [isOpen, item, isTimbangHidup]);

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

    useEffect(() => {
        if (!isTimbangHidup || !selectedTier) {
            return;
        }

        if (selectedTierQuantityBounds) {
            setQty(selectedTierQuantityBounds.min);
        }

        setAdatFlow('');
        setSelectedBatakParts([]);
        setSelectedNiasParts([]);
        setRemainderText('');
    }, [isTimbangHidup, selectedTier, selectedTierQuantityBounds]);

    const quantityStep = useMemo(
        () => (isTimbangHidup ? 0.5 : 1),
        [isTimbangHidup],
    );

    const canSave =
        item !== null &&
        kondisiProduk !== '' &&
        (!isTimbangHidup || (selectedTier !== null && adatFlow !== '')) &&
        (!isTimbangHidup || selectedTier !== null);

    const adjustQty = (delta: number): void => {
        setQty((current) =>
            Math.max(
                isTimbangHidup ? 0.5 : quantityStep,
                Number((current + delta).toFixed(2)),
            ),
        );
    };

    const handleSave = (): void => {
        if (!item || !canSave) {
            return;
        }

        const resolvedAdatType = isTimbangHidup
            ? adatFlow === 'batak'
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
                : priceInput.trim() === ''
                  ? null
                  : Number(priceInput);

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
                  flow: adatFlow,
                  batakParts: selectedBatakParts,
                  niasParts: selectedNiasParts,
                  saksangPercent,
                  panggangPercent,
                  remainderText: remainderText.trim(),
                  notes,
              })
            : notes;

        onSave({
            menuItem: item,
            menu_item_id: item.id,
            menu_name: item.name,
            menu_category_type: item.category.type,
            menu_unit: item.unit,
            menu_image: item.image,
            base_price: item.base_price,
            qty,
            price: resolvedUnitPrice,
            kondisi_produk: kondisiProduk,
            adat_type: resolvedAdatType,
            notes: summaryNotes,
            quantityStep,
        });
    };

    if (!isOpen || !item) {
        return null;
    }

    const selectedSummaryLabel =
        isTimbangHidup && !selectedTier
            ? 'Pilih range dulu'
            : isTimbangHidup
              ? kondisiProduk === 'mateng'
                  ? 'Mateng'
                  : kondisiProduk === 'mentah'
                    ? 'Mentah'
                    : 'Pilih kondisi'
              : kondisiProduk === 'mateng'
                ? 'Mateng'
                : kondisiProduk === 'mentah'
                  ? 'Mentah'
                  : 'Pilih kondisi';

    return (
        <div className="fixed inset-0 z-60">
            <button
                type="button"
                aria-label="Tutup"
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
                onClick={onClose}
            />

            <div className="absolute right-0 bottom-0 left-0 mx-auto w-full max-w-2xl rounded-t-[28px] border border-black/5 bg-white shadow-[0_-24px_80px_rgba(15,23,42,0.2)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                            Detail Item
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-text sm:text-xl">
                            {item.name}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-text"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                    <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr] sm:items-start">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Ringkasan menu
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                    <span className="rounded-full bg-[#fbfaf6] px-3 py-1 font-medium text-text">
                                        {isTimbangHidup
                                            ? 'Timbang hidup'
                                            : (item?.category.type ?? 'olahan')}
                                    </span>
                                    <span className="rounded-full bg-[#fbfaf6] px-3 py-1 font-medium text-text">
                                        {isTimbangHidup
                                            ? `${item?.tiers.length ?? 0} tier`
                                            : '1 item'}
                                    </span>
                                    {isTimbangHidup && selectedTier && (
                                        <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                                            Flow {selectedSummaryLabel}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {isTimbangHidup
                                        ? 'Pilih kondisi, range, adat, lalu catatan agar detail pesanan mirip flow customer.'
                                        : 'Pilih kondisi dan catatan sebelum menyimpan pesanan.'}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#fbfaf6] p-4">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    {isTimbangHidup && selectedTier
                                        ? 'Estimasi harga'
                                        : 'Harga mulai'}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-primary">
                                    {isTimbangHidup && selectedTier
                                        ? formatCurrency(
                                              kondisiProduk === 'mateng'
                                                  ? selectedTier.harga_matang *
                                                        qty
                                                  : selectedTier.harga_mentah *
                                                        qty,
                                          )
                                        : formatCurrency(
                                              item?.base_price ?? null,
                                          )}
                                </p>
                                {isTimbangHidup && selectedTier && (
                                    <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                                        <p>Tier aktif: {selectedTier.kode}</p>
                                        <p>
                                            Range admin:{' '}
                                            {formatTierRange(selectedTier)}
                                        </p>
                                        <p>
                                            Harga per kg:{' '}
                                            {formatCurrency(
                                                kondisiProduk === 'mateng'
                                                    ? selectedTier.harga_matang
                                                    : selectedTier.harga_mentah,
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

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
                                    title: formatTierRange(tier),
                                    description: `Kode ${tier.kode}`,
                                    price: formatTierPricePair(tier),
                                    meta:
                                        tier.berat_max !== null
                                            ? `${formatKg(tier.berat_min)}-${formatKg(tier.berat_max)}`
                                            : `${formatKg(tier.berat_min)}+`,
                                }))}
                                value={selectedTierId}
                                onChange={setSelectedTierId}
                            />

                            {selectedTier && (
                                <div className="space-y-3">
                                    <WeightAdjuster
                                        value={qty}
                                        minValue={
                                            selectedTierQuantityBounds?.min ??
                                            0.5
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
                                <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                                    <p className="text-sm font-medium text-text">
                                        Pilih range terlebih dahulu untuk
                                        melanjutkan pengaturan pesanan.
                                    </p>
                                </section>
                            )}

                            {selectedTier && (
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
                                            setSelectedNiasParts([]);
                                            setRemainderText('');

                                            if (value === 'batak') {
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
                                        <MultiSelectChips
                                            label="Detail Nias"
                                            helperText="Bisa pilih lebih dari satu wilayah adat."
                                            options={NIAS_PARTS}
                                            value={selectedNiasParts}
                                            onToggle={(value) => {
                                                setSelectedNiasParts(
                                                    (current) => {
                                                        if (
                                                            current.includes(
                                                                value as NiasPart,
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
                                                            value as NiasPart,
                                                        ];
                                                    },
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
                                                                        (
                                                                            prevSaksang,
                                                                        ) => {
                                                                            if (
                                                                                panggangPercent ===
                                                                                100 -
                                                                                    prevSaksang
                                                                            ) {
                                                                                setPanggangPercent(
                                                                                    100 -
                                                                                        percent,
                                                                                );
                                                                            }

                                                                            return percent;
                                                                        },
                                                                    );
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
                                                        Otomatis: sisa panggang
                                                        mengikuti saksang. Kalau
                                                        ingin pembagian lain
                                                        seperti 25% saksang, 50%
                                                        panggang, dan sisanya
                                                        babi kecap, ubah persen
                                                        secara manual lalu tulis
                                                        sisanya di catatan.
                                                    </div>

                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                            Sisa lainnya
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
                                                            placeholder="Contoh: babi kecap"
                                                        />
                                                    </div>
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
                            <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                                <div className="mb-3">
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Kondisi
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-text">
                                        Pilih kondisi produk
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {kondisiOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setKondisiProduk(option.value)
                                            }
                                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                                kondisiProduk === option.value
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
                                            }`}
                                        >
                                            <span className="mr-2">
                                                {option.emoji}
                                            </span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                                <label className="mb-2 block text-sm font-semibold text-text">
                                    Harga
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={priceInput}
                                        onChange={(event) =>
                                            setPriceInput(event.target.value)
                                        }
                                        placeholder={
                                            item?.base_price === null
                                                ? 'Harga menyusul'
                                                : String(item?.base_price)
                                        }
                                        className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-11 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-400">
                                    {formatCurrency(item?.base_price ?? null)}
                                </p>
                            </section>
                        </>
                    )}

                    <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-4">
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
                                    onClick={() => adjustQty(-quantityStep)}
                                    className="flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                                >
                                    -
                                </button>
                                <span className="min-w-14 px-2 text-center text-sm font-semibold text-text">
                                    {qty}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => adjustQty(quantityStep)}
                                    className="flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-text">
                            Catatan
                        </label>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Opsional"
                        />
                    </section>
                </div>

                <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Tambah ke Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
}
