import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listCategories, listProducts } from "@/lib/catalog.functions";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["popular", "price_asc", "price_desc", "name", "newest"]).catch("popular"),
  page: z.number().int().min(1).catch(1),
  inStockOnly: z.boolean().catch(false),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [categories, result] = await Promise.all([
      listCategories(),
      listProducts({
        data: {
          category: deps.category,
          q: deps.q,
          sort: deps.sort,
          page: deps.page,
          perPage: 24,
          inStockOnly: deps.inStockOnly,
        },
      }),
    ]);
    return { categories, result };
  },
  head: ({ match }) => {
    const label = match.search.q
      ? `Search “${match.search.q}”`
      : match.search.category
        ? `${match.search.category.replace(/-/g, " ")}`
        : "All products";
    const title = `${label} — Shop | Bhat & Bhat Farms`;
    const description =
      "Browse farm-fresh A2 milk, ghee, cold-pressed oils, honey, spices and seasonal produce from Bhat & Bhat Farms.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl">We couldn't load these products</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  component: Shop,
});

function Shop() {
  const { categories, result } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const topLevel = categories.filter((c) => !c.parent_id);
  const totalPages = Math.max(1, Math.ceil(result.total / result.perPage));

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, page: 1, ...patch }) });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl">
        {search.q ? `Results for “${search.q}”` : "Shop"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{result.total} products</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <h2 className="font-display text-base">Categories</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  to="/shop"
                  search={(prev) => ({ ...prev, category: undefined, page: 1 })}
                  className={`block rounded-md px-2 py-1.5 hover:bg-muted ${!search.category ? "bg-muted font-medium text-primary" : ""}`}
                >
                  All products
                </Link>
              </li>
              {topLevel.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to="/shop"
                    search={(prev) => ({ ...prev, category: cat.slug, page: 1 })}
                    className={`block rounded-md px-2 py-1.5 hover:bg-muted ${search.category === cat.slug ? "bg-muted font-medium text-primary" : ""}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-base">Filters</h2>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={search.inStockOnly}
                onCheckedChange={(checked) => update({ inStockOnly: checked === true })}
              />
              In stock only
            </label>
            <div>
              <Input
                defaultValue={search.q ?? ""}
                placeholder="Search products"
                aria-label="Search products"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = (e.target as HTMLInputElement).value.trim();
                    update({ q: value || undefined });
                  }
                }}
              />
            </div>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Page {result.page} of {totalPages}
            </span>
            <Select value={search.sort} onValueChange={(value) => update({ sort: value as typeof search.sort })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {result.items.length === 0 ? (
            <p className="mt-16 text-center text-sm text-muted-foreground">
              No products matched. Try a different category or search term.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={result.page <= 1}
                onClick={() => navigate({ search: (prev) => ({ ...prev, page: prev.page - 1 }) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={result.page >= totalPages}
                onClick={() => navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
