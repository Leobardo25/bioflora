import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { updateProductField } from '../../services/productService';
import { toast } from 'react-toastify';

export default function QuantityControl({ productId, quantity, onUpdated }) {
    const [value, setValue] = useState(quantity ?? 0);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const save = async (newVal) => {
        const n = Math.max(0, Number(newVal) || 0);
        setValue(n);
        setSaving(true);
        try {
            await updateProductField(productId, 'quantity', n);
            onUpdated(n);
        } catch {
            toast.error('Error actualizando cantidad');
            setValue(quantity);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => save(value - 1)}
                disabled={value <= 0 || saving}
                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 transition-colors"
            >
                <Minus className="w-3 h-3" />
            </button>

            {editing ? (
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onBlur={() => { save(value); setEditing(false); }}
                    onKeyDown={e => { if (e.key === 'Enter') { save(value); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
                    className="w-10 text-center text-xs border border-bioflora-verde/40 dark:border-bioflora-verde/40 rounded px-1 py-0.5 bg-white dark:bg-[#1A1A1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-bioflora-verde/50"
                    autoFocus
                />
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    title="Clic para editar"
                    className={`w-10 text-center text-xs font-semibold rounded px-1 py-0.5 transition-colors hover:bg-bioflora-verde/10 dark:hover:bg-bioflora-verde/20 hover:text-bioflora-verde ${
                        value === 0 ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5'
                    }`}
                >
                    {value}
                </button>
            )}

            <button
                onClick={() => save(value + 1)}
                disabled={saving}
                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
            >
                <Plus className="w-3 h-3" />
            </button>
        </div>
    );
}
