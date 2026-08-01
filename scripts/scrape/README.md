# College data pipeline

How `data/colleges.json` (192 Maharashtra colleges) was produced, and how to
refresh it.

## Scope

**Maharashtra only.** Every record has `state == "Maharashtra"`. Other states
are deliberately out of scope.

## Sources

| Source | What it gave us | Records |
| --- | --- | --- |
| promoteducation.com | Rich detail pages — overview, courses & fees, placements, FAQs, fact sheet | 165 |
| collegedunia.com | Law colleges, which the first source barely covered | 27 added |

The first source ships its entire college list as JSON embedded in the
`/colleges` page (a React Server Components payload), so the listing needed no
crawling — only the 165 detail pages were fetched individually.

Their Law coverage was 17 colleges nationally and **1** in Maharashtra, which is
why a second source was needed for that vertical.

## Steps

Run from this directory. Steps 1–2 need the working files from the original run
(`mh_list.json`, `law_cd.txt`); steps 3–4 are the ones you'll usually re-run.

```bash
python3 fetch_details.py     # 1. fetch 165 detail pages -> detail/*.html (resumable)
python3 parse_details.py     # 2. parse them            -> mh_colleges.json
python3 parse_law.py         # 3. parse law listing     -> law_maharashtra.json
python3 merge.py             # 4. normalise + merge     -> ../../data/colleges.json
```

`rsc.py` decodes React Server Component payloads out of a saved HTML page;
`totext.py` flattens HTML to readable text. Both are helpers used by the above.

## Normalisation done in `merge.py`

- Streams mapped to a fixed set (`BDS` → `Dental`).
- Fees and packages parsed to integer rupees (`total_fee_value`, `avg_ctc_value`)
  so they can be sorted and compared. `₹13.50 Lakhs`, `₹6,10,000` and `2.10L` all
  land on the same scale.
- Duplicate colleges across sources are merged by slug and by cleaned name; the
  richer record wins and the thinner one only contributes missing fields.
- One pharmacy college misfiled under Law in the second source is dropped.

## Images

The reference site has photos for only 55 of its 903 colleges and **zero** of the
165 in Maharashtra, so there was nothing to copy. Photos instead come from
Wikipedia / Wikimedia Commons, which are freely licensed and reusable **with
attribution**.

```bash
python3 fetch_images.py            # search, match, download -> public/colleges/
python3 verify_images.py           # dry-run audit of the matches
python3 verify_images.py --apply   # delete rejected files, rewrite the JSON
```

Output: `data/college_images.json` (src, source article, licence, author) and
`public/colleges/<slug>.jpg` at 800px. Credits render under the hero on each
college page.

**Matching is the hard part, and getting it wrong is expensive** — a loose match
puts another institution's building on a college page. Naive search produced all
of these:

| College | Bad match | Why |
| --- | --- | --- |
| Visvesvaraya NIT Nagpur | IIM Nagpur | shared the word "Nagpur" |
| Institute of Chemical Technology | a chemical-technology university in **Russia** | shared "chemical technology" |
| College of Engineering, Pune | College of **Military** Engineering, Pune | title added a word |
| Dr Ambedkar College | Prakash Yashwant Ambedkar | the *person* it's named after |
| D. Y. Patil Medical College, Navi Mumbai | Navi Mumbai | the *city* |
| Symbiosis Institute of Technology | Symbiosis Law School | *sibling* institution |

So `fetch_images.py` requires a distinctive (>=6 char) word from the college name
in the page title, >=60% token overlap, and the article's own opening text to
mention the college's city or Maharashtra. Titles that *add* a distinctive word
are rejected.

`verify_images.py` then applies two rules that need no per-college tuning:

1. the article must describe an institution — biography and settlement articles
   are detected from their opening sentence and dropped;
2. **one Wikipedia page may illustrate at most one college.** Where several
   colleges claimed the same page, only the closest name match keeps it. This
   single rule removes the sibling-institution and shared-campus errors.

Coverage is partial by design. Colleges with no confident match render a
deterministic gradient instead, and that is the intended outcome — no photo
beats the wrong photo.

## Known gaps

These are properties of the upstream data, not parser bugs — verified by
inspecting the source HTML:

- Only ~28 of the 165 colleges have `why_choose`, `campus_life` and
  `selection_steps`. The rest simply don't have those sections upstream.
- `placement_rate` is present for 25; most show `—` at source.
- `naac_grade` is absent from the first source entirely; the 26 values present
  come from the law source.

The UI renders a dash for missing values rather than inventing numbers.

## Refreshing

Re-run steps 1–4. `fetch_details.py` skips pages already on disk, so delete
`detail/` first for a genuinely fresh pull. Be considerate with request rates —
the fetcher uses 4 workers and a delay between requests.
