import React from 'react';
import { konfirmasiStatus } from '@/lib/alert';

interface Props {
    status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
    editable_until?: string | null;
    source: 'admin' | 'pembeli';
    onChangeStatus?: (status: string) => void;
}

export default function AksiStatusCard({
    status,
    editable_until,
    source,
    onChangeStatus,
}: Props) {
    const disabled =
        source === 'pembeli' ||
        (editable_until && new Date() > new Date(editable_until));

    const handleAction = async (target: string) => {
        if (!onChangeStatus) {
            return;
        }

        const conf = await konfirmasiStatus(
            target === 'diproses'
                ? 'Mulai Proses'
                : target === 'selesai'
                  ? 'Tandai Selesai'
                  : 'Batalkan Pesanan',
            '',
            false,
        );

        if (conf.isConfirmed) {
            onChangeStatus(target);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Ubah Status</h3>

            <div className="space-y-3">
                {status === 'baru' && (
                    <div className="space-y-2">
                        <button
                            disabled={disabled}
                            onClick={() => handleAction('diproses')}
                            className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
                        >
                            ▶ Proses Pesanan
                        </button>
                        <button
                            disabled={disabled}
                            onClick={() => handleAction('dibatalkan')}
                            className="w-full rounded-xl border border-red-300 py-2 text-sm font-semibold text-red-600"
                        >
                            ✕ Batalkan
                        </button>
                    </div>
                )}

                {status === 'diproses' && (
                    <div className="space-y-2">
                        <button
                            disabled={disabled}
                            onClick={() => handleAction('selesai')}
                            className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            ✓ Tandai Selesai
                        </button>
                        <button
                            disabled={disabled}
                            onClick={() => handleAction('dibatalkan')}
                            className="w-full rounded-xl border border-red-300 py-2 text-sm font-semibold text-red-600"
                        >
                            ✕ Batalkan
                        </button>
                    </div>
                )}

                {status === 'selesai' && (
                    <div className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                        ✓ Pesanan Selesai
                    </div>
                )}

                {status === 'dibatalkan' && (
                    <div className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        ✕ Pesanan Dibatalkan
                    </div>
                )}
            </div>
        </div>
    );
}
