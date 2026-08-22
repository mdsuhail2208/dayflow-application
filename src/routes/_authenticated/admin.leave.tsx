import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

const description = "Leave approvals and policies will live here.";

export const Route = createFileRoute("/_authenticated/admin/leave")({
  head: () => ({
    meta: [
      { title: "Leave — Dayflow HR admin" },
      { name: "description", content: description },
      { property: "og:title", content: "Leave — Dayflow HR admin" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PagePlaceholder title="Leave" description={description} />,
});
