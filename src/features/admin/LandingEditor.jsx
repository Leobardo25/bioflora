import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSiteConfig, updateSiteConfig } from '../../services/siteConfigService';
import { DEFAULT_POLICIES } from '../../pages/PolicyPage';
import { toast } from 'react-toastify';
import { Save, Clapperboard, FlaskConical, Sparkles, ExternalLink, Phone, Share2, Tag, AlertTriangle, HelpCircle, Plus, Trash2, ChevronDown, Shield } from 'lucide-react';

const Field = ({ label, name, value, onChange, multiline = false, placeholder }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            {label}
        </label>
        {multiline ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={2}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1A1A1B] focus:bg-white dark:focus:bg-[#1e1e20] focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40 focus:border-[#00A94F]/60 transition resize-none overflow-hidden"
            />
        ) : (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1A1A1B] focus:bg-white dark:focus:bg-[#1e1e20] focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40 focus:border-[#00A94F]/60 transition"
            />
        )}
    </div>
);

function SectionCard({ icon: Icon, title, accent, children }) {
    return (
        <div className="bg-white dark:bg-[#1e1e20] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5"
                style={{ borderLeftWidth: '3px', borderLeftColor: accent }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}18` }}>
                    <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <h2 className="text-sm font-bold tracking-wide" style={{ color: accent }}>
                    {title}
                </h2>
            </div>
            <div className="p-5 space-y-4">
                {children}
            </div>
        </div>
    );
}

const LANDING_DEFAULTS = {
    heroTitle: 'Exóticas Colecciones Botánicas',
    heroSubtitle: '',
    stat1Value: '150+', stat1Label: 'Especies',
    stat2Value: '1K+', stat2Label: 'Coleccionistas',
    stat3Value: '5+',  stat3Label: 'Años de Cultivo',
    collectionTitle: 'Especies Selectas',
    collectionText: 'Explore las orquídeas y plantas exóticas más exclusivas de nuestra colección, cultivadas con paciencia y rigor técnico.',
    missionTitle: 'Misión', missionText: 'Bioflora, es una empresa agro-turística innovadora la cual contribuye con la conservación del medio ambiente mediante la bio-alfabetización de nuestros visitantes y utilizando agro-tecnologías sostenibles.',
    visionTitle: 'Visión', visionText: 'Bioflora, será un empresa agro-turística líder en Costa Rica que promoverá mediante la bio-alfabetización y la recreación sana, contribuir a la conservación del medio ambiente, mitigar el cambio climático, preservar y reproducir especies de plantas tropicales en riesgo de extinción, especialmente orquídeas. Creando actividades productivas que fomenten un trabajo justo y solidarias el cual contribuya al crecimiento personal de nuestros colaboradores y el retorno del capital a sus accionistas.',
};

const DEFAULT_FAQ_ITEMS = [
    { question: '¿Cómo garantizan el traslado seguro de las plantas exóticas?', answer: 'En Bioflora, empaquetamos cada ejemplar de forma meticulosa utilizando soportes térmicos e hidratación controlada para proteger sus raíces y hojas. Realizamos los envíos de lunes a miércoles para evitar que los seres vivos queden retenidos durante el fin de semana.' },
    { question: '¿Hacen envíos a todo Costa Rica?', answer: '¡Sí! Realizamos envíos express y seguros a todo el territorio nacional mediante Correos de Costa Rica y servicios de transporte especial para plantas de colección grandes.' },
    { question: '¿Ofrecen asesoramiento para el cuidado de orquídeas y plantas exóticas?', answer: '¡Por supuesto! Su experiencia no termina con la compra. Le ofrecemos asesoramiento botánico post-venta continuo a través de WhatsApp para guiarle en el riego, iluminación, control de plagas y sustrato adecuado de su planta.' },
];

const GLOBAL_DEFAULTS = {
    whatsapp: '', instagram: '', facebook: '', tiktok: '',
    brandName: 'Bioflora', brandTagline: 'Vivero Boutique & Especies Exóticas',
};

const LANDING_KEYS = new Set(Object.keys(LANDING_DEFAULTS));

function SectionDivider({ title }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 whitespace-nowrap">
                {title}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>
    );
}

function UnsavedDialog({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white dark:bg-[#1e1e20] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">Cambios sin guardar</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Si sales ahora perderás los cambios.</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-5">
                    <button onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                        Quedarse
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition">
                        Salir sin guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

function FaqItemEditor({ item, idx, onUpdate, onDelete }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-xl border transition-all duration-300 ${open ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' : 'bg-gray-50 dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10'}`}>
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setOpen(!open)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex-shrink-0">
                        {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {item.question || 'Pregunta sin título...'}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 dark:text-gray-500 hover:text-red-500 transition-colors"
                        title="Eliminar pregunta"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-amber-100 dark:border-amber-500/20">
                    <div className="pt-3">
                        <Field
                            label="Pregunta"
                            name={`faq_q_${idx}`}
                            value={item.question}
                            onChange={(e) => onUpdate('question', e.target.value)}
                            placeholder="Ej: ¿Cómo cuido mi orquídea de colección?"
                        />
                    </div>
                    <Field
                        label="Respuesta"
                        name={`faq_a_${idx}`}
                        value={item.answer}
                        onChange={(e) => onUpdate('answer', e.target.value)}
                        multiline
                        placeholder="Escribe la respuesta completa..."
                    />
                </div>
            )}
        </div>
    );
}

