"""plan.py — builds story/shots.json from the sentence timeline.
Each entry: (first sentence index, params). A shot runs from its sentence's start until the next shot starts.
Run: python3 story/plan.py  (from the project folder)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
S = json.load(open(os.path.join(ROOT, 'timeline/sentences.json')))
S = S if isinstance(S, list) else S['sentences']
DUR = json.load(open(os.path.join(ROOT, 'config.json')))['duration']

def world(w, cam=None, **kw): return dict(type='world', world=w, cam=cam, **kw)
def ev(s, top='EXHIBIT', **kw): return [dict(k='evidence', str=s, top=top, at=kw.pop('at', 0.8), **kw)]
def ty(s, **kw): return [dict(k='typed', str=s, at=kw.pop('at', 0.8), **kw)]
def st(s, **kw): return [dict(k='stamp', str=s, at=kw.pop('at', 1.0), **kw)]
def fig(who, x, z, p='stand', **kw): return dict(who=who, pos=[x, kw.pop('y', 0), z], p=p, **kw)
TITLE = lambda top, name, sub=None: dict(type='title', top=top, name=name, sub=sub, irisIn=True)

PLAN = [
  # ---------------- cold open: Newcastle
  (0,   world('kitchen', 'wide', ov=ev('NEWCASTLE, 2006', top='CASE FILE'))),
  (1,   world('kitchen', 'box', figs=[fig('MAN', -0.2, -1.5, [[0, 'stand'], [1.5, 'reach'], [3.2, 'holdFront']], facing=1)])),
  (4,   world('kitchen', 'wall', picSwap=1e9)),
  (5,   dict(type='photo', art='flowers', cap='WEEK 1: FLOWERS')),
  (6,   dict(type='photo', art='eyes', cap='WEEK 2: EYES', ov=ty('JUST PAPER.', at=2.4, y=0.88))),
  (9,   dict(type='stat', top='HONESTY BOX PAYMENTS', num='≈3×', label='MORE MONEY WHEN THE EYES WERE UP', sub='Bateson, Nettle & Roberts · Biology Letters, 2006')),
  (10,  world('kitchen', 'wide', pic='eyes', figs=[fig('WOMAN', 0.0, -1.4, [[0, 'stand'], [1.2, 'reach']], facing=1)])),
  (12,  world('kitchen', 'wall', pic='eyes', dive='pic')),
  (13,  world('board', 'pan', irisIn=True)),
  (14,  world('bedroom', 'close', figs=[fig('MAN', 0, -2.75, 'phone', y=0.45, h=1.9, prop='phone')])),
  (16,  world('board', 'wide', dive='big', ov=ty('THE LORE BEHIND WHAT YOU SEE', at=0.3, y=0.12, size=46))),
  # ---------------- Exhibit A
  (17,  TITLE('EXHIBIT A', 'The Evil Eye')),
  (19,  world('alley', 'wide', irisIn=False, ov=ty('MESOPOTAMIA · GREECE · ROME', at=1.5, y=0.88), figs=[fig('WOMAN', -1.3, -9.4, 'stand')])),
  (21,  dict(type='photo', art='nazar', cap='NAZAR: AN EYE AGAINST THE EYE')),
  (22,  world('alley', 'charm', snapAt=2.0, figs=[fig('WOMAN', -1.3, -9.4, [[0, 'stand'], [2.0, 'handsOnHead']])])),
  (24,  world('museum', 'wide', figs=[fig('MAN', 0.9, -7.5, 'stand', act='stone', at=2.6, facing=-1)])),
  (27,  world('museum', 'near', figs=[fig('MAN', 0.9, -7.5, 'stand', act='stone', at=-5, facing=-1)])),
  (29,  dict(type='eye', dive2=[0.5, 0.5])),
  # ---------------- Exhibit B
  (31,  TITLE('EXHIBIT B', 'Paris, 1780s', 'FRANZ MESMER')),
  (33,  world('salon', 'wide', figs=[fig('MESMER', 1.6, -0.4, [[0, 'stand'], [2.0, 'point']], facing=-1), fig('WOMAN', -1.0, -0.9, 'stand', facing=1), fig('GENT', -1.6, -2.2, 'stand', facing=1)], ov=ev('FRANZ MESMER', top='"ANIMAL MAGNETISM"'))),
  (35,  world('salon', 'close', dim=True, figs=[fig('MESMER', 0.9, -1.0, 'point', facing=-1), fig('WOMAN', -0.7, -1.2, 'sit', facing=1, h=2.2)])),
  (37,  world('salon', 'close', dim=True, figs=[fig('MESMER', 0.9, -1.0, [[0, 'explain'], [1.0, 'reach']], facing=-1), fig('WOMAN', -0.7, -1.2, 'stand', facing=1, act='shake', at=1.4)])),
  (39,  world('hall', 'wide', figs=[fig('GENT', -2.0, -2.3, 'crossArms'), fig('GENT', -1.0, -2.3, 'think'), fig('MAN', 0.0, -2.3, 'stand', h=2.4), fig('GENT', 1.0, -2.3, 'crossArms'), fig('GENT', 2.0, -2.3, 'think')], ov=ev('BENJAMIN FRANKLIN', top='ROYAL COMMISSION, 1784', at=2.2))),
  (41,  world('salon', 'close', figs=[fig('WOMAN', -0.3, -1.1, 'stand', prop='blind', facing=1)], ov=ty('THE BLINDFOLD TEST', at=0.8))),
  (44,  world('salon', 'wide', figs=[fig('WOMAN', -0.3, -1.1, 'stand', prop='blind', act='faint', at=1.6, facing=1, h=2.5)])),
  (46,  dict(type='doc', kind='typed', title='REPORT OF THE COMMISSIONERS · 1784', lines=['The fluid has no existence.', 'The effects are due to the', 'imagination.'], stamp='NO FORCE', stampAt=2.4)),
  (48,  dict(type='doc', kind='typed', title='PARIS · AFTER THE REPORT', lines=['Mesmer\'s reputation collapses.', 'He leaves the city.'])),
  (50,  dict(type='eye', refl=None, dive2=[0.5, 0.5])),
  # ---------------- Exhibit C
  (52,  TITLE('EXHIBIT C', 'Florence, 1817', 'BASILICA OF SANTA CROCE')),
  (54,  world('church', 'wide', figs=[fig('GENT', 0.4, -5, 'walkA', act='walk', move=[0, 3.2, 0, 4.5])])),
  (57,  world('church', 'up', figs=[fig('GENT', 0.6, -4.6, [[0, 'stand'], [0.6, 'pointUp']], facing=-1)])),
  (59,  world('church', dict(**{'from': [1.6, 1.6, 0.5], 'to': [1.1, 1.5, -1.2], 'look0': [0.4, 1.2, -4.6], 'look1': [0.4, 1.1, -4.6]}), figs=[fig('GENT', 0.4, -4.6, 'handsOnHead', act='faint', at=2.4, facing=1, h=2.5)])),
  (62,  dict(type='doc', kind='typed', title='STENDHAL · "ROME, NAPLES AND FLORENCE"', lines=['I had palpitations of the heart.', 'Life was drained from me.', 'I walked with the fear of falling.'])),
  (63,  dict(type='doc', kind='typed', title='FLORENCE · PSYCHIATRY CASE NOTES', lines=['Visitors to the city\'s art,', 'admitted with palpitations,', 'dizziness and confusion.'])),
  (64,  dict(type='ecg', words=[[0.1, 'RACING HEARTS'], [1.1, 'DIZZINESS'], [1.9, 'CONFUSION'], [2.8, 'ALL AFTER LOOKING AT ART']])),
  (68,  dict(type='doc', kind='typed', title='DIAGNOSIS', lines=['Named for the writer, 1979.'], stamp='STENDHAL SYNDROME', stampAt=1.4, stampSize=70, sx=0.5, sy=0.58)),
  (70,  world('church', 'up', ceilEye=True, spin=0.3, dive='ceil')),
  # ---------------- interlude
  (72,  world('board', 'pan', irisIn=True, polas=['eyes', 'nazar', 'mesmer', 'swirl'], ov=ty('NOBODY PLANNED THEM.', at=4.0, y=0.88))),
  (75,  dict(type='title', top='CASE FILE', name='Then it was planned.', size=86)),
  # ---------------- Exhibit D
  (76,  TITLE('EXHIBIT D', 'New York, 1929', 'EASTER SUNDAY')),
  (78,  world('street', 'low', figs=[fig('WOMAN', -0.4, -4, 'stand', prop='cig'), fig('GENT', -2.0, -5, 'point', facing=1), fig('MAN', 1.4, -5.5, 'crossArms', facing=-1)], ov=ty('SCANDALOUS', at=1.0, y=0.88))),
  (80,  world('office', 'wide', figs=[fig('MAN', -0.9, -1.2, [[0, 'stand'], [2.5, 'explain']], facing=1)], ov=ev('EDWARD BERNAYS', top='NEPHEW OF SIGMUND FREUD', at=1.2))),
  (82,  dict(type='doc', kind='typed', title='TELEGRAM · MARCH 1929', lines=['WOMEN! LIGHT ANOTHER', 'TORCH OF FREEDOM!', 'FIGHT ANOTHER SEX TABOO!'], stamp='STAGED', stampAt=2.2)),
  (84,  world('street', 'wide', flashAt=[1.8, 3.6], figs=[fig('WOMAN', -0.9, -9, 'holdFront', prop='cig', act='walk', move=[0, 5]), fig('WOMAN', 0.2, -10, 'holdFront', prop='cig', act='walk', move=[0, 5]), fig('WOMAN', 1.2, -9.5, 'holdFront', prop='cig', act='walk', move=[0, 5])])),
  (85,  dict(type='doc', kind='news', mast='NEW YORK', date='APRIL 1, 1929', head='GROUP OF GIRLS PUFF AT CIGARETTES AS A GESTURE OF "FREEDOM"', hs=62)),
  (87,  dict(type='photo', art='parade', wide=True, cap='FIFTH AVENUE, 1929')),
  (89,  dict(type='stat', top='SMOKING AMONG AMERICAN WOMEN', chart=True, label='IN THE DECADES THAT FOLLOWED')),
  (90,  dict(type='photo', art='cig', cap='"YOU JUST HAVE TO SHOW THEM."')),
  (93,  world('street', 'low', figs=[fig('WOMAN', -0.6, -4, 'holdFront', prop='cig'), fig('WOMAN', 0.7, -5, 'talk', prop='cig', facing=-1), fig('GENT', -1.8, -5.5, 'stand')], dive=None, ov=st('NORMAL', at=2.2, x=0.5, y=0.5, size=120))),
  # ---------------- Exhibit E
  (95,  TITLE('EXHIBIT E', 'Philadelphia, 1947', 'N.W. AYER & SON')),
  (97,  world('office', 'wide', figs=[fig('WOMAN', -0.9, -1.25, 'think', facing=1)], ov=ev('FRANCES GERETY', top='COPYWRITER', at=1.4))),
  (98,  world('office', 'close', dive='page', figs=[fig('WOMAN', -0.9, -1.25, [[0, 'sad'], [1.5, 'reach']], facing=1)])),
  (100, dict(type='doc', kind='slogan', text='A diamond is forever.', size=70, irisIn=True)),
  (101, dict(type='photo', art='ring', cap='IN FILMS. IN MAGAZINES. ON MOVIE STARS.')),
  (102, dict(type='doc', kind='typed', title='N.W. AYER & SON · REPORT TO DE BEERS, 1951', lines=['Jewelers report: a girl is', 'not engaged without', 'a diamond ring.'])),
  (105, dict(type='doc', kind='typed', title='TRADITION: ORIGIN', lines=['Written by an ad agency.', 'Philadelphia, 1947.'], stamp='MANUFACTURED', stampAt=1.6, stampSize=80, dive2=[0.5, 0.45])),
  # ---------------- Exhibit F
  (106, TITLE('EXHIBIT F', 'Fort Lee, 1957', 'NEW JERSEY')),
  (108, dict(type='doc', kind='news', mast='THE DAILY RECORD', date='SEPTEMBER 1957', head='HIDDEN ADS FLASHED IN MOVIE, SAYS RESEARCHER', hs=68)),
  (109, world('cinema', 'wide', flash=[]) ),
  (110, world('cinema', 'front', flash=[2, 5, 9, 14, 20, 26])),
  (112, dict(type='stat', top='POPCORN SALES (CLAIMED)', to=57, pre='+', suf='%', label='"EAT POPCORN"', sub='James Vicary, 1957')),
  (114, dict(type='doc', kind='news', mast='THE DAILY RECORD', date='1957', head='HIDDEN MESSAGES: MIND CONTROL THROUGH THE SCREEN?', hs=66, stamp='BANNED', stampAt=3.4)),
  (118, dict(type='doc', kind='typed', title='ADVERTISING AGE · 1962', lines=['Vicary: the study was "a gimmick".', 'The data: "too small to be meaningful".'], stamp='HOAX', stampAt=3.0, stampSize=120)),
  (121, world('cinema', 'faces', turnAt=1.5)),
  (123, world('cinema', 'front', dive='screen')),
  # ---------------- Exhibit G
  (125, TITLE('EXHIBIT G', 'Stanford, 1961', 'ALBERT BANDURA')),
  (127, world('lab', 'wide', figs=[fig('SCI', 1.2, -1.0, 'holdFront', prop='clip', facing=-1), fig('KID', -0.2, -1.2, 'walkA', act='walk', move=[-0.6, -0.2, 0, 3], h=1.6)])),
  (128, world('lab', 'wide', figs=[fig('MAN', -0.6, -1.3, 'stand', act='punch', at=1.2, prop='mallet')], props=[dict(k='bobo', pos=[0.3, 0, -1.5], h=1.6, hitAt=1.4)])),
  (132, world('lab', 'low', figs=[fig('KID', -0.7, -1.2, 'stand', h=1.5)], props=[dict(k='bobo', pos=[0.3, 0, -1.5], h=1.6)])),
  (133, world('lab', 'low', figs=[fig('KID', -0.4, -1.2, 'stand', act='punch', at=0.6, prop='mallet', h=1.5)], props=[dict(k='bobo', pos=[0.3, 0, -1.5], h=1.6, hitAt=0.8, down=4.6)])),
  (137, world('lab', 'wide', figs=[fig('KID', -0.4, -1.2, 'stand', h=1.5)], props=[dict(k='bobo', pos=[0.3, 0, -1.5], h=1.6)], ov=ty('NOBODY TOLD THEM TO.', at=0.6))),
  (140, dict(type='eye', refl='bobo', dive2=[0.5, 0.5])),
  # ---------------- Exhibit H
  (142, TITLE('EXHIBIT H', 'The Television Years', 'GEORGE GERBNER, 1970s')),
  (144, world('living', 'wide', tv='news', figs=[fig('MAN', -1.4, -2.2, 'sit', facing=1, h=2.2), fig('WOMAN', -0.3, -2.2, 'sit', facing=1, h=2.2)], ov=ev('GEORGE GERBNER', top='RESEARCHER', at=1.5))),
  (146, world('living', 'tv', tv='crime')),
  (148, dict(type='stat', top='HEAVY TV VIEWERS', num='MORE AFRAID', ns=130, label='OVERESTIMATE VIOLENCE · DISTRUST STRANGERS')),
  (150, world('living', 'window', stranger=True)),
  (151, dict(type='doc', kind='typed', title='DIAGNOSIS', lines=['Cultivation theory, 1970s.'], stamp='MEAN WORLD SYNDROME', stampAt=0.9, stampSize=64, sx=0.5, sy=0.58)),
  (152, world('living', 'tv', tv='news', dive='tv')),
  # ---------------- Exhibit I
  (154, TITLE('EXHIBIT I', 'Fiji, 1995', 'NADROGA PROVINCE')),
  (156, world('island', 'wide', figs=[fig('WOMAN', 0.6, -0.8, 'stand', facing=-1), fig('WOMAN', 1.6, -1.4, 'talk', facing=-1), fig('MAN', -0.6, -1.0, 'wave', facing=1)], ov=ty('NO TELEVISION', at=1.0, y=0.88))),
  (159, world('island', 'hut', tv=True, antenna=True, figs=[fig('GIRL', -1.6, 0.2, 'stand', facing=-1, h=2.2), fig('GIRL', -0.6, 0.4, 'stand', facing=-1, h=2.2)])),
  (160, world('living', 'tv', tv='thin')),
  (163, dict(type='doc', kind='typed', title='HARVARD MEDICAL SCHOOL · 1995–1998', lines=['Study: ethnic Fijian adolescent girls.', 'Before television, and three years after.'])),
  (164, dict(type='stat', top='GIRLS WHO MADE THEMSELVES VOMIT TO LOSE WEIGHT', fromTxt='0%', toTxt='11%', label='BEFORE TV  →  THREE YEARS LATER', sub='Becker et al., British Journal of Psychiatry, 2002', ls=30)),
  (167, dict(type='stat', top='SIGNS OF DISORDERED EATING', num='×2', label='MORE THAN DOUBLED')),
  (168, dict(type='eye', refl='figure')),
  (169, world('island', 'hut', tv=True, antenna=True, figs=[fig('GIRL', -1.6, 0.2, 'sad', facing=-1, h=2.2)], ov=ty('THREE YEARS.', at=0.3))),
  (171, dict(type='title', top='CASE FILE', name='From the screen… to the norm.', size=74, dive2=[0.5, 0.5])),
  # ---------------- Final exhibit
  (173, TITLE('FINAL EXHIBIT', 'Now')),
  (175, world('board', 'pan', polas=['swirl', 'cig', 'film', 'tv', 'phone'], ov=ty('A CANVAS. A PARADE. A CINEMA. A TV.', at=0.8, y=0.88))),
  (176, world('bedroom', 'wide', figs=[fig('MAN', 0, -2.75, 'phone', y=0.45, h=1.9, prop='phone')])),
  (178, world('scroll', 'glide', ov=ev('AZA RASKIN, 2006', top='INVENTED INFINITE SCROLL', at=1.0))),
  (182, dict(type='stat', top='HIS OWN ROUGH GUESS', to=200000, label='HUMAN LIFETIMES SCROLLED AWAY · EVERY DAY', ns=180)),
  (184, dict(type='doc', kind='typed', title='PNAS · 2014 · "EMOTIONAL CONTAGION"', lines=['Participants: 689,003 users.', 'Duration: one week.', 'Users told: no.'])),
  (186, dict(type='phones')),
  (188, world('bedroom', 'close', figs=[fig('MAN', 0, -2.75, [[0, 'phone'], [2.2, 'sad']], y=0.45, h=1.9, prop='phone')], ov=ty('THEY JUST LOOKED.', at=2.6))),
  (192, dict(type='face', mode='split')),
  (194, dict(type='doc', kind='typed', title='FACIAL PLASTIC SURGERY · 2018', lines=['New trend: patients bring in', 'filtered selfies of themselves.'], stamp='"SNAPCHAT DYSMORPHIA"', stampAt=2.6, stampSize=56, sx=0.5, sy=0.72)),
  (196, dict(type='photo', art='selfie', cap='THE NORM: YOU. EDITED.')),
  (197, dict(type='face', mode='filtered', ov=st('EDITED', at=4.2, x=0.72, y=0.78))),
  (200, world('kitchen', 'wall', pic='eyes', irisIn=False)),
  (202, world('scroll', 'glide', ov=ty('HOW MANY FACES. HOW MANY BODIES.', at=1.5, y=0.88))),
  (205, world('scroll', 'glide', fov=55)),
  (207, world('mirror', 'wide', figs=[fig('MAN', 0.45, -0.9, 'stand', facing=-1)], ov=ev('THE STRANGE-FACE ILLUSION', top='CAPUTO, 2010', at=1.5))),
  (211, dict(type='face', mode='mirror')),
  (215, dict(type='eye', refl='phone')),
  (218, world('board', 'pull', blinkAt=4.6, ov=ty('BE WARY OF YOUR EYES.', at=3.0, y=0.12, size=48))),
]

shots = []
for i, (si, p) in enumerate(PLAN):
    start = 0.0 if i == 0 else round(S[si]['start'] - 0.12, 2)
    shots.append(dict(id=f's{i+1:03d}', start=start, line=' '.join(s['text'] for s in S[si:(PLAN[i+1][0] if i + 1 < len(PLAN) else len(S))]), params={k: v for k, v in p.items() if v is not None}))
for i, s in enumerate(shots): s['end'] = shots[i + 1]['start'] if i + 1 < len(shots) else round(DUR, 3)
# transitions + sound
prev_dive = False
for s in shots:
    p = s['params']; dur = s['end'] - s['start']
    if prev_dive: p['irisIn'] = True
    if p.get('irisIn') is False: p.pop('irisIn')
    s['in'] = {'type': 'cut'} if (prev_dive or p.get('irisIn') or p.get('type') == 'title') else {'type': 'fade', 'dur': 0.6}
    sfx = []
    if p.get('dive') or p.get('dive2'): sfx.append({'at': round(dur - 1.6, 2), 'name': 'whoosh', 'gain': -10, 'dur': 1.4})
    if p.get('type') == 'title': sfx.append({'at': 0.35, 'name': 'hit', 'gain': -12})
    if p.get('stamp'): sfx.append({'at': p.get('stampAt', 2), 'name': 'hit', 'gain': -8})
    for o in p.get('ov', []):
        if o['k'] == 'stamp': sfx.append({'at': o['at'], 'name': 'hit', 'gain': -8})
    for fa in p.get('flashAt', []): sfx.append({'at': fa, 'name': 'flash', 'gain': -14})
    if p.get('type') == 'ecg': sfx.append({'at': 0, 'name': 'heartbeat', 'gain': -8, 'dur': dur, 'bpm': 110})
    s['sfx'] = sfx
    w = p.get('world')
    if w == 'alley': s['amb'] = {'name': 'rain', 'gain': -22}
    if w in ('street', 'cinema'): s['amb'] = {'name': 'murmur', 'gain': -24}
    if w == 'living': s['amb'] = {'name': 'hum', 'gain': -26}
    prev_dive = bool(p.get('dive') or p.get('dive2'))
    s['scene'] = p.get('world') or p.get('type'); s['set'] = None; s['bars'] = 'none'
music = [dict(start=0, end=191.5, mood='mystery', intensity=0.55), dict(start=191.5, end=325, mood='tension', intensity=0.6),
         dict(start=325, end=447.5, mood='dark', intensity=0.6), dict(start=447.5, end=523.4, mood='tension', intensity=0.7), dict(start=523.4, end=round(DUR, 3), mood='sad', intensity=0.5)]
json.dump(dict(title='The Lore Behind What You See', duration=round(DUR, 3), music=music, sfx=[], shots=shots), open(os.path.join(HERE, 'shots.json'), 'w'), indent=1)
d = sorted(s['end'] - s['start'] for s in shots)
print(f'{len(shots)} shots; median {d[len(d)//2]:.1f}s, min {d[0]:.1f}s, max {d[-1]:.1f}s')
for s in shots:
    if s['end'] - s['start'] < 1.6 or s['end'] - s['start'] > 12: print('  check', s['id'], round(s['end'] - s['start'], 1), s['line'][:60])
