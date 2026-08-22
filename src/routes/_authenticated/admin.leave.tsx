import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/admin/leave")({
  head: () => ({
    meta: [
      { title: "Leave — Dayflow HR admin" },
      { name: "description", content: Leave approvals and policies will live here. },
      { property: "og:title", content: "Leave — Dayflow HR admin" },
      { property: "og:description", content: Leave approvals and policies will live here. },
    ],
  }),
  component: () => <PagePlaceholder title="Leave" description={Leave approvals and policies will live here.} />,
});
