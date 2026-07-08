import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQIC4-pssHVaRCMAj51_ZOg_3z46Vprxw",
  authDomain: "bioflora-edb38.firebaseapp.com",
  projectId: "bioflora-edb38",
  storageBucket: "bioflora-edb38.firebasestorage.app",
  messagingSenderId: "363345581472",
  appId: "1:363345581472:web:668255632516c9c70580c5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  await setDoc(doc(db, 'site_config', 'landing'), {
    heroTitle: 'Innovación Agrobiotecnológica y *Soluciones Verdes',
    heroSubtitle: 'Cultivamos con Ciencia',
  }, { merge: true });

  console.log('✅ heroTitle y heroSubtitle actualizados en Firebase (site_config/landing)');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
