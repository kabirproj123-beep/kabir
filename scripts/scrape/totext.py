import re,sys,html
s=open(sys.argv[1],encoding='utf-8',errors='ignore').read()
s=re.sub(r'<script.*?</script>','',s,flags=re.S)
s=re.sub(r'<style.*?</style>','',s,flags=re.S)
s=re.sub(r'<svg.*?</svg>',' ',s,flags=re.S)
s=re.sub(r'<[^>]+>','\n',s)
s=html.unescape(s)
lines=[l.strip() for l in s.split('\n')]
out=[];prev=''
for l in lines:
    if l and l!=prev:
        out.append(l);prev=l
print('\n'.join(out))
