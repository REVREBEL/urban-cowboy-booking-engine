# Urban Cowboy — Custom Booking Engine

Custom booking engine built on top of the **Mews Booking Engine API** for **Urban Cowboy** in Catskills.

Static frontend built with **Vite + React + TypeScript + Tailwind**, with a **Cloudflare Worker** server proxy using Static Assets, and continuous deployment via **GitHub → Cloudflare Workers Builds**.

Six-step booking journey with data pulled 100% live from Mews.

---

## ✨ User Journey

1. **Dates + guests** → availability search.
2. **Availability grouped by room type**: “from” pricing cards with **Select** or **View details**
   (**side drawer** sliding in from the right, with photos + description + amenities + rate list, “Best price” badge, struck-through pricing, and exact price confirmation via `reservations/getPricing`).
3. **Upsells**: inline suggestion on the results screen **plus** a dedicated Extras step using Mews products with a recalculated total.
4. **Guest information**: primary guest and validations.
5. **Additional extras**.
6. **Payment**: Path A, using a Mews-hosted Payment Request + 3-D Secure → **reservation created in Mews** → **confirmation**
   with payment verification via `reservationGroups/get` and a **Resume payment** button.

State including dates, guests, selection, and reservation group number is stored in the **URL** (`searchParams`) plus React Context.

This allows shareable links and robust payment-return handling without a database.

### Experience & Conversion, Airbnb Style

- **Standalone engine**: no hero section. Clean search screen with Destination · Dates · Guests · Search.
- **Airbnb-style date range calendar** (`DateRangePicker`): two-month popover, start → end selection, highlighted range + hover preview, with past dates disabled.
- **Side detail drawer** (`RoomDetailDrawer`) sliding in from the right with scrim, Escape support, and animated slide transition rather than a popup modal.
- **Conversion levers**: rating & reviews, “Guest Favorite,” scarcity messaging such as “Only N left,” high demand, number of people viewing, struck-through prices & savings percentage, free cancellation, secure payment, and a payment hold timer.
- **Dev Panel** (`</> API`, bottom left): live log of every `/api/mews/*` request showing **status, duration, request body, response summary, and an explanation of why the call was made**. Full transparency into communication with Mews.
- Editorial typography using **Fraunces** for serif display type + **Manrope** for body copy, tropical palette, micro-animations including slide/scale/fade, touch targets ≥ 44 px, and visible focus states.

---

## 🧱 Architecture

```text
Browser ──(/api/mews/*, same origin)──▶ Cloudflare Worker ──(Client injected)──▶ Mews Distributor API
 static frontend (dist/, ASSETS binding)     worker/index.ts → worker/mews/*          api.mews.com
```

A **single Worker** (`worker/index.ts`):

- routes `/api/mews/*` to proxy handlers (`worker/mews/*`)
- serves the built frontend through the **Static Assets** binding (`dist/`), with SPA fallback
  (`not_found_handling = "single-page-application"`) for client-side routes such as `/confirmation`

**Why this model instead of direct browser requests?**

- The Mews `Client` and IDs (`HotelId` / `ConfigId` / age categories) remain **server-side** and never enter the frontend bundle.
- **No CORS issues**: the browser only calls `/api/mews/*` on the same origin as the frontend.
- Centralized 12-second timeout handling, errors, payment verification, and **response curation**
  such as reducing a raw `getPricing` response of approximately 380 KB to roughly 1 KB of EUR-specific data, and reducing reservations to lightweight JSON.
- One repository, one deployment (`wrangler deploy`), compatible with **Cloudflare Workers Builds** through Git.

---

## 🚀 Local Development

```bash
npm install
cp .dev.vars.example .dev.vars   # local secrets (gitignored)
npm run dev                      # frontend (Vite :5173) + Worker (wrangler :8787)
```

Open **http://localhost:5173**.

Vite serves the frontend with HMR and **proxies `/api/*`** to the **Worker**
(`wrangler dev`, port 8787), which reads `.dev.vars`.

From the browser's perspective, everything is served from the same origin (`:5173`).

