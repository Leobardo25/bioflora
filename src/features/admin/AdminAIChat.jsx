import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Bot, User, Trash2, MessageSquare } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { sendChatMessage } from '../../services/aiChatService';

const SUGGESTIONS = [
    '¿Cuántos productos tengo en catálogo?',
    '¿Qué hace la sección de Entradas/Salidas?',
    '¿Cuántos pedidos están pendientes?',
    '¿Quiénes son mis mejores clientes?',
];

/**
 * Mini-renderer de Markdown → HTML para las respuestas de la IA.
 * Soporta: **bold**, *italic*, `code`, listas (- y 1.), headers (###), emojis.
 */
const formatMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
        // Escapar HTML peligroso
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers (### → h4, ## → h3)
        .replace(/^### (.+)$/gm, '<h4 class="font-bold text-sm mt-3 mb-1">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
        // Bold **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>')
        // Italic *text* or _text_
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
        // Inline code `text`
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono">$1</code>')
        // Unordered lists (- item)
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
        // Ordered lists (1. item)
        .replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
        // Line breaks
        .replace(/\n/g, '<br/>');
    
    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/((?:<li class="ml-4 list-disc">.+?<\/li>(?:<br\/>)?)+)/g, '<ul class="my-1 space-y-0.5">$1</ul>');
    html = html.replace(/((?:<li class="ml-4 list-decimal">.+?<\/li>(?:<br\/>)?)+)/g, '<ol class="my-1 space-y-0.5">$1</ol>');
    // Clean stray <br/> inside lists
    html = html.replace(/<\/li><br\/>/g, '</li>');
    
    return html;
};

