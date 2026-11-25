"""Split a dialogue scene into lines (Whisper word timing) and re-lay them so `~` lines
overlap the previous line and lines after a cut-off (—) jump in early.
Writes scenes/<scene>_t<N>_woven.wav and scenes/<scene>_t<N>_timing.json (line start/end in the woven file)."""
import json, re, sys, subprocess, difflib, numpy as np
from faster_whisper import WhisperModel
SR = 44100
OVERLAP, CUTOFF = 0.30, 0.15     # seconds the next voice starts before the previous one ends
norm = lambda s: re.sub(r"[^a-z0-9' ]", " ", re.sub(r"\[[^\]]*\]", " ", s.lower()).replace("—", " ")
                        .replace("two a.m.", "two am").replace("2 a.m.", "two am")).split()
def load(f):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
m = WhisperModel("small", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    scene, take = re.match(r".*/(\w+?)_t(\d+)\.mp3$", f).groups()
    lines = json.load(open(f"scenes/lines_t{take}.json"))[scene]
    audio = load(f)
    segs, _ = m.transcribe(f, language="en", word_timestamps=True)
    words = [w for s in segs for w in s.words]
    got, gt = [], []
    for w in words:
        for t in norm(w.word): got.append(t); gt.append((w.start, w.end))
    want, owner = [], []
    for i, l in enumerate(lines):
        for t in norm(l["text"]): want.append(t); owner.append(i)
    span = [None] * len(lines)
    for a, b, n in difflib.SequenceMatcher(None, want, got, autojunk=False).get_matching_blocks():
        for k in range(n):
            i, (s, e) = owner[a + k], gt[b + k]
            span[i] = (min(s, span[i][0]), max(e, span[i][1])) if span[i] else (s, e)
    dur = len(audio) / SR
    # cut points between consecutive lines (in silence); wordless lines (breaths) get the gap around them
    known = [i for i in range(len(lines)) if span[i]]
    cuts = [0.0]
    for i in range(len(lines) - 1):
        if span[i] and span[i + 1]:
            cuts.append((span[i][1] + span[i + 1][0]) / 2)
        else:
            prev_end = max([span[j][1] for j in known if j <= i] or [0])
            nxt = [span[j][0] for j in known if j > i]
            nxt_start = nxt[0] if nxt else dur
            if not span[i + 1]:  cuts.append(prev_end + 0.08)
            else:                cuts.append(nxt_start - 0.08)
    cuts.append(dur)
    # snap each inner cut to the quietest 20 ms window within ±0.25 s
    win = int(0.02 * SR)
    for k in range(1, len(cuts) - 1):
        lo, hi = int(max(0, cuts[k] - 0.25) * SR), int(min(dur, cuts[k] + 0.25) * SR)
        if hi - lo > win:
            e = np.convolve(audio[lo:hi] ** 2, np.ones(win), "valid")
            cuts[k] = (lo + int(e.argmin()) + win // 2) / SR
    cuts = [max(cuts[k], cuts[k - 1] + 0.05) if k else cuts[k] for k in range(len(cuts))]
    out, timing, cursor, prev_end_out = np.zeros(int((dur + 2) * SR), np.float32), [], 0.0, 0.0
    for i, l in enumerate(lines):
        a, b = cuts[i], cuts[i + 1]
        seg = audio[int(a * SR):int(b * SR)].copy()
        fade = min(len(seg) // 2, int(0.01 * SR))
        if fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        place = cursor
        if i and span[i] and span[i - 1]:
            pull = OVERLAP if l["overlap"] else CUTOFF if lines[i - 1]["text"].rstrip().endswith(("—", "—!")) else None
            if pull is not None:   # put this line's first word `pull` s before the previous line's last word ends
                place = prev_end_out - pull - (span[i][0] - a)
        s0 = int(place * SR); out[s0:s0 + len(seg)] += seg
        cursor = place + (b - a)
        ws, we = span[i] if span[i] else (a, b)
        timing.append({"line": i, "speaker": l["speaker"], "text": l["text"], "start": round(place + ws - a, 3), "end": round(place + we - a, 3)})
        prev_end_out = place + we - a
    out = out[:int((cursor + 0.05) * SR)]
    out /= max(1.0, np.abs(out).max() / 0.98)
    base = f"scenes/{scene}_t{take}"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", f"{base}_woven.wav"],
                   input=out.tobytes(), check=True)
    json.dump(timing, open(f"{base}_timing.json", "w"), indent=1)
    missing = [i for i in range(len(lines)) if not span[i]]
    print(f"{scene}: {dur:.1f}s -> {cursor:.1f}s, overlaps {sum(l['overlap'] for l in lines)}, wordless lines {missing}")
