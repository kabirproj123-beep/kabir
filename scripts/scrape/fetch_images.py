"""Fetch freely-licensed college photos from Wikimedia and store them locally.

The reference site has images for 0 of the 165 Maharashtra colleges, so there is
nothing to copy. Wikipedia/Wikimedia Commons does have photos of many Indian
institutions under free licences, which we may reuse **with attribution**.

What this does, per college:
  1. search Wikipedia for the college (name + city)
  2. reject the match unless the returned title genuinely resembles the college
     -- a naive search happily returns "List of educational institutions in Pune"
  3. pull an 800px thumbnail plus licence and author metadata
  4. download it to public/colleges/<slug>.jpg
  5. record licence + author so the UI can credit it

Writes data/college_images.json. Re-runnable; skips files already downloaded.
"""
import json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "data", "colleges.json")
OUT_JSON = os.path.join(ROOT, "data", "college_images.json")
IMG_DIR = os.path.join(ROOT, "public", "colleges")

# Wikimedia requires a descriptive User-Agent identifying the client.
UA = "KabirCollegeSite/1.0 (Maharashtra college directory; contact: counsellorpro@gmail.com)"
API = "https://en.wikipedia.org/w/api.php"

STOP = {
    "college", "institute", "university", "of", "the", "and", "for", "school",
    "technology", "engineering", "management", "studies", "science", "sciences",
    "deemed", "national", "indian", "s", "dr", "shri", "smt", "maharashtra",
    "education", "research", "medical", "law", "pharmacy", "arts", "commerce",
}


def tokens(s):
    return {w for w in re.findall(r"[a-z]+", s.lower()) if w not in STOP and len(w) > 2}


def api(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def best_match(college):
    """Search Wikipedia, return (title, thumb_url, license, author) or None.

    Matching is deliberately strict. A loose match is not a harmless miss — it
    puts another institution's photograph on this college's page. Three gates
    must all pass:

      1. a *distinctive* word from the college name (>=6 chars, not a generic
         education word) must appear in the page title. This is what stops
         "Visvesvaraya NIT Nagpur" matching "IIM Nagpur" on the shared token
         "nagpur";
      2. at least 60% of the college's distinctive words appear in the title;
      3. the article's own opening text must mention the college's city or
         Maharashtra. This is what stops "Institute of Chemical Technology"
         matching a chemical-technology university in Russia.

    Colleges whose names carry no distinctive word at all (e.g. "College of
    Engineering, Pune" reduces to just "pune") are skipped rather than guessed.
    """
    name = college["name"]
    city = (college.get("city") or "").strip()

    want = tokens(name)
    strong = {w for w in want if len(w) >= 6}
    # Names like "ILS Law College" reduce to nothing distinctive once generic
    # education words are stripped, but they still have an exact Wikipedia page.
    # `raw` keeps every word so the exact-title path below can catch those.
    raw = {w for w in re.findall(r"[a-z]+", name.lower()) if len(w) > 1}
    if not strong and not raw:
        return None

    for q in ([f"{name} {city}".strip(), name] if city else [name]):
        try:
            d = api({
                "action": "query", "format": "json",
                "generator": "search", "gsrsearch": q, "gsrlimit": 4,
                "prop": "pageimages|extracts", "piprop": "thumbnail",
                "pithumbsize": 800, "exintro": 1, "explaintext": 1, "exchars": 600,
            })
        except Exception:
            time.sleep(1)
            continue

        pages = (d.get("query") or {}).get("pages") or {}
        # generator=search returns an unordered dict; "index" preserves rank
        ranked = sorted(pages.values(), key=lambda p: p.get("index", 99))

        for p in ranked:
            title = p.get("title", "")
            thumb = (p.get("thumbnail") or {}).get("source")
            if not thumb:
                continue
            if title.lower().startswith(("list of", "education in", "outline of", "index of")):
                continue

            got = tokens(title)
            raw_got = {w for w in re.findall(r"[a-z]+", title.lower()) if len(w) > 1}

            # Exact-title path: every word of the college name appears in the
            # page title ("ILS Law College" -> "ILS Law College"). Still subject
            # to the city gate below.
            #
            # The title must not *add* a distinctive word, or "College of
            # Engineering, Pune" happily matches "College of Military
            # Engineering, Pune" — a different institution. Extra words that are
            # just the city or a generic education word are fine.
            extra = raw_got - raw - {w for w in re.findall(r"[a-z]+", city.lower())} - STOP
            exact = bool(raw) and raw.issubset(raw_got) and not any(len(w) >= 6 for w in extra)

            if not exact:
                if not got:
                    continue
                # gate 1 + 2
                if not strong or not (strong & got):
                    continue
                if len(want & got) / len(want) < 0.6:
                    continue

            # gate 3 — the article must actually be about a place in Maharashtra
            extract = (p.get("extract") or "").lower()
            haystack = extract + " " + title.lower()
            if city and city.lower() not in haystack and "maharashtra" not in haystack:
                continue

            lic, author = license_of(title)
            return title, thumb, lic, author
        time.sleep(0.3)
    return None


def license_of(title):
    """Licence + author for a page's lead image."""
    try:
        d = api({
            "action": "query", "format": "json", "titles": title,
            "prop": "pageimages", "piprop": "name",
        })
        pages = (d.get("query") or {}).get("pages") or {}
        fname = next((p.get("pageimage") for p in pages.values() if p.get("pageimage")), None)
        if not fname:
            return None, None
        d2 = api({
            "action": "query", "format": "json", "titles": "File:" + fname,
            "prop": "imageinfo", "iiprop": "extmetadata",
        })
        pages2 = (d2.get("query") or {}).get("pages") or {}
        for p in pages2.values():
            info = (p.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            lic = (meta.get("LicenseShortName") or {}).get("value")
            author = (meta.get("Artist") or {}).get("value")
            if author:
                author = re.sub(r"<[^>]+>", "", author).strip()[:120]
            return lic, author
    except Exception:
        pass
    return None, None


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        body = r.read()
    if len(body) < 3000:
        return False
    with open(path, "wb") as f:
        f.write(body)
    return True


if __name__ == "__main__":
    os.makedirs(IMG_DIR, exist_ok=True)
    colleges = json.load(open(DATA, encoding="utf-8"))

    existing = {}
    if os.path.exists(OUT_JSON):
        existing = json.load(open(OUT_JSON, encoding="utf-8"))

    out = dict(existing)
    hits = 0

    for i, c in enumerate(colleges, 1):
        slug = c["slug"]
        dest = os.path.join(IMG_DIR, slug + ".jpg")

        if slug in out and os.path.exists(dest):
            hits += 1
            continue

        m = best_match(c)
        if not m:
            print(f"[{i}/{len(colleges)}] miss  {slug}", flush=True)
            time.sleep(0.4)
            continue

        title, thumb, lic, author = m
        try:
            ok = download(thumb, dest)
        except Exception as e:
            print(f"[{i}/{len(colleges)}] dlerr {slug}: {e}", flush=True)
            time.sleep(0.6)
            continue

        if ok:
            out[slug] = {
                "src": f"/colleges/{slug}.jpg",
                "wikipedia_title": title,
                "license": lic,
                "author": author,
            }
            hits += 1
            print(f"[{i}/{len(colleges)}] OK    {slug}  <- {title}", flush=True)
            json.dump(out, open(OUT_JSON, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
        time.sleep(0.5)

    json.dump(out, open(OUT_JSON, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(f"\nimages for {hits}/{len(colleges)} colleges -> {IMG_DIR}")
