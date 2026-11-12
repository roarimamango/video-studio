// _kit.js — shadow-collage drawing kit for the Yi Sun-sin video (paper, ink, red; silhouettes; cut-paper).
import { E, ease, prog, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { character, P as POSE, sword } from '/projects/king-arthur-anime/scenes/shots/anime.js';

export const W = () => E.W, H = () => E.H;
export const C = { paper: '#efe6d2', paper2: '#e2d5b8', paper3: '#d4c29e', ink: '#0c0a0a', ink2: '#2a2420', red: '#c8202a', red2: '#8a1018', gold: '#e0b040', sea: '#b9c2bb', sea2: '#8e9c98', indigo: '#24304a' };
export const step3 = (t) => Math.floor(t * 8) / 8;
export const hash = (n) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
export const jit = (t, seed, a = 3) => (hash(Math.floor(t * 8) * 13 + seed) - 0.5) * 2 * a;
export { POSE };

// ---------- textures ----------
let GRAIN = null;
export function grain() {
  if (GRAIN) return GRAIN; const c = document.createElement('canvas'); c.width = 960; c.height = 540; const x = c.getContext('2d'), id = x.createImageData(960, 540); let s = 7;
  for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = 200 + ((s >>> 24) % 56); id.data[i] = v; id.data[i + 1] = v - 6; id.data[i + 2] = v - 18; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0); x.strokeStyle = 'rgba(120,100,70,.12)'; const r = rng(3); for (let i = 0; i < 500; i++) { const px = r() * 960, py = r() * 540; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 30, py + (r() - 0.5) * 6); x.stroke(); }
  return (GRAIN = c);
}
export const paperOver = (g, a = 0.35) => { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a; g.drawImage(grain(), 0, 0, W(), H()); g.restore(); };
export function halftone(g, x, y, w, h, color, size = 10, fade = 1, dir = 1) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = color;
  for (let yy = y; yy < y + h + size; yy += size) for (let xx = x - ((yy / size) % 2) * size / 2; xx < x + w + size; xx += size) { let k = clamp((yy - y) / h); if (dir < 0) k = 1 - k; k *= fade; if (k <= 0.03) continue; g.beginPath(); g.arc(xx, yy, size * 0.5 * k, 0, 7); g.fill(); }
  g.restore();
}
export function torn(seed, x0, y0, x1, y1, amp = 14, step = 22) {
  const r = rng(seed), n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)), out = [];
  for (let i = 0; i <= n; i++) { const u = i / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, d = (r() - 0.5) * 2 * amp * (i % 3 === 0 ? 1.6 : 1); out.push([lerp(x0, x1, u) + nx / L * d, lerp(y0, y1, u) + ny / L * d]); }
  return out;
}
const pathOf = (g, pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };
export function scrap(g, x, y, w, h, rot, fill, seed, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const a = o.amp ?? 6, pts = [...torn(seed, -w / 2, -h / 2, w / 2, -h / 2, a, 18), ...torn(seed + 1, w / 2, -h / 2, w / 2, h / 2, a, 18), ...torn(seed + 2, w / 2, h / 2, -w / 2, h / 2, a, 18), ...torn(seed + 3, -w / 2, h / 2, -w / 2, -h / 2, a, 18)];
  if (o.shadow !== false) { g.save(); g.translate(10, 14); pathOf(g, pts); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(); g.restore(); }
  pathOf(g, pts); g.fillStyle = fill; g.fill(); g.save(); pathOf(g, pts); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5; g.drawImage(grain(), -w / 2, -h / 2, w, h); g.restore();
  if (o.draw) { g.save(); pathOf(g, pts); g.clip(); o.draw(g, w, h); g.restore(); }
  if (o.tape) { g.save(); g.translate(-w * 0.32, -h / 2); g.rotate(-0.5); g.fillStyle = 'rgba(240,226,180,.78)'; g.fillRect(-50, -16, 100, 32); g.restore(); }
  g.restore();
}
export function tornFrame(g, t, color = C.paper) {
  const k = Math.floor(t * 8) % 2;
  const top = [[-20, -20], [W() + 20, -20], ...torn(41 + k, W() + 20, 56, -20, 48, 12, 26)], bot = [[-20, H() + 20], [W() + 20, H() + 20], ...torn(43 + k, W() + 20, H() - 52, -20, H() - 58, 12, 26)];
  for (const p of [top, bot]) { pathOf(g, p); g.fillStyle = color; g.fill(); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6; g.drawImage(grain(), 0, 0, W(), 70); g.drawImage(grain(), 0, H() - 70, W(), 70); g.restore();
}
export function label(g, x, y, str, rot, seed, t, o = {}) {
  const size = o.size || 32, w = str.length * size * 0.62 + 60, h = size * 1.9;
  scrap(g, x + jit(t, seed, 2), y + jit(t, seed + 5, 2), w, h, rot, o.fill || C.paper, seed, { amp: 4, tape: o.tape, draw: (g) => text(g, str, 0, 2, { size, color: o.color || C.ink, font: o.font || FONTS.ui, weight: 900, spacing: 4, italic: o.italic }) });
}
export function sunDisc(g, x, y, r, color = C.red) { g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.35; g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.drawImage(grain(), x - r, y - r, r * 2, r * 2); g.restore(); }
export function redArrow(g, pts, k, color = C.red, w = 9) {     // hand-drawn route arrow, drawn on progressively (k 0..1)
  if (k <= 0 || pts.length < 2) return; const segs = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(L); tot += L; }
  let rem = tot * clamp(k), last = pts[0], prev = pts[0]; g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && rem > 0; i++) { const L = segs[i - 1], u = Math.min(1, rem / L); prev = last; last = [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; g.lineTo(last[0], last[1]); rem -= L; }
  g.stroke(); const a = Math.atan2(last[1] - prev[1], last[0] - prev[0]); g.fillStyle = color; g.beginPath(); g.moveTo(last[0] + Math.cos(a) * w * 2.6, last[1] + Math.sin(a) * w * 2.6); g.lineTo(last[0] + Math.cos(a + 2.4) * w * 2.4, last[1] + Math.sin(a + 2.4) * w * 2.4); g.lineTo(last[0] + Math.cos(a - 2.4) * w * 2.4, last[1] + Math.sin(a - 2.4) * w * 2.4); g.fill(); g.restore();
}

