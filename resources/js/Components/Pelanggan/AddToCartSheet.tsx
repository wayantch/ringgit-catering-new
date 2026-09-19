import { router } from '@inertiajs/react';
import { Check, Minus, Plus, ShoppingCart, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Select from '@/Components/UI/Select';
import { KONDISI_OPTIONS } from '@/constants/kondisiProduk';
import type { CategoryType, KondisiValue } from '@/constants/kondisiProduk';
import { alertError } from '@/lib/alert';
import { checkout } from '@/routes/user';
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

type SubmitAction = 'cart' | 'checkout';
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

function resolveImageSrc(image: string | null): string | null {
    if (!image) {
        return null;
    }

    if (
        image.startsWith('http://') ||
        image.startsWith('https://') ||
        image.startsWith('/')
    ) {
        return image;
    }

    return `/storage/${image}`;
}

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

/**
 * One labelled group of controls. Flat by design: the sheet body separates
 * fields with hairlines instead of stacking cards inside cards.
 */
function Field({
    step,
    label,
    hint,
    children,
}: {
    step?: number;
    label: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <section className="py-4 first:pt-0 last:pb-0">
            <div className="mb-2.5 flex items-baseline gap-2">
                {step !== undefined && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {step}
                    </span>
                )}
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-text">{label}</h4>
                    {hint && (
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            {hint}
                        </p>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
}

function OptionChips({
    step,
    label,
    helperText,
    options,
    value,
    onChange,
}: {
    step?: number;
    label: string;
    helperText?: string;
    options: Array<{ value: string; label: string }>;
    value: string | null;
    onChange: (value: string) => void;
}) {
    return (
        <Field step={step} label={label} hint={helperText}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {options.map((option) => {
                    const active = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                                active
                                    ? 'border-primary bg-primary font-semibold text-white'
                                    : 'border-slate-200 text-slate-600 hover:border-primary/40'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </Field>
    );
}

function MultiSelectChips({
    step,
    label,
    helperText,
    options,
    value,
    onToggle,
    disableOthersWhenComplete,
}: {
    step?: number;
    label: string;
    helperText?: string;
    options: Array<{ value: string; label: string }>;
    value: string[];
    onToggle: (option: string) => void;
    disableOthersWhenComplete?: boolean;
}) {
    const isComplete = value.includes('batak_lengkap');

    return (
        <Field step={step} label={label} hint={helperText}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                active
                                    ? 'border-primary bg-primary font-semibold text-white'
                                    : 'border-slate-200 text-slate-600 hover:border-primary/40'
                            }`}
                        >
                            {active && <Check className="size-3.5" />}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </Field>
    );
}

function WeightAdjuster({
    step,
    value,
    minValue,
    maxValue,
    onChange,
}: {
    step?: number;
    value: number;
    minValue: number;
    maxValue: number | null;
    onChange: (value: number) => void;
}) {
    return (
        <Field
            step={step}
            label="Berat pesanan"
            hint={
                maxValue !== null
                    ? `Bisa diatur ${formatKg(minValue)} sampai ${formatKg(maxValue)}.`
                    : `Minimal ${formatKg(minValue)}.`
            }
        >
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Jumlah</span>

                <div className="flex items-center rounded-xl border border-slate-200 p-1">
                    <button
                        type="button"
                        onClick={() => onChange(Math.max(minValue, value - 1))}
                        disabled={value <= minValue}
                        className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
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
                        className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>
        </Field>
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
    const [submittingAction, setSubmittingAction] =
        useState<SubmitAction | null>(null);

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

    // Escape closes the overlay, and the page behind it must not scroll while
    // the sheet or modal is open.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

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

    const thumbnailSrc = item ? resolveImageSrc(item.image) : null;

    // Steps are numbered by what is actually on screen, so hidden sections
    // never leave a gap in the sequence.
    const stepNumbers = useMemo<Record<string, number>>(() => {
        if (!item) {
            return {};
        }

        const order: string[] = [];

        if (item.menu_type === 'timbang_hidup') {
            order.push('kondisi');

            if (item.tiers.length > 0) {
                order.push('tier');
            }

            if (selectedTier) {
                order.push('berat');

                if (shouldShowAdatOptions) {
                    order.push('adat');

                    if (adatFlow === 'batak' || adatFlow === 'nias') {
                        order.push('adatDetail');
                    }

                    if (adatFlow) {
                        order.push('sisa');
                    }
                }
            }
        }

        if (item.menu_type === 'eceran' && item.sub_type === 'babi_adat') {
            order.push('kondisiEceran');
        }

        order.push('catatan');

        return Object.fromEntries(order.map((key, index) => [key, index + 1]));
    }, [adatFlow, item, selectedTier, shouldShowAdatOptions]);

    const priceLabel =
        item?.menu_type === 'timbang_hidup' && selectedTier
            ? 'Estimasi total'
            : 'Harga';

    const priceValue =
        item?.menu_type === 'timbang_hidup'
            ? selectedTier
                ? formatCurrency(estimatedTierTotal)
                : null
            : formatCurrency(displayedEceranPrice);

    /** The one thing the customer still has to do before checking out. */
    const blockingStep = useMemo<string | null>(() => {
        if (!item || item.menu_type !== 'timbang_hidup') {
            return null;
        }

        if (!selectedTier) {
            return 'Pilih range berat dulu';
        }

        if (selectedTier.is_half || isAdatSelectionComplete) {
            return null;
        }

        if (!adatFlow) {
            return 'Pilih adat dulu';
        }

        if (adatFlow === 'batak' && selectedBatakParts.length === 0) {
            return 'Pilih detail Batak';
        }

        if (adatFlow === 'nias' && selectedNiasParts.length === 0) {
            return 'Pilih wilayah Nias';
        }

        if (isBatakTotalOverLimit) {
            return 'Saksang + panggang melebihi 100%';
        }

        return 'Lengkapi pembagian sisa daging';
    }, [
        adatFlow,
        isAdatSelectionComplete,
        isBatakTotalOverLimit,
        item,
        selectedBatakParts.length,
        selectedNiasParts.length,
        selectedTier,
    ]);

    const isSubmitting = submittingAction !== null;

    const isReadyToSubmit =
        item !== null &&
        (item.menu_type !== 'timbang_hidup' ||
            (selectedTier !== null &&
                (selectedTier.is_half || isAdatSelectionComplete)));

    /**
     * Both footer actions store the row the same way. "checkout" then walks
     * straight on to the checkout page so the cart step can be skipped.
     */
    const isDisabled = isSubmitting || !isReadyToSubmit;

    const submit = async (action: SubmitAction): Promise<void> => {
        if (!item || isSubmitting || !isReadyToSubmit) {
            return;
        }

        setSubmittingAction(action);

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
                if (action === 'checkout') {
                    router.visit(checkout());

                    return;
                }

                onClose();
            },
            onError: (errors) => {
                alertError('Gagal menambahkan ke keranjang', 'Error');
                console.error('Add to cart validation failed', errors);
            },
            onFinish: () => {
                setSubmittingAction(null);
            },
        });
    };

    if (!isOpen || !item) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Atur pesanan ${item.name}`}
            className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6"
        >
            <button
                type="button"
                aria-label="Tutup"
                className="absolute inset-0 bg-slate-900/50 sm:bg-slate-900/40"
                onClick={onClose}
            />

            {/* Mobile: sheet anchored to the bottom edge. From `sm`: a centred
                dialog. Header and footer stay put; only the body scrolls. */}
            <div className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.18)] sm:max-h-[85svh] sm:max-w-xl sm:rounded-3xl sm:shadow-2xl lg:max-w-2xl">
                <div className="shrink-0 border-b border-slate-100">
                    {/* Grab affordance, mobile only. */}
                    <div className="flex justify-center pt-2.5 sm:hidden">
                        <span
                            aria-hidden="true"
                            className="h-1 w-10 rounded-full bg-slate-300"
                        />
                    </div>

                    <div className="flex items-start gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4">
                        {/* The thumbnail is desktop-only: on mobile the vertical
                            space is better spent on the options themselves. */}
                        {thumbnailSrc && (
                            <img
                                src={thumbnailSrc}
                                alt=""
                                className="hidden size-16 shrink-0 rounded-xl object-cover sm:block"
                            />
                        )}

                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-semibold text-text sm:text-lg">
                                {item.name}
                            </h3>
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 sm:text-sm">
                                {item.description ||
                                    'Lengkapi detail pesanan sebelum melanjutkan.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Tutup"
                            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-text"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto px-4 sm:px-6">
                    {item.menu_type === 'timbang_hidup' && (
                        <OptionChips
                            step={stepNumbers.kondisi}
                            label="Kondisi daging"
                            helperText="Mentah atau sudah dimasak."
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
                                step={stepNumbers.tier}
                                label="Range berat"
                                helperText="Harga mengikuti range yang kamu pilih."
                                options={item.tiers.map((tier) => ({
                                    id: tier.id,
                                    title: formatTierRange(tier),
                                    description: `Kode ${tier.kode} — ${tier.is_half ? 'Setengah ekor' : 'Utuh / Satu ekor'}`,
                                    price: formatTierPrice(
                                        kondisiProduk === 'mateng'
                                            ? tier.harga_matang
                                            : tier.harga_mentah,
                                    ),
                                }))}
                                value={selectedTierId}
                                onChange={setSelectedTierId}
                            />
                        )}

                    {item.menu_type === 'timbang_hidup' &&
                        !selectedTier &&
                        item.tiers.length === 0 && (
                            <p className="py-4 text-sm text-slate-500">
                                Range berat untuk menu ini belum tersedia.
                                Hubungi kami untuk memesan.
                            </p>
                        )}

                    {item.menu_type === 'timbang_hidup' && selectedTier && (
                        <div className="space-y-3">
                            <WeightAdjuster
                                step={stepNumbers.berat}
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
                        <p className="py-4 text-sm text-slate-500">
                            Pilih range berat dulu untuk membuka pengaturan
                            berikutnya.
                        </p>
                    )}

                    {item.menu_type === 'timbang_hidup' &&
                        selectedTier &&
                        shouldShowAdatOptions && (
                            <>
                                <OptionChips
                                    step={stepNumbers.adat}
                                    label="Adat"
                                    helperText="Menentukan cara daging dibagi."
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
                                        step={stepNumbers.adatDetail}
                                        label="Bagian Batak"
                                        helperText="Pilih satu atau beberapa. Memilih Lengkap menonaktifkan sisanya."
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
                                        step={stepNumbers.adatDetail}
                                        label="Wilayah Nias"
                                        helperText="Pilih satu wilayah."
                                        options={NIAS_PARTS}
                                        value={selectedNiasParts[0] ?? null}
                                        onChange={(value) =>
                                            handleNiasToggle(value as NiasPart)
                                        }
                                    />
                                )}

                                {adatFlow && (
                                    <Field
                                        step={stepNumbers.sisa}
                                        label="Pembagian sisa daging"
                                        hint="Bagian yang tidak terpakai adat mau diolah jadi apa."
                                    >
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
                                    </Field>
                                )}
                            </>
                        )}

                    {item.menu_type === 'timbang_hidup' &&
                        selectedTier &&
                        !shouldShowAdatOptions && (
                            <p className="py-4 text-sm text-slate-500">
                                Range ini setengah ekor, jadi tidak perlu
                                memilih adat.
                            </p>
                        )}

                    {/* Eceran subtype info cards */}
                    {item.menu_type === 'eceran' &&
                        item.sub_type === 'paket_pass' && (
                            <Field
                                label="Isi paket"
                                hint={item.bundle_desc ?? undefined}
                            >
                                {item.free_ongkir_km ? (
                                    <p className="text-sm text-slate-500">
                                        Gratis ongkir sampai{' '}
                                        {item.free_ongkir_km} km.
                                    </p>
                                ) : null}
                            </Field>
                        )}

                    {item.menu_type === 'eceran' &&
                        item.sub_type === 'babi_adat' && (
                            <Field
                                step={stepNumbers.kondisiEceran}
                                label="Kondisi produk"
                                hint="Pilih jenis penjualan."
                            >
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
                                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                                                kondisiProduk === opt.value
                                                    ? 'border-primary bg-primary font-semibold text-white'
                                                    : 'border-slate-200 text-slate-600 hover:border-primary/40'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        )}

                    <Field
                        step={stepNumbers.catatan}
                        label="Catatan tambahan"
                        hint="Opsional."
                    >
                        <textarea
                            id="notes"
                            name="notes"
                            value={legacyNotes}
                            onChange={(event) =>
                                setLegacyNotes(event.target.value)
                            }
                            rows={2}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                            placeholder="Contoh: potong kecil, kemasan terpisah"
                        />
                    </Field>

                    {item.menu_type === 'eceran' && (
                        <Field label="Jumlah">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">
                                    Porsi
                                </span>

                                <div className="flex items-center rounded-xl border border-slate-200 p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((prev) =>
                                                Math.max(1, prev - 1),
                                            )
                                        }
                                        disabled={quantity <= 1}
                                        className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
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
                                        className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </Field>
                    )}
                </div>

                <div className="shrink-0 space-y-3 border-t border-slate-100 bg-white px-4 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4 sm:pb-4">
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500">
                                {priceLabel}
                            </p>
                            <p className="truncate text-lg font-semibold text-text">
                                {priceValue ?? 'Belum dihitung'}
                            </p>
                        </div>

                        {blockingStep && (
                            <p className="shrink-0 text-right text-xs font-medium text-amber-600">
                                {blockingStep}
                            </p>
                        )}
                    </div>

                    <div className="flex items-stretch gap-2">
                        <button
                            type="button"
                            onClick={() => submit('cart')}
                            disabled={isDisabled}
                            aria-label="Tambah ke keranjang"
                            title="Tambah ke keranjang"
                            className="inline-flex w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-white text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                        >
                            {submittingAction === 'cart' ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                            ) : (
                                <ShoppingCart className="h-5 w-5" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => submit('checkout')}
                            disabled={isDisabled}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {submittingAction === 'checkout' ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" />
                                    Beli Sekarang
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
