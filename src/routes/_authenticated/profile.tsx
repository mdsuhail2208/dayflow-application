import { createFileRoute } from "@tanstack/react-router";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Dayflow HR" },
      { name: "description", content: "View and manage your Dayflow employee profile details." },
      { property: "og:title", content: "Profile — Dayflow HR" },
      { property: "og:description", content: "Your Dayflow employee profile." },
    ],
  }),
  component: () => (
    <EmployeeShell>
      <PagePlaceholder
        title="Profile"
        description="Your personal and employment details will live here."
      />
    </EmployeeShell>
  ),
});
