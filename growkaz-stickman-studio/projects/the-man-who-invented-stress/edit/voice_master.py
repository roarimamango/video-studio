"""Join the woven v3 scenes into build/voice_main.wav + build/voice_ad.wav, and write build/lines.json
(every line with global start/end) and build/words.json (Whisper word timings on the master)."""
import json, glob, subprocess, numpy as np, os
SR = 44100; TAKE = "t3"
LEAD, TAIL = 1.0, 5.0
GAP_AFTER = {"01_cold_open": 3.6}          # room for the title card
DEFAULT_GAP = 1.6
def load(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                                        capture_output=True, check=True).stdout, np.float32)
main, ad, lines, scenes, t = [np.zeros(int(LEAD * SR), np.float32)], [np.zeros(int(LEAD * SR), np.float32)], [], [], LEAD
for f in sorted(glob.glob(f"voice/scenes/*_{TAKE}_woven.wav")):
    sc = os.path.basename(f).replace(f"_{TAKE}_woven.wav", "")
    m = load(f); a = load(f.replace(".wav", "_ad.wav")) if os.path.exists(f.replace(".wav", "_ad.wav")) else np.zeros_like(m)
    a = np.pad(a, (0, max(0, len(m) - len(a))))[:len(m)]
    for l in json.load(open(f"voice/scenes/{sc}_{TAKE}_timing.json")):
        lines.append({**l, "scene": sc, "start": round(l["start"] + t, 3), "end": round(l["end"] + t, 3)})
    scenes.append({"scene": sc, "start": round(t, 3), "end": round(t + len(m) / SR, 3)})
    gap = GAP_AFTER.get(sc, DEFAULT_GAP)
    main += [m, np.zeros(int(gap * SR), np.float32)]; ad += [a, np.zeros(int(gap * SR), np.float32)]
    t += len(m) / SR + gap
main, ad = np.concatenate(main), np.concatenate(ad)
pad = int((TAIL - DEFAULT_GAP) * SR); main = np.pad(main, (0, pad)); ad = np.pad(ad, (0, pad))
for x, name in ((main, "voice_main"), (ad, "voice_ad")):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", f"build/{name}.wav"], input=x.tobytes(), check=True)
json.dump({"duration": round(len(main) / SR, 3), "scenes": scenes, "lines": lines}, open("build/lines.json", "w"), indent=1)
from faster_whisper import WhisperModel
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/voice_main.wav", "-i", "build/voice_ad.wav", "-filter_complex", "amix=inputs=2:normalize=0", "build/voice_all.wav"], check=True)
segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe("build/voice_all.wav", language="en", word_timestamps=True)
words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
json.dump(words, open("build/words.json", "w"))
print(f"duration {len(main) / SR:.1f}s, {len(lines)} lines, {len(words)} words")