> `npm run dev` first runs a `vite build` because the `wrangler dev` ASSETS binding requires `dist/`, then
> `concurrently` runs `wrangler dev` for the Worker on port 8787 **and** `vite` for HMR on port 5173.
> In production, the Worker serves both the frontend and `/api/*` from the same origin.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Build frontend + Worker (`wrangler dev`, :8787) + Vite (HMR, :5173), with `/api` proxied. |
| `npm run build` | Static frontend build → `dist/`. |
| `npm run preview` | Build then run `wrangler dev` (:8787), testing the Worker, frontend, and `/api` from a single origin just like production. |
| `npm run deploy` | Build then `wrangler deploy`, manually deploying the Worker + assets. |
| `npm run typecheck` | Run `tsc --noEmit` against `src/`. |

---

## 🔑 Environment Variables

| Variable | Purpose | Secret? | Local | Production |
| --- | --- | --- | --- | --- |
| `MEWS_BASE_URL` | Mews API base (`https://api.mews.com`) | no | `.dev.vars` | `wrangler.toml [vars]` or dashboard |
| `MEWS_APP_BASE_URL` | Mews app base URL for the payment page | no | `.dev.vars` | same |
| `MEWS_CLIENT` | Booking Engine API `Client` string | **YES** | `.dev.vars` | **Secret** in Worker dashboard |
| `MEWS_HOTEL_ID` | Property UUID | no | `.dev.vars` | `wrangler.toml [vars]` or dashboard |
| `MEWS_CONFIG_ID` | Configuration UUID | no | `.dev.vars` | same |
| `MEWS_ADULT_AGE_CATEGORY_ID` | “Adult” age category | no | `.dev.vars` | same, with built-in enterprise fallback |
| `MEWS_CHILD_AGE_CATEGORY_ID` | “Child” age category | no | `.dev.vars` | same |
| `WEBHOOK_URL` | URL notified for `payment.initiated` / `reservation.paid`; see [Webhooks](#-webhooks) | no¹ | `.dev.vars` | `wrangler.toml [vars]` or dashboard |

> ¹ Not considered secret by Mews itself, but if the URL contains a token, it should instead be stored as a **Secret** in Cloudflare.

Only safe Mews demo values are stored in [`wrangler.toml`](./wrangler.toml). Production identifiers and integrations must be supplied explicitly in the deployment environment.

The `Client` and IDs **never** reach the frontend because no `VITE_*` variables are used.

### 🔑 Client String

`MEWS_CLIENT = ‹Mews Client string — secret›`

This is a string **activated by Mews** for the Urban Cowboy enterprise and verified to return **200 OK**.

Configure it as a Cloudflare **secret**:

1. Cloudflare Dashboard → your Worker → **Settings → Variables and Secrets**.
2. Add or modify the **secret** `MEWS_CLIENT` = `‹Mews Client string — secret›`. **No code changes required.**
3. Redeploy, or select **Retry deployment**.

Using the CLI:

```bash
npx wrangler secret put MEWS_CLIENT
```

---

## ☁️ GitHub → Cloudflare Workers Builds Deployment

The project uses the **Worker + Static Assets** model.

`npm run build` produces the frontend (`dist/`), then `wrangler deploy` publishes the Worker (`worker/index.ts`) **and** uploads `dist/` as static assets.

1. Push to GitHub, already completed.
2. Cloudflare Dashboard → **Workers & Pages → Create → Workers → Import a repository** → select the repository.
3. Configure **Build & deploy settings**:
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
   - **Non-production branch deploy command**: `npx wrangler versions upload`, providing preview URLs for PRs
   - **API token**: leave blank because Cloudflare creates one
4. Under **Variables and Secrets**, add `MEWS_CLIENT` as a **Secret**. Other variables come from `wrangler.toml [vars]`.
5. **Deploy**. Afterward:
   - push to `main` = automatic **production**
   - each **PR** = preview version with its own URL
6. **Domain**: Worker → **Settings → Domains & Routes** → `hotel's reservation email address`, with DNS managed by Cloudflare.

**Manual deployment via CLI:**

```bash
npm run build && npx wrangler deploy
# secret: npx wrangler secret put MEWS_CLIENT
```

> ℹ️ This project does **not** use the “Pages Functions” model (`functions/`).
> It uses **Workers + Static Assets**: one Worker routes `/api/*` and serves the frontend.
> This is the default workflow offered by the current Cloudflare dashboard under “Workers Builds,” using `wrangler deploy`.

---

## 💳 Payment

### Path A — Payment Request, Implemented MVP

1. `reservationGroups/create` is called **without** `CreditCardData`.

   For a `RateGroup` configured as `Automatic / ChargeCreditCard`, Mews returns a `PaymentRequestId`.

2. The Function constructs the Mews-hosted payment URL server-side:

```text
${MEWS_APP_BASE_URL}/navigator/payment-requests/detail/{PaymentRequestId}?returnUrl={base64}
```

where `returnUrl` is the Base64 representation of:

```text
${origin}/confirmation?rgid={groupId}
```

3. The frontend redirects the guest to the Mews-hosted card page + 3-D Secure.

4. When the guest returns, `Confirmation` calls `/api/mews/reservation-status` using `reservationGroups/get` and continues polling until the payment is either `Completed` / `Charged` or reaches a final failed state.

A **Resume payment** button uses `/api/mews/payment-link`.

If the selected rate uses **`Manual` settlement**, meaning no `PaymentRequestId` is returned, the reservation is still created and the confirmation screen displays **“payment on arrival.”**

### Path B — PCI Proxy Secure Fields, V2, Not Implemented

Integrated payment through Datatrans Secure Fields using:

```text
merchantId = PaymentGateway.PublicKey
```

from `hotels/get`.

In **production**, the payment gateway is configured for `PciProxy`, Visa, MasterCard, Apple Pay, and Google Pay, meaning Path B can be connected in V2.

Sandbox:

```text
https://pay.sandbox.datatrans.com/...
```

Production: remove `sandbox.`.

---

## 🔔 Webhooks

The Worker can notify an **external URL** (`WEBHOOK_URL`) at two points.

This is optional. If the variable is not defined, nothing is sent and the reservation is unaffected.

Each notification is an `application/json` `POST` sent **in the background** using `ctx.waitUntil`.

A slow or failed webhook therefore **never blocks or breaks** the reservation.

| Event | Trigger | Reliability |
| --- | --- | --- |
| `payment.initiated` | `reservationGroups/create` returns a `PaymentRequestId` for an automatically settled rate | **Server-side** and reliable for every payment initiated. |
| `reservation.paid` | After returning to `/confirmation`, the frontend checks status and payment has been captured as `Charged` / `Completed` | Depends on the **guest returning** to the page. |

Common payload:

```text
{ event, timestamp (ISO), ... }
```

```jsonc
// payment.initiated
{
  "event": "payment.initiated",
  "timestamp": "2026-07-22T09:25:51.931Z",
  "reservationGroupId": "abc3…",
  "paymentRequestId": "268e…",
  "paymentUrl": "https://app.mews.com/navigator/payment-requests/detail/268e…?returnUrl=…",
  "customer": { "email": "…", "firstName": "…", "lastName": "…" },
  "totalAmount": { "currency": "EUR", "gross": 2465.85, "net": 2465.85 },
  "reservations": [
    {
      "number": "8017",
      "roomCategoryId": "256f…",
      "rateId": "e835…",
      "startUtc": "2026-09-15T12:00:00Z",
      "endUtc": "2026-09-18T10:00:00Z",
      "adultCount": 2,
      "childCount": 0
    }
  ]
}

// reservation.paid
{
  "event": "reservation.paid",
  "timestamp": "…",
  "reservationGroupId": "abc3…",
  "confirmationNumbers": ["8017"],
  "payments": [
    { "id": "…", "state": "Charged" }
  ]
}
```

**⚠️ Deduplication is required.**

`reservation.paid` is sent **from the frontend**, meaning it can be repeated if the guest reloads or revisits `/confirmation`.

The receiving system **must deduplicate using `reservationGroupId`**.

For a guaranteed, 100% server-side source of “paid” events, connect a **Mews Connector webhook** such as `PaymentUpdated` / `ServiceOrderUpdated` on the PMS side instead.

That approach complements this lightweight mechanism.

**Configuration**

- **Local**: set `WEBHOOK_URL=https://…` in `.dev.vars`.
- **Cloudflare**: Worker → **Settings → Variables and Secrets** → add `WEBHOOK_URL` as a Variable, or as a **Secret** if the URL contains a token, then redeploy.

A service such as [webhook.site](https://webhook.site) can be used to test receipt in one click.

---

## 🏭 Production

Production is intentionally unconfigured. The checked-in Worker and `.dev.vars.example` use Mews demo identifiers, disable funnel tracking, and contain no inherited property account IDs.

Before a production deployment, provision project-owned values for the Mews API hosts, client secret, hotel/configuration/age-category IDs, reception details, optional transfer URL, analytics webhook, and Supabase project. Keep secrets in Cloudflare or local `.dev.vars`, never in the repository.

- **Homepage visuals**: `src/lib/assets.ts` currently contains placeholders from hotelwebsite.com and can be replaced with final assets.
- Verify that `dist/` contains **no secrets**.

---

## 📁 Structure

```text
worker/
  index.ts                 # Worker entry: route /api/mews/* + serve frontend (ASSETS binding) + SPA fallback
  mews/                    # Server proxy: one file = one /api/mews/* route
    _lib.ts                #   mews() helper (Client injection + 12s timeout), validations,
                           #   occupancyData(), notify() (webhooks)
    hotel.ts               #   hotels/get                  (5 min cache)
    availability.ts        #   hotels/getAvailability
    pricing.ts             #   reservations/getPricing     (curated EUR-only)
    reservation.ts         #   reservationGroups/create    (whitelist + Path A paymentUrl
                           #                                + payment.initiated webhook)
    reservation-status.ts  #   reservationGroups/get       (curated payment status
                           #                                + reservation.paid webhook)
    payment-link.ts        #   reconstructs the payment URL for a pending PaymentRequest
    voucher.ts             #   vouchers/validate

src/
  lib/        api.ts       (single network boundary),
              shaping.ts   (buildRooms, min-price, deduplication),
              format.ts    (locale/EUR/nights/imgUrl),
              assets.ts,
              apiLog.ts    (log → Dev Panel)

  state/      booking.tsx  (Context + URL encoding + hotel config + totals)

  types/      mews.ts

  components/ Brand,
              StepProgress,
              DateRangePicker,
              RoomCard,
              RoomDetailDrawer,
              UpsellCard,
              BookingSummary,
              StepLayout,
              DataBadge,
              DevPanel,
              conversion,
              Photo,
              icons

  steps/      Dates        (standalone search),
              Results,
              Guest,
              Extras,
              Payment,
              Confirmation

  App.tsx     step machine + header + footer + Dev Panel

wrangler.toml (main + [assets] + [vars])
.dev.vars(.example)
.node-version
```

**Security**: every handler reconstructs the Mews request object using **whitelisted fields** rather than forwarding the raw request body, injects IDs from `env`, and exposes no broad CORS policy.

---

## 🧪 Verifying Created Reservations

Mews back office:

**https://app.mews.com**

Use the Urban Cowboy property account.

Reservations created by the booking engine appear there, with the confirmation number displayed on the final booking screen.

⚠️ In production, these are **real reservations**.

---

## 🔀 Variants, Not Implemented

- **Webflow embed**: host the engine at `reservation.hoteldomain.com` using the Cloudflare Worker, then point the Webflow site's **Book** buttons to it, or embed it in an `<iframe>`.

  The Mews proxy remains in the Worker.

- **Pages Functions**: alternative architecture using a `functions/` directory and `wrangler pages deploy` if the account still exposes the Pages workflow.

  This project instead uses **Workers + Static Assets**, the current dashboard's default flow.

- **Reservation logging, V2**: bind a **KV** namespace or **D1** database in `wrangler.toml` and write the `reservationGroupId` + booking summary after confirmation.

  The extension point is already planned, but the MVP does not use a database.

---

## ⚠️ Gotchas, Verified Live

1. **401 Client**: the `Client` must be a Mews-activated string (`‹Mews Client string — secret›`). Configure it through an environment variable / secret and never expose it in the frontend.

2. **CORS**: resolved by the architecture because the frontend calls same-origin `/api/mews/*`.

3. **Null prices**: some combinations return `GrossValue: null`. These are ignored by `buildRooms`.

4. **Dates**: always use `...T00:00:00Z`. Mews then normalizes them to the property's actual check-in and check-out times.

5. **Age categories**: these are absent from `hotels/get`, so they are provided by environment variables with a demo fallback and must be replaced for production.

6. **Payment**: a `PaymentRequestId` is only returned when the `RateGroup` uses automatic settlement. Otherwise the booking uses “payment on arrival.”

7. **`returnUrl`**: Base64 encoding of an absolute URL, constructed server-side.

8. **Secrets**: `.dev.vars` is gitignored. In production, `MEWS_CLIENT` is stored as a **Secret** in the Worker dashboard, and `dist/` must contain no secrets.
