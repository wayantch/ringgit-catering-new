interface BerandaHeaderProps {
    user: {
        name: string;
    };
}

export default function BerandaHeader({ user }: BerandaHeaderProps) {
    return (
        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#6f8570_0%,#89a189_52%,#d9d1be_100%)] text-white">
            {/* Decorative blobs */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%), radial-gradient(circle at 60% 80%, rgba(0,0,0,0.08), transparent 50%)',
                }}
            />

            {/* Decorative circles */}
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

            <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12">
                <div className="flex items-center justify-between gap-4">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/80 uppercase backdrop-blur-sm">
                            Ringgit Catering
                        </span>
                        <p className="mt-3 text-sm font-medium text-white/75 sm:text-base">
                            Halo, {user.name}
                        </p>
                        <h1 className="mt-1 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                            Beranda.
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                            Pesanan aktif dan info penting ada di sini.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-sm font-bold text-white shadow-lg shadow-black/10 backdrop-blur-md sm:h-14 sm:w-14">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
