import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dayflow — HR management for growing teams" },
      {
        name: "description",
        content:
          "Dayflow is a clean HR management system for people records, attendance, leave and payroll — all in one calm workspace.",
      },
      { property: "og:title", content: "Dayflow — HR management for growing teams" },
      {
        property: "og:description",
        content: "People records, attendance, leave and payroll in one calm workspace.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { title: "People records", description: "One source of truth for every employee profile." },
  { title: "Attendance", description: "Daily check-ins, ready for the next build step." },
  { title: "Leave", description: "Requests and approvals, coming next." },
  { title: "Payroll", description: "Admin-only payroll surface, scaffolded." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Logo />
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:pt-16">
        <section className="max-w-2xl space-y-5">
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            HR management system
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything your team needs, in one steady flow.
          </h1>
          <p className="text-base text-muted-foreground">
            Dayflow keeps employee records, attendance, leave and payroll in one place — with
            separate experiences for employees and admins.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
