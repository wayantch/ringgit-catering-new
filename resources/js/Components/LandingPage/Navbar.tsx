import { router } from '@inertiajs/react';
import {
    UtensilsCrossed,
    Menu,
    X,
    ArrowRight,
    ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
    scrolled: boolean;
}

interface SectionMap {
    [key: string]: string;
}

export default function Navbar({ scrolled }: NavbarProps) {
    const [activeNav, setActiveNav] = useState('Beranda');
    const [mobileOpen, setMobileOpen] = useState(false);

    const NAV_LINKS = ['Beranda', 'Tentang', 'Menu', 'Kontak'];

    const SECTION_MAP: SectionMap = {
        Beranda: 'hero',
        Tentang: 'features',
        Menu: 'menu',
        Kontak: 'footer',
    };

    const handleScroll = (sectionName: string) => {
        const sectionId = SECTION_MAP[sectionName];
        const element = document.getElementById(sectionId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveNav(sectionName);
            setMobileOpen(false);
        }
    };

    useEffect(() => {
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    // Find matching nav link
                    const navLink = Object.entries(SECTION_MAP).find(
                        ([, id]) => id === sectionId,
                    );

                    if (navLink) {
                        setActiveNav(navLink[0]);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, {
            threshold: 0.5,
        });

        // Observe all sections
        Object.values(SECTION_MAP).forEach((sectionId) => {
            const element = document.getElementById(sectionId);

            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 w-full transition-all duration-300 ${
                scrolled
                    ? 'border-b border-black/10 bg-white/95 shadow-md backdrop-blur-lg'
                    : 'border-b border-white/20 bg-white/40 shadow-none backdrop-blur-md'
            }`}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary">
                        <UtensilsCrossed size={15} color="#fff" />
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight">
                        Ringgit Catering
                    </span>
                </div>

                {/* Desktop nav */}
                <div className="hidden gap-1 md:flex">
                    {NAV_LINKS.map((n) => (
                        <button
                            key={n}
                            onClick={() => handleScroll(n)}
                            className={`cursor-pointer rounded-full border-0 px-4 py-1.5 text-[13px] font-medium transition-all duration-200 outline-none ${activeNav === n ? 'bg-primary text-white' : 'hover:text-test bg-transparent text-[#888]'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden items-center gap-3 md:flex">
                    <button
                        onClick={() => router.visit('/login')}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-primary/80"
                    >
                        Pesan sekarang <ArrowRight size={13} />
                    </button>
                </div>

                {/* Mobile toggle */}
                <button
                    className="text-test cursor-pointer border-0 bg-transparent md:hidden"
                    onClick={() => setMobileOpen((o) => !o)}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            <div
                className={`overflow-hidden border-t border-black/6 bg-white transition-all duration-300 md:hidden ${mobileOpen ? 'max-h-72' : 'max-h-0'}`}
            >
                <div className="flex flex-col gap-1 px-5 py-4">
                    {NAV_LINKS.map((n) => (
                        <button
                            key={n}
                            onClick={() => handleScroll(n)}
                            className={`cursor-pointer rounded-xl border-0 px-4 py-2.5 text-left text-[14px] font-medium transition-colors duration-150 ${activeNav === n ? 'bg-secondary text-primary/80' : 'text-test bg-transparent'}`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            router.visit('/login');
                            setMobileOpen(false);
                        }}
                        className="mt-2 cursor-pointer rounded-xl border-0 bg-primary px-4 py-2.5 text-[14px] font-medium text-white"
                    >
                        Pesan sekarang
                    </button>
                </div>
            </div>
        </nav>
    );
}
