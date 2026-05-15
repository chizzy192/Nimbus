# Nimbus · Video Scripts

Two scripts for the Boundless × Trustless Work submission:

1. **Pitch video** — 60 seconds. The "why". Hook, problem, solution, close.
2. **Demo video** — 2:30. The "show me". End-to-end walkthrough with the live app.

Submit either or both to the hackathon portal. The demo is the one judges
actually score against the rubric ("Best demos show the live escrow state in
the Escrow Viewer"), so prioritise that one if you only have time for one.

---

## Pre-recording checklist

Set this up **once** before pressing record on anything.

### Environment
- [ ] `.env.local` is populated and `npm run dev` boots cleanly
- [ ] Supabase migration `db/migrations/001_accounts.sql` has been applied
- [ ] Three demo farmers are seeded (Amina, Emeka, Fatima — Kano / Abuja / Katsina)
- [ ] Platform wallet has testnet XLM **and** test USDC
- [ ] Freighter installed in the recording browser, set to **testnet**, with the
      platform key imported (so the wallet pill shows connected)
- [ ] At least one farmer has a deployed + funded escrow ready to trigger

### Browser
- [ ] Single tab, 1920×1080 zoom 100%
- [ ] Use a clean profile — no extensions visible except Freighter
- [ ] Dock auto-hidden, no notifications, do-not-disturb on
- [ ] Pre-open these in pinned tabs so you can cut to them instantly:
  - http://localhost:3000 (landing)
  - http://localhost:3000/farmer/me (account dashboard, with demo farmer signed in)
  - http://localhost:3000/admin (overview)
  - http://localhost:3000/admin/oracle (oracle controls)
  - https://viewer.trustlesswork.com (will be filled in by clicking the link from a contract row)
  - https://stellar.expert/explorer/testnet (search by the tx after a simulate)

### Recording tools
- **Loom** is fastest — webcam bubble + screen, hosted, one-click share, perfect
  for hackathons. Free plan caps at 5 min, more than enough.
- **OBS Studio** if you want offline control / better mic.
- **QuickTime (macOS)** or **Xbox Game Bar (Windows 11)** as fallback.

### Audio
- Quiet room, mic 6 inches from your mouth, monotone-not-shouty.
- Speak ~10% slower than feels natural; demos always come out rushed.

### Pacing rule
**Don't read the script word-for-word.** Read it twice out loud, then record
to the *bullets* in your head. Authentic > polished.

---

## Pitch video script · 60 seconds

> Target: posted as a social clip and pinned to the README. Voiceover
> over screen recording + a couple of stock B-roll shots of African farmland.
> If you don't have B-roll, just record yourself talking to camera and
> intercut with one or two product screenshots.

### Shot list

| Time | Visual | Voiceover (read tighter than written) |
|---|---|---|
| 0:00–0:08 | Wide drone shot of dry farmland, then cut to a hand holding a shrivelled crop. Title card fades in: **Nimbus · when rain fails, Nimbus pays.** | "In Africa, one bad rainy season can erase a family's entire year of income. And traditional insurance never reaches them." |
| 0:08–0:20 | Stock shot of a paper claim form being stamped REJECTED, fading to a calendar flipping 90 days. | "Smallholder farmers want one thing — when the rain fails, money in hand the same week. Not a ninety-day claims process. Not paperwork they can't read." |
| 0:20–0:38 | Cut to the **landing page**, then the **OracleRingVisual**, then a screen-record of the admin oracle table updating, then Stellar Expert showing a USDC transfer. | "Nimbus is parametric drought insurance built on Trustless Work and Stellar. Every morning our oracle pulls satellite rainfall from Open-Meteo. If a farmer's season stays below threshold, the oracle approves and releases USDC from a Single-Release escrow — straight to her wallet. In five seconds." |
| 0:38–0:50 | Cut to a phone showing an SMS payout notification, then a farmer's face lighting up. (If no stock — use the farmer dashboard with the TRIGGER badge.) | "No claim forms. No adjusters. No paperwork. Lemonade did this on Avalanche. Etherisc did it on Ethereum. Nimbus is the first on Stellar." |
| 0:50–0:60 | Logo mark on the dark-green gradient background. URL appears below. | "Nimbus. When rain fails, Nimbus pays." |

### 30-second cut (for Twitter / Telegram)

> "Nimbus is parametric drought insurance built on Trustless Work and Stellar.
> Every morning, an oracle pulls satellite rainfall from Open-Meteo. If a
> farmer's season stays below threshold, USDC releases from escrow to her
> wallet automatically — no claim forms, no adjusters, no paperwork. The
> first parametric crop insurance on Stellar."

### One-line elevator

> "When the rain fails, Nimbus pays the farmer in USDC — automatically, on
> Stellar, in seconds."

---

## Demo video script · 2 minutes 30 seconds

> Target: this is the one judges score. Screen recording, voice over.
> No face cam needed (some prefer it). Land every beat below; the rubric
> explicitly rewards showing **live escrow state in the Escrow Viewer**.

### What the demo *must* cover (rubric check)

- [x] Project name + one-line description
- [x] What trust problem we solve
- [x] Who the parties are (Receiver, Approver, etc.)
- [x] What condition unlocks the funds
- [x] Who resolves disputes
- [x] Live escrow inspectable in the Trustless Work Escrow Viewer
- [x] A real on-chain payout transaction visible on Stellar Expert
- [x] Trustless Work primitive use is obvious (Single-Release escrow, milestone)

### Full script

#### Beat 1 · Title and stakes · 0:00–0:12

**On screen:** title card → fade to landing-page hero.

> "Nimbus is parametric drought insurance for African smallholder farmers,
> built on Stellar with Trustless Work. I'll show you the full end-to-end
> in two and a half minutes."

#### Beat 2 · Trust model · 0:12–0:30

**Action:** scroll down the landing page to the **Trust model** section.
Pause briefly on each of the four cards as you read.

> "Strong escrow products answer four questions up front, and ours does too.
> The trust problem: smallholders lose entire seasons to drought with no
> safety net. The parties: the farmer is the receiver, Nimbus is the
> platform, and a climate fund is the sponsor. The condition: cumulative
> rainfall below threshold. Disputes: the design is parametric — rainfall
> either crossed the threshold or it didn't, and the on-chain record
> proves which."

#### Beat 3 · Farmer enrolment · 0:30–0:55

**Action:** click **Enrol your farm** in the nav → walk briskly through the
3-step wizard. Use Kano coords (12.0000, 8.5200), season `2024-03-01` to
`2024-04-30`, $50 coverage tier. Hit submit.

> "A farmer enrols in under two minutes. We take her name and phone, she
> drops a pin on her field, picks a season, picks a coverage tier. Behind
> the scenes Nimbus generates a custodial Stellar wallet, AES-encrypts the
> secret, and credits her account with twenty dollars of demo balance so
> she can pay premiums."

#### Beat 4 · Account dashboard · 0:55–1:15

**Action:** the wizard lands you on `/farmer/me`. Pause on the metric cards.
Click **pay $5 premium** on the new farm and let the badge flip to "premium
✓ paid". Briefly hover the **+ Add another farm** button.

> "Here's the account dashboard. One human, many plots — she can enrol
> multiple farms and multiple seasons under one account, all rolling up to
> one custodial wallet. Premiums come out of her demo balance, and she can
> roll over for next season any time."

#### Beat 5 · Admin overview · 1:15–1:30

**Action:** open the admin overview at `/admin`. Show the map, the four
metric cards, the recent-oracle-checks table.

> "Now the operator side. Every farm pinned on a map of Nigeria, every
> oracle check logged, every payout visible. This is what NGOs and climate
> funds see when they sponsor a coverage pool."

#### Beat 6 · Deploy and Escrow Viewer · 1:30–1:55

**Action:** open `/admin/deploy`. Pick a farmer with no contract yet, click
**deploy**. When the contract ID appears, click the **view escrow ↗** link
underneath it. A new tab opens on `viewer.trustlesswork.com/escrow/...`
showing live escrow state.

> "Deploying a Trustless Work Single-Release escrow is one click. It uses
> Trustless Work's REST API, signs the XDR server-side with our platform
> wallet, and submits to Stellar. Every farm row links straight to the
> Escrow Viewer — judges, you can verify state live, right here."

**Linger on the Escrow Viewer tab for 3 seconds** so the audience can see
the roles, balance, and milestone definition. Close the tab.

#### Beat 7 · Oracle live + simulate · 1:55–2:15

**Action:** open `/admin/oracle`. Click **Run oracle now**. Real Open-Meteo
data populates the "Live rainfall readings" panel. Then click **sim** next
to a farmer whose rainfall is below threshold.

> "The oracle runs daily at six UTC via Vercel Cron, but I can fire it
> manually. These rainfall numbers are real, pulled from Open-Meteo's
> historical archive for each farm's exact GPS coordinates. To demo a
> payout I'll simulate drought on Katsina — that farm's rainfall is
> twenty-two millimetres against a fifty-millimetre threshold."

#### Beat 8 · Payout on chain · 2:15–2:30

**Action:** the success toast shows a tx hash. Click it → Stellar Expert
opens showing the USDC transfer. Zoom slightly on the operation row.

> "The oracle just called approve-milestone, then release-funds. Both XDRs
> were signed by the platform wallet, server-side. Fifty dollars of USDC
> moved from the escrow to the farmer's custodial wallet. There it is on
> Stellar Expert — five seconds, no human in the loop. That's Nimbus.
> When rain fails, Nimbus pays."

#### End card (optional, 2 extra seconds)

**On screen:** Nimbus wordmark, GitHub URL, deployed URL, hackathon credit
strip ("Built for Boundless × Trustless Work, May 2026").

---

## Recording tips specific to this app

### Things that will trip you up

- **Open-Meteo 400 on future seasons.** If you pick a `season_start` after
  today's date, you get a "Season not started" panel instead of rainfall.
  For the demo, pick a season that's already started (the seed data uses
  `2024-03-01` to `2024-04-30`, which is in the past — perfect).
