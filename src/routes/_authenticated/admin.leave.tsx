import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Filter, MessageSquare, XCircle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/leave")({
  head: () => ({
    meta: [
      { title: "Leave Approvals — Dayflow Admin" },
      { name: "description", content: "Review and manage employee leave applications." },
    ],
  }),
  component: AdminLeavePage,
});

type LeaveRequestFull = Tables<"leave_requests"> & {
  employees: { name: string; user_id: string; designation: string | null } | null;
  leave_types: { name: string } | null;
};

function AdminLeavePage() {
  const [requests, setRequests] = useState<LeaveRequestFull[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Action Dialog state
  const [selectedReq, setSelectedReq] = useState<LeaveRequestFull | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [approverComment, setApproverComment] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    let query = supabase
      .from("leave_requests")
      .select("*, employees(name, user_id, designation), leave_types(name)")
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as "pending" | "approved" | "rejected");
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setRequests((data as LeaveRequestFull[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchRequests();
  }, [statusFilter]);

  const handleOpenAction = (req: LeaveRequestFull, type: "approve" | "reject") => {
    setSelectedReq(req);
    setActionType(type);
    setApproverComment("");
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;
    setProcessing(true);
    setError("");
    setMessage("");

    const newStatus = actionType === "approve" ? "approved" : "rejected";

    const { error: updateErr } = await supabase
      .from("leave_requests")
      .update({ status: newStatus, approver_comment: approverComment.trim() || null })
      .eq("id", selectedReq.id);

    if (updateErr) {
      setError(updateErr.message);
      setProcessing(false);
      return;
    }

    // Trigger in-app notification to employee
    if (selectedReq.employees?.user_id) {
      await supabase.from("notifications").insert({
        user_id: selectedReq.employees.user_id,
        title: `Leave Request ${newStatus === "approved" ? "Approved" : "Rejected"}`,
        message: `Your leave request for ${selectedReq.start_date} to ${selectedReq.end_date} was ${newStatus}.${approverComment ? ` Note: "${approverComment}"` : ""}`,
      });
    }

    setProcessing(false);
    setMessage(`Leave request ${newStatus} for ${selectedReq.employees?.name}.`);
    setSelectedReq(null);
    setActionType(null);
    void fetchRequests();
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review employee leave applications and approve time-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All Requests</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Requests Table */}
      <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Leave Applications</CardTitle>
          <CardDescription>
            {statusFilter === "pending"
              ? `${requests.length} pending request(s) awaiting approval.`
              : "Employee time-off logs."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading applications...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No leave applications found for this filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      <p className="font-semibold text-sm">{req.employees?.name || "Employee"}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.employees?.designation || "Team Member"}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {req.leave_types?.name || "Leave"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(req.start_date).toLocaleDateString()} to{" "}
                      {new Date(req.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {req.remarks || "—"}
                    </TableCell>
                    <TableCell>
                      {req.status === "approved" ? (
                        <Badge className="bg-emerald-600 text-white">Approved</Badge>
                      ) : req.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-700 bg-amber-50"
                        >
                          Pending Action
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleOpenAction(req, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleOpenAction(req, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Decided</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={Boolean(selectedReq)} onOpenChange={(open) => !open && setSelectedReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              Confirm action for <strong>{selectedReq?.employees?.name}</strong> (
              {selectedReq?.start_date} to {selectedReq?.end_date}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Approver Comment / Note</Label>
              <Textarea
                id="comment"
                placeholder={
                  actionType === "approve"
                    ? "e.g. Approved. Enjoy your time off!"
                    : "e.g. Overlapping critical project deadline."
                }
                value={approverComment}
                onChange={(e) => setApproverComment(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className={
                  actionType === "approve"
                    ? "bg-emerald-600 text-white"
                    : "bg-destructive text-white"
                }
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : actionType === "approve"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
