// King Arthur — anime cel sampler. Flat two-tone fills, bold outlines, designed effects, characters on twos.
import { E, registerShot, ease, prog, clamp, lerp, key, rng, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';

const W = () => E.W, H = () => E.H;
export const OUT = '#1a1020';
export const COL = {
  skin: '#ffd9b8', skinS: '#e8a98a', hair: '#6a3a22', hairS: '#4a2414', tunic: '#2f5fd0', tunicS: '#1f3f98', trim: '#ffd23a',
  cape: '#e0303e', capeS: '#9c1a2a', pants: '#3a2a4a', boot: '#6a4026', gold: '#ffd23a', goldS: '#c8901a',
  steel: '#8a94ae', steelS: '#565e78', plume: '#e0303e', blade: '#eef6ff', bladeS: '#9fb4d8',
};
export const twos = (t) => Math.floor(t * 12) / 12;                       // animate on twos
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const boil = (t, seed, amp = 1.2) => (hash(Math.floor(t * 12) * 7 + seed) - 0.5) * 2 * amp;   // hand-drawn line wobble

// ---------- primitives ----------
export function shape(g, pts, fill, o = {}) {           // filled polygon with bold outline (smoothed when o.smooth)
  g.beginPath();
  if (o.smooth) { g.moveTo((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2); for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], n = pts[(i + 1) % pts.length]; g.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2); } }
  else { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); }
  g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); }
  if (o.lw !== 0) { g.strokeStyle = o.out || OUT; g.lineWidth = o.lw ?? 5; g.lineJoin = 'round'; g.stroke(); }
}
export function disc(g, x, y, r, fill, o = {}) { g.beginPath(); g.arc(x, y, r, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (o.lw !== 0) { g.strokeStyle = o.out || OUT; g.lineWidth = o.lw ?? 5; g.stroke(); } }
export function limb(g, a, b, r, fill, shadeC, o = {}) {   // capsule with outline + cel shade band on one side
  const lw = o.lw ?? 5;
  g.lineCap = 'round'; g.strokeStyle = o.out || OUT; g.lineWidth = r * 2 + lw * 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = fill; g.lineWidth = r * 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  if (shadeC) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * r * 0.45 * (o.side || 1), ny = dx / L * r * 0.45 * (o.side || 1);
    g.strokeStyle = shadeC; g.lineWidth = r * 0.9; g.beginPath(); g.moveTo(a[0] + nx, a[1] + ny); g.lineTo(b[0] + nx, b[1] + ny); g.stroke(); }
}
// four-point star sparkle with crosshair ring (designed, not particles)
export function sparkle(g, x, y, s, color = '#ffffff', o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  const k = 0.18; g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * k, -s * k, s, 0); g.quadraticCurveTo(s * k, s * k, 0, s); g.quadraticCurveTo(-s * k, s * k, -s, 0); g.quadraticCurveTo(-s * k, -s * k, 0, -s); g.closePath();
  g.fillStyle = color; g.fill(); if (o.edge) { g.strokeStyle = o.edge; g.lineWidth = Math.max(2, s * 0.06); g.stroke(); }
  if (o.ring) { g.strokeStyle = o.ring; g.lineWidth = Math.max(2, s * 0.05); g.beginPath(); g.arc(0, 0, s * 0.62, 0, 7); g.stroke(); for (const a of [0, 1.57, 3.14, 4.71]) { g.beginPath(); g.moveTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5); g.lineTo(Math.cos(a) * s * 1.35, Math.sin(a) * s * 1.35); g.stroke(); } }
  g.restore();
}
// clustered, tapered speed wedges (shaped, uneven, grouped like hand-drawn effects)
export function wedges(g, cx, cy, color, seed, o = {}) {
  const r = rng(seed), clusters = o.clusters || 5;
  g.fillStyle = color;
  for (let c = 0; c < clusters; c++) {
    const base = (c / clusters) * 6.283 + r() * 0.9, n = 3 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) { const a = base + (r() - 0.5) * 0.5, w = 0.012 + r() * 0.03, r0 = (o.inner || 180) + r() * 220, r1 = 2600;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1); g.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1); g.closePath(); g.fill(); }
  }
}
export function puffs(g, x, y, t, n, seed, o = {}) {      // flat smoke puffs with outline, expanding on twos
  const r = rng(seed), tq = twos(t);
  for (let i = 0; i < n; i++) { const a = r() * 6.283, sp = 120 + r() * 200, k = clamp(tq * (1.2 + r() * 0.6)), px = x + Math.cos(a) * sp * k, py = y - Math.abs(Math.sin(a)) * sp * 0.5 * k - 10, rad = (24 + r() * 30) * (0.5 + k) * (o.s || 1);
    if (k >= 1) continue; g.globalAlpha = 1 - k * 0.6; disc(g, px, py, rad, o.fill || '#eee6f2', { lw: 4 }); disc(g, px - rad * 0.25, py + rad * 0.25, rad * 0.55, o.shade || '#c8bcd6', { lw: 0 }); g.globalAlpha = 1; }
}

