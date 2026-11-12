"""Build story/shots.json from the beats draft (story/shots_draft.json) + the shot plan below.
Run from the project folder:  python3 story/build_shots.py
Each draft shot can be merged with the next one (merge=True) or split at spoken words (parts[i]['at'] = 'word').
"""
import json, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
draft = json.load(open(os.path.join(HERE, 'shots_draft.json')))
WORDS = json.load(open(os.path.join(PROJ, 'timeline', 'words.json')))['words']
norm = lambda w: re.sub(r"[^\w']", '', w.lower())


def wt(word, after):
    """global start time of `word` (prefix match) at or after `after`."""
    parts = [norm(x) for x in word.split()]
    for i, w in enumerate(WORDS):
        if w['start'] < after - 0.05: continue
        seq = WORDS[i:i + len(parts)]
        if len(seq) == len(parts) and all(norm(s['word']).startswith(p) if k == len(parts) - 1 else norm(s['word']) == p for k, (s, p) in enumerate(zip(seq, parts))):
            return w['start']
    raise SystemExit(f'word not found: {word} after {after}')


def F(who, x=0, p='stand', e='neutral', s=1.5, f=1, **kw):
    d = dict(who=who, x=x, p=p, e=e, s=s, f=f); d.update(kw); return d


def P(type_, scene, **kw):
    meta = {k: kw.pop(k) for k in ['at', 'in_', 'bars', 'sfx', 'amb'] if k in kw}
    return dict(type=type_, scene=scene, params=kw, **meta)


