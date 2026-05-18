interface TierPickerOption {
    id: string;
    title: string;
    description: string;
    price: string;
    meta?: string;
}

interface TierPickerProps {
    label: string;
    helperText?: string;
    options: TierPickerOption[];
    value: string | null;
    onChange: (value: string) => void;
}

export default function TierPicker({
    label,
    helperText,
    options,
    value,
    onChange,
}: TierPickerProps) {
    return (
        <div className="space-y-3">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    {label}
                </p>
                {helperText && (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const active = value === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onChange(option.id)}
                            className={`rounded-2xl border p-4 text-left transition-all duration-150 ${
                                active
                                    ? 'border-primary bg-primary/5 shadow-[0_10px_24px_-16px_rgba(122,143,107,0.65)]'
                                    : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-secondary/40'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p
                                        className={`text-sm font-semibold ${active ? 'text-primary' : 'text-text'}`}
                                    >
                                        {option.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {option.description}
                                    </p>
                                </div>

                                {option.meta && (
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {option.meta}
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-400">
                                    {active ? 'Dipilih' : 'Pilih opsi'}
                                </span>
                                <span
                                    className={`text-sm font-semibold ${active ? 'text-primary' : 'text-text'}`}
                                >
                                    {option.price}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
