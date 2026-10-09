-- TruDoc Gold waitlist schema (Neon / Postgres 15+)

create extension if not exists pgcrypto;

create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone_e164 text not null check (phone_e164 ~ '^\+9715\d{8}$'),
  plan text not null check (plan in ('individual','family')),
  source text,                 -- utm_source
  utm jsonb,                   -- all captured utm_* params
  user_agent text,
  ip_hash text,                -- sha256(ip + IP_HASH_SALT), never the raw IP
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_phone_unique on waitlist_signups (phone_e164);

-- Fixed-window rate limit counters for POST /api/waitlist (5 requests / 10 min per IP hash).
create table if not exists waitlist_rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
create index if not exists waitlist_rate_limits_window on waitlist_rate_limits (window_start);
