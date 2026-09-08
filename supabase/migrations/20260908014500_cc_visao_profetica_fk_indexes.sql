create index if not exists admin_sessions_admin_id_idx on public.admin_sessions (admin_id);
create index if not exists course_progress_course_id_idx on public.course_progress (course_id);
create index if not exists course_progress_lesson_id_idx on public.course_progress (lesson_id);
