import { Check, ChevronDown, Mail, Phone, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface CustomerSummary {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface Props {
    customerType: 'terdaftar' | 'walkin';
    onCustomerTypeChange: (value: 'terdaftar' | 'walkin') => void;
    customers: CustomerSummary[];
    selectedCustomer: CustomerSummary | null;
    onSelectCustomer: (customer: CustomerSummary) => void;
    onClearCustomer: () => void;
    walkInName: string;
    onWalkInNameChange: (value: string) => void;
    walkInPhone: string;
    onWalkInPhoneChange: (value: string) => void;
    walkInEmail: string;
    onWalkInEmailChange: (value: string) => void;
    error?: string;
}

export default function CustomerSection({
    customerType,
    onCustomerTypeChange,
    customers,
    selectedCustomer,
    onSelectCustomer,
    onClearCustomer,
    walkInName,
    onWalkInNameChange,
    walkInPhone,
    onWalkInPhoneChange,
    walkInEmail,
    onWalkInEmailChange,
    error,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                wrapperRef.current &&
                event.target instanceof Node &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (customerType === 'walkin') {
            setQuery('');
            setOpen(false);
        }
    }, [customerType]);

    const filteredCustomers = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (normalized === '') {
            return customers.slice(0, 8);
        }

        return customers.filter((customer) => {
            return (
                customer.name.toLowerCase().includes(normalized) ||
                customer.email.toLowerCase().includes(normalized)
            );
        });
    }, [customers, query]);

    const handleSelect = (customer: CustomerSummary): void => {
        onSelectCustomer(customer);
        setQuery('');
        setOpen(false);
    };

    return (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Customer
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-text">
                        Informasi Pelanggan
                    </h3>
                </div>
                <div className="flex rounded-full bg-secondary/70 p-1">
                    <button
                        type="button"
                        onClick={() => onCustomerTypeChange('terdaftar')}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${customerType === 'terdaftar' ? 'bg-primary text-white' : 'text-text'}`}
                    >
                        Pelanggan Terdaftar
                    </button>
                    <button
                        type="button"
                        onClick={() => onCustomerTypeChange('walkin')}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${customerType === 'walkin' ? 'bg-primary text-white' : 'text-text'}`}
                    >
                        Walk-in
                    </button>
                </div>
            </div>

            {customerType === 'terdaftar' ? (
                <div ref={wrapperRef} className="mt-4 space-y-3">
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Cari Pelanggan
                        </span>
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={
                                    selectedCustomer
                                        ? selectedCustomer.name
                                        : query
                                }
                                onFocus={() => setOpen(true)}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    onClearCustomer();
                                    setOpen(true);
                                }}
                                placeholder="Cari nama atau email"
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-10 pl-10 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            {selectedCustomer ? (
                                <button
                                    type="button"
                                    onClick={onClearCustomer}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-text"
                                >
                                    <X className="size-4" />
                                </button>
                            ) : (
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
                            )}
                        </div>
                    </label>

                    {open &&
                        filteredCustomers.length > 0 &&
                        !selectedCustomer && (
                            <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                {filteredCustomers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        type="button"
                                        onClick={() => handleSelect(customer)}
                                        className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-secondary/50"
                                    >
                                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Check className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-text">
                                                {customer.name}
                                            </p>
                                            <div className="mt-1 space-y-1 text-xs text-slate-500">
                                                <p className="flex items-center gap-1.5">
                                                    <Mail className="size-3.5" />
                                                    {customer.email}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <Phone className="size-3.5" />
                                                    {customer.phone ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                    {selectedCustomer && (
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        {selectedCustomer.name}
                                    </p>
                                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                                        <p className="flex items-center gap-2">
                                            <Mail className="size-3.5 text-primary" />
                                            {selectedCustomer.email}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone className="size-3.5 text-primary" />
                                            {selectedCustomer.phone ?? '-'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClearCustomer}
                                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-text"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Nama Pelanggan
                        </span>
                        <input
                            type="text"
                            value={walkInName}
                            onChange={(event) =>
                                onWalkInNameChange(event.target.value)
                            }
                            placeholder="Nama pelanggan"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Nomor HP
                        </span>
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={walkInPhone}
                            onChange={(event) =>
                                onWalkInPhoneChange(event.target.value)
                            }
                            placeholder="08xxxxxxxxxx"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>

                    <label className="block sm:col-span-2">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Email (akan otomatis daftar akun pelanggan)
                        </span>
                        <input
                            type="email"
                            value={walkInEmail}
                            onChange={(event) =>
                                onWalkInEmailChange(event.target.value)
                            }
                            placeholder="contoh: pelanggan@email.com"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="mt-1.5 text-xs text-slate-500">
                            Pelanggan bisa login langsung dengan email ini
                            menggunakan OTP
                        </p>
                    </label>
                </div>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    );
}
