import {
    Award,
    Flame,
    ClipboardList,
    Truck,
    CheckCircle2,
    ChefHat,
    Utensils,
    UtensilsCrossed,
} from 'lucide-react';
import FadeUp from '../Common/FadeUp';

const FEATURES = [
    {
        Icon: Award,
        title: 'Rasa autentik',
        desc: 'Bumbu rempah pilihan, resep turun-temurun yang tidak pernah mengecewakan.',
    },
    {
        Icon: Flame,
        title: 'Olahan premium',
        desc: 'Bahan segar dipilih setiap hari dengan standar dapur profesional.',
    },
    {
        Icon: ClipboardList,
        title: 'Custom order',
        desc: 'Porsi, menu, dan jadwal bisa disesuaikan penuh sesuai kebutuhan.',
    },
    {
        Icon: Truck,
        title: 'Antar tepat waktu',
        desc: 'Armada siap antar ke lokasi dengan kemasan higienis dan rapi.',
    },
];

const WHY = [
    'Bahan segar pilihan setiap hari',
    'Tim koki berpengalaman 8+ tahun',
    'Kemasan higienis & ramah lingkungan',
    'Harga transparan, tanpa biaya tersembunyi',
];

export default function Features() {
    return (
        <section className="relative z-10 flex h-screen items-center overflow-hidden rounded-t-[36px] bg-secondary px-5 py-16">
            {/* Left decorative icons */}
            <ChefHat
                size={120}
                className="pointer-events-none absolute top-32 -rotate-12 left-32 text-primary/15"
            />
            <Utensils
                size={80}
                className="pointer-events-none absolute bottom-32 left-8 rotate-45 text-primary/10"
            />

            {/* Right decorative icons */}
            <UtensilsCrossed
                size={100}
                className="pointer-events-none absolute top-1/3 right-12 text-accent/12"
            />
            <ChefHat
                size={90}
                className="pointer-events-none absolute right-20 bottom-16 rotate-12 text-accent/10"
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="mb-12 items-start justify-between gap-12 md:flex">
                    <FadeUp className="mb-6 md:mb-0 md:w-1/2">
                        <p className="mb-3 text-[11px] font-semibold tracking-widest text-primary uppercase">
                            Kenapa kami
                        </p>
                        <h2 className="text-test text-3xl font-light tracking-tight md:text-7xl">
                            Hidangan yang
                            <br />
                            <span className="font-semibold">
                                berbicara rasa
                            </span>
                        </h2>
                    </FadeUp>
                    <FadeUp delay={0.1} className="md:w-1/2">
                        <p className="mt-2 text-[15px] leading-relaxed text-[#888]">
                            Kami percaya makanan yang baik dimulai dari bahan
                            yang baik. Setiap sajian dibuat dengan penuh
                            perhatian — dari dapur kami langsung ke meja makan
                            Anda.
                        </p>
                        <div className="mt-5 space-y-2.5">
                            {WHY.map((w) => (
                                <div
                                    key={w}
                                    className="flex items-center gap-2.5"
                                >
                                    <CheckCircle2 size={15} color="#7a8f6b" />
                                    <span className="text-[13px] text-[#555]">
                                        {w}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </FadeUp>
                </div>

                {/* feature cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {FEATURES.map(({ Icon, title, desc }, i) => (
                        <FadeUp key={title} delay={i * 0.08}>
                            <div className="cursor-default rounded-2xl border border-black/5 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                                    <Icon size={17} color="#7a8f6b" />
                                </div>
                                <h3 className="text-test mb-1.5 text-[14px] font-semibold">
                                    {title}
                                </h3>
                                <p className="text-[13px] leading-relaxed text-[#888]">
                                    {desc}
                                </p>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
