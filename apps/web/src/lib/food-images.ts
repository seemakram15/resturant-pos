/**
 * Curated Unsplash food photography, license-free and CDN-served.
 * Deterministic mapping so the same dish always shows the same photo.
 * Replace any URL with an owner-supplied Supabase Storage URL later — the
 * `photo_url` column on items/combos already overrides these when set.
 */

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Deal group → hero-worthy combo photo
const DEAL_GROUP: Record<string, string> = {
  technologia: U("photo-1568901346375-23c9450c58cd"), // gourmet burger
  twins: U("photo-1550547660-d9450f859349"), // burger + fries
  family: U("photo-1513104890138-7c749659a591"), // spread / feast
  pizza: U("photo-1513104890138-7c749659a591"),
};

// Category slug → representative photo
const CATEGORY: Record<string, string> = {
  deals: U("photo-1550547660-d9450f859349"),
  burgers: U("photo-1568901346375-23c9450c58cd"),
  chicken: U("photo-1626082927389-6cd097cee6a6"), // fried chicken
  shawarma: U("photo-1529006557810-274b9b2fc783"), // wrap / shawarma
  pizza: U("photo-1513104890138-7c749659a591"),
  steaks: U("photo-1600891964092-4316c288032e"), // steak
  sides: U("photo-1573080496219-bb080dd4f877"), // fries
  drinks: U("photo-1554866585-cd94860890b7"), // soft drink
};

// SKU prefix → specific item photo (falls back to category)
const SKU: Record<string, string> = {
  "BUR-SZ": U("photo-1571091718767-18b5b1457add"),
  "BUR-CP": U("photo-1568901346375-23c9450c58cd"),
  "BUR-GC": U("photo-1594212699903-ec8a3ec50a5b"),
  "BUR-BF": U("photo-1553979459-d2229ba7433b"),
  "BUR-ZG": U("photo-1610440042657-612c34d95e9f"),
  "CHK-FRD": U("photo-1626082927389-6cd097cee6a6"),
  "CHK-BRO": U("photo-1562967914-608f82629710"),
  "CHK-HW": U("photo-1608039755401-742074f0548d"), // wings
  "CHK-NG4": U("photo-1562967916-eb82221dfb92"),
  "SHW-SUP": U("photo-1529006557810-274b9b2fc783"),
  "SHW-SZ": U("photo-1561651823-34feb02250e4"),
  "SHW-DNR": U("photo-1633321088355-d0f81134ca3b"),
  "PZA-SM": U("photo-1513104890138-7c749659a591"),
  "PZA-MD": U("photo-1574071318508-1cdbab80d002"),
  "PZA-LG": U("photo-1565299624946-b28f40a0ae38"),
  "SD-FRIES": U("photo-1573080496219-bb080dd4f877"),
  "SD-PARTHA": U("photo-1626500155537-1ac1f3f0c0f4"),
  "STK-PP": U("photo-1600891964092-4316c288032e"),
  "DRK-R": U("photo-1554866585-cd94860890b7"),
  "DRK-HL": U("photo-1622483767028-3f66f32aef97"),
  "DRK-1L": U("photo-1629203851122-3726ecdf080e"),
  "DRK-1_5L": U("photo-1629203851122-3726ecdf080e"),
};

export function dealImage(category: string, slug?: string): string {
  return DEAL_GROUP[category] ?? CATEGORY[category] ?? CATEGORY.deals;
}

export function itemImage(sku: string | null, categorySlug?: string): string {
  if (sku && SKU[sku]) return SKU[sku];
  if (categorySlug && CATEGORY[categorySlug]) return CATEGORY[categorySlug];
  return CATEGORY.deals;
}

export const HERO_IMAGE = U("photo-1571091718767-18b5b1457add", 1600);
export const HERO_IMAGE_2 = U("photo-1513104890138-7c749659a591", 1600);
export { CATEGORY as CATEGORY_IMAGES };
