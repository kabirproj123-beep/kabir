"""Parse Collegedunia Maharashtra listings for fees and placement figures.

Why this exists: the fee field taken from promoteducation.com turned out to be
unreliable. For IIT Bombay it gives "₹3 Lakhs" as the total, its own course
table says "₹75,000", and its comparison widget says "₹2.2L/yr" — three numbers
for one college, none of them the real ~₹12L four-year total. The figures were
also unlabelled, so annual and total fees were mixed together.

Collegedunia states fees explicitly as "<amount> <course> - Total Fees", which
is both checkable and comparable. This parses those rows so `apply_fee_fix.py`
can correct the dataset.

Input : cd_<stream>.txt  (plain text of a saved listing page, via totext.py)
Output: cd_fees.json
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
STREAMS = {
    "engineering": "Engineering",
    "management": "Management",
    "medical": "Medical",
    "law": "Law",
}

RANK = re.compile(r"^#(\d{1,3})$")
NUM = re.compile(r"^[\d,]+$")
PCT = re.compile(r"^(\d{1,3})%\s*Placement$")


def money(tok):
    return int(tok.replace(",", "")) if NUM.match(tok) else None


def value_before(block, label, offset=1):
    """The numeric token `offset` positions before `label`."""
    for i, t in enumerate(block):
        if t == label:
            j = i - offset
            if 0 <= j < len(block):
                return money(block[j])
    return None


def parse(path, stream):
    lines = [l.strip() for l in open(path, encoding="utf-8").read().split("\n")]
    starts = [
        i for i, l in enumerate(lines)
        if RANK.match(l) and i + 1 < len(lines) and len(lines[i + 1]) > 6 and not NUM.match(lines[i + 1])
    ]

    out = []
    for n, i in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else min(i + 70, len(lines))
        block = lines[i:end]
        if "Maharashtra" not in block:
            continue

        name = block[1]
        city = None
        for j in range(2, min(8, len(block))):
            if block[j] == "," and j + 1 < len(block) and block[j + 1] != "Maharashtra":
                city = block[j + 1]
                break

        # "₹ | 11,95,800 | B.Tech Computer Science and Engineering | - Total Fees"
        fee = course = None
        for j, t in enumerate(block):
            if t == "- Total Fees" and j >= 2:
                course = block[j - 1]
                fee = money(block[j - 2])
                break

        placement = None
        for t in block:
            m = PCT.match(t)
            if m:
                placement = int(m.group(1))
                break

        rating = None
        for j, t in enumerate(block):
            if t == "/ 5" and j > 0:
                try:
                    rating = float(block[j - 1])
                except ValueError:
                    pass
                break

        out.append({
            "cd_rank": int(RANK.match(block[0]).group(1)),
            "name": name,
            "city": city,
            "stream": stream,
            "total_fee_value": fee,
            "fee_course": course,
            "avg_ctc_value": value_before(block, "Average Package"),
            "highest_package_value": value_before(block, "Highest Package"),
            "placement_rate": placement,
            "rating": rating,
        })
    return out


if __name__ == "__main__":
    import glob

    PAGES = os.path.join(HERE, "cd_pages")
    allrows, seen = [], {}

    for key, stream in STREAMS.items():
        # page 1 is cd_<stream>.txt; further pages are cdp_<stream>_<n>.txt
        paths = sorted(glob.glob(os.path.join(PAGES, f"cd_{key}.txt"))) + sorted(
            glob.glob(os.path.join(PAGES, f"cdp_{key}_*.txt"))
        )
        rows = []
        for p in paths:
            rows += parse(p, stream)

        # the same college can appear on more than one page; keep the richest row
        for r in rows:
            k = (stream, r["name"].lower())
            prev = seen.get(k)
            if prev is None or (r["total_fee_value"] and not prev["total_fee_value"]):
                seen[k] = r

        got = sum(1 for r in rows if r["total_fee_value"])
        print(f"{stream:12} {len(paths):2} pages, {len(rows):3} rows, {got:3} with fees")

    allrows = list(seen.values())
    json.dump(allrows, open(os.path.join(HERE, "cd_fees.json"), "w"), indent=1, ensure_ascii=False)
    withfee = sum(1 for r in allrows if r["total_fee_value"])
    print(f"\n{len(allrows)} unique colleges ({withfee} with fees) -> cd_fees.json")
    for r in allrows[:5]:
        print(f"  {r['name'][:44]:46} {r['total_fee_value']}  ({r['fee_course']})")
