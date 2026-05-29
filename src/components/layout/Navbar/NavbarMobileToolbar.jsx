import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, AlignJustify, LayoutGrid } from 'lucide-react';

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
             <div className="flex-1 bg-white border border-gray-200 rounded-lg h-11 flex items-center px-4 focus-within:border-[#00A7D0] shadow-sm">
                 <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
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

             <button
                 onClick={onToggleMobileFilters}
                 className={`h-11 px-5 border text-[11px] sm:text-xs font-bold uppercase tracking-widest font-sans flex items-center justify-center rounded-lg transition-all duration-300 ${isFilterMenuOpen ? 'bg-[#00A7D0] text-white border-[#00A7D0] shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:text-[#00A7D0] hover:border-[#00A7D0]'}`}
             >
                 <AnimatePresence mode="wait">
                     <motion.div
                         key={isFilterMenuOpen ? "close" : "filter"}
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         transition={{ duration: 0.15 }}
                         style={{ display: 'flex', alignItems: 'center' }}
                     >
                         {isFilterMenuOpen ? <X className="w-4 h-4 mr-2" /> : <SlidersHorizontal className="w-4 h-4 mr-2 text-[#00A7D0]" />}
                     </motion.div>
                 </AnimatePresence>
                 <span>FILTROS {hasActiveFilters && !isFilterMenuOpen && '•'}</span>
             </button>

             <button
                 onClick={() => setIsCompactView(!isCompactView)}
                 className="h-11 w-11 flex-shrink-0 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:text-[#00A7D0] hover:border-[#00A7D0] transition-all duration-300"
                 aria-label="Cambiar vista"
             >
                 {isCompactView ? <AlignJustify className="w-4 h-4 text-[#69358C]" /> : <LayoutGrid className="w-4 h-4 text-[#69358C]" />}
             </button>
        </div>
    );
}
