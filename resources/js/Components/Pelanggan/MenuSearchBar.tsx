import { Search } from 'lucide-react';

interface MenuSearchBarProps {
    value?: string;
    onDebouncedChange: (value: string) => void;
}

export default function MenuSearchBar({
    value = '',
    onDebouncedChange,
}: MenuSearchBarProps) {
    return (
        <div className="sticky top-0 z-20 bg-white/70 py-2 backdrop-blur-xl">
            <label className="flex items-center gap-2 rounded-[22px] border border-black/5 bg-[#fbfaf6] px-4 py-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
                <Search className="size-4 text-slate-400" />
                <input
                    value={value}
                    onChange={(event) => onDebouncedChange(event.target.value)}
                    className="w-full bg-transparent text-sm text-text outline-none placeholder:text-slate-400"
                    placeholder="Cari menu..."
                />
            </label>
        </div>
    );
}
