# Booking Engine Analytics — Supabase + n8n

Pipeline: **frontend → `/api/mews/track` (Worker) → n8n (`WEBHOOK_EVENTS`) → Supabase**.

The frontend pushes an event at **each step** of the funnel + at payment milestones.
Everything passes through **a single** n8n webhook (for logging purposes), which inserts into Supabase.

## Sent Events

| `status` | When |
| --- | --- |
| `etape` | At each step reached (the `step` field specifies which: `dates`, `results`, `guest`, `upgrade`, `extras`, `payment`, `confirmation`) |
| `paiement_initie` | Click on "Pay" (reservation created + Mews payment request) |
| `paiement_valide` | Payment collected (confirmed by Mews) |

> **Abandoned cart** = no `paiement_valide`. **Unsuccessful payment** = `paiement_initie` without `paiement_valide`. (Derived on the Supabase side, no dedicated event.)

### Payload (example)

```json
{
  "event": "cart.etape",
  "status": "etape",
  "timestamp": "2026-08-04T10:12:00.000Z",
  "cartId": "c_ab12…",
  "step": "guest",
  "stay": { "checkIn": "2026-10-12", "checkOut": "2026-10-15", "nights": 3, "adults": 2, "children": 0 },
  "room": { "categoryId": "…", "name": "Bungalow Découverte" },
  "rate": { "rateId": "…", "name": "Non remboursable", "totalGross": 519.6 },
  "products": [{ "id": "…", "name": "Petit déjeuner", "priceEur": 12 }],
  "airportTransfer": true,
  "totals": { "room": 519.6, "products": 0, "grand": 519.6, "currency": "EUR" },
  "customer": { "firstName": "Marie", "lastName": "Martin", "email": "…", "telephone": "+336…", "nationalityCode": "FR" },
  "reservationGroupId": null,
  "paymentRequestId": null,
  "lang": "fr",
  "utm": { "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "ete", "gclid": "…" }
}

```

---

## 1) Supabase — SQL to paste (SQL Editor)

Two tables: `booking_events` (append-only log) and `carts` (current state, 1 row/cart).
A **trigger** updates `carts` on every insert → **n8n only needs to insert into `booking_events**`.

```sql
-- Append-only log: one event per step/payment.
create table if not exists public.booking_events (
  id          bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  event_at    timestamptz,
  cart_id     text not null,
  status      text not null,   -- etape | paiement_initie | paiement_valide
  step        text,            -- dates|results|guest|upgrade|extras|payment|confirmation
  payload     jsonb not null
);
create index if not exists booking_events_cart_idx     on public.booking_events (cart_id);
create index if not exists booking_events_status_idx   on public.booking_events (status);
create index if not exists booking_events_step_idx      on public.booking_events (step);
create index if not exists booking_events_received_idx  on public.booking_events (received_at desc);

-- Current state per cart (dashboard table).
create table if not exists public.carts (
  cart_id              text primary key,
  first_seen           timestamptz not null,
  last_seen            timestamptz not null,
  last_step            text,
  last_status          text,
  payment_initiated    boolean not null default false,
  paid                 boolean not null default false,
  lang                 text,
  utm_source text, utm_medium text, utm_campaign text, utm_term text, utm_content text, gclid text, fbclid text,
  check_in date, check_out date, nights int, adults int, children int,
  room_name text, rate_name text, total_grand numeric, currency text,
  customer_email text, customer_name text, customer_phone text, customer_nationality text,
  reservation_group_id text, payment_request_id text,
  airport_transfer boolean not null default false,   -- extra OUTSIDE Mews: retargeting target
  payload jsonb
);
create index if not exists carts_last_seen_idx on public.carts (last_seen desc);
create index if not exists carts_status_idx     on public.carts (last_status);
create index if not exists carts_utm_idx         on public.carts (utm_source);

-- Trigger: aggregates each event into carts (upsert).
create or replace function public.sync_cart_from_event()
returns trigger language plpgsql as $$
declare
  p jsonb := new.payload;
  ts timestamptz := coalesce(new.event_at, new.received_at);
begin
  insert into public.carts as c (
    cart_id, first_seen, last_seen, last_step, last_status, payment_initiated, paid, lang,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid,
    check_in, check_out, nights, adults, children,
    room_name, rate_name, total_grand, currency,
    customer_email, customer_name, customer_phone, customer_nationality,
    reservation_group_id, payment_request_id, airport_transfer, payload
  ) values (
    new.cart_id, ts, ts, new.step, new.status,
    new.status = 'paiement_initie', new.status = 'paiement_valide', p->>'lang',
    p->'utm'->>'utm_source', p->'utm'->>'utm_medium', p->'utm'->>'utm_campaign',
    p->'utm'->>'utm_term', p->'utm'->>'utm_content', p->'utm'->>'gclid', p->'utm'->>'fbclid',
    nullif(p->'stay'->>'checkIn','')::date, nullif(p->'stay'->>'checkOut','')::date,
    nullif(p->'stay'->>'nights','')::int, nullif(p->'stay'->>'adults','')::int, nullif(p->'stay'->>'children','')::int,
    p->'room'->>'name', p->'rate'->>'name',
    nullif(p->'totals'->>'grand','')::numeric, p->'totals'->>'currency',
    p->'customer'->>'email',
    nullif(trim(concat(p->'customer'->>'firstName',' ',p->'customer'->>'lastName')),''),
    p->'customer'->>'telephone', p->'customer'->>'nationalityCode',
    nullif(p->>'reservationGroupId',''), nullif(p->>'paymentRequestId',''),
    coalesce((p->>'airportTransfer')::boolean, false), p
  )
  on conflict (cart_id) do update set
    last_seen            = greatest(c.last_seen, excluded.last_seen),
    last_step            = excluded.last_step,
    last_status          = excluded.last_status,
    payment_initiated    = c.payment_initiated or excluded.payment_initiated,
    paid                 = c.paid or excluded.paid,
    lang                 = coalesce(excluded.lang, c.lang),
    utm_source           = coalesce(c.utm_source, excluded.utm_source),   -- keeps the 1st source (attribution)
    utm_medium           = coalesce(c.utm_medium, excluded.utm_medium),
    utm_campaign         = coalesce(c.utm_campaign, excluded.utm_campaign),
    utm_term             = coalesce(c.utm_term, excluded.utm_term),
    utm_content          = coalesce(c.utm_content, excluded.utm_content),
    gclid                = coalesce(c.gclid, excluded.gclid),
    fbclid               = coalesce(c.fbclid, excluded.fbclid),
    check_in             = coalesce(excluded.check_in, c.check_in),
    check_out            = coalesce(excluded.check_out, c.check_out),
    nights               = coalesce(excluded.nights, c.nights),
    adults               = coalesce(excluded.adults, c.adults),
    children             = coalesce(excluded.children, c.children),
    room_name            = coalesce(excluded.room_name, c.room_name),
    rate_name            = coalesce(excluded.rate_name, c.rate_name),
    total_grand          = coalesce(excluded.total_grand, c.total_grand),
    currency             = coalesce(excluded.currency, c.currency),
    customer_email       = coalesce(excluded.customer_email, c.customer_email),
    customer_name        = coalesce(excluded.customer_name, c.customer_name),
    customer_phone       = coalesce(excluded.customer_phone, c.customer_phone),
    customer_nationality = coalesce(excluded.customer_nationality, c.customer_nationality),
    reservation_group_id = coalesce(excluded.reservation_group_id, c.reservation_group_id),
    payment_request_id   = coalesce(excluded.payment_request_id, c.payment_request_id),
    airport_transfer     = excluded.airport_transfer,   -- last known choice (checked / unchecked)
    payload              = excluded.payload;
  return new;
end $$;

drop trigger if exists trg_sync_cart on public.booking_events;
create trigger trg_sync_cart after insert on public.booking_events
for each row execute function public.sync_cart_from_event();

-- Security: RLS enabled, no public policy → only service_role (n8n) writes/reads.
alter table public.booking_events enable row level security;
alter table public.carts          enable row level security;

```

