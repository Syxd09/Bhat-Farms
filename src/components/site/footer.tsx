import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-display text-xl">Bhat &amp; Bhat Farms</h2>
          <p className="mt-3 text-sm text-sidebar-foreground/80">
            Farm-fresh A2 milk, wood-pressed oils, pure ghee and seasonal produce, delivered across
            South Bengaluru.
          </p>
        </div>
        <div>
          <h3 className="font-display text-base">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-sidebar-foreground/80">
            <li>
              <Link to="/shop" search={{ category: "milk" }} className="hover:text-sidebar-primary">
                Milk &amp; Dairy
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "ghee" }} className="hover:text-sidebar-primary">
                Ghee
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "oils" }} className="hover:text-sidebar-primary">
                Cold-pressed Oils
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "honey" }} className="hover:text-sidebar-primary">
                Honey
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-base">Help</h3>
          <ul className="mt-3 space-y-2 text-sm text-sidebar-foreground/80">
            <li>
              <Link to="/delivery" className="hover:text-sidebar-primary">
                Delivery areas &amp; slots
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-sidebar-primary">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-base">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-sidebar-foreground/80">
            <li>Konanakunte, Bengaluru 560062</li>
            <li>
              <a href="tel:+919845998459" className="hover:text-sidebar-primary">
                +91 98459 98459
              </a>
            </li>
            <li>
              <a href="mailto:hello@bhatnbhatfarm.com" className="hover:text-sidebar-primary">
                hello@bhatnbhatfarm.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border px-4 py-6 text-center text-xs text-sidebar-foreground/70">
        © {new Date().getFullYear()} Bhat &amp; Bhat Farms. All rights reserved.
      </div>
    </footer>
  );
}
