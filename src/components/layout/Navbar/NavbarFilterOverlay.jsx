import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function NavbarFilterOverlay({ onToggleMobileFilters, mobileFiltersNode }) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768); // 768px es el breakpoint md de Tailwind
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Variantes de animación: deslizamiento hacia arriba en móvil y desde el lateral derecho en PC
    const sheetVariants = {
        hidden: isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 },
        visible: { x: 0, y: 0 },
    };

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-end md:items-stretch justify-center md:justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Backdrop traslúcido para tapar el fondo */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" 
                onClick={onToggleMobileFilters}
            />
            
            {/* Contenedor principal: Bottom Sheet en Móvil / Sidebar en PC */}
            <motion.div
                className="relative w-full max-w-[480px] md:w-[80vw] md:max-w-[340px] h-auto md:h-full bg-white shadow-2xl flex flex-col rounded-t-[28px] md:rounded-t-none border-t md:border-t-0 md:border-l border-gray-100 max-h-[85vh] md:max-h-none mt-auto md:mt-0 z-10 overflow-hidden"
                variants={sheetVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.35, ease: [0.32, 0.94, 0.6, 1] }}
            >
                {/* Grabber bar minimalista (solo visible en móvil) */}
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 flex-shrink-0 md:hidden" />
                
                <div className="h-full flex flex-col pt-2.5 md:pt-10 px-6 md:px-5 pb-6 min-h-0">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0 border-b border-gray-100 pb-3">
                        <h2 className="text-gray-950 font-serif text-lg md:text-xl tracking-widest font-bold mt-1">FILTROS</h2>
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
