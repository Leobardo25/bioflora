import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Button } from 'antd';
import { MapPin, Mail, User, Phone, ShoppingBag, ChevronDown } from 'lucide-react';
import { IoLogoWhatsapp } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { createOrder } from '../../services/orderService';

const { TextArea } = Input;

const formatPrice = (price, currency) => {
    const isCRC = currency === 'CRC';
    return new Intl.NumberFormat(isCRC ? 'es-CR' : 'en-US', {
        style: 'currency',
        currency: isCRC ? 'CRC' : 'USD',
        minimumFractionDigits: isCRC ? 0 : 2,
        maximumFractionDigits: isCRC ? 0 : 2
    }).format(Number(price) || 0);
};

const getItemImage = (item) => {
    if (item.galleryImages?.length > 0) return item.galleryImages[0];
    return item.coverImage || item.imageUrl || '';
};

export default function CheckoutForm({ items, total, preserveCart = true, onSuccess, showMobileSummary = false }) {
    const { clearCart } = useCart();
    const { whatsapp } = useSiteConfig();
    const [summaryOpen, setSummaryOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: '',
        correo: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // Validación básica
        if (!formData.nombre || !formData.telefono || !formData.direccion) {
            toast.error('Por favor completa todos los campos obligatorios');
            return;
        }

        setIsSubmitting(true);

        try {
            const { orderId } = await createOrder({
                cliente: formData.nombre,
                telefono: formData.telefono,
                direccion: formData.direccion,
                correo: formData.correo,
                items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, currency: i.currency })),
                total: formatPrice(total, items[0]?.currency || 'USD'),
            });

            let message = `🌸 *Pedido ${orderId} — Caribbean Botanical Garden*\n\n`;
            message += '*Información del Cliente:*\n';
            message += `👤 Nombre: ${formData.nombre}\n`;
            message += `📱 Teléfono: ${formData.telefono}\n`;
            message += `📍 Dirección: ${formData.direccion}\n`;
            if (formData.correo) {
                message += `📧 Correo: ${formData.correo}\n`;
            }
            message += '\n*Productos:*\n';
            
            items.forEach((item, index) => {
                message += `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity, item.currency)}\n`;
            });

            // Para el total asumimos la moneda del primer item (usualmente todos tienen la misma)
            const currency = items.length > 0 ? items[0].currency : 'USD';
            message += `\n*Total: ${formatPrice(total, currency)}*\n`;
            message += `\n_Número de orden: ${orderId}_`;
            message += '\n\n¡Gracias por su confianza! 🌿';

            // Codificar mensaje para WhatsApp
            const waNumber = whatsapp || '';
            const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            
            // Abrir WhatsApp
            window.open(whatsappUrl, '_blank');

            // Limpiar carrito si es compra directa y no queremos preservarlo
            if (!preserveCart) {
                clearCart();
            }

            toast.success('¡Pedido enviado a WhatsApp!');
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            toast.error('Hubo un error al procesar tu pedido');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Título Finalizar Compra — solo en modo carrito */}
            {showMobileSummary && (
                <h1 className="font-serif font-bold text-xl text-valex-hueso text-center mb-4 flex-shrink-0">
                    Finalizar Compra
                </h1>
            )}

            {/* Resumen del pedido — desplegable */}
            {items?.length > 0 && (
                <div className={`flex-shrink-0 mb-4 bg-[#1a1a1b] rounded-xl border border-valex-gris/10 overflow-hidden ${showMobileSummary ? 'block' : 'hidden lg:block'}`}>
                    {/* Cabecera siempre visible: título + total + cantidad */}
                    <button
                        onClick={() => setSummaryOpen(prev => !prev)}
                        className="w-full px-4 py-3.5 hover:bg-white/3 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="font-serif font-semibold text-valex-hueso text-base flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-bioflora-naranja" />
                                Resumen del Pedido
                            </span>
                            <motion.div animate={{ rotate: summaryOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                <ChevronDown className="w-4 h-4 text-valex-gris" />
                            </motion.div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-valex-gris/60 font-sans text-xs">
                                {items.length} {items.length === 1 ? 'producto' : 'productos'}
                            </span>
                            <span className="text-bioflora-naranja font-serif font-bold text-base">
                                {formatPrice(total, items.length > 0 ? items[0].currency : 'USD')}
                            </span>
                        </div>
                    </button>

                    {/* Contenido desplegable */}
                    <AnimatePresence initial={false}>
                        {summaryOpen && (
                            <motion.div
                                key="summary-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div className="px-4 pb-4 border-t border-valex-gris/10 pt-3">
                                    <div className="max-h-[192px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-valex-bronce/20 flex-shrink-0">
                                                    <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-sans font-semibold text-valex-hueso text-xs leading-snug truncate">{item.name}</p>
                                                    <p className="text-valex-gris/60 text-xs font-sans mt-0.5">x{item.quantity}</p>
                                                </div>
                                                <span className="text-bioflora-naranja font-sans font-semibold text-sm flex-shrink-0">
                                                    {formatPrice(item.price * item.quantity, item.currency)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Formulario — siempre visible, propio scroll si es necesario */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {/* Resumen solo desktop cuando no es modo carrito */}
                {!showMobileSummary && items?.length > 0 && (
                    <div className="hidden lg:block mb-6 p-4 bg-[#1a1a1b] rounded-xl border border-valex-gris/10">
                        <h2 className="font-serif font-semibold text-valex-hueso text-base mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-bioflora-naranja" />
                            Resumen del Pedido
                        </h2>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-bioflora-morado/20 flex-shrink-0">
                                        <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-serif text-valex-hueso text-xs leading-snug truncate">{item.name}</p>
                                        <p className="text-valex-gris/60 text-xs font-sans mt-0.5">x{item.quantity}</p>
                                    </div>
                                    <span className="text-bioflora-naranja font-sans font-semibold text-sm flex-shrink-0">
                                        {formatPrice(item.price * item.quantity, item.currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-valex-gris/15 flex justify-between items-center">
                            <span className="text-valex-gris/70 font-sans text-xs uppercase tracking-wider">Total</span>
                            <span className="text-bioflora-naranja font-serif font-bold text-lg">
                                {formatPrice(total, items.length > 0 ? items[0].currency : 'USD')}
                            </span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="font-serif font-semibold text-valex-hueso text-sm mb-4">
                        Información de Envío
                    </h2>
                    <div>
                        <label className="block text-valex-gris text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                            <User className="w-3 h-3 text-bioflora-morado" />
                            Nombre Completo *
                        </label>
                        <Input
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Tu nombre completo"
                            size="large"
                            className="bg-[#1a1a1b] border-valex-gris/20 text-valex-hueso hover:border-bioflora-morado/60 focus:border-bioflora-morado placeholder:text-valex-gris/40"
                        />
                    </div>
                    <div>
                        <label className="block text-valex-gris text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Phone className="w-3 h-3 text-bioflora-morado" />
                            Teléfono *
                        </label>
                        <Input
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            placeholder="+506 8888-8888"
                            size="large"
                            className="bg-[#1a1a1b] border-valex-gris/20 text-valex-hueso hover:border-bioflora-morado/60 focus:border-bioflora-morado placeholder:text-valex-gris/40"
                        />
                    </div>
                    <div>
                        <label className="block text-valex-gris text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-bioflora-morado" />
                            Dirección *
                        </label>
                        <TextArea
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            placeholder="Tu dirección completa"
                            rows={3}
                            className="bg-[#1a1a1b] border-valex-gris/20 text-valex-hueso hover:border-bioflora-morado/60 focus:border-bioflora-morado placeholder:text-valex-gris/40"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-valex-gris text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Mail className="w-3 h-3 text-bioflora-morado" />
                            Correo Electrónico (Opcional)
                        </label>
                        <Input
                            name="correo"
                            value={formData.correo}
                            onChange={handleInputChange}
                            placeholder="tu@correo.com"
                            size="large"
                            className="bg-[#1a1a1b] border-valex-gris/20 text-valex-hueso hover:border-bioflora-morado/60 focus:border-bioflora-morado placeholder:text-valex-gris/40"
                        />
                    </div>

                    {/* Botón y nota dentro del scroll */}
                    <div className="pt-4 flex flex-col gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            className="w-full h-12 bg-bioflora-morado text-white text-[11px] font-sans font-bold tracking-[0.15em] uppercase rounded-full hover:bg-bioflora-morado/80 transition-all border-none shadow-lg shadow-bioflora-morado/30 flex items-center justify-center gap-2"
                        >
                            <IoLogoWhatsapp size={18} />
                            Enviar Pedido por WhatsApp
                        </Button>
                        <div className="flex gap-2.5 p-4 bg-bioflora-verde/5 border border-bioflora-verde/15 rounded-xl">
                            <IoLogoWhatsapp size={16} className="text-bioflora-verde/60 flex-shrink-0 mt-0.5" />
                            <p className="text-valex-gris/70 font-sans text-xs leading-relaxed">
                                Al confirmar, se abrirá WhatsApp con tu pedido listo para enviar.
                                Una vez recibido, nos pondremos en contacto contigo a la brevedad.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(124, 58, 237, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(124, 58, 237, 0.5);
                }
            `}</style>
        </div>
    );
}
