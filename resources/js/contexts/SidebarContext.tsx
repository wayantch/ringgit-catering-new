import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
    close: () => void;
    open: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SidebarContext.Provider
            value={{
                isOpen,
                setIsOpen,
                toggle: () => setIsOpen((prev) => !prev),
                close: () => setIsOpen(false),
                open: () => setIsOpen(true),
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);

    if (context === undefined) {
        throw new Error('useSidebar must be used within SidebarProvider');
    }

    return context;
}
