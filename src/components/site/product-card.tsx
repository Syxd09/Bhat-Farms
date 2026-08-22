import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/format";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { add } = useCart();
  const variant = product.variants[0];
  const image = product.images[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {!product.available && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground/85 px-2 py-1 text-[11px] font-semibold text-background">
            Out of stock
          </span>
        )}
        {product.is_subscribable && product.available && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground">
            Subscription
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
          <h3 className="line-clamp-2 font-display text-base leading-snug">{product.name}</h3>
        </Link>
        {product.rating_count > 0 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-accent text-accent" />
            {product.rating_avg.toFixed(1)} ({product.rating_count})
          </p>
        )}
        <p className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">{rupees(product.minPrice)}</span>
          {variant?.compare_at_paise && variant.compare_at_paise > variant.price_paise && (
            <span className="text-sm text-muted-foreground line-through">
              {rupees(variant.compare_at_paise)}
            </span>
          )}
          {variant?.label && (
            <span className="text-xs text-muted-foreground">/ {variant.label}</span>
          )}
        </p>
        <Button
          size="sm"
          disabled={!product.available || !variant}
          onClick={() => {
            if (!variant) return;
            add(variant.id);
            toast.success(`${product.name} added to cart`);
          }}
        >
          {product.available ? "Add to cart" : "Unavailable"}
        </Button>
      </div>
    </article>
  );
}
