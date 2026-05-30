type MenuType = 'timbang_hidup' | 'eceran';

interface TypeSelectorProps {
    value?: MenuType;
    onSelect: (menuType: MenuType) => void;
}

function TypeCard({
    active,
    emoji,
    title,
    description,
    onClick,
}: {
    active: boolean;
    emoji: string;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group rounded-[28px] border p-5 text-left transition-all duration-200 ${active ? 'border-primary/30 bg-linear-to-br from-primary/5 via-white to-primary/10 shadow-[0_18px_40px_-28px_rgba(122,143,107,0.45)] ring-1 ring-primary/10' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'}`}
        >
            <div className="flex items-start gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl ring-1 ring-slate-100 transition group-hover:bg-white">
                    {emoji}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-text">
                            {title}
                        </h3>
                        {active && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase ring-1 ring-primary/10">
                                Dipilih
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}

export default function TypeSelector({ value, onSelect }: TypeSelectorProps) {
    return (
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
            <div className="mb-5">
                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                    Langkah 1
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-text">
                    Pilih Jenis Menu
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Tentukan dulu model jualannya. Setelah dipilih, form di
                    bawah akan menyesuaikan struktur harga dan variannya.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <TypeCard
                    active={value === 'timbang_hidup'}
                    emoji="🐷"
                    title="Timbang Hidup"
                    description="Harga per kg dengan sistem golongan A/B/C, termasuk setengah ekor dan subsidi ongkir matang."
                    onClick={() => onSelect('timbang_hidup')}
                />
                <TypeCard
                    active={value === 'eceran'}
                    emoji="📦"
                    title="Eceran"
                    description="Menu satuan dan paket: Paket PASS, Paket Napass, atau Babi Adat (all-in)."
                    onClick={() => onSelect('eceran')}
                />
            </div>
        </div>
    );
}
