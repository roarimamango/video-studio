# Hand-drawn feel for a still: ink draw-on, watercolor bloom, line boil (on twos), slow push, paper grain -> 16:9 MP4
import numpy as np, subprocess, sys
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter, zoom
SRC, OUT = sys.argv[1], sys.argv[2]
W,H,FPS,SEC = 1920,1080,24,7
img = Image.open(SRC).convert('RGB'); sc = W/img.width
img = img.resize((W, round(img.height*sc)), Image.LANCZOS); I = np.asarray(img).astype(np.float32)/255
h,w = I.shape[:2]; rng = np.random.default_rng(5)
PAPER = np.array([.972,.953,.918])
L = I.mean(-1); ink = np.clip((.62-L)/.25,0,1)                       # dark strokes = ink
noise = lambda s: gaussian_filter(rng.standard_normal((h,w)).astype(np.float32), s)
def norm(a): return (a-a.min())/(a.max()-a.min())
yy,xx = np.mgrid[0:h,0:w].astype(np.float32)
ink_order = norm(.55*norm(noise(40)) + .45*norm(xx*.6+yy))          # strokes appear roughly top-left -> bottom-right
wash_order = norm(noise(90))
boil = [(zoom(rng.standard_normal((h//45+2,w//45+2)),45,order=3)[:h,:w]*1.6,
         zoom(rng.standard_normal((h//45+2,w//45+2)),45,order=3)[:h,:w]*1.6) for _ in range(3)]
grain = (noise(.8)*.035 + noise(3)*.02)[...,None]
Y,X = np.mgrid[0:H,0:W].astype(np.float32)
ease = lambda t: t*t*(3-2*t)
ff = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
                       '-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',OUT], stdin=subprocess.PIPE)
N = FPS*SEC
for f in range(N):
    s = f/FPS; t = f/(N-1)
    ir = np.clip((s-.1)/1.7,0,1); wr = np.clip((s-1.2)/1.8,0,1)
    a_ink = np.clip((ir*1.15 - ink_order)/.08,0,1)
    a_wash = np.clip((ease(wr)*1.2 - wash_order)/.2,0,1)
    alpha = ink*a_ink + (1-ink)*a_wash
    S = PAPER + (I-PAPER)*alpha[...,None] + grain
    bx,by = boil[(f//2)%3]                                            # line boil on twos, 3-frame cycle
    z = 1 + .05*ease(t)
    sx = w/2 + (X-W/2)/z + 10*np.sin(s*.5)
    sy = h/2 + (Y-H/2)/z + (h-H)*(.15-.3*t)*0 + 5*np.sin(s*.4)
    bxs = map_coordinates(bx,[sy,sx],order=1,mode='nearest'); bys = map_coordinates(by,[sy,sx],order=1,mode='nearest')
    O = np.stack([map_coordinates(S[...,c],[sy+bys,sx+bxs],order=1,mode='nearest') for c in range(3)],-1)
    ff.stdin.write((np.clip(O,0,1)*255).astype(np.uint8).tobytes())
ff.stdin.close(); ff.wait(); print('DONE', OUT)
