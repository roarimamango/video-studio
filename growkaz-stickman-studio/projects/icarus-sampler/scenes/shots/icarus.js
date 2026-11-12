// Icarus — anime cel sampler (reuses the King Arthur cel toolkit).
import { E, registerShot, ease, prog, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { shape, disc, sparkle, wedges, puffs, character, P, mixP, seqP, twos, hash, withCam, jolt, OUT } from '/projects/king-arthur-anime/scenes/shots/anime.js';

const W = () => E.W, H = () => E.H;
const ICARUS = { tunic: '#f4efe4', tunicS: '#c8bca4', trim: '#e0703a', hair: '#2a1a14', hairS: '#1a100c', pants: '#c8bca4', boot: '#8a5a32', skin: '#f2c9a0', skinS: '#d49a78' };
const DAEDALUS = { tunic: '#3a6e8a', tunicS: '#24485c', trim: '#e0b03a', hair: '#e8e4dc', hairS: '#b8b2a8', pants: '#24485c', boot: '#6a4026', skin: '#e8b890', skinS: '#c08868' };
const FLY = { head: [40, -172], sh: [26, -146], hip: [0, -92], eF: [56, -176], hF: [84, -196], eB: [-6, -176], hB: [-30, -196], kF: [-34, -64], fF: [-78, -46], kB: [-44, -76], fB: [-90, -70] };
const RUN = { head: [26, -196], sh: [16, -164], hip: [0, -94], eF: [40, -150], hF: [58, -170], eB: [-20, -150], hB: [-40, -132], kF: [40, -60], fF: [30, 0], kB: [-26, -40], fB: [-60, -30] };
const LEAP = { head: [34, -206], sh: [22, -174], hip: [0, -104], eF: [50, -200], hF: [70, -230], eB: [-10, -200], hB: [-30, -230], kF: [30, -70], fF: [10, -40], kB: [-30, -76], fB: [-70, -56] };
const SPREAD = { ...P.stand, eF: [30, -170], hF: [56, -190], eB: [-24, -170], hB: [-50, -190] };
const WARN = { ...P.stand, eF: [30, -170], hF: [60, -178], eB: [-6, -136], hB: [-8, -100] };

// feathered wing from the shoulder. flap: -1 down .. 1 up. missing: set of feather indices gone, melt: 0..1 wax drips
function wing(g, sx, sy, s, f, flap, o = {}) {
  const ang = -Math.PI / 2 - f * (0.55 - flap * 0.7), L = 230 * s, tip = [sx + Math.cos(ang) * L * f * -1 * -1, sy + Math.sin(ang) * L];
  const tx = sx + Math.cos(ang) * L, ty = sy + Math.sin(ang) * L, back = -f;
  const n = 9, lead = [];
  for (let i = 0; i <= n; i++) { const u = i / n, bend = Math.sin(u * Math.PI) * 30 * s; lead.push([lerp(sx, tx, u) + back * bend * 0.3, lerp(sy, ty, u) - bend]); }
  const fc = o.color || '#fbf7ee', fs = o.shade || '#d8cfbe', sil = o.sil;
  for (let i = n; i >= 1; i--) {                                   // primary feathers hang behind the leading edge
    if (o.missing?.has(i)) continue; const [px, py] = lead[i], len = (60 + i * 11) * s, a = ang + Math.PI * 0.62 * f * -1 + (o.loose?.(i) || 0);
    const ex = px + Math.cos(a) * len * -f * -1, ey = py + Math.sin(a) * len;
    const fx = px + back * len * 0.95 * Math.abs(Math.cos(ang)) + back * len * 0.5, fy = py + len * 0.85;
    shape(g, [[px - 9 * s, py], [fx - 6 * s, fy], [fx + 8 * s, fy + 6 * s], [px + 11 * s, py + 4 * s]], sil || (i % 2 ? fc : fs), { lw: 4 * Math.sqrt(s), out: sil ? sil : OUT, smooth: true });
  }
  shape(g, lead.concat([[lead[n][0] + back * 20 * s, lead[n][1] + 26 * s]], lead.slice(0, n).reverse().map(([x, y]) => [x + back * 26 * s, y + 36 * s])), sil || '#e8a24a', { lw: 4 * Math.sqrt(s), out: sil || OUT, smooth: true });  // wax-and-wood arm band
  if (o.melt && !sil) { const t = o.t || 0; for (let i = 2; i <= n; i += 2) { const [px, py] = lead[i], k = ((twos(t) * 1.4 + i * 0.13) % 1); disc(g, px + back * 14 * s, py + 30 * s + k * 120 * s * o.melt, 7 * s * (1 - k * 0.5), '#ffb84a', { lw: 3 }); } }
}
const wingsFor = (g, s, f, flap, o = {}) => ({
  wingsBack: (q) => wing(g, q.sh[0] - f * 6 * s, q.sh[1] + 4 * s, s * 0.95, f, flap * 0.85 - 0.08, { ...o, color: o.sil ? null : '#e8e0d0', shade: '#c4b8a4', missing: o.missingB }),
  wingsFront: (q) => wing(g, q.sh[0] + f * 4 * s, q.sh[1] + 6 * s, s, f, flap, o),
});

// ---------- world: Aegean, flat bands ----------
function sky(g, cam, bands, sun) {
  const layer = (d, fn) => { g.save(); const z = 1 + ((cam.z ?? 1) - 1) * d; g.translate(W() / 2, H() / 2); g.scale(z, z); g.rotate((cam.r || 0) * d); g.translate(-W() / 2 - (cam.x || 0) * d, -H() / 2 - (cam.y || 0) * d); fn(); g.restore(); };
  layer(0.1, () => { bands.forEach((c, i) => { g.fillStyle = c; const y0 = lerp(-H() * 0.1, H() * 0.75, i / bands.length); g.fillRect(-W() * 2, i ? y0 : y0 - H() * 2, W() * 5, (i ? 0 : H() * 2) + H() * 0.85 / bands.length + (i === bands.length - 1 ? H() * 3 : 2)); });
    if (sun) { const [x, y, r, t] = sun; g.save(); g.translate(x, y); g.rotate(twos(t) * 0.4); g.fillStyle = '#ffe680'; for (let i = 0; i < 14; i++) { g.rotate(Math.PI * 2 / 14); g.beginPath(); g.moveTo(r * 1.05, -r * 0.12); g.lineTo(r * (1.55 + (i % 2) * 0.35), 0); g.lineTo(r * 1.05, r * 0.12); g.fill(); } g.restore(); disc(g, x, y, r, '#fff4c2', { lw: 0 }); disc(g, x, y, r * 0.8, '#ffffff', { lw: 0 }); } });
  return layer;
}
function clouds(g, t, layer, list, color = '#ffffff', shadeC = '#f2c4b4') {
  layer(0.5, () => { for (const [x, y, s] of list) { shape(g, [[x, y], [x + 70 * s, y - 60 * s], [x + 170 * s, y - 80 * s], [x + 260 * s, y - 40 * s], [x + 320 * s, y]], color, { lw: 4, smooth: true }); g.fillStyle = shadeC; g.fillRect(x + 10 * s, y - 10 * s, 300 * s, 10 * s); } });
}
function sea(g, layer, y, t) {
  layer(0.9, () => { g.fillStyle = '#2a8ab8'; g.fillRect(-W() * 2, y, W() * 5, H() * 3); g.fillStyle = '#1f6e9a'; g.fillRect(-W() * 2, y + 90, W() * 5, H() * 3); g.fillStyle = '#185a82'; g.fillRect(-W() * 2, y + 240, W() * 5, H() * 3);
    g.strokeStyle = '#d8f2ff'; g.lineWidth = 4; g.lineCap = 'round'; const r = rng(3); const k = twos(t); for (let i = 0; i < 26; i++) { const x = r() * W() * 2.4 - W() * 0.7 + Math.sin(k * 3 + i) * 10, yy = y + 20 + r() * 380; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + 20, yy - 10, x + 40, yy); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 5; g.beginPath(); g.moveTo(-W() * 2, y); g.lineTo(W() * 3, y); g.stroke(); });
}
const DAWN = ['#3a5fa8', '#6a7ec8', '#b88ec8', '#f2a6a0', '#ffd09a', '#fff0c0'];
const NOON = ['#2a7ad8', '#3e94e8', '#5aaef0', '#86c8f4', '#b8e2fa'];
const BLAZE = ['#ff8a3a', '#ffb04a', '#ffd06a', '#ffe8a0'];

registerShot('b01', { draw(g, t) {           // clifftop: Daedalus warns, Icarus spreads the wings
  const cam = { z: lerp(1.0, 1.1, ease.inOut(t / 2)), x: lerp(-40, 40, ease.inOut(t / 2)) }, GY = H() * 0.74, layer = sky(g, cam, DAWN, [W() * 0.78, H() * 0.42, 90, t]);
  clouds(g, t, layer, [[W() * 0.05, H() * 0.25, 1], [W() * 0.55, H() * 0.18, 0.7]]);
  sea(g, layer, H() * 0.6, t);
  withCam(g, cam, () => {
    shape(g, [[-W(), GY], [W() * 0.72, GY], [W() * 0.78, GY + 80], [W() * 0.74, H() * 1.5], [-W(), H() * 1.5]], '#c8a27a');
    g.fillStyle = '#9a7656'; g.fillRect(W() * 0.5, GY + 4, W() * 0.24, 60); g.fillStyle = '#5a9a5a'; g.fillRect(-W(), GY - 2, W() * 1.72, 16); shape(g, [[-W(), GY], [W() * 0.72, GY]], null);
    const tq = twos(t), flap = Math.sin(tq * 6) * 0.25 + 0.2;
    character(g, W() * 0.3, GY, 1.6, seqP(tq, [[0, P.stand], [0.6, WARN]]), { pal: DAEDALUS, beard: '#e8e4dc', t, expr: 'calm' });
    const ic = W() * 0.52, w = wingsFor(g, 1.7, 1, flap, { t });
    character(g, ic, GY, 1.7, seqP(tq, [[0, P.stand], [0.4, SPREAD]]), { pal: ICARUS, t, expr: tq > 1.2 ? 'shout' : 'calm', ...w });
  });
  text(g, 'CRETE, THE AGE OF MYTH', 90, H() - 60, { size: 40, color: '#fff6e8', font: FONTS.title, weight: 700, align: 'left', spacing: 4, stroke: 8, strokeColor: OUT, alpha: t > 0.4 ? 1 : 0 });
} });
registerShot('b02', { draw(g, t) {           // sprint and leap
  const tq = twos(t), cam = { z: 1.2, x: lerp(-100, 260, ease.inOut(t / 1.5)), y: lerp(0, -120, ease.in(t / 1.5)) }, GY = H() * 0.74, layer = sky(g, cam, DAWN, [W() * 0.85, H() * 0.42, 90, t]);
  sea(g, layer, H() * 0.6, t);
  withCam(g, cam, () => {
    shape(g, [[-W(), GY], [W() * 0.72, GY], [W() * 0.78, GY + 80], [W() * 0.74, H() * 1.5], [-W(), H() * 1.5]], '#c8a27a'); g.fillStyle = '#5a9a5a'; g.fillRect(-W(), GY - 2, W() * 1.72, 16); shape(g, [[-W(), GY], [W() * 0.72, GY]], null);
    const k = clamp(tq / 1.5), x = lerp(W() * 0.25, W() * 0.95, ease.in(k)), air = Math.max(0, k - 0.62) / 0.38, y = GY - Math.sin(Math.min(1, air) * Math.PI * 0.6) * 260;
    const pose = air > 0 ? LEAP : ((tq * 4) % 1 < 0.5 ? RUN : mixP(RUN, P.walkB, 0.6)), flap = air > 0 ? Math.sin(tq * 14) : -0.4;
    if (air > 0 && air < 0.5) puffs(g, W() * 0.72, GY, air * 2, 6, 4, { s: 0.9, fill: '#f2e2c8', shade: '#c8a27a' });
    g.fillStyle = '#ffffff'; const r = rng(8); for (let i = 0; i < 7; i++) { const yy = y - 60 - r() * 300, L = 140 + r() * 260, x0 = x - 120 - r() * 300 - L; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + L, yy - 3); g.lineTo(x0 + L, yy + 3); g.fill(); }
    character(g, x, y, 1.7, pose, { pal: ICARUS, t, expr: air > 0 ? 'shout' : 'calm', ...wingsFor(g, 1.7, 1, flap, { t }) });
  });
} });
registerShot('b03', { draw(g, t) {           // soaring
  const tq = twos(t), cam = { z: 1.0, x: 0, y: Math.sin(t * 2) * 20, r: -0.08 }, layer = sky(g, cam, NOON, [W() * 0.82, H() * 0.18, 110, t]);
  const cx = (u) => ((u - t * 900) % (W() * 1.8) + W() * 1.8) % (W() * 1.8) - W() * 0.4;
  clouds(g, t, layer, [[cx(200), H() * 0.35, 1.3], [cx(1300), H() * 0.55, 1], [cx(2200), H() * 0.25, 0.8]], '#ffffff', '#c4def2');
  sea(g, layer, H() * 0.86, t);
  withCam(g, { ...cam }, () => { const flap = Math.sin(tq * 10), y = H() * 0.86 - flap * 30;
    g.fillStyle = '#ffffff'; const r = rng(2); for (let i = 0; i < 8; i++) { const yy = y - 100 - r() * 300, L = 200 + r() * 400, x0 = W() * 0.5 - 300 - r() * 500 - L; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + L, yy - 3); g.lineTo(x0 + L, yy + 3); g.fill(); }
    character(g, W() * 0.5, y, 1.9, FLY, { pal: ICARUS, t, expr: 'shout', ...wingsFor(g, 1.9, 1, flap, { t }) });
    for (let i = 0; i < 3; i++) { const k = (tq * 1.5 + i / 3) % 1; sparkle(g, W() * 0.5 - 200 - k * 600, y - 120 + i * 70, 18 * (1 - k) + 4, '#ffffff', { edge: OUT, rot: k * 3 }); } });
  text(g, 'HIGHER...', W() * 0.5, H() * 0.14, { size: 90, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 8, stroke: 12, strokeColor: OUT, alpha: t > 0.8 ? 1 : 0 });
} });
registerShot('b04', { draw(g, t) {           // into the sun: wax drips, feathers peel off
  const tq = twos(t), [jx, jy] = jolt(t, 2 + 6 * t), cam = { z: lerp(1.0, 1.15, t / 1.2), x: jx, y: jy, r: -0.25 }, layer = sky(g, cam, BLAZE, [W() * 0.62, H() * 0.32, 300 + t * 60, t]);
  const k = t / 1.2, lost = Math.floor(k * 6), missing = new Set([9, 7, 5, 8, 3, 6].slice(0, lost));
  withCam(g, cam, () => { const flap = Math.sin(tq * 12) * 0.8, x = W() * 0.42, y = H() * 0.78;
    character(g, x, y, 2.1, FLY, { pal: ICARUS, t, expr: k > 0.5 ? 'shout' : 'calm', ...wingsFor(g, 2.1, 1, flap, { t, melt: 1, missing, missingB: missing }) });
    const r = rng(6); for (let i = 0; i < lost + 2; i++) { const age = (tq * 1.2 + r()) % 1, fx = x - 100 - age * 500 + r() * 200, fy = y - 300 + age * 400 + r() * 100; g.save(); g.translate(fx, fy); g.rotate(age * 6 + i); shape(g, [[-10, -40], [10, -40], [6, 40], [-6, 40]], '#fbf7ee', { lw: 4, smooth: true }); g.restore(); }
  });
  if ((Math.floor(t * 12) % 2) === 0) { g.fillStyle = 'rgba(255,240,180,0.18)'; g.fillRect(0, 0, W(), H()); }
  text(g, 'TOO HIGH.', W() * 0.5, H() * 0.86, { size: 90, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 8, stroke: 12, strokeColor: OUT, alpha: t > 0.5 ? 1 : 0 });
} });
registerShot('b05', { draw(g, t) {           // IMPACT: the wing breaks
  const k = Math.floor(t * 12), pal = [['#ff7a2a', OUT, '#ffffff'], ['#ffffff', OUT, '#ff7a2a'], [OUT, '#ffe680', '#ffffff']][k % 3], [bg, fg, acc] = pal;
  g.fillStyle = bg; g.fillRect(0, 0, W(), H()); wedges(g, W() * 0.6, H() * 0.35, fg, 31 + (k % 2), { clusters: 6, inner: 220 });
  g.save(); g.translate(W() * 0.45, H() * 0.82); g.rotate(-0.4); g.translate(-W() * 0.45, -H() * 0.82);
  character(g, W() * 0.45, H() * 0.82, 2.4, FLY, { pal: ICARUS, sil: fg, t: 0, ...wingsFor(g, 2.4, 1, -0.6, { sil: fg, missing: new Set([2, 3, 4, 5, 6, 7, 8, 9]) }) });
  g.restore();
  const r = rng(9); for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = 160 + r() * 420 + k * 40; g.save(); g.translate(W() * 0.6 + Math.cos(a) * d, H() * 0.35 + Math.sin(a) * d); g.rotate(a); shape(g, [[-12, -46], [12, -46], [7, 46], [-7, 46]], fg, { lw: 0, smooth: true }); g.restore(); }
  sparkle(g, W() * 0.6, H() * 0.35, 150, acc, { edge: fg, ring: fg, rot: k * 0.4 });
} });
registerShot('b06', { draw(g, t) {           // the fall: tumbling, feathers drift upward
  const tq = twos(t), cam = { z: 1.1, x: 0, y: 0 }, layer = sky(g, cam, NOON.slice().reverse().concat(['#2a7ad8']), null);
  g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.lineCap = 'round'; const r = rng(4); for (let i = 0; i < 14; i++) { const x = r() * W(), L = 200 + r() * 400, y0 = ((r() * H() * 1.5 - tq * 2600) % (H() * 1.5) + H() * 1.5) % (H() * 1.5) - H() * 0.25; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + L); g.stroke(); }
  const x = W() * 0.5 + Math.sin(tq * 2) * 60, y = H() * 0.62;
  g.save(); g.translate(x, y - 150); g.rotate(Math.PI * 0.9 + tq * 2.2); g.translate(-x, -(y - 150));
  character(g, x, y, 2.0, P.fall || FLY, { pal: ICARUS, t, expr: 'shout', ...wingsFor(g, 2.0, 1, 0.9, { t, missing: new Set([2, 3, 4, 5, 6, 7, 8, 9]), missingB: new Set([3, 5, 6, 7, 8, 9]) }) });
  g.restore();
  const r2 = rng(14); for (let i = 0; i < 12; i++) { const age = (tq * 0.8 + r2()) % 1, fx = W() * 0.5 + (r2() - 0.5) * 900 + Math.sin(age * 6 + i) * 60, fy = H() * 0.7 - age * 900; g.save(); g.translate(fx, fy); g.rotate(Math.sin(age * 5 + i) * 0.8); shape(g, [[-12, -46], [12, -46], [7, 46], [-7, 46]], i % 2 ? '#fbf7ee' : '#e8e0d0', { lw: 4, smooth: true }); g.restore(); }
} });
registerShot('b07', { draw(g, t) {           // wide: tiny splash; title
  const tq = twos(t), cam = { z: lerp(1.15, 1.0, ease.out(t / 1.6)) }, layer = sky(g, cam, DAWN.slice(2), [W() * 0.8, H() * 0.36, 80, t]);
  clouds(g, t, layer, [[W() * 0.1, H() * 0.3, 0.8], [W() * 0.6, H() * 0.22, 0.6]]);
  sea(g, layer, H() * 0.62, t);
  withCam(g, cam, () => { const sx = W() * 0.62, sy = H() * 0.66, hit = 0.55;
    if (t < hit) { const k = t / hit, fy = lerp(H() * 0.05, sy, k * k); g.save(); g.translate(sx, fy); g.rotate(tq * 6); shape(g, [[-10, -24], [10, -24], [8, 24], [-8, 24]], OUT, { lw: 0 }); g.restore(); }
    else { const k = clamp((t - hit) / 0.9), up = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 160;
      shape(g, [[sx - 90, sy], [sx - 60, sy - up * 0.6], [sx - 30, sy - up * 0.3], [sx, sy - up], [sx + 30, sy - up * 0.35], [sx + 60, sy - up * 0.7], [sx + 90, sy]], '#ffffff', { lw: 5, out: OUT });
      for (let i = 0; i < 3; i++) { const rk = clamp(k * 1.2 - i * 0.2); if (rk > 0 && rk < 1) { g.strokeStyle = '#ffffff'; g.lineWidth = 6 * (1 - rk); g.beginPath(); g.ellipse(sx, sy + 6, 100 + rk * 420, 16 + rk * 50, 0, 0, 7); g.stroke(); } } }
    const r = rng(21); for (let i = 0; i < 6; i++) { const fx = sx + (r() - 0.5) * 700, fy = H() * 0.2 + r() * 300 + twos(t) * 120 * (0.6 + r()); g.save(); g.translate(fx, fy); g.rotate(Math.sin(twos(t) * 2 + i)); shape(g, [[-8, -30], [8, -30], [5, 30], [-5, 30]], '#fbf7ee', { lw: 3, smooth: true }); g.restore(); } });
  const k = ease.outBack(prog(t, 0.7, 1.1)); if (k > 0) { g.save(); g.translate(W() / 2, H() * 0.18); g.scale(k, k); g.rotate(-0.02);
    text(g, 'ICARUS', 10, 10, { size: 170, color: OUT, font: FONTS.title, weight: 700, spacing: 14 }); text(g, 'ICARUS', 0, 0, { size: 170, color: '#ffd23a', font: FONTS.title, weight: 700, spacing: 14, stroke: 14, strokeColor: OUT }); g.restore(); }
  if (t > 1.05) { g.save(); g.globalAlpha = ease.out(prog(t, 1.05, 1.3)); g.translate(W() / 2, H() * 0.3); g.rotate(-0.02); g.fillStyle = '#ff7a2a'; g.fillRect(-430, -30, 860, 60); g.strokeStyle = OUT; g.lineWidth = 6; g.strokeRect(-430, -30, 860, 60); text(g, 'HE FLEW TOO CLOSE TO THE SUN', 0, 2, { size: 38, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 5 }); g.restore(); }
} });