// ---------- ships (2D cut-out silhouettes, facing +x; y = waterline) ----------
export function ship(g, kind, x, y, s = 1, o = {}) {
  const f = o.facing ?? 1, ink = o.ink || C.ink; g.save(); g.translate(x, y); g.scale(s * f, s);
  const rim = o.rim; const hull = (pts) => { if (rim) { g.save(); g.translate(-4, -4); pathOf(g, pts); g.fillStyle = rim; g.fill(); g.restore(); } pathOf(g, pts); g.fillStyle = ink; g.fill(); };
  if (kind === 'turtle') {
    hull([[-150, -10], [150, -10], [125, 25], [-130, 25]]);
    hull([[-140, -10], [-130, -55], [-90, -85], [90, -85], [130, -55], [140, -10]]);
    for (let i = -5; i <= 5; i++) for (const yy of [-82, -60]) { g.fillStyle = ink; g.beginPath(); g.moveTo(i * 22 - 5, yy); g.lineTo(i * 22, yy - 16); g.lineTo(i * 22 + 5, yy); g.fill(); }
    hull([[140, -40], [190, -70], [205, -55], [185, -40], [150, -25]]);                              // dragon head
    for (const xx of [-100, -50, 0, 50, 100]) { g.fillStyle = o.ports || C.red; g.fillRect(xx - 7, -28, 14, 10); }
    if (o.smoke) for (let i = 0; i < 4; i++) { const k = (o.smoke + i * 0.25) % 1; g.fillStyle = `rgba(239,230,210,${0.7 * (1 - k)})`; g.beginPath(); g.arc(205 + k * 80, -60 - k * 40, 10 + k * 22, 0, 7); g.fill(); }
    for (let i = -6; i <= 6; i++) { g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(i * 20, 20); g.lineTo(i * 20 - 14, 46); g.stroke(); }  // oars
  } else if (kind === 'panok') {                                                                   // Korean panokseon: tall deck house, red square sail
    hull([[-150, -10], [160, -10], [130, 25], [-130, 25]]); hull([[-120, -10], [-120, -60], [120, -60], [120, -10]]); hull([[-90, -60], [-90, -85], [90, -85], [90, -60]]);
    g.fillStyle = ink; g.fillRect(-6, -230, 10, 150); g.fillStyle = o.sail || C.red; g.fillRect(-70, -220, 140, 120); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < 4; i++) g.fillRect(-70, -220 + i * 30, 140, 4);
    for (let i = -6; i <= 6; i++) { g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(i * 20, 20); g.lineTo(i * 20 - 14, 46); g.stroke(); }
  } else {                                                                                        // Japanese warship: boxy hull, tower, pale sail with dark disc
    hull([[-140, -10], [170, -20], [130, 25], [-120, 25]]); hull([[-100, -10], [-100, -70], [60, -70], [60, -10]]); hull([[-70, -70], [-70, -110], [20, -110], [20, -70]]);
    g.fillStyle = ink; g.fillRect(90, -220, 9, 210); g.fillStyle = o.sail || C.paper; g.fillRect(40, -210, 110, 130); g.strokeStyle = ink; g.lineWidth = 6; g.strokeRect(40, -210, 110, 130); g.fillStyle = o.mon || C.ink; g.beginPath(); g.arc(95, -145, 22, 0, 7); g.fill();
    g.fillStyle = ink; g.fillRect(-90, -130, 6, 60); g.fillStyle = o.flag || C.paper; g.fillRect(-84, -130, 30, 20);
  }
  if (o.fire) { const k = o.fire; for (let i = 0; i < 6; i++) { const ph = (k * 3 + i * 0.17) % 1; g.fillStyle = i % 2 ? C.red : C.gold; g.beginPath(); g.moveTo(-60 + i * 25, -60); g.quadraticCurveTo(-70 + i * 25, -110 - ph * 60, -50 + i * 25 + Math.sin(ph * 6) * 10, -150 - ph * 40); g.quadraticCurveTo(-35 + i * 25, -100, -40 + i * 25, -60); g.fill(); } }
  g.restore();
}
export function waves(g, y, t, color = C.ink, o = {}) {                  // stylised scalloped wave lines on 3s
  const k = step3(t), r = rng(o.seed || 4), rows = o.rows || 5;
  g.save(); g.strokeStyle = color; g.lineWidth = o.w || 4; g.lineCap = 'round';
  for (let j = 0; j < rows; j++) { const yy = y + j * (o.gap || 50), off = ((k * (o.speed || 40) * (j % 2 ? 1 : -1)) % 120); g.beginPath(); for (let x = -200 + off + r() * 60; x < W() + 200; x += 120) { g.moveTo(x, yy); g.quadraticCurveTo(x + 30, yy - 18, x + 60, yy); } g.stroke(); }
  g.restore();
}

