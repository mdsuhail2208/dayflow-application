import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, Edit, Search, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Management — Dayflow Admin" },
      { name: "description", content: "Review and override company attendance records." },
    ],
  }),
  component: AdminAttendancePage,
});

type AttendanceRecord = Tables<"attendance"> & {
  employees: { name: string; designation: string | null } | null;
};

function AdminAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterDate, setFilterDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Edit/Override Modal state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [auditNote, setAuditNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase
      .from("attendance")
      .select("*, employees(name, designation)")
      .eq("attendance_date", filterDate)
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setRecords((data as AttendanceRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchAttendance();
  }, [filterDate]);

  const handleOpenEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setCheckInTime(
      record.check_in ? new Date(record.check_in).toISOString().slice(11, 16) : "09:00",
    );
    setCheckOutTime(
      record.check_out ? new Date(record.check_out).toISOString().slice(11, 16) : "17:00",
    );
    setAuditNote("");
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !auditNote.trim()) {
      setError("Audit note is required for manual attendance override.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const updatedCheckIn = `${filterDate}T${checkInTime}:00.000Z`;
    const updatedCheckOut = checkOutTime ? `${filterDate}T${checkOutTime}:00.000Z` : null;

    const { error: updateErr } = await supabase
      .from("attendance")
      .update({
        check_in: updatedCheckIn,
        check_out: updatedCheckOut,
        audit_note: auditNote.trim(),
        overridden_by: user?.id ?? null,
      })
      .eq("id", editingRecord.id);

    setSaving(false);
    if (updateErr) {
      setError(updateErr.message);
    } else {
      setMessage(
        `Attendance overridden for ${editingRecord.employees?.name} (Audit Note: "${auditNote.trim()}")`,
      );
      setEditingRecord(null);
      void fetchAttendance();
    }
  };

  const filteredRecords = records.filter((r) =>
    (r.employees?.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Attendance Logs & Overrides
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor daily check-ins and apply manual corrections with audit notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="date-picker" className="text-xs font-semibold">
            Filter Date:
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-40 text-xs"
          />
        </div>
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

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Recorded Today</CardDescription>
            <CardTitle className="text-3xl">{records.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700 font-medium">Checked In</CardDescription>
            <CardTitle className="text-3xl text-emerald-800">
              {records.filter((r) => r.check_in).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-medium">Open Sessions</CardDescription>
            <CardTitle className="text-3xl text-amber-800">
              {records.filter((r) => r.check_in && !r.check_out).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search employee by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading attendance logs...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No attendance logs found for {filterDate}.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">
                      <p className="font-semibold text-sm">{rec.employees?.name || "Employee"}</p>
                      <p className="text-xs text-muted-foreground">
                        {rec.employees?.designation || "Team Member"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {rec.check_in
                        ? new Date(rec.check_in).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {rec.check_out
                        ? new Date(rec.check_out).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rec.check_out ? "secondary" : "outline"} className="text-xs">
                        {rec.check_out ? "Complete" : rec.check_in ? "Checked In" : "Absent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(rec)}>
                        <Edit className="mr-1 size-3.5" /> Manual Override
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog
        open={Boolean(editingRecord)}
        onOpenChange={(open) => !open && setEditingRecord(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Attendance Correction</DialogTitle>
            <DialogDescription>
              Override check-in and check-out times for{" "}
              <strong>{editingRecord?.employees?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveOverride} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkin-time">Check In Time</Label>
                <Input
                  id="checkin-time"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-time">Check Out Time</Label>
                <Input
                  id="checkout-time"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-note">Audit Note / Reason (Required)</Label>
              <Input
                id="audit-note"
                placeholder="e.g. Card reader failure at main gate"
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#C2410C] text-white" disabled={saving}>
                {saving ? "Saving Override..." : "Save Override"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
