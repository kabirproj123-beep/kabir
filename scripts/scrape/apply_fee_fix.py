"""Correct fees and placement figures in data/colleges.json.

The promoteducation-sourced `total_fee` proved unreliable and unlabelled (annual
and total figures mixed, sometimes neither). Collegedunia publishes an explicit
"<amount> <course> - Total Fees", which is comparable and checkable, so where a
college can be matched confidently we take its numbers and record which course
the fee is for.

  python3 apply_fee_fix.py           # report discrepancies, change nothing
  python3 apply_fee_fix.py --apply   # write the corrections

Colleges with no confident match keep their original figures but are flagged
`fee_confidence: "low"`, so the UI can say so rather than implying precision we
don't have.
"""
import json, os, re, sys
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
COLLEGES = os.path.join(ROOT, "data", "colleges.json")
FEES = os.path.join(HERE, "cd_fees.json")
APPLY = "--apply" in sys.argv

NOISE = re.compile(r"\s*-\s*\[[^\]]+\]|\(.*?\)", re.I)

# Localities that are part of a larger city. Our source records the suburb
# ("Narhe"), Collegedunia records the city ("Pune"); without this they look like
# different places and a real match is thrown away.
LOCALITY = {
    "narhe": "pune", "tathawade": "pune", "akurdi": "pune", "pimpri": "pune",
    "chinchwad": "pune", "talegaon": "pune", "hinjawadi": "pune", "warje": "pune",
    "kondhwa": "pune", "katraj": "pune", "lavale": "pune", "wakad": "pune",
    "worli": "mumbai", "bandra": "mumbai", "andheri": "mumbai", "sion": "mumbai",
    "powai": "mumbai", "matunga": "mumbai", "santacruz": "mumbai", "parel": "mumbai",
    "vile parle": "mumbai", "chembur": "mumbai", "ghatkopar": "mumbai",
}

# City names are never evidence that two colleges are the same institution —
# without this, "MET Institute of Management, Mumbai" matches "IIM Mumbai".
CITY_WORDS = set(LOCALITY) | {
    "pune", "mumbai", "nagpur", "thane", "nashik", "aurangabad", "kolhapur",
    "amravati", "solapur", "sangli", "satara", "latur", "wardha", "dhule",
    "ahmednagar", "jalgaon", "navi", "karad", "shirpur", "chiplun",
}


def norm_city(c):
    c = (c or "").strip().lower()
    return LOCALITY.get(c, c)
GENERIC = {
    "the", "of", "and", "for", "college", "institute", "university", "school",
    "deemed", "technology", "science", "sciences", "studies", "management",
    "engineering", "medical", "law", "pharmacy", "s", "dr", "shri", "smt",
    "maharashtra", "india", "indian", "national", "research", "centre", "center",
}


def clean(name):
    n = NOISE.sub(" ", name)
    # "IIT Bombay - Indian Institute of Technology" -> keep both halves
    return re.sub(r"\s+", " ", n).strip()


def toks(name):
    return {w for w in re.findall(r"[a-z]+", clean(name).lower()) if len(w) > 2}


def key_toks(name):
    return toks(name) - GENERIC


def score(a, b):
    """Similarity weighted towards distinctive words."""
    ta, tb = toks(a), toks(b)
    ka, kb = key_toks(a), key_toks(b)
    if not ta or not tb:
        return 0.0
    broad = len(ta & tb) / len(ta | tb)
    keyed = len(ka & kb) / max(1, len(ka | kb)) if (ka or kb) else 0.0
    seq = SequenceMatcher(None, " ".join(sorted(ta)), " ".join(sorted(tb))).ratio()
    return max(0.4 * broad + 0.6 * keyed, seq * 0.9)


def build_rarity(names):
    """Document frequency of each token across the candidate corpus.

    A shared *rare* token ("somaiya", "kashibai") is real evidence two names
    denote the same institution. A shared common token ("institute", "mumbai",
    "management") is not — that is how "MET Institute of Management" ends up
    matched to "IIM Mumbai".
    """
    df = {}
    for n in names:
        for t in toks(n):
            df[t] = df.get(t, 0) + 1
    return df, len(names)


def main():
    colleges = json.load(open(COLLEGES, encoding="utf-8"))
    rows = json.load(open(FEES, encoding="utf-8"))

    by_stream = {}
    for r in rows:
        by_stream.setdefault(r["stream"], []).append(r)

    df, total = build_rarity([r["name"] for r in rows])
    # A token in under 3% of names is distinctive enough to be evidence.
    RARE_MAX = max(2, int(total * 0.03))

    def shared_rare(a, b):
        return {
            t for t in (toks(a) & toks(b))
            if df.get(t, 0) <= RARE_MAX
        } - GENERIC - CITY_WORDS

    matched, changes = 0, []

    for c in colleges:
        pool = by_stream.get(c["stream"], [])
        best, best_s = None, 0.0
        best_rare = set()
        for r in pool:
            # City must agree when both sides state one. Campuses of the same
            # university in different cities have different fees — MNLU Nagpur
            # must never inherit MNLU Aurangabad's numbers.
            ca, cb = norm_city(c.get("city")), norm_city(r.get("city"))
            if ca and cb and ca != cb:
                continue
            # Must share a distinctive word, not just "institute"/"mumbai".
            rare = shared_rare(c["name"], r["name"])
            if not rare:
                continue
            s = score(c["name"], r["name"])
            if s > best_s:
                best, best_s, best_rare = r, s, rare

        # A single shared surname is weak evidence on its own: "Symbiosis
        # Institute of Technology" and "Symbiosis International University" are
        # different institutions. Marginal scores need corroboration.
        if not best or best_s < 0.45 or (best_s < 0.55 and len(best_rare) < 2):
            c["fee_confidence"] = "low"
            continue

        matched += 1
        old = c.get("total_fee_value")
        new = best.get("total_fee_value")
        if new and old != new:
            changes.append((c["name"], old, new, best["fee_course"]))

        if new:
            c["total_fee_value"] = new
            c["total_fee"] = f"₹{new:,}".replace(",", ",")
            c["fee_course"] = best.get("fee_course")
            c["fee_confidence"] = "high"
            c["fee_source"] = "collegedunia"
        if best.get("avg_ctc_value"):
            c["avg_ctc_value"] = best["avg_ctc_value"]
            c["avg_ctc"] = None  # recomputed for display from the value
        if best.get("highest_package_value"):
            c["highest_package_value"] = best["highest_package_value"]
        if best.get("placement_rate"):
            c["placement_rate"] = best["placement_rate"]
        if best.get("rating") and not c.get("rating"):
            c["rating"] = best["rating"]

    print(f"matched {matched}/{len(colleges)} colleges to a labelled fee\n")
    print(f"{len(changes)} fee corrections:")
    for name, old, new, course in sorted(changes, key=lambda x: -(x[2] / max(1, x[1] or 1)))[:25]:
        factor = f"{new / old:.1f}x" if old else "new"
        print(f"  {name[:40]:42} {str(old):>10} -> {new:>10}  ({factor})  [{(course or '')[:28]}]")

    lo = sum(1 for c in colleges if c.get("fee_confidence") == "low")
    print(f"\n{lo} colleges keep unverified figures (flagged fee_confidence=low)")

    if not APPLY:
        print("\n(dry run — pass --apply to write)")
        return

    json.dump(colleges, open(COLLEGES, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("\nwritten to data/colleges.json")


if __name__ == "__main__":
    main()
