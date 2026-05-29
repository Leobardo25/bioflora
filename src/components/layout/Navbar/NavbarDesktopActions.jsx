import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function NavbarDesktopActions({
    scrolled,
    isShopPage,
    shopSearchQuery,
    setShopSearchQuery,
    onToggleMobileFilters,
    isFilterMenuOpen,
    hasActiveFilters,
    cartItems,
    setIsCartDrawerOpen,
    currentUser,
    userData,
    isHoveringUser,
    handleMouseEnter,
    handleMouseLeave,
    logout
}) {
    return (
        <div className={`flex items-center gap-4 ml-6 border-l pl-6 h-full py-4 transition-colors duration-300 ${scrolled ? 'border-gray-200' : 'border-valex-gris/10'}`}>
            {isShopPage ? (
                <div className="flex items-center gap-2">
                    <div className={`w-56 xl:w-72 border rounded-lg h-9 flex items-center px-3 transition-colors ${
                        scrolled 
                            ? 'bg-gray-50 border-gray-200 focus-within:border-[#00A7D0]' 
                            : 'bg-bioflora-tarjeta border-bioflora-verde/20 focus-within:border-bioflora-verde'
                    }`}>
                        <Search className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${scrolled ? 'text-gray-400' : 'text-valex-gris'}`} />
                        <input 
                            type="text"
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                            className={`w-full bg-transparent text-xs focus:outline-none transition-colors duration-300 ${
                                scrolled ? 'text-gray-800 placeholder:text-gray-400' : 'text-valex-hueso placeholder:text-valex-gris/50'
                            }`}
                            style={{ WebkitAppearance: 'none' }}
                        />
                        {shopSearchQuery && (
                            <button onClick={() => setShopSearchQuery('')} className={`ml-1 flex-shrink-0 transition-colors ${scrolled ? 'text-gray-400 hover:text-gray-800' : 'text-valex-gris hover:text-valex-hueso'}`}>
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onToggleMobileFilters}
                        className={`h-9 px-4 border text-[10px] font-bold uppercase tracking-widest font-sans flex items-center justify-center rounded-lg transition-all duration-300 ${
                            isFilterMenuOpen 
                                ? 'bg-[#00A7D0] text-white border-[#00A7D0]' 
                                : scrolled
                                    ? 'bg-transparent border-gray-200 text-gray-700 hover:text-[#00A7D0] hover:border-[#00A7D0]'
                                    : 'bg-transparent border-bioflora-verde/20 text-valex-gris hover:text-[#00A7D0] hover:border-[#00A7D0]'
                        }`}
                    >
                        {isFilterMenuOpen ? <X className="w-3.5 h-3.5 mr-1.5" /> : <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-[#00A7D0]" />}
                        Filtros{hasActiveFilters && !isFilterMenuOpen && ' •'}
                    </button>
                </div>
            ) : (
                <Link
                    to="/tienda"
                    className="bg-bioflora-morado text-white font-sans font-semibold text-sm px-7 py-2.5 rounded-lg shadow-lg hover:shadow-bioflora-morado/30 hover:bg-bioflora-morado/80 transition-all duration-300"
                >
                    Ir a la Tienda
                </Link>
            )}

            <button 
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative text-bioflora-naranja hover:text-bioflora-naranja transition-colors p-2 rounded-full hover:bg-bioflora-naranja/10 flex items-center justify-center cursor-pointer"
                aria-label="Carrito"
            >
                <ShoppingCart className="w-[18px] h-[18px]" />
                <AnimatePresence>
                    {cartItems.length > 0 && (
                        <motion.span 
                            key={cartItems.length}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="absolute -top-0.5 -right-0.5 bg-bioflora-fucsia text-bioflora-arena text-[9px] w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold shadow-[0_0_8px_rgba(214,12,140,0.4)]"
                        >
                            {cartItems.length}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <div 
                className="relative flex items-center h-full"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Link
                    to={currentUser ? (userData?.role === 'admin' ? '/admin' : '/') : '/login'}
                    className="text-bioflora-naranja hover:text-bioflora-naranja transition-colors p-2 rounded-full hover:bg-bioflora-naranja/10 flex items-center justify-center cursor-pointer"
                    aria-label="Perfil"
                >
                    <FaUser className="w-[18px] h-[18px]" />
                </Link>

                <AnimatePresence>
                    {isHoveringUser && currentUser && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute right-0 top-[40px] w-48 border rounded-xl shadow-2xl py-2 z-50 pointer-events-auto before:content-[''] before:absolute before:-top-6 before:left-0 before:w-full before:h-6 ${
                                scrolled ? 'bg-white border-gray-100 text-gray-900' : 'bg-[#121f16] border-bioflora-verde/20 text-valex-hueso'
                            }`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className={`px-4 py-3 border-b ${scrolled ? 'border-gray-100' : 'border-valex-gris/10'}`}>
                                <p className={`text-xs font-serif italic mb-0.5 ${scrolled ? 'text-gray-400' : 'text-valex-hueso'}`}>Bienvenido,</p>
                                <p className={`text-sm font-semibold truncate ${scrolled ? 'text-[#69358C]' : 'text-bioflora-verde'}`}>{userData?.nombre || 'Usuario'}</p>
                            </div>
                            
                            <div className="py-2">
                                {userData?.role === 'admin' && (
                                    <Link to="/admin" className={`block px-4 py-2 text-sm transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-950 hover:bg-gray-50' : 'text-valex-gris hover:text-valex-hueso hover:bg-white/5'}`}>
                                        Panel de Gestión
                                    </Link>
                                )}
                                <button 
                                    onClick={() => logout()}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${scrolled ? 'text-gray-600 hover:text-red-500 hover:bg-gray-50' : 'text-valex-gris hover:text-red-400 hover:bg-white/5'}`}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
