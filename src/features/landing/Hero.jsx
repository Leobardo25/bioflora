import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { Home } from 'lucide-react'
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
                    className="absolute inset-0 w-full h-full object-cover select-none transform-gpu"
                >
                    <source src="/videos/hero_background_optimized.mp4" type="video/mp4" />
                </video>
                {/* Capa de tinte sutil para legibilidad sin oscurecer de más (sin backdrop-blur para evitar drops de FPS) */}
                <div className="absolute inset-0 w-full h-full bg-[#00A7D0]/10 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 w-full h-full bg-valex-negro/15 pointer-events-none" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-start justify-center text-left px-4 sm:px-6 lg:px-8 w-full max-w-[96%] mx-auto mt-0 lg:-mt-16 pb-12 lg:pb-0">
                <HeroTitle />
                <div className="mt-10 w-full flex justify-start">
                    <HeroCTA />
                </div>

                {/* Redes Móviles Integradas (Inmediatamente debajo del CTA para evitar problemas de Overflow/Scroll) */}
                <div className="flex justify-start mt-6 lg:hidden w-full">
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
    const { heroTitle, heroSubtitle } = useSiteConfig()
    const title = heroTitle || ''
    const subtitle = heroSubtitle || ''
    
    // Separamos por '*' para obtener el acento (ej. "Soluciones Verdes")
    const parts = title.split('*').map(p => p.trim()).filter(Boolean)
    let mainText = ''
    let accent = ''

    if (parts.length > 1) {
        accent = parts[parts.length - 1]
        mainText = parts.slice(0, parts.length - 1).join(' ')
    } else if (parts.length === 1) {
        const words = parts[0].split(' ')
        const splitIndex = words.length > 3 ? words.length - 3 : Math.max(1, words.length - 1)
        mainText = words.slice(0, splitIndex).join(' ')
        accent = words.slice(splitIndex).join(' ')
    }

    // Dividimos el texto principal en renglones diferentes si contiene la frase "Innovación Agrobiotecnológica"
    let lines = []
    if (mainText.includes('Innovación Agrobiotecnológica')) {
        const remainder = mainText.replace('Innovación Agrobiotecnológica', '').trim()
        lines = ['Innovación', `Agrobiotecnológica ${remainder}`.trim()]
    } else {
        lines = [mainText]
    }

    return (
        <motion.div
            variants={heroReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            transition={VALEX_SLOW}
            className="flex flex-col items-start pt-6 justify-start w-full text-left"
        >
            <h1 className="text-valex-hueso leading-[1.15] tracking-tight drop-shadow-lg flex flex-col gap-2 sm:gap-4 w-full text-left">
                {lines.map((line, idx) => (
                    <span 
                        key={idx} 
                        className="block font-serif font-bold text-[36px] sm:text-5xl md:text-6xl lg:text-7xl animate-glow-white break-words whitespace-normal text-left"
                    >
                        {line}
                    </span>
                ))}
                {accent && (
                    <span className="block font-serif italic font-medium text-[36px] sm:text-5xl md:text-6xl lg:text-7xl text-[#1EBE5D] animate-glow-green break-words whitespace-normal mt-[-0.2em] sm:mt-0 text-left">
                        {accent}
                    </span>
                )}
            </h1>
            {subtitle && (
                <p className="mt-4 font-sans text-valex-hueso/70 text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase max-w-2xl drop-shadow-md text-left">
                    {subtitle}
                </p>
            )}
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
            className="flex flex-row flex-wrap gap-4 pt-2 justify-start w-full sm:w-auto"
        >
            <Link to="/tienda" className="inline-flex items-center justify-center gap-2 font-sans font-semibold text-[13px] sm:text-[15px] px-6 py-3 sm:px-11 sm:py-4 rounded-xl bg-[#00A7D0]/60 border border-[#00A7D0]/70 text-white hover:bg-[#00A7D0]/75 hover:border-[#00A7D0] shadow-lg hover:shadow-[#00A7D0]/20 transition-all duration-300 tracking-wide w-auto">
                <Home className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-white" />
                Tienda
            </Link>
            {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-sans font-semibold text-[13px] sm:text-[15px] px-6 py-3 sm:px-11 sm:py-4 rounded-xl bg-[#25D366]/40 border border-[#25D366]/50 text-white hover:bg-[#25D366]/55 hover:border-[#25D366] shadow-lg hover:shadow-[#25D366]/20 transition-all duration-300 tracking-wide w-auto">
                    <FaWhatsapp className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#25D366]" />
                    WhatsApp
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
