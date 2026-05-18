import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Select from '@/Components/UI/Select';

interface Filters {
    search?: string;
    is_available?: string;
}

interface MenuFilterBarProps {
    filters: Filters;
}

export default function MenuFilterBar({ filters }: MenuFilterBarProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isAvailable, setIsAvailable] = useState(filters.is_available ?? '');

    const query = useMemo(() => {
        return {
            search: search || undefined,
            is_available: isAvailable || undefined,
        };
    }, [isAvailable, search]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            // Use Wayfinder route helper for admin menu index
            // import is done lazily to avoid top-level circular imports in some setups
            import('@/routes/admin/menu').then(({ default: menu }) => {
                router.get(menu.index(), query, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            });
        }, 400);

        return () => {
            window.clearTimeout(timer);
        };
    }, [query]);

    const hasActiveFilters = Boolean(search || isAvailable);

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="grid gap-3 md:grid-cols-3">
                <label className="relative md:col-span-2">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari nama menu"
                        className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>

                <Select
                    value={isAvailable}
                    onChange={setIsAvailable}
                    placeholder="Semua Status"
                    options={[
                        { value: '', label: 'Semua Status' },
                        { value: '1', label: 'Tersedia' },
                        { value: '0', label: 'Tidak Tersedia' },
                    ]}
                />
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={() => {
                        setSearch('');
                        setIsAvailable('');
                    }}
                    className="mt-3 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    <X className="size-3" />
                    Reset
                </button>
            )}
        </div>
    );
}
