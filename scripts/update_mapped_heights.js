import fs from 'fs';
import { db } from '../src/firebase/firebase.js';
import { collection, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

const TARGET_MAP = {
    "Cattleya luminosa (C. dowiana x C. tenebrosa)": "Cattleya luminosa (dowiana X tenebrosa)",
    "Cattleya percivaliana x Cattleya Victoria Regina": "Cattleya percivaliana X Victoria Regina",
    "Dendrobium CF - 5 Pink Stripe": "D. CF-5, Pink stripe.",
    "Dendrobium Liberty White": "D. Liberty White.",
    "Dendrobium Malaysia Green": "D. Malaysia Green.",
    "Dendrobium Patum Red": "D. Patum Red.",
    "Dendrobium Spice Ice - # 260": "D. Spice Ice OT260",
    "Dendrobium Yellow with Red Lip - # 298": "D. Yellow With Red Lip #298",
    "Vanilla tahitiensis (V. planifolia x V. odorata)": "Vanilla tahitensis"
};

const EXTRA_DETAILS = {
    "Cattleya luminosa (dowiana X tenebrosa)": { tamano: "14 a 20 cms", wholesalePrice: 8250 },
    "Cattleya percivaliana X Victoria Regina": { tamano: "10 cms", wholesalePrice: 4000 },
    "D. CF-5, Pink stripe.": { tamano: "10 a 13 cms", wholesalePrice: 5000 },
    "D. Liberty White.": { tamano: "10 a 13 cms", wholesalePrice: 5000 },
    "D. Malaysia Green.": { tamano: "10 a 14 cms", wholesalePrice: 5000 },
    "D. Patum Red.": { tamano: "10 a 15 cms", wholesalePrice: 5000 },
    "D. Spice Ice OT260": { tamano: "10 cms", wholesalePrice: 5000 },
    "D. Yellow With Red Lip #298": { tamano: "10 cms", wholesalePrice: 5000 },
    "Vanilla tahitensis": { tamano: "30 a 50 cms (con maceta #3 y tutor)", wholesalePrice: 5200 }
};

async function main() {
    const productsSnap = await getDocs(collection(db, 'products'));
    for (const d of productsSnap.docs) {
        const name = d.data().name;
        if (EXTRA_DETAILS[name]) {
            const data = EXTRA_DETAILS[name];
            await updateDoc(doc(db, 'products', d.id), {
                tamano: data.tamano,
                ml: data.tamano,
                updatedAt: serverTimestamp()
            });
            console.log(` ✅ Actualizada altura en: ${name} -> ${data.tamano}`);
        }
    }
    console.log("Todas las alturas y especificaciones aplicadas!");
    process.exit(0);
}

main().catch(console.error);
