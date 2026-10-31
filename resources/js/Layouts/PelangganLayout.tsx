import type { ReactNode } from 'react';
import BottomNavbar from '@/Components/Pelanggan/BottomNavbar';
import MobileHeader from '@/Components/Pelanggan/MobileHeader';
import TopNavbar from '@/Components/Pelanggan/TopNavbar';

interface PelangganLayoutProps {
    children: ReactNode;
}

/**
 * Customer shell. Desktop gets the sticky TopNavbar; mobile and tablet get a
 * slim MobileHeader on top and BottomNavbar for navigation. Only one of the two
 * header variants is ever visible, so the bottom padding that clears the tab
 * bar is dropped from `lg` up.
 */
export default function PelangganLayout({ children }: PelangganLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-bg">
            {/* Sits behind everything so the glass chrome has colour to refract
                rather than frosting over flat white. Fixed, so it stays put
                while the content scrolls under the bars. */}
            <div
                aria-hidden="true"
                className="glass-ambient pointer-events-none fixed inset-x-0 top-0 -z-10 h-105"
            />

            <TopNavbar />
            <MobileHeader />

            <main className="flex-1 pb-20 lg:pb-0">{children}</main>

            <BottomNavbar />
        </div>
    );
}
