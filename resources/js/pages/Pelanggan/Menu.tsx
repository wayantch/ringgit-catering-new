import type { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import AddToCartSheet from '@/Components/Pelanggan/AddToCartSheet';
import MenuItemCard from '@/Components/Pelanggan/MenuItemCard';
import MenuSearchBar from '@/Components/Pelanggan/MenuSearchBar';
import MenuSection from '@/Components/Pelanggan/MenuSection';
import PageContainer from '@/Components/Pelanggan/PageContainer';
import PageHeader from '@/Components/Pelanggan/PageHeader';
import { MenuGridSkeleton } from '@/Components/Pelanggan/Skeletons';
import { useIsRefetching } from '@/hooks/useIsRefetching';
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

type SectionKey = 'timbang_hidup' | EceranSubType;

const SECTIONS: Array<{
    key: SectionKey;
    title: string;
    emoji: string;
    description: string;
}> = [
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
        title: 'Paket Napass',
        emoji: '🍱',
        description: 'Paket Napass per porsi',
    },
    {
        key: 'babi_adat',
        title: 'Babi Adat',
        emoji: '🏺',
        description: 'All-in termasuk jeroan, adat Batak & Nias',
    },
];

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

function Index({ timbang_hidup, eceran }: Props) {
    const { url } = usePage();
    const isRefetching = useIsRefetching();
    // TopNavbar sends its search here as ?q=, so seed the client-side filter
    // from the URL on first render.
    const [query, setQuery] = useState(
        () => new URLSearchParams(url.split('?')[1] ?? '').get('q') ?? '',
    );
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] =
        useState<string>('timbang_hidup');
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const allSections = useMemo(() => {
        return SECTIONS.map((section) => {
            const items: MenuItem[] =
                section.key === 'timbang_hidup'
                    ? timbang_hidup
                    : (eceran[section.key] ?? []);

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

            if (found) {
                return found;
            }
        }

        return null;
    }, [allSections, selectedItemId]);

    // Fall back to the first visible section when filtering hides the selected
    // one, derived during render rather than synced through an effect.
    const activeSectionId =
        filteredSections.length === 0 ||
        filteredSections.some((section) => section.id === selectedSectionId)
            ? selectedSectionId
            : filteredSections[0].id;

    const scrollToSection = (sectionId: string): void => {
        setSelectedSectionId(sectionId);
        sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <Head title="Menu" />

            <PageContainer className="space-y-5 lg:space-y-6">
                <PageHeader
                    title="Menu"
                    description={totalItems + ' menu tersedia'}
                />

                <div className="sticky top-0 z-20 -mx-4 space-y-3 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-30 lg:-mx-8 lg:px-8">
                    <div className="lg:max-w-md">
                        <MenuSearchBar
                            value={query}
                            onDebouncedChange={setQuery}
                        />
                    </div>

                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                        {filteredSections.map((section) => {
                            const isActive = activeSectionId === section.id;

                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => scrollToSection(section.id)}
                                    className={cn(
                                        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition',
                                        isActive
                                            ? 'border-primary bg-primary font-semibold text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary',
                                    )}
                                >
                                    {section.title}
                                    <span
                                        className={cn(
                                            'text-xs',
                                            isActive
                                                ? 'text-white/70'
                                                : 'text-slate-400',
                                        )}
                                    >
                                        {section.items.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isRefetching ? (
                    <MenuGridSkeleton />
                ) : filteredSections.length > 0 ? (
                    <div className="space-y-8">
                        {filteredSections.map((section) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    sectionRefs.current[section.id] = el;
                                }}
                                className="scroll-mt-40"
                            >
                                <MenuSection
                                    id={section.id}
                                    title={section.title}
                                    description={section.description}
                                    count={section.items.length}
                                >
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
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
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <p className="text-sm font-medium text-text">
                            Menu tidak ditemukan
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Coba kata kunci lain.
                        </p>
                    </div>
                )}
            </PageContainer>

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
