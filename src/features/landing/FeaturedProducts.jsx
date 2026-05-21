import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { getProducts } from '../../services/productService'
import { fadeInUp, VALEX_TRANSITION } from '../../constants/motion'
import { useSiteConfig } from '../../context/SiteConfigContext'

export default function FeaturedProducts() {
    const { collectionTitle, collectionText } = useSiteConfig()
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(1)

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const allProducts = await getProducts();
                const featured = allProducts.filter(p => 
                    p.isFeatured && 
                    p.stock !== 'Bóveda (Retirado)' &&
                    (p.coverImage || (p.galleryImages && p.galleryImages.length > 0))
                );
                setFeaturedProducts(featured);
            } catch (error) {
                console.error("Error cargando productos destacados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, [])

    const handleNext = useCallback(() => {
        if (featuredProducts.length === 0) return;
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % featuredProducts.length)
    }, [featuredProducts.length])

    const handlePrev = useCallback(() => {
        if (featuredProducts.length === 0) return;
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
    }, [featuredProducts.length])

    // Autoplay de 12 segundos (ralentizado según solicitud)
    useEffect(() => {
        if (featuredProducts.length <= 1) return;
        const timer = setInterval(handleNext, 12000); 
        return () => clearInterval(timer);
    }, [handleNext, featuredProducts.length])

    if (!loading && featuredProducts.length === 0) return null;

    return (
        <section id="colecciones" className="relative h-auto lg:min-h-[85vh] w-full bg-valex-hueso overflow-hidden border-t border-valex-bronce/10 flex items-center py-16 lg:py-12">
            {/* Destellos de iluminación de fondo */}
            <div className="absolute top-1/2 right-1/4 w-[40vw] h-[40vw] rounded-full bg-valex-bronce/5 blur-[120px] pointer-events-none" />

            <div className="max-w-screen-2xl mx-auto w-full px-6 sm:px-12 lg:px-20 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                
                {/* LADO IZQUIERDO: Panel Estático de Información con Animación Cíclica */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={{
                        hidden: { opacity: 0, x: -50 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
                    }}
                    className="w-full lg:w-[35%] flex flex-col justify-center text-center lg:text-left"
                >
                    <div className="inline-block text-bioflora-naranja font-sans font-medium text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4 sm:mb-6">
                        Colección Selecta
                    </div>
                    <h2 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-valex-negro leading-[1.05] tracking-tight">
                        Especies <span className="text-bioflora-morado italic font-medium">Selectas</span>
                    </h2>
                    <p className="hidden lg:block text-valex-negro/50 mt-6 text-sm sm:text-base font-light mx-auto lg:mx-0 max-w-sm leading-relaxed">
                        {collectionText || 'Explore las orquídeas y especies exóticas más exclusivas de nuestra colección, cultivadas con esmero para embellecer su entorno.'}
                    </p>
                    
                    {/* Botones de Navegación Exclusivos para Desktop */}
                    <div className="hidden lg:flex items-center gap-6 mt-12">
                        <button 
                            onClick={handlePrev}
                            className="w-14 h-14 rounded-full border border-valex-bronce/40 flex items-center justify-center text-valex-bronce hover:bg-valex-bronce hover:text-white transition-all duration-300 shadow-sm hover:shadow-valex-bronce/30"
                        >
                            <FaChevronLeft className="w-4 h-4 ml-[-2px]" />
                        </button>
                        <button 
                            onClick={handleNext}
                            className="w-14 h-14 rounded-full border border-valex-bronce/40 flex items-center justify-center text-valex-bronce hover:bg-valex-bronce hover:text-white transition-all duration-300 shadow-sm hover:shadow-valex-bronce/30"
                        >
                            <FaChevronRight className="w-4 h-4 mr-[-2px]" />
                        </button>
                    </div>
                </motion.div>

                {/* LADO DERECHO: Tarjeta Rectangular de Producto animada infinitamente*/}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={{
                        hidden: { opacity: 0, y: 50 },
                        visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut", delay: 0.2 } }
                    }}
                    className="w-full lg:w-[65%] flex flex-col items-center relative"
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-[50vh] lg:h-[60vh]">
                            <div className="w-10 h-10 border-4 border-valex-bronce/30 border-t-valex-bronce rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="relative w-full max-w-none lg:max-w-[850px] xl:max-w-[1050px] 2xl:max-w-[1300px] h-[75vh] lg:h-[500px] xl:h-[600px] 2xl:h-[700px] min-h-[600px] lg:min-h-[500px] mx-auto">
                            <AnimatePresence custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                                    className="absolute inset-0 w-full h-full lg:mx-auto will-change-transform"
                                >
                                    <ProductCard product={featuredProducts[currentIndex]} />
                                </motion.div>
                            </AnimatePresence>

                            {/* Controles Móviles Circulares */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between lg:hidden z-20 pointer-events-none" style={{ left: '-20px', paddingRight: '-40px', width: 'calc(100% + 40px)'}}>
                                <button 
                                    onClick={handlePrev}
                                    className="w-12 h-12 bg-white shadow-xl rounded-full border border-valex-bronce/20 flex items-center justify-center text-valex-bronce hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                                >
                                    <FaChevronLeft className="w-4 h-4 ml-[-2px]" />
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="w-12 h-12 bg-white shadow-xl rounded-full border border-valex-bronce/20 flex items-center justify-center text-valex-bronce hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                                >
                                    <FaChevronRight className="w-4 h-4 mr-[-2px]" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
                
                {/* Resumen descriptivo y Botón Ir a Tienda exclusivos para la base en móviles */}
                <div className="lg:hidden w-full flex flex-col items-center text-center px-4 mt-4">
                    <Link to="/tienda" className="inline-block py-3 px-10 border border-valex-bronce bg-transparent text-valex-negro font-sans hover:bg-valex-bronce hover:text-valex-hueso transition-all duration-500 tracking-[0.2em] text-[10px] font-bold uppercase rounded-full shadow-lg">
                        Ver Catálogo Completo
                    </Link>
                </div>
            </div>
        </section>
    )
}

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '50%' : '-50%',
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        x: direction > 0 ? '-50%' : '50%',
        opacity: 0
    })
};

