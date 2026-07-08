import { Drawer, ConfigProvider, theme as antTheme } from 'antd';
import { ChevronLeft } from 'lucide-react';
import { useCheckoutDrawer } from '../../context/CheckoutDrawerContext';
import { useCart } from '../../context/CartContext';
import CheckoutForm from './CheckoutForm';

export default function CheckoutDrawer() {
    const { isOpen, checkoutData, closeCheckoutDrawer } = useCheckoutDrawer();
    const { cart } = useCart();

    const items = checkoutData?.items || cart || [];
    const total = checkoutData?.total || (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <ConfigProvider
            theme={{
                algorithm: antTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#A68966',
                    colorBgBase: '#151515',
                    colorBgElevated: '#1a1a1b',
                    colorTextBase: '#F5F5F5',
                    fontFamily: '"Poppins", sans-serif',
                }
            }}
        >
            <Drawer
                title={null}
                closable={false}
                placement="right"
                onClose={closeCheckoutDrawer}
                open={isOpen}
                size={window.innerWidth <= 1024 ? 'default' : 'large'}
                zIndex={2000}
                styles={{
                    header: { display: 'none' },
                    body: { padding: '0', backgroundColor: '#111112', display: 'flex', flexDirection: 'column', height: '100dvh' },
                }}
                className="checkout-drawer"
            >
                {/* Header personalizado */}
                <div className="flex items-center px-5 py-4 border-b border-valex-bronce/15 bg-[#111112] flex-shrink-0">
                    <button
                        onClick={closeCheckoutDrawer}
                        className="flex items-center gap-1.5 text-valex-gris hover:text-valex-hueso transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-sans uppercase tracking-wider">Volver</span>
                    </button>
                    <h1 className="font-serif font-bold text-base text-valex-hueso text-center flex-1 leading-tight px-4">
                        Finalizar Compra
                    </h1>
                    <div className="w-16" />
                </div>

                {/* Contenido - Formulario */}
                <div className="flex-1 p-5 sm:p-6 overflow-hidden">
                    <CheckoutForm 
                        items={items}
                        total={total}
                        preserveCart={checkoutData?.preserveCart}
                        onSuccess={closeCheckoutDrawer}
                        showMobileSummary={true}
                    />
                </div>
            </Drawer>
        </ConfigProvider>
    );
}
