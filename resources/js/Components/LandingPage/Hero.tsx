import { Link } from '@inertiajs/react';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

const STATS = [
    { value: '2.400+', label: 'Pesanan terlayani' },
    { value: '98%', label: 'Kepuasan pelanggan' },
    { value: '8 thn', label: 'Pengalaman' },
];

interface HeroProps {
    heroVis: boolean;
}

export default function Hero({ heroVis }: HeroProps) {
    return (
        <section className="relative flex h-full flex-col justify-center overflow-hidden bg-[#1a2218] pb-16">
            {/* subtle grid lines */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 80px), repeating-linear-gradient(180deg, #fff 0, #fff 1px, transparent 0, transparent 80px)',
                }}
            />

            {/* decorative circles */}
            <div className="absolute -top-24 -right-24 h-105 w-105 rounded-full border border-white/10" />
            <div className="absolute -top-10 -right-10 h-65 w-65 rounded-full border border-white/6" />
            <div className="absolute bottom-20 left-10 h-40 w-40 rounded-full border border-white/6" />

            {/* floating badge */}
            <div
                style={{
                    opacity: heroVis ? 1 : 0,
                    transform: heroVis ? 'translateY(0)' : 'translateY(-12px)',
                    transition:
                        'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
                }}
                className="absolute top-10 right-8 hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm md:flex"
            >
                <div
                    className="h-2 w-2 rounded-full bg-primary"
                    style={{ animation: 'pulse 2s infinite' }}
                />
                <span className="text-xs font-medium text-white/80">
                    Tersedia hari ini
                </span>
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-5">
                {/* eyebrow */}
                <div
                    style={{
                        opacity: heroVis ? 1 : 0,
                        transform: heroVis
                            ? 'translateY(0)'
                            : 'translateY(20px)',
                        transition:
                            'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
                    }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5"
                >
                    <UtensilsCrossed size={12} color="rgba(255,255,255,0.7)" />
                    <span className="text-xs font-medium tracking-wide text-white/70 uppercase">
                        Ringgit Catering
                    </span>
                </div>

                {/* headline */}
                <h1
                    style={{
                        opacity: heroVis ? 1 : 0,
                        transform: heroVis
                            ? 'translateY(0)'
                            : 'translateY(28px)',
                        transition:
                            'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
                    }}
                    className="mb-4 max-w-2xl text-4xl leading-tight font-light tracking-tight text-white md:text-6xl"
                >
                    Catering berkualitas
                    <br />
                    <span className="font-medium text-[#a8bd96]">
                        yang menghadirkan
                    </span>
                    <br />
                    cita rasa terbaik
                </h1>

                <p
                    style={{
                        opacity: heroVis ? 1 : 0,
                        transform: heroVis
                            ? 'translateY(0)'
                            : 'translateY(20px)',
                        transition:
                            'opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s',
                    }}
                    className="mb-8 max-w-md text-[15px] leading-relaxed text-white/55"
                >
                    Dari dapur rumahan ke meja makan Anda — sajian autentik
                    dengan bahan segar setiap hari.
                </p>

                <div
                    style={{
                        opacity: heroVis ? 1 : 0,
                        transform: heroVis
                            ? 'translateY(0)'
                            : 'translateY(20px)',
                        transition:
                            'opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s',
                    }}
                    className="flex flex-wrap items-center gap-3"
                >
                    <Link
                        href="/login"
                        className="flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-6 py-3 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-primary/80"
                    >
                        Pesan sekarang <ArrowRight size={15} />
                    </Link>
                    <Link
                        href="/login"
                        className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white/15"
                    >
                        Lihat menu
                    </Link>
                </div>

                {/* stats row */}
                <div
                    style={{
                        opacity: heroVis ? 1 : 0,
                        transition: 'opacity 0.8s ease 0.6s',
                    }}
                    className="mt-12 flex gap-8 border-t border-white/10 pt-8"
                >
                    {STATS.map(({ value, label }) => (
                        <div key={label}>
                            <p className="text-xl font-semibold text-white">
                                {value}
                            </p>
                            <p className="mt-0.5 text-xs text-white/45">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
