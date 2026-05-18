interface StatusBadgeProps {
    status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        baru: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Baru' },
        diproses: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            label: 'Diproses',
        },
        selesai: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            label: 'Selesai',
        },
        dibatalkan: {
            bg: 'bg-red-50',
            text: 'text-red-500',
            label: 'Dibatalkan',
        },
    };

    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}
