import { createFileRoute } from "@tanstack/react-router";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/leave")({
  head: () => ({
    meta: [
      { title: "Leave — Dayflow HR" },
      { name: "description", content: "Review your leave balance and requests inside Dayflow." },
      { property: "og:title", content: "Leave — Dayflow HR" },
      { property: "og:description", content: "Your Dayflow leave overview." },
    ],
  }),
  component: () => (
    <EmployeeShell>
      <PagePlaceholder title="Leave" description="Leave balances and requests will appear here." />
    </EmployeeShell>
  ),
});
