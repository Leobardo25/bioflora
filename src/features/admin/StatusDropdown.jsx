import { useState, useRef, useEffect } from 'react';
import { updateProductField } from '../../services/productService';
import { toast } from 'react-toastify';

const STATUSES = ['Disponible', 'Agotado', 'Bóveda (Retirado)'];

const DOT = { 'Disponible': 'bg-emerald-500', 'Agotado': 'bg-amber-500', 'Bóveda (Retirado)': 'bg-gray-400' };
const BADGE = { 'Disponible': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', 'Agotado': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', 'Bóveda (Retirado)': 'bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400' };
const shortLabel = s => s === 'Bóveda (Retirado)' ? 'Retirado' : s;

export default function StatusDropdown({ productId, currentStatus, onUpdated, onOpenChange }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (onOpenChange) onOpenChange(open);
    }, [open, onOpenChange]);

    const handleSelect = async (status) => {
        if (status === currentStatus) { setOpen(false); return; }
        setLoading(true);
        setOpen(false);
        try {
            await updateProductField(productId, 'stock', status);
            onUpdated(status);
            toast.success('Estado actualizado');
        } catch {
            toast.error('Error al actualizar estado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                disabled={loading}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-75 ${BADGE[currentStatus] || 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}
            >
                {shortLabel(currentStatus)}
            </button>

            {open && (
                <div className="absolute left-0 top-8 z-30 bg-white dark:bg-[#252528] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg py-1 min-w-[140px]">
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => handleSelect(s)}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300"
                        >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[s]}`} />
                            <span className={s === currentStatus ? 'font-semibold text-bioflora-verde' : ''}>{shortLabel(s)}</span>
                            {s === currentStatus && <span className="ml-auto text-bioflora-verde text-[10px]">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
