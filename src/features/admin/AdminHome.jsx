import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, AlertTriangle, ArrowRight, TrendingUp, Clock, CheckCircle2, DollarSign, Sparkles, ClipboardCheck, ChefHat, Truck, PartyPopper, XCircle, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { IoLogoWhatsapp } from 'react-icons/io';
import { getProducts } from '../../services/productService';
import { getOrders } from '../../services/orderService';
import { getCustomers } from '../../services/customerService';
import { getRecentMovements, MOVEMENT_TYPES } from '../../services/movementService';
import { useAuth } from '../../context/AuthContext';
import OrderStatusDropdown from './OrderStatusDropdown';

/* ── Stat Card (top row) ── */
const StatCard = ({ label, value, subtitle, icon: Icon, color, linkTo, loading }) => (
    <Link to={linkTo} className="bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 p-5 shadow-sm hover:shadow-md dark:hover:border-white/10 transition-all group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                {loading ? (
                    <div className="h-8 w-16 mt-2 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                ) : (
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
                )}
                {subtitle && !loading && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-bioflora-verde font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle <ArrowRight className="w-3 h-3" />
        </span>
    </Link>
);

/* ── Status badge ── */


/* ── Section wrapper ── */
const DashSection = ({ title, icon: Icon, linkTo, linkLabel, children }) => (
    <div className="bg-white dark:bg-[#1e1e20] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 tracking-wide">{title}</h2>
            </div>
            {linkTo && (
                <Link to={linkTo} className="text-[11px] text-bioflora-verde hover:text-bioflora-verde/80 font-medium flex items-center gap-1">
                    {linkLabel || 'Ver todo'} <ArrowRight className="w-3 h-3" />
                </Link>
            )}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

/* ── Formatters ── */
const formatDate = (d) => {
    const date = d?.toDate?.() || d;
    if (!date) return '—';
    return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });
};



