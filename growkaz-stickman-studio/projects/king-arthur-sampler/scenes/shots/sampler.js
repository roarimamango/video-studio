// King Arthur neon sampler — fluid neon line art: few strokes, strong glow, smears and impact frames.
import { E, registerShot, ease, prog, clamp, lerp, key, rng, shake, glow, alpha, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';

const C = { hero: '#00e5ff', cape: '#ff2e88', gold: '#ffd23a', foe: '#ff3b3b', stone: '#7a5cff', white: '#ffffff', sky: ['#05030c', '#12062a', '#2a0c48'] };
const W = () => E.W, H = () => E.H;

// ---------- neon strokes ----------
function smoothPath(g, pts) {                      // catmull-rom through points
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}
function neon(g, pts, color, w = 8, o = {}) {
  if (pts.length < 2) return;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha *= o.a ?? 1;
  if (!o.flat) { g.globalCompositeOperation = 'lighter'; g.shadowColor = color; g.shadowBlur = w * 3.2; }
  g.strokeStyle = color; g.lineWidth = w; smoothPath(g, pts); g.stroke();
  if (!o.flat) { g.shadowBlur = 0; g.strokeStyle = alpha('#ffffff', 0.85); g.lineWidth = w * 0.32; smoothPath(g, pts); g.stroke(); }
  g.restore();
}
function neonCircle(g, x, y, r, color, w = 8, o = {}) {
  g.save(); g.globalAlpha *= o.a ?? 1;
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  if (!o.flat) { g.globalCompositeOperation = 'lighter'; g.shadowColor = color; g.shadowBlur = w * 3.2; }
  g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  if (!o.flat) { g.shadowBlur = 0; g.strokeStyle = alpha('#fff', 0.85); g.lineWidth = w * 0.32; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); }
  g.restore();
}

