import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION_NAME = 'products';

// --- CLOUDINARY CONFIGURATION ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwlziwajv/image/upload";
const CLOUDINARY_API_KEY = "126569116362927";
const CLOUDINARY_API_SECRET = "R0COINLHSSAmUSPDgYGJ8jtbZyc";

/**
 * Helper para subir imágenes a Cloudinary usando firmas SHA-1 nativas (Web Crypto API)
 */
export const uploadToCloudinary = async (file) => {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    // Cloudinary requiere que TODOS los parámetros adicionales se ordenen alfabéticamente en la firma
    const strToSign = `folder=bioflora_products&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const buffer = new TextEncoder().encode(strToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "bioflora_products"); // Carpeta en Cloudinary

    const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Error al subir a Cloudinary");
    }

    return data.secure_url;
};

/**
 * Trae todos los productos desde Firestore
 */
export const getProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        throw error;
    }
};

/**
 * Trae un solo producto por su ID
 */
export const getProductById = async (id) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error(`Error obteniendo el producto ${id}:`, error);
        throw error;
    }
};

/**
 * Crea un producto nuevo, subiendo la imagen principal y las imágenes de galería a Cloudinary
 */
export const createProduct = async (productData, coverFile, galleryFiles = []) => {
    try {
        let coverImage = '';
        let galleryImages = [];

        // Generamos la referencia del documento ANTES de guardarlo
        const newDocRef = doc(collection(db, COLLECTION_NAME));
        const productId = newDocRef.id;

        // Subir Portada Principal a Cloudinary
        if (coverFile) {
            coverImage = await uploadToCloudinary(coverFile);
        }

        // Subir Imágenes de Galería Concurrente a Cloudinary
        if (galleryFiles && galleryFiles.length > 0) {
            const uploadPromises = galleryFiles.map(file => uploadToCloudinary(file));
            galleryImages = await Promise.all(uploadPromises);
        }

        const finalProductData = {
            ...productData,
            coverImage,
            galleryImages,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Guardamos el producto en Firestore
        await setDoc(newDocRef, finalProductData);
        
        return { id: productId, ...finalProductData };
    } catch (error) {
        console.error("Error creando producto:", error);
        throw error;
    }
};

/**
 * Actualiza un producto existente, y si hay imagen nueva, la sube a Cloudinary.
 */
export const updateProduct = async (id, productData, newCoverFile, currentCoverUrl, newGalleryFiles = [], currentGalleryUrls = []) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        let coverImage = currentCoverUrl || '';
        let galleryImages = [...(currentGalleryUrls || [])]; // Mantenemos las previas

        // Si hay nueva Portada, la subimos a Cloudinary
        if (newCoverFile) {
            coverImage = await uploadToCloudinary(newCoverFile);
        }

        // Si se subieron nuevas imágenes para la galería, las subimos a Cloudinary
        if (newGalleryFiles && newGalleryFiles.length > 0) {
            const uploadPromises = newGalleryFiles.map(file => uploadToCloudinary(file));
            const newUrls = await Promise.all(uploadPromises);
            galleryImages = [...galleryImages, ...newUrls];
        }

        const updatePayload = {
            ...productData,
            coverImage,
            galleryImages,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, updatePayload);
        return { id, ...updatePayload };
    } catch (error) {
        console.error(`Error actualizando producto ${id}:`, error);
        throw error;
    }
};

/**
 * Actualiza un campo específico de un producto
 */
export const updateProductField = async (id, field, value) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { [field]: value, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error(`Error actualizando ${field} del producto ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina un producto de Firestore.
 */
export const deleteProduct = async (id) => {
    try {
        // Nota: Las imágenes en Cloudinary se mantienen por defecto para no romper
        // historiales de pedidos que dependan de la URL, o pueden ser eliminadas 
        // a través de un webhook/función cloud. Eliminamos solo el doc de Firestore.
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return true;
    } catch (error) {
        console.error(`Error eliminando producto ${id}:`, error);
        throw error;
    }
};
