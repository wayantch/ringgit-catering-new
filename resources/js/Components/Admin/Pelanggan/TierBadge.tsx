const TIER_CONFIG = {
    bronze: {
        label: 'Bronze',
        cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        icon: '🥉',
    },
    silver: {
        label: 'Silver',
        cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-300',
        icon: '🥈',
    },
    gold: {
        label: 'Gold',
        cls: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-300',
        icon: '🥇',
    },
    platinum: {
        label: 'Platinum',
        cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-300',
        icon: '💎',
    },
} as const;

export default function TierBadge({
    tier,
    orderCount,
    showCount = true,
}: {
    tier: keyof typeof TIER_CONFIG;
    orderCount: number;
    showCount?: boolean;
}) {
    const cfg = TIER_CONFIG[tier];

    return (
        <span
            className={`inline-flex w-fit items-center gap-1 self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
        >
            <span>{cfg.icon}</span>
            {cfg.label}
            {showCount && <span className="opacity-60">· {orderCount}x</span>}
        </span>
    );
}
