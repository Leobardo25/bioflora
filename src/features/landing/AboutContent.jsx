import { motion } from 'framer-motion'
import { fadeInUp, VALEX_TRANSITION } from '../../constants/motion'
import useScrollReveal from '../../hooks/useScrollReveal'

const pillars = [
    {
        title: 'Especies de Colección',
        text: 'Seleccionamos las orquídeas y plantas exóticas más extraordinarias y codiciadas. Especies cultivadas y aclimatadas con riguroso cuidado para garantizar su óptima salud y belleza en sus espacios.',
    },
    {
        title: 'Propagación Sostenible',
        text: 'Nuestros ejemplares se propagan y cuidan respetando los ciclos naturales. Empleamos sustratos premium, control orgánico y técnicas avanzadas que aseguran plantas fuertes, vigorosas y duraderas.',
    },
    {
        title: 'Lujo Biofílico',
        text: 'Diseñamos experiencias que integran la naturaleza en su día a día. Cada planta de Caribbean Botanical Garden está pensada para purificar su entorno, inspirar bienestar y proyectar elegancia natural.',
    },
]

export default function AboutContent() {
    const { ref, isInView } = useScrollReveal(0.1)

    return (
        <motion.div
            ref={ref}
            className="max-w-4xl mx-auto mb-16"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
            {/* Three pillars */}
            <div className="grid md:grid-cols-3 gap-8">
                {pillars.map((pillar, i) => (
                    <motion.div
                        key={i}
                        variants={fadeInUp}
                        transition={VALEX_TRANSITION}
                        className="text-center space-y-3"
                    >
                        {/* Decorative line */}
                        <div className="w-8 h-[2px] bg-valex-bronce/40 mx-auto" />
                        <h3 className="font-serif font-semibold text-lg text-valex-hueso">
                            {pillar.title}
                        </h3>
                        <p className="text-valex-gris/50 text-sm font-light leading-relaxed">
                            {pillar.text}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
