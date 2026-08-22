import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employees — Dayflow HR admin" },
      { name: "description", content: Employee directory and records will live here. },
      { property: "og:title", content: "Employees — Dayflow HR admin" },
      { property: "og:description", content: Employee directory and records will live here. },
    ],
  }),
  component: () => <PagePlaceholder title="Employees" description={Employee directory and records will live here.} />,
});
