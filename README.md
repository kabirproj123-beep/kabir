# Meridian — study-abroad & admissions consultancy (draft)

A modern, high-performance marketing site built with **Next.js 16 (App Router)**,
**TypeScript**, and **Tailwind CSS v4**. Mostly static for speed, with a thin
admin-editable content layer wired for **Firebase/Firestore**.

> **Draft note:** brand name, copy, and imagery are polished placeholders,
> ready to swap for the client's real content. "Meridian" is a stand-in name.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (fully static)
```

## Design system

- **Palette** — forest green (anchor) · warm cream (ground) · terracotta (accent)
- **Type** — Bricolage Grotesque (display) + Newsreader (body)
- **Signature** — a route-map motif of study-abroad flight paths (see
  `components/RouteMap.tsx`), echoed as section dividers
- Tokens live in `app/globals.css` under `@theme`

## What's static vs. editable

Everything renders statically. The content that the client will be able to edit
from an admin panel lives in **one place** — `lib/content.ts` — and is read
through `lib/data.ts::getContent()`:

- hero headline & intro
- stats (students placed, universities, countries…)
- services, process steps, destinations
- testimonials, FAQs, contact details

### Going live with Firebase

1. Copy `.env.example` → `.env.local` and fill in the values.
2. In `lib/data.ts`, uncomment the Firestore branch — it deep-merges the
   `content/site` document over the local defaults, so no component changes.
3. Admin writes go through the server-only `lib/firebaseAdmin.ts` (service
   account). **The service-account JSON is gitignored and must never be committed.**

## Project structure

```
app/            layout (fonts, metadata), globals (design tokens), page
components/     one file per section + Reveal (motion) + RouteMap (signature)
lib/content.ts  editable content — the admin data source
lib/data.ts     content resolver (local now, Firestore-ready)
lib/firebase.ts / firebaseAdmin.ts   client + server SDK wiring
```
