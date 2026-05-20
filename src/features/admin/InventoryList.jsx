import { useState, useEffect, useCallback } from 'react';
import { getProducts, deleteProduct, updateProductField } from '../../services/productService';
import { toast } from 'react-toastify';
import { Plus, Search, Star, Edit2, Trash2, Package, LayoutGrid, List } from 'lucide-react';
import { getProductImage, formatPrice } from './inventoryUtils';
import ProductEditSidebar from './ProductEditSidebar';
import ProductCardMobile from './ProductCardMobile';
import InventoryStats from './InventoryStats';
import InventoryFilters from './InventoryFilters';
import StatusDropdown from './StatusDropdown';
import QuantityControl from './QuantityControl';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const GENDERS = ['Todos', 'Unisex', 'Femenino', 'Masculino'];

export default function InventoryList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [sidebarProduct, setSidebarProduct] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('adminInventoryView') || 'grid');

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

        const q = searchTerm.toLowerCase();
        return !q || p.name?.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.family || '').toLowerCase().includes(q);
    });

    return (
        <div>
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Catálogo</h1>
                    <p className="text-gray-500 mt-1 text-sm">Gestiona productos, stock y estados.</p>
                </div>
                <button
                    onClick={() => setSidebarProduct('new')}
                    className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </button>
            </header>

            <InventoryStats products={products} activeFilter={activeFilter} onFilterChange={handleFilterChange} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setActiveFilter(null); }}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1A1A1B] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>
                
                {/* Toggle Vista (Solo Desktop) */}
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-[#151517] p-1 rounded-lg border border-gray-200 dark:border-white/5">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#1e1e20] text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        title="Vista de Lista"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#1e1e20] text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        title="Vista de Cuadrícula"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Píldoras de Categorías (Géneros) */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {GENDERS.map(gender => (
                    <button
                        key={gender}
                        onClick={() => setCategoryFilter(gender)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                            categoryFilter === gender 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                : 'bg-white dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    >
                        {gender}
                    </button>
                ))}
            </div>

            <InventoryFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron productos.</p>
                    {searchTerm || activeFilter
                        ? <button onClick={() => { setSearchTerm(''); setActiveFilter(null); }} className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Limpiar filtros</button>
                        : <button onClick={() => setSidebarProduct('new')} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">Añadir primer producto</button>
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
                                    <tr className="bg-gray-50 dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-white/5">
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Producto</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Género</th>
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
                                                    <button onClick={() => setSidebarProduct(p)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Editar">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteRequest(p.id, p.name)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
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
        </div>
    );
}
