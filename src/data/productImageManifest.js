/**
 * Product Image Manifest
 * 
 * Deterministic mapping: product name → exactly 3 gallery images.
 * Folder names and file names reflect the actual filesystem structure.
 * The resolver uses this manifest so there are never duplicate .webp/.jpg pairs.
 * 
 * Schema per product:
 *   thumbnail: string  — primary image (used on cards, cart, recommendations)
 *   gallery: string[]  — exactly 3 images (used on product detail page)
 */

const BASE = '/assets/images';

function entry(folder, filePrefix, ext = 'png') {
  return {
    thumbnail: `${BASE}/${folder}/${filePrefix} 1.${ext}`,
    gallery: [
      `${BASE}/${folder}/${filePrefix} 1.${ext}`,
      `${BASE}/${folder}/${filePrefix} 2.${ext}`,
      `${BASE}/${folder}/${filePrefix} 3.${ext}`,
    ],
  };
}

// Shorthand when folder name and file prefix match
function e(folder, ext = 'png') {
  return entry(folder, folder, ext);
}
const productImageManifest = {
  // ── Rakhi Products ────────────────────────────────────────
  "Nazar — The Rakhi of Protection": entry("Rakhi'26/Nazar", "Nazar"),
  "Saanjh — The Rakhi of Affection": entry("Rakhi'26/Saanjh", "Saanjh"),
  "Ananta — The Rakhi of Forever": entry("Rakhi'26/Ananta", "Ananta"),
  "Vriddhi — The Rakhi of Growth": entry("Rakhi'26/Vriddhi", "Vriddhi"),
  // ── Bracelets ──────────────────────────────────────────────
  '7 Chakra Bracelet':              e('7 Chakra Bracelet'),
  'Amethyst Bracelet':              e('Amethyst Bracelet'),
  'Black Tourmaline Bracelet':      e('Black Tourmaline Bracelet'),
  'Blue Lace Agate Bracelet':       entry('Blue Lase Agate Bracelet', 'Blue Lase Agate Bracelet'),
  'Blue Lasagate Bracelet':         entry('Blue Lase Agate Bracelet', 'Blue Lase Agate Bracelet'),  // alias
  'Carnelian Bracelet':             e('Carnelian Bracelet'),
  'Citrine Bracelet':               e('Citrine Bracelet'),
  'Clear Quartz Bracelet':          e('Clear Quartz Bracelet'),
  'Golden Hematite Bracelet':       e('Golden Hematite Bracelet'),
  'Green Aventurine Bracelet':      e('Green Aventurine Bracelet'),
  'Green Jade Bracelet':            e('Green Jade Bracelet'),
  'Lapis Lazuli Bracelet':          entry('Lapiz Lazuli Bracelet', 'Lapiz Lazuli Bracelet'),
  'Lapiz Lazuli Bracelet':          entry('Lapiz Lazuli Bracelet', 'Lapiz Lazuli Bracelet'),  // alias
  'Pink Tourmaline Bracelet':       e('Pink Tourmaline Bracelet'),
  'Pyrite Bracelet':                e('Pyrite Bracelet'),
  'Red Jasper Bracelet':            e('Red Jasper Bracelet'),
  'Rose Quartz Bracelet':           e('Rose Quartz Bracelet'),
  'Rutile Quartz Bracelet':         e('Rutile Quartz Bracelet'),
  'Selenite Bracelet':              e('Selenite Bracelet'),
  'Sodalite Bracelet':              e('Sodalite Bracelet'),
  "Tiger's Eye Bracelet":           e("Tiger's Eye Bracelet"),
  'Turquoise Bracelet':             e('Turquoise Bracelet'),

  // ── Crystals (Tumbles) — folder renamed to "X Tumbles", files still "X N.png" ──
  'Amethyst Tumbles':               entry('Amethyst Tumbles', 'Amethyst'),
  'Black Tourmaline Tumbles':       entry('Black Tourmaline Tumbles', 'Black Tourmaline'),
  'Citrine Tumbles':                entry('Citrine Tumbles', 'Citrine'),
  'Clear Quartz Tumbles':           entry('Clear Quartz Tumbles', 'Clear Quartz'),
  'Green Aventurine Tumbles':       entry('Green Aventurine Tumbles', 'Green Aventurine'),
  'Labradorite Tumbles':            entry('Labradorite Tumbles', 'Labradorite'),
  'Pyrite Tumbles':                 entry('Pyrite Tumbles', 'Pyrite'),
  'Rose Quartz Tumbles':            entry('Rose Quartz Tumbles', 'Rose Quartz'),
  'Selenite Tumbles':               entry('Selenite Tumbles', 'Selenite'),
  "Tiger's Eye Tumbles":            entry("Tiger's Eye Tumbles", "Tiger's Eye"),

  // ── Raw Crystals ───────────────────────────────────────────
  'Black Tourmaline Raw':           e('Black Tourmaline Raw'),
  'Raw Black Tourmaline':           e('Raw Black Tourmaline'),
  'Rose Quartz Raw':                e('Rose Quartz Raw'),
  'Labradorite Freeform':           e('Labradorite Freeform'),

  // ── Clusters ───────────────────────────────────────────────
  'Amethyst Cluster':               e('Amethyst Cluster'),
  'Pyrite Cluster':                 e('Pyrite Cluster'),
  'Rose Quartz Cluster':            e('Rose Quartz Cluster'),

  // ── Points ─────────────────────────────────────────────────
  'Citrine Point':                  e('Citrine Point'),
  'Clear Quartz Point':             e('Clear Quartz Point'),

  // ── Malas ──────────────────────────────────────────────────
  'Black Tourmaline Mala':          e('Black Tourmaline Mala'),
  'Citrine Mala':                   e('Citrine Mala'),
  'Turquoise Mala':                 e('Turquoise Mala'),

  // ── Crystal Trees ──────────────────────────────────────────
  '7 Chakra Crystal Tree':          e('7 Chakra Crystal Tree'),
  'Amethyst Crystal Tree':          e('Amethyst Crystal Tree'),
  'Carnelian Crystal Tree':         e('Carnelian Crystal Tree'),
  'Green Aventurine Crystal Tree':  e('Green Aventurine Crystal Tree'),
  'Pyrite Crystal Tree':            e('Pyrite Crystal Tree'),
  'Rose Quartz Crystal Tree':       e('Rose Quartz Crystal Tree'),

  // ── Pendants ───────────────────────────────────────────────
  'Amethyst Pendant':               e('Amethyst Pendant'),
  'Black Tourmaline Pendant':       e('Black Tourmaline Pendant'),
  'Citrine Pendant':                e('Citrine Pendant'),
  'Clear Quartz Pendant':           e('Clear Quartz Pendant'),
  'Rose Quartz Pendant':            e('Rose Quartz Pendant'),

  // ── Utility & Decor ────────────────────────────────────────
  'Clear Quartz Ball':              e('Clear Quartz Ball'),
  'Clear Quartz Crystal Pyramid':   e('Clear Quartz Crystal Pyramid'),
  'Clear Quartz Lamp':              e('Clear Quartz Lamp'),
  'Green Aventurine Crystal Pyramid': e('Green Aventurine Crystal Pyramid'),
  'Money Magnet Pyramid':           e('Money Magnet Pyramid'),
  'Selenite Charging Bowl':         e('Selenite Charging Bowl'),
  'Selenite Charging Plate':        e('Selenite Charging Plate'),
  'Selenite Lamp':                  e('Selenite Lamp'),
  'Selenite Tower':                 e('Selenite Tower'),
  'Singing Bowl':                   e('Singing Bowl'),
  'Jube Coin':                      e('Jube Coin'),
};

// Build a case-insensitive lookup for fuzzy matching
const lowerCaseIndex = {};
Object.keys(productImageManifest).forEach(key => {
  lowerCaseIndex[key.toLowerCase()] = key;
});

/**
 * Look up a product in the manifest by name (case-insensitive).
 * @param {string} name 
 * @returns {{ thumbnail: string, gallery: string[] } | null}
 */
export function getProductImages(name) {
  if (!name) return null;
  const direct = productImageManifest[name];
  if (direct) return direct;
  const lower = lowerCaseIndex[name.toLowerCase()];
  if (lower) return productImageManifest[lower];
  return null;
}

export default productImageManifest;
