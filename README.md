# Dayflow — Human Resource Management System (HRMS)

[![Deployment Status](https://img.shields.io/badge/Vercel-Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dayflowapplication-theta.vercel.app/auth)
[![Built with TanStack / React](https://img.shields.io/badge/Tech_Stack-TanStack_|_TypeScript_|_Tailwind-blue?style=for-the-badge)](https://dayflowapplication-theta.vercel.app/auth)

Dayflow HRMS is a modern Human Resource Management System designed to streamline core workplace operations, including authentication, employee profile management, daily attendance logging, leave request state management, and payroll processing.

---

## Live Demo & Test Credentials

* **Live Application:** [Dayflow Web Application](https://dayflowapplication-theta.vercel.app/auth)
* **Workflow Architecture Diagram:** [Excalidraw Visual Canvas](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ400wh)

### Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin / HR Officer** | `test_admin@gmail.com` | `asdfghjkl` |
| **Employee** | `test_employee@gmail.com` | `asdfghjkl` |

---

## Core Features

* **Authentication & RBAC**
  * Secure sign-up and sign-in with email verification rules and role assignment.
  * Role-Based Access Control (RBAC) ensuring strict separation between Admin and Employee portals.

* **Dashboards**
  * **Employee View:** Overview cards for quick profile status, real-time attendance logs, and remaining leave balances.
  * **Admin/HR View:** Enterprise overview showing employee directories, daily present/absent counters, and pending leave request queues.

* **Profile Management**
  * Employees can view personal info, job details, and salary structure, and update contact details.
  * Admins maintain full write access to manage job roles, department assignments, and salary parameters.

* **Attendance Tracking**
  * Daily/weekly attendance logging with check-in/check-out options and auto-calculated statuses (Present, Absent, Half-day, On Leave).

* **Leave State Machine**
  * Multi-status workflow (`Pending` -> `Approved` / `Rejected`) supporting Paid, Sick, and Unpaid leave types with conflict checks against overlapping date ranges.
  * Admin review module with feedback comments that dynamically update attendance logs.

* **Payroll Management**
  * Transparent read-only salary slip breakdowns (Base, Allowances, Deductions, Net Pay) for employees alongside an administrative salary structure editor for HR.

---

## Tech Stack

* **Frontend:** TypeScript, TanStack Start / React, Tailwind CSS, shadcn/ui, Lucide Icons
* **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime)
* **Deployment:** Vercel

---

## Quick Start (Local Development)

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mdsuhail2208/dayflow-application.git](https://github.com/mdsuhail2208/dayflow-application.git)
   cd dayflow-application