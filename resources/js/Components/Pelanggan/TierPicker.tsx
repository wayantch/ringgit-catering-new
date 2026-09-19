import { Check } from 'lucide-react';

interface TierPickerOption {
    id: string;
    title: string;
    description: string;
    price: string;
    cashback?: string;
}

interface TierPickerProps {
    step?: number;
    label: string;
    helperText?: string;
    options: TierPickerOption[];
    value: string | null;
    onChange: (value: string) => void;
}

export default function TierPicker({
    step,
    label,
    helperText,
    options,
    value,
    onChange,
}: TierPickerProps) {
    return (
        <section className="py-4 first:pt-0 last:pb-0">
            <div className="mb-2.5 flex items-baseline gap-2">
                {step !== undefined && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {step}
                    </span>
                )}
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-text">{label}</h4>
                    {helperText && (
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            {helperText}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const active = value === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onChange(option.id)}
                            className={`rounded-xl border p-3 text-left transition ${
                                active
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-primary/40'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-text">
                                    {option.title}
                                </p>
                                {active && (
                                    <Check className="size-4 shrink-0 text-primary" />
                                )}
                            </div>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {option.description}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-semibold text-text">
                                    {option.price}
                                </span>
                                {option.cashback && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                        {option.cashback}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
