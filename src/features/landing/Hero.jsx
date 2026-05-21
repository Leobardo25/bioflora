import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { HERO_CONTENT } from '../../constants'
import { useSiteConfig } from '../../context/SiteConfigContext'
import { heroReveal, fadeInUp, VALEX_TRANSITION, VALEX_SLOW } from '../../constants/motion'

export default function Hero() {
    return (
        <section className="relative min-h-[100dvh] w-full bg-valex-negro flex flex-col items-center justify-center overflow-hidden snap-start pt-24 pb-16 lg:py-0">

            {/* Background Video Animado - Nitidez con Profundidad */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover select-none filter brightness-[0.62] contrast-[1.02] transform-gpu"
                >
                    <source src="/videos/hero_background_optimized.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 w-full h-full backdrop-blur-[2px] transform-gpu" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto mt-0 lg:-mt-16 pb-12 lg:pb-0">
                <HeroTitle />
                <div className="mt-10 w-full flex justify-center">
                    <HeroCTA />
                </div>

                {/* Redes Móviles Integradas (Inmediatamente debajo del CTA para evitar problemas de Overflow/Scroll) */}
                <div className="flex justify-center mt-6 lg:hidden w-full">
                    <HeroSocials />
                </div>

                {/* Redes flotantes en Desktop */}
                <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-6 mr-8">
                    <HeroSocials vertical />
                </div>
            </div>

            {/* Scroll Indicator - Habilitado para todas las resoluciones (Mobile + Desktop) */}
            <motion.div
                className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => document.getElementById('colecciones')?.scrollIntoView({ behavior: 'smooth' })}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 1 }}
            >
                <span className="text-valex-hueso/55 text-[10px] uppercase tracking-[0.3em] font-sans group-hover:text-valex-bronce transition-colors drop-shadow-md">Descubre</span>
                <div className="w-[1px] h-12 bg-valex-bronce/40 relative overflow-hidden">
                    <motion.div
                        className="w-full h-full bg-valex-bronce"
                        animate={{ y: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </section>
    )
}

/* Sub-components to keep Hero clean */

function HeroTitle() {
    const { heroTitle } = useSiteConfig()
    const title = heroTitle || ''
    
    // Mejor lógica de separación: Si el usuario usa un "*", lo usamos como separador de color.
    // Si no, tomamos las últimas 2 o 3 palabras para que sean naranjas, evitando que desaparezcan.
    let main = ''
    let accent = ''

    if (title.includes('*')) {
        const parts = title.split('*')
        main = parts[0].trim()
        accent = parts[1]?.trim() || ''
    } else {
        const words = title.split(' ')
        // Si hay más de 3 palabras, las últimas 3 van en naranja (ej: "en su hogar").
        // Si hay menos, la mitad.
        const splitIndex = words.length > 3 ? words.length - 3 : Math.max(1, words.length - 1)
        main = words.slice(0, splitIndex).join(' ')
        accent = words.slice(splitIndex).join(' ')
    }

    return (
        <motion.div
            variants={heroReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            transition={VALEX_SLOW}
            className="flex items-center pt-6 justify-center w-full"
        >
            <h1 className="text-valex-hueso leading-[1.15] tracking-tight drop-shadow-lg flex flex-col gap-2 sm:gap-4 w-full">
                <span className="block font-serif font-bold text-[36px] sm:text-5xl md:text-6xl lg:text-7xl break-words whitespace-normal">{main}</span>
                {accent && (
                    <span className="block font-serif italic font-medium text-[36px] sm:text-5xl md:text-6xl lg:text-7xl text-bioflora-naranja drop-shadow-[0_2px_12px_rgba(248,151,29,0.45)] break-words whitespace-normal mt-[-0.2em] sm:mt-0">
                        {accent}
                    </span>
                )}
            </h1>
        </motion.div>
    )
}

function HeroCTA() {
    const { whatsapp } = useSiteConfig()
    return (
        <motion.div
            variants={heroReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            transition={VALEX_SLOW}
            className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
        >
            <Link to="/tienda" className="inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm px-8 py-3.5 sm:px-10 sm:py-4 rounded-lg bg-bioflora-morado text-white hover:bg-bioflora-morado/80 shadow-lg hover:shadow-bioflora-morado/40 transition-all duration-300 tracking-wide w-full sm:w-auto">
                Ver Catálogo
            </Link>
            {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-sans font-medium text-sm px-8 py-3.5 sm:px-10 sm:py-4 rounded-lg border border-bioflora-verde/40 text-valex-hueso/80 hover:text-white hover:border-bioflora-verde hover:bg-bioflora-verde/15 transition-all duration-300 tracking-wide w-full sm:w-auto">
                    <FaWhatsapp className="w-5 h-5 text-bioflora-verde" />
                    Contactar por WhatsApp
                </a>
            )}
        </motion.div>
    )
}

function HeroSocials({ vertical }) {
    const { instagram, tiktok, facebook } = useSiteConfig()

    const socials = []
    if (instagram) socials.push({ icon: FaInstagram, href: instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`, label: 'Instagram', colorClass: 'text-[#E1306C] border-[#E1306C]/30 hover:bg-[#E1306C]/10' })
    if (tiktok) socials.push({ icon: FaTiktok, href: tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok}`, label: 'TikTok', colorClass: 'text-white border-white/30 hover:bg-white/10' })
    if (facebook) socials.push({ icon: FaFacebookF, href: facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`, label: 'Facebook', colorClass: 'text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10' })

    if (socials.length === 0) return null

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            transition={VALEX_TRANSITION}
            className={`flex items-center gap-4 pt-2 ${vertical ? 'flex-col' : ''}`}
        >
            {socials.map((social, i) => {
                const Icon = social.icon
                return (
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={`w-10 h-10 rounded-full flex items-center justify-center border bg-white/5 transition-all duration-300 hover:scale-110 ${social.colorClass}`}>
                        <Icon className="w-5 h-5" />
                    </a>
                )
            })}
        </motion.div>
    )
}
