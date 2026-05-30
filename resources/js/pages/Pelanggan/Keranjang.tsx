import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';
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

function KeranjangHeader({
    count,
    totalBerat,
}: {
    count: number;
    totalBerat: number;
}) {
    return (
        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f7465_0%,#88a07d_52%,#dfd3be_100%)] pb-12 text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)] sm:pb-14">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        'radial-gradient(circle at 14% 25%, rgba(255,255,255,0.18), transparent 38%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 58% 82%, rgba(0,0,0,0.08), transparent 46%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"
            />

            <div className="relative mx-auto w-full max-w-7xl px-4 pt-7 sm:px-8 sm:pt-10">
                <div className="flex items-start justify-between gap-5">
                    <div className="max-w-3xl space-y-4">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white/85 uppercase backdrop-blur-sm sm:text-[11px] sm:tracking-[0.24em]">
                            Ringgit Catering System
                        </span>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                            Keranjang Belanja
                        </h1>
                        <p className="text-sm leading-6 text-white/85 sm:text-base">
                            {count} item aktif · {formatKg(totalBerat)} timbang
                            hidup
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Ubah jumlah
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Hapus item
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                Lanjut checkout
                            </span>
                        </div>
                    </div>

                    <div className="relative shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16">
                            <ShoppingCart className="h-6 w-6 text-white" />
                        </div>
                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-primary">
                                {count > 9 ? '9+' : count}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
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

            <KeranjangHeader count={cartItems.length} totalBerat={totalBerat} />

            <div className="bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_28%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)]">
                <div className="relative mt-8">
                    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8">
                        {isEmpty ? (
                            <CartEmpty />
                        ) : (
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6">
                                <div className="space-y-5">
                                    {timbangItems.length > 0 && (
                                        <div className="space-y-3">
                                            {/* <SectionDivider
                                            label="Timbang Hidup"
                                            count={timbangItems.length}
                                        /> */}
                                            <div className="space-y-3">
                                                {timbangItems.map((item) => (
                                                    <CartItemCard
                                                        key={item.id}
                                                        item={item}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {eceranItems.length > 0 && (
                                        <div className="space-y-3">
                                            <SectionDivider
                                                label="Eceran & Paket"
                                                count={eceranItems.length}
                                            />
                                            <div className="space-y-3">
                                                {eceranItems.map((item) => (
                                                    <CartItemCard
                                                        key={item.id}
                                                        item={item}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:sticky lg:top-4">
                                    <OrderSummaryCard
                                        summary={summary}
                                        cartItems={cartItems}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

KeranjangPage.layout = (page: ReactNode) => (
    <PelangganLayout>{page}</PelangganLayout>
);