// ---------- silhouette characters with period headwear ----------
const HAT = {
  helmet(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y - r * 0.15, r * 1.12, Math.PI, 0); g.fill(); g.fillRect(x - r * 1.25, y - r * 0.2, r * 2.5, r * 0.25); g.fillRect(x - r * 0.08, y - r * 1.75, r * 0.16, r * 0.6); g.beginPath(); g.moveTo(x - r * 0.1, y - r * 1.75); g.lineTo(x + r * 0.5, y - r * 2.3); g.lineTo(x + r * 0.1, y - r * 1.6); g.fill(); g.fillRect(x - r * 1.1, y - r * 0.1, r * 0.35, r * 1.1); },
  gat(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y - r * 0.55, r * 2.2, r * 0.22, 0, 0, 7); g.fill(); g.fillRect(x - r * 0.7, y - r * 1.55, r * 1.4, r * 1.05); },
  royal(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y - r * 0.6, r * 0.95, Math.PI, 0); g.fill(); g.fillRect(x - r * 0.95, y - r * 0.65, r * 1.9, r * 0.4); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * r * 1.15, y - r * 1.05, r * 0.55, r * 0.28, s * 0.35, 0, 7); g.fill(); } },
  kabuto(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y - r * 0.2, r * 1.15, Math.PI, 0); g.fill(); g.beginPath(); g.moveTo(x - r * 1.5, y + r * 0.2); g.lineTo(x - r * 1.15, y - r * 0.2); g.lineTo(x + r * 1.15, y - r * 0.2); g.lineTo(x + r * 1.5, y + r * 0.2); g.fill(); g.lineWidth = r * 0.18; g.strokeStyle = c; g.beginPath(); g.moveTo(x - r * 0.2, y - r * 1.1); g.quadraticCurveTo(x - r * 1.2, y - r * 2.0, x - r * 1.5, y - r * 2.6); g.moveTo(x + r * 0.2, y - r * 1.1); g.quadraticCurveTo(x + r * 1.2, y - r * 2.0, x + r * 1.5, y - r * 2.6); g.stroke(); },
  topknot(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x - r * 0.1, y - r * 1.1, r * 0.35, 0, 7); g.fill(); },
};
export const PEOPLE = {        // headwear + rim colour (Yi = red rim, always)
  YI: { hat: 'helmet', rim: C.red }, KING: { hat: 'royal', rim: C.gold }, OFFICIAL: { hat: 'gat', rim: null }, SOLDIER: { hat: 'helmet', rim: null },
  SAMURAI: { hat: 'kabuto', rim: null }, WON: { hat: 'helmet', rim: C.paper3 }, SON: { hat: 'topknot', rim: null }, YOUNG: { hat: 'topknot', rim: C.red }, SAILOR: { hat: 'topknot', rim: null },
};
export function person(g, who, x, y, s, pose, o = {}) {
  const spec = PEOPLE[who] || PEOPLE.SOLDIER, f = o.facing ?? 1, color = o.color || C.ink, rim = o.rim === undefined ? spec.rim : o.rim;
  const draw = (col, dx, dy) => { g.save(); g.translate(dx, dy); const q = character(g, x, y, s, pose, { sil: col, facing: f, t: 0, cape: !!o.cape, wind: o.wind ?? 1, noHair: true }); const r = 30 * s; HAT[spec.hat]?.(g, q.head[0], q.head[1], r, col);
    if (o.sword != null) sword(g, q.hF[0], q.hF[1], o.sword, 200 * s / 1.6, s * 0.9, { sil: col }); if (o.spear) { g.strokeStyle = col; g.lineWidth = 7 * s / 1.5; g.beginPath(); g.moveTo(q.hF[0], q.hF[1] + 80 * s); g.lineTo(q.hF[0] + 10 * s * f, q.hF[1] - 230 * s); g.stroke(); }
    if (o.drumstick) { g.strokeStyle = col; g.lineWidth = 8; g.beginPath(); g.moveTo(q.hF[0], q.hF[1]); g.lineTo(q.hF[0] + 40 * f, q.hF[1] - 30); g.stroke(); }
    g.restore(); return q; };
  if (o.shadowLen) { g.save(); g.translate(x, y); g.transform(1, 0, o.shadowSkew ?? -1.4, o.shadowLen, 0, 0); g.translate(-x, -y); g.globalAlpha = 0.28; draw(C.ink, 0, 0); g.restore(); }   // long cast shadow
  if (rim) draw(rim, -4, -3);
  return draw(color, 0, 0);
}


