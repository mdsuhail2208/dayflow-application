-- Rich demo data for the current month.
-- This only creates employee rows for real auth.users records.

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

-- Create employee records for authenticated non-admin users that do not have one.
WITH departments AS (
  SELECT id, row_number() OVER (ORDER BY name) AS department_number
  FROM public.departments
), real_users AS (
  SELECT
    users.id,
    COALESCE(NULLIF(users.raw_user_meta_data->>'full_name', ''), split_part(users.email, '@', 1)) AS display_name,
    row_number() OVER (ORDER BY users.created_at, users.id) AS user_number
  FROM auth.users AS users
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_roles AS roles
    WHERE roles.user_id = users.id AND roles.role = 'admin'
  )
)
INSERT INTO public.employees (user_id, name, department_id, designation, date_of_joining, phone, address)
SELECT
  real_users.id,
  initcap(replace(real_users.display_name, '_', ' ')),
  departments.id,
  CASE (real_users.user_number - 1) % 5
    WHEN 0 THEN 'People Operations Specialist'
    WHEN 1 THEN 'Software Engineer'
    WHEN 2 THEN 'Product Designer'
    WHEN 3 THEN 'Finance Analyst'
    ELSE 'Operations Coordinator'
  END,
  CURRENT_DATE - (((30 + real_users.user_number * 17) % 900)::integer),
  '+1 555 010 ' || lpad((1000 + real_users.user_number)::text, 4, '0'),
  'Dayflow Demo Office'
FROM real_users
JOIN departments
  ON departments.department_number = ((real_users.user_number - 1) % 5) + 1
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  designation = EXCLUDED.designation,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- Give every employee a useful demo balance for each leave type.
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

-- Generate weekday attendance from the first day of this month through yesterday.
INSERT INTO public.attendance (employee_id, attendance_date, check_in, check_out)
SELECT
  employees.id,
  days.attendance_date,
  days.attendance_date::timestamp + TIME '09:00' + (((abs(hashtextextended(employees.id::text, 0)) % 31)::integer) * INTERVAL '1 minute'),
  days.attendance_date::timestamp + TIME '17:30' + (((abs(hashtextextended(employees.id::text, 0)) % 16)::integer) * INTERVAL '1 minute')
FROM public.employees
CROSS JOIN LATERAL generate_series(
  date_trunc('month', CURRENT_DATE)::date,
  CURRENT_DATE - 1,
  INTERVAL '1 day'
) AS days(attendance_date)
WHERE extract(isodow FROM days.attendance_date) BETWEEN 1 AND 5
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

-- Keep today open so the dashboard has a realistic active work session.
INSERT INTO public.attendance (employee_id, attendance_date, check_in)
SELECT
  employees.id,
  CURRENT_DATE,
  CURRENT_DATE::timestamp + TIME '09:00' + (((abs(hashtextextended(employees.id::text, 0)) % 31)::integer) * INTERVAL '1 minute')
FROM public.employees
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

-- Add one pending request for the first employee so admin approvals are visible.
INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, remarks)
SELECT
  employees.id,
  leave_types.id,
  CURRENT_DATE + 7,
  CURRENT_DATE + 8,
  'Demo leave request for approval'
FROM public.employees
CROSS JOIN LATERAL (
  SELECT id FROM public.leave_types WHERE name = 'Paid Time Off' LIMIT 1
) AS leave_types
WHERE NOT EXISTS (
  SELECT 1
  FROM public.leave_requests AS requests
  WHERE requests.employee_id = employees.id
    AND requests.remarks = 'Demo leave request for approval'
)
ORDER BY employees.created_at
LIMIT 1;
