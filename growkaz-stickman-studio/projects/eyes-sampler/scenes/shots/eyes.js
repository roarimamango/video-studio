// The Lore Behind What You See — psychedelic op-art sampler: RGB-split, CRT scanlines, op-art illusions, 3D worlds + 2D cut-outs.
import { E, registerShot, ease, clamp, lerp, prog, rng, text, measure, FONTS } from '/engine/core.js';
import { scrap, halftone, paperOver, POSE, person, hash, twos, chaos, withCam, ransom, tag, eye } from '/projects/edgar-allan-poe/scenes/_kit.js';
import { mixP } from '/projects/king-arthur-anime/scenes/shots/anime.js';

const W = () => E.W, H = () => E.H;
// optic palette: anaglyph red/cyan, signal yellow, electric blue, bone
const K = { ink: '#05060c', red: '#ff2a3a', cyan: '#16f0ff', yellow: '#ffe600', blue: '#1b2bff', deep: '#0a0f2a', bone: '#f6f6ee', stone: '#8d8a86', gold: '#e8b830', violet: '#6a1fd0' };

// RGB split (3D-glasses misregistration)
function rgb(g, t, draw, o = {}) { const d = o.d ?? 10, k = Math.floor(t * 12); for (const [col, dx, dy] of [[K.red, -d + hash(k) * 5, d * 0.3], [K.cyan, d - hash(k + 3) * 5, -d * 0.3]]) { g.save(); g.translate(dx, dy); g.globalAlpha *= 0.9; draw(col); g.restore(); } draw(o.main || K.ink); }
// CRT finish: paper + halftone + scanlines + slow rolling bar
function finish(g, t) {
  paperOver(g, 0.14); g.save(); g.globalAlpha = 0.12; halftone(g, 0, 0, W(), H(), K.ink, 12, 0.9, -1); g.restore();
  g.save(); g.globalAlpha = 0.13; g.fillStyle = K.ink; for (let y = 0; y < H(); y += 6) g.fillRect(0, y, W(), 2); g.restore();
  const by = ((t * 0.35) % 1.3 - 0.15) * H(); g.save(); g.globalAlpha = 0.06; g.fillStyle = K.bone; g.fillRect(0, by, W(), 90); g.restore();
}
// op-art backgrounds
function opRings(g, t, a, b, cx = W() / 2, cy = H() / 2, w = 70) { const k = (twos(t) * 160) % (w * 2); for (let r = 2600 + k; r > 0; r -= w) { g.fillStyle = Math.floor((r - k) / w) % 2 ? a : b; g.beginPath(); g.arc(cx + Math.sin(r * 0.01 + t) * 12, cy, r, 0, 7); g.fill(); } }
function opSpiral(g, t, a, b, rays = 24, spin = 1) { g.save(); g.translate(W() / 2, H() / 2); g.rotate(twos(t) * spin); for (let i = 0; i < rays; i++) { g.fillStyle = i % 2 ? a : b; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 14; k++) { const r = k * 150, ang = (i / rays) * Math.PI * 2 + k * 0.22; g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } for (let k = 14; k >= 0; k--) { const r = k * 150, ang = ((i + 1) / rays) * Math.PI * 2 + k * 0.22; g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } g.fill(); } g.restore(); }
function opStripes(g, t, a, b) { g.fillStyle = b; g.fillRect(0, 0, W(), H()); g.fillStyle = a; for (let x = -200; x < W() + 200; x += 44) { g.beginPath(); for (let y = 0; y <= H(); y += 30) { const dx = Math.sin(y * 0.008 + twos(t) * 3 + x * 0.002) * 60; y ? g.lineTo(x + dx, y) : g.moveTo(x + dx, y); } for (let y = H(); y >= 0; y -= 30) { const dx = Math.sin(y * 0.008 + twos(t) * 3 + x * 0.002) * 60; g.lineTo(x + dx + 22, y); } g.fill(); } }
const label = (g, t, at, x, y, str, o = {}) => { if (t <= at) return; const size = o.size || 34, font = o.serif ? FONTS.serif : FONTS.ui, w = measure(g, str, size, font, 900) + str.length * (o.serif ? 1 : 3) + 70; scrap(g, x + (hash(Math.floor(t * 8) + str.length) - 0.5) * 4, y, w, size * 1.8, o.rot ?? -0.04, o.fill || K.yellow, 11 + str.length, { amp: 4, tape: o.tape, draw: (g) => text(g, str, 0, 3, { size, color: o.color === 'bone' ? K.bone : K.ink, font, italic: !!o.serif, weight: 900, spacing: o.serif ? 1 : 3 }) }); };
// eye drawn in this palette
function bigEye(g, x, y, r, t, o = {}) {
  const open = o.open ?? 1, pup = o.pupil ?? 0.34;
  g.save(); g.beginPath(); g.ellipse(x, y, r * 1.7, r * open, 0, 0, 7); g.clip();
  g.fillStyle = K.bone; g.fillRect(x - r * 2, y - r * 1.2, r * 4, r * 2.4);
  g.strokeStyle = K.red; g.lineWidth = r * 0.012; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r); g.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 1.2, y + Math.sin(a + 0.3) * r * 0.8, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.75); g.stroke(); }
  const lx = x + (o.look || 0) * r * 0.3; for (let i = 0; i < 9; i++) { g.fillStyle = [K.cyan, K.blue, K.yellow][i % 3]; g.beginPath(); g.arc(lx, y, r * (0.82 - i * 0.05), 0, 7); g.fill(); }
  g.strokeStyle = K.ink; g.lineWidth = r * 0.01; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2 + twos(t) * 0.4; g.beginPath(); g.moveTo(lx + Math.cos(a) * r * pup, y + Math.sin(a) * r * pup); g.lineTo(lx + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); g.stroke(); }
  g.fillStyle = K.ink; g.beginPath(); g.arc(lx, y, r * pup, 0, 7); g.fill();
  if (o.inPupil) o.inPupil(lx, y, r * pup);
  g.fillStyle = K.bone; g.beginPath(); g.ellipse(lx - r * 0.2, y - r * 0.22, r * 0.09, r * 0.06, -0.5, 0, 7); g.fill();
  g.restore();
  g.strokeStyle = K.ink; g.lineWidth = r * 0.06; g.beginPath(); g.ellipse(x, y, r * 1.7, Math.max(1, r * open), 0, 0, 7); g.stroke();
}

