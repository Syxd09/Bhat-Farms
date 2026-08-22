import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { formatDate, rupees } from "@/lib/format";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const data = await getProductBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable | Bhat & Bhat Farms" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = product.seo_title ?? `${product.name} | Bhat & Bhat Farms`;
    const description =
      product.seo_description ??
      product.short_description ??
      `Buy ${product.name} fresh from Bhat & Bhat Farms with delivery across South Bengaluru.`;
    const image = product.images[0]?.url;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been removed or is out of season.
      </p>
      <Button asChild className="mt-6">
        <Link to="/shop">Back to shop</Link>
      </Button>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl">We couldn't load this product</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  component: ProductDetail;
});

function ProductDetail() {
  const { product, reviews, related } = Route.useLoaderData();
  const { add } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const maxQty = variant ? Math.max(0, variant.stock_qty - variant.reserved_qty) : 0;
  const image = product.images[imageIndex] ?? product.images[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-sm text-muted-foreground">
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            {image ? (
              <img src={image.url} alt={image.alt ?? product.name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.url + i}
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`size-20 shrink-0 overflow-hidden rounded-md border ${i === imageIndex ? "border-secondary" : "border-border"}`}
                >
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {product.rating_count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-accent text-accent" />
                {product.rating_avg.toFixed(1)} · {product.rating_count} reviews
              </span>
            )}
            {product.is_subscribable && <Badge variant="secondary">Subscription available</Badge>}
            <Badge variant={variant && maxQty > 0 ? "outline" : "destructive"}>
              {variant && maxQty > 0 ? "In stock" : "Out of stock"}
            </Badge>
          </div>

          {product.short_description && (
            <p className="mt-4 text-muted-foreground">{product.short_description}</p>
          )}

          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl text-primary">
              {rupees(variant?.price_paise ?? product.minPrice)}
            </span>
            {variant?.compare_at_paise && variant.compare_at_paise > variant.price_paise && (
              <span className="text-lg text-muted-foreground line-through">
                {rupees(variant.compare_at_paise)}
              </span>
            )}
          </p>

          {product.variants.length > 1 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium">Choose size</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      v.id === variant?.id
                        ? "border-secondary bg-secondary/10 font-medium text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {v.label} · {rupees(v.price_paise)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              disabled={!variant || maxQty <= 0}
              onClick={() => {
                if (!variant) return;
                add(variant.id, qty);
                toast.success(`${product.name} (${variant.label}) added to cart`);
              }}
            >
              Add to cart
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/cart">Go to cart</Link>
            </Button>
          </div>

          {maxQty > 0 && maxQty <= 5 && (
            <p className="mt-3 text-sm text-destructive">Only {maxQty} left in stock</p>
          )}

          {product.description && (
            <>
              <Separator className="my-8" />
              <h2 className="font-display text-xl">Product details</h2>
              <div
                className="prose prose-sm mt-3 max-w-none text-muted-foreground [&_a]:text-primary [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">Customer reviews</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < r.rating ? "fill-accent text-accent" : "text-muted"}`}
                      />
                    ))}
                  </span>
                  {r.verified_purchase && (
                    <Badge variant="secondary" className="text-[11px]">
                      Verified purchase
                    </Badge>
                  )}
                </div>
                {r.title && <h3 className="mt-2 font-medium">{r.title}</h3>}
                {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
                <p className="mt-3 text-xs text-muted-foreground">
                  {r.author_name ?? "Customer"} · {formatDate(r.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
