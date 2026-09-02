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
    name: "Barocksättel",
    slug: "barocksattel",
    description:
      "Barocksättel mit tiefem Sitz und klassischer Ausrichtung für barocke Pferderassen und anspruchsvolle Dressur.",
    sortOrder: 9,
  },
  {
    name: "Wanderreitsättel",
    slug: "wanderreitsattel",
    description:
      "Bequeme, ausdauernde Wanderreitsättel für lange Ausritte und mehrtägige Touren.",
    sortOrder: 10,
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
