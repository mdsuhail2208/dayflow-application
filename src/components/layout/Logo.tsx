import { CalendarClock } from "lucide-react";

export function Logo({ tone = "default" }: { tone?: "default" | "sidebar" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          tone === "sidebar"
            ? "flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            : "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        }
      >
        <CalendarClock className="size-4" />
      </span>
      <span className="text-base font-semibold tracking-tight">Dayflow</span>
    </div>
  );
}