// big profile bust (portraits): shoulders, neck, head with nose bump, period headwear; optional rim
export function bust(g, who, x, y, r, o = {}) {
  const spec = PEOPLE[who] || PEOPLE.SOLDIER, f = o.facing ?? 1, rim = o.rim === undefined ? spec.rim : o.rim;
  const draw = (c, dx, dy) => { g.save(); g.translate(x + dx, y + dy); g.scale(f, 1); g.fillStyle = c;
    g.beginPath(); g.moveTo(-r * 2.6, r * 3.2); g.quadraticCurveTo(-r * 2.4, r * 1.55, -r * 0.9, r * 1.35); g.lineTo(r * 0.9, r * 1.35); g.quadraticCurveTo(r * 2.4, r * 1.55, r * 2.6, r * 3.2); g.fill();   // shoulders
    g.fillRect(-r * 0.42, r * 0.5, r * 0.84, r * 1.0);                                                                                                                           // neck
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();                                                                                                                                  // head
    g.beginPath(); g.moveTo(r * 0.92, -r * 0.15); g.lineTo(r * 1.2, r * 0.18); g.lineTo(r * 0.92, r * 0.3); g.fill();                                                            // nose
    if (spec.hat === 'gat' || who === 'OFFICIAL') { g.beginPath(); g.moveTo(r * 0.55, r * 0.6); g.lineTo(r * 0.75, r * 1.2); g.lineTo(r * 0.25, r * 0.8); g.fill(); }           // beard
    HAT[spec.hat]?.(g, 0, 0, r, c);
    if (who === 'YI' || who === 'SOLDIER' || who === 'WON') { g.beginPath(); g.moveTo(-r * 2.3, r * 2.2); g.lineTo(-r * 1.6, r * 1.45); g.lineTo(r * 1.6, r * 1.45); g.lineTo(r * 2.3, r * 2.2); g.lineTo(r * 2.0, r * 2.35); g.lineTo(-r * 2.0, r * 2.35); g.fill(); }  // pauldrons
    g.restore(); };
  if (rim) draw(rim, -r * 0.05, -r * 0.04);
  draw(o.color || C.ink, 0, 0);
}

