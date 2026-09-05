import { serverClient, TENANT_ID } from "./supabase";

export type Combo = {
  slug: string;
  category: string;
  name_en: string;
  name_ur: string | null;
  description_en: string | null;
  description_ur: string | null;
  price: number;
  photo_url: string | null;
};

export type Item = {
  id: string;
  sku: string | null;
  category_id: string | null;
  category_slug?: string;
  name_en: string;
  name_ur: string | null;
  description_en: string | null;
  base_price: number;
  photo_url: string | null;
  is_available: boolean;
  tags: string[];
};

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_ur: string | null;
  sort_order: number;
};

/**
 * Fetch all active combos (deals). If Supabase env is missing we fall back to a
 * built-in sample so the site still renders during initial setup.
 */
export async function getAllCombos(): Promise<Combo[]> {
  try {
    const sb = await serverClient();
    const { data, error } = await sb
      .from("combos")
      .select("slug, category, name_en, name_ur, description_en, description_ur, price, photo_url")
      .eq("tenant_id", TENANT_ID)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return FALLBACK_COMBOS;
    return data as Combo[];
  } catch {
    return FALLBACK_COMBOS;
  }
}

export async function getFeaturedDeals(limit = 6): Promise<Combo[]> {
  const all = await getAllCombos();
  return all.slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  try {
    const sb = await serverClient();
    const { data, error } = await sb
      .from("categories")
      .select("id, slug, name_en, name_ur, sort_order")
      .eq("tenant_id", TENANT_ID)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return FALLBACK_CATEGORIES;
    return data as Category[];
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function getItemsByCategory(): Promise<Record<string, Item[]>> {
  try {
    const sb = await serverClient();
    const { data, error } = await sb
      .from("items")
      .select("id, sku, category_id, name_en, name_ur, description_en, base_price, photo_url, is_available, tags, categories(slug)")
      .eq("tenant_id", TENANT_ID)
      .eq("is_available", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return groupItems(FALLBACK_ITEMS);
    const items = (data as unknown as Array<Item & { categories: { slug: string } | null }>).map(
      (r) => ({ ...r, category_slug: r.categories?.slug ?? "misc" })
    );
    return groupItems(items);
  } catch {
    return groupItems(FALLBACK_ITEMS);
  }
}

function groupItems(items: Item[]): Record<string, Item[]> {
  return items.reduce<Record<string, Item[]>>((acc, i) => {
    const k = i.category_slug ?? "misc";
    (acc[k] ??= []).push(i);
    return acc;
  }, {});
}

// ─── Fallbacks (used when Supabase env not configured; kept in sync with seed) ─

const FALLBACK_COMBOS: Combo[] = [
  { slug:"black-barry",     category:"technologia", name_en:"Black Barry Deal", name_ur:null, description_en:"1 Super Zinger Burger + Fries + 1 R. Drink", description_ur:null, price:549, photo_url:null },
  { slug:"nokia",           category:"technologia", name_en:"Nokia Deal",       name_ur:null, description_en:"1 Chicken Patty Burger + Fries + 1 R. Drink", description_ur:null, price:499, photo_url:null },
  { slug:"samsung",         category:"technologia", name_en:"Samsung Deal",     name_ur:null, description_en:"1 Grilled Chicken Burger + Fries + 1 R. Drink", description_ur:null, price:649, photo_url:null },
  { slug:"galaxy",          category:"technologia", name_en:"Galaxy Deal",      name_ur:null, description_en:"1 Super Zinger Burger + 1 Pc Chicken + Fries + 1 R. Drink", description_ur:null, price:649, photo_url:null },
  { slug:"techno",          category:"technologia", name_en:"Techno Deal",      name_ur:null, description_en:"1 Beef Burger (Double Filled) + Fries + 1 R. Drink", description_ur:null, price:749, photo_url:null },
  { slug:"vivo",            category:"technologia", name_en:"Vivo Deal",        name_ur:null, description_en:"1 Chicken Patty Burger + 4 Pcs Nuggets + 1 R. Drink", description_ur:null, price:599, photo_url:null },
  { slug:"ham-tum",         category:"twins",       name_en:"Ham Tum Deal",     name_ur:null, description_en:"9 Pcs Hot Wings + 1 R. Drink", description_ur:null, price:649, photo_url:null },
  { slug:"janu-manu",       category:"twins",       name_en:"Janu Manu Deal",   name_ur:null, description_en:"2 Pcs Chicken + 1 R. Drink", description_ur:null, price:599, photo_url:null },
  { slug:"bhai-bhai",       category:"twins",       name_en:"Bhai Bhai Deal",   name_ur:null, description_en:"2 Super Zinger Burgers + Fries + 1 Half-Litre Drink", description_ur:null, price:999, photo_url:null },
  { slug:"shony-mony",      category:"twins",       name_en:"Shony Mony Deal",  name_ur:null, description_en:"1 Chicken Patty Burger + 1 Super Zinger Burger + Fries + 1 Half-Litre Drink", description_ur:null, price:999, photo_url:null },
  { slug:"mama-papa",       category:"twins",       name_en:"Mama Papa Deal",   name_ur:null, description_en:"1 Cocktail Paratha Platter + 2 R. Drinks", description_ur:null, price:1199, photo_url:null },
  { slug:"laila-majnu",     category:"twins",       name_en:"Laila Majnu Deal", name_ur:null, description_en:"2 Khalifa Super Shawarma (Black Olives, Jalapeño) + 2 R. Drinks", description_ur:null, price:749, photo_url:null },
  { slug:"joined-family",   category:"family",      name_en:"Joined Family Deal",   name_ur:null, description_en:"3 Super Zinger Burgers + 1 Chicken Patty Burger + 3 Pcs Chicken + Fries + 1.5 L Coke", description_ur:null, price:2199, photo_url:null },
  { slug:"lovely-cousin",   category:"family",      name_en:"Lovely Cousin Deal",   name_ur:null, description_en:"3 Super Zinger Burgers + 6 Pcs Hot Wings + 1 L Coke", description_ur:null, price:1499, photo_url:null },
  { slug:"group-bandi",     category:"family",      name_en:"Group Bandi Deal",     name_ur:null, description_en:"5 Super Zinger Burgers + Fries + 1.5 L Coke", description_ur:null, price:1999, photo_url:null },
  { slug:"family-function", category:"family",      name_en:"Family Function Deal", name_ur:null, description_en:"9 Pcs Broast Chicken + 1.5 L Coke", description_ur:null, price:1999, photo_url:null },
  { slug:"chachu-family",   category:"family",      name_en:"Chachu ki Family Deal",name_ur:null, description_en:"6 Super Zinger Shawarmas + 1.5 L Coke", description_ur:null, price:1949, photo_url:null },
  { slug:"mamo-family",     category:"family",      name_en:"Mamo ki Family Deal",  name_ur:null, description_en:"2 Donner Shawarmas + 2 Grilled Chicken Burgers + 9 Pcs Hot Wings + 1.5 L Coke", description_ur:null, price:2249, photo_url:null },
  { slug:"muslim-league-n", category:"pizza",       name_en:"Muslim League N Deal", name_ur:"پاکستان مسلم لیگ ن ڈیل", description_en:"2 Small Pizzas + Half-Litre Drink", description_ur:null, price:1199, photo_url:null },
  { slug:"tehreek-insaf",   category:"pizza",       name_en:"Tehreek-e-Insaf Deal", name_ur:"پاکستان تحریک انصاف ڈیل", description_en:"1 Small Pizza + 1 Zinger Burger + 4 Pcs Hot Wings + Half-Litre Drink", description_ur:null, price:1299, photo_url:null },
  { slug:"tehreek-labbaik", category:"pizza",       name_en:"Tehreek-e-Labbaik Deal", name_ur:"پاکستان تحریک لبیک ڈیل", description_en:"2 Medium Pizzas + 1.5 L Coke", description_ur:null, price:2299, photo_url:null },
  { slug:"peoples-party",   category:"pizza",       name_en:"Peoples Party Deal",   name_ur:"پاکستان پیپلز پارٹی ڈیل", description_en:"2 Small Pizzas + 2 Zinger Burgers + 8 Pcs Hot Wings + 1.5 L Coke", description_ur:null, price:2399, photo_url:null },
  { slug:"mqm",             category:"pizza",       name_en:"MQM Deal",             name_ur:"ایم کیو ایم ڈیل", description_en:"2 Large Pizzas + 1.5 L Coke", description_ur:null, price:3299, photo_url:null },
  { slug:"azad-umeedwar",   category:"pizza",       name_en:"Azad Umeedwar Deal",   name_ur:"آزاد امیدوار ڈیل", description_en:"1 Large Pizza + 4 Zinger Burgers + Fries + 1.5 L Coke", description_ur:null, price:3599, photo_url:null },
];

const FALLBACK_CATEGORIES: Category[] = [
  { id:"c1",  slug:"deals",         name_en:"Deals",         name_ur:"ڈیلز",         sort_order:1 },
  { id:"c2",  slug:"burgers",       name_en:"Burgers",       name_ur:"برگرز",        sort_order:2 },
  { id:"c3",  slug:"pizza",         name_en:"Pizza",         name_ur:"پیزا",         sort_order:3 },
  { id:"c4",  slug:"shawarma",      name_en:"Shawarma",      name_ur:"شاورما",       sort_order:4 },
  { id:"c5",  slug:"sandwiches",    name_en:"Sandwiches",    name_ur:"سینڈوچ",       sort_order:5 },
  { id:"c6",  slug:"appetizers",    name_en:"Appetizers",    name_ur:"اپیٹائزر",     sort_order:6 },
  { id:"c7",  slug:"steaks",        name_en:"Steaks",        name_ur:"اسٹیکس",       sort_order:7 },
  { id:"c8",  slug:"chicken",       name_en:"Chicken",       name_ur:"چکن",          sort_order:8 },
  { id:"c9",  slug:"paratha-wraps", name_en:"Paratha Wraps", name_ur:"پراٹھا ریپ",  sort_order:9 },
  { id:"c10", slug:"sides",         name_en:"Sides",         name_ur:"سائیڈز",       sort_order:10 },
  { id:"c11", slug:"pasta",         name_en:"Pasta & More",  name_ur:"پاستا",        sort_order:11 },
  { id:"c12", slug:"drinks",        name_en:"Drinks",        name_ur:"مشروبات",     sort_order:12 },
];

type FI = Omit<Item, "id" | "category_id"> & { category_slug: string };
const F = (sku:string, cat:string, name_en:string, name_ur:string|null, base_price:number, tags:string[] = ["halal"]):FI =>
  ({ sku, category_slug:cat, name_en, name_ur, description_en:null, base_price, photo_url:null, is_available:true, tags });

const FALLBACK_ITEMS: Item[] = ([
  // Burgers
  F("BUR-SZ","burgers","Khalifa Special Super Zinger Burger","سپر زنگر برگر",379,["halal","spicy"]),
  F("BUR-CP","burgers","Chicken Patty Burger","چکن پیٹی برگر",349),
  F("BUR-GC","burgers","Khalifa Special Grilled Chicken Burger","گرلڈ چکن برگر",499,["halal","grilled"]),
  F("BUR-BF","burgers","Khalifa Special Beef Burger (Double Fillet)","بیف برگر ڈبل",649,["halal","beef"]),
  F("BUR-ZG","burgers","Zinger Burger","زنگر برگر",400,["halal","spicy"]),
  F("BUR-JAL","burgers","Khalifa Special Jalapeno Burger","جیلاپینو برگر",549,["halal","spicy"]),
  F("BUR-LAV","burgers","Khalifa Special Lava Burger","لاوا برگر",649,["halal","spicy"]),
  F("BUR-KRZ","burgers","Khalifa Special Krizma Burger","کرزما برگر",649),
  F("BUR-YP","burgers","Khalifa Special Yum Pum Burger","یم پم برگر",699),
  F("BUR-WT","burgers","Khalifa Special Wahshi Tower Burger","واحشی ٹاور برگر",699,["halal","spicy"]),
  F("BUR-BAT","burgers","Khalifa Special Batmeeeez Burger","بیٹمیز برگر",699),
  // Sandwiches
  F("SND-GC","sandwiches","Khalifa Special Grilled Chicken Sandwich","گرلڈ چکن سینڈوچ",499,["halal","grilled"]),
  F("SND-BF","sandwiches","Beef Sandwich","بیف سینڈوچ",499,["halal","beef"]),
  F("SND-KBB","sandwiches","Kababish Sandwich","کبابش سینڈوچ",499),
  F("SND-ARB","sandwiches","Khalifa Special Arabic Sandwich","عربی سینڈوچ",499),
  // Appetizers
  F("APP-HW9","appetizers","Khalifa Special Hot Wings (9 pcs)","ہاٹ ونگز (9)",599,["halal","spicy"]),
  F("APP-HS9","appetizers","Khalifa Special Hot Shots (9 pcs)","ہاٹ شاٹس (9)",649,["halal","spicy"]),
  F("APP-GSW9","appetizers","Grilled Spicy Wings (9 pcs)","گرلڈ اسپائسی ونگز (9)",649,["halal","spicy","grilled"]),
  F("APP-NG9","appetizers","Nuggets (9 pcs)","نگٹس (9)",549),
  F("APP-FCP","appetizers","Fried Chicken Piece","فرائیڈ چکن پیس",299),
  F("APP-FRY","appetizers","Plain Fries","پلین فرائز",249,[]),
  F("APP-GMF","appetizers","Khalifa Garlic Mayo Fries","گارلک میو فرائز",349,[]),
  F("APP-LF","appetizers","Khalifa Special Loaded Fries","لوڈڈ فرائز",499,[]),
  F("APP-HST6","appetizers","Khalifa Special Hot Stips (6 pcs)","ہاٹ اسٹرپس (6)",549,["halal","spicy"]),
  // Chicken (per-pc kitchen SKUs kept for combos)
  F("CHK-FRD","chicken","Fried Chicken (per pc)","فرائیڈ چکن",240),
  F("CHK-BRO","chicken","Broast Chicken (per pc)","بروسٹ چکن",260),
  F("CHK-HW","chicken","Hot Wings (per pc)","ہاٹ ونگز",65,["halal","spicy"]),
  F("CHK-NG4","chicken","Nuggets (4 pcs)","نگٹس",250),
  // Shawarma
  F("SHW-SUP","shawarma","Khalifa Super Shawarma","خلیفہ سپر شاورما",349,["halal","spicy"]),
  F("SHW-SZ","shawarma","Zinger Shawarma","زنگر شاورما",359,["halal","spicy"]),
  F("SHW-DNR","shawarma","Donner Shawarma","ڈونر شاورما",399),
  F("SHW-GRL","shawarma","Khalifa Special Grilled Shawarma","گرلڈ شاورما",399,["halal","grilled"]),
  F("SHW-BF","shawarma","Beef Shawarma","بیف شاورما",399,["halal","beef"]),
  F("SHW-CHK","shawarma","Chicken Shawarma (Regular)","چکن شاورما",350),
  F("SHW-PLT","shawarma","Shawarma Platter","شاورما پلیٹر",599),
  // Paratha Wraps
  F("SD-PARTHA","paratha-wraps","Khalifa Special Cocktail Paratha Platter","کاک ٹیل پراٹھا پلیٹر",999),
  F("WRP-TWS","paratha-wraps","Twister Paratha Wrap","ٹوئسٹر پراٹھا ریپ",599),
  F("WRP-KBB","paratha-wraps","Kababish Paratha Wrap","کبابش پراٹھا ریپ",599),
  F("WRP-TRT","paratha-wraps","Khalifa Special Tortilla Wrap","ٹورٹیلا ریپ",699),
  F("WRP-ARB","paratha-wraps","Khalifa Special Arabic Paratha Wrap","عربی پراٹھا ریپ",599),
  F("WRP-PZA","paratha-wraps","Khalifa Special Pizza Paratha","پیزا پراٹھا",599),
  // Steaks
  F("STK-PP","steaks","Khalifa Special Peri Peri Steak","پیری پیری اسٹیک",899,["halal","spicy","grilled"]),
  F("STK-GC","steaks","Khalifa Special Grilled Chicken Steak","گرلڈ چکن اسٹیک",899,["halal","grilled"]),
  F("STK-ARB","steaks","Khalifa Special Arabic Steak","عربی اسٹیک",899,["halal","grilled"]),
  // Sides (base pizza sizes stay in the kitchen catalog for combos)
  F("SD-FRIES","sides","Fries","فرائز",180,[]),
  // Pasta & more
  F("MSC-CCP","pasta","Chicken Cheese Pasta","چکن چیز پاستا",499),
  F("MSC-PC","pasta","Pizza Container","پیزا کنٹینر",499),
  // Pizza — Special flavours S/M/L
  F("PZA-COR-S","pizza","Corolla Tikka (Small)","کرولا تکہ (چھوٹا)",599,["halal","spicy"]),
  F("PZA-COR-M","pizza","Corolla Tikka (Medium)","کرولا تکہ (درمیانہ)",1099,["halal","spicy"]),
  F("PZA-COR-L","pizza","Corolla Tikka (Large)","کرولا تکہ (بڑا)",1649,["halal","spicy"]),
  F("PZA-FER-S","pizza","Ferrari Fajita (Small)","فراری فاجیتا (چھوٹا)",599,["halal","spicy"]),
  F("PZA-FER-M","pizza","Ferrari Fajita (Medium)","فراری فاجیتا (درمیانہ)",1099,["halal","spicy"]),
  F("PZA-FER-L","pizza","Ferrari Fajita (Large)","فراری فاجیتا (بڑا)",1649,["halal","spicy"]),
  F("PZA-BMW-S","pizza","BMW BBQ (Small)","BMW بی بی کیو (چھوٹا)",599),
  F("PZA-BMW-M","pizza","BMW BBQ (Medium)","BMW بی بی کیو (درمیانہ)",1099),
  F("PZA-BMW-L","pizza","BMW BBQ (Large)","BMW بی بی کیو (بڑا)",1649),
  F("PZA-CIV-S","pizza","Civic Supreme (Small)","سوک سپریم (چھوٹا)",599),
  F("PZA-CIV-M","pizza","Civic Supreme (Medium)","سوک سپریم (درمیانہ)",1099),
  F("PZA-CIV-L","pizza","Civic Supreme (Large)","سوک سپریم (بڑا)",1649),
  // Pizza — Luxury flavours
  F("PZA-AUD-M","pizza","Audi Crown Crust (Medium)","آڈی کراؤن کرسٹ (درمیانہ)",1299,["halal","luxury"]),
  F("PZA-AUD-L","pizza","Audi Crown Crust (Large)","آڈی کراؤن کرسٹ (بڑا)",1999,["halal","luxury"]),
  F("PZA-KIA-S","pizza","Kia Kababish (Small)","کیا کبابش (چھوٹا)",699,["halal","luxury"]),
  F("PZA-KIA-M","pizza","Kia Kababish (Medium)","کیا کبابش (درمیانہ)",1299,["halal","luxury"]),
  F("PZA-KIA-L","pizza","Kia Kababish (Large)","کیا کبابش (بڑا)",1999,["halal","luxury"]),
  F("PZA-MER-S","pizza","Mercedes Malai Boti (Small)","مرسڈیز ملائی بوٹی (چھوٹا)",699,["halal","luxury"]),
  F("PZA-MER-M","pizza","Mercedes Malai Boti (Medium)","مرسڈیز ملائی بوٹی (درمیانہ)",1299,["halal","luxury"]),
  F("PZA-MER-L","pizza","Mercedes Malai Boti (Large)","مرسڈیز ملائی بوٹی (بڑا)",1999,["halal","luxury"]),
  F("PZA-LUX-M","pizza","Luxury Lasagna (Medium)","لگژری لاسانیا (درمیانہ)",1299,["halal","luxury"]),
  F("PZA-LUX-L","pizza","Luxury Lasagna (Large)","لگژری لاسانیا (بڑا)",1999,["halal","luxury"]),
  // Drinks
  F("DRK-R","drinks","Regular Drink (250 ml)","ریگولر ڈرنک",80,[]),
  F("DRK-HL","drinks","Half-Litre Drink","ہاف لیٹر ڈرنک",150,[]),
  F("DRK-1L","drinks","1 Litre Coke","1 لیٹر کوک",230,[]),
  F("DRK-1_5L","drinks","1.5 Litre Coke","1.5 لیٹر کوک",290,[]),
] as FI[]).map((it, idx) => ({ ...it, id:`i${idx+1}`, category_id:null }));