// ---------- character (cel puppet driven by rig poses) ----------
export const P = {
  stand: POSES.stand, walkA: { ...POSES.stand, kF: [16, -50], fF: [30, 0], kB: [-14, -48], fB: [-30, 0], eF: [-4, -136], hF: [-12, -104], eB: [12, -136], hB: [20, -104] },
  walkB: { ...POSES.stand, kF: [-10, -48], fF: [-26, 0], kB: [14, -50], fB: [28, 0], eF: [14, -136], hF: [22, -104], eB: [-6, -136], hB: [-14, -104] },
  grip: { head: [22, -186], sh: [14, -154], hip: [0, -84], eF: [40, -132], hF: [58, -112], eB: [30, -134], hB: [52, -110], kF: [26, -44], fF: [30, 0], kB: [-18, -42], fB: [-30, 0] },
  heave: { head: [-8, -214], sh: [-6, -178], hip: [0, -96], eF: [20, -214], hF: [26, -258], eB: [8, -214], hB: [16, -256], kF: [14, -48], fF: [28, 0], kB: [-14, -48], fB: [-30, 0] },
  raise: { head: [2, -214], sh: [0, -178], hip: [0, -100], eF: [16, -222], hF: [12, -268], eB: [-14, -214], hB: [4, -264], kF: [22, -50], fF: [40, 0], kB: [-20, -50], fB: [-40, 0] },
  ready: { head: [16, -188], sh: [8, -156], hip: [0, -86], eF: [38, -150], hF: [66, -160], eB: [-20, -140], hB: [-40, -122], kF: [36, -46], fF: [50, 0], kB: [-30, -40], fB: [-56, 0] },
  windup: { head: [-6, -190], sh: [-4, -158], hip: [0, -88], eF: [-34, -176], hF: [-64, -196], eB: [-26, -168], hB: [-52, -190], kF: [30, -46], fF: [44, 0], kB: [-28, -44], fB: [-54, 0] },
  lunge: { head: [30, -176], sh: [20, -144], hip: [0, -78], eF: [56, -140], hF: [94, -134], eB: [-14, -136], hB: [-40, -150], kF: [46, -44], fF: [74, 0], kB: [-36, -34], fB: [-86, 0] },
  charge: { head: [34, -180], sh: [22, -148], hip: [0, -84], eF: [50, -170], hF: [70, -200], eB: [6, -130], hB: [30, -120], kF: [40, -60], fF: [30, 0], kB: [-30, -30], fB: [-70, -10] },
  thrown: { head: [-46, -170], sh: [-34, -140], hip: [0, -90], eF: [-10, -190], hF: [20, -220], eB: [-60, -170], hB: [-80, -200], kF: [30, -80], fF: [60, -60], kB: [10, -50], fB: [40, -30] },
};
export const mixP = (a, b, k) => { const o = {}; for (const n in a) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
export const seqP = (t, keys) => { for (let i = keys.length - 1; i >= 0; i--) if (t >= keys[i][0]) { const n = keys[i + 1]; if (!n) return keys[i][1]; const k = ease.inOut(clamp((t - keys[i][0]) / Math.min(0.17, n[0] - keys[i][0]))); return mixP(keys[i][1], n[1], k); } return keys[0][1]; };

export function character(g, x, y, s, p, o = {}) {
  const K = { ...COL, ...(o.pal || {}) }, f = o.facing ?? 1, t = o.t || 0, sil = o.sil, lw = (o.lw ?? 5) * Math.sqrt(s), knight = !!o.knight;
  const out = sil ? (o.silOut || sil) : OUT, C = (c) => (sil ? sil : c);
  const T = ([px, py]) => [x + px * s * f + boil(t, px * 3 + py, 0.8), y + py * s + boil(t, px + py * 5, 0.8)];
  const q = {}; for (const k in p) q[k] = T(p[k]);
  const L = { lw, out };
  // cape (behind)
  if (o.cape) { const [sx, sy] = q.sh, b = -f, w = o.wind ?? 1, tq = twos(t);
    const tip = (u) => [sx + b * (16 + u * 70 * Math.min(w, 1.6)) * s, sy + (20 + u * 115) * s + Math.sin(tq * 9 - u * 3) * 14 * s * u * w];
    const pts = [[sx - 14 * s * f, sy - 4 * s], [sx + 10 * s * f, sy], tip(0.35), tip(0.7), tip(1), [tip(1)[0] - b * 22 * s, tip(1)[1] + 12 * s], [sx + b * 4 * s, sy + 110 * s]];
    shape(g, pts, C(knight ? K.steelS : K.cape), { ...L, smooth: true });
    if (!sil) shape(g, [pts[1], tip(0.35), tip(0.7), [sx + b * 14 * s, sy + 95 * s]], K.capeS, { lw: 0, smooth: true }); }
  if (o.wingsBack) o.wingsBack(q, C);
  const legC = C(knight ? K.steelS : K.pants), armC = C(knight ? K.steel : K.tunic), armS = sil ? null : (knight ? K.steelS : K.tunicS);
  // far limbs
  limb(g, q.hip, q.kB, 9 * s, legC, null, L); limb(g, q.kB, q.fB, 8 * s, C(knight ? K.steelS : K.boot), null, L);
  limb(g, q.sh, q.eB, 7 * s, sil ? sil : (knight ? K.steelS : K.tunicS), null, L); limb(g, q.eB, q.hB, 6 * s, sil ? sil : (knight ? K.steelS : K.tunicS), null, L);
  disc(g, q.hB[0], q.hB[1], 6.5 * s, C(knight ? K.steelS : K.skinS), L);
  // torso + skirt
  const [sx, sy] = q.sh, [hx, hy] = q.hip;
  const torso = [[sx - 18 * s, sy - 2 * s], [sx + 18 * s, sy - 2 * s], [hx + 24 * s, hy + 30 * s], [hx - 24 * s, hy + 30 * s]];
  shape(g, torso, C(knight ? K.steel : K.tunic), L);
  if (!sil) { g.save(); g.beginPath(); torso.forEach((pt, i) => (i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]))); g.closePath(); g.clip();
    g.fillStyle = knight ? K.steelS : K.tunicS; const mid = (sx + hx) / 2; g.fillRect(f > 0 ? mid - 60 * s : mid + 2 * s, sy - 10 * s, 58 * s, 200 * s);
    if (!knight) { g.strokeStyle = K.trim; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(hx - 24 * s, hy + 6 * s); g.lineTo(hx + 24 * s, hy + 6 * s); g.stroke(); }
    else { g.strokeStyle = '#c8d0e8'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(sx - 10 * s, sy + 20 * s); g.lineTo(sx + 10 * s, sy + 20 * s); g.stroke(); }
    g.restore(); shape(g, torso, null, L); }
  // near limbs
  limb(g, q.hip, q.kF, 9.5 * s, legC, sil ? null : (knight ? '#3a4058' : '#2a1e38'), L); limb(g, q.kF, q.fF, 8.5 * s, C(knight ? K.steel : K.boot), null, L);
  limb(g, q.sh, q.eF, 7.5 * s, armC, armS, L); limb(g, q.eF, q.hF, 6.5 * s, armC, armS, L);
  // head
  const [cx, cy] = q.head, r = 30 * s;
  if (knight) {
    shape(g, [[cx - r, cy + r * 0.9], [cx - r, cy - r * 0.5], [cx - r * 0.6, cy - r], [cx + r * 0.6, cy - r], [cx + r, cy - r * 0.5], [cx + r, cy + r * 0.9]], C(K.steel), L);
    if (!sil) { g.fillStyle = K.steelS; g.fillRect(f > 0 ? cx - r + 3 : cx + 3, cy - r + 4, r - 4, r * 1.8); shape(g, [[cx - r, cy + r * 0.9], [cx - r, cy - r * 0.5], [cx - r * 0.6, cy - r], [cx + r * 0.6, cy - r], [cx + r, cy - r * 0.5], [cx + r, cy + r * 0.9]], null, L);
      g.fillStyle = '#ff3d4e'; g.fillRect(cx - r * 0.2 + f * r * 0.2, cy - 4 * s, r * 0.9, 6 * s); }
    shape(g, [[cx - 6 * s, cy - r], [cx - f * 30 * s, cy - r - 40 * s], [cx - f * 80 * s, cy - r - 10 * s], [cx - f * 40 * s, cy - r + 10 * s]], C(K.plume), { ...L, smooth: true });
  } else {
    // hair back
    const back = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.95 + i * 0.13) + (f < 0 ? 0 : 0), rr = i % 2 ? r * 1.05 : r * 1.38; back.push([cx - f * 6 * s + Math.cos(a) * rr * f, cy - 4 * s + Math.sin(a) * rr]); }
    back.push([cx - f * r * 0.9, cy + r * 0.5]); if (!o.noHair) shape(g, back, C(K.hair), L);
    disc(g, cx, cy, r, C(K.skin), L);
    if (!sil) { g.save(); g.beginPath(); g.arc(cx, cy, r - 2, 0, 7); g.clip(); disc(g, cx - f * r * 1.15, cy + r * 0.2, r * 0.8, K.skinS, { lw: 0 }); g.restore(); disc(g, cx, cy, r, null, L); }
    // bangs
    if (!o.noHair) shape(g, [[cx - f * r * 0.9, cy - r * 0.2], [cx - f * r * 0.6, cy - r * 1.05], [cx + f * r * 0.5, cy - r * 1.05], [cx + f * r * 1.05, cy - r * 0.3], [cx + f * r * 0.55, cy - r * 0.55], [cx + f * r * 0.35, cy - r * 0.15], [cx + f * r * 0.05, cy - r * 0.55], [cx - f * r * 0.35, cy - r * 0.1]], C(K.hair), L);
    if (!sil) {   // face: two tall anime eyes on the facing side, brows, mouth
      const ex = (k) => cx + f * r * k, ey = cy + r * 0.02, expr = o.expr || 'calm';
      for (const k of [0.18, 0.62]) { g.fillStyle = OUT; g.beginPath(); g.ellipse(ex(k), ey, r * 0.11, expr === 'shout' ? r * 0.12 : r * 0.2, 0, 0, 7); g.fill(); disc(g, ex(k) + f * r * 0.03, ey - r * 0.07, r * 0.05, '#fff', { lw: 0 }); }
      g.strokeStyle = OUT; g.lineWidth = 4 * s; g.lineCap = 'round'; for (const k of [0.18, 0.62]) { g.beginPath(); g.moveTo(ex(k) - r * 0.12, ey - r * (expr === 'shout' ? 0.22 : 0.32)); g.lineTo(ex(k) + r * 0.14, ey - r * (expr === 'shout' ? 0.36 : 0.34)); g.stroke(); }
      if (expr === 'shout') shape(g, [[ex(0.3), cy + r * 0.42], [ex(0.6), cy + r * 0.38], [ex(0.52), cy + r * 0.72], [ex(0.32), cy + r * 0.7]], '#8a1a2a', { lw: 3 * s });
      else { g.beginPath(); g.moveTo(ex(0.32), cy + r * 0.5); g.lineTo(ex(0.52), cy + r * 0.48); g.stroke(); }
    }
    if (o.crown) shape(g, [[cx - r * 0.75, cy - r * 0.85], [cx - r * 0.8, cy - r * 1.55], [cx - r * 0.35, cy - r * 1.15], [cx, cy - r * 1.7], [cx + r * 0.35, cy - r * 1.15], [cx + r * 0.8, cy - r * 1.55], [cx + r * 0.75, cy - r * 0.85]], C(K.gold), L);
  }
  if (o.beard && !knight) shape(g, [[cx - f * r * 0.1, cy + r * 0.35], [cx + f * r * 0.95, cy + r * 0.25], [cx + f * r * 0.6, cy + r * 1.25], [cx + f * r * 0.2, cy + r * 1.05], [cx - f * r * 0.15, cy + r * 0.8]], C(o.beard), { ...L, smooth: true });
  disc(g, q.hF[0], q.hF[1], 7 * s, C(knight ? K.steel : K.skin), L);
  if (o.wingsFront) o.wingsFront(q, C);
  return q;
}
export function sword(g, hx, hy, ang, len, s = 1, o = {}) {
  const c = Math.cos(ang), sn = Math.sin(ang), px = -sn, py = c, w = 9 * s, sil = o.sil, lw = 5 * Math.sqrt(s), out = sil ? (o.silOut || sil) : OUT;
  const g0 = [hx + c * 18 * s, hy + sn * 18 * s], tip = [hx + c * len, hy + sn * len];
  shape(g, [[g0[0] + px * w, g0[1] + py * w], [tip[0] - c * 40 * s + px * w * 0.8, tip[1] - sn * 40 * s + py * w * 0.8], tip, [tip[0] - c * 40 * s - px * w * 0.8, tip[1] - sn * 40 * s - py * w * 0.8], [g0[0] - px * w, g0[1] - py * w]], sil || COL.blade, { lw, out });
  if (!sil) shape(g, [[g0[0], g0[1]], [tip[0] - c * 40 * s, tip[1] - sn * 40 * s], tip, [tip[0] - c * 40 * s - px * w * 0.8, tip[1] - sn * 40 * s - py * w * 0.8], [g0[0] - px * w, g0[1] - py * w]], COL.bladeS, { lw: 0 });
  shape(g, [[g0[0] + px * 30 * s - c * 4 * s, g0[1] + py * 30 * s - sn * 4 * s], [g0[0] + px * 30 * s + c * 6 * s, g0[1] + py * 30 * s + sn * 6 * s], [g0[0] - px * 30 * s + c * 6 * s, g0[1] - py * 30 * s + sn * 6 * s], [g0[0] - px * 30 * s - c * 4 * s, g0[1] - py * 30 * s - sn * 4 * s]], sil || COL.gold, { lw, out });
  disc(g, hx - c * 12 * s, hy - sn * 12 * s, 7 * s, sil || COL.gold, { lw, out });
  return tip;
}
export function slash(g, cx, cy, r, a0, a1, k, color = '#ffffff', edge = '#5ad8ff') {   // crisp crescent, not a glow
  if (k <= 0 || k >= 1) return; const a = lerp(a0, a1, ease.out(Math.min(1, k * 1.5))), start = lerp(a0, a, k > 0.66 ? (k - 0.66) * 3 : 0), th = 46 * (1 - k * 0.5);
  const dir = a1 > a0 ? 1 : -1, N = 24, outer = [], inner = [];
  for (let i = 0; i <= N; i++) { const u = i / N, ang = lerp(start, a, u), w = th * Math.sin(u * Math.PI) ** 0.7; outer.push([cx + Math.cos(ang) * (r + w / 2), cy + Math.sin(ang) * (r + w / 2)]); inner.push([cx + Math.cos(ang) * (r - w / 2), cy + Math.sin(ang) * (r - w / 2)]); }
  shape(g, outer.concat(inner.reverse()), color, { lw: 6, out: edge });
}

