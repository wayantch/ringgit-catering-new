import { Search, X } from 'lucide-react';

interface MenuSearchBarProps {
    value?: string;
    onDebouncedChange: (value: string) => void;
}

export default function MenuSearchBar({
    value = '',
    onDebouncedChange,
}: MenuSearchBarProps) {
    return (
        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
                value={value}
                onChange={(event) => onDebouncedChange(event.target.value)}
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-slate-400"
                placeholder="Cari menu..."
            />
            {value !== '' && (
                <button
                    type="button"
                    onClick={() => onDebouncedChange('')}
                    aria-label="Hapus pencarian"
                    className="shrink-0 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <X className="size-4" />
                </button>
            )}
        </label>
    );
}
