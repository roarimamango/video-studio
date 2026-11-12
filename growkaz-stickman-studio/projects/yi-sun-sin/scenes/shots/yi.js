// yi.js — shot templates for the Yi Sun-sin video. Every shot: params.type selects a template.
// Camera rule: constant push-in that never eases to a stop (continues through transitions).
import { E, registerShot, ease, prog, clamp, lerp, rng, text, FONTS, key } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { wedges } from '/projects/king-arthur-anime/scenes/shots/anime.js';
import { W, H, C, step3, hash, jit, grain, paperOver, halftone, torn, scrap, tornFrame, label, sunDisc, redArrow, ship, waves, person, bust, PROPS, drawMap, PLACES, LL, pathOf, POSE } from '../_kit.js';

const T = {};
const poseOf = (n) => (typeof n === 'object' && !Array.isArray(n) ? n : POSE[n] || POSES[n] || POSES.stand);
const mixP = (a, b, k) => { const o = {}; for (const n in a) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
const poseAt = (p, t) => { if (!Array.isArray(p)) return poseOf(p); let i = 0; while (i + 1 < p.length && t >= p[i + 1][0]) i++; const a = poseOf(p[i][1]); const n = p[i + 1]; if (!n) return a; return a; };
const stepPose = (p, t) => { if (!Array.isArray(p)) return poseOf(p); let cur = p[0][1], prv = p[0][1], t0 = 0; for (const [k, v] of p) if (t >= k) { prv = cur; cur = v; t0 = k; } const b = clamp((t - t0) / 0.25); return mixP(poseOf(prv), poseOf(cur), ease.inOut(b)); };
// linear push-in camera (never stops)
const cam = (p, t) => ({ z: (p.z0 ?? 1.0) + (p.rate ?? 0.035) * t, x: (p.x0 ?? 0) + (p.vx ?? 0) * t, y: (p.y0 ?? 0) + (p.vy ?? 0) * t });
const withCam = (g, c, fn, depth = 1) => { g.save(); const z = 1 + (c.z - 1) * depth; g.translate(W() / 2, H() / 2); g.scale(z, z); g.translate(-W() / 2 - c.x * depth, -H() / 2 - c.y * depth); fn(); g.restore(); };

// ---------- shared overlays ----------
function overlays(g, t, info, p) {
  const o = p.ov || {};
  for (const l of o.labels || []) if (t >= (l.at || 0)) label(g, W() * (l.x ?? 0.5), H() * (l.y ?? 0.15), l.str, l.rot ?? -0.03, l.seed || 7 + l.str.length, t, { size: l.size || 32, tape: l.tape ?? true, fill: l.red ? C.red : l.ink ? C.ink : C.paper, color: l.red || l.ink ? C.paper : C.ink, font: l.serif ? FONTS.serif : FONTS.ui, italic: l.serif });
  if (o.date && t >= (o.dateAt || 0.2)) label(g, W() * 0.2, H() * 0.86, o.date, -0.04, 61, t, { size: 40, tape: true });
  if (o.big && t >= (o.bigAt || 0)) { const k = ease.out(clamp((step3(t) - (o.bigAt || 0)) / 0.25)); g.save(); g.translate(W() / 2, H() * (o.bigY ?? 0.2)); g.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k); g.globalAlpha = k; scrap(g, 0, 0, o.big.length * (o.bigSize || 80) * 0.62 + 90, (o.bigSize || 80) * 1.6, -0.02, o.bigRed ? C.red : C.ink, 81, { amp: 6, draw: (g) => text(g, o.big, 0, 4, { size: o.bigSize || 80, color: C.paper, font: FONTS.title, weight: 700, spacing: 6 }) }); g.restore(); }
  if (p.frame !== false) tornFrame(g, t, p.frameC || C.ink);
}

