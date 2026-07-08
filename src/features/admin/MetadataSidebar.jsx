import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MetadataManager from './MetadataManager';

export default function MetadataSidebar({ isOpen, onClose }) {
    
    // Evitar scroll en el fondo cuando el sidebar esté abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 font-sans">
                    {/* Overlay de fondo */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Panel lateral deslizable */}
                    <motion.aside
                        className="absolute right-0 inset-y-0 w-full sm:w-[680px] bg-white dark:bg-[#1A1A1B] shadow-2xl flex flex-col border-l border-transparent dark:border-white/5"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    >
                        {/* Contenedor interno scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-admin">
                            <MetadataManager onClose={onClose} />
                        </div>
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
}
