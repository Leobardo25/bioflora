import { Instagram, Mail } from 'lucide-react'
import { FaFacebook, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { BRAND, NAV_LINKS } from '../../constants'
import { useSiteConfig } from '../../context/SiteConfigContext'
import Logo from '../ui/Logo'

export default function Footer() {
    const config = useSiteConfig()
    const { whatsapp, instagram, facebook, tiktok } = config || {}

    const hasSocials = whatsapp || instagram || facebook || tiktok

    return (
        <footer id="contacto" className="relative bg-[#062919] border-t border-valex-gris/10">
            {/* Top accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-bioflora-naranja to-transparent opacity-80" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-12">
                    {/* Brand column */}
                    <div className="space-y-5">
                        <div className="-ml-3 mb-2 block">
                            <Logo className="h-16 w-auto" />
                        </div>
                        <p className="text-valex-gris/80 leading-relaxed text-sm">
                            {BRAND.description}
                        </p>
                        {hasSocials && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                {instagram && (
                                    <a
                                        href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-valex-gris/10 flex items-center justify-center text-valex-gris hover:text-bioflora-naranja hover:border-bioflora-naranja/30 hover:bg-bioflora-naranja/5 transition-all duration-300"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}
                                {facebook && (
                                    <a
                                        href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-valex-gris/10 flex items-center justify-center text-valex-gris hover:text-bioflora-naranja hover:border-bioflora-naranja/30 hover:bg-bioflora-naranja/5 transition-all duration-300"
                                        aria-label="Facebook"
                                    >
                                        <FaFacebook className="w-5 h-5" />
                                    </a>
                                )}
                                {tiktok && (
                                    <a
                                        href={tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-valex-gris/10 flex items-center justify-center text-valex-gris hover:text-bioflora-naranja hover:border-bioflora-naranja/30 hover:bg-bioflora-naranja/5 transition-all duration-300"
                                        aria-label="TikTok"
                                    >
                                        <FaTiktok className="w-5 h-5" />
                                    </a>
                                )}
                                {whatsapp && (
                                    <a
                                        href={`https://wa.me/${whatsapp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-valex-gris/10 flex items-center justify-center text-valex-gris hover:text-bioflora-naranja hover:border-bioflora-naranja/30 hover:bg-bioflora-naranja/5 transition-all duration-300"
                                        aria-label="WhatsApp"
                                    >
                                        <FaWhatsapp className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation column */}
                    <div className="space-y-5">
                        <h3 className="font-serif font-semibold text-lg text-bioflora-naranja">
                            Navegación
                        </h3>
                        <div className="flex flex-col gap-3">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-valex-gris/70 hover:text-bioflora-naranja text-sm transition-colors duration-300"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Policies column */}
                    <div className="space-y-5">
                        <h3 className="font-serif font-semibold text-lg text-bioflora-naranja">
                            Políticas de Tienda
                        </h3>
                        <div className="flex flex-col gap-3">
                            <Link to="/politica/refunds" className="text-valex-gris/70 hover:text-bioflora-naranja text-sm transition-colors duration-300">
                                Política de Reembolsos
                            </Link>
                            <Link to="/politica/shipping" className="text-valex-gris/70 hover:text-bioflora-naranja text-sm transition-colors duration-300">
                                Política de Envíos
                            </Link>
                            <Link to="/politica/privacy" className="text-valex-gris/70 hover:text-bioflora-naranja text-sm transition-colors duration-300">
                                Política de Privacidad
                            </Link>
                            <Link to="/politica/terms" className="text-valex-gris/70 hover:text-bioflora-naranja text-sm transition-colors duration-300">
                                Términos de Servicio
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-valex-gris/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-valex-gris/40 text-xs">
                        {BRAND.copyright}
                    </p>
                    <p className="text-valex-gris/30 text-xs">
                        {BRAND.tagline}
                    </p>
                </div>
            </div>
        </footer>
    )
}
