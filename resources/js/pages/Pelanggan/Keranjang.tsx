import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PageContainer from '@/Components/Pelanggan/PageContainer';
import PageHeader from '@/Components/Pelanggan/PageHeader';
import SectionDivider from '@/Components/Pelanggan/SectionDivider';
import PelangganLayout from '@/Layouts/PelangganLayout';
import CartEmpty from '../../Components/Pelanggan/CartEmpty';
import CartItemCard from '../../Components/Pelanggan/CartItemCard';
import type { CartItem } from '../../Components/Pelanggan/CartItemCard';
import OrderSummaryCard from '../../Components/Pelanggan/OrderSummaryCard';

interface Summary {
    subtotal: number | string | null;
    has_pending_price?: boolean;
    unique_code: number | string | null;
    total: number | string | null;
    dp_percentage: number;
    dp_amount?: number | string | null;
    dp_unique_code?: number | string | null;
    remaining?: number | string | null;
    remaining_amount?: number | string | null;
    cashback_eligible?: boolean;
    cashback_breakdown?: Array<{
        menu_name: string;
        kode: 'A' | 'B' | 'C';
        cashback: number;
    }>;
    total_cashback?: number;
    ongkir_subsidi_eligible?: boolean;
    ongkir_subsidi_max?: number | null;
}

interface Props extends PageProps {
    cartItems: CartItem[];
    summary: Summary;
}

function formatKg(value: number): string {
    return `${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 1,
    }).format(value)} kg`;
}

function getCartWeight(item: CartItem): number {
    return item.menu_type === 'timbang_hidup' ? Number(item.berat) : 0;
}

export default function KeranjangPage({ cartItems, summary }: Props) {
    const isEmpty = cartItems.length === 0;
    const timbangItems = cartItems.filter(
        (item) => item.menu_type === 'timbang_hidup',
    );
    const eceranItems = cartItems.filter((item) => item.menu_type === 'eceran');
    const totalBerat = timbangItems.reduce(
        (total, item) => total + getCartWeight(item),
        0,
    );

    return (
        <>
            <Head title="Keranjang Belanja" />

            <PageContainer className="space-y-5 lg:space-y-6">
                <PageHeader
                    title="Keranjang"
                    description={
                        isEmpty
                            ? 'Belum ada item di keranjang'
                            : cartItems.length +
                              ' item' +
                              (totalBerat > 0
                                  ? ' \u00b7 ' + formatKg(totalBerat)
                                  : '')
                    }
                />

                {isEmpty ? (
                    <CartEmpty />
                ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
                        <div className="space-y-5">
                            {timbangItems.length > 0 && (
                                <div className="space-y-3">
                                    <SectionDivider
                                        label="Timbang Hidup"
                                        count={timbangItems.length}
                                    />
                                    {timbangItems.map((item) => (
                                        <CartItemCard
                                            key={item.id}
                                            item={item}
                                        />
                                    ))}
                                </div>
                            )}

                            {eceranItems.length > 0 && (
                                <div className="space-y-3">
                                    <SectionDivider
                                        label="Eceran & Paket"
                                        count={eceranItems.length}
                                    />
                                    {eceranItems.map((item) => (
                                        <CartItemCard
                                            key={item.id}
                                            item={item}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:sticky lg:top-36">
                            <OrderSummaryCard
                                summary={summary}
                                cartItems={cartItems}
                            />
                        </div>
                    </div>
                )}
            </PageContainer>
        </>
    );
}

KeranjangPage.layout = (page: ReactNode) => (
    <PelangganLayout>{page}</PelangganLayout>
);