// ---------- 3D helpers ----------
function kit(T) { const { THREE } = T; const flat = (c, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), side: THREE.DoubleSide, ...o }); const m = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); return o; }; return { THREE, flat, m }; }

// ================= e01: into the iris =================
registerShot('e01', { kind: '3d',
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.deep], fog: [6, 80], fogColor: '#05060c', fov: 72, ambient: 1.2, bloom: 1.1 });
    const cols = [K.red, K.cyan, K.bone, K.blue, K.yellow]; const rings = [];
    for (let i = 0; i < 90; i++) { const r = 5 + Math.sin(i * 0.5) * 1.4; const ring = k.m(new k.THREE.TorusGeometry(r, 0.35 + (i % 3) * 0.12, 8, 64), k.flat(cols[i % 5]), 0, 0, 10 - i * 2.2); st.add(ring); rings.push(ring); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; const fib = k.m(new k.THREE.BoxGeometry(0.08, 3.5, 0.08), k.flat(i % 2 ? K.cyan : K.bone), Math.cos(a) * 3.2, Math.sin(a) * 3.2, -196); fib.rotation.z = a + Math.PI / 2; st.add(fib); }
    st.add(k.m(new k.THREE.CircleGeometry(1.6, 48), k.flat(K.ink), 0, 0, -195.9));
    return { stage: st, rings }; },
  draw(s, t) { const c = chaos(t, 11, 0.3); const cam = s.stage.camera; const z = 14 - ease.in(clamp(t / 3.5)) * 190 - c.pos * 4; cam.position.set(Math.sin(t * 2.3) * 1.2, Math.cos(t * 1.7) * 0.8, z); cam.lookAt(0, 0, z - 10); cam.rotateZ(c.roll * 0.6 + t * 0.8); cam.fov = 72 / c.zoom; cam.updateProjectionMatrix(); s.rings.forEach((r, i) => { r.rotation.z = t * (i % 2 ? 1 : -1); r.scale.setScalar(1 + 0.08 * Math.sin(t * 6 + i * 0.4)); }); },
  overlay(g, t) {
    if (t > 0.4) ransom(g, t, ['BE WARY', 'OF YOUR EYES'], H() * 0.36, 78, 0.4, { seed: 3 });
    label(g, t, 1.6, W() * 0.5, H() * 0.86, 'WHAT YOU SEE CHANGES YOU', { fill: K.cyan });
    if (t > 3.3) { g.fillStyle = K.ink; g.globalAlpha = prog(t, 3.3, 3.5); g.fillRect(0, 0, W(), H()); g.globalAlpha = 1; }
    finish(g, t); },
});