// ---------- shadow-theatre scene ----------
const BG = {
  paper: (g) => { g.fillStyle = C.paper; g.fillRect(-W(), -H(), W() * 3, H() * 3); },
  dusk: (g) => { const gr = g.createLinearGradient(0, 0, 0, H()); gr.addColorStop(0, C.red2); gr.addColorStop(0.55, C.red); gr.addColorStop(1, '#e8a070'); g.fillStyle = gr; g.fillRect(-W(), -H(), W() * 3, H() * 3); },
  night: (g) => { const gr = g.createLinearGradient(0, 0, 0, H()); gr.addColorStop(0, '#0a0d18'); gr.addColorStop(1, C.indigo); g.fillStyle = gr; g.fillRect(-W(), -H(), W() * 3, H() * 3); },
  dawn: (g) => { const gr = g.createLinearGradient(0, 0, 0, H()); gr.addColorStop(0, '#2a3048'); gr.addColorStop(0.6, '#c87860'); gr.addColorStop(1, C.paper2); g.fillStyle = gr; g.fillRect(-W(), -H(), W() * 3, H() * 3); },
  red: (g) => { g.fillStyle = C.red; g.fillRect(-W(), -H(), W() * 3, H() * 3); },
  ink: (g) => { g.fillStyle = C.ink; g.fillRect(-W(), -H(), W() * 3, H() * 3); },
};
T.scene = (g, t, info, p) => {
  const c = cam(p, t), GY = H() * (p.gy ?? 0.8), bg = p.bg || 'paper';
  BG[bg](g);
  withCam(g, c, () => {
    if (p.sun !== false) { const [sx, sy, sr] = p.sun || [0.68, 0.42, 190]; sunDisc(g, W() * sx, H() * sy, sr, bg === 'night' ? C.paper : bg === 'red' || bg === 'dusk' ? C.paper2 : C.red); }
    if (bg === 'night' && p.stars !== false) { const r = rng(5); g.fillStyle = C.paper; for (let i = 0; i < 80; i++) g.fillRect(r() * W() * 1.4 - W() * 0.2, r() * GY * 0.8, 2, 2); }
    if (bg === 'paper' || bg === 'dawn') halftone(g, -W() * 0.2, H() * 0.05, W() * 1.4, GY * 0.6, 'rgba(12,10,10,.18)', 12, 0.6, -1);
  }, 0.25);
  withCam(g, c, () => { for (const pr of (p.props || []).filter((q) => q.far)) PROPS[pr.k](g, W() * (pr.x ?? 0.5), GY, pr.s ?? 1, pr.f ?? 1, t); }, 0.55);
  withCam(g, c, () => {
    const gr = p.ground || 'land';
    if (gr === 'sea') { g.fillStyle = bg === 'night' ? '#0e1424' : C.sea; g.fillRect(-W(), GY - 30, W() * 3, H() * 2); waves(g, GY, t, bg === 'night' ? 'rgba(239,230,210,.35)' : C.ink, { rows: 6, gap: 46 }); }
    else if (gr === 'deck') { g.fillStyle = C.ink; g.fillRect(-W(), GY, W() * 3, H()); PROPS.rail(g, 0, GY, 1); }
    else { g.fillStyle = C.ink; g.fillRect(-W(), GY, W() * 3, H()); halftone(g, -W(), GY - 30, W() * 3, 30, C.ink, 8, 1); }
    for (const pr of (p.props || []).filter((q) => !q.far)) PROPS[pr.k](g, W() * (pr.x ?? 0.5), pr.y != null ? H() * pr.y : GY, pr.s ?? 1, pr.f ?? 1, t);
    for (const s of p.ships || []) { const x = W() * (s.x ?? 0.5) + (s.vx || 0) * t * W(), bob = Math.sin(step3(t) * 3 + (s.x || 0) * 9) * 4; ship(g, s.kind || 'panok', x, H() * (s.y ?? (p.gy ?? 0.8)) + bob, s.s ?? 1, { facing: s.f ?? 1, rim: s.rim, fire: s.fire ? step3(t) : 0, smoke: s.smoke ? step3(t) : 0 }); }
    for (const [i, f] of (p.figs || []).entries()) {
      let x = W() * (f.x ?? 0.5); if (f.walk) { const k = clamp((t - (f.walk[2] || 0)) / ((f.walk[3] || info.dur) - (f.walk[2] || 0))); x = W() * lerp(f.walk[0], f.walk[1], k); }
      const walking = f.walk && t > (f.walk[2] || 0) && t < (f.walk[3] || info.dur), ph = (step3(t) * 2.5) % 1;
      const pose = walking ? (ph < 0.5 ? POSE.walkA : POSE.walkB) : stepPose(f.p || 'stand', t);
      const a = f.fadeIn != null ? clamp((t - f.fadeIn) / 0.4) : f.fadeOut != null ? 1 - clamp((t - f.fadeOut) / 0.8) : 1;
      g.save(); g.globalAlpha *= a;
      person(g, f.who || 'SOLDIER', x, H() * (f.y ?? (p.gy ?? 0.8)), f.s ?? 1.6, pose, { facing: f.f ?? 1, sword: f.sword, spear: f.spear, drumstick: f.drum, cape: f.cape, shadowLen: p.sun === false || bg === 'night' ? 0 : (p.shadow ?? 0.22), shadowSkew: p.skew ?? -1.6, rim: f.rim });
      g.restore();
    }
    if (p.extra && EXTRA[p.extra]) EXTRA[p.extra](g, t, info, p, GY);
  });
  if (p.fx?.includes('smoke')) { g.save(); g.globalAlpha = 0.35; halftone(g, 0, 0, W(), H() * 0.6, C.paper3, 16, 0.8, -1); g.restore(); }
  if (p.fx?.includes('rain')) { g.save(); g.strokeStyle = 'rgba(239,230,210,.35)'; g.lineWidth = 2; const r = rng(3); for (let i = 0; i < 120; i++) { const x = r() * W(), y = (r() * H() + step3(t) * 1600) % H(); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 40); g.stroke(); } g.restore(); }
  if (p.fx?.includes('embers')) { const r = rng(9); for (let i = 0; i < 40; i++) { const k = (step3(t) * 0.4 + r()) % 1; g.fillStyle = i % 2 ? C.red : C.gold; g.fillRect(r() * W(), H() * (1 - k), 4, 4); } }
  paperOver(g, 0.4);
};

