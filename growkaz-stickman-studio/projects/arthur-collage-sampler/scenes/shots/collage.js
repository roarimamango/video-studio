// The Real Lore Behind King Arthur — art-direction sampler: toon 3D + hard shadows + silhouettes + moving paper collage.
import { E, registerShot, ease, prog, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { character, P, sword, wedges } from '/projects/king-arthur-anime/scenes/shots/anime.js';

const W = () => E.W, H = () => E.H;
const PAPER = '#efe6d2', PAPER2 = '#e2d5b8', INK = '#0c0a0a', RED = '#c8202a', GOLD = '#e0b040';
const step3 = (t) => Math.floor(t * 8) / 8;                         // stop-motion: hold each pose 3 frames
const hash = (n) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
const jit = (t, seed, a = 3) => (hash(Math.floor(t * 8) * 13 + seed) - 0.5) * 2 * a;   // collage jitter on 3s

// ---------- paper / print textures (built once, procedurally) ----------
let GRAIN = null;
function grain() {
  if (GRAIN) return GRAIN; const c = document.createElement('canvas'); c.width = 960; c.height = 540; const x = c.getContext('2d'), id = x.createImageData(960, 540); let s = 7;
  for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = 200 + ((s >>> 24) % 56); id.data[i] = v; id.data[i + 1] = v - 6; id.data[i + 2] = v - 18; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0); x.strokeStyle = 'rgba(120,100,70,.12)'; x.lineWidth = 1; const r = rng(3); for (let i = 0; i < 500; i++) { const px = r() * 960, py = r() * 540; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 30, py + (r() - 0.5) * 6); x.stroke(); }
  return (GRAIN = c);
}
const paperOver = (g, a = 0.35) => { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a; g.drawImage(grain(), 0, 0, W(), H()); g.restore(); };
function halftone(g, x, y, w, h, color, angle = 0.4, size = 9, fade = 1) {   // dot screen, densest at bottom
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = color;
  for (let yy = y; yy < y + h + size; yy += size) for (let xx = x - ((yy / size) % 2) * size / 2; xx < x + w + size; xx += size) { const k = clamp((yy - y) / h) * fade; if (k <= 0.03) continue; g.beginPath(); g.arc(xx, yy, size * 0.5 * k, 0, 7); g.fill(); }
  g.restore();
}
function torn(seed, x0, y0, x1, y1, amp = 14, step = 22) {          // jagged edge points between two points
  const r = rng(seed), n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)), out = [];
  for (let i = 0; i <= n; i++) { const u = i / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, d = (r() - 0.5) * 2 * amp * (i % 3 === 0 ? 1.6 : 1); out.push([lerp(x0, x1, u) + nx / L * d, lerp(y0, y1, u) + ny / L * d]); }
  return out;
}
function scrap(g, x, y, w, h, rot, fill, seed, o = {}) {           // a torn paper piece with drop shadow (and optional tape)
  g.save(); g.translate(x, y); g.rotate(rot);
  const pts = [...torn(seed, -w / 2, -h / 2, w / 2, -h / 2, o.amp ?? 6, 18), ...torn(seed + 1, w / 2, -h / 2, w / 2, h / 2, o.amp ?? 6, 18), ...torn(seed + 2, w / 2, h / 2, -w / 2, h / 2, o.amp ?? 6, 18), ...torn(seed + 3, -w / 2, h / 2, -w / 2, -h / 2, o.amp ?? 6, 18)];
  const path = () => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };
  g.save(); g.translate(10, 14); path(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(); g.restore();
  path(); g.fillStyle = fill; g.fill(); g.save(); path(); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5; g.drawImage(grain(), -w / 2, -h / 2, w, h); g.restore();
  o.draw?.(g);
  if (o.tape) { g.save(); g.translate(-w * 0.32, -h / 2); g.rotate(-0.5); g.fillStyle = 'rgba(240,226,180,.75)'; g.fillRect(-50, -16, 100, 32); g.restore(); }
  g.restore();
}
function tornFrame(g, t, color = PAPER) {                           // ragged paper border top + bottom
  const top = [[-20, -20], [W() + 20, -20], ...torn(41 + (Math.floor(t * 8) % 2), W() + 20, 60, -20, 50, 12, 26)];
  const bot = [[-20, H() + 20], [W() + 20, H() + 20], ...torn(43 + (Math.floor(t * 8) % 2), W() + 20, H() - 56, -20, H() - 62, 12, 26)];
  for (const pts of [top, bot]) { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = color; g.fill(); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6; g.drawImage(grain(), 0, 0, W(), 70); g.drawImage(grain(), 0, H() - 70, W(), 70); g.restore();
}
function label(g, x, y, str, rot, seed, t, o = {}) {               // typed label on a paper strip
  const w = str.length * (o.size || 30) * 0.62 + 60, h = (o.size || 30) * 1.9;
  scrap(g, x + jit(t, seed, 2), y + jit(t, seed + 5, 2), w, h, rot, o.fill || PAPER, seed, { amp: 4, tape: o.tape, draw: (g) => text(g, str, 0, 2, { size: o.size || 30, color: o.color || INK, font: FONTS.ui, weight: 900, spacing: 4 }) });
}

// ---------- toon 3D helpers ----------
function toonKit(T) {
  const { THREE } = T, grad = new THREE.DataTexture(new Uint8Array([40, 150, 255]), 3, 1, THREE.RedFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toon = (c) => new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: grad });
  const flat = (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c) });
  const inked = (mesh, k = 1.035) => { const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })); o.position.copy(mesh.position); o.rotation.copy(mesh.rotation); o.scale.copy(mesh.scale).multiplyScalar(k); return o; };
  return { THREE, toon, flat, inked };
}
function sunDisc(T, x, y, z, r, color = RED) { const m = new T.THREE.Mesh(new T.THREE.CircleGeometry(r, 64), new T.THREE.MeshBasicMaterial({ color, fog: false })); m.position.set(x, y, z); return m; }
function overlay3D(g, t, o = {}) {                                 // print finish on top of 3D: grain, halftone shadows, torn frame
  paperOver(g, 0.42);
  if (o.halftone !== false) { g.save(); g.globalAlpha = 0.35; halftone(g, 0, H() * 0.62, W(), H() * 0.38, INK, 0, 10, 0.9); g.restore(); }
  tornFrame(g, t);
}

