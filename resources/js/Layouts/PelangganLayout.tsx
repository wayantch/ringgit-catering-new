import type { ReactNode } from 'react';
import BottomNavbar from '@/Components/Pelanggan/BottomNavbar';
import TopNavbar from '@/Components/Pelanggan/TopNavbar';

interface PelangganLayoutProps {
    children: ReactNode;
}

/**
 * Customer shell. Desktop navigates through the sticky TopNavbar; mobile and
 * tablet through BottomNavbar. Only one of the two is ever visible, so the
 * bottom padding that clears the tab bar is dropped from `lg` up.
 */
export default function PelangganLayout({ children }: PelangganLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-bg">
            <TopNavbar />

            <main className="flex-1 pb-20 lg:pb-0">{children}</main>

            <BottomNavbar />
        </div>
    );
}
