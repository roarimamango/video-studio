// _kit.js — psychedelic gothic kit for the Poe video: chaos camera, misregistration, 2D cut-out characters & props.
import { E, ease, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { character, P as POSE } from '/projects/king-arthur-anime/scenes/shots/anime.js';
import { scrap, halftone, paperOver } from '/projects/yi-sun-sin/scenes/_kit.js';
export { scrap, halftone, paperOver, POSE };

export const W = () => E.W, H = () => E.H;
export const K = { ink: '#07040c', violet: '#6a1fd0', violet2: '#2a0a5a', deep: '#12042a', acid: '#c8ff3a', magenta: '#ff2e9a', blood: '#e0103a', bone: '#f4ffe8', teal: '#20e0c8', amber: '#ffb020' };
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const twos = (t) => Math.floor(t * 12) / 12;

// chaos camera: speed/roll/zoom jump every L seconds
const SPEEDS = [3.2, -2.0, 0.25, 1.4, -0.8, 4.5], ROLLS = [0, Math.PI, Math.PI / 2, -Math.PI / 2, 0.35, Math.PI * 1.15], ZOOMS = [1, 1.35, 0.85, 1.7, 1.1];
export function chaos(t, seed = 0, L = 0.25) {
  const n = Math.floor(t / L); let pos = 0;
  for (let i = 0; i < n; i++) pos += SPEEDS[Math.floor(hash(i + seed) * SPEEDS.length)] * L;
  pos += SPEEDS[Math.floor(hash(n + seed) * SPEEDS.length)] * (t - n * L);
  const r0 = ROLLS[Math.floor(hash(n - 1 + seed * 3) * ROLLS.length)], r1 = ROLLS[Math.floor(hash(n + seed * 3) * ROLLS.length)], k = ease.out(clamp((t - n * L) / 0.1));
  const z0 = ZOOMS[Math.floor(hash(n - 1 + seed * 7) * ZOOMS.length)], z1 = ZOOMS[Math.floor(hash(n + seed * 7) * ZOOMS.length)];
  return { pos, roll: lerp(r0, r1, k), zoom: lerp(z0, z1, k), seg: n };
}
// steady camera: constant push with a slow drift (never stops)
export const steady = (t, seed = 0, rate = 0.04) => ({ pos: t * 0.6, roll: Math.sin(t * 0.5 + seed) * 0.04, zoom: 1 + rate * t, seg: 0 });
export const camFor = (p, t) => (p.chaos ? chaos(t, p.seed || 1, p.L || 0.25) : steady(t, p.seed || 1, p.rate ?? 0.04));
export const withCam = (g, c, fn) => { g.save(); g.translate(W() / 2, H() / 2); g.rotate(c.roll); g.scale(c.zoom, c.zoom); g.translate(-W() / 2, -H() / 2); fn(); g.restore(); };
export function misreg(g, t, draw, o = {}) { const d = o.d ?? 9, k = Math.floor(t * 12); for (const [col, dx, dy] of [[o.c1 || K.magenta, -d + hash(k) * 4, d * 0.4], [o.c2 || K.acid, d - hash(k + 3) * 4, -d * 0.3]]) { g.save(); g.translate(dx, dy); g.globalAlpha *= 0.85; draw(col); g.restore(); } draw(o.main || K.ink); }
export const finish = (g, t) => { paperOver(g, 0.2); g.save(); g.globalAlpha = 0.16; halftone(g, 0, 0, W(), H(), K.ink, 12, 0.9, -1); g.restore(); };

// ---------- backgrounds ----------
export function spiralBG(g, t, a, b, rays = 18, speed = 0.6) { g.save(); g.translate(W() / 2, H() / 2); g.rotate(twos(t) * speed); for (let i = 0; i < rays; i++) { g.fillStyle = i % 2 ? a : b; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 12; k++) { const r = k * 160, ang = (i / rays) * Math.PI * 2 + k * 0.18; g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } for (let k = 12; k >= 0; k--) { const r = k * 160, ang = ((i + 1) / rays) * Math.PI * 2 + k * 0.18; g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } g.fill(); } g.restore(); }
export function ringsBG(g, t, a, b) { const k = (twos(t) * 120) % 160; for (let r = 2400 + k; r > 0; r -= 80) { g.fillStyle = Math.floor((r - k) / 80) % 2 ? a : b; g.beginPath(); g.arc(W() / 2, H() / 2, r, 0, 7); g.fill(); } }
export function checkerBG(g, t, a, b) { const hy = H() * 0.42; g.fillStyle = b; g.fillRect(0, 0, W(), H()); const off = (twos(t) * 0.8) % 1; for (let j = 0; j < 16; j++) { const v0 = (j + off) / 16, v1 = (j + 1 + off) / 16, y0 = hy + Math.pow(v0, 2.2) * (H() - hy + 100), y1 = hy + Math.pow(v1, 2.2) * (H() - hy + 100); for (let i = -14; i < 14; i++) { if ((i + j) % 2) continue; const x = (u, y) => W() / 2 + u * 160 * (y - hy) / 60; g.fillStyle = a; g.beginPath(); g.moveTo(x(i, y0), y0); g.lineTo(x(i + 1, y0), y0); g.lineTo(x(i + 1, y1), y1); g.lineTo(x(i, y1), y1); g.fill(); } } }
export const BGS = {
  spiral: (g, t, p) => spiralBG(g, t, p.c1 || K.violet, p.c2 || K.deep, 18, p.spin ?? 0.6),
  spiralAcid: (g, t, p) => spiralBG(g, t, K.acid, K.ink, 20, p.spin ?? 1.2),
  rings: (g, t, p) => ringsBG(g, t, p.c1 || K.magenta, p.c2 || K.violet2),
  checker: (g, t, p) => { const gr = g.createLinearGradient(0, 0, 0, H() * 0.45); gr.addColorStop(0, K.deep); gr.addColorStop(1, K.violet); g.fillStyle = gr; g.fillRect(0, 0, W(), H()); checkerBG(g, t, p.c1 || K.acid, p.c2 || K.ink); },
  void: (g, t, p) => { const gr = g.createRadialGradient(W() / 2, H() * 0.45, 50, W() / 2, H() / 2, W() * 0.8); gr.addColorStop(0, p.c1 || K.violet); gr.addColorStop(1, K.ink); g.fillStyle = gr; g.fillRect(0, 0, W(), H()); },
  blood: (g, t, p) => { g.fillStyle = K.blood; g.fillRect(0, 0, W(), H()); halftone(g, 0, 0, W(), H(), '#5a0018', 14, 0.8); },
  bone: (g, t, p) => { g.fillStyle = K.bone; g.fillRect(0, 0, W(), H()); halftone(g, 0, 0, W(), H(), 'rgba(106,31,208,.25)', 14, 0.8, -1); },
};

