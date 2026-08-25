import { UtensilsCrossed, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#141a12] px-5 py-12">
            <div className="mx-auto max-w-6xl">
                {/* Map Section */}
                <div className="mb-8 overflow-hidden rounded-2xl">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5148.9552131863065!2d107.0088888294898!3d-6.224581993339801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698ea70edc20ff%3A0x4343bce760fa43!2sRINGGIT%20Catering!5e1!3m2!1sid!2sid!4v1778797039535!5m2!1sid!2sid"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-2xl"
                    />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Company Info */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <UtensilsCrossed size={15} color="#fff" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-white">
                                Ringgit Catering
                            </h3>
                        </div>
                        <p className="text-[13px] leading-relaxed text-white/60">
                            Catering berkualitas dengan cita rasa autentik dan
                            bahan segar pilihan setiap hari.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="mb-4 text-[13px] font-semibold tracking-wide text-white uppercase">
                            Hubungi Kami
                        </h4>
                        <div className="space-y-3">
                            <a
                                href="tel:+62"
                                className="flex items-center gap-2 text-[13px] text-white/60 transition-colors duration-150 hover:text-primary"
                            >
                                <Phone size={14} />
                                081933991986
                            </a>
                            <a
                                href="mailto:info@ringgitcatering.com"
                                className="flex items-center gap-2 text-[13px] text-white/60 transition-colors duration-150 hover:text-primary"
                            >
                                <Mail size={14} />
                                info@ringgitcatering.com
                            </a>

                            <a
                                href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5148.9552131863065!2d107.0088888294898!3d-6.224581993339801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698ea70edc20ff%3A0x4343bce760fa43!2sRINGGIT%20Catering!5e1!3m2!1sid!2sid!4v1778797039535!5m2!1sid!2sid"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[13px] text-white/60 transition-colors duration-150 hover:text-primary"
                            >
                                <MapPin size={14} />
                                Lihat lokasi kami
                            </a>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h4 className="mb-4 text-[13px] font-semibold tracking-wide text-white uppercase">
                            Ikuti Kami
                        </h4>
                        <div className="space-y-2">
                            {[
                                {
                                    name: 'Instagram',
                                    url: '#',
                                },
                                {
                                    name: 'WhatsApp',
                                    url: '#',
                                },
                                {
                                    name: 'Tokopedia',
                                    url: '#',
                                },
                            ].map(({ name, url }) => (
                                <a
                                    key={name}
                                    href={url}
                                    className="block text-[13px] text-white/60 transition-colors duration-150 hover:text-primary"
                                >
                                    {name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-8 border-t border-white/10" />

                {/* Bottom Footer */}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-[12px] text-white/30">
                        &copy; {new Date().getFullYear()} Ringgit Catering.
                    </p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service'].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-[12px] text-white/40 transition-colors duration-150 hover:text-white/60"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
