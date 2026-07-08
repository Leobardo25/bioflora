import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { notification } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ShoppingCart } from 'lucide-react';

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
    }, []); // Sin dependencias: usa ref para evitar closure stale

    const handleSetIsCartDrawerOpen = useCallback((open) => {
        if (open) {
            isCartOpenRef.current = true;
            window.history.pushState({ drawer: 'CartDrawer' }, '');
        } else {
            isCartOpenRef.current = false;
            if (window.history.state?.drawer === 'CartDrawer') {
                window.history.back();
            }
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

        const productImage = product.galleryImages?.[0] || product.coverImage || product.imageUrl;
        
        notification.open({
            message: null,
            description: (
                <div className="flex items-center gap-4 -my-1">
                    {productImage ? (
                        <div className="w-12 h-12 rounded-lg border border-[#00A7D0]/20 overflow-hidden flex-shrink-0 shadow-sm">
                            <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#E6F6F9] border border-gray-100 flex items-center justify-center flex-shrink-0 text-[#69358C]">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    )}
                    <div className="flex flex-col flex-1 justify-center min-w-0">
                        <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#1EBE5D] font-bold mb-0.5">
                            ¡Añadido al Carrito!
                        </span>
                        <h4 className="font-serif text-[13px] font-semibold text-gray-900 leading-tight line-clamp-1 m-0">
                            {product.name}
                        </h4>
                        <span className="font-sans text-[10px] text-[#69358C] font-semibold mt-1 flex items-center gap-1">
                            Ver carrito →
                        </span>
                    </div>
                </div>
            ),
            placement: 'top',
            onClick: () => {
                handleSetIsCartDrawerOpen(true);
            },
            style: { 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '2px solid rgba(30, 190, 93, 0.25)', 
                borderRadius: '20px',
                padding: '14px 18px',
                width: '350px',
                boxShadow: '0 12px 35px -10px rgba(30, 190, 93, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            },
            closeIcon: <span className="text-gray-400 hover:text-gray-700 transition-colors mt-1.5 text-[15px]">✕</span>,
            duration: 3.5,
        });
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        notification.open({
            message: null,
            description: (
                <div className="flex items-center gap-4 -my-1">
                    <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 text-red-500 shadow-sm">
                        <DeleteOutlined className="text-[18px]" />
                    </div>
                    <div className="flex flex-col flex-1 justify-center">
                        <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-red-500 font-bold mb-1">
                            Retirado
                        </span>
                        <span className="font-serif text-[13px] font-semibold text-gray-900 leading-tight">
                            Producto Eliminado
                        </span>
                        <span className="font-sans text-[11px] text-gray-500 mt-0.5 font-medium">
                            Se ha quitado del carrito
                        </span>
                    </div>
                </div>
            ),
            placement: 'bottomRight',
            icon: null,
            style: { 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(239, 68, 68, 0.15)', 
                borderRadius: '16px',
                padding: '16px',
                width: '340px',
                boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.1)'
            },
            closeIcon: <span className="text-gray-400 hover:text-gray-700 transition-colors mt-2 text-[16px]">✕</span>,
            duration: 3,
        });
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
        </CartContext.Provider>
    );
}
