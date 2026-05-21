export default function MovementFilters({ activeType, onTypeChange, products, activeProduct, onProductChange }) {
    const typeFilters = [
        { value: null, label: 'Todos' },
        { value: 'entrada', label: 'Entradas', color: 'emerald' },
        { value: 'salida', label: 'Salidas', color: 'red' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            {/* Type filters */}
            <div className="flex gap-1.5 bg-gray-100 dark:bg-[#1A1A1B] rounded-lg p-1 border border-gray-200 dark:border-white/5">
                {typeFilters.map(f => (
                    <button
                        key={f.value ?? 'all'}
                        onClick={() => onTypeChange(f.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            activeType === f.value
                                ? f.value === 'entrada'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : f.value === 'salida'
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-[#1e1e20] text-gray-800 dark:text-gray-200 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Product filter */}
            <select
                value={activeProduct || ''}
                onChange={e => onProductChange(e.target.value || null)}
                className="px-3 py-2 rounded-lg text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1B] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 transition min-w-[180px]"
            >
                <option value="">Todos los productos</option>
                {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>
    );
}
