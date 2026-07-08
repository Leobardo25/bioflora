import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createProduct, getProductById, updateProduct } from '../../services/productService';
import { toast } from 'react-toastify';
import { db } from '../../firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ImagePlus, Save, Trash2, Plus, Package, Tag, DollarSign, Layers, Image as ImageIcon, Star } from 'lucide-react';
import { LIGHT_LEVELS, WATERING_LEVELS, SUBSTRATE_PRESETS, DIFFICULTY_LEVELS, getLightLevel, getWateringLevel, getSubstratePreset } from '../../constants/careGuide';
import { CareGuideFull } from '../../components/ui/CareGuideBadges';
import { PRODUCT_FORM_TABS } from '../../constants/productFormTabs';

export default function ProductForm({ productId: propProductId, onClose, onSaved, onDirtyChange, formId, onLoadingChange, activeTab: externalActiveTab, setActiveTab: externalSetActiveTab }) {
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
    
    // El esquema de datos de la floristería
    const [formData, setFormData] = useState({
        name: '',
        category: 'Exóticas',
        family: 'Araceae', // Familia botánica base
        notes: '',
        description: '',
        price: '',
        currency: 'CRC',
        ml: 'Maceta 6"', // Representa el tamaño o maceta de la planta
        stock: 'Disponible',
        isFeatured: false,
        quantity: 0,
        hasPresentations: false,
        presentaciones: [],
        careGuide: {
            light: '', lightLabel: '',
            watering: '', wateringLabel: '',
            substrate: '', substrateLabel: '',
            difficulty: ''
        }
    });
    
    // Manejo de imágenes (Portada y Galería)
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null); // URL vieja/nueva mostrada como preview de portada
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    const [oldGalleryUrls, setOldGalleryUrls] = useState([]);

    // Pestaña activa (informacion | cuidados | precio | imagenes)
    const [localActiveTab, setLocalActiveTab] = useState('informacion');
    const activeTab = externalActiveTab ?? localActiveTab;
    const setActiveTab = externalSetActiveTab ?? setLocalActiveTab;

    const initialDataRef = useRef(null);
    const dirtyInitRef = useRef(false);

    // Familias Botánicas dinámicas desde Firestore
    const [dbFamilies, setDbFamilies] = useState(['Araceae', 'Orchidaceae', 'Bromeliaceae', 'Arecaceae', 'Insumos Profesionales']);
    const [dbCategories, setDbCategories] = useState(['Orquídeas', 'Exóticas', 'Flores Tropicales', 'Accesorios']);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'families'), (snapshot) => {
            if (!snapshot.empty) {
                const list = snapshot.docs.map(d => d.data().name).filter(Boolean);
                list.sort();
                setDbFamilies(list);
            }
        }, (err) => {
            console.error("Error al cargar familias dinámicas:", err);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
            if (!snapshot.empty) {
                const list = snapshot.docs.map(d => d.data().name).filter(Boolean);
                list.sort();
                setDbCategories(list);
            }
        }, (err) => {
            console.error("Error al cargar categorías dinámicas en formulario:", err);
        });
        return () => unsubscribe();
    }, []);

    // Si es edición, cargar el producto por ID al montar
    useEffect(() => {
        let active = true;
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const data = await getProductById(id);
                    if (!active) return;
                    if (data) {
                        setFormData({
                            name: data.name || '',
                            category: data.category || 'Exóticas',
                            family: data.family || 'Araceae',
                            notes: data.notes || '',
                            description: data.description || '',
                            price: data.price || '',
                            currency: data.currency || 'CRC',
                            ml: data.ml || 'Maceta 6"',
                            stock: data.stock || 'Disponible',
                            isFeatured: data.isFeatured || false,
                            quantity: data.quantity ?? 0,
                            hasPresentations: data.hasPresentations || (data.presentaciones && data.presentaciones.length > 0) || false,
                            presentaciones: data.presentaciones || [],
                            careGuide: {
                                light: data.careGuide?.light || '', lightLabel: data.careGuide?.lightLabel || '',
                                watering: data.careGuide?.watering || '', wateringLabel: data.careGuide?.wateringLabel || '',
                                substrate: data.careGuide?.substrate || '', substrateLabel: data.careGuide?.substrateLabel || '',
                                difficulty: data.careGuide?.difficulty || ''
                            }
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
                    if (active) {
                        toast.error('Error al cargar la información del producto');
                    }
                } finally {
                    if (active) {
                        setIsFetchingInfo(false);
                    }
                }
            };
            fetchProduct();
        }
        return () => {
            active = false;
        };
    }, [id, isEditMode, navigate, getProductById, setFormData, setCoverPreview, setOldGalleryUrls, setGalleryPreviews, setIsFetchingInfo]);

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

    // Manejador de la Ficha de Cuidados (objeto anidado)
    const handleCareGuideChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            careGuide: { ...prev.careGuide, [field]: value }
        }));
    };

    // Al elegir un nivel, autorellenar el label por defecto (si el admin no lo ha personalizado ya)
    const handleCareLevelChange = (field, labelField, value, getPreset) => {
        const preset = getPreset(value);
        setFormData(prev => ({
            ...prev,
            careGuide: {
                ...prev.careGuide,
                [field]: value,
                [labelField]: preset ? preset.label : ''
            }
        }));
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
    const inputBase = "w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#070F0A] text-gray-800 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bioflora-verde/40 focus:border-bioflora-verde transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";
    const labelBase = "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5";

    return (
        <div className={isSidebarMode ? '' : 'max-w-4xl mx-auto'}>
            {!isSidebarMode && (
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif">{isEditMode ? 'Editar Planta / Producto' : 'Nueva Planta / Producto'}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Completa los detalles de esta especie botánica.</p>
                    </div>
                    <button onClick={() => navigate('/admin/inventory')} className="text-gray-500 dark:text-gray-400 hover:text-bioflora-verde text-sm border border-gray-300 dark:border-white/10 px-4 py-2 rounded-lg transition-colors bg-transparent">
                        Volver
                    </button>
                </header>
            )}

            <form id={formId} onSubmit={handleSubmit} className="space-y-1">
                {/* ═══ SELECTOR DE PESTAÑAS (solo modo página completa; en modo sidebar lo pinta el padre) ═══ */}
                {!isSidebarMode && (
                    <div className="sticky top-0 z-30 bg-gray-50 dark:bg-[#111113] pb-4 pt-1 border-b border-gray-200/50 dark:border-white/5 mb-6">
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
                                                layoutId="activeTabIndicator"
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
                )}

                {/* ═══════════════════════════════════
                    PESTAÑA: INFORMACIÓN
                ═══════════════════════════════════ */}
                {activeTab === 'informacion' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {/* Switch Destacado */}
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

                        {/* Nombre */}
                        <div>
                            <label className={labelBase}>Nombre de la Planta / Producto *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputBase} placeholder="Ej. Monstera Variegata Albo" />
                        </div>

                        {/* Categoría + Familia Botánica: en una fila */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelBase}>Categoría Botánica</label>
                                <select name="category" value={formData.category} onChange={handleChange} className={inputBase}>
                                    {dbCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelBase}>Familia Botánica</label>
                                <select name="family" value={formData.family} onChange={handleChange} className={inputBase}>
                                    {dbFamilies.map(fam => <option key={fam} value={fam}>{fam}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Frase Corta */}
                        <div>
                            <label className={labelBase}>Frase Corta (aparece como cita destacada)</label>
                            <input type="text" name="notes" value={formData.notes} onChange={handleChange} className={inputBase} placeholder="Ej. Riego moderado · Sombra ligera · Humedad alta" />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className={labelBase}>Descripción Botánica</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={`${inputBase} resize-y min-h-[100px]`} placeholder="Características, origen o especificaciones botánicas..." />
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════
                    PESTAÑA: CUIDADOS
                ═══════════════════════════════════ */}
                {activeTab === 'cuidados' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-1">Define los íconos de necesidades que verá el cliente en la tarjeta y ficha del producto.</p>

                            {/* Luminosidad */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className={labelBase}>Luminosidad</label>
                                    <select
                                        value={formData.careGuide.light}
                                        onChange={(e) => handleCareLevelChange('light', 'lightLabel', e.target.value, getLightLevel)}
                                        className={inputBase}
                                    >
                                        <option value="">Sin definir</option>
                                        {LIGHT_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelBase}>Texto (opcional)</label>
                                    <input type="text" value={formData.careGuide.lightLabel} onChange={(e) => handleCareGuideChange('lightLabel', e.target.value)} className={inputBase} placeholder="Personalizar texto" />
                                </div>
                            </div>

                            {/* Riego */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className={labelBase}>Riego</label>
                                    <select
                                        value={formData.careGuide.watering}
                                        onChange={(e) => handleCareLevelChange('watering', 'wateringLabel', e.target.value, getWateringLevel)}
                                        className={inputBase}
                                    >
                                        <option value="">Sin definir</option>
                                        {WATERING_LEVELS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelBase}>Texto (opcional)</label>
                                    <input type="text" value={formData.careGuide.wateringLabel} onChange={(e) => handleCareGuideChange('wateringLabel', e.target.value)} className={inputBase} placeholder="Personalizar texto" />
                                </div>
                            </div>

                            {/* Sustrato */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className={labelBase}>Sustrato</label>
                                    <select
                                        value={formData.careGuide.substrate}
                                        onChange={(e) => handleCareLevelChange('substrate', 'substrateLabel', e.target.value, getSubstratePreset)}
                                        className={inputBase}
                                    >
                                        <option value="">Sin definir</option>
                                        {SUBSTRATE_PRESETS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelBase}>Texto (opcional)</label>
                                    <input type="text" value={formData.careGuide.substrateLabel} onChange={(e) => handleCareGuideChange('substrateLabel', e.target.value)} className={inputBase} placeholder="Personalizar texto" />
                                </div>
                            </div>

                            {/* Dificultad */}
                            <div>
                                <label className={labelBase}>Dificultad de Cuido</label>
                                <select
                                    value={formData.careGuide.difficulty}
                                    onChange={(e) => handleCareGuideChange('difficulty', e.target.value)}
                                    className={inputBase}
                                >
                                    <option value="">Sin definir</option>
                                    {DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </select>
                            </div>

                        {/* Preview en vivo */}
                        <div>
                            <label className={labelBase}>Vista Previa</label>
                            <CareGuideFull careGuide={formData.careGuide} />
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════
                    PESTAÑA: PRECIO
                ═══════════════════════════════════ */}
                {activeTab === 'precio' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

                            {/* Switch Múltiples Presentaciones */}
                            <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-200/50 dark:border-emerald-500/10">
                                <div className="flex items-center gap-2.5">
                                    <Layers className={`w-4 h-4 transition-colors ${formData.hasPresentations ? 'text-bioflora-verde' : 'text-gray-300 dark:text-gray-600'}`} />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block leading-tight">Múltiples presentaciones</span>
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">Diferentes tamaños de maceta o bolsa con precios independientes.</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input type="checkbox" name="hasPresentations" checked={formData.hasPresentations || false} onChange={(e) => {
                                        setFormData(prev => {
                                            const isChecked = e.target.checked;
                                            let newPresentaciones = prev.presentaciones;
                                            const firstPres = prev.presentaciones.length > 0 ? prev.presentaciones[0] : null;

                                            if (isChecked) {
                                                if (prev.presentaciones.length === 0) {
                                                    newPresentaciones = [{ 
                                                        id: Date.now().toString(), 
                                                        label: prev.ml || '', 
                                                        price: prev.price || '', 
                                                        quantity: prev.quantity || 0, 
                                                        stock: prev.stock || 'Disponible' 
                                                    }];
                                                } else {
                                                    newPresentaciones = prev.presentaciones.map((p, idx) => idx === 0 ? {
                                                        ...p,
                                                        price: prev.price !== undefined && prev.price !== '' ? prev.price : p.price,
                                                        quantity: prev.quantity !== undefined && prev.quantity !== 0 ? prev.quantity : p.quantity,
                                                        stock: prev.stock || p.stock,
                                                        label: p.label || prev.ml || ''
                                                    } : p);
                                                }
                                            }

                                            return {
                                                ...prev,
                                                hasPresentations: isChecked,
                                                presentaciones: newPresentaciones,
                                                // Si desactivamos, recuperamos el precio, stock y maceta de la primera variante a la raíz
                                                price: isChecked ? prev.price : (firstPres ? firstPres.price : prev.price),
                                                quantity: isChecked ? prev.quantity : (firstPres ? firstPres.quantity : prev.quantity),
                                                stock: isChecked ? prev.stock : (firstPres ? firstPres.stock : prev.stock),
                                                ml: isChecked ? prev.ml : (firstPres ? firstPres.label : prev.ml)
                                            };
                                        });
                                    }} className="sr-only peer" />
                                    <div className="w-10 h-[22px] bg-gray-200 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-sm peer-checked:bg-bioflora-verde" />
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
                                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Maceta / Bolsa *</label>
                                                            <input
                                                                required
                                                                type="text"
                                                                value={pres.label}
                                                                onChange={(e) => updatePresentation(index, 'label', e.target.value)}
                                                                className={`${inputBase} !py-2 !text-xs`}
                                                                placeholder='Maceta 6", Bolsa 2L'
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

                                    {/* Tamaño Maceta / Bolsa */}
                                    <div>
                                        <label className={labelBase}>Tamaño de Maceta o Bolsa</label>
                                        <div className="relative">
                                            <input type="text" name="ml" value={formData.ml} onChange={handleChange} className={inputBase} placeholder='Ej. Maceta 6"' />
                                        </div>
                                    </div>
                                </div>
                            )}
                    </motion.div>
                )}

                {/* ═══════════════════════════════════
                    PESTAÑA: IMÁGENES
                ═══════════════════════════════════ */}
                {activeTab === 'imagenes' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {/* Portada */}
                            <div>
                                <label className={labelBase}>Portada Principal *</label>
                                <p className="text-[11px] text-bioflora-verde mb-3 -mt-0.5 font-sans font-semibold">Se muestra en el catálogo y resultados de búsqueda de la tienda.</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {coverPreview
                                            ? <img src={coverPreview} alt="Portada" className="w-full h-full object-contain" />
                                            : <ImagePlus className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <label className="inline-flex items-center gap-2 cursor-pointer bg-bioflora-verde hover:bg-bioflora-verde/80 text-white text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-colors shadow-sm">
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
                    </motion.div>
                )}

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
                            className="bg-bioflora-fucsia text-white px-6 py-2.5 text-sm rounded-lg font-medium hover:bg-bioflora-fucsia/80 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-bioflora-fucsia/20"
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
