"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createUser, updateUserRole } from "@/lib/actions/settings";
import type { CreateUserInput } from "@/lib/schemas/settings";
import { Plus, UserCog, X, Loader2, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string; email: string; role: string; createdAt: Date;
  employee: {
    name: string; ecoCoins: number;
    department: { name: string } | null;
  } | null;
};


interface Props {
  users: UserRow[];
  departments: { id: string; name: string }[];
}

export function UserManagement({ users, departments }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<CreateUserInput>({
    defaultValues: { role: "EMPLOYEE" },
  });

  function openCreate() { reset({ role: "EMPLOYEE" }); setError(null); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); setError(null); }

  function onSubmit(data: CreateUserInput) {
    startTransition(async () => {
      const result = await createUser(data);
      if (result.success) { closeSheet(); router.refresh(); }
      else setError(result.error);
    });
  }

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      await updateUserRole(userId, role as "ADMIN" | "EMPLOYEE" | "DEPT_HEAD");
      router.refresh();
    });
  }

  const ROLE_COLOR: Record<string, string> = {
    ADMIN: "bg-[--esg-gov]/10 text-[--esg-gov]",
    DEPT_HEAD: "bg-[--esg-social]/10 text-[--esg-social]",
    EMPLOYEE: "bg-muted/40 text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} accounts</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all">
          <Plus className="size-4" /> Add User
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Name", "Email", "Role", "Department", "EcoCoins", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="bg-card hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                      {(u.employee?.name ?? u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.employee?.name ?? "—"}</p>
                    </div>

                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded px-2 py-0.5 text-xs font-medium", ROLE_COLOR[u.role] ?? ROLE_COLOR.EMPLOYEE)}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.employee?.department?.name ?? "—"}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{u.employee?.ecoCoins ?? 0}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={isPending}
                    className="rounded-lg border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/80 disabled:opacity-50"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DEPT_HEAD">Dept. Head</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create user sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={closeSheet} />
          <div className="w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2"><UserCog className="size-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Add User</h2></div>
              <button onClick={closeSheet} className="rounded p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
                <input {...register("name", { required: true })} placeholder="Jane Smith" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                <input type="email" {...register("email", { required: true })} placeholder="jane@company.com" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
                <input type="password" {...register("password", { required: true, minLength: 6 })} placeholder="min. 6 characters" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role</label>
                  <select {...register("role")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DEPT_HEAD">Dept. Head</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department</label>
                  <select {...register("departmentId")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80">
                    <option value="">None</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Creating…" : "Create User"}
                </button>
                <button type="button" onClick={closeSheet} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
