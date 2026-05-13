# Nimbus

> **When rain fails, Nimbus pays.**

Parametric drought insurance for Africa's smallholder farmers, built on
Stellar, Trustless Work, and Open-Meteo. Submitted to the **Boundless ×
Trustless Work** hackathon, 13–16 May 2026.

---

## The idea

A smallholder farmer in Kano enrols her sorghum field with a phone number and
a GPS pin. Every morning at 06:00 UTC, an oracle pulls cumulative seasonal
rainfall for her exact coordinates from Open-Meteo. If that figure stays
below her contracted threshold, a Trustless Work escrow on Stellar approves
and releases USDC to her custodial wallet — in seconds, with no claim form,
no adjuster, and no paperwork. Sponsors and NGOs deposit USDC into coverage
pools and watch every payout settle on-chain.

Lemonade did this on Avalanche. Etherisc did it on Ethereum. Nimbus is the
first on Stellar — and ships it with a free weather API and around a hundred
lines of oracle code.

---

## Architecture

```
                ┌──────────────────────────────────────────┐
                │   Vercel Cron · 06:00 UTC daily          │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
┌──────────────┐        ┌───────────────────────────┐        ┌──────────────┐
│  Open-Meteo  │ ─────▶ │  /api/oracle/check        │ ─────▶ │   Supabase   │
│  (free API)  │        │                           │        │ oracle_checks│
└──────────────┘        │  if rainfall < threshold: │        └──────────────┘
                        │    approve-milestone      │
                        │    release-funds          │
                        │    sign XDR server-side   │
                        └────────────┬──────────────┘
                                     │
                                     ▼
                        ┌───────────────────────────┐
                        │  Trustless Work · Stellar │
                        │  Single-release escrow    │
                        │  USDC → farmer wallet     │
                        └───────────────────────────┘
```

Every role on the escrow (approver, service provider, release signer,
dispute resolver) is the platform wallet **except the receiver**, which is
the farmer's custodial wallet. That single design choice lets the oracle
fire the entire payout chain autonomously with no wallet popup anywhere.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind v3 + custom Nimbus dark theme |
| Database | Supabase (Postgres + Row Level Security) |
| Stellar | `@stellar/stellar-sdk` for server-side XDR signing |
| Escrow | Trustless Work REST API |
| Wallet (admin) | `@stellar/freighter-api` |
| Weather oracle | Open-Meteo Historical Weather API (free, keyless) |
| Charts | recharts |
| Maps | react-leaflet |
| SMS / email | Termii (NG) · Resend |
| Scheduler | Vercel Cron |

---

## Getting started

### 1. Install

```bash
git clone https://github.com/YOU/nimbus.git
cd nimbus
npm install
```

### 2. Provision Stellar

Generate a platform / oracle keypair:

```bash
node -e "const k=require('@stellar/stellar-sdk').Keypair.random(); console.log('PUBLIC:', k.publicKey()); console.log('SECRET:', k.secret())"
```

