import { ReactNode } from 'react';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import { usePage } from '@inertiajs/react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const page = usePage();
    const user = page.props.auth?.user ?? null;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-bg">
                <Sidebar />
                <div className="flex w-full flex-1 flex-col lg:ml-64">
                    <Topbar user={user} />
                    <main className="flex-1 overflow-y-auto bg-linear-to-br from-white/80 to-primary/10 p-4">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