SIT = 'sit'
# ---------------------------------------------------------------- the plan
PLAN = {
 's001': dict(merge=True, parts=[P('quote', 'Open book, the famous first line typing itself onto the page', text='"It was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\'t know what I was doing in New York."', full=True, size=60, from_=0.1, header='THE BELL JAR · CHAPTER ONE', bars='none', sfx=[dict(at=0.2, name='riser', gain=-18)])]),
 's003': dict(parts=[P('cover', 'The Bell Jar cover, slow push', author='SYLVIA PLATH', label='THE BELL JAR · 1963', sfx=[dict(at=0.1, name='whoosh', gain=-12)])]),
 's004': dict(parts=[
    P('scene', 'Sylvia alone under a spotlight; the glass bell jar drops over her', set='stage', figs=[F('SYLVIA', 0, [[0, 'relaxed'], [1.8, 'sad']], [[0, 'neutral'], [1.9, 'scared']], s=1.4)], jarDrop=[1.2, 1.9, 0], cam=[1.0, 1.08], sfx=[dict(at=1.85, name='impact', gain=-8)]),
    P('scene', 'Pull back: Sylvia under the jar, the word FICTION? hangs above', at='It', set='stage', figs=[F('SYLVIA', 0, 'sad', 'sad', s=1.4)], jar=dict(fog=0.3), cam=[1.12, 1.0], ov=dict(labels=[dict(str='FICTION?', y=0.18, serif=True, size=70, at=0.3)]))]),
 's005': dict(parts=[
    P('date', 'IT ALL HAPPENED card over blurred Manhattan', set='street', str='IT REALLY HAPPENED', size=110, sfx=[dict(at=0.15, name='stinger', gain=-10)]),
    P('scene', 'The Barbizon hotel at night, slow push, REAL stamp', at='The', set='street', so=dict(moon=True), cam=[1.0, 1.08, 0, 0, 0, -40], fx=['dust', 'streak'], ov=dict(labels=[dict(str='THE HOTEL · REAL', y=0.12, at=0.2)]), amb=dict(name='city', gain=-24)),
    P('scene', 'Hospital interior, cool light through tall windows', at='The hospital', set='hospital', so=dict(bed=True), cam=[1.0, 1.06, -40, 30], ov=dict(labels=[dict(str='THE HOSPITAL · REAL', y=0.12, at=0.2)]), amb=dict(name='roomtone', gain=-26))]),
 's006': dict(parts=[
    P('scene', 'A doctor and the boyfriend appear in the hospital', set='hospital', figs=[F('DOCTOR', -260, 'crossArms', 'neutral', fadeIn=0.0), F('BUDDY', 260, 'relaxed', 'smirk', f=-1, fadeIn=1.0)], cam=[1.02, 1.08]),
    P('face', 'Giant close-up of Sylvia; ALL REAL', at='the girl', set='hospital', who='SYLVIA', e='neutral', ov=dict(line='ALL REAL', lineAt=1.2, lineY=0.14), sfx=[dict(at=1.3, name='pop', gain=-12)], bars='scope')]),
 's007': dict(parts=[
    P('cover', 'Cover: SYLVIA PLATH dissolves into VICTORIA LUCAS', author='SYLVIA PLATH', swap='VICTORIA LUCAS', swapAt=1.4, label='A FAKE NAME', sfx=[dict(at=1.4, name='shimmer', gain=-12)]),
    P('scene', 'London in snow; one warm window slowly goes dark', at='and never', set='london', so=dict(lit=1), litFade=[1.0, 3.2], cam=[1.0, 1.06], fx=['snow'], amb=dict(name='wind', gain=-24), bars='scope')]),
 's008': dict(parts=[P('title', 'TITLE CARD over the bell jar', lines=['THE LORE BEHIND', 'THE BELL JAR'], in_=dict(type='fade', dur=0.5), bars='scope', sfx=[dict(at=0.1, name='impact', gain=-6)])]),
 # --- childhood
 's009': dict(parts=[P('date', '1932, Boston', set='suburb', so=dict(mood='day'), str='1932', sub='BOSTON, MASSACHUSETTS', in_=dict(type='dip', dur=0.5), sfx=[dict(at=0.2, name='pop', gain=-12)])]),
 's010': dict(parts=[P('scene', 'Otto, professor in brown suit, explains bees to little Sylvia in the garden', set='suburb', so=dict(mood='golden'), figs=[F('OTTO', -120, [[0, 'explain'], [2.5, 'point']], 'smile', s=1.6), F('KID', 140, 'stand', [[0, 'happy'], [2, 'awe']], f=-1, s=1.6)], extra='bees', cam=[1.0, 1.07, -30, 20], ov=dict(labels=[dict(str='OTTO PLATH', y=0.12, at=0.3)]), amb=dict(name='wind', gain=-30))]),
 's011': dict(parts=[P('scene', 'Dusk: Otto fades away, little Sylvia alone', set='suburb', so=dict(mood='dusk'), figs=[F('OTTO', -120, 'relaxed', 'neutral', s=1.6, fadeOut=0.3), F('KID', 140, 'sad', 'sad', f=-1, s=1.6)], cam=[1.04, 1.1], ov=dict(date='AGE 8', dateAt=0.6), bars='scope', amb=dict(name='wind', gain=-28))]),
 's012': dict(parts=[P('scene', 'Aurelia with Sylvia and her little brother in the warm living room', set='room', so=dict(mood='interiorWarm', window='day'), figs=[F('AURELIA', -60, 'holdFront', 'worried', s=1.6), F('KID', -260, 'relaxed', 'neutral', s=1.6), F('BROTHER', 160, 'relaxed', 'neutral', f=-1, s=1.6)], cam=[1.0, 1.06], ov=dict(labels=[dict(str='AURELIA PLATH', y=0.12, at=0.3)]), amb=dict(name='roomtone', gain=-26))]),
 's013': dict(parts=[
    P('scene', 'Night: Aurelia works late at the desk under a lamp', set='room', so=dict(mood='night', window='suburb', desk=True, deskX=-120, lines=6), figs=[F('AURELIA', -330, 'sit', [[0, 'sleepy'], [2.5, 'determined']], s=1.5)], extra='typewriterGlow', cam=[1.0, 1.08, -60, -80], amb=dict(name='roomtone', gain=-26)),
    P('face', 'Little Sylvia, determined', at='Sylvia took', set='room', so=dict(mood='interiorWarm', window='day'), who='KID', e='determined')]),
 's014': dict(parts=[P('paper', 'Newspaper: her first published poem, age eight', mast='THE SUNDAY PAPER', head='A POEM', sub='by Sylvia Plath, age 8', bars='none', sfx=[dict(at=0.2, name='swish', gain=-10)])]),
 's015': dict(parts=[P('slips', 'Teen Sylvia at her desk while rejection slips pile up', e=[[0, 'determined'], [3, 'worried'], [5.2, 'determined']], cam=[1.0, 1.08], amb=dict(name='roomtone', gain=-26))]),
 's016': dict(parts=[
    P('date', 'JUNE 1953 · AGE 20', set='office', str='JUNE 1953', sub='SYLVIA PLATH · AGE 20', in_=dict(type='dip', dur=0.4), sfx=[dict(at=0.2, name='pop', gain=-12)]),
    P('scene', 'Sylvia under a warm spotlight, arms up: winning', at='on', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, [[0, 'relaxed'], [0.4, 'cheer']], 'joy', s=1.6)], cam=[1.0, 1.06], fx=['dust', 'streak'])]),
 's017': dict(parts=[P('grades', 'Smith College report card: straight A\'s', bars='none', sfx=[dict(at=0.3, name='tick', gain=-14), dict(at=0.8, name='tick', gain=-14), dict(at=1.3, name='tick', gain=-14)])]),
 's018': dict(parts=[P('grades', 'A prize ribbon lands beside the report card', prize=0.1, bars='none', sfx=[dict(at=0.15, name='ding', gain=-10)])]),
 's019': dict(parts=[P('scene', 'Mademoiselle office: Sylvia among the guest editors', set='office', figs=[F('INK', -620, 'relaxed', 'smile', s=1.3), F('INK', -400, 'talk', 'happy', s=1.3, f=-1), F('SYLVIA', -120, 'relaxed', 'smile', s=1.45), F('INK', 160, 'phone', 'neutral', s=1.3), F('EDITOR', 420, 'crossArms', 'neutral', f=-1, s=1.45), F('INK', 640, 'relaxed', 'smile', s=1.3, f=-1)], cam=[1.0, 1.07, -50, 40], ov=dict(labels=[dict(str='1 OF 20 GUEST EDITORS', y=0.12, at=0.6)]), amb=dict(name='murmur', gain=-28), sfx=[dict(at=0.6, name='pop', gain=-14)])]),
 's020': dict(parts=[P('scene', 'Sylvia walks into the glamorous office, golden light', set='office', figs=[F('SYLVIA', 0, walk=[-500, 0, 0, 2.2], e='happy', s=1.5)], cam=[1.05, 1.0, 0, 0], fx=['dust', 'streak'], amb=dict(name='murmur', gain=-28))]),
 's021': dict(parts=[P('city3d', '3D: night Manhattan avenue, camera rises up the Barbizon tower', sfx=[dict(at=0.1, name='whoosh', gain=-10)], amb=dict(name='city', gain=-22))]),
 's022': dict(parts=[P('scene', 'The Barbizon facade; "THE AMAZON" in serif', set='street', cam=[1.1, 1.16, 0, 0, -60, -60], ov=dict(labels=[dict(str='THE BARBIZON  →  "THE AMAZON"', y=0.12, serif=True, size=58, at=0.4)]), amb=dict(name='city', gain=-24))]),
 's023': dict(parts=[P('map', 'Sylvia → Esther Greenwood', set='street', who='SYLVIA', real='SYLVIA PLATH', fict='ESTHER GREENWOOD', e='smile', swapAt=0.9, bars='none')]),
 's024': dict(parts=[P('face', 'Sylvia\'s blank face; glass closes around her', set='office', who='SYLVIA', e='neutral', look=[0, 0], jar=[[0, 0], [0.9, 1]], fog=0.3, bars='scope', sfx=[dict(at=0.9, name='freeze', gain=-10)])]),
 # --- the Rosenbergs
 's025': dict(parts=[P('quote', 'The first line again, now underlined', text='"It was a queer, sultry summer, the summer they electrocuted the Rosenbergs..."', full=True, size=60, from_=0.0, to=0.01, header='THE FIRST LINE', bars='none', sfx=[dict(at=0.1, name='tick', gain=-14)])]),
 's026': dict(parts=[
    P('scene', 'Two silhouettes under a cold spotlight: the Rosenbergs', set='stage', so=dict(mood='night', spotC='#cfe0ff'), figs=[F('INK', -110, 'sad', 'worried', s=1.4), F('INK', 110, 'sad', 'worried', f=-1, s=1.4)], cam=[1.0, 1.07], ov=dict(labels=[dict(str='JULIUS & ETHEL ROSENBERG', y=0.12, at=0.3)]), sfx=[dict(at=0.3, name='pop', gain=-14)]),
    P('electric', 'An empty electric chair crackling in the dark', at='were executed', mode='chair', label='JUNE 19, 1953', bars='scope', sfx=[dict(at=0.1, name='hum', gain=-10), dict(at=1.0, name='glitch', gain=-14)])]),
 's027': dict(parts=[
    P('scene', 'Esther on her hotel bed at night, unable to stop thinking', set='room', so=dict(mood='night', window='city', bed=True), figs=[F('SYLVIA', 300, 'sit', [[0, 'worried'], [2, 'scared']], y=-70, s=1.5, shadow=False)], cam=[1.0, 1.08, 40, 40], amb=dict(name='city', gain=-28)),
    P('electric', 'Blueprint figure: nerves light up with current', at='about what', mode='nerves', label='ALONG YOUR NERVES', bars='none', sfx=[dict(at=0.6, name='powerup', gain=-12)])]),
 's028': dict(parts=[P('face', 'Sylvia close-up: thinking, then uneasy', set='room', so=dict(mood='night', window='city'), who='SYLVIA', e=[[0, 'thinking'], [3.3, 'worried']], ov=dict(line="IT ISN'T.", lineAt=3.3, lineY=0.14), sfx=[dict(at=3.35, name='hit', gain=-10)])]),
 's029': dict(parts=[P('electric', 'Lightning bolt: REMEMBER THIS', mode='bolt', label='REMEMBER THIS', in_=dict(type='flash', dur=0.3), bars='scope', sfx=[dict(at=0.0, name='thunder', gain=-10)])]),
 # --- the real summer
 's030': dict(parts=[P('scene', 'Sylvia typing at her desk in the office, editors around', set='office', figs=[F('SYLVIA', -760, 'sit', 'neutral', s=1.4), F('INK', -400, 'talk', 'happy', s=1.3, f=-1), F('INK', 600, 'phone', 'neutral', s=1.3, f=-1)], cam=[1.05, 1.1, -200, -160], amb=dict(name='murmur', gain=-28))]),
 's031': dict(parts=[P('map', 'Cyrilly Abels → Jay Cee', set='office', who='EDITOR', real='CYRILLY ABELS', fict='JAY CEE', p='crossArms', e='determined', swapAt=2.3, bars='none')]),
 's032': dict(parts=[P('scene', 'The luncheon table; guest editors turn queasy', set='office', figs=[F('INK', -420, [[0, 'sit'], [2.2, 'sad']], [[0, 'happy'], [2.3, 'worried']], s=1.35), F('SYLVIA', -140, [[0, 'sit'], [2.4, 'sad']], [[0, 'smile'], [2.5, 'scared']], s=1.4), F('INK', 160, [[0, 'sit'], [2.6, 'facepalm']], [[0, 'happy'], [2.6, 'worried']], s=1.35, f=-1), F('INK', 440, [[0, 'sit'], [2.3, 'sad']], [[0, 'smile'], [2.4, 'worried']], s=1.35, f=-1)], extra='luncheon', cam=[1.0, 1.06], amb=dict(name='murmur', gain=-26))]),
 's033': dict(parts=[P('scene', 'Rooftop of the Barbizon at night: Sylvia walks to the edge', set='rooftop', figs=[F('SYLVIA', 0, walk=[-560, 60, 0, 3.4], e='sad', s=1.4)], cam=[1.0, 1.06], fx=['dust'], amb=dict(name='wind', gain=-24), in_=dict(type='dip', dur=0.3))]),
 's034': dict(parts=[P('scene', 'She throws her clothes into the night air, one by one', set='rooftop', figs=[F('SYLVIA', 60, [[0, 'holdFront'], [0.4, 'reach'], [0.8, 'holdFront'], [1.3, 'reach'], [1.8, 'holdFront'], [2.3, 'reach'], [2.8, 'holdFront'], [3.3, 'reach']], 'sad', s=1.4)], extra='clothes', cam=[1.0, 1.1, 0, 120], bars='scope', amb=dict(name='wind', gain=-22), sfx=[dict(at=0.5, name='swish', gain=-14), dict(at=1.4, name='swish', gain=-14), dict(at=2.4, name='swish', gain=-14)])]),
 # --- breakdown
 's035': dict(parts=[P('scene', 'Wellesley suburb at dusk: Sylvia walks home with her suitcase', set='suburb', so=dict(mood='dusk'), figs=[F('SYLVIA', 0, walk=[-600, -80, 0, 4], e='sad', s=1.4, prop='paper')], cam=[1.0, 1.06], ov=dict(labels=[dict(str='WELLESLEY, MASSACHUSETTS', y=0.12, at=0.3)]), in_=dict(type='dip', dur=0.4), amb=dict(name='wind', gain=-28))]),
 's036': dict(parts=[P('scene', 'Sylvia reads a letter: REJECTED', set='room', so=dict(mood='interiorWarm', window='day'), figs=[F('SYLVIA', -60, 'holdFront', [[0, 'neutral'], [1.0, 'shocked'], [2.2, 'sad']], s=1.6, prop='paper')], cam=[1.0, 1.1], ov=dict(labels=[dict(str='HARVARD SUMMER COURSE: REJECTED', y=0.12, at=0.9, color='#ff6f61')]), sfx=[dict(at=0.95, name='hit', gain=-10)], amb=dict(name='roomtone', gain=-26))]),
 's037': dict(parts=[
    P('scene', 'Night: Sylvia frozen in front of the typewriter', set='room', so=dict(mood='night', window='suburb', desk=True, deskX=-120, lines=0), figs=[F('SYLVIA', -330, 'sit', 'worried', s=1.5)], cam=[1.0, 1.1, -80, -60], ov=dict(labels=[dict(str="COULDN'T WRITE", y=0.12, at=0.6)]), amb=dict(name='roomtone', gain=-26)),
    P('scene', 'She holds a book she cannot read', at="She couldn't read", set='room', so=dict(mood='night', window='suburb'), figs=[F('SYLVIA', 0, 'holdFront', 'sad', s=1.7, prop='paper')], cam=[1.05, 1.12], ov=dict(labels=[dict(str="COULDN'T READ", y=0.12, at=0.2)]), amb=dict(name='roomtone', gain=-26)),
    P('scene', 'Awake on the bed, the clock ticking', at="She couldn't sleep", set='room', so=dict(mood='night', window='suburb', bed=True), figs=[F('SYLVIA', 300, 'sit', 'sleepy', y=-70, s=1.5, shadow=False)], extra='clock', cam=[1.0, 1.08], ov=dict(labels=[dict(str="COULDN'T SLEEP", y=0.12, at=0.2)]), sfx=[dict(at=0.3, name='clock', gain=-14)], amb=dict(name='roomtone', gain=-26))]),
 's038': dict(parts=[
    P('scene', 'A cold clinic: a doctor stands over Sylvia on the bed', set='hospital', so=dict(mood='storm', bed=True, windows=[1]), figs=[F('BADDOC', -260, 'crossArms', 'neutral', s=1.6), F('SYLVIA', 320, 'sit', 'scared', y=-70, s=1.5, f=-1, shadow=False)], cam=[1.0, 1.08], amb=dict(name='hum', gain=-24)),
    P('face', 'Sylvia terrified, cold flicker', at='and it terrified', set='hospital', so=dict(mood='storm'), who='SYLVIA', e='scared', bars='scope', sfx=[dict(at=0.2, name='heartbeat', gain=-10)]),
    P('electric', 'The bolt again: THE ELECTRICITY', at="There's", mode='bolt', label='THE ELECTRICITY', in_=dict(type='flash', dur=0.25), bars='scope', sfx=[dict(at=0.0, name='thunder', gain=-12)])]),
 's039': dict(parts=[P('scene', 'Night outside the house: Sylvia\'s figure fades into the dark', set='suburb', so=dict(mood='night', dark=True), figs=[F('SYLVIA', -300, 'relaxed', 'sad', s=1.3, fadeOut=1.6)], cam=[1.0, 1.06], ov=dict(date='AUGUST 1953', dateAt=0.3), in_=dict(type='dip', dur=0.4), bars='scope', amb=dict(name='wind', gain=-24))]),
 's040': dict(parts=[
    P('paper', 'Newspaper: MISSING, her photo', head='MISSING', sub='Smith College student, 20', bars='none', sfx=[dict(at=0.1, name='flash', gain=-10)]),
    P('house3d', '3D: searchers with flashlights around the house at night', at='Hundreds', amb=dict(name='wind', gain=-24))]),
 's041': dict(parts=[P('scene', 'Dawn: light at a crawl-space opening under the house; searchers kneel', set='suburb', so=dict(mood='dusk', crawl=1, dark=True), figs=[F('INK', 120, 'kneel', 'shocked', s=1.3, f=1), F('AURELIA', -200, 'handsOnHead', 'shocked', s=1.4)], cam=[1.0, 1.07, 0, 60], ov=dict(labels=[dict(str='THREE DAYS LATER', y=0.12, at=0.2)]), amb=dict(name='wind', gain=-26))]),
 's042': dict(parts=[P('scene', 'The empty bell jar alone in the dark, fogged', set='stage', so=dict(mood='void'), jar=dict(fog=0.6), cam=[1.0, 1.08], fx=['dust'], bars='scope', sfx=[dict(at=0.1, name='heartbeat', gain=-16)])]),
 # --- McLean
 's043': dict(parts=[P('scene', 'Warm light breaks in; the jar begins to lift off Sylvia', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, 'sad', [[0, 'sad'], [1.2, 'surprised']], s=1.4)], jarLift=[0.8, 2.6, 0], cam=[1.02, 1.08], sfx=[dict(at=0.6, name='shimmer', gain=-12)])]),
 's044': dict(parts=[P('scene', 'Olive Higgins Prouty in her study, a famous novelist', set='room', so=dict(mood='interiorWarm', window='day', desk=True, deskX=-360), figs=[F('PROUTY', 120, 'holdFront', 'smile', s=1.6, f=-1, prop='paper')], cam=[1.0, 1.07], ov=dict(labels=[dict(str='OLIVE HIGGINS PROUTY', y=0.11, at=0.2), dict(str='BEST-SELLING NOVELIST', y=0.18, at=0.7, size=30)]), amb=dict(name='roomtone', gain=-26))]),
 's045': dict(parts=[P('hosp3d', '3D: McLean Hospital among the trees, golden hour', label='McLEAN HOSPITAL', labelSmall='BELMONT, MASS. ·', sfx=[dict(at=0.1, name='whoosh', gain=-12)], amb=dict(name='wind', gain=-28))]),
 's046': dict(parts=[P('scene', 'Dr. Beuscher and Sylvia sit facing each other; the doctor listens', set='hospital', so=dict(chairs=True), figs=[F('DOCTOR', -230, 'sit', [[0, 'smile'], [3, 'thinking']], s=1.5), F('SYLVIA', 230, 'sit', [[0, 'sad'], [3.5, 'neutral']], s=1.5, f=-1, talk=True)], cam=[1.0, 1.06, -20, 20], ov=dict(labels=[dict(str='DR. RUTH BEUSCHER', y=0.12, at=0.6)]), amb=dict(name='roomtone', gain=-26))]),
 's047': dict(parts=[
    P('map', 'Olive Higgins Prouty → Philomena Guinea', set='room', so=dict(mood='interiorWarm', window='day'), who='PROUTY', real='OLIVE HIGGINS PROUTY', fict='PHILOMENA GUINEA', e='smile', swapAt=1.5, bars='none'),
    P('map', 'Ruth Beuscher → Doctor Nolan', at='and Beuscher', set='hospital', who='DOCTOR', real='RUTH BEUSCHER', fict='DOCTOR NOLAN', e='smile', swapAt=1.0, bars='none')]),
 's048': dict(parts=[P('letters', 'Letters to her doctor pile up over the years', count=16, label='LETTERS TO DR. BEUSCHER', bars='none', sfx=[dict(at=0.3, name='swish', gain=-14)])]),
 's049': dict(parts=[P('scene', 'Buddy and Joan step into a hard spotlight', set='stage', so=dict(mood='night', spotC='#ffd59a'), figs=[F('BUDDY', -160, 'crossArms', 'smirk', s=1.5), F('JOAN', 160, 'relaxed', 'worried', s=1.5, f=-1)], cam=[1.0, 1.08])]),
 's050': dict(parts=[P('scene', 'Buddy smirks; Sylvia rolls her eyes', set='suburb', so=dict(mood='golden'), figs=[F('BUDDY', -200, 'crossArms', 'smirk', s=1.6), F('SYLVIA', 200, [[0, 'relaxed'], [1.5, 'facepalm']], [[0, 'neutral'], [1.5, 'angry']], s=1.6, f=-1)], cam=[1.0, 1.06], ov=dict(labels=[dict(str='BUDDY WILLARD', y=0.12, serif=True, size=56, at=0.3)]), amb=dict(name='wind', gain=-30))]),
 's051': dict(parts=[P('map', 'Dick Norton → Buddy Willard', set='suburb', so=dict(mood='golden'), who='BUDDY', real='DICK NORTON', fict='BUDDY WILLARD', p='crossArms', e='smirk', swapAt=0.4, bars='none')]),
 's052': dict(parts=[P('scene', 'Sylvia and Joan in the hospital, mirror images', set='hospital', figs=[F('SYLVIA', -200, 'relaxed', 'worried', s=1.6), F('JOAN', 200, 'relaxed', 'smirk', s=1.6, f=-1)], cam=[1.0, 1.08], ov=dict(labels=[dict(str='JOAN GILLING', y=0.12, serif=True, size=56, at=0.3)]), amb=dict(name='roomtone', gain=-26))]),
 's053': dict(parts=[
    P('map', 'Jane Anderson → Joan Gilling', set='hospital', who='JOAN', real='JANE ANDERSON', fict='JOAN GILLING', e='angry', swapAt=0.6, bars='none'),
    P('scene', 'Sylvia walks out of the hospital door into daylight', at='Plath recovered', set='hospital', so=dict(door=0.7, windows=[-1]), figs=[F('SYLVIA', 0, walk=[-420, -60, 0, 1.6], e='smile', s=1.5)], cam=[1.0, 1.05], sfx=[dict(at=0.2, name='shimmer', gain=-14)])]),
 's054': dict(parts=[P('scene', 'Graduation: Sylvia triumphant in warm light', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, [[0, 'relaxed'], [0.5, 'cheer']], 'joy', s=1.6), F('INK', -420, 'cheer', 'happy', s=1.2, a=0.5), F('INK', 420, 'cheer', 'happy', s=1.2, f=-1, a=0.5)], cam=[1.0, 1.06], ov=dict(date='SUMMA CUM LAUDE · 1955', dateAt=0.3), sfx=[dict(at=0.4, name='applause', gain=-18)])]),
 's055': dict(parts=[P('date', 'CAMBRIDGE · FULBRIGHT', set='party', str='CAMBRIDGE', sub='FULBRIGHT SCHOLARSHIP', in_=dict(type='whip', dur=0.3), sfx=[dict(at=0.0, name='whoosh', gain=-10)])]),
 # --- Ted
 's056': dict(parts=[
    P('scene', 'A crowded Cambridge party; Sylvia arrives', set='party', figs=[F('SYLVIA', -200, walk=[-700, -200, 0, 1.6], e='smile', s=1.4)], cam=[1.0, 1.05], ov=dict(date='1956', dateAt=0.3), amb=dict(name='murmur', gain=-22)),
    P('scene', 'Across the room: Ted Hughes, tall in green', at='she met', set='party', figs=[F('SYLVIA', -260, 'relaxed', [[0, 'surprised'], [1.2, 'smile']], s=1.6), F('TED', 260, 'relaxed', 'smirk', s=1.75, f=-1)], cam=[1.04, 1.12, 120, 160], ov=dict(labels=[dict(str='TED HUGHES', y=0.12, at=0.6)]), amb=dict(name='murmur', gain=-24))]),
 's057': dict(parts=[P('scene', 'Sylvia lunges and bites Ted on the cheek; he recoils', set='party', figs=[F('SYLVIA', -110, [[0, 'relaxed'], [1.8, 'reach'], [2.6, 'relaxed']], [[0, 'smirk'], [1.9, 'determined'], [2.6, 'happy']], s=1.65), F('TED', 110, [[0, 'relaxed'], [2.2, 'handsOnHead']], [[0, 'smirk'], [2.2, 'shocked']], s=1.75, f=-1)], extra='bite', cam=[1.06, 1.14], amb=dict(name='murmur', gain=-24), sfx=[dict(at=2.1, name='hit', gain=-10)])]),
 's058': dict(parts=[P('scene', 'Married: Sylvia and Ted side by side, two rings glow', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('SYLVIA', -90, 'relaxed', 'joy', s=1.6), F('TED', 90, 'relaxed', 'smile', s=1.75, f=-1)], extra='rings', cam=[1.0, 1.06], ov=dict(date='JUNE 1956', dateAt=0.2), sfx=[dict(at=0.6, name='ding', gain=-12)])]),
 's059': dict(parts=[P('scene', 'Two poets at one tiny desk', set='room', so=dict(mood='interiorWarm', window='day', desk=True, deskX=0, typewriter=False, lamp=True), figs=[F('SYLVIA', -170, 'sit', 'happy', s=1.5), F('TED', 170, 'sit', 'thinking', s=1.6, f=-1)], cam=[1.0, 1.08], amb=dict(name='roomtone', gain=-26))]),
 's060': dict(parts=[P('scene', 'Sylvia walks away from the bell jar into warm light', set='stage', so=dict(mood='golden', spotC='#ffcf8f', spotX=300), figs=[F('SYLVIA', 0, walk=[-80, 360, 0, 3], e='smile', s=1.4)], jar=dict(x=-420, a=0.5), cam=[1.0, 1.05, 0, 80])]),
 # --- writing the book
 's061': dict(parts=[P('scene', 'England, 1961: Sylvia with her baby daughter', set='room', so=dict(mood='interiorWarm', window='day', shelf=True), figs=[F('SYLVIA', 300, 'holdFront', 'smile', s=1.6)], extra='bundle', cam=[1.0, 1.06], ov=dict(date='ENGLAND · 1961', dateAt=0.2), in_=dict(type='dip', dur=0.4), amb=dict(name='roomtone', gain=-26))]),
 's062': dict(parts=[P('scene', 'Night after night at the typewriter; the manuscript grows', set='room', so=dict(mood='night', window='city', desk=True, deskX=-120, lines=7), figs=[F('SYLVIA', -330, 'sit', 'determined', s=1.5)], extra='pages', cam=[1.0, 1.08, -80, -60], amb=dict(name='roomtone', gain=-26), sfx=[dict(at=0.3, name='tick', gain=-16), dict(at=0.6, name='tick', gain=-16), dict(at=0.9, name='tick', gain=-16)])]),
 's063': dict(parts=[P('face', 'Sylvia\'s wry smirk: "a potboiler"', set='room', so=dict(mood='night', window='city'), who='SYLVIA', e='smirk', ov=dict(labels=[dict(str='"A POTBOILER"', y=0.13, serif=True, size=64, at=0.5)]))]),
 's064': dict(parts=[P('scene', 'The bell jar lifts away: free of the past', set='stage', so=dict(mood='dusk', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, [[0, 'sad'], [2.5, 'relaxed']], [[0, 'sad'], [2.6, 'smile']], s=1.4)], jarLift=[1.4, 3.6, 0], cam=[1.0, 1.06], sfx=[dict(at=1.4, name='riser', gain=-16)])]),
 's065': dict(parts=[P('face', 'Sylvia, worried', set='room', so=dict(mood='night', window='city'), who='SYLVIA', e='worried', look=[0.4, 0.1])]),
 's066': dict(parts=[P('scene', 'Line-up of real people: everyone she wrote about', set='stage', so=dict(mood='night', spotC='#ffd59a'), figs=[F('AURELIA', -480, 'relaxed', 'neutral', s=1.3), F('BUDDY', -240, 'crossArms', 'smirk', s=1.3), F('PROUTY', 0, 'relaxed', 'smile', s=1.3), F('DOCTOR', 240, 'crossArms', 'neutral', s=1.3, f=-1), F('JOAN', 480, 'relaxed', 'worried', s=1.3, f=-1)], cam=[1.08, 1.0], ov=dict(line='THINLY DISGUISED', lineAt=1.6, lineY=0.14)), ]),
 's067': dict(parts=[P('face', 'Aurelia recognises herself', set='room', so=dict(mood='interiorWarm', window='day'), who='AURELIA', e='shocked', sfx=[dict(at=0.3, name='hit', gain=-12)])]),
 's068': dict(parts=[P('scene', 'Buddy, Prouty and the doctor appear one by one', set='stage', so=dict(mood='night', spotC='#ffd59a'), figs=[F('BUDDY', -360, 'crossArms', 'angry', s=1.5, fadeIn=0.3), F('PROUTY', 0, 'relaxed', 'shocked', s=1.5, fadeIn=1.3), F('DOCTOR', 360, 'crossArms', 'worried', s=1.5, f=-1, fadeIn=2.6)], cam=[1.0, 1.06], sfx=[dict(at=0.3, name='pop', gain=-14), dict(at=1.3, name='pop', gain=-14), dict(at=2.6, name='pop', gain=-14)])]),
 's069': dict(parts=[P('cover', 'The Bell Jar, first edition, London', author='VICTORIA LUCAS', year='LONDON · 1963', label='JANUARY 1963', sfx=[dict(at=0.1, name='whoosh', gain=-12)])]),
 's070': dict(parts=[P('cover', 'SYLVIA PLATH is struck from the cover', author='SYLVIA PLATH', strike=0.9, sfx=[dict(at=0.9, name='swish', gain=-10)])]),
 's071': dict(parts=[
    P('cover', 'The name appears: VICTORIA LUCAS', author='SYLVIA PLATH', swap='VICTORIA LUCAS', swapAt=0.1, label='VICTORIA LUCAS', sfx=[dict(at=0.1, name='shimmer', gain=-12)]),
    P('scene', 'Sylvia reads the reviews and shrugs', at='Reviews', set='room', so=dict(mood='interiorWarm', window='snow'), figs=[F('SYLVIA', -60, [[0, 'holdFront'], [2.2, 'shrug']], [[0, 'neutral'], [2.2, 'sad']], s=1.6, prop='paper')], cam=[1.0, 1.06], ov=dict(labels=[dict(str='REVIEWS: POLITE', y=0.11, at=0.2), dict(str='SALES: MODEST', y=0.19, at=1.7)]), amb=dict(name='roomtone', gain=-26))]),
 # --- London, 1963
 's072': dict(parts=[P('scene', 'Storm light: the jar slams down on Sylvia again', set='stage', so=dict(mood='storm', spotC='#cfe0ff'), figs=[F('SYLVIA', 0, [[0, 'relaxed'], [1.4, 'sad']], [[0, 'neutral'], [1.4, 'scared']], s=1.4)], jarDrop=[0.8, 1.4, 0], cam=[1.0, 1.08], in_=dict(type='dip', dur=0.4), bars='scope', sfx=[dict(at=1.35, name='impact', gain=-8)])]),
 's073': dict(parts=[P('scene', 'Snowy London street: Ted walks away; Sylvia stays', set='london', figs=[F('SYLVIA', -260, 'sad', 'sad', s=1.4), F('TED', 0, walk=[0, 760, 0.2, 2.8], e='neutral', s=1.5)], cam=[1.0, 1.05], amb=dict(name='wind', gain=-22), sfx=[dict(at=0.4, name='footstep', gain=-16), dict(at=1.0, name='footstep', gain=-16)])]),
 's074': dict(parts=[P('scene', 'Sylvia walks two small children through the snow', set='london', so=dict(lit=1), figs=[F('SYLVIA', -80, walk=[-640, 80, 0, 5], e='determined', s=1.4), F('KID', -150, walk=[-720, 0, 0, 5], e='neutral', s=1.0), F('BROTHER', -10, walk=[-570, 150, 0, 5], e='neutral', s=0.9)], cam=[1.0, 1.06], ov=dict(labels=[dict(str='LONDON · WINTER 1963', y=0.12, at=0.3)]), amb=dict(name='wind', gain=-22))]),
 's075': dict(parts=[P('scene', 'Before dawn: Sylvia writes at her desk, city waking outside', set='room', so=dict(mood='night', window='dawn', desk=True, deskX=-120, lines=8), figs=[F('SYLVIA', -330, 'sit', 'determined', s=1.5)], extra='typewriterGlow', cam=[1.0, 1.08, -60, -40], amb=dict(name='roomtone', gain=-26))]),
 's076': dict(parts=[P('date', 'FEBRUARY 11, 1963', set='london', str='FEBRUARY 11, 1963', size=110, in_=dict(type='dip', dur=0.5), bars='scope')]),
 's077': dict(parts=[P('cover', 'The newly published book, alone', author='VICTORIA LUCAS', year='PUBLISHED JANUARY 1963', label='LESS THAN A MONTH LATER', bars='scope')]),
 's078': dict(parts=[P('scene', 'The empty desk in the cold; the lamp light slowly dies', set='room', so=dict(mood='night', window='snow', desk=True, deskX=-120, lines=8, lamp=False), extra='candle', cam=[1.0, 1.06, -80, -60], fx=['snow'], bars='scope', amb=dict(name='wind', gain=-26))]),
 's079': dict(parts=[P('date', 'SYLVIA PLATH 1932–1963', set='stage', so=dict(mood='void'), str='1932 – 1963', sub='SYLVIA PLATH', bars='scope')]),
 # --- the symbol
 's080': dict(parts=[P('scene', 'An empty bell jar on a dark stage', set='stage', so=dict(mood='void'), jar=dict(), cam=[1.1, 1.0], ov=dict(line='WHAT IS THE BELL JAR?', lineAt=0.2, lineY=0.16), in_=dict(type='dip', dur=0.6), sfx=[dict(at=0.3, name='shimmer', gain=-14)])]),
 's081': dict(parts=[P('jar3d', '3D: slow orbit around the glass jar, Sylvia inside', pose='sad', sfx=[dict(at=0.1, name='whoosh', gain=-14)])]),
 's082': dict(parts=[
    P('scene', 'Sylvia under the jar, looking out', set='stage', so=dict(mood='dusk'), figs=[F('SYLVIA', 0, 'relaxed', 'sad', s=1.3)], jar=dict(), cam=[1.0, 1.05]),
    P('scene', 'On a ship deck — still under the jar', at='on', set='travel', so=dict(place='ship'), figs=[F('SYLVIA', 0, 'relaxed', 'sad', s=1.3)], jar=dict(), cam=[1.0, 1.05, -40, 40], in_=dict(type='whip', dur=0.25), sfx=[dict(at=0.0, name='whoosh', gain=-12)], amb=dict(name='wind', gain=-28)),
    P('scene', 'At a Paris café — still under the jar', at='at a', set='travel', so=dict(place='paris'), figs=[F('SYLVIA', 0, 'sit', 'sad', s=1.3)], jar=dict(), cam=[1.0, 1.05, 40, -40], in_=dict(type='whip', dur=0.25), sfx=[dict(at=0.0, name='whoosh', gain=-12)]),
    P('scene', 'In Bangkok — still under the jar', at='Bangkok', set='travel', so=dict(place='bangkok'), figs=[F('SYLVIA', 0, 'relaxed', 'sad', s=1.3)], jar=dict(), cam=[1.0, 1.05], in_=dict(type='whip', dur=0.25), sfx=[dict(at=0.0, name='whoosh', gain=-12)])]),
 's083': dict(parts=[
    P('scene', 'She crouches as the glass fogs over', set='stage', so=dict(mood='void'), figs=[F('SYLVIA', 0, [[0, 'sad'], [1.5, 'crouch']], 'sad', s=1.4)], jar=dict(fog=0.5), extra='breath', cam=[1.0, 1.1]),
    P('face', 'Close on her face behind fogged glass: "stewing in my own sour air"', at='stewing', set='stage', so=dict(mood='void'), who='SYLVIA', e='sad', jar=True, fog=0.7, ov=dict(labels=[dict(str='"STEWING IN MY OWN SOUR AIR"', y=0.12, serif=True, size=52, at=0.2)]), bars='scope')]),
 's084': dict(parts=[P('scene', 'Push slowly into Sylvia inside the jar', set='stage', so=dict(mood='void'), figs=[F('SYLVIA', 0, 'sad', 'sad', s=1.4)], jar=dict(fog=0.4), cam=[1.0, 1.5, 0, 0, 0, -120], ov=dict(line='DEPRESSION, FROM THE INSIDE', lineAt=0.4, lineY=0.14))]),
 's085': dict(parts=[P('scene', 'A lively party all around her; Sylvia sealed in glass', set='party', figs=[F('INK', -560, 'talk', 'happy', s=1.4), F('INK', -360, 'cheer', 'joy', s=1.4, f=-1), F('SYLVIA', 0, 'sad', 'sad', s=1.4), F('INK', 360, 'talk', 'happy', s=1.4), F('INK', 560, 'relaxed', 'smile', s=1.4, f=-1)], jar=dict(w=260, h=430), cam=[1.0, 1.08], amb=dict(name='murmur', gain=-22))]),
 's086': dict(parts=[P('scene', 'Pull back: the jar is small in a vast dark space', set='stage', so=dict(mood='void'), figs=[F('SYLVIA', 0, 'sad', 'sad', s=1.4)], jar=dict(), cam=[1.5, 0.95, 0, 0, -120, 0], sfx=[dict(at=0.1, name='whoosh', gain=-14)])]),
 's087': dict(parts=[
    P('scene', 'Esther, smart and ambitious, in the 1950s office', set='office', figs=[F('SYLVIA', 0, [[0, 'explain'], [1.4, 'point']], 'determined', s=1.6)], cam=[1.0, 1.07]),
    P('scene', 'Sylvia in the spotlight, two directions', at='where', set='stage', so=dict(mood='dusk', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, 'shrug', 'confused', s=1.5)], cam=[1.0, 1.05], ov=dict(line='CHOOSE.', lineAt=1.4, lineY=0.16))]),
 's088': dict(parts=[
    P('scene', 'CAREER or MARRIAGE: she looks left, then right', set='stage', so=dict(mood='dusk', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, 'shrug', 'confused', s=1.5, look=[-1, 0]), F('EDITOR', -480, 'crossArms', 'neutral', s=1.3), F('TED', 480, 'relaxed', 'smile', s=1.4, f=-1)], cam=[1.0, 1.04], ov=dict(labels=[dict(str='CAREER', x=-480, y=0.2, at=0.0), dict(str='MARRIAGE', x=480, y=0.2, at=0.6)])),
    P('scene', 'POET or MOTHER', at='poet', set='stage', so=dict(mood='dusk', spotC='#ffcf8f'), figs=[F('SYLVIA', 0, 'shrug', 'worried', s=1.5, look=[1, 0]), F('KID', 480, 'stand', 'happy', s=1.3, f=-1)], cam=[1.04, 1.08], ov=dict(labels=[dict(str='POET', x=-480, y=0.2, at=0.0), dict(str='MOTHER', x=480, y=0.2, at=0.6)]))]),
 's089': dict(parts=[P('fig', 'The fig tree glows into view, figs lighting one by one', phase='reveal', n=5, cam=[1.12, 1.0], in_=dict(type='fade', dur=0.5), sfx=[dict(at=0.3, name='shimmer', gain=-12)])]),
}
# fig-tree shots with labels synced to spoken words
_s090 = next(s for s in draft['shots'] if s['id'] == 's090')
PLAN['s090'] = dict(parts=[P('fig', 'Each fig labelled as it is spoken', phase='labels', n=5, cam=[1.0, 1.08], labels=[round(wt('poet', _s090['start']) - _s090['start'], 2), round(wt('professor', _s090['start']) - _s090['start'], 2), round(wt('editor', _s090['start']) - _s090['start'], 2), round(wt('wife', _s090['start']) - _s090['start'], 2), None], sfx=[dict(at=round(wt(w, _s090['start']) - _s090['start'], 2), name='blip', gain=-14) for w in ['poet', 'professor', 'editor', 'wife']])])
_s091 = next(s for s in draft['shots'] if s['id'] == 's091')
PLAN.update({
 's091': dict(parts=[P('fig', 'TRAVEL fig lights up', phase='labels', n=5, cam=[1.08, 1.12], labels=[0, 0, 0, 0, round(wt('traveling', _s091['start']) - _s091['start'], 2)], sfx=[dict(at=round(wt('traveling', _s091['start']) - _s091['start'], 2), name='blip', gain=-14)])]),
 's092': dict(parts=[P('fig', 'Sylvia sits in the crotch of the tree, reaching for every fig', phase='labels', n=5, labels=[0, 0, 0, 0, 0], sitter=True, e='happy', look=[0, -0.8], cam=[1.1, 1.18, 0, 0, -160, -200])]),
 's093': dict(parts=[P('fig', 'Choosing one: the others dim', phase='lost', keep=0, n=5, labels=[0, 0, 0, 0, 0], sitter=True, e='worried', cam=[1.12, 1.08, 0, 0, -160, -140], sfx=[dict(at=0.5, name='slowmo', gain=-14)])]),
 's094': dict(parts=[P('fig', 'The figs wrinkle and go dark while she cannot decide', phase='wither', n=5, labels=[0, 0, 0, 0, 0], sitter=True, e='worried', cam=[1.0, 1.06, 0, 0, -80, -100], bars='scope')]),
 's095': dict(parts=[P('fig', 'Black figs drop one by one to the ground at her feet', phase='fall', n=5, sitter=True, e='sad', look=[0, 0.8], cam=[1.06, 1.0], bars='scope', sfx=[dict(at=0.3, name='tick', gain=-12), dict(at=0.7, name='tick', gain=-12), dict(at=1.1, name='tick', gain=-12), dict(at=1.5, name='tick', gain=-12), dict(at=1.9, name='tick', gain=-12)])]),
 's096': dict(parts=[P('face', 'Sylvia, thoughtful', set='room', so=dict(mood='night', window='suburb'), who='SYLVIA', e='thinking', look=[0.3, -0.3])]),
 's097': dict(parts=[P('scene', 'Young Sylvia writing in her journal by lamplight', set='room', so=dict(mood='night', window='suburb', desk=True, deskX=-120, typewriter=False), figs=[F('SYLVIA', -330, 'sit', 'thinking', s=1.5)], extra='typewriterGlow', cam=[1.0, 1.08, -60, -60], amb=dict(name='roomtone', gain=-26))]),
 's098': dict(merge=True, parts=[P('quote', 'Her journal: "I can never read all the books I want..."', text='"I can never read all the books I want; I can never be all the people I want and live all the lives I want."', full=True, size=60, from_=0.1, header='SYLVIA PLATH · JOURNAL', by='— SYLVIA PLATH', bars='none')]),
 's100': dict(parts=[P('scene', 'Dawn light at the end of a hospital hallway', set='hospital', so=dict(door=0.15, windows=[-1, 1]), figs=[F('SYLVIA', -320, 'relaxed', 'neutral', s=1.4)], cam=[1.0, 1.06], ov=dict(line='A NOTE OF HOPE', lineAt=99)), ]),
 's101': dict(parts=[
    P('scene', 'Esther walks toward the door', set='hospital', so=dict(door=0.15), figs=[F('SYLVIA', 0, walk=[-500, -150, 0, 3], e='worried', s=1.4)], cam=[1.0, 1.06]),
    P('scene', 'Inside: a board of doctors waits', at='who will', set='hospital', so=dict(windows=[-1, 1]), figs=[F('BADDOC', -450, 'sit', 'neutral', s=1.3), F('DOCTOR', -150, 'sit', 'smile', s=1.3), F('BADDOC', 150, 'sit', 'thinking', s=1.3, f=-1), F('BADDOC', 450, 'sit', 'neutral', s=1.3, f=-1)], cam=[1.0, 1.05], amb=dict(name='roomtone', gain=-26))]),
 's102': dict(parts=[P('face', 'Sylvia at the threshold: a breath, then resolve', set='hospital', so=dict(door=0.5), who='SYLVIA', e=[[0, 'neutral'], [1.2, 'determined']], rimC='#fff6e0', rimSide=1)]),
 's103': dict(parts=[P('scene', 'The door swings open on bright light; she steps toward it', set='hospital', so=dict(door=0.9, windows=[-1]), figs=[F('SYLVIA', -80, 'relaxed', 'determined', s=1.4, rim=[1, -0.3], rimC='#fff6e0')], extra='door', cam=[1.0, 1.1, 0, 60], ov=dict(line='A NOTE OF HOPE', lineAt=1.8, lineY=0.14, lineColor='#fff1dc'), bars='scope', sfx=[dict(at=0.4, name='shimmer', gain=-12)])]),
 # --- legacy
 's104': dict(parts=[
    P('cover', 'ARIEL, her final poems', title='ARIEL', kind='poems', author='SYLVIA PLATH', year='1965', cover='#24324e', nojar=True, in_=dict(type='dip', dur=0.6)),
    P('scene', 'Her name in lights: a crowd in the dark, a single spotlight', at='and they made', set='party', figs=[F('SYLVIA', 0, 'relaxed', 'smile', s=1.6)], cam=[1.0, 1.06], ov=dict(line='A LEGEND', lineAt=0.5, lineY=0.14), sfx=[dict(at=0.4, name='applause', gain=-18)], amb=dict(name='murmur', gain=-26))]),
 's105': dict(parts=[P('cover', 'Unmasked: VICTORIA LUCAS becomes SYLVIA PLATH', author='VICTORIA LUCAS', swap='SYLVIA PLATH', swapAt=2.0, label='UNMASKED', sfx=[dict(at=2.0, name='stinger', gain=-10)])]),
 's106': dict(parts=[P('cover', 'Republished in Britain under her real name, 1966', author='SYLVIA PLATH', year='LONDON · 1966', label='BRITAIN · 1966')]),
 's107': dict(parts=[P('scene', 'Aurelia, arms crossed, determined to stop it', set='room', so=dict(mood='interiorWarm', window='day'), figs=[F('AURELIA', 0, 'crossArms', 'angry', s=1.7)], cam=[1.0, 1.08], ov=dict(labels=[dict(str='AURELIA PLATH', y=0.12, at=0.3)]), amb=dict(name='roomtone', gain=-26))]),
 's108': dict(parts=[
    P('face', 'Aurelia pleads her case', set='room', so=dict(mood='interiorWarm', window='day'), who='AURELIA', e=[[0, 'sad'], [2.5, 'worried']]),
    P('scene', 'The gavel falls: she lost', at='She lost', set='stage', so=dict(mood='night', spotC='#ffd59a'), figs=[F('AURELIA', -200, 'sad', 'sad', s=1.4)], extra='gavel', cam=[1.0, 1.05], sfx=[dict(at=1.0, name='impact', gain=-10)])]),
 's109': dict(parts=[P('scene', 'Ted signs the paper at his desk', set='room', so=dict(mood='interiorWarm', window='day', desk=True, deskX=-120, typewriter=False), figs=[F('TED', -330, 'sit', 'neutral', s=1.6, prop='paper')], cam=[1.0, 1.08, -60, -40], ov=dict(labels=[dict(str='TED HUGHES · APPROVED', y=0.12, at=1.5)]), sfx=[dict(at=1.5, name='pop', gain=-14)])]),
 's110': dict(parts=[
    P('cover', 'The Bell Jar, first American edition, 1971', author='SYLVIA PLATH', year='NEW YORK · 1971', cover='#1e3a5a', label='UNITED STATES · 1971'),
    P('scene', 'Books stack up under the spotlight: a bestseller', at='and it became', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('INK', -300, 'holdFront', 'happy', s=1.3, prop='paper'), F('INK', -60, 'cheer', 'joy', s=1.3)], extra='bestseller', cam=[1.0, 1.06], ov=dict(line='BESTSELLER', lineAt=0.6, lineY=0.14), sfx=[dict(at=0.6, name='ding', gain=-12)])]),
 's111': dict(parts=[P('cover', 'Aurelia\'s answer: LETTERS HOME', title='LETTERS HOME', kind='correspondence', author='SYLVIA PLATH', year='EDITED BY AURELIA PLATH', cover='#2e4a3e', nojar=True)]),
 's112': dict(parts=[P('letters', 'Hundreds of letters home cascade down', count=26, label='LETTERS HOME', bars='none', sfx=[dict(at=0.2, name='swish', gain=-14)])]),
 's113': dict(parts=[P('scene', 'The stack of books keeps rising', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), extra='bestseller', cam=[1.1, 1.0])]),
 's114': dict(parts=[P('cover', 'BANNED stamp slams onto the cover', author='SYLVIA PLATH', stamp=0.15, stampText='BANNED', sfx=[dict(at=0.15, name='impact', gain=-8)])]),
 's115': dict(parts=[P('date', '1979: the film', set='stage', so=dict(mood='night'), str='1979', sub='THE BELL JAR · THE FILM', sfx=[dict(at=0.2, name='flash', gain=-12)])]),
 's116': dict(parts=[P('scene', 'Jane Anderson, angry, takes it to court', set='stage', so=dict(mood='night', spotC='#ffd59a'), figs=[F('JOAN', -200, [[0, 'relaxed'], [1.0, 'point']], 'angry', s=1.6)], extra='gavel', cam=[1.0, 1.06], ov=dict(labels=[dict(str='JANE ANDERSON SUES', y=0.12, at=0.3)]), sfx=[dict(at=1.0, name='impact', gain=-10)])]),
 's117': dict(parts=[P('date', '1987: settled', set='stage', so=dict(mood='night'), str='1987', sub='CASE SETTLED')]),
 's118': dict(parts=[P('scene', 'The Pulitzer medal shines', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), extra='medal', cam=[1.0, 1.06], ov=dict(labels=[dict(str='COLLECTED POEMS', y=0.12, at=0.3)]), sfx=[dict(at=0.5, name='ding', gain=-10)])]),
 's119': dict(parts=[P('date', 'FIRST POSTHUMOUS PULITZER FOR POETRY', set='stage', so=dict(mood='golden'), str='A FIRST', sub='POSTHUMOUS PULITZER · POETRY')]),
 's120': dict(parts=[P('cover', 'The Bell Jar endures', author='SYLVIA PLATH', label='NEVER OUT OF PRINT')]),
 's121': dict(parts=[P('phones', 'The fig tree on phone screens everywhere', n=5, bars='none', in_=dict(type='whip', dur=0.3), sfx=[dict(at=0.2, name='blip', gain=-14), dict(at=0.45, name='blip', gain=-14), dict(at=0.7, name='blip', gain=-14)])]),
 's122': dict(parts=[P('scene', 'A reader today, phone glowing in a dark bedroom', set='room', so=dict(mood='night', window='city', bed=True), figs=[F('READER', 300, 'phone', 'awe', y=-70, s=1.5, shadow=False, prop='phone')], cam=[1.0, 1.08], amb=dict(name='city', gain=-28))]),
 's123': dict(parts=[
    P('face', 'The reader recognises herself', set='room', so=dict(mood='night', window='city'), who='READER', e=[[0, 'awe'], [1.4, 'sad']]),
    P('scene', 'Across seventy years: the reader and Sylvia face each other', at='in a girl', set='stage', so=dict(mood='dusk', spotC='#ffcf8f'), figs=[F('READER', -260, 'relaxed', 'sad', s=1.5), F('SYLVIA', 260, 'relaxed', 'sad', s=1.5, f=-1)], cam=[1.0, 1.06], ov=dict(labels=[dict(str='TODAY', x=-260, y=0.18, at=0.3), dict(str='1953', x=260, y=0.18, at=0.8)]))]),
 's124': dict(parts=[P('scene', 'Sylvia at the typewriter, one last time', set='room', so=dict(mood='night', window='snow', desk=True, deskX=-120, lines=8), figs=[F('SYLVIA', -330, 'sit', 'determined', s=1.5)], extra='typewriterGlow', cam=[1.0, 1.06, -60, -40], in_=dict(type='dip', dur=0.4), amb=dict(name='roomtone', gain=-26))]),
 's125': dict(parts=[P('scene', 'The empty bell jar alone in the dark', set='stage', so=dict(mood='void'), jar=dict(fog=0.4), cam=[1.0, 1.05], bars='scope')]),
 's126': dict(parts=[
    P('scene', 'Many readers, each under a small bell jar', set='stage', so=dict(mood='dusk', spotC='#ffcf8f'), figs=[F('INK', x, 'sad', 'sad', s=0.9) for x in (-600, -300, 0, 300, 600)], jars=[dict(x=x, w=150, h=250) for x in (-600, -300, 0, 300, 600)], cam=[1.0, 1.05]),
    P('scene', 'One by one, the jars lift away', at='feel', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('INK', x, [[0, 'sad'], [1.4 + i * 0.4, 'relaxed']], [[0, 'sad'], [1.4 + i * 0.4, 'smile']], s=0.9) for i, x in enumerate((-600, -300, 0, 300, 600))], jars=[dict(x=x, w=150, h=250, d=i * 0.4) for i, x in enumerate((-600, -300, 0, 300, 600))], jarsLift=[0.4, 1.8], cam=[1.0, 1.05], sfx=[dict(at=0.4, name='shimmer', gain=-12)])]),
 's127': dict(parts=[P('scene', 'One figure reaches out to another in warm light', set='stage', so=dict(mood='golden', spotC='#ffcf8f'), figs=[F('READER', -150, [[0, 'sad'], [1.2, 'relaxed']], [[0, 'sad'], [1.4, 'smile']], s=1.5), F('INK', 150, [[0, 'relaxed'], [0.6, 'reach']], 'smile', s=1.5, f=-1)], extra='heart', cam=[1.0, 1.06])]),
 's128': dict(parts=[P('end', 'End screen: support links in the description', question='You are not alone.', help='Support links are in the description', bars='none')]),
})