// ================= e02: Medusa =================
function medusa(g, x, y, s, t, col, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
  for (let i = 0; i < 13; i++) { const a = -Math.PI * 0.95 + i / 12 * Math.PI * 0.9 - 0.05, w = Math.sin(twos(t) * 7 + i * 1.3);
    const x0 = Math.cos(a) * 120, y0 = Math.sin(a) * 140 - 10, x1 = Math.cos(a) * 300 + w * 50, y1 = Math.sin(a) * 300 - 20, mx = Math.cos(a + 0.4 * w) * 220, my = Math.sin(a + 0.4 * w) * 230;
    g.lineWidth = 28; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
    g.beginPath(); g.ellipse(x1, y1, 30, 20, a + w * 0.4, 0, 7); g.fill();
    if (!o.flat) { g.strokeStyle = K.red; g.lineWidth = 4; g.beginPath(); g.moveTo(x1 + Math.cos(a) * 26, y1 + Math.sin(a) * 26); g.lineTo(x1 + Math.cos(a) * 52, y1 + Math.sin(a) * 52); g.stroke(); g.strokeStyle = col; } }
  g.beginPath(); g.ellipse(0, 0, 125, 160, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-60, 130); g.lineTo(-90, 330); g.lineTo(90, 330); g.lineTo(60, 130); g.fill();
  if (!o.flat) { const gl = 0.6 + 0.4 * Math.sin(t * 9); g.fillStyle = K.yellow; for (const ex of [-46, 46]) { g.beginPath(); g.ellipse(ex, -10, 26, 12 * gl + 4, 0, 0, 7); g.fill(); } g.fillStyle = K.ink; for (const ex of [-46, 46]) g.fillRect(ex - 3, -22, 6, 24); g.fillStyle = K.red; g.beginPath(); g.ellipse(0, 78, 38, 10, 0, 0, 7); g.fill(); }
  g.restore();
}
registerShot('e02', { draw(g, t) {
  const c = { roll: Math.sin(t * 0.8) * 0.06, zoom: 1.04 + t * 0.03 };
  opRings(g, t, K.violet, K.ink, W() * 0.3, H() * 0.42, 64);
  withCam(g, c, () => {
    // gaze beams
    const bk = prog(t, 0.7, 1.1); if (bk > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 * bk; g.fillStyle = K.yellow; g.beginPath(); g.moveTo(W() * 0.3, H() * 0.37); g.lineTo(W() * 0.74, H() * 0.32); g.lineTo(W() * 0.74, H() * 0.62); g.fill(); g.restore(); }
    rgb(g, t, (col) => medusa(g, W() * 0.3, H() * 0.42, 1.05, t, col, { flat: col !== K.ink }), { d: 9 });
    // the man: recoils, then stone climbs from his feet
    const x = W() * 0.76, y = H() * 1.0, s = 2.9, k = ease.inOut(prog(t, 0.2, 0.9)), pose = mixP(POSE.stand, POSE.thrown, k * 0.45);
    rgb(g, t, (col) => person(g, 'MAN', x, y, s, pose, { flat: true, color: col, facing: -1 }), { d: 7 });
    const st = ease.inOut(prog(t, 1.1, 3.0)); if (st > 0) { const top = y - st * 760; g.save(); g.beginPath(); g.rect(x - 400, top, 800, y - top + 20); g.clip(); person(g, 'MAN', x, y, s, pose, { flat: true, color: K.stone, facing: -1 }); g.strokeStyle = K.ink; g.lineWidth = 3; const r = rng(7); for (let i = 0; i < 16; i++) { const cx = x - 60 + r() * 120, cy = y - r() * 700; if (cy < top) continue; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (r() - 0.5) * 40, cy + 30); g.lineTo(cx + (r() - 0.5) * 30, cy + 60); g.stroke(); } g.restore(); }
  });
  label(g, t, 0.2, W() * 0.24, H() * 0.1, 'ANCIENT GREECE', { fill: K.cyan });
  label(g, t, 1.4, W() * 0.72, H() * 0.1, 'ONE LOOK. TURNED TO STONE.', { fill: K.yellow, rot: 0.03 });
  finish(g, t);
} });

