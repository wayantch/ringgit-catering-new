import type { PageProps } from '@inertiajs/core';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import type { ReactNode } from 'react';
import PageContainer from '@/Components/Pelanggan/PageContainer';
import PageHeader from '@/Components/Pelanggan/PageHeader';
import PesananAktifStrip from '@/Components/Pelanggan/PesananAktifStrip';
import { isOrderActive } from '@/constants/orderStatus';
import type { OrderStatus } from '@/constants/orderStatus';
import PelangganLayout from '@/Layouts/PelangganLayout';
import { menu } from '@/routes/user';
import keranjang from '@/routes/user/keranjang';
import pesanan from '@/routes/user/pesanan';
import type { RouteDefinition } from '@/wayfinder';

interface BerandaOrder {
    id: string;
    hashid: string;
    order_number: string;
    order_status: OrderStatus;
    total_amount: string | number;
    booking_date: string;
}

interface Props extends PageProps {
    recentOrders: BerandaOrder[];
    user: { name: string };
}

const SHORTCUTS = [
    {
        name: 'Lihat menu',
        description: 'Timbang hidup, paket & babi adat',
        icon: UtensilsCrossed,
        href: menu(),
    },
    {
        name: 'Keranjang',
        description: 'Lanjutkan pesanan yang tersimpan',
        icon: ShoppingCart,
        href: keranjang.index(),
    },
    {
        name: 'Pesanan saya',
        description: 'Pantau status dan riwayat',
        icon: ClipboardList,
        href: pesanan.index(),
    },
];

function Index({ recentOrders, user }: Props) {
    const activeOrderCount = recentOrders.filter((order) =>
        isOrderActive(order.order_status),
    ).length;

    return (
        <>
            <Head title="Beranda" />

            <PageContainer className="space-y-6 lg:space-y-8">
                <PageHeader
                    title={`Halo, ${user.name}`}
                    description="Pantau pesanan dan lanjutkan pemesanan kapan saja."
                    actions={
                        activeOrderCount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                                {activeOrderCount} pesanan aktif
                            </span>
                        ) : undefined
                    }
                />

                <div className="grid gap-3 sm:grid-cols-3">
                    {SHORTCUTS.map((shortcut) => {
                        const Icon = shortcut.icon;

                        return (
                            <Link
                                key={shortcut.name}
                                href={shortcut.href as RouteDefinition<'get'>}
                                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="size-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-text">
                                        {shortcut.name}
                                    </span>
                                    <span className="block truncate text-xs text-slate-500">
                                        {shortcut.description}
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {recentOrders.length > 0 ? (
                    <PesananAktifStrip orders={recentOrders} />
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                        <p className="text-sm font-medium text-text">
                            Belum ada pesanan
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Pilih menu untuk membuat pesanan pertama kamu.
                        </p>
                        <Link
                            href={menu() as RouteDefinition<'get'>}
                            className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
                        >
                            Lihat menu
                        </Link>
                    </div>
                )}
            </PageContainer>
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
