import { motion } from 'framer-motion'
import { fadeInUp, VALEX_TRANSITION } from '../../constants/motion'
import useScrollReveal from '../../hooks/useScrollReveal'

const pillars = [
    {
        title: 'Innovación Agrobiotecnológica',
        text: 'Empleamos investigación aplicada y biotecnología moderna para el desarrollo de soluciones verdes, asegurando especies de la más alta calidad genética y fitosanitaria.',
    },
    {
        title: 'Producción Sostenible',
        text: 'Nuestros ejemplares, desde orquídeas hasta vainilla, se propagan respetando los ciclos naturales, con sustratos orgánicos y prácticas que protegen la biodiversidad del trópico.',
    },
    {
        title: 'Bioeconomía Rural',
        text: 'Bioflora promueve encadenamientos productivos que impulsan el desarrollo territorial rural en Guácimo, Limón, conectando nuestras comunidades con mercados especializados.',
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
