"""Build story/shots.json for The Lore Behind Edgar Allan Poe. Run from the project folder: python3 story/build_shots.py
Chaos camera in bursts (params chaos=True); steady push elsewhere. Hard cuts/flashes only inside chaos bursts.
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
        if len(seq) == len(parts) and all(norm(s['word']).startswith(p) if k == len(parts) - 1 else norm(s['word']) == p for k, (s, p) in enumerate(zip(seq, parts))): return w['start']
    raise SystemExit(f'word not found: {word} after {after}')
def rel(sid, word): return round(wt(word, SH[sid]['start']) - SH[sid]['start'], 2)
def F(who, x=0.5, p='stand', f=1, s=1.5, **kw): d = dict(who=who, x=x, p=p, f=f, s=s); d.update(kw); return d
def B(k, x=0.5, y=0.5, s=1, **kw): d = dict(k=k, x=x, y=y, s=s); d.update(kw); return d
def Tg(s, at=0.2, **kw): d = dict(str=s, at=at); d.update(kw); return d
def P(type_, scene, **kw):
    meta = {k: kw.pop(k) for k in ['at', 'in_'] if k in kw}
    return dict(type=type_, scene=scene, params=kw, **meta)
def one(p, merge=False): return dict(parts=[p], merge=merge)
ZOOM = dict(type='zoom', dur=0.45); FADE = dict(type='fade', dur=0.7); WHIP = dict(type='whip', dur=0.3); CUT = dict(type='cut'); FLASH = dict(type='flash', dur=0.25)
CH = dict(chaos=True)

PLAN = {
 's001': dict(parts=[P('world', 'Neon Baltimore street at night, Poe slumped; chaos camera', world='street', figs=[F('POE', 0.5, 'kneel', s=1.4)], ov=dict(tags=[Tg('BALTIMORE · OCTOBER 3, 1849', 0.4, y=0.86)]), in_=dict(type='fade', dur=0.5), **CH, seed=1),
    P('stage', 'Tavern used as a polling place; voters stream in', at='It was election day', bg='checker', props=[dict(k='tavern', x=0.62, s=0.9), dict(k='ballot', x=0.3)], figs=[F('MAN', 0.1, walk=[0.05, 0.5, 0, 2]), F('GENT', 0.0, walk=[-0.05, 0.42, 0, 2])], ov=dict(tags=[Tg('ELECTION DAY', 0.2, fill='magenta', color='bone')]), in_=CUT, **CH, seed=2)]),
 's002': one(P('stage', "Poe spins in someone else's clothes amid staring eyes", bg='rings', big=[B('eyes', n=16)], figs=[F('POE', 0.5, 'fall', s=1.6, rot=0.6, spin=True, color='#3a0a5a')], ov=dict(tags=[Tg("SOMEONE ELSE'S CLOTHES", rel('s002', 'wearing'), fill='acid')]), in_=FLASH, **CH, seed=3)),
 's003': one(P('count', 'Missing: 5 days', to=5, suffix=' DAYS', sub='MISSING', in_=CUT, **CH, seed=4)),
 's004': one(P('world', 'A graveyard under a bone-white moon', world='grave', ov=dict(tags=[Tg('OCTOBER 7, 1849', 0.6)]), in_=CUT, **CH, seed=5, L=0.4)),
 's005': one(P('kaleido', 'Kaleidoscope of Poe faces around his bust', in_=FLASH, **CH, seed=6)),
 's006': one(P('doc', 'The first detective story', title='THE MURDERS IN THE RUE MORGUE', titleSize=50, mast="GRAHAM'S MAGAZINE", stamp='THE FIRST', stampAt=0.6, in_=CUT, **CH, seed=7, L=0.35)),
 's007': one(P('world', 'An endless corridor of doors; Poe walks into it', world='corridor', figs=[F('POE', 0.5, walk=[0.42, 0.55, 0, 3], s=1.2)], ov=dict(tags=[Tg('NEVER SOLVED', 1.2, fill='magenta', color='bone')]), in_=CUT, **CH, seed=8)),
 's008': one(P('card', 'Title in ransom letters', bg='spiralAcid', lines=['THE LORE BEHIND', 'EDGAR ALLAN POE'], size=70, in_=FLASH, **CH, seed=9, L=0.35)),
 # --- childhood (steady)
 's009': one(P('stage', 'A stage with curtains; two actors perform', bg='void', props=[dict(k='stage', y=0.82)], figs=[F('MAN', 0.4, [[0, 'explain'], [1.5, 'point']]), F('WOMAN', 0.6, [[0, 'wave'], [1.8, 'explain']], f=-1)], ov=dict(tags=[Tg('BOSTON · 1809', 0.4)]), in_=FADE)),
 's010': one(P('stage', 'The father walks out', bg='void', props=[dict(k='stage', y=0.82)], figs=[F('WOMAN', 0.4, 'holdFront'), F('MAN', 0.55, walk=[0.55, 1.1, 0.2, 2.2])])),
 's011': one(P('stage', 'A dim rented room; the mother fades', bg='void', c1='#2a0a3a', ground=True, props=[dict(k='window', x=0.25), dict(k='bed', x=0.62)], figs=[F('WOMAN', 0.62, 'sad', fadeOut=2.6), F('BABY', 0.42, 'stand', s=1.3)], ov=dict(tags=[Tg('RICHMOND · 1811', 0.4)]))),
 's012': one(P('stage', 'John and Frances Allan take him in; coins rain', bg='checker', props=[dict(k='coins', x=0.5, y=0.9)], figs=[F('GENT', 0.38, 'crossArms'), F('WOMAN', 0.55, 'holdFront', f=-1), F('BABY', 0.47, 'stand', s=1.3)], ov=dict(tags=[Tg('JOHN & FRANCES ALLAN', 0.8)]))),
 's013': one(P('doc', 'Adoption papers, never signed', title='ADOPTION PAPERS', stamp='NEVER SIGNED', stampAt=0.6, w=900, h=600)),
 's014': dict(parts=[
    P('stage', 'A home, an education, a new name', bg='spiral', figs=[F('GENT', 0.35, 'stand'), F('WOMAN', 0.5, 'holdFront', f=-1), F('BABY', 0.62, 'stand', s=1.4)], ov=dict(tags=[Tg('A HOME', rel('s014', 'home'), x=0.25, y=0.2), Tg('AN EDUCATION', rel('s014', 'education'), x=0.5, y=0.3, fill='magenta', color='bone'), Tg('A NEW NAME', rel('s014', 'new'), x=0.75, y=0.2, fill='bone')])),
    P('spell', 'A-L-L-A-N spelled out', at='Allan.', word='ALLAN', times=[0.6, 1.0, 1.4, 1.8, 2.2])]),
 's015': one(P('spell', 'ALLEN crossed out', word='ALLAN', times=[0, 0, 0, 0, 0], wrong='ALLEN', wrongAt=0.0, in_=CUT)),
 's016': one(P('stage', 'Poe and John Allan, back to back', bg='void', figs=[F('GENT', 0.4, 'crossArms', f=-1), F('POE', 0.6, 'crossArms')])),
 's017': one(P('stage', 'They hated each other', bg='blood', figs=[F('GENT', 0.38, 'point'), F('POE', 0.62, 'crossArms', f=-1)])),
 's018': one(P('stage', 'John Allan wanted a businessman', bg='checker', props=[dict(k='coins', x=0.4, y=0.9)], figs=[F('GENT', 0.4, 'explain')], ov=dict(tags=[Tg('A BUSINESSMAN', 0.4)]))),
 's019': one(P('stage', 'Edgar wanted to be a poet', bg='spiral', figs=[F('POE', 0.5, 'holdFront', prop='quill', s=1.7)], ov=dict(tags=[Tg('A POET', 0.3, fill='magenta', color='bone')]))),
 's020': one(P('stage', 'University of Virginia: Poe at a desk, barely any money', bg='void', ground=True, props=[dict(k='desk', x=0.5)], figs=[F('POE', 0.4, 'sit')], ov=dict(tags=[Tg('UNIVERSITY OF VIRGINIA · 1826', 0.4)]))),
 's021': one(P('stage', 'Gambling frenzy: cards whirl', bg='rings', props=[dict(k='cards', x=0.5, y=0.45, s=1.6)], figs=[F('POE', 0.5, [[0, 'reach'], [1.6, 'facepalm']], s=1.7)], in_=CUT, **CH, seed=21, L=0.3)),
 's022': one(P('count', 'Gambling debt counter', to=2000, prefix='$', sub='IN DEBT (APPROX.)', dur=2)),
 's023': one(P('stage', 'Poe, furious, close-up', bg='blood', big=[B('bust', 0.5, 0.55, 1.15)])),
 's024': one(P('stage', 'Soldiers marching; Poe enlists under a fake name', bg='checker', figs=[F('SOLDIER', x, walk=[x - 0.2, x + 0.1, 0, 4]) for x in (0.2, 0.35, 0.5, 0.65)], ov=dict(tags=[Tg('"EDGAR A. PERRY"', rel('s024', 'Edgar'), fill='magenta', color='bone')]))),
 's025': one(P('doc', 'His first book', title='TAMERLANE', titleSize=80, w=640, h=820, rot=0.03)),
 's026': one(P('doc', 'Not Edgar Allan Poe', title='TAMERLANE', titleSize=80, w=640, h=820, rot=0.03, body='EDGAR ALLAN POE', bodyAt=0.0, strike=True, strikeAt=1.0, strikeY=-150)),
 's027': one(P('doc', '"by a Bostonian"', title='TAMERLANE', titleSize=80, w=640, h=820, rot=0.03, body='BY A BOSTONIAN.', bodyAt=0.3)),
 's028': dict(parts=[
    P('stage', 'Almost nobody bought it', bg='void', big=[B('raven', 0.5, 0.45, 0.8, perched=True)], ov=dict(tags=[Tg('ALMOST NOBODY BOUGHT IT', 0.2)])),
    P('stage', 'West Point cadets in shakos', at='He made', bg='checker', figs=[F('SOLDIER', x, 'stand') for x in (0.2, 0.32, 0.44, 0.56, 0.68, 0.8)], ov=dict(tags=[Tg('WEST POINT · 1830', 0.3)]))]),
 's029': one(P('stage', 'John Allan turns away for good', bg='void', figs=[F('POE', 0.38, 'reach'), F('GENT', 0.55, walk=[0.55, 1.05, 0.4, 3])], ov=dict(tags=[Tg('CUT OFF', rel('s029', 'cut'), fill='magenta', color='bone')]))),
 's030': one(P('list', 'Stopped showing up: class, drills', bg='checker', items=[dict(str='NO CLASS', at=rel('s030', 'class')), dict(str='NO DRILLS', at=rel('s030', 'drills'))])),
 's031': one(P('list', '...church. EXPELLED.', bg='checker', items=[dict(str='NO CLASS', at=0), dict(str='NO DRILLS', at=0), dict(str='NO CHURCH', at=rel('s031', 'church')), dict(str='EXPELLED', at=rel('s031', 'expel'), size=90, fill='magenta', y=0.72)])),
 's032': one(P('stage', 'Alone: no money, no family, no name', bg='void', figs=[F('POE', 0.5, walk=[0.3, 0.65, 0, 4], s=1.2)], ov=dict(tags=[Tg('NO MONEY', rel('s032', 'money'), x=0.25, y=0.2), Tg('NO FAMILY', rel('s032', 'family'), x=0.5, y=0.3, fill='magenta', color='bone'), Tg('NO NAME', rel('s032', 'name'), x=0.75, y=0.2, fill='bone')]))),
 's033': one(P('stage', 'All he had was his writing', bg='spiral', ground=True, props=[dict(k='desk', x=0.55)], figs=[F('POE', 0.45, 'sit', prop='quill')])),
 # --- Baltimore & Virginia
 's034': one(P('world', 'Baltimore street; aunt Maria and young Virginia', world='street', figs=[F('WOMAN', 0.4, 'holdFront'), F('VIRGINIA', 0.5, 'stand', s=1.15), F('POE', 0.62, 'stand', f=-1)], ov=dict(tags=[Tg('MARIA CLEMM & VIRGINIA', 0.6)]), in_=FADE)),
 's035': one(P('stage', 'Poe marries Virginia, 1836', bg='rings', c1=K_violet if False else None, figs=[F('POE', 0.42, 'stand'), F('VIRGINIA', 0.56, 'stand', f=-1, s=1.15)], ov=dict(tags=[Tg('1836', 0.3)]))),
 's036': one(P('stage', 'He was 27', bg='rings', figs=[F('POE', 0.42, 'stand'), F('VIRGINIA', 0.56, 'stand', f=-1, s=1.15)], ov=dict(tags=[Tg('HE: 27', 0.1, x=0.3, y=0.25, size=60)]))),
 's037': one(P('stage', 'She was 13', bg='rings', figs=[F('POE', 0.42, 'stand'), F('VIRGINIA', 0.56, 'stand', f=-1, s=1.15)], ov=dict(tags=[Tg('HE: 27', 0, x=0.3, y=0.25, size=60), Tg('SHE: 13', 0.1, x=0.7, y=0.25, size=60, fill='magenta', color='bone')]))),
 's038': one(P('doc', 'The marriage bond: age listed as 21', title='MARRIAGE BOND · 1836', body='AGE: TWENTY-ONE', bodyAt=0.4, stamp='FALSE', stampAt=rel('s038', 'twenty-one'))),
 's039': one(P('stage', 'Desperately poor: a bare room', bg='void', c1='#2a0a3a', ground=True, props=[dict(k='window', x=0.3)], figs=[F('WOMAN', 0.5, 'sad'), F('VIRGINIA', 0.6, 'sad', s=1.15), F('POE', 0.72, 'sad', f=-1)])),
 's040': one(P('stage', 'Editor and vicious critic; enemies gather', bg='void', ground=True, props=[dict(k='desk', x=0.35)], figs=[F('POE', 0.27, 'sit', prop='quill'), F('GENT', 0.65, 'point', f=-1, fadeIn=1.5), F('GENT', 0.78, 'crossArms', f=-1, fadeIn=2.6)], ov=dict(tags=[Tg('VICIOUS CRITIC', rel('s040', 'vicious'), fill='magenta', color='bone')]))),
 's041': one(P('kaleido', 'Stories nobody had written: eyes kaleidoscope', subject='eye', spin=0.5)),
 's042': one(P('doc', 'The Murders in the Rue Morgue, 1841', mast="GRAHAM'S MAGAZINE · 1841", title='THE MURDERS IN THE RUE MORGUE', titleSize=50)),
 's043': one(P('stage', 'Dupin, the brilliant amateur, thinking', bg='checker', big=[B('eye', 0.72, 0.35, 1.6)], figs=[F('GENT', 0.35, 'think', s=1.7)], ov=dict(tags=[Tg('C. AUGUSTE DUPIN', 0.5)]))),
 's044': one(P('card', 'The first modern detective story', bg='spiral', lines=['THE FIRST MODERN', 'DETECTIVE STORY'], size=64)),
 's045': one(P('stage', 'Sherlock Holmes owed everything to Dupin', bg='checker', figs=[F('GENT', 0.35, 'think'), F('MAN', 0.65, 'point', f=-1)], ov=dict(tags=[Tg('DUPIN', 0.2, x=0.35, y=0.25), Tg('→ SHERLOCK HOLMES', rel('s045', 'Sherlock'), x=0.65, y=0.25, fill='magenta', color='bone')]))),
 's046': one(P('stage', 'Premature burial; walled up alive', bg='rings', big=[B('eyes', n=10, seed=7)], figs=[F('POE', 0.5, 'handsOnHead', s=1.6, color='#3a0a5a')], ov=dict(tags=[Tg('PREMATURE BURIAL', 0.2, x=0.3, y=0.2), Tg('WALLED UP ALIVE', rel('s046', 'walled'), x=0.7, y=0.3, fill='magenta', color='bone')]), in_=CUT, **CH, seed=46, L=0.35)),
 's047': one(P('stage', 'The tell-tale heart beating under the floorboards', bg='checker', big=[B('heart', 0.5, 0.55, 1.1)], ov=dict(tags=[Tg('THE TELL-TALE HEART', 1.0, fill='bone')]), in_=FLASH, **CH, seed=47, L=0.35)),
 's048': one(P('world', 'Where did the darkness come from? corridor', world='corridor', big=[B('bust', 0.5, 0.55, 0.6, fadeIn=0.5)], in_=CUT)),
 's049': one(P('stage', 'Home: Virginia sings for friends', bg='void', ground=True, props=[dict(k='window', x=0.25)], figs=[F('VIRGINIA', 0.5, 'explain', s=1.2), F('WOMAN', 0.68, 'stand', f=-1), F('POE', 0.82, 'stand', f=-1)], in_=FADE)),
 's050': one(P('stage', 'She coughs up blood', bg='void', ground=True, props=[dict(k='window', x=0.25)], figs=[F('VIRGINIA', 0.5, [[0, 'explain'], [rel('s050', 'cough'), 'sad']], s=1.2), F('POE', 0.75, [[0, 'stand'], [rel('s050', 'cough') + 0.3, 'reach']], f=-1)], ov=dict(tags=[Tg('1842', 0.2)], flash=False))),
 's051': one(P('card', 'Tuberculosis', bg='blood', lines=['TUBERCULOSIS'], bigLine=0, size=110, y=0.42)),
 's052': one(P('stage', "The same disease that killed Poe's mother", bg='void', figs=[F('WOMAN', 0.4, 'sad', fadeIn=0.3, color='#4a1a6a'), F('VIRGINIA', 0.6, 'sad', s=1.2, f=-1)])),
 's053': one(P('list', 'Better, worse, better', bg='rings', items=[dict(str='BETTER', at=rel('s053', 'better')), dict(str='WORSE', at=rel('s053', 'worse'), fill='magenta'), dict(str='BETTER AGAIN', at=rel('s053', 'then better'))])),
 's054': one(P('stage', 'Poe watches', bg='void', big=[B('bust', 0.5, 0.55, 1.0)])),
 # --- The Raven
 's055': one(P('card', 'January 1845', bg='spiralAcid', lines=['JANUARY 1845'], bigLine=0, size=100, y=0.42, in_=FLASH, **CH, seed=55, L=0.35)),
 's056': one(P('world', 'The pendulum hall; a raven sweeps through', world='pendulum', big=[B('raven', 0.3, 0.42, 1.4, vx=0.25)], in_=CUT, **CH, seed=56)),
 's057': one(P('kaleido', 'Raven kaleidoscope: famous overnight', subject='raven', center=B('raven', 0.5, 0.5, 1.2), invert=True, in_=CUT, **CH, seed=57)),
 's058': one(P('doc', 'Reprinted everywhere', mast='EVENING MIRROR · 1845', title='THE RAVEN', titleSize=90, in_=CUT, **CH, seed=58, L=0.4)),
 's059': one(P('stage', 'Recited in theaters', bg='void', props=[dict(k='stage', y=0.82)], big=[B('raven', 0.72, 0.4, 0.8, perched=True)], figs=[F('MAN', 0.42, [[0, 'explain'], [1.2, 'pointUp']])], in_=CUT)),
 's060': one(P('world', 'Strangers call him "The Raven" in the street', world='street', figs=[F('POE', 0.42, walk=[0.3, 0.5, 0, 2]), F('MAN', 0.7, 'point', f=-1)], ov=dict(tags=[Tg('"THE RAVEN!"', rel('s060', 'The Raven'), fill='magenta', color='bone')]), in_=CUT)),
 's061': dict(parts=[
    P('count', 'Paid about $9', to=9, prefix='$', sub='REPORTEDLY', dur=0.8),
    P('stage', "Fame didn't make him rich", at='Fame', bg='void', figs=[F('POE', 0.5, 'shrug', s=1.7)])]),
 's062': one(P('stage', "It couldn't save Virginia", bg='void', c1='#2a0a3a', ground=True, props=[dict(k='bed', x=0.55)], figs=[F('POE', 0.32, 'kneel')], in_=FADE)),
 's063': one(P('stage', 'Freezing cottage, January 1847: she dies', bg='void', c1='#1a0a2a', ground=True, props=[dict(k='window', x=0.25), dict(k='bed', x=0.6)], figs=[F('POE', 0.38, 'kneel')], ov=dict(tags=[Tg('FORDHAM, NEW YORK · JANUARY 1847', 0.5)]), in_=FADE)),
 's064': one(P('card', 'Virginia Poe, 1822-1847', bg='void', lines=['VIRGINIA POE', '1822 - 1847'], size=64, in_=FADE)),
 's065': one(P('stage', 'His old army coat as her blanket', bg='void', c1='#1a0a2a', ground=True, props=[dict(k='bed', x=0.5)], ov=dict(tags=[Tg('HIS OLD ARMY COAT', 1.5)]), in_=FADE)),
 # --- falling apart
 's066': one(P('stage', 'He fell apart: drinking, traveling', bg='rings', figs=[F('POE', 0.5, [[0, 'sad'], [1.4, 'fall']], prop='bottle', s=1.6, rot=0.3)], ov=dict(tags=[Tg('HE DRANK', rel('s066', 'drank'), x=0.3, y=0.22), Tg('HE TRAVELED', rel('s066', 'traveled'), x=0.7, y=0.22, fill='magenta', color='bone')]), in_=CUT, **CH, seed=66, L=0.35)),
 's067': one(P('stage', 'Proposals', bg='void', figs=[F('POE', 0.4, 'kneel'), F('WOMAN', 0.6, 'stand', f=-1, fadeIn=0.3), F('WOMAN', 0.75, 'crossArms', f=-1, fadeIn=1.0)])),
 's068': one(P('world', 'Back to Richmond, 1849', world='street', figs=[F('POE', 0.45, walk=[0.3, 0.5, 0, 2.6])], ov=dict(tags=[Tg('RICHMOND · 1849', 0.4)]))),
 's069': one(P('stage', 'Elmira Shelton: engaged', bg='bone', big=[B('heart', 0.5, 0.35, 0.35)], figs=[F('POE', 0.4, 'stand'), F('WOMAN', 0.6, 'stand', f=-1)], ov=dict(tags=[Tg('ELMIRA SHELTON', rel('s069', 'Elmira'), fill='magenta', color='bone')]))),
 's070': one(P('stage', 'A happy ending?', bg='bone', figs=[F('POE', 0.42, 'relaxed'), F('WOMAN', 0.58, 'relaxed', f=-1)], ov=dict(tags=[Tg('A HAPPY ENDING?', 1.6, fill='bone')]))),
 's071': one(P('world', 'He leaves Richmond by boat', world='sea', ov=dict(tags=[Tg('SEPTEMBER 27, 1849', 0.4)]), in_=FADE)),
 's072': dict(parts=[
    P('stage', 'Heading north, planning to return', bg='void', props=[dict(k='boat', x=0.5, y=0.8)], ov=dict(tags=[Tg('TO MARRY HER', rel('s072', 'marry'), fill='magenta', color='bone')])),
    P('card', 'He never arrived', at='He never', bg='blood', lines=['HE NEVER ARRIVED'], bigLine=0, size=90, y=0.42, in_=CUT, **CH, seed=72)]),
 # --- the five days and the end
 's073': one(P('world', 'Five lost days: the corridor of doors', world='corridor', figs=[F('POE', 0.5, 'fall', s=1.3, rot=1.0, spin=True)], ov=dict(tags=[Tg('5 DAYS · WHERE WAS HE?', 0.5, fill='magenta', color='bone')]), in_=CUT, **CH, seed=73)),
 's074': one(P('card', 'October 3', bg='spiralAcid', lines=['OCTOBER 3RD'], bigLine=0, size=100, y=0.42, in_=FLASH, **CH, seed=74, L=0.35)),
 's075': one(P('stage', 'Joseph Walker finds Poe outside the polling-place tavern', bg='checker', props=[dict(k='tavern', x=0.68, s=0.9), dict(k='ballot', x=0.35)], figs=[F('POE', 0.5, 'kneel'), F('MAN', 0.32, 'reach')], ov=dict(tags=[Tg('JOSEPH WALKER, PRINTER', rel('s075', 'Joseph'))]), in_=CUT, **CH, seed=75, L=0.4)),
 's076': one(P('doc', "Walker's note: in great distress", title='BALTIMORE CITY, OCT. 3RD', titleSize=44, body='"...in great distress... in need of immediate assistance."', bodyAt=0.6, in_=CUT)),
 's077': one(P('stage', 'Taken to a hospital', bg='void', c1='#1a0a2a', ground=True, props=[dict(k='bed', x=0.5)], figs=[F('POE', 0.5, 'stand', rot=-1.57, y=0.66, s=1.2)], in_=FADE)),
 's078': one(P('world', 'Delirium: a vortex of staring eyes', world='eyes', big=[B('bust', 0.5, 0.55, 0.65, closed=True)], in_=CUT, **CH, seed=78)),
 's079': one(P('stage', '"Reynolds!" he cries, over and over', bg='spiralAcid', big=[B('bust', 0.5, 0.58, 0.95)], ov=dict(ransom=['REYNOLDS!'], at=rel('s079', 'Reynolds'), y=0.18, size=90, bigLine=0), in_=FLASH, **CH, seed=79, L=0.3)),
 's080': one(P('card', 'Who was Reynolds?', bg='rings', lines=['WHO WAS', 'REYNOLDS?'], size=80, in_=CUT, **CH, seed=80)),
 's081': one(P('world', 'The graveyard: October 7, 1849', world='grave', ov=dict(tags=[Tg('OCTOBER 7, 1849 · AGE 40', 0.6)]), in_=FADE)),
 's082': dict(parts=[
    P('doc', 'Death certificate: missing', title='DEATH CERTIFICATE', stamp='MISSING', stampAt=0.8),
    P('card', 'So what killed him?', at='So what', bg='spiral', lines=['SO WHAT', 'KILLED HIM?'], size=80)]),
 's083': one(P('card', 'Cooping', bg='checker', lines=['COOPING'], bigLine=0, size=130, y=0.42)),
 's084': one(P('stage', 'Election-day gangs grab strangers and get them drunk', bg='checker', props=[dict(k='tavern', x=0.75, s=0.8)], figs=[F('MAN', 0.3, 'reach'), F('POE', 0.45, 'fall', prop='bottle'), F('MAN', 0.6, 'reach', f=-1)], in_=CUT, **CH, seed=84, L=0.35)),
 's085': one(P('stage', 'Dragged from polling place to polling place', bg='rings', props=[dict(k='ballot', x=0.2), dict(k='ballot', x=0.5), dict(k='ballot', x=0.8)], figs=[F('MAN', 0.1, walk=[0.0, 0.9, 0, 5.5]), F('POE', 0.0, walk=[-0.08, 0.82, 0, 5.5])], ov=dict(tags=[Tg('VOTE', rel('s085', 'vote'), x=0.2, y=0.2), Tg('AGAIN', rel('s085', 'again'), x=0.5, y=0.3, fill='magenta', color='bone'), Tg('AND AGAIN', rel('s085', 'and again'), x=0.8, y=0.2, fill='bone')]), in_=CUT, **CH, seed=85, L=0.35)),
 's086': dict(parts=[
    P('list', 'Polling place, election day, not his clothes', bg='checker', items=[dict(str='POLLING PLACE', at=rel('s086', 'polling')), dict(str='ELECTION DAY', at=rel('s086', 'election')), dict(str='NOT HIS CLOTHES', at=rel('s086', 'clothes'), fill='magenta')]),
    P('list', 'Other theories: alcohol', at='But there', bg='rings', items=[dict(str='ALCOHOL', at='@Alcohol', x=0.3, y=0.25)], in_=CUT)]),
 's087': one(P('list', 'A beating, a tumor, carbon monoxide, flu', bg='rings', items=[dict(str='ALCOHOL', at=0, x=0.3, y=0.25), dict(str='A BEATING', at=rel('s087', 'beating'), x=0.7, y=0.25), dict(str='BRAIN TUMOR', at=rel('s087', 'brain'), x=0.3, y=0.45), dict(str='CARBON MONOXIDE', at=rel('s087', 'Carbon'), x=0.7, y=0.45), dict(str='FLU', at=rel('s087', 'Flu'), x=0.5, y=0.62)], in_=CUT, **CH, seed=87, L=0.4)),
 's088': dict(parts=[
    P('list', 'Rabies (1996)', bg='rings', items=[dict(str='ALCOHOL', at=0, x=0.3, y=0.25), dict(str='A BEATING', at=0, x=0.7, y=0.25), dict(str='BRAIN TUMOR', at=0, x=0.3, y=0.45), dict(str='CARBON MONOXIDE', at=0, x=0.7, y=0.45), dict(str='FLU', at=0, x=0.5, y=0.62), dict(str='RABIES? (1996)', at=rel('s088', 'rabies'), x=0.5, y=0.8, fill='magenta', size=70)]),
    P('card', 'None can be proven', at='None', bg='blood', lines=['NONE OF THEM', 'CAN BE PROVEN'], size=70, in_=CUT)]),
 # --- Griswold
 's089': one(P('world', 'It gets darker', world='corridor', in_=FADE)),
 's090': one(P('stage', 'His reputation, murdered', bg='blood', big=[B('bust', 0.5, 0.55, 1.0)], ov=dict(tags=[Tg('HIS REPUTATION', rel('s090', 'reputation'), fill='bone')]))),
 's091': one(P('stage', 'Rufus Griswold writes the obituary', bg='void', ground=True, props=[dict(k='desk', x=0.55)], figs=[F('GENT', 0.45, 'sit', prop='quill')], ov=dict(tags=[Tg('RUFUS GRISWOLD', rel('s091', 'Rufus'), fill='magenta', color='bone')]))),
 's092': one(P('doc', '"Edgar Allan Poe is dead."', mast='NEW-YORK TRIBUNE · OCT. 9, 1849', title='DEATH OF EDGAR A. POE', titleSize=48, body='"Edgar Allan Poe is dead.', bodyAt=0.0, bodySize=48)),
 's093': one(P('doc', '"...few will be grieved by it."', mast='NEW-YORK TRIBUNE · OCT. 9, 1849', title='DEATH OF EDGAR A. POE', titleSize=48, body='"Edgar Allan Poe is dead. This announcement will startle many, but few will be grieved by it."', bodyAt=0.0, bodySize=48, in_=CUT)),
 's094': one(P('stage', 'Griswold, literary executor, holding the papers', bg='checker', figs=[F('GENT', 0.45, 'holdFront', prop='paper', s=1.7)], ov=dict(tags=[Tg('LITERARY EXECUTOR', 0.8)]))),
 's095': one(P('list', 'A drunk, a madman', bg='rings', items=[dict(str='A DRUNK', at=rel('s095', 'drunk')), dict(str='A MADMAN', at=rel('s095', 'madman'), fill='magenta')])),
 's096': dict(parts=[
    P('doc', 'Forged letters', title='LETTERS OF E. A. POE', stamp='FORGED', stampAt=1.4),
    P('card', 'It backfired', at='It backfired', bg='spiralAcid', lines=['IT BACKFIRED'], bigLine=0, size=100, y=0.42, in_=FLASH, **CH, seed=96)]),
 's097': one(P('kaleido', 'The tortured genius, the madman in the dark', invert=True, ov=dict(tags=[Tg('THE TORTURED GENIUS', rel('s097', 'The tortured'), y=0.12, fill='bone'), Tg('THE MADMAN IN THE DARK', rel('s097', 'The madman'), y=0.88, fill='magenta', color='bone')]), in_=CUT, **CH, seed=97)),
 's098': one(P('stage', "Readers couldn't get enough", bg='spiral', figs=[F('MAN', x, 'holdFront', prop='paper', s=1.1) for x in (0.15, 0.3, 0.45, 0.6, 0.75, 0.9)], in_=CUT)),
 # --- the Poe Toaster
 's099': one(P('world', 'The legend at his grave', world='grave', in_=FADE)),
 's100': one(P('count', '60 years', to=60, suffix=' YEARS', sub='1949 - 2009', bg='void', dur=1.5)),
 's101': one(P('world', 'A figure in black slips into the cemetery', world='grave', figs=[F('GENT', 0.3, walk=[0.2, 0.55, 0, 3.8], s=1.3)])),
 's102': one(P('stage', 'Three roses and cognac on the grave', bg='void', ground=True, props=[dict(k='grave', x=0.5, s=1.4), dict(k='roses', x=0.62, s=1.2)], ov=dict(tags=[Tg('THREE ROSES · COGNAC', 0.8)]))),
 's103': one(P('stage', 'Watchers in the dark', bg='void', ground=True, big=[B('eyes', n=12, seed=9)], props=[dict(k='grave', x=0.5, s=1.2)])),
 's104': one(P('card', 'The Poe Toaster, never unmasked', bg='rings', lines=['THE POE TOASTER'], bigLine=0, size=90, y=0.4, sub='NEVER UNMASKED')),
 # --- ending
 's105': one(P('kaleido', "Here's the lore of Edgar Allan Poe", spin=0.4, in_=FADE)),
 's106': one(P('stage', 'An orphan, rejected', bg='void', figs=[F('BABY', 0.42, 'stand', s=1.5), F('GENT', 0.62, 'crossArms', f=-1)])),
 's107': one(P('stage', 'A poem sold for almost nothing', bg='void', big=[B('raven', 0.5, 0.45, 1.0, perched=True)], ov=dict(tags=[Tg('$9', 0.4, size=70)]))),
 's108': one(P('stage', 'Everyone he loved, lost', bg='void', figs=[F('WOMAN', 0.3, 'stand', fadeOut=0.8, color='#4a1a6a'), F('VIRGINIA', 0.45, 'stand', s=1.2, fadeOut=1.6, color='#4a1a6a'), F('POE', 0.65, 'sad', f=-1)])),
 's109': one(P('stage', 'He invented the detective story', bg='checker', big=[B('eye', 0.5, 0.4, 2.0)])),
 's110': one(P('world', 'Falling into the spiral staircase; QUOTH THE RAVEN', world='stairs', figs=[F('POE', 0.5, 'fall', s=1.0, rot=1, spin=True, y=0.6)], ov=dict(ransom=['QUOTH THE RAVEN'], at=rel('s110', 'Quoth'), y=0.18, size=70, bigLine=0), in_=CUT, **CH, seed=110)),
 's111': one(P('card', 'NEVERMORE', bg='spiralAcid', lines=['NEVERMORE'], bigLine=0, size=120, y=0.4, big=[B('raven', 0.5, 0.75, 0.8)], in_=FLASH, **CH, seed=111, L=0.35)),
}

def build():
    src = draft['shots']; out = []; i = 0
    while i < len(src):
        s = src[i]; plan = PLAN.get(s['id'])
        if not plan: raise SystemExit(f'no plan for {s["id"]}')
        start, end, line = s['start'], s['end'], s['line']
        if plan.get('merge'): nxt = src[i + 1]; end = nxt['end']; line += ' ' + nxt['line']; i += 1
        parts = plan['parts']; cuts = [start]
        for prt in parts[1:]: cuts.append(round(wt(prt['at'], cuts[-1] + 0.2) - 0.1, 2))
        cuts.append(end)
        for k, prt in enumerate(parts):
            prm = {kk: v for kk, v in prt['params'].items() if v is not None}; prm['type'] = prt['type']
            def res(o):
                if isinstance(o, dict):
                    for kk, v in o.items():
                        if kk == 'at' and isinstance(v, str) and v.startswith('@'): o[kk] = round(wt(v[1:], cuts[k]) - cuts[k], 2)
                        else: res(v)
                elif isinstance(o, list):
                    for v in o: res(v)
            res(prm)
            # shift word-relative times for split parts
            out.append(dict(id='', start=round(cuts[k], 2), end=round(cuts[k + 1], 2), line=line if len(parts) == 1 else '', scene=prt['scene'], set=None, bars='none', **{'in': prt.get('in_', ZOOM)}, sfx=[], params=prm, notes=s['id']))
        i += 1
    for sh in out:
        if not sh['line']: sh['line'] = ' '.join(w['word'] for w in WORDS if sh['start'] - 0.05 <= w['start'] < sh['end'] - 0.05)
    for n, sh in enumerate(out): sh['id'] = f's{n + 1:03d}'
    music = [dict(start=0, end=28.7, mood='mystery', intensity=0.9), dict(start=28.7, end=118, mood='calm', intensity=0.35), dict(start=118, end=176.8, mood='mystery', intensity=0.45),
             dict(start=176.8, end=192.2, mood='sad', intensity=0.4), dict(start=192.2, end=215.3, mood='epic', intensity=0.8), dict(start=215.3, end=249.4, mood='sad', intensity=0.45),
             dict(start=249.4, end=302.3, mood='dark', intensity=0.85), dict(start=302.3, end=335.1, mood='tension', intensity=0.7), dict(start=335.1, end=376.7, mood='dark', intensity=0.6),
             dict(start=376.7, end=399, mood='mystery', intensity=0.5), dict(start=399, end=draft['duration'], mood='dark', intensity=0.8)]
    json.dump(dict(title=draft['title'], duration=draft['duration'], shots=out, music=music, sfx=[]), open(os.path.join(HERE, 'shots.json'), 'w'), indent=1)
    d = sorted(s['end'] - s['start'] for s in out); print(f'{len(out)} shots, median {d[len(d) // 2]:.2f}s, min {d[0]:.2f}s, max {d[-1]:.2f}s')

build()
