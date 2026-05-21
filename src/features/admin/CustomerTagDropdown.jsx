import { useState, useRef, useEffect } from 'react';
import { updateCustomerMetadata } from '../../services/customerService';
import { toast } from 'react-toastify';
import { getTagStyle } from './tagUtils';

export default function CustomerTagDropdown({ customer, onUpdated, allTags = [] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    const [newTagText, setNewTagText] = useState('');

    // Asumimos que el cliente tiene solo 1 etiqueta principal para la tabla rápida
    const currentTag = (customer.tags && customer.tags.length > 0) ? customer.tags[0] : 'Sin etiqueta';
    const activeTagDef = getTagStyle(currentTag);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = async (newTag) => {
        if (newTag === currentTag) { setOpen(false); return; }
        
        setLoading(true);
        setOpen(false);
        try {
            // Reemplazamos la etiqueta por la nueva (o vacío si es "Sin etiqueta")
            const newTagsArray = newTag === 'Sin etiqueta' ? [] : [newTag];
            
            // Actualizamos en la base de datos
            await updateCustomerMetadata(customer.id, { tags: newTagsArray });
            
            // Actualizamos localmente
            onUpdated(newTagsArray);
            toast.success('Etiqueta actualizada');
        } catch {
            toast.error('Error al actualizar la etiqueta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); setNewTagText(''); }}
                disabled={loading}
                className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold tracking-wide uppercase transition-opacity hover:opacity-75 ${activeTagDef.bg} ${activeTagDef.text} ${activeTagDef.border}`}
            >
                {currentTag}
            </button>

            {open && (
                <div className="absolute right-0 top-8 z-30 bg-white dark:bg-[#252528] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg py-1 min-w-[200px]">
                    <div className="max-h-48 overflow-y-auto scrollbar-admin">
                        {allTags.map(tagVal => {
                            const style = getTagStyle(tagVal);
                            return (
                                <button
                                    key={tagVal}
                                    onClick={(e) => { e.stopPropagation(); handleSelect(tagVal); }}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 font-semibold"
                                >
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                                    <span className={tagVal === currentTag ? 'text-bioflora-verde font-bold' : ''}>{tagVal}</span>
                                    {tagVal === currentTag && <span className="ml-auto text-bioflora-verde text-[10px]">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-white/5 mt-1">
                        <input
                            type="text"
                            placeholder="+ Etiqueta personalizada"
                            value={newTagText}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setNewTagText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newTagText.trim()) {
                                    e.preventDefault();
                                    handleSelect(newTagText.trim());
                                }
                            }}
                            className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-white/10 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A1A1B] focus:outline-none focus:border-bioflora-verde focus:ring-1 focus:ring-bioflora-verde"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
