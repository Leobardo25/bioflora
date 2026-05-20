import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';
import ProductForm from './ProductForm';

const FORM_ID = 'product-edit-sidebar-form';

export default function ProductEditSidebar({ productId, productName, onClose, onSaved }) {
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleClose = () => {
        if (isDirty) {
            setShowUnsavedDialog(true);
        } else {
            onClose();
        }
    };

    const displayName = productId ? (productName || 'Producto') : 'Nuevo Producto';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 font-sans">
                {/* Overlay */}
                <motion.div
                    className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleClose}
                />

                {/* Panel */}
                <motion.aside
                    className="absolute right-0 inset-y-0 w-full sm:w-[520px] bg-white dark:bg-[#1A1A1B] shadow-2xl flex flex-col border-l border-transparent dark:border-white/5"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#1A1A1B]/50 backdrop-blur-sm flex-shrink-0">
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md w-max ${
                                productId 
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}>
                                {productId ? 'Modo Edición' : 'Nuevo Registro'}
                            </span>
                            <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100 truncate pr-4" title={displayName}>
                                {displayName}
                            </h2>
                        </div>
                        <button onClick={handleClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-y-auto scrollbar-admin p-6 bg-white dark:bg-[#1A1A1B]">
                        <ProductForm
                            productId={productId}
                            onClose={onClose}
                            onSaved={onSaved}
                            onDirtyChange={setIsDirty}
                            onLoadingChange={setIsSubmitting}
                            formId={FORM_ID}
                        />
                    </div>

                    {/* Footer con Botones Duales */}
                    <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#111113]/80 backdrop-blur-sm flex-shrink-0 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A1A1B] hover:bg-gray-50 dark:hover:bg-[#252528] border border-gray-200 dark:border-white/10 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form={FORM_ID}
                            disabled={isSubmitting}
                            className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/10 dark:shadow-none"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4.5 h-4.5" />
                            )}
                            {productId ? 'Guardar' : 'Crear'}
                        </button>
                    </div>
                </motion.aside>

                {/* Dialog — cambios sin guardar */}
                {showUnsavedDialog && (
                    <UnsavedChangesDialog
                        onKeep={() => setShowUnsavedDialog(false)}
                        onDiscard={onClose}
                    />
                )}
            </div>
        </AnimatePresence>
    );
}

function UnsavedChangesDialog({ onKeep, onDiscard }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <motion.div
                className="bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-white/10"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
            >
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Cambios sin guardar</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            Si cierras ahora perderás los cambios que realizaste en este producto.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onKeep}
                        className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Seguir editando
                    </button>
                    <button
                        onClick={onDiscard}
                        className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                    >
                        Descartar
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
