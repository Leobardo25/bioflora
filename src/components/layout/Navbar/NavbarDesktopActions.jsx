import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function NavbarDesktopActions({
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
        <div className="flex items-center gap-4 ml-6 border-l border-valex-gris/10 pl-6 h-full py-4">
            {isShopPage ? (
                <div className="flex items-center gap-2">
                    <div className="w-56 xl:w-72 bg-bioflora-tarjeta border border-bioflora-verde/20 rounded-lg h-9 flex items-center px-3 focus-within:border-bioflora-verde transition-colors">
                        <Search className="w-3.5 h-3.5 text-valex-gris mr-2 flex-shrink-0" />
                        <input 
                            type="text"
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full bg-transparent text-valex-hueso text-xs focus:outline-none placeholder:text-valex-gris/50"
                            style={{ WebkitAppearance: 'none' }}
                        />
                        {shopSearchQuery && (
                            <button onClick={() => setShopSearchQuery('')} className="text-valex-gris hover:text-valex-hueso ml-1 flex-shrink-0">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onToggleMobileFilters}
                        className={`h-9 px-4 border text-[10px] font-bold uppercase tracking-widest font-serif flex items-center justify-center rounded-lg transition-all duration-300 ${
                            isFilterMenuOpen 
                                ? 'bg-bioflora-verde text-bioflora-bosque border-bioflora-verde' 
                                : 'bg-transparent border-bioflora-verde/20 text-valex-gris hover:text-bioflora-fucsia hover:border-bioflora-fucsia/50'
                        }`}
                    >
                        {isFilterMenuOpen ? <X className="w-3.5 h-3.5 mr-1.5" /> : <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />}
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
                <ShoppingBag className="w-[18px] h-[18px]" />
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
                            className="absolute right-0 top-[40px] w-48 bg-[#121f16] border border-bioflora-verde/20 rounded-xl shadow-2xl py-2 z-50 pointer-events-auto before:content-[''] before:absolute before:-top-6 before:left-0 before:w-full before:h-6"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="px-4 py-3 border-b border-valex-gris/10">
                                <p className="text-valex-hueso text-xs font-serif italic mb-0.5">Bienvenido,</p>
                                <p className="text-bioflora-verde text-sm font-semibold truncate">{userData?.nombre || 'Usuario'}</p>
                            </div>
                            
                            <div className="py-2">
                                {userData?.role === 'admin' && (
                                    <Link to="/admin" className="block px-4 py-2 text-sm text-valex-gris hover:text-valex-hueso hover:bg-white/5 transition-colors">
                                        Panel de Gestión
                                    </Link>
                                )}
                                <button 
                                    onClick={() => logout()}
                                    className="w-full text-left px-4 py-2 text-sm text-valex-gris hover:text-red-400 hover:bg-white/5 transition-colors"
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
