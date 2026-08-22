import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Milk, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { getHomeData } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bhat & Bhat Farms — A2 Milk, Ghee & Cold-pressed Oils" },
      {
        name: "description",
        content:
          "Order farm-fresh A2 milk, pure ghee, wood-pressed oils, raw honey and seasonal produce online. Daily delivery across South Bengaluru.",
      },
      { property: "og:title", content: "Bhat & Bhat Farms — Farm to doorstep in Bengaluru" },
      {
        property: "og:description",
        content: "A2 milk, ghee, cold-pressed oils, honey and farm-fresh produce, delivered daily.",
      },
    ],
  }),
  loader: () => getHomeData(),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl">We couldn't load the shop</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  component: Home,
});

const PROMISES = [
  { icon: Milk, title: "A2 desi cow milk", body: "Single-origin, unhomogenised, delivered fresh each morning." },
  { icon: Leaf, title: "Wood-pressed & natural", body: "Cold-pressed oils and raw honey with nothing added." },
  { icon: Truck, title: "Daily South Bengaluru delivery", body: "Slot-based delivery to serviceable PIN codes." },
  { icon: ShieldCheck, title: "Traceable sourcing", body: "From our own farm and trusted partner farmers." },
];

function Section({
  title,
  description,
  category,
  children,
}: {
  title: string;
  description?: string;
  category?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {category && (
          <Button asChild variant="outline" size="sm">
            <Link to="/shop" search={{ category }}>
              View all
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function Home() {
  const data = Route.useLoaderData();

  return (
    <>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Konanakunte, Bengaluru
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Real farm food, delivered to your door every morning
            </h1>
            <p className="mt-4 max-w-xl text-primary-foreground/85">
              {data.productCount}+ products from Bhat &amp; Bhat Farms — A2 desi cow milk, pure
              ghee, wood-pressed oils, raw honey, and seasonal fruits and vegetables.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/shop">Shop all products</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/delivery">Check delivery PIN code</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data.categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to="/shop"
                search={{ category: cat.slug }}
                className="group relative overflow-hidden rounded-xl bg-primary-foreground/10"
              >
                <div className="aspect-4/3 overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-secondary/40" />
                  )}
                </div>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 font-display text-base text-white">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-6 shrink-0 text-secondary" />
              <div>
                <h3 className="font-display text-base">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {data.dairy.length > 0 && (
        <Section title="Fresh milk & dairy" description="Delivered every morning" category="milk">
          {data.dairy.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Section>
      )}

      {data.ghee.length > 0 && (
        <Section title="Pure ghee" description="Bilona-churned, small batches" category="ghee">
          {data.ghee.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Section>
      )}

      {data.oils.length > 0 && (
        <Section title="Cold-pressed oils" description="Wood-pressed, unrefined" category="oils">
          {data.oils.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Section>
      )}

      {data.honey.length > 0 && (
        <Section title="Raw honey" category="honey">
          {data.honey.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Section>
      )}

      {data.farmFresh.length > 0 && (
        <Section
          title="Farm fresh produce"
          description="Seasonal fruits and vegetables"
          category="farm-fresh"
        >
          {data.farmFresh.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Section>
      )}

      {data.zones.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl">We deliver in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.zones.length} serviceable areas across South Bengaluru.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {data.zones.map((z) => (
                <li
                  key={z.pincode}
                  className="rounded-full border border-border px-3 py-1 text-sm text-foreground/80"
                >
                  {z.area} · {z.pincode}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6">
              <Link to="/delivery">Check your PIN code</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
