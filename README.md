# Dayflow Foundation

Build the FOUNDATION ONLY for a web app called "Dayflow" — an HR

Management System. Do NOT build feature logic yet — I will add that

myself in later steps. I just need a clean, working base to build on.

TECH STACK:

- React + TypeScript + Tailwind CSS + shadcn/ui

- Supabase for auth + Postgres database

WHAT TO BUILD:

1. Database schema in Supabase (tables only, no seed data needed yet):

   - users (id, email, role[employee|admin])

   - employees (id, user_id FK, name, department, designation,

     manager_id, date_of_joining, phone, address, photo_url)

   - departments (id, name)

   Add Row Level Security: employees can only read their own row,

   admins can read/write all rows. Keep other tables empty for now —

   I'll add attendance/leave/payroll schemas later.

2. Auth flow:

   - Sign up page: name, email, password, role selector (Employee/Admin)

   - Sign in page: email + password, clear inline error messages

   - Forgot password flow (basic — email link is fine)

   - Protected routing: unauthenticated users redirect to sign in,

     Employee role can never reach Admin-only routes

3. App shell / navigation (structure only, pages can be near-empty):

   - Employee view: top nav with logo, Dashboard / Profile / Attendance

     / Leave links (as placeholders), user avatar menu with Logout

   - Admin view: left sidebar with logo, Dashboard / Employees /

     Attendance / Leave / Payroll links (as placeholders), same avatar

     menu

   - Both: a simple empty-state dashboard page that just confirms

     "logged in as [name], role: [role]"

4. Design direction (lock this in now, it stays for the whole project):

   - Primary accent: [pick one, e.g. deep purple #6D28D9]

   - Neutral warm background, rounded-lg cards, soft shadows

   - Font: Inter or similar clean sans-serif

   - Fully responsive from 375px to desktop

DO NOT build attendance tracking, leave requests, payroll, or

notifications yet — just the shell, auth, roles, nav, and schema

above. I want this to be a stable base I can layer features onto one

at a time.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8dde791a-290f-4e4f-bdfa-50cfc6b607e9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
