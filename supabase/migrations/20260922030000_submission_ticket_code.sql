-- Código público do comprovante de inscrição (QR code).
alter table public.submissions add column if not exists ticket_code text;
create unique index if not exists submissions_ticket_code_idx on public.submissions (ticket_code) where ticket_code is not null;
