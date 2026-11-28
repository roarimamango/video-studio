# Technicolor test animator: multiplane parallax (depth layers move at different speeds), cartoon "bounce" on the
# foreground, and a vintage three-strip film treatment (grade, halation, gate weave, flicker, grain, dust, scratches).
# usage: python3 animate.py OUT.mp4 img1.png:move img2.png:move ...   (move = left | right | in)
import sys, numpy as np, cv2, subprocess, math, torch
from PIL import Image
from transformers import pipeline
W, H, FPS, SEC = 1920, 1080, 24, 6
OUT, ITEMS = sys.argv[1], [a.split(":") for a in sys.argv[2:]]
depth_pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
ease = lambda t: t * t * (3 - 2 * t)
rng = np.random.default_rng(1)
grains = [cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)[..., None] * 0.045 for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
vig = (1 - 0.32 * (((xx - W / 2) / (W * 0.72)) ** 2 + ((yy - H / 2) / (H * 0.72)) ** 2))[..., None]

def grade(I):
    hsv = cv2.cvtColor(I, cv2.COLOR_RGB2HSV); hsv[..., 1] = np.clip(hsv[..., 1] * 1.28, 0, 1); I = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    I = np.clip((I - 0.5) * 1.12 + 0.5, 0, 1); I = I ** np.array([0.95, 1.0, 1.06], np.float32)        # contrast, warm mids
    hi = np.clip((I.mean(-1, keepdims=True) - 0.72) / 0.28, 0, 1) * I
    I = I + cv2.GaussianBlur(hi, (0, 0), 18) * np.array([0.55, 0.22, 0.10], np.float32) * 0.6          # red halation glow
    return np.clip(I * np.array([1.02, 0.99, 0.94], np.float32), 0, 1)

ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
f_global = 0; weave = np.zeros(2)
for path, move in ITEMS:
    M = 1.12
    img = Image.open(path).convert("RGB"); img = img.resize((int(W * M), int(W * M * img.height / img.width)), Image.LANCZOS)
    if img.height < H * M: img = img.resize((int(img.width * H * M / img.height), int(H * M)), Image.LANCZOS)
    I = grade(np.asarray(img).astype(np.float32) / 255); h, w = I.shape[:2]
    D = np.asarray(depth_pipe(Image.fromarray((I * 255).astype(np.uint8)))["depth"].resize((w, h))).astype(np.float32)
    D = cv2.GaussianBlur((D - D.min()) / (D.max() - D.min()), (0, 0), 5)        # 1 = near
    fg = np.clip((D - 0.55) / 0.15, 0, 1)
    ys = np.where(fg.max(1) > 0.5)[0]; base_y = ys.max() if len(ys) else h * 0.9   # bottom of the foreground (for the bounce)
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    for f in range(FPS * SEC):
        s = f / FPS; e = ease(f / (FPS * SEC - 1))
        pan = {"left": 1, "right": -1}.get(move, 0) * (e - 0.5)
        z = 1.0 + (0.08 * e if move == "in" else 0.02)
        # source coords for each output pixel (camera), then per-depth parallax offset (multiplane)
        sx = w / 2 + (gx - W / 2) / z; sy = h / 2 + (gy - H / 2) / z
        sx, sy = sx.astype(np.float32), sy.astype(np.float32)
        d = cv2.remap(D, sx, sy, cv2.INTER_LINEAR); fgm = cv2.remap(fg.astype(np.float32), sx, sy, cv2.INTER_LINEAR)
        sx = sx - pan * (40 + 110 * d) - (gx - W / 2) * 0.04 * d * (e if move == "in" else 0)
        bounce = 0.018 * math.sin(2 * math.pi * s / 1.1) ** 2                    # idle squash & stretch, cartoon-style
        sy = sy + fgm * (sy - base_y) * bounce
        weave = 0.85 * weave + 0.15 * rng.normal(0, 1.6, 2)                    # gate weave
        O = cv2.remap(I, (sx + weave[0]).astype(np.float32), (sy + weave[1]).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        O = O * (1 + 0.035 * rng.normal()) * vig + grains[rng.integers(6)]     # flicker, vignette, grain
        O = np.clip(O, 0, 1); O8 = (O * 255).astype(np.uint8)
        for _ in range(rng.poisson(1.2)):                                       # dust & hairs
            c = (20, 15, 10) if rng.random() < 0.7 else (235, 230, 215)
            p = (int(rng.uniform(0, W)), int(rng.uniform(0, H)))
            if rng.random() < 0.8: cv2.circle(O8, p, int(rng.uniform(1, 4)), c, -1)
            else: cv2.ellipse(O8, p, (int(rng.uniform(8, 25)), 2), rng.uniform(0, 180), 0, 200, c, 1)
        if rng.random() < 0.06:                                                 # vertical scratch
            x = int(rng.uniform(0, W)); cv2.line(O8, (x, 0), (x + int(rng.normal(0, 6)), H), (220, 215, 200), 1)
        ff.stdin.write(O8.tobytes()); f_global += 1
ff.stdin.close(); ff.wait(); print("DONE", OUT)
