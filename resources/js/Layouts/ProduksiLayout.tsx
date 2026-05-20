import type { ReactNode } from 'react';
import ProduksiBottomNavbar from '@/Components/Produksi/ProduksiBottomNavbar';

interface ProduksiLayoutProps {
    children: ReactNode;
}

export default function ProduksiLayout({ children }: ProduksiLayoutProps) {
    return (
        <div className="min-h-screen bg-bg">
            <main className="pb-24">{children}</main>
            <ProduksiBottomNavbar />
        </div>
    );
}
