import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import { useSiteConfig } from '../../context/SiteConfigContext'

const FRAME_COUNT = 60
const FRAME_PATHS = Array.from({ length: FRAME_COUNT }, (_, i) => `/images/frames_webp/${i + 1}.webp`)

export default function Moodboard() {
    const sectionRef = useRef(null)
    const canvasRef = useRef(null)
    const framesRef = useRef([])
    const [imagesReady, setImagesReady] = useState(false)
    const [canvasPainted, setCanvasPainted] = useState(false)
    const { 
        missionTitle = 'Misión',
        missionText = 'Bioflora, es una empresa agro-turística innovadora la cual contribuye con la conservación del medio ambiente mediante la bio-alfabetización de nuestros visitantes y utilizando agro-tecnologías sostenibles.',
        visionTitle = 'Visión',
        visionText = 'Bioflora, será un empresa agro-turística líder en Costa Rica que promoverá mediante la bio-alfabetización y la recreación sana, contribuir a la conservación del medio ambiente, mitigar el cambio climático, preservar y reproducir especies de plantas tropicales en riesgo de extinción, especialmente orquídeas. Creando actividades productivas que fomenten un trabajo justo y solidarias el cual contribuya al crecimiento personal de nuestros colaboradores y el retorno del capital a sus accionistas.'
    } = useSiteConfig();

    // Motor Sticky Scroll: Mide el progreso dentro de los 300vh del contenedor principal
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"] // Arranca cuando el top toca el top del viewport, termina cuando el bottom toca el bottom
    })

    // Preload frames into Image objects (no DOM rendering)
    useEffect(() => {
        let loaded = 0
        const images = []
        FRAME_PATHS.forEach((src, i) => {
            const img = new window.Image()
            img.src = src
            img.onload = () => {
                images[i] = img
                loaded++
                if (loaded === FRAME_COUNT) {
                    framesRef.current = images
                    setImagesReady(true)
                }
            }
        })
    }, [])

    // Canvas renderer: draws ONE frame per scroll tick with crossfade
    useEffect(() => {
        if (!imagesReady || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        // Size canvas to its container
        const resizeCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect()
            canvas.width = rect.width * window.devicePixelRatio
            canvas.height = rect.height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Helper: draw an image centered and contained within the canvas
        const drawCentered = (img, cw, ch, alpha) => {
            const maxW = cw * 1.0
            const maxH = ch * 1.0
            const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight)
            const w = img.naturalWidth * s
            const h = img.naturalHeight * s
            const dx = (cw - w) / 2
            const dy = (ch - h) / 2
            ctx.globalAlpha = alpha
            
            ctx.save()
            ctx.beginPath()
            if (ctx.roundRect) {
                ctx.roundRect(dx, dy, w, h, 20) // Borde redondeado suave
            } else {
                ctx.rect(dx, dy, w, h)
            }
            ctx.clip()
            ctx.drawImage(img, dx, dy, w, h)
            ctx.restore()
        }

        // Subscribe to scroll progress and paint with crossfade between adjacent frames
        const paint = (v) => {
            // El mapeo es 1:1, el usuario controla la flor a lo largo de todos los 300vh
            const rawIndex = v * (FRAME_COUNT - 1)
            const lo = Math.floor(rawIndex)
            const hi = Math.min(FRAME_COUNT - 1, lo + 1)
            const blend = rawIndex - lo // 0→1 between lo and hi

            const imgA = framesRef.current[lo]
            const imgB = framesRef.current[hi]
            if (!imgA) return

            const cw = canvas.width / window.devicePixelRatio
            const ch = canvas.height / window.devicePixelRatio
            ctx.clearRect(0, 0, cw, ch)

            // Draw base frame at full opacity, then blend next frame on top
            drawCentered(imgA, cw, ch, 1)
            if (imgB && blend > 0.01) {
                drawCentered(imgB, cw, ch, blend)
            }
            ctx.globalAlpha = 1
        }

        const unsubscribe = scrollYProgress.on('change', paint)

        // Forzar un primer pintado inmediato (sin esperar a que el usuario haga scroll)
        requestAnimationFrame(() => {
            paint(scrollYProgress.get())
            setCanvasPainted(true)
        })

        return () => {
            unsubscribe()
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [imagesReady, scrollYProgress])

    return (
        <section
            ref={sectionRef}
            id="nosotros"
            className="relative bg-white h-[150vh] md:h-[300vh]"
        >
            {/* Contenedor Sticky: Se detiene justo debajo del navbar y ocupa el resto de la pantalla */}
            <div className="sticky top-[80px] h-[calc(100vh-80px)] w-full flex flex-col overflow-hidden border-t border-valex-bronce/10 pt-1 md:pt-8 lg:pt-10">
                {/* Fondo limpio */}
                <div className="absolute inset-0 bg-white pointer-events-none z-0" />

                {/* Content on top */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[6vh] lg:pt-0 pb-4 md:pb-8 h-full flex flex-col lg:justify-center">
                    
                    {/* Header */}
                    <div className="text-center mb-4 md:mb-10 shrink-0">
                        <span className="inline-block text-valex-bronce font-sans font-medium text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3 md:mb-4">
                            Nuestra Empresa
                        </span>
                        <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-[1.05] tracking-tight">
                            Bioflora{' '}
                            <span className="text-[#00A7D0] italic font-medium">Garden Center</span>
                        </h2>
                    </div>

                    {/* Contenedor Flex en Móvil / Grid en PC */}
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6 lg:flex-1 items-stretch">
                        
                        {/* Columna Izquierda: Misión y Visión */}
                        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col gap-3 md:gap-4 lg:gap-6 shrink-0">
                            
                            {/* Misión Card */}
                            <div className="bg-white/85 border border-gray-200/60 p-4 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-lg hover:border-bioflora-morado/30 transition-all duration-300">
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                                    <div className="w-1 h-4 md:h-6 bg-valex-bronce rounded-full" />
                                    <h3 className="font-serif font-bold text-base md:text-xl text-gray-900 tracking-wide">{missionTitle}</h3>
                                </div>
                                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-light leading-relaxed">
                                    {missionText}
                                </p>
                            </div>

                            {/* Visión Card */}
                            <div className="bg-white/85 border border-gray-200/60 p-4 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-lg hover:border-bioflora-morado/30 transition-all duration-300 flex-1">
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                                    <div className="w-1 h-4 md:h-6 bg-valex-bronce rounded-full" />
                                    <h3 className="font-serif font-bold text-base md:text-xl text-gray-900 tracking-wide">{visionTitle}</h3>
                                </div>
                                <p className="text-gray-600 text-[11px] sm:text-sm md:text-base font-light leading-relaxed">
                                    {visionText}
                                </p>
                            </div>
                        </div>

                        {/* Columna Derecha: Animation Window */}
                        <div className="order-1 lg:order-2 lg:col-span-5 bg-transparent rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[200px] md:min-h-[250px] lg:min-h-[400px]">
                            
                            {/* Fallback permanente: siempre visible debajo del canvas como red de seguridad */}
                            <img 
                                src="/images/frames_webp/1.webp" 
                                alt="Bioflora Orquídea 3D" 
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            />

                            {/* Canvas: pinta encima del fallback, tapa la imagen estática al renderizar */}
                            <canvas
                                ref={canvasRef}
                                className="relative w-full h-full object-contain"
                                style={{ display: 'block' }}
                            />
                        </div>
                    </div>

                    {/* CTA Eliminado */}
                </div>
            </div>
        </section>
    )
}
