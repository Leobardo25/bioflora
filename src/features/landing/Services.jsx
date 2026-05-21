import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa'
import { Hand } from 'lucide-react'
import { useSiteConfig } from '../../context/SiteConfigContext'

const ACTIVITIES = [
    {
        id: 'senderos',
        title: 'Senderos Botánicos',
        short: 'Descubre la magia de la naturaleza',
        description: 'Recorrido por jardines con flores vibrantes y rincones de calma. Ideal para amantes de la naturaleza y fotógrafos. Autoguiado o con reservación.',
        includes: ['Recorrido autoguiado o guía con reserva', 'Para todas las edades'],
        img: '/images/activities/senderos.png',
    },
    {
        id: 'aves',
        title: 'Avistamiento de Aves',
        short: 'Un paraíso lleno de vida',
        description: 'Observa una gran variedad de aves en su hábitat natural, desde colibríes hasta aves de canto melodioso en espacios tranquilos y seguros.',
        includes: ['Ideal para fotógrafos', 'Espacios tranquilos'],
        img: '/images/activities/aves.png',
    },
    {
        id: 'obs_orquideas',
        title: 'Observación de Orquídeas',
        short: 'Vive la magia en el jardín',
        description: 'Recorrido guiado donde conocerás de cerca la belleza, variedad y secretos de estas flores exóticas.',
        includes: ['Cupos limitados', 'Requiere reserva'],
        img: '/images/activities/obs_orquideas.png',
    },
    {
        id: 'tour_orquideas',
        title: 'Tour Especializado Orquídeas',
        short: 'Para amantes de la botánica',
        description: 'Caminatas interpretativas y observación de orquídeas nativas e híbridas. Duración: 1 hora y 30 mins.',
        includes: ['Talleres de cultivo', 'Guías expertos'],
        img: '/images/activities/tour_orquideas.png',
    },
    {
        id: 'vainilla',
        title: 'Tour de la Vainilla',
        short: 'El origen de una especia mágica',
        description: 'Recorridos por plantaciones, polinización manual, secado y degustación de productos artesanales. Duración: 2 horas aprox.',
        includes: ['Polinización manual', 'Degustaciones incluidas'],
        img: '/images/activities/vainilla.png',
    },
    {
        id: 'alimentacion',
        title: 'Servicio de Alimentación',
        short: 'Sabores que complementan tu viaje',
        description: 'Menús frescos y nutritivos con ingredientes locales. Tacos de pollo con arroz, frijoles y guacamole.',
        includes: ['Opciones vegetarianas/sin gluten', 'Bajo reservación'],
        img: '/images/activities/alimentacion.png',
    }
]

/* ─── Constantes de Layout ─── */
const CARD_GAP = 24           // gap-6 = 24px
const CARD_W_MOBILE = 0.75    // 75vw en celular para que asome la siguiente tarjeta
const CARD_W_DESKTOP = 460    // px en desktop
const PADDING_LEFT = 24       // px-6

