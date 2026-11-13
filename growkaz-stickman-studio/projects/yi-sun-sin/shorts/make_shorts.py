"""Cut vertical 9:16 Shorts from the finished Yi Sun-sin video, with a hook title and word-by-word captions.
Run from the studio folder:  python3 projects/yi-sun-sin/shorts/make_shorts.py
"""
import json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SRC = os.path.join(PROJ, 'out', 'The_Admiral_Who_Never_Lost_-_Yi_Sun-sin.mp4')
WORDS = json.load(open(os.path.join(PROJ, 'timeline', 'words.json')))['words']

SHORTS = [
    dict(slug='1-twelve-ships', start=0.0, end=23.2, title=['HIS NAVY WAS DESTROYED', 'HE HAD 12 SHIPS LEFT']),
    dict(slug='2-13-vs-133', start=311.53, end=361.3, title=['13 SHIPS VS 133', "HE DIDN'T LOSE ONE"]),
    dict(slug='3-last-words', start=390.73, end=427.6, title=['HIS LAST WORDS', 'WON THE BATTLE']),
]
CTA = 'FULL STORY ON THE CHANNEL'
TAIL = 1.6   # seconds of end card after the last word


def ts(s):
    s = max(0, s); h = int(s // 3600); m = int(s % 3600 // 60); return f'{h}:{m:02d}:{s % 60:05.2f}'


def esc(w):
    return w.replace('{', '').replace('}', '').replace('\\', '')


def ass_for(sh, dur):
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Fredoka Light,92,&H00FFFFFF,&H00FFFFFF,&H00100A0C,&H96000000,-1,0,0,0,100,100,2,0,1,9,4,8,60,60,250,1
Style: Title2,Fredoka Light,104,&H0030D2FF,&H0030D2FF,&H00100A0C,&H96000000,-1,0,0,0,100,100,2,0,1,10,4,8,60,60,360,1
Style: Cap,Fredoka Light,84,&H00FFFFFF,&H00FFFFFF,&H00100A0C,&H96000000,-1,0,0,0,100,100,1,0,1,9,3,2,70,70,420,1
Style: CTA,Fredoka Light,70,&H00FFFFFF,&H00FFFFFF,&H00100A0C,&H962A20C8,-1,0,0,0,100,100,2,0,3,18,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    body = dur - TAIL
    ev.append(f'Dialogue: 1,{ts(0)},{ts(body)},Title,,0,0,0,,{{\\fad(150,200)}}{sh["title"][0]}')
    ev.append(f'Dialogue: 1,{ts(0)},{ts(body)},Title2,,0,0,0,,{{\\fad(150,200)}}{sh["title"][1]}')
    words = [w for w in WORDS if sh['start'] - 0.05 <= w['start'] < sh['end'] + 0.05]
    groups, cur = [], []
    for w in words:                                      # 3-word groups, break after punctuation
        cur.append(w)
        if len(cur) == 3 or re.search(r'[.,;:!?"]$', w['word']): groups.append(cur); cur = []
    if cur: groups.append(cur)
    for gi, grp in enumerate(groups):
        for i, w in enumerate(grp):
            a = w['start'] - sh['start'] + 0.15
            nxt = grp[i + 1]['start'] if i + 1 < len(grp) else (groups[gi + 1][0]['start'] if gi + 1 < len(groups) else w['end'] + 0.3)
            b = min(nxt - sh['start'] + 0.15, body)
            txt = ' '.join(('{\\c&H0030D2FF&\\fscx108\\fscy108}' + esc(x['word']).upper() + '{\\c&H00FFFFFF&\\fscx100\\fscy100}') if j == i else esc(x['word']).upper() for j, x in enumerate(grp))
            ev.append(f'Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{txt}')
    ev.append(f'Dialogue: 2,{ts(body)},{ts(dur)},CTA,,0,0,0,,{{\\fad(200,0)}}{CTA}')
    return head + '\n'.join(ev) + '\n'


os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
for sh in SHORTS:
    a, b = max(0, sh['start'] - 0.15), sh['end'] + 0.35
    dur = (b - a) + TAIL
    ass = os.path.join(HERE, f'{sh["slug"]}.ass'); open(ass, 'w').write(ass_for({**sh, 'start': a}, dur))
    out = os.path.join(HERE, 'out', f'YiSunSin_Short_{sh["slug"]}.mp4')
    fc = (f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={TAIL},split[v1][v2];"
          "[v1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.22:saturation=0.8[bg];"
          "[v2]scale=1560:-2,crop=1080:ih[fg];"
          "[bg][fg]overlay=0:(H-h)/2-40,"
          f"ass={ass}:fontsdir={os.path.join(HERE, 'fonts')},fade=t=out:st={dur - 0.4}:d=0.4[v];"
          f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,apad=pad_dur={TAIL},afade=t=out:st={dur - 0.9}:d=0.9[a]")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f'{dur:.2f}',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
    print(f'{out}  ({dur:.1f}s)')
