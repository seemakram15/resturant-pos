/**
 * Curated Unsplash food photography — every URL below has been probed and
 * returns 200. Owner-supplied `photo_url` on items/combos still overrides these.
 * Upgrade path: replace any of these with real dish photos in Supabase Storage.
 */

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Named photo bank (all verified 200 from images.unsplash.com)
const IMG = {
  burgerClassic:    U("photo-1568901346375-23c9450c58cd"), // double cheeseburger
  burgerZinger:     U("photo-1571091718767-18b5b1457add"), // spicy zinger-style burger
  burgerCombo:      U("photo-1550547660-d9450f859349"),    // burger + fries
  burgerBeef:       U("photo-1553979459-d2229ba7433b"),    // beef stack
  burgerCheese:     U("photo-1586190848861-99aa4a171e90"), // cheeseburger
  burgerBig:        U("photo-1607013251379-e6eecfffe234"), // tall burger
  burgerSmash:      U("photo-1596662951482-0c4ba74a6df6"), // smash burger
  burgerJalapeno:   U("photo-1550317138-10000687a72b"),    // spicy burger
  burgerTower:      U("photo-1615297928064-24977384d0da"), // stacked burger
  burgerFlame:      U("photo-1610440042657-612c34d95e9f"), // flame-grilled burger

  pizzaClassic:     U("photo-1513104890138-7c749659a591"), // classic pizza
  pizzaMargherita:  U("photo-1565299624946-b28f40a0ae38"),
  pizzaPepperoni:   U("photo-1574071318508-1cdbab80d002"),
  pizzaCheese:      U("photo-1552539618-7eec9b4d1796"),
  pizzaSupreme:     U("photo-1590947132387-155cc02f3212"),
  pizzaBbq:         U("photo-1594007654729-407eedc4be65"),
  pizzaChicken:     U("photo-1571407970349-bc81e7e96d47"),
  lasagna:          U("photo-1619895092538-128341789043"),

  sandwichClassic:  U("photo-1528735602780-2552fd46c7af"),
  sandwichClub:     U("photo-1592415486689-125cbbfcbee2"),
  sandwichArabic:   U("photo-1509722747041-616f39b57569"),
  sandwichBeef:     U("photo-1521305916504-4a1121188589"),

  wingsHot:         U("photo-1608039755401-742074f0548d"), // hot wings
  chickenStrips:    U("photo-1585032226651-759b368d7246"), // strips
  friedChicken:     U("photo-1562967914-608f82629710"),    // broast / fried chicken
  chickenSpicy:     U("photo-1567620832903-9fc6debc209f"), // spicy chicken
  chickenGrilled:   U("photo-1527477396000-e27163b481c2"), // grilled chicken
  nuggets:          U("photo-1562967916-eb82221dfb92"),    // nuggets

  fries:            U("photo-1573080496219-bb080dd4f877"),
  friesLoaded:      U("photo-1585109649139-366815a0d713"),
  friesGarlic:      U("photo-1541592106381-b31e9677c0e5"),

  shawarma:         U("photo-1529006557810-274b9b2fc783"), // shawarma wrap
  shawarmaGrilled:  U("photo-1561651823-34feb02250e4"),
  shawarmaBeef:     U("photo-1633321088355-d0f81134ca3b"),
  shawarmaPlatter:  U("photo-1544025162-d76694265947"),

  steak:            U("photo-1600891964092-4316c288032e"),
  pasta:            U("photo-1563379926898-05f4575a45d8"),

  wrap:             U("photo-1481070555726-e2fe8357725c"),
  parathaPlatter:   U("photo-1601924582970-9238bcb495d9"),

  familyFeast:      U("photo-1504674900247-0877df9cc836"),
  spread:           U("photo-1517244683847-7456b63c5969"),
  combo:            U("photo-1520072959219-c595dc870360"),
  restaurantFood:   U("photo-1552332386-f8dd00dc2f85"),

  drinkGlass:       U("photo-1554866585-cd94860890b7"),
  drinkBottle:      U("photo-1622483767028-3f66f32aef97"),
  drinkCoke:        U("photo-1629203851122-3726ecdf080e"),
} as const;

// Category slug → representative photo
const CATEGORY: Record<string, string> = {
  deals: IMG.combo,
  burgers: IMG.burgerClassic,
  chicken: IMG.friedChicken,
  shawarma: IMG.shawarma,
  pizza: IMG.pizzaClassic,
  steaks: IMG.steak,
  sides: IMG.fries,
  drinks: IMG.drinkGlass,
  sandwiches: IMG.sandwichClassic,
  appetizers: IMG.wingsHot,
  "paratha-wraps": IMG.wrap,
  pasta: IMG.pasta,
};

