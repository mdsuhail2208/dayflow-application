import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Dayflow HR" },
      { name: "description", content: "Dayflow admin home for people, attendance, leave and payroll." },
      { property: "og:title", content: "Admin dashboard — Dayflow HR" },
      { property: "og:description", content: "Dayflow HR admin workspace." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { fullName, role, user, loading } = useAuth();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">The base is ready for HR features.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">You're signed in</CardTitle>
          <CardDescription>Session details confirmed by Dayflow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {loading ? (
            <p className="text-muted-foreground">Loading your details…</p>
          ) : (
            <>
              <p>
                Logged in as <span className="font-medium">{fullName || user?.email}</span>
              </p>
              <p className="flex items-center gap-2">
                Role: <Badge variant="secondary">{role ?? "admin"}</Badge>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
