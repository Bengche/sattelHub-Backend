-- Add saddle categories that are especially relevant to German riders.
-- Safe to run repeatedly on existing databases.

INSERT INTO categories (name, slug, description, sort_order)
VALUES
  (
    'Barocksättel',
    'barocksattel',
    'Barocksättel mit tiefem Sitz und klassischer Ausrichtung für barocke Pferderassen und anspruchsvolle Dressur.',
    9
  ),
  (
    'Wanderreitsättel',
    'wanderreitsattel',
    'Bequeme, ausdauernde Wanderreitsättel für lange Ausritte und mehrtägige Touren.',
    10
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;