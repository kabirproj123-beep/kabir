"""Parse the Collegedunia Maharashtra-law listing into structured records.

The rendered text is highly regular:
    #1 / <name> / , / <city> / , / Maharashtra / ... / NAAC / <grade>
    / ₹ / <fee> / <course> / - Total Fees / ... / <rating> / / 5 / Based on / <n>
"""
import re, json

lines = [l.strip() for l in open("law_cd.txt", encoding="utf-8").read().split("\n")]

RANK = re.compile(r"^#(\d{1,3})$")
NUMERIC = re.compile(r"^[\d,]+$")

# indices of each listing row header
starts = [i for i, l in enumerate(lines) if RANK.match(l) and i + 1 < len(lines)
          and len(lines[i + 1]) > 6 and not NUMERIC.match(lines[i + 1])]

records = []
for n, i in enumerate(starts):
    end = starts[n + 1] if n + 1 < len(starts) else min(i + 60, len(lines))
    block = lines[i:end]
    name = block[1]
    if "Maharashtra" not in block:
        continue

    # city = token right after the first comma following the name
    city = None
    for j in range(2, min(8, len(block))):
        if block[j] == "," and j + 1 < len(block) and block[j + 1] != "Maharashtra":
            city = block[j + 1]
            break

    def after(label, cast=str):
        for j, t in enumerate(block):
            if t == label and j + 1 < len(block):
                return block[j + 1]
        return None

    # fee: the token after the ₹ marker
    fee = None
    for j, t in enumerate(block):
        if t == "₹" and j + 1 < len(block) and NUMERIC.match(block[j + 1]):
            fee = "₹" + block[j + 1]
            course = block[j + 2] if j + 2 < len(block) else None
            break
    else:
        course = None

    naac = after("NAAC")
    if naac and (len(naac) > 3 or naac == "₹"):
        naac = None

    # rating: token immediately before "/ 5"
    rating = None
    for j, t in enumerate(block):
        if t == "/ 5" and j > 0:
            try:
                rating = float(block[j - 1])
            except ValueError:
                pass
            break

    reviews = None
    for j, t in enumerate(block):
        if t == "Based on" and j + 1 < len(block) and NUMERIC.match(block[j + 1]):
            reviews = int(block[j + 1].replace(",", ""))
            break

    cd_score = None
    for j, t in enumerate(block):
        if t == "CD Score:" and j + 1 < len(block) and NUMERIC.match(block[j + 1]):
            cd_score = int(block[j + 1].replace(",", ""))
            break

    records.append({
        "cd_rank": int(RANK.match(block[0]).group(1)),
        "name": name,
        "city": city,
        "state": "Maharashtra",
        "stream": "Law",
        "naac_grade": naac,
        "total_fee": fee,
        "fee_course": course,
        "rating": rating,
        "reviews": reviews,
        "cd_score": cd_score,
        "source": "collegedunia",
    })

# de-dupe by name, keep best rank
seen = {}
for r in records:
    k = r["name"].lower()
    if k not in seen or r["cd_rank"] < seen[k]["cd_rank"]:
        seen[k] = r
records = sorted(seen.values(), key=lambda r: r["cd_rank"])

json.dump(records, open("law_maharashtra.json", "w"), indent=1, ensure_ascii=False)
print(f"parsed {len(records)} Maharashtra law colleges")
for f in ("city", "total_fee", "naac_grade", "rating", "reviews"):
    print(f"  {f:12} {sum(1 for r in records if r.get(f)):3}/{len(records)}")
print()
for r in records[:15]:
    print(f"  #{r['cd_rank']:<3} {r['name'][:52]:54} {str(r['city'])[:12]:14}"
          f"{str(r['total_fee']):12} {r['naac_grade'] or '-':3} {r['rating'] or '-'}")
