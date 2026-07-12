"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Leaf,
  Zap,
  Factory,
  Target,
  Users,
  HeartHandshake,
  BarChart3,
  Scale,
  FileCheck,
  ClipboardList,
  AlertTriangle,
  Trophy,
  Star,
  Gift,
  Medal,
  ListOrdered,
  FileBarChart,
  TrendingUp,
  FileText,
  Settings,
  Building2,
  Tag,
  SlidersHorizontal,
  Bell,
  LogOut,
  ChevronDown,
  TreePine,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavLeaf {
  title: string;
  href: string;
  icon: LucideIcon;
  accentColor?: string;
}

interface NavParent {
  title: string;
  icon: LucideIcon;
  accentColor?: string;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavParent;

interface NavGroupDef {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
}

function isNavParent(item: NavItem): item is NavParent {
  return "children" in item;
}

// ─── Nav config ──────────────────────────────────────────────────────────────

const navGroups: NavGroupDef[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, accentColor: "text-primary" },
    ],
  },
  {
    label: "Environmental",
    items: [
      {
        title: "Environmental",
        icon: Leaf,
        accentColor: "text-[--esg-env]",
        children: [
          { title: "Emission Factors", href: "/environmental/emission-factors", icon: Zap },
          { title: "Product ESG Profiles", href: "/environmental/products", icon: Factory },
          { title: "Carbon Transactions", href: "/environmental/carbon", icon: Factory },
          { title: "Environmental Goals", href: "/environmental/goals", icon: Target },
        ],
      },
    ],
  },
  {
    label: "Social",
    items: [
      {
        title: "Social",
        icon: Users,
        accentColor: "text-[--esg-social]",
        children: [
          { title: "CSR Activities", href: "/social/csr", icon: HeartHandshake },
          { title: "Employee Participation", href: "/social/participation", icon: Users },
          { title: "Diversity Dashboard", href: "/social/diversity", icon: BarChart3 },
        ],
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        title: "Governance",
        icon: Scale,
        accentColor: "text-[--esg-gov]",
        children: [
          { title: "Policies", href: "/governance/policies", icon: FileCheck },
          { title: "Acknowledgements", href: "/governance/acknowledgements", icon: ClipboardList },
          { title: "Audits", href: "/governance/audits", icon: Scale },
          { title: "Compliance Issues", href: "/governance/compliance", icon: AlertTriangle },
        ],
      },
    ],
  },
  {
    label: "Gamification",
    items: [
      {
        title: "Gamification",
        icon: Trophy,
        accentColor: "text-[--score-gold]",
        children: [
          { title: "Challenges", href: "/gamification/challenges", icon: Star },
          { title: "Challenge Participation", href: "/gamification/participation", icon: Medal },
          { title: "Virtual Garden", href: "/gamification/garden", icon: TreePine },
          { title: "Badges", href: "/gamification/badges", icon: Medal },
          { title: "Rewards", href: "/gamification/rewards", icon: Gift },
          { title: "Leaderboard", href: "/gamification/leaderboard", icon: ListOrdered },
        ],
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        title: "Reports",
        icon: FileBarChart,
        accentColor: "text-chart-5",
        children: [
          { title: "Environmental Report", href: "/reports/environmental", icon: Leaf },
          { title: "Social Report", href: "/reports/social", icon: Users },
          { title: "Governance Report", href: "/reports/governance", icon: Scale },
          { title: "ESG Summary", href: "/reports/esg-summary", icon: TrendingUp },
          { title: "Custom Builder", href: "/reports/custom", icon: FileText },
        ],
      },
    ],
  },
];

const adminNavGroup: NavGroupDef = {
  label: "Administration",
  adminOnly: true,
  items: [
    {
      title: "Settings",
      icon: Settings,
      accentColor: "text-muted-foreground",
      children: [
        { title: "Departments", href: "/settings/departments", icon: Building2 },
        { title: "Categories", href: "/settings/categories", icon: Tag },
        { title: "Users", href: "/settings/users", icon: UserCog },
        { title: "ESG Configuration", href: "/settings/esg-config", icon: SlidersHorizontal },
        { title: "Notification Settings", href: "/settings/notifications", icon: Bell },
      ],
    },
  ],
};

// ─── NavItem component ────────────────────────────────────────────────────────

function NavItemCollapsible({ item, pathname }: { item: NavItem; pathname: string }) {
  if (!isNavParent(item)) {
    // Leaf nav item
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive}>
          <Link
            href={item.href}
            className={cn(
              "flex w-full items-center gap-2",
              isActive && "border-l-2 border-primary pl-[calc(0.75rem-2px)]"
            )}
          >
            <item.icon className={cn("size-4", item.accentColor)} />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Parent with children
  const isChildActive = item.children.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );

  return (
    <Collapsible defaultOpen={isChildActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger className="w-full">
          <SidebarMenuButton className={cn(isChildActive && "text-foreground font-medium")}>
            <item.icon className={cn("size-4", item.accentColor)} />
            <span>{item.title}</span>
            <ChevronDown className="ml-auto size-3.5 text-muted-foreground transition-transform duration-200 group-data-[open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => {
              const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton isActive={isActive}>
                    <Link href={child.href} className="flex w-full items-center gap-2">
                      <child.icon className="size-3.5" />
                      <span>{child.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

interface AppSidebarProps {
  userRole: string;
  userEmail: string;
}

export function AppSidebar({ userRole, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  const allGroups: NavGroupDef[] = isAdmin ? [...navGroups, adminNavGroup] : navGroups;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header — Logo */}
      <SidebarHeader className="p-4 pb-2">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 shrink-0">
            <Leaf className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-bold text-foreground leading-none"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              EcoSphere
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              ESG Platform
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Nav Content */}
      <SidebarContent className="py-2">
        {allGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1">
              {group.label}
              {group.adminOnly && (
                <Badge
                  variant="outline"
                  className="ml-1.5 px-1 py-0 text-[9px] h-3.5 border-[--esg-gov]/40 text-[--esg-gov]"
                >
                  Admin
                </Badge>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavItemCollapsible
                    key={item.title}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer — User info + sign out */}
      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground leading-none">
                {userEmail}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {userRole === "ADMIN" ? "Administrator" : userRole === "DEPT_HEAD" ? "Dept. Head" : "Employee"}
              </p>
            </div>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
