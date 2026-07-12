// Product ESG Profiles Page — /environmental/products
// Server Component

import { getProductESGProfiles } from "@/lib/actions/environmental/products";
import { requireAuth } from "@/lib/auth-utils";
import { ProductsPageClient } from "@/components/environmental/ProductsPageClient";
import { Factory } from "lucide-react";

export const metadata = {
  title: "Product ESG Profiles — EcoSphere",
  description: "Carbon footprint and recyclability data for products.",
};

export default async function ProductsPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const profiles = await getProductESGProfiles();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/25">
          <Factory className="size-5 text-[--esg-env]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Product ESG Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Carbon footprint and recyclability data linked to your products.
          </p>
        </div>
      </div>

      <ProductsPageClient profiles={profiles} isAdmin={isAdmin} />
    </div>
  );
}
