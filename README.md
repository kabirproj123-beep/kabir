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
cp .env.example .env.local     # optional — browsing works without it
npm run dev                    # http://localhost:3000
npm run build
```

Browsing runs with **no infrastructure at all** — the 192 colleges ship in the
repo. Leads, admin sign-in and editing colleges all need Firebase Firestore:
fill in the `FIREBASE_*` variables and restart. The catalogue already lives in
Firestore; with an empty `admins` collection, `/admin/login` offers a "create
first admin" form that writes the account straight to the database. There are
no seed scripts and no credentials in env — accounts are managed from
`/admin/team`.

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

Missing values render as a dash — nothing is invented to fill a hole.

### Where it came from

| Source | What it gave us | Records |
| --- | --- | --- |
| promoteducation.com | Detail pages — overview, courses & fees, placements, FAQs, fact sheet | 165 |
| collegedunia.com | Law colleges, which the first source barely covered | 27 added |
| collegedunia.com | Labelled course fees, used to correct the first source | 518 candidates |

The first source ships its whole college list as JSON embedded in the
`/colleges` page (an RSC payload), so the listing needed no crawling — only the
165 detail pages were fetched. Its Law coverage was **1** college in
Maharashtra, hence the second source for that vertical.

Normalisation: streams mapped to a fixed set (`BDS` → `Dental`); fees and
packages parsed to integer rupees (`total_fee_value`, `avg_ctc_value`) so
`₹13.50 Lakhs`, `₹6,10,000` and `2.10L` land on one scale; duplicates merged by
slug and cleaned name, richer record winning and the thinner one contributing
only missing fields.

> The Python pipeline that produced this file has been removed from the repo now
> that Firestore is the live store and `/admin/colleges` is how records change.
> Everything needed to judge or reproduce the dataset is recorded below.

### Fees are cross-checked, and labelled when they aren't

The original fee data was **unreliable and unlabelled**, mixing annual and total
figures. For IIT Bombay the first source gave three different numbers in three
places — ₹3 Lakhs "total" in the listing, ₹75,000 "total course fee" in its own
course table, ₹2.2 L "per year" in its comparison widget — against a real
₹11,95,800 total for B.Tech CSE.

Cross-checking found **92 wrong fees**, some drastically so:

| College | Was | Actually | Out by |
| --- | ---: | ---: | ---: |
| Mumbai University (LLM) | ₹15,437 | ₹6,41,704 | 41x |
| COEP (B.Tech Mech) | ₹95,000 | ₹8,40,182 | 8.8x |
| Datta Meghe (MBBS) | ₹19.85 L | ₹1.27 Cr | 6.4x |
| IIT Bombay (B.Tech CSE) | ₹3 L | ₹11.96 L | 4.0x |

Fees now come from Collegedunia, stated as `<amount> <course> - Total Fees` —
labelled, so they're comparable and checkable. **92 of 192 are verified** this
way and carry the programme name and a cross-checked badge.

The remaining 100 are flagged `fee_confidence: "low"`, show **"On request"**
rather than a number we can't stand behind, and are excluded from fee sorting,
filtering and ROI, so a bad figure can't quietly skew a ranking.

**Matching was deliberately conservative** — a wrong fee is worse than no fee.
Naive name matching wanted to give MNLU Nagpur the fees of MNLU Aurangabad,
Shivaji University those of *Chhatrapati Shivaji Maharaj University*, and MET
Institute of Management those of IIM Mumbai. Three gates all had to pass:

1. **City must agree**, after normalising suburbs to their city (Narhe → Pune,
   Worli → Mumbai). This is what separates the two MNLU campuses.
2. **A shared *rare* word** — token frequency computed across all 518
   candidates, only words in under 3% of names counting as evidence. "Somaiya"
   and "Kashibai" are evidence; "Institute", "Management" and "Mumbai" are not,
   and that last one is exactly how MET matched IIM.
3. **Similarity ≥ 0.45**, with a marginal score (< 0.55) needing *two* rare
   words — one shared surname isn't enough to equate "Symbiosis Institute of
   Technology" with "Symbiosis International University".

### Known gaps

Properties of the upstream data, not parser bugs — verified against the source
HTML:

- Only ~28 of the 165 colleges have `why_choose`, `campus_life` and
  `selection_steps`. The rest don't have those sections upstream.
- `placement_rate` is present for 25; most show `—` at source.
- `naac_grade` is absent from the first source entirely; the 26 values present
  came from the law source.

These are now editable — anything upstream left blank can be filled in at
`/admin/colleges` rather than waiting on another scrape.

### Photography

The reference site has photos for **0** of the 165 Maharashtra colleges, so
images come from Wikipedia/Wikimedia Commons instead — freely licensed, stored
locally in `public/colleges`, and credited on each page as the licences require.

**28 colleges have a verified photo.** Coverage is deliberately partial. Naive
search matched IIM Nagpur to VNIT Nagpur (shared "Nagpur"), a Russian
chemical-technology university to ICT Mumbai, the *politician* Prakash Ambedkar
to Dr Ambedkar College, the *city* Navi Mumbai to a college in it, and Symbiosis
Law School to Symbiosis Institute of Technology.

Two rules that need no per-college tuning removed all of those: the article must
describe an institution (biography and settlement articles are detected from
their opening sentence and dropped), and **one Wikipedia page may illustrate at
most one college** — where several claimed the same page, only the closest name
match kept it. Matches also required a distinctive (≥6 char) word from the
college name in the page title, ≥60% token overlap, and the article's own
opening text to mention the college's city or Maharashtra.

Colleges without a confident match render a deterministic gradient. No photo
beats the wrong photo.

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

**Storage:** Firestore `leads` collection. If Firebase is not configured, lead
writes fail loudly instead of disappearing into a local file. `/admin` displays
the live storage mode.

## Admin

| Page | What it does |
| --- | --- |
| `/admin` | Lead table — counts by status, click-to-call numbers, per-source labels, status updates (new → contacted → converted → closed) |
| `/admin/colleges` | Search and filter the catalogue, add, edit and delete records |
| `/admin/team` | Add admins, set passwords, remove accounts |
| `/admin/login` | Username + password |

### Editing colleges

`/admin/colleges` edits the live catalogue. The form covers every field the
public pages read — fact sheet, ranking, fees, placements, campus, entrance
exams and facilities, plus reorderable rows for courses, selection steps and
FAQs. Saving stamps `updatedAt` and `updatedBy`; those two are the only fields
the form doesn't expose.

Two things it deliberately makes hard to get wrong:

- **Fee confidence is a control, not a note.** Setting it to Low hides the
  figure behind "On request" and drops the college out of fee sorting and ROI,
  so an unverified number can't reach a ranking by being typed in.
- **Renaming moves the URL.** Changing the name reslugs the record, and the save
  refuses if that slug is already taken rather than overwriting the other
  college. The old document is deleted, so the site never serves both.

When the list is coming from the bundled JSON — no credentials, or credentials
but an unseeded collection — the panel says so in a banner rather than passing
it off as live data. Without credentials a save is refused outright and explains
why, instead of appearing to succeed and vanishing.

### Accounts

**No admin password in env.** Accounts are documents in the Firestore `admins`
collection, so adding someone is a data change, not a redeploy.

Create the **first** one from `/admin/login` when the admin list is empty. The
account is written straight to Firestore, then you can add everyone else from
`/admin/team`.

Everyone after that is added at `/admin/team`, signed in.

Passwords are stored as typed — this panel holds leads, and the client wanted to
be able to read and change passwords straight from the console. Anyone with
Firebase project access can therefore read them; that's the trade.

Sign-in issues a random token in an httpOnly cookie, with the session recorded
in `admin_sessions` (Firestore keeps only the token's SHA-256). No signing secret
to hold in env, and signing someone out is a delete. Every mutating action
re-checks auth server-side rather than trusting the page that rendered it.

**No local-file fallback**, unlike leads: without Firestore the panel refuses to
open rather than authenticating against a different store than production uses.

## Structure

```text
app/
  page.tsx              homepage — hero, tools, stream rails, compare, loan, FAQ
  colleges/             listing with filters + 192 static detail pages
  rankings/             ranked table per stream
  courses/  exams/      course directory, entrance-exam reference
  counselling/          service page + lead form
  admin/                leads, college CMS, team management, login
  api/leads/            lead intake
