import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '../../services/siteConfigService';
import { toast } from 'react-toastify';
import { Save } from 'lucide-react';

const Field = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1A1A1B] focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 focus:border-transparent transition"
        />
    </div>
);

export default function SiteConfig() {
    const [form, setForm] = useState({
        whatsapp: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        brandName: '',
        brandTagline: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getSiteConfig('global').then(data => {
            if (data) setForm(prev => ({ ...prev, ...data }));
            setLoading(false);
        });
    }, []);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteConfig('global', form);
            toast.success('Configuración guardada');
        } catch (e) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-bioflora-verde border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Configuración Global</h1>
                <p className="text-gray-500 mt-1 text-sm">WhatsApp, redes sociales y datos de la marca.</p>
            </header>

            <div className="bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm p-6 space-y-6 max-w-2xl">
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Contacto</h2>
                    <Field label="Número WhatsApp (solo dígitos, con código de país)" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="50688888888" />
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Redes Sociales</h2>
                    <div className="space-y-4">
                        <Field label="Instagram (URL completa)" name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/tutienda" />
                        <Field label="Facebook (URL completa)" name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/tutienda" />
                        <Field label="TikTok (URL completa)" name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@tutienda" />
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Marca</h2>
                    <div className="space-y-4">
                        <Field label="Nombre de la tienda" name="brandName" value={form.brandName} onChange={handleChange} placeholder="Bioflora" />
                        <Field label="Tagline" name="brandTagline" value={form.brandTagline} onChange={handleChange} placeholder="Vivero Boutique & Especies Exóticas" />
                    </div>
                </section>

                <div className="flex justify-end pt-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-bioflora-verde text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-bioflora-verde/90 transition disabled:opacity-50">
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
