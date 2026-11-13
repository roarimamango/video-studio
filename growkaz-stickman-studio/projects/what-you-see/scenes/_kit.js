// _kit.js — "The Lore Behind What You See": clean noir case-file kit.
// Paper cut-out figures (ink silhouettes with cream paper edges) living inside lit 3D sets,
// case-file graphics (typewriter strips, evidence tags, stamps), rabbit-hole iris transitions.
import { E, ease, clamp, lerp, prog, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { POSE, person, hash } from '/projects/edgar-allan-poe/scenes/_kit.js';
export { hash };

export const W = () => E.W, H = () => E.H;
export const K = { ink: '#0d0d10', slate: '#262c36', steel: '#46525f', fog: '#7d8996', paper: '#ece4d0', manila: '#d2b47a', amber: '#e8a33a', sodium: '#ffb347', red: '#c8102e', stone: '#77736e', gold: '#8a6422', cyan: '#8fe9ff', cream: '#f2efe6', blue: '#2a5ea8' };
export const MONO = '"FreeMono", "Liberation Mono", monospace';
export const SERIF = '"Playfair Display", serif';
export const mono = (g, size, w = 700) => { g.font = `${w} ${size}px ${MONO}`; };

// ---------------------------------------------------------------- poses
export const poseOf = (n) => (typeof n === 'object' && !Array.isArray(n) ? n : POSE[n] || POSES[n] || POSES.stand);
export const mixP = (a, b, k) => { const o = {}; for (const n in a) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], (b[n] || a[n])[1], k)]; return o; };
export const seqPose = (keys, t) => { if (!Array.isArray(keys)) return poseOf(keys); let cur = keys[0][1], prv = cur, t0 = 0; for (const [k, v] of keys) if (t >= k) { prv = cur; cur = v; t0 = k; } return mixP(poseOf(prv), poseOf(cur), ease.inOut(clamp((t - t0) / 0.35))); };

