import { router } from '@inertiajs/react';
import { Check, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Select from '@/Components/UI/Select';
import { KONDISI_OPTIONS } from '@/constants/kondisiProduk';
import type { CategoryType, KondisiValue } from '@/constants/kondisiProduk';
import { alertError } from '@/lib/alert';
import keranjang from '@/routes/user/keranjang';
import TierPicker from './TierPicker';

interface MenuTier {
    id: string;
    kode: string;
    is_half: boolean;
    berat_min: number;
    berat_max: number | null;
    harga_mentah: number;
    harga_matang: number;
    cashback: number;
}

interface MenuVariant {
    id: string;
    label: string;
    harga: number;
}

interface MenuItem {
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    menu_type: 'timbang_hidup' | 'eceran';
    sub_type:
        | 'paket_pass'
        | 'paket_nasi_box'
        | 'babi_adat'
        | 'saksang'
        | 'panggang'
        | 'sop_tulang'
        | null;
    min_price: number | null;
    is_bundle?: boolean;
    bundle_desc?: string | null;
    free_ongkir_km?: number | null;
    tiers: MenuTier[];
    variants: MenuVariant[];
    category?: {
        type: CategoryType | null;
    } | null;
    babi_mentah_price?: number | null;
    babi_matang_price?: number | null;
}

interface AddToCartSheetProps {
    isOpen: boolean;
    item: MenuItem | null;
    onClose: () => void;
    initialVariantId?: string | null;
    initialQuantity?: number | null;
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

const SACRIFICE_PERCENTS = [25, 50, 75, 100] as const;

const SACRIFICE_PERCENT_OPTIONS = SACRIFICE_PERCENTS.map((percent) => ({
    value: String(percent),
    label: `${percent}%`,
}));

function formatCurrency(value: number | null): string {
    if (value === null) {
        return 'Harga menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatKg(value: number): string {
    return `${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(value)} kg`;
}

function formatTierRange(tier: MenuTier): string {
    if (tier.berat_max === null) {
        return `${formatKg(tier.berat_min)} ke atas`;
    }

    return `${formatKg(tier.berat_min)} - ${formatKg(tier.berat_max)}`;
}

function formatTierPrice(value: number | null): string {
    if (value === null) {
        return 'Harga menyusul';
    }

    return `${formatCurrency(value)} / kg`;
}

function getDefaultKondisiProduk(item: MenuItem | null): KondisiValue {
    if (!item) {
        return 'mentah';
    }

    if (item.menu_type === 'eceran' && item.sub_type === 'babi_adat') {
        return 'mentah';
    }

    if (item.menu_type === 'eceran') {
        return 'satuan';
    }

    return 'mentah';
}

function getTierQuantityBounds(
    tier: MenuTier | null,
): { min: number; max: number | null } | null {
    if (!tier) {
        return null;
    }

    const min = Math.max(1, Math.ceil(Number(tier.berat_min)));
    const max = tier.berat_max === null ? null : Math.floor(tier.berat_max);

    return { min, max };
}

function clampQuantityToBounds(
    value: number,
    bounds: { min: number; max: number | null },
): number {
    const clampedMinimum = Math.max(bounds.min, value);

    if (bounds.max === null) {
        return Math.round(clampedMinimum);
    }

    return Math.round(Math.min(bounds.max, clampedMinimum));
}

function buildSummaryLines(params: {
    item: MenuItem;
    tier: MenuTier | null;
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
        <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
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
        <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
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
        <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
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
                        onClick={() => onChange(Math.max(minValue, value - 1))}
                        disabled={value <= minValue}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                        <Minus className="size-4" />
                    </button>
                    <span className="min-w-16 px-2 text-center text-sm font-semibold text-text">
                        {formatKg(value)}
                    </span>
                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                clampQuantityToBounds(value + 1, {
                                    min: minValue,
                                    max: maxValue,
                                }),
                            )
                        }
                        disabled={maxValue !== null && value >= maxValue}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default function AddToCartSheet({
    isOpen,
    item,
    onClose,
    initialVariantId = null,
    initialQuantity = null,
}: AddToCartSheetProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );
    const [kondisiProduk, setKondisiProduk] = useState<KondisiValue | ''>(
        'mentah',
    );
    const [adatType, setAdatType] = useState<string>('');
    const [adatFlow, setAdatFlow] = useState<TimbangAdatFlow>('');
    const [selectedBatakParts, setSelectedBatakParts] = useState<BatakPart[]>(
        [],
    );
    const [selectedNiasParts, setSelectedNiasParts] = useState<NiasPart[]>([]);
    const [saksangPercent, setSaksangPercent] = useState<number>(25);
    const [panggangPercent, setPanggangPercent] = useState<number>(75);
    const [remainderText, setRemainderText] = useState<string>('');
    const [legacyNotes, setLegacyNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!isOpen || !item) {
            return;
        }

        const resetTimer = window.setTimeout(() => {
            setQuantity(initialQuantity ?? 1);
            setSelectedTierId(null);
            setSelectedVariantId(
                initialVariantId !== null && initialVariantId !== undefined
                    ? initialVariantId
                    : (item.variants[0]?.id ?? null),
            );
            setKondisiProduk(getDefaultKondisiProduk(item));
            setAdatType('');
            setAdatFlow('');
            setSelectedBatakParts([]);
            setSelectedNiasParts([]);
            setSaksangPercent(25);
            setPanggangPercent(75);
            setRemainderText('');
            setLegacyNotes('');
        }, 0);

        return () => {
            window.clearTimeout(resetTimer);
        };
    }, [initialQuantity, initialVariantId, isOpen, item]);

    const selectedTier = useMemo(() => {
        if (!item || item.menu_type !== 'timbang_hidup' || !selectedTierId) {
            return null;
        }

        return item.tiers.find((tier) => tier.id === selectedTierId) ?? null;
    }, [item, selectedTierId]);

    const selectedTierQuantityBounds = useMemo(
        () => getTierQuantityBounds(selectedTier),
        [selectedTier],
    );

    const shouldShowAdatOptions = useMemo(() => {
        return Boolean(selectedTier && !selectedTier.is_half);
    }, [selectedTier]);

    const batakTotalPercent = saksangPercent + panggangPercent;

    const shouldShowBatakRemainderInput =
        adatFlow === 'batak' && batakTotalPercent < 100;

    const isBatakTotalOverLimit =
        adatFlow === 'batak' && batakTotalPercent > 100;

    const isAdatSelectionComplete = useMemo(() => {
        if (!selectedTier || selectedTier.is_half) {
            return true;
        }

        if (adatFlow === 'batak') {
            if (batakTotalPercent > 100) {
                return false;
            }

            if (batakTotalPercent < 100) {
                return (
                    selectedBatakParts.length > 0 &&
                    remainderText.trim().length > 0
                );
            }

            return selectedBatakParts.length > 0;
        }

        if (adatFlow === 'nias') {
            return selectedNiasParts.length > 0;
        }

        if (adatFlow === 'tanpa_adat') {
            return remainderText.trim().length > 0;
        }

        return false;
    }, [
        adatFlow,
        batakTotalPercent,
        remainderText,
        selectedBatakParts,
        selectedNiasParts,
        selectedTier,
    ]);

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

    const kondisiOptions = useMemo(() => {
        if (!item) {
            return [];
        }

        if (item.menu_type === 'timbang_hidup') {
            return [
                { value: 'mentah', label: 'Mentah', emoji: '🥩' },
                { value: 'mateng', label: 'Matang', emoji: '🍳' },
            ];
        }

        if (item.menu_type === 'eceran' && item.sub_type === 'babi_adat') {
            // Babi adat sold as mentah/mateng
            return KONDISI_OPTIONS.olahan;
        }

        return KONDISI_OPTIONS.eceran;
    }, [item]);

    const selectedTierPrice = useMemo(() => {
        if (!item || item.menu_type !== 'timbang_hidup' || !selectedTier) {
            return null;
        }

        return kondisiProduk === 'mateng'
            ? selectedTier.harga_matang
            : selectedTier.harga_mentah;
    }, [item, kondisiProduk, selectedTier]);

    const displayedEceranPrice = useMemo(() => {
        if (!item || item.menu_type !== 'eceran') {
            return null;
        }

        if (item.sub_type === 'babi_adat') {
            if (kondisiProduk === 'mentah') {
                return item.babi_mentah_price ?? item.min_price ?? null;
            }

            if (kondisiProduk === 'mateng') {
                return item.babi_matang_price ?? item.min_price ?? null;
            }

            // no selection yet, prefer min_price
            return item.min_price ?? null;
        }

        return selectedVariant?.harga ?? item.min_price ?? null;
    }, [item, kondisiProduk, selectedVariant]);

    useEffect(() => {
        if (!item || item.menu_type !== 'timbang_hidup' || !selectedTier) {
            return;
        }

        const resetTimer = window.setTimeout(() => {
            if (selectedTierQuantityBounds) {
                setQuantity(selectedTierQuantityBounds.min);
            }

            setAdatFlow('');
            setAdatType('');
            setSelectedBatakParts([]);
            setSelectedNiasParts([]);
            setRemainderText('');
        }, 0);

        return () => {
            window.clearTimeout(resetTimer);
        };
    }, [item, selectedTier, selectedTierQuantityBounds]);

    const handleBatakToggle = (value: BatakPart): void => {
        setSelectedBatakParts((current) => {
            if (value === 'batak_lengkap') {
                return current.includes(value) ? [] : ['batak_lengkap'];
            }

            if (current.includes('batak_lengkap')) {
                return [value];
            }

            if (current.includes(value)) {
                return current.filter((entry) => entry !== value);
            }

            return [...current, value];
        });
    };

    const handleNiasToggle = (value: NiasPart): void => {
        setSelectedNiasParts((current) => {
            if (current[0] === value) {
                return [];
            }

            return [value];
        });
    };

    const handleSaksangChange = (percent: number): void => {
        setSaksangPercent(percent);
    };

    const handlePanggangChange = (percent: number): void => {
        setPanggangPercent(percent);
    };

    const summaryNotes = useMemo(() => {
        if (!item || item.menu_type !== 'timbang_hidup' || !selectedTier) {
            return legacyNotes.trim();
        }

        const estimatedTotal = Number(
            (selectedTierPrice === null
                ? selectedTier.harga_mentah
                : selectedTierPrice) * quantity,
        );

        if (adatFlow !== '') {
            return buildSummaryLines({
                item,
                tier: selectedTier,
                quantity,
                estimatedTotal,
                flow: adatFlow,
                batakParts: selectedBatakParts,
                niasParts: selectedNiasParts,
                saksangPercent,
                panggangPercent,
                remainderText: remainderText.trim(),
                notes: legacyNotes,
            });
        }

        return legacyNotes.trim();
    }, [
        adatFlow,
        item,
        legacyNotes,
        panggangPercent,
        remainderText,
        saksangPercent,
        selectedBatakParts,
        selectedNiasParts,
        selectedTier,
        selectedTierPrice,
        quantity,
    ]);

    const estimatedTierTotal =
        item?.menu_type === 'timbang_hidup' &&
        selectedTier &&
        selectedTierPrice !== null
            ? Number((selectedTierPrice * quantity).toFixed(2))
            : null;

    const submit = async (): Promise<void> => {
        if (!item || isSubmitting) {
            return;
        }

        if (item.menu_type === 'timbang_hidup' && !selectedTier) {
            return;
        }

        if (
            item.menu_type === 'timbang_hidup' &&
            selectedTier &&
            !selectedTier.is_half &&
            !isAdatSelectionComplete
        ) {
            return;
        }

        setIsSubmitting(true);

        const computedPortion =
            item.menu_type === 'timbang_hidup' && selectedTier
                ? selectedTier.is_half
                    ? 'setengah'
                    : 'utuh'
                : null;

        const payload = {
            menu_item_id: item.id,
            kondisi_produk:
                item.menu_type === 'timbang_hidup'
                    ? kondisiProduk || 'mentah'
                    : kondisiProduk || 'satuan',
            adat_type:
                item.menu_type === 'timbang_hidup' &&
                shouldShowAdatOptions &&
                adatFlow !== ''
                    ? adatFlow || null
                    : adatType || null,
            quantity,
            portion: computedPortion,
            notes: summaryNotes === '' ? null : summaryNotes,
        };

        router.post(keranjang.store(), payload, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                alertError('Gagal menambahkan ke keranjang', 'Error');
                console.error('Add to cart validation failed', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    if (!isOpen || !item) {
        return null;
    }

    const selectedSummaryLabel =
        item.menu_type === 'timbang_hidup' && !selectedTier
            ? 'Pilih range dulu'
            : item.menu_type === 'timbang_hidup'
              ? kondisiProduk === 'mateng'
                  ? 'Matang'
                  : 'Mentah'
              : 'Pilih kondisi';

    return (
        <div className="fixed inset-0 z-60">
            <button
                type="button"
                aria-label="Tutup"
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="absolute right-0 bottom-0 left-0 mx-auto w-full max-w-2xl rounded-t-[28px] border border-black/5 bg-[#f7f5ef] shadow-[0_-20px_60px_rgba(15,23,42,0.18)]">
                <div className="flex items-start justify-between gap-4 border-b border-black/5 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                            Tambah ke keranjang
                        </p>
                        <h3 className="mt-1 truncate text-lg font-semibold text-text sm:text-xl">
                            {item.name}
                        </h3>
                        <p className="mt-1 line-clamp-3 text-xs text-slate-500">
                            {item.description ||
                                'Lengkapi detail pesanan sebelum melanjutkan.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-slate-500 transition hover:text-text"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                    {item.menu_type === 'timbang_hidup' && (
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
                    )}

                    {item.menu_type === 'timbang_hidup' &&
                        item.tiers.length > 0 && (
                            <TierPicker
                                label="Pilih range berat"
                                helperText="Pilih range yang tersedia sebelum mengatur berat pesanan."
                                options={item.tiers.map((tier) => ({
                                    id: tier.id,
                                    title: formatTierRange(tier),
                                    description: `Kode ${tier.kode} — ${tier.is_half ? 'Setengah ekor' : 'Utuh / Satu ekor'}`,
                                    price: formatTierPrice(
                                        kondisiProduk === 'mateng'
                                            ? tier.harga_matang
                                            : tier.harga_mentah,
                                    ),
                                    meta:
                                        tier.berat_max !== null
                                            ? `${formatKg(tier.berat_min)}-${formatKg(tier.berat_max)}`
                                            : `${formatKg(tier.berat_min)}+`,
                                }))}
                                value={selectedTierId}
                                onChange={setSelectedTierId}
                            />
                        )}

                    {item.menu_type === 'timbang_hidup' &&
                        !selectedTier &&
                        item.tiers.length === 0 && (
                            <section className="rounded-[28px] border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                                Tier berat belum tersedia dari admin.
                            </section>
                        )}

                    {item.menu_type === 'timbang_hidup' && selectedTier && (
                        <div className="space-y-3">
                            <WeightAdjuster
                                value={quantity}
                                minValue={
                                    selectedTierQuantityBounds?.min ?? 0.5
                                }
                                maxValue={
                                    selectedTierQuantityBounds?.max ?? null
                                }
                                onChange={setQuantity}
                            />
                        </div>
                    )}

                    {item.menu_type === 'timbang_hidup' && !selectedTier && (
                        <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-text">
                                Pilih range terlebih dahulu untuk membuka
                                pengaturan kondisi.
                            </p>
                        </section>
                    )}

                    <section className="sticky top-0 z-20 rounded-[20px] border border-black/5 bg-white p-2 shadow-sm sm:rounded-[28px] sm:p-4">
                        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr] sm:items-start sm:gap-4">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.2em]">
                                    Ringkasan menu
                                </p>
                                {item.menu_type === 'timbang_hidup' &&
                                    selectedTier && (
                                        <div className="mt-1 block text-xs text-slate-500">
                                            Range kg dari admin untuk tier ini:{' '}
                                            {formatTierRange(selectedTier)}
                                        </div>
                                    )}
                                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                    <span className="hidden rounded-full bg-[#fbfaf6] px-3 py-1 font-medium text-text">
                                        {item.menu_type === 'timbang_hidup'
                                            ? 'Timbang hidup'
                                            : (item.sub_type?.replace(
                                                  '_',
                                                  ' ',
                                              ) ?? 'Eceran')}
                                    </span>
                                    <span className="hidden rounded-full bg-[#fbfaf6] px-3 py-1 font-medium text-text">
                                        {item.menu_type === 'timbang_hidup'
                                            ? `${item.tiers.length} Opsi`
                                            : `${item.variants.length} varian`}
                                    </span>
                                    {item.menu_type === 'timbang_hidup' && (
                                        <span className="hidden rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                                            Kondisi {selectedSummaryLabel}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl bg-[#fbfaf6] p-3 sm:p-4">
                                <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.2em]">
                                    {item.menu_type === 'timbang_hidup' &&
                                    selectedTier
                                        ? 'Estimasi harga'
                                        : 'Harga mulai'}
                                </p>
                                <p className="mt-1 text-base font-semibold text-primary sm:text-lg">
                                    {item.menu_type === 'timbang_hidup' &&
                                    selectedTier
                                        ? formatCurrency(estimatedTierTotal)
                                        : formatCurrency(displayedEceranPrice)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {item.menu_type === 'timbang_hidup' &&
                        selectedTier &&
                        shouldShowAdatOptions && (
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
                                        setAdatFlow(value as TimbangAdatFlow);
                                        setAdatType(value);
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
                                        onToggle={(value) =>
                                            handleBatakToggle(
                                                value as BatakPart,
                                            )
                                        }
                                        disableOthersWhenComplete
                                    />
                                )}

                                {adatFlow === 'nias' && (
                                    <OptionChips
                                        label="Detail Nias"
                                        helperText="Pilih satu wilayah adat saja."
                                        options={NIAS_PARTS}
                                        value={selectedNiasParts[0] ?? null}
                                        onChange={(value) =>
                                            handleNiasToggle(value as NiasPart)
                                        }
                                    />
                                )}

                                {adatFlow && (
                                    <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
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
                                                        <Select
                                                            label="Saksang %"
                                                            size="sm"
                                                            value={String(
                                                                saksangPercent,
                                                            )}
                                                            onChange={(value) =>
                                                                handleSaksangChange(
                                                                    Number(
                                                                        value,
                                                                    ),
                                                                )
                                                            }
                                                            options={
                                                                SACRIFICE_PERCENT_OPTIONS
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Select
                                                            label="Panggang %"
                                                            size="sm"
                                                            value={String(
                                                                panggangPercent,
                                                            )}
                                                            onChange={(value) =>
                                                                handlePanggangChange(
                                                                    Number(
                                                                        value,
                                                                    ),
                                                                )
                                                            }
                                                            options={
                                                                SACRIFICE_PERCENT_OPTIONS
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-600">
                                                    {isBatakTotalOverLimit ? (
                                                        <span className="font-medium text-red-600">
                                                            Total saksang dan
                                                            panggang melebihi
                                                            100%. Kurangi salah
                                                            satu persen.
                                                        </span>
                                                    ) : batakTotalPercent ===
                                                      100 ? (
                                                        <span>
                                                            Sisa daging sudah
                                                            habis dibagi. Sisa
                                                            lainnya tidak perlu
                                                            diisi.
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            Sisa daging: Saksang{' '}
                                                            {saksangPercent}%,
                                                            Panggang{' '}
                                                            {panggangPercent}%,
                                                            sisa lainnya wajib
                                                            diisi sebesar{' '}
                                                            {100 -
                                                                batakTotalPercent}
                                                            %.
                                                        </span>
                                                    )}
                                                </div>

                                                {shouldShowBatakRemainderInput && (
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                            Sisa lainnya *
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
                                                        Catatan tambahan
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
                                                        placeholder="Contoh: rebusan nias untuk keluarga"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {adatFlow === 'tanpa_adat' && (
                                            <div className="space-y-3">
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                    Tanpa adat, sisa daging
                                                    mengikuti catatan pesanan.
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                        Catatan sisa daging
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
                                                        placeholder="Contoh: semua dibagi rata"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}
                            </>
                        )}

                    {item.menu_type === 'timbang_hidup' &&
                        selectedTier &&
                        !shouldShowAdatOptions && (
                            <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                                <p className="text-sm font-medium text-text">
                                    Tier {selectedTier.kode} adalah setengah
                                    ekor, jadi opsi adat tidak ditampilkan.
                                </p>
                            </section>
                        )}

                    {/* Eceran subtype info cards */}
                    {item.menu_type === 'eceran' &&
                        item.sub_type === 'paket_pass' && (
                            <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                                <div className="mb-2">
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Isi Paket
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {item.bundle_desc}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-[#fbfaf6] p-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Harga
                                        </p>
                                        <p className="font-semibold text-primary">
                                            {formatCurrency(
                                                item.variants[0]?.harga ??
                                                    item.min_price,
                                            )}
                                        </p>
                                    </div>
                                    {item.free_ongkir_km ? (
                                        <div className="text-sm text-slate-500">
                                            🚚 Free ongkir {item.free_ongkir_km}{' '}
                                            km
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        )}

                    {item.menu_type === 'eceran' &&
                        item.sub_type === 'babi_adat' && (
                            <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                                <div className="mb-3">
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Kondisi produk
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-text">
                                        Pilih jenis penjualan untuk menu eceran
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {kondisiOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setKondisiProduk(
                                                    opt.value as KondisiValue,
                                                );
                                                setAdatType('');
                                            }}
                                            className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-semibold transition-all duration-150 ${
                                                kondisiProduk === opt.value
                                                    ? 'border-primary bg-primary text-white shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-secondary/60'
                                            }`}
                                        >
                                            <span>{opt.emoji}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                    <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                        <label
                            htmlFor="notes"
                            className="mb-2 block text-sm font-semibold text-text"
                        >
                            Catatan tambahan
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={legacyNotes}
                            onChange={(event) =>
                                setLegacyNotes(event.target.value)
                            }
                            rows={3}
                            className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-4 py-3 text-sm transition outline-none focus:border-primary/30"
                            placeholder="Contoh: potong kecil, kemasan terpisah"
                        />
                    </section>

                    {item.menu_type === 'eceran' && (
                        <section className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Qty
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-text">
                                        Atur jumlah pesanan
                                    </p>
                                </div>

                                <div className="flex items-center rounded-full border border-black/5 bg-[#fbfaf6] p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((prev) =>
                                                Math.max(1, prev - 1),
                                            )
                                        }
                                        disabled={quantity <= 1}
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="min-w-16 px-2 text-center text-sm font-semibold text-text">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((prev) => prev + 1)
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#fbfaf6] px-3 py-2 text-xs text-slate-500">
                                <Check className="h-4 w-4 text-emerald-600" />
                                Jumlah dapat disesuaikan sebelum menyimpan
                                pesanan.
                            </div>
                        </section>
                    )}

                    <div className="sticky bottom-0 -mx-4 border-t border-black/5 bg-[#f7f5ef] px-4 py-4 sm:-mx-6 sm:px-6">
                        <button
                            type="button"
                            onClick={submit}
                            disabled={
                                isSubmitting ||
                                (item.menu_type === 'timbang_hidup' &&
                                    !selectedTier) ||
                                Boolean(
                                    item.menu_type === 'timbang_hidup' &&
                                    selectedTier &&
                                    !selectedTier.is_half &&
                                    !isAdatSelectionComplete,
                                )
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {isSubmitting
                                ? 'Menyimpan...'
                                : 'Tambah ke keranjang'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