// ---------- extras for specific moments ----------
const EXTRA = {
  bark(g, t, info, p, GY) { const k = clamp((t - 0.6) / 1.4); g.fillStyle = C.paper3; for (let i = 0; i < Math.floor(k * 5); i++) g.fillRect(W() * 0.52 + i * 6, GY - 110 + i * 8, 40, 10); },
  fall(g, t) { if (t > 0.9 && t < 1.4) { const r = rng(4); g.fillStyle = C.ink; for (let i = 0; i < 12; i++) g.fillRect(W() * 0.5 + (r() - 0.5) * 300, H() * 0.78 + (r() - 0.5) * 40, 8, 8); } },
  fail(g, t) { if (t > 0.3) { const k = ease.out(clamp((step3(t) - 0.3) / 0.3)); g.save(); g.translate(W() * 0.7, H() * 0.32); g.rotate(-0.2); g.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k); g.globalAlpha = k; g.strokeStyle = C.red; g.lineWidth = 12; g.strokeRect(-190, -70, 380, 140); text(g, 'FAILED', 0, 6, { size: 96, color: C.red, font: FONTS.ui, weight: 900, spacing: 8 }); g.restore(); } },
  pass(g, t) { if (t > 0.6) { const k = ease.out(clamp((step3(t) - 0.6) / 0.3)); g.save(); g.translate(W() * 0.7, H() * 0.32); g.rotate(-0.15); g.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k); g.globalAlpha = k; g.strokeStyle = C.ink; g.lineWidth = 12; g.strokeRect(-190, -70, 380, 140); text(g, 'PASSED', 0, 6, { size: 96, color: C.ink, font: FONTS.ui, weight: 900, spacing: 8 }); g.restore(); } },
  muskets(g, t) { const r = rng(7); for (let i = 0; i < 10; i++) { const on = (Math.floor(t * 8) + i) % 4 === 0; if (!on) continue; const x = W() * (0.55 + r() * 0.4), y = H() * (0.55 + r() * 0.15); g.fillStyle = C.paper; g.beginPath(); g.arc(x, y, 14 + r() * 16, 0, 7); g.fill(); } },
  bullet(g, t, info, p) { const b0 = p.bulletAt ?? 0.5; if (t > b0 && t < b0 + 0.7) { const k = (t - b0) / 0.7; g.strokeStyle = C.red; g.lineWidth = 6; g.beginPath(); g.moveTo(W() * 1.0, H() * 0.3); g.lineTo(lerp(W(), W() * 0.47, k), lerp(H() * 0.3, H() * 0.46, k)); g.stroke(); } if (t > b0 + 0.6) { const k = clamp((t - b0 - 0.6) / 0.5); g.fillStyle = C.red; for (let i = 0; i < 8; i++) { const a = i * 0.8; g.fillRect(W() * 0.47 + Math.cos(a) * 60 * k, H() * 0.46 + Math.sin(a) * 60 * k, 10, 10); } } },
  arrowsRain(g, t) { const r = rng(12); g.strokeStyle = C.ink; g.lineWidth = 4; for (let i = 0; i < 30; i++) { const k = (step3(t) * 0.9 + r()) % 1, x = r() * W() * 1.2, y = -100 + k * H() * 1.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 50, y + 90); g.stroke(); } },
  scroll(g, t) { g.save(); g.translate(W() * 0.5, H() * 0.45); g.fillStyle = C.paper; g.fillRect(-60, -10, 120, 160); g.fillStyle = C.ink; g.fillRect(-70, -20, 140, 14); g.fillRect(-70, 150, 140, 14); for (let i = 0; i < 5; i++) g.fillRect(-30 + i * 14, 10, 4, 110); g.restore(); },
  tide(g, t, info, p, GY) { const k = step3(t), dir = p.tideDir ?? 1; g.strokeStyle = C.red; g.lineWidth = 8; for (let i = 0; i < 6; i++) { const x = ((k * 400 * dir + i * 380) % (W() * 1.4) + W() * 1.4) % (W() * 1.4) - W() * 0.2, y = GY + 40 + (i % 3) * 60; redArrow(g, [[x - dir * 140, y], [x, y]], 1, C.red, 7); } },
  heartbeat(g, t) {},
  chainsWalk(g, t, info, p, GY) { const f = p.figs || [], k = (i) => { const w = f[i].walk, kk = clamp((t - w[2]) / (w[3] - w[2])); return W() * lerp(w[0], w[1], kk); }; const a = k(0) + 40, b = k(1) - 30, y = GY - 150; g.strokeStyle = C.ink; g.lineWidth = 6; for (let i = 0; i < 8; i++) { const x = lerp(a, b, i / 8) + 6; g.beginPath(); g.ellipse(x, y + Math.sin(i / 8 * Math.PI) * 30, 12, 8, i % 2 ? 0 : 1.2, 0, 7); g.stroke(); } },
};

