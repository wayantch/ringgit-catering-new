import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MenuPickerCard from './MenuPickerCard';
import type { MenuPickerCardItem } from './MenuPickerCard';

export interface OrderItemSummary {
    menu_item_id: number;
    quantity: number;
}

interface Props {
    menuItems: MenuPickerCardItem[];
    orderItems: OrderItemSummary[];
    onOpenItemSheet: (item: MenuPickerCardItem) => void;
}

const CATEGORIES = [
    { value: 'all', label: 'Semua' },
    { value: 'timbang_hidup', label: 'Timbang Hidup' },
    { value: 'paket_pass', label: 'Paket PASS' },
    { value: 'paket_nasi_box', label: 'Paket Napass' },
    { value: 'babi_adat', label: 'Babi Adat' },
] as const;

type PickerCategory = (typeof CATEGORIES)[number]['value'];
type FilterSubType = Exclude<PickerCategory, 'all' | 'timbang_hidup'>;

const CATEGORY_META: Record<PickerCategory, string> = {
    all: 'bg-slate-100 text-slate-700 ring-slate-200',
    timbang_hidup: 'bg-amber-50 text-amber-700 ring-amber-100',
    paket_pass: 'bg-violet-50 text-violet-700 ring-violet-100',
    paket_nasi_box: 'bg-blue-50 text-blue-700 ring-blue-100',
    babi_adat: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

function isFilterSubType(
    subType: MenuPickerCardItem['sub_type'],
): subType is FilterSubType {
    return (
        subType === 'paket_pass' ||
        subType === 'paket_nasi_box' ||
        subType === 'babi_adat'
    );
}

function matchesCategory(
    item: MenuPickerCardItem,
    category: PickerCategory,
): boolean {
    if (category === 'all') {
        return true;
    }

    if (category === 'timbang_hidup') {
        return item.menu_type === 'timbang_hidup';
    }

    return item.menu_type === 'eceran' && item.sub_type === category;
}

export default function MenuPicker({
    menuItems,
    orderItems,
    onOpenItemSheet,
}: Props) {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<PickerCategory>('all');

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setSearch(searchInput.trim().toLowerCase());
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [searchInput]);

    const quantityByItemId = useMemo(() => {
        return orderItems.reduce<Record<number, number>>((carry, item) => {
            carry[item.menu_item_id] = item.quantity;

            return carry;
        }, {});
    }, [orderItems]);

    const activeCategoryLabel =
        CATEGORIES.find((entry) => entry.value === category)?.label ?? 'Semua';

    const categoryCounts = useMemo(() => {
        return menuItems.reduce<Record<PickerCategory, number>>(
            (carry, item) => {
                carry.all += 1;

                if (item.menu_type === 'timbang_hidup') {
                    carry.timbang_hidup += 1;

                    return carry;
                }

                if (
                    item.menu_type === 'eceran' &&
                    isFilterSubType(item.sub_type)
                ) {
                    carry[item.sub_type] += 1;
                }

                return carry;
            },
            {
                all: 0,
                timbang_hidup: 0,
                paket_pass: 0,
                paket_nasi_box: 0,
                babi_adat: 0,
            },
        );
    }, [menuItems]);

    const filteredItems = menuItems.filter((item) => {
        const matchesSearch =
            search === '' ||
            item.name.toLowerCase().includes(search) ||
            item.category.name.toLowerCase().includes(search);

        return matchesCategory(item, category) && matchesSearch;
    });

    return (
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
            <div className="border-b border-slate-100 bg-linear-to-br from-white via-[#fcfcfa] to-primary/5 p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                                Pilih Menu
                            </p>
                            <h2 className="text-lg font-semibold text-text sm:text-xl">
                                Cari dan tambahkan item pesanan
                            </h2>
                            <p className="text-sm text-slate-500">
                                {filteredItems.length} menu terlihat dari{' '}
                                {categoryCounts[category] ?? menuItems.length}{' '}
                                item di {activeCategoryLabel.toLowerCase()}.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-100">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Live filter
                        </div>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Search
                        </span>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Cari menu atau kategori"
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-4 pl-10 text-sm text-text transition outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </label>

                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((entry) => {
                            const isActive = category === entry.value;

                            return (
                                <button
                                    key={entry.value}
                                    type="button"
                                    onClick={() => setCategory(entry.value)}
                                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition ${isActive ? 'bg-primary text-white shadow-sm ring-primary/20' : `${CATEGORY_META[entry.value]} hover:-translate-y-0.5 hover:bg-white hover:shadow-sm`}`}
                                >
                                    {entry.label}
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/70 text-slate-500'}`}
                                    >
                                        {categoryCounts[entry.value] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {filteredItems.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                            <Search className="size-5 text-slate-400" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-text">
                            Menu tidak ditemukan
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Coba kata kunci lain atau reset filter kategori.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput('');
                                setSearch('');
                                setCategory('all');
                            }}
                            className="mt-5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <MenuPickerCard
                                key={item.id}
                                item={item}
                                quantity={quantityByItemId[item.id] ?? 0}
                                onAdd={onOpenItemSheet}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
