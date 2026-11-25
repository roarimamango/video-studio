"""Soundtrack: voice (+ old-radio AD voice) + generated score + SFX/ambience, ducked and mastered.
Writes build/mix.wav and, if build/video_silent.mp4 exists, out/The_Man_Who_Invented_Stress.mp4"""
import json, os, re, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
STUDIO = os.path.abspath(os.path.join(PROJ, "..", ".."))
sys.path[:0] = [os.path.join(STUDIO, "audio"), os.path.join(STUDIO, "tools")]
from dsp import SR, secs, db, place, write_wav, as_stereo, reverb, bp, hp, lp, rms_db, fade
from common import load_audio
import sfx as LIB, music as MUSIC
B = lambda *p: os.path.join(PROJ, "build", *p)

words = json.load(open(B("words.json"))); L = json.load(open(B("lines.json"))); cuts = json.load(open(B("cutlist.json")))
TOTAL = L["duration"]; N = secs(TOTAL)
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
toks = [norm(w["w"]) for w in words]
_cur = [0]
def at(phrase, off=0.0, end=False):
    """time of the next occurrence of phrase (searching forward, in script order)."""
    want = [norm(x) for x in phrase.split() if norm(x)]
    for i in range(_cur[0], len(toks)):
        if all(i + k < len(toks) and toks[i + k] == want[k] for k in range(len(want))):
            _cur[0] = i
            return (words[i + len(want) - 1]["e"] if end else words[i]["s"]) + off
    raise SystemExit(f"cue not found: {phrase!r} after {words[_cur[0]]['s']:.1f}s")
def cut_start(shot, nth=0):
    return [c["start"] for c in cuts if c["shot"] == shot][nth]
def line_time(text_start, which="start"):
    return next(l[which] for l in L["lines"] if l["text"].startswith(text_start))
def mp3(name): return load_audio(os.path.join(PROJ, "sfx", name + ".mp3"), SR, mono=False)

# ── voice ────────────────────────────────────────────────────────────────────
vmain = load_audio(B("voice_main.wav"), SR); vad = load_audio(B("voice_ad.wav"), SR)
vmain, vad = np.pad(vmain, (0, max(0, N - len(vmain))))[:N], np.pad(vad, (0, max(0, N - len(vad))))[:N]
voice = reverb(hp(vmain, 70), size=0.6, wet=0.07, damp=6000)
radio = np.tanh(bp(vad, 380, 3300, order=4) * 3.0) / 2.2                 # old radio: narrow band + valve-ish drive
echo_t = line_time("Light up. Relax.") if any(l["text"].startswith("Light up. Relax.") for l in L["lines"]) else None
radio_s = as_stereo(radio)
if echo_t is not None:                                                    # the memory echo: drenched and far away
    a = secs(echo_t - 0.2); radio_s[a:] = reverb(radio[a:] * 0.8, size=2.8, wet=0.55, damp=2500)
voice = voice + radio_s

# ── music plan ───────────────────────────────────────────────────────────────
title_t = cut_start("CARD:The Man Who\nInvented Stress")
plan_pts = [
 (0.0, "dark", 0.22),
 (title_t, "playful", 0.35),
 (at("Then he opens"), "mystery", 0.45),
 (at("It wasn't the extract"), "wonder", 0.35),
 (at("caught on", -1.0), "wonder", 0.45),
 (at("San Francisco", -1.0), "playful", 0.40),
 (at("As Friedman later"), "tension", 0.45),
 (at("And for a while"), "calm", 0.25),
 (at("Now. Think", -1.0), "dark", 0.50),
 (at("So the cigarette", -0.8), "sad", 0.35),
 (at("In 2012", -1.0), "mystery", 0.35),
 (at("But here's what nobody", -0.5), "wonder", 0.50),
 (at("rats got sick", -2.0), "calm", 0.30),
 (at("not a body breaking", -0.5), "hopeful", 0.45),
]
plan = [{"start": s, "end": (plan_pts[i + 1][0] if i + 1 < len(plan_pts) else TOTAL), "mood": m, "intensity": k} for i, (s, m, k) in enumerate(plan_pts)]
music = MUSIC.render_score(plan, TOTAL, seed=7, key=None)[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0)))

# ── SFX + ambience ───────────────────────────────────────────────────────────
fx = np.zeros((N, 2), np.float32); amb = np.zeros((N, 2), np.float32)
def put(buf, x, t, gain_db, fin=0.02, fout=0.3, dur=None):
    x = as_stereo(x)
    if dur: x = x[:secs(dur)]
    place(buf, fade(x, fin, min(fout, len(x) / SR / 2)), secs(t), db(gain_db))
def bed(name, t0, t1, gain_db, fin=1.5, fout=2.0, **kw):
    """loop an ambience between t0 and t1."""
    src = mp3(name) if os.path.exists(os.path.join(PROJ, "sfx", name + ".mp3")) else LIB.make(name, dur=min(12, t1 - t0 + 1), **kw)
    n = secs(t1 - t0); reps = int(np.ceil(n / len(src))) + 1
    x = np.concatenate([src] * reps)[:n]
    put(amb, x, t0, gain_db, fin, fout)

