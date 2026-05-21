import { useState } from 'react';
import { Star, Edit2, Trash2, Package, Check, X, Edit3 } from 'lucide-react';
import { getProductImage, formatPrice } from './inventoryUtils';
import { updateProductField } from '../../services/productService';
import { toast } from 'react-toastify';
import StatusDropdown from './StatusDropdown';
import QuantityControl from './QuantityControl';

export default function ProductCardMobile({ product: p, onEdit, onDelete, onStatusUpdated, onQuantityUpdated, onPriceUpdated, onFeaturedUpdated }) {
    const isFeatured = p.isFeatured;
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [tempPrice, setTempPrice] = useState(p.price || '');
    const [savingPrice, setSavingPrice] = useState(false);

    const handleSavePrice = async () => {
        const val = Number(tempPrice);
        if (isNaN(val) || val < 0) {
            toast.error('Precio inválido');
            return;
        }
        setSavingPrice(true);
        try {
            await updateProductField(p.id, 'price', val);
            if (onPriceUpdated) onPriceUpdated(val);
            toast.success('Precio actualizado');
            setIsEditingPrice(false);
        } catch (err) {
            toast.error('Error al guardar precio');
            console.error(err);
        } finally {
            setSavingPrice(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e1e20] border border-gray-150 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md hover:border-bioflora-verde/30 dark:hover:border-bioflora-verde/20 p-3 md:p-0 gap-3 md:gap-0 h-full justify-between">
            {/* Imagen Principal (Aspecto Cuadrado y Completa en Móvil, Cover en PC) */}
            <div className="relative aspect-square md:aspect-auto md:h-48 overflow-hidden rounded-xl md:rounded-none bg-black/5 dark:bg-black/40 md:bg-gray-50 md:dark:bg-[#131315] border border-gray-100 dark:border-white/5 md:border-b md:border-gray-100 md:dark:border-white/5 flex items-center justify-center p-0 flex-shrink-0">
                {getProductImage(p) ? (
                    <img 
                        src={getProductImage(p)} 
                        alt={p.name} 
                        className="w-full h-full object-contain md:object-cover group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#151517] rounded-xl md:rounded-none">
                        <Package className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                )}

                {/* Acciones Flotantes de Admin (Arriba a la derecha) */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 dark:bg-black/70 backdrop-blur-md p-1 rounded-lg shadow-md border border-gray-250/20 dark:border-white/10 z-10">
                    <button 
                        onClick={onEdit} 
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-bioflora-verde hover:bg-bioflora-verde/10 rounded-md transition-colors" 
                        title="Editar"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors" 
                        title="Eliminar"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Botón de Destacado Toggle (Arriba a la izquierda) */}
                <button 
                    type="button"
                    onClick={async (e) => {
                        e.stopPropagation();
                        const nextFeatured = !isFeatured;
                        try {
                            await updateProductField(p.id, 'isFeatured', nextFeatured);
                            if (onFeaturedUpdated) onFeaturedUpdated(nextFeatured);
                            toast.success(nextFeatured ? 'Producto destacado en portada' : 'Producto quitado de destacados');
                        } catch (err) {
                            toast.error('Error al actualizar destacado');
                            console.error(err);
                        }
                    }}
                    className={`absolute top-2 left-2 p-1 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer z-10 hover:scale-110 active:scale-95 ${
                        isFeatured 
                            ? 'bg-amber-400 text-white shadow-amber-400/30' 
                            : 'bg-white/95 dark:bg-black/70 text-gray-400 dark:text-gray-500 hover:text-amber-500 border border-gray-250/20 dark:border-white/10'
                    }`}
                    title={isFeatured ? "Quitar de destacados" : "Destacar en portada"}
                >
                    <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-white text-white' : ''}`} />
                </button>

                {/* Marca flotante sobre la imagen (Estilo Boutique de la tienda, solo en móvil) */}
                {p.brand && (
                    <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-amber-500 dark:text-bioflora-verde text-[8px] font-sans font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider uppercase border border-white/10 md:hidden">
                        {p.brand.split(' ')[0]}
                    </span>
                )}
            </div>

            {/* Información del Producto */}
            <div className="flex flex-col flex-1 px-1 md:p-4 gap-1 md:gap-0 justify-between h-full">
                <div>
                    <div className="mb-0.5 md:mb-1">
                        <span className="text-[8px] md:text-[10px] font-sans md:font-bold tracking-[0.2em] md:tracking-wider text-bioflora-verde md:text-gray-400 md:dark:text-gray-500 uppercase font-bold">
                            {p.category || p.family || 'Sin Categoría'}
                        </span>
                    </div>
                    
                    {/* Título completo responsivo */}
                    <h3 className="font-sans font-semibold md:font-bold text-gray-800 dark:text-gray-100 text-xs sm:text-sm md:text-sm leading-snug tracking-wide md:tracking-normal mb-1 md:mb-2 line-clamp-2 h-[32px] md:h-auto">
                        {p.name}
                    </h3>
                </div>

                <div>
                    {/* Precio destacado editable */}
                    <div className="mt-auto mb-2 md:mb-4 flex flex-col justify-end pt-2 md:pt-0 border-t border-gray-100 dark:border-white/5 md:border-t-0">
                        <div className="flex items-center gap-2">
                            {isEditingPrice ? (
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#151517] p-1 rounded-lg border border-bioflora-verde/35 w-full">
                                    <span className="text-gray-500 dark:text-gray-400 font-bold pl-1 text-[11px]">₡</span>
                                    <input 
                                        type="number" 
                                        value={tempPrice} 
                                        onChange={e => setTempPrice(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleSavePrice();
                                            if (e.key === 'Escape') setIsEditingPrice(false);
                                        }}
                                        className="w-16 bg-transparent text-gray-800 dark:text-gray-200 font-bold text-xs focus:outline-none"
                                        autoFocus
                                        disabled={savingPrice}
                                    />
                                    <button 
                                        onClick={handleSavePrice} 
                                        disabled={savingPrice}
                                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingPrice(false)} 
                                        disabled={savingPrice}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="group/price flex items-center gap-1.5 cursor-pointer" onClick={() => { setTempPrice(p.price); setIsEditingPrice(true); }}>
                                    <span className="font-sans font-bold text-bioflora-verde text-[14px] md:text-lg md:font-black tracking-tight md:tracking-wide">
                                        {formatPrice(p.price, p.currency || 'CRC')}
                                    </span>
                                    <Edit3 className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-60 md:opacity-0 md:group-hover/price:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controles de Inventario (Fila Inferior) */}
                    <div className="pt-2 border-t border-gray-150 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 mt-auto w-full">
                        <QuantityControl
                            productId={p.id}
                            quantity={p.quantity ?? 0}
                            onUpdated={onQuantityUpdated}
                        />
                        <StatusDropdown
                            productId={p.id}
                            currentStatus={p.stock || 'Disponible'}
                            onUpdated={onStatusUpdated}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