components/             CollegeCard, CompareTool, LoanCalculator, LeadForm, chrome
lib/
  colleges.ts           types, filtering, sorting, INR/LPA formatting — no I/O
  collegeStore.ts       Firestore reads and writes, caching, bundled fallback
  catalog.ts            course + exam reference data
  leads.ts              validation, storage, status
  adminAuth.ts          sessions — cookie token, Firestore session records
  adminUsers.ts         admin accounts — the Firestore `admins` collection
  content.ts            editable site copy (brand, FAQs, destinations)
```

## Architecture note: how college data is read

Firestore is the source of truth. `lib/collegeStore.ts` is the only module that
touches it; `lib/colleges.ts` stays free of I/O so client components can import
the `College` type and the formatters without pulling in firebase-admin.

Edit records from the panel; `data/colleges.json` is only a read-only fallback.

Reads are cached across requests with a 5-minute TTL and invalidated by tag, so
rendering a page doesn't pull 190 documents. Every mutation calls
`updateTag`, which gives the admin read-your-own-writes — the page they land on
after saving shows the edit, not a stale copy. That's why mutations may only be
called from a Server Action.

The bundled `data/colleges.json` remains a fallback for exactly two cases: no
Firebase credentials (a fresh checkout or preview build), and credentials
present but the collection not yet seeded. Both render the site rather than an
empty catalogue — but neither is editable, and the admin panel says so.

Leads are the opposite of reference data: written at request time, always
straight to the database, never cached.

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

- CSV export of leads
- Uploading a college photo from `/admin/colleges` (images are still filesystem)
- Student reviews (the ratings shown come from source data, 29 of 192 colleges)
- Cutoffs and exam dates — deliberately omitted, since stale numbers are worse
  than none
