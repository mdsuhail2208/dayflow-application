import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus, Search, Upload, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employee Directory — Dayflow Admin" },
      { name: "description", content: "Manage company employees, departments, and onboarding." },
    ],
  }),
  component: AdminEmployeesPage,
});

type EmployeeWithDept = Tables<"employees"> & { departments: { name: string } | null };
type Department = Tables<"departments">;

function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDept[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Add Employee Form State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [designation, setDesignation] = useState("");
  const [doj, setDoj] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // CSV Bulk Upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [{ data: empData, error: empErr }, { data: deptData, error: deptErr }] =
      await Promise.all([
        supabase
          .from("employees")
          .select("*, departments(name)")
          .order("created_at", { ascending: false }),
        supabase.from("departments").select("*").order("name", { ascending: true }),
      ]);

    if (empErr || deptErr) {
      setError(empErr?.message || deptErr?.message || "Failed to load data.");
    } else {
      setEmployees((empData as EmployeeWithDept[]) || []);
      setDepartments(deptData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    // Create placeholder employee record linked to current admin or a generated mock user id
    const newEmp = {
      name: name.trim(),
      user_id: crypto.randomUUID(),
      department_id: departmentId || null,
      designation: designation.trim() || "Team Member",
      date_of_joining: doj || new Date().toISOString().slice(0, 10),
    };

    const { data, error: insertErr } = await supabase
      .from("employees")
      .insert(newEmp)
      .select("*, departments(name)")
      .single();

    setSubmitting(false);
    if (insertErr) {
      setError(insertErr.message);
    } else if (data) {
      setEmployees((prev) => [data as EmployeeWithDept, ...prev]);
      setMessage(`Added employee ${name.trim()} successfully.`);
      setOpenAddDialog(false);
      setName("");
      setEmail("");
      setDesignation("");
      setDepartmentId("");
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
        setError("CSV file must contain a header row and at least one data row.");
        setImporting(false);
        return;
      }

      // Format: Name, Designation, Department
      const rows = lines.slice(1);
      let count = 0;

      for (const row of rows) {
        const [empName, empDesig, empDept] = row.split(",").map((item) => item?.trim());
        if (empName) {
          const dept = departments.find((d) => d.name.toLowerCase() === empDept?.toLowerCase());
          await supabase.from("employees").insert({
            name: empName,
            user_id: crypto.randomUUID(),
            designation: empDesig || "Software Engineer",
            department_id: dept?.id || null,
            date_of_joining: new Date().toISOString().slice(0, 10),
          });
          count++;
        }
      }

      setMessage(`Successfully imported ${count} employees from CSV.`);
      setCsvFile(null);
      void loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to process CSV.";
      setError(errMsg);
    }
    setImporting(false);
  };

  const exportEmployeesCsv = () => {
    const headers = ["ID", "Name", "Designation", "Department", "Date of Joining"];
    const rows = employees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.designation || ""}"`,
      `"${e.departments?.name || "Unassigned"}"`,
      e.date_of_joining || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Dayflow_Employees_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.designation || "").toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "all" || e.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workforce, departments, and onboarding.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportEmployeesCsv}>
            <Download className="mr-2 size-4" /> Export CSV
          </Button>

          {/* Add Employee Modal */}
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#C2410C] text-white hover:bg-[#a83a0a]">
                <UserPlus className="mr-2 size-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Create a new employee profile in the system.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-name">Full Name</Label>
                  <Input
                    id="emp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-designation">Designation</Label>
                  <Input
                    id="emp-designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Designer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-dept">Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger id="emp-dept">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-doj">Date of Joining</Label>
                  <Input
                    id="emp-doj"
                    type="date"
                    value={doj}
                    onChange={(e) => setDoj(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#C2410C] text-white" disabled={submitting}>
                    {submitting ? "Adding..." : "Save Employee"}
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

      {/* CSV Import Card */}
      <Card className="border-dashed bg-muted/20 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Upload className="size-4 text-[#C2410C]" /> Bulk Import Employees via CSV
          </CardTitle>
          <CardDescription className="text-xs">
            Upload a CSV file formatted as:{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
              Name, Designation, Department
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
              {importing ? "Importing..." : "Upload & Import"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search employee name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Table */}
      <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading employee directory...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto size-8 text-muted-foreground/50" />
              <h3 className="mt-2 font-semibold text-foreground">No employees found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search filter or add a new employee.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Date of Joining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{emp.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{emp.departments?.name || "Unassigned"}</TableCell>
                    <TableCell>{emp.designation || "Team Member"}</TableCell>
                    <TableCell>
                      {emp.date_of_joining
                        ? new Date(emp.date_of_joining).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20">
                        Active
                      </Badge>
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