Then retrieve (Settings → API): **Project URL** + **`service_role`** key (secret — for n8n only).

---

## 2) n8n — Workflow "Urban Cowboy — Booking Events"

1. **Webhook** (node): `POST` method, path e.g. `booking-events`. Copy the **Production URL** → this is what goes into `WEBHOOK_EVENTS`.
2. **Supabase** (node) → **Insert** operation, table `booking_events`. Map (the body usually arrives under `{{$json.body}}` — check what n8n displays):
* `cart_id`  ← `{{ $json.body.cartId }}`
* `status`   ← `{{ $json.body.status }}`
* `step`     ← `{{ $json.body.step }}`
* `event_at` ← `{{ $json.body.timestamp }}`
* `payload`  ← `{{ $json.body }}`  *(the full object as jsonb)*


> No need to touch `carts`: the Postgres trigger handles it.


3. **Activate** the workflow. The **Executions** tab = your logs (each hit = one execution).
4. **Supabase credentials** in n8n: Host = Project URL, Service Role Secret = `service_role` key.

---

## 3) Next steps (deployment side)

* Provide me with the **Production URL** of the n8n webhook → I will put it in `WEBHOOK_EVENTS` (`wrangler.toml` or Cloudflare Secret) and deploy.
* As long as `WEBHOOK_EVENTS` is empty, tracking is a **no-op** (no errors generated).

---

## Ready-to-use queries (for the future dashboard)

```sql
-- Abandoned carts (inactive > 30 min, unpaid, stopped mid-funnel)
select cart_id, last_step, last_seen, customer_email, room_name, total_grand, utm_source
from carts
where not paid and last_status = 'etape' and last_seen < now() - interval '30 minutes'
order by last_seen desc;

-- Unsuccessful payments (payment initiated but never validated)
select cart_id, last_seen, customer_email, room_name, total_grand, payment_request_id, utm_source
from carts
where payment_initiated and not paid
order by last_seen desc;

-- Sources: sessions vs conversions by utm_source
select coalesce(utm_source,'(direct)') as source,
       count(*)                        as carts,
       count(*) filter (where paid)    as conversions,
       round(100.0 * count(*) filter (where paid) / nullif(count(*),0), 1) as rate_pct
from carts group by 1 order by carts desc;

-- Funnel: number of distinct carts reaching each step
select step, count(distinct cart_id) as carts
from booking_events where status = 'etape'
group by step
order by array_position(array['dates','results','guest','upgrade','extras','payment','confirmation'], step);

```
