import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getPublicSupabase } from "./supabase-anon";

const PRODUCT_SELECT = `
  id, slug, name, short_description, description, category_id, tags,
  is_featured, is_subscribable, rating_avg, rating_count, seo_title, seo_description,
  product_variants!inner ( id, label, price_paise, compare_at_paise, unit, stock_qty, reserved_qty, is_default, is_active ),
  product_images ( url, alt, sort_order )
`;

export type CatalogVariant = {
  id: string;
  label: string;
  price_paise: number;
  compare_at_paise: number | null;
  unit: string | null;
  stock_qty: number;
  reserved_qty: number;
  is_default: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  tags: string[];
  is_featured: boolean;
  is_subscribable: boolean;
  rating_avg: number;
  rating_count: number;
  seo_title: string | null;
  seo_description: string | null;
  variants: CatalogVariant[];
  images: { url: string; alt: string | null }[];
  minPrice: number;
  available: boolean;
};

type RawProduct = Omit<CatalogProduct, "variants" | "images" | "minPrice" | "available"> & {
  product_variants: (CatalogVariant & { is_active: boolean })[];
  product_images: { url: string; alt: string | null; sort_order: number }[];
};

function shape(rows: RawProduct[]): CatalogProduct[] {
  return rows.map((row) => {
    const variants = (row.product_variants ?? [])
      .filter((v) => v.is_active)
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.price_paise - b.price_paise)
      .map(({ is_active: _ignored, ...v }) => v);
    const images = (row.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ url, alt }) => ({ url, alt }));
    const { product_variants: _v, product_images: _i, ...rest } = row;
    return {
      ...rest,
      variants,
      images,
      minPrice: variants.length ? Math.min(...variants.map((v) => v.price_paise)) : 0,
      available: variants.some((v) => v.stock_qty - v.reserved_qty > 0),
    };
  });
}

export type Category = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id, description, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
});

const listSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["popular", "price_asc", "price_desc", "name", "newest"]).default("popular"),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(60).default(24),
  inStockOnly: z.boolean().default(false),
  maxPrice: z.number().int().optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const [{ data: cats }, { data: rows, error }] = await Promise.all([
      supabase.from("categories").select("id, slug, parent_id").eq("is_active", true),
      supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true).limit(500),
    ]);
    if (error) throw new Error(error.message);
    let products = shape((rows ?? []) as unknown as RawProduct[]);

    if (data.category && cats) {
      const cat = cats.find((c) => c.slug === data.category);
      if (cat) {
        const ids = new Set<string>([cat.id]);
        cats.filter((c) => c.parent_id === cat.id).forEach((c) => ids.add(c.id));
        products = products.filter((p) => p.category_id && ids.has(p.category_id));
      } else {
        products = [];
      }
    }
    if (data.q) {
      const term = data.q.trim().toLowerCase();
      const words = term.split(/\s+/).filter(Boolean);
      products = products.filter((p) => {
        const haystack = `${p.name} ${p.short_description ?? ""} ${p.tags.join(" ")}`.toLowerCase();
        return words.every((w) => haystack.includes(w));
      });
    }
    if (data.inStockOnly) products = products.filter((p) => p.available);
    if (data.maxPrice) products = products.filter((p) => p.minPrice <= data.maxPrice!);

    products.sort((a, b) => {
      switch (data.sort) {
        case "price_asc":
          return a.minPrice - b.minPrice;
        case "price_desc":
          return b.minPrice - a.minPrice;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return (
            Number(b.available) - Number(a.available) ||
            Number(b.is_featured) - Number(a.is_featured) ||
            b.rating_count - a.rating_count ||
            a.name.localeCompare(b.name)
          );
      }
    });

    const total = products.length;
    const start = (data.page - 1) * data.perPage;
    return {
      total,
      page: data.page,
      perPage: data.perPage,
      items: products.slice(start, start + data.perPage),
    };
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const { data: row, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const product = shape([row as unknown as RawProduct])[0]!;

    const [{ data: reviews }, { data: related }] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, author_name, rating, title, body, created_at, verified_purchase")
        .eq("product_id", product.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20),
      product.category_id
        ? supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("is_active", true)
            .eq("category_id", product.category_id)
            .neq("id", product.id)
            .limit(8)
        : Promise.resolve({ data: [] as unknown[] }),
    ]);

    return {
      product,
      reviews: reviews ?? [],
      related: shape((related ?? []) as unknown as RawProduct[]).slice(0, 4),
    };
  });

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const [{ data: cats }, { data: rows, error }, { data: zones }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, parent_id, description, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true).limit(500),
    supabase.from("delivery_zones").select("pincode, area").eq("is_active", true).order("area"),
  ]);
  if (error) throw new Error(error.message);
  const all = shape((rows ?? []) as unknown as RawProduct[]);
  const categories = (cats ?? []) as Category[];
  const bySlug = (slug: string, limit = 4) => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return [];
    const ids = new Set<string>([cat.id]);
    categories.filter((c) => c.parent_id === cat.id).forEach((c) => ids.add(c.id));
    return all
      .filter((p) => p.category_id && ids.has(p.category_id) && p.available)
      .sort((a, b) => b.rating_count - a.rating_count || a.minPrice - b.minPrice)
      .slice(0, limit);
  };
  return {
    categories: categories.filter((c) => !c.parent_id),
    zones: zones ?? [],
    productCount: all.length,
    dairy: bySlug("milk"),
    ghee: bySlug("ghee"),
    oils: bySlug("oils"),
    honey: bySlug("honey", 3),
    farmFresh: bySlug("farm-fresh", 8),
  };
});

export const listDeliveryZones = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("pincode, area, city, fee_paise, free_above_paise, min_order_paise, cod_available, slots")
    .eq("is_active", true)
    .order("area");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const checkPincode = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ pincode: z.string().min(6).max(6) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const { data: zone, error } = await supabase
      .from("delivery_zones")
      .select("pincode, area, city, fee_paise, free_above_paise, min_order_paise, cod_available, slots")
      .eq("pincode", data.pincode)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { serviceable: !!zone, zone: zone ?? null };
  });

export const listVariantsByIds = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ ids: z.array(z.string().uuid()).max(50) }).parse(data))
  .handler(async ({ data }) => {
    if (!data.ids.length) return [];
    const supabase = getPublicSupabase();
    const { data: rows, error } = await supabase
      .from("product_variants")
      .select(
        "id, label, price_paise, stock_qty, reserved_qty, is_active, products ( slug, name, product_images ( url, sort_order ) )",
      )
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const product = r.products as unknown as {
        slug: string;
        name: string;
        product_images: { url: string; sort_order: number }[];
      } | null;
      const image =
        product?.product_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
      return {
        id: r.id,
        label: r.label,
        price_paise: r.price_paise,
        available: r.is_active && r.stock_qty - r.reserved_qty > 0,
        maxQty: Math.max(0, r.stock_qty - r.reserved_qty),
        productSlug: product?.slug ?? "",
        productName: product?.name ?? "",
        image,
      };
    });
  });
