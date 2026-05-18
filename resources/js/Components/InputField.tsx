import React from 'react';
import { cn } from '@/lib/utils'; // optional kalau lu punya helper classnames

type InputFieldProps = {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
    name?: string;
};

export default function InputField({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    icon,
    className,
    name,
}: InputFieldProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <div
                className={cn(
                    'flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm transition',
                    error
                        ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-200'
                        : 'border-slate-200 focus-within:ring-2 focus-within:ring-primary/30',
                    className,
                )}
            >
                {icon && <div className="text-slate-400">{icon}</div>}

                <input
                    type={type}
                    name={name}
                    value={value ?? ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
