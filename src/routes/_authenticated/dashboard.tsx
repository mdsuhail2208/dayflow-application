import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";


import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Dayflow HR" },
      { name: "description", content: "Your Dayflow HR home: people, attendance and leave at a glance." },
      { property: "og:title", content: "Dashboard — Dayflow HR" },
      { property: "og:description", content: "Your Dayflow HR workspace home." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { fullName, role, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role === "admin") {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, role, navigate]);



  return (
    <EmployeeShell>
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your workspace is ready for features.</p>
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
                  Role: <Badge variant="secondary">{role ?? "employee"}</Badge>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </EmployeeShell>
  );
}
