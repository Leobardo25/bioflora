import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Layers, Calendar, ChevronRight, Loader2, Edit3, ArrowRightLeft, X, Bookmark, Sliders } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MetadataManager({ onClose }) {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'families'

    // Colecciones de Firestore
    const [categories, setCategories] = useState([]);
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Formulario de creación
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState(''); // Solo para familias
    const [isSaving, setIsSaving] = useState(false);

    // Contadores de productos en caliente
    const [productCategoryCounts, setProductCategoryCounts] = useState({});
    const [productFamilyCounts, setProductFamilyCounts] = useState({});

    // Modales
    const [editingItem, setEditingItem] = useState(null); // { type, id, name, description }
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [mergingItem, setMergingItem] = useState(null); // { type, name }
    const [targetName, setTargetName] = useState('');
    const [isSavingMerge, setIsSavingMerge] = useState(false);

    // 1. Cargar metadatos en tiempo real
    useEffect(() => {
        setLoading(true);
        
        // Listener de Categorías
        const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCategories(list);
        }, (err) => {
            console.error("Error al cargar categorías:", err);
            toast.error("Error al cargar categorías de la base de datos.");
        });

        // Listener de Familias
        const unsubFamilies = onSnapshot(collection(db, 'families'), (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setFamilies(list);
        }, (err) => {
            console.error("Error al cargar familias:", err);
            toast.error("Error al cargar familias de la base de datos.");
        });

        // Listener / Carga de conteo de productos
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            const catCounts = {};
            const famCounts = {};
            
            snapshot.forEach(doc => {
                const prod = doc.data();
                if (prod.category) {
                    const c = prod.category.trim();
                    if (c) catCounts[c] = (catCounts[c] || 0) + 1;
                }
                if (prod.family) {
                    const f = prod.family.trim();
                    if (f) famCounts[f] = (famCounts[f] || 0) + 1;
                }
            });

            setProductCategoryCounts(catCounts);
            setProductFamilyCounts(famCounts);
            setLoading(false);
        }, (err) => {
            console.error("Error al cargar conteo de productos:", err);
            setLoading(false);
        });

        return () => {
            unsubCategories();
            unsubFamilies();
            unsubProducts();
        };
    }, []);

    // Resetear formulario al cambiar de pestaña
    useEffect(() => {
        setNewName('');
        setNewDescription('');
    }, [activeTab]);

    // 2. Crear Metadato
    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanVal = newName.trim();
        if (!cleanVal) return toast.warn("Por favor escribe un nombre.");

        setIsSaving(true);
        try {
            const collectionName = activeTab === 'categories' ? 'categories' : 'families';
            const list = activeTab === 'categories' ? categories : families;

            const exists = list.some(item => item.name.toLowerCase() === cleanVal.toLowerCase());
            if (exists) {
                toast.error(`Ya existe esa clasificación.`);
                setIsSaving(false);
                return;
            }

            const docRef = doc(collection(db, collectionName));
            const payload = {
                name: cleanVal,
                createdAt: serverTimestamp()
            };
            if (activeTab === 'families') {
                payload.description = newDescription.trim();
            }

            await setDoc(docRef, payload);
            toast.success("¡Metadato creado con éxito!");
            setNewName('');
            setNewDescription('');
        } catch (error) {
            console.error("Error al guardar metadato:", error);
            toast.error("Error al guardar el metadato en la base de datos.");
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Iniciar Edición
    const handleStartEdit = (type, item) => {
        setEditingItem({ type, ...item });
        setEditName(item.name);
        setEditDescription(item.description || '');
    };

    // 4. Guardar Edición (Con actualización en cascada en los productos)
    const handleSaveEdit = async () => {
        const cleanNewName = editName.trim();
        if (!cleanNewName) return toast.warn("El nombre es requerido.");

        setIsSavingEdit(true);
        const typeLabel = editingItem.type === 'categories' ? 'categoría' : 'familia';
        const collectionName = editingItem.type;
        const list = editingItem.type === 'categories' ? categories : families;

        const toastId = toast.loading(`Actualizando ${typeLabel} "${editingItem.name}"...`);
        try {
            const oldName = editingItem.name;
            const newDesc = editDescription.trim();

            // Verificar si el nombre cambió y es duplicado
            if (oldName.toLowerCase() !== cleanNewName.toLowerCase()) {
                const exists = list.some(item => item.name.toLowerCase() === cleanNewName.toLowerCase());
                if (exists) {
                    toast.update(toastId, { render: `Ya existe otra ${typeLabel} con ese nombre.`, type: "error", isLoading: false, autoClose: 3000 });
                    setIsSavingEdit(false);
                    return;
                }
            }

            // Actualizar documento del metadato
            const payload = {
                name: cleanNewName,
                updatedAt: serverTimestamp()
            };
            if (editingItem.type === 'families') {
                payload.description = newDesc;
            }
            await setDoc(doc(db, collectionName, editingItem.id), payload, { merge: true });

            // Si el nombre cambió, actualizar en cascada todos los productos de Firestore
            if (oldName !== cleanNewName) {
                const fieldName = editingItem.type === 'categories' ? 'category' : 'family';
                const productsSnap = await getDocs(query(collection(db, 'products'), where(fieldName, '==', oldName)));
                for (const pDoc of productsSnap.docs) {
                    await setDoc(doc(db, 'products', pDoc.id), {
                        [fieldName]: cleanNewName,
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                }
            }

            toast.update(toastId, { render: `¡Listo! Cambios guardados con éxito.`, type: "success", isLoading: false, autoClose: 3000 });
            setEditingItem(null);
        } catch (error) {
            console.error("Error al editar metadato:", error);
            toast.update(toastId, { render: `Error al actualizar en la base de datos.`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSavingEdit(false);
        }
    };

    // 5. Iniciar Fusión/Mover Plantas
    const handleStartMerge = (type, item) => {
        setMergingItem({ type, ...item });
        const list = type === 'categories' ? categories : families;
        const otherItems = list.filter(i => i.name !== item.name);
        if (otherItems.length > 0) {
            setTargetName(otherItems[0].name);
        } else {
            setTargetName('');
        }
    };

    // 6. Confirmar Fusión/Mover (Reclasifica todos los productos a la nueva clasificación)
    const handleConfirmMerge = async () => {
        if (!targetName) return toast.warn("Por favor selecciona un destino.");

        setIsSavingMerge(true);
        const typeLabel = mergingItem.type === 'categories' ? 'categorías' : 'familias';
        const fieldName = mergingItem.type === 'categories' ? 'category' : 'family';
        const sourceName = mergingItem.name;

        const toastId = toast.loading(`Transfiriendo plantas de "${sourceName}" → "${targetName}"...`);
        try {
            const productsSnap = await getDocs(query(collection(db, 'products'), where(fieldName, '==', sourceName)));
            let count = 0;
            for (const pDoc of productsSnap.docs) {
                await setDoc(doc(db, 'products', pDoc.id), {
                    [fieldName]: targetName,
                    updatedAt: serverTimestamp()
                }, { merge: true });
                count++;
            }

            toast.update(toastId, { render: `¡Fusión completada! Se movieron ${count} planta(s) a "${targetName}".`, type: "success", isLoading: false, autoClose: 3000 });
            setMergingItem(null);
            setTargetName('');
        } catch (error) {
            console.error("Error en fusión de metadatos:", error);
            toast.update(toastId, { render: "Error al actualizar los productos en la base de datos.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSavingMerge(false);
        }
    };

    // 7. Eliminar Metadato (Bloqueado si tiene productos asociados)
    const handleDelete = async (type, id, name) => {
        const counts = type === 'categories' ? productCategoryCounts : productFamilyCounts;
        const count = counts[name] || 0;
        const typeLabel = type === 'categories' ? 'categoría' : 'familia';

        if (count > 0) {
            return toast.error(`No puedes eliminar la ${typeLabel} "${name}" porque tiene ${count} planta(s) asociada(s). Mueve primero sus plantas.`);
        }

        if (!window.confirm(`¿Estás seguro de que deseas eliminar la ${typeLabel} "${name}"?`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, type, id));
            toast.success(`La ${typeLabel} ha sido eliminada.`);
        } catch (error) {
            console.error("Error al eliminar metadato:", error);
            toast.error("Error al eliminar el documento de la base de datos.");
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const inputBase = "w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181A] text-gray-800 dark:text-gray-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bioflora-verde/40 focus:border-bioflora-verde transition-all placeholder:text-gray-400 dark:placeholder:text-gray-650 font-sans";
    const labelBase = "text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-bioflora-verde" />
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Cargando clasificaciones globales...</p>
            </div>
        );
    }

    const currentList = activeTab === 'categories' ? categories : families;
    const currentCounts = activeTab === 'categories' ? productCategoryCounts : productFamilyCounts;

    return (
        <div className="space-y-5">
            {onClose && (
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-4">
                    <h2 className="text-base font-bold font-sans text-gray-800 dark:text-gray-100">Gestionar Metadatos</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Selector de Pestañas (Tabs) */}
            <div className="flex border-b border-gray-200 dark:border-white/10 shrink-0">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === 'categories'
                            ? 'border-bioflora-verde text-bioflora-verde dark:text-bioflora-verde bg-bioflora-verde/5'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                >
                    <Bookmark className="w-4 h-4" />
                    Categorías ({categories.length})
                </button>
                <button
                    onClick={() => setActiveTab('families')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === 'families'
                            ? 'border-bioflora-verde text-bioflora-verde dark:text-bioflora-verde bg-bioflora-verde/5'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    Familias ({families.length})
                </button>
            </div>

            <div className="space-y-6">
                {/* FORMULARIO DE CREACIÓN */}
                <div className="bg-white dark:bg-[#1E1E20]/40 border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-bioflora-verde">
                        <Plus className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            {activeTab === 'categories' ? 'Nueva Categoría' : 'Nueva Familia Botánica'}
                        </h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div className="flex-1">
                            <label className={labelBase}>Nombre *</label>
                            <input
                                required
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={activeTab === 'categories' ? "Ej. Exóticas, Orquídeas" : "Ej. Araceae, Gesneriaceae"}
                                className={inputBase}
                            />
                        </div>

                        {activeTab === 'families' && (
                            <div className="flex-1">
                                <label className={labelBase}>Descripción Botánica</label>
                                <input
                                    type="text"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Ej. Hojas variegadas, trepadoras..."
                                    className={inputBase}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center justify-center gap-1.5 h-10 px-4 bg-bioflora-verde hover:bg-bioflora-verde/90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-bioflora-verde/15 cursor-pointer disabled:opacity-50 sm:shrink-0"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Crear</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* LISTADO DE METADATOS */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {currentList.length} Registro{currentList.length !== 1 ? 's' : ''} Encontrado{currentList.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {currentList.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.01]">
                            <Sliders className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">No hay clasificaciones registradas.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <AnimatePresence mode="popLayout">
                                {currentList.map((item) => {
                                    const plantCount = currentCounts[item.name] || 0;
                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white dark:bg-[#1E1E20]/45 border border-gray-200/50 dark:border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="p-1.5 bg-bioflora-verde/10 text-bioflora-verde rounded-lg shrink-0">
                                                            {activeTab === 'categories' ? (
                                                                <Bookmark className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Layers className="w-3.5 h-3.5" />
                                                            )}
                                                        </div>
                                                        <h3 className="font-sans font-bold text-sm text-gray-800 dark:text-gray-200 truncate" title={item.name}>{item.name}</h3>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                        <button
                                                            onClick={() => handleStartEdit(activeTab, item)}
                                                            className="p-1 text-gray-400 hover:text-bioflora-verde dark:hover:text-bioflora-verde hover:bg-bioflora-verde/10 rounded-md transition-all cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        {plantCount > 0 && (
                                                            <button
                                                                onClick={() => handleStartMerge(activeTab, item)}
                                                                className="p-1 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-all cursor-pointer"
                                                                title="Mover plantas (Fusión)"
                                                            >
                                                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(activeTab, item.id, item.name)}
                                                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {activeTab === 'families' && (
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed font-sans">
                                                        {item.description || 'Sin descripción botánica registrada.'}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 text-[9px] text-gray-400 dark:text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-bold text-bioflora-verde bg-bioflora-verde/10 px-2 py-0.5 rounded-full shrink-0">
                                                    <span>{plantCount} Planta{plantCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            <AnimatePresence>
                {editingItem && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setEditingItem(null)}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white dark:bg-[#1E1E20] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full z-10 space-y-4 animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-base font-bold font-sans text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-bioflora-verde" />
                                    Editar {editingItem.type === 'categories' ? 'Categoría' : 'Familia'}
                                </h3>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelBase}>Nombre</label>
                                    <input
                                        required
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className={inputBase}
                                    />
                                </div>

                                {editingItem.type === 'families' && (
                                    <div>
                                        <label className={labelBase}>Descripción Botánica</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            rows="3"
                                            className={`${inputBase} resize-y min-h-[80px]`}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Alerta de cambio en cascada si cambia el nombre */}
                            {editingItem.name !== editName.trim() && editName.trim() !== '' && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-xl leading-relaxed font-sans">
                                    <strong>¡Importante!</strong> Al cambiar el nombre, todas las plantas asociadas a <em>"{editingItem.name}"</em> en la tienda serán actualizadas en cascada a <em>"{editName.trim()}"</em> en Firestore de manera automática.
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={isSavingEdit}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-bioflora-verde hover:bg-bioflora-verde/90 rounded-xl transition-all shadow-md shadow-bioflora-verde/15 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isSavingEdit ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : 'Guardar Cambios'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Fusión/Mover */}
            <AnimatePresence>
                {mergingItem && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMergingItem(null)}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white dark:bg-[#1E1E20] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full z-10 space-y-4 animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-base font-bold font-sans text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                                    Mover Plantas (Fusión)
                                </h3>
                                <button
                                    onClick={() => setMergingItem(null)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                                Selecciona el destino al que deseas transferir las <strong>{currentCounts[mergingItem.name] || 0} planta(s)</strong> asociadas actualmente a <strong>"{mergingItem.name}"</strong>.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelBase}>Destino</label>
                                    <select
                                        value={targetName}
                                        onChange={(e) => setTargetName(e.target.value)}
                                        className={inputBase}
                                    >
                                        <option value="">-- Selecciona el destino --</option>
                                        {(mergingItem.type === 'categories' ? categories : families)
                                            .filter(i => i.name !== mergingItem.name)
                                            .map(i => (
                                                <option key={i.id} value={i.name}>{i.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setMergingItem(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmMerge}
                                    disabled={isSavingMerge || !targetName}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/15 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isSavingMerge ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : 'Confirmar Transferencia'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
