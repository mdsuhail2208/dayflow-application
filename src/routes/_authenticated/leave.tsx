import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Calendar, CalendarPlus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/leave")({
  head: () => ({
    meta: [
      { title: "Leave & Time Off — Dayflow HR" },
      { name: "description", content: "Apply for leave, check balances, and view request status." },
    ],
  }),
  component: LeavePage,
});

type Employee = Tables<"employees">;
type LeaveType = Tables<"leave_types">;
type LeaveBalance = Tables<"leave_balances"> & { leave_types: LeaveType | null };
type LeaveRequest = Tables<"leave_requests"> & { leave_types: LeaveType | null };

function LeavePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modal form state
  const [openModal, setOpenModal] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
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

    const [{ data: balData }, { data: typeData }, { data: reqData }] = await Promise.all([
      supabase.from("leave_balances").select("*, leave_types(*)").eq("employee_id", emp.id),
      supabase.from("leave_types").select("*").order("name", { ascending: true }),
      supabase
        .from("leave_requests")
        .select("*, leave_types(*)")
        .eq("employee_id", emp.id)
        .order("created_at", { ascending: false }),
    ]);

    setBalances((balData as LeaveBalance[]) || []);
    setLeaveTypes(typeData || []);
    setRequests((reqData as LeaveRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [user]);

  // Calculate requested days count
  const requestedDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Check overlap validation against user's requests
  const checkOverlap = () => {
    if (!startDate || !endDate) return false;
    const s = new Date(startDate);
    const e = new Date(endDate);

    return requests.some((req) => {
      if (req.status === "rejected") return false;
      const reqStart = new Date(req.start_date);
      const reqEnd = new Date(req.end_date);
      return s <= reqEnd && e >= reqStart;
    });
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !leaveTypeId || !startDate || !endDate) return;

    setError("");
    setMessage("");

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (checkOverlap()) {
      setError("You already have an existing leave request overlapping with these dates.");
      return;
    }

    // Check balance
    const targetBalance = balances.find((b) => b.leave_type_id === leaveTypeId);
    const daysNeeded = requestedDaysCount();
    if (targetBalance) {
      const remaining = Number(targetBalance.total_days - targetBalance.used_days);
      if (daysNeeded > remaining) {
        setError(
          `Insufficient leave balance. You have ${remaining} days left, but requested ${daysNeeded} days.`,
        );
        return;
      }
    }

    setSubmitting(true);

    const newRequest = {
      employee_id: employee.id,
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      remarks: remarks.trim() || null,
      status: "pending" as const,
    };

    const { data, error: insertErr } = await supabase
      .from("leave_requests")
      .insert(newRequest)
      .select("*, leave_types(*)")
      .single();

    setSubmitting(false);

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setMessage(`Leave request for ${daysNeeded} day(s) submitted successfully.`);
      setOpenModal(false);
      setStartDate("");
      setEndDate("");
      setRemarks("");
      setLeaveTypeId("");
      void loadData();
    }
  };

  return (
    <EmployeeShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave & Time Off</h1>
            <p className="text-sm text-muted-foreground">
              Manage your leave balances and track application approvals.
            </p>
          </div>

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#C2410C] text-white hover:bg-[#a83a0a]">
                <CalendarPlus className="mr-2 size-4" /> Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Time Off</DialogTitle>
                <DialogDescription>Submit your leave request for HR review.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveTypeId} onValueChange={setLeaveTypeId} required>
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select leave category" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                    Duration:{" "}
                    <span className="font-semibold text-foreground">
                      {requestedDaysCount()} day(s)
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="remarks">Reason / Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Provide context for your leave..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-[#C2410C] text-white" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {/* Leave Balances Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {balances.length === 0 ? (
            <Card className="sm:col-span-3 border-dashed">
              <CardContent className="p-6 text-center text-xs text-muted-foreground">
                No leave balances assigned yet.
              </CardContent>
            </Card>
          ) : (
            balances.map((b) => {
              const remaining = Number(b.total_days - b.used_days);
              return (
                <Card key={b.id} className="rounded-lg border-[#ded9d0] bg-white shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>{b.leave_types?.name || "Leave"}</CardDescription>
                    <CardTitle className="text-3xl text-[#2D4F3E]">
                      {remaining}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {b.total_days} days left
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Used: {b.used_days} days
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Requests History Table */}
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Leave Application History</CardTitle>
            <CardDescription>Status of your submitted time-off requests.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading leave history...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No leave requests submitted yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const days =
                      Math.ceil(
                        Math.abs(
                          new Date(req.end_date).getTime() - new Date(req.start_date).getTime(),
                        ) /
                          (1000 * 60 * 60 * 24),
                      ) + 1;
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold text-sm">
                          {req.leave_types?.name || "Leave"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(req.start_date).toLocaleDateString()} to{" "}
                          {new Date(req.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs">{days} day(s)</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {req.remarks || "—"}
                        </TableCell>
                        <TableCell>
                          {req.status === "approved" ? (
                            <Badge className="bg-emerald-600 text-white">
                              <CheckCircle2 className="mr-1 size-3" /> Approved
                            </Badge>
                          ) : req.status === "rejected" ? (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 size-3" /> Rejected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-700 bg-amber-50"
                            >
                              <Clock className="mr-1 size-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployeeShell>
  );
}
