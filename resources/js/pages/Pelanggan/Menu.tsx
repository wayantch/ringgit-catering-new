import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddToCartSheet from '@/Components/Pelanggan/AddToCartSheet';
import MenuItemCard from '@/Components/Pelanggan/MenuItemCard';
import MenuSearchBar from '@/Components/Pelanggan/MenuSearchBar';
import MenuSection from '@/Components/Pelanggan/MenuSection';
import PelangganLayout from '@/Layouts/PelangganLayout';
import { cn } from '@/lib/utils';

type MenuType = 'timbang_hidup' | 'eceran';

type EceranSubType = 'paket_pass' | 'paket_nasi_box' | 'babi_adat';

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

interface MenuCategory {
    id: string | null;
    name: string | null;
    type: MenuType | null;
}

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    menu_type: MenuType;
    sub_type: EceranSubType | null;
    is_bundle: boolean;
    bundle_desc: string | null;
    is_available: boolean;
    min_price: number | null;
    category: MenuCategory;
    tiers: MenuTier[];
    variants: MenuVariant[];
}

interface Props extends PageProps {
    timbang_hidup: MenuItem[];
    eceran: {
        paket_pass: MenuItem[];
        paket_nasi_box: MenuItem[];
        babi_adat: MenuItem[];
    };
}

const SECTIONS = [
    {
        key: 'timbang_hidup',
        title: 'Timbang Hidup',
        emoji: '🐷',
        description: 'Harga per kg, sistem golongan',
    },
    {
        key: 'paket_pass',
        title: 'Paket PASS',
        emoji: '🎁',
        description: 'Bundling hemat, gratis ongkir tersedia',
    },
    {
        key: 'paket_nasi_box',
        title: 'Paket Nasi Box',
        emoji: '🍱',
        description: 'Nasi box per porsi',
    },
    {
        key: 'babi_adat',
        title: 'Babi Adat',
        emoji: '🏺',
        description: 'All-in termasuk jeroan, adat Batak & Nias',
    },
];

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

function toSearchableText(item: MenuItem): string {
    return [
        item.name,
        item.description,
        item.category.name,
        item.menu_type,
        item.sub_type,
        item.bundle_desc,
        ...item.tiers.map((tier) => tier.kode),
        ...item.variants.map((variant) => variant.label),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

function MenuPageHeader({ totalItems }: { totalItems: number }) {
    return (
        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f7465_0%,#88a07d_52%,#dfd3be_100%)] text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
            />
            <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12">
                <div className="flex items-center justify-between gap-4">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/80 uppercase backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            Ringgit Catering
                        </span>
                        <p className="mt-3 text-sm font-medium text-white/75 sm:text-base">
                            {totalItems} menu aktif siap dipilih
                        </p>
                        <h1 className="mt-1 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                            Pilih menu, lihat detail, lalu lanjutkan pesanan.
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                            Jelajah semua section dalam satu halaman, gunakan
                            pencarian cepat, dan buka detail pesanan tanpa
                            kehilangan konteks.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-14 sm:w-14">
                            <UtensilsCrossed className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function Index({ timbang_hidup, eceran }: Props) {
    const [query, setQuery] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [activeSectionId, setActiveSectionId] =
        useState<string>('timbang_hidup');
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const allSections = useMemo(() => {
        return SECTIONS.map((section) => {
            const items =
                section.key === 'timbang_hidup'
                    ? timbang_hidup
                    : ((eceran as any)[section.key] ?? []);

            return {
                id: section.key,
                title: section.title,
                description: section.description,
                items,
            };
        }).filter((s) => s.items.length > 0);
    }, [eceran, timbang_hidup]);

    const filteredSections = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery === '') {
            return allSections;
        }

        return allSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    toSearchableText(item).includes(normalizedQuery),
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [allSections, query]);

    const totalItems = useMemo(
        () => allSections.reduce((sum, s) => sum + s.items.length, 0),
        [allSections],
    );

    const selectedItem = useMemo(() => {
        for (const section of allSections) {
            const found = section.items.find(
                (item) => item.id === selectedItemId,
            );
            if (found) return found;
        }
        return null;
    }, [allSections, selectedItemId]);

    useEffect(() => {
        if (filteredSections.length === 0) return;
        if (
            !filteredSections.some((section) => section.id === activeSectionId)
        ) {
            setActiveSectionId(filteredSections[0].id);
        }
    }, [activeSectionId, filteredSections]);

    const scrollToSection = (sectionId: string): void => {
        setActiveSectionId(sectionId);
        sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <Head title="Menu" />

            <MenuPageHeader totalItems={totalItems} />

            <div className="relative -mt-6 sm:-mt-8">
                <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8">
                    <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5">
                        <div className="space-y-4">
                            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                                <MenuSearchBar
                                    initialValue={query}
                                    onDebouncedChange={setQuery}
                                />

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-2 font-medium text-slate-600">
                                        {totalItems} hasil
                                    </span>
                                </div>
                            </div>

                            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                                {filteredSections.map((section) => {
                                    const isActive =
                                        activeSectionId === section.id;

                                    return (
                                        <button
                                            key={section.id}
                                            type="button"
                                            onClick={() =>
                                                scrollToSection(section.id)
                                            }
                                            className={cn(
                                                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all',
                                                isActive
                                                    ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                                                    : 'border-black/5 bg-[#fbfaf6] text-slate-500 hover:border-primary/20 hover:text-primary',
                                            )}
                                        >
                                            {section.title}
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                                    isActive
                                                        ? 'bg-white/15 text-white'
                                                        : 'bg-black/5 text-slate-500',
                                                )}
                                            >
                                                {section.items.length}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-5">
                        {filteredSections.length > 0 ? (
                            filteredSections.map((section) => (
                                <div
                                    key={section.id}
                                    ref={(el) =>
                                        (sectionRefs.current[section.id] = el)
                                    }
                                    className="scroll-mt-28"
                                >
                                    <MenuSection
                                        id={section.id}
                                        title={section.title}
                                        description={section.description}
                                        eyebrow="Eceran"
                                        badge=""
                                        count={section.items.length}
                                    >
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {section.items.map((item) => (
                                                <MenuItemCard
                                                    key={item.id}
                                                    item={item}
                                                    onSelect={setSelectedItemId}
                                                />
                                            ))}
                                        </div>
                                    </MenuSection>
                                </div>
                            ))
                        ) : (
                            <div className="p-6">Tidak ada menu.</div>
                        )}
                    </div>
                </div>
            </div>

            <AddToCartSheet
                isOpen={selectedItem !== null}
                item={selectedItem as MenuItem | null}
                onClose={() => setSelectedItemId(null)}
            />
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