// ---------- world: dusk over Camelot, flat colour bands ----------
const SKY = ['#2b1d5c', '#4a2475', '#7a2f7f', '#c4467a', '#f07a5a', '#ffb86a'];
function world(g, t, cam, o = {}) {
  const GY = o.gy ?? H() * 0.8, z = cam.z ?? 1;
  const layer = (depth, fn) => { g.save(); const zz = 1 + (z - 1) * depth; g.translate(W() / 2, H() / 2); g.scale(zz, zz); g.translate(-W() / 2 - (cam.x || 0) * depth, -H() / 2 - (cam.y || 0) * depth); fn(); g.restore(); };
  layer(0.1, () => {
    const top = -H(), bot = GY - 120; SKY.forEach((c, i) => { g.fillStyle = c; const y0 = lerp(top, bot, i / SKY.length) + (i ? 0 : -400); g.fillRect(-W(), y0, W() * 3, (bot - top) / SKY.length + 600); });
    disc(g, W() * 0.68, GY - 260, 150, '#fff1c4', { lw: 0 }); disc(g, W() * 0.68, GY - 260, 190, null, { lw: 4, out: '#ffd9a0' });
    const cl = (x, y, s2) => { shape(g, [[x, y], [x + 120 * s2, y - 50 * s2], [x + 260 * s2, y - 30 * s2], [x + 380 * s2, y - 70 * s2], [x + 520 * s2, y]], '#f7a7a0', { lw: 0, smooth: true }); g.fillStyle = '#d0708a'; g.fillRect(x, y - 6, 520 * s2, 10); };
    cl(W() * 0.05, GY - 520, 1.1); cl(W() * 0.55, GY - 640, 0.8); cl(W() * 0.82, GY - 420, 0.7);
  });
  layer(0.3, () => {
    shape(g, [[-W(), GY - 120], [W() * 0.1, GY - 300], [W() * 0.35, GY - 200], [W() * 0.6, GY - 330], [W() * 0.95, GY - 180], [W() * 2, GY - 260], [W() * 2, GY + 200], [-W(), GY + 200]], '#5a2f7a', { lw: 0, smooth: true });
    const bx = W() * 0.2, by = GY - 250, cc = '#3a1d5c';           // Camelot silhouette
    g.fillStyle = cc; g.fillRect(bx, by - 120, 240, 120); for (const [tx, th] of [[-20, 230], [100, 290], [220, 210]]) { g.fillRect(bx + tx, by - th, 50, th); shape(g, [[bx + tx - 8, by - th], [bx + tx + 25, by - th - 60], [bx + tx + 58, by - th]], cc, { lw: 0 }); }
    g.fillStyle = '#ffd23a'; for (const [wx, wy] of [[30, -160], [125, -220], [245, -150], [150, -80], [60, -60]]) g.fillRect(bx + wx, by + wy, 10, 16);
  });
  layer(0.6, () => { shape(g, [[-W(), GY - 40], [W() * 0.3, GY - 130], [W() * 0.75, GY - 60], [W() * 2, GY - 140], [W() * 2, GY + 300], [-W(), GY + 300]], '#2e3f78', { lw: 0, smooth: true }); });
  layer(1, () => {
    g.fillStyle = '#2c6e5a'; g.fillRect(-W(), GY, W() * 3, H() * 2); g.fillStyle = '#245a4a'; g.fillRect(-W(), GY + 70, W() * 3, H() * 2);
    g.strokeStyle = '#1a3e34'; g.lineWidth = 4; g.lineCap = 'round'; const r = rng(4); for (let i = 0; i < 40; i++) { const x = r() * W() * 1.6 - W() * 0.3, y = GY + 20 + r() * 240; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y - 18); g.moveTo(x + 8, y); g.lineTo(x + 12, y - 22); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 5; g.beginPath(); g.moveTo(-W(), GY); g.lineTo(W() * 2, GY); g.stroke();
  });
  return GY;
}
function stone(g, x, GY, crack = 0) {
  const pts = [[x - 170, GY + 6], [x - 150, GY - 70], [x - 80, GY - 130], [x + 30, GY - 140], [x + 120, GY - 100], [x + 175, GY + 6]];
  shape(g, pts, '#9a96b4');
  g.save(); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip(); g.fillStyle = '#6a6488'; g.fillRect(x + 20, GY - 160, 200, 200); g.fillStyle = '#c8c4dc'; g.fillRect(x - 150, GY - 140, 70, 30); g.fillStyle = '#4f8a5a'; g.fillRect(x - 175, GY - 20, 350, 30); g.restore();
  shape(g, pts, null);
  if (crack > 0) { g.strokeStyle = OUT; g.lineWidth = 5; g.lineCap = 'round'; const c = [[x, GY - 138], [x - 18, GY - 100], [x + 12, GY - 70], [x - 14, GY - 30], [x + 4, GY]]; g.beginPath(); g.moveTo(c[0][0], c[0][1]); for (let i = 1; i <= Math.ceil(crack * 4); i++) g.lineTo(c[i][0], c[i][1]); g.stroke(); }
}
export const withCam = (g, cam, fn) => { g.save(); g.translate(W() / 2, H() / 2); g.scale(cam.z || 1, cam.z || 1); g.translate(-W() / 2 - (cam.x || 0), -H() / 2 - (cam.y || 0)); fn(); g.restore(); };
export const jolt = (t, amp) => { const k = Math.floor(t * 12); return [(hash(k) - 0.5) * 2 * amp, (hash(k + 50) - 0.5) * 2 * amp]; };   // shake on twos

