import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

const description = "Payroll runs and payslips will live here.";

export const Route = createFileRoute("/_authenticated/admin/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll — Dayflow HR admin" },
      { name: "description", content: description },
      { property: "og:title", content: "Payroll — Dayflow HR admin" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PagePlaceholder title="Payroll" description={description} />,
});
