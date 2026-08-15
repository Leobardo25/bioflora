import fs from 'fs';
import { db } from '../src/firebase/firebase.js';
import { collection, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

const TO_ZERO_PATH = "d:\\PrecenciaDigitalCR\\Bioflora\\public\\bioflora img\\orquidias\\products_to_zero_price.json";

async function main() {
    console.log("=== ESTABLECIENDO PRECIO 0 EN PRODUCTOS DE 'ORQUIDIAS' SIN PRECIO CONFIRMADO ===");
    const toZeroList = JSON.parse(fs.readFileSync(TO_ZERO_PATH, 'utf-8'));
    console.log(`📦 Total productos a actualizar con precio 0: ${toZeroList.length}`);

    let updatedCount = 0;
    for (const item of toZeroList) {
        try {
            await updateDoc(doc(db, 'products', item.id), {
                price: 0,
                wholesalePrice: 0,
                updatedAt: serverTimestamp()
            });
            updatedCount++;
            console.log(` ✅ [${updatedCount}/${toZeroList.length}] ${item.name} -> Precio establecido en 0 (Antes: ${item.old_price} ${item.currency})`);
        } catch (err) {
            console.warn(` ⚠️ Error al actualizar ID ${item.id} (${item.name}):`, err.message);
        }
    }

    console.log("\n=============================================");
    console.log(`🎉 ACTUALIZACIÓN COMPLETADA!`);
    console.log(`✅ ${updatedCount} productos quedaron con precio 0 para fácil identificación.`);
    console.log("=============================================");
    process.exit(0);
}

main().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
