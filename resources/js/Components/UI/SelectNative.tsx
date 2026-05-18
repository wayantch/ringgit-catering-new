import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectNativeProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    label?: string;
    hint?: string;
}

export default function SelectNative({
    error,
    label,
    hint,
    className = '',
    id,
    children,
    disabled,
    ...props
}: SelectNativeProps) {
    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    id={id}
                    disabled={disabled}
                    className={cn(
                        'w-full appearance-none rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-text transition-all duration-150 outline-none',
                        error
                            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            : 'border-slate-200 bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/15',
                        disabled &&
                            'cursor-not-allowed opacity-50 bg-slate-50',
                    )}
                    {...props}
                >
                    {children}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    {error}
                </p>
            )}

            {hint && !error && (
                <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );
}
