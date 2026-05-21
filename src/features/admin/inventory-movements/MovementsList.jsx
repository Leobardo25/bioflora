import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import { getMovements, MOVEMENT_TYPES } from '../../../services/movementService';
import { getProducts } from '../../../services/productService';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import MovementForm from './MovementForm';
import MovementStats from './MovementStats';
import MovementFilters from './MovementFilters';
import MovementCardMobile from './MovementCardMobile';

const formatDate = (d) => {
    const date = d?.toDate?.() || d;
    if (!date) return '—';
    return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getReasonLabel = (type, reasonValue) => {
    const reasons = MOVEMENT_TYPES[type]?.reasons || [];
    return reasons.find(r => r.value === reasonValue)?.label || reasonValue;
};

export default function MovementsList() {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState(null);
    const [filterProduct, setFilterProduct] = useState(null);
    const { userData } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [movs, prods] = await Promise.all([
                getMovements(),
                getProducts(),
            ]);
            setMovements(movs);
            setProducts(prods);
        } catch {
            toast.error('Error cargando movimientos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaved = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const filteredMovements = useMemo(() => {
        return movements.filter(m => {
            if (filterType && m.type !== filterType) return false;
            if (filterProduct && m.productId !== filterProduct) return false;
            return true;
        });
    }, [movements, filterType, filterProduct]);

    const adminName = userData?.nombre || userData?.email || 'Admin';

    return (
        <div>
            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <ArrowLeftRight className="w-7 h-7 text-bioflora-verde" />
                        Entradas & Salidas
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 mt-1 text-sm">Trazabilidad completa del inventario.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-bioflora-verde text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-bioflora-verde/90 transition-colors self-start sm:self-auto shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Movimiento
                </button>
            </header>

            {/* Stats */}
            {!loading && <MovementStats movements={movements} />}

            {/* Filters */}
            <MovementFilters
                activeType={filterType}
                onTypeChange={setFilterType}
                products={products}
                activeProduct={filterProduct}
                onProductChange={setFilterProduct}
            />

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-bioflora-verde border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredMovements.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl">
                    <ArrowLeftRight className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No hay movimientos registrados.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-bioflora-verde hover:underline text-sm font-medium"
                    >
                        Registrar el primero
                    </button>
                </div>
            ) : (
                <>
                    {/* Mobile */}
                    <div className="block md:hidden space-y-3">
                        {filteredMovements.map(m => (
                            <MovementCardMobile key={m.id} movement={m} />
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-white/5">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Producto</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Razón</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Cant.</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Monto</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Stock</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredMovements.map(m => {
                                    const isEntrada = m.type === 'entrada';
                                    return (
                                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(m.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                                                    {m.productName || '—'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                    isEntrada
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                                }`}>
                                                    {isEntrada 
                                                        ? <ArrowDownCircle className="w-3 h-3" />
                                                        : <ArrowUpCircle className="w-3 h-3" />
                                                    }
                                                    {isEntrada ? 'Entrada' : 'Salida'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {getReasonLabel(m.type, m.reason)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`text-sm font-bold ${
                                                    isEntrada ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {isEntrada ? '+' : '-'}{m.quantity}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {m.amount > 0 ? (
                                                    <span className={`text-sm font-bold ${
                                                        isEntrada ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {m.currency === 'CRC' ? '₡' : '$'}{Number(m.amount).toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {m.previousStock ?? '?'} → <span className="font-semibold text-gray-700 dark:text-gray-300">{m.newStock ?? '?'}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px] italic">
                                                    {m.notes || '—'}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Movement Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <MovementForm
                        products={products}
                        onClose={() => setShowForm(false)}
                        onSaved={handleSaved}
                        adminName={adminName}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
