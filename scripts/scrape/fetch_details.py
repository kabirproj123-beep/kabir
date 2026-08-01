"""Fetch promoteducation.com detail pages for the 165 Maharashtra colleges.

Resumable: skips any slug whose HTML is already on disk with a sane size.
Polite: 4 workers, small jitter-free delay between requests per worker.
"""
import json, os, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

OUT = "detail"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
BASE = "https://promoteducation.com/colleges/"
MIN_OK = 40_000          # anything smaller is a 404 shell (~17KB)

os.makedirs(OUT, exist_ok=True)
colleges = json.load(open("mh_list.json"))


def fetch(c):
    slug = c["slug"]
    path = os.path.join(OUT, slug + ".html")
    if os.path.exists(path) and os.path.getsize(path) > MIN_OK:
        return slug, "cached", os.path.getsize(path)
    req = urllib.request.Request(BASE + slug, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
    })
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                body = r.read()
            if len(body) < MIN_OK:
                return slug, "toosmall", len(body)
            with open(path, "wb") as f:
                f.write(body)
            time.sleep(0.6)
            return slug, "ok", len(body)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return slug, "404", 0
            time.sleep(2 * (attempt + 1))
        except Exception:
            time.sleep(2 * (attempt + 1))
    return slug, "fail", 0


if __name__ == "__main__":
    results = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        for i, (slug, status, size) in enumerate(ex.map(fetch, colleges), 1):
            results.append({"slug": slug, "status": status, "size": size})
            if status not in ("ok", "cached") or i % 25 == 0:
                print(f"[{i}/{len(colleges)}] {status:8} {slug}", flush=True)
    json.dump(results, open("fetch_report.json", "w"), indent=1)
    from collections import Counter
    print("DONE", Counter(r["status"] for r in results))
