import { ReactNode } from 'react';
import BottomNavbar from '@/Components/Pelanggan/BottomNavbar';

interface PelangganLayoutProps {
    children: ReactNode;
}

export default function PelangganLayout({ children }: PelangganLayoutProps) {
    return (
        <div className="min-h-screen bg-bg">
            <main className="pb-24">{children}</main>
            <BottomNavbar />
        </div>
    );
}
