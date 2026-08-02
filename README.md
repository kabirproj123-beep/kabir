# Maharashtra college discovery & admissions platform

A college discovery site for **Maharashtra only**, built with **Next.js 16 (App
Router)**, **TypeScript** and **Tailwind CSS v4**. Students browse and compare
colleges; every tool funnels into a lead form; the client reads the leads at
`/admin`.

Modelled on [promoteducation.com](https://promoteducation.com) — same page
structure and funnel, scoped to one state and backed by our own scraped dataset.

> **Draft note:** "Meridian" is a stand-in brand name. Swap `site` in
> `lib/content.ts` for the client's real name, phone, email and address.

## Run it

```bash
npm install
cp .env.example .env.local     # set ADMIN_PASSWORD at minimum
npm run dev                    # http://localhost:3000
npm run build
```

The site runs with **no infrastructure at all** — college data ships in the
repo, and leads fall back to a local file until Firebase is configured.

## The data

`data/colleges.json` — **192 Maharashtra colleges**, scraped and normalised:

| Stream | Colleges |
| --- | ---: |
| Management | 65 |
| Engineering | 64 |
| Law | 28 |
| Medical | 23 |
| Pharmacy | 11 |
| Architecture | 1 |

Per college: fees, average and highest package, NIRF rank, NAAC grade,
ownership, founding year, affiliation, campus size, entrance exams, facilities,
a full course-and-fee table (447 rows overall), and FAQs (495 overall).

### Fees are cross-checked, and labelled when they aren't

The original fee data was badly wrong — it mixed annual and total figures without
labelling them, and was out by **8.8x for COEP** and **41x for Mumbai
University**. Fees now come from a second source that states which course each
figure covers, and **92 of 192 have been verified** this way.

The remaining 100 show **"On request"** rather than a number we can't stand
behind, and are excluded from fee sorting, filtering and ROI. Verified fees carry
the programme name and a cross-checked badge. Full detail, including the matching
rules, is in [`scripts/scrape/README.md`](scripts/scrape/README.md).

Sources, method, normalisation rules and **known gaps** are documented in
[`scripts/scrape/README.md`](scripts/scrape/README.md). Missing values render as
a dash — nothing is invented to fill a hole.

### Photography

The reference site has photos for **0** of the 165 Maharashtra colleges, so
images come from Wikipedia/Wikimedia Commons instead — freely licensed, stored
locally in `public/colleges`, and credited on each page as the licences require.

**28 colleges have a verified photo.** Coverage is deliberately partial: naive
search matched a *politician* to one college, a *city* to another and a Russian
university to a third, so `verify_images.py` rejects any match that isn't
provably the right institution. Colleges without a confident match render a
deterministic gradient. No photo beats the wrong photo.

## Lead capture

Every gated tool POSTs to `/api/leads`:

| Form | Where |
| --- | --- |
| Comparison unlock | Homepage — blurs ROI, placements, campus behind the form |
| Loan assistance | Homepage EMI calculator — asks family income band |
| College enquiry | Every college detail page sidebar |
| Free counselling | `/counselling`, `/study-abroad` |
| Newsletter | Homepage FAQ block |
| Contact | `/contact` |

Server-side the route validates the name, normalises the phone to a 10-digit
Indian mobile (accepts `+91`, spaces), rejects unknown form sources, caps `meta`
size, rate-limits per IP, and silently drops honeypot submissions.

**Storage:** Firestore `leads` collection when credentials exist, otherwise
`.data/leads.json` (gitignored — it holds personal data). `/admin` displays which
mode is live.

## Admin

`/admin` — lead table with counts by status, click-to-call numbers, per-source
labels, and status updates (new → contacted → converted → closed).

Gated by `ADMIN_PASSWORD` exchanged for an HMAC-signed httpOnly cookie. The
password is never stored in the browser, and the status-update action re-checks
auth server-side rather than trusting the page that rendered the button.

## Structure

```
app/
  page.tsx              homepage — hero, tools, stream rails, compare, loan, FAQ
  colleges/             listing with filters + 192 static detail pages
  rankings/             ranked table per stream
  courses/  exams/      course directory, entrance-exam reference
  counselling/          service page + lead form
  admin/                leads dashboard (password-gated)
  api/leads/            lead intake
components/             CollegeCard, CompareTool, LoanCalculator, LeadForm, chrome
lib/
  colleges.ts           types, filtering, sorting, INR/LPA formatting
  catalog.ts            course + exam reference data
  leads.ts              validation, storage, status
  adminAuth.ts          password gate
  content.ts            editable site copy (brand, FAQs, destinations)
scripts/
  seed-firestore.mjs    push colleges into Firestore
  scrape/               the data pipeline + its README
```

## Architecture note: why colleges aren't read from Firestore

College data is reference data — it changes a few times a year. Shipping it as
JSON keeps all 192 detail pages **statically generated**, makes the site fast and
cheap to host, and means it works before Firebase exists.

Leads are the opposite: written at request time, always to the database.

`node scripts/seed-firestore.mjs` pushes the colleges into Firestore anyway, so
the client can edit them from an admin UI later; re-export to JSON to publish.
Run with `--dry` to preview.

## Motion

Restrained by design, and all of it honours `prefers-reduced-motion`:

- **Carousels** — scroll-snap rails for the four stream sections and "similar
  colleges". Built on native scrolling, so touch momentum works on mobile and it
  degrades without JS; arrows are enhancement only.
- **Marquee** — the "students are comparing" strip, pure CSS.
- **Reveal** — sections fade up once as they enter the viewport.
- **CountUp** — the stats band counts up on first view.

## Mobile

- A sticky bottom action bar (Call · Colleges · Free counselling), mirroring the
  reference site — on a phone the lead forms are far down the page, so the
  primary actions stay reachable.
- The header CTA collapses on small screens since the bottom bar carries it.
- Loan-calculator results and comparison selects restack rather than squeeze.
- Every wide table scrolls inside its own container; the page never scrolls
  sideways.

## Not built yet

- Editing college records from `/admin` (seed script exists; no UI)
- CSV export of leads
- Student reviews (the ratings shown come from source data, 29 of 192 colleges)
- Cutoffs and exam dates — deliberately omitted, since stale numbers are worse
  than none
