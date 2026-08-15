import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../src/firebase/firebase.js';
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwlziwajv/image/upload";
const CLOUDINARY_API_KEY = "126569116362927";
const CLOUDINARY_API_SECRET = "R0COINLHSSAmUSPDgYGJ8jtbZyc";

const DATASET_PATH = "d:\\PrecenciaDigitalCR\\Bioflora\\public\\bioflora img\\Nueva carpeta (2)\\catalog2_final_products_dataset.json";

async function uploadLocalImage(filePath) {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const strToSign = `folder=bioflora_products&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = `data:image/png;base64,${fileBuffer.toString('base64')}`;

    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "bioflora_products");

    const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Error al subir a Cloudinary");
    }

    return data.secure_url;
}

async function ensureFamiliesExist(products) {
    console.log("--- 1. Asegurando Familias Botánicas en Firestore ---");
    const familiesRef = collection(db, 'families');
    const existingSnap = await getDocs(familiesRef);
    const existingNames = new Set(existingSnap.docs.map(d => d.data().name));

    const uniqueFamilies = [...new Set(products.map(p => p.family))];
    for (const famName of uniqueFamilies) {
        if (!existingNames.has(famName)) {
            const newFamDoc = doc(familiesRef);
            await setDoc(newFamDoc, {
                name: famName,
                description: `Familia botánica y género ${famName} de orquídeas y flora tropical selecta.`,
                createdAt: serverTimestamp()
            });
            console.log(` ✨ Creada nueva familia botánica: ${famName}`);
            existingNames.add(famName);
        }
    }
}

async function main() {
    console.log("=== INICIANDO SUBIDA Y REGISTRO MASIVO DEL CATÁLOGO 2 ===");
    const rawData = fs.readFileSync(DATASET_PATH, 'utf-8');
    const products = JSON.parse(rawData);
    console.log(`📦 Total productos a procesar: ${products.length}`);

    // 1. Asegurar familias
    await ensureFamiliesExist(products);

    // 2. Subir a Cloudinary y Crear en Firestore
    console.log("\n--- 2. Subiendo Imágenes a Cloudinary y Creando Documentos en Firestore ---");
    const productsRef = collection(db, 'products');

    let processed = 0;
    const errors = [];

    // Procesar con concurrencia de 3
    const CONCURRENCY = 3;
    for (let i = 0; i < products.length; i += CONCURRENCY) {
        const chunk = products.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(async (prod) => {
            try {
                // Subir portada a Cloudinary
                const coverUrl = await uploadLocalImage(prod.localImagePath);

                // Crear documento en Firestore
                const newDocRef = doc(productsRef);

                const firestoreDoc = {
                    name: prod.name,
                    category: prod.category,
                    family: prod.family,
                    price: Number(prod.price),
                    wholesalePrice: Number(prod.wholesalePrice) || 0,
                    currency: prod.currency || "USD",
                    tamano: prod.tamano || "FS - Planta Adulta (Floración)",
                    ml: prod.ml || "FS (Floración)",
                    stock: prod.stock || "Disponible",
                    isFeatured: Boolean(prod.isFeatured),
                    notes: prod.notes,
                    careGuide: prod.careGuide,
                    description: prod.description,
                    coverImage: coverUrl,
                    imageUrl: coverUrl,
                    galleryImages: [],
                    subfolderOrigin: prod.subfolder,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                await setDoc(newDocRef, firestoreDoc);
                processed++;
                console.log(` [${processed}/${products.length}] ✅ Creado: ${prod.name} ($${prod.price} USD)`);
            } catch (err) {
                console.error(` ❌ Error en ${prod.name}:`, err.message);
                errors.push({ name: prod.name, error: err.message });
            }
        }));
    }

    console.log("\n=============================================");
    console.log(`🎉 PROCESO COMPLETADO!`);
    console.log(`✅ Exitosos: ${processed} de ${products.length}`);
    if (errors.length > 0) {
        console.log(`⚠️ Errores (${errors.length}):`, errors);
    }
    console.log("=============================================");
    process.exit(0);
}

main().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
