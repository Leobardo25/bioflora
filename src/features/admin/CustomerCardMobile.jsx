import { Edit2, Mail, Trash2 } from 'lucide-react';
import { IoLogoWhatsapp } from 'react-icons/io';
import CustomerTagDropdown from './CustomerTagDropdown';

const buildWaMessage = (customer) => 
    encodeURIComponent(`Hola ${customer.nombre}, le contactamos desde Caribbean Botanical Garden. 😊`);

export default function CustomerCardMobile({ customer, onEdit, onDelete, onStatusUpdated, allTags }) {
    const waPhone = customer.telefono?.replace(/\D/g, '');
    const date = customer.createdAt?.toDate?.()?.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) ?? '—';

    return (
        <div className="bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{customer.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registrado: {date}</p>
                    </div>
                    <CustomerTagDropdown 
                        customer={customer} 
                        onUpdated={(tags) => onStatusUpdated(customer.id, tags)} 
                        allTags={allTags}
                    />
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Pedidos</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{customer.totalOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total Gastado</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {customer.totalSpentCrc ? `₡${customer.totalSpentCrc.toLocaleString()}` : '₡0'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1A1A1B] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {waPhone && (
                        <a 
                            href={`https://wa.me/506${waPhone}?text=${buildWaMessage(customer)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
                        >
                            <IoLogoWhatsapp className="w-4 h-4" />
                        </a>
                    )}
                    {customer.correo && (
                        <a 
                            href={`mailto:${customer.correo}`}
                            className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                        </a>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(customer)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(customer)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
