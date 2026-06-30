// netlify/functions/openrouter.js
// Proxy seguro de OpenRouter. La API key vive SOLO aquí (variable de entorno en
// Netlify: OPENROUTER_API_KEY) y NUNCA llega al navegador. El frontend llama a
// /.netlify/functions/openrouter enviando el Firebase ID token del admin.
const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } catch (e) {
    console.error("[openrouter] No se pudo inicializar firebase-admin:", e.message);
  }
}

const ALLOWED_MODELS = new Set([
  "deepseek/deepseek-v4-flash",
  "meta-llama/llama-3.3-70b-instruct",
]);

const json = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método no permitido" });

  // 1. Verificar Firebase ID token (solo admins logueados).
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return json(401, { error: "No autenticado" });
  try {
    await admin.auth().verifyIdToken(token);
  } catch (e) {
    return json(401, { error: "Token inválido o expirado" });
  }

  // 2. Validar payload.
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Body inválido" });
  }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return json(400, { error: "Payload inválido (faltan messages)" });
  }
  if (!ALLOWED_MODELS.has(body.model)) {
    return json(400, { error: `Modelo no permitido: ${body.model}` });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[openrouter] OPENROUTER_API_KEY no configurada en Netlify");
    return json(500, { error: "La IA no está configurada en el servidor." });
  }

  // 3. Reenviar a OpenRouter con la key server-side.
  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bioflora.com",
        "X-Title": "Bioflora Backend",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    return { statusCode: resp.status, headers: { "Content-Type": "application/json" }, body: text };
  } catch (e) {
    console.error("[openrouter] Error conectando con OpenRouter:", e.message);
    return json(502, { error: "Error conectando con OpenRouter." });
  }
};
