import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/admin/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll — Dayflow HR admin" },
      { name: "description", content: Payroll runs and payslips will live here. },
      { property: "og:title", content: "Payroll — Dayflow HR admin" },
      { property: "og:description", content: Payroll runs and payslips will live here. },
    ],
  }),
  component: () => <PagePlaceholder title="Payroll" description={Payroll runs and payslips will live here.} />,
});
