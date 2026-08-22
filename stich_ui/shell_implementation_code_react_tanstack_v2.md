import React from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import {
Home,
Users,
CalendarDays,
MoreHorizontal,
UserCircle,
Menu,
LayoutDashboard,
Wallet,
Settings,
X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
Sheet,
SheetContent,
SheetTrigger,
SheetHeader,
SheetTitle
} from "@/components/ui/sheet";

// --- Shared Components ---

export const Logo = () => (
  <div className="flex items-center gap-2 select-none">
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
      <span className="text-white font-black text-xl">D</span>
    </div>
    <span className="font-black text-2xl tracking-tight text-primary">Dayflow</span>
  </div>
);

interface NavItemProps {
to: string;
icon: React.ElementType;
label: string;
mobile?: boolean;
active?: boolean;
}

const NavItem = ({ to, icon: Icon, label, mobile = false }: NavItemProps) => (
  <Link
    to={to}
    activeProps={{ className: "text-primary font-bold" }}
    inactiveProps={{ className: "text-slate-500 hover:text-slate-900" }}
    className={cn(
      "flex items-center gap-2 transition-all duration-200",
      mobile ? "flex-col gap-1 text-[10px] uppercase tracking-wider font-semibold py-1" : "text-sm font-medium px-3 py-2 rounded-md hover:bg-primary/5"
    )}
  >
    <Icon size={mobile ? 24 : 18} />
    <span>{label}</span>
  </Link>
);

// --- Layout Shells ---

/**

- EmployeeShell.tsx
- Replaces: src/components/layout/EmployeeShell.tsx
- Uses top navigation on desktop and bottom navigation on mobile.
  */
  export const EmployeeShell = ({ children }: { children?: React.ReactNode }) => {
  return (
   <div className="min-h-screen flex flex-col bg-surface">
     {/* Desktop Header */}
     <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-white/80 backdrop-blur-md">
       <div className="container mx-auto px-4 h-16 flex items-center justify-between">
         <Logo />

         {/* Desktop Nav */}
         <nav className="hidden md:flex items-center gap-2">
           <NavItem to="/" icon={Home} label="Home" />
           <NavItem to="/staff" icon={Users} label="Staff" />
           <NavItem to="/leave" icon={CalendarDays} label="Leave" />
         </nav>

         <div className="flex items-center gap-3">
           <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-xs font-bold text-slate-900 leading-none">Employee Portal</span>
             <span className="text-[10px] text-slate-500 uppercase tracking-tighter">View Only</span>
           </div>
           <button className="p-1 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary">
             <UserCircle size={28} className="text-slate-600" />
           </button>
         </div>
       </div>

     </header>

  {/* Main Content */}
     <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
       {children || <Outlet />}
     </main>

  {/* Mobile Bottom Nav */}
     <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-outline-variant flex justify-around items-center px-6 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
       <NavItem to="/" icon={Home} label="Home" mobile />
       <NavItem to="/staff" icon={Users} label="Staff" mobile />
       <NavItem to="/leave" icon={CalendarDays} label="Leave" mobile />
       <NavItem to="/more" icon={MoreHorizontal} label="More" mobile />
     </nav>
   </div>

);
};

/**

- AdminShell.tsx
- Replaces: src/components/layout/AdminShell.tsx
- Uses persistent sidebar on desktop and Sheet (drawer) navigation on mobile.
  */
  export const AdminShell = ({ children }: { children?: React.ReactNode }) => {
  const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/directory', icon: Users, label: 'Directory' },
  { to: '/admin/payroll', icon: Wallet, label: 'Payroll' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

return (
<div className="min-h-screen flex bg-surface">
{/* Desktop Sidebar */}
<aside className="hidden lg:flex flex-col w-72 bg-white border-r border-outline-variant sticky top-0 h-screen">
<div className="p-8">
<Logo />
</div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "bg-primary text-white font-bold shadow-md" }}
              inactiveProps={{ className: "text-slate-500 hover:bg-primary/5 hover:text-primary" }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all group focus-visible:ring-2 focus-visible:ring-primary"
            >
              <link.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">HR Admin</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Admin Header */}
        <header className="lg:hidden h-16 border-b border-outline-variant bg-white flex items-center justify-between px-4 sticky top-0 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus-visible:ring-2 focus-visible:ring-primary">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-outline-variant">
              <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                <Logo />
              </div>
              <nav className="px-4 py-6 space-y-2">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    activeProps={{ className: "bg-primary/5 text-primary font-bold border-l-4 border-primary" }}
                    className="flex items-center gap-4 px-4 py-4 rounded-md text-slate-600 hover:bg-slate-50"
                  >
                    <link.icon size={20} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Logo />

          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <UserCircle size={24} className="text-slate-400" />
          </div>
        </header>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>

);
};
