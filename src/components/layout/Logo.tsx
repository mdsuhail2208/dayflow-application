import { CalendarClock } from "lucide-react";

export function Logo({ tone = "default" }: { tone?: "default" | "sidebar" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          tone === "sidebar"
            ? "flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            : "flex size-8 items-center justify-center rounded-lg bg-[#C2410C] text-white"
        }
      >
        <CalendarClock className="size-4" />
      </span>
      <span className="text-base font-semibold tracking-tight text-[#201d1a]">Dayflow</span>
    </div>
  );
}
