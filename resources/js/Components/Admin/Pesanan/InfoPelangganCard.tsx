import { User, Phone, Mail } from 'lucide-react';
import React from 'react';

interface Props {
    user: { id: string; name: string; email?: string } | null;
    customer_phone?: string | null;
}

export default function InfoPelangganCard({ user, customer_phone }: Props) {
    return (
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                        Pelanggan
                    </p>
                    <h3 className="mt-1 text-sm font-semibold tracking-tight text-text">
                        Info Pelanggan
                    </h3>
                </div>
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/10">
                    <User className="size-4 text-primary" />
                </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                    <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Nama
                    </div>
                    <div className="mt-2 font-semibold text-text">
                        {user?.name ?? 'Pelanggan Tamu'}
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-100">
                        <Phone className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            No. HP
                        </div>
                        <div className="mt-1 text-sm font-medium text-text">
                            {customer_phone ?? '—'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-100">
                        <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Email
                        </div>
                        <div className="mt-1 truncate text-sm font-medium text-text">
                            {user?.email ?? '—'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
