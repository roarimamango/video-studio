# 2.5D "living still": depth parallax + push-in + breathing + glint + glow + dust -> vertical MP4
import numpy as np, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import map_coordinates, gaussian_filter
SRC, DEP, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
W,H,FPS,SEC = 1080,1920,24,8
img = Image.open(SRC).convert('RGB'); sc = H/img.height
img = img.resize((round(img.width*sc), H), Image.LANCZOS); A = np.asarray(img).astype(np.float32)/255
D = np.array(Image.fromarray(np.load(DEP)).resize(img.size, Image.BICUBIC)); D = gaussian_filter(D, 6)
h,w = D.shape; cx = w/2
yy,xx = np.mgrid[0:h,0:w].astype(np.float32)
# feature spots (source px, from the 832x1216 original)
lens = (395*sc, 430*sc, 62*sc); tube = (70*sc, 570*sc)
ease = lambda t: t*t*(3-2*t)
rng = np.random.default_rng(3)
dust = [dict(x=rng.uniform(0,W), y=rng.uniform(0,H), r=rng.uniform(1.5,4.5), vx=rng.uniform(4,14), vy=rng.uniform(-22,-6), ph=rng.uniform(0,6.3)) for _ in range(70)]
Y,X = np.mgrid[0:H,0:W].astype(np.float32)
breath_mask = np.clip((yy-650*sc)/(150*sc),0,1)*np.clip((D-.45)/.15,0,1)
ff = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
                       '-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',OUT], stdin=subprocess.PIPE)
N = FPS*SEC
for f in range(N):
    t = f/(N-1); e = ease(t); s = f/FPS
    S = A.copy()
    # glasses glint sweep (t 0.38-0.52)
    g = (t-.38)/.14
    if 0 < g < 1:
        lx,ly,lr = lens; u = ((xx-lx)+(yy-ly))/1.414; pos = (-1.2+2.4*g)*lr
        m = np.exp(-((u-pos)/(lr*.16))**2) * (np.hypot(xx-lx,yy-ly) < lr)
        S += m[...,None]*np.array([1,.97,.9])*.75
    # test tube glow pulse
    tx,ty = tube; gl = np.exp(-((xx-tx)**2+(yy-ty)**2)/(2*(75*sc)**2))*(.22+.12*np.sin(s*2.4))
    S += gl[...,None]*np.array([.25,.55,1.0])
    S *= 1 + .012*np.sin(s*7.3) + .008*np.sin(s*13.1)      # light flicker
    # camera: push-in + drift, depth parallax, breathing
    z = 1.0 + .07*e
    sx0 = cx + (X-W/2)/z + (-60+120*e)*.35
    sy0 = h/2 + (Y-H/2)/z + 6*np.sin(s*.6)
    d = map_coordinates(D, [sy0, sx0], order=1, mode='nearest')
    bm = map_coordinates(breath_mask, [sy0, sx0], order=1, mode='nearest')
    sx = sx0 - d*(-28+56*e) - (X-W/2)*.035*d*e/z
    sy = sy0 - d*4*np.sin(s*.6) - bm*3.2*np.sin(s*2*np.pi/3.6)
    O = np.stack([map_coordinates(S[...,c], [sy, sx], order=1, mode='nearest') for c in range(3)], -1)
    # dust in the light
    lay = Image.new('L',(W,H),0); dr = ImageDraw.Draw(lay)
    for p in dust:
        x = (p['x'] + p['vx']*s + 8*np.sin(s*.7+p['ph'])) % W; y = (p['y'] + p['vy']*s) % H
        a = int(255*(.35+.35*np.sin(s*1.3+p['ph']))*(.4+.6*x/W)); dr.ellipse([x-p['r'],y-p['r'],x+p['r'],y+p['r']], fill=a)
    lay = np.asarray(lay.filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32)/255
    O += lay[...,None]*np.array([1,.86,.62])*.7
    vig = 1 - .28*(((X-W/2)/(W*.75))**2 + ((Y-H/2)/(H*.75))**2)
    O = np.clip(O*vig[...,None],0,1)
    ff.stdin.write((O*255).astype(np.uint8).tobytes())
    if f % 48 == 0: print(f, flush=True)
ff.stdin.close(); ff.wait(); print('DONE', OUT)
