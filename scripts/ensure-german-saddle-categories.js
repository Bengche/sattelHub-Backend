/**
 * Ensures German saddle categories exist after deployment.
 * Usage: node scripts/ensure-german-saddle-categories.js
 */

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const categories = [
  {
    name: "Westernsättel",
    slug: "western-saettel",
    description: "Westernsättel für Freizeit, Training und Westernsport.",
    sortOrder: 1,
  },
  {
    name: "Englische Sättel",
    slug: "englische-saettel",
    description: "Englische Sättel für vielseitige Einsatzbereiche.",
    sortOrder: 2,
  },
  {
    name: "Dressursättel",
    slug: "dressursaettel",
    description: "Sättel für Dressur und klassische Reitweisen.",
    sortOrder: 3,
  },
  {
    name: "Springsättel",
    slug: "springsaettel",
    description: "Sättel für Springreiten und Parcours.",
    sortOrder: 4,
  },
  {
    name: "Wanderreitsättel",
    slug: "wanderreitsaettel",
    description: "Komfortable Sättel für lange Ausritte und mehrtägige Touren.",
    sortOrder: 5,
  },
  {
    name: "Barrel-Racing-Sättel",
    slug: "barrel-racing-saettel",
    description: "Leichte, sichere Sättel für Barrel Racing.",
    sortOrder: 6,
  },
  {
    name: "Jugendsättel",
    slug: "jugendsaettel",
    description: "Passende Sättel für junge Reiterinnen und Reiter.",
    sortOrder: 7,
  },
  {
    name: "Sattelzubehör",
    slug: "sattelzubehoer",
    description: "Zubehör und Pflegeprodukte rund um den Sattel.",
    sortOrder: 8,
  },
  {
    name: "Barocksättel",
    slug: "barocksaettel",
    description: "Sättel für barocke Pferderassen und klassische Reitweisen.",
    sortOrder: 9,
  },
  {
    name: "Vielseitigkeitssättel",
    slug: "vielseitigkeitssaettel",
    description: "Vielseitige Sättel für verschiedene Reitdisziplinen.",
    sortOrder: 10,
  },
  {
    name: "Sonstige Sättel",
    slug: "sonstige-saettel",
    description: "Weitere Sättel ohne spezifische Kategorie.",
    sortOrder: 11,
  },
];

async function ensureCategories() {
  try {
    for (const category of categories) {
      await pool.query(
        `INSERT INTO categories (name, slug, description, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           sort_order = EXCLUDED.sort_order`,
        [
          category.name,
          category.slug,
          category.description,
          category.sortOrder,
        ],
      );
      console.log(`Ensured category: ${category.name}`);
    }
  } finally {
    await pool.end();
  }
}

ensureCategories().catch((error) => {
  console.error("Could not ensure German saddle categories:", error.message);
  process.exitCode = 1;
});
