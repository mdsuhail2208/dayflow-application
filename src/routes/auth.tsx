import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Dayflow HR" },
      {
        name: "description",
        content: "Sign in or create your Dayflow account to manage people, attendance and leave.",
      },
      { property: "og:title", content: "Sign in — Dayflow HR" },
      { property: "og:description", content: "Access your Dayflow HR workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpNotice, setSignUpNotice] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignInError("");
    setSigningIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInEmail.trim(),
      password: signInPassword,
    });
    setSigningIn(false);
    if (error) {
      setSignInError(
        error.message === "Invalid login credentials"
          ? "That email and password combination doesn't match an account."
          : error.message,
      );
      return;
    }
    if (data.session) {
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      navigate({ to: adminRole ? "/admin" : "/dashboard" });
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignUpError("");
    setSignUpNotice("");

    if (password.length < 8) {
      setSignUpError("Password must be at least 8 characters.");
      return;
    }
    if (!/\d/.test(password)) {
      setSignUpError("Password must contain at least 1 number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setSignUpError("Password must contain at least 1 special character.");
      return;
    }

    setSigningUp(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name.trim() },
      },
    });
    setSigningUp(false);
    if (error) {
      setSignUpError(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard" });
      return;
    }
    setSignUpNotice("Check your inbox to confirm your email, then sign in.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F3] px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">HR management, without the busywork.</p>
        </div>

        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Welcome to Dayflow</CardTitle>
            <CardDescription>Sign in or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 rounded-md bg-[#f1ede7]">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                    />
                  </div>
                  {signInError ? (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {signInError}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    className="w-full rounded-md bg-[#C2410C] text-white hover:bg-[#a83a0a]"
                    disabled={signingIn}
                  >
                    {signingIn ? "Signing in…" : "Sign in"}
                  </Button>
                  <Link
                    to="/forgot-password"
                    className="block text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full name</Label>
                    <Input
                      id="signup-name"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 1
                                ? "w-1/3 bg-red-500"
                                : passwordStrength === 2
                                  ? "w-2/3 bg-yellow-500"
                                  : passwordStrength === 3
                                    ? "w-full bg-green-500"
                                    : "w-0"
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {passwordStrength === 0 &&
                            "Weak: Needs min 8 chars, 1 number, 1 special char"}
                          {passwordStrength === 1 && "Weak: Add numbers and special characters"}
                          {passwordStrength === 2 && "Medium: Add special characters or numbers"}
                          {passwordStrength === 3 && "Strong password"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    New accounts default to employee access. Admins can manage roles after sign up.
                  </div>
                  {signUpError ? (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {signUpError}
                    </p>
                  ) : null}
                  {signUpNotice ? (
                    <p role="status" className="text-sm font-medium text-accent-foreground">
                      {signUpNotice}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    className="w-full rounded-md bg-[#C2410C] text-white hover:bg-[#a83a0a]"
                    disabled={signingUp}
                  >
                    {signingUp ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
