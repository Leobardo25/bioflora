import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, User, Phone, Mail, ShoppingBag, X, Check, FileText } from 'lucide-react';
import { IoLogoWhatsapp } from 'react-icons/io';
import { toast } from 'react-toastify';
import { getCustomers, updateCustomerMetadata, hideCustomer } from '../../services/customerService';
import CustomerTagDropdown from './CustomerTagDropdown';
import CustomerCardMobile from './CustomerCardMobile';
import CustomerFilters from './CustomerFilters';
import { getAllSystemTags, getTagStyle } from './tagUtils';


export default function CustomersList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTagFilter, setActiveTagFilter] = useState('');
    
    // Editor State
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', tags: [] });
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            toast.error('Error cargando los clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const allTags = getAllSystemTags(customers);

    const filteredCustomers = customers.filter(c => {
        const q = searchTerm.toLowerCase();
        const tagMatch = !activeTagFilter || c.tags?.includes(activeTagFilter);
        const searchMatch = !q || String(c.name).toLowerCase().includes(q) || String(c.phone).includes(q);
        return tagMatch && searchMatch;
    });

    const openCreate = () => {
        setEditingCustomer(null);
        setForm({ name: '', phone: '', email: '', notes: '', tags: [] });
        setSidebarVisible(true);
    };

    const openEdit = (customer) => {
        setEditingCustomer(customer);
        setForm({
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            notes: customer.notes || '',
            tags: customer.tags || []
        });
        setSidebarVisible(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        let targetId = editingCustomer?.id;
        
        // Al crear manual, el teléfono es vital como ID (o email)
        if (!targetId) {
            const cleanPhone = form.phone ? form.phone.replace(/\D/g, '') : null;
            const cleanEmail = form.email ? form.email.toLowerCase() : null;
            if (!cleanPhone && !cleanEmail) {
                toast.error('Debes proporcionar un teléfono o correo válido');
                return;
            }
            targetId = cleanPhone || cleanEmail;
        }

        setSaving(true);
        try {
            await updateCustomerMetadata(targetId, form);
            toast.success(editingCustomer ? 'Cliente actualizado' : 'Cliente registrado');
            setSidebarVisible(false);
            await loadData();
        } catch (error) {
            toast.error('Error al guardar el cliente');
        } finally {
            setSaving(false);
        }
    };

    const updateLocalTags = (customerId, newTags) => {
        setCustomers(prev => prev.map(c => 
            c.id === customerId ? { ...c, tags: newTags } : c
        ));
    };

    const toggleTag = (tagVal) => {
        setForm(prev => {
            const exists = prev.tags.includes(tagVal);
            return {
                ...prev,
                tags: exists ? prev.tags.filter(t => t !== tagVal) : [...prev.tags, tagVal]
            }
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await hideCustomer(deleteTarget.id);
            toast.success('Cliente eliminado del CRM');
            setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
        } catch (error) {
            toast.error('Error al intentar eliminar');
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="relative">
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Clientes CRM</h1>
                    <p className="text-gray-500 mt-1 text-sm">Gestiona prospectos, clientes e historial de actividad.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-bioflora-verde text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-bioflora-verde/90 transition-colors self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Cliente
                </button>
            </header>

            <div className="mb-6 space-y-4">
                <div className="relative max-w-sm w-full mx-auto sm:mx-0">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1A1A1B] focus:outline-none focus:ring-2 focus:ring-bioflora-verde/50 transition"
                    />
                </div>
                <CustomerFilters customers={customers} allTags={allTags} activeFilter={activeTagFilter} onFilterChange={setActiveTagFilter} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-bioflora-verde border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron clientes.</p>
                    {searchTerm 
                        ? <button onClick={() => setSearchTerm('')} className="mt-3 text-bioflora-verde hover:underline text-sm">Limpiar búsqueda</button>
                        : <button onClick={openCreate} className="mt-4 text-bioflora-verde hover:underline text-sm font-medium">Añadir cliente manual</button>
                    }
                </div>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="block md:hidden space-y-3">
                        {filteredCustomers.map(c => (
                            <CustomerCardMobile 
                                key={c.id} 
                                customer={c} 
                                onEdit={() => openEdit(c)} 
                                onDelete={() => setDeleteTarget(c)} 
                                onStatusUpdated={(id, newTags) => updateLocalTags(id, newTags)}
                                allTags={allTags}
                            />
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="w-full overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-white/5">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 rounded-tl-xl text-left">Cliente</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-left">Contacto</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Pedidos</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-left">Gasto Total</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-left">Última Compra</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right rounded-tr-xl mt-1">Etiquetas / Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredCustomers.map(c => {
                                    const waPhone = c.phone ? String(c.phone).replace(/\D/g, '') : null;
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-5 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-bioflora-verde/10 dark:bg-bioflora-verde/20 text-bioflora-verde rounded-xl flex items-center justify-center font-bold font-serif shadow-sm border border-bioflora-verde/20">
                                                        {c.name && c.name !== 'Desconocido' ? c.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{c.name}</span>
                                                        {c.email && <span className="text-xs text-gray-400 line-clamp-1">{c.email}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    {waPhone ? (
                                                        <a
                                                            href={`https://wa.me/506${waPhone}?text=Hola ${c.name}, le contactamos de Caribbean Botanical Garden.`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3 py-1.5 rounded-lg transition-colors font-medium text-[11px]"
                                                            title={`Contactar a ${c.phone}`}
                                                        >
                                                            <IoLogoWhatsapp className="w-3.5 h-3.5" />
                                                            Contactar
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">Sin teléfono</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    {c.totalOrders || 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                    {c.ltvRaw > 0 ? `₡${c.ltvRaw.toLocaleString('es-CR')}` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <span className="text-xs font-medium text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 flex items-center gap-1.5 border border-gray-100 dark:border-transparent rounded-md w-fit">
                                                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                                                    {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 text-right">
                                                <div className="flex flex-col items-end gap-3">
                                                    <CustomerTagDropdown 
                                                        customer={c} 
                                                        onUpdated={(newTags) => updateLocalTags(c.id, newTags)} 
                                                        allTags={allTags}
                                                    />
                                                    <div className="flex items-center justify-end gap-1 transition-opacity">
                                                        <button onClick={() => openEdit(c)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-bioflora-verde hover:bg-bioflora-verde/10 rounded-lg transition-colors" title="Editar">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteTarget(c)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </>
            )}

            {/* Sidebar Overlay */}
            {sidebarVisible && (
                <div className="fixed inset-0 z-40 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSidebarVisible(false)} />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-white dark:bg-[#1A1A1B] shadow-2xl border-l border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {editingCustomer ? 'Detalle de Cliente' : 'Nuevo Cliente Manual'}
                    </h2>
                    <button onClick={() => setSidebarVisible(false)} className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-admin">
                    <form id="customer-form" onSubmit={handleSave} className="space-y-5">
                        
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    placeholder="Ej. María Pérez"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-gray-200 bg-white dark:bg-[#1e1e20] font-medium focus:ring-2 focus:ring-bioflora-verde/50 outline-none transition"
                                />
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">Teléfono <span className="text-[10px] text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                        placeholder="8888-8888"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-gray-200 bg-white dark:bg-[#1e1e20] font-medium focus:ring-2 focus:ring-bioflora-verde/50 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Correo</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({...form, email: e.target.value})}
                                        placeholder="correo@ejemplo.com"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-gray-200 bg-white dark:bg-[#1e1e20] font-medium focus:ring-2 focus:ring-bioflora-verde/50 outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Etiquetas CRM</label>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set([...allTags, ...form.tags])).filter(t => t !== 'Sin etiqueta').map(tagVal => {
                                    const isActive = form.tags.includes(tagVal);
                                    const style = getTagStyle(tagVal);
                                    return (
                                        <button
                                            type="button"
                                            key={tagVal}
                                            onClick={() => toggleTag(tagVal)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                                                isActive 
                                                    ? `${style.bg} ${style.border} ${style.text} ring-2 ring-bioflora-verde/30` 
                                                    : 'bg-white dark:bg-[#1e1e20] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {tagVal}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="+ Crear nueva etiqueta y enter"
                                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e20] font-medium focus:outline-none focus:border-bioflora-verde focus:ring-1 focus:ring-bioflora-verde"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            e.preventDefault();
                                            const newTag = e.target.value.trim();
                                            if (!form.tags.includes(newTag)) toggleTag(newTag);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notas Internas</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({...form, notes: e.target.value})}
                                placeholder="Preferencias de compra, alergias, direcciones alternas..."
                                rows={4}
                                className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-bioflora-verde outline-none resize-none bg-gray-50 dark:bg-black/20 text-gray-800 dark:text-gray-200 focus:bg-white dark:focus:bg-[#1e1e20]"
                            />
                        </div>

                    </form>

                    {/* Historial (Solo si estamos editando) */}
                    {editingCustomer && editingCustomer.orders?.length > 0 && (
                        <div className="mt-8 border-t border-gray-200 dark:border-white/5 pt-6">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Historial de Compras Entregadas ({editingCustomer.totalOrders})
                            </label>
                            <div className="space-y-3">
                                {editingCustomer.orders.map(o => (
                                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-md p-1.5 shadow-sm">
                                                <FileText className="w-4 h-4 text-bioflora-verde" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{o.orderId || 'Sin ID'}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(o.date).toLocaleDateString('es-CR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{o.total ? String(o.total).replace('CRC', '₡') : '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#111113] flex-shrink-0">
                    <button
                        form="customer-form"
                        type="submit"
                        disabled={saving}
                        className="w-full bg-bioflora-verde text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
                    </button>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Eliminar cliente</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    ¿Seguro que quieres eliminar a <span className="font-semibold text-gray-700 dark:text-gray-200">"{deleteTarget.name}"</span> del CRM?
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
