import { ArrowLeft, ImageIcon, Info, Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Select from '@/Components/UI/Select';
import TierTable from './TierTable';
import type { TierRow } from './TierTable';
import TypeSelector from './TypeSelector';
import VariantList from './VariantList';
import type { VariantRow } from './VariantList';

type MenuType = 'timbang_hidup' | 'eceran';
type SubType = 'paket_pass' | 'paket_nasi_box' | 'babi_adat';

interface SubsidyRow {
    min_kg: string;
    max_kg: string;
    max_subsidi: string;
}

interface MenuTierData {
    kode: 'A' | 'B' | 'C';
    is_half: boolean;
    berat_min: string | number | null;
    berat_max: string | number | null;
    harga_mentah: string | number | null;
    harga_matang: string | number | null;
    cashback: string | number | null;
}

interface MenuVariantData {
    label: string;
    harga: string | number | null;
}

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    image_url?: string | null;
    menu_type: MenuType;
    sub_type: SubType | null;
    is_bundle: boolean;
    bundle_desc: string | null;
    babi_mentah_price?: string | number | null;
    babi_matang_price?: string | number | null;
    free_ongkir_km: number | null;
    ongkir_subsidi: Array<{
        min_kg: string | number | null;
        max_kg: string | number | null;
        max_subsidi: string | number | null;
    }> | null;
    is_available: boolean;
    sort_order: number;
    tiers?: MenuTierData[];
    variants?: MenuVariantData[];
}

interface MenuFormProps {
    mode: 'create' | 'edit';
    item?: MenuItem;
    onSubmit: (data: FormData) => void;
    onCancel: () => void;
    processing: boolean;
    errors: Record<string, string>;
}

const DEFAULT_TIERS: TierRow[] = [
    {
        kode: 'A',
        is_half: false,
        berat_min: '0',
        berat_max: '13',
        harga_mentah: '100000',
        harga_matang: '125000',
        cashback: '50000',
    },
    {
        kode: 'A',
        is_half: false,
        berat_min: '14',
        berat_max: '19',
        harga_mentah: '95000',
        harga_matang: '120000',
        cashback: '50000',
    },
    {
        kode: 'A',
        is_half: false,
        berat_min: '20',
        berat_max: '24',
        harga_mentah: '93000',
        harga_matang: '115000',
        cashback: '50000',
    },
    {
        kode: 'B',
        is_half: false,
        berat_min: '25',
        berat_max: '29',
        harga_mentah: '90000',
        harga_matang: '110000',
        cashback: '75000',
    },
    {
        kode: 'B',
        is_half: false,
        berat_min: '30',
        berat_max: '49',
        harga_mentah: '88000',
        harga_matang: '108000',
        cashback: '75000',
    },
    {
        kode: 'C',
        is_half: false,
        berat_min: '50',
        berat_max: '',
        harga_mentah: '85000',
        harga_matang: '100000',
        cashback: '100000',
    },
    {
        kode: 'A',
        is_half: true,
        berat_min: '10',
        berat_max: '12',
        harga_mentah: '98000',
        harga_matang: '120000',
        cashback: '50000',
    },
    {
        kode: 'A',
        is_half: true,
        berat_min: '13',
        berat_max: '15',
        harga_mentah: '95000',
        harga_matang: '115000',
        cashback: '50000',
    },
];

const DEFAULT_ONGKIR_ROWS: SubsidyRow[] = [
    { min_kg: '25', max_kg: '40', max_subsidi: '50000' },
    { min_kg: '41', max_kg: '', max_subsidi: '100000' },
];

const SUB_TYPE_OPTIONS = [
    {
        value: 'paket_pass',
        label: 'Paket PASS',
        description: 'Bundling fisik, bisa ada free ongkir',
    },
    {
        value: 'paket_nasi_box',
        label: 'Paket Napass',
        description: 'Paket Napass per porsi, harga satuan',
    },
    {
        value: 'babi_adat',
        label: 'Babi Adat',
        description: 'Fixed price all-in termasuk jeroan, adat Batak/Nias',
    },
];