// ---------------------------------------------------------------- paper graphics
export function paper(g, x, y, w, h, rot, fill = K.paper, seed = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 6; g.fillStyle = fill; g.beginPath();
  const r = rng(seed); g.moveTo(-w / 2, -h / 2); for (let i = 1; i <= 12; i++) g.lineTo(-w / 2 + (w * i) / 12, -h / 2 + (r() - 0.5) * 5); for (let i = 1; i <= 4; i++) g.lineTo(w / 2 + (r() - 0.5) * 5, -h / 2 + (h * i) / 4); for (let i = 11; i >= 0; i--) g.lineTo(-w / 2 + (w * i) / 12, h / 2 + (r() - 0.5) * 5); g.closePath(); g.fill(); g.restore();
}
export function typed(g, t, at, x, y, str, o = {}) {
  if (t < at) return; const size = o.size || 38, n = Math.min(str.length, Math.floor((t - at) * (o.cps || 18))); mono(g, size); const full = g.measureText(str).width;
  const a = o.until != null ? 1 - clamp((t - o.until) / 0.4) : 1; if (a <= 0) return; g.save(); g.globalAlpha *= a;
  paper(g, x, y, full + 70, size * 1.75, o.rot ?? -0.012, o.fill || K.paper, str.length);
  g.translate(x, y); g.rotate(o.rot ?? -0.012); g.textBaseline = 'middle'; g.fillStyle = o.color || K.ink; mono(g, size);
  const s = str.slice(0, n); for (let i = 0; i < s.length; i++) { g.globalAlpha = a * (0.84 + hash(i * 7 + str.length) * 0.16); g.fillText(s[i], -full / 2 + g.measureText(str.slice(0, i)).width, (hash(i * 3) - 0.5) * 2); }
  g.globalAlpha = a; if (n < str.length || Math.floor(t * 2) % 2) { const cx = -full / 2 + g.measureText(s).width; g.fillStyle = K.red; g.fillRect(cx + 2, -size * 0.42, size * 0.48, size * 0.84); }
  g.restore();
}
export function stamp(g, t, at, x, y, str, o = {}) {
  if (t < at) return; const k = ease.out(prog(t, at, at + 0.14)), sc = lerp(1.6, 1, k), size = o.size || 92;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.1); g.scale(sc, sc); g.globalAlpha = k * 0.9; g.strokeStyle = o.color || K.red; g.fillStyle = o.color || K.red; g.lineWidth = size * 0.07;
  g.font = `900 ${size}px ${SERIF}`; const w = g.measureText(str).width; g.strokeRect(-w / 2 - size * 0.3, -size * 0.7, w + size * 0.6, size * 1.3); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, 0, size * 0.02);
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 120; i++) { g.beginPath(); g.arc((hash(i) - 0.5) * (w + size), (hash(i + 99) - 0.5) * size * 1.3, 1 + hash(i * 5) * 3.5, 0, 7); g.fill(); }
  g.restore();
}
export function evidence(g, t, at, x, y, label, o = {}) {
  if (t < at) return; const k = ease.out(prog(t, at, at + 0.5)); const yy = lerp(y - 160, y, k);
  mono(g, 32); const w = Math.max(380, g.measureText(label).width + 130), h = 128;
  g.save(); g.translate(x, yy); g.rotate(o.rot ?? 0.04); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 16; g.shadowOffsetY = 8; g.fillStyle = K.manila;
  g.beginPath(); g.moveTo(-w / 2 + 40, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2, h / 2); g.lineTo(-w / 2 + 40, h / 2); g.lineTo(-w / 2, 0); g.closePath(); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = K.ink; g.beginPath(); g.arc(-w / 2 + 34, 0, 10, 0, 7); g.fill(); g.strokeStyle = K.paper; g.lineWidth = 3; g.beginPath(); g.moveTo(-w / 2 + 34, 0); g.quadraticCurveTo(-w / 2 - 40, -60, -w / 2 - 80, -140); g.stroke();
  g.fillStyle = K.red; mono(g, 24); g.textBaseline = 'middle'; g.fillText(o.top || 'EVIDENCE', -w / 2 + 64, -28); g.fillStyle = K.ink; mono(g, 32); g.fillText(label, -w / 2 + 64, 18);
  g.restore();
}
// overlays: ov = [{k:'typed'|'stamp'|'evidence', str, top, at, until, x, y, size, rot}]
export function overlays(g, t, ov = []) {
  for (const o of ov) { const x = W() * (o.x ?? 0.5), y = H() * (o.y ?? 0.86), at = o.at ?? 0.6;
    if (o.k === 'stamp') stamp(g, t, at, x, y, o.str, o);
    else if (o.k === 'evidence') evidence(g, t, at, o.x != null ? x : W() * 0.2, o.y != null ? y : H() * 0.15, o.str, o);
    else typed(g, t, at, x, y, o.str, o); }
}
// rabbit-hole iris
export function irisIn(g, t, dur = 0.8) { if (t >= dur) return; const r = ease.in(t / dur) * Math.hypot(W(), H()) * 0.6; g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, W(), H()); g.moveTo(W() / 2 + Math.max(1, r), H() / 2); g.arc(W() / 2, H() / 2, Math.max(1, r), 0, 7, true); g.fill('evenodd'); g.restore(); }
export function irisOut(g, t, t0, t1) { if (t < t0) return; const r = (1 - ease.in(prog(t, t0, t1))) * Math.hypot(W(), H()) * 0.6; g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, W(), H()); g.moveTo(W() / 2 + Math.max(0.5, r), H() / 2); g.arc(W() / 2, H() / 2, Math.max(0.5, r), 0, 7, true); g.fill('evenodd'); g.restore(); }
// very light film texture: one faint scratch now and then
export function film(g, t) { const f = Math.floor(t * 24); if (hash(f * 3) > 0.9) { g.save(); g.globalAlpha = 0.12; g.strokeStyle = K.paper; g.lineWidth = 1.2; const x = hash(f + 17) * W(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (hash(f) - 0.5) * 16, H()); g.stroke(); g.restore(); } }

