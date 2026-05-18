import { UtensilsCrossed, ArrowRight, Clock } from 'lucide-react';
import FadeUp from '../Common/FadeUp';

export default function CTA() {
    return (
        <section className="bg-secondary px-5 py-16">
            <div className="mx-auto max-w-2xl text-center">
                <FadeUp>
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                        <UtensilsCrossed size={22} color="#fff" />
                    </div>
                    <h2 className="text-test mb-3 text-2xl font-light md:text-3xl">
                        Siap pesan untuk
                        <br />
                        <span className="font-semibold">acara Anda?</span>
                    </h2>
                    <p className="mb-7 text-[14px] leading-relaxed text-[#888]">
                        Hubungi kami sekarang dan konsultasikan kebutuhan
                        catering Anda. Tim kami siap membantu.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button className="flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-6 py-3 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-primary/80">
                            Pesan sekarang <ArrowRight size={15} />
                        </button>
                        <button className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary/30 bg-transparent px-6 py-3 text-[14px] font-medium text-primary transition-colors duration-200 hover:bg-primary/5">
                            <Clock size={15} /> Hubungi kami
                        </button>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
}
