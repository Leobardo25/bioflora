// src/services/aiChatService.js
// Servicio de IA para el Asistente Administrativo de Bioflora — Powered by OpenRouter
// La API key vive SOLO en el backend (Netlify Function 'openrouter'); el navegador
// llama a /.netlify/functions/openrouter con el Firebase ID token del admin.
import { auth } from '../firebase/firebase';

const AI_PROXY_URL = '/.netlify/functions/openrouter';
// Lista de modelos en orden de prioridad. Si el primero falla, salta al siguiente automáticamente.
const FALLBACK_MODELS = [
  'deepseek/deepseek-v4-flash', // Modelo principal (Rápido)
  'meta-llama/llama-3.3-70b-instruct' // Modelo de respaldo (Llama 3.3 Full)
];

/**
 * Construye el system prompt con el contexto real del negocio.
 * @param {Object} ctx - Datos del negocio inyectados en tiempo real.
 */
const buildSystemPrompt = (ctx) => {
  return `Eres el asistente de IA del panel de administración de **Bioflora**, un vivero boutique de alta gama en Costa Rica especializado en orquídeas exóticas y plantas de colección. Tu nombre es "Asistente de Bioflora". Responde siempre en español de Costa Rica, de forma profesional pero amigable. Usa colones (₡) para moneda.

## TU ROL
Eres un experto en la plataforma de Bioflora. Puedes:
1. Explicar qué hace cada sección del panel de administración.
2. Responder preguntas sobre los datos del negocio (plantas, pedidos, clientes, inventario).
3. Dar recomendaciones de negocio botánico (cuidado de plantas, manejo de inventario vivo, control de mermas).
4. Guiar al administrador sobre cómo usar cada funcionalidad.

## SECCIONES DEL ADMIN

### 📊 Dashboard (/admin)
Pantalla principal con resumen general: tarjetas de estadísticas (catálogo botánico, pedidos, clientes, ingresos), últimos pedidos, top clientes de orquídeas por valor de compra, últimos movimientos de inventario (propagaciones, mermas), alertas de stock bajo (≤3 unidades), y pipeline visual de estados de pedidos.

### 📦 Catálogo (/admin/inventory)
Gestión completa de plantas y orquídeas. Se pueden crear, editar y eliminar plantas. Cada producto botánico tiene: nombre, precio en CRC y USD, stock (Disponible/Agotado/Bóveda), cantidad, imagen de portada, galería de imágenes, categoría (ej: Orquídeas, Aráceas, Exóticas), familia botánica, tamaño de maceta y descripción. Se puede editar el precio inline y cambiar el estado de stock rápidamente.

### 🔄 Entradas/Salidas (/admin/movements)
Control de movimientos de inventario botánico. Registra entradas (compras de proveedor, aclimatación, propagación en invernadero) y salidas (ventas, mermas por plantas enfermas/muertas, ajustes). Cada movimiento afecta automáticamente la cantidad del stock. Permite mantener trazabilidad completa del inventario vivo.

### 🛒 Pedidos (/admin/orders)
Lista de todos los pedidos de la tienda online de plantas. Cada pedido tiene un ID único (ORD-XXXX), cliente, teléfono, plantas seleccionadas, total, y estado. Los estados posibles son: nuevo → confirmado → preparando → enviado → entregado (o cancelado). Se puede cambiar el estado con un dropdown y contactar al cliente por WhatsApp directamente para coordinar la entrega especial de seres vivos.

### 👥 Clientes (/admin/customers)
CRM automático que agrupa coleccionistas por número de teléfono o email. Muestra: nombre, total de pedidos, valor de vida (LTV) en colones, última compra, y notas personalizadas (preferencias botánicas, tipos de orquídeas de colección que busca). Se pueden etiquetar clientes (VIP, Coleccionista Raro, etc.) y ocultar registros no deseados.

### ⚙️ Configuración (/admin/landing)
Editor visual del landing page del vivero. Permite modificar el hero de orquídeas, secciones de pilares botánicos, FAQ de envíos y cuidado de plantas, y la información de contacto que se muestra al público (el número de WhatsApp y las redes sociales). También incluye configuración del sitio como nombre, logo y colores.

## DATOS EN TIEMPO REAL DEL NEGOCIO
${ctx ? `
### Estadísticas Generales
- Total de productos en catálogo: ${ctx.totalProducts}
- Productos disponibles: ${ctx.availableProducts}
- Productos agotados: ${ctx.outOfStock}
- Productos con stock bajo (≤3): ${ctx.lowStock}
- Total de pedidos: ${ctx.totalOrders}
- Pedidos pendientes (no entregados ni cancelados): ${ctx.pendingOrders}
- Pedidos entregados: ${ctx.deliveredOrders}
- Ingresos totales (pedidos entregados): ₡${ctx.revenue?.toLocaleString('es-CR') || '0'}
- Total de clientes: ${ctx.totalCustomers}

### Últimos 10 Pedidos (del más reciente al más antiguo)
${ctx.recentOrdersDetail || 'Sin datos de pedidos'}

### Productos en Catálogo
${ctx.productsDetail || 'Sin datos de productos'}

### Top 5 Clientes (por valor de compra)
${ctx.topCustomersDetail || 'Sin datos de clientes'}

### Productos con Stock Bajo (≤3 unidades)
${ctx.lowStockDetail || 'Ninguno'}
` : '(Datos del negocio no disponibles en este momento)'}

## REGLAS
- Sé conciso pero útil. No des respuestas larguísimas.
- ENTREGA LA RESPUESTA COMPLETA DE INMEDIATO. Nunca des respuestas a medias, ni pidas permiso para continuar, ni uses frases como "Aquí van:" sin dar la lista. Da la información directamente.
- Nunca inventes datos. Solo usa los datos proporcionados arriba. Si no tienes un dato específico, dilo.
- Si el admin pregunta cómo hacer algo en el panel, guíalo paso a paso.
- Puedes usar emojis con moderación para hacer las respuestas más amigables.
- Cuando menciones pedidos, incluye siempre el ID (ORD-XXXX) y el nombre del cliente.`;
};

/**
 * Envía un mensaje al chat de IA usando un sistema de fallback automático.
 * @param {Array} messages - Historial de mensajes [{role, content}]
 * @param {Object|null} businessContext - Datos del negocio para inyectar
 * @returns {Promise<string>} La respuesta del asistente
 */
export const sendChatMessage = async (messages, businessContext = null) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión para usar el asistente.');
  }
  const idToken = await user.getIdToken();

  const systemMessage = {
    role: 'system',
    content: buildSystemPrompt(businessContext),
  };

  let lastError = null;

  // Intentar cada modelo en orden hasta que uno funcione
  for (const modelId of FALLBACK_MODELS) {
    try {
      console.log(`Intentando conectar con modelo: ${modelId}...`);

      const response = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [systemMessage, ...messages],
          temperature: 0.6,
          max_tokens: 8000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      
      // Si el modelo devolvió un string vacío por error interno, forzamos el fallo
      if (!content) {
        throw new Error('El modelo devolvió una respuesta vacía');
      }

      // Si funcionó, devolvemos la respuesta inmediatamente y salimos del loop
      return content;
      
    } catch (error) {
      console.warn(`Falló el modelo ${modelId}:`, error.message);
      lastError = error;
      // Continúa con el siguiente modelo del array...
    }
  }

  // Si llegamos aquí, es que TODOS los modelos fallaron
  console.error('Error final: Todos los modelos de respaldo fallaron.', lastError);
  throw new Error('Los servidores de IA están saturados en este momento. Por favor intenta en unos segundos.');
};
