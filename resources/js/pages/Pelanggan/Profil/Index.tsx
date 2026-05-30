import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import ProfilHeader from '@/Components/Pelanggan/ProfilHeader';
import ProfilMenuList from '@/Components/Pelanggan/ProfilMenuList';
import PelangganLayout from '@/Layouts/PelangganLayout';

interface Props extends PageProps {
    user: {
        name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
    };
    stats: {
        total_orders: number;
        total_spent: string | number;
        member_since: string;
        loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
        loyalty_completed_orders: number;
        loyalty_min_orders: number | null;
        loyalty_progress_percent: number | null;
        loyalty_is_eligible: boolean;
        loyalty_has_redeemed: boolean;
    };
}

function Index({ user, stats }: Props) {
    return (
        <>
            <Head title="Profil" />
            <div className="bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_28%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)] text-text">
                <div>
                    <ProfilHeader user={user} stats={stats} />
                    <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-10 sm:px-8 sm:pb-12">
                        <ProfilMenuList
                            currentName={user.name}
                            currentPhone={user.phone ?? ''}
                            currentAddress={user.address ?? ''}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