function ProductCard({ product }) {
    if (!product) return null;

    // Intentar sacar la imagen fotorealista (_bg) que inyectamos en galleryImages.
    // Si no tiene (como en los 4 faltantes), usar la imagen blanca normal.
    let displayImg = (product.galleryImages && product.galleryImages.length > 0) 
        ? product.galleryImages[0] 
        : (product.coverImage || product.imageUrl); 

    const isColones = product.currency === 'CRC';
    const formattedPrice = new Intl.NumberFormat(isColones ? 'es-CR' : 'en-US', {
        style: 'currency',
        currency: product.currency || 'USD',
        minimumFractionDigits: isColones ? 0 : 2,
        maximumFractionDigits: isColones ? 0 : 2
    }).format(Number(product.price));

    return (
        <div className="w-full h-full bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-valex-negro/5 border border-valex-gris/10 flex flex-col lg:flex-row group hover:shadow-valex-bronce/20 hover:border-valex-bronce/40 transition-all duration-500 cursor-pointer">
            {/* Imagen — object-cover en todas las resoluciones para cubrir sin barras */}
            <div className="h-[50%] lg:h-full lg:w-[50%] w-full bg-[#0a0a0a] overflow-hidden relative border-b lg:border-b-0 lg:border-r border-valex-gris/5">
                <img
                    src={displayImg}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 ease-out"
                />
            </div>
            {/* Info — ajustada para que quepa todo el texto */}
            <div className="h-[50%] lg:h-full lg:w-[50%] w-full flex flex-col bg-white relative">
                <div className="p-5 sm:p-6 lg:p-8 xl:p-10 flex flex-col h-full"> 
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                        <span className="inline-block text-bioflora-naranja font-sans text-[10px] lg:text-xs tracking-[0.25em] uppercase font-extrabold mb-2 lg:mb-3">
                            {product.category || 'Premium Collection'}
                        </span>
                        <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-valex-negro mb-1 lg:mb-2 leading-tight line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="text-bioflora-naranja/90 italic font-serif text-xs lg:text-sm line-clamp-2 mb-3 lg:mb-4">
                            "{product.notes}"
                        </p>
                        <p className="text-valex-negro/60 text-[12px] lg:text-[14px] font-light line-clamp-3 lg:line-clamp-5 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-valex-gris/10 pt-4 lg:pt-6 w-full">
                        <span className="font-serif font-bold text-xl lg:text-3xl text-bioflora-naranja">
                            {formattedPrice}
                        </span>
                        <Link to="/tienda" className="font-sans text-[10px] lg:text-[11px] font-extrabold tracking-[0.15em] text-valex-negro uppercase hover:text-white transition-colors bg-valex-bronce/5 px-5 lg:px-7 py-2.5 lg:py-3.5 rounded-full hover:bg-bioflora-naranja">
                            Adquirir
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
