# TruDoc Gold — Waitlist

Production build of the TruDoc Gold waitlist landing page. It's a single-route Next.js app, backed by Neon Postgres, that matches two prototypes:
- `TruDoc Gold Waitlist.dc.html` below 768px (mobile)
- `TruDoc Gold Waitlist Web.dc.html` from 768px (tablet and desktop)

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · zod · `@neondatabase/serverless` · Playwright
- **Screens:** the landing, form and success screen all live on `/`. The URL stays in sync (`?join=1` for the form, `?join=success` after submitting), so browser Back and Forward work and `/?join=1` deep-links to the form. A direct visit to `?join=success` redirects to `/`.
- **Mobile (< 768px):** the form is a full-screen sheet that expands out of the sticky CTA.
- **Desktop/tablet (≥ 768px):** the form opens in a modal that animates out of the floating CTA bar. The modal has a focus trap, scroll lock, and closes on Esc, the backdrop or ×.
- **Breakpoints:** `md` is 768px; `quad` (1000px) gives 4 condition columns; `duo` (1001px) gives the two-column hero; `split` (1101px) gives the Biomarkers/FAQ 5fr/7fr split. They're defined in `app/globals.css`.
- See [`READBACK.md`](READBACK.md) for the section/copy inventory and every decision made where the brief, the prototype and the Figma audit disagreed.

## Local setup

```bash
npm install
cp .env.example .env.local   # then edit, or just set WAITLIST_DB=memory
npm run dev
```

`WAITLIST_DB=memory` swaps Postgres for an in-memory store, so you can run the whole flow without a database. Signups are lost when the server restarts.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | prod | Neon pooled connection string |
| `IP_HASH_SALT` | prod | Secret salt; IPs are stored only as `sha256(ip + salt)`. Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | recommended | Absolute base URL for meta/OG tags |
| `WAITLIST_DB` | dev/test | `memory` to use the in-memory store |

No credentials ever reach the client. All writes go through `POST /api/waitlist`.

## Database

The schema lives in [`lib/schema.ts`](lib/schema.ts). It contains `waitlist_signups` (unique on `phone_e164`) and `waitlist_rate_limits`, and every statement is idempotent. **The app applies it automatically** on the first database query after a cold start, so a new Neon database needs no manual step.

To prepare a database ahead of time:

```bash
DATABASE_URL=postgres://… npm run db:migrate
```

## API — `POST /api/waitlist`

Body: `{ name, phone, plan: 'individual' | 'family', utm?, company?, t? }`

| Case | Response |
| --- | --- |
| New signup | `200 { ok: true }` |
| Phone already on the list | `200 { ok: true, duplicate: true }`. The UI shows the normal success screen |
| Invalid input (same rules as the form, via zod) | `400 { ok: false, error: 'invalid_input' }` |
| More than 5 requests in 10 min from one IP hash | `429 { ok: false, error: 'rate_limited' }` |
| Honeypot `company` filled, or `t` (ms since the form opened) < 1500 | `200 { ok: true }`, nothing stored |
| DB or other failure | `500 { ok: false, error: 'server_error' }` |

The phone number is normalised to E.164 `+9715XXXXXXXX`. UTM params on the landing URL are kept in `sessionStorage` and sent with the signup (`source` = `utm_source`, and every `utm_*` value goes in `utm` jsonb). Rate limiting is a fixed-window counter in Postgres, so it needs no extra service.

The client applies a 10s timeout and shows the inline error on any non-2xx response, network failure or timeout.

## Tests

```bash
npm run test:e2e        # builds, starts on :3200 with WAITLIST_DB=memory, runs Playwright
```

The suite has 69 tests. Mobile coverage:
- the biomarker accordion (single-open, Heart open by default) and the FAQ (index 3 open by default)
- every validation message, focus on the first invalid field, and blur-only errors
- phone normalisation, as unit tests and through the UI
- the success screen, duplicate submissions, the server-error state and retry, the loading state and the double-submit guard
- refresh restore and the `?join=success` redirect
- expand-from-CTA, and collapse via the Back button and via browser Back (with scroll restored)
- browser Forward and the intro reveal
- the reduced-motion path
- no horizontal overflow at 320–480px
- the API's validation, honeypot, timing check and rate limit
- a visual snapshot guarding the mobile layout (`tests/landing.spec.ts-snapshots/`); after an intentional mobile change, refresh it with `npx playwright test -g snapshot --update-snapshots`

Desktop coverage (`tests/desktop.spec.ts`, 1440px):
- opening the modal (FLIP from the CTA), and closing it via ×, backdrop, Esc and browser Back
- focus return, focus trap, scroll lock and the double-click guard
- success inside the modal, with a reset on close; validation and server errors inside the modal
- the deep link, staying centred on resize, the collapse breakpoints and the sticky Biomarkers heading
- the doctors scroller's snap and keyboard scrolling
- no overflow from 768 to 1440px, and the reduced-motion path

First run only: `npx playwright install chromium`.

## Deploy (Vercel)

1. Add Neon through the Vercel ↔ Neon integration (Storage → Neon). It sets `DATABASE_URL` for you. The tables are created automatically on the first request.
2. Set `IP_HASH_SALT`, for example: `openssl rand -hex 32 | npx vercel env add IP_HASH_SALT production --sensitive`.
3. Import the repo in Vercel. Set `DATABASE_URL`, `IP_HASH_SALT` and `NEXT_PUBLIC_SITE_URL` for Production and Preview.
4. Deploy. No other config is needed: the API route runs on the Node runtime by default, and the landing is statically prerendered.

Vercel sets `x-forwarded-for` to the real client IP. That header is what the rate limiter keys on.

## Project map

```
app/
  layout.tsx            font (self-hosted Figtree), metadata, intro pre-paint script
  page.tsx              renders <WaitlistApp/>
  globals.css           tokens, base, keyframes, reveal + reduced-motion rules
  api/waitlist/route.ts signup endpoint
components/
  WaitlistApp.tsx       screen state, ?join= history sync, persistence, mobile sheet vs desktop modal
  WaitlistForm.tsx      form, validation display, submit (variant: screen | modal)
  WaitlistModal.tsx     desktop dialog: portal, FLIP, focus trap, scroll lock, Esc
  Success.tsx
  landing/*             TopBar, Hero, HowItWorks, Biomarkers, Conditions, Doctors, Pricing, Faq, Footer, StickyCta/FloatingCta
                        (responsive classes; Hero, Conditions and Footer have separate mobile/desktop subtrees)
lib/
  content.ts            every copy string and data list from the prototype
  validation.ts         shared client/server rules + zod schema
  db.ts                 WaitlistDb interface: Neon + in-memory implementations
lib/schema.ts           DB schema (auto-applied)
tests/                  Playwright
```
