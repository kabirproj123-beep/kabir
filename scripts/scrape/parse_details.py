"""Parse the fetched Maharashtra college detail pages into structured JSON.

Reads  detail/<slug>.html  +  mh_list.json
Writes mh_colleges.json  — one rich record per college.
"""
import json, os, re
from bs4 import BeautifulSoup

DETAIL = "detail"
SEP = " | "


def toks(node):
    """Section text as a list of leaf-ish tokens."""
    if node is None:
        return []
    return [t.strip() for t in node.get_text(SEP, strip=True).split(SEP) if t.strip()]


def label_then_value(tokens, labels):
    """Fact-sheet style: 'Founded', '1958', 'Affiliation', 'Autonomous'."""
    out = {}
    for i, t in enumerate(tokens):
        if t in labels and i + 1 < len(tokens):
            nxt = tokens[i + 1]
            if nxt not in labels:
                out[t] = nxt
    return out


def value_then_label(tokens, labels):
    """Stat-tile style: '750', 'Faculty', '4,800', 'PhD Scholars'."""
    out = {}
    for i, t in enumerate(tokens):
        if t in labels and i > 0:
            out.setdefault(t, tokens[i - 1])
    return out


def clean(s):
    if not s:
        return None
    s = re.sub(r"\s+", " ", s).strip()
    return s or None


def dead(v):
    """Reference site's placeholder values -> None."""
    if not v:
        return None
    if v.strip().lower() in {"coming soon", "to be updated", "n/a", "-", "—", "not available"}:
        return None
    return v.strip()


def parse_paragraphs(section, drop_headings=True):
    if section is None:
        return None
    ps = [clean(p.get_text(" ", strip=True)) for p in section.find_all("p")]
    ps = [p for p in ps if p and len(p) > 40]
    return "\n\n".join(ps) if ps else None


COURSE_RE = re.compile(
    r"^(?P<popular>Popular\s+)?(?P<name>.+?)\s+"
    r"(?P<duration>\d[\d\s\-–\.]*(?:Years?|Months?))\s*"
    r"(?:·\s*(?P<mode>.+))?$"
)


def parse_courses(section):
    if section is None:
        return []
    table = section.find("table")
    if not table:
        return []
    rows = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 2 or tr.find("th"):
            continue
        raw_name = clean(cells[0].get_text(" ", strip=True)) or ""
        fee = clean(cells[1].get_text(" ", strip=True)) or ""
        fee = clean(re.sub(r"Total Course Fee", "", fee))
        elig = clean(cells[2].get_text(" ", strip=True)) if len(cells) > 2 else None

        m = COURSE_RE.match(raw_name)
        if m:
            name = clean(m.group("name"))
            duration = clean(m.group("duration"))
            mode = clean(m.group("mode"))
            popular = bool(m.group("popular"))
        else:
            name, duration, mode, popular = raw_name, None, None, False
            if name.startswith("Popular "):
                name, popular = name[8:], True

        if not name:
            continue
        rows.append({
            "name": name, "duration": duration, "mode": mode,
            "total_fee": dead(fee), "eligibility": elig, "popular": popular,
        })
    return rows


def parse_selection(section):
    if section is None:
        return []
    steps, seen = [], set()
    for t in toks(section):
        if t.isupper() and 3 < len(t) < 40:
            seen.add(t)
    # pair each ALL-CAPS step title with the sentence that follows it
    tk = toks(section)
    for i, t in enumerate(tk):
        if t in seen and i + 1 < len(tk) and len(tk[i + 1]) > 25:
            steps.append({"title": t.title(), "body": clean(tk[i + 1])})
    return steps


