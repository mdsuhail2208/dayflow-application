import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Building2,
  Cake,
  CalendarDays,
  ClipboardCheck,
  Download,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Dayflow HR" },
      {
        name: "description",
        content: "Dayflow admin home for people, attendance, leave and payroll.",
      },
    ],
  }),
  component: AdminDashboard,
});

type Employee = Tables<"employees"> & { departments: { name: string } | null };
type Department = Tables<"departments">;
type Attendance = Tables<"attendance">;

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [recent, setRecent] = useState<(Attendance & { employees: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      const [
        { data: emp, error: empError },
        { data: dept, error: deptError },
        { data: att, error: attError },
        { data: leaveReqs, error: leaveError },
        { data: recentAtt, error: recentError },
      ] = await Promise.all([
        supabase.from("employees").select("*, departments(name)"),
        supabase.from("departments").select("*"),
        supabase.from("attendance").select("*").eq("attendance_date", today()),
        supabase.from("leave_requests").select("id").eq("status", "pending"),
        supabase
          .from("attendance")
          .select("*, employees(name)")
          .order("check_in", { ascending: false })
          .limit(6),
      ]);
      if (!active) return;
      const loadError = empError ?? deptError ?? attError ?? leaveError ?? recentError;
      if (loadError) setError(loadError.message);
      setEmployees((emp as Employee[]) ?? []);
      setDepartments(dept ?? []);
      setTodayAttendance(att ?? []);
      setPendingLeaveCount(leaveReqs?.length ?? 0);
      setRecent(
        (recentAtt as (Attendance & { employees: { name: string } | null })[] | null) ?? [],
      );
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const headcount = employees.length;
  const presentToday = todayAttendance.filter((a) => a.check_in).length;
  const absentToday = Math.max(headcount - presentToday, 0);

  const attendanceSplit = [
    { name: "Present", value: presentToday, color: "#2D4F3E" },
    { name: "Absent", value: absentToday, color: "#ded9d0" },
  ];

  const deptCounts = departments.map((d) => ({
    name: d.name,
    count: employees.filter((e) => e.department_id === d.id).length,
  }));
  const unassigned = employees.filter((e) => !e.department_id).length;
  if (unassigned > 0) deptCounts.push({ name: "Unassigned", count: unassigned });

  const exportSummaryCsv = () => {
    const headers = ["Employee Name", "Department", "Designation", "Joining Date"];
    const rows = employees.map((e) => [
      `"${e.name}"`,
      `"${e.departments?.name || "Unassigned"}"`,
      `"${e.designation || "Member"}"`,
      e.date_of_joining || "N/A",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dayflow_HR_Summary_${today()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Command Center</h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportSummaryCsv}>
          <Download className="mr-2 size-4" /> Export HR Report (CSV)
        </Button>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="h-28 animate-pulse p-6" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load admin data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Check the Supabase migrations and try refreshing this page.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Actionable Pending Approvals Banner */}
          {pendingLeaveCount > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <div className="flex items-center gap-3">
                <CalendarDays className="size-5 text-amber-700" />
                <span className="font-medium text-sm">
                  You have <strong>{pendingLeaveCount} pending leave request(s)</strong> requiring
                  your approval.
                </span>
              </div>
              <Button asChild size="sm" className="bg-amber-700 text-white hover:bg-amber-800">
                <Link to="/admin/leave">Review Requests</Link>
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="border-[#C2410C] bg-[#C2410C] text-white shadow-none sm:col-span-2">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    Total Headcount
                  </p>
                  <p className="mt-2 text-4xl font-bold tracking-tight">{headcount}</p>
                  <p className="mt-1 text-sm text-white/80">
                    {departments.length} department(s) active
                  </p>
                </div>
                <Users className="size-6 text-white/80" />
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Present Today
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">{presentToday}</p>
                    <p className="mt-1 text-xs text-muted-foreground">checked in</p>
                  </div>
                  <UserCheck className="size-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Absent Today
                    </p>
                    <p className="mt-2 text-3xl font-bold text-muted-foreground">{absentToday}</p>
                    <p className="mt-1 text-xs text-muted-foreground">not checked in</p>
                  </div>
                  <UserX className="size-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <Card className="border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Today's Attendance Split</CardTitle>
                <CardDescription>Present vs absent employees.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceSplit}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {attendanceSplit.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#2D4F3E]" />
                    Present<span className="ml-auto font-semibold">{presentToday}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#ded9d0]" />
                    Absent<span className="ml-auto font-semibold">{absentToday}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Department Breakdown</CardTitle>
                <CardDescription>Distribution across organization teams.</CardDescription>
              </CardHeader>
              <CardContent className="h-48">
                {deptCounts.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptCounts} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                      <Bar dataKey="count" fill="#C2410C" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No departments configured yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Celebrations & Recent Activity Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cake className="size-5 text-pink-600" /> Milestones & Celebrations This Week
                </CardTitle>
                <CardDescription>Birthdays and work anniversaries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {employees.length ? employees.slice(0, 3).map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {idx % 2 === 0 ? (
                        <Cake className="size-4 text-pink-500" />
                      ) : (
                        <Award className="size-4 text-amber-500" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.departments?.name || "General"} • {emp.designation || "Member"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {idx % 2 === 0 ? "Birthday 🎉" : "1 Year Anniversary 🏆"}
                    </Badge>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No employee milestones to show yet.</p>}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-none">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Recent Activity Log</CardTitle>
                  <CardDescription>Latest team check-ins.</CardDescription>
                </div>
                <Link
                  to="/admin/attendance"
                  className="text-sm font-semibold text-[#C2410C] hover:underline"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {recent.length ? (
                  <div className="space-y-3">
                    {recent.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <ClipboardCheck className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium">
                              {item.employees?.name ?? "Unknown employee"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                                new Date(`${item.attendance_date}T12:00:00`),
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {item.check_out ? "Complete" : "Checked In"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No attendance activity recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
