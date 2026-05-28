import React from 'react';

interface PesananSourceBadgeProps {
    source: 'pembeli' | 'admin';
}

const sourceConfig = {
    pembeli: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        label: 'Pelanggan',
    },
    admin: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Admin' },
};

export default function PesananSourceBadge({
    source,
}: PesananSourceBadgeProps) {
    // Defensive: ensure config exists even if `source` is undefined or unexpected
    const config =
        (source && (sourceConfig as any)[source]) ?? sourceConfig.pembeli;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ${config.bg} ${config.text} ${source === 'pembeli' ? 'ring-purple-100' : 'ring-indigo-100'}`}
        >
            {config.label}
        </span>
    );
}