def parse_one(slug, base):
    path = os.path.join(DETAIL, slug + ".html")
    if not os.path.exists(path):
        return None
    soup = BeautifulSoup(open(path, encoding="utf-8", errors="ignore").read(), "lxml")

    rec = dict(base)  # id, slug, name, short_name, location, state, stream, ranking, fees...

    # ---- JSON-LD -----------------------------------------------------------
    faqs, ld_desc = [], None
    for sc in soup.find_all("script", type="application/ld+json"):
        try:
            d = json.loads(sc.string or "{}")
        except Exception:
            continue
        if d.get("@type") == "CollegeOrUniversity":
            ld_desc = clean(d.get("description"))
        if d.get("@type") == "FAQPage":
            for qa in d.get("mainEntity", []) or []:
                q = clean(qa.get("name"))
                a = clean((qa.get("acceptedAnswer") or {}).get("text"))
                if q and a:
                    faqs.append({"q": q, "a": a})

    # ---- fact sheet --------------------------------------------------------
    fact = {}
    anchor = soup.find(string=re.compile(r"^\s*Fact Sheet\s*$"))
    if anchor:
        box = anchor.find_parent("div")
        box = box.find_parent("div") or box
        fact = label_then_value(
            toks(box), {"Founded", "Affiliation", "Campus", "Students", "Entrance"}
        )

    ov = soup.find(id="overview")

    # ---- overview stat tiles ----------------------------------------------
    stats = value_then_label(
        toks(ov), {"Faculty", "PhD Scholars", "Research Papers", "Intl. Students"}
    )

    # ---- facilities --------------------------------------------------------
    facilities = []
    if ov:
        fa = ov.find(string=re.compile(r"^\s*Key Facilities\s*$"))
        if fa:
            facilities = [clean(x.get_text(strip=True))
                          for x in fa.find_parent("div").find_all("span")]
            facilities = [f for f in facilities if f and len(f) < 60]

    # ---- overview tagline (the h2 "X : tagline") ---------------------------
    tagline = None
    if ov and ov.find("h2"):
        h = ov.find("h2").get_text(" ", strip=True)
        tagline = clean(h.split(":", 1)[1]) if ":" in h else clean(h)

    # ---- rankings ----------------------------------------------------------
    rk = label_then_value(
        toks(soup.find(id="rankings")),
        {"NIRF Ranking", "NAAC Grade", "Approved By"},
    )

    # ---- placements --------------------------------------------------------
    pl_tokens = toks(soup.find(id="placements"))
    pl = value_then_label(
        pl_tokens,
        {"% Placement Rate", "Avg Package", "Highest Package",
         "Placement Rate", "Total Offers"},
    )
    pl_year = None
    for t in pl_tokens[:4]:
        if re.fullmatch(r"20\d\d", t):
            pl_year = t
            break

    rec.update({
        "tagline": tagline,
        "overview": parse_paragraphs(ov) or ld_desc,
        "description_long": ld_desc,
        "founded": dead(fact.get("Founded")),
        "affiliation": dead(fact.get("Affiliation")),
        "campus_size": dead(fact.get("Campus")),
        "student_count": dead(fact.get("Students")),
        "entrance_exams": [e.strip() for e in (fact.get("Entrance") or "").split(",") if e.strip()],
        "facilities": facilities,
        "faculty_count": dead(stats.get("Faculty")),
        "phd_scholars": dead(stats.get("PhD Scholars")),
        "research_papers": dead(stats.get("Research Papers")),
        "intl_students": dead(stats.get("Intl. Students")),
        "why_choose": parse_paragraphs(soup.find(id="why-choose")),
        "admission_process": parse_paragraphs(soup.find(id="admission")),
        "selection_steps": parse_selection(soup.find(id="selection")),
        "courses": parse_courses(soup.find(id="courses")),
        "nirf_rank": dead(rk.get("NIRF Ranking")),
        "naac_grade": dead(rk.get("NAAC Grade")),
        "approved_by": dead(rk.get("Approved By")),
        "placement_year": pl_year,
        "placement_rate": dead(pl.get("Placement Rate") or pl.get("% Placement Rate")),
        "avg_package": dead(pl.get("Avg Package")),
        "highest_package": dead(pl.get("Highest Package")),
        "total_offers": dead(pl.get("Total Offers")),
        "campus_life": parse_paragraphs(soup.find(id="campus")),
        "faqs": faqs,
    })
    return rec


if __name__ == "__main__":
    base = json.load(open("mh_list.json"))
    out, missing = [], []
    for c in base:
        r = parse_one(c["slug"], c)
        (out if r else missing).append(r or c["slug"])
    json.dump(out, open("mh_colleges.json", "w"), indent=1, ensure_ascii=False)

    print(f"parsed {len(out)} / {len(base)}   missing={len(missing)}")
    fields = ["overview", "founded", "affiliation", "campus_size", "courses",
              "avg_package", "highest_package", "placement_rate", "faqs",
              "why_choose", "admission_process", "selection_steps",
              "facilities", "entrance_exams", "naac_grade", "campus_life"]
    print("\nfield coverage:")
    for f in fields:
        n = sum(1 for r in out if r.get(f))
        print(f"  {f:20} {n:3}/{len(out)}")
    tc = sum(len(r["courses"]) for r in out)
    tf = sum(len(r["faqs"]) for r in out)
    print(f"\ntotal course rows: {tc}   total faqs: {tf}")
