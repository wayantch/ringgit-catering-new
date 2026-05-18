import { Star } from 'lucide-react';
import FadeUp from '../Common/FadeUp';

const TESTIMONIALS = [
    {
        name: 'Rina K.',
        role: 'Event organizer',
        text: 'Tamu puas semua, makanannya enak banget dan penyajiannya rapi. Pasti order lagi!',
        stars: 5,
    },
    {
        name: 'Darmawan',
        role: 'HRD Manager',
        text: 'Tepat waktu dan rasanya konsisten setiap minggu. Sangat direkomendasikan!',
        stars: 5,
    },
    {
        name: 'Sari Dewi',
        role: 'Pelanggan setia',
        text: 'Arisan keluarga jadi lebih berkesan, semua suka dan nambah terus!',
        stars: 5,
    },
];

export default function Testimonials() {
    return (
        <section className="bg-[#1a2218] px-5 py-16">
            <div className="mx-auto max-w-6xl">
                <FadeUp className="mb-10 text-center">
                    <p className="mb-3 text-[11px] font-semibold tracking-widest text-[#a8bd96] uppercase">
                        Testimoni
                    </p>
                    <h2 className="text-2xl font-light text-white md:text-3xl">
                        Apa kata{' '}
                        <span className="font-medium text-[#a8bd96]">
                            pelanggan kami
                        </span>
                    </h2>
                </FadeUp>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {TESTIMONIALS.map(({ name, role, text, stars }, i) => (
                        <FadeUp key={name} delay={i * 0.1}>
                            <div className="rounded-2xl border border-white/10 bg-white/6 p-5 transition-colors duration-200 hover:bg-white/9">
                                <div className="mb-3 flex gap-0.5">
                                    {[...Array(stars)].map((_, j) => (
                                        <Star
                                            key={j}
                                            size={13}
                                            fill="#c97c5d"
                                            color="#c97c5d"
                                        />
                                    ))}
                                </div>
                                <p className="mb-4 text-[13px] leading-relaxed text-white/75">
                                    "{text}"
                                </p>
                                <div className="flex items-center gap-2.5 border-t border-white/8 pt-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/30 text-[11px] font-bold text-[#a8bd96]">
                                        {name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-medium text-white">
                                            {name}
                                        </p>
                                        <p className="text-[11px] text-white/40">
                                            {role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