Fund the public key with testnet XLM via the [Stellar Laboratory account
creator](https://laboratory.stellar.org/#account-creator). Then trustline
and mint test USDC from the testnet USDC issuer.

Request a Trustless Work API key at [dapp.trustlesswork.com](https://dapp.trustlesswork.com).

### 3. Provision Supabase

Create a new project at [supabase.com](https://supabase.com). In the SQL
editor, run **in order**:

1. [`db/schema.sql`](db/schema.sql) — tables, constraints, indexes, RLS lockdown
2. [`db/seed.sql`](db/seed.sql) — three demo farmers + one coverage pool

### 4. Configure env

```bash
cp .env.example .env.local
```

Fill in:

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_TW_API_KEY` | Trustless Work API key |
| `NEXT_PUBLIC_TW_BASE_URL` | `https://dev.api.trustlesswork.com` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` for dev |
| `NEXT_PUBLIC_STELLAR_RPC` | `https://soroban-testnet.stellar.org` |
| `PLATFORM_WALLET_PUBLIC` / `_SECRET` | From step 2 |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server only) |
| `WALLET_ENCRYPTION_KEY` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | Optional — Resend email |
| `TERMII_API_KEY` | Optional — Termii SMS (Nigeria) |

Open-Meteo needs no key.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

---

## Routes

### Public

| Path | Purpose |
| --- | --- |
| `/` | Landing page · 9 sections |
| `/farmer/register` | 3-step enrolment wizard |
| `/farmer/[farmerId]` | Farmer policy dashboard |

### Admin

| Path | Purpose |
| --- | --- |
| `/admin` | Map, metrics, simulate-drought panel |
| `/admin/deploy` | Connect Freighter, deploy + fund escrows |
| `/admin/oracle` | Manual oracle runs, live readings, check log |
| `/admin/pools` | Coverage pool list + create form |

### API

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/farmers` | GET | List farmers |
| `/api/farmers/register` | POST | Create farmer + custodial wallet |
| `/api/farmers/[id]` | GET / PATCH | Read / update farmer |
| `/api/escrow/deploy` | POST | Deploy Single-Release escrow |
| `/api/escrow/fund` | POST | Fund escrow from platform wallet |
| `/api/escrow/status` | GET | Read escrow state |
| `/api/oracle/check` | GET | Run oracle for one or all active farmers |
| `/api/oracle/simulate` | POST | Force-trigger (demo button) |
| `/api/oracle/logs` | GET | Recent oracle checks |
| `/api/pools` | GET / POST | List / create coverage pools |
| `/api/notify` | POST | Send SMS or email |

The cron schedule for `/api/oracle/check` lives in [`vercel.json`](vercel.json):

```json
{ "crons": [{ "path": "/api/oracle/check", "schedule": "0 6 * * *" }] }
```

---

## Repository layout

```
nimbus/
├── app/
│   ├── page.tsx                Landing
│   ├── farmer/
│   │   ├── register/page.tsx   3-step wizard
│   │   └── [farmerId]/page.tsx Policy dashboard
│   ├── admin/
│   │   ├── page.tsx            Overview
│   │   ├── deploy/page.tsx     Escrow deploy + fund
│   │   ├── oracle/page.tsx     Oracle controls
│   │   └── pools/page.tsx      Coverage pools
│   ├── api/                    All server routes
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── OracleStatusCard.tsx
│   ├── PolicyCard.tsx
│   ├── RainfallChart.tsx
│   ├── FarmMap.tsx
│   ├── OracleRingVisual.tsx
│   ├── LiveTicker.tsx
│   └── StatusBadge.tsx
├── hooks/
│   ├── useFreighter.ts
│   └── useEscrow.ts
├── lib/
│   ├── stellar.ts              XDR signing, submit, keypair gen
│   ├── openmeteo.ts            Rainfall fetch + cumulative sum
│   ├── trustlesswork.ts        Deploy / approve / release helpers
│   ├── supabase.ts             Browser client
│   ├── supabase-server.ts      Server client (service key)
│   ├── wallet.ts               AES-256-GCM custodial secret crypto
│   ├── notify.ts               Resend + Termii
│   └── utils.ts                Formatting, status helpers
├── types/nimbus.ts             Shared interfaces
├── db/
│   ├── schema.sql              Tables, indexes, RLS
│   └── seed.sql                Demo farmers + pool
├── vercel.json                 Cron config
└── .env.example                Required env vars
```

---

## Demo walkthrough (2 minutes)

1. Visit `/admin` — three pinned farms on the Nigeria map.
2. Open `/admin/oracle` — click **Run oracle now**. Live Open-Meteo
   rainfall numbers fill in for each farm.
3. Pick Fatima Musa (Katsina) and click **sim**. The oracle approves and
   releases the Trustless Work escrow.
4. Click the returned tx hash — Stellar Expert shows USDC moving from
   escrow to her wallet.
5. Open `/farmer/<fatima-id>` — her dashboard now shows `TRIGGER` and a
   payout card.

---

## How the oracle works (the 11 lines that matter)

```ts
const { totalMm } = await fetchSeasonRainfall(lat, lon, seasonStart);

if (totalMm < farmer.drought_threshold_mm) {
  const approveXdr = await approveMilestone(farmer.contract_id);
  await submitToStellar(signXDR(approveXdr, PLATFORM_SECRET));

  const releaseXdr = await releaseFunds(farmer.contract_id);
  const tx = await submitToStellar(signXDR(releaseXdr, PLATFORM_SECRET));

  await markPayout(farmer.id, totalMm, tx.hash);
  await sendSMS(farmer.phone, payoutMessage(farmer, totalMm, tx.hash));
}
```

That is the entire claims department.

---

## Security notes

- Custodial farmer secrets are encrypted at rest with AES-256-GCM
  ([`lib/wallet.ts`](lib/wallet.ts)). `WALLET_ENCRYPTION_KEY` must be set
  in production — the dev fallback is intentionally non-secret.
- `SUPABASE_SERVICE_KEY` and `PLATFORM_WALLET_SECRET` are server-only and
  must never reach the browser. None of the public API routes return
  encrypted secrets.
- Supabase tables ship with RLS enabled and no public policies — all
  access goes through the service role from server routes.
- Trustless Work `Receiver` is the only role not held by the platform
  wallet, so funds can only ever land in the registered farmer wallet.

---

## License

MIT.
