import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Layout, Row, Col, Card, Button, Badge, Skeleton, Radio, Checkbox, Slider, Collapse, Typography, FloatButton, Drawer, notification, ConfigProvider, theme as antTheme, Grid, Input } from 'antd';
import { FilterOutlined, SearchOutlined, PictureOutlined, BgColorsOutlined } from '@ant-design/icons';
import { ShoppingBag } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProductDrawer } from '../context/ProductDrawerContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- DICCIONARIO DE FILTROS ---
const CATEGORIES = ['Todos', 'Orquídeas', 'Exóticas', 'Flores Tropicales', 'Accesorios'];
const FAMILIES = [
    { label: 'Orchidaceae (Orquídeas)', value: 'Orchidaceae' },
    { label: 'Orchidaceae (Flor Nacional)', value: 'Orchidaceae (Flor Nacional)' },
    { label: 'Araceae (Monsteras/Anturios)', value: 'Araceae' },
    { label: 'Insumos Profesionales', value: 'Insumos Profesionales' },
];

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
    }, [isColones, maxBoundary]);

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
                    <h3 className="text-valex-hueso font-serif tracking-widest text-lg border-b border-valex-gris/10 pb-2">CATEGORÍA</h3>
                    <Radio.Group 
                        className="grid grid-cols-2 gap-3 w-full" 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        {CATEGORIES.map(cat => (
                            <Radio key={cat} value={cat} className="text-valex-gris">{cat}</Radio>
                        ))}
                    </Radio.Group>
                </div>

                {/* FAMILIA BOTÁNICA */}
                <div className="space-y-4">
                    <h3 className="text-valex-hueso font-serif tracking-widest text-lg border-b border-valex-gris/10 pb-2">FAMILIA BOTÁNICA</h3>
                    <Checkbox.Group 
                        className="grid grid-cols-2 gap-3 w-full"
                        options={FAMILIES.map(f => ({ label: <span className="text-valex-gris">{f.label}</span>, value: f.value }))}
                        value={filterFamilies}
                        onChange={setFilterFamilies}
                    />
                </div>

                {/* PRECIO */}
                <div className="space-y-4">
                    <h3 className="text-valex-hueso font-serif tracking-widest text-lg border-b border-valex-gris/10 pb-2">PRECIO</h3>
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
                        <div className="flex justify-between text-bioflora-naranja text-sm mt-4 font-sans font-medium">
                            <span>{formatPrice(filterPrice[0], isColones)}</span>
                            <span>{formatPrice(filterPrice[1], isColones)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons pinned at bottom */}
            <div className="flex-shrink-0 pt-4 pb-4 mt-2 border-t border-valex-gris/10 flex gap-3">
                 <Button 
                    onClick={() => { setFilterCategory('Todos'); setFilterFamilies([]); setFilterPrice([0, maxBoundary]); setDrawerVisible(false); }} 
                    className="flex-1 h-12 bg-transparent text-valex-gris border-bioflora-morado/30 hover:!border-bioflora-morado hover:!text-bioflora-morado font-serif tracking-widest text-xs"
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
                algorithm: antTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#7C3AED',       // Morado Principal Bioflora
                    colorBgBase: '#070F0A',        // Verde Bosque Nocturno ultra-oscuro
                    colorBgContainer: '#0D1C13',   // Cards background (Tarjetas Bosque)
                    colorTextBase: '#F9F9F6',      // Blanco Hueso / Arena
                    colorTextSecondary: '#A3B899', // Verde Salvia Elegante
                    fontFamily: '"Poppins", "Outfit", sans-serif',
                },
                components: {
                    Collapse: { headerPadding: '12px 0px' },
                    Card: { paddingLG: 20 },
                }
            }}
        >
            <div className="min-h-screen bg-valex-negro flex flex-col">
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
                
                <main className="flex-1 pt-[140px] md:pt-[120px] bg-valex-negro max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="w-full h-8" />
 
                        {/* Contenedor Flex para Contenido Principal */}
                        <div className="flex flex-row w-full items-start">
                            
                            {/* Contenido Principal de Tarjetas */}
                            <section className="bg-transparent min-h-screen flex-1 w-full min-w-0 md:pt-4">
                                {loading ? (
                                    <Row gutter={[16, 24]}>
                                        {[1, 2, 3, 4].map(i => (
                                            <Col xs={isCompactView ? 12 : 24} sm={12} xl={8} key={i}>
                                                <Card style={{ backgroundColor: '#0D1C13', border: '1px solid rgba(163,184,153,0.1)' }}>
                                                    <Skeleton.Image active className="w-full !h-[300px] mb-4" />
                                                    <Skeleton active paragraph={{ rows: 2 }} />
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center py-24 border border-valex-gris/10 rounded-2xl bg-[#0D1C13]">
                                        <p className="text-valex-gris text-xl font-serif">No se encontraron plantas exóticas con esta selección.</p>
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
                                                                            <MobileCompactCard product={product} useBg={useBgImages} />
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
    const navigate = useNavigate();
    const { openProductDrawer } = useProductDrawer();
    const isOutOfStock = product.stock === 'Agotado' || product.stock === 0;
    const hasBg = product.galleryImages && product.galleryImages.length > 0;
    const imgUrl = useBg && hasBg ? product.galleryImages[0] : (product.coverImage || product.imageUrl);

    return (
        <Card
            hoverable
            onClick={() => openProductDrawer(product)}
            className="overflow-hidden border-valex-gris/10 group bg-bioflora-tarjeta h-full flex flex-col transition-all duration-500 hover:border-bioflora-verde/30 shadow-none hover:shadow-[0_8px_30px_rgba(0,169,79,0.2)] cursor-pointer"
            cover={
                <div className="relative aspect-square overflow-hidden bg-transparent">
                    {imgUrl ? (
                        <img 
                            src={imgUrl}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            style={{ filter: isOutOfStock ? 'grayscale(100%) opacity(70%)' : 'none' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-valex-negro">
                            <span className="text-valex-gris/30 font-serif italic text-sm">Sin imagen</span>
                        </div>
                    )}
                </div>
            }
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 16px' } }}
        >
            <div className="text-[10px] font-sans tracking-[0.2em] text-valex-gris uppercase mb-0.5">{product.category}</div>
            <Typography.Title level={5} className="!font-sans !font-semibold !text-valex-hueso !mt-0 !mb-0.5 group-hover:!text-bioflora-fucsia transition-colors !text-sm lg:!text-base">
                {product.name}
            </Typography.Title>
            <div className="text-[11px] text-valex-gris/60 font-sans tracking-wide mb-2">{product.family || '—'}</div>
            <div className="mt-auto flex items-center justify-between pt-2 border-t border-valex-gris/10">
                <span className="font-sans font-medium text-bioflora-naranja text-base tracking-wide">{formatPrice(product.price, product.currency === 'CRC')}</span>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); openProductDrawer(product); }}
                        className="bg-transparent border border-bioflora-naranja/60 text-bioflora-naranja hover:bg-bioflora-naranja hover:text-bioflora-bosque rounded-full px-5 py-1.5 text-[9px] font-sans font-extrabold tracking-[0.2em] uppercase transition-all duration-300"
                    >VER</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        disabled={isOutOfStock}
                        className="flex items-center justify-center bg-bioflora-naranja text-bioflora-bosque h-8 w-8 rounded-full hover:bg-bioflora-fucsia hover:text-bioflora-arena transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-bioflora-naranja/20"
                        title="Añadir a Bolsa"
                    >
                        <ShoppingBag className="w-[16px] h-[16px]" />
                    </button>
                </div>
            </div>
        </Card>
    );
};

// ══════════════════════════════════════════════════
//  2. TARJETA MÓVIL LISTA — scroll natural
//     Imagen 4:5, info compacta y legible
// ══════════════════════════════════════════════════
const MobileCard = ({ product, useBg, onAddToCart }) => {
    const navigate = useNavigate();
    const { openProductDrawer } = useProductDrawer();
    const isOutOfStock = product.stock === 'Agotado' || product.stock === 0;
    const hasBg = product.galleryImages && product.galleryImages.length > 0;
    const imgUrl = useBg && hasBg ? product.galleryImages[0] : (product.coverImage || product.imageUrl);

    return (
        <div 
            className="overflow-hidden rounded-lg border border-valex-gris/10 bg-bioflora-tarjeta cursor-pointer group"
            onClick={() => openProductDrawer(product)}
        >
            {/* Imagen — aspect ratio 4:5 */}
            <div className="relative aspect-[4/5] overflow-hidden">
                {imgUrl ? (
                    <img 
                        src={imgUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        style={{ filter: isOutOfStock ? 'grayscale(100%) opacity(70%)' : 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-valex-negro">
                        <span className="text-valex-gris/30 font-serif italic text-sm">Sin imagen</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="px-4 py-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans tracking-[0.2em] text-valex-gris uppercase">{product.category}</span>
                    <span className="text-[10px] font-sans tracking-wide text-valex-gris/50">{product.family || ''}</span>
                </div>
                <h3 className="font-sans font-medium text-valex-hueso text-xs leading-snug group-hover:text-bioflora-fucsia transition-colors line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-sm font-light text-valex-gris/60 line-clamp-3 leading-relaxed">
                    {product.description || product.notes || '—'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-valex-gris/10 mt-2">
                    <span className="font-sans font-semibold text-bioflora-naranja text-xl tracking-wide">{formatPrice(product.price, product.currency === 'CRC')}</span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); openProductDrawer(product); }}
                            className="bg-transparent border border-bioflora-naranja/60 text-bioflora-naranja hover:bg-bioflora-naranja hover:text-bioflora-bosque rounded-full px-5 h-8 flex items-center justify-center text-[9px] font-sans font-extrabold tracking-[0.2em] uppercase transition-all duration-300"
                        >VER</button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                            disabled={isOutOfStock}
                            className="flex items-center justify-center bg-bioflora-naranja text-bioflora-bosque h-8 px-5 rounded-full hover:bg-bioflora-fucsia hover:text-bioflora-arena transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-bioflora-naranja/20"
                            title="Añadir a Bolsa"
                        >
                            <ShoppingBag className="w-[15px] h-[15px] mr-2" />
                            <span className="text-[9px] uppercase font-sans tracking-[0.2em] font-extrabold mt-[1px]">AÑADIR</span>
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
const MobileCompactCard = ({ product, useBg }) => {
    const navigate = useNavigate();
    const { openProductDrawer } = useProductDrawer();
    const isOutOfStock = product.stock === 'Agotado' || product.stock === 0;
    const hasBg = product.galleryImages && product.galleryImages.length > 0;
    const imgUrl = useBg && hasBg ? product.galleryImages[0] : (product.coverImage || product.imageUrl);

    return (
        <Card
            hoverable
            onClick={() => openProductDrawer(product)}
            className="overflow-hidden border-valex-gris/10 group bg-bioflora-tarjeta h-full flex flex-col shadow-none cursor-pointer"
            cover={
                <div className="relative aspect-square overflow-hidden bg-transparent">
                    {imgUrl ? (
                        <img 
                            src={imgUrl}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            style={{ filter: isOutOfStock ? 'grayscale(100%) opacity(70%)' : 'none' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-valex-negro">
                            <span className="text-valex-gris/30 font-serif italic text-xs">Sin imagen</span>
                        </div>
                    )}
                </div>
            }
            styles={{ body: { padding: '8px 10px' } }}
        >
            <Typography.Title level={5} className="!font-sans !font-semibold !text-valex-hueso !mt-0 !mb-0.5 !text-xs">
                {product.name}
            </Typography.Title>
            <div className="flex items-center justify-between mt-1 border-t border-valex-gris/10 pt-2">
                <span className="font-sans font-medium text-bioflora-naranja text-sm">{formatPrice(product.price, product.currency === 'CRC')}</span>
                <button className="text-[8px] font-sans font-extrabold uppercase tracking-[0.2em] text-bioflora-naranja border border-bioflora-naranja/50 rounded-full px-3 py-1 hover:bg-bioflora-naranja hover:text-bioflora-bosque transition-colors mt-1">VER</button>
            </div>
        </Card>
    );
};
