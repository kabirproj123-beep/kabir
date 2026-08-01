"""Verification pass over the fetched college images.

Search heuristics reliably produce plausible-but-wrong matches:
  - pages about the *person* a college is named after
    ("Dr Ambedkar College" -> "Prakash Yashwant Ambedkar")
  - pages about the *place*
    ("D. Y. Patil Medical College, Navi Mumbai" -> "Navi Mumbai")
  - a *sibling* institution sharing most of its name
    ("Symbiosis Institute of Technology" -> "Symbiosis Law School")

Putting the wrong building on a college page is worse than showing no photo, so
this applies two rules that need no per-college hand-tuning:

  RULE 1 — the article must be about an educational institution.
           Reject person and place articles by their opening sentence.

  RULE 2 — one Wikipedia page may illustrate at most ONE college.
           When several colleges matched the same page, only the best
           name-similarity keeps it; the rest lose their image. This alone
           kills the sibling-institution and shared-campus errors.

Run after fetch_images.py. Deletes rejected files and rewrites the JSON.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

UA = "KabirCollegeSite/1.0 (Maharashtra college directory; contact: counsellorpro@gmail.com)"
API = "https://en.wikipedia.org/w/api.php"


def fetch_extract(title):
    """Opening text of an article — cached back into the JSON so this is cheap."""
    params = {
        "action": "query", "format": "json", "titles": title,
        "prop": "extracts", "exintro": 1, "explaintext": 1, "exchars": 500,
    }
    try:
        req = urllib.request.Request(
            API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA}
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read().decode())
        for p in ((d.get("query") or {}).get("pages") or {}).values():
            return p.get("extract") or ""
    except Exception:
        pass
    return ""

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMG_JSON = os.path.join(ROOT, "data", "college_images.json")
COLLEGES = os.path.join(ROOT, "data", "colleges.json")
IMG_DIR = os.path.join(ROOT, "public", "colleges")

APPLY = "--apply" in sys.argv

INSTITUTION = re.compile(
    r"\b(college|university|institute|school|academy|polytechnic|campus)\b", re.I
)
# Opening sentences that betray a biography or a settlement article.
PERSON = re.compile(
    r"\b(is|was)\s+an?\s+[^.]{0,60}\b"
    r"(politician|lawyer|activist|leader|educationist|industrialist|philanthropist|"
    r"scientist|economist|judge|minister|writer|social reformer|businessman)\b",
    re.I,
)
PLACE = re.compile(
    r"\b(is|was)\s+a\s+[^.]{0,60}\b"
    r"(city|town|suburb|village|neighbourhood|neighborhood|district|locality|"
    r"municipal corporation|planned city)\b",
    re.I,
)


def words(s):
    return set(re.findall(r"[a-z]+", s.lower()))


def similarity(college_name, title):
    """Jaccard over words — good enough to rank competing claims on one page."""
    a, b = words(college_name), words(title)
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def main():
    imgs = json.load(open(IMG_JSON, encoding="utf-8"))
    colleges = {c["slug"]: c for c in json.load(open(COLLEGES, encoding="utf-8"))}

    rejected = {}

    # Backfill extracts for entries fetched before we started storing them.
    missing = [s for s, m in imgs.items() if not m.get("extract")]
    if missing:
        print(f"fetching {len(missing)} article extracts…")
        for slug in missing:
            imgs[slug]["extract"] = fetch_extract(imgs[slug]["wikipedia_title"])
            time.sleep(0.25)
        json.dump(imgs, open(IMG_JSON, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    # ---- RULE 1: article must describe an institution --------------------
    # Judge on the FIRST SENTENCE only. A college article often mentions the
    # suburb it sits in ("...is a college in Bandra, a suburb of Mumbai"), which
    # trips the place pattern if the whole extract is searched. If the opening
    # sentence names an institution, that settles it.
    for slug, meta in list(imgs.items()):
        extract = (meta.get("extract") or "").strip()
        title = meta.get("wikipedia_title", "")
        first = re.split(r"(?<=[.!?])\s", extract)[0] if extract else ""

        if INSTITUTION.search(first) or INSTITUTION.search(title):
            continue  # definitely an institution

        probe = first or title
        if PERSON.search(probe):
            rejected[slug] = f"person article ({title})"
        elif PLACE.search(probe):
            rejected[slug] = f"place article ({title})"
        elif extract:
            rejected[slug] = f"not an institution ({title})"

    for slug in rejected:
        imgs.pop(slug, None)

    # ---- RULE 1b: the article's discipline must not contradict the stream --
    # "Symbiosis Institute of Technology" (Engineering) matched "Symbiosis Law
    # School" — same group, wrong faculty. Only unambiguous discipline words are
    # checked, so this can't misfire on a generic name.
    DISCIPLINE = {
        "law": "Law",
        "medical": "Medical",
        "medicine": "Medical",
        "dental": "Dental",
        "pharmacy": "Pharmacy",
    }
    for slug, meta in list(imgs.items()):
        title = meta.get("wikipedia_title", "")
        college = colleges.get(slug)
        if not college:
            continue
        name_words = words(college["name"])
        for word, stream in DISCIPLINE.items():
            # Only a conflict if the *title* claims a discipline that neither the
            # college's stream nor its own name shares.
            if word in words(title) and college["stream"] != stream and word not in name_words:
                rejected[slug] = f"discipline mismatch: {stream} page for a {college['stream']} college ({title})"
                imgs.pop(slug, None)
                break

    # ---- RULE 2: one page illustrates at most one college ----------------
    by_title = {}
    for slug, meta in imgs.items():
        by_title.setdefault(meta["wikipedia_title"], []).append(slug)

    # A department or sub-school ("IIT Bombay (SJMSOM)") can score a higher
    # word-overlap against the parent's page than the parent itself does
    # ("Indian Institute of Technology Bombay" vs "IIT Bombay"). Sub-units lose
    # to their parent regardless of similarity.
    SUBUNIT = re.compile(r"\(|\bdepartment\b|\bschool of\b|\bcentre\b|\bcenter\b", re.I)

    def rank(slug, title):
        name = colleges[slug]["name"]
        return (0 if SUBUNIT.search(name) else 1, similarity(name, title))

    for title, slugs in by_title.items():
        if len(slugs) < 2:
            continue
        best = max(slugs, key=lambda s: rank(s, title))
        for s in slugs:
            if s != best:
                rejected[s] = f"page already used by {best} ({title})"
                imgs.pop(s, None)

    # ---- report ----------------------------------------------------------
    print(f"rejected {len(rejected)}:")
    for slug, why in sorted(rejected.items()):
        name = colleges.get(slug, {}).get("name", slug)[:44]
        print(f"  {name:46} <- {why}")
    print(f"\nkept {len(imgs)} verified images")

    if not APPLY:
        print("\n(dry run — pass --apply to write changes and delete rejected files)")
        return

    for slug in rejected:
        p = os.path.join(IMG_DIR, slug + ".jpg")
        if os.path.exists(p):
            os.remove(p)

    json.dump(imgs, open(IMG_JSON, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("applied.")


if __name__ == "__main__":
    main()
