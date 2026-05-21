import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace with your Firebase config or set up .env.local
const firebaseConfig = {
  apiKey: "AIzaSyBQIC4-pssHVaRCMAj51_ZOg_3z46Vprxw",
  authDomain: "bioflora-edb38.firebaseapp.com",
  projectId: "bioflora-edb38",
  storageBucket: "bioflora-edb38.firebasestorage.app",
  messagingSenderId: "363345581472",
  appId: "1:363345581472:web:668255632516c9c70580c5",
  measurementId: "G-HRPLX0NML0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
