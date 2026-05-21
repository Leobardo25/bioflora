const FILTERS = [
    { label: 'Todos',      value: null },
    { label: 'Nuevo',      value: 'nuevo' },
    { label: 'En proceso', value: 'en proceso' },
    { label: 'Entregado',  value: 'entregado' },
    { label: 'Cancelado',  value: 'cancelado' },
];

const DOT_COLOR = {
    nuevo:        'bg-blue-400',
    'en proceso': 'bg-amber-400',
    entregado:    'bg-emerald-400',
    cancelado:    'bg-red-400',
};

export default function OrderFilters({ orders, activeFilter, onFilterChange }) {
    const count = (value) => value === null
        ? orders.length
        : orders.filter(o => o.status === value).length;

    return (
        <div className="flex flex-wrap gap-2 mb-5">
            {FILTERS.map(({ label, value }) => {
                const isActive = activeFilter === value;
                const n = count(value);
                return (
                    <button
                        key={label}
                        onClick={() => onFilterChange(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            isActive
                                ? 'bg-bioflora-verde text-white shadow-sm'
                                : 'bg-white dark:bg-[#1e1e20] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-bioflora-verde/40 hover:text-bioflora-verde'
                        }`}
                    >
                        {value && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : DOT_COLOR[value]}`} />}
                        {label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                        }`}>
                            {n}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
