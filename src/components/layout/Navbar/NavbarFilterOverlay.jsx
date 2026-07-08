import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function NavbarFilterOverlay({ onToggleMobileFilters, mobileFiltersNode }) {
    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" 
                onClick={onToggleMobileFilters}
            />
            
            <motion.div
                className="relative w-full max-w-[480px] bg-white shadow-2xl flex flex-col rounded-t-[28px] border-t border-gray-100 max-h-[85vh] mt-auto z-10 overflow-hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.35, ease: [0.32, 0.94, 0.6, 1] }}
            >
                {/* Grabber bar for premium bottom-sheet look */}
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 flex-shrink-0" />
                
                <div className="h-full flex flex-col pt-2.5 px-6 pb-6 min-h-0">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0 border-b border-gray-100 pb-3">
                        <h2 className="text-gray-950 font-serif text-lg tracking-widest font-bold mt-1">FILTROS</h2>
                        <button 
                            onClick={onToggleMobileFilters}
                            className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col animate-fadeIn">
                        {mobileFiltersNode}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