const FIXED_PRICE_SUB_TYPES = [
    'paket_pass',
    'paket_nasi_box',
    'babi_adat',
] as const;

function toStringValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value);
}

function appendValue(
    formData: FormData,
    key: string,
    value: string | number | boolean | null | undefined,
): void {
    if (value === null || value === undefined || value === '') {
        return;
    }

    formData.append(key, String(value));
}

function FieldLabel({
    children,
    required,
    htmlFor,
}: {
    children: React.ReactNode;
    required?: boolean;
    htmlFor?: string;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-slate-700"
        >
            {children}
            {required && <span className="ml-1 text-red-400">*</span>}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <Info className="size-3 shrink-0" />
            {children}
        </p>
    );
}

function Input({
    error,
    className = '',
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
        />
    );
}

function Textarea({
    error,
    className = '',
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
    return (
        <textarea
            {...props}
            className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
        />
    );
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
            <div className="mb-5">
                <h3 className="text-base font-semibold tracking-tight text-text">
                    {title}
                </h3>
                {description && (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

export default function MenuForm({
    mode,
    item,
    onSubmit,
    onCancel,
    processing,
    errors,
}: MenuFormProps) {
    const [menuType, setMenuType] = useState<MenuType | ''>(
        mode === 'edit' ? (item?.menu_type ?? '') : '',
    );
    const [name, setName] = useState(item?.name ?? '');
    const [description, setDescription] = useState(item?.description ?? '');
    const [sortOrder, setSortOrder] = useState(
        toStringValue(item?.sort_order ?? 0),
    );
    const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
    const [subType, setSubType] = useState<SubType>(
        item?.sub_type ?? 'paket_pass',
    );
    const [bundleDesc, setBundleDesc] = useState(item?.bundle_desc ?? '');
    const [freeOngkirEnabled, setFreeOngkirEnabled] = useState(
        Boolean(item?.free_ongkir_km),
    );
    const [freeOngkirKm, setFreeOngkirKm] = useState(
        toStringValue(item?.free_ongkir_km),
    );
    const [tiers, setTiers] = useState<TierRow[]>(
        item?.tiers?.length
            ? item.tiers.map((tier) => ({
                  kode: tier.kode,
                  is_half: tier.is_half,
                  berat_min: toStringValue(tier.berat_min),
                  berat_max: toStringValue(tier.berat_max),
                  harga_mentah: toStringValue(tier.harga_mentah),
                  harga_matang: toStringValue(tier.harga_matang),
                  cashback: toStringValue(tier.cashback),
              }))
            : DEFAULT_TIERS,
    );
    const [variants, setVariants] = useState<VariantRow[]>(
        item?.variants?.length
            ? item.variants.map((variant) => ({
                  label: variant.label,
                  harga: toStringValue(variant.harga),
              }))
            : [{ label: '', harga: '' }],
    );
    const [packagePrice, setPackagePrice] = useState(
        toStringValue(item?.variants?.[0]?.harga ?? ''),
    );
    const [babiMentahPrice, setBabiMentahPrice] = useState(
        toStringValue(item?.babi_mentah_price ?? ''),
    );
    const [babiMatangPrice, setBabiMatangPrice] = useState(
        toStringValue(item?.babi_matang_price ?? ''),
    );
    const [subsidyEnabled, setSubsidyEnabled] = useState(
        Boolean(item?.ongkir_subsidi?.length),
    );
    const [subsidyRows, setSubsidyRows] = useState<SubsidyRow[]>(
        item?.ongkir_subsidi?.length
            ? item.ongkir_subsidi.map((row) => ({
                  min_kg: toStringValue(row.min_kg),
                  max_kg: toStringValue(row.max_kg),
                  max_subsidi: toStringValue(row.max_subsidi),
              }))
            : DEFAULT_ONGKIR_ROWS,
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        item?.image_url ?? null,
    );
    const imagePreviewUrlRef = useRef<string | null>(null);
    const imageInputId = 'menu-image-upload';

    const isCreate = mode === 'create';
    const activeMenuType = menuType || item?.menu_type || '';
    const isFixedPricePackage =
        activeMenuType === 'eceran' &&
        FIXED_PRICE_SUB_TYPES.includes(
            subType as (typeof FIXED_PRICE_SUB_TYPES)[number],
        );
    useEffect(() => {
        return () => {
            if (imagePreviewUrlRef.current) {
                URL.revokeObjectURL(imagePreviewUrlRef.current);
            }
        };
    }, []);

    function selectMenuType(nextType: MenuType): void {
        setMenuType(nextType);

        if (nextType === 'timbang_hidup') {
            setTiers(DEFAULT_TIERS);
            setSubsidyEnabled(false);
            setSubsidyRows(DEFAULT_ONGKIR_ROWS);

            return;
        }

        setSubType('paket_pass');
        setVariants([{ label: '', harga: '' }]);
    }

    function updateTier(
        index: number,
        field: keyof TierRow,
        value: string | boolean,
    ): void {
        setTiers((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row,
            ),
        );
    }

    function updateVariant(
        index: number,
        field: keyof VariantRow,
        value: string,
    ): void {
        setVariants((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row,
            ),
        );
    }

    function addVariant(): void {
        setVariants((current) => [...current, { label: '', harga: '' }]);
    }

    function removeVariant(index: number): void {
        setVariants((current) =>
            current.length === 1
                ? current
                : current.filter((_, rowIndex) => rowIndex !== index),
        );
    }

    function updateSubsidy(
        index: number,
        field: keyof SubsidyRow,
        value: string,
    ): void {
        setSubsidyRows((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row,
            ),
        );
    }

    function addSubsidyRow(): void {
        setSubsidyRows((current) => [
            ...current,
            { min_kg: '', max_kg: '', max_subsidi: '' },
        ]);
    }

    function removeSubsidyRow(index: number): void {
        setSubsidyRows((current) =>
            current.length === 1
                ? current
                : current.filter((_, rowIndex) => rowIndex !== index),
        );
    }

    function handleImageChange(file: File | null): void {
        if (imagePreviewUrlRef.current) {
            URL.revokeObjectURL(imagePreviewUrlRef.current);
            imagePreviewUrlRef.current = null;
        }

        setImageFile(file);

        if (file) {
            const preview = URL.createObjectURL(file);
            imagePreviewUrlRef.current = preview;
            setImagePreview(preview);
        } else if (item?.image) {
            setImagePreview(item.image_url ?? null);
        } else {
            setImagePreview(null);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!activeMenuType) {
            return;
        }

        const formData = new FormData();
        const resolvedName = name;

        appendValue(formData, 'name', resolvedName);
        appendValue(formData, 'menu_type', activeMenuType);
        appendValue(
            formData,
            'sub_type',
            activeMenuType === 'eceran' ? subType : '',
        );
        appendValue(formData, 'description', description);
        appendValue(formData, 'is_available', isAvailable ? '1' : '0');
        appendValue(formData, 'sort_order', sortOrder || '0');
        appendValue(formData, 'is_bundle', isFixedPricePackage ? '1' : '0');
        appendValue(
            formData,
            'bundle_desc',
            isFixedPricePackage ? bundleDesc : '',
        );
        appendValue(
            formData,
            'free_ongkir_km',
            isFixedPricePackage && freeOngkirEnabled ? freeOngkirKm : '',
        );

        if (activeMenuType === 'timbang_hidup') {
            tiers.forEach((tier, index) => {
                appendValue(formData, `tiers[${index}][kode]`, tier.kode);
                appendValue(
                    formData,
                    `tiers[${index}][is_half]`,
                    tier.is_half ? '1' : '0',
                );
                appendValue(
                    formData,
                    `tiers[${index}][berat_min]`,
                    tier.berat_min,
                );
                appendValue(
                    formData,
                    `tiers[${index}][berat_max]`,
                    tier.berat_max,
                );
                appendValue(
                    formData,
                    `tiers[${index}][harga_mentah]`,
                    tier.harga_mentah,
                );
                appendValue(
                    formData,
                    `tiers[${index}][harga_matang]`,
                    tier.harga_matang,
                );
                appendValue(
                    formData,
                    `tiers[${index}][cashback]`,
                    tier.cashback,
                );
            });

            if (subsidyEnabled) {
                subsidyRows.forEach((row, index) => {
                    appendValue(
                        formData,
                        `ongkir_subsidi[${index}][min_kg]`,
                        row.min_kg,
                    );
                    appendValue(
                        formData,
                        `ongkir_subsidi[${index}][max_kg]`,
                        row.max_kg,
                    );
                    appendValue(
                        formData,
                        `ongkir_subsidi[${index}][max_subsidi]`,
                        row.max_subsidi,
                    );
                });
            }
        } else if (isFixedPricePackage) {
            if (subType === 'babi_adat') {
                appendValue(formData, 'babi_mentah_price', babiMentahPrice);
                appendValue(formData, 'babi_matang_price', babiMatangPrice);
            } else {
                appendValue(
                    formData,
                    'variants[0][label]',
                    resolvedName || 'Pass 1',
                );
                appendValue(formData, 'variants[0][harga]', packagePrice);
            }
        } else {
            variants.forEach((variant, index) => {
                appendValue(
                    formData,
                    `variants[${index}][label]`,
                    variant.label,
                );
                appendValue(
                    formData,
                    `variants[${index}][harga]`,
                    variant.harga,
                );
            });
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        onSubmit(formData);
    }

    if (isCreate && !menuType) {
        return (
            <TypeSelector
                value={menuType || undefined}
                onSelect={selectMenuType}
            />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-linear-to-br from-white via-[#fcfcfa] to-primary/5 p-5 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                            Langkah 2
                        </p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">
                            {isCreate
                                ? 'Buat Menu Baru'
                                : `Edit Menu: ${item?.name ?? ''}`}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </button>
                </div>
            </div>

            <Section
                title="Informasi Dasar"
                description="Isi data inti menu. Menu sekarang diatur lewat tipe dan sub-tipe, tanpa kategori."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <FieldLabel htmlFor="name" required>
                            Nama Menu
                        </FieldLabel>
                        <Input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={
                                menuType === 'eceran'
                                    ? 'Contoh: Paket Napass Babi Panggang'
                                    : 'Contoh: Saksang Special'
                            }
                            error={errors.name}
                        />
                        <FieldError message={errors.name} />
                    </div>

                    {activeMenuType === 'eceran' && (
                        <div>
                            <FieldLabel htmlFor="sub_type" required>
                                Sub-tipe
                            </FieldLabel>
                            <Select
                                id="sub_type"
                                value={subType}
                                onChange={(value) =>
                                    setSubType(value as SubType)
                                }
                                options={SUB_TYPE_OPTIONS}
                            />
                            <FieldError message={errors.sub_type} />
                        </div>
                    )}

                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600 md:col-span-2">
                        {activeMenuType === 'eceran'
                            ? ' Pilih sub-tipe di atas untuk menentukan alur harga eceran.'
                            : ' Gunakan range tier untuk menentukan alur harga timbang hidup.'}
                    </div>

                    <div>
                        <FieldLabel htmlFor="sort_order">Sort Order</FieldLabel>
                        <Input
                            id="sort_order"
                            type="number"
                            min="0"
                            value={sortOrder}
                            onChange={(event) =>
                                setSortOrder(event.target.value)
                            }
                            placeholder="0"
                            error={errors.sort_order}
                        />
                        <FieldError message={errors.sort_order} />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={isAvailable}
                                onChange={(event) =>
                                    setIsAvailable(event.target.checked)
                                }
                                className="sr-only"
                            />
                            <span
                                className={`h-6 w-11 rounded-full transition ${isAvailable ? 'bg-primary' : 'bg-slate-200'}`}
                            />
                            <span
                                className={`absolute left-1 h-4 w-4 rounded-full bg-white shadow transition ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </label>
                        <div>
                            <p className="text-sm font-medium text-text">
                                Status Aktif
                            </p>
                            <p className="text-xs text-slate-500">
                                Menu akan tampil di katalog jika aktif.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                        <Textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder={
                                menuType === 'eceran'
                                    ? 'Contoh: Menu eceran dengan harga per porsi'
                                    : 'Tambahkan deskripsi singkat menu ini.'
                            }
                            error={errors.description}
                        />
                        <FieldError message={errors.description} />
                    </div>

                    <div className="md:col-span-2">
                        <FieldLabel htmlFor="image">Gambar</FieldLabel>
                        <div className="mt-2 space-y-3">
                            <input
                                id={imageInputId}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) =>
                                    handleImageChange(
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            {imagePreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt={name || 'Preview gambar menu'}
                                        className="h-32 w-32 rounded-2xl object-cover ring-1 ring-black/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageChange(null)}
                                        className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/10 transition hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <X className="size-3" />
                                    </button>
                                    <label
                                        htmlFor={imageInputId}
                                        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <Upload className="size-3.5" />
                                        Ganti gambar
                                    </label>
                                </div>
                            ) : (
                                <label
                                    htmlFor={imageInputId}
                                    className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-primary/50 hover:bg-primary/5"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
                                        <ImageIcon className="size-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">
                                            Klik untuk upload gambar
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            JPG, PNG, WebP, maks 2MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(event) =>
                                            handleImageChange(
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </label>
                            )}
                        </div>
                        <FieldError message={errors.image} />
                    </div>

                    {activeMenuType === 'eceran' && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
                            <p className="font-semibold text-text">
                                {isFixedPricePackage
                                    ? subType === 'paket_nasi_box'
                                        ? 'Paket Napass'
                                        : subType === 'babi_adat'
                                          ? 'Babi Adat'
                                          : 'Paket Pass'
                                    : 'Varian Harga'}
                            </p>
                            <p className="mt-1 leading-6">
                                {isFixedPricePackage
                                    ? 'Sistem akan menyimpan harga ini sebagai satu varian tunggal, tanpa daftar varian harga.'
                                    : 'Cocok untuk menu eceran dengan beberapa ukuran atau kemasan per porsi.'}
                            </p>
                        </div>
                    )}
                </div>
            </Section>

            {activeMenuType === 'timbang_hidup' && (
                <Section
                    title="Harga per Golongan"
                    description="Pre-populate delapan baris default agar admin tinggal menyesuaikan angka harga per range berat."
                >
                    <TierTable
                        tiers={tiers}
                        errors={errors}
                        onChange={updateTier}
                    />

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-text">
                                    Subsidi Ongkir
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Aktifkan untuk menyesuaikan subsidi ongkir
                                    pada order matang di Jabodetabek.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSubsidyEnabled((current) => !current)
                                }
                                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${subsidyEnabled ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
                            >
                                {subsidyEnabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>

                        {subsidyEnabled && (
                            <div className="mt-4 space-y-4">
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                    Range Berat
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                    Maks. Subsidi
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {subsidyRows.map((row, index) => (
                                                <tr
                                                    key={`${row.min_kg}-${index}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    row.min_kg
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateSubsidy(
                                                                        index,
                                                                        'min_kg',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Min"
                                                            />
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    row.max_kg
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateSubsidy(
                                                                        index,
                                                                        'max_kg',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Maks"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                row.max_subsidi
                                                            }
                                                            onChange={(event) =>
                                                                updateSubsidy(
                                                                    index,
                                                                    'max_subsidi',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSubsidyRow(
                                                                    index,
                                                                )
                                                            }
                                                            disabled={
                                                                subsidyRows.length ===
                                                                1
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            <X className="size-4" />
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSubsidyRow}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Tambah Range
                                </button>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {activeMenuType === 'eceran' && !isFixedPricePackage && (
                <Section
                    title="Varian Harga"
                    description="Tambahkan minimal satu varian untuk setiap ukuran/kemasan eceran."
                >
                    <VariantList
                        variants={variants}
                        errors={errors}
                        onChange={updateVariant}
                        onAdd={addVariant}
                        onRemove={removeVariant}
                    />
                </Section>
            )}

            {activeMenuType === 'eceran' && isFixedPricePackage && (
                <Section
                    title={
                        subType === 'paket_nasi_box'
                            ? 'Paket Napass'
                            : subType === 'babi_adat'
                              ? 'Babi Adat'
                              : 'Paket Pass'
                    }
                    description="Gunakan satu harga paket saja tanpa daftar varian harga."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <FieldLabel htmlFor="bundle_desc" required>
                                Isi Paket
                            </FieldLabel>
                            <Textarea
                                id="bundle_desc"
                                rows={4}
                                value={bundleDesc}
                                onChange={(event) =>
                                    setBundleDesc(event.target.value)
                                }
                                placeholder={
                                    subType === 'babi_adat'
                                        ? 'Contoh: Babi all-in + jeroan + adat'
                                        : 'Contoh: Panggang 500ml + Saksang 500ml + Sop 1000ml'
                                }
                                error={errors.bundle_desc}
                            />
                            <FieldError message={errors.bundle_desc} />
                        </div>

                        <div>
                            {subType === 'babi_adat' ? (
                                <>
                                    <FieldLabel
                                        htmlFor="babi_mentah_price"
                                        required
                                    >
                                        Harga Mentah
                                    </FieldLabel>
                                    <Input
                                        id="babi_mentah_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={babiMentahPrice}
                                        onChange={(event) =>
                                            setBabiMentahPrice(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="250000"
                                    />
                                    <FieldError
                                        message={errors.babi_mentah_price}
                                    />

                                    <div className="mt-4">
                                        <FieldLabel
                                            htmlFor="babi_matang_price"
                                            required
                                        >
                                            Harga Matang
                                        </FieldLabel>
                                        <Input
                                            id="babi_matang_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={babiMatangPrice}
                                            onChange={(event) =>
                                                setBabiMatangPrice(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="300000"
                                        />
                                        <FieldError
                                            message={errors.babi_matang_price}
                                        />
                                    </div>
                                    <Hint>
                                        Harga mentah dan matang disimpan khusus
                                        untuk Babi Adat.
                                    </Hint>
                                </>
                            ) : (
                                <>
                                    <FieldLabel
                                        htmlFor="package_price"
                                        required
                                    >
                                        Harga Paket
                                    </FieldLabel>
                                    <Input
                                        id="package_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={packagePrice}
                                        onChange={(event) =>
                                            setPackagePrice(event.target.value)
                                        }
                                        placeholder="250000"
                                    />
                                    <Hint>
                                        Harga ini akan disimpan sebagai varian
                                        tunggal.
                                    </Hint>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={freeOngkirEnabled}
                                onChange={(event) =>
                                    setFreeOngkirEnabled(event.target.checked)
                                }
                                className="mt-1 size-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-text">
                                    Free Ongkir
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Aktifkan jika paket ini mendapat subsidi
                                    ongkir khusus.
                                </p>
                            </div>
                        </label>

                        {freeOngkirEnabled && (
                            <div className="mt-4 max-w-sm">
                                <FieldLabel htmlFor="free_ongkir_km">
                                    Batas Kilometer Gratis
                                </FieldLabel>
                                <Input
                                    id="free_ongkir_km"
                                    type="number"
                                    min="0"
                                    value={freeOngkirKm}
                                    onChange={(event) =>
                                        setFreeOngkirKm(event.target.value)
                                    }
                                    placeholder="10"
                                />
                            </div>
                        )}
                    </div>
                </Section>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 rounded-[28px] border border-white/70 bg-white/90 px-5 py-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <ArrowLeft className="size-4" />
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save className="size-4" />
                    {processing ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
            </div>
        </form>
    );
}