// ---------- props ----------
export const PROPS = {
  willow(g, x, y, s = 1) { g.strokeStyle = C.ink; g.lineCap = 'round'; g.lineWidth = 26 * s; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 20 * s, y - 200 * s, x + 10 * s, y - 330 * s); g.stroke(); g.lineWidth = 3 * s; for (let i = 0; i < 26; i++) { const bx = x + (i - 13) * 18 * s, by = y - 320 * s + Math.abs(i - 13) * 6 * s; g.beginPath(); g.moveTo(x + 10 * s, y - 330 * s); g.quadraticCurveTo(bx, by - 40 * s, bx + 6 * s, by + 220 * s); g.stroke(); } },
  pine(g, x, y, s = 1) { g.fillStyle = C.ink; g.fillRect(x - 8 * s, y - 120 * s, 16 * s, 120 * s); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - (110 - i * 20) * s, y - (90 + i * 55) * s); g.lineTo(x, y - (160 + i * 55) * s); g.lineTo(x + (110 - i * 20) * s, y - (90 + i * 55) * s); g.fill(); } },
  palace(g, x, y, s = 1) { g.fillStyle = C.ink; g.fillRect(x - 300 * s, y - 40 * s, 600 * s, 40 * s); for (const c of [-220, -110, 0, 110, 220]) g.fillRect(x + c * s - 10 * s, y - 220 * s, 20 * s, 180 * s); g.beginPath(); g.moveTo(x - 380 * s, y - 210 * s); g.quadraticCurveTo(x - 300 * s, y - 250 * s, x - 260 * s, y - 300 * s); g.lineTo(x + 260 * s, y - 300 * s); g.quadraticCurveTo(x + 300 * s, y - 250 * s, x + 380 * s, y - 210 * s); g.lineTo(x + 300 * s, y - 230 * s); g.lineTo(x - 300 * s, y - 230 * s); g.fill(); g.fillRect(x - 200 * s, y - 340 * s, 400 * s, 40 * s); g.beginPath(); g.moveTo(x - 280 * s, y - 330 * s); g.quadraticCurveTo(x - 200 * s, y - 360 * s, x - 160 * s, y - 400 * s); g.lineTo(x + 160 * s, y - 400 * s); g.quadraticCurveTo(x + 200 * s, y - 360 * s, x + 280 * s, y - 330 * s); g.fill(); },
  horse(g, x, y, s = 1, f = 1, k = 0) { g.save(); g.translate(x, y); g.scale(s * f, s); g.fillStyle = C.ink; g.beginPath(); g.ellipse(0, -150, 120, 50, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(80, -170); g.lineTo(150, -280); g.lineTo(200, -270); g.lineTo(190, -240); g.lineTo(130, -150); g.fill(); g.beginPath(); g.moveTo(-110, -160); g.quadraticCurveTo(-180, -120, -170, -60); g.lineTo(-150, -110); g.fill(); g.lineWidth = 16; g.strokeStyle = C.ink; g.lineCap = 'round'; const a = Math.sin(k * 6) * 0.5; for (const [lx, ph] of [[-80, 0], [-50, 1], [60, 2], [90, 3]]) { g.beginPath(); g.moveTo(lx, -120); g.lineTo(lx + Math.sin(a + ph) * 30, -60); g.lineTo(lx + Math.sin(a + ph) * 20, 0); g.stroke(); } g.restore(); },
  drum(g, x, y, s = 1) { g.fillStyle = C.ink; g.fillRect(x - 10 * s, y - 220 * s, 20 * s, 220 * s); g.fillRect(x - 90 * s, y - 220 * s, 20 * s, 220 * s); g.beginPath(); g.ellipse(x - 40 * s, y - 230 * s, 80 * s, 90 * s, 0, 0, 7); g.fill(); g.fillStyle = C.red; g.beginPath(); g.ellipse(x - 40 * s, y - 230 * s, 60 * s, 70 * s, 0, 0, 7); g.fill(); },
  chains(g, x, y, s = 1) { g.strokeStyle = C.ink; g.lineWidth = 8 * s; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(x + i * 26 * s, y + Math.sin(i * 0.6) * 20 * s, 16 * s, 10 * s, i % 2 ? 0 : 1.2, 0, 7); g.stroke(); } },
  rail(g, x, y, s = 1) { g.fillStyle = C.ink; g.fillRect(-W(), y - 20, W() * 3, 26); g.fillRect(-W(), y - 120, W() * 3, 14); for (let px = -W(); px < W() * 2; px += 110) g.fillRect(px, y - 120, 14, 110); },
  flag(g, x, y, s = 1, f = 1, t = 0, c = C.red) { g.fillStyle = C.ink; g.fillRect(x, y - 360 * s, 8 * s, 360 * s); g.fillStyle = c; g.beginPath(); g.moveTo(x + 8 * s, y - 350 * s); for (let i = 0; i <= 6; i++) g.lineTo(x + 8 * s + i * 30 * s, y - 350 * s + Math.sin(step3(t) * 6 + i) * 8 * s); g.lineTo(x + 188 * s, y - 250 * s); for (let i = 6; i >= 0; i--) g.lineTo(x + 8 * s + i * 30 * s, y - 250 * s + Math.sin(step3(t) * 6 + i) * 8 * s); g.fill(); },
  mountains(g, x, y, s = 1, c = C.ink2) { g.fillStyle = c; g.beginPath(); g.moveTo(-W(), y); for (let i = 0; i <= 14; i++) g.lineTo(-W() + i * W() * 3 / 14, y - (120 + ((i * 53) % 7) * 40) * s); g.lineTo(W() * 2, y); g.fill(); },
  cannon(g, x, y, s = 1, f = 1) { g.save(); g.translate(x, y); g.scale(s * f, s); g.fillStyle = C.ink; g.beginPath(); g.moveTo(-60, -50); g.lineTo(90, -70); g.lineTo(90, -40); g.lineTo(-60, -20); g.fill(); g.beginPath(); g.arc(-20, -10, 26, 0, 7); g.fill(); g.restore(); },
  wall(g, x, y, s = 1) { g.fillStyle = C.ink; g.fillRect(x - 500 * s, y - 220 * s, 1000 * s, 220 * s); for (let i = -10; i <= 10; i++) g.fillRect(x + i * 48 * s - 15 * s, y - 260 * s, 30 * s, 40 * s); g.fillStyle = C.paper3; g.beginPath(); g.arc(x, y, 80 * s, Math.PI, 0); g.fill(); },
};

