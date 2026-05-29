import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSiteConfig } from '../services/siteConfigService';
import { Layout, ConfigProvider, theme as antTheme } from 'antd';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const { Content } = Layout;

export const DEFAULT_POLICIES = {
    refunds: {
        title: 'Política de Reembolsos y Garantía Botánica',
        content: `En Bioflora, nos esforzamos por ofrecer plantas y orquídeas exóticas de la más alta calidad. Debido a la naturaleza delicada de los seres vivos, aplicamos las siguientes políticas de reembolso y garantía.

**Garantía de Llegada Segura**
- Garantizamos que todas nuestras plantas y orquídeas llegan sanas y salvas a su destino.
- Si una planta sufre daños severos durante el transporte, debe reportarlo en las primeras 24 horas naturales tras la entrega enviando fotografías detalladas a nuestros canales oficiales.
- Una vez verificado el daño, le ofreceremos un reemplazo de la especie (sujeto a disponibilidad) o un reembolso completo del valor de la planta.

**Exclusiones de Reembolso**
- Por seguridad fitosanitaria y el bienestar de los ejemplares, no aceptamos devoluciones físicas de plantas sanas una vez entregadas.
- La garantía no cubre daños causados por un cuidado inadecuado, riego excesivo o insuficiente, exposición a luz no recomendada o negligencia posterior a las 24 horas de la entrega.
- Los insumos abiertos (sustratos, abonos) o plantas en oferta no son elegibles para reembolso.

**Proceso de Reembolso**
- Si se aprueba su reembolso, este se procesará en un plazo de 5 días hábiles a través del mismo método de pago utilizado en la compra.`
    },
    shipping: {
        title: 'Política de Envíos de Seres Vivos',
        content: `En Bioflora optimizamos nuestro proceso de embalaje y logística para que sus orquídeas y plantas exóticas viajen con el menor estrés posible.

**Horarios y Logística de Envío**
- Para proteger la salud de las plantas, los despachos de seres vivos se realizan de lunes a miércoles. Esto evita que los paquetes queden retenidos en bodegas de mensajería durante el fin de semana.
- Los accesorios y sustratos pueden enviarse de lunes a viernes.

**Cobertura**
- Realizamos envíos de plantas y accesorios a todo el territorio nacional de Costa Rica.
- Las entregas se realizan mediante servicios de mensajería especializada en el manejo seguro de seres vivos.

**Tiempos Estimados**
- Gran Área Metropolitana (GAM): 1-2 días hábiles después del despacho.
- Fuera del GAM: 2-3 días hábiles después del despacho.

**Empaque Especializado**
- Cada orquídea y planta exótica se asegura individualmente, protegiendo las raíces y follaje para conservar la humedad idónea y evitar movimientos bruscos dentro del empaque.`
    },
    privacy: {
        title: 'Política de Privacidad',
        content: `En Bioflora, valoramos y respetamos su privacidad. Esta política detalla cómo recopilamos, protegemos y utilizamos su información personal.

**Información que Recopilamos**
- Datos de contacto: nombre completo, número de teléfono, dirección física exacta para entregas y correo electrónico.
- Historial de pedidos: plantas y accesorios adquiridos para brindar un mejor servicio de seguimiento botánico.

**Uso de la Información**
- Procesar sus pedidos y coordinar las entregas seguras de seres vivos.
- Brindarle asesoría y guías de cuidado post-compra personalizadas para sus plantas.
- Comunicarle el estado de su pedido o coordinar detalles del envío mediante canales oficiales.

**Protección y Confidencialidad**
- Sus datos personales nunca serán compartidos, vendidos ni cedidos a terceros con fines comerciales.
- Empleamos medidas de seguridad robustas para salvaguardar sus datos y los de sus transacciones en nuestra tienda.`
    },
    terms: {
        title: 'Términos de Servicio',
        content: `Al acceder y utilizar la plataforma web de Bioflora, usted acepta los siguientes términos y condiciones.

**Uso de la Plataforma**
- Este sitio web es operado por Bioflora. Al realizar compras de plantas y orquídeas exóticas, usted declara ser mayor de edad o contar con la supervisión de un tutor legal.

**Productos Botánicos y Precios**
- Las plantas y orquídeas son seres vivos, por lo que cada ejemplar es único en forma, cantidad de hojas, flores y color. Las imágenes mostradas en el catálogo son de carácter referencial y representan fielmente la especie y calidad que recibirá.
- Los precios de las plantas se muestran en la moneda seleccionada (CRC o USD) y están sujetos a variación según disponibilidad o temporada de floración.

**Responsabilidad del Comprador**
- El cultivo exitoso de plantas y orquídeas exóticas depende de factores ambientales y cuidados individuales. Una vez recibida la planta en buen estado, la responsabilidad de su mantenimiento, aclimatación y supervivencia recae plenamente en el comprador. Ofrecemos asesoría gratuita de soporte, pero no podemos hacernos responsables por el cuidado posterior.`
    }
};

const POLICY_KEYS = ['refunds', 'shipping', 'privacy', 'terms'];

export default function PolicyPage() {
    const { policyType } = useParams();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!POLICY_KEYS.includes(policyType)) {
            navigate('/');
            return;
        }

        getSiteConfig('policies').then((data) => {
            if (data?.[policyType]?.title && data[policyType]?.content) {
                setPolicy(data[policyType]);
            } else {
                setPolicy(DEFAULT_POLICIES[policyType]);
            }
            setLoading(false);
        }).catch(() => {
            setPolicy(DEFAULT_POLICIES[policyType]);
            setLoading(false);
        });
    }, [policyType, navigate]);

    // Simple markdown-ish renderer for bold text
    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={i} className="font-sans font-semibold text-gray-900 text-base mt-8 mb-3">{line.replace(/\*\*/g, '')}</h3>;
            }
            if (line.startsWith('- ')) {
                return <li key={i} className="text-gray-700 text-sm font-light leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
            }
            if (/^\d+\.\s/.test(line)) {
                return <li key={i} className="text-gray-700 text-sm font-light leading-relaxed ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
            }
            if (line.trim() === '') {
                return <div key={i} className="h-2" />;
            }
            return <p key={i} className="text-gray-700 text-sm font-light leading-relaxed">{line}</p>;
        });
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#69358C',
                    colorBgBase: '#FFFFFF',
                    colorBgContainer: '#FFFFFF',
                    colorTextBase: '#050B14',
                    colorTextSecondary: '#4B5563',
                    fontFamily: '"Poppins", "Outfit", sans-serif',
                }
            }}
        >
            <div className="min-h-screen bg-[#F4F9FA] flex flex-col">
                <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

                <Content className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-3xl w-full mx-auto pb-24">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 mb-8 hover:text-[#69358C] text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                    </button>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#69358C] rounded-full animate-spin" />
                        </div>
                    ) : policy ? (
                        <div className="animate-in fade-in bg-white border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-sm">
                            <span className="inline-block text-[#69358C] font-sans text-[10px] tracking-[0.3em] uppercase font-bold mb-4">
                                Políticas de Tienda
                            </span>
                            <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-gray-900 mb-8 leading-tight">
                                {policy.title}
                            </h1>
                            <div className="border-t border-gray-100 pt-8">
                                {renderContent(policy.content)}
                            </div>

                            {/* Última actualización */}
                            <div className="mt-16 pt-6 border-t border-gray-100">
                                <p className="text-gray-400 text-xs">
                                    Última actualización: Mayo 2026 — Bioflora
                                </p>
                            </div>
                        </div>
                    ) : null}
                </Content>

                <Footer />
            </div>
        </ConfigProvider>
    );
}
