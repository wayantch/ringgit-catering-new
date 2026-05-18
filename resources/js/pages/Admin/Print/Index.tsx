import { Head, router } from '@inertiajs/react';
import React from 'react';
import PrintFilterBar from '@/Components/Admin/Print/PrintFilterBar';
import PrintToolbar from '@/Components/Admin/Print/PrintToolbar';
import PrintPreview from '@/Components/Admin/Print/PrintPreview';

interface PrintItem {
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    qty: number;
    unit: string;
    kondisi_produk: string;
    adat_type: string | null;
    keterangan: string;
    jam: string;
    order_number: string;
    booking_date: string;
    order_type: string;
    notes: string | null;
}

interface PrintGroup {
    customer_name: string;
    total_order: number;
    total_items: number;
    items: PrintItem[];
}

interface Props {
    printData: PrintGroup[];
    filters: {
        dari?: string;
        sampai?: string;
        tanggal?: string;
    };
}

export default function Index({ printData, filters }: Props) {
    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get('/admin/print', params, { preserveState: true });
    };

    const resetFilter = () => {
        router.get('/admin/print', {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-bg">
            <Head title="Print Rekap Pesanan" />

            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-center text-3xl font-bold text-text">
                        Rekap Pesanan
                    </h1>
                    <p className="mt-1 text-center text-slate-600">
                        Lihat dan cetak daftar menu yang dipesan setiap
                        pelanggan
                    </p>
                </div>

                <div className="no-print flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex-1">
                        <PrintFilterBar
                            filters={filters}
                            onApply={applyFilter}
                            onReset={resetFilter}
                        />
                    </div>
                    <div>
                        <PrintToolbar filters={filters} />
                    </div>
                </div>

                <div className="print-preview-area mt-6">
                    {Array.isArray(printData) && printData.length > 0 ? (
                        <div id="print-area">
                            <PrintPreview printData={printData} />
                        </div>
                    ) : (
                        <div className="no-print flex flex-col items-center gap-3 py-20 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                                <svg
                                    className="h-6 w-6 text-primary"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 9H18V6H6V9Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M4 11H20V18H4V11Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <p className="font-semibold text-text">
                                Tidak ada pesanan untuk dicetak
                            </p>
                            <p className="text-sm text-slate-400">
                                Coba ubah filter tanggal atau pastikan ada
                                pesanan aktif
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
