-- Consolidate product classification into a single German category.

INSERT INTO categories (name, slug, description, sort_order)
VALUES
  ('Westernsättel', 'western-saettel', 'Westernsättel für Freizeit, Training und Westernsport.', 1),
  ('Englische Sättel', 'englische-saettel', 'Englische Sättel für vielseitige Einsatzbereiche.', 2),
  ('Dressursättel', 'dressursaettel', 'Sättel für Dressur und klassische Reitweisen.', 3),
  ('Springsättel', 'springsaettel', 'Sättel für Springreiten und Parcours.', 4),
  ('Wanderreitsättel', 'wanderreitsaettel', 'Komfortable Sättel für lange Ausritte und mehrtägige Touren.', 5),
  ('Fassrennsättel', 'fassrennsaettel', 'Leichte, sichere Sättel für Fassrennen.', 6),
  ('Jugendsättel', 'jugendsaettel', 'Passende Sättel für junge Reiterinnen und Reiter.', 7),
  ('Sattelzubehör', 'sattelzubehoer', 'Zubehör und Pflegeprodukte rund um den Sattel.', 8),
  ('Barocksättel', 'barocksaettel', 'Sättel für barocke Pferderassen und klassische Reitweisen.', 9),
  ('Vielseitigkeitssättel', 'vielseitigkeitssaettel', 'Vielseitige Sättel für verschiedene Reitdisziplinen.', 10),
  ('Sonstige Sättel', 'sonstige-saettel', 'Weitere Sättel ohne spezifische Kategorie.', 11)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = TRUE;

-- Older databases have this column; fresh installs already use the new schema.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'discipline'
  ) THEN
    UPDATE products p
    SET category_id = c.id
    FROM categories c
    WHERE p.discipline::text <> 'other'
      AND c.slug = CASE p.discipline::text
        WHEN 'western' THEN 'western-saettel'
        WHEN 'english' THEN 'englische-saettel'
        WHEN 'dressage' THEN 'dressursaettel'
        WHEN 'jumping' THEN 'springsaettel'
        WHEN 'trail' THEN 'wanderreitsaettel'
        WHEN 'endurance' THEN 'wanderreitsaettel'
        WHEN 'barrel_racing' THEN 'fassrennsaettel'
        WHEN 'cutting' THEN 'western-saettel'
        WHEN 'all_purpose' THEN 'vielseitigkeitssaettel'
        ELSE NULL
      END;

    UPDATE products p
    SET category_id = c.id
    FROM categories old_category
    JOIN categories c ON c.slug = CASE old_category.slug
      WHEN 'western-saddles' THEN 'western-saettel'
      WHEN 'english-saddles' THEN 'englische-saettel'
      WHEN 'dressage-saddles' THEN 'dressursaettel'
      WHEN 'jumping-saddles' THEN 'springsaettel'
      WHEN 'trail-saddles' THEN 'wanderreitsaettel'
      WHEN 'barrel-racing-saddles' THEN 'fassrennsaettel'
      WHEN 'youth-saddles' THEN 'jugendsaettel'
      WHEN 'saddle-accessories' THEN 'sattelzubehoer'
      WHEN 'barocksattel' THEN 'barocksaettel'
      WHEN 'wanderreitsattel' THEN 'wanderreitsaettel'
      WHEN 'western-saettel' THEN 'western-saettel'
      WHEN 'englische-saettel' THEN 'englische-saettel'
      WHEN 'dressursaettel' THEN 'dressursaettel'
      WHEN 'springsaettel' THEN 'springsaettel'
      WHEN 'wanderreitsaettel' THEN 'wanderreitsaettel'
      WHEN 'fassrennsaettel' THEN 'fassrennsaettel'
      WHEN 'jugendsaettel' THEN 'jugendsaettel'
      WHEN 'sattelzubehoer' THEN 'sattelzubehoer'
      WHEN 'barocksaettel' THEN 'barocksaettel'
      WHEN 'vielseitigkeitssaettel' THEN 'vielseitigkeitssaettel'
      WHEN 'sonstige-saettel' THEN 'sonstige-saettel'
      ELSE 'sonstige-saettel'
    END
    WHERE p.category_id = old_category.id
      AND (p.discipline IS NULL OR p.discipline::text = 'other');

    ALTER TABLE products DROP COLUMN discipline;
  ELSE
    UPDATE products p
    SET category_id = c.id
    FROM categories old_category
    JOIN categories c ON c.slug = CASE old_category.slug
      WHEN 'western-saddles' THEN 'western-saettel'
      WHEN 'english-saddles' THEN 'englische-saettel'
      WHEN 'dressage-saddles' THEN 'dressursaettel'
      WHEN 'jumping-saddles' THEN 'springsaettel'
      WHEN 'trail-saddles' THEN 'wanderreitsaettel'
      WHEN 'barrel-racing-saddles' THEN 'fassrennsaettel'
      WHEN 'youth-saddles' THEN 'jugendsaettel'
      WHEN 'saddle-accessories' THEN 'sattelzubehoer'
      WHEN 'barocksattel' THEN 'barocksaettel'
      WHEN 'wanderreitsattel' THEN 'wanderreitsaettel'
      WHEN 'western-saettel' THEN 'western-saettel'
      WHEN 'englische-saettel' THEN 'englische-saettel'
      WHEN 'dressursaettel' THEN 'dressursaettel'
      WHEN 'springsaettel' THEN 'springsaettel'
      WHEN 'wanderreitsaettel' THEN 'wanderreitsaettel'
      WHEN 'fassrennsaettel' THEN 'fassrennsaettel'
      WHEN 'jugendsaettel' THEN 'jugendsaettel'
      WHEN 'sattelzubehoer' THEN 'sattelzubehoer'
      WHEN 'barocksaettel' THEN 'barocksaettel'
      WHEN 'vielseitigkeitssaettel' THEN 'vielseitigkeitssaettel'
      WHEN 'sonstige-saettel' THEN 'sonstige-saettel'
      ELSE 'sonstige-saettel'
    END
    WHERE p.category_id = old_category.id;
  END IF;
END $$;

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'sonstige-saettel')
WHERE category_id IS NULL;

DELETE FROM categories
WHERE slug NOT IN (
  'western-saettel', 'englische-saettel', 'dressursaettel', 'springsaettel',
  'wanderreitsaettel', 'fassrennsaettel', 'jugendsaettel',
  'sattelzubehoer', 'barocksaettel', 'vielseitigkeitssaettel', 'sonstige-saettel'
);

DROP TYPE IF EXISTS saddle_discipline;
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;