// ---------- poses (rig points; feet y=0, up is -y, facing +x) ----------
const P = {
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
const mixP = (a, b, k) => { const o = {}; for (const n in a) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
const seqP = (t, keys) => { for (let i = keys.length - 1; i >= 0; i--) if (t >= keys[i][0]) { const n = keys[i + 1]; if (!n) return keys[i][1]; const k = ease.inOut(clamp((t - keys[i][0]) / Math.min(0.18, n[0] - keys[i][0]))); return mixP(keys[i][1], n[1], k); } return keys[0][1]; };

// fluid figure: head ring + 3 strokes (spine+legs, arms) + optional crown, cape, helmet, sword
function hero(g, x, y, s, p, o = {}) {
  const f = o.facing ?? 1, c = o.color || C.hero, w = (o.w ?? 9) * Math.sqrt(s);
  const T = ([px, py]) => [x + px * s * f, y + py * s];
  const pt = {}; for (const k in p) pt[k] = T(p[k]);
  const t = o.t || 0;
  if (o.cape) {                                     // flowing cape: one magenta stroke trailing behind the shoulders
    const sx = pt.sh[0], sy = pt.sh[1], wind = o.wind ?? 1, back = -f;
    const pts = []; for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([sx + back * (u * 130 * s * wind + 8 * s), sy + u * 150 * s + Math.sin(t * 7 - u * 4) * 18 * s * u * wind]); }
    neon(g, pts, C.cape, w * 1.1, { a: o.a, flat: o.flat });
  }
  neon(g, [pt.head.map((v, i) => v + (i ? 26 * s : 0)), pt.sh, pt.hip, pt.kF, pt.fF], c, w, { a: o.a, flat: o.flat });
  neon(g, [pt.hip, pt.kB, pt.fB], c, w, { a: o.a, flat: o.flat });
  neon(g, [pt.hB, pt.eB, pt.sh, pt.eF, pt.hF], c, w, { a: o.a, flat: o.flat });
  const hr = 26 * s;
  if (o.helmet) { g.save(); g.globalAlpha *= o.a ?? 1; neon(g, [[pt.head[0] - hr, pt.head[1] + hr], [pt.head[0] - hr, pt.head[1] - hr], [pt.head[0] + hr, pt.head[1] - hr], [pt.head[0] + hr, pt.head[1] + hr]], c, w, { flat: o.flat }); neon(g, [[pt.head[0] - hr * 0.6, pt.head[1] - 2 * s], [pt.head[0] + hr * 0.8 * f, pt.head[1] - 2 * s]], C.white, w * 0.6, { flat: o.flat }); g.restore(); }
  else neonCircle(g, pt.head[0], pt.head[1], hr, c, w, { a: o.a, fill: o.flat ? null : '#05030c', flat: o.flat });
  if (o.crown) { const [hx, hy] = pt.head; neon(g, [[hx - hr * 0.8, hy - hr * 0.9], [hx - hr * 0.6, hy - hr * 1.7], [hx - hr * 0.25, hy - hr * 1.15], [hx, hy - hr * 1.85], [hx + hr * 0.25, hy - hr * 1.15], [hx + hr * 0.6, hy - hr * 1.7], [hx + hr * 0.8, hy - hr * 0.9]], C.gold, w * 0.7, { a: o.a, flat: o.flat }); }
  if (o.eyes !== false && !o.helmet && !o.flat) { g.fillStyle = '#fff'; g.beginPath(); g.arc(pt.head[0] + 9 * s * f, pt.head[1] - 3 * s, 3.2 * s, 0, 7); g.arc(pt.head[0] + 19 * s * f, pt.head[1] - 3 * s, 3.2 * s, 0, 7); g.fill(); }
  return pt;
}
function sword(g, hx, hy, ang, len, o = {}) {      // Excalibur: one long bright stroke + small crossguard
  const ex = hx + Math.cos(ang) * len, ey = hy + Math.sin(ang) * len, px = Math.cos(ang + Math.PI / 2) * 28, py = Math.sin(ang + Math.PI / 2) * 28;
  const gx = hx + Math.cos(ang) * 22, gy = hy + Math.sin(ang) * 22;
  neon(g, [[gx - px, gy - py], [gx + px, gy + py]], C.gold, 8, o);
  neon(g, [[gx, gy], [ex, ey]], o.color || C.white, o.w || 9, o);
  if (!o.flat) glow(g, ex, ey, 60 * (o.glow ?? 1), o.color || '#bff6ff', 0.6);
  return [ex, ey];
}
function smear(g, cx, cy, r, a0, a1, color, w = 60, o = {}) { // fluid crescent slash arc
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= o.a ?? 1;
  for (let i = 0; i < 5; i++) { g.strokeStyle = alpha(color, 0.18 + i * 0.06); g.lineWidth = w * (1 - i * 0.18); g.lineCap = 'round'; g.shadowColor = color; g.shadowBlur = 40; g.beginPath(); g.arc(cx, cy, r - i * 4, a0 + (a1 - a0) * i * 0.04, a1, a1 < a0); g.stroke(); }
  g.shadowBlur = 0; g.strokeStyle = '#fff'; g.lineWidth = w * 0.12; g.beginPath(); g.arc(cx, cy, r, a0 + (a1 - a0) * 0.3, a1, a1 < a0); g.stroke(); g.restore();
}
function speed(g, cx, cy, n, color, a = 0.6, seed = 3, inner = 240, w = 3) {
  const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(color, a); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ang = r() * 6.283, r0 = inner + r() * 200, r1 = r0 + 300 + r() * 900; g.lineWidth = w * (0.4 + r() * 1.6); g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); g.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); g.stroke(); }
  g.restore();
}
function hLines(g, t, color, dir = -1, n = 40, a = 0.5, seed = 5) {
  const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(color, a); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const y = r() * H(), L = 200 + r() * 600, x = ((r() * W() * 2 + dir * t * 4200) % (W() * 2) + W() * 2) % (W() * 2) - W() * 0.5; g.lineWidth = 1 + r() * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y); g.stroke(); }
  g.restore();
}
function sparks(g, x, y, t, n, color, seed = 2, spread = 1) {
  const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ang = r() * 6.283, sp = (300 + r() * 900) * spread, k = (t * (1 + r()) + r()) % 1; const d = sp * k; g.strokeStyle = alpha(color, 1 - k); g.lineWidth = 3; g.beginPath(); g.moveTo(x + Math.cos(ang) * d, y + Math.sin(ang) * d + 300 * k * k); g.lineTo(x + Math.cos(ang) * (d + 30), y + Math.sin(ang) * (d + 30) + 300 * k * k); g.stroke(); }
  g.restore();
}

