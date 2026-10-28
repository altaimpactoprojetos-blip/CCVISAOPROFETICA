-- Lembrete do evento: guarda quando o e-mail de lembrete saiu para cada inscrição,
-- para que o painel não envie duas vezes para a mesma pessoa.
alter table public.submissions add column if not exists reminder_sent_at text;
