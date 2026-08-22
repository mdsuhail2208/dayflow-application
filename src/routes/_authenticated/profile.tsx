import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, FileText, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";

import { EmployeeShell } from "@/components/layout/EmployeeShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Dayflow HR" },
      { name: "description", content: "View and manage your Dayflow employee profile details." },
    ],
  }),
  component: ProfilePage,
});

type Employee = Tables<"employees"> & { departments: { name: string } | null };
type OnboardingTask = Tables<"onboarding_tasks">;
type Document = Tables<"documents">;

function ProfilePage() {
  const { user, fullName, loading: authLoading } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Editable fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Document upload state
  const [docType, setDocType] = useState<"id_proof" | "offer_letter" | "resume" | "other">(
    "id_proof",
  );
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadProfileData = async () => {
      setLoading(true);
      setError("");

      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*, departments(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (empError) {
        if (active) setError(empError.message);
        setLoading(false);
        return;
      }

      if (empData) {
        setEmployee(empData as Employee);
        setPhone(empData.phone || "");
        setAddress(empData.address || "");

        const [{ data: taskData }, { data: docData }] = await Promise.all([
          supabase
            .from("onboarding_tasks")
            .select("*")
            .eq("employee_id", empData.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("documents")
            .select("*")
            .eq("employee_id", empData.id)
            .order("uploaded_at", { ascending: false }),
        ]);

        if (active) {
          setTasks(taskData || []);
          setDocuments(docData || []);
        }
      }
      if (active) setLoading(false);
    };

    void loadProfileData();
    return () => {
      active = false;
    };
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("employees")
      .update({ phone: phone.trim(), address: address.trim() })
      .eq("id", employee.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Profile details updated successfully.");
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_complete: !currentStatus } : t)),
    );

    await supabase
      .from("onboarding_tasks")
      .update({ is_complete: !currentStatus })
      .eq("id", taskId);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !fileName.trim()) return;
    setUploading(true);

    const newDoc = {
      employee_id: employee.id,
      type: docType,
      file_name: fileName.trim(),
      file_url: `https://mock-storage.dayflow.hr/docs/${Date.now()}_${encodeURIComponent(fileName.trim())}`,
    };

    const { data, error: uploadErr } = await supabase
      .from("documents")
      .insert(newDoc)
      .select()
      .single();

    setUploading(false);
    if (uploadErr) {
      setError(uploadErr.message);
    } else if (data) {
      setDocuments((prev) => [data, ...prev]);
      setFileName("");
      setMessage("Document uploaded successfully.");
    }
  };

  const completedTasksCount = tasks.filter((t) => t.is_complete).length;
  const onboardingProgress =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

  if (loading || authLoading) {
    return (
      <EmployeeShell>
        <div className="space-y-6">
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </EmployeeShell>
    );
  }

  return (
    <EmployeeShell>
      <div className="space-y-8">
        {/* Header Profile Summary */}
        <div className="flex flex-col gap-4 rounded-xl border border-[#ded9d0] bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={employee?.photo_url || ""} />
              <AvatarFallback className="bg-[#2D4F3E] text-lg font-semibold text-white">
                {fullName?.slice(0, 2).toUpperCase() || "EP"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-[#201d1a]">
                {fullName || employee?.name || "Employee"}
              </h1>
              <p className="text-sm text-[#6b625a]">
                {employee?.designation || "Team Member"}{" "}
                {employee?.departments?.name ? `• ${employee.departments.name}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-[#ded9d0] text-xs">
              Joined{" "}
              {employee?.date_of_joining
                ? new Date(employee.date_of_joining).toLocaleDateString()
                : "Recently"}
            </Badge>
            <Badge className="bg-[#2D4F3E] text-white">Active Employee</Badge>
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

        {/* Tabs section */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-lg bg-[#f1ede7]">
            <TabsTrigger value="details">Personal Details</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding ({onboardingProgress}%)</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-6">
            <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Contact & Employment Information</CardTitle>
                <CardDescription>Update your phone number and address details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={employee?.name || fullName || ""}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, City, Country"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Department</Label>
                      <p className="text-sm font-medium">
                        {employee?.departments?.name || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Designation</Label>
                      <p className="text-sm font-medium">
                        {employee?.designation || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#C2410C] text-white hover:bg-[#a83a0a]"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="mt-6">
            <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Onboarding Checklist</CardTitle>
                    <CardDescription>Complete these setup tasks for your new role.</CardDescription>
                  </div>
                  <span className="text-sm font-semibold text-[#2D4F3E]">
                    {completedTasksCount} of {tasks.length} completed
                  </span>
                </div>
                <Progress value={onboardingProgress} className="mt-2 h-2" />
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No onboarding tasks assigned yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id, task.is_complete)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                          task.is_complete
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {task.is_complete ? (
                            <CheckCircle2 className="size-5 text-emerald-600" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground" />
                          )}
                          <span
                            className={`text-sm ${task.is_complete ? "line-through text-muted-foreground" : "font-medium text-foreground"}`}
                          >
                            {task.task_name}
                          </span>
                        </div>
                        <Badge
                          variant={task.is_complete ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {task.is_complete ? "Done" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6 space-y-6">
            <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Upload HR Document</CardTitle>
                <CardDescription>Add identity proof, offer letter, or resume.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleUploadDocument}
                  className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                  <div className="w-full space-y-2 sm:w-48">
                    <Label htmlFor="doc-type">Document Type</Label>
                    <Select
                      value={docType}
                      onValueChange={(val) =>
                        setDocType(val as "id_proof" | "offer_letter" | "resume" | "other")
                      }
                    >
                      <SelectTrigger id="doc-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id_proof">ID Proof</SelectItem>
                        <SelectItem value="offer_letter">Offer Letter</SelectItem>
                        <SelectItem value="resume">Resume</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full space-y-2 sm:flex-1">
                    <Label htmlFor="file-name">Document Title / File Name</Label>
                    <Input
                      id="file-name"
                      placeholder="e.g. Passport_Scan.pdf"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#C2410C] text-white hover:bg-[#a83a0a]"
                    disabled={uploading}
                  >
                    <Upload className="mr-2 size-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-[#ded9d0] bg-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                <CardDescription>Your uploaded employee documentation.</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <div className="divide-y border-t">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-[#2D4F3E]" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              Type: {doc.type.replace("_", " ")} •{" "}
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            View file
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EmployeeShell>
  );
}
