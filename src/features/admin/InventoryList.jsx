import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeaderActions from '../../components/admin/HeaderActions';
import MetadataManager from './MetadataManager';
import ClassifierSidebar from './ClassifierSidebar';
import { getProducts, deleteProduct, updateProductField } from '../../services/productService';
import { toast } from 'react-toastify';
import { Plus, Search, Star, Edit2, Trash2, Package, LayoutGrid, List, Sliders, FolderOpen, ChevronDown } from 'lucide-react';
import { db } from '../../firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { getProductImage, formatPrice } from './inventoryUtils';
import ProductEditSidebar from './ProductEditSidebar';
import ProductCardMobile from './ProductCardMobile';
import InventoryStats from './InventoryStats';
import InventoryFilters from './InventoryFilters';
import StatusDropdown from './StatusDropdown';
import QuantityControl from './QuantityControl';
import DeleteConfirmDialog from './DeleteConfirmDialog';


export default function InventoryList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [familyFilter, setFamilyFilter] = useState('Todas');
    const [dbFamilies, setDbFamilies] = useState(['Todas']);
    const [sidebarProduct, setSidebarProduct] = useState(null);
    const [isMetadataOpen, setIsMetadataOpen] = useState(false);
    const [classifierProduct, setClassifierProduct] = useState(null);
    const [showBotanicFilters, setShowBotanicFilters] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('adminInventoryView') || 'grid');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'families'), (snapshot) => {
            const list = snapshot.docs
                .map(doc => doc.data().name)
                .filter(Boolean)
                .filter(name => name.trim().toLowerCase() !== 'todas');
            list.sort();
            setDbFamilies(['Todas', ...list]);
        }, (err) => {
            console.error("Error al cargar familias en inventario admin:", err);
        });
        return () => unsubscribe();
    }, []);

    const [dbCategories, setDbCategories] = useState(['Todos', 'Orquídeas', 'Exóticas', 'Flores Tropicales', 'Accesorios']);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
            if (!snapshot.empty) {
                const list = snapshot.docs
                    .map(doc => doc.data().name)
                    .filter(Boolean)
                    .filter(name => name.trim().toLowerCase() !== 'todos');
                list.sort();
                setDbCategories(['Todos', ...list]);
            }
        }, (err) => {
            console.error("Error al cargar categorías dinámicas en inventario admin:", err);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        localStorage.setItem('adminInventoryView', viewMode);
    }, [viewMode]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch {
            toast.error("Error cargando inventario");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const handleDeleteRequest = (id, name) => setDeleteTarget({ id, name });

    const handleDeleteConfirm = async () => {
        const { id, name } = deleteTarget;
        setDeleteTarget(null);
        try {
            await deleteProduct(id);
            toast.success(`"${name}" eliminado.`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch {
            toast.error('Error al eliminar el producto');
        }
    };

    const handleSaved = useCallback(async () => {
        setSidebarProduct(null);
        await fetchInventory();
    }, [fetchInventory]);

    const updateLocal = (id, field, value) =>
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

    const handleFilterChange = (value) => {
        setActiveFilter(value);
        setSearchTerm('');
    };

    const filteredProducts = products.filter(p => {
        const pStock = p.stock || 'Disponible';
        if (activeFilter === '__featured__') return p.isFeatured;
        if (activeFilter !== null && pStock !== activeFilter) return false;
        
        if (categoryFilter !== 'Todos') {
            const cat = (p.category || '').toLowerCase();
            const catMatch = categoryFilter.toLowerCase();
            if (cat !== catMatch) return false;
        }

        if (familyFilter !== 'Todas') {
            const fam = (p.family || '').toLowerCase();
            const famMatch = familyFilter.toLowerCase();
            if (fam !== famMatch) return false;
        }

        const q = searchTerm.toLowerCase();
        return !q || p.name?.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.family || '').toLowerCase().includes(q);
    });

    return (
        <div>
            {/* Buscador y Controles */}
            <div className="grid grid-cols-2 md:flex md:flex-row md:items-center gap-3 mb-5 bg-white dark:bg-[#1E1E20]/40 border border-gray-150 dark:border-white/5 p-3 md:p-4 rounded-2xl shadow-sm">
                {/* Buscador: Fila superior completa en móvil (col-span-2), y flexible en el centro en PC (md:flex-1) */}
                <div className="col-span-2 md:flex-1 md:max-w-lg md:mx-auto w-full relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar especie botánica..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setActiveFilter(null); }}
                        className="w-full pl-11 pr-5 py-2 border border-gray-300 dark:border-white/10 rounded-full text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-[#18181A] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bioflora-verde/40 focus:border-bioflora-verde transition-all shadow-sm font-sans"
                    />
                </div>

                {/* Controles de Vista y Metadatos: Columna izquierda en móvil, y orden izquierda en PC (md:order-first) */}
                <div className="col-span-1 md:order-first flex items-center gap-2">
                    <button
                        onClick={() => setIsMetadataOpen(true)}
                        className="flex items-center gap-1.5 bg-white dark:bg-[#1C1C1E] border border-gray-250 dark:border-white/10 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm cursor-pointer w-full sm:w-auto justify-center"
                        title="Gestionar Categorías y Familias"
                    >
                        <Sliders className="w-3.5 h-3.5 text-gray-500" />
                        <span>Metadatos</span>
                    </button>

                    <div className="hidden md:flex items-center bg-gray-100 dark:bg-[#151517] p-1 rounded-xl border border-gray-200 dark:border-white/5">
                        <button
                            onClick={() => { setViewMode('table'); localStorage.setItem('adminInventoryView', 'table'); }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-[#1e1e20] text-gray-800 dark:text-gray-100 shadow-sm animate-in fade-in duration-200' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title="Vista de Lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setViewMode('grid'); localStorage.setItem('adminInventoryView', 'grid'); }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-[#1e1e20] text-gray-800 dark:text-gray-100 shadow-sm animate-in fade-in duration-200' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title="Vista de Cuadrícula"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Botón Nueva Planta: Columna derecha en móvil (col-span-1), y derecha en PC */}
                <div className="col-span-1 flex justify-end md:w-auto">
                    <button
                        onClick={() => setSidebarProduct('new')}
                        className="flex items-center gap-1.5 bg-bioflora-verde text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-bioflora-verde/90 transition-colors shadow-md shadow-bioflora-verde/15 cursor-pointer w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nueva Planta</span>
                    </button>
                </div>
            </div>

            {/* Filtros de Existencias Centrados */}
            <div className="flex justify-center mb-5">
                <InventoryFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
            </div>

            {/* Botón para expandir/retraer filtros botánicos */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setShowBotanicFilters(!showBotanicFilters)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-bioflora-verde dark:hover:text-bioflora-verde transition-colors bg-transparent border-none cursor-pointer tracking-wider uppercase text-[10px]"
                >
                    <span>Filtros botánicos (Categorías y Familias)</span>
                    <motion.span
                        animate={{ rotate: showBotanicFilters ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                </button>
            </div>

            {/* Panel Retractable */}
            <AnimatePresence>
                {showBotanicFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden mb-6 bg-gray-50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Categorías */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Filtrar por Categoría:</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        onClick={() => setCategoryFilter('Todos')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                                            categoryFilter === 'Todos'
                                                ? 'bg-bioflora-verde border-bioflora-verde text-white shadow-sm font-bold'
                                                : 'bg-white dark:bg-white/5 border-gray-205 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-bioflora-verde/50 hover:text-bioflora-verde'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    {dbCategories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setCategoryFilter(category)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                                                categoryFilter === category
                                                    ? 'bg-bioflora-verde border-bioflora-verde text-white shadow-sm font-bold'
                                                    : 'bg-white dark:bg-white/5 border-gray-205 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-bioflora-verde/50 hover:text-bioflora-verde'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Familias */}
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Filtrar por Familia:</span>
                                <select
                                    value={familyFilter}
                                    onChange={e => setFamilyFilter(e.target.value)}
                                    className="bg-white dark:bg-[#18181A] border border-gray-205 dark:border-white/10 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-bioflora-verde cursor-pointer"
                                >
                                    {dbFamilies.map(fam => (
                                        <option key={fam} value={fam}>{fam}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-bioflora-verde border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1E1E20]/40 border border-gray-200 dark:border-white/5 rounded-xl animate-in fade-in duration-300">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium font-sans">No se encontraron especies botánicas.</p>
                    {searchTerm || activeFilter
                        ? <button onClick={() => { setSearchTerm(''); setActiveFilter(null); }} className="mt-3 text-bioflora-verde hover:underline text-sm bg-transparent border-none cursor-pointer">Limpiar filtros</button>
                        : <button onClick={() => setSidebarProduct('new')} className="mt-4 text-bioflora-verde hover:underline text-sm font-medium bg-transparent border-none cursor-pointer">Añadir primera planta</button>
                    }
                </div>
            ) : (
                <>
                    {/* Mobile Grid */}
                    <div className="grid grid-cols-2 gap-3 pb-6 md:hidden">
                        {filteredProducts.map(p => (
                            <ProductCardMobile
                                key={p.id}
                                product={p}
                                onEdit={() => setSidebarProduct(p)}
                                onDelete={() => handleDeleteRequest(p.id, p.name)}
                                onStatusUpdated={val => updateLocal(p.id, 'stock', val)}
                                onQuantityUpdated={val => updateLocal(p.id, 'quantity', val)}
                                onPriceUpdated={val => updateLocal(p.id, 'price', val)}
                                onFeaturedUpdated={val => updateLocal(p.id, 'isFeatured', val)}
                            />
                        ))}
                    </div>

                    {/* Desktop table */}
                    {viewMode === 'table' && (
                        <div className="hidden md:block bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#0D1C13] border-b border-gray-200 dark:border-white/5">
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Planta / Insumo</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Categoría</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Precio</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Unidades</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center" title="Destacado">
                                            <Star className="w-4 h-4 inline" />
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                                                        {getProductImage(p)
                                                            ? <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-contain" />
                                                            : <Package className="w-4 h-4 text-gray-400" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 max-w-[180px]">{p.description || p.notes}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-transparent dark:border-white/10">{p.category || '—'}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatPrice(p.price, p.currency)}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <QuantityControl
                                                    productId={p.id}
                                                    quantity={p.quantity ?? 0}
                                                    onUpdated={val => updateLocal(p.id, 'quantity', val)}
                                                />
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusDropdown
                                                    productId={p.id}
                                                    currentStatus={p.stock || 'Disponible'}
                                                    onUpdated={val => updateLocal(p.id, 'stock', val)}
                                                />
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <button 
                                                    type="button"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const nextFeatured = !p.isFeatured;
                                                        try {
                                                            await updateProductField(p.id, 'isFeatured', nextFeatured);
                                                            updateLocal(p.id, 'isFeatured', nextFeatured);
                                                            toast.success(nextFeatured ? 'Producto destacado en portada' : 'Producto quitado de destacados');
                                                        } catch (err) {
                                                            toast.error('Error al actualizar destacado');
                                                            console.error(err);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10 text-gray-300 dark:text-gray-600 hover:text-amber-500 transition-colors cursor-pointer"
                                                    title={p.isFeatured ? "Quitar de destacados" : "Destacar en portada"}
                                                >
                                                    <Star className={`w-4 h-4 mx-auto transition-transform active:scale-95 ${
                                                        p.isFeatured
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-gray-200 dark:text-gray-600 hover:text-amber-400'
                                                    }`} />
                                                </button>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setClassifierProduct(p)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-bioflora-verde hover:bg-bioflora-verde/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer" title="Clasificar Metadatos">
                                                        <FolderOpen className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setSidebarProduct(p)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-bioflora-verde hover:bg-bioflora-verde/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer" title="Editar">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteRequest(p.id, p.name)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Desktop grid */}
                    {viewMode === 'grid' && (
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(p => (
                                <ProductCardMobile
                                    key={p.id}
                                    product={p}
                                    onEdit={() => setSidebarProduct(p)}
                                    onDelete={() => handleDeleteRequest(p.id, p.name)}
                                    onStatusUpdated={val => updateLocal(p.id, 'stock', val)}
                                    onQuantityUpdated={val => updateLocal(p.id, 'quantity', val)}
                                    onPriceUpdated={val => updateLocal(p.id, 'price', val)}
                                    onFeaturedUpdated={val => updateLocal(p.id, 'isFeatured', val)}
                                    onClassifier={() => setClassifierProduct(p)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {deleteTarget && (
                <DeleteConfirmDialog
                    productName={deleteTarget.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {sidebarProduct !== null && (
                <ProductEditSidebar
                    productId={sidebarProduct === 'new' ? null : sidebarProduct.id}
                    productName={sidebarProduct === 'new' ? null : sidebarProduct.name}
                    onClose={() => setSidebarProduct(null)}
                    onSaved={handleSaved}
                />
            )}
            {/* Drawer Lateral del Gestor de Metadatos */}
            <AnimatePresence>
                {isMetadataOpen && (
                    <div className="fixed inset-0 z-[150] flex justify-end">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMetadataOpen(false)}
                        />
                        
                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl h-full bg-gray-50 dark:bg-[#111113] border-l border-gray-200 dark:border-white/10 shadow-2xl z-10 flex flex-col overflow-hidden p-5 sm:p-6"
                        >
                            <div className="flex-1 overflow-y-auto pr-1">
                                <MetadataManager onClose={() => setIsMetadataOpen(false)} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {classifierProduct !== null && (
                <ClassifierSidebar
                    product={classifierProduct}
                    onClose={() => setClassifierProduct(null)}
                    onUpdateField={async (productId, field, value) => {
                        try {
                            await updateProductField(productId, field, value);
                            updateLocal(productId, field, value);
                        } catch (err) {
                            console.error("Error al reclasificar:", err);
                            toast.error("Error al actualizar la clasificación.");
                        }
                    }}
                />
            )}
        </div>
    );
}
