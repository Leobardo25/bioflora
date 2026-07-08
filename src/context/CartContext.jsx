import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('valex_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [customNotification, setCustomNotification] = useState(null);
    const isCartOpenRef = useRef(false);
    const isHydrated = useRef(false);

    // Efecto para manejar el botón atrás de Android con el CartDrawer
    useEffect(() => {
        const handlePopState = () => {
            if (isCartOpenRef.current) {
                isCartOpenRef.current = false;
                setIsCartDrawerOpen(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleSetIsCartDrawerOpen = useCallback((open) => {
        if (open) {
            isCartOpenRef.current = true;
            window.history.pushState({ cartOpen: true }, '');
        } else {
            isCartOpenRef.current = false;
        }
        setIsCartDrawerOpen(open);
    }, []);

    // Guardar en localStorage cuando cambia el carrito (saltar primer render para no sobrescribir)
    useEffect(() => {
        if (!isHydrated.current) {
            isHydrated.current = true;
            return;
        }
        localStorage.setItem('valex_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        let timer;
        if (customNotification) {
            timer = setTimeout(() => {
                setCustomNotification(null);
            }, 3500);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [customNotification]);

    const addToCart = useCallback((product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });

        // Activar nuestra notificación premium personalizada
        setCustomNotification({
            product,
            quantity
        });
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, delta) => {
        setCartItems(prevItems => prevItems.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
    }, [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen: handleSetIsCartDrawerOpen
    }), [
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isCartDrawerOpen,
        handleSetIsCartDrawerOpen
    ]);

    return (
        <CartContext.Provider value={value}>
            {children}
            
            {/* Notificación Premium Flotante (iOS style pill) */}
            <AnimatePresence>
                {customNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -70, x: '-50%', scale: 0.9 }}
                        animate={{ opacity: 1, y: 20, x: '-50%', scale: 1 }}
                        exit={{ opacity: 0, y: -70, x: '-50%', scale: 0.9 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        onClick={() => {
                            handleSetIsCartDrawerOpen(true);
                            setCustomNotification(null);
                        }}
                        className="fixed top-0 left-1/2 z-[3000] w-[90%] max-w-[360px] bg-white border border-[#1EBE5D]/30 rounded-2xl shadow-[0_15px_35px_rgba(0,167,208,0.18)] p-3 cursor-pointer hover:border-[#1EBE5D]/50 transition-all duration-300 flex items-center gap-3 select-none active:scale-[0.98]"
                    >
                        {/* Imagen del producto mini */}
                        <div className="w-11 h-11 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                            {customNotification.product.galleryImages?.[0] || customNotification.product.coverImage || customNotification.product.imageUrl ? (
                                <img 
                                    src={customNotification.product.galleryImages?.[0] || customNotification.product.coverImage || customNotification.product.imageUrl} 
                                    alt={customNotification.product.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#69358C] bg-[#E6F6F9]">
                                    <ShoppingCart className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {/* Detalle */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-[9px] font-sans font-bold tracking-[0.2em] text-[#1EBE5D] uppercase">
                                ¡Añadido al Carrito!
                            </span>
                            <h4 className="text-xs font-sans font-semibold text-gray-900 leading-tight truncate mt-0.5 m-0">
                                {customNotification.product.name}
                            </h4>
                            <span className="text-[10px] text-[#69358C] font-semibold mt-1 flex items-center gap-1">
                                Ver mi carrito →
                            </span>
                        </div>

                        {/* Cerrar */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCustomNotification(null);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-950 transition-colors rounded-lg hover:bg-gray-100/50 flex items-center justify-center"
                        >
                            <span className="text-xs font-sans font-bold block leading-none">✕</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
}
