import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Dayflow HR admin" },
      { name: "description", content: Company-wide attendance will live here. },
      { property: "og:title", content: "Attendance — Dayflow HR admin" },
      { property: "og:description", content: Company-wide attendance will live here. },
    ],
  }),
  component: () => <PagePlaceholder title="Attendance" description={Company-wide attendance will live here.} />,
});
