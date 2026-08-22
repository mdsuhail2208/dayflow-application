import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/attendance", label: "Attendance" },
  { to: "/admin/leave", label: "Leave" },
  { to: "/admin/payroll", label: "Payroll" },
] as const;

function NavLinks() {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeOptions={{ exact: link.to === "/admin" }}
          className="rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col gap-8 bg-sidebar p-5 text-sidebar-foreground md:flex">
        <Logo tone="sidebar" />
        <NavLinks />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-5 text-sidebar-foreground">
              <SheetTitle className="mb-6 text-left text-sidebar-foreground">
                <Logo tone="sidebar" />
              </SheetTitle>
              <NavLinks />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-muted-foreground md:hidden">Dayflow admin</span>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