// ---------- map ----------
T.map = (g, t, info, p) => {
  const pt = (v) => (typeof v === 'string' ? PLACES[v] : v.length === 3 ? LL(v[0], v[1]) : v); const z = (p.z0 ?? 1.0) + (p.rate ?? 0.05) * t, foc = p.focus ? pt(p.focus) : [420, 500], from = p.from ? pt(p.from) : foc;
  const k = clamp(t / Math.max(1, info.dur)), cx = lerp(from[0], foc[0], ease.inOut(k)), cy = lerp(from[1], foc[1], ease.inOut(k));
  const M = drawMap(g, t, { z, cx, cy, region: p.region });
  const P = (v) => M(typeof v === 'string' ? PLACES[v] : v.length === 3 ? LL(v[0], v[1]) : v);
  for (const a of p.arrows || []) { const pts = a.pts.map(P); redArrow(g, pts, clamp((step3(t) - (a.at || 0)) / (a.dur || 1.2)), a.ink ? C.ink : C.red, (a.w || 9) * Math.sqrt(z)); }
  for (const tk of p.tokens || []) { const n = tk.n || 1, r = rng(tk.seed || 3), kk = clamp((t - (tk.at || 0)) / (tk.dur || 2)); for (let i = 0; i < n; i++) { const a = P(tk.from), b = P(tk.to || tk.from), jx = (r() - 0.5) * (tk.spread || 0) * z, jy = (r() - 0.5) * (tk.spread || 0) * 0.5 * z; if (t < (tk.at || 0) - 0.05 && !tk.show) continue; ship(g, tk.kind || 'jp', lerp(a[0], b[0], ease.inOut(kk)) + jx, lerp(a[1], b[1], ease.inOut(kk)) + jy, (tk.s || 0.16) * z, { facing: tk.f ?? 1, fire: tk.fire ? step3(t) : 0, sail: tk.kind === 'panok' ? C.red : undefined }); } }
  for (const pin of p.pins || []) { if (t < (pin.at || 0)) continue; const [x, y] = P(pin.place), kk = ease.out(clamp((step3(t) - (pin.at || 0)) / 0.25)); g.fillStyle = pin.ink ? C.ink : C.red; g.beginPath(); g.arc(x, y - 30 * kk, 14, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 10, y - 26 * kk); g.lineTo(x, y); g.lineTo(x + 10, y - 26 * kk); g.fill(); if (pin.name) label(g, x + (pin.dx ?? 120), y + (pin.dy ?? -60), pin.name, -0.04, pin.name.length + 3, t, { size: pin.size || 28, fill: pin.red ? C.red : C.paper, color: pin.red ? C.paper : C.ink }); }
  if (p.cross) for (const cr of p.cross) { if (t < cr.at) continue; const [x, y] = P(cr.place), kk = clamp((step3(t) - cr.at) / 0.3); g.strokeStyle = C.red; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 50, y - 50); g.lineTo(x - 50 + 100 * kk, y - 50 + 100 * kk); g.stroke(); if (kk > 0.5) { g.beginPath(); g.moveTo(x + 50, y - 50); g.lineTo(x + 50 - 100 * (kk - 0.5) * 2, y - 50 + 100 * (kk - 0.5) * 2); g.stroke(); } }
  if (p.crane) { const [x, y] = P(p.crane.place), kk = clamp((step3(t) - (p.crane.at || 0)) / 1.6); for (let i = 0; i < 9; i++) { const a = lerp(Math.PI * 0.5, Math.PI * (0.15 + i * 0.0875), kk), rr = 150 * z; ship(g, 'panok', x + Math.cos(a) * rr * (i % 2 ? 1 : -1) * (kk > 0 ? 1 : 0.2), y + Math.sin(a) * rr * 0.6 - rr * 0.3, 0.14 * z, { sail: C.red }); } }
  paperOver(g, 0.25);
};