/* ── Main Component ── */
export default function AdminHome() {
    const [stats, setStats] = useState({
        total: 0, available: 0, outOfStock: 0, lowStock: 0,
        orders: 0, pendingOrders: 0, deliveredOrders: 0, revenue: 0,
        customers: 0, topCustomers: [],
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [recentMovements, setRecentMovements] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useAuth();
    const adminName = userData?.nombre || userData?.email || 'Admin';

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const [products, orders, customers, movements] = await Promise.all([
                    getProducts(),
                    getOrders(),
                    getCustomers(),
                    getRecentMovements(5),
                ]);

                if (!active) return;

                const available = products.filter(p => p.stock === 'Disponible').length;
                setAllProducts(products);
                const outOfStock = products.filter(p => p.stock === 'Agotado' || p.stock === 'Bóveda (Retirado)').length;
                const lowStock = products.filter(p => p.stock === 'Disponible' && typeof p.quantity === 'number' && p.quantity > 0 && p.quantity <= 3);
                const pendingOrders = orders.filter(o => o.status === 'nuevo' || o.status === 'confirmado' || o.status === 'preparando');
                const deliveredOrders = orders.filter(o => o.status === 'entregado');
                
                let revenue = 0;
                deliveredOrders.forEach(o => {
                    // Sum from individual items for accuracy
                    if (o.items && o.items.length > 0) {
                        o.items.forEach(item => {
                            const price = Number(item.price) || 0;
                            const qty = Number(item.quantity) || 1;
                            // Only sum CRC items (colones)
                            if (item.currency !== 'USD') {
                                revenue += price * qty;
                            }
                        });
                    } else if (o.total) {
                        // Fallback: parse total string
                        const cleaned = String(o.total).replace(/[^0-9.]/g, '');
                        const val = parseFloat(cleaned);
                        if (!isNaN(val)) revenue += val;
                    }
                });

                const topCustomers = [...customers]
                    .sort((a, b) => b.ltvRaw - a.ltvRaw)
                    .slice(0, 5);

                setStats({
                    total: products.length,
                    available,
                    outOfStock,
                    lowStock: lowStock.length,
                    orders: orders.length,
                    pendingOrders: pendingOrders.length,
                    deliveredOrders: deliveredOrders.length,
                    revenue,
                    customers: customers.length,
                    topCustomers,
                });

                setRecentOrders(orders.slice(0, 5));
                setAllOrders(orders);
                setLowStockProducts(lowStock.slice(0, 5));
                setRecentMovements(movements);
            } catch (e) {
                console.error(e);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const handleStatusUpdated = (id, status) => {
        setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    return (
        <div className="space-y-6">

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Catálogo"
                    value={stats.total}
                    subtitle={`${stats.available} disponibles`}
                    icon={Package}
                    color="bg-bioflora-verde/10 dark:bg-bioflora-verde/15 text-bioflora-verde"
                    linkTo="/admin/inventory"
                    loading={loading}
                />
                <StatCard
                    label="Pedidos"
                    value={stats.orders}
                    subtitle={stats.pendingOrders > 0 ? `${stats.pendingOrders} pendiente(s)` : 'Todos al día'}
                    icon={ShoppingBag}
                    color="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    linkTo="/admin/orders"
                    loading={loading}
                />
                <StatCard
                    label="Clientes"
                    value={stats.customers}
                    subtitle="Clientes registrados"
                    icon={Users}
                    color="bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    linkTo="/admin/customers"
                    loading={loading}
                />
                <StatCard
                    label="Ingresos"
                    value={loading ? '...' : `₡${stats.revenue.toLocaleString('es-CR')}`}
                    subtitle="Pedidos entregados"
                    icon={DollarSign}
                    color="bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    linkTo="/admin/orders"
                    loading={loading}
                />
            </div>

            {/* ── Two-Column Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Últimos Pedidos */}
                <DashSection title="Últimos Pedidos" icon={Clock} linkTo="/admin/orders">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-50 dark:bg-white/5 rounded-lg animate-pulse" />)}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin pedidos aún.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.map(order => {
                                const waPhone = order.telefono?.replace(/\D/g, '');
                                return (
                                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1B] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{order.cliente || 'Sin nombre'}</p>
                                                {order.orderId && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-bioflora-verde/10 dark:bg-bioflora-verde/15 text-bioflora-verde flex-shrink-0">{order.orderId}</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {formatDate(order.createdAt)} · {order.items?.length ?? 0} producto(s) · {order.total || '—'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {waPhone && (
                                                <a
                                                    href={`https://wa.me/506${waPhone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-7 h-7 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <IoLogoWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
                                                </a>
                                            )}
                                            <OrderStatusDropdown
                                                orderId={order.id}
                                                currentStatus={order.status}
                                                onUpdated={(status) => handleStatusUpdated(order.id, status)}
                                                order={order}
                                                products={allProducts}
                                                adminName={adminName}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DashSection>

                {/* Top Clientes */}
                <DashSection title="Top Clientes" icon={TrendingUp} linkTo="/admin/customers">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-50 dark:bg-white/5 rounded-lg animate-pulse" />)}
                        </div>
                    ) : stats.topCustomers.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin clientes aún.</p>
                    ) : (
                        <div className="space-y-2">
                            {stats.topCustomers.map((cust, i) => (
                                <div key={cust.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1B] border border-gray-100 dark:border-white/5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        i === 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                        i === 1 ? 'bg-gray-200 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300' :
                                        i === 2 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                                        'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{cust.name}</p>
                                        <p className="text-[11px] text-gray-400">{cust.totalOrders} pedido(s)</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">
                                        ₡{cust.ltvRaw.toLocaleString('es-CR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </DashSection>
            </div>

            {/* ── Últimos Movimientos de Inventario ── */}
            {!loading && recentMovements.length > 0 && (
                <DashSection title="Últimos Movimientos" icon={ArrowLeftRight} linkTo="/admin/movements">
                    <div className="space-y-2">
                        {recentMovements.map(m => {
                            const isEntrada = m.type === 'entrada';
                            const reasonLabel = MOVEMENT_TYPES[m.type]?.reasons?.find(r => r.value === m.reason)?.label || m.reason;
                            return (
                                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1B] border border-gray-100 dark:border-white/5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isEntrada
                                            ? 'bg-emerald-50 dark:bg-emerald-500/15'
                                            : 'bg-red-50 dark:bg-red-500/15'
                                    }`}>
                                        {isEntrada
                                            ? <ArrowDownCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            : <ArrowUpCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        }
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{m.productName}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {reasonLabel} · {formatDate(m.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold flex-shrink-0 ${
                                        isEntrada ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {isEntrada ? '+' : '-'}{m.quantity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </DashSection>
            )}

            {/* ── Alertas de Stock Bajo ── */}
            {!loading && lowStockProducts.length > 0 && (
                <DashSection title="Stock Bajo (≤ 3 unidades)" icon={AlertTriangle} linkTo="/admin/inventory" linkLabel="Gestionar inventario">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {p.coverImage ? (
                                        <img src={p.coverImage} alt={p.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Package className="w-4 h-4 text-gray-300" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                                        {p.quantity} unidad(es)
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DashSection>
            )}

            {/* ── Resumen de Estados (Mini pipeline) ── */}
            {!loading && stats.orders > 0 && (
                <DashSection title="Pipeline de Pedidos" icon={CheckCircle2} linkTo="/admin/orders">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[
                            { key: 'nuevo', label: 'Nuevos', icon: Sparkles, iconColor: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-500/10' },
                            { key: 'confirmado', label: 'Confirmados', icon: ClipboardCheck, iconColor: 'text-bioflora-verde', bgColor: 'bg-bioflora-verde/10 dark:bg-bioflora-verde/15' },
                            { key: 'preparando', label: 'Preparando', icon: ChefHat, iconColor: 'text-amber-500 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-500/10' },
                            { key: 'enviado', label: 'Enviados', icon: Truck, iconColor: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-500/10' },
                            { key: 'entregado', label: 'Entregados', icon: PartyPopper, iconColor: 'text-emerald-500 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10' },
                            { key: 'cancelado', label: 'Cancelados', icon: XCircle, iconColor: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-500/10' },
                        ].map(stage => {
                            const StageIcon = stage.icon;
                            const count = allOrders.filter(o => o.status === stage.key).length;
                            return (
                                <div key={stage.key} className={`text-center p-3 rounded-lg border border-gray-100 dark:border-white/5 ${stage.bgColor}`}>
                                    <div className="flex justify-center">
                                        <StageIcon className={`w-5 h-5 ${stage.iconColor}`} />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1.5">{count}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mt-0.5">{stage.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </DashSection>
            )}
        </div>
    );
}
