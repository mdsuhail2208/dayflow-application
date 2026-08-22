import { createFileRoute } from "@tanstack/react-router";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Dayflow HR" },
      { name: "description", content: "Track your check-ins and attendance history in Dayflow." },
      { property: "og:title", content: "Attendance — Dayflow HR" },
      { property: "og:description", content: "Your Dayflow attendance record." },
    ],
  }),
  component: () => (
    <EmployeeShell>
      <PagePlaceholder title="Attendance" description="Check-ins and attendance history land here." />
    </EmployeeShell>
  ),
});
