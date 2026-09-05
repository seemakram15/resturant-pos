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

// ─── Fallbacks (only used when Supabase env not configured) ────────────────

const FALLBACK_COMBOS: Combo[] = [
  { slug:"black-barry",     category:"technologia", name_en:"Black Barry Deal",     name_ur:null, description_en:"1 Super Zinger Burger + Fries + 1 R. Drink", description_ur:null, price:549,  photo_url:null },
  { slug:"nokia",           category:"technologia", name_en:"Nokia Deal",           name_ur:null, description_en:"1 Chicken Patty Burger + Fries + 1 R. Drink", description_ur:null, price:499,  photo_url:null },
  { slug:"samsung",         category:"technologia", name_en:"Samsung Deal",         name_ur:null, description_en:"1 Grilled Chicken Burger + Fries + 1 R. Drink", description_ur:null, price:649,  photo_url:null },
  { slug:"bhai-bhai",       category:"twins",       name_en:"Bhai Bhai Deal",       name_ur:null, description_en:"2 Super Zinger Burgers + Fries + 1 Half-Litre Drink", description_ur:null, price:999,  photo_url:null },
  { slug:"family-function", category:"family",      name_en:"Family Function Deal", name_ur:null, description_en:"9 Pcs Broast Chicken + 1.5 L Coke", description_ur:null, price:1999, photo_url:null },
  { slug:"mqm",             category:"pizza",       name_en:"MQM Deal",             name_ur:"ایم کیو ایم ڈیل", description_en:"2 Large Pizzas + 1.5 L Coke", description_ur:null, price:3299, photo_url:null },
];

const FALLBACK_CATEGORIES: Category[] = [
  { id:"c1", slug:"deals",    name_en:"Deals",    name_ur:"ڈیلز",   sort_order:1 },
  { id:"c2", slug:"burgers",  name_en:"Burgers",  name_ur:"برگرز",  sort_order:2 },
  { id:"c3", slug:"chicken",  name_en:"Chicken",  name_ur:"چکن",    sort_order:3 },
  { id:"c4", slug:"shawarma", name_en:"Shawarma", name_ur:"شاورما", sort_order:4 },
  { id:"c5", slug:"pizza",    name_en:"Pizza",    name_ur:"پیزا",   sort_order:5 },
  { id:"c6", slug:"steaks",   name_en:"Steaks",   name_ur:"اسٹیکس", sort_order:6 },
  { id:"c7", slug:"sides",    name_en:"Sides",    name_ur:"سائیڈز", sort_order:7 },
  { id:"c8", slug:"drinks",   name_en:"Drinks",   name_ur:"مشروبات",sort_order:8 },
];

const FALLBACK_ITEMS: Item[] = [
  { id:"i1", sku:"BUR-SZ", category_id:"c2", category_slug:"burgers", name_en:"Super Zinger Burger",  name_ur:"سپر زنگر برگر", description_en:null, base_price:450, photo_url:null, is_available:true, tags:["halal","spicy"] },
  { id:"i2", sku:"BUR-CP", category_id:"c2", category_slug:"burgers", name_en:"Chicken Patty Burger", name_ur:"چکن پیٹی برگر", description_en:null, base_price:380, photo_url:null, is_available:true, tags:["halal"] },
  { id:"i3", sku:"CHK-HW", category_id:"c3", category_slug:"chicken", name_en:"Hot Wings (per pc)",   name_ur:"ہاٹ ونگز", description_en:null, base_price:65,  photo_url:null, is_available:true, tags:["halal","spicy"] },
  { id:"i4", sku:"STK-PP", category_id:"c6", category_slug:"steaks",  name_en:"Special Peri Peri Steak", name_ur:"اسٹیک", description_en:null, base_price:1000,photo_url:null, is_available:true, tags:["halal","spicy","grilled"] },
];
