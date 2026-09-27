-- Comprovante do Pix enviado pelo comprador na página do pedido.
-- O arquivo fica no bucket privado (chave comprovantes/<uuid>); aqui só o endereço.
-- Pedido com comprovante enviado não expira: aguarda a conferência no painel.

alter table public.raffle_orders
  add column if not exists receipt_key text,
  add column if not exists receipt_type text,
  add column if not exists receipt_uploaded_at timestamptz;

create index if not exists raffle_orders_receipt_idx on public.raffle_orders (receipt_uploaded_at desc) where receipt_key is not null;

create or replace function public.raffle_expire_pending(p_expire_hours integer)
returns integer
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  expired integer;
begin
  with stale as (
    update public.raffle_orders
    set status = 'expirado'
    where status = 'pendente'
      and receipt_key is null
      and created_at < now() - make_interval(hours => greatest(p_expire_hours, 1))
    returning id
  )
  delete from public.raffle_numbers where order_id in (select id from stale);
  get diagnostics expired = row_count;
  return expired;
end;
$$;
