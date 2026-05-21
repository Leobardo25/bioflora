import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Package, ArrowDownCircle, ArrowUpCircle, Search, StickyNote, AlertTriangle, DollarSign } from 'lucide-react';
import { createMovement, MOVEMENT_TYPES } from '../../../services/movementService';
import { toast } from 'react-toastify';

export default function MovementForm({ products, onClose, onSaved, adminName }) {
    const [type, setType] = useState('entrada');
    const [productId, setProductId] = useState('');
    const [reason, setReason] = useState('');
    const [quantity, setQuantity] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedProduct = products.find(p => p.id === productId);
    const reasons = MOVEMENT_TYPES[type]?.reasons || [];

    // Auto-fill amount when product is selected
    const handleProductSelect = (id) => {
        setProductId(id);
        setSearchTerm('');
        const p = products.find(prod => prod.id === id);
        if (p?.price) {
            setAmount(String(Number(p.price) * (Number(quantity) || 1)));
        }
    };

    // Auto-recalculate amount when quantity changes
    const handleQuantityChange = (val) => {
        setQuantity(val);
        if (selectedProduct?.price && Number(val) > 0) {
            setAmount(String(Number(selectedProduct.price) * Number(val)));
        }
    };

    // Reset reason when type changes
    const handleTypeChange = (newType) => {
        setType(newType);
        setReason('');
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products.slice(0, 20);
        const q = searchTerm.toLowerCase();
        return products.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 20);
    }, [products, searchTerm]);

    const handleSubmit = async () => {
        if (!productId || !reason || !quantity || Number(quantity) <= 0) {
            toast.error('Completa todos los campos obligatorios.');
            return;
        }

        if (type === 'salida' && selectedProduct) {
            const currentQty = selectedProduct.quantity ?? 0;
            if (Number(quantity) > currentQty) {
                toast.warning(`Solo hay ${currentQty} unidad(es) en stock. Se ajustará a 0.`);
            }
        }

        setSaving(true);
        try {
            await createMovement({
                productId,
                productName: selectedProduct?.name || '',
                type,
                reason,
                quantity: Number(quantity),
                amount: Number(amount) || 0,
                currency: selectedProduct?.currency || '',
                notes,
                createdBy: adminName || 'Admin',
            });
            toast.success(`${type === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente.`);
            onSaved?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar el movimiento.');
        } finally {
            setSaving(false);
        }
    };

    const isEntrada = type === 'entrada';

    const formatCurrency = (val) => {
        if (!selectedProduct) return '';
        return selectedProduct.currency === 'CRC' ? '₡' : '$';
    };

    return (
        <div className="fixed inset-0 z-50 flex font-sans">
            {/* Backdrop */}
            <motion.div 
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Side Drawer — slides from right */}
            <motion.div
                className="relative ml-auto w-[90vw] max-w-md h-full bg-white dark:bg-[#1e1e20] border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isEntrada 
                                ? 'bg-emerald-50 dark:bg-emerald-500/15' 
                                : 'bg-red-50 dark:bg-red-500/15'
                        }`}>
                            {isEntrada 
                                ? <ArrowDownCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                : <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            }
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Registrar Movimiento</h2>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">Stock se actualiza automáticamente.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-admin">

                    {/* Toggle Entrada / Salida */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tipo de Movimiento</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleTypeChange('entrada')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all border ${
                                    isEntrada
                                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                        : 'bg-gray-50 dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/20'
                                }`}
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                Entrada
                            </button>
                            <button
                                onClick={() => handleTypeChange('salida')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all border ${
                                    !isEntrada
                                        ? 'bg-red-50 dark:bg-red-500/15 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400 shadow-sm'
                                        : 'bg-gray-50 dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/20'
                                }`}
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Salida
                            </button>
                        </div>
                    </div>

                    {/* Producto */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Producto *</label>
                        
                        <div className="relative mb-2">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1A1A1B] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 transition"
                            />
                        </div>

                        <div className="max-h-28 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1A1B] divide-y divide-gray-100 dark:divide-white/5 scrollbar-admin">
                            {filteredProducts.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No se encontraron productos.</p>
                            ) : (
                                filteredProducts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleProductSelect(p.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                                            productId === p.id
                                                ? 'bg-bioflora-verde/10 dark:bg-bioflora-verde/20 border-l-2 border-l-bioflora-verde'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/5 border-l-2 border-l-transparent'
                                        }`}
                                    >
                                        <div className="w-7 h-7 rounded-md bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {(p.coverImage || p.imageUrl) 
                                                ? <img src={p.coverImage || p.imageUrl} alt="" className="w-full h-full object-contain" />
                                                : <Package className="w-3 h-3 text-gray-300" />
                                            }
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                                            <p className="text-[9px] text-gray-400 dark:text-gray-500">Stock: {p.quantity ?? 0} · {p.currency === 'CRC' ? '₡' : '$'}{Number(p.price || 0).toLocaleString()}</p>
                                        </div>
                                        {productId === p.id && (
                                            <div className="w-5 h-5 rounded-full bg-bioflora-verde flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {selectedProduct && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-bioflora-verde/10 dark:bg-bioflora-verde/5 border border-bioflora-verde/20 dark:border-bioflora-verde/20">
                                <Package className="w-4 h-4 text-bioflora-verde flex-shrink-0" />
                                <span className="text-sm font-medium text-bioflora-verde truncate">{selectedProduct.name}</span>
                                <span className="text-xs text-bioflora-verde flex-shrink-0 ml-auto">Stock: {selectedProduct.quantity ?? 0}</span>
                            </div>
                        )}
                    </div>

                    {/* Razón */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Razón *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {reasons.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setReason(r.value)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                                        reason === r.value
                                            ? isEntrada
                                                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-red-50 dark:bg-red-500/15 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400'
                                            : 'bg-gray-50 dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cantidad + Monto — side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Cantidad *</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => handleQuantityChange(e.target.value)}
                                placeholder="Ej: 5"
                                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1A1A1B] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Monto {formatCurrency()}
                                </span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Auto"
                                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1A1A1B] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 transition"
                            />
                        </div>
                    </div>

                    {/* Warning if exit exceeds stock */}
                    {type === 'salida' && selectedProduct && Number(quantity) > (selectedProduct.quantity ?? 0) && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs">Excede el stock actual ({selectedProduct.quantity ?? 0}). Se ajustará a 0.</span>
                        </div>
                    )}

                    {/* Notas */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            <span className="flex items-center gap-1.5">
                                <StickyNote className="w-3 h-3" />
                                Notas (opcional)
                            </span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            placeholder="Ej: Compra a proveedor X, factura #123..."
                            rows={1}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1A1A1B] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 transition resize-none overflow-hidden"
                        />
                    </div>
                </div>

                {/* Footer — sticky at bottom */}
                <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !productId || !reason || !quantity}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                            isEntrada
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                        }`}
                    >
                        {saving ? 'Registrando...' : `Registrar ${isEntrada ? 'Entrada' : 'Salida'}`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
