import { createFileRoute } from "@tanstack/react-router";
import { Calendar as CalendarIcon, Clock, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance & Schedule — Dayflow HR" },
      { name: "description", content: "Track your check-ins and view monthly attendance heatmap." },
    ],
  }),
  component: AttendancePage,
});

type Attendance = Tables<"attendance">;
type Employee = Tables<"employees">;
type AttendanceView = "daily" | "weekly" | "monthly";

const todayStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AttendancePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [monthLogs, setMonthLogs] = useState<Attendance[]>([]);
  const [view, setView] = useState<AttendanceView>("monthly");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data: emp, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (employeeError) {
      setError(employeeError.message);
      setLoading(false);
      return;
    }
    if (!emp) {
      setError("Your employee profile has not been assigned yet.");
      setLoading(false);
      return;
    }
    setEmployee(emp);

    const [{ data: todayRecord, error: todayError }, { data: logs, error: logsError }] =
      await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", emp.id)
          .eq("attendance_date", todayStr())
          .maybeSingle(),
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", emp.id)
          .order("attendance_date", { ascending: false })
          .limit(100),
      ]);

    if (todayError || logsError)
      setError(todayError?.message || logsError?.message || "Unable to load attendance.");
    setTodayAttendance(todayRecord);
    setMonthLogs(logs || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadAttendance();
  }, [user]);

  const handleCheckInOut = async () => {
    if (!employee) return;
    setActionLoading(true);
    setError("");

    const now = new Date().toISOString();
    let result;

    if (!todayAttendance?.check_in) {
      result = await supabase
        .from("attendance")
        .upsert(
          { employee_id: employee.id, attendance_date: todayStr(), check_in: now },
          { onConflict: "employee_id,attendance_date" },
        )
        .select()
        .single();
    } else {
      result = await supabase
        .from("attendance")
        .update({ check_out: now })
        .eq("id", todayAttendance.id)
        .select()
        .single();
    }

    setActionLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      setTodayAttendance(result.data);
      void loadAttendance();
    }
  };

  // Generate calendar days for current month
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeklyDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const calendarDays =
    view === "daily"
      ? [new Date()]
      : view === "weekly"
        ? weeklyDays
        : daysArray.map((day) => new Date(year, month, day));

  const getDayStatus = (date: Date) => {
    const dayDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const log = monthLogs.find((l) => l.attendance_date === dayDateStr);
    if (!log || !log.check_in) return "absent";
    return "present";
  };

  return (
    <EmployeeShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Attendance & Schedule
          </h1>
          <p className="text-sm text-muted-foreground">
            Log your work hours and inspect monthly attendance calendar.
          </p>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {/* Check-in Widget */}
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Today's Check-in</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground font-medium">Check-in Time</p>
                <p className="text-lg font-semibold mt-1">
                  {todayAttendance?.check_in
                    ? new Date(todayAttendance.check_in).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not checked in"}
                </p>
              </div>
              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground font-medium">Check-out Time</p>
                <p className="text-lg font-semibold mt-1">
                  {todayAttendance?.check_out
                    ? new Date(todayAttendance.check_out).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not checked out"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleCheckInOut}
              disabled={actionLoading || Boolean(todayAttendance?.check_out)}
              className="w-full bg-[#C2410C] text-white hover:bg-[#a83a0a]"
            >
              {todayAttendance?.check_in ? (
                todayAttendance.check_out ? (
                  "Workday Complete"
                ) : (
                  <>
                    <LogOut className="mr-2 size-4" /> Check Out
                  </>
                )
              ) : (
                <>
                  <LogIn className="mr-2 size-4" /> Check In Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Heatmap Calendar */}
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="size-5 text-[#2D4F3E]" /> Monthly Heatmap —{" "}
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </CardTitle>
            <CardDescription>Review your attendance by day, week, or month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {(
                Object.keys({
                  daily: "Daily",
                  weekly: "Weekly",
                  monthly: "Monthly",
                }) as AttendanceView[]
              ).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={view === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
            <div className={`grid gap-2 ${view === "daily" ? "grid-cols-1" : "grid-cols-7"}`}>
              {calendarDays.map((date) => {
                const status = getDayStatus(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={`flex flex-col items-center justify-center rounded-lg border p-3 min-h-14 transition-colors ${
                      status === "present"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-gray-200 bg-gray-50/50 text-gray-500"
                    }`}
                  >
                    <span className="text-sm font-bold">{date.getDate()}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className="text-[10px] capitalize font-medium mt-0.5">
                      {status === "present" ? "Present" : "Absent"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeShell>
  );
}
