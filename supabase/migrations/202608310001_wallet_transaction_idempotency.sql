-- Prevent duplicate financial ledger entries when a provider retries a webhook.
create unique index if not exists wallet_transactions_reference_type_unique
  on public.wallet_transactions (reference_id, type)
  where reference_id is not null;

create or replace function public.credit_affiliate_commission(
  p_order_id uuid,
  p_referrer_id uuid,
  p_amount numeric,
  p_description text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet_id uuid;
  v_transaction_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Commission amount must be positive';
  end if;

  select id
    into v_wallet_id
    from public.wallets
   where user_id = p_referrer_id
   for update;

  if v_wallet_id is null then
    return false;
  end if;

  insert into public.wallet_transactions (
    wallet_id,
    user_id,
    amount,
    type,
    description,
    reference_id
  )
  values (
    v_wallet_id,
    p_referrer_id,
    p_amount,
    'affiliate_commission',
    p_description,
    p_order_id
  )
  on conflict (reference_id, type) where reference_id is not null do nothing
  returning id into v_transaction_id;

  if v_transaction_id is null then
    return false;
  end if;

  update public.wallets
     set balance = balance + p_amount,
         updated_at = now()
   where id = v_wallet_id;

  return true;
end;
$$;

revoke all on function public.credit_affiliate_commission(uuid, uuid, numeric, text) from public;
grant execute on function public.credit_affiliate_commission(uuid, uuid, numeric, text) to service_role;
