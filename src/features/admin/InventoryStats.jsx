import { Package, CheckCircle, AlertCircle, Archive } from 'lucide-react';

const STATS = [
    { label: 'Total',      key: null,                icon: Package,       bg: 'bg-bioflora-verde/10 dark:bg-bioflora-verde/20',   text: 'text-bioflora-verde',  ring: 'ring-bioflora-verde/30'  },
    { label: 'Disponible', key: 'Disponible',         icon: CheckCircle,  bg: 'bg-emerald-50 dark:bg-emerald-500/15',  text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-500/30' },
    { label: 'Agotado',    key: 'Agotado',            icon: AlertCircle,  bg: 'bg-amber-50 dark:bg-amber-500/15',    text: 'text-amber-600 dark:text-amber-400',   ring: 'ring-amber-200 dark:ring-amber-500/30'   },
    { label: 'Retirado',   key: 'Bóveda (Retirado)',  icon: Archive,      bg: 'bg-gray-100 dark:bg-gray-500/15',    text: 'text-gray-500 dark:text-gray-400',    ring: 'ring-gray-200 dark:ring-gray-500/30'    },
];

export default function InventoryStats({ products, activeFilter, onFilterChange }) {
    const counts = {
        null:               products.length,
        'Disponible':       products.filter(p => p.stock === 'Disponible').length,
        'Agotado':          products.filter(p => p.stock === 'Agotado').length,
        'Bóveda (Retirado)': products.filter(p => p.stock === 'Bóveda (Retirado)').length,
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {STATS.map(({ label, key, icon: Icon, bg, text, ring }) => (
                <button
                    key={label}
                    onClick={() => onFilterChange(key)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        activeFilter === key
                            ? `border-transparent ring-2 ${ring} ${bg}`
                            : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#1e1e20] hover:border-gray-300 dark:hover:border-white/10'
                    }`}
                >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-5 h-5 ${text}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">{counts[key]}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
