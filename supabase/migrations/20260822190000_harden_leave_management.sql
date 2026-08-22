-- Enforce leave rules at the database boundary as well as in the UI.
CREATE OR REPLACE FUNCTION public.validate_leave_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _days_requested NUMERIC(5, 1);
  _total_days NUMERIC(5, 1);
  _used_days NUMERIC(5, 1);
BEGIN
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'Leave end date cannot be earlier than start date';
  END IF;

  _days_requested := NEW.end_date - NEW.start_date + 1;

  IF NEW.status <> 'rejected' AND EXISTS (
    SELECT 1
    FROM public.leave_requests AS existing
    WHERE existing.employee_id = NEW.employee_id
      AND existing.id <> NEW.id
      AND existing.status <> 'rejected'
      AND NEW.start_date <= existing.end_date
      AND NEW.end_date >= existing.start_date
  ) THEN
    RAISE EXCEPTION 'Leave dates overlap an existing request';
  END IF;

  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status <> 'approved') THEN
    SELECT total_days, used_days
    INTO _total_days, _used_days
    FROM public.leave_balances
    WHERE employee_id = NEW.employee_id AND leave_type_id = NEW.leave_type_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No leave balance exists for this leave type';
    END IF;

    IF _used_days + _days_requested > _total_days THEN
      RAISE EXCEPTION 'Approved leave exceeds the available balance';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_leave_request_before_write ON public.leave_requests;
CREATE TRIGGER validate_leave_request_before_write
  BEFORE INSERT OR UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_leave_request();

-- Employees can submit requests, but only admins can change their status or comments.
DROP POLICY IF EXISTS "Admins can update leave requests" ON public.leave_requests;
CREATE POLICY "Admins can update leave requests"
  ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));