// ---------- world: synthwave night, few lines ----------
function world(g, t, cam = {}, o = {}) {
  const z = cam.z ?? 1, cx = cam.x || 0, cy = cam.y || 0; let GY = o.gy ?? H() * 0.78;
  const gr = g.createLinearGradient(0, 0, 0, H()); C.sky.forEach((c, i) => gr.addColorStop(i / (C.sky.length - 1), c)); g.fillStyle = gr; g.fillRect(-W(), -H(), W() * 3, H() * 3);
  g.save(); g.translate(W() / 2, H() / 2); g.scale(z, z); g.translate(-W() / 2 - cx, -H() / 2 - cy);
  const r = rng(9); g.fillStyle = '#ffffff'; for (let i = 0; i < 120; i++) { const sx = r() * W() * 1.6 - W() * 0.3, sy = r() * GY * 0.8, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); g.globalAlpha = 0.6 * tw; g.fillRect(sx, sy, 2, 2); } g.globalAlpha = 1;
  neonCircle(g, W() * 0.72, GY - 520, 110, '#ff9ad8', 5, { fill: '#2a0c3a', a: 0.9 });                       // moon
  const m = []; for (let x = -W() * 0.4; x <= W() * 1.4; x += 120) m.push([x, GY - 140 - Math.abs(Math.sin(x * 0.0031 + 1)) * 260 - Math.abs(Math.sin(x * 0.011)) * 60]); neon(g, m, C.stone, 4, { a: 0.8 });   // mountains: one line
  g.restore();
  const LG = GY; GY = (GY - H() / 2 - cy) * z + H() / 2;
  // perspective neon grid floor
  g.save(); g.beginPath(); g.rect(-W(), GY, W() * 3, H()); g.clip(); g.fillStyle = '#07041a'; g.fillRect(-W(), GY, W() * 3, H());
  g.globalCompositeOperation = 'lighter'; const vx = W() / 2 - cx * 0.5;
  for (let i = -24; i <= 24; i++) { g.strokeStyle = alpha('#7a3cff', 0.55); g.lineWidth = 2; g.beginPath(); g.moveTo(vx + i * 30, GY); g.lineTo(vx + i * 420, H() + 200); g.stroke(); }
  const off = (t * (o.gridSpeed ?? 0.6)) % 1; for (let k = 0; k < 14; k++) { const u = (k + off) / 14, y = GY + Math.pow(u, 2.2) * (H() - GY + 80); g.strokeStyle = alpha('#ff2e88', 0.2 + 0.6 * u); g.lineWidth = 1 + u * 3; g.beginPath(); g.moveTo(-W(), y); g.lineTo(W() * 2, y); g.stroke(); }
  g.restore();
  neon(g, [[-W(), GY], [W() * 2, GY]], '#ff2e88', 4);
  return LG;
}
function stone(g, x, GY, s = 1, crack = 0, flat = false) {
  neon(g, [[x - 150 * s, GY], [x - 120 * s, GY - 90 * s], [x - 40 * s, GY - 130 * s], [x + 60 * s, GY - 120 * s], [x + 140 * s, GY - 70 * s], [x + 160 * s, GY]], C.stone, 8 * s, { flat });
  if (crack > 0) neon(g, [[x, GY - 128 * s], [x - 20 * s, GY - 90 * s], [x + 14 * s, GY - 60 * s], [x - 10 * s, GY - 20 * s]].slice(0, 1 + Math.ceil(crack * 3)), '#fff', 4 * s, { flat });
}
// impact frame: posterised flip (white bg / black lines or black bg / white lines), radial lines, RGB split
function impact(g, t, flip, draw, o = {}) {
  const bg = flip ? '#ffffff' : '#000000', fg = flip ? '#000000' : '#ffffff';
  g.fillStyle = bg; g.fillRect(-W(), -H(), W() * 3, H() * 3);
  const r = rng(o.seed || 4); g.fillStyle = fg; const cx = o.cx ?? W() / 2, cy = o.cy ?? H() / 2;
  for (let i = 0; i < 70; i++) { const a = r() * 6.283, w = 0.004 + r() * 0.02, r0 = 160 + r() * 260; g.beginPath(); g.moveTo(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0); g.lineTo(cx + Math.cos(a) * 2400, cy + Math.sin(a) * 2400); g.lineTo(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0); g.fill(); }
  for (const [col, dx] of [[o.c1 || '#00e5ff', -10], [o.c2 || '#ff2e88', 10]]) { g.save(); g.globalAlpha = 0.85; g.translate(dx, 0); draw(g, col); g.restore(); }
  draw(g, fg);
}
const cam = (t, base, amp) => { const [sx, sy] = shake(t, amp, 18, 7); return { ...base, x: (base.x || 0) + sx, y: (base.y || 0) + sy }; };

