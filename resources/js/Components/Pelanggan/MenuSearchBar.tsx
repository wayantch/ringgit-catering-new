import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MenuSearchBarProps {
    initialValue?: string;
    onDebouncedChange: (value: string) => void;
}

export default function MenuSearchBar({
    initialValue = '',
    onDebouncedChange,
}: MenuSearchBarProps) {
    const [value, setValue] = useState(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        timerRef.current = window.setTimeout(() => {
            onDebouncedChange(value);
        }, 400);

        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
        };
    }, [onDebouncedChange, value]);

    // Sync with parent when initialValue truly changes (not on every render)
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <div className="sticky top-0 z-10 bg-white/90 py-2 backdrop-blur-xl">
            <label className="flex items-center gap-2 rounded-2xl border border-black/5 bg-[#fbfaf6] px-4 py-3 shadow-sm">
                <Search className="size-4 text-slate-400" />
                <input
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    className="w-full bg-transparent text-sm text-text outline-none placeholder:text-slate-400"
                    placeholder="Cari menu..."
                />
            </label>
        </div>
    );
}
