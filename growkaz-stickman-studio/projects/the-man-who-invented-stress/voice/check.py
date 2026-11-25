import json, re, sys, glob, difflib
from faster_whisper import WhisperModel
norm = lambda s: re.sub(r"[^a-z0-9' ]", " ", re.sub(r"\[[^\]]*\]", " ", s.lower()).replace("—"," ").replace("2 a.m.","two am").replace("two a.m.","two am").replace("forty-three","43")).split()
m = WhisperModel("small", device="cpu", compute_type="int8")
for f in sorted(sys.argv[1:]):
    scene = re.sub(r"_t\d+\.mp3$", "", f.split("/")[-1])
    lines = json.load(open(f"scenes/lines_t{re.search(r'_t(\d+)\.mp3$', f).group(1)}.json"))
    segs, info = m.transcribe(f, language="en", word_timestamps=True)
    words = [w for s in segs for w in s.words]
    got = norm(" ".join(w.word for w in words).replace("2 a.m.","two am").replace("2am","two am"))
    want = norm(" ".join(l["text"] for l in lines[scene]))
    sm = difflib.SequenceMatcher(None, want, got, autojunk=False)
    print(f"== {f.split('/')[-1]}  {info.duration:.1f}s  match {sm.ratio():.3f}")
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op != "equal": print(f"   {op:8s} script: {' '.join(want[a1:a2])!r:45.45s}  heard: {' '.join(got[b1:b2])!r}")
