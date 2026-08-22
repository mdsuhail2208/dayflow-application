import { Link } from "@tanstack/react-router";
import { CalendarDays, ClipboardCheck, Home, Menu, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/attendance", label: "Schedule", icon: ClipboardCheck },
  { to: "/leave", label: "Inbox", icon: CalendarDays },
  { to: "/profile", label: "More", icon: UserRound },
] as const;

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      className={mobile ? "flex items-center justify-around" : "flex items-center gap-1"}
      aria-label="Employee navigation"
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={
              mobile
                ? "flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            }
            activeProps={{
              className: mobile
                ? "flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary"
                : "flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground",
            }}
          >
            <Icon className={mobile ? "size-5" : "size-4"} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function EmployeeShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <header className="sticky top-0 z-30 border-b border-[#ded9d0] bg-[#FAF8F3]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
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
            <SheetContent side="left" className="w-64 p-6">
              <SheetTitle className="mb-6 text-left">
                <Logo />
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    activeProps={{ className: "bg-accent text-accent-foreground" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <div className="ml-4 hidden md:block">
            <NavLinks />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 pb-24 sm:px-6 md:pb-8">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ded9d0] bg-[#FAF8F3] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        <NavLinks mobile />
      </div>
    </div>
  );
}
