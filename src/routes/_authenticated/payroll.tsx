import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Printer, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/payroll")({
  head: () => ({
    meta: [
      { title: "My Payslips — Dayflow HR" },
      {
        name: "description",
        content: "View your monthly salary statements and download payslip PDFs.",
      },
    ],
  }),
  component: EmployeePayrollPage,
});

type Payroll = Tables<"payroll">;
type Employee = Tables<"employees"> & { departments: { name: string } | null };

function EmployeePayrollPage() {
  const { user, fullName } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadPayroll = async () => {
      setLoading(true);

      const { data: emp } = await supabase
        .from("employees")
        .select("*, departments(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (emp) {
        setEmployee(emp as Employee);
        const { data: pay } = await supabase
          .from("payroll")
          .select("*")
          .eq("employee_id", emp.id)
          .order("month", { ascending: false });

        if (active) setPayrollHistory(pay || []);
      }
      if (active) setLoading(false);
    };

    void loadPayroll();
    return () => {
      active = false;
    };
  }, [user]);

  const printPayslip = (pay: Payroll) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const empName = fullName || employee?.name || "Employee";
    const dept = employee?.departments?.name || "General";
    const desig = employee?.designation || "Team Member";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${pay.month} - ${empName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111827; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #C2410C; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #C2410C; }
            .subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { font-size: 15px; font-weight: 600; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; background: #f3f4f6; padding: 12px; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .total-row { font-size: 18px; font-weight: bold; background: #fdf2f2; color: #991b1b; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">DAYFLOW HR</div>
              <div class="subtitle">Official Monthly Salary Statement</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold;">PAYSLIP</div>
              <div class="subtitle">Pay Period: ${pay.month}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="label">Employee Name</div>
              <div class="value">${empName}</div>
            </div>
            <div>
              <div class="label">Designation</div>
              <div class="value">${desig}</div>
            </div>
            <div>
              <div class="label">Department</div>
              <div class="value">${dept}</div>
            </div>
            <div>
              <div class="label">Payment Date</div>
              <div class="value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings / Deductions</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td style="text-align: right;">$${Number(pay.basic).toLocaleString()}</td>
              </tr>
              <tr>
                <td>House Rent Allowance (HRA)</td>
                <td style="text-align: right;">$${Number(pay.hra).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Special Allowances</td>
                <td style="text-align: right;">$${Number(pay.allowances).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Deductions / Tax</td>
                <td style="text-align: right; color: #dc2626;">-$${Number(pay.deductions).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td style="padding: 16px;">NET PAYABLE</td>
                <td style="text-align: right; padding: 16px; color: #065f46;">$${Number(pay.net_pay).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            This is a computer-generated payslip issued by Dayflow HR System. No signature required.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <EmployeeShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Payslips & Compensation
          </h1>
          <p className="text-sm text-muted-foreground">
            View salary breakdowns and download official monthly payslip PDFs.
          </p>
        </div>

        <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Payslip History</CardTitle>
            <CardDescription>Statements issued by HR payroll.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading payslip history...
              </div>
            ) : payrollHistory.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No payslips issued yet. Check back after monthly payroll processing.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollHistory.map((pay) => (
                    <TableRow key={pay.id}>
                      <TableCell className="font-semibold text-sm">{pay.month}</TableCell>
                      <TableCell>${Number(pay.basic).toLocaleString()}</TableCell>
                      <TableCell>
                        ${(Number(pay.hra) + Number(pay.allowances)).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-destructive">
                        -${Number(pay.deductions).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-800">
                        ${Number(pay.net_pay).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => printPayslip(pay)}>
                          <Download className="mr-1.5 size-3.5" /> Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployeeShell>
  );
}
