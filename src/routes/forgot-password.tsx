import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Dayflow HR" },
      {
        name: "description",
        content: "Request a password reset link for your Dayflow HR account.",
      },
      { property: "og:title", content: "Reset your password — Dayflow HR" },
      { property: "og:description", content: "Request a Dayflow password reset link." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card className="shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Forgot password</CardTitle>
            <CardDescription>We'll email you a link to set a new password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <p role="status" className="text-sm text-muted-foreground">
                If an account exists for {email}, a reset link is on its way.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error ? (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            )}
            <Link
              to="/auth"
              className="block text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