// ---------------------------------------------------------------- art
export function eyeArt(g, x, y, r, o = {}) {
  const open = o.open ?? 1, pup = o.pupil ?? 0.38, lx = x + (o.look || 0) * r * 0.45, ly = y + (o.lookY || 0) * r * 0.3;
  g.save(); g.beginPath(); g.ellipse(x, y, r * 1.75, Math.max(0.5, r * open), 0, 0, 7); g.clip();
  g.fillStyle = '#ebe6da'; g.fillRect(x - r * 2, y - r * 1.3, r * 4, r * 2.6);
  g.strokeStyle = 'rgba(200,16,46,.45)'; g.lineWidth = Math.max(1, r * 0.016); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r); g.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 1.3, y + Math.sin(a + 0.3) * r * 0.8, x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.8); g.stroke(); }
  const gr = g.createRadialGradient(lx, ly, r * 0.1, lx, ly, r * 0.85); gr.addColorStop(0, o.iris || '#8a98a6'); gr.addColorStop(0.7, '#3f4a56'); gr.addColorStop(1, '#0d1014'); g.fillStyle = gr; g.beginPath(); g.arc(lx, ly, r * 0.85, 0, 7); g.fill();
  g.strokeStyle = 'rgba(10,10,13,.45)'; g.lineWidth = Math.max(1, r * 0.012); for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; g.beginPath(); g.moveTo(lx + Math.cos(a) * r * pup, ly + Math.sin(a) * r * pup); g.lineTo(lx + Math.cos(a) * r * 0.82, ly + Math.sin(a) * r * 0.82); g.stroke(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(lx, ly, r * pup, 0, 7); g.fill(); if (o.inPupil) o.inPupil(lx, ly, r * pup);
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(lx - r * 0.25, ly - r * 0.25, r * 0.1, r * 0.07, -0.5, 0, 7); g.fill();
  g.restore(); g.strokeStyle = K.ink; g.lineWidth = Math.max(2, r * 0.07); g.beginPath(); g.ellipse(x, y, r * 1.75, Math.max(0.5, r * open), 0, 0, 7); g.stroke();
}
export function nazar(g, cx, cy, R, look = 0) { for (const [r, c] of [[1, '#123a8c'], [0.74, '#ece4d0'], [0.5, '#4f93c8'], [0.26, '#050505']]) { g.fillStyle = c; g.beginPath(); g.arc(cx + (r < 0.6 ? look * R * 0.22 : 0), cy, R * r, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(cx + look * R * 0.22 - R * 0.08, cy - R * 0.08, R * 0.05, 0, 7); g.fill(); }
export function medusa(g, w, h, t) {
  const gr = g.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#4a5058'); gr.addColorStop(1, '#16181c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const s = h / 900; g.save(); g.translate(w / 2, h * 0.47); g.scale(s, s); g.fillStyle = K.ink; g.strokeStyle = K.ink; g.lineCap = 'round';
  for (let i = 0; i < 15; i++) { const a = -Math.PI + (i / 14) * Math.PI, wv = Math.sin(t * 2.2 + i * 1.3); const x0 = Math.cos(a) * 120, y0 = Math.sin(a) * 150 - 10, x1 = Math.cos(a) * 330 + wv * 40, y1 = Math.sin(a) * 300 - 30, mx = Math.cos(a + 0.4 * wv) * 240, my = Math.sin(a + 0.4 * wv) * 250;
    g.lineWidth = 30; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); g.beginPath(); g.ellipse(x1, y1, 32, 20, a + wv * 0.4, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(0, 0, 128, 165, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-62, 130); g.lineTo(-200, 460); g.lineTo(200, 460); g.lineTo(62, 130); g.fill();
  for (const ex of [-48, 48]) { g.save(); g.shadowColor = K.sodium; g.shadowBlur = 36; g.fillStyle = 'rgba(255,190,90,.95)'; g.beginPath(); g.ellipse(ex, -12, 28, 12, 0, 0, 7); g.fill(); g.restore(); g.fillStyle = '#000'; g.beginPath(); g.ellipse(ex, -12, 5, 11, 0, 0, 7); g.fill(); }
  g.restore();
}
export function swirl(g, w, h, t, o = {}) {
  g.fillStyle = '#1a2236'; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(t * (o.spin ?? 0.25));
  for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? '#2a3c62' : '#c4964a'; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 12; k++) { const r = k * w * 0.09, a = (i / 24) * Math.PI * 2 + k * 0.25; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } for (let k = 12; k >= 0; k--) { const r = k * w * 0.09, a = ((i + 1) / 24) * Math.PI * 2 + k * 0.25; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); }
  g.restore(); if (o.eye !== false) eyeArt(g, w / 2, h / 2, h * 0.16, { pupil: 0.32 + 0.08 * Math.sin(t * 2), look: Math.sin(t * 1.2) * 0.4 });
}
export function fresco(g, w, h, seed = 1) {   // painted fresco panel: sky, figures, halo
  const r = rng(seed); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6f86a8'); gr.addColorStop(1, '#c9b48a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) { const x = w * (0.15 + i * 0.18), y = h * (0.55 + r() * 0.15), s = h * 0.0016; g.fillStyle = ['#7a2a24', '#2a3a6a', '#6a5a2a', '#3a5a3a'][i % 4]; g.beginPath(); g.ellipse(x, y, 50 * s * 300 / 300, 140 * s, 0, 0, 7); g.fill(); g.fillStyle = '#d8b090'; g.beginPath(); g.arc(x, y - 160 * s, 30 * s, 0, 7); g.fill(); g.strokeStyle = '#e8c860'; g.lineWidth = 6 * s; g.beginPath(); g.arc(x, y - 160 * s, 46 * s, 0, 7); g.stroke(); }
  g.fillStyle = 'rgba(60,40,20,.15)'; for (let i = 0; i < 300; i++) g.fillRect(r() * w, r() * h, 3, 3);
}
export function feed(g, w, h, t, seed = 0, o = {}) {
  g.fillStyle = '#10131a'; g.fillRect(0, 0, w, h); const step = h * 0.42, sp = o.speed ?? 0.9, off = ((t * sp * step + seed * 97) % step + step) % step;
  for (let i = -1; i < Math.ceil(h / step) + 1; i++) { const y = i * step - off, k = i + Math.floor((t * sp * step + seed * 97) / step) + seed; g.fillStyle = '#1e2430'; g.fillRect(w * 0.05, y + step * 0.04, w * 0.9, step * 0.92);
    g.fillStyle = ['#46525f', '#7d8996', '#c8102e', '#2a5ea8', '#a07850'][((k % 5) + 5) % 5]; g.fillRect(w * 0.09, y + step * 0.2, w * 0.82, step * 0.56); g.fillStyle = K.paper; g.beginPath(); g.arc(w * 0.13, y + step * 0.12, step * 0.05, 0, 7); g.fill(); g.fillRect(w * 0.2, y + step * 0.1, w * 0.35, step * 0.04);
    g.fillStyle = K.red; const hx = w * 0.12, hy = y + step * 0.85, hs = step * 0.04; g.beginPath(); g.moveTo(hx, hy + hs); g.bezierCurveTo(hx - hs * 2, hy - hs * 0.2, hx - hs, hy - hs * 1.5, hx, hy - hs * 0.5); g.bezierCurveTo(hx + hs, hy - hs * 1.5, hx + hs * 2, hy - hs * 0.2, hx, hy + hs); g.fill(); g.fillStyle = K.paper; g.fillRect(w * 0.2, hy - hs * 0.4, w * 0.18, hs); }
}
export function filmLeader(g, w, h, t, flash = []) {
  const f = Math.floor(t * 24); g.fillStyle = '#d9d2c0'; g.fillRect(0, 0, w, h);
  if (flash.includes(f)) { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, w, h); g.fillStyle = K.red; g.font = `900 ${h * 0.24}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f % 2 ? 'DRINK COCA-COLA' : 'EAT POPCORN', w / 2, h / 2); return; }
  g.strokeStyle = '#2a2620'; g.lineWidth = h * 0.012; for (const r of [0.18, 0.32]) { g.beginPath(); g.arc(w / 2, h / 2, h * r, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  const sw = ((t * 0.8) % 1) * Math.PI * 2; g.fillStyle = 'rgba(42,38,32,.3)'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, h * 0.6, -Math.PI / 2, -Math.PI / 2 + sw); g.fill();
  g.fillStyle = '#1a1814'; g.font = `900 ${h * 0.38}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(9 - (Math.floor(t * 0.8) % 8)), w / 2, h / 2 + 6);
}
export function flowers(g, w, h) { g.fillStyle = '#ece8dc'; g.fillRect(0, 0, w, h); for (let i = 0; i < 7; i++) { const x = w * (0.15 + (i % 4) * 0.23), y = h * (0.3 + Math.floor(i / 4) * 0.4), r = Math.min(w, h) * 0.09; g.strokeStyle = '#5a6a4a'; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + r * 2.5); g.stroke(); g.fillStyle = '#7a7a86'; for (let p = 0; p < 6; p++) { const a = p / 6 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.5, r * 0.3, a, 0, 7); g.fill(); } g.fillStyle = '#2a2a2e'; g.beginPath(); g.arc(x, y, r * 0.3, 0, 7); g.fill(); } }
export function eyesPhoto(g, w, h, t = 0) { g.fillStyle = '#e4e0d4'; g.fillRect(0, 0, w, h); const r = h * 0.2; for (const sx of [-1, 1]) { eyeArt(g, w / 2 + sx * w * 0.22, h * 0.52, r, { pupil: 0.4, look: 0 }); g.fillStyle = '#2a2a2e'; g.fillRect(w / 2 + sx * w * 0.22 - r * 1.6, h * 0.52 - r * 1.75, r * 3.2, r * 0.3); } }
export function ring(g, w, h, t = 0) { g.fillStyle = '#121418'; g.fillRect(0, 0, w, h); const cx = w / 2, cy = h * 0.6, r = h * 0.22; g.strokeStyle = '#c9a85a'; g.lineWidth = r * 0.16; g.beginPath(); g.ellipse(cx, cy, r, r * 0.55, 0, 0, 7); g.stroke();
  g.save(); g.translate(cx, cy - r * 0.62); g.fillStyle = '#e8f4ff'; g.beginPath(); g.moveTo(-r * 0.4, 0); g.lineTo(-r * 0.25, -r * 0.25); g.lineTo(r * 0.25, -r * 0.25); g.lineTo(r * 0.4, 0); g.lineTo(0, r * 0.4); g.closePath(); g.fill(); g.strokeStyle = '#8aa'; g.lineWidth = 2; g.stroke(); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; const k = 0.5 + 0.5 * Math.sin(t * 3); g.fillStyle = `rgba(255,255,255,${0.5 * k})`; g.beginPath(); g.moveTo(cx + r * 0.1, cy - r * 1.3); g.lineTo(cx + r * 0.13, cy - r * 0.7); g.lineTo(cx + r * 0.07, cy - r * 0.7); g.fill(); g.restore(); }
