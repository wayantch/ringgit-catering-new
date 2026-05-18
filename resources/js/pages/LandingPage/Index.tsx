import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CTA from '../../Components/LandingPage/CTA';
import Features from '../../Components/LandingPage/Features';
import Footer from '../../Components/LandingPage/Footer';
import Hero from '../../Components/LandingPage/Hero';
import MenuSection from '../../Components/LandingPage/MenuSection';
import Navbar from '../../Components/LandingPage/Navbar';
import Testimonials from '../../Components/LandingPage/Testimonials';

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    image?: string;
    base_price: number;
    unit: string;
    category_type: string;
    category?: {
        name: string;
        type: string;
    };
}

export default function LandingPage({
    menuItems = [],
}: {
    menuItems?: MenuItem[];
}) {
    const [scrolled, setScrolled] = useState(false);
    const [heroVis, setHeroVis] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setHeroVis(true), 80);
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn);

        return () => {
            clearTimeout(t);
            window.removeEventListener('scroll', fn);
        };
    }, []);

    const handleMenuClick = () => {
        router.visit('/login');
    };

    return (
        <div className="text-test overflow-x-hidden bg-bg pt-16 font-sans">
            <Navbar scrolled={scrolled} />

            {/* Hero fixed container */}
            <div className="relative h-screen" id="hero">
                <div className="fixed inset-0 top-16 z-0">
                    <Hero heroVis={heroVis} />
                </div>
            </div>

            {/* Features & below - layered on top with z-index */}
            <div className="relative z-10">
                <div id="features">
                    <Features />
                </div>
                <div id="menu">
                    <MenuSection
                        menuItems={menuItems}
                        handleMenuClick={handleMenuClick}
                    />
                </div>
                <div id="testimonials">
                    <Testimonials />
                </div>
                <div id="footer">
                    <CTA />
                    <Footer />
                </div>
            </div>

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        </div>
    );
}
