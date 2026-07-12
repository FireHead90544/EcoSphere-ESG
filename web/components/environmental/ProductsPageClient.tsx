"use client";

// Products Page wrapper — handles client-side search state
// The actual page.tsx is a Server Component; this wrapper holds the search input.

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProductESGGrid } from "@/components/environmental/ProductESGCard";
import type { ProductESGProfile } from "@/lib/generated/prisma/client";

interface Props {
  profiles: ProductESGProfile[];
  isAdmin: boolean;
}

export function ProductsPageClient({ profiles, isAdmin }: Props) {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ProductESGGrid profiles={profiles} isAdmin={isAdmin} searchQuery={search} />
    </div>
  );
}
