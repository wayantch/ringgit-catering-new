import { User, Phone, Mail } from 'lucide-react';
import React from 'react';

interface Props {
    user: { id: string; name: string; email?: string } | null;
    customer_phone?: string | null;
}

export default function InfoPelangganCard({ user, customer_phone }: Props) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Info Pelanggan</h3>
            <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/8">
                        <User className="size-4 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">Nama</div>
                        <div className="font-semibold">
                            {user?.name ?? 'Pelanggan Tamu'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Phone className="size-4 text-slate-400" />
                    <div className="text-sm">{customer_phone ?? '—'}</div>
                </div>

                <div className="flex items-center gap-3">
                    <Mail className="size-4 text-slate-400" />
                    <div className="text-sm">{user?.email ?? '—'}</div>
                </div>
            </div>
        </div>
    );
}
