import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Users,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/leave", label: "Leave", icon: CalendarDays },
  { to: "/admin/payroll", label: "Payroll", icon: WalletCards },
] as const;

function NavLinks() {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeOptions={{ exact: link.to === "/admin" }}
          className="relative flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-3 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          activeProps={{
            className:
              "relative flex items-center gap-3 rounded-lg border-l-2 border-sidebar-primary bg-sidebar-accent px-3 py-3 text-sm font-semibold text-white",
          }}
        >
          <link.icon className="size-5 [.active_&]:text-sidebar-primary" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-8 bg-sidebar p-5 text-sidebar-foreground shadow-sm md:flex">
        <div className="px-2">
          <Logo tone="sidebar" />
        </div>
        <div className="px-1">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
            Workspace
          </p>
          <NavLinks />
        </div>
        <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/70">
          Admin workspace
          <br />
          <span className="text-sidebar-foreground/50">Manage your people operations</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-5 text-sidebar-foreground">
              <SheetTitle className="mb-6 text-left text-sidebar-foreground">
                <Logo tone="sidebar" />
              </SheetTitle>
              <NavLinks />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-muted-foreground md:hidden">Dayflow admin</span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
