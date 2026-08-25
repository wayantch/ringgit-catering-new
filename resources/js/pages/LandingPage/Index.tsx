import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CTA from '../../Components/LandingPage/CTA';
import Features from '../../Components/LandingPage/Features';
import Footer from '../../Components/LandingPage/Footer';
import Hero from '../../Components/LandingPage/Hero';
import MenuSection from '../../Components/LandingPage/MenuSection';
import Navbar from '../../Components/LandingPage/Navbar';
import Testimonials from '../../Components/LandingPage/Testimonials';

const siteName = 'Ringgit Catering';
const pageTitle = 'Jual Babi Bekasi & Jabodetabek';
const pageDescription =
    'Ringgit Catering melayani jual babi Bekasi, jual babi Jabodetabek, dan aneka olahan segar dengan kualitas terjaga, harga transparan, serta layanan cepat.';
const pageKeywords =
    'jual babi bekasi, jual babi jabodetabek, ringgit catering, babi segar bekasi, catering babi bekasi, olahan babi jabodetabek, daging babi segar';
const canonicalUrl =
    typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000';
const ogImageUrl = `${canonicalUrl.replace(/\/$/, '')}/apple-touch-icon.png`;
const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteName,
    url: canonicalUrl,
    description: pageDescription,
    areaServed: ['Bekasi', 'Jabodetabek'],
};

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
            <Head title={pageTitle}>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={pageKeywords} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={ogImageUrl} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={ogImageUrl} />

                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>
            <Navbar scrolled={scrolled} />

            {/* Hero fixed container */}
            <div className="relative h-screen" id="hero">
                <div className="fixed inset-0 z-0">
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
