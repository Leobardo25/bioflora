import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBQIC4-pssHVaRCMAj51_ZOg_3z46Vprxw",
    authDomain: "bioflora-edb38.firebaseapp.com",
    projectId: "bioflora-edb38",
    storageBucket: "bioflora-edb38.firebasestorage.app",
    messagingSenderId: "363345581472",
    appId: "1:363345581472:web:668255632516c9c70580c5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FAMILIES = [
    { name: "Araceae", description: "Familia de plantas monocotiledóneas, famosas por sus hojas espectaculares y floración en espádice (Monsteras, Filodendros, Anturios)." },
    { name: "Gesneriaceae", description: "Plantas de flores vistosas y follajes aterciopelados, nativas de climas cálidos y húmedos (como las Episcias)." },
    { name: "Apocynaceae", description: "Familia que incluye plantas suculentas o semisuculentas trepadoras conocidas por su resina lechosa y flores cerosas (como las Hoyas)." },
    { name: "Marantaceae", description: "Las llamadas 'plantas rezadoras' por su capacidad de plegar las hojas en la noche, con patrones geométricos espectaculares." },
    { name: "Orchidaceae", description: "Una de las familias de flores más diversas y evolucionadas del planeta, apreciadas por su belleza única (Orquídeas)." },
    { name: "Polypodiaceae", description: "Helechos epífitos de porte majestuoso y hojas esculturales adaptadas al sotobosque y troncos de árboles." }
];

const PRODUCTS = [
    {
        name: "Philodendron 'Prince of Orange' (Filodendro)",
        category: "Exóticas",
        family: "Araceae",
        price: 28000,
        currency: "CRC",
        ml: 'Maceta 8"',
        stock: "Disponible",
        notes: "Sombra ligera · Riego moderado · Follaje cobrizo evolutivo.",
        description: "Ejemplar de colección sumamente cotizado. Sus hojas nuevas emergen con un color naranja vibrante y cálido, madurando gradualmente a tonos cobrizos y finalmente verde bosque profundo. Los pecíolos y tallos rojizos completan una paleta de colores tropicales espectacular.",
        coverImage: "/Productos/philodendron_prince_of_orange.jpeg",
        galleryImages: [],
        isFeatured: true,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 2,
            wateringLabel: "Riego Moderado",
            substrate: "aracea-orquidea",
            substrateLabel: "Mezcla de Orquídeas / Aráceas",
            difficulty: 2
        }
    },
    {
        name: "Episcia cupreata (Cama de Novia)",
        category: "Exóticas",
        family: "Gesneriaceae",
        price: 8500,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Luz filtrada · Mantener húmedo sin encharcar · Follaje aterciopelado.",
        description: "Delicada planta colgante de follaje aterciopelado. Sus hojas presentan una venación plateada-metálica sobre fondos cobrizos, complementada con hermosas y abundantes flores rojas tubulares. Ideal para rincones cálidos y húmedos en interiores.",
        coverImage: "/Productos/episcia_cupreata.jpg",
        galleryImages: [],
        isFeatured: true,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 2,
            wateringLabel: "Riego Moderado",
            substrate: "suelo-rico",
            substrateLabel: "Suelo Rico / Materia Orgánica",
            difficulty: 1
        }
    },
    {
        name: "Epipremnum aureum 'N'Joy' (Potus N'Joy)",
        category: "Exóticas",
        family: "Araceae",
        price: 9500,
        currency: "CRC",
        ml: 'Maceta 6" Colgante',
        stock: "Disponible",
        notes: "Luz indirecta brillante · Riego al secar sustrato · Fácil propagación.",
        description: "Variedad compacta y elegante del clásico potus. Sus pequeñas hojas en forma de corazón muestran parches definidos y nítidos de blanco crema y verde esmeralda. Crece con un hermoso porte rastrero o colgante.",
        coverImage: "/Productos/potus_njoy.jpg",
        galleryImages: [],
        isFeatured: false,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 2,
            wateringLabel: "Riego Moderado",
            substrate: "mezcla-porosa",
            substrateLabel: "Mezcla Porosa / Poca Tierra",
            difficulty: 1
        }
    },
    {
        name: "Hoya carnosa 'Krimson Queen' (Flor de Cera)",
        category: "Exóticas",
        family: "Apocynaceae",
        price: 16500,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Luz brillante filtrada · Riego muy bajo · Hojas cerosas.",
        description: "Planta trepadora suculenta altamente cotizada. Sus hojas coriáceas y cerosas están bordeadas por una variegación blanca y rosada que puede cubrir hojas enteras en condiciones de buena luz. Sus flores agrupadas parecen hechas de porcelana o cera.",
        coverImage: "/Productos/hoya_krimson_queen.jpg",
        galleryImages: [],
        isFeatured: true,
        careGuide: {
            light: "alta",
            lightLabel: "Alta / Luz Filtrada",
            watering: 1,
            wateringLabel: "Poco Riego",
            substrate: "aracea-orquidea",
            substrateLabel: "Mezcla de Orquídeas / Aráceas",
            difficulty: 2
        }
    },
    {
        name: "Monstera adansonii (Esqueleto / Monkey Mask)",
        category: "Exóticas",
        family: "Araceae",
        price: 12500,
        currency: "CRC",
        ml: 'Maceta 6" con Tutor',
        stock: "Disponible",
        notes: "Humedad ambiental · Luz indirecta media · Follaje fenestrado.",
        description: "Exótica planta trepadora caracterizada por sus múltiples fenestraciones naturales en las hojas. Su follaje verde esmeralda y porte colgante le otorgan un aspecto selvático y exuberante ideal para estantes o repisas en interiores.",
        coverImage: "/Productos/monstera_adansonii.jpg",
        galleryImages: [],
        isFeatured: true,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 2,
            wateringLabel: "Riego Moderado",
            substrate: "aracea-orquidea",
            substrateLabel: "Mezcla de Orquídeas / Aráceas",
            difficulty: 1
        }
    },
    {
        name: "Philodendron hastatum 'Silver Sword' (Espada de Plata)",
        category: "Exóticas",
        family: "Araceae",
        price: 22000,
        currency: "CRC",
        ml: 'Maceta 8" con Tutor',
        stock: "Disponible",
        notes: "Tutor de musgo · Luz indirecta brillante · Tono plateado metálico.",
        description: "Filodendro trepador excepcional que destaca por sus hojas lanceoladas en forma de espada de un color verde grisáceo plateado metálico. Es una pieza de diseño botánico muy valorada que requiere de un tutor para desarrollar hojas de gran tamaño.",
        coverImage: "/Productos/philodendron_silver_sword.jpg",
        galleryImages: [],
        isFeatured: true,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 2,
            wateringLabel: "Riego Moderado",
            substrate: "aracea-orquidea",
            substrateLabel: "Mezcla de Orquídeas / Aráceas",
            difficulty: 2
        }
    },
    {
        name: "Philodendron hederaceum 'Brasil'",
        category: "Exóticas",
        family: "Araceae",
        price: 11000,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Fácil cuidado · Luz indirecta media · Hojas acorazonadas variegadas.",
        description: "Variedad colgante muy resistente y vistosa. Sus hojas acorazonadas muestran un patrón central de color verde limón y amarillo brillante como si hubieran sido pintadas a pinceladas. Tolera bien condiciones de luz moderada en interiores.",
        coverImage: "/Productos/philodendron_brasil.jpg",
        galleryImages: [],
        isFeatured: false,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 2,
            wateringLabel: "Riego Moderado",
            substrate: "mezcla-porosa",
            substrateLabel: "Mezcla Porosa / Poca Tierra",
            difficulty: 1
        }
    },
    {
        name: "Maranta leuconeura 'Lemon Lime' (Planta de la Oración)",
        category: "Exóticas",
        family: "Marantaceae",
        price: 14500,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Alta humedad ambiente · Sombra húmeda · Movimiento foliar nocturno.",
        description: "Fascinante planta de follaje dinámico que pliega sus hojas hacia arriba durante la noche (efecto de oración). Su variegación en espinas de pescado de color verde limón brillante destaca sobre un fondo verde oscuro aterciopelado.",
        coverImage: "/Productos/maranta_lemon_lime.jpeg",
        galleryImages: [],
        isFeatured: true,
        careGuide: {
            light: "media",
            lightLabel: "Media / Sombra Ligera",
            watering: 3,
            wateringLabel: "Riego Frecuente",
            substrate: "suelo-rico",
            substrateLabel: "Suelo Rico / Materia Orgánica",
            difficulty: 2
        }
    }
];

