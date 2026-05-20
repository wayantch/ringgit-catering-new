import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MenuPickerCard from './MenuPickerCard';
import type {MenuPickerCardItem} from './MenuPickerCard';

export interface OrderItemSummary {
    menu_item_id: number;
    quantity: number;
}

interface Props {
    menuItems: MenuPickerCardItem[];
    orderItems: OrderItemSummary[];
    onOpenItemSheet: (item: MenuPickerCardItem) => void;
    onIncrement: (item: MenuPickerCardItem) => void;
    onDecrement: (item: MenuPickerCardItem) => void;
}

const CATEGORIES = [
    { value: 'all', label: 'Semua' },
    { value: 'timbang_hidup', label: 'Timbang Hidup' },
    { value: 'olahan', label: 'Olahan' },
    { value: 'eceran', label: 'Eceran' },
] as const;

export default function MenuPicker({
    menuItems,
    orderItems,
    onOpenItemSheet,
    onIncrement,
    onDecrement,
}: Props) {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] =
        useState<(typeof CATEGORIES)[number]['value']>('all');

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

    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            const matchesCategory =
                category === 'all' || item.category.type === category;
            const matchesSearch =
                search === '' ||
                item.name.toLowerCase().includes(search) ||
                item.category.name.toLowerCase().includes(search);

            return matchesCategory && matchesSearch;
        });
    }, [menuItems, category, search]);

    return (
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="space-y-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                            Pilih Menu
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-text">
                            Cari dan tambahkan item pesanan
                        </h2>
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
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </label>

                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                        {CATEGORIES.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setCategory(item.value)}
                                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item.value ? 'bg-primary text-white' : 'bg-secondary text-text hover:bg-primary/10'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {filteredItems.length === 0 ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                        <p className="text-sm font-semibold text-text">
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
                            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <MenuPickerCard
                                key={item.id}
                                item={item}
                                quantity={quantityByItemId[item.id] ?? 0}
                                onAdd={onOpenItemSheet}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
