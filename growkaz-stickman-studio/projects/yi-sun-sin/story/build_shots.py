"""Build story/shots.json for the Yi Sun-sin video from the beats draft + this plan.
Run from the project folder:  python3 story/build_shots.py
Rules: camera always pushing in; no hard cuts except impact moments (default transition: zoom-through).
"""
import json, re, os

HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
draft = json.load(open(os.path.join(HERE, 'shots_draft.json')))
WORDS = json.load(open(os.path.join(PROJ, 'timeline', 'words.json')))['words']
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
SH = {s['id']: s for s in draft['shots']}


def wt(word, after):
    parts = [norm(x) for x in word.split()]
    for i, w in enumerate(WORDS):
        if w['start'] < after - 0.05: continue
        seq = WORDS[i:i + len(parts)]
        if len(seq) == len(parts) and all(norm(s['word']).startswith(p) if k == len(parts) - 1 else norm(s['word']) == p for k, (s, p) in enumerate(zip(seq, parts))):
            return w['start']
    raise SystemExit(f'word not found: {word} after {after}')


def rel(sid, word): return round(wt(word, SH[sid]['start']) - SH[sid]['start'], 2)
def F(who, x=0.5, p='stand', f=1, s=1.6, **kw): d = dict(who=who, x=x, p=p, f=f, s=s); d.update(kw); return d
def L(str_, at=0.2, **kw): d = dict(str=str_, at=at); d.update(kw); return d
def P(type_, scene, **kw):
    meta = {k: kw.pop(k) for k in ['at', 'in_', 'sfx', 'amb'] if k in kw}
    return dict(type=type_, scene=scene, params=kw, **meta)
def S(scene, **kw): return P('scene', scene, **kw)
def one(p, merge=False): return dict(parts=[p], merge=merge)


