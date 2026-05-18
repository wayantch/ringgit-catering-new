import { Head } from '@inertiajs/react';
import { ShoppingCart, Calendar, UtensilsCrossed, Users } from 'lucide-react';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import StatCard from '@/Components/StatCard';
import OrderTable from '@/Components/OrderTable';

export default function Dashboard() {
    // Sample data for stats
    const stats = [
        {
            title: 'Total Pesanan',
            value: 1234,
            icon: ShoppingCart,
            color: 'primary' as const,
        },
        {
            title: 'Pesanan Hari Ini',
            value: 24,
            icon: Calendar,
            color: 'accent' as const,
        },
        {
            title: 'Total Menu',
            value: 56,
            icon: UtensilsCrossed,
            color: 'blue' as const,
        },
        {
            title: 'Total Pelanggan',
            value: 342,
            icon: Users,
            color: 'green' as const,
        },
    ];

    // Sample data for orders table
    const orders = [
        {
            id: 1,
            customerName: 'Budi Santoso',
            product: 'Paket Nasi Kuning (20pax)',
            total: 'Rp 500.000',
            status: 'diproses' as const,
            date: '04 May 2026',
        },
        {
            id: 2,
            customerName: 'Siti Nurhaliza',
            product: 'Paket Gado-Gado (30pax)',
            total: 'Rp 750.000',
            status: 'selesai' as const,
            date: '03 May 2026',
        },
        {
            id: 3,
            customerName: 'Ahmad Wijaya',
            product: 'Paket Satay (15pax)',
            total: 'Rp 300.000',
            status: 'pending' as const,
            date: '04 May 2026',
        },
        {
            id: 4,
            customerName: 'Dewi Lestari',
            product: 'Paket Lumpia (25pax)',
            total: 'Rp 400.000',
            status: 'diproses' as const,
            date: '02 May 2026',
        },
        {
            id: 5,
            customerName: 'Rudi Hartono',
            product: 'Paket Rendang (40pax)',
            total: 'Rp 1.200.000',
            status: 'batal' as const,
            date: '01 May 2026',
        },
    ];

    return (
        <>
            <Head title="Production Dashboard" />

            <div className="flex min-h-screen bg-surface">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="ml-64 flex flex-1 flex-col">
                    {/* Topbar */}
                    <Topbar />

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-auto bg-surface p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold text-text">
                                Dashboard
                            </h1>
                            <p className="mt-2 text-sm text-black/60">
                                Overview sistem
                            </p>
                        </div>

                        {/* Stat Cards */}
                        <div className="mb-8 grid grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    title={stat.title}
                                    value={stat.value}
                                    icon={stat.icon}
                                    color={stat.color}
                                />
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-text">
                                    Pesanan Terbaru
                                </h2>
                                <p className="mt-1 text-sm text-black/60">
                                    Daftar pesanan terbaru di sistem
                                </p>
                            </div>

                            <OrderTable orders={orders} />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
