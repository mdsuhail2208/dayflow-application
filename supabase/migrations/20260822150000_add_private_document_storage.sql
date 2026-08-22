INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Employees can view their document files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'employee-documents'
    AND EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id::text = (storage.foldername(name))[1]
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Employees can upload their document files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'employee-documents'
    AND EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id::text = (storage.foldername(name))[1]
        AND (employees.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );