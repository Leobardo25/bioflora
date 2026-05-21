import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { getSiteConfig } from '../../services/siteConfigService'
import { VALEX_TRANSITION } from '../../constants/motion'
import useScrollReveal from '../../hooks/useScrollReveal'

const DEFAULT_FAQS = [
    {
        question: '¿Hacen envíos de plantas vivas a todo Costa Rica?',
        answer: '¡Totalmente! Realizamos envíos rápidos y seguros de plantas, orquídeas y accesorios botánicos a todo Costa Rica utilizando servicios de mensajería especializada que aseguran un manejo delicado de cada ejemplar.'
    },
    {
        question: '¿Cómo garantizan que las plantas y orquídeas lleguen en buen estado?',
        answer: 'Empleamos empaques protectores especialmente diseñados para seres vivos. Cada orquídea y planta de colección es fijada y acondicionada para soportar el transporte, manteniendo la humedad y ventilación óptimas durante todo el trayecto.'
    },
    {
        question: '¿Cómo puedo obtener asesoría para el cuidado de mis plantas?',
        answer: 'Su compra incluye asesoramiento botánico post-compra continuo. Puede contactarnos a través del canal oficial de servicio al cliente y con gusto nuestro equipo de expertos le guiará en temas de riego, iluminación, sustratos y fertilización para que sus plantas prosperen de forma espectacular.'
    },
    {
        question: '¿Puedo visitar los invernaderos para escoger mis plantas en persona?',
        answer: 'Sí, nos encanta recibir visitantes. Contamos con un área de exhibición y venta directa. Debido a nuestros estrictos controles fitosanitarios, te recomendamos agendar tu visita con anticipación para poder brindarte un recorrido guiado por nuestra colección.'
    },
    {
        question: '¿Venden orquídeas y plantas al por mayor para proyectos o reventa?',
        answer: 'Así es. Manejamos precios preferenciales para paisajistas, hoteles, decoradores y viveristas. Al ser productores directos, tenemos la capacidad de proveer grandes volúmenes de especies nativas y exóticas para proyectos de cualquier escala.'
    },
    {
        question: '¿Qué pasa si a mi orquídea se le caen las flores? ¿Se murió?',
        answer: '¡Para nada! Las flores tienen un ciclo de vida natural, y es normal que caigan después de semanas o meses. La planta sigue viva y acumulando energía. Con el cuidado adecuado, volverá a florecer la siguiente temporada.'
    },
    {
        question: '¿Tienen abonos y sustratos especiales para el cultivo?',
        answer: 'Sí, formulamos y vendemos los mismos sustratos de alta gama, musgo Sphagnum y fertilizantes balanceados que utilizamos en nuestros propios invernaderos. En la sección de tienda encontrarás todo el equipo necesario.'
    }
]

export default function FAQ() {
    const [faqs, setFaqs] = useState(DEFAULT_FAQS)
    const [openIndex, setOpenIndex] = useState(null)
    const { ref: headerRef, isInView: headerInView } = useScrollReveal(0.3)

    useEffect(() => {
        getSiteConfig('faq').then((data) => {
            if (data?.items?.length > 0) {
                setFaqs(data.items)
            }
        })
    }, [])

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx)
    }

    return (
        <section id="faq" className="relative py-16 sm:py-24 bg-bioflora-bosque overflow-hidden">
            {/* Elementos decorativos - Glows botánicos */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-bioflora-morado/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-bioflora-naranja/10 blur-[100px] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    className="text-center mx-auto mb-16"
                    initial={{ opacity: 0, y: 25 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={VALEX_TRANSITION}
                >
                    <span className="inline-block text-bioflora-naranja font-sans font-semibold text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-6">
                        Resolvemos tus Dudas
                    </span>
                    <h2 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-bioflora-arena leading-[1.1] mb-6">
                        Preguntas{' '}
                        <span className="text-bioflora-fucsia italic font-medium">Frecuentes</span>
                    </h2>
                    <p className="text-bioflora-arena/60 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
                        Todo lo que necesita saber para el cuidado, envío y cultivo de sus orquídeas y plantas exóticas de colección.
                    </p>
                </motion.div>

                {/* Acordeones */}
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08, duration: 0.5 }}
                        >
                            <div
                                className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
                                    openIndex === idx
                                        ? 'bg-bioflora-tarjeta border-bioflora-morado/40 shadow-[0_8px_30px_rgba(102,45,145,0.15)]'
                                        : 'bg-bioflora-tarjeta/50 border-bioflora-arena/5 hover:border-bioflora-naranja/20 hover:bg-bioflora-tarjeta'
                                }`}
                            >
                                {/* Pregunta */}
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between gap-4 px-6 sm:px-8 py-5 sm:py-6 text-left cursor-pointer focus:outline-none"
                                >
                                    <span className={`font-serif font-bold text-base sm:text-lg transition-colors duration-300 ${
                                        openIndex === idx ? 'text-bioflora-naranja' : 'text-bioflora-arena'
                                    }`}>
                                        {faq.question}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                                            openIndex === idx ? 'bg-bioflora-naranja/10' : 'bg-bioflora-arena/5'
                                        }`}
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${
                                            openIndex === idx ? 'text-bioflora-naranja' : 'text-bioflora-arena/40'
                                        }`} />
                                    </motion.div>
                                </button>

                                {/* Respuesta */}
                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                                        >
                                            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                                                <div className="h-px w-full bg-gradient-to-r from-bioflora-morado/20 via-bioflora-naranja/20 to-transparent mb-5" />
                                                <p className="text-bioflora-arena/70 text-sm sm:text-base font-light leading-relaxed whitespace-pre-line">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
