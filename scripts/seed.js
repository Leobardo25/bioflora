import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Leer .env.local para extraer credenciales
const envPath = path.resolve(__dirname, '../.env.local');
let envFile = '';
try {
    envFile = fs.readFileSync(envPath, 'utf8');
} catch (err) {
    console.error("❌ No se encontró el archivo .env.local. Asegúrate de tenerlo configurado.");
    process.exit(1);
}

const getEnv = (key) => {
    const match = envFile.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim().replace(/['"]/g, '') : undefined;
};

// Usamos la nueva DB bioflora-edb38
const firebaseConfig = {
    apiKey: "AIzaSyBQIC4-pssHVaRCMAj51_ZOg_3z46Vprxw",
    authDomain: "bioflora-edb38.firebaseapp.com",
    projectId: "bioflora-edb38",
    storageBucket: "bioflora-edb38.firebasestorage.app",
    messagingSenderId: "363345581472",
    appId: "1:363345581472:web:668255632516c9c70580c5"
};

console.log("🌿 [Bioflora Seed] Conectando a Firebase con Proyecto:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cloudinary
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwlziwajv/image/upload";
const CLOUDINARY_API_KEY = "126569116362927";
const CLOUDINARY_API_SECRET = "R0COINLHSSAmUSPDgYGJ8jtbZyc";

// 2. Las 6 especies botánicas premium de Costa Rica (de SeedProducts.jsx)
const NEW_PRODUCTS = [
    {
        name: "Guaria Morada (Guarianthe skinneri)",
        category: "Orquídeas",
        family: "Orchidaceae (Flor Nacional)",
        price: 18500,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Sombra parcial · Riego 2 veces por semana · Alta humedad ambiente.",
        description: "La flor nacional de Costa Rica. Esta orquídea epífita destaca por sus espectaculares flores de color morado fucsia vibrante, dispuestas en ramilletes. Es un símbolo de la biodiversidad y el folclor costarricense, ideal para coleccionistas exigentes y amantes de la botánica nativa.",
        localImageUrl: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Monstera Deliciosa Variegata",
        category: "Exóticas",
        family: "Araceae",
        price: 45000,
        currency: "CRC",
        ml: 'Maceta 8"',
        stock: "Disponible",
        notes: "Luz indirecta brillante · Riego cuando el sustrato seque · Sustrato aireante.",
        description: "La reina indiscutible de las plantas de interior de lujo. Cada hoja cuenta una historia única con patrones de variegación blanco crema y verde esmeralda. Cultivada bajo estrictos estándares agrícolas para asegurar raíces fuertes y un follaje espectacular.",
        localImageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Anturio Negro (Anthurium Black)",
        category: "Flores Tropicales",
        family: "Araceae",
        price: 15000,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Sombra moderada · Riego regular sin encharcamiento · Mantener hojas limpias.",
        description: "Una de las variedades más exóticas y elegantes de anturio. Sus espatas cerosas en tonos purpuras oscuros casi negros brindan un toque minimalista e industrial al hogar. Excelente durabilidad de floración y resistencia.",
        localImageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Orquídea Mariposa Amarilla (Phalaenopsis)",
        category: "Orquídeas",
        family: "Orchidaceae",
        price: 16500,
        currency: "CRC",
        ml: 'Maceta Translúcida 5"',
        stock: "Disponible",
        notes: "Luz filtrada · Riego por inmersión semanal · Fertilizante especial mensual.",
        description: "Orquídea Phalaenopsis híbrida de alta calidad con pétalos amarillos cálidos e intensos y labelo naranja. Su elegante tallo floral arqueado ofrece una floración que puede extenderse hasta por 3 meses en condiciones óptimas de interior.",
        localImageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Alocasia Polly (Oreja de Elefante)",
        category: "Exóticas",
        family: "Araceae",
        price: 12500,
        currency: "CRC",
        ml: 'Maceta 6"',
        stock: "Disponible",
        notes: "Humedad alta · Luz indirecta media · Riego regular.",
        description: "Una planta tropical de impacto visual inmediato. Sus hojas en forma de escudo presentan nervaduras blanco plateado ultra marcadas sobre un verde oscuro metálico profundo. Una obra de arte viviente originaria del sotobosque húmedo.",
        localImageUrl: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Sustrato Premium para Orquídeas",
        category: "Accesorios",
        family: "Insumos Profesionales",
        price: 4500,
        currency: "CRC",
        ml: "Bolsa 2 Litros",
        stock: "Disponible",
        notes: "Corteza de pino premium · Carbón vegetal · Fibra de coco · Perlita.",
        description: "Mezcla profesional aireada de grado botánico, idéntica a la utilizada en los invernaderos de Bioflora. Garantiza un excelente drenaje y la oxigenación óptima que las raíces de las orquídeas epífitas necesitan para prosperar.",
        localImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: false
    }
];

async function cleanExistingData() {
    console.log("🧹 Limpiando productos existentes en Firestore...");
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    for (const d of querySnapshot.docs) {
        console.log(`Deleting product ID: ${d.id} from Firestore`);
        // Borrar db, ignoramos Storage/Cloudinary
        await deleteDoc(doc(db, 'products', d.id));
    }
    console.log("✅ Limpieza completada.");
}

async function uploadToCloudinary(imageUrl) {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const strToSign = `folder=bioflora_products&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Fetch fallido con código: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    
    // Node.js no soporta FormData de manera nativa igual que el navegador para Buffers fácilmente,
    // a menos que usemos Blob o fetch nativo de Node 18+ que sí tiene FormData
    // pero para ir a lo seguro en Cloudinary, si le pasamos la URL directamente, él la descarga!
    // ¡Cloudinary permite pasar un URL en el campo 'file'!
    
    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "bioflora_products");

    const cloudinaryResponse = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const data = await cloudinaryResponse.json();
    if (!cloudinaryResponse.ok) {
        throw new Error(data.error?.message || "Error al subir a Cloudinary");
    }

    return data.secure_url;
}

async function runSeeder() {
    try {
        console.log("🌱 === INICIANDO SIEMBRA BOTÁNICA BIOFLORA ===");
        
        await cleanExistingData();
        
        console.log("\n🌾 Propagando las nuevas especies premium en Costa Rica...");
        let count = 0;
        
        for (const prod of NEW_PRODUCTS) {
            console.log(`\n📦 Procesando: ${prod.name}`);
            
            // Generar un ID de Firestore
            const newDocRef = doc(collection(db, 'products'));
            const productId = newDocRef.id;
            
            let coverImageUrl = prod.localImageUrl;
            let galleryUrls = [];
            
            try {
                console.log(`   ⬇️ Subiendo imagen a Cloudinary para: ${prod.name}`);
                coverImageUrl = await uploadToCloudinary(prod.localImageUrl);
                console.log(`   ✓ Imagen de portada subida a Cloudinary: ${coverImageUrl}`);
                
                // Si tuviera galería, la descargamos y subimos
                if (prod.localGalleryUrls && prod.localGalleryUrls.length > 0) {
                    for (let idx = 0; idx < prod.localGalleryUrls.length; idx++) {
                        const galUrl = prod.localGalleryUrls[idx];
                        console.log(`   ⬇️ Subiendo imagen de galería ${idx} a Cloudinary...`);
                        const uploadedGalUrl = await uploadToCloudinary(galUrl);
                        galleryUrls.push(uploadedGalUrl);
                    }
                }
            } catch (err) {
                console.warn(`   ⚠️ Advertencia al procesar imágenes para ${prod.name}: ${err.message}. Usando URL remota.`);
            }
            
            const finalProduct = {
                ...prod,
                coverImage: coverImageUrl,
                galleryImages: galleryUrls,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            delete finalProduct.localImageUrl;
            delete finalProduct.localGalleryUrls;
            
            await setDoc(newDocRef, finalProduct);
            console.log(`   ✅ Guardado en Firestore con ID: ${productId}`);
            count++;
        }
        
        console.log(`\n🎉 ¡Siembra botánica completada con éxito! Se inyectaron ${count} productos.`);
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error crítico en el sembrador de productos:", error);
        process.exit(1);
    }
}

runSeeder();