// ================= shots =================
registerShot('a01', { draw(g, t) {                 // approach: stone glows, Arthur walks in
  const c = { z: lerp(1.0, 1.12, ease.inOut(t / 1.75)), x: lerp(-60, 40, ease.inOut(t / 1.75)) };
  const GY = world(g, t, c); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2 - c.x, -H() / 2);
  const sx = W() * 0.58; stone(g, sx, GY, 1.1); const pulse = 0.6 + 0.4 * Math.sin(t * 9);
  sword(g, sx - 4, GY - 300, Math.PI / 2, 170, { glow: 1.6 * pulse }); glow(g, sx, GY - 220, 260 * pulse, '#00e5ff', 0.3);
  const hx = lerp(W() * 0.14, W() * 0.42, ease.out(t / 1.75)), ph = (t * 3.2) % 1;
  hero(g, hx, GY, 1.5, ph < 0.5 ? mixP(P.walkA, P.walkB, ease.inOut(ph * 2)) : mixP(P.walkB, P.walkA, ease.inOut((ph - 0.5) * 2)), { cape: true, crown: true, t, wind: 0.8 });
  g.restore();
  text(g, 'CAMELOT · 500 AD', 90, H() - 70, { size: 34, color: '#ff9ad8', font: FONTS.ui, weight: 900, align: 'left', spacing: 6, glow: 18, glowColor: '#ff2e88', alpha: clamp((t - 0.3) / 0.3) });
} });
registerShot('a02', { draw(g, t) {                 // grip close-up: shake builds, crack spreads, sparks
  const k = t / 1.0, c = cam(t, { z: lerp(1.9, 2.15, k), x: 90, y: 110 }, 2 + 14 * k * k);
  const GY = world(g, t, c); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2 - c.x, -H() / 2 - c.y);
  const sx = W() * 0.58; stone(g, sx, GY, 1.1, k);
  sword(g, sx - 4, GY - 300 - 10 * k, Math.PI / 2, 170, { glow: 1 + 2 * k });
  hero(g, sx - 110, GY - 110, 1.5, P.grip, { cape: true, crown: true, t, wind: 1.4 });
  g.restore();
  sparks(g, W() * 0.62, H() * 0.62, t * 2.5, Math.floor(10 + 40 * k), '#ffd23a', 5);
  glow(g, W() * 0.6, H() * 0.55, 600 * k, '#00e5ff', 0.4 * k);
  if (k > 0.8) { g.fillStyle = alpha('#ffffff', (k - 0.8) * 2); g.fillRect(0, 0, W(), H()); }
} });
registerShot('a03', { draw(g, t) {                 // IMPACT: sword ripped out (6 frames: white, black, white…)
  const fr = Math.floor(t * 24), flip = fr % 2 === 0, GY = H() * 0.86;
  impact(g, t, flip, (g, col) => { const p = hero(g, W() * 0.46, GY, 2.4, P.heave, { color: col, flat: true, w: 14, cape: false, crown: true, eyes: false }); sword(g, p.hF[0], p.hF[1], -Math.PI / 2 + 0.12, 520, { flat: true, color: col, w: 18 }); }, { cx: W() * 0.5, cy: H() * 0.25, seed: fr + 2 });
  const [sx, sy] = shake(t, 24, 30, 3); g.translate(sx, sy);
} });
registerShot('a04', { draw(g, t) {                 // low angle raise: beam of light, rings, wind
  const c = cam(t, { z: lerp(1.25, 1.12, ease.out(t / 1.5)), y: 60 }, 6 * (1 - t / 1.5));
  const GY = world(g, t, c, { gy: H() * 0.9, gridSpeed: 1.4 }); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2 - (c.x || 0), -H() / 2 - c.y);
  const x = W() / 2 - 40;
  g.save(); g.globalCompositeOperation = 'lighter'; const bw = 70 + 30 * Math.sin(t * 20); const bg = g.createLinearGradient(x - bw, 0, x + bw, 0); bg.addColorStop(0, 'rgba(0,229,255,0)'); bg.addColorStop(0.5, 'rgba(200,250,255,.75)'); bg.addColorStop(1, 'rgba(0,229,255,0)'); g.fillStyle = bg; g.fillRect(x - bw, -H(), bw * 2, GY - 520 + H()); g.restore();
  for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i / 4) % 1; neonCircle(g, x + 40, GY - 640, 60 + ph * 520, '#00e5ff', 5 * (1 - ph), { a: 1 - ph }); }
  const p = hero(g, W() / 2, GY, 2.3, P.raise, { cape: true, crown: true, t: t * 1.4, wind: 1.8 });
  sword(g, (p.hF[0] + p.hB[0]) / 2, (p.hF[1] + p.hB[1]) / 2, -Math.PI / 2, 300, { glow: 3, w: 12 });
  g.restore();
  hLines(g, t, '#ff2e88', -1, 26, 0.35);
  sparks(g, W() / 2, H() * 0.1, t, 40, '#bff6ff', 8, 1.4);
} });
registerShot('a05', { draw(g, t) {                 // red knight charges in from the right
  const c = cam(t, { z: 1.15, x: lerp(120, 40, t / 0.75) }, 5);
  const GY = world(g, t, c, { gridSpeed: 3 }); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2 - c.x, -H() / 2);
  const kx = lerp(W() * 1.15, W() * 0.66, ease.out(t / 0.75));
  for (let i = 3; i >= 1; i--) hero(g, kx + i * 70, GY, 2.0, P.charge, { color: C.foe, helmet: true, facing: -1, a: 0.18 * (4 - i), t });  // afterimages
  const kp = hero(g, kx, GY, 2.0, P.charge, { color: C.foe, helmet: true, facing: -1, t });
  sword(g, kp.hF[0], kp.hF[1], -Math.PI * 0.75, 260, { color: '#ffb0b0', glow: 1.4 });
  const ap = hero(g, W() * 0.3, GY, 2.0, P.ready, { cape: true, crown: true, t, wind: 1.6 });
  sword(g, ap.hF[0], ap.hF[1], -0.35, 260, { glow: 2 });
  g.restore(); hLines(g, t, '#ff3b3b', -1, 50, 0.5, 11);
} });
registerShot('a06', { draw(g, t) {                 // IMPACT: clash, freeze
  const fr = Math.floor(t * 24), flip = fr < 2 || fr === 4, GY = H() * 0.82;
  impact(g, t, flip, (g, col) => { const a = hero(g, W() * 0.36, GY, 2.1, P.lunge, { color: col, flat: true, w: 13, crown: true, eyes: false }); sword(g, a.hF[0], a.hF[1], -0.25, 300, { flat: true, color: col, w: 16 }); const k = hero(g, W() * 0.66, GY, 2.1, P.charge, { color: col, flat: true, w: 13, helmet: true, facing: -1 }); sword(g, k.hF[0], k.hF[1], -Math.PI * 0.82, 280, { flat: true, color: col, w: 16 }); }, { cx: W() * 0.52, cy: H() * 0.42, seed: 7 + fr, c1: '#ff3b3b', c2: '#00e5ff' });
  neonCircle(g, W() * 0.52, H() * 0.42, 60 + fr * 90, flip ? '#000' : '#fff', 10, { flat: true });
} });
registerShot('a07', { draw(g, t) {                 // spin slash: fluid arc, knight thrown
  const c = cam(t, { z: lerp(1.3, 1.05, ease.out(t / 1.75)), x: lerp(0, 120, ease.inOut(t / 1.75)) }, t > 1.2 && t < 1.5 ? 18 : 3);
  const GY = world(g, t, c, { gridSpeed: 2 }); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2 - c.x, -H() / 2 - c.y);
  const ax = W() * 0.4, pose = seqP(t, [[0, P.lunge], [0.15, P.windup], [0.55, P.ready], [0.75, P.windup], [1.15, P.lunge]]);
  const ap = hero(g, ax, GY, 2.1, pose, { cape: true, crown: true, t: t * 2, wind: 2 });
  const sa = key(t, [[0, -0.25], [0.15, -2.6], [0.55, 0.3], [0.75, -2.7], [1.15, 0.1]], ease.out);
  sword(g, ap.hF[0], ap.hF[1], sa, 280, { glow: 2.4 });
  const sw = (a, b, a0, a1) => { const k = prog(t, a, b); if (k > 0 && k < 1) smear(g, ap.sh[0], ap.sh[1], 300, a0, lerp(a0, a1, ease.out(Math.min(1, k * 1.6))), '#00e5ff', 70, { a: 1 - k * 0.7 }); };
  sw(0.15, 0.6, -2.6, 0.3); sw(0.75, 1.3, -2.7, 0.2);
  const hitT = 1.2, kk = ease.out(prog(t, hitT, 1.75)), kx = lerp(W() * 0.66, W() * 1.05, kk), ky = GY - Math.sin(kk * Math.PI) * 220;
  const kp = hero(g, kx, ky, 2.0, t < hitT ? P.charge : P.thrown, { color: C.foe, helmet: true, facing: -1, t });
  if (t < hitT) sword(g, kp.hF[0], kp.hF[1], -Math.PI * 0.8, 260, { color: '#ffb0b0' });
  else { const fx = W() * 0.8 + kk * 300, fy = GY - 300 - kk * 400; g.save(); g.translate(fx, fy); g.rotate(t * 18); neon(g, [[-130, 0], [130, 0]], '#ffb0b0', 8); g.restore(); }
  g.restore();
  if (t > hitT) { sparks(g, W() * 0.66, H() * 0.55, (t - hitT) * 2, 60, '#ffd23a', 3, 1.5); speed(g, W() * 0.66, H() * 0.55, 50, '#ffffff', 0.5 * (1 - kk), 9); }
} });
registerShot('a08', { draw(g, t) {                 // IMPACT: final strike, frame split diagonal
  const fr = Math.floor(t * 24), flip = fr % 2 === 1, GY = H() * 0.86;
  impact(g, t, flip, (g, col) => { const a = hero(g, W() * 0.5, GY, 2.5, P.lunge, { color: col, flat: true, w: 15, crown: true, eyes: false }); sword(g, a.hF[0], a.hF[1], 0.05, 420, { flat: true, color: col, w: 20 }); }, { cx: W() * 0.75, cy: H() * 0.45, seed: 20 + fr, c1: '#ffd23a', c2: '#ff2e88' });
  g.save(); g.fillStyle = flip ? '#000' : '#fff'; g.beginPath(); g.moveTo(-50, H() * 0.95); g.lineTo(W() + 50, H() * 0.05); g.lineTo(W() + 50, H() * 0.05 + 10 + fr * 6); g.lineTo(-50, H() * 0.95 + 10 + fr * 6); g.fill(); g.restore();
} });
registerShot('a09', { draw(g, t) {                 // hero pose + title
  const c = { z: lerp(1.22, 1.0, ease.out(t / 2.5)), y: lerp(-40, 0, ease.out(t / 2.5)) };
  const GY = world(g, t, c); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2, -H() / 2 - c.y);
  const x = W() * 0.5, p = hero(g, x, GY, 1.7, P.stand, { cape: true, crown: true, t, wind: 1.3 });
  const plant = { ...P.stand, eF: [26, -140], hF: [44, -110], eB: [18, -142], hB: [40, -112] };
  g.restore(); g.save(); g.translate(W() / 2, H() / 2); g.scale(c.z, c.z); g.translate(-W() / 2, -H() / 2 - c.y);
  sword(g, x + 75, GY - 200, Math.PI / 2, 200, { glow: 1.6 });
  const tw = (t * 3) % 1; if (tw < 0.25) { const hx = x + 20, hy = GY - 1.7 * 250; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx - 40, hy); g.lineTo(hx + 40, hy); g.moveTo(hx, hy - 40); g.lineTo(hx, hy + 40); g.stroke(); g.restore(); }
  g.restore();
  const on = t > 0.4 && !(t > 0.55 && t < 0.62) && !(t > 0.8 && t < 0.85);
  if (on) { text(g, 'KING ARTHUR', W() / 2, H() * 0.14, { size: 150, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 14, glow: 50, glowColor: '#ff2e88' }); text(g, 'THE SWORD IN THE STONE', W() / 2, H() * 0.245, { size: 40, color: '#00e5ff', font: FONTS.ui, weight: 900, spacing: 12, glow: 24, glowColor: '#00e5ff', alpha: clamp((t - 0.9) / 0.3) }); }
} });
