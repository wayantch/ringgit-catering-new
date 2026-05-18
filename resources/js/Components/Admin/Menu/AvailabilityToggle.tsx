import { router } from '@inertiajs/react';
import { useState } from 'react';
import menu from '@/routes/admin/menu';

interface AvailabilityToggleProps {
    menuId: string;
    initialValue: boolean;
}

export default function AvailabilityToggle({
    menuId,
    initialValue,
}: AvailabilityToggleProps) {
    const [enabled, setEnabled] = useState(initialValue);

    const onToggle = (): void => {
        const previous = enabled;
        setEnabled(!previous);

        router.patch(
            menu.toggle(menuId),
            {},
            {
                preserveScroll: true,
                onError: () => {
                    setEnabled(previous);
                },
            },
        );
    };

    return (
        <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 text-xs font-medium"
        >
            <span
                className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-slate-200'}`}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-4.5' : 'left-0.5'}`}
                />
            </span>
            <span className={enabled ? 'text-primary' : 'text-slate-500'}>
                {enabled ? 'Tersedia' : 'Nonaktif'}
            </span>
        </button>
    );
}