const AdminAIChat = memo(function AdminAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pulse, setPulse] = useState(true);

    // Estado reactivo en RAM para almacenar los datos del negocio
    const [liveData, setLiveData] = useState({
        products: [],
        orders: [],
        customers: [],
        loaded: false
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Suscripción reactiva en tiempo real (onSnapshot) al montar el componente
    // Carga inicial = 1 lectura por documento. Futuras actualizaciones = Costo $0 si no cambian documentos.
    useEffect(() => {
        const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
            const productsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLiveData(prev => ({ ...prev, products: productsList }));
        }, (error) => {
            console.error("Error en tiempo real en productos:", error);
        });

        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubOrders = onSnapshot(ordersQuery, (snap) => {
            const ordersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLiveData(prev => ({ ...prev, orders: ordersList }));
        }, (error) => {
            console.error("Error en tiempo real en pedidos:", error);
        });

        const unsubCustomers = onSnapshot(collection(db, 'customers'), (snap) => {
            const customersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLiveData(prev => ({ ...prev, customers: customersList }));
        }, (error) => {
            console.error("Error en tiempo real en clientes:", error);
        });

        setLiveData(prev => ({ ...prev, loaded: true }));

        return () => {
            unsubProducts();
            unsubOrders();
            unsubCustomers();
        };
    }, []);

    // Scroll al último mensaje
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Memoria Caché Reactiva en RAM
    // Recalcula el texto estructurado del negocio a Costo $0 únicamente cuando cambia liveData
    const businessContext = useMemo(() => {
        const { products, orders, customers } = liveData;
        if (!products.length && !orders.length) return null;

        const available = products.filter(p => p.stock === 'Disponible').length;
        const outOfStock = products.filter(p => p.stock === 'Agotado' || p.stock === 'Bóveda (Retirado)').length;
        const lowStockProducts = products.filter(p => p.stock === 'Disponible' && typeof p.quantity === 'number' && p.quantity > 0 && p.quantity <= 3);
        const pendingOrders = orders.filter(o => !['entregado', 'cancelado'].includes(o.status)).length;
        const deliveredOrders = orders.filter(o => o.status === 'entregado');

        let revenue = 0;
        deliveredOrders.forEach(o => {
            if (o.items && o.items.length > 0) {
                o.items.forEach(item => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.quantity) || 1;
                    if (item.currency !== 'USD') revenue += price * qty;
                });
            } else if (o.total) {
                const cleaned = String(o.total).replace(/[^0-9.]/g, '');
                const val = parseFloat(cleaned);
                if (!isNaN(val)) revenue += val;
            }
        });

        const formatDate = (d) => {
            const date = d?.toDate?.() || d;
            if (!date) return 'Sin fecha';
            const parsedDate = date instanceof Date ? date : new Date(date);
            if (isNaN(parsedDate.getTime())) return 'Sin fecha';
            return parsedDate.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        const recentOrdersDetail = orders.slice(0, 10).map(o => {
            const itemsList = o.items?.map(i => `${i.name || i.productName || 'Producto'} x${i.quantity || 1}`).join(', ') || 'Sin productos';
            return `- ${o.orderId || 'Sin ID'} | Cliente: ${o.cliente || 'Desconocido'} | Tel: ${o.telefono || 'N/A'} | Estado: ${o.status} | Total: ${o.total || 'N/A'} | Fecha: ${formatDate(o.createdAt)} | Productos: ${itemsList}`;
        }).join('\n') || 'No hay pedidos registrados';

        const productsDetail = products.map(p => {
            const price = p.price ? `₡${Number(p.price).toLocaleString('es-CR')}` : 'Sin precio';
            const priceUSD = p.priceUSD ? ` / $${p.priceUSD}` : '';
            return `- ${p.name} | ${price}${priceUSD} | Stock: ${p.stock} | Cantidad: ${p.quantity ?? 'N/A'} | Categoría: ${p.category || 'Sin categoría'}`;
        }).join('\n') || 'No hay productos';

        // Procesamiento CRM Relacional de Clientes en RAM
        const customerMap = {};

        // Poblar clientes iniciales desde base de datos
        customers.forEach(c => {
            customerMap[c.id] = {
                id: c.id,
                name: c.name || 'Desconocido',
                phone: c.phone || c.id,
                email: c.email || '',
                totalOrders: 0,
                orders: [],
                ltvRaw: 0,
                lastPurchaseDate: null,
                notes: c.notes || '',
                createdAt: c.createdAt?.toDate?.() || null,
                hidden: c.hidden || false,
            };
        });

        // Poblar clientes dinámicos desde las órdenes reales
        orders.forEach(order => {
            if (order.status !== 'entregado') return;

            let key = order.telefono ? String(order.telefono).replace(/\D/g, '') : null;
            if (!key) key = order.correo ? order.correo.toLowerCase() : null;
            if (!key) return;
            
            if (!customerMap[key]) {
                customerMap[key] = {
                    id: key,
                    name: order.cliente || 'Desconocido',
                    phone: order.telefono || '',
                    email: order.correo || '',
                    totalOrders: 0,
                    orders: [],
                    ltvRaw: 0,
                    lastPurchaseDate: null,
                    notes: '',
                    createdAt: new Date(),
                    hidden: false,
                };
            }
            
            const cust = customerMap[key];
            cust.totalOrders += 1;
            cust.orders.push({
                id: order.id,
                orderId: order.orderId,
                date: order.createdAt?.toDate?.() || new Date(),
                total: order.total
            });
            
            if (order.total) {
                const numericString = String(order.total).replace(/[^\d.,]/g, '');
                const normalized = numericString.replace(/,/g, '');
                const val = parseFloat(normalized);
                if (!isNaN(val)) {
                    cust.ltvRaw += val;
                }
            }
        });

        // Ordenación e indexación
        Object.values(customerMap).forEach(cust => {
            cust.orders.sort((a, b) => b.date - a.date);
            if (cust.orders.length > 0) {
                cust.lastPurchaseDate = cust.orders[0].date;
            }
            if (cust.name === 'Desconocido' && cust.orders.length > 0) {
                const lastO = orders.find(x => x.id === cust.orders[0].id);
                if (lastO && lastO.cliente) cust.name = lastO.cliente;
            }
        });

        const activeCustomers = Object.values(customerMap)
            .filter(c => !c.hidden)
            .sort((a, b) => {
                const dateA = a.lastPurchaseDate || a.createdAt || new Date(0);
                const dateB = b.lastPurchaseDate || b.createdAt || new Date(0);
                return dateB - dateA;
            });

        const topCusts = [...activeCustomers].sort((a, b) => b.ltvRaw - a.ltvRaw).slice(0, 5);
        const topCustomersDetail = topCusts.map((c, i) => 
            `- #${i + 1} ${c.name} | ${c.totalOrders} pedido(s) | LTV: ₡${c.ltvRaw.toLocaleString('es-CR')} | Tel: ${c.phone || 'N/A'}`
        ).join('\n') || 'Sin datos de clientes';

        const lowStockDetail = lowStockProducts.map(p => 
            `- ${p.name}: ${p.quantity} unidad(es)`
        ).join('\n') || 'Ningún producto con stock bajo';

        return {
            totalProducts: products.length,
            availableProducts: available,
            outOfStock,
            lowStock: lowStockProducts.length,
            totalOrders: orders.length,
            pendingOrders,
            deliveredOrders: deliveredOrders.length,
            revenue,
            totalCustomers: activeCustomers.length,
            recentOrdersDetail,
            productsDetail,
            topCustomersDetail,
            lowStockDetail,
        };
    }, [liveData]);

    // Al abrir enfocamos el input (solo en desktop)
    useEffect(() => {
        if (isOpen) {
            setPulse(false);
            if (window.innerWidth > 768) {
                setTimeout(() => inputRef.current?.focus(), 300);
            }
        }
    }, [isOpen]);

    const handleSend = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMessage = { role: 'user', content: messageText };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Latencia cero: el contexto ya está listo en RAM sin await reloadContext()
            const reply = await sendChatMessage(
                updatedMessages.map(m => ({ role: m.role, content: m.content })),
                businessContext
            );
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Error: ${err.message}. Intenta de nuevo.`,
                isError: true,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <>
            {/* ── Botón Flotante (Latido) ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-2xl flex items-center justify-center transition-colors cursor-pointer group hover:scale-105 active:scale-95"
                        style={{ boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)' }}
                        title="Asistente IA"
                    >
                        {/* Anillo de aura vibrante (Latido) */}
                        {pulse && (
                            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" style={{ animationDuration: '2.5s' }} />
                        )}
                        <Sparkles className="w-7 h-7 drop-shadow-md relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Overlay ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── Panel de Chat (Drawer Lateral) ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] flex flex-col bg-white dark:bg-[#111113] border-l border-gray-200 dark:border-white/5 shadow-2xl"
                    >
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#1A1A1B]/80 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Asistente Caribbean Botanical Garden</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                        {!liveData.loaded ? 'Sincronizando...' : 'Conectado a tu tienda'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearChat}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                        title="Limpiar conversación"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* ── Mensajes ── */}
                        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-admin">
                            {/* Estado Vacío */}
                            {messages.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">¡Hola! 👋</h4>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-[280px]">
                                        Soy Leo, tu asistente IA. Pregúntame lo que quieras sobre tu tienda.
                                    </p>
                                    <div className="w-full space-y-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">Sugerencias</p>
                                        {SUGGESTIONS.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(s)}
                                                className="w-full text-left px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Burbujas de Mensajes */}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-md whitespace-pre-wrap'
                                            : msg.isError
                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-bl-md whitespace-pre-wrap'
                                                : 'bg-gray-100 dark:bg-[#1e1e20] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-bl-md ai-markdown'
                                    }`}
                                        {...(msg.role === 'assistant' && !msg.isError
                                            ? { dangerouslySetInnerHTML: { __html: formatMarkdown(msg.content) } }
                                            : { children: msg.content }
                                        )}
                                    />
                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Indicador de Carga */}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-[#1e1e20] border border-gray-200 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Pensando...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Input ── */}
                        <div className="px-4 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#1A1A1B]/50">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Pregunta algo sobre tu tienda..."
                                    rows={1}
                                    className="flex-1 resize-none px-4 py-3 rounded-xl text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 placeholder-gray-400 dark:placeholder-gray-600 transition-all overflow-hidden"
                                    style={{ minHeight: '44px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                        input.trim() && !isLoading
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 text-center">
                                Powered by <a href="https://leonardo25.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-bold tracking-wide hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">LA COLMENA</a>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});

export default AdminAIChat;