// ================= e03: the evil eye =================
registerShot('e03', { kind: '3d',
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.deep, K.ink], fog: [5, 60], fogColor: '#0a0f2a', fov: 70, ambient: 1.3, bloom: 0.9 });
    const tex = T.canvasTex(256, 256, (g, w, h) => { const cx = w / 2; for (const [r, c] of [[128, '#0b2a9a'], [96, '#f6f6ee'], [70, '#3ec8ff'], [40, '#05060c']]) { g.fillStyle = c; g.beginPath(); g.arc(cx, cx, r, 0, 7); g.fill(); } g.fillStyle = '#f6f6ee'; g.beginPath(); g.arc(cx - 12, cx - 12, 9, 0, 7); g.fill(); });
    const eyes = []; for (let i = 0; i < 220; i++) { const u = hash(i * 3.1), v = hash(i * 7.7), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), r = 9 + hash(i) * 14; const e = k.m(new k.THREE.CircleGeometry(0.6 + hash(i * 2) * 0.9, 40), k.flat('#ffffff', { map: tex }), Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r); st.add(e); eyes.push(e); }
    return { stage: st, eyes }; },
  draw(s, t) { const c = chaos(t, 13, 0.3); const cam = s.stage.camera, a = t * 0.9 + c.pos * 0.25; cam.position.set(Math.sin(a) * 3, Math.sin(t * 1.3) * 1.5, Math.cos(a) * 3); cam.lookAt(Math.sin(a + 1) * 10, 0, Math.cos(a + 1) * 10); cam.rotateZ(c.roll * 0.5); s.eyes.forEach((e, i) => { const turn = ease.out(prog(t, 0.3 + hash(i) * 1.2, 0.8 + hash(i) * 1.2)); e.lookAt(cam.position); e.rotateY((1 - turn) * Math.PI * 0.95); }); },
  overlay(g, t) {
    rgb(g, t, (col) => person(g, 'WOMAN', W() * 0.5, H() * 0.98, 2.3, mixP(POSE.stand, POSE.raise, ease.inOut(prog(t, 0.5, 1.4))), { flat: true, color: col }), { d: 8 });
    if (t > 0.5) ransom(g, t, ['THE EVIL EYE'], H() * 0.16, 82, 0.5, { seed: 5, big: 0 });
    label(g, t, 1.5, W() * 0.5, H() * 0.32, 'FEARED FOR 5,000 YEARS', { fill: K.cyan, rot: 0.03 });
    finish(g, t); },
});

