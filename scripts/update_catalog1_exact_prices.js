import fs from 'fs';
import { db } from '../src/firebase/firebase.js';
import { collection, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

const CURATED_PATH = "d:\\PrecenciaDigitalCR\\Bioflora\\public\\bioflora img\\Nueva carpeta\\curated_catalog1_data.json";

function normalize(str) {
    return (str || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function main() {
    console.log("=== ACTUALIZANDO PRECIOS REALES, MAYOREO Y ALTURAS DE ENTREGA (NUEVA CARPETA) ===");
    const curatedData = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf-8'));
    console.log(`📦 Datos curados para ${curatedData.length} plantas de Nueva carpeta.`);

    const productsSnap = await getDocs(collection(db, 'products'));
    const firestoreProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let updatedCount = 0;
    const notFound = [];

    for (const item of curatedData) {
        const targetNorm = normalize(item.name);
        
        // Find matching product in Firestore
        const match = firestoreProducts.find(p => {
            const pNorm = normalize(p.name);
            return pNorm === targetNorm || pNorm.includes(targetNorm) || targetNorm.includes(pNorm);
        });

        if (match) {
            const updatePayload = {
                price: Number(item.price),
                wholesalePrice: Number(item.wholesalePrice),
                currency: item.currency || "CRC",
                tamano: item.tamano || "Planta Establecida",
                ml: item.tamano || "Planta Establecida",
                family: item.family || match.family,
                updatedAt: serverTimestamp()
            };

            if (item.hasPresentations && item.presentaciones) {
                updatePayload.hasPresentations = true;
                updatePayload.presentaciones = item.presentaciones;
            }

            await updateDoc(doc(db, 'products', match.id), updatePayload);
            updatedCount++;
            console.log(` ✅ [${updatedCount}] Actualizado: ${match.name} -> Detalle: ₡${item.price} | Mayoreo: ₡${item.wholesalePrice} | Altura: ${item.tamano}`);
        } else {
            console.warn(` ⚠️ No se encontró en Firestore: ${item.name}`);
            notFound.push(item.name);
        }
    }

    console.log("\n=============================================");
    console.log(`🎉 ACTUALIZACIÓN COMPLETADA!`);
    console.log(`✅ Productos actualizados: ${updatedCount} de ${curatedData.length}`);
    if (notFound.length > 0) {
        console.log(`⚠️ No encontrados (${notFound.length}):`, notFound);
    }
    console.log("=============================================");
    process.exit(0);
}

main().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
