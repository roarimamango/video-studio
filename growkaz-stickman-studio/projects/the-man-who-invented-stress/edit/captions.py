"""out/captions.srt from the script lines (exact wording) timed by the line timings; long lines are split
into ~2-line cues by distributing time over the words."""
import json, re, os
L = json.load(open("build/lines.json"))["lines"]
clean = lambda t: re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", t)).replace(" ,", ",").strip()
def ts(s): h, r = divmod(s, 3600); m, r = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(r):02d},{int(round((r % 1) * 1000)) % 1000:03d}"
cues = []
for l in L:
    text = clean(l["text"])
    if not re.search(r"[A-Za-z]{2}", text) or text.lower().startswith("hhh"): continue
    words = text.split(); chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(" ".join(cur)) > 70 or (len(" ".join(cur)) > 40 and w[-1] in ".?!—"): chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    dur = l["end"] - l["start"]; n = sum(len(c) for c in chunks); t = l["start"]
    for c in chunks:
        d = dur * len(c) / n; s = " ".join(c)
        if len(s) > 38:   # two lines
            mid = min(range(len(c)), key=lambda k: abs(len(" ".join(c[:k])) - len(s) / 2)); s = " ".join(c[:mid]) + "\n" + " ".join(c[mid:])
        cues.append((t, t + d, s)); t += d
with open("out/captions.srt", "w") as f:
    for i, (a, b, s) in enumerate(cues, 1): f.write(f"{i}\n{ts(a)} --> {ts(max(b, a + 0.7))}\n{s}\n\n")
print(len(cues), "cues")
