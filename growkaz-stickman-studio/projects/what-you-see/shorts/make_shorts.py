"""Cut vertical 9:16 Shorts from the finished "The Lore Behind What You See" video, with a hook title and word-by-word captions.
Run from the studio folder:  python3 projects/what-you-see/shorts/make_shorts.py
"""
import json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SRC = os.path.join(PROJ, 'out', 'The_Lore_Behind_What_You_See.mp4')
WORDS = json.load(open(os.path.join(PROJ, 'timeline', 'words.json')))['words']

SHORTS = [
    dict(slug='1-paper-eyes', start=0.0, end=40.26, title=['A PHOTO OF EYES', 'CHANGED WHAT PEOPLE PAID']),
    dict(slug='2-popcorn-hoax', start=279.92, end=324.24, title=['THE 1957 HOAX', 'THAT SCARED AMERICA']),
    dict(slug='3-bobo-doll', start=325.88, end=359.54, title=['WHAT THE KIDS', 'DID NEXT']),
    dict(slug='4-fiji', start=394.86, end=446.64, title=['TV CAME TO FIJI.', '3 YEARS LATER...']),
    dict(slug='5-filters', start=500.76, end=522.54, title=['THE NEW NORM', "ISN'T A MOVIE STAR"]),
    dict(slug='6-mirror', start=544.34, end=573.12, title=['TRY THIS TONIGHT', '(IF YOU DARE)']),
]
CTA = 'FULL CASE FILE\\NON THE CHANNEL'
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
Style: Title,Anton,96,&H00D6E9F1,&H00D6E9F1,&H00120E0D,&H96000000,0,0,0,0,100,100,2,0,1,8,4,8,60,60,230,1
Style: Title2,Anton,108,&H002B30E0,&H002B30E0,&H00120E0D,&H96000000,0,0,0,0,100,100,2,0,1,9,4,8,60,60,350,1
Style: Cap,Anton,86,&H00D6E9F1,&H00D6E9F1,&H00120E0D,&H96000000,0,0,0,0,100,100,2,0,1,8,3,2,70,70,400,1
Style: CTA,Special Elite,66,&H0016212A,&H0016212A,&H008FC0D9,&H008FC0D9,0,0,0,0,100,100,2,0,3,22,0,5,60,60,0,1

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
            txt = ' '.join(('{\\c&H002B30E0&\\fscx108\\fscy108}' + esc(x['word']).upper() + '{\\c&H00D6E9F1&\\fscx100\\fscy100}') if j == i else esc(x['word']).upper() for j, x in enumerate(grp))
            ev.append(f'Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{txt}')
    ev.append(f'Dialogue: 2,{ts(body)},{ts(dur)},CTA,,0,0,0,,{{\\fad(200,0)}}{CTA}')
    return head + '\n'.join(ev) + '\n'


os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
for sh in SHORTS:
    a, b = max(0, sh['start'] - 0.15), sh['end'] + 0.35
    dur = (b - a) + TAIL
    ass = os.path.join(HERE, f'{sh["slug"]}.ass'); open(ass, 'w').write(ass_for({**sh, 'start': a}, dur))
    out = os.path.join(HERE, 'out', f'WhatYouSee_Short_{sh["slug"]}.mp4')
    fc = (f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={TAIL},split[v1][v2];"
          "[v1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.22:saturation=0.8[bg];"
          "[v2]scale=1560:-2,crop=1080:ih[fg];"
          "[bg][fg]overlay=0:(H-h)/2-40,"
          f"ass={ass}:fontsdir={os.path.join(HERE, 'fonts')},fade=t=out:st={dur - 0.4}:d=0.4[v];"
          f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,apad=pad_dur={TAIL},afade=t=out:st={dur - 0.9}:d=0.9[a]")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f'{dur:.2f}',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
    print(f'{out}  ({dur:.1f}s)')
