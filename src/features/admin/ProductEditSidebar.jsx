import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';
import ProductForm from './ProductForm';
import { PRODUCT_FORM_TABS } from '../../constants/productFormTabs';

const FORM_ID = 'product-edit-sidebar-form';

export default function ProductEditSidebar({ productId, productName, onClose, onSaved }) {
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('informacion');

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
                                    ? 'bg-bioflora-verde/10 dark:bg-bioflora-verde/20 text-bioflora-verde' 
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

                    {/* Fila de Selector de Pestañas Fijo */}
                    <div className="px-6 pb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl gap-2">
                            {PRODUCT_FORM_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none border border-transparent ${
                                            isActive
                                                ? 'text-bioflora-verde font-black border-bioflora-verde/20'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/40 dark:bg-white/[0.01] hover:bg-white/60 dark:hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabIndicatorSidebar"
                                                className="absolute inset-0 bg-white dark:bg-[#1A1A1B] rounded-xl shadow-md border border-gray-200/20 dark:border-white/10"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            <span className="truncate">{tab.label}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
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
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
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
                            className="flex-1 bg-bioflora-verde hover:bg-bioflora-verde/90 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-bioflora-verde/20 dark:shadow-none"
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
