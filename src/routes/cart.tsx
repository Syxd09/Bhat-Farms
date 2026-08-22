import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listVariantsByIds } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart | Bhat & Bhat Farms" },
      {
        name: "description",
        content: "Review the farm-fresh products in your cart before checkout.",
      },
      { property: "og:title", content: "Your cart — Bhat & Bhat Farms" },
      { property: "og:description", content: "Review your farm-fresh order before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, hydrated } = useCart();
  const ids = lines.map((l) => l.variantId);

  const { data, isLoading } = useQuery({
    queryKey: ["cart-variants", ids.slice().sort().join(",")],
    queryFn: () => listVariantsByIds({ data: { ids } }),
    enabled: hydrated && ids.length > 0,
  });

  const rows = (data ?? []).map((v) => ({
    ...v,
    qty: lines.find((l) => l.variantId === v.id)?.qty ?? 0,
  }));
  const subtotal = rows.reduce((sum, r) => sum + r.price_paise * r.qty, 0);

  if (!hydrated || (ids.length > 0 && isLoading)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add fresh milk, ghee, oils or produce to get started.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Link
                to="/product/$slug"
                params={{ slug: row.productSlug }}
                className="size-24 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                {row.image ? (
                  <img src={row.image} alt={row.productName} className="size-full object-cover" />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: row.productSlug }}
                  className="font-display text-base hover:text-primary"
                >
                  {row.productName}
                </Link>
                <p className="text-sm text-muted-foreground">{row.label}</p>
                {!row.available && (
                  <p className="mt-1 text-sm text-destructive">Currently out of stock</p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(row.id, row.qty - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-9 text-center text-sm font-medium">{row.qty}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Increase quantity"
                      disabled={row.qty >= row.maxQty}
                      onClick={() => setQty(row.id, row.qty + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(row.id)}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="mr-1 size-4" /> Remove
                  </Button>
                </div>
              </div>
              <p className="font-semibold text-primary">{rupees(row.price_paise * row.qty)}</p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{rupees(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link to="/shop">Continue shopping</Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Checkout with UPI, card, net banking or cash on delivery is being wired up next.
          </p>
        </aside>
      </div>
    </div>
  );
}
