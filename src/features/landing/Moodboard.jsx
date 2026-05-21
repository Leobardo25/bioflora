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
    const { 
        missionTitle = 'Misión',
        missionText = 'Caribbean Botanical Garden, es una empresa agro-turística innovadora la cual contribuye con la conservación del medio ambiente mediante la bio-alfabetización de nuestros visitantes y utilizando agro-tecnologías sostenibles.',
        visionTitle = 'Visión',
        visionText = 'Caribbean Botanical Garden, será un empresa agro-turística líder en Costa Rica que promoverá mediante la bio-alfabetización y la recreación sana, contribuir a la conservación del medio ambiente, mitigar el cambio climático, preservar y reproducir especies de plantas tropicales en riesgo de extinción, especialmente orquídeas. Creando actividades productivas que fomenten un trabajo justo y solidarias el cual contribuya al crecimiento personal de nuestros colaboradores y el retorno del capital a sus accionistas.'
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
            {/* Contenedor Sticky: Atrapa la pantalla (100dvh) mientras bajamos por los 300vh */}
            <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-center overflow-hidden border-t border-valex-bronce/10">
                {/* Fondo limpio */}
                <div className="absolute inset-0 bg-white pointer-events-none z-0" />

                {/* Content on top */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 max-h-[100dvh] flex flex-col justify-center">
                    
                    {/* Header */}
                    <div className="text-center mb-6 md:mb-12 shrink-0 pt-16 md:pt-0">
                        <span className="inline-block text-bioflora-naranja font-sans font-semibold text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 md:mb-3">
                            Nuestra Empresa
                        </span>
                        <h2 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-gray-900 leading-[1.1]">
                            Caribbean{' '}
                            <span className="text-bioflora-morado italic font-medium">Botanic Garden</span>
                        </h2>
                    </div>

                    {/* Grid Misión, Visión & Animation Window */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-8 shrink-0">
                        
                        {/* Animation Window - Arriba en Móvil, Derecha en PC */}
                        <div className="order-1 md:order-3 md:col-span-5 lg:col-span-4 bg-transparent rounded-2xl overflow-hidden relative flex items-center justify-center h-[28vh] min-h-[220px] md:h-auto md:min-h-[350px] transition-all duration-500">
                            {/* Canvas: Dibuja UN solo frame a la vez con crossfade */}
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full"
                                style={{ display: 'block' }}
                            />
                        </div>

                        {/* Misión Card - Medio en Móvil, Arriba Full Width en PC */}
                        <div className="order-2 md:order-1 md:col-span-12 bg-white/85 border border-gray-200/60 p-5 md:p-8 rounded-xl shadow-sm hover:shadow-lg hover:border-bioflora-morado/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <div className="w-1 h-5 md:h-6 bg-bioflora-naranja rounded-full" />
                                <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-gray-900 tracking-wide">{missionTitle}</h3>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm md:text-base font-light leading-relaxed">
                                {missionText}
                            </p>
                        </div>

                        {/* Visión Card - Abajo en Móvil, Izquierda en PC */}
                        <div className="order-3 md:order-2 md:col-span-7 lg:col-span-8 bg-white/85 border border-gray-200/60 p-5 md:p-8 rounded-xl shadow-sm hover:shadow-lg hover:border-bioflora-morado/30 transition-all duration-300 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <div className="w-1 h-5 md:h-6 bg-bioflora-naranja rounded-full" />
                                <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-gray-900 tracking-wide">{visionTitle}</h3>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm md:text-base font-light leading-relaxed line-clamp-5 md:line-clamp-none">
                                {visionText}
                            </p>
                        </div>
                    </div>

                    {/* CTA Eliminado */}
                </div>
            </div>
        </section>
    )
}
