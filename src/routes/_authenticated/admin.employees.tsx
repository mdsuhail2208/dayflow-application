import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

const description = "Employee directory and records will live here.";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employees — Dayflow HR admin" },
      { name: "description", content: description },
      { property: "og:title", content: "Employees — Dayflow HR admin" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PagePlaceholder title="Employees" description={description} />,
});
