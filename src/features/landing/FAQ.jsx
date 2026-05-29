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
        <section id="faq" className="relative py-20 sm:py-28 bg-[#F4F9FA] overflow-hidden">
            {/* Elementos decorativos - Glows suaves */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#00A7D0]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#8B198A]/5 blur-[100px] pointer-events-none" />

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    className="text-center mx-auto mb-14 sm:mb-16"
                    initial={{ opacity: 0, y: 25 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={VALEX_TRANSITION}
                >
                    <span className="inline-block text-valex-bronce font-sans font-medium text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4">
                        Resolvemos tus Dudas
                    </span>
                    <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-[1.05] tracking-tight mb-5">
                        Preguntas{' '}
                        <span className="text-[#00A7D0] italic font-medium">Frecuentes</span>
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
                        Todo lo que necesita saber para el cuidado, envío y cultivo de sus orquídeas y plantas exóticas de colección.
                    </p>
                </motion.div>

                {/* Acordeones */}
                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.06, duration: 0.45 }}
                        >
                            <div
                                className={`rounded-xl border transition-all duration-400 overflow-hidden ${
                                    openIndex === idx
                                        ? 'bg-white border-valex-bronce/30 shadow-lg'
                                        : 'bg-white/80 border-gray-200/60 hover:border-valex-bronce/20 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                {/* Pregunta */}
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left cursor-pointer focus:outline-none"
                                >
                                    <span className={`font-sans font-medium text-sm sm:text-base transition-colors duration-300 leading-snug ${
                                        openIndex === idx ? 'text-[#00A7D0]' : 'text-gray-800'
                                    }`}>
                                        {faq.question}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                                            openIndex === idx ? 'bg-[#00A7D0]/10' : 'bg-gray-100'
                                        }`}
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${
                                            openIndex === idx ? 'text-[#00A7D0]' : 'text-gray-400'
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
                                            <div className="px-5 sm:px-7 pb-5 sm:pb-6">
                                                <div className="h-px w-full bg-gradient-to-r from-valex-bronce/20 to-transparent mb-4" />
                                                <p className="text-gray-600 text-sm sm:text-[15px] font-light leading-relaxed whitespace-pre-line">
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
