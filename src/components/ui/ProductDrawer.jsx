import { useState, useEffect, useRef } from 'react';
import { Drawer, ConfigProvider, theme as antTheme, Collapse, Typography } from 'antd';
import { SafetyCertificateOutlined, CodeSandboxOutlined, StarFilled } from '@ant-design/icons';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductDrawer } from '../../context/ProductDrawerContext';
import { useCart } from '../../context/CartContext';
import { useCheckoutDrawer } from '../../context/CheckoutDrawerContext';
import CheckoutForm from './CheckoutForm';
import { CareGuideFull } from './CareGuideBadges';

const { Paragraph, Text } = Typography;

const formatPrice = (price, currency) => {
    if (!price || Number(price) === 0) return 'Por definir';
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
                algorithm: antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#69358C',
                    colorBgBase: '#FFFFFF',
                    colorBgElevated: '#FFFFFF',
                    colorTextBase: '#050B14',
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
                    body: { padding: '0', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100dvh' },
                    wrapper: { width: '100%', maxWidth: '1000px' }
                }}
                className="product-drawer-wide"
            >
                {/* Header personalizado - Solo botón volver */}
                <div className="flex items-center px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-950 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-gray-50 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-sans uppercase tracking-wider">
                            {showCheckout ? 'Volver al Producto' : 'Volver'}
                        </span>
                    </button>
                    
                </div>
 
                {/* Contenido - Layout de dos columnas en tablet/desktop */}
                <div className="flex-1 overflow-y-auto lg:overflow-hidden bg-white">
                    <div className="flex flex-col lg:flex-row lg:h-full">
                        {/* Nombre del producto - Solo en móvil */}
                        <div className="lg:hidden px-5 py-3 bg-white">
                            <AnimatePresence mode="wait">
                                {!showCheckout ? (
                                    <motion.h1
                                        key="product-title"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="font-serif font-bold text-lg text-gray-900 text-center leading-tight"
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
                                        <span className="font-serif font-bold text-xl text-gray-900">Finalizar Compra</span>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm">
                                                <img
                                                    src={images[0]}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-serif font-semibold text-sm text-gray-900 leading-snug">{selectedProduct.name}</span>
                                                <span className="text-[#69358C] font-sans font-bold text-lg">
                                                    {formatPrice(selectedProduct.price, selectedProduct.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
 
                        {/* Columna Izquierda - Galería de Imágenes */}
                        <div className={`relative bg-gray-50 lg:w-[55%] flex items-center justify-center lg:p-8 lg:py-12 transition-all duration-300 ${showCheckout ? 'lg:flex hidden' : ''}`}>
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
                                            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#00A7D0]/40 flex items-center justify-center text-gray-800 active:bg-[#00A7D0] active:text-white transition-all z-20 relative"
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
                                            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#00A7D0]/40 flex items-center justify-center text-gray-800 active:bg-[#00A7D0] active:text-white transition-all z-20 relative"
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
                        <div className="p-5 sm:p-6 lg:w-[45%] bg-white flex flex-col lg:h-full lg:overflow-hidden relative">
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
                                            <h1 className="font-serif font-bold text-xl text-gray-900 leading-tight">
                                                {selectedProduct.name}
                                            </h1>
                                        </div>

                                        {/* Categoría + ML + Rating en una línea */}
                                        <div className="flex items-center gap-2.5 mb-3 flex-shrink-0">
                                            <span className="text-[#00A7D0] font-sans text-xs tracking-[0.2em] uppercase font-bold">
                                                {selectedProduct.category}
                                            </span>
                                            <span className="w-px h-3.5 bg-gray-200" />
                                            <span className="text-gray-500 font-sans text-[11px] tracking-[0.1em] uppercase">
                                                {selectedProduct.tamano || selectedProduct.ml || 'Maceta 6"'}
                                            </span>
                                            <div className="ml-auto flex items-center gap-1.5">
                                                <div className="flex text-amber-400 text-[11px]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarFilled key={i} />
                                                    ))}
                                                </div>
                                                <span className="text-gray-400 text-[10px] font-sans">(128)</span>
                                            </div>
                                        </div>

                                        {/* Ficha de Cuidados */}
                                        <span className="inline-block text-[#00A7D0]/80 font-sans text-[10px] tracking-[0.2em] uppercase font-semibold mb-1 flex-shrink-0">
                                            Ficha de Cuidados
                                        </span>
                                        <p className="text-gray-600 italic font-serif text-[12px] mb-4 flex-shrink-0">
                                            "{selectedProduct.notes || 'Riego moderado, luz indirecta, humedad media.'}"
                                        </p>

                                        <CareGuideFull careGuide={selectedProduct.careGuide} />

                                        {/* Precio Detalle y Precio Mayoreo */}
                                        <div className="mb-5 flex-shrink-0 flex items-baseline gap-3 flex-wrap">
                                            <div>
                                                <span className="text-[10px] text-gray-400 font-sans tracking-wider uppercase block">Precio Detalle</span>
                                                <span className="font-serif font-bold text-2xl sm:text-3xl text-[#69358C]">
                                                    {formatPrice(selectedProduct.price, selectedProduct.currency)}
                                                </span>
                                            </div>

                                            {selectedProduct.wholesalePrice && Number(selectedProduct.wholesalePrice) > 0 && (
                                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-3 py-1 rounded-xl">
                                                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-sans font-bold tracking-wider uppercase block">Precio al por mayor</span>
                                                    <span className="font-serif font-bold text-lg text-emerald-700 dark:text-emerald-400">
                                                        {formatPrice(selectedProduct.wholesalePrice, selectedProduct.currency)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                         {/* Botones de Acción */}
                                         <div className="flex flex-col gap-3.5 mb-5 flex-shrink-0">
                                             <button
                                                 disabled={isOutOfStock}
                                                 onClick={handleAddToCart}
                                                 className="h-14 border-[2.5px] border-[#69358C] text-[#69358C] text-[12px] font-sans font-extrabold tracking-[0.18em] uppercase rounded-full hover:bg-[#69358C] hover:text-white hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed duration-300"
                                             >
                                                 <ShoppingCart className="w-[18px] h-[18px]" />
                                                 Añadir al Carrito
                                             </button>

                                             <button
                                                 disabled={isOutOfStock}
                                                 onClick={handleBuyNow}
                                                 className="h-14 bg-[#00A7D0] hover:bg-[#69358C] text-white text-[12px] font-sans font-extrabold tracking-[0.18em] uppercase rounded-full hover:scale-[1.01] transition-all flex items-center justify-center shadow-lg shadow-[#00A7D0]/20 hover:shadow-[#69358C]/20 disabled:opacity-50 disabled:cursor-not-allowed duration-300"
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
                                                    label: <span className="font-sans font-semibold text-gray-700 text-xs uppercase tracking-wider">Descripción Botánica</span>,
                                                    children: (
                                                        <Paragraph className="!text-gray-500 !text-sm !font-light leading-relaxed !mb-0">
                                                            {selectedProduct.description || "Una especie botánica exótica, cultivada bajo los más altos estándares de calidad orgánica."}
                                                        </Paragraph>
                                                    )
                                                }
                                            ]}
                                        />

                                        {/* Trust Badges - Mover al final */}
                                        <div className="flex items-center justify-between py-4 border-y border-gray-100 mt-auto flex-shrink-0">
                                            <div className="flex flex-col items-center gap-1 flex-1">
                                                <SafetyCertificateOutlined className="text-base text-[#00A7D0]" />
                                                <span className="text-[9px] uppercase tracking-tighter text-gray-500">100% Orgánico</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 flex-1 border-x border-gray-100">
                                                <CodeSandboxOutlined className="text-base text-[#00A7D0]" />
                                                <span className="text-[9px] uppercase tracking-tighter text-gray-500">Envío Seguro</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 flex-1">
                                                <StarFilled className="text-base text-[#00A7D0]" />
                                                <span className="text-[9px] uppercase tracking-tighter text-gray-500">Exótica VIP</span>
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
                                        className="flex-1 overflow-hidden p-5 sm:p-6 bg-white"
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