// ---------- the map (stylised; coordinates in 0..1000 map space) ----------
export const LL = (lon, lat) => [(lon - 122) * 70, (43 - lat) * 84];
const ll = (pts) => pts.map(([a, b]) => LL(a, b));
export const KOREA = ll([[124.3, 39.9], [125.5, 40.6], [126.8, 41.6], [128.1, 41.4], [128.3, 42.0], [129.7, 42.4], [130.7, 42.3], [129.8, 41.8], [129.2, 40.7], [128.4, 40.2], [127.6, 39.8], [127.4, 39.2], [128.4, 38.6], [128.9, 37.8], [129.4, 36.8], [129.4, 36.0], [129.4, 35.5], [129.0, 35.1], [128.6, 34.95], [128.3, 34.85], [127.9, 34.75], [127.6, 34.65], [127.3, 34.55], [126.9, 34.4], [126.5, 34.3], [126.3, 34.6], [126.4, 35.0], [126.5, 35.6], [126.7, 36.0], [126.2, 36.6], [126.1, 36.85], [126.8, 37.0], [126.6, 37.5], [126.2, 37.75], [125.4, 37.9], [124.8, 38.15], [125.2, 38.7], [125.0, 39.1], [124.6, 39.6]]);
export const JAPAN = [ll([[129.6, 33.4], [130.4, 33.85], [131.0, 33.95], [131.7, 33.5], [131.9, 32.9], [131.5, 31.9], [131.1, 31.3], [130.6, 31.2], [130.2, 31.4], [130.2, 32.1], [129.8, 32.7]]),
  ll([[130.95, 34.05], [131.4, 34.5], [132.5, 35.4], [133.5, 35.6], [135.0, 35.7], [136.5, 36.4], [137.2, 36.9], [137.5, 34.6], [136.0, 33.6], [135.2, 34.3], [134.0, 34.6], [133.0, 34.3], [132.0, 33.9]]),
  ll([[129.2, 34.7], [129.45, 34.6], [129.35, 34.2], [129.2, 34.3]]), ll([[132.6, 33.9], [134.6, 34.2], [134.4, 33.3], [133.0, 32.8]])];
