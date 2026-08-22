ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS audit_note TEXT,
  ADD COLUMN IF NOT EXISTS overridden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

GRANT SELECT, INSERT, UPDATE ON public.attendance TO authenticated;