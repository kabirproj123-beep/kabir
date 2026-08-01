"""Merge both scraped sources into one normalised Maharashtra college dataset.

Sources
  mh_colleges.json      165 rich records (promoteducation.com)
  law_maharashtra.json   30 law records  (collegedunia)

Writes the project's data/colleges.json.
"""
import json, re, os, unicodedata

# repo-root/data/colleges.json, resolved from this file's location
OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "colleges.json",
)

STREAM_MAP = {
    "Engineering": "Engineering", "Management": "Management", "Medical": "Medical",
    "Pharmacy": "Pharmacy", "Law": "Law", "Architecture": "Architecture", "BDS": "Dental",
}


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"\[.*?\]", "", s)
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-+", "-", s)


def money(s):
    """'₹2.22 Lakhs' / '₹6,10,000' / '₹13.5L' -> rupees as int."""
    if not s:
        return None
    t = str(s).replace(",", "").replace("₹", "").strip()
    m = re.search(r"(\d+(?:\.\d+)?)", t)
    if not m:
        return None
    v = float(m.group(1))
    low = t.lower()
    if "cr" in low:
        v *= 1_00_00_000
    elif "lakh" in low or re.search(r"\dl\b", low) or low.endswith("l"):
        v *= 1_00_000
    return int(v)


def lpa(s):
    """'25.0 LPA' / '₹37.89 LPA' / '₹3.7 Cr' -> rupees per annum as int."""
    if not s:
        return None
    t = str(s).replace(",", "").replace("₹", "").strip().lower()
    m = re.search(r"(\d+(?:\.\d+)?)", t)
    if not m:
        return None
    v = float(m.group(1))
    if "cr" in t:
        return int(v * 1_00_00_000)
    return int(v * 1_00_000)          # LPA


def pct(s):
    if not s:
        return None
    m = re.search(r"(\d+(?:\.\d+)?)", str(s))
    return float(m.group(1)) if m else None


def clean_name(n):
    return re.sub(r"\s*-\s*\[[^\]]+\]\s*$", "", n).strip()


records, seen = [], {}

# ---- source 1: promoteducation (rich) -------------------------------------
for c in json.load(open("mh_colleges.json")):
    slug = c["slug"]
    rec = {
        "slug": slug,
        "name": c["name"],
        "short_name": c.get("short_name") or clean_name(c["name"]),
        "city": c.get("location"),
        "state": "Maharashtra",
        "stream": STREAM_MAP.get(c.get("stream"), c.get("stream")),
        "ownership": c.get("ownership"),
        "type": c.get("type"),
        "nirf_rank": c.get("ranking") or None,
        "total_fee": c.get("total_fee"),
        "total_fee_value": money(c.get("total_fee")),
        "avg_ctc": c.get("avg_ctc"),
        "avg_ctc_value": lpa(c.get("avg_ctc")),
        "highest_package": c.get("highest_package"),
        "highest_package_value": lpa(c.get("highest_package")),
        "placement_rate": pct(c.get("placement_rate")),
        "placement_year": c.get("placement_year"),
        "total_offers": c.get("total_offers"),
        "tagline": c.get("tagline"),
        "overview": c.get("overview"),
        "why_choose": c.get("why_choose"),
        "admission_process": c.get("admission_process"),
        "campus_life": c.get("campus_life"),
        "founded": c.get("founded"),
        "affiliation": c.get("affiliation"),
        "approved_by": c.get("approved_by"),
        "naac_grade": c.get("naac_grade"),
        "campus_size": c.get("campus_size"),
        "student_count": c.get("student_count"),
        "faculty_count": c.get("faculty_count"),
        "entrance_exams": c.get("entrance_exams") or [],
        "facilities": c.get("facilities") or [],
        "selection_steps": c.get("selection_steps") or [],
        "courses": c.get("courses") or [],
        "faqs": c.get("faqs") or [],
        "rating": None,
        "reviews": 0,
        "source": "promoteducation",
    }
    records.append(rec)
    seen[slug] = rec
    seen[clean_name(c["name"]).lower()] = rec

# ---- source 2: collegedunia law -------------------------------------------
added = 0
for c in json.load(open("law_maharashtra.json")):
    name = clean_name(c["name"])
    if "pharmacy" in name.lower():          # misfiled in their law listing
        continue
    slug = slugify(name)
    key = name.lower()
    if slug in seen or key in seen:         # already have it; just enrich
        ex = seen.get(slug) or seen[key]
        ex["rating"] = ex["rating"] or c.get("rating")
        ex["reviews"] = ex["reviews"] or c.get("reviews") or 0
        ex["naac_grade"] = ex["naac_grade"] or c.get("naac_grade")
        continue

    fee = c.get("total_fee")
    bits = [f"{name} is a law institution based in {c.get('city')}, Maharashtra."]
    if c.get("naac_grade"):
        bits.append(f"It holds a NAAC {c['naac_grade']} accreditation.")
    if fee and c.get("fee_course"):
        bits.append(f"The {c['fee_course'].strip()} programme has a total fee of {fee}.")
    if c.get("rating") and c.get("reviews"):
        bits.append(f"It is rated {c['rating']}/5 by {c['reviews']} verified students.")

    records.append({
        "slug": slug, "name": name, "short_name": name,
        "city": c.get("city"), "state": "Maharashtra", "stream": "Law",
        "ownership": None, "type": None,
        "nirf_rank": None,
        "total_fee": fee, "total_fee_value": money(fee),
        "avg_ctc": None, "avg_ctc_value": None,
        "highest_package": None, "highest_package_value": None,
        "placement_rate": None, "placement_year": None, "total_offers": None,
        "tagline": None,
        "overview": " ".join(bits),
        "why_choose": None, "admission_process": None, "campus_life": None,
        "founded": None, "affiliation": None, "approved_by": None,
        "naac_grade": c.get("naac_grade"),
        "campus_size": None, "student_count": None, "faculty_count": None,
        "entrance_exams": ["CLAT", "MH CET Law"],
        "facilities": [], "selection_steps": [],
        "courses": ([{"name": c["fee_course"].strip(), "duration": None, "mode": None,
                      "total_fee": fee, "eligibility": None, "popular": True}]
                    if c.get("fee_course") else []),
        "faqs": [],
        "rating": c.get("rating"), "reviews": c.get("reviews") or 0,
        "source": "collegedunia",
    })
    added += 1

os.makedirs(os.path.dirname(OUT), exist_ok=True)
records.sort(key=lambda r: (r["stream"], r["nirf_rank"] or 999, r["name"]))
json.dump(records, open(OUT, "w"), indent=1, ensure_ascii=False)

import collections
print(f"wrote {len(records)} colleges -> {OUT}   (law added: {added})")
print("by stream:", dict(collections.Counter(r["stream"] for r in records)))
print("by city  :", dict(collections.Counter(r["city"] for r in records).most_common(8)))
print("\ncoverage:")
for f in ("overview", "courses", "faqs", "total_fee_value", "avg_ctc_value",
          "founded", "entrance_exams", "naac_grade", "rating"):
    print(f"  {f:18} {sum(1 for r in records if r.get(f)):3}/{len(records)}")
print("\nsize: %.1f KB" % (os.path.getsize(OUT) / 1024))
