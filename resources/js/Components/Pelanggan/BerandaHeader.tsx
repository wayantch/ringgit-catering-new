interface BerandaHeaderProps {
    user: {
        name: string;
    };
}

export default function BerandaHeader({ user }: BerandaHeaderProps) {
    return (
        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f755f_0%,#7e987b_52%,#d9d1be_100%)] text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)]">
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
                <div className="flex items-center justify-between gap-4">
                    <div className="max-w-2xl space-y-4">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/85 uppercase backdrop-blur-sm">
                            Ringgit Catering
                        </span>
                        <p className="text-sm font-medium text-white/75 sm:text-base">
                            Halo, {user.name}
                        </p>
                        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                            Beranda.
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-base">
                            Pesanan aktif, ringkasan cepat, dan akses ke menu
                            semuanya dibungkus dalam tampilan yang lebih clean.
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Pesanan aktif
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Menu cepat
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Riwayat pesanan
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 text-sm font-bold text-white shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