export default function Services() {
    const { whatsapp } = useSiteConfig()
    const sectionRef = useRef(null)
    const trackRef = useRef(null)
    const [travel, setTravel] = useState(0)
    
    // Swipe Hint State
    const [showHint, setShowHint] = useState(false)
    const touchStartRef = useRef({ x: 0, y: 0 })

    // Medir el ancho real de la pista y calcular cuántos píxeles debe viajar
    useEffect(() => {
        const measure = () => {
            if (!trackRef.current) return
            const trackW = trackRef.current.scrollWidth
            const viewW = window.innerWidth
            // La pista viaja: (su ancho total) - (una pantalla) + padding derecho
            setTravel(Math.max(0, trackW - viewW + PADDING_LEFT))
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    // Lógica para detectar swipe horizontal equivocado
    const handleTouchStart = (e) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const handleTouchEnd = (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return
        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        const deltaX = Math.abs(endX - touchStartRef.current.x)
        const deltaY = Math.abs(endY - touchStartRef.current.y)

        // Si es un swipe claramente horizontal (intentaron mover el carrusel)
        if (deltaX > 40 && deltaY < 40) {
            setShowHint(true)
            setTimeout(() => setShowHint(false), 1800)
        }
    }

    // Framer Motion: Lee el progreso del scroll vertical dentro de la sección
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    })

    // Convierte el progreso vertical (0→1) en movimiento horizontal (0 → -travel px)
    const x = useTransform(scrollYProgress, [0, 1], [0, -travel])

    return (
        <section
            ref={sectionRef}
            id="actividades"
            className="relative bg-valex-negro border-t border-valex-bronce/10"
            style={{ height: `${ACTIVITIES.length * 100}vh` }}
        >
            {/* Aviso Flotante (Fallback Hint) */}
            <AnimatePresence>
                {showHint && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-valex-negro/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none"
                    >
                        <motion.div 
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: -40, opacity: [0, 1, 1, 0] }} 
                            transition={{ repeat: Infinity, duration: 1.0, ease: "easeOut" }}
                            className="flex flex-col items-center gap-6"
                        >
                            <Hand className="w-24 h-24 text-bioflora-morado" strokeWidth={1.5} />
                        </motion.div>
                        <h3 className="font-serif text-2xl md:text-3xl text-valex-hueso mt-12 tracking-wide drop-shadow-lg text-center absolute bottom-1/3">
                            Desliza hacia arriba<br/>
                            <span className="text-sm font-sans font-light text-valex-gris/80">para explorar el carrusel</span>
                        </h3>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Frame: se pega al viewport mientras dura el scroll */}
            <div 
                className="sticky top-0 h-[100dvh] flex flex-col justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >

                {/* Título */}
                <div className="text-center px-4 pt-20 pb-6 md:pt-24 md:pb-8 relative z-20 pointer-events-none">
                    <span className="inline-block text-bioflora-naranja font-sans font-medium text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3">
                        Experiencias Únicas
                    </span>
                    <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-valex-hueso leading-tight">
                        Tours y <span className="text-bioflora-fucsia italic font-medium">Actividades</span>
                    </h2>
                </div>

                {/* Pista Horizontal (GPU-accelerated) */}
                <motion.div
                    ref={trackRef}
                    style={{ x, willChange: 'transform' }}
                    className="flex items-stretch gap-6 px-6 md:px-16 flex-1 min-h-0 py-4"
                >
                    {ACTIVITIES.map((act) => (
                        <div
                            key={act.id}
                            className="group relative overflow-hidden rounded-2xl md:rounded-3xl shrink-0 bg-valex-negro-alt border border-valex-gris/10 shadow-2xl flex flex-col"
                            style={{
                                width: `min(${CARD_W_MOBILE * 100}vw, ${CARD_W_DESKTOP}px)`,
                            }}
                        >
                            {/* Imagen */}
                            <div className="relative w-full h-[45%] md:h-[55%] shrink-0 overflow-hidden">
                                <img
                                    src={act.img}
                                    alt={act.title}
                                    className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out md:group-hover:scale-105 brightness-[0.7] md:group-hover:brightness-[0.45]"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-valex-negro via-valex-negro/30 to-transparent" />
                                
                                {/* Título sobre la imagen */}
                                <div className="absolute bottom-3 left-4 right-4">
                                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-valex-hueso drop-shadow-lg leading-tight">
                                        {act.title}
                                    </h3>
                                    <p className="text-bioflora-naranja font-sans text-[10px] sm:text-xs uppercase tracking-widest font-semibold drop-shadow-md mt-1">
                                        {act.short}
                                    </p>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="flex flex-col flex-1 p-5 md:p-6">
                                <p className="text-valex-gris/70 text-xs sm:text-sm font-light leading-relaxed mb-4 line-clamp-3 md:line-clamp-4">
                                    {act.description}
                                </p>
                                
                                <ul className="space-y-2 mb-4">
                                    {act.includes.map((inc, idx) => (
                                        <li key={idx} className="text-bioflora-naranja text-[11px] sm:text-xs font-sans flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-valex-bronce shrink-0" />
                                            {inc}
                                        </li>
                                    ))}
                                </ul>

                                {whatsapp && (
                                    <a
                                        href={`https://wa.me/${whatsapp}?text=Hola,%20me%20interesa%20reservar:%20${act.title}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto inline-flex items-center gap-2 text-valex-hueso hover:text-bioflora-naranja text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors w-fit group/btn"
                                    >
                                        <FaWhatsapp className="w-4 h-4 text-bioflora-verde group-hover/btn:text-bioflora-naranja transition-colors" />
                                        Reservar
                                        <FaArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
