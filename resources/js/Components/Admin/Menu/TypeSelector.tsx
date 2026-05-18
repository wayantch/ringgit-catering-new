import { Package, Scale3d } from 'lucide-react';

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
            className={`group rounded-2xl border p-5 text-left transition-all duration-200 ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/5'}`}
        >
            <div className="flex items-start gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-2xl shadow-inner ring-1 ring-black/5">
                    {emoji}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-text">
                            {title}
                        </h3>
                        {active && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
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
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="mb-5">
                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                    Langkah 1
                </p>
                <h2 className="mt-2 text-2xl font-bold text-text">
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
                    description="Menu satuan dan paket: Paket PASS, Nasi Box, atau Babi Adat (all-in)."
                    onClick={() => onSelect('eceran')}
                />
            </div>
        </div>
    );
}
