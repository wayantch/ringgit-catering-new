import { Head, router } from '@inertiajs/react';
import React from 'react';
import PrintAreaDapur from '../../../Components/Admin/Print/PrintAreaDapur';
import PrintAreaOwner from '../../../Components/Admin/Print/PrintAreaOwner';
import PrintFilterBar from '../../../Components/Admin/Print/PrintFilterBar';

type PrintFilters = {
    dari?: string;
    sampai?: string;
    tanggal?: string;
};

interface PrintRow {
    order_id: number;
    name: string;
    qty: number;
    qty_label: string;
    price: number;
    keterangan: string;
}

interface PrintGroup {
    booking_date: string;
    booking_date_label: string;
    orders: Array<{
        order_id: number;
        customer_name: string;
        payment_method: string;
        payment_date: string;
        jam: string;
        pickup_delivery: string;
        item_count: number;
        grand_total: number;
        items: PrintRow[];
    }>;
    row_count: number;
    grand_total: number;
}

interface Props {
    printData: {
        groups: PrintGroup[];
        grand_total: number;
        has_filters: boolean;
        range_exceeded: boolean;
    };
    filters: PrintFilters;
}

export default function Index({ printData, filters }: Props) {
    const hasResults = printData.groups.length > 0;

    const applyFilter = (params: PrintFilters) => {
        router.get('/admin/print', params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        router.get(
            '/admin/print',
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const triggerPrint = (mode: 'dapur' | 'owner') => {
        if (typeof window === 'undefined') {
            return;
        }

        const body = document.body;
        const activeClass = mode === 'dapur' ? 'print-dapur' : 'print-owner';

        body.classList.add('active', activeClass);

        const cleanup = () => {
            body.classList.remove('active', 'print-dapur', 'print-owner');
            window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup, { once: true });
        window.requestAnimationFrame(() => window.print());
    };

    const hasFilter = printData.has_filters;

    return (
        <div className="min-h-screen bg-bg px-4 py-6 text-text">
            <Head title="Print Pesanan" />

            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 16mm 14mm;
                }

                @media print {
                    html,
                    body {
                        background: #fff !important;
                        color: #000 !important;
                        font-family: 'Courier New', monospace !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    body.active .no-print,
                    body.active .print-bar,
                    body.active .print-help {
                        display: none !important;
                    }

                    body.active.print-dapur #area-owner,
                    body.active.print-owner #area-dapur {
                        display: none !important;
                    }

                    body.active.print-dapur #area-dapur,
                    body.active.print-owner #area-owner {
                        display: block !important;
                    }

                    .print-surface {
                        box-shadow: none !important;
                        border: none !important;
                        background: transparent !important;
                    }

                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }

                    th,
                    td {
                        border: 1px solid #000 !important;
                    }

                    .page-break-before {
                        page-break-before: always;
                    }
                }
            `}</style>

            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <section className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
                                Print Admin
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                                Print Pesanan Diproses
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Pilih tanggal spesifik atau range maksimal 7
                                hari untuk menampilkan data pesanan yang siap
                                dicetak.
                            </p>
                        </div>

                        {hasFilter && hasResults ? (
                            <div className="print-bar flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => triggerPrint('dapur')}
                                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-18px_rgba(122,143,107,0.75)] transition hover:bg-primary-600"
                                >
                                    Print Dapur
                                </button>
                                <button
                                    type="button"
                                    onClick={() => triggerPrint('owner')}
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Print Owner
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-5">
                        <PrintFilterBar
                            filters={filters}
                            onApply={applyFilter}
                            onReset={resetFilter}
                        />
                    </div>
                </section>

                {!hasFilter ? (
                    <div className="print-help rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500 shadow-sm">
                        Pilih tanggal spesifik atau range tanggal untuk memulai
                        preview print.
                    </div>
                ) : printData.range_exceeded ? (
                    <div className="print-help rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
                        Range tanggal maksimal 7 hari.
                    </div>
                ) : hasResults ? (
                    <div className="space-y-6">
                        <div
                            id="area-dapur"
                            className="print-dapur print-surface rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <PrintAreaDapur groups={printData.groups} />
                        </div>

                        <div
                            id="area-owner"
                            className="print-owner print-surface rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <PrintAreaOwner groups={printData.groups} />
                        </div>
                    </div>
                ) : (
                    <div className="print-help rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm">
                        <p className="text-sm font-medium text-slate-700">
                            Tidak ada pesanan dengan status diproses untuk
                            filter ini.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
