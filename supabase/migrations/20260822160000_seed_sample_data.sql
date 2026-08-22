-- Safe demo seed data. Employee rows must be linked to real auth.users records.

INSERT INTO public.departments (name)
VALUES
  ('People & Culture'),
  ('Engineering'),
  ('Design'),
  ('Finance'),
  ('Operations')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.leave_types (name)
VALUES
  ('Paid Time Off'),
  ('Sick Leave'),
  ('Personal Leave')
ON CONFLICT (name) DO NOTHING;

-- Give every existing employee a starter balance for each leave type.
INSERT INTO public.leave_balances (employee_id, leave_type_id, total_days, used_days)
SELECT
  employees.id,
  leave_types.id,
  CASE leave_types.name
    WHEN 'Paid Time Off' THEN 20
    WHEN 'Sick Leave' THEN 10
    ELSE 5
  END,
  0
FROM public.employees
CROSS JOIN public.leave_types
ON CONFLICT (employee_id, leave_type_id) DO NOTHING;

-- Add a completed workday and an open workday for existing employees.
INSERT INTO public.attendance (employee_id, attendance_date, check_in, check_out)
SELECT
  employees.id,
  CURRENT_DATE - 1,
  (CURRENT_DATE - 1)::timestamp + TIME '09:00',
  (CURRENT_DATE - 1)::timestamp + TIME '17:30'
FROM public.employees
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

INSERT INTO public.attendance (employee_id, attendance_date, check_in)
SELECT
  employees.id,
  CURRENT_DATE,
  CURRENT_DATE::timestamp + TIME '09:00'
FROM public.employees
ON CONFLICT (employee_id, attendance_date) DO NOTHING;
