// poe.js — shot templates for The Lore Behind Edgar Allan Poe (params.type). Chaos camera only where params.chaos is set.
import { E, registerShot, ease, clamp, lerp, rng, text, FONTS, key } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { W, H, K, hash, twos, camFor, withCam, misreg, finish, BGS, person, poeBust, raven, heart, eye, PROPS, ransom, tag, scrap, halftone, POSE } from '../_kit.js';

const T = {}, T3 = {};
const poseOf = (n) => (typeof n === 'object' && !Array.isArray(n) ? n : POSE[n] || POSES[n] || POSES.stand);
const mixP = (a, b, k) => { const o = {}; for (const n in a) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
const stepPose = (p, t) => { if (!Array.isArray(p)) return poseOf(p); let cur = p[0][1], prv = p[0][1], t0 = 0; for (const [k, v] of p) if (t >= k) { prv = cur; cur = v; t0 = k; } return mixP(poseOf(prv), poseOf(cur), ease.inOut(clamp((t - t0) / 0.2))); };

// ---------- shared: figures, big items, props, overlays ----------
function layer2D(g, t, info, p) {
  const GY = H() * (p.gy ?? 0.82);
  if (p.ground) { g.fillStyle = p.ground === true ? K.ink : p.ground; g.fillRect(-W(), GY, W() * 3, H() * 2); }
  for (const pr of p.props || []) PROPS[pr.k](g, W() * (pr.x ?? 0.5), pr.y != null ? H() * pr.y : GY, pr.s ?? 1, pr.col ?? K.ink, t);
  for (const b of p.big || []) {
    const x = W() * (b.x ?? 0.5) + (b.vx || 0) * t * W(), y = H() * (b.y ?? 0.5), s = (b.s ?? 1) * (1 + (b.grow || 0) * t);
    const fade = b.fadeOut != null ? 1 - clamp((t - b.fadeOut) / 0.8) : b.fadeIn != null ? clamp((t - b.fadeIn) / 0.4) : 1; g.save(); g.globalAlpha *= fade;
    if (b.k === 'bust') misreg(g, t, (col) => poeBust(g, x, y, s, col, { flat: col !== (b.color || K.ink), closed: b.closed, eyes: b.eyes }), { main: b.color || K.ink });
    if (b.k === 'raven') misreg(g, t, (col) => raven(g, x, y, s, t, col, { perched: b.perched, facing: b.f }), { main: K.ink });
    if (b.k === 'heart') misreg(g, t, (col) => heart(g, x, y, s, t, col === K.ink ? K.blood : col), { main: K.blood });
    if (b.k === 'eye') eye(g, x, y, 60 * s, t);
    if (b.k === 'eyes') { const r = rng(b.seed || 3); for (let i = 0; i < (b.n || 14); i++) eye(g, W() * r(), H() * (0.12 + r() * 0.76), 20 + r() * 40, t + i); }
    g.restore();
  }
  for (const [i, f] of (p.figs || []).entries()) {
    let x = W() * (f.x ?? 0.5); if (f.walk) { const k = clamp((t - (f.walk[2] || 0)) / ((f.walk[3] || info.dur) - (f.walk[2] || 0))); x = W() * lerp(f.walk[0], f.walk[1], k); }
    const walking = f.walk && t > (f.walk[2] || 0) && t < (f.walk[3] || info.dur), ph = (twos(t) * 2.5) % 1, pose = walking ? (ph < 0.5 ? POSE.walkA : POSE.walkB) : stepPose(f.p || 'stand', t);
    const a = f.fadeIn != null ? clamp((t - f.fadeIn) / 0.4) : f.fadeOut != null ? 1 - clamp((t - f.fadeOut) / 0.8) : 1;
    g.save(); g.globalAlpha *= a; const y = H() * (f.y ?? (p.gy ?? 0.82));
    if (f.rot) { g.translate(x, y - 100); g.rotate(f.rot * (f.spin ? t * 3 : 1)); g.translate(-x, -(y - 100)); }
    person(g, f.who || 'MAN', x, y, f.s ?? 1.5, pose, { facing: f.f ?? 1, prop: f.prop, color: f.color, t, flat: f.flat });
    g.restore();
  }
}
function overlays(g, t, info, p) {
  const o = p.ov || {};
  if (o.ransom && t >= (o.at || 0)) ransom(g, t, o.ransom, H() * (o.y ?? 0.16), o.size || 64, o.at || 0, { big: o.bigLine ?? 1, seed: o.seed || 9 });
  for (const l of o.tags || []) if (t >= (l.at || 0)) tag(g, W() * (l.x ?? 0.5), H() * (l.y ?? 0.86), l.str, t, { size: l.size, fill: l.fill ? K[l.fill] : K.acid, color: l.color ? K[l.color] : K.ink, serif: l.serif, tape: l.tape ?? true, rot: l.rot });
  if (o.flash && Math.floor(t * 12) % 9 === 8) { g.fillStyle = 'rgba(244,255,232,.7)'; g.fillRect(0, 0, W(), H()); }
}

// ---------- 2D templates ----------
T.stage = (g, t, info, p) => { (BGS[p.bg || 'void'])(g, t, p); const c = camFor(p, t); withCam(g, c, () => layer2D(g, t, info, p)); };
T.card = (g, t, info, p) => { (BGS[p.bg || 'spiral'])(g, t, p); const c = camFor(p, t); withCam(g, c, () => { if (p.lines) ransom(g, t, p.lines, H() * (p.y ?? 0.35), p.size || 80, 0.05, { big: p.bigLine ?? 1, seed: p.seed || 3 }); if (p.big) layer2D(g, t, info, { big: p.big }); }); if (p.sub && t > 0.4) tag(g, W() / 2, H() * 0.8, p.sub, t, { size: 38, fill: K[p.subFill || 'acid'] }); };
T.doc = (g, t, info, p) => {                       // newspaper / letter / book / bond / obituary, text typed on
  (BGS[p.bg || 'void'])(g, t, p); const c = camFor(p, t);
  withCam(g, c, () => { const k = ease.out(clamp(twos(t) / 0.4)), y = lerp(H() * 1.3, H() * 0.5, k);
    scrap(g, W() / 2, y, p.w || 1100, p.h || 660, p.rot ?? -0.04, p.paper || K.bone, 501 + (p.seed || 0), { amp: 10, draw: (g, w, h) => {
      if (p.mast) { text(g, p.mast, 0, -h / 2 + 70, { size: 54, color: K.ink, font: FONTS.serif, italic: true, weight: 900 }); g.fillStyle = K.ink; g.fillRect(-w / 2 + 40, -h / 2 + 110, w - 80, 4); }
      if (p.title) text(g, p.title, 0, p.mast ? -h / 2 + 180 : -h / 2 + 90, { size: p.titleSize || 64, color: K.ink, font: FONTS.ui, weight: 900, spacing: 2 });
      const words = (p.body || '').split(' '), n = Math.floor(clamp((t - (p.bodyAt ?? 0.4)) / Math.max(0.3, (info.dur - 0.8 - (p.bodyAt ?? 0.4)))) * words.length + 0.999);
      g.save(); g.font = `italic 900 ${p.bodySize || 42}px "${FONTS.serif}"`; let line = '', yy = p.mast ? -h / 2 + 260 : -h / 2 + 180, lines = []; for (const wd of words.slice(0, n)) { const tst = line ? line + ' ' + wd : wd; if (g.measureText(tst).width > w - 160 && line) { lines.push(line); line = wd; } else line = tst; } lines.push(line); g.restore();
      for (const ln of lines) { text(g, ln, -w / 2 + 80, yy, { size: p.bodySize || 42, color: '#2a1030', font: FONTS.serif, italic: true, weight: 900, align: 'left' }); yy += (p.bodySize || 42) * 1.35; }
      if (!p.body) { g.fillStyle = 'rgba(7,4,12,.25)'; for (let i = 0; i < 8; i++) g.fillRect(-w / 2 + 80, -h / 2 + 260 + i * 40, w - 200 - (i * 53) % 160, 12); }
      if (p.stamp && t > p.stampAt) { const s = 1.5 - 0.5 * ease.out(clamp((t - p.stampAt) / 0.25)); g.save(); g.translate(w * 0.22, h * 0.2); g.rotate(-0.2); g.scale(s, s); g.strokeStyle = K.blood; g.lineWidth = 10; g.strokeRect(-200, -60, 400, 120); text(g, p.stamp, 0, 4, { size: 64, color: K.blood, font: FONTS.ui, weight: 900, spacing: 4 }); g.restore(); }
      if (p.strike && t > p.strikeAt) { g.strokeStyle = K.blood; g.lineWidth = 10; const kk = clamp((t - p.strikeAt) / 0.3); g.beginPath(); g.moveTo(-w * 0.35, p.strikeY || -h / 2 + 90); g.lineTo(-w * 0.35 + w * 0.7 * kk, (p.strikeY || -h / 2 + 90) + 6); g.stroke(); }
    } }); });
  if (p.big) withCam(g, c, () => layer2D(g, t, info, { big: p.big }));
};
T.kaleido = (g, t, info, p) => {
  const k = Math.floor(t * 8), inv = p.invert && k % 4 === 3; (inv ? BGS.spiralAcid : BGS[p.bg || 'spiral'])(g, t, p); const c = camFor(p, t);
  withCam(g, c, () => { g.save(); g.translate(W() / 2, H() / 2); const n = p.n || 8; for (let i = 0; i < n; i++) { g.save(); g.rotate(i * Math.PI * 2 / n + twos(t) * (p.spin ?? 0.8)); g.translate(0, -(p.r || 330)); if (i % 2) g.scale(-1, 1); const col = [K.acid, K.magenta, K.bone, K.teal][i % 4];
      if ((p.subject || 'poe') === 'poe') poeBust(g, 0, 0, 0.42, col, { flat: true }); else if (p.subject === 'raven') raven(g, 0, 0, 0.5, t + i * 0.1, col, {}); else if (p.subject === 'heart') heart(g, 0, 0, 0.45, t, col); else eye(g, 0, 0, 40, t + i); g.restore(); } g.restore();
    if (p.center !== false) layer2D(g, t, info, { big: [p.center || { k: 'bust', x: 0.5, y: 0.52, s: 0.7 }] }); });
};
T.spell = (g, t, info, p) => {                     // A-L-L-A-N spelled out, ALLEN crossed out
  BGS.bone(g, t, p); const c = camFor(p, t), letters = p.word.split(''), size = 220, tot = letters.length * size * 0.75;
  withCam(g, c, () => { letters.forEach((ch, i) => { const at = (p.times || [])[i] ?? i * 0.3; if (t < at) return; const pop = ease.out(clamp((t - at) / 0.15)); scrap(g, W() / 2 - tot / 2 + i * size * 0.75 + size * 0.37, H() * 0.42, size * 0.68 * pop, size * pop, (hash(i) - 0.5) * 0.25, [K.acid, K.magenta, K.violet, K.ink, K.teal][i % 5], 600 + i, { amp: 4, draw: (g) => text(g, ch, 0, 8, { size: size * 0.8 * pop, color: i % 5 === 0 ? K.ink : K.bone, font: FONTS.title, weight: 900 }) }); });
    if (p.wrong && t > p.wrongAt) { tag(g, W() / 2, H() * 0.78, p.wrong, t, { size: 70, fill: K.bone, color: K.ink, tape: false }); const kk = clamp((t - p.wrongAt - 0.15) / 0.25); g.strokeStyle = K.blood; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(W() / 2 - 200, H() * 0.78 + 10); g.lineTo(W() / 2 - 200 + 400 * kk, H() * 0.78 - 10); g.stroke(); } });
};
T.list = (g, t, info, p) => {                       // theories / words stamped in on cue
  (BGS[p.bg || 'rings'])(g, t, p); const c = camFor(p, t);
  withCam(g, c, () => { (p.items || []).forEach((it, i) => { if (t < it.at) return; const pop = 1.6 - 0.6 * ease.out(clamp((t - it.at) / 0.18)); g.save(); g.translate(W() * (it.x ?? 0.5), H() * (it.y ?? (0.2 + i * 0.13))); g.rotate((hash(i + 3) - 0.5) * 0.3); g.scale(pop, pop); tag(g, 0, 0, it.str, t, { size: it.size || 56, fill: K[it.fill || ['acid', 'magenta', 'bone', 'teal'][i % 4]], color: K.ink, tape: false }); g.restore(); });
    if (p.big) layer2D(g, t, info, { big: p.big }); });
};
T.count = (g, t, info, p) => {
  (BGS[p.bg || 'blood'])(g, t, p); const c = camFor(p, t), k = clamp((t - 0.1) / (p.dur || 1.2)), v = Math.round(lerp(p.from ?? 0, p.to, ease.out(k)));
  withCam(g, c, () => { const s = (p.prefix || '') + v + (p.suffix || ''); scrap(g, W() / 2, H() * 0.45, s.length * 150 * 0.62 + 140, 230, -0.04, K.ink, 701, { amp: 8, draw: (g) => text(g, s, 0, 8, { size: 160, color: K.acid, font: FONTS.title, weight: 900 }) }); if (p.sub && t > 0.4) tag(g, W() / 2, H() * 0.72, p.sub, t, { size: 40, fill: K.bone }); if (p.big) layer2D(g, t, info, { big: p.big }); });
};

// ---------- 3D worlds (2D characters on top) ----------
function kit(T) { const { THREE } = T; const flat = (c, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), ...o }); const m = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); return o; }; return { THREE, flat, m }; }
const checker = (T, a, b, n = 16) => T.canvasTex(512, 512, (g, w, h) => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * w / n, j * h / n, w / n, h / n); } });
const WORLDS = {
  corridor(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.violet2], fog: [6, 60], fogColor: K.deep, fov: 70, ambient: 1.2, bloom: 0.6 });
    const tex = checker(T, K.ink, K.violet); tex.wrapS = tex.wrapT = k.THREE.RepeatWrapping; tex.repeat.set(2, 100); const floor = k.m(new k.THREE.PlaneGeometry(8, 400), k.flat('#fff', { map: tex })); floor.rotation.x = -Math.PI / 2; floor.position.z = -180; st.add(floor);
    const cols = [K.acid, K.magenta, K.teal, K.violet]; for (let i = 0; i < 60; i++) { const z = 10 - i * 5; for (const [x, y, w, h] of [[-3.6, 2.5, 0.4, 5], [3.6, 2.5, 0.4, 5], [0, 5, 7.6, 0.4]]) st.add(k.m(new k.THREE.BoxGeometry(w, h, 0.4), k.flat(cols[i % 4]), x, y, z)); const d = k.m(new k.THREE.PlaneGeometry(1.2, 2.6), k.flat(i % 3 ? K.ink : K.bone), (i % 2 ? -1 : 1) * 3.38, 1.3, z - 2.5); d.rotation.y = (i % 2 ? 1 : -1) * Math.PI / 2; st.add(d); }
    return { stage: st, cam: (c, t) => [[Math.sin(t * 2) * 0.6, 2.2, 14 - c.pos * 6], [Math.sin(t * 2) * 0.6, 2.2, 4 - c.pos * 6]] }; },
  pendulum(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.violet2, K.ink], fog: [8, 60], fogColor: '#1a0630', fov: 60, ambient: 1.0, bloom: 0.6 });
    const floor = k.m(new k.THREE.PlaneGeometry(60, 60), k.flat('#fff', { map: checker(T, K.acid, K.ink, 24) })); floor.rotation.x = -Math.PI / 2; st.add(floor);
    const piv = new k.THREE.Group(); piv.position.set(0, 16, 0); st.add(piv); piv.add(k.m(new k.THREE.CylinderGeometry(0.08, 0.08, 14, 8), k.flat(K.bone), 0, -7, 0));
    const sh = new k.THREE.Shape(); sh.absarc(0, 0, 3, Math.PI * 1.15, Math.PI * 1.85, false); sh.absarc(0, 1.2, 2.4, Math.PI * 1.8, Math.PI * 1.2, true); piv.add(k.m(new k.THREE.ExtrudeGeometry(sh, { depth: 0.15, bevelEnabled: false }), k.flat(K.magenta), 0, -13, 0));
    return { stage: st, update: (t) => { piv.rotation.z = Math.sin(t * 2.6) * 0.9; }, cam: (c, t) => { const a = c.pos * 0.5; return [[Math.sin(a) * 15, 7, Math.cos(a) * 15], [0, 6, 0]]; } }; },
  eyes(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.deep], fog: [4, 70], fogColor: K.ink, fov: 75, ambient: 1.4, bloom: 0.35 });
    const tex = T.canvasTex(256, 256, (g, w, h) => { g.fillStyle = K.bone; g.fillRect(0, 0, w, h); g.fillStyle = K.acid; g.beginPath(); g.arc(w / 2, h / 2, 70, 0, 7); g.fill(); g.fillStyle = K.ink; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.fill(); });
    const eyes = []; for (let i = 0; i < 140; i++) { const a = i * 0.6, r = 4 + (i % 5) * 0.6, e = k.m(new k.THREE.SphereGeometry(0.7 + (i % 3) * 0.3, 20, 14), k.flat('#fff', { map: tex }), Math.cos(a) * r, Math.sin(a) * r, 10 - i * 1.2); st.add(e); eyes.push(e); }
    return { stage: st, update: (t, cam) => { for (const e of eyes) { e.lookAt(cam.position); e.rotateY(-Math.PI / 2); } }, cam: (c) => [[0, 0, 14 - c.pos * 8], [0, 0, 4 - c.pos * 8]] }; },
  stairs(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.violet2, K.ink], fog: [4, 50], fogColor: '#0a0318', fov: 70, ambient: 1.2, bloom: 0.4 });
    const cols = [K.acid, K.magenta, K.teal, K.violet, K.bone], grp = new k.THREE.Group(); for (let i = 0; i < 160; i++) { const a = i * 0.32, s = k.m(new k.THREE.BoxGeometry(3.2, 0.25, 1.1), k.flat(cols[i % 5]), Math.cos(a) * 3.2, -i * 0.45, Math.sin(a) * 3.2); s.rotation.y = -a; grp.add(s); } grp.add(k.m(new k.THREE.CylinderGeometry(0.6, 0.6, 80, 12), k.flat(K.ink), 0, -36, 0)); st.add(grp);
    return { stage: st, update: (t, cam, c) => { grp.rotation.y = t * 1.2 + c.pos * 0.4; }, cam: (c) => [[0.1, 6 - c.pos * 2.5, 0.1], [0, -60, 0]] }; },
  street(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.violet2, K.violet], fog: [10, 90], fogColor: K.deep, fov: 55, ambient: 1.2, bloom: 0.5 });
    const road = k.m(new k.THREE.PlaneGeometry(14, 300), k.flat('#fff', { map: checker(T, '#1a0a30', '#2a1050', 10) })); road.material.map.wrapS = road.material.map.wrapT = k.THREE.RepeatWrapping; road.material.map.repeat.set(2, 40); road.rotation.x = -Math.PI / 2; road.position.z = -120; st.add(road);
    const cols = [K.violet2, '#3a0a5a', '#1a0630']; for (let i = 0; i < 30; i++) for (const sd of [-1, 1]) { const h = 6 + ((i * 7 + (sd + 1) * 3) % 9), b = k.m(new k.THREE.BoxGeometry(6, h, 6), k.flat(cols[i % 3]), sd * 10, h / 2, 10 - i * 7); st.add(b); for (let wy = 1; wy < h - 1; wy += 2) for (const wz of [-1.5, 1.5]) if (hash(i * 13 + wy + wz + sd) > 0.45) st.add(k.m(new k.THREE.PlaneGeometry(1, 1.2), k.flat(hash(i + wy) > 0.5 ? K.amber : K.acid), sd * 6.98, wy, 10 - i * 7 + wz)).rotation.y = -sd * Math.PI / 2; }
    for (let i = 0; i < 20; i++) for (const sd of [-1, 1]) { st.add(k.m(new k.THREE.CylinderGeometry(0.08, 0.08, 4, 6), k.flat(K.ink), sd * 6, 2, 8 - i * 12)); st.add(k.m(new k.THREE.SphereGeometry(0.35, 12, 8), k.flat(K.amber), sd * 6, 4.1, 8 - i * 12)); }
    return { stage: st, cam: (c, t) => [[Math.sin(t) * 1.5, 2 + Math.sin(t * 0.7), 18 - c.pos * 6], [0, 2.5, -10 - c.pos * 6]] }; },
  grave(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.violet2, K.violet, K.magenta], fog: [8, 70], fogColor: K.violet, fov: 55, ambient: 1.1, bloom: 0.5 });
    const ground = k.m(new k.THREE.PlaneGeometry(200, 200), k.flat('#2a0a4a')); ground.rotation.x = -Math.PI / 2; st.add(ground);
    const moon = k.m(new k.THREE.CircleGeometry(10, 48), k.flat(K.bone, { fog: false }), 20, 26, -90); st.scene.add(moon);
    for (let i = 0; i < 90; i++) { const x = (hash(i) - 0.5) * 60, z = -hash(i + 9) * 70 + 10, h = 1.2 + hash(i + 3) * 1.5; const s = k.m(new k.THREE.BoxGeometry(0.9, h, 0.25), k.flat(i % 7 === 0 ? K.violet : K.ink), x, h / 2, z); s.rotation.y = (hash(i + 5) - 0.5) * 0.5; s.rotation.z = (hash(i + 2) - 0.5) * 0.15; st.add(s); if (i % 4 === 0) st.add(k.m(new k.THREE.BoxGeometry(0.9, 0.2, 0.2), k.flat(K.ink), x, h * 0.7, z)); }
    for (let i = 0; i < 12; i++) st.add(k.m(new k.THREE.ConeGeometry(1.4, 7, 6), k.flat(K.ink), (hash(i + 40) - 0.5) * 80, 3.5, -40 - hash(i + 50) * 30));
    return { stage: st, cam: (c, t) => [[Math.sin(c.pos * 0.3) * 12, 3, 16 - c.pos * 2], [0, 1.5, -10]] }; },
  sea(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.violet2, K.magenta], fog: [10, 120], fogColor: K.violet2, fov: 50, ambient: 1.2, bloom: 0.5 });
    const geo = new k.THREE.PlaneGeometry(300, 300, 80, 80); geo.rotateX(-Math.PI / 2); const sea = k.m(geo, k.flat(K.violet)); st.add(sea);
    const lines = new k.THREE.Group(); for (let i = 0; i < 300; i++) { const w = k.m(new k.THREE.PlaneGeometry(2.5, 0.12), k.flat(i % 3 ? K.teal : K.acid), (hash(i) - 0.5) * 120, 0.1, (hash(i + 7) - 0.5) * 120); w.rotation.x = -Math.PI / 2; lines.add(w); } st.add(lines);
    const sun = k.m(new k.THREE.CircleGeometry(14, 64), k.flat(K.blood, { fog: false }), 0, 10, -120); st.scene.add(sun);
    return { stage: st, update: (t) => { const pos = geo.attributes.position, tq = twos(t); for (let i = 0; i < pos.count; i++) pos.setY(i, Math.round(Math.sin(pos.getX(i) * 0.2 + tq * 2) + Math.cos(pos.getZ(i) * 0.25 + tq * 1.5)) * 0.4); pos.needsUpdate = true; lines.position.z = (t * 6) % 10; }, cam: (c, t) => [[0, 3.5 + Math.sin(t * 2) * 0.6, 14], [0, 3, -30]] }; },
};
for (const shot of E.shots) {
  const p = shot.params || {};
  if (p.type === 'world') registerShot(shot.id, { kind: '3d',
    init(T3k) { return WORLDS[p.world](T3k); },
    draw(s, t) { const c = camFor(p, t), cam = s.stage.camera, [pos, look] = s.cam(c, t); cam.position.set(...pos); cam.lookAt(...look); cam.rotateZ(c.roll); cam.fov = (p.fov || 60) / c.zoom; cam.updateProjectionMatrix(); s.update?.(t, cam, c); },
    overlay(g, t, info) { const c = camFor(p, t); withCam(g, { ...c, zoom: 1 + (c.zoom - 1) * 0.5 }, () => layer2D(g, t, info, p)); overlays(g, t, info, p); finish(g, t); } });
  else if (T[p.type]) registerShot(shot.id, { draw(g, t, info) { T[p.type](g, t, info, p); overlays(g, t, info, p); finish(g, t); } });
}
