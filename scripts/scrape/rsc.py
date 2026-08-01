import re, json, sys, html

def payload(path):
    s = open(path, encoding='utf-8', errors='ignore').read()
    parts = re.findall(r'self\.__next_f\.push\(\[1,\s*(".*?")\]\)', s, re.S)
    out = []
    for p in parts:
        try:
            out.append(json.loads(p))
        except Exception:
            pass
    return ''.join(out)

if __name__ == '__main__':
    t = payload(sys.argv[1])
    open(sys.argv[2], 'w').write(t)
    print(len(t))
