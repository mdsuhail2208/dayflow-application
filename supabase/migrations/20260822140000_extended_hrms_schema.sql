-- Extended HRMS Schema Migration

-- 1. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approver_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

GRANT SELECT, INSERT, UPDATE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own leave requests"
  ON public.leave_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = leave_requests.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Employees can submit leave requests"
  ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update leave requests"
  ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.employees WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid() AND leave_requests.status = 'pending'
  ))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.employees WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid() AND leave_requests.status = 'pending'
  ));

-- Trigger for updated_at on leave_requests
CREATE TRIGGER leave_requests_set_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger & Function: Auto-update leave_balances when leave is approved
CREATE OR REPLACE FUNCTION public.handle_leave_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _days_requested NUMERIC(5, 1);
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    _days_requested := (NEW.end_date - NEW.start_date + 1);
    UPDATE public.leave_balances
    SET used_days = LEAST(total_days, used_days + _days_requested)
    WHERE employee_id = NEW.employee_id AND leave_type_id = NEW.leave_type_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_leave_request_approved
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_leave_approval();


-- 2. Payroll Table
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  basic NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (basic >= 0),
  hra NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (hra >= 0),
  allowances NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (allowances >= 0),
  deductions NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (deductions >= 0),
  net_pay NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (net_pay >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll TO authenticated;
GRANT ALL ON public.payroll TO service_role;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own payroll"
  ON public.payroll FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = payroll.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can manage payroll"
  ON public.payroll FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 3. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('id_proof', 'offer_letter', 'resume', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own documents"
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = documents.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Employees can upload their own documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = documents.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications (mark read)"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);


-- 5. Onboarding Tasks Table
CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_tasks TO authenticated;
GRANT ALL ON public.onboarding_tasks TO service_role;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their onboarding tasks"
  ON public.onboarding_tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = onboarding_tasks.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Employees can update their onboarding task status"
  ON public.onboarding_tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = onboarding_tasks.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = onboarding_tasks.employee_id
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can manage onboarding tasks"
  ON public.onboarding_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: Auto-generate default onboarding tasks when employee is created
CREATE OR REPLACE FUNCTION public.create_default_onboarding_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.onboarding_tasks (employee_id, task_name, is_complete)
  VALUES
    (NEW.id, 'Sign offer letter and employment agreement', false),
    (NEW.id, 'Submit identity proof & tax documents', false),
    (NEW.id, 'Complete IT & workspace software setup', false),
    (NEW.id, 'Attend HR policy and team introduction orientation', false);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employee_created_onboarding
  AFTER INSERT ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.create_default_onboarding_tasks();