export function bobo(g, x, y, s, t, o = {}) { const tilt = o.tilt || 0; g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  g.fillStyle = '#d63a3a'; g.beginPath(); g.ellipse(0, -110, 85, 115, 0, 0, 7); g.fill(); g.fillStyle = '#f0e6d0'; g.beginPath(); g.arc(0, -250, 58, 0, 7); g.fill();
  g.fillStyle = '#c8102e'; g.beginPath(); g.arc(0, -238, 12, 0, 7); g.fill(); g.fillStyle = K.ink; for (const ex of [-22, 22]) { g.beginPath(); g.arc(ex, -262, 7, 0, 7); g.fill(); } g.strokeStyle = K.ink; g.lineWidth = 5; g.beginPath(); g.arc(0, -232, 26, 0.3, Math.PI - 0.3); g.stroke();
  g.fillStyle = '#f0e6d0'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-40 + i * 27, -90 + (i % 2) * 30, 10, 0, 7); g.fill(); } g.restore(); }
export function cigarette(g, x, y, s, t) { g.save(); g.translate(x, y); g.rotate(-0.3); g.fillStyle = '#f2efe6'; g.fillRect(0, -4 * s, 60 * s, 8 * s); g.fillStyle = '#c47a2a'; g.fillRect(-14 * s, -4 * s, 14 * s, 8 * s); g.fillStyle = K.sodium; g.fillRect(60 * s, -4 * s, 5 * s, 8 * s); g.restore();
  g.strokeStyle = 'rgba(225,225,230,.5)'; g.lineWidth = 3 * s; g.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, xx = x + 58 * s + Math.sin(u * 8 - t * 3) * 10 * s * u, yy = y - 22 * s - u * 120 * s; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }

