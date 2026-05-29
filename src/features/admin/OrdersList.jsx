import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, FlaskConical, Mail, Package, FileText, Share2 } from 'lucide-react';
import { IoLogoWhatsapp } from 'react-icons/io';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { seedOrders } from '../../services/seedOrders';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import OrderStatusDropdown from './OrderStatusDropdown';
import OrderFilters from './OrderFilters';
import OrderStats from './OrderStats';

const formatItemPrice = (item) => {
    const total = Number(item.price) * Number(item.quantity);
    return item.currency === 'CRC' ? `₡${total.toLocaleString('es-CR')}` : `$${total.toFixed(2)}`;
};

const buildWaMessage = (order) =>
    encodeURIComponent(`Hola ${order.cliente}, le contactamos desde Bioflora sobre su pedido. 😊`);

const buildWaInvoiceMessage = (order) => {
    const url = `${window.location.origin}/factura/${order.id}`;
    return encodeURIComponent(`Hola ${order.cliente}, aquí está su factura de compra en Bioflora 🌿\n${url}`);
};

function OrderRow({ order, productImages, products, onStatusUpdated, adminName }) {
    const [expanded, setExpanded] = useState(false);
    const date = order.createdAt?.toDate?.()?.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) ?? '—';
    const waPhone = order.telefono?.replace(/\D/g, '');

    return (
        <div className="bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm relative">
            {/* Cabecera clicable */}
            <div
                className="flex items-center justify-between p-4 gap-3 cursor-pointer select-none"
                onClick={() => setExpanded(v => !v)}
            >
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{order.cliente || 'Sin nombre'}</p>
                        {order.orderId && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-bioflora-verde/10 dark:bg-bioflora-verde/20 text-bioflora-verde flex-shrink-0">{order.orderId}</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{date} · {order.items?.length ?? 0} producto(s)</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <OrderStatusDropdown
                        orderId={order.id}
                        currentStatus={order.status}
                        onUpdated={onStatusUpdated}
                        order={order}
                        products={products}
                        adminName={adminName}
                    />
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </div>

            {/* Detalle expandible */}
            {expanded && (
                <div className="border-t border-gray-100 dark:border-white/5 p-4 bg-gray-50 dark:bg-[#1A1A1B] space-y-4 rounded-b-xl">
                    {/* Contacto */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 px-3 py-2.5">
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Teléfono</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{order.telefono || '—'}</p>
                            </div>
                            {waPhone && (
                                <a
                                    href={`https://wa.me/506${waPhone}?text=${buildWaMessage(order)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex-shrink-0 ml-2 w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] flex items-center justify-center transition-colors"
                                    title="Contactar por WhatsApp"
                                >
                                    <IoLogoWhatsapp className="w-4 h-4 text-white" />
                                </a>
                            )}
                        </div>

                        {order.correo ? (
                            <div className="flex items-center justify-between bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 px-3 py-2.5">
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Correo</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{order.correo}</p>
                                </div>
                                <a
                                    href={`mailto:${order.correo}?subject=Su pedido en Bioflora`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex-shrink-0 ml-2 w-8 h-8 rounded-full bg-bioflora-verde hover:bg-bioflora-verde/90 flex items-center justify-center transition-colors"
                                    title="Enviar correo"
                                >
                                    <Mail className="w-3.5 h-3.5 text-white" />
                                </a>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 px-3 py-2.5">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Correo</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">No proporcionado</p>
                            </div>
                        )}

                        <div className="sm:col-span-2 bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 px-3 py-2.5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Dirección</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{order.direccion || '—'}</p>
                        </div>
                    </div>

                    {/* Acciones de factura */}
                    <div className="flex items-center gap-2">
                        <a
                            href={`/factura/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2 text-xs font-medium text-bioflora-verde border border-bioflora-verde/20 dark:border-bioflora-verde/20 rounded-xl hover:bg-bioflora-verde/10 dark:hover:bg-bioflora-verde/20 transition-colors"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Ver factura
                        </a>
                        <a
                            href={`https://wa.me/506${waPhone}?text=${buildWaInvoiceMessage(order)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2 text-xs font-medium text-[#25D366] border border-[#25D366]/30 rounded-xl hover:bg-[#25D366]/10 transition-colors"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            Enviar factura
                        </a>
                    </div>

                    {/* Productos */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Productos</p>
                        <ul className="space-y-2">
                            {order.items?.map((item, i) => {
                                const img = productImages?.[item.name];
                                return (
                                    <li key={i} className="flex items-center gap-3 bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-100 dark:border-white/5 px-3 py-2">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {img
                                                ? <img src={img} alt={item.name} className="w-full h-full object-contain" />
                                                : <Package className="w-4 h-4 text-gray-300" />
                                            }
                                        </div>
                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 min-w-0 truncate">{item.name}</span>
                                        <span className="text-xs text-gray-400 flex-shrink-0">×{item.quantity}</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0">{formatItemPrice(item)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="text-right font-bold text-gray-800 dark:text-gray-100 mt-3 text-sm">Total: {order.total}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [productImages, setProductImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState(null);
    const [seeding, setSeeding] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const { userData } = useAuth();
    const adminName = userData?.nombre || userData?.email || 'Admin';

    const load = async () => {
        try {
            const [data, products] = await Promise.all([getOrders(), getProducts()]);
            setOrders(data);
            setAllProducts(products);
            const imgMap = {};
            products.forEach(p => { if (p.name) imgMap[p.name] = p.coverImage || p.imageUrl || null; });
            setProductImages(imgMap);
        } catch {
            toast.error('Error cargando pedidos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await seedOrders();
            toast.success('7 pedidos de prueba creados');
            await load();
        } catch {
            toast.error('Error generando datos de prueba');
        } finally {
            setSeeding(false);
        }
    };

    const handleStatusUpdated = (id, status) =>
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

    const filtered = activeFilter ? orders.filter(o => o.status === activeFilter) : orders;

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Pedidos</h1>
                <p className="text-gray-500 mt-1 text-sm">Historial de pedidos recibidos por WhatsApp.</p>
            </header>

            {!loading && orders.length > 0 && (
                <>
                    <OrderStats orders={orders} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                    <OrderFilters orders={orders} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Aún no hay pedidos registrados.</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Los pedidos aparecerán aquí cuando se completen desde la tienda.</p>
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="mt-5 flex items-center gap-2 mx-auto px-4 py-2 text-xs font-medium text-bioflora-verde border border-bioflora-verde/20 dark:border-bioflora-verde/20 rounded-lg hover:bg-bioflora-verde/10 dark:hover:bg-bioflora-verde/20 transition-colors disabled:opacity-50"
                    >
                        <FlaskConical className="w-3.5 h-3.5" />
                        {seeding ? 'Generando...' : 'Generar datos de prueba'}
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5 rounded-xl">
                    <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Sin pedidos con este estado.</p>
                    <button onClick={() => setActiveFilter(null)} className="mt-3 text-bioflora-verde hover:underline text-sm">
                        Ver todos
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(order => (
                        <OrderRow
                            key={order.id}
                            order={order}
                            productImages={productImages}
                            products={allProducts}
                            onStatusUpdated={(status) => handleStatusUpdated(order.id, status)}
                            adminName={adminName}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
