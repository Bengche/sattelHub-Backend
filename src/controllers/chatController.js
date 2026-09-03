const { GoogleGenAI } = require("@google/genai");
const pool = require("../config/database");
const SITE_CONFIG = require("../config/siteConfig");

// Valid Gemini production models in priority order
const AI_MODELS = [
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatPrice = (amount) =>
  new Intl.NumberFormat(SITE_CONFIG.currency.locale, {
    style: "currency",
    currency: SITE_CONFIG.currency.code,
    minimumFractionDigits: 2,
  }).format(amount);

const SYSTEM_PROMPT = `Du bist Sterling, ein erstklassiger Reitsportberater und Luxus-Verkaufsberater für ${SITE_CONFIG.name}, einen Anbieter hochwertiger Reitsättel.

ÜBER SATTELHUB.DE:
- Fachkundig ausgewählte Western-, englische, Dressur-, Spring-, Wander-, Barrel-Racing- und Jugendsättel
- Jeder Sattel wird von erfahrenen Reitern geprüft - Qualität vor Quantität
- Adresse: ${SITE_CONFIG.address.full}
- Website: ${SITE_CONFIG.url}

WICHTIGE RICHTLINIEN (niemals raten oder Alternativen erfinden):
- Jeder Sattel kann 30 Tage kostenlos getestet werden. Bei Nichtgefallen ist eine vollständige Erstattung möglich.
- Kostenloser Standardversand ab ${SITE_CONFIG.shipping.freeShippingThreshold} EUR
- Standardversand: 3-5 Werktage
- Expressversand: 1-3 Werktage
- Alle Sendungen sind versichert und werden vollständig verfolgt
- Keine Wiedereinlagerungsgebühren
- Support: ${SITE_CONFIG.contact.supportEmail}

DEINE AUFGABE:
- Hilf Kunden, den passenden Sattel zu finden. Frage bei Bedarf nach Disziplin, Erfahrung, Budget und Pferd.
- Beziehe dich ausschließlich auf Produkte aus [AVAILABLE PRODUCTS]. Erfinde niemals Bestand, Preise oder Verfügbarkeit.
- Wenn das gewünschte Produkt nicht verfügbar ist, nenne freundlich passende Alternativen.
- Beende jede Antwort mit einer natürlichen Handlungsaufforderung.

TON: Warm, fachkundig und selbstbewusst. Du bist ein vertrauenswürdiger Berater, kein aufdringlicher Verkäufer.

- Antworte immer auf Deutsch, auch wenn die Frage auf Englisch gestellt wird.
- Halte Antworten unter 160 Wörtern und schreibe kurze, natürliche Absätze ohne lange Aufzählungen.
- Wenn du Produkte nennst, erwähne Name und Preis natürlich auf Deutsch.
- Wenn Produktkarten angezeigt werden, verweise mit "Karte öffnen" oder einer ähnlichen Formulierung darauf.
- Verwende klickbare Markdown-Links wie [Produkte ansehen](/products) oder [Support kontaktieren](/contact).
- Wenn keine Produkte passen, stelle eine Rückfrage oder verweise auf [alle Sättel](/products).`;

function extractKeywords(message) {
  const stopWords = new Set([
    "do",
    "you",
    "have",
    "any",
    "the",
    "and",
    "for",
    "are",
    "can",
    "tell",
    "me",
    "about",
    "what",
    "how",
    "much",
    "does",
    "cost",
    "price",
    "is",
    "there",
    "that",
    "this",
    "your",
    "our",
    "which",
    "would",
    "could",
    "should",
    "want",
    "need",
    "looking",
    "show",
    "like",
    "find",
    "get",
    "will",
    "with",
    "from",
    "also",
    "some",
    "all",
    "its",
    "been",
    "has",
  ]);

  return message
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 6);
}

async function searchProducts(message) {
  const keywords = extractKeywords(message);
  if (keywords.length === 0) return [];

  const conditions = keywords.map(
    (_, i) =>
      `(p.name ILIKE $${i + 1} OR p.brand ILIKE $${i + 1} OR p.short_description ILIKE $${i + 1} OR p.discipline::text ILIKE $${i + 1} OR c.name ILIKE $${i + 1})`,
  );
  const values = keywords.map((k) => `%${k}%`);

  try {
    const result = await pool.query(
      `SELECT
         p.id, p.name, p.slug, p.price, p.compare_price,
         p.discipline, p.condition, p.short_description,
         p.stock_quantity, p.average_rating, p.brand,
         (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE LIMIT 1) AS image_url,
         c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE
         AND p.stock_quantity > 0
         AND (${conditions.join(" OR ")})
       ORDER BY p.is_featured DESC NULLS LAST, p.average_rating DESC NULLS LAST, p.sold_count DESC NULLS LAST
       LIMIT 4`,
      values,
    );
    return result.rows;
  } catch (err) {
    console.error("Database product search error:", err.message);
    return [];
  }
}

const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Eine Nachricht ist erforderlich." });
    }
    if (message.length > 500) {
      return res
        .status(400)
        .json({ success: false, message: "Die Nachricht ist zu lang." });
    }
    if (!Array.isArray(history)) {
      return res
        .status(400)
        .json({ success: false, message: "Ungültiges Verlaufsformat." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Der KI-Dienst ist nicht konfiguriert.",
      });
    }

    let products = [];
    try {
      products = await searchProducts(message.trim());
    } catch {
      products = [];
    }

    const productContext =
      products.length > 0
        ? "\n\n[AVAILABLE PRODUCTS]\n" +
          products
            .map(
              (p) =>
                `• ${p.name}${p.brand ? ` von ${p.brand}` : ""} - ${formatPrice(parseFloat(p.price))}` +
                `${p.compare_price ? ` (zuvor ${formatPrice(parseFloat(p.compare_price))})` : ""}` +
                ` | ${p.discipline ? p.discipline.replace("_", " ") : "alle Disziplinen"}` +
                ` | Zustand: ${p.condition || "neu"}` +
                ` | Bewertung: ${p.average_rating || "k. A."}/5`,
            )
            .join("\n")
        : "\n\n[AVAILABLE PRODUCTS] Keine passenden Produkte gefunden. Antworte hilfreich auf Deutsch, stelle eine Rückfrage oder verweise auf /products.";

    // Initialize SDK client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format conversation history
    const contents = history
      .filter((m) => m.role && m.content && typeof m.content === "string")
      .slice(-10)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content.slice(0, 1000) }],
      }));

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    let response;
    let lastModelError;

    // Fallback iteration
    for (const model of AI_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT + productContext,
            temperature: 0.7,
            topP: 0.9,
          },
        });

        if (response && response.text) {
          break;
        }
      } catch (err) {
        lastModelError = err;
        console.error(`Gemini model ${model} failed:`, err.message || err);

        // Pause briefly on high-demand or rate-limit errors before invoking fallback
        const isTransient =
          err.status === 503 ||
          err.status === 429 ||
          (err.message &&
            (err.message.includes("503") || err.message.includes("429")));

        if (isTransient) {
          await delay(600);
        }
      }
    }

    if (!response || !response.text) {
      throw lastModelError || new Error("All Gemini models failed to respond.");
    }

    return res.json({
      success: true,
      reply: response.text,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price),
        compare_price: p.compare_price ? parseFloat(p.compare_price) : null,
        discipline: p.discipline,
        condition: p.condition,
        image_url: p.image_url || null,
        brand: p.brand || null,
      })),
    });
  } catch (err) {
    console.error("Gemini API execution error:", err);
    return res.status(500).json({
      success: false,
      message:
        "Die KI-Antwort konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
    });
  }
};

module.exports = { chat };
