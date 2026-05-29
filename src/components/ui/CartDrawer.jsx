import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, ConfigProvider, theme as antTheme } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { Trash2, Minus, Plus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutForm from './CheckoutForm';

const formatPrice = (price, isCRC) => {
    return new Intl.NumberFormat(isCRC ? 'es-CR' : 'en-US', {
        style: 'currency',
        currency: isCRC ? 'CRC' : 'USD',
        minimumFractionDigits: isCRC ? 0 : 2,
        maximumFractionDigits: isCRC ? 0 : 2
    }).format(Number(price) || 0);
};

export default function CartDrawer() {
    const { 
        cartItems, 
        isCartDrawerOpen, 
        setIsCartDrawerOpen, 
        removeFromCart, 
        updateQuantity, 
        getCartTotal 
    } = useCart();

    const navigate = useNavigate();
    const [showCheckout, setShowCheckout] = useState(false);
    const total = getCartTotal();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isCRC = cartItems.some(item => item.currency === 'CRC');

    // Resetear checkout al cerrar
    useEffect(() => {
        if (!isCartDrawerOpen) setShowCheckout(false);
    }, [isCartDrawerOpen]);

    const getItemImage = (item) => {
        if (item.galleryImages?.length > 0) return item.galleryImages[0];
        return item.coverImage || item.imageUrl || '';
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
                    fontFamily: '"Poppins", sans-serif',
                }
            }}
        >
            <Drawer
                title={null}
                closable={false}
                placement="right"
                onClose={() => setIsCartDrawerOpen(false)}
                open={isCartDrawerOpen}
                width={window.innerWidth <= 1024 ? '100%' : 420}
                zIndex={2000}
                styles={{ 
                    header: { display: 'none' }, 
                    body: { padding: '0', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100dvh' },
                }}
            >
                {/* Header personalizado */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                    <button
                        onClick={() => showCheckout ? setShowCheckout(false) : setIsCartDrawerOpen(false)}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-950 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-gray-50 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-sans uppercase tracking-wider">
                            {showCheckout ? 'Volver al Carrito' : 'Volver'}
                        </span>
                    </button>
 
                    <AnimatePresence mode="wait">
                        {!showCheckout && (
                             <motion.div
                                key="bag-title"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4 text-[#00A7D0]" />
                                <span className="font-serif text-gray-900 text-base tracking-wider">MI CARRITO</span>
                                <span className="bg-[#00A7D0]/10 text-[#00A7D0] text-[10px] font-sans font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
 
                    <div className="w-16" />
                </div>
 
                {cartItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8 bg-white">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#69358C]/5 flex items-center justify-center">
                                <ShoppingCart className="w-8 h-8 text-[#00A7D0]/40" />
                            </div>
                            <p className="text-gray-700 font-serif text-lg mb-2">Tu carrito está vacío</p>
                            <p className="text-gray-400 font-sans text-sm mb-6">Explora nuestras especies y orquídeas exóticas</p>
                            <button 
                                onClick={() => { setIsCartDrawerOpen(false); navigate('/tienda'); }}
                                className="bg-[#69358C] text-white font-sans font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#69358C]/80 transition-all duration-300 shadow-lg shadow-[#69358C]/20"
                            >
                                Explorar Catálogo
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {!showCheckout ? (
                                <motion.div
                                    key="cart-items"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="absolute inset-0 flex flex-col"
                                >
                                    {/* Lista de items */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                        <AnimatePresence>
                                            {cartItems.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, x: 30 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex gap-3 group hover:border-[#69358C]/20 transition-colors duration-300"
                                                >
                                                    <div 
                                                        className="w-[72px] h-[72px] flex-shrink-0 bg-white rounded-lg bg-center bg-cover bg-no-repeat border border-gray-200"
                                                        style={{ backgroundImage: `url(${getItemImage(item)})` }}
                                                    />
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="font-sans font-semibold text-gray-900 text-sm leading-tight truncate">{item.name}</h4>
                                                            <p className="text-[11px] text-gray-400 font-sans mt-0.5">{item.ml ? `${item.ml} ml` : item.category}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center gap-0 bg-white rounded-lg border border-gray-200">
                                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#00A7D0] transition-colors">
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="text-gray-800 text-xs font-sans font-medium w-6 text-center">{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#00A7D0] transition-colors">
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <span className="font-sans font-semibold text-[#69358C] text-sm">
                                                                {formatPrice(item.price * item.quantity, item.currency === 'CRC')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="self-start p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    {/* Footer */}
                                    <div className="border-t border-gray-100 px-6 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white flex-shrink-0">
                                        <div className="flex justify-between items-center mb-5">
                                            <span className="font-sans text-gray-500 text-xs uppercase tracking-[0.2em]">Total Estimado</span>
                                            <span className="font-serif font-bold text-2xl text-[#69358C]">{formatPrice(total, isCRC)}</span>
                                        </div>
                                        <button
                                            onClick={() => setShowCheckout(true)}
                                            className="w-full py-3.5 bg-[#69358C] text-white font-sans font-bold text-sm tracking-[0.15em] uppercase rounded-xl hover:bg-[#00A7D0] transition-all duration-300 shadow-[0_4px_20px_rgba(105,53,140,0.15)] flex items-center justify-center gap-2"
                                        >
                                            <CreditCardOutlined className="text-base" />
                                            Proceder al Pago
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="checkout-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex-1 overflow-hidden p-5 bg-white"
                                >
                                    <CheckoutForm
                                        items={cartItems}
                                        total={total}
                                        preserveCart={false}
                                        onSuccess={() => setIsCartDrawerOpen(false)}
                                        showMobileSummary={true}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </Drawer>
        </ConfigProvider>
    );
}
