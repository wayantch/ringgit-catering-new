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
        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f7465_0%,#88a07d_52%,#dfd3be_100%)] text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%), radial-gradient(circle at 60% 80%, rgba(0,0,0,0.08), transparent 50%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-10"
                style={{ background: 'rgba(255,255,255,0.5)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full opacity-10"
                style={{ background: 'rgba(255,255,255,0.5)' }}
            />

            <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14">
                <div className="flex items-center justify-between gap-6">
                    <div className="max-w-2xl space-y-4">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/85 uppercase backdrop-blur-sm">
                            Ringgit Catering
                        </span>
                        <p className="text-sm font-medium text-white/75 sm:text-base">
                            Halo, {user.name}
                        </p>
                        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                            Profil.
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-base">
                            Atur data akun, lihat ringkasan, dan akses menu
                            profil dengan tampilan yang lebih rapi.
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Data akun
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Riwayat pesanan
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Logout aman
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 text-lg font-semibold shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16 sm:text-xl">
                            {initials(user.name)}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="mb-1 text-[11px] tracking-[0.18em] text-white/60 uppercase">
                            Total pesanan
                        </p>
                        <p className="text-[15px] font-semibold text-white">
                            {stats.total_orders}
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="mb-1 text-[11px] tracking-[0.18em] text-white/60 uppercase">
                            Total belanja
                        </p>
                        <p className="text-[15px] font-semibold text-white">
                            {formatCurrency(stats.total_spent)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                                Loyalti
                            </p>
                            <p className="mt-1 text-sm font-medium text-white/85">
                                {stats.loyalty_min_orders !== null
                                    ? `${stats.loyalty_completed_orders} dari ${stats.loyalty_min_orders} pesanan selesai`
                                    : 'Program loyalti belum aktif'}
                            </p>
                        </div>
                        <TierBadge
                            tier={stats.loyalty_tier}
                            orderCount={stats.loyalty_completed_orders}
                        />
                    </div>

                    {stats.loyalty_min_orders !== null && (
                        <div className="mt-3">
                            <div className="mb-2 flex items-center justify-between text-[11px] text-white/65">
                                <span>
                                    {stats.loyalty_progress_percent ?? 0}% ke
                                    reward berikutnya
                                </span>
                                <span>
                                    {stats.loyalty_is_eligible
                                        ? 'Eligible'
                                        : 'Perlu pesanan lagi'}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/15">
                                <div
                                    className="h-full rounded-full bg-white/90 transition-all"
                                    style={{
                                        width: `${stats.loyalty_progress_percent ?? 0}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {stats.loyalty_is_eligible && (
                                    <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-50 ring-1 ring-emerald-300/30">
                                        Eligible
                                    </span>
                                )}
                                {stats.loyalty_has_redeemed && (
                                    <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-2 py-1 text-[10px] font-medium text-white/85 ring-1 ring-white/20">
                                        Sudah redeem
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
