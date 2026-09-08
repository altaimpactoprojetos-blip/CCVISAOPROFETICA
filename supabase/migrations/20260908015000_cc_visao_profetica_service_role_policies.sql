do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_roles','content_items','programs','cells','courses','course_modules',
    'lessons','course_progress','events','galleries','ministries','gallery_photos',
    'submissions','media_assets','admin_credentials','admin_sessions','admin_login_attempts'
  ] loop
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      table_name || '_service_role_policy',
      table_name
    );
  end loop;
end $$;