export const CHINA = ll([[115, 44], [131.2, 44], [130.7, 42.3], [129.7, 42.4], [128.3, 42.0], [128.1, 41.4], [126.8, 41.6], [125.5, 40.6], [124.3, 39.9], [123.0, 39.6], [121.5, 38.8], [121.0, 39.5], [122.0, 40.6], [118, 39.5], [115, 39]]);
export const PLACES = { seoul: LL(127.0, 37.57), busan: LL(129.04, 35.1), okpo: LL(128.69, 34.9), sacheon: LL(128.06, 35.0), hansan: LL(128.48, 34.77), myeongnyang: LL(126.31, 34.57), noryang: LL(127.87, 34.94), jeolla: LL(126.9, 35.2), pyongyang: LL(125.75, 39.03), uiju: LL(124.53, 40.2), japan: LL(130.8, 32.7), tsushima: LL(129.3, 34.4), china: LL(123.2, 41.6), chilcheollyang: LL(128.52, 34.95), yeosu: LL(127.66, 34.76), frontier: LL(130.2, 42.2) };
export const JEOLLA = ll([[126.3, 36.05], [127.85, 36.05], [127.9, 34.75], [126.3, 34.3]]);
export function drawMap(g, t, o = {}) {
  const z = o.z ?? 1, cx = o.cx ?? 420, cy = o.cy ?? 500, sc = (H() * 0.95 / 700) * z;
  const M = ([x, y]) => [W() / 2 + (x - cx) * sc, H() / 2 + (y - cy) * sc];
  g.fillStyle = C.paper2; g.fillRect(0, 0, W(), H()); paperOver(g, 0.5);
  g.save(); g.strokeStyle = 'rgba(42,36,32,.18)'; g.lineWidth = 2; for (let i = 0; i <= 10; i++) { const [x0, y0] = M([i * 120 - 100, -200]), [x1, y1] = M([i * 120 - 100, 1300]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); const [a0, b0] = M([-200, i * 120 - 100]), [a1, b1] = M([1300, i * 120 - 100]); g.beginPath(); g.moveTo(a0, b0); g.lineTo(a1, b1); g.stroke(); } g.restore();
  const land = (pts, fill) => { const p = pts.map(M); g.save(); g.translate(8, 10); pathOf(g, p); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); g.restore(); pathOf(g, p); g.fillStyle = fill; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 3; g.stroke(); };
  land(CHINA, C.paper3); land(KOREA, '#f4ecd8'); JAPAN.forEach((j) => land(j, C.paper3));
  if (o.region === 'jeolla') { const p = JEOLLA.map(M); g.save(); pathOf(g, KOREA.map(M)); g.clip(); pathOf(g, p); g.fillStyle = 'rgba(200,32,42,.28)'; g.fill(); halftone(g, 0, 0, W(), H(), 'rgba(200,32,42,.35)', 12, 1); g.restore(); }
  if (o.labels !== false) { text(g, 'JOSEON', ...M(LL(127.6, 38.6)), { size: 30 * z, color: 'rgba(12,10,10,.5)', font: FONTS.ui, weight: 900, spacing: 10 }); text(g, 'JAPAN', ...M(LL(132.6, 35.0)), { size: 26 * z, color: 'rgba(12,10,10,.5)', font: FONTS.ui, weight: 900, spacing: 8 }); text(g, 'MING CHINA', ...M(LL(124.2, 42.3)), { size: 24 * z, color: 'rgba(12,10,10,.45)', font: FONTS.ui, weight: 900, spacing: 6 }); }
  waves(g, M(LL(122, 33.6))[1], t, 'rgba(12,10,10,.25)', { rows: 4, gap: 40 * z, w: 3 });
  return M;
}
export { pathOf };
