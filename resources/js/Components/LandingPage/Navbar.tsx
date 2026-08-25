import { router } from '@inertiajs/react';
import { UtensilsCrossed, Menu, X, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = ['Beranda', 'Tentang', 'Menu', 'Kontak'] as const;

const SECTION_MAP = {
    Beranda: 'hero',
    Tentang: 'features',
    Menu: 'menu',
    Kontak: 'footer',
} as const;

interface NavbarProps {
    scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
    const [activeNav, setActiveNav] = useState('Beranda');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

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

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 40) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 transition-all duration-300 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] ${
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-6 opacity-0'
            }`}
        >
            <div
                className={`flex items-center justify-between gap-4 rounded-full border p-4 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-colors duration-300 sm:px-5 ${
                    scrolled
                        ? 'border-black/10 bg-white/95'
                        : 'border-white/50 bg-white/80'
                }`}
            >
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
                className={`absolute top-full right-0 left-0 mt-3 overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)] transition-all duration-300 md:hidden ${mobileOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="flex flex-col gap-1 px-5 py-4">
                    {NAV_LINKS.map((n) => (
                        <button
                            key={n}
                            onClick={() => handleScroll(n)}
                            className={`cursor-pointer rounded-full border-0 px-4 py-2.5 text-left text-[14px] font-medium transition-colors duration-150 ${activeNav === n ? 'bg-secondary text-primary/80' : 'text-test bg-transparent'}`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            router.visit('/login');
                            setMobileOpen(false);
                        }}
                        className="mt-2 cursor-pointer rounded-full border-0 bg-primary px-4 py-2.5 text-[14px] font-medium text-white"
                    >
                        Pesan sekarang
                    </button>
                </div>
            </div>
        </nav>
    );
}
