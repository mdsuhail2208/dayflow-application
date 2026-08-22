import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Download, Edit3, Plus, Upload, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll Management — Dayflow Admin" },
      {
        name: "description",
        content: "Manage employee salary structures and monthly payroll runs.",
      },
    ],
  }),
  component: AdminPayrollPage,
});

type Employee = Tables<"employees">;
type PayrollRecord = Tables<"payroll"> & {
  employees: { name: string; designation: string | null } | null;
};

const currentMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function AdminPayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr());
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Edit / Add Payroll dialog state
  const [openModal, setOpenModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [basic, setBasic] = useState("5000");
  const [hra, setHra] = useState("2000");
  const [allowances, setAllowances] = useState("1000");
  const [deductions, setDeductions] = useState("500");
  const [saving, setSaving] = useState(false);

  // CSV Bulk upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [{ data: pData, error: pErr }, { data: empData, error: empErr }] = await Promise.all([
      supabase.from("payroll").select("*, employees(name, designation)").eq("month", selectedMonth),
      supabase.from("employees").select("*").order("name", { ascending: true }),
    ]);

    if (pErr || empErr) {
      setError(pErr?.message || empErr?.message || "Failed to load payroll data.");
    } else {
      setPayrollList((pData as PayrollRecord[]) || []);
      setEmployees(empData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [selectedMonth]);

  const netPay =
    (Number(basic) || 0) +
    (Number(hra) || 0) +
    (Number(allowances) || 0) -
    (Number(deductions) || 0);

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    setSaving(true);
    setError("");
    setMessage("");

    const newRecord = {
      employee_id: selectedEmployeeId,
      month: selectedMonth,
      basic: Number(basic) || 0,
      hra: Number(hra) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      net_pay: netPay >= 0 ? netPay : 0,
    };

    const { data, error: upsertErr } = await supabase
      .from("payroll")
      .upsert(newRecord, { onConflict: "employee_id,month" })
      .select("*, employees(name, designation)")
      .single();

    setSaving(false);

    if (upsertErr) {
      setError(upsertErr.message);
    } else {
      setMessage(`Payroll updated for ${data.employees?.name} (${selectedMonth}).`);
      setOpenModal(false);
      void loadData();
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setImporting(true);
    setError("");
    setMessage("");

    try {
      const text = await csvFile.text();
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        setError("CSV must contain a header row and at least one data row.");
        setImporting(false);
        return;
      }

      // Format: Employee Name, Basic, HRA, Allowances, Deductions
      const rows = lines.slice(1);
      let count = 0;

      for (const row of rows) {
        const [empName, b, h, a, d] = row.split(",").map((item) => item?.trim());
        const emp = employees.find((e) => e.name.toLowerCase() === empName?.toLowerCase());

        if (emp) {
          const basicNum = Number(b) || 0;
          const hraNum = Number(h) || 0;
          const allowNum = Number(a) || 0;
          const dedNum = Number(d) || 0;
          const net = basicNum + hraNum + allowNum - dedNum;

          const { error: rowError } = await supabase.from("payroll").upsert(
            {
              employee_id: emp.id,
              month: selectedMonth,
              basic: basicNum,
              hra: hraNum,
              allowances: allowNum,
              deductions: dedNum,
              net_pay: net >= 0 ? net : 0,
            },
            { onConflict: "employee_id,month" },
          );
          if (rowError) throw rowError;
          count++;
        }
      }

      setMessage(`Successfully processed ${count} payroll entries from CSV for ${selectedMonth}.`);
      setCsvFile(null);
      void loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to process CSV.";
      setError(errMsg);
    }
    setImporting(false);
  };

  const totalPayrollOutlay = payrollList.reduce((acc, curr) => acc + Number(curr.net_pay), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Operations</h1>
          <p className="text-sm text-muted-foreground">
            Manage monthly salary structures, deductions, and payout history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Label htmlFor="month-select" className="text-xs font-semibold">
            Select Month:
          </Label>
          <Input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40 text-xs"
          />
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#C2410C] text-white hover:bg-[#a83a0a]" size="sm">
                <Plus className="mr-2 size-4" /> Add / Edit Salary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Set Employee Salary ({selectedMonth})</DialogTitle>
                <DialogDescription>
                  Configure base pay, allowances, and deductions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSavePayroll} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-select">Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} required>
                    <SelectTrigger id="emp-select">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="basic">Basic Salary ($)</Label>
                    <Input
                      id="basic"
                      type="number"
                      value={basic}
                      onChange={(e) => setBasic(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra">HRA ($)</Label>
                    <Input
                      id="hra"
                      type="number"
                      value={hra}
                      onChange={(e) => setHra(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowances">Allowances ($)</Label>
                    <Input
                      id="allowances"
                      type="number"
                      value={allowances}
                      onChange={(e) => setAllowances(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions ($)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductions}
                      onChange={(e) => setDeductions(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium flex justify-between items-center">
                  <span>Calculated Net Pay:</span>
                  <span className="text-base font-bold">${netPay.toLocaleString()}</span>
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-[#C2410C] text-white" disabled={saving}>
                    {saving ? "Saving..." : "Save Payroll"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Outlay for {selectedMonth}</CardDescription>
            <CardTitle className="text-3xl text-[#2D4F3E]">
              ${totalPayrollOutlay.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Processed Payslips</CardDescription>
            <CardTitle className="text-3xl">
              {payrollList.length} of {employees.length} employees
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* CSV Import Card */}
      <Card className="border-dashed bg-muted/20 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Upload className="size-4 text-[#C2410C]" /> Bulk Import Payroll CSV ({selectedMonth})
          </CardTitle>
          <CardDescription className="text-xs">
            Upload CSV:{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
              Employee Name, Basic, HRA, Allowances, Deductions
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCsvImport}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="max-w-xs text-xs"
            />
            <Button type="submit" variant="secondary" size="sm" disabled={!csvFile || importing}>
              {importing ? "Processing..." : "Import Payroll"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading payroll entries...
            </div>
          ) : payrollList.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No payroll entries found for {selectedMonth}. Click "Add / Edit Salary" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Basic Pay</TableHead>
                  <TableHead>HRA</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead className="font-bold text-foreground">Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <p className="font-semibold text-sm">{p.employees?.name || "Employee"}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.employees?.designation || "Team Member"}
                      </p>
                    </TableCell>
                    <TableCell>${Number(p.basic).toLocaleString()}</TableCell>
                    <TableCell>${Number(p.hra).toLocaleString()}</TableCell>
                    <TableCell>${Number(p.allowances).toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">
                      -${Number(p.deductions).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-800">
                      ${Number(p.net_pay).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
