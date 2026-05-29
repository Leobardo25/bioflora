import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function NavbarFilterOverlay({ isFilterMenuOpen, onToggleMobileFilters, mobileFiltersNode }) {
    if (!isFilterMenuOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onToggleMobileFilters}
            />
            
            <motion.div
                className="relative w-[80vw] max-w-[340px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-100 ml-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="h-full flex flex-col pt-10 px-5 pb-6">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0 border-b border-gray-100 pb-4">
                        <h2 className="text-gray-900 font-serif text-2xl tracking-widest mt-2">FILTROS</h2>
                        <button 
                            onClick={onToggleMobileFilters}
                            className="text-gray-500 hover:text-gray-950 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
                        {mobileFiltersNode}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
