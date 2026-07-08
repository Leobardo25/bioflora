import { useState, useEffect } from 'react';
import { X, Package, Check, FolderOpen } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { toast } from 'react-toastify';
import { getProductImage } from './inventoryUtils';

export default function ClassifierSidebar({ product, onClose, onUpdateField }) {
    const [newItemMode, setNewItemMode] = useState(null); // 'category' | 'family'
    const [newItemValue, setNewItemValue] = useState('');
    const [isSavingNewItem, setIsSavingNewItem] = useState(false);

    // Listados en tiempo real desde la BD
    const [dbCategories, setDbCategories] = useState([]);
    const [dbFamilies, setDbFamilies] = useState([]);

    useEffect(() => {
        if (!product) return;

        // Suscripción a Categorías
        const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setDbCategories(list);
        });

        // Suscripción a Familias
        const unsubFamilies = onSnapshot(collection(db, 'families'), (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setDbFamilies(list);
        });

        return () => {
            unsubCategories();
            unsubFamilies();
        };
    }, [product]);

    const handleCreateNewItem = async () => {
        const cleanVal = newItemValue.trim();
        if (!cleanVal) return;

        setIsSavingNewItem(true);
        try {
            const collectionName = newItemMode === 'category' ? 'categories' : 'families';
            const list = newItemMode === 'category' ? dbCategories : dbFamilies;

            const exists = list.some(item => item.name.toLowerCase() === cleanVal.toLowerCase());
            if (exists) {
                toast.error(`Ya existe "${cleanVal}".`);
                setIsSavingNewItem(false);
                return;
            }

            const docRef = doc(collection(db, collectionName));
            await setDoc(docRef, {
                name: cleanVal,
                createdAt: serverTimestamp()
            });

            // Asignar inmediatamente al producto
            await onUpdateField(product.id, newItemMode === 'category' ? 'category' : 'family', cleanVal);
            toast.success(`"${cleanVal}" creada y asignada.`);

            setNewItemValue('');
            setNewItemMode(null);
        } catch (err) {
            console.error("Error al crear metadato en caliente:", err);
            toast.error("Error al guardar la nueva clasificación.");
        } finally {
            setIsSavingNewItem(false);
        }
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 z-[150] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Sidebar Panel */}
            <div className="relative w-full md:w-[450px] lg:w-[500px] h-full bg-white dark:bg-[#111113] border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right fade-in duration-300 ease-out z-10">
                
                {/* Header Corto */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <span className="text-[10px] font-extrabold text-bioflora-verde uppercase tracking-wider font-sans flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5" />
                        Reclasificación en Caliente
                    </span>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Contenido (Scrollable) */}
                <div className="flex-1 overflow-y-auto">
                    {/* Header de Ficha Técnica */}
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/10 flex gap-4 items-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white dark:bg-[#1E1E20] flex-shrink-0 flex items-center justify-center p-2">
                            {getProductImage(product) ? (
                                <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 font-sans leading-snug line-clamp-2 mb-2">{product.name}</h3>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
                                <div className="flex gap-2">
                                    <span className="text-gray-400 w-16 shrink-0">Categoría:</span> 
                                    <span className="font-bold text-bioflora-verde truncate">{product.category || 'Sin asignar'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-400 w-16 shrink-0">Familia:</span> 
                                    <span className="font-bold text-amber-500 dark:text-amber-400 truncate">{product.family || 'Sin asignar'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario / Opciones */}
                    <div className="p-4 md:p-6 space-y-6">
                        
                        {/* Bento Sección 1: Categorías */}
                        <div className="bg-gray-50 dark:bg-white/[0.01] border border-gray-250/20 dark:border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-bioflora-verde uppercase tracking-widest font-sans flex items-center gap-1.5">
                                    📂 Categoría de Tienda
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                                {dbCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => onUpdateField(product.id, 'category', cat.name)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                            product.category === cat.name
                                                ? 'bg-bioflora-verde text-white shadow-md shadow-bioflora-verde/25 border border-bioflora-verde/30'
                                                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                                {newItemMode === 'category' ? (
                                    <div className="flex items-center gap-1 bg-bioflora-verde/10 border border-bioflora-verde/40 rounded-xl px-2 py-1">
                                        <input
                                            type="text"
                                            value={newItemValue}
                                            onChange={(e) => setNewItemValue(e.target.value)}
                                            placeholder="Ej. Accesorios"
                                            className="bg-transparent text-gray-800 dark:text-white text-xs outline-none w-24 font-sans"
                                            autoFocus
                                            disabled={isSavingNewItem}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateNewItem();
                                                if (e.key === 'Escape') { setNewItemValue(''); setNewItemMode(null); }
                                            }}
                                        />
                                        <button onClick={handleCreateNewItem} className="text-bioflora-verde hover:text-bioflora-verde/85"><Check className="w-3.5 h-3.5 font-extrabold" /></button>
                                        <button onClick={() => { setNewItemValue(''); setNewItemMode(null); }} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setNewItemMode('category')}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-bioflora-verde/10 text-bioflora-verde border border-bioflora-verde/20 hover:bg-bioflora-verde/20 transition cursor-pointer"
                                    >
                                        + Nueva
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bento Sección 2: Familias */}
                        <div className="bg-gray-50 dark:bg-white/[0.01] border border-gray-250/20 dark:border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                                    🌿 Familia Botánica
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                                {dbFamilies.map(fam => (
                                    <button
                                        key={fam.id}
                                        onClick={() => onUpdateField(product.id, 'family', fam.name)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                            product.family === fam.name
                                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-600/30'
                                                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
                                        }`}
                                    >
                                        {fam.name}
                                    </button>
                                ))}
                                {newItemMode === 'family' ? (
                                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/40 rounded-xl px-2 py-1">
                                        <input
                                            type="text"
                                            value={newItemValue}
                                            onChange={(e) => setNewItemValue(e.target.value)}
                                            placeholder="Ej. Araceae"
                                            className="bg-transparent text-gray-800 dark:text-white text-xs outline-none w-24 font-sans"
                                            autoFocus
                                            disabled={isSavingNewItem}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateNewItem();
                                                if (e.key === 'Escape') { setNewItemValue(''); setNewItemMode(null); }
                                            }}
                                        />
                                        <button onClick={handleCreateNewItem} className="text-amber-500 hover:text-amber-400"><Check className="w-3.5 h-3.5 font-extrabold" /></button>
                                        <button onClick={() => { setNewItemValue(''); setNewItemMode(null); }} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setNewItemMode('family')}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                                    >
                                        + Nueva
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Pie Corto */}
                <div className="p-4 border-t border-gray-250/20 dark:border-white/10 flex justify-end shrink-0 bg-white dark:bg-[#111113]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-bioflora-verde hover:bg-bioflora-verde/95 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-md shadow-bioflora-verde/20 cursor-pointer"
                    >
                        Listo • Regresar
                    </button>
                </div>
            </div>
        </div>
    );
}
