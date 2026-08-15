import { db } from '../src/firebase/firebase.js';
import { collection, doc, getDocs, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// 1. List of 22 Duplicate Document IDs to remove
const DUPLICATE_IDS_TO_DELETE = [
    "17XRpibuynMcCu4c82Zx", // Cattleya brymeriana (Cat 1)
    "59svXmoNmjAKRqsY4sZe", // Dendrobium Patum Red (Cat 1)
    "DELJWu3N9AAppqEp2d44", // Dendrobium Yellow with Red Lip (Cat 1)
    "HZnLeT8Hd3w3Hn9HtpQC", // Guarianthe skinneri (Cat 1)
    "L8VguPRBFlEHMJnFwwrP", // Cattleya goldenzelle (Cat 1)
    "MGLCbyLn4IyFg2KzXDbG", // Stanhopea ecornuta (Cat 1)
    "NDAvhVtwUhdZnUVGNR57", // Cattleya lueddemanniana (Cat 1)
    "Yqxxc8pbvybFxPx7rOVh", // Dendrobium Liberty White (Cat 1)
    "dqiFx89JNoxfVgWuL8R0", // Vainilla x Costa Rica (Cat 1)
    "mAnW6ImzxZOG5p2q6NKS", // Encyclia alata (Cat 1)
    "rY9ql8BTOiv3jci9pwjT", // Dendrobium Malaysia Green (Cat 1)
    "YkWQF1Q0pLtcpxf5uVva", // Dendrobium Spice Ice - # 260 (Cat 1)
    "bry6JKzhfp3xPOvjQu8M", // Dendrobium CF - 5 Pink Stripe (Cat 1)
    "pVuld32Z0UwrdYWlnC56", // Cattleya luminosa (Cat 1)
    "sVWMV8j6MXT3gVktofkV", // Cattleya percivaliana x Victoria Regina (Cat 1)
    "SDmEcvFJLxMkkllKNEOa", // Vanilla tahitiensis (Cat 1)
    "BMy3NVVlVuqnIAw0zjyg", // V. Kulwadee Fragrant (2) (Cat 1 copy)
    "PMaarLBHTFSAXs8ZSlQI", // V. Majik Fancy (2) (Cat 1 copy)
    "geFSatUkQ2M2McAgv7Eb", // V. Suksamran Sunlight (2) (Cat 1 copy)
    "tTfVXAoiWYrlaHkmEwxv", // Vainilla sotoarenassii (Cat 1 copy)
    "v3BeXDEzn48ON6CrJZJK", // V. Patchara Delight (2) (Cat 1 copy)
    "vbtSiYsnCTzSbcA9rUMU", // Mokaras (Cat 1 copy)
];

// Helper to determine the standard botanical family based on product name and existing properties
function determineStandardFamily(prod) {
    const name = (prod.name || '').toLowerCase();
    const cat = prod.category || '';

    if (cat === 'Accesorios' || cat === 'Insumos' || name.includes('sustrato')) {
        return 'Insumos Profesionales';
    }

    if (name.includes('cattleya') || name.includes('blc.') || name.includes('rlc.') || name.includes('c. ') || name.includes('cattlianthe')) {
        return 'Orchidaceae (Cattleya)';
    }
    if (name.includes('dendrobium') || name.includes('den.') || name.startsWith('d. ')) {
        return 'Orchidaceae (Dendrobium)';
    }
    if (name.includes('vanda') || name.startsWith('v. ') || name.includes('mokara') || name.includes('rhynchostylis') || name.includes('ascocenda')) {
        return 'Orchidaceae (Vanda)';
    }
    if (name.includes('tolumnia') || name.startsWith('tolu.') || name.includes('oncidium')) {
        return 'Orchidaceae (Tolumnia)';
    }
    if (name.includes('phalaenopsis')) {
        return 'Orchidaceae (Phalaenopsis)';
    }
    if (name.includes('guarianthe') || name.includes('guaria morada')) {
        return 'Orchidaceae (Guarianthe)';
    }
    if (name.includes('epidendrum')) {
        return 'Orchidaceae (Epidendrum)';
    }
    if (name.includes('stanhopea')) {
        return 'Orchidaceae (Stanhopea / Torito)';
    }
    if (name.includes('vainilla') || name.includes('vanilla')) {
        return 'Orchidaceae (Vanilla / Vainilla)';
    }
    if (name.includes('spathoglottis')) {
        return 'Orchidaceae (Spathoglottis)';
    }
    if (name.includes('psychopsis') || name.includes('gongora') || name.includes('huntleya') || 
        name.includes('peristeria') || name.includes('bulbophyllum') || name.includes('galeottia') || 
        name.includes('trichopilia') || name.includes('coelogyne') || name.includes('eriopsis') || 
        name.includes('myrmecophila') || name.includes('encyclia')) {
        return 'Orchidaceae (Colección Exótica)';
    }
    if (name.includes('anthurium') || name.includes('anturio') || name.includes('monstera') || 
        name.includes('alocasia') || name.includes('philodendron') || name.includes('filodendro') || 
        name.includes('epipremnum') || name.includes('syngonium')) {
        return 'Araceae';
    }
    if (name.includes('episcia') || name.includes('violeta')) {
        return 'Gesneriaceae';
    }
    if (name.includes('hoya')) {
        return 'Apocynaceae';
    }
    if (name.includes('calathea') || name.includes('maranta') || name.includes('ctenanthe')) {
        return 'Marantaceae';
    }
    if (name.includes('helecho') || name.includes('platycerium') || name.includes('cuerno')) {
        return 'Polypodiaceae';
    }

    // Default to existing or Orchidaceae
    return prod.family || 'Orchidaceae';
}

async function main() {
    console.log("=== INICIANDO LIMPIEZA DE DUPLICADOS Y ESTANDARIZACIÓN DE FAMILIAS ===");

    // 1. ELIMINAR LOS 22 DUPLICADOS SELECCIONADOS
    console.log(`\n--- 1. Eliminando ${DUPLICATE_IDS_TO_DELETE.length} productos duplicados ---`);
    let deletedCount = 0;
    for (const id of DUPLICATE_IDS_TO_DELETE) {
        try {
            await deleteDoc(doc(db, 'products', id));
            deletedCount++;
            console.log(` 🗑️ Eliminado duplicado ID: ${id}`);
        } catch (err) {
            console.warn(` ⚠️ Error al eliminar ${id}:`, err.message);
        }
    }
    console.log(`✅ Duplicados eliminados exitosamente: ${deletedCount}`);

    // 2. ESTANDARIZAR FAMILIAS BOTÁNICAS EN TODOS LOS PRODUCTOS RESTANTES
    console.log(`\n--- 2. Estandarizando Familias Botánicas en todos los productos restantes ---`);
    const productsSnap = await getDocs(collection(db, 'products'));
    let updatedCount = 0;

    for (const d of productsSnap.docs) {
        const data = d.data();
        const correctFamily = determineStandardFamily(data);

        if (data.family !== correctFamily) {
            await updateDoc(doc(db, 'products', d.id), {
                family: correctFamily,
                updatedAt: serverTimestamp()
            });
            updatedCount++;
            console.log(` 🔄 [${d.data().name}] Familia actualizada: "${data.family}" -> "${correctFamily}"`);
        }
    }
    console.log(`✅ Productos con familia actualizada: ${updatedCount}`);

    // 3. ASEGURAR QUE EL CATÁLOGO DE FAMILIAS EN FIRESTORE REFLEJE LA NUEVA ESTRUCTURA
    console.log(`\n--- 3. Actualizando colección 'families' en Firestore ---`);
    const finalProductsSnap = await getDocs(collection(db, 'products'));
    const distinctFamilies = [...new Set(finalProductsSnap.docs.map(d => d.data().family).filter(Boolean))].sort();

    const familiesCollection = collection(db, 'families');
    const existingFamiliesSnap = await getDocs(familiesCollection);
    const existingFamMap = new Map();
    existingFamiliesSnap.docs.forEach(d => existingFamMap.set(d.data().name, d.id));

    for (const fam of distinctFamilies) {
        if (!existingFamMap.has(fam)) {
            const newDoc = doc(familiesCollection);
            await setDoc(newDoc, {
                name: fam,
                description: `Familia botánica y género ${fam} en Bioflora.`,
                createdAt: serverTimestamp()
            });
            console.log(` ✨ Creada familia en catálogo: ${fam}`);
        }
    }

    console.log("\n=============================================");
    console.log("🎉 LIMPIEZA Y REORGANIZACIÓN COMPLETADA AL 100%!");
    console.log(`📦 Total productos activos en tienda: ${finalProductsSnap.docs.length}`);
    console.log(`🏛️ Total familias botánicas activas: ${distinctFamilies.length}`);
    console.log("=============================================");
    process.exit(0);
}

main().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