// ---------- impact frame: flat colour field, black silhouettes, clustered wedges ----------
export function impactFrame(g, t, palette, focus, drawSil, seed) {
  const k = Math.floor(t * 12), [bg, fg, acc] = palette[k % palette.length];
  g.fillStyle = bg; g.fillRect(-W(), -H(), W() * 3, H() * 3);
  wedges(g, focus[0], focus[1], fg, seed + (k % 2), { clusters: 6, inner: 200 });
  drawSil(fg, acc);
  sparkle(g, focus[0], focus[1], 170, acc, { edge: fg, ring: fg, rot: k * 0.3 });
}

// ================= shots =================
registerShot('a01', { draw(g, t) {
  const cam = { z: lerp(1.0, 1.1, ease.inOut(t / 1.75)), x: lerp(-60, 30, ease.inOut(t / 1.75)) };
  const GY = world(g, t, cam);
  withCam(g, cam, () => { const sx = W() * 0.6; stone(g, sx, GY); sword(g, sx - 4, GY - 310, Math.PI / 2, 200, 1.1);
    const tq = twos(t); sparkle(g, sx - 4, GY - 320, 26 + 10 * Math.sin(tq * 12), '#ffffff', { ring: '#5ad8ff', rot: tq });
    const hx = lerp(W() * 0.16, W() * 0.42, ease.out(tq / 1.75)), ph = (tq * 3) % 1;
    character(g, hx, GY, 1.45, ph < 0.5 ? P.walkA : P.walkB, { cape: true, crown: true, t, wind: 0.7 }); });
  text(g, 'CAMELOT, 500 AD', 90, H() - 60, { size: 40, color: '#fff6e8', font: FONTS.title, weight: 700, align: 'left', spacing: 4, stroke: 8, strokeColor: OUT, alpha: t > 0.4 ? 1 : 0 });
} });
registerShot('a02', { draw(g, t) {
  const k = t / 1.0, [jx, jy] = jolt(t, 2 + 12 * k), cam = { z: lerp(1.9, 2.1, k), x: 120 + jx, y: 120 + jy };
  const GY = world(g, t, cam);
  withCam(g, cam, () => { const sx = W() * 0.6; stone(g, sx, GY, k); sword(g, sx - 4, GY - 310 - 14 * k, Math.PI / 2, 200, 1.1);
    character(g, sx - 120, GY - 118, 1.45, P.grip, { cape: true, crown: true, t, wind: 1.3, expr: k > 0.4 ? 'shout' : 'calm' });
    puffs(g, sx, GY - 10, k, 6, 3, { s: 0.8 });
    const tq = twos(t); for (let i = 0; i < 3; i++) sparkle(g, sx - 40 + i * 40 + Math.sin(tq * 9 + i) * 20, GY - 330 + i * 30, 14 + i * 4, '#fff6c8', { edge: OUT, rot: tq + i }); });
} });
registerShot('a03', { draw(g, t) {      // IMPACT: the pull
  const GY = H() * 0.9, pal = [['#ffe14d', OUT, '#ffffff'], [OUT, '#ffe14d', '#ff3d6e'], ['#ff3d6e', OUT, '#ffe14d']];
  impactFrame(g, t, pal, [W() * 0.5, H() * 0.18], (fg) => { const q = character(g, W() * 0.46, GY, 2.5, P.heave, { sil: fg, crown: true, cape: true, t: 0 }); sword(g, q.hF[0], q.hF[1], -Math.PI / 2 + 0.1, 560, 2.2, { sil: fg }); }, 3);
} });
registerShot('a04', { draw(g, t) {
  const [jx, jy] = jolt(t, 7 * (1 - t / 1.5)), cam = { z: lerp(1.25, 1.12, ease.out(t / 1.5)), x: jx, y: 70 + jy };
  const GY = world(g, t, cam, { gy: H() * 0.88 });
  withCam(g, cam, () => {
    const x = W() / 2, tq = twos(t), bw = 90 + 14 * Math.sin(tq * 14);
    g.fillStyle = '#bdf4ff'; g.fillRect(x - bw, -H(), bw * 2, GY - 560 + H()); g.fillStyle = '#ffffff'; g.fillRect(x - bw * 0.45, -H(), bw * 0.9, GY - 560 + H());
    g.strokeStyle = OUT; g.lineWidth = 5; g.beginPath(); g.moveTo(x - bw, -H()); g.lineTo(x - bw, GY - 560); g.moveTo(x + bw, -H()); g.lineTo(x + bw, GY - 560); g.stroke();
    const q = character(g, x, GY, 2.25, P.raise, { cape: true, crown: true, t, wind: 1.8, expr: 'shout' });
    sword(g, (q.hF[0] + q.hB[0]) / 2, (q.hF[1] + q.hB[1]) / 2, -Math.PI / 2, 300, 1.6);
    puffs(g, x, GY, t / 1.5, 10, 8, { s: 1.4 });
    const r = rng(12); for (let i = 0; i < 7; i++) { const sx2 = x + (r() - 0.5) * 700, sy2 = GY - 300 - r() * 600, on = ((Math.floor(tq * 12) + i) % 3) !== 0; if (on) sparkle(g, sx2, sy2, 18 + r() * 30, '#ffffff', { edge: OUT, ring: i % 2 ? '#ffe14d' : null, rot: i }); }
  });
} });
registerShot('a05', { draw(g, t) {
  const cam = { z: 1.15, x: lerp(120, 40, t / 0.75) };
  const GY = world(g, t, cam);
  withCam(g, cam, () => {
    const tq = twos(t), kx = lerp(W() * 1.15, W() * 0.67, ease.out(tq / 0.75)), ph = (tq * 4) % 1;
    g.fillStyle = '#ffffff'; const r = rng(5); for (let i = 0; i < 9; i++) { const y = GY - 40 - r() * 380, L = 160 + r() * 360, x0 = kx + 60 + r() * 200; g.beginPath(); g.moveTo(x0, y - 3); g.lineTo(x0 + L, y); g.lineTo(x0, y + 3); g.fill(); }
    const kq = character(g, kx, GY, 2.0, ph < 0.5 ? P.charge : mixP(P.charge, P.walkB, 0.3), { knight: true, facing: -1, t });
    sword(g, kq.hF[0], kq.hF[1], -Math.PI * 0.72, 250, 1.4);
    puffs(g, kx + 80, GY, (t * 2) % 1, 4, 11, { s: 0.7 });
    const q = character(g, W() * 0.3, GY, 2.0, P.ready, { cape: true, crown: true, t, wind: 1.5, expr: 'calm' });
    sword(g, q.hF[0], q.hF[1], -0.35, 270, 1.4);
  });
} });
registerShot('a06', { draw(g, t) {      // IMPACT: clash
  const GY = H() * 0.84, pal = [['#ff3d6e', OUT, '#ffffff'], ['#ffffff', OUT, '#ff3d6e'], [OUT, '#ffffff', '#ffe14d']];
  impactFrame(g, t, pal, [W() * 0.52, H() * 0.4], (fg) => {
    const a = character(g, W() * 0.34, GY, 2.15, P.lunge, { sil: fg, crown: true, cape: true, t: 0 }); sword(g, a.hF[0], a.hF[1], -0.3, 300, 1.5, { sil: fg });
    const k = character(g, W() * 0.68, GY, 2.15, P.charge, { sil: fg, knight: true, facing: -1, t: 0 }); sword(g, k.hF[0], k.hF[1], -Math.PI * 0.82, 280, 1.5, { sil: fg }); }, 7);
} });
registerShot('a07', { draw(g, t) {
  const tq = twos(t), hitT = 1.17, [jx, jy] = t > hitT && t < hitT + 0.35 ? jolt(t, 16) : [0, 0];
  const cam = { z: lerp(1.3, 1.06, ease.out(t / 1.75)), x: lerp(0, 120, ease.inOut(t / 1.75)) + jx, y: jy };
  const GY = world(g, t, cam);
  withCam(g, cam, () => {
    const ax = W() * 0.4, pose = seqP(tq, [[0, P.lunge], [0.17, P.windup], [0.5, P.ready], [0.75, P.windup], [1.08, P.lunge]]);
    const sa = key(tq, [[0, -0.3], [0.17, -2.6], [0.5, 0.3], [0.75, -2.7], [1.08, 0.1]], ease.out);
    const q = character(g, ax, GY, 2.1, pose, { cape: true, crown: true, t, wind: 2, expr: 'shout' });
    slash(g, q.sh[0], q.sh[1], 330, -2.6, 0.3, prog(t, 0.17, 0.62)); slash(g, q.sh[0], q.sh[1], 330, -2.7, 0.2, prog(t, 0.75, 1.25), '#ffffff', '#ffd23a');
    sword(g, q.hF[0], q.hF[1], sa, 280, 1.45);
    const kk = ease.out(prog(tq, hitT, 1.75)), kx = lerp(W() * 0.68, W() * 1.05, kk), ky = GY - Math.sin(kk * Math.PI) * 230;
    const kq = character(g, kx, ky, 2.0, t < hitT ? P.charge : P.thrown, { knight: true, facing: -1, t });
    if (t < hitT) sword(g, kq.hF[0], kq.hF[1], -Math.PI * 0.8, 260, 1.4);
    else { const fx = W() * 0.8 + kk * 300, fy = GY - 320 - kk * 420; sword(g, fx, fy, tq * 14, 240, 1.3); puffs(g, W() * 0.7, GY, (t - hitT) * 1.6, 8, 21); sparkle(g, W() * 0.66, GY - 230, 90 * (1 - kk) + 10, '#ffffff', { edge: OUT, ring: '#ffd23a', rot: tq }); }
  });
} });
registerShot('a08', { draw(g, t) {      // IMPACT: final strike + diagonal split
  const GY = H() * 0.9, pal = [['#ffffff', OUT, '#ffd23a'], ['#ffe14d', OUT, '#ffffff'], [OUT, '#ff3d6e', '#ffffff']];
  impactFrame(g, t, pal, [W() * 0.78, H() * 0.45], (fg) => { const q = character(g, W() * 0.46, GY, 2.6, P.lunge, { sil: fg, crown: true, cape: true, t: 0 }); sword(g, q.hF[0], q.hF[1], 0.04, 430, 2.0, { sil: fg }); }, 13);
  const k = Math.floor(t * 12); g.fillStyle = k % 2 ? '#ffffff' : OUT; g.beginPath(); g.moveTo(-50, H() * 0.98); g.lineTo(W() + 50, H() * 0.02); g.lineTo(W() + 50, H() * 0.02 + 14); g.lineTo(-50, H() * 0.98 + 14); g.fill();
} });
registerShot('a09', { draw(g, t) {
  const cam = { z: lerp(1.2, 1.0, ease.out(t / 2.5)), y: lerp(-30, 0, ease.out(t / 2.5)) };
  const GY = world(g, t, cam);
  withCam(g, cam, () => { const x = W() * 0.5, tq = twos(t);
    sword(g, x + 80, GY - 210, Math.PI / 2, 220, 1.3);
    character(g, x, GY, 1.75, { ...P.stand, eF: [24, -136], hF: [40, -112], eB: [-8, -136], hB: [-14, -102] }, { cape: true, crown: true, t, wind: 1.2, expr: 'calm' });
    if ((Math.floor(tq * 12) % 6) < 2) sparkle(g, x + 4, GY - 1.75 * 248, 30, '#ffffff', { edge: OUT, rot: 0.4 }); });
  const k = ease.outBack(prog(t, 0.3, 0.7)); if (k > 0) { g.save(); g.translate(W() / 2, H() * 0.17); g.scale(k, k); g.rotate(-0.03);
    text(g, 'KING ARTHUR', 10, 10, { size: 160, color: OUT, font: FONTS.title, weight: 700, spacing: 10 });
    text(g, 'KING ARTHUR', 0, 0, { size: 160, color: '#ffe14d', font: FONTS.title, weight: 700, spacing: 10, stroke: 14, strokeColor: OUT });
    g.restore(); }
  if (t > 0.8) { const k2 = ease.out(prog(t, 0.8, 1.1)); g.save(); g.globalAlpha = k2; g.fillStyle = '#ff3d6e'; g.translate(W() / 2, H() * 0.28); g.rotate(-0.03); g.fillRect(-370, -30, 740, 60); g.strokeStyle = OUT; g.lineWidth = 6; g.strokeRect(-370, -30, 740, 60); text(g, 'THE SWORD IN THE STONE', 0, 2, { size: 38, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 6 }); g.restore(); }
  const tq = twos(t); for (const [sx, sy, sz] of [[W() * 0.2, H() * 0.12, 34], [W() * 0.82, H() * 0.22, 26]]) if (t > 0.6) sparkle(g, sx, sy, sz * (0.8 + 0.2 * Math.sin(tq * 10)), '#ffffff', { edge: OUT });
} });