- **Cron auth in dev.** `/api/oracle/check` is unauthenticated in dev
  (`NODE_ENV !== 'production'`), so the admin button just works. If you
  record on the Vercel preview deployment, set a `CRON_SECRET` and the
  admin page will still work because the simulate route forwards through.
- **Tx hash may take a beat.** After clicking simulate, give the response
  3–5 seconds before clicking the hash; otherwise Stellar Expert may not
  find the tx yet.
- **Wallet dropdown.** If you hover the wallet pill mid-record and it opens,
  click anywhere or press Escape to dismiss before the next beat.

### Things to *not* include

- The `.env.local` file. Never visible. Period.
- The Supabase service key. Never visible.
- Decrypted Stellar secrets (the "Reveal private key" modal). It's a great
  feature, but if you show one on a video the wallet is compromised forever.
- The admin's demo-balance reset button being clicked twice. Once is fine.

### If something fails live

You have two fallbacks baked in:
1. The simulate endpoint takes a single farmer — if oracle on the "real"
   demo farmer fails, just simulate a different one.
2. The seed has three farmers with pre-2024 seasons that always have
   sufficient historical data. Any of them will fire on simulate.

---

## After recording

- [ ] Upload to YouTube **unlisted** (so the URL works for the submission
      without indexing) or Loom public
- [ ] Add the URL to `app/about/page.tsx` field `Demo video`
- [ ] Add the same URL to the README under a `## Demo` section
- [ ] Tweet the 30-second pitch cut with the live URL
- [ ] Submit to the hackathon portal with: project name, category
      (`Core Trustless Work Applications · Microfinance & transparent capital
      allocation`), repo URL, demo URL, team banner (`/banner.svg`)
