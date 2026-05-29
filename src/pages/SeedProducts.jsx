import { useState } from 'react';
import { collection, addDoc, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { uploadToCloudinary } from '../services/productService';
import { Button, Typography, notification } from 'antd';
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NEW_PRODUCTS = [
    {
        name: "Guaria Morada (Guarianthe skinneri)",
        category: "Orquídeas",
        family: "Orchidaceae (Flor Nacional)",
        price: 18500,
        currency: "CRC",
        ml: "Maceta 6\"",
        stock: "Disponible",
        notes: "Sombra parcial · Riego 2 veces por semana · Alta humedad ambiente.",
        description: "La flor nacional de Costa Rica. Esta orquídea epífita destaca por sus espectaculares flores de color morado fucsia vibrante, dispuestas en ramilletes. Es un símbolo de la biodiversidad y el folclor costarricense, ideal para coleccionistas exigentes y amantes de la botánica nativa.",
        localImageUrl: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Monstera Deliciosa Variegata",
        category: "Exóticas",
        family: "Araceae",
        price: 45000,
        currency: "CRC",
        ml: "Maceta 8\"",
        stock: "Disponible",
        notes: "Luz indirecta brillante · Riego cuando el sustrato seque · Sustrato aireante.",
        description: "La reina indiscutible de las plantas de interior de lujo. Cada hoja cuenta una historia única con patrones de variegación blanco crema y verde esmeralda. Cultivada bajo estrictos estándares agrícolas para asegurar raíces fuertes y un follaje espectacular.",
        localImageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Anturio Negro (Anthurium Black)",
        category: "Flores Tropicales",
        family: "Araceae",
        price: 15000,
        currency: "CRC",
        ml: "Maceta 6\"",
        stock: "Disponible",
        notes: "Sombra moderada · Riego regular sin encharcamiento · Mantener hojas limpias.",
        description: "Una de las variedades más exóticas y elegantes de anturio. Sus espatas cerosas en tonos purpuras oscuros casi negros brindan un toque minimalista e industrial al hogar. Excelente durabilidad de floración y resistencia.",
        localImageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Orquídea Mariposa Amarilla (Phalaenopsis)",
        category: "Orquídeas",
        family: "Orchidaceae",
        price: 16500,
        currency: "CRC",
        ml: "Maceta Translúcida 5\"",
        stock: "Disponible",
        notes: "Luz filtrada · Riego por inmersión semanal · Fertilizante especial mensual.",
        description: "Orquídea Phalaenopsis híbrida de alta calidad con pétalos amarillos cálidos e intensos y labelo naranja. Su elegante tallo floral arqueado ofrece una floración que puede extenderse hasta por 3 meses en condiciones óptimas de interior.",
        localImageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Alocasia Polly (Oreja de Elefante)",
        category: "Exóticas",
        family: "Araceae",
        price: 12500,
        currency: "CRC",
        ml: "Maceta 6\"",
        stock: "Disponible",
        notes: "Humedad alta · Luz indirecta media · Riego regular.",
        description: "Una planta tropical de impacto visual inmediato. Sus hojas en forma de escudo presentan nervaduras blanco plateado ultra marcadas sobre un verde oscuro metálico profundo. Una obra de arte viviente originaria del sotobosque húmedo.",
        localImageUrl: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: true
    },
    {
        name: "Sustrato Premium para Orquídeas",
        category: "Accesorios",
        family: "Insumos Profesionales",
        price: 4500,
        currency: "CRC",
        ml: "Bolsa 2 Litros",
        stock: "Disponible",
        notes: "Corteza de pino premium · Carbón vegetal · Fibra de coco · Perlita.",
        description: "Mezcla profesional aireada de grado botánico, idéntica a la utilizada en los invernaderos de Bioflora. Garantiza un excelente drenaje y la oxigenación óptima que las raíces de las orquídeas epífitas necesitan para prosperar.",
        localImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        localGalleryUrls: [],
        isFeatured: false
    }
];

export default function SeedProducts() {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            const productsRef = collection(db, 'products');
            let addedCount = 0;
            // 1. ELIMINAR TODOS LOS PRODUCTOS EXISTENTES PRIMERO
            const existingQuery = await getDocs(productsRef);
            for (const d of existingQuery.docs) {
                // Borrar db (las imágenes en Cloudinary se mantienen)
                await deleteDoc(doc(db, 'products', d.id));
            }

            // 2. CREAR NUEVOS CON ESTRUCTURA DE CARPETAS
            for (const prod of NEW_PRODUCTS) {
                // Generar el ID primero
                const newDocRef = doc(collection(db, 'products'));
                const productId = newDocRef.id;

                let coverImageUrl = prod.localImageUrl;
                let galleryUrls = [];

                try {
                    // Subir Cover Image a Cloudinary
                    const response = await fetch(prod.localImageUrl);
                    const blob = await response.blob();
                    coverImageUrl = await uploadToCloudinary(blob);
                    
                    // Subir Gallery Images concurrentemente (y autodetectar _bg.webp si existe localmente)
                    const bgUrl = prod.localImageUrl.replace('.webp', '_bg.webp');
                    const bgResponse = await fetch(bgUrl);
                    
                    if (bgResponse.ok) {
                        const bgBlob = await bgResponse.blob();
                        if (bgBlob.type.includes('image')) {
                            const bgDownloadUrl = await uploadToCloudinary(bgBlob);
                            galleryUrls.push(bgDownloadUrl);
                        }
                    }

                    // A continuación, si en algún momento se incluyen más imágenes en localGalleryUrls
                    const galleryPromises = prod.localGalleryUrls.map(async (localUrl) => {
                        const res = await fetch(localUrl);
                        if (!res.ok) return null;
                        const galBlob = await res.blob();
                        return uploadToCloudinary(galBlob);
                    });
                    
                    const additionalGals = await Promise.all(galleryPromises);
                    galleryUrls = [...galleryUrls, ...additionalGals.filter(url => url !== null)];
                } catch (err) {
                    console.warn(`⚠️ No se pudo subir ${prod.localImageUrl} a Cloudinary.`, err);
                }

                const finalProduct = {
                     ...prod,
                     coverImage: coverImageUrl,
                     galleryImages: galleryUrls
                };
                delete finalProduct.localImageUrl;
                delete finalProduct.localGalleryUrls;

                await setDoc(newDocRef, finalProduct);
                addedCount++;
            }

            notification.success({
                message: 'Inyección Exitosa',
                description: `Se añadieron ${addedCount} productos maestros de alta gama a la base de datos.`,
                placement: 'top'
            });
        } catch (error) {
            console.error('Error inyectando productos:', error);
            notification.error({
                message: 'Error',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-valex-negro flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full bg-[#1e1e1f] border border-valex-bronce/30 p-10 rounded-2xl text-center shadow-[0_0_50px_rgba(0,169,79,0.1)]">
                <Title level={2} className="!font-serif !text-valex-hueso !mb-2">Semillero Botánico</Title>
                <Text className="text-valex-gris block mb-8 font-light">
                    Presiona el botón para <b>restablecer el catálogo completo</b> e inyectar 6 plantas y orquídeas exóticas VIP. Las imágenes se subirán automáticamente a tu Firebase Storage.
                </Text>
                
                <Button 
                    type="primary" 
                    size="large"
                    onClick={handleSeed}
                    loading={loading}
                    icon={loading ? <SyncOutlined spin /> : <CheckCircleOutlined />}
                    className="w-full !h-14 !text-lg !font-serif !tracking-widest uppercase !bg-valex-bronce hover:!bg-valex-bronce-light border-none text-black font-semibold"
                >
                    {loading ? 'Propagando especies...' : 'INYECTAR 6 PLANTAS VIP'}
                </Button>
                
                <Text className="text-valex-gris/50 block mt-6 text-xs italic">
                    Una vez inyectados, ve a /tienda para verlos. Puedes inyectar múltiples veces para duplicar especies.
                </Text>
            </div>
        </div>
    );
}