_cur[0] = 0
# cold open: night room, soft clock, racing heart
bed("night_room", 0, title_t + 1, -22)
put(fx, LIB.make("clock", dur=24, rate=1.0), 0.5, -26, fout=3)
put(fx, LIB.make("heartbeat", dur=24, bpm=112), at("Why is my heart", -0.4), -13, fin=1.5, fout=4)
put(fx, mp3("ink_brush"), cut_start("CARD:stress") + 0.1, -14)
bed("wind", at("bridge", -0.5), at("Then one clumsy"), -24)
put(fx, LIB.make("shimmer"), title_t + 0.2, -20); put(fx, mp3("ink_brush"), title_t + 0.15, -12)
# act one
act1 = next(s for s in L["scenes"] if s["scene"].startswith("02")); bed("roomtone", act1["start"], act1["end"] + 1, -30)
put(fx, mp3("rat_squeaks"), at("No, no, no"), -12)
put(fx, mp3("broom_clatter"), at("Come back", 0.2), -10)
put(fx, mp3("rat_squeaks"), at("Come back here", 0.3), -16)
put(fx, LIB.make("shimmer"), at("It worked", -0.1), -22)
put(fx, mp3("rat_squeaks"), at("the dropping"), -15, dur=0.9)
put(fx, mp3("broom_clatter"), at("the chasing"), -14, dur=1.0)
put(fx, mp3("pen_scribble"), at("Cold", -0.5), -15)
put(fx, LIB.make("wind", dur=2.5), at("Cold"), -18)
put(fx, mp3("typewriter"), at("In 1936", -0.2), -13)
put(fx, LIB.make("applause", dur=4, density=40), at("And he spent the rest", 0.5), -26, fin=1.0, fout=2.0)
# act two
put(fx, mp3("paper_shuffle"), at("By the 1950s"), -16)
bed("city", at("By the 1950s"), at("So this is his fault"), -26)
# act three
put(fx, mp3("cable_car_bell"), at("San Francisco", -0.3), -14)
t_sf, t_chairs = at("San Francisco"), at("Their chairs need")
bed("city", t_sf, t_chairs, -24)
put(fx, LIB.make("clock", dur=14, rate=1.0), t_chairs, -28, fout=2)
t_fried = at("As Friedman later"); _cur[0] = next(i for i, w in enumerate(words) if w["s"] >= t_chairs)
bed("murmur", t_chairs, t_fried, -30)
put(fx, mp3("chair_creak"), at("Huh", 0.1), -13)
put(fx, mp3("chair_creak"), at("Nobody sat back", 0.2), -12)
put(fx, LIB.make("whoosh"), cut_start("37_rush") - 0.15, -16)
put(fx, LIB.make("footstep", dur=0.3), cut_start("37_rush") + 0.3, -20)
put(fx, LIB.make("hit"), at("Type A", 0.05), -16)
# act four
ad = [l for l in L["lines"] if l["speaker"] == "AD VOICE"]
for l in ad: put(amb, mp3("radio_static"), l["start"] - 0.4, -20 if l is ad[0] else -28, fin=0.3, fout=1.0, dur=l["end"] - l["start"] + 1.0)
put(fx, mp3("lighter"), at("Light up", -0.3), -12)
put(fx, mp3("paper_shuffle"), at("Decades later", 0.6), -15)
put(fx, mp3("pen_scribble"), at("In 1958", 0.8), -18, dur=2.0)
t_court = at("in court", -0.2); bed("murmur", t_court, at("He didn't publicly"), -26, fin=0.4, fout=0.8)
put(fx, LIB.make("impact"), at("So the cigarette", -0.6), -24)
# act five
put(fx, mp3("pen_scribble"), at("In 2012", 1.5), -20, dur=2.0)
put(fx, LIB.make("clock", dur=5, rate=1.0), at("Then the researchers"), -22, fout=1.5)
bed("wind", at("Then the researchers"), at("That's me"), -28)
put(fx, LIB.make("riser", dur=2.0), at("But here's what nobody", -1.6), -24)
# ending
put(fx, LIB.make("heartbeat", dur=6, bpm=78), at("Your heart speeds", 0.0), -16, fin=0.5, fout=2)
put(fx, LIB.make("whoosh"), at("getting ready", 0.0), -18)
bed("dawn_birds", at("Okay", -1.0), TOTAL, -22, fin=3, fout=4)

# ── mix ──────────────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.join(STUDIO, "audio")); from mix import envelope
env = envelope(np.abs(vmain) + np.abs(vad))[:N][:, None]
mix = voice + music * db(-5) * (1 - 0.62 * env) + fx + amb * (1 - 0.35 * env)
k = secs(3); mix[-k:] *= np.linspace(1, 0, k)[:, None]
write_wav(B("mix_raw.wav"), mix * 0.5)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", B("mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), B("mix.wav")], check=True)
print("wrote", B("mix.wav"), f"{TOTAL:.1f}s")
if os.path.exists(B("video_silent.mp4")) and "--no-mux" not in sys.argv:
    os.makedirs(os.path.join(PROJ, "out"), exist_ok=True); out = os.path.join(PROJ, "out", "The_Man_Who_Invented_Stress.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", B("video_silent.mp4"), "-i", B("mix.wav"), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
    print("wrote", out)
