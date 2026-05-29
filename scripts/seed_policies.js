import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQIC4-pssHVaRCMAj51_ZOg_3z46Vprxw",
  authDomain: "bioflora-edb38.firebaseapp.com",
  projectId: "bioflora-edb38",
  storageBucket: "bioflora-edb38.firebasestorage.app",
  messagingSenderId: "363345581472",
  appId: "1:363345581472:web:668255632516c9c70580c5",
  measurementId: "G-HRPLX0NML0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const POLICIES = {
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

async function seedPolicies() {
    console.log("🌱 Inyectando Políticas actualizadas de Bioflora en Firestore (site_config/policies)...");
    try {
        await setDoc(doc(db, 'site_config', 'policies'), POLICIES);
        console.log("✅ ¡Políticas de Bioflora inyectadas exitosamente en Firebase!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inyectando políticas:", error);
        process.exit(1);
    }
}

seedPolicies();
