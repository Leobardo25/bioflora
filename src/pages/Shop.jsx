import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Layout, Row, Col, Card, Button, Badge, Skeleton, Radio, Checkbox, Slider, Collapse, Typography, FloatButton, Drawer, notification, ConfigProvider, theme as antTheme, Grid, Input } from 'antd';
import { FilterOutlined, SearchOutlined, PictureOutlined, BgColorsOutlined } from '@ant-design/icons';
import { ShoppingCart } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProductDrawer } from '../context/ProductDrawerContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CareGuideCompact } from '../components/ui/CareGuideBadges';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- DICCIONARIO DE FILTROS ---
const CATEGORIES = ['Todos', 'Orquídeas', 'Exóticas', 'Flores Tropicales', 'Accesorios'];

const formatPrice = (price, isCRC) => {
    return new Intl.NumberFormat(isCRC ? 'es-CR' : 'en-US', {
        style: 'currency',
        currency: isCRC ? 'CRC' : 'USD',
        minimumFractionDigits: isCRC ? 0 : 2,
        maximumFractionDigits: isCRC ? 0 : 2
    }).format(Number(price) || 0);
};

export default function Shop() {
    const screens = useBreakpoint();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isCompactView, setIsCompactView] = useState(() => JSON.parse(sessionStorage.getItem('valex_isCompactView') ?? 'true'));
    const [useBgImages, setUseBgImages] = useState(() => JSON.parse(sessionStorage.getItem('valex_useBgImages') ?? 'true'));
    const { whatsapp } = useSiteConfig();
    const waNumber = whatsapp;
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);

    const [dbFamilies, setDbFamilies] = useState([
        { label: 'Orchidaceae', value: 'Orchidaceae' },
        { label: 'Araceae', value: 'Araceae' },
        { label: 'Insumos Profesionales', value: 'Insumos Profesionales' }
    ]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'families'), (snapshot) => {
            if (!snapshot.empty) {
                const list = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        label: data.name,
                        value: data.name
                    };
                });
                list.sort((a, b) => a.label.localeCompare(b.label));
                setDbFamilies(list);
            }
        }, (err) => {
            console.error("Error al cargar familias dinámicas en tienda:", err);
        });
        return () => unsubscribe();
    }, []);

    // --- ESTADO DE FILTROS ---
    const [filterCategory, setFilterCategory] = useState(() => sessionStorage.getItem('valex_category') || 'Todos');
    const [filterFamilies, setFilterFamilies] = useState(() => JSON.parse(sessionStorage.getItem('valex_families') || '[]'));
    const [filterPrice, setFilterPrice] = useState(() => JSON.parse(sessionStorage.getItem('valex_price') || '[0, 300]')); // Max price assumed $300
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('valex_search') || '');

    // Scroll al tope al entrar a la tienda y manejar scroll del boton flotante
    useEffect(() => { 
        window.scrollTo(0, 0); 
        
        const handleScroll = () => {
            setShowFloatingBtn(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mantener estado local para no perder la navegación
    useEffect(() => {
        sessionStorage.setItem('valex_isCompactView', JSON.stringify(isCompactView));
        sessionStorage.setItem('valex_category', filterCategory);
        sessionStorage.setItem('valex_families', JSON.stringify(filterFamilies));
        sessionStorage.setItem('valex_price', JSON.stringify(filterPrice));
        sessionStorage.setItem('valex_search', searchQuery);
        sessionStorage.setItem('valex_useBgImages', JSON.stringify(useBgImages));
    }, [isCompactView, filterCategory, filterFamilies, filterPrice, searchQuery, useBgImages]);

    useEffect(() => {
        // Real-time setup
        const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filtrar productos retirados
            setProducts(rawData.filter(p => p.stock !== 'Bóveda (Retirado)'));
            setLoading(false);
        }, (error) => {
            console.error("Error al cargar en tiempo real:", error);
            setLoading(false);
            notification.error({ message: 'Error de conexión con el catálogo' });
        });

        return () => unsubscribe();
    }, []);

    // --- LÓGICA DE FILTRADO (useMemo para no re-renderizar de más) ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchCategory = filterCategory === 'Todos' || product.category === filterCategory;
            
            const price = Number(product.price) || 0;
            const matchPrice = price >= filterPrice[0] && price <= filterPrice[1];
            
            let matchFamily = true;
            if (filterFamilies.length > 0) {
                // filterFamilies contiene los values ej ['Amaderado', 'Oriental']
                matchFamily = filterFamilies.includes(product.family);
            }

            return matchSearch && matchCategory && matchPrice && matchFamily;
        });
    }, [products, filterCategory, filterPrice, filterFamilies, searchQuery]);

    const { addToCart } = useCart();

    const isColones = useMemo(() => products.some(p => p.currency === 'CRC'), [products]);
    const maxBoundary = useMemo(() => {
        if (!products.length) return 300;
        const max = Math.max(...products.map(p => Number(p.price) || 0));
        return isColones ? Math.ceil(max / 10000) * 10000 : Math.max(Math.ceil(max / 50) * 50, 300);
    }, [products, isColones]);

    // Checkear si el filtro guardado es diminuto vs la nueva moneda para auto-expandirlo
    useEffect(() => {
        if (isColones && filterPrice[1] <= 300) {
            setFilterPrice([0, maxBoundary]);
        }
    }, [isColones, maxBoundary, filterPrice, setFilterPrice]);

    // --- ACCIONES ---
    const handleAddToCart = (product) => {
        addToCart(product, 1);
    };

    // --- FILTROS (useMemo para evitar re-montar durante el drag del slider) ---
    const filtersNode = useMemo(() => (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 pb-6">
                
                {/* CATEGORÍA */}
                <div className="space-y-4">
                    <h3 className="text-gray-900 font-serif tracking-widest text-lg border-b border-gray-200 pb-2">CATEGORÍA</h3>
                    <Radio.Group 
                        className="grid grid-cols-2 gap-3 w-full" 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        {CATEGORIES.map(cat => (
                            <Radio key={cat} value={cat} className="text-gray-600">{cat}</Radio>
                        ))}
                    </Radio.Group>
                </div>

                {/* FAMILIA BOTÁNICA */}
                <div className="space-y-4">
                    <h3 className="text-gray-900 font-serif tracking-widest text-lg border-b border-gray-200 pb-2">FAMILIA BOTÁNICA</h3>
                    <Checkbox.Group 
                        className="grid grid-cols-2 gap-3 w-full"
                        options={dbFamilies.map(f => ({ label: <span className="text-gray-600">{f.label}</span>, value: f.value }))}
                        value={filterFamilies}
                        onChange={setFilterFamilies}
                    />
                </div>

                {/* PRECIO */}
                <div className="space-y-4">
                    <h3 className="text-gray-900 font-serif tracking-widest text-lg border-b border-gray-200 pb-2">PRECIO</h3>
                    <div className="px-1 pt-2">
                        <div className="valex-range-wrap">
                            <input 
                                type="range" 
                                min={0} max={maxBoundary} step={isColones ? 1000 : 10}
                                value={filterPrice[0]} 
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val <= filterPrice[1]) setFilterPrice([val, filterPrice[1]]);
                                }}
                                className="valex-range valex-range--min"
                            />
                            <input 
                                type="range" 
                                min={0} max={maxBoundary} step={isColones ? 1000 : 10}
                                value={filterPrice[1]} 
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val >= filterPrice[0]) setFilterPrice([filterPrice[0], val]);
                                }}
                                className="valex-range valex-range--max"
                            />
                            <div className="valex-range-track">
                                <div 
                                    className="valex-range-fill"
                                    style={{
                                        left: `${(filterPrice[0] / maxBoundary) * 100}%`,
                                        right: `${100 - (filterPrice[1] / maxBoundary) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-bioflora-fucsia text-sm mt-4 font-sans font-medium">
                            <span>{formatPrice(filterPrice[0], isColones)}</span>
                            <span>{formatPrice(filterPrice[1], isColones)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons pinned at bottom */}
            <div className="flex-shrink-0 pt-4 pb-4 mt-2 border-t border-gray-200 flex gap-3">
                 <Button 
                    onClick={() => { setFilterCategory('Todos'); setFilterFamilies([]); setFilterPrice([0, maxBoundary]); setDrawerVisible(false); }} 
                    className="flex-1 h-12 bg-transparent text-gray-500 border-gray-200 hover:!border-bioflora-morado hover:!text-bioflora-morado font-serif tracking-widest text-xs"
                 >
                     LIMPIAR
                 </Button>
                 <Button 
                    onClick={() => setDrawerVisible(false)} 
                    className="flex-1 h-12 bg-bioflora-morado text-white hover:!bg-bioflora-morado/80 hover:!text-white border-none font-serif tracking-widest text-xs font-bold"
                 >
                     APLICAR FILTROS
                 </Button>
            </div>
        </div>
    ), [filterCategory, filterFamilies, filterPrice, drawerVisible]);

    return (
        <ConfigProvider
            theme={{
                algorithm: antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#69358C',       // Morado Clásico Bioflora (#69358C)
                    colorBgBase: '#FFFFFF',        // Fondo blanco puro
                    colorBgContainer: '#FFFFFF',   // Fondo contenedor blanco
                    colorTextBase: '#050B14',      // Texto base oscuro
                    colorTextSecondary: '#4B5563', // Texto secundario (gray-600)
                    fontFamily: '"Poppins", "Outfit", sans-serif',
                },
                components: {
                    Collapse: { headerPadding: '12px 0px' },
                    Card: { paddingLG: 20 },
                }
            }}
        >
            <div className="min-h-screen bg-[#F4F9FA] flex flex-col">
                <Navbar 
                    menuOpen={menuOpen} 
                    setMenuOpen={setMenuOpen} 
                    shopSearchQuery={searchQuery}
                    setShopSearchQuery={setSearchQuery}
                    onToggleMobileFilters={() => setDrawerVisible(!drawerVisible)}
                    hasActiveFilters={filterCategory !== 'Todos' || filterFamilies.length > 0}
                    isFilterMenuOpen={drawerVisible}
                    mobileFiltersNode={filtersNode}
                    isCompactView={isCompactView}
                    setIsCompactView={setIsCompactView}
                />
                
                <main className="flex-1 pt-[140px] md:pt-[120px] bg-[#F4F9FA] max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="w-full h-8" />
 
                        {/* Contenedor Flex para Contenido Principal */}
                        <div className="flex flex-row w-full items-start">
                            
                            {/* Contenido Principal de Tarjetas */}
                            <section className="bg-transparent min-h-screen flex-1 w-full min-w-0 md:pt-4">
                                {loading ? (
                                    <Row gutter={[16, 24]}>
                                        {[1, 2, 3, 4].map(i => (
                                            <Col xs={isCompactView ? 12 : 24} sm={12} xl={8} key={i}>
                                                <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}>
                                                    <Skeleton.Image active className="w-full !h-[300px] mb-4" />
                                                    <Skeleton active paragraph={{ rows: 2 }} />
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center py-24 border border-gray-200 rounded-2xl bg-white">
                                        <p className="text-gray-500 text-xl font-serif">No se encontraron plantas exóticas con esta selección.</p>
                                        <Button type="link" onClick={() => { setFilterCategory('Todos'); setFilterFamilies([]); setFilterPrice([0, maxBoundary]); }}>
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {/* ── VISTA PC (hidden en móvil) ── */}
                                        <div className="hidden md:block">
                                            <Row gutter={[24, 32]}>
                                                {filteredProducts.map(product => (
                                                    <Col md={8} lg={6} key={product.id}>
                                                        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="h-full">
                                                            <CardBadgeWrap product={product}>
                                                                <DesktopCard product={product} useBg={useBgImages} onAddToCart={handleAddToCart} />
                                                            </CardBadgeWrap>
                                                        </motion.div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>

                                        {/* ── VISTA MÓVIL (animada entre lista y cuadrícula) ── */}
                                        <div className="md:hidden overflow-visible pr-2">
                                            <AnimatePresence mode="wait">
                                                {!isCompactView ? (
                                                    <motion.div
                                                        key="mobile-list"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                        className="flex flex-col gap-6"
                                                    >
                                                        {filteredProducts.map((product) => (
                                                            <div key={product.id}>
                                                                <CardBadgeWrap product={product}>
                                                                    <MobileCard product={product} useBg={useBgImages} onAddToCart={handleAddToCart} />
                                                                </CardBadgeWrap>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="mobile-grid"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    >
                                                        <Row gutter={[12, 16]}>
                                                            {filteredProducts.map((product) => (
                                                                <Col xs={12} key={product.id}>
                                                                    <div className="h-full">
                                                                        <CardBadgeWrap product={product}>
                                                                            <MobileCompactCard product={product} useBg={useBgImages} onAddToCart={handleAddToCart} />
                                                                        </CardBadgeWrap>
                                                                    </div>
                                                                </Col>
                                                            ))}
                                                        </Row>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </>
                                )}
                            </section>
                        </div>

                    <AnimatePresence>
                        {showFloatingBtn && !drawerVisible && !menuOpen && waNumber && (
                            <motion.a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="fixed bottom-6 right-4 z-30 flex items-center justify-center w-14 h-14 bg-bioflora-verde rounded-full hover:scale-110 transition-transform duration-500 ease-out shadow-xl animate-glow-pulse"
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                aria-label="Contactar por WhatsApp"
                            >
                                <FaWhatsapp className="w-7 h-7 text-white" />
                            </motion.a>
                        )}
                    </AnimatePresence>

                </main>
            </div>
        </ConfigProvider>
    );
}

// ── Wrapper para Badge (Agotado / Destacado) ──
const CardBadgeWrap = ({ product, children }) => {
    if (product.stock === 'Agotado' || product.stock === 0) {
        return <Badge.Ribbon text="Agotado" color="volcano">{children}</Badge.Ribbon>;
    }
    if (product.isFeatured) {
        return <Badge.Ribbon text="Destacado" color="#D60C8C">{children}</Badge.Ribbon>;
    }
    return children;
};

// ══════════════════════════════════════════════════
//  1. TARJETA PC (Desktop) — 4 columnas, compacta
// ══════════════════════════════════════════════════
const DesktopCard = ({ product, useBg, onAddToCart }) => {
    const { openProductDrawer } = useProductDrawer();
    const isOutOfStock = product.stock === 'Agotado' || product.stock === 0;
    const hasBg = product.galleryImages && product.galleryImages.length > 0;
    const imgUrl = useBg && hasBg ? product.galleryImages[0] : (product.coverImage || product.imageUrl);

    return (
        <div
            onClick={() => openProductDrawer(product)}
            className="overflow-hidden border border-[#00A7D0]/20 group bg-gradient-to-br from-white via-white to-[#E6F6F9] h-full flex flex-col rounded-2xl transition-all duration-500 hover:border-[#00A7D0]/50 shadow-sm hover:shadow-[0_12px_36px_rgba(0,167,208,0.16)] hover:-translate-y-1 cursor-pointer"
        >
            <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-50/50">
                {imgUrl ? (
                    <img 
                        src={imgUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        style={{ filter: isOutOfStock ? 'grayscale(100%) opacity(70%)' : 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400 font-serif italic text-xs">Sin imagen</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col pt-3 px-3 pb-3">
                <span className="text-[9px] font-sans tracking-[0.2em] text-gray-500 uppercase mb-0.5">{product.category}</span>
                <h3 className="font-sans font-semibold text-gray-900 mt-0 mb-0.5 group-hover:text-[#00A7D0] transition-colors text-xs lg:text-sm line-clamp-2 min-h-[32px] leading-tight">
                    {product.name}
                </h3>
                <span className="text-[10px] text-gray-400/80 font-sans tracking-wide mb-2 block">{product.family || '—'}</span>
                <div className="mb-3"><CareGuideCompact careGuide={product.careGuide} size={17} /></div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100/65">
                    <span className="font-sans font-bold text-[#69358C] text-sm lg:text-base tracking-wide">{formatPrice(product.price, product.currency === 'CRC')}</span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); openProductDrawer(product); }}
                            className="bg-transparent border border-[#00A7D0] text-[#00A7D0] hover:bg-[#00A7D0] hover:text-white rounded-full px-5 h-9 flex items-center justify-center text-[10px] font-sans font-extrabold tracking-[0.15em] uppercase transition-all duration-300"
                        >VER</button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                            disabled={isOutOfStock}
                            className="flex items-center justify-center bg-[#69358C] text-white hover:bg-[#00A7D0] rounded-full w-9 h-9 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:scale-105 shrink-0"
                            title="Añadir al carrito"
                        >
                            <ShoppingCart className="w-[15px] h-[15px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════
//  2. TARJETA MÓVIL LISTA — scroll natural
//     Imagen 4:5, info compacta y legible
// ══════════════════════════════════════════════════
const MobileCard = ({ product, useBg, onAddToCart }) => {
    const { openProductDrawer } = useProductDrawer();
    const isOutOfStock = product.stock === 'Agotado' || product.stock === 0;
    const hasBg = product.galleryImages && product.galleryImages.length > 0;
    const imgUrl = useBg && hasBg ? product.galleryImages[0] : (product.coverImage || product.imageUrl);

    return (
        <div 
            onClick={() => openProductDrawer(product)}
            className="overflow-hidden rounded-2xl border border-[#00A7D0]/20 bg-gradient-to-br from-white via-white to-[#E6F6F9] cursor-pointer group shadow-sm transition-all duration-300 hover:border-[#00A7D0]/50 hover:shadow-[0_10px_25px_rgba(0,167,208,0.12)] flex flex-col active:scale-[0.98]"
        >
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-50/50">
                {imgUrl ? (
                    <img 
                        src={imgUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        style={{ filter: isOutOfStock ? 'grayscale(100%) opacity(70%)' : 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400 font-serif italic text-sm">Sin imagen</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1.5 px-3.5 pt-3.5 pb-3.5">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-sans tracking-[0.2em] text-gray-500 uppercase">{product.category}</span>
                    <span className="text-[9px] font-sans tracking-wide text-gray-400">{product.family || ''}</span>
                </div>
                <h3 className="font-sans font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#00A7D0] transition-colors line-clamp-2">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-[11px] font-light text-gray-500/80 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}
                <CareGuideCompact careGuide={product.careGuide} size={18} />

                <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 font-sans tracking-wider uppercase">Precio</span>
                        <span className="font-sans font-bold text-[#69358C] text-lg tracking-wide leading-none">{formatPrice(product.price, product.currency === 'CRC')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); openProductDrawer(product); }}
                            className="bg-transparent border-2 border-[#00A7D0] text-[#00A7D0] hover:bg-[#00A7D0] hover:text-white rounded-full px-5 h-10 flex items-center justify-center text-[11px] font-sans font-extrabold tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
                        >VER</button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                            disabled={isOutOfStock}
                            className="flex items-center justify-center bg-[#69358C] text-white h-10 px-5 rounded-full hover:bg-[#00A7D0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
                            title="Añadir al carrito"
                        >
                            <ShoppingCart className="w-[15px] h-[15px] mr-1.5" />
                            <span className="text-[11px] uppercase font-sans tracking-[0.15em] font-extrabold mt-[0.5px]">AÑADIR</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════
//  3. TARJETA MÓVIL CUADRÍCULA — 2 columnas, mini
// ══════════════════════════════════════════════════
const MobileCompactCard = ({ product, useBg, onAddToCart }) => {
    const { openProductDrawer } = useProductDrawer();
    const isOutOfStock = product.stock === 'Agotado' || product.stock === 0;
    const hasBg = product.galleryImages && product.galleryImages.length > 0;
    const imgUrl = useBg && hasBg ? product.galleryImages[0] : (product.coverImage || product.imageUrl);

    return (
        <div
            onClick={() => openProductDrawer(product)}
            className="overflow-hidden border border-[#00A7D0]/20 bg-gradient-to-br from-white via-white to-[#E6F6F9] h-full flex flex-col rounded-2xl shadow-sm hover:border-[#00A7D0]/48 active:scale-[0.97] transition-all duration-300 cursor-pointer"
        >
            <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-50/50">
                {imgUrl ? (
                    <img 
                        src={imgUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        style={{ filter: isOutOfStock ? 'grayscale(100%) opacity(70%)' : 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400 font-serif italic text-[10px]">Sin imagen</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 px-2.5 pt-2.5 pb-2.5 justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-sans tracking-[0.2em] text-gray-500 uppercase block">{product.category}</span>
                    <h3 className="font-sans font-semibold text-gray-900 text-xs leading-snug line-clamp-2 min-h-[32px] tracking-wide">
                        {product.name}
                    </h3>
                    <CareGuideCompact careGuide={product.careGuide} size={15} />
                </div>

                <div className="pt-2 border-t border-gray-100/65 flex items-center justify-between mt-auto">
                    <span className="font-sans font-bold text-[#69358C] text-xs leading-none">{formatPrice(product.price, product.currency === 'CRC')}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        disabled={isOutOfStock}
                        className="h-7 w-7 rounded-full bg-[#69358C] text-white flex items-center justify-center hover:bg-[#00A7D0] active:scale-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        title="Añadir al carrito"
                    >
                        <ShoppingCart className="w-[12px] h-[12px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};