async function cleanData() {
    console.log("🧹 Borrando productos existentes en Firestore...");
    const productsRef = collection(db, 'products');
    const productsSnap = await getDocs(productsRef);
    for (const d of productsSnap.docs) {
        await deleteDoc(doc(db, 'products', d.id));
    }
    
    console.log("🧹 Borrando familias existentes en Firestore...");
    const familiesRef = collection(db, 'families');
    const familiesSnap = await getDocs(familiesRef);
    for (const d of familiesSnap.docs) {
        await deleteDoc(doc(db, 'families', d.id));
    }
    console.log("✅ Limpieza completada.");
}

async function run() {
    try {
        console.log("🌿 === INICIANDO SIEMBRA DE BIOFLORA V2 ===");
        await cleanData();

        console.log("\n🌱 Sembrando familias botánicas...");
        for (const fam of FAMILIES) {
            const docRef = doc(collection(db, 'families'));
            await setDoc(docRef, {
                ...fam,
                createdAt: serverTimestamp()
            });
            console.log(`   ✓ Familia sembrada: ${fam.name}`);
        }

        console.log("\n📦 Sembrando productos botánicos...");
        for (const prod of PRODUCTS) {
            const docRef = doc(collection(db, 'products'));
            await setDoc(docRef, {
                ...prod,
                quantity: prod.stock === "Disponible" ? 10 : 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`   ✓ Producto sembrado: ${prod.name}`);
        }

        console.log("\n🎉 ¡Siembra completada con éxito!");
        process.exit(0);
    } catch (e) {
        console.error("Error al sembrar:", e);
        process.exit(1);
    }
}

run();