C_RED = '#c8202a'
ZOOM = dict(type='zoom', dur=0.5); WHIP = dict(type='whip', dur=0.35); FADE = dict(type='fade', dur=0.8); CUT = dict(type='cut')
PLAN = {
 's001': one(P('diary', 'A brush-written letter, Joseon 1597', title='JOSEON · 1597', seal=True, in_=dict(type='fade', dur=0.6))),
 's002': one(S('Burning Korean warships on a blood-red sea', bg='dusk', ground='sea', sun=[0.7, 0.35, 160], ships=[dict(kind='panok', x=0.3, s=1.1, fire=True), dict(kind='panok', x=0.62, s=0.8, fire=True), dict(kind='panok', x=0.85, s=0.6, fire=True)], fx=['smoke', 'embers'])),
 's003': one(S('An empty sea; one lonely ship on the horizon', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.66, s=0.45)], ov=dict(labels=[L('ALMOST EVERY SHIP: GONE', 0.3)]))),
 's004': one(P('diary', 'The letter: "I still have twelve ships."', title='LETTER TO THE KING', quote='"I still have twelve ships."', quoteAt=0.1, wordRate=0.3, seal=True, seed=1)),
 's005': one(P('tally', '13 red Korean ships vs 133 Japanese ships, counted out', mode='vs', a=13, b=133, bAt=rel('s005', 'Japanese'))),
 's006': one(P('sea3d', '3D: Korean line faces the Japanese fleet', preset='fleet', ov=dict(labels=[L('SHIPS LOST: 0', 0.6, red=True)]))),
 's007': one(P('portrait', 'Profile silhouette of Yi Sun-sin before a red sun', who='YI', ov=dict(labels=[L('ADMIRAL YI SUN-SIN', 0.3, y=0.85, size=44)]))),
 's008': one(P('tally', '23 tally marks, then 0 DEFEATS stamp', mode='streak', zeroAt=rel('s008', 'never'))),
 's009': one(S('Officials whisper; legends are hearsay', bg='paper', props=[dict(k='palace', x=0.5, s=0.9, far=True)], figs=[F('OFFICIAL', 0.3, 'talk'), F('OFFICIAL', 0.45, 'shrug', f=-1), F('OFFICIAL', 0.7, 'think', f=-1)], ov=dict(labels=[L('MOST LEGENDS: HEARSAY', 0.4)]))),
 's010': one(P('diary', 'His own war diary', title='HIS OWN WAR DIARY', seal=True, seed=2)),
 's011': one(P('title', 'Ransom-note title over a ghost turtle ship', sub='THE LORE BEHIND YI SUN-SIN', sfx=[dict(at=0.1, name='impact', gain=-6)])),
 # --- origins
 's012': one(P('date', '1545, Seoul', str='1545', sub='SEOUL · JOSEON KOREA', bg='paper')),
 's013': one(S('A warship at sea, crossed out', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.5, s=1.0)], ov=dict(labels=[L('SAILOR? NOT YET', 0.3, red=True)]))),
 's014': one(S('Young Yi with a spear, pines, red sun', figs=[F('YI', 0.42, 'ready', spear=True)], props=[dict(k='pine', x=0.15, s=1.2), dict(k='pine', x=0.82, s=0.9)], ov=dict(labels=[L('A SOLDIER', 0.2)]))),
 's015': one(S('Examiners before the palace', props=[dict(k='palace', x=0.6, s=0.8, far=True)], figs=[F('OFFICIAL', 0.62, 'crossArms', f=-1, s=1.3), F('OFFICIAL', 0.74, 'crossArms', f=-1, s=1.3), F('YI', 0.3, 'stand')], ov=dict(date='AGE 27 · MILITARY EXAM'))),
 's016': one(S('His horse throws him', figs=[F('YI', 0.5, [[0, 'stand'], [0.9, 'fall']], s=1.6)], props=[dict(k='horse', x=0.66, s=1.1, f=1)], extra='fall', sfx=[dict(at=0.95, name='hit', gain=-8)])),
 's017': dict(parts=[
    S('He kneels by a willow, stripping bark', figs=[F('YI', 0.42, 'kneel')], props=[dict(k='willow', x=0.6, s=1.1)], extra='bark', ov=dict(labels=[L('THE STORY GOES...', 0.2)])),
    S('Splinted, he limps on to finish the test', at='and finished', figs=[F('YI', 0.3, walk=[0.25, 0.6, 0, 2])], props=[dict(k='willow', x=0.82, s=0.9, far=True)])]),
 's018': one(S('FAILED stamp', figs=[F('YI', 0.4, 'sad')], extra='fail', sfx=[dict(at=0.35, name='hit', gain=-10)])),
 's019': one(S('Four years later: PASSED', figs=[F('YI', 0.4, [[0, 'stand'], [0.5, 'cheer']])], extra='pass', ov=dict(date='1576'), sfx=[dict(at=0.65, name='ding', gain=-10)])),
 's020': one(S('A lonely soldier on a frontier ridge at dusk', bg='dusk', props=[dict(k='mountains', x=0.5, far=True)], figs=[F('YI', 0.5, 'stand', spear=True)])),
 's021': one(P('map', 'Map: posted to the remote northern frontier', focus=[129.5, 41.6, 1], from_='seoul', z0=1.0, rate=0.06, arrows=[dict(pts=['seoul', [127.6, 39.6, 1], 'frontier'], at=0.2, dur=2)], pins=[dict(place='frontier', at=1.8, name='NORTHERN FRONTIER', dx=-200)])),
 's022': one(S('Powerful officials point; Yi refuses', props=[dict(k='palace', x=0.65, s=0.7, far=True)], figs=[F('OFFICIAL', 0.65, 'point', f=-1), F('OFFICIAL', 0.78, 'crossArms', f=-1), F('YI', 0.32, 'crossArms')])),
 's023': one(S('A border raid at dusk, arrows in the air', bg='dusk', props=[dict(k='mountains', x=0.5, far=True)], figs=[F('SOLDIER', 0.3, 'ready', spear=True), F('SOLDIER', 0.5, 'fall', f=-1), F('SOLDIER', 0.7, 'ready', f=-1, spear=True)], extra='arrowsRain', ov=dict(date='1587 · NORTHERN BORDER'))),
 's024': one(S('Stripped of rank: Yi kneels as an official points', figs=[F('OFFICIAL', 0.66, 'point', f=-1), F('YI', 0.4, 'kneel')], ov=dict(labels=[L('DEMOTED TO COMMON SOLDIER', 1.2, red=True)]))),
 's025': one(S('He walks back toward the rising sun', bg='dawn', sun=[0.75, 0.55, 160], figs=[F('YI', 0.25, walk=[0.2, 0.55, 0, 1.7])])),
 's026': one(S('An official hands him a commission scroll', props=[dict(k='palace', x=0.5, s=0.8, far=True)], figs=[F('OFFICIAL', 0.6, 'holdFront', f=-1), F('YI', 0.4, 'stand')], extra='scroll', ov=dict(date='1591'))),
 's027': one(P('map', 'Map: Jeolla province glows red', focus='jeolla', from_=[127.5, 37.0, 1], z0=1.0, rate=0.12, region='jeolla', pins=[dict(place='yeosu', at=1.5, name='JEOLLA LEFT NAVY', red=True)])),
 's028': one(S('Calm water, red sails at anchor', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.3, s=0.8), dict(kind='panok', x=0.6, s=0.6), dict(kind='turtle', x=0.82, s=0.5)])),
 's029': one(P('map', 'Map: Japan, newly unified', focus='japan', from_=[129.0, 35.0, 1], z0=1.2, rate=0.1, pins=[dict(place='japan', at=1.0, name='JAPAN · UNIFIED', ink=True, dx=-60, dy=-90)])),
 's030': one(P('portrait', 'Silhouette of Toyotomi Hideyoshi', who='SAMURAI', bg='dusk', f=-1, sunX=0.45, x=0.58, ov=dict(labels=[L('TOYOTOMI HIDEYOSHI', 0.3, y=0.85, size=44)]))),
 's031': one(P('portrait', 'Hideyoshi, closer, against red', who='SAMURAI', bg='red', f=-1, x=0.56, sunX=0.4, z0=1.12, rate=0.06)),
 's032': one(P('map', 'Map: the plan, Japan → Korea → China', focus=[126.5, 37.8, 1], z0=0.95, rate=0.04, arrows=[dict(pts=['japan', 'busan', 'seoul', 'pyongyang', 'china'], at=0.3, dur=2.8, ink=True)])),
 's033': one(P('portrait', 'Yi at night, watching', who='YI', bg='night', sunX=0.62)),
 's034': dict(parts=[
    S('Yi drills his sailors on deck', ground='deck', figs=[F('SAILOR', 0.25, 'ready', spear=True, s=1.4), F('SAILOR', 0.4, 'ready', spear=True, s=1.4), F('SAILOR', 0.55, 'ready', spear=True, s=1.4), F('YI', 0.78, 'point', f=-1)]),
    P('sea3d', '3D: the turtle ship', at='and rebuilt', preset='turtle', ov=dict(labels=[L('THE TURTLE SHIP', 0.8, red=True)]))]),
 's035': one(S('The turtle ship: roof and spikes', bg='paper', ground='sea', ships=[dict(kind='turtle', x=0.48, s=2.2, rim=C_RED)], ov=dict(labels=[L('COVERED ROOF', 0.2, x=0.3, y=0.2), L('SPIKES: NO BOARDING', rel('s035', 'studded'), x=0.68, y=0.2, red=True)]))),
 's036': one(S('Cannons and a smoking dragon head', bg='paper', ground='sea', ships=[dict(kind='turtle', x=0.42, s=2.2, smoke=True, rim=C_RED)], ov=dict(labels=[L('CANNONS ON EVERY SIDE', 0.1, x=0.3, y=0.2), L('DRAGON HEAD', rel('s036', 'dragon'), x=0.75, y=0.3, red=True)]))),
 's037': one(P('diary', 'His diary: cannon test days before the war', title='WAR DIARY · SPRING 1592', seed=3, quote='Cannon test. Days before the war.', quoteAt=1.2, wordRate=0.25)),
 's038': one(P('sea3d', '3D: a vast Japanese armada nears Busan', preset='invasion', n=60, ov=dict(date='SPRING 1592', labels=[L('150,000+ MEN', 1.5, red=True)])), merge=True),
 's040': one(P('tally', 'Rows of samurai: veterans of 100 years of war', mode='army')),
 's041': one(S("Korea's army collapses in smoke", bg='dusk', figs=[F('SOLDIER', 0.6, walk=[0.6, 0.15, 0, 2.2], f=-1), F('SOLDIER', 0.75, walk=[0.78, 0.3, 0, 2.2], f=-1)], fx=['smoke', 'embers'])),
 's042': one(P('map', 'Map: Busan to Seoul in under three weeks', focus='seoul', from_='busan', z0=1.3, rate=0.08, arrows=[dict(pts=['busan', [128.4, 36.3, 1], 'seoul'], at=0.1, dur=1.4, ink=True)], cross=[dict(place='seoul', at=1.5)], pins=[dict(place='seoul', at=1.6, name='SEOUL FALLS · < 3 WEEKS', ink=True)])),
 's043': one(P('map', 'Map: the king flees north', focus='uiju', from_='seoul', z0=1.2, rate=0.06, arrows=[dict(pts=['seoul', 'pyongyang', 'uiju'], at=0.1, dur=1.6)], pins=[dict(place='uiju', at=1.6, name='THE KING FLED', red=True)])),
 's044': one(S('The palace burns on land', bg='dusk', props=[dict(k='palace', x=0.5, s=1.0)], fx=['smoke', 'embers'])),
 's045': one(P('sea3d', '3D: but at sea, Yi\'s fleet advances', preset='fleet', in_=WHIP, sfx=[dict(at=0.0, name='whoosh', gain=-8)])),
 's046': one(P('map', 'Map: Okpo, first victory', focus='okpo', from_='yeosu', z0=1.6, rate=0.1, tokens=[dict(kind='panok', from_='yeosu', to='okpo', n=6, spread=60, at=0, dur=2.6), dict(kind='jp', from_='okpo', n=5, spread=70, show=True, fire=True)], pins=[dict(place='okpo', at=rel('s046', 'He won'), name='OKPO · WIN', red=True)])),
 's047': one(P('map', 'Map: Sacheon, the turtle ship sails', focus='sacheon', from_='yeosu', z0=1.8, rate=0.1, tokens=[dict(kind='turtle', from_='yeosu', to='sacheon', at=0.2, dur=3, s=0.22)], pins=[dict(place='sacheon', at=2.5, name='SACHEON', red=True)])),
 's048': one(S('The turtle ship rams the Japanese line through musket smoke', bg='paper', ground='sea', ships=[dict(kind='turtle', x=0.12, s=1.2, vx=0.16, rim=C_RED), dict(kind='jp', x=0.62, s=1.0, f=-1), dict(kind='jp', x=0.85, s=0.8, f=-1)], extra='muskets')),
 's049': one(S('On deck, Yi is struck in the shoulder', ground='deck', figs=[F('YI', 0.46, [[0, 'point'], [1.3, 'sad']], sword=-0.6)], extra='bullet', bulletAt=0.4, sfx=[dict(at=1.0, name='hit', gain=-8)])),
 's050': one(P('map', 'Map: win, win, win along the coast', focus=[128.2, 34.9, 1], z0=1.5, rate=0.08, pins=[dict(place=[128.25, 34.85, 1], at=rel('s050', 'won'), name='WIN', red=True), dict(place=[127.85, 34.8, 1], at=rel('s050', 'Then again'), name='WIN', red=True, dy=60), dict(place=[128.6, 34.8, 1], at=rel('s050', 'And again'), name='WIN', red=True, dy=-120)])),
 's051': one(P('date', 'Hansan Island, August 1592', str='HANSAN ISLAND', size=120, sub='AUGUST 1592', bg='paper')),
 's052': one(P('map', 'Map: bait ships flee to open water', focus='hansan', z0=2.2, rate=0.1, tokens=[dict(kind='panok', from_=[128.5, 34.82, 1], to=[128.4, 34.5, 1], n=3, spread=30, at=0.6, dur=4.5), dict(kind='jp', from_=[128.75, 34.88, 1], to=[128.5, 34.58, 1], n=10, spread=60, at=2.5, dur=3.8, f=-1)])),
 's053': one(S('Japanese ships give chase', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.82, s=0.7, vx=0.08), dict(kind='jp', x=0.15, s=0.9, vx=0.12), dict(kind='jp', x=0.38, s=0.8, vx=0.12)], in_=WHIP, sfx=[dict(at=0.0, name='whoosh', gain=-10)])),
 's054': one(P('map', 'Map: the fleet swings into a half-moon', focus='hansan', z0=2.3, rate=0.1, crane=dict(place=[128.45, 34.58, 1], at=0.4), tokens=[dict(kind='jp', from_=[128.45, 34.66, 1], n=8, spread=50, show=True, f=-1)])),
 's055': one(P('map', 'Map: the crane wing closes', focus='hansan', z0=2.5, rate=0.1, crane=dict(place=[128.45, 34.58, 1], at=-5), tokens=[dict(kind='jp', from_=[128.45, 34.66, 1], n=8, spread=50, show=True, f=-1, fire=True)], pins=[dict(place=[128.45, 34.58, 1], at=0.3, name='CRANE WING FORMATION', red=True, dy=-170)])),
 's056': one(S('The Japanese fleet burns', bg='dusk', ground='sea', ships=[dict(kind='jp', x=0.25, s=1.0, fire=True), dict(kind='jp', x=0.55, s=0.8, fire=True), dict(kind='jp', x=0.8, s=0.6, fire=True)], fx=['smoke', 'embers'], ov=dict(labels=[L('70+ SHIPS DESTROYED OR CAPTURED', 0.6, red=True)]))),
 's057': one(P('date', 'A turning point', str='TURNING POINT', size=120, bg='ink')),
 's058': one(P('map', 'Map: the sea road cut', focus=[128.0, 34.8, 1], z0=1.6, rate=0.08, arrows=[dict(pts=['japan', 'busan', [128.5, 34.6, 1], [127.6, 34.5, 1], [126.4, 34.45, 1]], at=0.1, dur=2.2, ink=True)], cross=[dict(place='hansan', at=rel('s058', 'Yi had'))])),
 's059': one(P('map', 'Map: the advance stalls at Pyongyang', focus='pyongyang', from_='seoul', z0=1.3, rate=0.06, arrows=[dict(pts=['seoul', 'pyongyang'], at=0, dur=1, ink=True)], pins=[dict(place='pyongyang', at=1.2, name='STALLED', ink=True)])),
 # --- betrayal
 's060': one(S('Yi walks toward the palace', props=[dict(k='palace', x=0.68, s=1.0, far=True)], figs=[F('YI', 0.25, walk=[0.2, 0.42, 0, 3.3])])),
 's061': one(S('The palace looms huge over a tiny Yi', bg='red', sun=False, props=[dict(k='palace', x=0.55, s=1.9)], figs=[F('YI', 0.2, 'stand', s=0.9)])),
 's062': one(S('Rivals whisper at court', props=[dict(k='palace', x=0.5, s=0.9, far=True)], figs=[F('OFFICIAL', 0.35, 'talk'), F('OFFICIAL', 0.5, 'think', f=-1), F('OFFICIAL', 0.66, 'point', f=-1)], ov=dict(labels=[L('JEALOUS RIVALS', 0.4)]))),
 's063': one(S('A double agent passes false intelligence', figs=[F('SAMURAI', 0.38, 'holdFront'), F('OFFICIAL', 0.62, 'holdFront', f=-1)], extra='scroll', ov=dict(labels=[L('DOUBLE AGENT', 0.5, red=True)]))),
 's064': one(P('map', 'Map: "attack them here" — a trap', focus='busan', from_='hansan', z0=1.8, rate=0.1, tokens=[dict(kind='jp', from_=[129.0, 34.85, 1], n=8, spread=70, show=True, f=-1)], arrows=[dict(pts=['hansan', [128.85, 34.85, 1]], at=1.2, dur=1.6)], pins=[dict(place=[129.0, 34.85, 1], at=2.4, name='A TRAP?', ink=True)])),
 's065': one(P('portrait', 'Yi refuses to sail', who='YI', bg='paper', ov=dict(labels=[L('REFUSED TO SAIL', 0.6, y=0.85, red=True)]))),
 's066': one(P('portrait', 'The king, offended', who='KING', bg='dusk', f=-1, x=0.56, sunX=0.42, ov=dict(labels=[L('"DISOBEDIENCE"', 0.5, y=0.85, serif=True)]))),
 's067': dict(parts=[
    S('Soldiers seize Yi', figs=[F('SOLDIER', 0.32, 'reach', spear=True), F('YI', 0.5, 'sad'), F('SOLDIER', 0.68, 'reach', f=-1, spear=True)], ov=dict(date='1597 · ARRESTED')),
    S('Dragged to the capital in chains', at='dragged', bg='dusk', props=[dict(k='palace', x=0.8, s=0.7, far=True)], figs=[F('SOLDIER', 0.2, walk=[0.15, 0.35, 0, 3], spear=True), F('YI', 0.32, walk=[0.27, 0.47, 0, 3])], extra='chainsWalk')]),
 's068': one(S('Kneeling, a guard behind him: close to execution', bg='red', sun=False, figs=[F('YI', 0.45, 'kneel'), F('SOLDIER', 0.6, 'stand', f=-1, sword=-1.9)], ov=dict(labels=[L('CLOSE TO EXECUTION', 0.4, ink=True)]))),
 's069': one(S('A common soldier again, in the ranks', figs=[F('SOLDIER', 0.25, 'stand', spear=True), F('YI', 0.42, 'stand', spear=True), F('SOLDIER', 0.59, 'stand', spear=True), F('SOLDIER', 0.76, 'stand', spear=True)], ov=dict(labels=[L('DEMOTED · AGAIN', 0.8, red=True)]))),
 's070': one(P('portrait', 'Won Gyun', who='WON', bg='paper', f=-1, x=0.56, sunX=0.42, ov=dict(labels=[L('ADMIRAL WON GYUN', 0.3, y=0.85, size=44)]))),
 's071': one(P('map', 'Map: ambush at Chilcheollyang', focus='chilcheollyang', z0=2.0, rate=0.1, tokens=[dict(kind='panok', from_=[128.2, 34.85, 1], to='chilcheollyang', n=10, spread=50, at=0, dur=2.5), dict(kind='jp', from_=[128.9, 34.7, 1], to=[128.65, 34.88, 1], n=14, spread=110, at=2.5, dur=2.5, f=-1)], pins=[dict(place='chilcheollyang', at=3.5, name='CHILCHEOLLYANG · 1597', ink=True)])),
 's072': one(S('The Korean fleet burns', bg='dusk', ground='sea', ships=[dict(kind='panok', x=0.22, s=1.0, fire=True), dict(kind='turtle', x=0.5, s=0.8, fire=True), dict(kind='panok', x=0.78, s=0.7, fire=True)], fx=['smoke', 'embers'], ov=dict(labels=[L('THE NAVY: WIPED OUT', 0.3, red=True)]))),
 's073': one(S('A dozen survivors flee', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.3 + i * 0.05, s=0.3 + (i % 3) * 0.05, y=0.78 + (i % 2) * 0.03, vx=-0.05, f=-1) for i in range(12)], ov=dict(labels=[L('~12 SHIPS ESCAPED', 0.6)]))),
 's074': one(S('The king summons Yi back', props=[dict(k='palace', x=0.6, s=0.8, far=True)], figs=[F('KING', 0.62, 'stand', f=-1), F('YI', 0.4, [[0, 'kneel'], [1.6, 'stand']])])),
 's075': one(S('The king points inland: "Fight on land"', props=[dict(k='mountains', x=0.5, far=True)], figs=[F('KING', 0.62, 'point', f=-1), F('YI', 0.4, 'stand')], ov=dict(labels=[L('GIVE UP THE NAVY?', 1.2)]))),
 's076': one(P('diary', 'His reply, brush on paper', title='REPLY TO THE KING · 1597', seal=True, seed=4)),
 's077': one(P('diary', '"I still have twelve ships."', title='REPLY TO THE KING · 1597', seal=True, seed=4, quote='"I still have twelve ships."', quoteAt=0.0, wordRate=0.28, qSize=56)),
 's078': one(P('portrait', '"The enemy will not dare..."', who='YI', bg='red', ov=dict(labels=[L('"THE ENEMY WILL NOT DARE', 0.5, y=0.78, serif=True, size=36), L('LOOK DOWN ON US"', 2.8, y=0.87, serif=True, size=36)]))),
 's079': one(P('tally', 'Twelve ships, plus one: thirteen', mode='vs', a=13, b=0, bAt=99)),
 # --- Myeongnyang
 's080': one(P('sea3d', '3D: 130+ warships enter the strait', preset='strait', nJ=26, vJ=1.0, ov=dict(date='OCTOBER 1597', labels=[L('MYEONGNYANG STRAIT', 1.5, red=True)])), merge=True),
 's082': one(P('map', 'Map: the narrow, fast strait', focus='myeongnyang', z0=2.6, rate=0.1, arrows=[dict(pts=[[126.15, 34.72, 1], [126.31, 34.57, 1], [126.45, 34.42, 1]], at=0.2, dur=1), dict(pts=[[126.07, 34.7, 1], [126.23, 34.55, 1], [126.37, 34.4, 1]], at=0.6, dur=1), dict(pts=[[126.23, 34.74, 1], [126.39, 34.59, 1], [126.53, 34.44, 1]], at=1.0, dur=1)], pins=[dict(place='myeongnyang', at=2.0, name='STRONGEST TIDES IN KOREA', red=True, dx=-160)], tokens=[dict(kind='panok', from_=[126.2, 34.5, 1], n=1, show=True, s=0.2)])),
 's083': one(S('Night on deck: Yi addresses his officers', bg='night', ground='deck', sun=[0.7, 0.3, 90], figs=[F('YI', 0.32, 'explain'), F('SOLDIER', 0.55, 'stand', f=-1, spear=True), F('SOLDIER', 0.68, 'stand', f=-1, spear=True), F('SOLDIER', 0.81, 'stand', f=-1, spear=True)])),
 's084': one(P('portrait', '"Those who seek death shall live."', who='YI', bg='night', ov=dict(labels=[L('"THOSE WHO SEEK DEATH SHALL LIVE.', 0.1, y=0.85, serif=True, size=36)]))),
 's085': one(P('portrait', '"Those who seek life shall die."', who='YI', bg='red', f=-1, x=0.56, sunX=0.42, ov=dict(labels=[L('THOSE WHO SEEK LIFE SHALL DIE."', 0.1, y=0.85, serif=True, size=36)]))),
 's086': one(S('Yi\'s ship ahead; the others hang back', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.48, s=1.1, rim=C_RED), dict(kind='panok', x=0.12, s=0.4, y=0.74), dict(kind='panok', x=0.2, s=0.35, y=0.73), dict(kind='jp', x=0.85, s=0.9, f=-1)], ov=dict(labels=[L('THE OTHERS HUNG BACK', 0.8)]))),
 's087': one(P('sea3d', '3D: the flagship alone against wave after wave', preset='strait', nJ=26, vJ=1.2, ov=dict(labels=[L('ALMOST ALONE', 0.8, red=True)]))),
 's088': one(S('The others rejoin', bg='paper', ground='sea', ships=[dict(kind='panok', x=0.6, s=1.0, rim=C_RED), dict(kind='panok', x=0.1, s=0.7, vx=0.15), dict(kind='panok', x=0.0, s=0.6, vx=0.16, y=0.76)], in_=WHIP, sfx=[dict(at=0.0, name='whoosh', gain=-10)])),
 's089': one(S('The current turns', bg='paper', ground='sea', ships=[dict(kind='jp', x=0.55, s=0.9, f=-1, vx=0.03), dict(kind='jp', x=0.78, s=0.8, f=-1, vx=0.03)], extra='tide', tideDir=1, ov=dict(labels=[L('THE TIDE TURNS', 0.3, red=True)]))),
 's090': one(P('sea3d', '3D: Japanese ships pushed back into each other', preset='strait', nJ=26, vJ=0.6, push=0.8)),
 's091': one(S('Japanese warships burn in the strait', bg='dusk', ground='sea', ships=[dict(kind='jp', x=0.2, s=0.9, fire=True), dict(kind='jp', x=0.48, s=1.1, fire=True), dict(kind='jp', x=0.78, s=0.8, fire=True)], fx=['smoke', 'embers'], ov=dict(labels=[L('~30 WARSHIPS DESTROYED', 0.8, red=True)]))),
 's092': one(P('date', '0 ships lost', str='0 SHIPS LOST', size=150, bg='red', in_=CUT, sfx=[dict(at=0.0, name='impact', gain=-4)])),
 's093': one(P('tally', '13 vs 133 again, all at once', mode='vs', a=13, b=133, bAt=0.2)),
 # --- the cost
 's094': one(S('Night: Yi alone on deck', bg='night', ground='deck', sun=[0.68, 0.3, 90], figs=[F('YI', 0.4, 'sad')], in_=FADE)),
 's095': one(S('Japanese soldiers march at dusk', bg='dusk', props=[dict(k='mountains', x=0.5, far=True)], figs=[F('SAMURAI', 0.3, walk=[0.15, 0.45, 0, 2.4], spear=True), F('SAMURAI', 0.45, walk=[0.3, 0.6, 0, 2.4], spear=True)], in_=FADE)),
 's096': one(S('His son fades into the light', bg='paper', sun=[0.5, 0.45, 260], figs=[F('SON', 0.5, 'stand', fadeOut=1.2, s=1.4)], ov=dict(labels=[L('HIS YOUNGEST SON, YI MYEON', 0.3)]), in_=FADE)),
 's097': one(P('diary', 'Grief in his diary', title='WAR DIARY · 1597', seed=5, in_=FADE)),
 # --- Noryang
 's098': one(P('map', 'Map: the Japanese retreat toward home', focus=[128.3, 35.5, 1], z0=1.3, rate=0.06, arrows=[dict(pts=['seoul', 'busan', 'japan'], at=0.2, dur=2.6, ink=True)], pins=[dict(place='japan', at=0.6, name='1598 · HIDEYOSHI DIES', ink=True, dx=-150, dy=-100)])),
 's099': one(P('portrait', 'Yi, resolved', who='YI', bg='red')),
 's100': one(P('map', 'Map: Joseon and Ming fleets strike at Noryang', focus='noryang', z0=2.2, rate=0.1, tokens=[dict(kind='panok', from_=[127.55, 34.75, 1], to=[127.8, 34.88, 1], n=8, spread=60, at=0, dur=3), dict(kind='jp', from_=[128.05, 34.95, 1], to=[128.25, 34.85, 1], n=8, spread=60, show=True, at=0, dur=3)], pins=[dict(place='noryang', at=2.5, name='NORYANG · DECEMBER 1598', red=True, dx=-60, dy=-170)])),
 's101': one(P('sea3d', '3D: battle through the night, ships burning', preset='night')),
 's102': one(S('Dawn on the flagship deck; the war drum', bg='dawn', ground='deck', sun=[0.75, 0.5, 120], props=[dict(k='drum', x=0.6)], figs=[F('YI', 0.42, 'ready', sword=-0.8)])),
 's103': one(S('Beating the drum — a bullet strikes him', bg='dawn', ground='deck', sun=[0.75, 0.5, 120], props=[dict(k='drum', x=0.6)], figs=[F('YI', 0.46, [[0, 'raise'], [0.6, 'ready'], [1.2, 'raise'], [1.8, 'ready'], [rel('s103', 'bullet') + 0.2, 'fall']], drum=True)], extra='bullet', bulletAt=rel('s103', 'bullet') - 0.3, sfx=[dict(at=rel('s103', 'bullet'), name='hit', gain=-6)])),
 's104': one(S('He falls to his knees', bg='dawn', ground='deck', sun=[0.75, 0.5, 120], props=[dict(k='drum', x=0.6)], figs=[F('YI', 0.46, 'kneel')], ov=dict(labels=[L('HIS LAST WORDS', 0.5)]))),
 's105': one(P('portrait', '"The battle is at its height."', who='YI', bg='dawn', ov=dict(labels=[L('"THE BATTLE IS AT ITS HEIGHT.', 0.1, y=0.85, serif=True, size=38)]))),
 's106': one(P('date', '"Do not announce my death."', str='"DO NOT ANNOUNCE MY DEATH."', size=72, bg='ink')),
 's107': one(S('His nephew takes up the drum', bg='dawn', ground='deck', sun=[0.75, 0.5, 120], props=[dict(k='drum', x=0.6)], figs=[F('YOUNG', 0.46, [[0, 'stand'], [0.8, 'raise'], [1.4, 'ready'], [2.0, 'raise'], [2.6, 'ready'], [3.2, 'raise'], [3.8, 'ready']], drum=True)])),
 's108': one(P('sea3d', '3D: the fleet fights on to victory', preset='fleet', vK=1.2, ov=dict(labels=[L('NORYANG · VICTORY', rel('s108', 'Noryang'), red=True)]))),
 's109': one(P('portrait', 'His last one', who='YI', bg='dawn', sunX=0.62, in_=FADE)),
 # --- verdict
 's110': one(P('date', 'Is the streak real?', str='IS IT REAL?', size=140, bg='paper')),
 's111': one(P('tally', '23... depends how you count', mode='streak', zeroAt=99, ov=dict(labels=[L('DEPENDS HOW YOU COUNT', 1.6)]))),
 's112': one(P('map', 'Map: many small clashes along the coast', focus=[128.0, 34.85, 1], z0=1.8, rate=0.06, pins=[dict(place=[127.2 + i * 0.2, 34.8 + (i % 3) * 0.05, 1], at=0.3 + i * 0.4, name='?' if i % 3 == 0 else None, ink=True) for i in range(9)])),
 's113': one(P('diary', 'The evidence', title='THE EVIDENCE', seal=True, seed=6, ov=dict(big='THE EVIDENCE', bigAt=rel('s113', 'the evidence'), bigY=0.78, bigRed=True, bigSize=64))),
 's114': one(P('diary', 'His war diary, 1592–1598', title='NANJUNG ILGI · 1592-1598', seed=7)),
 's115': one(P('date', 'UNESCO Memory of the World', str='UNESCO', size=150, sub='MEMORY OF THE WORLD', bg='paper')),
 's116': one(P('diary', 'Court records', title='JOSEON COURT RECORDS', seed=8)),
 's117': one(P('portrait', 'Doubts, illness, grief', who='YI', bg='night', ov=dict(labels=[L('DOUBTS', rel('s117', 'doubts'), x=0.22, y=0.3), L('ILLNESSES', rel('s117', 'illnesses'), x=0.2, y=0.5), L('GRIEF', rel('s117', 'grief'), x=0.24, y=0.7, red=True)]))),
 's118': one(P('tally', 'Never lost a battle he commanded', mode='streak', zeroAt=rel('s118', 'never'))),
 's119': one(S('In chains', props=[dict(k='chains', x=0.36, y=0.7)], figs=[F('YI', 0.5, 'kneel')], ov=dict(labels=[L('JAILED · TORTURED', 0.3, red=True)]))),
 's120': one(S('He walks on, through it all', bg='dusk', figs=[F('YI', 0.3, walk=[0.2, 0.62, 0, 4.4])], ov=dict(labels=[L('DEMOTED TWICE', 0.1, x=0.3, y=0.2), L('LOST HIS SON', rel('s120', 'lost'), x=0.55, y=0.28), L('KEPT WINNING', rel('s120', 'kept'), x=0.75, y=0.2, red=True)]))),
 's121': dict(parts=[
    P('tally', '13 vs 133', mode='vs', a=13, b=133, bAt=rel('s121', 'more')),
    P('tally', '23 battles, 0 defeats', at='Twenty-three battles', mode='streak', zeroAt=2.0)]),
 's122': one(S('Dawn: the drum still beating', bg='dawn', ground='deck', sun=[0.75, 0.5, 120], props=[dict(k='drum', x=0.6)], figs=[F('YOUNG', 0.46, [[0, 'raise'], [0.6, 'ready'], [1.2, 'raise'], [1.8, 'ready'], [2.4, 'raise']], drum=True)])),
 's123': one(P('title', 'Final title card', sub='YI SUN-SIN · 1545-1598')),
}


