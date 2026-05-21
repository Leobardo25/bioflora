import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';
import fs from 'fs';

// -- FIREBASE CONFIG --
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

// -- CLOUDINARY CONFIG --
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwlziwajv/image/upload";
const CLOUDINARY_API_KEY = "126569116362927";
const CLOUDINARY_API_SECRET = "R0COINLHSSAmUSPDgYGJ8jtbZyc";

const NEW_PRODUCTS = [
    {
        name: "Monstera Deliciosa (Mano de Tigre)",
        category: "Exóticas",
        family: "Araceae",
        price: 25000,
        currency: "CRC",
        ml: 'Maceta Cerámica 8"',
        stock: "Disponible",
        notes: "Luz brillante indirecta • Riego moderado • Alta humedad recomendada.",
        description: "Ejemplar majestuoso de Monstera Deliciosa, conocida popularmente como Mano de Tigre. Sus fenestraciones perfectas y hojas de un verde profundo vibrante la convierten en la pieza central indiscutible de cualquier diseño de interiores biofílico. Cultivada bajo sombra controlada para maximizar el tamaño de sus hojas.",
        localFile: "C:\\Users\\Leonardo\\.gemini\\antigravity-ide\\brain\\d024d871-f7d8-41bb-972b-114be7f8d592\\monstera_mano_tigre_1779312307181.png",
        isFeatured: true
    },
    {
        name: "Guaria Morada (Guarianthe skinneri)",
        category: "Orquídeas",
        family: "Orchidaceae",
        price: 35000,
        currency: "CRC",
        ml: 'Maceta 6" con musgo',
        stock: "Limitado",
        notes: "Luz filtrada fuerte • Riego semanal abundante • Excelente ventilación.",
        description: "La flor nacional de Costa Rica en su máximo esplendor. Una orquídea epífita de colección con racimos de flores color púrpura vibrante. Ideal para coleccionistas y amantes de la botánica nacional. Adaptada a las condiciones climáticas locales para garantizar una floración espectacular cada temporada.",
        localFile: "C:\\Users\\Leonardo\\.gemini\\antigravity-ide\\brain\\d024d871-f7d8-41bb-972b-114be7f8d592\\guaria_morada_1779312498127.png",
        isFeatured: true
    },
    {
        name: "Helecho Cuerno de Alce (Platycerium)",
        category: "Exóticas",
        family: "Polypodiaceae",
        price: 28000,
        currency: "CRC",
        ml: 'Montaje en Madera Noble',
        stock: "Disponible",
        notes: "Luz indirecta brillante • Riego por inmersión • Pulverizar frondas.",
        description: "Una obra de arte viviente. Este helecho epífito, montado artesanalmente sobre una placa de madera noble, exhibe frondas majestuosas que se asemejan a las astas de un alce. Su presencia escultural transforma cualquier muro en una verdadera galería botánica de lujo.",
        localFile: "C:\\Users\\Leonardo\\.gemini\\antigravity-ide\\brain\\d024d871-f7d8-41bb-972b-114be7f8d592\\helecho_exotico_1779312537723.png",
        isFeatured: true
    }
];

async function cleanExistingData() {
    console.log("🧹 Limpiando productos existentes en Firestore...");
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    for (const d of querySnapshot.docs) {
        console.log(`Borrando producto: ${d.id}`);
        await deleteDoc(doc(db, 'products', d.id));
    }
    console.log("✅ Limpieza completada.");
}

async function uploadFileToCloudinary(localPath) {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const strToSign = `folder=bioflora_products&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    // Convertir el archivo local a DataURI base64 para subirlo vía FormData fetch
    const fileBuffer = fs.readFileSync(localPath);
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Data}`;
    
    const formData = new FormData();
    formData.append("file", dataUri);
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

async function run() {
    try {
        console.log("🌿 Iniciando Inyección de Productos Exclusivos...");
        await cleanExistingData();
        
        let count = 0;
        for (const prod of NEW_PRODUCTS) {
            console.log(`\n🌱 Procesando: ${prod.name}`);
            
            const newDocRef = doc(collection(db, 'products'));
            let coverImageUrl = '';
            
            try {
                console.log(`   ⬆️ Subiendo imagen local a Cloudinary...`);
                coverImageUrl = await uploadFileToCloudinary(prod.localFile);
                console.log(`   ✅ Subido exitosamente: ${coverImageUrl}`);
            } catch (err) {
                console.error(`   ❌ Error subiendo imagen de ${prod.name}:`, err.message);
                process.exit(1);
            }
            
            const finalProduct = {
                name: prod.name,
                category: prod.category,
                family: prod.family,
                price: prod.price,
                currency: prod.currency,
                ml: prod.ml,
                stock: prod.stock,
                notes: prod.notes,
                description: prod.description,
                coverImage: coverImageUrl,
                galleryImages: [],
                isFeatured: prod.isFeatured,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            await setDoc(newDocRef, finalProduct);
            console.log(`   ✅ Guardado en Firestore con ID: ${newDocRef.id}`);
            count++;
        }
        
        console.log(`\n🎉 Completado. Se inyectaron ${count} productos exclusivos.`);
        process.exit(0);
    } catch (err) {
        console.error("Error global:", err);
        process.exit(1);
    }
}

run();