// ================= shots =================
registerShot('c01', { kind: '3d',                                   // Camelot in silhouette
  init(T) {
    const K = toonKit(T), st = T.stage({ mood: 'void', sky: [PAPER, PAPER2, '#d4c29e'], fog: [70, 320], fogColor: PAPER2, fov: 34, keyPos: [-6, 6, -40], keyColor: '#fff2dc', keyIntensity: 2.4, ambient: 0.6, bloom: 0 });
    st.scene.add(sunDisc(T, 4, 30, -120, 15));
    const ground = new K.THREE.Mesh(new K.THREE.PlaneGeometry(400, 400), K.toon(PAPER2)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; st.add(ground);
    const hill = new K.THREE.Mesh(new K.THREE.SphereGeometry(30, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), K.flat(INK)); hill.scale.y = 0.35; hill.position.set(0, -1, -60); st.add(hill);
    const C = (geo, x, y, z) => { const m = new K.THREE.Mesh(geo, K.flat(INK)); m.position.set(x, y, z); m.castShadow = true; st.add(m); return m; };
    C(new K.THREE.BoxGeometry(22, 8, 6), 0, 13, -60);
    for (const [x, h] of [[-12, 20], [-4, 26], [5, 30], [13, 18]]) { C(new K.THREE.CylinderGeometry(1.8, 2.2, h, 12), x, 9 + h / 2, -60); C(new K.THREE.ConeGeometry(2.6, 6, 12), x, 9 + h + 3, -60); const flag = new K.THREE.Mesh(new K.THREE.PlaneGeometry(3, 1.6), K.flat(RED)); flag.position.set(x + 1.6, 9 + h + 6.4, -60); st.add(flag); }
    for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, z = 20 - i * 3.2, x = side * (7 + (i % 5) * 1.6); const tr = new K.THREE.Mesh(new K.THREE.ConeGeometry(1.4 + (i % 3) * 0.5, 7 + (i % 4) * 2, 6), K.flat(INK)); tr.position.set(x, 3.5 + (i % 4), z); tr.castShadow = true; st.add(tr); }
    for (let i = 0; i < 18; i++) { const r = new K.THREE.Mesh(new K.THREE.BoxGeometry(0.6, 0.6, 2.4), K.toon(INK)); r.position.set(-1.5 + (i % 2) * 3, 0.3, 24 - i * 3); r.castShadow = true; st.add(r); }   // path stones
    return { stage: st };
  },
  draw(s, t, info, T) { const k = ease.inOut(t / info.dur); T.dolly(s.stage.camera, t, [[0, { pos: [0, 3, 34], look: [0, 10, -60] }], [info.dur, { pos: [1.5, 5, 10], look: [0, 14, -60] }]]); },
  overlay(g, t, info) { overlay3D(g, t); label(g, 300, H() - 150, 'BRITAIN · c. 500 AD ?', -0.04, 11, t, { tape: true, size: 34 }); },
});
registerShot('c02', { draw(g, t) {                                  // the manuscript collage
  g.fillStyle = INK; g.fillRect(0, 0, W(), H()); paperOver(g, 0.12);
  scrap(g, W() * 0.5 + jit(t, 2, 3), H() * 0.52, W() * 1.3, H() * 0.9, 0.03, '#3a1418', 101, { amp: 10 });   // red backing sheet
  halftone(g, 0, H() * 0.15, W(), H() * 0.85, '#1a0a0c', 0.3, 12, 0.8);
  const k = ease.out(clamp(step3(t) / 0.6)), px = lerp(W() * 1.3, W() * 0.46, k);
  const words = ['Tunc', 'Arthur', 'pugnabat', 'contra', 'illos', 'in', 'illis', 'diebus', 'cum', 'regibus', 'Brittonum,', 'sed', 'ipse', 'dux', 'erat', 'bellorum.'];
  let arthurPos = null;
  scrap(g, px, H() * 0.5, 1060, 640, -0.06, '#e8dcbc', 203, { amp: 12, draw: (g) => {
    g.fillStyle = 'rgba(120,80,40,.18)'; g.beginPath(); g.ellipse(-300, 180, 200, 120, 0.3, 0, 7); g.fill();          // stain
    text(g, 'Historia Brittonum', -470, -250, { size: 34, color: '#7a2a1a', font: FONTS.serif, italic: true, weight: 900, align: 'left' });
    rng(5); let x = -470, y = -150; g.save(); g.font = `italic 900 46px "${FONTS.serif}"`;
    for (const w of words) { const ww = g.measureText(w + ' ').width; if (x + ww > 470) { x = -470; y += 78; } text(g, w, x, y, { size: 46, color: '#2a1810', font: FONTS.serif, italic: true, weight: 900, align: 'left' }); if (w === 'Arthur') arthurPos = [x + g.measureText(w).width / 2, y]; x += ww; }
    g.restore();
    for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(42,24,16,.25)'; g.fillRect(-470, 120 + i * 40, 900 - (i * 130) % 300, 10); }
    if (arthurPos) { const c = clamp((t - 0.9) / 0.6), n = Math.floor(c * 24); g.strokeStyle = RED; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= n; i++) { const a = -0.5 + (i / 24) * Math.PI * 2.15, rr = 1 + (hash(i) - 0.5) * 0.08; const xx = arthurPos[0] + Math.cos(a) * 112 * rr, yy = arthurPos[1] - 4 + Math.sin(a) * 46 * rr; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  } });
  if (t > 1.2) label(g, W() * 0.66, H() * 0.85, 'HISTORIA BRITTONUM · c. 830 AD', 0.04, 31, t, { size: 30, tape: true });
  if (t > 1.6) label(g, W() * 0.27, H() * 0.17, 'THE FIRST TIME ARTHUR APPEARS', -0.05, 37, t, { size: 30, fill: RED, color: PAPER });
  // cut-out silhouette knight sliding in at the edge
  if (t > 0.3) { const kx = lerp(-200, W() * 0.08, ease.out(clamp(step3(t - 0.3) / 0.5))); g.save(); g.translate(kx + 14, 18); character(g, kx, H() * 1.02, 2.4, P.ready, { sil: 'rgba(0,0,0,.4)', knight: true, t: 0 }); g.restore(); const q = character(g, kx, H() * 1.02, 2.4, P.ready, { sil: '#1a1416', knight: true, t: 0, silOut: RED }); sword(g, q.hF[0], q.hF[1], -0.4, 260, 1.6, { sil: '#1a1416', silOut: RED }); }
  tornFrame(g, t, INK);
} });
registerShot('c03', { kind: '3d',                                   // the duel: silhouettes, long hard shadows
  init(T) {
    const K = toonKit(T), st = T.stage({ mood: 'void', sky: [PAPER, PAPER2], fog: [18, 70], fogColor: PAPER, fov: 30, keyPos: [-30, 7, -6], keyColor: '#fff4e0', keyIntensity: 3.2, ambient: 0.9, shadowSize: 12, bloom: 0 });
    st.scene.add(sunDisc(T, -26, 7, -50, 7));
    const ground = new K.THREE.Mesh(new K.THREE.PlaneGeometry(200, 200), K.toon(PAPER)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; st.add(ground);
    const mk = (pose, x, rotY, crown) => { const f = T.figure3D({ top: 'none' }, { rim: RED, pose, s: 1.15 }); f.position.set(x, 0, 0); f.rotation.y = rotY; f.traverse((m) => { if (m.isMesh) m.castShadow = true; }); st.add(f);
      const blade = new K.THREE.Mesh(new K.THREE.BoxGeometry(0.05, 1.1, 0.03), K.flat(crown ? '#ffffff' : INK)); blade.castShadow = true; st.add(blade); return { f, blade }; };
    const a = mk(P.ready, -0.75, 0, true), b = mk(P.ready, 0.75, Math.PI, false);
    for (let i = 0; i < 9; i++) { const sp = new K.THREE.Mesh(new K.THREE.CylinderGeometry(0.04, 0.05, 2.4 + (i % 3) * 0.6, 6), K.flat(INK)); sp.position.set(-6 + i * 1.6, 1.2, -5 - (i % 2)); sp.rotation.z = (i % 3 - 1) * 0.15; sp.castShadow = true; st.add(sp); }   // planted spears
    return { stage: st, a, b };
  },
  draw(s, t, info, T) {
    const tq = step3(t), clash = 1.25;
    const poseA = tq < 0.5 ? P.ready : tq < clash ? P.windup : P.lunge, poseB = tq < 0.6 ? P.ready : tq < clash ? P.charge : P.thrown;
    s.a.f.setPose(poseA); s.b.f.setPose(poseB);
    const U = 0.0072 * 1.15, hand = (f, p, dir) => [f.position.x + dir * p.hF[0] * U, -p.hF[1] * U];
    const placeBlade = (o, p, dir, ang) => { const [hx, hy] = hand(o.f, p, dir); o.blade.position.set(hx + Math.cos(ang) * 0.55 * dir, hy + Math.sin(ang) * 0.55, 0.1); o.blade.rotation.z = ang - Math.PI / 2 * dir; };
    placeBlade(s.a, poseA, 1, tq < 0.5 ? 0.6 : tq < clash ? 2.3 : 0.1); placeBlade(s.b, poseB, -1, tq < clash ? 2.4 : 1.2);
    if (tq >= clash) s.b.f.position.x = 0.75 + Math.min(1.6, (tq - clash) * 3);
    T.orbit(s.stage.camera, t, { target: [0, 0.9, 0], radius: [6.5, 5.2], height: [0.9, 1.3], from: 0.55, to: 0.15, dur: info.dur });
  },
  overlay(g, t, info) {
    overlay3D(g, t, { halftone: false });
    const k = Math.floor(t * 24) - Math.floor(1.25 * 24);
    if (k >= 0 && k < 4) {                                            // impact frame: red field, black wedges, cut-out silhouettes
      g.fillStyle = k % 2 ? PAPER : RED; g.fillRect(0, 0, W(), H()); wedges(g, W() * 0.5, H() * 0.45, INK, 70 + k, { clusters: 6, inner: 200 });
      const a = character(g, W() * 0.36, H() * 0.9, 2.4, P.lunge, { sil: INK, crown: true, t: 0 }); sword(g, a.hF[0], a.hF[1], -0.25, 320, 1.6, { sil: INK });
      const b = character(g, W() * 0.66, H() * 0.9, 2.4, P.charge, { sil: INK, knight: true, facing: -1, t: 0 }); sword(g, b.hF[0], b.hF[1], -Math.PI * 0.8, 300, 1.6, { sil: INK });
      paperOver(g, 0.35);
    }
    label(g, W() - 360, 150, 'LEGEND, NOT HISTORY?', 0.05, 53, t, { fill: RED, color: PAPER, size: 32, tape: true });
  },
});
registerShot('c04', { draw(g, t) {                                  // paper tear into the title
  g.fillStyle = RED; g.fillRect(0, 0, W(), H()); paperOver(g, 0.3); halftone(g, 0, 0, W(), H(), '#8a1018', 0.2, 14, 0.6);
  const k = ease.inOut(clamp(step3(t) / 0.7));                       // paper sheet tears away to the left
  if (k < 1) { const edge = lerp(W() * 1.05, -W() * 0.2, k), pts = [[-W(), -20], [edge, -20], ...torn(77, edge, -20, edge - 120, H() + 20, 26, 30), [-W(), H() + 20]];
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = PAPER2; g.fill(); g.save(); g.clip(); paperOver(g, 0.6); g.restore();
    g.strokeStyle = '#fbf6ea'; g.lineWidth = 10; g.beginPath(); torn(77, edge, -20, edge - 120, H() + 20, 26, 30).forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); }
  // ransom-note title: each letter on its own scrap, popping in on 3s
  const lines = [['THE', 'REAL', 'LORE', 'BEHIND'], ['KING', 'ARTHUR']], r = rng(9); let n = 0;
  lines.forEach((ws, li) => { const size = li ? 200 : 96, y = li ? H() * 0.58 : H() * 0.32; const letters = ws.join(' ').split(''); const total = letters.length * size * 0.68; let x = W() / 2 - total / 2;
    letters.forEach((ch) => { const at = 0.55 + n * 0.035; n++; if (ch === ' ' || t < at) { x += size * 0.68; return; }
      const fills = li ? [PAPER, '#ffffff', GOLD, PAPER] : [INK, '#2a2420', INK]; const fill = fills[Math.floor(r() * fills.length)], col = fill === INK || fill === '#2a2420' ? PAPER : INK;
      const fonts = [FONTS.title, FONTS.serif, FONTS.ui], font = fonts[Math.floor(r() * 3)], rot = (r() - 0.5) * 0.22, pop = Math.min(1, (step3(t) - at + 0.125) * 4);
      scrap(g, x + size * 0.34 + jit(t, n, 1.5), y + jit(t, n + 40, 1.5), size * 0.66 * pop, size * 0.95 * pop, rot, fill, 300 + n, { amp: 3, draw: (g) => text(g, ch, 0, 4, { size: size * 0.78 * pop, color: col, font, italic: font === FONTS.serif, weight: 900 }) });
      x += size * 0.68; }); });
  if (t > 1.6) label(g, W() / 2, H() * 0.82, 'WHO REALLY INVENTED HIM', 0.02, 91, t, { size: 34, tape: true });
  tornFrame(g, t, INK);
} });