function PolicyItemEditor({ policyKey, label, policy, onUpdate }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-xl border transition-all duration-300 ${open ? 'bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' : 'bg-gray-50 dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10'}`}>
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setOpen(!open)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-red-100 dark:border-red-500/20">
                    <div className="pt-3">
                        <Field
                            label="Título de la Página"
                            name={`policy_title_${policyKey}`}
                            value={policy.title}
                            onChange={(e) => onUpdate('title', e.target.value)}
                            placeholder={`Ej: ${label}`}
                        />
                    </div>
                    <Field
                        label="Contenido (Formato Markdown Simple: **negrita**, - lista, 1. lista numerada)"
                        name={`policy_content_${policyKey}`}
                        value={policy.content}
                        onChange={(e) => onUpdate('content', e.target.value)}
                        multiline
                        placeholder="Escribe el contenido de la política..."
                    />
                </div>
            )}
        </div>
    );
}

export default function LandingEditor() {
    const [form, setForm] = useState({ ...LANDING_DEFAULTS, ...GLOBAL_DEFAULTS });
    const [faqItems, setFaqItems] = useState([]);
    const [faqLoaded, setFaqLoaded] = useState(false);
    const [policies, setPolicies] = useState(DEFAULT_POLICIES);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const savedRef = useRef({ ...LANDING_DEFAULTS, ...GLOBAL_DEFAULTS });
    const savedFaqRef = useRef([]);
    const savedPoliciesRef = useRef({});
    
    const isFaqDirty = useMemo(() => JSON.stringify(faqItems) !== JSON.stringify(savedFaqRef.current), [faqItems]);
    const isPoliciesDirty = useMemo(() => JSON.stringify(policies) !== JSON.stringify(savedPoliciesRef.current), [policies]);
    const isFormDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedRef.current), [form]);
    const isDirty = isFormDirty || isFaqDirty || isPoliciesDirty;
    const [blockedHref, setBlockedHref] = useState(null);
    const isDirtyRef = useRef(isDirty);
    const navigate = useNavigate();

    useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor || !isDirtyRef.current) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('http') || href === '/' || href.startsWith('mailto')) return;
            e.preventDefault();
            e.stopPropagation();
            setBlockedHref(href);
        };
        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    useEffect(() => {
        Promise.all([
            getSiteConfig('landing'),
            getSiteConfig('global'),
            getSiteConfig('faq'),
            getSiteConfig('policies'),
        ]).then(([landing, global, faq, pol]) => {
            const loaded = { ...LANDING_DEFAULTS, ...GLOBAL_DEFAULTS, ...(landing || {}), ...(global || {}) };
            setForm(loaded);
            savedRef.current = loaded;
            const loadedFaq = faq?.items?.length > 0 ? faq.items : DEFAULT_FAQ_ITEMS;
            setFaqItems(loadedFaq);
            savedFaqRef.current = JSON.parse(JSON.stringify(loadedFaq));
            setFaqLoaded(true);
            if (pol) {
                const merged = { ...DEFAULT_POLICIES };
                ['refunds', 'shipping', 'privacy', 'terms'].forEach(k => {
                    if (pol[k]) merged[k] = pol[k];
                });
                setPolicies(merged);
                savedPoliciesRef.current = JSON.parse(JSON.stringify(merged));
            } else {
                setPolicies(DEFAULT_POLICIES);
                savedPoliciesRef.current = JSON.parse(JSON.stringify(DEFAULT_POLICIES));
            }
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const landingData = {};
            const globalData  = {};
            Object.entries(form).forEach(([k, v]) => {
                if (LANDING_KEYS.has(k)) landingData[k] = v;
                else globalData[k] = v;
            });
            await Promise.all([
                updateSiteConfig('landing', landingData),
                updateSiteConfig('global',  globalData),
                updateSiteConfig('faq', { items: faqItems }),
                updateSiteConfig('policies', policies),
            ]);
            savedRef.current = { ...form };
            savedFaqRef.current = JSON.parse(JSON.stringify(faqItems));
            savedPoliciesRef.current = JSON.parse(JSON.stringify(policies));
            toast.success('Configuración guardada');
        } catch (e) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#00A94F] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="pb-24">
            {blockedHref && (
                <UnsavedDialog
                    onConfirm={() => { setBlockedHref(null); navigate(blockedHref); }}
                    onCancel={() => setBlockedHref(null)}
                />
            )}
            {/* Header */}
            <header className="mb-7 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Configuración de Página</h1>
                    <p className="text-gray-400 mt-1 text-sm">Contenido, contacto y redes sociales de la tienda.</p>
                </div>
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 border border-gray-200 dark:border-white/10 px-3 py-2 rounded-xl hover:border-[#00A94F]/50 hover:text-[#00A94F] transition-colors flex-shrink-0"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver página
                </a>
            </header>

            {/* Grid de secciones */}
            <div className="space-y-4">

                {/* Fila 1: Marca + Contacto */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard icon={Tag} title="Marca" accent="#00A94F">
                        <Field label="Nombre de la tienda" name="brandName" value={form.brandName} onChange={handleChange} placeholder="Bioflora" />
                        <Field label="Tagline" name="brandTagline" value={form.brandTagline} onChange={handleChange} placeholder="Vivero Boutique" />
                    </SectionCard>

                    <SectionCard icon={Phone} title="Contacto" accent="#0ea5e9">
                        <Field label="WhatsApp (solo dígitos con código de país)" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="50688888888" />
                    </SectionCard>
                </div>

                {/* Fila 2: Redes Sociales — ancho completo */}
                <SectionCard icon={Share2} title="Redes Sociales" accent="#ec4899">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Instagram (URL)" name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/tutienda" />
                        <Field label="Facebook (URL)" name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/tutienda" />
                        <Field label="TikTok (URL)" name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@tutienda" />
                    </div>
                </SectionCard>

                <SectionDivider title="Contenido de Landing" />

                {/* Fila 3: Hero + Estadísticas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard icon={Clapperboard} title="Hero" accent="#8b5cf6">
                        <Field label="Título principal" name="heroTitle" value={form.heroTitle} onChange={handleChange} placeholder="El Esplendor del Trópico en su Hogar" />
                        <Field label="Subtítulo" name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} multiline placeholder="Descubra orquídeas exóticas y flores tropicales..." />
                    </SectionCard>

                    <SectionCard icon={FlaskConical} title="Colección Selecta" accent="#6366f1">
                        <Field
                            label="Título de la sección"
                            name="collectionTitle"
                            value={form.collectionTitle}
                            onChange={handleChange}
                            placeholder="Nuestras Botellas"
                        />
                        <p className="text-[10px] text-gray-400">
                            La última palabra aparecerá en itálica bronce en la landing.
                        </p>
                        <Field
                            label="Texto descriptivo"
                            name="collectionText"
                            value={form.collectionText}
                            onChange={handleChange}
                            multiline
                            placeholder="Explore las especies botánicas más exclusivas..."
                        />
                    </SectionCard>
                </div>

                {/* Fila 4: Misión y Visión — ancho completo */}
                <SectionCard icon={Sparkles} title="Misión y Visión" accent="#10b981">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Misión */}
                        <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Sección 1</div>
                            <Field label="Título" name="missionTitle" value={form.missionTitle} onChange={handleChange} placeholder="Misión" />
                            <Field label="Texto descriptivo" name="missionText" value={form.missionText} onChange={handleChange} multiline placeholder="Escribe la misión de la empresa..." />
                        </div>
                        {/* Visión */}
                        <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Sección 2</div>
                            <Field label="Título" name="visionTitle" value={form.visionTitle} onChange={handleChange} placeholder="Visión" />
                            <Field label="Texto descriptivo" name="visionText" value={form.visionText} onChange={handleChange} multiline placeholder="Escribe la visión de la empresa..." />
                        </div>
                    </div>
                </SectionCard>

                <SectionDivider title="Preguntas Frecuentes (FAQ)" />

                {/* Fila 5: FAQ Editor */}
                <SectionCard icon={HelpCircle} title="Preguntas Frecuentes" accent="#f59e0b">
                    <p className="text-xs text-gray-400 mb-3">
                        Estas preguntas aparecen en la sección FAQ de la landing page. Si no agregas ninguna,
                        se mostrarán las preguntas por defecto.
                    </p>
                    <div className="space-y-3">
                        {faqItems.map((item, idx) => (
                            <FaqItemEditor
                                key={idx}
                                item={item}
                                idx={idx}
                                onUpdate={(field, value) => {
                                    const updated = [...faqItems];
                                    updated[idx] = { ...updated[idx], [field]: value };
                                    setFaqItems(updated);
                                }}
                                onDelete={() => setFaqItems(prev => prev.filter((_, i) => i !== idx))}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => setFaqItems(prev => [...prev, { question: '', answer: '' }])}
                        className="mt-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-2.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition w-full justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Pregunta
                    </button>
                </SectionCard>

                <SectionDivider title="Políticas de Tienda" />

                {/* Fila 6: Políticas Editor */}
                <SectionCard icon={Shield} title="Políticas de Tienda" accent="#ef4444">
                    <p className="text-xs text-gray-400 mb-3">
                        Estas políticas aparecen como páginas individuales accesibles desde el footer.
                    </p>
                    <div className="space-y-3">
                        {[{key:'refunds',label:'Reembolsos'},{key:'shipping',label:'Envíos'},{key:'privacy',label:'Privacidad'},{key:'terms',label:'Términos'}].map(p => (
                            <PolicyItemEditor
                                key={p.key}
                                policyKey={p.key}
                                label={p.label}
                                policy={policies[p.key]}
                                onUpdate={(field, value) => setPolicies(prev => ({
                                    ...prev,
                                    [p.key]: { ...prev[p.key], [field]: value }
                                }))}
                            />
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Botón sticky flotante */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-end px-4 sm:px-6 lg:px-8 py-4 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3">
                    {isDirty && !saving && (
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-[#1A1A1B] border border-amber-200 dark:border-amber-500/30 px-3 py-1.5 rounded-xl">
                            Cambios sin guardar
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-xl transition disabled:opacity-40"
                        style={{ backgroundColor: '#00A94F' }}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
