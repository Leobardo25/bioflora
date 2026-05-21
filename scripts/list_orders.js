import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmLxDzGdS0R776e18-fr2GAziHJXlYays",
  authDomain: "valexperfumeria-75c23.firebaseapp.com",
  projectId: "valexperfumeria-75c23",
  storageBucket: "valexperfumeria-75c23.firebasestorage.app",
  messagingSenderId: "32346089827",
  appId: "1:32346089827:web:58e24fb6d88e1d66194b56"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listOrders() {
  console.log("=== LISTANDO ÓRDENES EN FIRESTORE ===");
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    if (querySnapshot.empty) {
      console.log("No se encontraron órdenes en la colección 'orders'.");
      process.exit(0);
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nDocument ID: ${doc.id}`);
      console.log(`Order Code : ${data.orderId || data.orderNumber || data.id || 'N/A'}`);
      console.log(`Cliente    : ${data.customerName || data.name || (data.customer && data.customer.name) || 'N/A'}`);
      console.log(`Teléfono   : ${data.customerPhone || data.phone || (data.customer && data.customer.phone) || 'N/A'}`);
      console.log(`Total      : ${data.total || 'N/A'}`);
      console.log(`Fecha      : ${data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || 'N/A'}`);
      console.log(`Detalle    : ${JSON.stringify(data.items || data.products || [])}`);
      console.log("-----------------------------------------");
    });
  } catch (error) {
    console.error("Error al consultar las órdenes:", error);
  }
  process.exit(0);
}

listOrders();