// ================= e04: Stendhal syndrome =================
registerShot('e04', { draw(g, t) {
  const c = { roll: Math.sin(t * 0.6) * 0.04 + ease.in(prog(t, 1.8, 3.2)) * 0.25, zoom: 1 + t * 0.05 };
  g.fillStyle = '#1a0606'; g.fillRect(0, 0, W(), H());
  withCam(g, c, () => {
    // the painting: a gilded frame that swallows the room
    const fx = W() * 0.56, fy = H() * 0.42, fw = 900 + t * 30, fh = 620 + t * 20;
    g.fillStyle = K.gold; g.fillRect(fx - fw / 2 - 40, fy - fh / 2 - 40, fw + 80, fh + 80); g.fillStyle = '#8a5a10'; g.fillRect(fx - fw / 2 - 14, fy - fh / 2 - 14, fw + 28, fh + 28);
    g.save(); g.beginPath(); g.rect(fx - fw / 2, fy - fh / 2, fw, fh); g.clip(); g.translate(fx - W() / 2, fy - H() / 2); opSpiral(g, t, K.blue, K.yellow, 22, 1.4 + t * 0.8); g.restore();
    g.save(); g.beginPath(); g.rect(fx - fw / 2, fy - fh / 2, fw, fh); g.clip(); bigEye(g, fx, fy, 120 + t * 25, t, { pupil: 0.3 + 0.1 * Math.sin(t * 4) }); g.restore();
    g.fillStyle = K.ink; g.fillRect(-W(), H() * 0.9, W() * 3, H());
    // the visitor: stands, sways, collapses
    const k = ease.in(prog(t, 1.6, 2.6)), x = W() * 0.2, y = H() * 0.9;
    g.save(); g.translate(x, y); g.rotate(-k * 1.35 + Math.sin(t * 5) * 0.04 * (1 - k)); rgb(g, t, (col) => person(g, 'GENT', 0, 0, 2.1, mixP(POSE.stand, POSE.thrown, 0.3 + k * 0.5), { flat: true, color: col }), { d: 7 }); g.restore();
  });
  // heart-rate monitor
  const bx = W() * 0.05, by = H() * 0.88, bw = W() * 0.9; g.fillStyle = 'rgba(5,6,12,.75)'; g.fillRect(bx, by - 70, bw, 110);
  const bpm = Math.round(lerp(72, 190, ease.in(prog(t, 0.3, 2.4)))); g.strokeStyle = K.cyan; g.lineWidth = 5; g.beginPath();
  for (let i = 0; i <= 300; i++) { const u = i / 300, tt = t * 2 - (1 - u) * 2, ph = (tt * bpm / 60) % 1, v = Math.exp(-((ph - 0.5) ** 2) / 0.0012) - 0.4 * Math.exp(-((ph - 0.56) ** 2) / 0.0008); const px = bx + 20 + u * (bw - 260), py = by - 15 - v * 48; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  text(g, `${bpm} BPM`, bx + bw - 120, by - 12, { size: 46, color: bpm > 150 ? K.red : K.cyan, font: FONTS.ui, weight: 900 });
  label(g, t, 0.2, W() * 0.22, H() * 0.1, 'FLORENCE · 1817', { fill: K.yellow });
  label(g, t, 1.2, W() * 0.72, H() * 0.1, 'STENDHAL SYNDROME', { fill: K.red, color: 'bone', serif: true, rot: 0.04 });
  finish(g, t);
} });

// ================= e05: 1957 cinema =================
registerShot('e05', { draw(g, t) {
  const c = { roll: 0, zoom: 1 + t * 0.06 };
  g.fillStyle = K.ink; g.fillRect(0, 0, W(), H());
  withCam(g, c, () => {
    const sx = W() / 2, sy = H() * 0.36, sw = 1100, sh = 470;
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16; g.fillStyle = K.bone; g.beginPath(); g.moveTo(W() / 2 - 30, H() * 1.1); g.lineTo(sx - sw / 2, sy - sh / 2); g.lineTo(sx + sw / 2, sy - sh / 2); g.lineTo(W() / 2 + 30, H() * 1.1); g.fill(); g.restore();
    // the film: an op-art countdown leader
    g.save(); g.beginPath(); g.rect(sx - sw / 2, sy - sh / 2, sw, sh); g.clip(); g.translate(sx - W() / 2, sy - H() / 2); opRings(g, t, '#d8d0b8', '#2a2620', W() / 2, H() / 2, 50); g.restore();
    g.strokeStyle = K.ink; g.lineWidth = 6; g.beginPath(); g.moveTo(sx - sw / 2, sy); g.lineTo(sx + sw / 2, sy); g.moveTo(sx, sy - sh / 2); g.lineTo(sx, sy + sh / 2); g.stroke();
    const n = 3 - Math.floor(t * 1.2); if (n > 0) text(g, String(n), sx, sy + 10, { size: 260, color: K.ink, font: FONTS.title, weight: 900 });
    // hidden single frames (localised, one frame each, ~1.3 Hz)
    const f = Math.floor(t * 24); if ([10, 26, 42, 58].includes(f)) { g.fillStyle = K.bone; g.fillRect(sx - sw / 2, sy - sh / 2, sw, sh); text(g, f % 32 === 10 ? 'EAT POPCORN' : 'BUY. NOW.', sx, sy + 20, { size: 130, color: K.red, font: FONTS.title, weight: 900 }); }
    // audience from behind; every head turns together toward camera at 2.1 s
    const turn = ease.inOut(prog(t, 2.05, 2.4));
    for (let row = 0; row < 3; row++) for (let i = -8; i <= 8; i++) { const x = W() / 2 + i * (150 + row * 40) + (row % 2) * 70, y = H() * (0.8 + row * 0.13), s = 1 + row * 0.35; g.fillStyle = row === 2 ? K.ink : '#14121c';
      g.beginPath(); g.ellipse(x, y + 70 * s, 70 * s, 60 * s, 0, Math.PI, 0); g.fill(); g.beginPath(); g.arc(x, y, 40 * s, 0, 7); g.fill();
      if (turn > 0) { g.fillStyle = K.yellow; g.globalAlpha = turn; for (const dx of [-14, 14]) { g.beginPath(); g.ellipse(x + dx * s, y - 4 * s, 8 * s, 4 * s, 0, 0, 7); g.fill(); } g.globalAlpha = 1; } }
    // popcorn
    for (let i = 0; i < 18; i++) { const k = (t * 0.5 + hash(i)) % 1; g.fillStyle = K.bone; g.beginPath(); g.arc(W() * hash(i * 9), H() * 0.7 - k * 500, 12 + hash(i) * 8, 0, 7); g.fill(); }
  });
  label(g, t, 0.1, W() * 0.2, H() * 0.08, 'NEW JERSEY · 1957', { fill: K.yellow });
  label(g, t, 0.9, W() * 0.78, H() * 0.08, '"SUBLIMINAL" ADS', { fill: K.cyan, rot: 0.04 });
  if (t > 2.2) ransom(g, t, ['...OR A HOAX?'], H() * 0.62, 84, 2.2, { seed: 8, big: 0 });
  finish(g, t);
} });

// ================= e06: the feed =================
const POSTS = (T, i) => T.canvasTex(256, 448, (g, w, h) => {
  const bg = ['#0b0d18', '#f6f6ee', '#1b2bff', '#ff2a3a', '#05060c', '#ffe600'][i % 6], fg = i % 6 === 1 || i % 6 === 5 ? '#05060c' : '#f6f6ee';
  g.fillStyle = '#05060c'; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(10, 10, w - 20, h - 20);
  g.fillStyle = fg; g.beginPath(); g.arc(40, 44, 20, 0, 7); g.fill(); g.fillRect(70, 34, 120, 14); g.fillRect(70, 54, 80, 8);
  g.fillStyle = ['#16f0ff', '#ff2a3a', '#ffe600', '#6a1fd0'][i % 4]; g.fillRect(20, 80, w - 40, 220);
  g.fillStyle = fg; g.font = '900 54px sans-serif'; g.textAlign = 'center'; g.fillText(['WOW', '!!!', 'OMG', '99+', 'LOOK', 'NOW'][i % 6], w / 2, 210);
  g.fillStyle = '#ff2a3a'; g.beginPath(); const hx = 44, hy = 350; g.moveTo(hx, hy + 18); g.bezierCurveTo(hx - 30, hy - 4, hx - 14, hy - 26, hx, hy - 8); g.bezierCurveTo(hx + 14, hy - 26, hx + 30, hy - 4, hx, hy + 18); g.fill();
  g.fillStyle = fg; g.font = '900 30px sans-serif'; g.textAlign = 'left'; g.fillText(`${(i * 37 % 90) + 3}K`, 80, 362); g.fillRect(20, 392, w - 40, 10); g.fillRect(20, 410, w - 100, 10);
});
registerShot('e06', { kind: '3d',
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.deep], fog: [4, 70], fogColor: '#05060c', fov: 75, ambient: 1.4, bloom: 1.0 });
    const tex = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => POSTS(T, i)); const phones = [];
    for (let i = 0; i < 320; i++) { const wall = i % 4, d = Math.floor(i / 4), along = (hash(i) - 0.5) * 9; const p = k.m(new k.THREE.PlaneGeometry(1.6, 2.8), k.flat('#ffffff', { map: tex[i % 8] }));
      const z = 8 - d * 2.6; if (wall === 0) { p.position.set(-5, along * 0.6, z); p.rotation.y = Math.PI / 2; } else if (wall === 1) { p.position.set(5, along * 0.6, z); p.rotation.y = -Math.PI / 2; } else if (wall === 2) { p.position.set(along, 4.5, z); p.rotation.x = Math.PI / 2; } else { p.position.set(along, -4.5, z); p.rotation.x = -Math.PI / 2; }
      st.add(p); phones.push(p); }
    return { stage: st, phones }; },
  draw(s, t) { const c = chaos(t, 17, 0.25); const cam = s.stage.camera, z = 10 - t * 40 - c.pos * 6; cam.position.set(Math.sin(t * 3) * 1.2, Math.cos(t * 2.1) * 0.8, z); cam.lookAt(0, 0, z - 10); cam.rotateZ(c.roll); cam.fov = 75 / c.zoom; cam.updateProjectionMatrix(); },
  overlay(g, t) {
    // a hypnotised face lit from below by the screen
    const x = W() / 2, y = H() * 0.56, s = 1.1 + 0.04 * Math.sin(t * 8);
    rgb(g, t, (col) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 170 * s, 210 * s, 0, 0, 7); g.fill(); g.fillRect(x - 60 * s, y + 180 * s, 120 * s, 140 * s); g.beginPath(); g.ellipse(x, y + 420 * s, 360 * s, 140 * s, 0, Math.PI, 0); g.fill(); }, { d: 12 });
    for (const dx of [-62, 62]) { g.save(); g.beginPath(); g.arc(x + dx * s, y - 10 * s, 46 * s, 0, 7); g.clip(); g.translate(x + dx * s - W() / 2, y - 10 * s - H() / 2); opSpiral(g, t * 2, K.cyan, K.ink, 10, 6); g.restore(); }
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y + 260 * s, 10, x, y + 260 * s, 360 * s); gr.addColorStop(0, 'rgba(22,240,255,.45)'); gr.addColorStop(1, 'rgba(22,240,255,0)'); g.fillStyle = gr; g.fillRect(x - 400 * s, y - 200 * s, 800 * s, 800 * s); g.restore();
    // notifications swarm
    for (let i = 0; i < 9; i++) { const at = 0.4 + i * 0.32; if (t < at) continue; const pk = ease.out(prog(t, at, at + 0.15)), a = i * 2.4, r = 330 + (i % 3) * 90; const nx = x + Math.cos(a) * r * 1.4, ny = y - 60 + Math.sin(a) * r * 0.75;
      g.save(); g.translate(nx, ny); g.scale(pk, pk); g.fillStyle = K.red; g.beginPath(); g.arc(0, 0, 44, 0, 7); g.fill(); text(g, i > 5 ? '99+' : String(i * 7 + 3), 0, 4, { size: i > 5 ? 30 : 38, color: K.bone, font: FONTS.ui, weight: 900 }); g.restore(); }
    label(g, t, 0.2, W() * 0.2, H() * 0.09, 'NOW', { fill: K.yellow, size: 44 });
    label(g, t, 1.0, W() * 0.7, H() * 0.09, 'THE FEED NEVER ENDS', { fill: K.cyan, rot: 0.03 });
    finish(g, t); },
});

