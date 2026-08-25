import { router } from '@inertiajs/react';
import { Printer, Copy } from 'lucide-react';
import React from 'react';
import { alertSukses, alertError } from '@/lib/alert';

export default function PrintToolbar({
    filters,
}: {
    filters?: { dari?: string; sampai?: string; tanggal?: string };
}) {
    const print = () => {
        // Re-fetch the print data with current filters, allow Inertia to update props,
        // then trigger browser print after successful navigation so DOM is updated.
        router.get('/admin/print', filters ?? {}, {
            preserveScroll: true,
            onSuccess: () => {
                // call print after the page props/component updated
                window.print();
            },
        });
    };

    const copy = async () => {
        const el = document.getElementById('print-area');

        if (!el) {
            return;
        }

        const html = el.innerText;

        try {
            await navigator.clipboard.writeText(html);
            alertSukses('Teks rekap disalin ke clipboard');
        } catch {
            alertError('Gagal menyalin ke clipboard');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={print}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-primary-600 hover:shadow-md active:scale-95"
            >
                <Printer className="h-4 w-4" strokeWidth={2} />
                Cetak
            </button>
            <button
                onClick={copy}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
            >
                <Copy className="h-4 w-4" strokeWidth={2} />
                Copy
            </button>
        </div>
    );
}
