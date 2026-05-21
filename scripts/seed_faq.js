import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuración de bioflora-edb38
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

const FAQs = [
    {
        question: '¿Hacen envíos de plantas vivas a todo Costa Rica?',
        answer: '¡Totalmente! Realizamos envíos rápidos y seguros de plantas, orquídeas y accesorios botánicos a todo Costa Rica utilizando servicios de mensajería especializada que aseguran un manejo delicado de cada ejemplar.'
    },
    {
        question: '¿Cómo garantizan que las plantas y orquídeas lleguen en buen estado?',
        answer: 'Empleamos empaques protectores especialmente diseñados para seres vivos. Cada orquídea y planta de colección es fijada y acondicionada para soportar el transporte, manteniendo la humedad y ventilación óptimas durante todo el trayecto.'
    },
    {
        question: '¿Cómo puedo obtener asesoría para el cuidado de mis plantas?',
        answer: 'Su compra incluye asesoramiento botánico post-compra continuo. Puede contactarnos a través del canal oficial de servicio al cliente y con gusto nuestro equipo de expertos le guiará en temas de riego, iluminación, sustratos y fertilización para que sus plantas prosperen de forma espectacular.'
    },
    {
        question: '¿Puedo visitar los invernaderos para escoger mis plantas en persona?',
        answer: 'Sí, nos encanta recibir visitantes. Contamos con un área de exhibición y venta directa. Debido a nuestros estrictos controles fitosanitarios, te recomendamos agendar tu visita con anticipación para poder brindarte un recorrido guiado por nuestra colección.'
    },
    {
        question: '¿Venden orquídeas y plantas al por mayor para proyectos o reventa?',
        answer: 'Así es. Manejamos precios preferenciales para paisajistas, hoteles, decoradores y viveristas. Al ser productores directos, tenemos la capacidad de proveer grandes volúmenes de especies nativas y exóticas para proyectos de cualquier escala.'
    },
    {
        question: '¿Qué pasa si a mi orquídea se le caen las flores? ¿Se murió?',
        answer: '¡Para nada! Las flores tienen un ciclo de vida natural, y es normal que caigan después de semanas o meses. La planta sigue viva y acumulando energía. Con el cuidado adecuado, volverá a florecer la siguiente temporada.'
    },
    {
        question: '¿Tienen abonos y sustratos especiales para el cultivo?',
        answer: 'Sí, formulamos y vendemos los mismos sustratos de alta gama, musgo Sphagnum y fertilizantes balanceados que utilizamos en nuestros propios invernaderos. En la sección de tienda encontrarás todo el equipo necesario.'
    }
];

async function seedFaq() {
    console.log("🌱 Inyectando Preguntas Frecuentes en Firestore (site_config/faq)...");
    try {
        await setDoc(doc(db, 'site_config', 'faq'), { items: FAQs });
        console.log("✅ ¡Preguntas frecuentes inyectadas exitosamente en la base de datos!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inyectando FAQ:", error);
        process.exit(1);
    }
}

seedFaq();
