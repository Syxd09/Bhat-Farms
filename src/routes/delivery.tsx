import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkPincode, listDeliveryZones } from "@/lib/catalog.functions";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/delivery")({
  loader: () => listDeliveryZones(),
  head: () => ({
    meta: [
      { title: "Delivery areas, slots & fees | Bhat & Bhat Farms" },
      {
        name: "description",
        content:
          "Check if we deliver to your Bengaluru PIN code. See delivery fees, free-delivery thresholds, minimum order values and time slots.",
      },
      { property: "og:title", content: "Delivery areas & slots — Bhat & Bhat Farms" },
      {
        property: "og:description",
        content: "PIN-code based delivery across South Bengaluru with morning and evening slots.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl">We couldn't load delivery areas</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  component: Delivery;
});

function Delivery() {
  const zones = Route.useLoaderData();
  const [pincode, setPincode] = useState("");
  const check = useMutation({
    mutationFn: (value: string) => checkPincode({ data: { pincode: value } }),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl">Delivery areas &amp; slots</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        We deliver fresh milk and farm produce across South Bengaluru. Enter your PIN code to see
        whether we reach you, along with fees and available slots.
      </p>

      <form
        className="mt-8 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (/^\d{6}$/.test(pincode)) check.mutate(pincode);
        }}
      >
        <Input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit PIN code"
          aria-label="PIN code"
          inputMode="numeric"
        />
        <Button type="submit" disabled={pincode.length !== 6 || check.isPending}>
          {check.isPending ? "Checking…" : "Check"}
        </Button>
      </form>

      {check.isError && (
        <p className="mt-4 text-sm text-destructive">Couldn't check right now. Please try again.</p>
      )}

      {check.data && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          {check.data.serviceable && check.data.zone ? (
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  We deliver to {check.data.zone.area} ({check.data.zone.pincode})
                </p>
                <p className="mt-1 text-muted-foreground">
                  Delivery fee {rupees(check.data.zone.fee_paise)} · Free above{" "}
                  {rupees(check.data.zone.free_above_paise)} · Minimum order{" "}
                  {rupees(check.data.zone.min_order_paise)} ·{" "}
                  {check.data.zone.cod_available ? "Cash on delivery available" : "Prepaid only"}
                </p>
                {Array.isArray(check.data.zone.slots) && check.data.zone.slots.length > 0 && (
                  <p className="mt-1 text-muted-foreground">
                    Slots: {(check.data.zone.slots as string[]).join(", ")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <p className="text-sm text-muted-foreground">
                We don't deliver to {pincode} yet. Reach us at{" "}
                <a href="tel:+919845998459" className="text-primary underline">
                  +91 98459 98459
                </a>{" "}
                and we'll try to help.
              </p>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-14 font-display text-2xl">All serviceable areas</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>PIN code</TableHead>
              <TableHead>Delivery fee</TableHead>
              <TableHead>Free above</TableHead>
              <TableHead>Min. order</TableHead>
              <TableHead>COD</TableHead>
              <TableHead>Slots</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((z) => (
              <TableRow key={z.pincode}>
                <TableCell className="font-medium">{z.area}</TableCell>
                <TableCell>{z.pincode}</TableCell>
                <TableCell>{rupees(z.fee_paise)}</TableCell>
                <TableCell>{rupees(z.free_above_paise)}</TableCell>
                <TableCell>{rupees(z.min_order_paise)}</TableCell>
                <TableCell>{z.cod_available ? "Yes" : "No"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {Array.isArray(z.slots) ? (z.slots as string[]).join(", ") : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
