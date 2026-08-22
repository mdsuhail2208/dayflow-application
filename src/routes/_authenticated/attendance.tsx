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

const todayStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function isHalfDay(checkInTimeStr: string | null): boolean {
  if (!checkInTimeStr) return false;
  const time = new Date(checkInTimeStr);
  // Cutoff threshold: 10:30 AM
  return time.getHours() > 10 || (time.getHours() === 10 && time.getMinutes() > 30);
}

function AttendancePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [monthLogs, setMonthLogs] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data: emp } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!emp) {
      setLoading(false);
      return;
    }
    setEmployee(emp);

    const [{ data: todayRecord }, { data: logs }] = await Promise.all([
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
        .limit(30),
    ]);

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

  const getDayStatus = (dayNum: number) => {
    const dayDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const log = monthLogs.find((l) => l.attendance_date === dayDateStr);
    if (!log || !log.check_in) return "absent";
    if (isHalfDay(log.check_in)) return "half-day";
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
              <Badge variant="outline" className="text-xs">
                Cutoff: 10:30 AM (Half-day rule)
              </Badge>
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
                {todayAttendance?.check_in && isHalfDay(todayAttendance.check_in) && (
                  <Badge className="mt-1 bg-amber-500 text-white text-[10px]">
                    Late (Half-Day)
                  </Badge>
                )}
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
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="size-5 text-[#2D4F3E]" /> Monthly Heatmap —{" "}
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </CardTitle>
            <CardDescription>Visual overview of your attendance record this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysArray.map((dayNum) => {
                const status = getDayStatus(dayNum);
                return (
                  <div
                    key={dayNum}
                    className={`flex flex-col items-center justify-center rounded-lg border p-3 min-h-14 transition-colors ${
                      status === "present"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : status === "half-day"
                          ? "border-amber-300 bg-amber-50 text-amber-900"
                          : "border-gray-200 bg-gray-50/50 text-gray-500"
                    }`}
                  >
                    <span className="font-bold text-sm">{dayNum}</span>
                    <span className="text-[10px] capitalize font-medium mt-0.5">
                      {status === "present"
                        ? "Present"
                        : status === "half-day"
                          ? "Half-Day"
                          : "Absent"}
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
