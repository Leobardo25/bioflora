import { useState, useEffect, useRef } from 'react';
import { Drawer, ConfigProvider, theme as antTheme, Collapse, Typography } from 'antd';
import { SafetyCertificateOutlined, CodeSandboxOutlined, StarFilled } from '@ant-design/icons';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductDrawer } from '../../context/ProductDrawerContext';
import { useCart } from '../../context/CartContext';
import { useCheckoutDrawer } from '../../context/CheckoutDrawerContext';
import CheckoutForm from './CheckoutForm';

const { Paragraph, Text } = Typography;

const formatPrice = (price, currency) => {
    const isCRC = currency === 'CRC';
    return new Intl.NumberFormat(isCRC ? 'es-CR' : 'en-US', {
        style: 'currency',
        currency: isCRC ? 'CRC' : 'USD',
        minimumFractionDigits: isCRC ? 0 : 2,
        maximumFractionDigits: isCRC ? 0 : 2
    }).format(Number(price) || 0);
};

const fadeVariants = {
    enter: {
        opacity: 0,
        scale: 1.05
    },
    center: {
        opacity: 1,
        scale: 1
    },
    exit: {
        opacity: 0,
        scale: 0.98
    }
};

export default function ProductDrawer() {
    const { isOpen, selectedProduct, closeProductDrawer } = useProductDrawer();
    const { addToCart } = useCart();
    const { openCheckoutDrawer } = useCheckoutDrawer();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showCheckout, setShowCheckout] = useState(false);
    const drawerWrapperRef = useRef(null);
    
    // Swipe handlers para móvil - DEBEN estar antes de cualquier return
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Resetear índice de imagen cuando cambia el producto
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [selectedProduct?.id]);

    // Resetear showCheckout al cerrar el drawer
    useEffect(() => {
        if (!isOpen) setShowCheckout(false);
    }, [isOpen]);

    // Interceptar botón atrás Android: ocultar instantáneamente el drawer antes que la animación de Ant Design
    useEffect(() => {
        const handlePopState = () => {
            const wrappers = document.querySelectorAll('.ant-drawer-content-wrapper');
            const masks = document.querySelectorAll('.ant-drawer-mask');

            wrappers.forEach(wrapper => {
                wrapper.style.transition = 'none';
                wrapper.style.opacity = '0';
                wrapper.style.transform = 'translateX(100%)';
            });
            masks.forEach(mask => {
                mask.style.transition = 'none';
                mask.style.opacity = '0';
            });

            // Limpiar estilos inline tras el cierre para no afectar próximas aperturas
            setTimeout(() => {
                wrappers.forEach(wrapper => {
                    wrapper.style.transition = '';
                    wrapper.style.opacity = '';
                    wrapper.style.transform = '';
                });
                masks.forEach(mask => {
                    mask.style.transition = '';
                    mask.style.opacity = '';
                });
            }, 400);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Early return después de TODOS los hooks
    if (!selectedProduct) return null;

    // Galería de imágenes
    const images = (() => {
        const allImages = [];
        if (selectedProduct.galleryImages?.length > 0) {
            allImages.push(...selectedProduct.galleryImages);
        }
        if (selectedProduct.coverImage) {
            allImages.push(selectedProduct.coverImage);
        } else if (selectedProduct.imageUrl && allImages.length === 0) {
            allImages.push(selectedProduct.imageUrl);
        }
        return allImages.length > 0 ? allImages : [];
    })();

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50 && images.length > 1) {
            nextImage();
        } else if (distance < -50 && images.length > 1) {
            prevImage();
        }
    };

    const isOutOfStock = selectedProduct?.stock === 'Agotado' || selectedProduct?.stock === 0 || selectedProduct?.stock === 'Bóveda (Retirado)';

    const handleAddToCart = () => {
        addToCart(selectedProduct, 1);
        closeProductDrawer();
    };

    const handleBuyNow = () => {
        // En ambos casos (PC y Móvil) mostramos el formulario en la misma ventana
        setShowCheckout(true);
    };

    const handleClose = () => {
        if (showCheckout) {
            setShowCheckout(false);
        } else {
            closeProductDrawer();
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: antTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#7C3AED',
                    colorBgBase: '#070F0A',
                    colorBgElevated: '#0D1C13',
                    colorTextBase: '#F9F9F6',
                    fontFamily: '"Outfit", "Poppins", sans-serif',
                }
            }}
        >
            <Drawer
                title={null}
                closable={false}
                placement="right"
                onClose={handleClose}
                open={isOpen}
                width="100%"
                zIndex={2000}
                styles={{
                    header: { display: 'none' },
                    body: { padding: '0', backgroundColor: '#070F0A', display: 'flex', flexDirection: 'column', height: '100dvh' },
                    wrapper: { width: '100%', maxWidth: '1000px' }
                }}
                className="product-drawer-wide"
            >
                {/* Header personalizado - Solo botón volver */}
                <div className="flex items-center px-5 py-4 border-b border-bioflora-morado/15 bg-[#070F0A] flex-shrink-0">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-1.5 text-bioflora-arena/70 hover:text-bioflora-arena transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-sans uppercase tracking-wider">
                            {showCheckout ? 'Volver al Producto' : 'Volver'}
                        </span>
                    </button>
                    
                </div>

                {/* Contenido - Layout de dos columnas en tablet/desktop */}
                <div className="flex-1 overflow-y-auto lg:overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:h-full">
                        {/* Nombre del producto - Solo en móvil */}
                        <div className="lg:hidden px-5 py-3 bg-[#070F0A]">
                            <AnimatePresence mode="wait">
                                {!showCheckout ? (
                                    <motion.h1
                                        key="product-title"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="font-serif font-bold text-lg text-bioflora-arena text-center leading-tight"
                                    >
                                        {selectedProduct.name}
                                    </motion.h1>
                                ) : (
                                    <motion.div
                                        key="checkout-summary"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="flex flex-col gap-3"
                                    >
                                        <span className="font-serif font-bold text-xl text-bioflora-arena">Finalizar Compra</span>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-bioflora-verde/30 flex-shrink-0 shadow-lg">
                                                <img
                                                    src={images[0]}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-serif font-semibold text-sm text-bioflora-arena leading-snug">{selectedProduct.name}</span>
                                                <span className="text-bioflora-naranja font-sans font-bold text-lg">
                                                    {formatPrice(selectedProduct.price, selectedProduct.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Columna Izquierda - Galería de Imágenes */}
                        <div className={`relative bg-[#050b07] lg:w-[55%] flex items-center justify-center lg:p-8 lg:py-12 transition-all duration-300 ${showCheckout ? 'lg:flex hidden' : ''}`}>
                            {/* Móvil: Imagen simple */}
                            <div className="lg:hidden relative w-full aspect-square">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        variants={fadeVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                        className="relative w-full h-full overflow-hidden"
                                    >
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={selectedProduct.name}
                                            className={`w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105 cursor-pointer ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Desktop: Marco elegante con imagen llena */}
                            <div className="hidden lg:block relative w-full aspect-[4/5] max-h-[580px] shadow-2xl shadow-black/50">
                                {/* Borde verde */}
                                <div className="absolute inset-0 border-2 border-bioflora-morado/30 pointer-events-none z-10" />
                                
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        variants={fadeVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                        className="relative w-full h-full overflow-hidden"
                                    >
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={selectedProduct.name}
                                            className={`w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105 cursor-pointer ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Esquinas decorativas de Bioflora */}
                                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-bioflora-morado -mt-0.5 -ml-0.5 z-20" />
                                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-bioflora-morado -mt-0.5 -mr-0.5 z-20" />
                                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-bioflora-morado -mb-0.5 -ml-0.5 z-20" />
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-bioflora-morado -mb-0.5 -mr-0.5 z-20" />
                            </div>

                        {/* Navegación Desktop/Tablet */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-bioflora-morado/30 items-center justify-center text-bioflora-arena hover:bg-bioflora-morado hover:text-white transition-all z-20"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-bioflora-morado/30 items-center justify-center text-bioflora-arena hover:bg-bioflora-morado hover:text-white transition-all z-20"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* Barra inferior móvil */}
                                <div className="sm:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pb-3 pt-6 px-3 z-20">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                            className="w-9 h-9 rounded-full bg-[#070F0A]/80 backdrop-blur-sm border border-bioflora-morado/40 flex items-center justify-center text-bioflora-arena active:bg-bioflora-morado active:text-white transition-all z-20 relative"
                                            type="button"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-1.5 z-20 relative">
                                            {images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-bioflora-morado' : 'w-1.5 bg-white/40'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(idx);
                                                    }}
                                                    type="button"
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                            className="w-9 h-9 rounded-full bg-[#070F0A]/80 backdrop-blur-sm border border-bioflora-morado/40 flex items-center justify-center text-bioflora-arena active:bg-bioflora-morado active:text-white transition-all z-20 relative"
                                            type="button"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Indicadores Desktop */}
                                <div className="hidden sm:flex absolute -bottom-8 left-0 right-0 justify-center gap-1.5 z-10">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-5 bg-bioflora-morado' : 'w-1.5 bg-white/30'}`}
                                            onClick={() => setCurrentImageIndex(idx)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Overlay Agotado */}
                        {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <span className="bg-red-900/80 text-white font-serif tracking-[0.3em] px-5 py-2.5 text-xs border border-red-500/50 uppercase rounded">
                                    Agotado
                                </span>
                            </div>
                        )}

                        {/* Touch area para swipe - solo en móvil */}
                        <div
                            className="absolute inset-0 z-0 lg:hidden"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                    </div>

                        {/* Columna Derecha - Info del Producto o Checkout */}
                        <div className="p-5 sm:p-6 lg:w-[45%] bg-[#070F0A] flex flex-col lg:h-full lg:overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {!showCheckout ? (
                                    <motion.div
                                        key="product-info"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col lg:h-full lg:overflow-y-auto custom-scrollbar pr-2"
                                    >
                                        {/* Nombre del producto - Solo en desktop, en la columna de texto */}
                                        <div className="hidden lg:block mb-4 flex-shrink-0">
                                            <h1 className="font-serif font-bold text-xl text-bioflora-arena leading-tight">
                                                {selectedProduct.name}
                                            </h1>
                                        </div>

                                        {/* Categoría + ML + Rating en una línea */}
                                        <div className="flex items-center gap-2.5 mb-3 flex-shrink-0">
                                            <span className="text-bioflora-naranja font-sans text-xs tracking-[0.2em] uppercase font-bold">
                                                {selectedProduct.category}
                                            </span>
                                            <span className="w-px h-3.5 bg-bioflora-arena/20" />
                                            <span className="text-bioflora-arena/70 font-sans text-[11px] tracking-[0.1em] uppercase">
                                                {selectedProduct.ml || 'Maceta 6"'}
                                            </span>
                                            <div className="ml-auto flex items-center gap-1.5">
                                                <div className="flex text-bioflora-naranja text-[11px]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarFilled key={i} />
                                                    ))}
                                                </div>
                                                <span className="text-bioflora-arena/50 text-[10px] font-sans">(128)</span>
                                            </div>
                                        </div>

                                        {/* Ficha de Cuidados */}
                                        <span className="inline-block text-bioflora-naranja/80 font-sans text-[10px] tracking-[0.2em] uppercase font-semibold mb-1 flex-shrink-0">
                                            Ficha de Cuidados
                                        </span>
                                        <p className="text-bioflora-arena/90 italic font-serif text-[12px] mb-4 flex-shrink-0">
                                            "{selectedProduct.notes || 'Riego moderado, luz indirecta, humedad media.'}"
                                        </p>

                                        {/* Precio */}
                                        <div className="mb-5 flex-shrink-0">
                                            <span className="font-serif font-bold text-2xl sm:text-3xl text-bioflora-naranja">
                                                {formatPrice(selectedProduct.price, selectedProduct.currency)}
                                            </span>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="flex flex-col gap-2.5 mb-5 flex-shrink-0">
                                            <button
                                                disabled={isOutOfStock}
                                                onClick={handleAddToCart}
                                                className="h-12 border-2 border-bioflora-naranja text-bioflora-arena text-[11px] font-sans font-bold tracking-[0.15em] uppercase rounded-full hover:bg-bioflora-naranja hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                Añadir a la Bolsa
                                            </button>

                                            <button
                                                disabled={isOutOfStock}
                                                onClick={handleBuyNow}
                                                className="h-12 bg-bioflora-morado text-white text-[11px] font-sans font-bold tracking-[0.15em] uppercase rounded-full hover:bg-bioflora-morado/80 transition-all flex items-center justify-center shadow-lg shadow-bioflora-morado/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isOutOfStock ? 'Agotado' : 'Comprar Ahora'}
                                            </button>
                                        </div>

                                        {/* Descripción - Acordeón colapsable */}
                                        <Collapse
                                            ghost
                                            expandIconPlacement="end"
                                            className="custom-botanical-collapse mb-5 flex-shrink-0"
                                            items={[
                                                {
                                                    key: '1',
                                                    label: <span className="font-sans font-semibold text-bioflora-arena text-xs uppercase tracking-wider">Descripción Botánica</span>,
                                                    children: (
                                                        <Paragraph className="!text-bioflora-arena/70 !text-sm !font-light leading-relaxed !mb-0">
                                                            {selectedProduct.description || "Una especie botánica exótica, cultivada bajo los más altos estándares de calidad orgánica."}
                                                        </Paragraph>
                                                    )
                                                }
                                            ]}
                                        />

                                        {/* Trust Badges - Mover al final */}
                                        <div className="flex items-center justify-between py-4 border-y border-bioflora-arena/10 mt-auto flex-shrink-0">
                                            <div className="flex flex-col items-center gap-1 flex-1">
                                                <SafetyCertificateOutlined className="text-base text-bioflora-verde" />
                                                <span className="text-[9px] uppercase tracking-tighter text-bioflora-arena/70">100% Orgánico</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 flex-1 border-x border-bioflora-arena/10">
                                                <CodeSandboxOutlined className="text-base text-bioflora-verde" />
                                                <span className="text-[9px] uppercase tracking-tighter text-bioflora-arena/70">Envío Seguro</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 flex-1">
                                                <StarFilled className="text-base text-bioflora-verde" />
                                                <span className="text-[9px] uppercase tracking-tighter text-bioflora-arena/70">Exótica VIP</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="checkout-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-1 overflow-hidden p-5 sm:p-6 bg-[#070F0A]"
                                    >
                                        <CheckoutForm
                                            items={[{ ...selectedProduct, quantity: 1 }]}
                                            total={selectedProduct.price}
                                            preserveCart={false}
                                            onSuccess={closeProductDrawer}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </Drawer>
        </ConfigProvider>
    );
}