// ---------- characters ----------
const HEAD = {
  poe(g, x, y, r, c, f) { g.fillStyle = c; for (const [hx, hy, rr] of [[-0.9, -0.1, 0.55], [0.85, -0.3, 0.6], [-0.6, -0.85, 0.5], [0.4, -1.0, 0.6], [1.05, 0.25, 0.36]]) { g.beginPath(); g.arc(x + hx * r * f, y + hy * r, rr * r, 0, 7); g.fill(); } g.beginPath(); g.moveTo(x + 0.2 * r * f, y + 0.45 * r); g.quadraticCurveTo(x + 0.75 * r * f, y + 0.3 * r, x + 1.05 * r * f, y + 0.5 * r); g.lineTo(x + 0.4 * r * f, y + 0.6 * r); g.fill(); },
  tophat(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y - r * 0.75, r * 1.5, r * 0.22, 0, 0, 7); g.fill(); g.fillRect(x - r * 0.85, y - r * 2.2, r * 1.7, r * 1.5); },
  bonnet(g, x, y, r, c, f) { g.fillStyle = c; g.beginPath(); g.arc(x - 0.15 * r * f, y - 0.15 * r, r * 1.25, Math.PI * 0.95, Math.PI * 2.05); g.fill(); g.beginPath(); g.moveTo(x - 0.6 * r * f, y + 0.6 * r); g.lineTo(x - 0.3 * r * f, y + 1.6 * r); g.lineTo(x - 0.1 * r * f, y + 0.7 * r); g.fill(); },
  shako(g, x, y, r, c) { g.fillStyle = c; g.fillRect(x - r * 0.95, y - r * 1.9, r * 1.9, r * 1.2); g.fillRect(x - r * 1.2, y - r * 0.8, r * 2.4, r * 0.25); g.beginPath(); g.arc(x, y - r * 2.1, r * 0.35, 0, 7); g.fill(); },
  bun(g, x, y, r, c, f) { g.fillStyle = c; g.beginPath(); g.arc(x - 0.7 * r * f, y - 0.6 * r, r * 0.5, 0, 7); g.fill(); },
  none() {},
};
export const PEOPLE = { POE: { head: 'poe', dress: false }, GENT: { head: 'tophat' }, VIRGINIA: { head: 'bonnet', dress: true }, WOMAN: { head: 'bun', dress: true }, SOLDIER: { head: 'shako' }, MAN: { head: 'none' }, BABY: { head: 'none', kid: true } };
export function person(g, who, x, y, s, pose, o = {}) {
  const spec = PEOPLE[who] || PEOPLE.MAN, f = o.facing ?? 1;
  const draw = (col) => { const q = character(g, x, y, s * (spec.kid ? 0.7 : 1), pose, { sil: col, facing: f, t: 0, noHair: true, cape: !!o.cape, wind: 1.4 }); const r = 30 * s * (spec.kid ? 0.7 : 1);
    if (spec.dress) { g.fillStyle = col; g.beginPath(); g.moveTo(q.hip[0] - 18 * s, q.hip[1] - 10 * s); g.lineTo(q.hip[0] + 18 * s, q.hip[1] - 10 * s); g.lineTo(q.hip[0] + 62 * s, y); g.lineTo(q.hip[0] - 62 * s, y); g.fill(); }
    if (who === 'POE' || who === 'GENT') { g.fillStyle = col; g.beginPath(); g.moveTo(q.sh[0] - 16 * s, q.sh[1]); g.lineTo(q.sh[0] + 16 * s, q.sh[1]); g.lineTo(q.hip[0] + 26 * s * f, q.hip[1] + 60 * s); g.lineTo(q.hip[0] - 30 * s * f, q.hip[1] + 60 * s); g.fill(); }   // frock coat
    HEAD[spec.head](g, q.head[0], q.head[1], r, col, f);
    if (o.prop === 'bottle') { g.fillStyle = col; g.fillRect(q.hF[0] - 6 * s, q.hF[1] - 40 * s, 12 * s, 40 * s); g.fillRect(q.hF[0] - 3 * s, q.hF[1] - 55 * s, 6 * s, 16 * s); }
    if (o.prop === 'quill') { g.strokeStyle = col; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(q.hF[0], q.hF[1]); g.quadraticCurveTo(q.hF[0] + 20 * s, q.hF[1] - 50 * s, q.hF[0] + 50 * s, q.hF[1] - 80 * s); g.stroke(); }
    if (o.prop === 'paper') { g.fillStyle = col; g.fillRect(q.hF[0] - 20 * s, q.hF[1] - 30 * s, 40 * s, 50 * s); }
    return q; };
  let q; if (o.flat) q = draw(o.color || K.ink); else misreg(g, o.t || 0, (col) => { q = draw(col); }, { d: o.d ?? 7, main: o.color || K.ink });
  return q;   // the last draw is the main colour
}
// big bust of Poe (front), from the sampler
export function poeBust(g, x, y, s, col, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  g.beginPath(); g.moveTo(-210, 330); g.quadraticCurveTo(-200, 170, -70, 140); g.lineTo(70, 140); g.quadraticCurveTo(200, 170, 210, 330); g.fill(); g.fillRect(-36, 70, 72, 90);
  g.beginPath(); g.ellipse(0, -10, 88, 112, 0, 0, 7); g.fill();
  for (const [hx, hy, r] of [[-86, -10, 52], [88, -26, 58], [-60, -80, 46], [40, -96, 56], [100, 20, 34], [-96, 40, 30]]) { g.beginPath(); g.arc(hx, hy, r, 0, 7); g.fill(); }
  if (!o.flat) { g.fillStyle = o.eyes || K.acid; for (const ex of [-32, 32]) { g.beginPath(); g.ellipse(ex, -6, 16, o.closed ? 2 : 6, 0, 0, 7); g.fill(); } g.fillStyle = o.cravat || K.bone; g.beginPath(); g.moveTo(-50, 150); g.lineTo(0, 175); g.lineTo(50, 150); g.lineTo(40, 195); g.lineTo(0, 178); g.lineTo(-40, 195); g.fill(); }
  g.fillStyle = o.flat ? col : K.ink; g.beginPath(); g.moveTo(-46, 48); g.quadraticCurveTo(0, 26, 46, 48); g.quadraticCurveTo(30, 62, 0, 50); g.quadraticCurveTo(-30, 62, -46, 48); g.fill();
  g.restore();
}
export function raven(g, x, y, s, t, col, o = {}) {
  const flap = o.perched ? 0 : Math.sin(twos(t) * 18); g.save(); g.translate(x, y); g.scale(s * (o.facing ?? 1), s); g.fillStyle = col;
  g.beginPath(); g.ellipse(0, 0, 120, 55, -0.1, 0, 7); g.fill(); g.beginPath(); g.arc(110, -35, 40, 0, 7); g.fill();
  g.beginPath(); g.moveTo(140, -42); g.lineTo(215, -22); g.lineTo(140, -20); g.fill(); g.beginPath(); g.moveTo(-120, 0); g.lineTo(-230, -30); g.lineTo(-220, 30); g.fill();
  if (o.perched) { g.beginPath(); g.moveTo(-60, -20); g.lineTo(-150, 30); g.lineTo(40, 40); g.fill(); g.lineWidth = 8; g.strokeStyle = col; for (const lx of [-10, 30]) { g.beginPath(); g.moveTo(lx, 50); g.lineTo(lx, 110); g.stroke(); } }
  else for (const side of [-1, 1]) { g.beginPath(); g.moveTo(-40, -10); g.lineTo(-170, -10 - 190 * flap * side * 0.5 - 150 * (side > 0 ? 1 : 0.6)); g.lineTo(-60, -40 - 120 * flap); g.lineTo(40, -20); g.fill(); }
  if (o.eye !== false) { g.fillStyle = K.acid; g.beginPath(); g.arc(122, -42, 9, 0, 7); g.fill(); } g.restore();
}
export function heart(g, x, y, s, t, col) {
  const ph = (t * 1.6) % 1, beat = 1 + 0.16 * Math.exp(-((ph - 0.05) ** 2) / 0.002) + 0.1 * Math.exp(-((ph - 0.22) ** 2) / 0.002);
  g.save(); g.translate(x, y); g.scale(s * beat, s * beat); g.fillStyle = col;
  g.beginPath(); g.moveTo(0, 170); g.bezierCurveTo(-210, 40, -170, -120, -40, -90); g.bezierCurveTo(-10, -84, 10, -60, 20, -40); g.bezierCurveTo(60, -130, 220, -90, 160, 40); g.bezierCurveTo(120, 110, 40, 140, 0, 170); g.fill();
  g.lineWidth = 34; g.strokeStyle = col; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, -80); g.quadraticCurveTo(-30, -170, 40, -190); g.stroke(); g.beginPath(); g.moveTo(40, -60); g.quadraticCurveTo(70, -160, 130, -150); g.stroke(); g.restore();
}
export function eye(g, x, y, r, t, o = {}) { const look = Math.sin(t * 2 + x) * r * 0.25; g.fillStyle = K.bone; g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, 7); g.fill(); g.fillStyle = o.iris || K.acid; g.beginPath(); g.arc(x + look, y, r * 0.7, 0, 7); g.fill(); g.fillStyle = K.ink; g.beginPath(); g.arc(x + look, y, r * 0.32, 0, 7); g.fill(); g.strokeStyle = K.ink; g.lineWidth = r * 0.12; g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, 7); g.stroke(); }