// ---------- war diary page ----------
function brushColumns(g, x, y, w, h, n, seed, color = C.ink2) {
  const r = rng(seed); g.save(); g.fillStyle = color;
  for (let c = 0; c < n; c++) { const cx = x + w - (c + 0.5) * (w / n); let yy = y; while (yy < y + h - 30) { const s = 18 + r() * 10; for (let k = 0; k < 3 + Math.floor(r() * 3); k++) { const hor = r() > 0.5; g.fillRect(cx - s / 2 + (hor ? 0 : r() * s), yy + r() * s, hor ? s * (0.4 + r() * 0.6) : 3.5, hor ? 3.5 : s * (0.4 + r() * 0.6)); } yy += s + 10; } }
  g.restore();
}
T.diary = (g, t, info, p) => {
  const c = cam(p, t); g.fillStyle = p.bgC || C.ink; g.fillRect(0, 0, W(), H()); halftone(g, 0, H() * 0.3, W(), H() * 0.7, C.red2, 14, 0.7);
  withCam(g, c, () => {
    const k = ease.out(clamp(step3(t) / 0.5)), px = lerp(W() * 1.2, W() * 0.5, k);
    scrap(g, px, H() * 0.5, 1000, 640, -0.04, '#e8dcbc', 211 + (p.seed || 0), { amp: 12, draw: (g, w, h) => { brushColumns(g, -w / 2 + 60, -h / 2 + 60, w - 120, h - 120, 14, 5 + (p.seed || 0)); g.fillStyle = 'rgba(120,80,40,.15)'; g.beginPath(); g.ellipse(200, 150, 220, 120, 0.3, 0, 7); g.fill(); if (p.seal) { g.fillStyle = C.red; g.fillRect(-w / 2 + 60, h / 2 - 150, 90, 90); } } });
  });
  if (p.title) label(g, W() * 0.3, H() * 0.17, p.title, -0.04, 23, t, { size: 32, tape: true });
  if (p.quote && t > (p.quoteAt ?? 0.8)) { const words = p.quote.split(' '), n = Math.min(words.length, Math.floor((t - (p.quoteAt ?? 0.8)) / (p.wordRate ?? 0.22)) + 1); label(g, W() * 0.5, H() * 0.75, words.slice(0, n).join(' '), 0.02, 37, t, { size: p.qSize || 46, fill: C.red, color: C.paper, font: FONTS.serif, italic: true, tape: false }); }
  paperOver(g, 0.2);
};

