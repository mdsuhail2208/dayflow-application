import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BriefcaseMedical,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileText,
  LogIn,
  LogOut,
  UserRound,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Dayflow HR" },
      {
        name: "description",
        content: "Your Dayflow HR home: people, attendance and leave at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

type Employee = Tables<"employees">;
type EmployeeWithDepartment = Employee & { departments: { name: string } | null };
type Attendance = Tables<"attendance">;
type LeaveBalance = Tables<"leave_balances"> & { leave_types: { name: string } | null };
type OnboardingTask = Tables<"onboarding_tasks">;

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function formatTime(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

function Dashboard() {
  const { fullName, role, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeWithDepartment | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && role === "admin") navigate({ to: "/admin", replace: true });
  }, [authLoading, navigate, role]);

  useEffect(() => {
    if (!user || role === "admin") return;
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*, departments(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (employeeError) {
        if (active) {
          setError(employeeError.message);
          setLoading(false);
        }
        return;
      }
      if (!employeeData) {
        if (active) {
          setEmployee(null);
          setLoading(false);
        }
        return;
      }

      const [
        { data: todayData, error: todayError },
        { data: recentData, error: recentError },
        { data: balanceData, error: balanceError },
        { data: taskData },
      ] = await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", employeeData.id)
          .eq("attendance_date", today())
          .maybeSingle(),
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", employeeData.id)
          .order("attendance_date", { ascending: false })
          .limit(5),
        supabase
          .from("leave_balances")
          .select("*, leave_types(name)")
          .eq("employee_id", employeeData.id),
        supabase
          .from("onboarding_tasks")
          .select("*")
          .eq("employee_id", employeeData.id)
          .order("created_at", { ascending: true }),
      ]);

      if (active) {
        setEmployee(employeeData);
        setAttendance(todayData);
        setRecentAttendance(recentData ?? []);
        setBalances((balanceData as LeaveBalance[] | null) ?? []);
        setOnboardingTasks(taskData ?? []);
        setError(todayError?.message ?? recentError?.message ?? balanceError?.message ?? "");
        setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [role, user]);

  const handleAttendance = async () => {
    if (!employee) return;
    setActionLoading(true);
    setError("");
    const now = new Date().toISOString();
    const result = attendance?.check_in
      ? await supabase
          .from("attendance")
          .update({ check_out: now })
          .eq("id", attendance.id)
          .select()
          .single()
      : await supabase
          .from("attendance")
          .upsert(
            { employee_id: employee.id, attendance_date: today(), check_in: now },
            { onConflict: "employee_id,attendance_date" },
          )
          .select()
          .single();

    setActionLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setAttendance(result.data);
    setRecentAttendance((current) =>
      [result.data, ...current.filter((item) => item.id !== result.data.id)].slice(0, 5),
    );
  };

  const remainingLeave = balances.reduce(
    (total, balance) => total + Number(balance.total_days - balance.used_days),
    0,
  );
  const displayName = fullName || employee?.name || user?.email?.split("@")[0] || "there";

  const completedTasks = onboardingTasks.filter((t) => t.is_complete).length;
  const onboardingPct =
    onboardingTasks.length > 0 ? Math.round((completedTasks / onboardingTasks.length) * 100) : 100;

  return (
    <EmployeeShell>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6b625a]">
              {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())}
            </p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-[#201d1a]">
              Morning, {displayName}.
            </h1>
            <p className="mt-2 text-sm text-[#6b625a]">
              {employee?.designation || "Team member"}
              {employee?.departments?.name ? ` • ${employee.departments.name}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#b9b0a6] bg-transparent text-[#201d1a] hover:bg-white"
            >
              <Link to="/payroll">
                <Wallet className="mr-2 size-4" />
                Payslips
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#b9b0a6] bg-transparent text-[#201d1a] hover:bg-white"
            >
              <Link to="/profile">
                <UserRound className="mr-2 size-4" />
                View profile
              </Link>
            </Button>
          </div>
        </header>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        {loading || authLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="h-36 animate-pulse p-6" />
            </Card>
            <Card>
              <CardContent className="h-36 animate-pulse p-6" />
            </Card>
            <Card>
              <CardContent className="h-36 animate-pulse p-6" />
            </Card>
          </div>
        ) : !employee ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile setup in progress</CardTitle>
              <CardDescription>
                Your account is active, but an employee profile has not been assigned yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask your HR administrator to finish setting up your employee record.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Onboarding Banner for New Employees */}
            {onboardingPct < 100 && (
              <Card className="border-emerald-300 bg-emerald-50/70 shadow-none">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                      <CheckCircle2 className="size-5 text-emerald-700" /> Employee Onboarding
                      Progress ({onboardingPct}%)
                    </div>
                    <p className="text-xs text-emerald-800">
                      Complete your assigned setup items in Profile to finish onboarding.
                    </p>
                    <Progress value={onboardingPct} className="mt-2 h-1.5 w-48 bg-emerald-200" />
                  </div>
                  <Button asChild size="sm" className="bg-[#2D4F3E] text-white hover:bg-[#1e362a]">
                    <Link to="/profile">Complete Setup</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-lg border-[#C2410C] bg-[#C2410C] text-white shadow-none md:col-span-2">
                <CardHeader className="items-center text-center">
                  <Clock3 className="mb-3 size-9" />
                  <CardDescription className="text-white/80">
                    {attendance?.check_in
                      ? attendance.check_out
                        ? "Workday complete"
                        : "You’re checked in"
                      : "Start your workday"}
                  </CardDescription>
                  <CardTitle className="mt-1 text-3xl tracking-tight">
                    {attendance?.check_in
                      ? attendance.check_out
                        ? "Checked out"
                        : "Check out"
                      : "Check in"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full rounded-md bg-white text-[#C2410C] hover:bg-white/90"
                    onClick={handleAttendance}
                    disabled={actionLoading || Boolean(attendance?.check_out)}
                  >
                    {attendance?.check_in ? (
                      <>
                        <LogOut className="mr-2 size-4" />
                        {attendance.check_out ? "Day complete" : "Check out"}
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 size-4" />
                        Check in
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardDescription>Leave balance</CardDescription>
                    <CardTitle className="mt-2 text-5xl tracking-[-0.05em] text-[#2D4F3E]">
                      {remainingLeave}
                    </CardTitle>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2D4F3E]">
                      days remaining
                    </p>
                  </div>
                  <CalendarCheck className="size-5 text-[#2D4F3E]" />
                </CardHeader>
                <CardContent className="border-t border-[#eee9e1] pt-4 text-sm text-[#6b625a]">
                  {balances.length
                    ? `${balances.length} leave type${balances.length === 1 ? "" : "s"} available`
                    : "No leave balance assigned yet"}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg text-[#201d1a]">Recent activity</CardTitle>
                  <CardDescription className="text-[#6b625a]">
                    Your latest recorded workdays.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentAttendance.length ? (
                    <div className="space-y-3">
                      {recentAttendance.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b border-[#eee9e1] pb-3 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#201d1a]">
                              {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                                new Date(`${item.attendance_date}T12:00:00`),
                              )}
                            </p>
                            <p className="text-xs text-[#6b625a]">
                              {formatTime(item.check_in)} to {formatTime(item.check_out)}
                            </p>
                          </div>
                          <Badge variant={item.check_out ? "secondary" : "outline"}>
                            {item.check_out ? "Complete" : "Open"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6b625a]">No attendance records yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg text-[#201d1a]">Leave balance breakdown</CardTitle>
                  <CardDescription className="text-[#6b625a]">
                    Available time away from work.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {balances.length ? (
                    <div className="space-y-4">
                      {balances.map((balance) => (
                        <div key={balance.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#201d1a]">
                            {balance.leave_types?.name || "Leave"}
                          </span>
                          <span className="text-sm text-[#6b625a]">
                            {Number(balance.total_days - balance.used_days)} / {balance.total_days}{" "}
                            days
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6b625a]">
                      Your HR administrator has not added leave balances yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/leave"
                className="flex items-center gap-3 rounded-lg border border-[#ded9d0] bg-white p-5 text-sm font-semibold text-[#201d1a] transition-colors hover:border-[#C2410C] hover:bg-[#fffaf6]"
              >
                <CalendarPlus className="size-5 text-[#6b625a]" />
                Request leave
              </Link>
              <Link
                to="/payroll"
                className="flex items-center gap-3 rounded-lg border border-[#ded9d0] bg-white p-5 text-sm font-semibold text-[#201d1a] transition-colors hover:border-[#C2410C] hover:bg-[#fffaf6]"
              >
                <FileText className="size-5 text-[#6b625a]" />
                View Payslips & Statements
              </Link>
            </div>
          </>
        )}
      </section>
    </EmployeeShell>
  );
}