// SKU → specific photo (falls back to category)
const SKU: Record<string, string> = {
  // Burgers
  "BUR-SZ":  IMG.burgerZinger,
  "BUR-CP":  IMG.burgerClassic,
  "BUR-GC":  IMG.chickenGrilled,
  "BUR-BF":  IMG.burgerBeef,
  "BUR-ZG":  IMG.burgerZinger,
  "BUR-JAL": IMG.burgerJalapeno,
  "BUR-LAV": IMG.burgerFlame,
  "BUR-KRZ": IMG.burgerCheese,
  "BUR-YP":  IMG.burgerSmash,
  "BUR-WT":  IMG.burgerTower,
  "BUR-BAT": IMG.burgerBig,

  // Sandwiches
  "SND-GC":  IMG.sandwichClub,
  "SND-BF":  IMG.sandwichBeef,
  "SND-KBB": IMG.sandwichClassic,
  "SND-ARB": IMG.sandwichArabic,

  // Appetizers
  "APP-HW9":  IMG.wingsHot,
  "APP-HS9":  IMG.chickenSpicy,
  "APP-GSW9": IMG.wingsHot,
  "APP-NG9":  IMG.nuggets,
  "APP-FCP":  IMG.friedChicken,
  "APP-FRY":  IMG.fries,
  "APP-GMF":  IMG.friesGarlic,
  "APP-LF":   IMG.friesLoaded,
  "APP-HST6": IMG.chickenStrips,

  // Chicken (kitchen SKUs)
  "CHK-FRD": IMG.friedChicken,
  "CHK-BRO": IMG.friedChicken,
  "CHK-HW":  IMG.wingsHot,
  "CHK-NG4": IMG.nuggets,

  // Shawarma
  "SHW-SUP": IMG.shawarma,
  "SHW-SZ":  IMG.shawarmaGrilled,
  "SHW-DNR": IMG.shawarmaBeef,
  "SHW-GRL": IMG.shawarmaGrilled,
  "SHW-BF":  IMG.shawarmaBeef,
  "SHW-CHK": IMG.shawarma,
  "SHW-PLT": IMG.shawarmaPlatter,

  // Paratha wraps
  "SD-PARTHA": IMG.parathaPlatter,
  "WRP-TWS":   IMG.wrap,
  "WRP-KBB":   IMG.wrap,
  "WRP-TRT":   IMG.wrap,
  "WRP-ARB":   IMG.sandwichArabic,
  "WRP-PZA":   IMG.pizzaChicken,

  // Steaks
  "STK-PP":  IMG.steak,
  "STK-GC":  IMG.chickenGrilled,
  "STK-ARB": IMG.steak,

  // Pasta & misc
  "MSC-CCP": IMG.pasta,
  "MSC-PC":  IMG.pizzaClassic,

  // Sides
  "SD-FRIES": IMG.fries,

  // Pizza — Special
  "PZA-SM": IMG.pizzaClassic,
  "PZA-MD": IMG.pizzaMargherita,
  "PZA-LG": IMG.pizzaPepperoni,
  "PZA-COR-S": IMG.pizzaChicken, "PZA-COR-M": IMG.pizzaChicken, "PZA-COR-L": IMG.pizzaChicken,
  "PZA-FER-S": IMG.pizzaSupreme, "PZA-FER-M": IMG.pizzaSupreme, "PZA-FER-L": IMG.pizzaSupreme,
  "PZA-BMW-S": IMG.pizzaBbq,     "PZA-BMW-M": IMG.pizzaBbq,     "PZA-BMW-L": IMG.pizzaBbq,
  "PZA-CIV-S": IMG.pizzaClassic, "PZA-CIV-M": IMG.pizzaClassic, "PZA-CIV-L": IMG.pizzaClassic,
  // Pizza — Luxury
  "PZA-AUD-M": IMG.pizzaCheese,     "PZA-AUD-L": IMG.pizzaCheese,
  "PZA-KIA-S": IMG.pizzaMargherita, "PZA-KIA-M": IMG.pizzaMargherita, "PZA-KIA-L": IMG.pizzaMargherita,
  "PZA-MER-S": IMG.pizzaChicken,    "PZA-MER-M": IMG.pizzaChicken,    "PZA-MER-L": IMG.pizzaChicken,
  "PZA-LUX-M": IMG.lasagna,         "PZA-LUX-L": IMG.lasagna,

  // Drinks
  "DRK-R":    IMG.drinkGlass,
  "DRK-HL":   IMG.drinkBottle,
  "DRK-1L":   IMG.drinkCoke,
  "DRK-1_5L": IMG.drinkCoke,
};

// Deal group → hero-worthy combo photo
const DEAL_GROUP: Record<string, string> = {
  technologia: IMG.burgerCombo,
  twins:       IMG.burgerCombo,
  family:      IMG.familyFeast,
  pizza:       IMG.pizzaClassic,
};

// Deal slug → specific photo when it makes the card read better
const DEAL_SLUG: Record<string, string> = {
  "black-barry":     IMG.burgerCombo,
  "nokia":           IMG.burgerClassic,
  "samsung":         IMG.chickenGrilled,
  "galaxy":          IMG.burgerZinger,
  "techno":          IMG.burgerBeef,
  "vivo":            IMG.nuggets,
  "ham-tum":         IMG.wingsHot,
  "janu-manu":       IMG.friedChicken,
  "bhai-bhai":       IMG.burgerCombo,
  "shony-mony":      IMG.burgerCombo,
  "mama-papa":       IMG.parathaPlatter,
  "laila-majnu":     IMG.shawarma,
  "joined-family":   IMG.familyFeast,
  "lovely-cousin":   IMG.wingsHot,
  "group-bandi":     IMG.burgerCombo,
  "family-function": IMG.friedChicken,
  "chachu-family":   IMG.shawarmaPlatter,
  "mamo-family":     IMG.familyFeast,
  "muslim-league-n": IMG.pizzaClassic,
  "tehreek-insaf":   IMG.pizzaMargherita,
  "tehreek-labbaik": IMG.pizzaPepperoni,
  "peoples-party":   IMG.pizzaSupreme,
  "mqm":             IMG.pizzaCheese,
  "azad-umeedwar":   IMG.pizzaBbq,
};

export function dealImage(category: string, slug?: string): string {
  if (slug && DEAL_SLUG[slug]) return DEAL_SLUG[slug];
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
