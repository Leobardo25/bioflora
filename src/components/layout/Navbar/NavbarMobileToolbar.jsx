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
             <div className="flex-1 bg-bioflora-tarjeta border border-bioflora-verde/30 rounded-lg h-11 flex items-center px-4 focus-within:border-bioflora-verde shadow-inner">
                 <Search className="w-4 h-4 text-valex-gris mr-3 flex-shrink-0" />
                 <input 
                     type="text"
                     value={shopSearchQuery}
                     onChange={(e) => setShopSearchQuery(e.target.value)}
                     placeholder="Buscar..."
                     className="w-full bg-transparent text-valex-hueso text-sm focus:outline-none placeholder:text-valex-gris/60"
                     style={{ WebkitAppearance: 'none' }}
                 />
                 {shopSearchQuery && (
                     <button onClick={() => setShopSearchQuery('')} className="text-valex-gris hover:text-valex-hueso ml-1 flex-shrink-0">
                         <X className="w-3.5 h-3.5" />
                     </button>
                 )}
             </div>

             <button
                 onClick={onToggleMobileFilters}
                 className={`h-11 px-6 border text-[11px] sm:text-xs font-bold uppercase tracking-widest font-serif flex items-center justify-center rounded-lg transition-all duration-300 ${isFilterMenuOpen ? 'bg-bioflora-verde text-bioflora-bosque border-bioflora-verde shadow-[0_0_15px_rgba(0,169,79,0.3)]' : 'bg-transparent border-bioflora-verde/40 text-valex-hueso hover:text-bioflora-fucsia hover:border-bioflora-fucsia'}`}
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
                         {isFilterMenuOpen ? <X className="w-4 h-4 mr-2" /> : <SlidersHorizontal className="w-4 h-4 mr-2" />}
                     </motion.div>
                 </AnimatePresence>
                 <span className="hidden sm:inline">FILTROS {hasActiveFilters && !isFilterMenuOpen && '•'}</span>
                 <span className="sm:hidden">FILTROS {hasActiveFilters && !isFilterMenuOpen && '•'}</span>
             </button>

             <button
                 onClick={() => setIsCompactView(!isCompactView)}
                 className="h-11 w-11 flex-shrink-0 border border-bioflora-verde/40 rounded-lg flex items-center justify-center text-valex-hueso hover:text-bioflora-fucsia hover:border-bioflora-fucsia transition-all duration-300"
                 aria-label="Cambiar vista"
             >
                 {isCompactView ? <AlignJustify className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
             </button>
        </div>
    );
}
