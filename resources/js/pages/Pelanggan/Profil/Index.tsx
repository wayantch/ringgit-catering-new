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
            <div className="text-text">
                <div className="">
                    <ProfilHeader user={user} stats={stats} />
                    <div className="mx-auto w-full space-y-4 sm:px-8 sm:py-6 md:max-w-7xl">
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
