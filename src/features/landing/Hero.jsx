import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { ShoppingBag, Sparkles } from 'lucide-react'
import { HERO_CONTENT } from '../../constants'
import { useSiteConfig } from '../../context/SiteConfigContext'
import { heroReveal, fadeInUp, VALEX_TRANSITION, VALEX_SLOW } from '../../constants/motion'

// Toggle rápido: true para video antiguo, false para galería de fotos HD sin lag
const USE_VIDEO_BACKGROUND = false

const HERO_BOTANICAL_SLIDES = [
    {
        id: 1,
        name: "Cattleya Rex",
        family: "Orchidaceae (Cattleya)",
        highlight: "Joya Botánica Imperial",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767459/bioflora_products/r0blvwzbfflkp5bwkjlg.jpg"
    },
    {
        id: 2,
        name: "Peristeria elata",
        family: "Flor del Espíritu Santo",
        highlight: "Colección Exótica de Conservación",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767468/bioflora_products/qutwa3dzd8lqzp4wk5y0.jpg"
    },
    {
        id: 3,
        name: "Vanda tricolor x usha",
        family: "Orchidaceae (Vanda)",
        highlight: "Híbrido Selecto de Alta Gama",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767473/bioflora_products/nyaadojdaera8dvclzbu.jpg"
    },
    {
        id: 4,
        name: "Cattleya trianae",
        family: "Orchidaceae (Cattleya)",
        highlight: "Especie Emblema de Colección",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767457/bioflora_products/xthdklhjq8odt7y2crci.jpg"
    },
    {
        id: 5,
        name: "Stanhopea confusa",
        family: "Orchidaceae (Stanhopea / Torito)",
        highlight: "Floración Péndula Perfumada",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767471/bioflora_products/hldjvi8lygreoj7ufpun.jpg"
    },
    {
        id: 6,
        name: "Vanilla tahitensis",
        family: "Orchidaceae (Vainilla)",
        highlight: "Orquídea Trepadora Aromática",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767474/bioflora_products/ce0zhsojsxoptxi0r227.jpg"
    },
    {
        id: 7,
        name: "Trichopilia suavis",
        family: "Orchidaceae (Colección Exótica)",
        highlight: "Fragancia Floral Exquisita",
        image: "https://res.cloudinary.com/dwlziwajv/image/upload/v1786767468/bioflora_products/bxikzs1tnujohdytivp6.jpg"
    }
]

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Ciclo automático suave de diapositivas cada 6 segundos
    useEffect(() => {
        if (USE_VIDEO_BACKGROUND) return
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_BOTANICAL_SLIDES.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [])

    const activePlant = HERO_BOTANICAL_SLIDES[currentSlide]

    return (
        <section className="relative min-h-[100dvh] w-full bg-[#0A0E0C] flex flex-col items-center justify-center overflow-hidden snap-start pt-24 pb-16 lg:py-0">

            {/* Background: Video o Galería Fotográfica Ultra Nítida */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
                {USE_VIDEO_BACKGROUND ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover select-none transform-gpu"
                    >
                        <source src="/videos/hero_background_optimized.mp4" type="video/mp4" />
                    </video>
                ) : (
                    <div className="relative w-full h-full">
                        <AnimatePresence mode="sync">
                            <motion.div
                                key={activePlant.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <img
                                    src={activePlant.image}
                                    alt={activePlant.name}
                                    className="w-full h-full object-cover object-center md:object-[center_right] select-none"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                {/* Sombra lateral limpia y direccional: Oscurece el lado del texto para legibilidad perfecta y deja el lado de la flor 100% nítido, luminoso y natural */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#0A0E0C]/95 via-[#0A0E0C]/65 to-transparent hidden lg:block pointer-events-none" />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-[#0A0E0C]/95 via-[#0A0E0C]/50 to-[#0A0E0C]/40 lg:hidden pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0E0C] to-transparent pointer-events-none" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-start justify-center text-left px-4 sm:px-6 lg:px-8 w-full max-w-[96%] mx-auto mt-0 lg:-mt-16 pb-12 lg:pb-0">
                <HeroTitle />
                <div className="mt-8 sm:mt-10 w-full flex justify-start">
                    <HeroCTA />
                </div>

                {/* Redes Móviles Integradas */}
                <div className="flex justify-start mt-6 lg:hidden w-full">
                    <HeroSocials />
                </div>

                {/* Redes flotantes en Desktop */}
                <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-6 mr-8">
                    <HeroSocials vertical />
                </div>
            </div>

            {/* Badge Flotante de Planta en Exhibición (Inferior Derecha) */}
            {!USE_VIDEO_BACKGROUND && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activePlant.id}
                    transition={{ duration: 0.6 }}
                    className="absolute bottom-8 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
                    <div className="flex flex-col text-left">
                        <span className="text-[12px] font-semibold text-white tracking-wide font-sans">
                            {activePlant.name}
                        </span>
                        <span className="text-[10px] text-[#00D2B4] font-medium tracking-wider uppercase font-sans">
                            {activePlant.family}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Indicadores de diapositivas (Micro-dots interactivos) */}
            {!USE_VIDEO_BACKGROUND && (
                <div className="absolute bottom-8 left-6 sm:left-10 z-20 flex items-center gap-2 pointer-events-auto">
                    {HERO_BOTANICAL_SLIDES.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => setCurrentSlide(idx)}
                            aria-label={`Ver ${slide.name}`}
                            className={`h-2 rounded-full transition-all duration-500 ${
                                idx === currentSlide 
                                    ? 'w-7 bg-gradient-to-r from-[#00A7D0] to-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.6)]' 
                                    : 'w-2 bg-white/30 hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group z-20"
                onClick={() => document.getElementById('colecciones')?.scrollIntoView({ behavior: 'smooth' })}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 1 }}
            >
                <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-sans group-hover:text-[#10B981] transition-colors drop-shadow-md">Descubre</span>
                <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
                    <motion.div
                        className="w-full h-full bg-[#10B981]"
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
            className="flex flex-col items-start pt-6 justify-start w-full text-left max-w-4xl"
        >
            <h1 className="leading-[1.12] tracking-tight flex flex-col gap-2 sm:gap-3 w-full text-left">
                {lines.map((line, idx) => (
                    <span 
                        key={idx} 
                        className="block font-serif font-bold text-[36px] sm:text-5xl md:text-6xl lg:text-7xl text-white break-words whitespace-normal text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                    >
                        {line}
                    </span>
                ))}
                {accent && (
                    <span className="block font-serif italic font-medium text-[38px] sm:text-5xl md:text-6xl lg:text-7xl text-[#10B981] break-words whitespace-normal mt-[-0.15em] sm:mt-0 text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        {accent}
                    </span>
                )}
            </h1>
            {subtitle && (
                <p className="mt-5 font-sans text-white/85 font-semibold text-xs sm:text-sm md:text-[15px] tracking-[0.22em] uppercase max-w-2xl text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
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
            <Link 
                to="/tienda" 
                className="inline-flex items-center justify-center gap-2.5 font-sans font-semibold text-[14px] sm:text-[15px] px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl bg-[#00A7D0] hover:bg-[#0092B8] text-white shadow-lg hover:shadow-xl border border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tracking-wide"
            >
                <ShoppingBag className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-white" />
                Explorar Tienda
            </Link>
            {whatsapp && (
                <a 
                    href={`https://wa.me/${whatsapp}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center gap-2.5 font-sans font-semibold text-[14px] sm:text-[15px] px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl bg-black/50 hover:bg-[#25D366]/20 border border-white/20 hover:border-[#25D366]/70 text-white backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tracking-wide"
                >
                    <FaWhatsapp className="w-[19px] h-[19px] sm:w-[21px] sm:h-[21px] text-[#25D366]" />
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
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={`w-10 h-10 rounded-full flex items-center justify-center border bg-black/40 backdrop-blur-md transition-all duration-300 hover:scale-110 ${social.colorClass}`}>
                        <Icon className="w-5 h-5" />
                    </a>
                )
            })}
        </motion.div>
    )
}

