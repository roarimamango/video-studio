"""Render the cut list as living sketches -> build/chunks/*.mp4 -> build/video_silent.mp4
Usage: python3 edit/render.py [--from S] [--to S] [--jobs 4] [--out PATH]
Per shot: paper-toned still, line boil on twos, grain flicker, eased camera move, optional ink draw-on.
If action/<shot>.mp4 exists (Kling/Hailuo clip), it is used instead of the still for that shot."""
import json, os, sys, subprocess, math, hashlib
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from multiprocessing import Pool
cv2.setNumThreads(1)
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
RAW = os.path.join(PROJ, "art", "raw"); BUILD = os.path.join(PROJ, "build"); ACTION = os.path.join(PROJ, "action")
FONT = os.path.join(HERE, "fonts")
W, H, FPS = 1920, 1080, 24
MARGIN = 1.14                       # prepared image is this much bigger than the frame (room to move)
PW, PH = int(W * MARGIN), int(H * MARGIN)
PAPER = np.array([0.965, 0.945, 0.905], np.float32)
XF = 6                              # crossfade frames between shots
ease = lambda t: t * t * (3 - 2 * t)

def arg(name, default):
    return type(default)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default

# ── shared noise fields (seeded, identical in every worker) ─────────────────
def fields():
    rng = np.random.default_rng(5)
    def smooth(shape, s):
        return cv2.GaussianBlur(rng.standard_normal(shape).astype(np.float32), (0, 0), s)
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    boil = []
    for _ in range(3):
        dx = cv2.resize(rng.standard_normal((H // 45 + 2, W // 45 + 2)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC) * 1.5
        dy = cv2.resize(rng.standard_normal((H // 45 + 2, W // 45 + 2)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC) * 1.5
        boil.append((gx + dx, gy + dy))
    grain = [(smooth((H, W), 0.8) * 0.03 + smooth((H, W), 3) * 0.018)[..., None] for _ in range(3)]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    vig = 1 - 0.10 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) ** 1.5
    return boil, grain, vig[..., None].astype(np.float32)

# ── shot sources ─────────────────────────────────────────────────────────────
def card_image(text):
    img = Image.new("RGB", (1344, 768), (255, 255, 255)); d = ImageDraw.Draw(img)
    lines = text.split("\n"); size = 150 if len(lines) == 1 else 104
    f = ImageFont.truetype(os.path.join(FONT, "SpecialElite.ttf"), size)
    hs = [d.textbbox((0, 0), l, font=f) for l in lines]; tot = sum(b[3] - b[1] for b in hs) + 40 * (len(lines) - 1)
    y = (768 - tot) / 2 - 20
    for l, b in zip(lines, hs):
        d.text(((1344 - (b[2] - b[0])) / 2 - b[0], y - b[1]), l, font=f, fill=(32, 28, 26)); y += b[3] - b[1] + 40
    # a rough brush underline
    rng = np.random.default_rng(len(text)); x0, x1 = 1344 * 0.30, 1344 * 0.70; yb = y + 30
    for k in range(5):
        pts = [(x, yb + rng.normal(0, 2.5) + 6 * math.sin(x / 90 + k)) for x in np.linspace(x0 + rng.normal(0, 8), x1 + rng.normal(0, 8), 30)]
        d.line(pts, fill=(150, 40, 38), width=int(rng.integers(3, 7)))
    return img.filter(ImageFilter.GaussianBlur(0.6))

def split_image(a, b):
    A = Image.open(os.path.join(RAW, a + ".png")).convert("RGB"); B = Image.open(os.path.join(RAW, b + ".png")).convert("RGB")
    w, h = A.size; img = Image.new("RGB", (w, h), (255, 255, 255))
    for k, src in enumerate((A, B)):
        c = src.crop((w // 4 - 10, 0, w // 4 * 3 - 10, h)) if k == 0 else src.crop((w // 4 + 10, 0, w // 4 * 3 + 10, h))
        img.paste(c, (k * (w // 2), 0))
    d = ImageDraw.Draw(img); rng = np.random.default_rng(3)
    for k in range(3):
        d.line([(w / 2 + rng.normal(0, 2), y) for y in np.linspace(-5, h + 5, 40)], fill=(40, 36, 34), width=int(rng.integers(3, 6)))
    return img

def source(shot):
    if shot.startswith("CARD:"): return card_image(shot[5:])
    if shot.startswith("SPLIT:"): return split_image(*shot[6:].split("|"))
    return Image.open(os.path.join(RAW, shot + ".png")).convert("RGB")

_cache = {}
def prepared(cut):
    key = (cut["shot"], cut.get("tint"), bool(cut.get("draw")))
    if key in _cache: return _cache[key]
    img = source(cut["shot"])
    sc = max(PW / img.width, PH / img.height)
    img = img.resize((round(img.width * sc), round(img.height * sc)), Image.LANCZOS)
    x0, y0 = (img.width - PW) // 2, (img.height - PH) // 2
    I = np.asarray(img.crop((x0, y0, x0 + PW, y0 + PH))).astype(np.float32) / 255
    I = I * PAPER                                                     # white -> paper tone
    if cut.get("tint") == "cold":
        g = I.mean(-1, keepdims=True); I = 0.45 * I + 0.55 * g * np.array([0.86, 0.93, 1.06], np.float32)
    P = {"I": I}
    if cut.get("draw"):
        rng = np.random.default_rng(int(hashlib.md5(cut["shot"].encode()).hexdigest()[:6], 16))
        L = I.mean(-1); P["ink"] = np.clip((0.60 - L) / 0.25, 0, 1)
        def nz(s): z = cv2.GaussianBlur(rng.standard_normal((PH, PW)).astype(np.float32), (0, 0), s); return (z - z.min()) / (z.max() - z.min())
        yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32); d = xx * 0.6 + yy; d = (d - d.min()) / (d.max() - d.min())
        o = 0.55 * nz(40) + 0.45 * d; P["ink_order"] = (o - o.min()) / (o.max() - o.min()); P["wash_order"] = nz(90)
    _cache.clear() if len(_cache) > 6 else None
    _cache[key] = P; return P

class Clip:
    """Frames from a user-supplied action clip, fitted to PWxPH."""
    def __init__(self, path):
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={PW}:{PH}:force_original_aspect_ratio=increase,crop={PW}:{PH},fps={FPS}",
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        self.last = None
    def frame(self):
        b = self.p.stdout.read(PW * PH * 3)
        if len(b) == PW * PH * 3: self.last = np.frombuffer(b, np.uint8).reshape(PH, PW, 3).astype(np.float32) / 255 * PAPER
        return self.last

# ── camera moves ─────────────────────────────────────────────────────────────
def camera(m, s, dur, f):
    t = min(1.0, s / max(dur, 0.01)); e = ease(t)
    z, dx, dy, rot = 1.0, 0.0, 0.0, 0.0
    if m == "in": z = 1.0 + 0.07 * e
    elif m == "out": z = 1.08 - 0.07 * e
    elif m == "left": z, dx = 1.06, 0.05 * (0.5 - e)
    elif m == "right": z, dx = 1.06, -0.05 * (0.5 - e)
    elif m == "up": z, dy = 1.06, 0.045 * (0.5 - e)
    elif m == "down": z, dy = 1.06, -0.045 * (0.5 - e)
    elif m == "rush": z = 1.0 + 0.12 * (1 - math.exp(-s * 3.5)) + 0.02 * e
    elif m == "shake":
        z = 1.05 + 0.03 * e; r = np.random.default_rng(f // 2)       # handheld jitter on twos
        dx, dy, rot = r.normal(0, 0.0025), r.normal(0, 0.0025), r.normal(0, 0.25)
    dx += 0.004 * math.sin(s * 0.5 + len(m)); dy += 0.003 * math.sin(s * 0.37)   # always a little drift
    return z, dx, dy, rot

def render_shot_frame(cut, P, s, f, F, clip=None):
    dur = cut["end"] - cut["start"]
    I = clip.frame() if clip is not None else P["I"]
    if I is None: I = P["I"]
    if cut.get("draw") and clip is None and s < 3.2:
        ir = np.clip((s - 0.05) / 1.5, 0, 1); wr = np.clip((s - 1.0) / 1.8, 0, 1)
        a_ink = np.clip((ir * 1.15 - P["ink_order"]) / 0.08, 0, 1)
        a_wash = np.clip((ease(wr) * 1.2 - P["wash_order"]) / 0.2, 0, 1)
        alpha = (P["ink"] * a_ink + (1 - P["ink"]) * a_wash)[..., None]
        I = PAPER + (I - PAPER) * alpha
    z, dx, dy, rot = camera(cut.get("m", "in"), s, dur, f)
    sc = z / MARGIN                                                   # PW->W at z=1
    M = cv2.getRotationMatrix2D((PW / 2, PH / 2), rot, sc)
    M[0, 2] += W / 2 - PW / 2 + dx * W; M[1, 2] += H / 2 - PH / 2 + dy * H
    O = cv2.warpAffine(I, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    bx, by = F["boil"][(f // 2) % 3]
    O = cv2.remap(O, bx, by, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return O

def render_range(job):
    a, b, out, cuts = job
    F = dict(zip(("boil", "grain", "vig"), fields()))
    ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    clips = {}
    def frame_of(i, f):
        c = cuts[i]; s = f / FPS - c["start"]
        clip = None
        path = os.path.join(ACTION, c["shot"] + ".mp4")
        if os.path.exists(path):
            if i not in clips: clips[i] = Clip(path)
            clip = clips[i]
        return render_shot_frame(c, prepared(c), s, f, F, clip)
    starts = [round(c["start"] * FPS) for c in cuts]
    for f in range(a, b):
        i = max(k for k in range(len(cuts)) if starts[k] <= f)
        O = frame_of(i, f)
        k = f - starts[i]
        if i and k < XF:                                              # crossfade from the previous shot
            w = ease((k + 1) / (XF + 1)); O = O * w + frame_of(i - 1, f) * (1 - w)
        O = O * F["vig"] + F["grain"][(f // 2) % 3]
        ff.stdin.write((np.clip(O, 0, 1) * 255).astype(np.uint8).tobytes())
    ff.stdin.close(); ff.wait(); return out

if __name__ == "__main__":
    cl = json.load(open(os.path.join(BUILD, "cutlist.json")))
    total = cl[-1]["end"]
    a, b = round(arg("--from", 0.0) * FPS), round(min(arg("--to", total), total) * FPS)
    jobs = arg("--jobs", 4); out = arg("--out", os.path.join(BUILD, "video_silent.mp4"))
    os.makedirs(os.path.join(BUILD, "chunks"), exist_ok=True)
    n = math.ceil((b - a) / jobs); tag = f"{a}_{b}"
    parts = [(a + k * n, min(b, a + (k + 1) * n), os.path.join(BUILD, "chunks", f"{tag}_{k:02d}.mp4"), cl) for k in range(jobs) if a + k * n < b]
    with Pool(len(parts)) as p: files = p.map(render_range, parts)
    lst = os.path.join(BUILD, "chunks", f"{tag}.txt"); open(lst, "w").write("".join(f"file '{x}'\n" for x in files))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out], check=True)
    print("wrote", out, f"{(b - a) / FPS:.1f}s")