// ================= e07: title on the eye =================
registerShot('e07', { draw(g, t) {
  const c = { roll: Math.sin(t * 0.7) * 0.05, zoom: 1.0 + ease.in(prog(t, 2.2, 3.5)) * 0.6 };
  opStripes(g, t, K.red, K.ink);
  withCam(g, c, () => {
    const open = t < 2.9 ? ease.out(prog(t, 0, 0.5)) : 1 - ease.in(prog(t, 2.9, 3.15));
    rgb(g, t, (col) => { g.fillStyle = col; g.beginPath(); g.ellipse(W() / 2, H() * 0.5, 420 * 1.7 + 30, Math.max(4, 420 * open * 0.62 + 30), 0, 0, 7); g.fill(); }, { d: 14 });
    bigEye(g, W() / 2, H() * 0.5, 420, t, { open: open * 0.62, pupil: 0.2 + ease.inOut(prog(t, 0.6, 2.0)) * 0.22, look: Math.sin(t * 2) * 0.3,
      inPupil: (px, py, pr) => { g.save(); g.translate(px, py); g.rotate(-0.15); g.fillStyle = K.cyan; g.globalAlpha = 0.85; g.fillRect(-pr * 0.32, -pr * 0.55, pr * 0.64, pr * 1.1); g.fillStyle = K.ink; g.fillRect(-pr * 0.26, -pr * 0.46, pr * 0.52, pr * 0.9); g.fillStyle = K.red; g.fillRect(-pr * 0.2, -pr * 0.36, pr * 0.4, pr * 0.3); g.restore(); } });
  });
  if (t > 0.8 && t < 3.0) ransom(g, t, ['THE LORE BEHIND', 'WHAT YOU SEE'], H() * 0.12, 64, 0.8, { seed: 12 });
  if (t > 1.8 && t < 3.0) label(g, t, 1.8, W() / 2, H() * 0.9, 'BE WARY OF YOUR EYES', { fill: K.yellow, tape: true, size: 40 });
  if (t > 3.15) { g.fillStyle = K.ink; g.fillRect(0, 0, W(), H()); }
  finish(g, t);
} });
