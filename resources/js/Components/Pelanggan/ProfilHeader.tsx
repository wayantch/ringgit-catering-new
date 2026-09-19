import TierBadge from '@/Components/Admin/Pelanggan/TierBadge';

interface ProfilHeaderProps {
    user: {
        name: string;
        email: string;
    };
    stats: {
        total_orders: number;
        total_spent: string | number;
        member_since: string;
        loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
        loyalty_completed_orders: number;
        loyalty_min_orders: number | null;
        loyalty_progress_percent: number | null;
        loyalty_is_eligible: boolean;
        loyalty_has_redeemed: boolean;
    };
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function formatCurrency(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

export default function ProfilHeader({ user, stats }: ProfilHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                    {initials(user.name)}
                </span>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-text">
                        {user.name}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                        {user.email}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Member sejak {stats.member_since}
                    </p>
                </div>

                <div className="hidden shrink-0 sm:block">
                    <TierBadge
                        tier={stats.loyalty_tier}
                        orderCount={stats.loyalty_completed_orders}
                    />
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <dt className="text-xs text-slate-400">Total pesanan</dt>
                    <dd className="mt-1 text-lg font-semibold text-text">
                        {stats.total_orders}
                    </dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <dt className="text-xs text-slate-400">Total belanja</dt>
                    <dd className="mt-1 text-lg font-semibold text-text">
                        {formatCurrency(stats.total_spent)}
                    </dd>
                </div>
            </dl>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-sm font-semibold text-text">Loyalti</h2>
                    <p className="text-sm text-slate-500">
                        {stats.loyalty_min_orders !== null
                            ? `${stats.loyalty_completed_orders} dari ${stats.loyalty_min_orders} pesanan selesai`
                            : 'Program loyalti belum aktif'}
                    </p>
                </div>

                {stats.loyalty_min_orders !== null && (
                    <div className="mt-3 space-y-2">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${stats.loyalty_progress_percent ?? 0}%`,
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>
                                {stats.loyalty_progress_percent ?? 0}% ke reward
                                berikutnya
                            </span>
                            {stats.loyalty_is_eligible && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                                    Eligible
                                </span>
                            )}
                            {stats.loyalty_has_redeemed && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                                    Sudah redeem
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
