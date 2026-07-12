"use client";

// Product ESG Profile Card + Grid — with admin Edit/Delete

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Leaf, Factory, Recycle } from "lucide-react";
import { ProductESGDialog } from "@/components/environmental/ProductESGDialog";
import { deleteProductESGProfile } from "@/lib/actions/environmental/products";
import type { ProductESGProfile } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

// ─── Individual card ──────────────────────────────────────────────────────────

interface CardProps {
  profile: ProductESGProfile;
  isAdmin: boolean;
  onEdit: (p: ProductESGProfile) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function ProductCard({ profile, isAdmin, onEdit, onDelete, deleting }: CardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[--esg-env]/30",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--esg-env]/60 to-transparent" />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Factory className="size-4 text-[--esg-env] shrink-0" />
            <CardTitle
              className="text-sm font-semibold leading-snug truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {profile.productName}
            </CardTitle>
          </div>
          {profile.recyclable && (
            <Badge className="shrink-0 bg-[--esg-env]/15 text-[--esg-env] border-[--esg-env]/25 text-[10px] px-1.5 py-0.5 gap-1">
              <Recycle className="size-2.5" />
              Recyclable
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span
            className="font-mono text-xl font-medium text-foreground"
          >
            {profile.co2PerUnit.toFixed(3)}
          </span>
          <span className="text-xs text-muted-foreground">kg CO₂ / unit</span>
        </div>

        {profile.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {profile.notes}
          </p>
        )}

        {isAdmin && (
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onEdit(profile)}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(profile.id)}
              disabled={deleting}
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

interface GridProps {
  profiles: ProductESGProfile[];
  isAdmin: boolean;
  searchQuery: string;
}

export function ProductESGGrid({ profiles, isAdmin, searchQuery }: GridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<ProductESGProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = profiles.filter((p) =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (p: ProductESGProfile) => {
    setEditProfile(p);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditProfile(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product ESG profile?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteProductESGProfile(id);
      setDeletingId(null);
    });
  };

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 gap-3 text-center">
        <Factory className="size-12 text-muted-foreground/40" />
        <div>
          <p className="font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {searchQuery ? "No products match your search" : "No product profiles yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try a different search term."
              : "Add product ESG profiles to track their sustainability impact."}
          </p>
        </div>
        {isAdmin && !searchQuery && (
          <Button onClick={handleNew} className="mt-2">
            Add product profile
          </Button>
        )}
        <ProductESGDialog open={dialogOpen} onOpenChange={setDialogOpen} editProfile={editProfile} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filtered.length} profile{filtered.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <Button size="sm" onClick={handleNew}>
            + New profile
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((profile) => (
          <ProductCard
            key={profile.id}
            profile={profile}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleting={deletingId === profile.id || isPending}
          />
        ))}
      </div>

      <ProductESGDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editProfile={editProfile}
      />
    </div>
  );
}
