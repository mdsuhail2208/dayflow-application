import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

const description = "Company-wide attendance will live here.";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Dayflow HR admin" },
      { name: "description", content: description },
      { property: "og:title", content: "Attendance — Dayflow HR admin" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PagePlaceholder title="Attendance" description={description} />,
});
