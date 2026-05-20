import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProductById, updateProduct } from '../../services/productService';
import { toast } from 'react-toastify';
import { ImagePlus, Save, Trash2, Plus, Package, Tag, DollarSign, Layers, Image as ImageIcon, Star, ChevronDown } from 'lucide-react';

export default function ProductForm({ productId: propProductId, onClose, onSaved, onDirtyChange, formId, onLoadingChange }) {
    const { id: paramId } = useParams();
    const id = propProductId ?? paramId;
    const isEditMode = Boolean(id);
    const isSidebarMode = Boolean(onClose);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingInfo, setIsFetchingInfo] = useState(isEditMode);
    
    // Notificar al padre sobre el estado de carga
    useEffect(() => {
        onLoadingChange?.(isLoading);
    }, [isLoading, onLoadingChange]);
    
    // El esquema de datos de la perfumería
    const [formData, setFormData] = useState({
        name: '',
        category: 'Unisex',
        family: 'Amaderado', // Familia olfativa base
        notes: '',
        description: '',
        price: '',
        currency: 'CRC',
        ml: '100', // Valor por defecto común en perfumes
        stock: 'Disponible',
        isFeatured: false,
        quantity: 0,
        hasPresentations: false,
        presentaciones: []
    });
    
    // Manejo de imágenes (Portada y Galería)
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null); // URL vieja/nueva mostrada como preview de portada
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    const [oldGalleryUrls, setOldGalleryUrls] = useState([]);

    // Secciones colapsables
    const [openSections, setOpenSections] = useState({
        info: true,
        pricing: true,
        presentations: true,
        images: true,
    });

    const initialDataRef = useRef(null);
    const dirtyInitRef = useRef(false);

    // Familias Olfativas disponibles (Misma que en la tienda)
    const FAMILIES = ['Amaderado', 'Floral', 'Cítrico', 'Dulce', 'Acuático', 'Oriental', 'Cuero'];

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Si es edición, cargar el producto por ID al montar
    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const data = await getProductById(id);
                    if (data) {
                        setFormData({
                            name: data.name || '',
                            category: data.category || 'Unisex',
                            family: data.family || 'Amaderado',
                            notes: data.notes || '',
                            description: data.description || '',
                            price: data.price || '',
                            currency: data.currency || 'CRC',
                            ml: data.ml || '100',
                            stock: data.stock || 'Disponible',
                            isFeatured: data.isFeatured || false,
                            quantity: data.quantity ?? 0,
                            hasPresentations: data.hasPresentations || (data.presentaciones && data.presentaciones.length > 0) || false,
                            presentaciones: data.presentaciones || []
                        });
                        
                        // Cargar portada principal
                        if (data.coverImage || data.imageUrl) {
                            setCoverPreview(data.coverImage || data.imageUrl);
                        }
                        
                        // Cargar galería preexistente
                        if (data.galleryImages && Array.isArray(data.galleryImages)) {
                            setOldGalleryUrls(data.galleryImages);
                            setGalleryPreviews(data.galleryImages);
                        }
                    } else {
                        toast.error('Producto no encontrado en la base de datos');
                        navigate('/admin/inventory');
                    }
                } catch (error) {
                    toast.error('Error al cargar la información del producto');
                } finally {
                    setIsFetchingInfo(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode, navigate]);

    // Snapshot inicial para detectar cambios
    useEffect(() => {
        if (!isFetchingInfo && !dirtyInitRef.current) {
            initialDataRef.current = JSON.stringify(formData);
            dirtyInitRef.current = true;
        }
    }, [isFetchingInfo, formData]);

    // Notificar al padre si hay cambios sin guardar
    useEffect(() => {
        if (!onDirtyChange || !initialDataRef.current) return;
        const dirty = JSON.stringify(formData) !== initialDataRef.current
            || Boolean(coverFile)
            || galleryFiles.length > 0;
        onDirtyChange(dirty);
    }, [formData, coverFile, galleryFiles, onDirtyChange]);

    // Manejador genérico de campos de texto
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manejador Portada Principal
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    // Manejador Galería Múltiple
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setGalleryFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    // Remover imagen de galería por índice temporal
    const removeGalleryPreview = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setOldGalleryUrls(prevOld => {
            if (index < prevOld.length) {
                return prevOld.filter((_, i) => i !== index);
            } else {
                setGalleryFiles(prevFiles => {
                    const fileIndex = index - prevOld.length;
                    return prevFiles.filter((_, i) => i !== fileIndex);
                });
                return prevOld;
            }
        });
    };

    // Manejadores de presentaciones
    const addPresentation = () => {
        setFormData(prev => ({
            ...prev,
            presentaciones: [
                ...prev.presentaciones,
                { id: Date.now().toString(), label: '', price: '', quantity: 0, stock: 'Disponible' }
            ]
        }));
    };

    const updatePresentation = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            presentaciones: prev.presentaciones.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            )
        }));
    };

    const removePresentation = (index) => {
        setFormData(prev => ({
            ...prev,
            presentaciones: prev.presentaciones.filter((_, i) => i !== index)
        }));
    };

    // Enviar el formulario a Base de datos (Crear o Actualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name) return toast.warn("Por favor añade un nombre.");
        if (!isEditMode && !coverFile && !coverPreview) return toast.warn("Sube al menos la Imagen de Portada Principal.");

        try {
            setIsLoading(true);
            
            const cleanData = { 
                ...formData, 
                price: formData.hasPresentations ? 0 : (Number(formData.price) || 0),
                quantity: formData.hasPresentations ? 0 : (Number(formData.quantity) || 0),
                presentaciones: formData.hasPresentations 
                    ? formData.presentaciones.map(p => ({
                        ...p,
                        price: Number(p.price) || 0,
                        quantity: Number(p.quantity) || 0,
                        stock: p.stock || 'Disponible'
                    }))
                    : []
            };

            if (isEditMode) {
                await updateProduct(id, cleanData, coverFile, coverPreview, galleryFiles, oldGalleryUrls);
                toast.success('¡Producto actualizado!');
            } else {
                await createProduct(cleanData, coverFile, galleryFiles);
                toast.success('¡Producto guardado!');
            }
            onDirtyChange?.(false);
            if (isSidebarMode) { onSaved?.(); } else { navigate('/admin/inventory'); }
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingInfo) {
        return (
            <div className="flex flex-col gap-4 p-6">
                <div className="h-10 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse w-3/4" />
                <div className="h-24 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse w-1/2" />
            </div>
        );
    }

    /* ═══════════════════════════════════════
       Estilos reutilizables (tokens)
    ═══════════════════════════════════════ */
    const inputBase = "w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] text-gray-800 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";
    const labelBase = "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5";
    const sectionHeader = "flex items-center justify-between py-3 cursor-pointer select-none group";
    const sectionTitle = "flex items-center gap-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider";
    const sectionIcon = "w-4 h-4 text-indigo-500 dark:text-indigo-400";

    return (
        <div className={isSidebarMode ? '' : 'max-w-4xl mx-auto'}>
            {!isSidebarMode && (
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Completa los detalles de esta fragancia.</p>
                    </div>
                    <button onClick={() => navigate('/admin/inventory')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm border border-gray-300 dark:border-white/10 px-4 py-2 rounded-lg transition-colors">
                        Volver
                    </button>
                </header>
            )}

            <form id={formId} onSubmit={handleSubmit} className="space-y-1">

                {/* ═══ SWITCH DESTACADO ═══ */}
                <div className="flex items-center justify-between bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-500/5 dark:to-transparent p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-500/10">
                    <div className="flex items-center gap-2.5">
                        <Star className={`w-4 h-4 transition-colors ${formData.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        <div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block leading-tight">Producto Destacado</span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">Aparecerá en la portada y colecciones de la tienda.</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="sr-only peer" />
                        <div className="w-10 h-[22px] bg-gray-200 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-sm peer-checked:bg-amber-500" />
                    </label>
                </div>

                {/* ═══════════════════════════════════
                    SECCIÓN: INFORMACIÓN GENERAL
                ═══════════════════════════════════ */}
                <div className="border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => toggleSection('info')} className={`${sectionHeader} px-4 w-full hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-t-xl`}>
                        <span className={sectionTitle}>
                            <Tag className={sectionIcon} />
                            Información General
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSections.info ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openSections.info && (
                        <div className="px-4 pb-5 space-y-4">
                            {/* Nombre */}
                            <div>
                                <label className={labelBase}>Nombre de la fragancia *</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputBase} placeholder="Ej. Oud Mystique" />
                            </div>

                            {/* Género + Familia Olfativa: en una fila */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelBase}>Género / Categoría</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className={inputBase}>
                                        <option value="Unisex">Unisex</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Masculino">Masculino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelBase}>Familia Olfativa</label>
                                    <select name="family" value={formData.family} onChange={handleChange} className={inputBase}>
                                        {FAMILIES.map(fam => <option key={fam} value={fam}>{fam}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Notas Olfativas */}
                            <div>
                                <label className={labelBase}>Notas Olfativas</label>
                                <input type="text" name="notes" value={formData.notes} onChange={handleChange} className={inputBase} placeholder="Ej. Madera de oud · Ámbar · Sándalo" />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className={labelBase}>Descripción</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={`${inputBase} resize-y min-h-[100px]`} placeholder="Descripción de la fragancia para el cliente..." />
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════
                    SECCIÓN: PRECIO Y STOCK
                ═══════════════════════════════════ */}
                <div className="border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => toggleSection('pricing')} className={`${sectionHeader} px-4 w-full hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-t-xl`}>
                        <span className={sectionTitle}>
                            <DollarSign className={sectionIcon} />
                            Precio y Stock
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSections.pricing ? 'rotate-180' : ''}`} />
                    </button>

                    {openSections.pricing && (
                        <div className="px-4 pb-5 space-y-4">

                            {/* Switch Múltiples Presentaciones */}
                            <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-200/50 dark:border-emerald-500/10">
                                <div className="flex items-center gap-2.5">
                                    <Layers className={`w-4 h-4 transition-colors ${formData.hasPresentations ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block leading-tight">Múltiples presentaciones</span>
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">Diferentes tamaños o volúmenes (ml) con precios independientes.</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input type="checkbox" name="hasPresentations" checked={formData.hasPresentations || false} onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            hasPresentations: e.target.checked,
                                            presentaciones: e.target.checked && prev.presentaciones.length === 0 
                                                ? [{ id: Date.now().toString(), label: '', price: '', quantity: 0, stock: 'Disponible' }]
                                                : prev.presentaciones
                                        }));
                                    }} className="sr-only peer" />
                                    <div className="w-10 h-[22px] bg-gray-200 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-sm peer-checked:bg-emerald-500" />
                                </label>
                            </div>

                            {formData.hasPresentations ? (
                                /* ── Editor de Presentaciones ── */
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {formData.presentaciones.length} Variante{formData.presentaciones.length !== 1 ? 's' : ''}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={addPresentation}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Añadir
                                        </button>
                                    </div>

                                    {formData.presentaciones.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                            <Layers className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400 dark:text-gray-500">No hay presentaciones. Añade una para comenzar.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-0.5 scrollbar-admin">
                                            {formData.presentaciones.map((pres, index) => (
                                                <div key={pres.id} className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-100 dark:border-white/5 p-3.5 relative group hover:border-emerald-200/60 dark:hover:border-emerald-500/15 transition-colors">
                                                    
                                                    {/* Cabecera de la variante */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md tracking-wider uppercase">
                                                            Variante {index + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removePresentation(index)}
                                                            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Eliminar presentación"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Campos de la variante */}
                                                    <div className="grid grid-cols-2 gap-2.5">
                                                        {/* Etiqueta */}
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Etiqueta *</label>
                                                            <input
                                                                required
                                                                type="text"
                                                                value={pres.label}
                                                                onChange={(e) => updatePresentation(index, 'label', e.target.value)}
                                                                className={`${inputBase} !py-2 !text-xs`}
                                                                placeholder="100 ml, 50 ml"
                                                            />
                                                        </div>
                                                        {/* Precio */}
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Precio (₡) *</label>
                                                            <input
                                                                required
                                                                type="number"
                                                                value={pres.price}
                                                                onChange={(e) => updatePresentation(index, 'price', e.target.value)}
                                                                className={`${inputBase} !py-2 !text-xs`}
                                                                placeholder="45000"
                                                            />
                                                        </div>
                                                        {/* Unidades */}
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Unidades</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={pres.quantity}
                                                                onChange={(e) => updatePresentation(index, 'quantity', Number(e.target.value) || 0)}
                                                                className={`${inputBase} !py-2 !text-xs`}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        {/* Estado */}
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Estado</label>
                                                            <select
                                                                value={pres.stock}
                                                                onChange={(e) => updatePresentation(index, 'stock', e.target.value)}
                                                                className={`${inputBase} !py-2 !text-xs`}
                                                            >
                                                                <option value="Disponible">Disponible</option>
                                                                <option value="Agotado">Agotado</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── Campos individuales de precio/stock ── */
                                <div className="space-y-4">
                                    {/* Precio + Moneda */}
                                    <div>
                                        <label className={labelBase}>Precio *</label>
                                        <div className="flex gap-2">
                                            <select name="currency" value={formData.currency} onChange={handleChange} className={`${inputBase} !w-auto shrink-0 bg-white`}>
                                                <option value="CRC">₡ CRC</option>
                                                <option value="USD">$ USD</option>
                                            </select>
                                            <input required={!formData.hasPresentations} type="number" name="price" value={formData.price} onChange={handleChange} className={inputBase} placeholder={formData.currency === 'CRC' ? '45000' : '89.99'} />
                                        </div>
                                    </div>

                                    {/* Estado + Unidades en fila */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelBase}>Estado</label>
                                            <select name="stock" value={formData.stock} onChange={handleChange} className={inputBase}>
                                                <option value="Disponible">Disponible</option>
                                                <option value="Agotado">Agotado</option>
                                                <option value="Bóveda (Retirado)">Retirado (Oculto)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelBase}>Unidades en stock</label>
                                            <input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleChange} className={inputBase} placeholder="0" />
                                        </div>
                                    </div>

                                    {/* Contenido ml */}
                                    <div>
                                        <label className={labelBase}>Contenido (ml)</label>
                                        <div className="relative">
                                            <input type="number" name="ml" value={formData.ml} onChange={handleChange} className={`${inputBase} pr-12`} placeholder="100" />
                                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-medium pointer-events-none">ml</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════
                    SECCIÓN: IMÁGENES
                ═══════════════════════════════════ */}
                <div className="border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => toggleSection('images')} className={`${sectionHeader} px-4 w-full hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-t-xl`}>
                        <span className={sectionTitle}>
                            <ImageIcon className={sectionIcon} />
                            Imágenes
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSections.images ? 'rotate-180' : ''}`} />
                    </button>

                    {openSections.images && (
                        <div className="px-4 pb-5 space-y-4">
                            {/* Portada */}
                            <div>
                                <label className={labelBase}>Portada Principal *</label>
                                <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mb-3 -mt-0.5">Se muestra en el catálogo y resultados de búsqueda de la tienda.</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {coverPreview
                                            ? <img src={coverPreview} alt="Portada" className="w-full h-full object-contain" />
                                            : <ImagePlus className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <label className="inline-flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-colors shadow-sm">
                                            <ImagePlus className="w-3.5 h-3.5" />
                                            {coverPreview ? 'Cambiar' : 'Subir imagen'}
                                            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Galería */}
                            <div>
                                <label className={labelBase}>Galería (carrusel de detalles)</label>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 -mt-0.5">Sólo visibles al abrir el detalle del producto.</p>
                                
                                <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-white/10 mb-3">
                                    <Plus className="w-3.5 h-3.5" />
                                    Añadir imágenes
                                    <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                                </label>

                                {galleryPreviews.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {galleryPreviews.map((src, i) => (
                                            <div key={i} className="relative aspect-square bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden group border border-gray-200 dark:border-white/5">
                                                <img src={src} alt={`Galería ${i}`} className="w-full h-full object-contain" />
                                                <button type="button" onClick={() => removeGalleryPreview(i)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shadow-md">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center gap-1.5">
                                        <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                        <span className="text-gray-400 dark:text-gray-500 text-xs">Sin imágenes en la galería</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ BOTONES (solo modo página completa) ═══ */}
                {!isSidebarMode && (
                    <div className="pt-5 mt-2 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/inventory')}
                            disabled={isLoading}
                            className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors font-medium border border-gray-200 dark:border-white/10 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-6 py-2.5 text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                            ) : (
                                isEditMode ? 'Actualizar' : 'Guardar producto'
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
