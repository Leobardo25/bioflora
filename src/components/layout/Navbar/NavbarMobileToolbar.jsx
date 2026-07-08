import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, Square, LayoutGrid } from 'lucide-react';

export default function NavbarMobileToolbar({
    shopSearchQuery,
    setShopSearchQuery,
    onToggleMobileFilters,
    isFilterMenuOpen,
    hasActiveFilters,
    isCompactView,
    setIsCompactView
}) {
    return (
        <div className="md:hidden w-full px-4 pb-4 flex justify-center items-center gap-2 transition-all duration-300">
             {/* 1. Botón de Filtros (Redondo, sin texto, con punto indicador) */}
             <button
                 onClick={onToggleMobileFilters}
                 className={`relative h-11 w-11 flex-shrink-0 border flex items-center justify-center rounded-2xl transition-all duration-300 ${
                     isFilterMenuOpen 
                         ? 'bg-[#00A7D0] text-white border-[#00A7D0] shadow-md' 
                         : 'bg-white border-gray-200 text-gray-700 hover:text-[#00A7D0] hover:border-[#00A7D0]'
                 }`}
                 aria-label="Filtros"
             >
                 <AnimatePresence mode="wait">
                     <motion.div
                         key={isFilterMenuOpen ? "close" : "filter"}
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         transition={{ duration: 0.15 }}
                         className="flex items-center justify-center"
                     >
                         {isFilterMenuOpen ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4 text-[#00A7D0]" />}
                     </motion.div>
                 </AnimatePresence>
                 {hasActiveFilters && !isFilterMenuOpen && (
                     <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D60C8C] rounded-full animate-pulse" />
                 )}
             </button>

             {/* 2. Barra de Búsqueda Centrada (Redonda) */}
             <div className="flex-1 bg-white border border-gray-200 rounded-2xl h-11 flex items-center px-4 focus-within:border-[#00A7D0] shadow-sm">
                 <Search className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" />
                 <input 
                     type="text"
                     value={shopSearchQuery}
                     onChange={(e) => setShopSearchQuery(e.target.value)}
                     placeholder="Buscar..."
                     className="w-full bg-transparent text-gray-800 text-sm focus:outline-none placeholder:text-gray-400"
                     style={{ WebkitAppearance: 'none' }}
                 />
                 {shopSearchQuery && (
                     <button onClick={() => setShopSearchQuery('')} className="text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                     </button>
                 )}
             </div>

             {/* 3. Botón de Cambiar Vista (Redondo) */}
             <button
                 onClick={() => setIsCompactView(!isCompactView)}
                 className="h-11 w-11 flex-shrink-0 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-700 hover:text-[#00A7D0] hover:border-[#00A7D0] transition-all duration-300"
                 aria-label="Cambiar vista"
             >
                 {isCompactView ? <Square className="w-4 h-4 text-[#69358C]" /> : <LayoutGrid className="w-4 h-4 text-[#69358C]" />}
             </button>
        </div>
    );
}