// ---------- tally / counts ----------
T.tally = (g, t, info, p) => {
  const c = cam(p, t); g.fillStyle = p.bgC || C.paper; g.fillRect(0, 0, W(), H()); paperOver(g, 0.5);
  withCam(g, c, () => {
    if (p.mode === 'vs') {
      const nA = p.a || 13, nB = p.b || 133, ka = Math.min(nA, Math.floor(step3(t) / 0.06)), kb = Math.min(nB, Math.floor(Math.max(0, step3(t) - (p.bAt ?? 0.9)) / 0.012));
      for (let i = 0; i < ka; i++) ship(g, 'panok', W() * 0.12 + (i % 4) * 95, H() * 0.32 + Math.floor(i / 4) * 120, 0.28, { sail: C.red });
      for (let i = 0; i < kb; i++) ship(g, 'jp', W() * 0.47 + (i % 14) * 68, H() * 0.24 + Math.floor(i / 14) * 62, 0.17);
      text(g, String(ka), W() * 0.24, H() * 0.86, { size: 130, color: C.red, font: FONTS.title, weight: 700 }); if (nB > 0) { text(g, String(kb), W() * 0.72, H() * 0.86, { size: 130, color: C.ink, font: FONTS.title, weight: 700 }); text(g, 'VS', W() * 0.44, H() * 0.86, { size: 60, color: C.ink, font: FONTS.ui, weight: 900 }); } else if (t > 1.0) label(g, W() * 0.62, H() * 0.5, '12 + 1 = 13 SHIPS', -0.03, 44, t, { size: 56, fill: C.red, color: C.paper, tape: true });
    } else if (p.mode === 'streak') {
      const n = Math.min(23, Math.floor(step3(t) / 0.08));
      for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), j = i % 5, x = W() * 0.14 + grp * 300 + j * 40, y = H() * 0.42; g.strokeStyle = C.ink; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); if (j < 4) { g.moveTo(x, y - 90); g.lineTo(x + 6, y + 90); } else { g.moveTo(x - 170, y + 60); g.lineTo(x + 10, y - 60); } g.stroke(); }
      text(g, `${n} BATTLES`, W() * 0.32, H() * 0.78, { size: 90, color: C.ink, font: FONTS.title, weight: 700, spacing: 4 });
      if (t > (p.zeroAt ?? 1.8)) { const k = ease.out(clamp((step3(t) - (p.zeroAt ?? 1.8)) / 0.25)); g.save(); g.translate(W() * 0.76, H() * 0.74); g.rotate(-0.12); g.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k); g.globalAlpha = k; g.strokeStyle = C.red; g.lineWidth = 12; g.strokeRect(-230, -80, 460, 160); text(g, '0 DEFEATS', 0, 6, { size: 84, color: C.red, font: FONTS.ui, weight: 900, spacing: 4 }); g.restore(); }
    } else if (p.mode === 'army') {
      const n = Math.floor(clamp(t / 2.2) * 110); for (let i = 0; i < n; i++) { const x = W() * 0.06 + (i % 22) * 82, y = H() * 0.2 + Math.floor(i / 22) * 105; person(g, 'SAMURAI', x, y + 80, 0.36, POSES.stand, { rim: null, spear: i % 3 === 0 }); }
      const v = Math.floor(clamp(t / 2.2) * 150000); scrap(g, W() * 0.5, H() * 0.82, 760, 150, -0.02, C.red, 51, { draw: (g) => text(g, v.toLocaleString('en-US') + '+', 0, 6, { size: 100, color: C.paper, font: FONTS.title, weight: 700 }) });
    }
  });
};
// ---------- big date / title cards ----------
T.date = (g, t, info, p) => {
  const c = cam(p, t); (BG[p.bg || 'red'])(g); halftone(g, 0, 0, W(), H(), 'rgba(0,0,0,.25)', 14, 0.6); paperOver(g, 0.4);
  withCam(g, c, () => { const k = ease.out(clamp(step3(t) / 0.3)); g.save(); g.translate(W() / 2, H() * 0.47); g.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); g.globalAlpha = k;
    scrap(g, 0, 0, p.str.length * (p.size || 150) * 0.62 + 120, (p.size || 150) * 1.5, -0.03, p.bg === 'paper' ? C.ink : C.paper, 71, { amp: 8, draw: (g) => text(g, p.str, 0, 6, { size: p.size || 150, color: p.bg === 'paper' ? C.paper : C.ink, font: FONTS.title, weight: 700, spacing: 8 }) });
    g.restore(); if (p.sub && t > 0.45) label(g, W() / 2, H() * 0.7, p.sub, 0.02, 75, t, { size: 38, tape: true, fill: p.bg === 'paper' ? C.red : C.ink, color: C.paper }); });
};
T.title = (g, t, info, p) => {
  const c = cam(p, t); g.fillStyle = C.red; g.fillRect(0, 0, W(), H()); halftone(g, 0, 0, W(), H(), C.red2, 14, 0.6); paperOver(g, 0.35);
  withCam(g, c, () => { ship(g, 'turtle', W() * 0.5, H() * 0.95, 2.2, { ink: 'rgba(12,10,10,.35)' }); const r = rng(9); let n = 0;
    (p.lines || [['THE', 'ADMIRAL', 'WHO'], ['NEVER', 'LOST']]).forEach((ws, li) => { const size = li ? 190 : 100, y = li ? H() * 0.56 : H() * 0.3, letters = ws.join(' ').split(''), tot = letters.length * size * 0.68; let x = W() / 2 - tot / 2;
      letters.forEach((ch) => { const at = 0.1 + n * 0.035; n++; if (ch === ' ' || t < at) { x += size * 0.68; return; } const fill = li ? [C.paper, '#ffffff', C.gold, C.paper][Math.floor(r() * 4)] : [C.ink, C.ink2][Math.floor(r() * 2)], col = fill === C.ink || fill === C.ink2 ? C.paper : C.ink, font = [FONTS.title, FONTS.serif, FONTS.ui][Math.floor(r() * 3)], pop = Math.min(1, (step3(t) - at + 0.125) * 4);
        scrap(g, x + size * 0.34 + jit(t, n, 1.5), y + jit(t, n + 40, 1.5), size * 0.66 * pop, size * 0.95 * pop, (r() - 0.5) * 0.22, fill, 300 + n, { amp: 3, draw: (g) => text(g, ch, 0, 4, { size: size * 0.78 * pop, color: col, font, italic: font === FONTS.serif, weight: 900 }) }); x += size * 0.68; }); });
    if (p.sub && t > 1.2) label(g, W() / 2, H() * 0.8, p.sub, 0.02, 91, t, { size: 36, tape: true }); });
};
// ---------- portrait (big profile silhouette) ----------
T.portrait = (g, t, info, p) => {
  const c = cam(p, t); (BG[p.bg || 'paper'])(g); halftone(g, 0, 0, W(), H(), 'rgba(12,10,10,.15)', 12, 0.7, -1);
  withCam(g, c, () => { sunDisc(g, W() * (p.sunX ?? 0.6), H() * 0.45, 330, p.bg === 'night' ? C.paper : C.red);
    bust(g, p.who || 'YI', W() * (p.x ?? 0.45), H() * 0.5, 175, { facing: p.f ?? 1, rim: p.rim }); });
  paperOver(g, 0.35);
};
// ---------- impact frame ----------
T.impact = (g, t, info, p) => {
  const k = Math.floor(t * 12), pal = [[C.red, C.ink], [C.paper, C.ink], [C.ink, C.red]][k % 3], [bg, fg] = pal;
  g.fillStyle = bg; g.fillRect(0, 0, W(), H()); wedges(g, W() * 0.55, H() * 0.42, fg, 90 + (k % 2) + (p.seed || 0), { clusters: 6, inner: 200 });
  const [sx, sy] = [(hash(k) - 0.5) * 20, (hash(k + 9) - 0.5) * 20]; g.save(); g.translate(sx, sy);
  if (p.subject === 'ships') { ship(g, 'turtle', W() * 0.38, H() * 0.7, 1.6, { ink: fg }); ship(g, 'jp', W() * 0.74, H() * 0.66, 1.4, { ink: fg, sail: fg, facing: -1 }); }
  else if (p.subject === 'shot') person(g, 'YI', W() * 0.45, H() * 0.95, 2.6, POSES.fall, { color: fg, rim: null });
  else { person(g, 'YI', W() * 0.36, H() * 0.95, 2.4, POSE.lunge, { color: fg, rim: null, sword: -0.3 }); person(g, 'SAMURAI', W() * 0.68, H() * 0.95, 2.4, POSE.charge, { color: fg, rim: null, facing: -1, sword: -2.4 }); }
  g.restore(); paperOver(g, 0.3);
};

// ---------- register ----------
for (const shot of E.shots) { const p = shot.params || {}, fn = T[p.type || '']; if (!fn) continue; registerShot(shot.id, { draw(g, t, info) { fn(g, t, info, p); overlays(g, t, info, p); } }); }
