import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PageContainer from '@/Components/Pelanggan/PageContainer';
import PageHeader from '@/Components/Pelanggan/PageHeader';
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

            <PageContainer className="space-y-5 lg:space-y-6">
                <PageHeader
                    title="Profil"
                    description="Atur data akun dan lihat ringkasan aktivitasmu."
                />

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
                    <ProfilHeader user={user} stats={stats} />

                    <ProfilMenuList
                        currentName={user.name}
                        currentPhone={user.phone ?? ''}
                        currentAddress={user.address ?? ''}
                    />
                </div>
            </PageContainer>
        </>
    );
}

Index.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Index;