// ---------------------------------------------------------------- cut-out figures
const EDGE = (c, d) => `drop-shadow(${d}px 0 0 ${c}) drop-shadow(-${d}px 0 0 ${c}) drop-shadow(0 ${d}px 0 ${c}) drop-shadow(0 -${d}px 0 ${c})`;
export function cut(g, draw, edge = K.paper, d = 5) { g.save(); g.filter = EDGE(edge, d); draw(); g.restore(); }
const BASE = { DET: 'MAN', MESMER: 'POE', KID: 'BABY', GIRL: 'WOMAN', SCI: 'MAN' };
// figure: who in DET, MAN, WOMAN, GENT, MESMER, KID, GIRL, SCI; o.prop in cig, phone, clip, blind, mallet
export function figure(g, who, x, y, s, pose, o = {}) {
  let q; const col = o.color || K.ink, f = o.facing ?? 1;
  cut(g, () => {
    q = person(g, BASE[who] || who, x, y, s * (who === 'GIRL' ? 0.85 : 1), pose, { flat: true, color: col, facing: f });
    const [hx, hy] = q.head, r = 30 * s;
    g.fillStyle = col;
    if (who === 'DET') { g.beginPath(); g.ellipse(hx, hy - r * 0.55, r * 1.6, r * 0.28, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(hx - r * 0.9, hy - r * 0.6); g.lineTo(hx - r * 0.7, hy - r * 1.55); g.lineTo(hx + r * 0.7, hy - r * 1.55); g.lineTo(hx + r * 0.9, hy - r * 0.6); g.fill(); }
    if (who === 'DET' || who === 'MESMER') { g.beginPath(); g.moveTo(q.sh[0] - 22 * s, q.sh[1]); g.lineTo(q.sh[0] + 22 * s, q.sh[1]); g.lineTo(q.hip[0] + 40 * s, y - 40 * s); g.lineTo(q.hip[0] - 44 * s, y - 40 * s); g.fill(); }
    if (who === 'SCI') { g.fillStyle = '#d8d4c8'; g.beginPath(); g.moveTo(q.sh[0] - 20 * s, q.sh[1]); g.lineTo(q.sh[0] + 20 * s, q.sh[1]); g.lineTo(q.hip[0] + 34 * s, q.hip[1] + 50 * s); g.lineTo(q.hip[0] - 34 * s, q.hip[1] + 50 * s); g.fill(); }
    if (o.prop === 'clip') { g.fillStyle = '#b89a6a'; g.fillRect(q.hF[0] - 16 * s, q.hF[1] - 30 * s, 32 * s, 42 * s); }
    if (o.prop === 'mallet') { g.save(); g.translate(q.hF[0], q.hF[1]); g.rotate(-0.8); g.fillStyle = '#6a4a2a'; g.fillRect(-3 * s, -60 * s, 6 * s, 60 * s); g.fillRect(-18 * s, -74 * s, 36 * s, 18 * s); g.restore(); }
    if (o.prop === 'phone') { g.fillStyle = '#111'; g.fillRect(q.hF[0] - 9 * s, q.hF[1] - 30 * s, 18 * s, 32 * s); }
  }, o.edge || K.paper, o.d ?? 5);
  const [hx, hy] = q.head;
  if (o.prop === 'blind') { g.fillStyle = K.cream; g.fillRect(hx - 34 * s, hy - 6 * s, 68 * s, 12 * s); }
  else if (o.eyes !== false) { g.fillStyle = o.eyeCol || K.paper; for (const dx of [-9, 9]) { g.beginPath(); g.ellipse(hx + (dx + 6 * f) * s, hy + 2 * s, 4.5 * s, (o.blink ? 0.6 : 2.6) * s, 0, 0, 7); g.fill(); } }
  if (o.prop === 'phone') { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(q.hF[0], q.hF[1] - 16 * s, 2, q.hF[0], q.hF[1] - 16 * s, 70 * s); gr.addColorStop(0, 'rgba(143,233,255,.7)'); gr.addColorStop(1, 'rgba(143,233,255,0)'); g.fillStyle = gr; g.fillRect(q.hF[0] - 70 * s, q.hF[1] - 86 * s, 140 * s, 140 * s); g.restore(); g.fillStyle = K.cyan; g.fillRect(q.hF[0] - 7 * s, q.hF[1] - 28 * s, 14 * s, 26 * s); }
  if (o.prop === 'cig') cigarette(g, q.hF[0], q.hF[1] - 6 * s, s, o.t || 0);
  return q;
}
// acted figure: f = {who, p: pose or [[t,pose],...], act, at, facing, prop, s}
export function actedFigure(g, w, h, t, f) {
  const s = f.s ?? 2, x = w * (f.cx ?? 0.5), y = h * 0.97, at = f.at ?? 1;
  let pose = seqPose(f.p || 'stand', t);
  const breathe = Math.sin(t * 1.6 + (f.seed || 0)) * 2;
  if (f.act === 'walk') { const ph = (Math.floor(t * 8) % 2); pose = ph ? POSE.walkA : POSE.walkB; }
  if (f.act === 'shake') { g.translate(Math.sin(t * 40) * 4 * clamp((t - at) * 2), 0); }
  if (f.act === 'faint') { const k = ease.in(prog(t, at, at + 0.9)); g.translate(x, y); g.rotate(-k * 1.35 * (f.facing ?? 1)); g.translate(-x, -y); pose = mixP(pose, poseOf('fall'), k * 0.7); }
  if (f.act === 'punch') { const ph = Math.floor((t - at) * 2.4); if (t > at) pose = poseOf(ph % 2 ? 'lunge' : 'windup'); }
  const q = figure(g, f.who || 'MAN', x, y + breathe, s, pose, { facing: f.facing ?? 1, prop: f.prop, t, blink: (Math.floor(t * 24) + (f.seed || 0) * 7) % 70 < 2 });
  if (f.act === 'stone') { const k = ease.inOut(prog(t, at, at + 1.6)), top = y - k * h; g.save(); g.beginPath(); g.rect(0, top, w, h * 2); g.clip(); figure(g, f.who || 'MAN', x, y + breathe, s, pose, { facing: f.facing ?? 1, color: K.stone, eyes: false }); g.restore(); }
  return q;
}