DEFAULT_BARS = 'wide'
NO_BARS = {'quote', 'paper', 'grades', 'letters', 'phones', 'end', 'map'}


def build():
    src = draft['shots']; out = []; i = 0
    while i < len(src):
        s = src[i]; plan = PLAN.get(s['id'])
        start, end, line = s['start'], s['end'], s['line']
        if plan and plan.get('merge'):
            nxt = src[i + 1]; end = nxt['end']; line = line + ' ' + nxt['line']; i += 1
        if not plan:
            raise SystemExit(f'no plan for {s["id"]}')
        parts = plan['parts']
        cuts = [start]
        for prt in parts[1:]:
            cuts.append(round(wt(prt['at'], cuts[-1] + 0.3) - 0.12, 2))
        cuts.append(end)
        for k, prt in enumerate(parts):
            prm = dict(prt['params']); prm['type'] = prt['type']
            if 'from_' in prm: prm['from'] = prm.pop('from_')
            sh = dict(id='', start=round(cuts[k], 2), end=round(cuts[k + 1], 2), line=line if len(parts) == 1 else '', scene=prt['scene'], set=prm.get('set'),
                      bars=prt.get('bars') or ('none' if prt['type'] in NO_BARS else DEFAULT_BARS), **{'in': prt.get('in_', dict(type='cut'))},
                      sfx=prt.get('sfx', []), params=prm, notes=s['id'])
            if prt.get('amb'): sh['amb'] = prt['amb']
            out.append(sh)
        i += 1
    # spoken text per split part
    for sh in out:
        if not sh['line']:
            sh['line'] = ' '.join(w['word'] for w in WORDS if sh['start'] - 0.05 <= w['start'] < sh['end'] - 0.05)
    for n, sh in enumerate(out):
        sh['id'] = f's{n + 1:03d}'
        assert sh['end'] > sh['start'], sh
    music = [
        dict(start=0, end=36.1, mood='mystery', intensity=0.35), dict(start=36.1, end=39.75, mood='wonder', intensity=0.5),
        dict(start=39.75, end=93.4, mood='hopeful', intensity=0.3), dict(start=93.4, end=112.25, mood='wonder', intensity=0.4),
        dict(start=112.25, end=174.6, mood='tension', intensity=0.4), dict(start=174.6, end=200.2, mood='dark', intensity=0.45),
        dict(start=200.2, end=253.1, mood='hopeful', intensity=0.3), dict(start=253.1, end=281, mood='wonder', intensity=0.45),
        dict(start=281, end=323.4, mood='mystery', intensity=0.35), dict(start=323.4, end=351.2, mood='sad', intensity=0.4),
        dict(start=351.2, end=389.7, mood='mystery', intensity=0.3), dict(start=389.7, end=435.75, mood='sad', intensity=0.45),
        dict(start=435.75, end=453.4, mood='hopeful', intensity=0.4), dict(start=453.4, end=469.97, mood='triumph', intensity=0.3),
        dict(start=469.97, end=517.4, mood='tension', intensity=0.3), dict(start=517.4, end=543.7, mood='triumph', intensity=0.4),
        dict(start=543.7, end=draft['duration'], mood='calm', intensity=0.3)]
    story = dict(title=draft['title'], duration=draft['duration'], shots=out, music=music, sfx=[])
    json.dump(story, open(os.path.join(HERE, 'shots.json'), 'w'), indent=1)
    durs = sorted(s['end'] - s['start'] for s in out)
    print(f'{len(out)} shots, median {durs[len(durs) // 2]:.2f}s, min {durs[0]:.2f}s, max {durs[-1]:.2f}s')


build()