def build():
    src = draft['shots']; out = []; i = 0
    while i < len(src):
        s = src[i]; plan = PLAN.get(s['id'])
        if not plan: raise SystemExit(f'no plan for {s["id"]}')
        start, end, line = s['start'], s['end'], s['line']
        if plan.get('merge'): nxt = src[i + 1]; end = nxt['end']; line += ' ' + nxt['line']; i += 1
        parts = plan['parts']; cuts = [start]
        for prt in parts[1:]: cuts.append(round(wt(prt['at'], cuts[-1] + 0.3) - 0.12, 2))
        cuts.append(end)
        for k, prt in enumerate(parts):
            prm = dict(prt['params']); prm['type'] = prt['type']
            if 'from_' in prm: prm['from'] = prm.pop('from_')
            for tk in prm.get('tokens', []):
                if 'from_' in tk: tk['from'] = tk.pop('from_')
            sh = dict(id='', start=round(cuts[k], 2), end=round(cuts[k + 1], 2), line=line if len(parts) == 1 else '', scene=prt['scene'], set=None, bars='none',
                      **{'in': prt.get('in_', ZOOM)}, sfx=prt.get('sfx', []), params=prm, notes=s['id'])
            if prt.get('amb'): sh['amb'] = prt['amb']
            out.append(sh)
        i += 1
    out[0]['in'] = dict(type='fade', dur=0.6)
    for sh in out:
        if not sh['line']: sh['line'] = ' '.join(w['word'] for w in WORDS if sh['start'] - 0.05 <= w['start'] < sh['end'] - 0.05)
    for n, sh in enumerate(out): sh['id'] = f's{n + 1:03d}'
    music = [dict(start=0, end=39.2, mood='mystery', intensity=0.45), dict(start=39.2, end=101.4, mood='calm', intensity=0.3), dict(start=101.4, end=168.3, mood='tension', intensity=0.5),
             dict(start=168.3, end=227.9, mood='action', intensity=0.8), dict(start=227.9, end=285.9, mood='dark', intensity=0.45), dict(start=285.9, end=311.5, mood='hopeful', intensity=0.4),
             dict(start=311.5, end=365.9, mood='epic', intensity=0.9), dict(start=365.9, end=381.4, mood='sad', intensity=0.4), dict(start=381.4, end=428, mood='action', intensity=0.75),
             dict(start=428, end=draft['duration'], mood='triumph', intensity=0.45)]
    json.dump(dict(title=draft['title'], duration=draft['duration'], shots=out, music=music, sfx=[]), open(os.path.join(HERE, 'shots.json'), 'w'), indent=1)
    d = sorted(s['end'] - s['start'] for s in out); print(f'{len(out)} shots, median {d[len(d) // 2]:.2f}s, min {d[0]:.2f}s, max {d[-1]:.2f}s')


build()