// ---------- props ----------
export const PROPS = {
  tavern(g, x, y, s = 1, col = K.ink) { g.fillStyle = col; g.fillRect(x - 300 * s, y - 520 * s, 600 * s, 520 * s); g.beginPath(); g.moveTo(x - 340 * s, y - 520 * s); g.lineTo(x, y - 700 * s); g.lineTo(x + 340 * s, y - 520 * s); g.fill(); g.fillStyle = K.amber; for (const [wx, wy] of [[-200, -420], [120, -420], [-200, -260], [120, -260]]) g.fillRect(x + wx * s, y + wy * s, 80 * s, 100 * s); g.fillStyle = K.magenta; g.fillRect(x - 50 * s, y - 180 * s, 100 * s, 180 * s); g.fillStyle = col; g.fillRect(x + 300 * s, y - 470 * s, 120 * s, 10 * s); g.fillRect(x + 340 * s, y - 470 * s, 70 * s, 90 * s); },
  ballot(g, x, y, s = 1, col = K.ink) { g.fillStyle = col; g.fillRect(x - 70 * s, y - 120 * s, 140 * s, 120 * s); g.fillStyle = K.acid; g.fillRect(x - 40 * s, y - 120 * s, 80 * s, 10 * s); text(g, 'VOTE', x, y - 60 * s, { size: 30 * s, color: K.bone, font: FONTS.ui, weight: 900 }); },
  grave(g, x, y, s = 1, col = K.ink) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 90 * s, y); g.lineTo(x - 90 * s, y - 200 * s); g.arc(x, y - 200 * s, 90 * s, Math.PI, 0); g.lineTo(x + 90 * s, y); g.fill(); g.fillStyle = K.violet; g.fillRect(x - 10 * s, y - 250 * s, 20 * s, 90 * s); g.fillRect(x - 40 * s, y - 220 * s, 80 * s, 20 * s); },
  roses(g, x, y, s = 1) { for (let i = 0; i < 3; i++) { g.strokeStyle = K.teal; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(x + i * 18 * s, y); g.lineTo(x + i * 18 * s - 10 * s, y - 90 * s); g.stroke(); g.fillStyle = K.blood; g.beginPath(); g.arc(x + i * 18 * s - 10 * s, y - 95 * s, 14 * s, 0, 7); g.fill(); } g.fillStyle = K.amber; g.fillRect(x + 70 * s, y - 80 * s, 26 * s, 80 * s); g.fillRect(x + 77 * s, y - 104 * s, 12 * s, 26 * s); },
  cards(g, x, y, s = 1, col, t = 0) { for (let i = 0; i < 6; i++) { const a = twos(t) * 2 + i; g.save(); g.translate(x + Math.cos(a) * 140 * s, y + Math.sin(a * 1.3) * 90 * s); g.rotate(a); g.fillStyle = K.bone; g.fillRect(-32 * s, -46 * s, 64 * s, 92 * s); g.fillStyle = i % 2 ? K.blood : K.ink; text(g, ['A', 'K', 'Q', 'J', '7', '2'][i], 0, 0, { size: 40 * s, color: i % 2 ? K.blood : K.ink, font: FONTS.serif, weight: 900 }); g.restore(); } },
  coins(g, x, y, s = 1, col, t = 0) { for (let i = 0; i < 10; i++) { const k = (twos(t) * 0.7 + i * 0.1) % 1; g.fillStyle = K.amber; g.beginPath(); g.ellipse(x + (i - 5) * 30 * s, y - 300 * s + k * 400 * s, 16 * s, 16 * s * Math.abs(Math.sin(k * 9 + i)), 0, 0, 7); g.fill(); } },
  bed(g, x, y, s = 1, col = K.ink) { g.fillStyle = col; g.fillRect(x - 260 * s, y - 120 * s, 520 * s, 60 * s); g.fillRect(x - 260 * s, y - 260 * s, 30 * s, 260 * s); g.fillRect(x + 230 * s, y - 180 * s, 30 * s, 180 * s); g.fillStyle = K.bone; g.fillRect(x - 220 * s, y - 150 * s, 100 * s, 40 * s); },
  window(g, x, y, s = 1) { g.fillStyle = K.deep; g.fillRect(x - 160 * s, y - 520 * s, 320 * s, 380 * s); g.fillStyle = K.bone; g.beginPath(); g.arc(x + 60 * s, y - 430 * s, 40 * s, 0, 7); g.fill(); g.fillStyle = K.ink; g.fillRect(x - 8 * s, y - 520 * s, 16 * s, 380 * s); g.fillRect(x - 160 * s, y - 340 * s, 320 * s, 16 * s); g.strokeStyle = K.ink; g.lineWidth = 20 * s; g.strokeRect(x - 160 * s, y - 520 * s, 320 * s, 380 * s); },
  desk(g, x, y, s = 1, col = K.ink) { g.fillStyle = col; g.fillRect(x - 200 * s, y - 130 * s, 400 * s, 22 * s); g.fillRect(x - 180 * s, y - 110 * s, 18 * s, 110 * s); g.fillRect(x + 162 * s, y - 110 * s, 18 * s, 110 * s); g.fillStyle = K.bone; g.fillRect(x - 60 * s, y - 140 * s, 120 * s, 10 * s); g.fillStyle = K.amber; g.beginPath(); g.arc(x + 130 * s, y - 170 * s, 14 * s, 0, 7); g.fill(); g.fillRect(x + 124 * s, y - 160 * s, 12 * s, 30 * s); },
  boat(g, x, y, s = 1, col = K.ink) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 300 * s, y - 60 * s); g.lineTo(x + 320 * s, y - 60 * s); g.lineTo(x + 240 * s, y); g.lineTo(x - 260 * s, y); g.fill(); g.fillRect(x - 6 * s, y - 360 * s, 12 * s, 300 * s); g.fillRect(x - 180 * s, y - 140 * s, 240 * s, 80 * s); g.fillRect(x + 100 * s, y - 220 * s, 30 * s, 160 * s); },
  stage(g, x, y, s = 1) { for (const sd of [-1, 1]) { g.fillStyle = K.blood; g.beginPath(); g.moveTo(x + sd * W() * 0.7, -50); g.lineTo(x + sd * W() * 0.3, -50); g.quadraticCurveTo(x + sd * W() * 0.36, H() * 0.4, x + sd * W() * 0.42, H()); g.lineTo(x + sd * W() * 0.7, H()); g.fill(); } g.fillStyle = K.ink; g.fillRect(-W(), y, W() * 3, H()); g.fillStyle = K.amber; g.fillRect(-W(), y - 6, W() * 3, 8); },
};
// ransom-note text
export function ransom(g, t, lines, y0, size0, at = 0, o = {}) {
  const r = rng(o.seed || 9); let n = 0;
  lines.forEach((str, li) => { const size = li === (o.big ?? 1) ? size0 * 1.6 : size0, y = y0 + li * size0 * 1.75, letters = str.split(''), tot = letters.length * size * 0.66; let x = W() / 2 - tot / 2;
    letters.forEach((ch) => { const st = at + n * 0.03; n++; if (ch === ' ' || t < st) { x += size * 0.66; return; } const fill = [K.acid, K.magenta, K.bone, K.violet, K.ink][Math.floor(r() * 5)], col = fill === K.ink || fill === K.violet ? K.bone : K.ink, font = [FONTS.title, FONTS.serif, FONTS.ui][Math.floor(r() * 3)];
      scrap(g, x + size * 0.33 + (hash(n + Math.floor(t * 8)) - 0.5) * 6, y + (hash(n * 3 + Math.floor(t * 8)) - 0.5) * 6, size * 0.64, size * 0.95, (r() - 0.5) * 0.4, fill, 400 + n + (o.seed || 0), { amp: 3, draw: (g) => text(g, ch, 0, 4, { size: size * 0.78, color: col, font, italic: font === FONTS.serif, weight: 900 }) }); x += size * 0.66; }); });
}
export function tag(g, x, y, str, t, o = {}) { const size = o.size || 34; scrap(g, x + (hash(Math.floor(t * 8) + str.length) - 0.5) * 4, y, str.length * size * 0.6 + 60, size * 1.8, o.rot ?? -0.04, o.fill || K.acid, 11 + str.length, { amp: 4, tape: o.tape, draw: (g) => text(g, str, 0, 3, { size, color: o.color || K.ink, font: o.serif ? FONTS.serif : FONTS.ui, italic: !!o.serif, weight: 900, spacing: o.serif ? 1 : 3 }) }); }
