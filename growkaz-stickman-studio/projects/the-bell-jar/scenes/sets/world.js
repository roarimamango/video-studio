// sets/world.js — every location in The Bell Jar video. Each set: fn(g, t, cam, o) -> { GY, CX, M }
// Value structure: dark mid-tones, 1–3 bright accents (window, lamp, sign). Figures go at depth 1 in front of the brightest area.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS, rng, clamp, lerp, ease, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const ground = () => E.H * V(0.8, 0.68);

// ---------- props ----------
export function desk(g, x, GY, o = {}) {
  const c = o.color || '#21171c', top = GY - 120, w = o.w || 360;
  rr(g, x - w / 2, top, w, 18, 6); g.fillStyle = c; g.fill();
  g.fillStyle = alpha('#ffd9a0', 0.25); g.fillRect(x - w / 2 + 6, top, w - 12, 3);
  for (const dx of [-w / 2 + 18, w / 2 - 30]) { g.fillStyle = c; g.fillRect(x + dx, top + 16, 12, 104); }
  return top;
}
export function typewriter(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const c = o.color || '#2b2a33';
  rr(g, -70, -40, 140, 40, 10); g.fillStyle = c; g.fill();
  rr(g, -80, -58, 160, 16, 8); g.fillStyle = shade(c, -0.3); g.fill();
  rr(g, -56, -96, 112, 44, 3); g.fillStyle = '#efe9dc'; g.fill();          // paper
  g.fillStyle = 'rgba(40,30,30,.5)'; const lines = o.lines ?? 3; for (let i = 0; i < lines; i++) g.fillRect(-46, -88 + i * 9, 60 + ((i * 29) % 30), 3);
  for (let i = 0; i < 9; i++) circle(g, -52 + i * 13, -22, 4.2, '#d8d2c4');
  for (let i = 0; i < 8; i++) circle(g, -46 + i * 13, -10, 4.2, '#d8d2c4');
  g.restore();
}
export function lamp(g, x, y, M, on = 1) {
  seg(g, [[x, y], [x, y - 70], [x + 26, y - 96]], 5, '#141018');
  poly(g, [[x + 6, y - 112], [x + 50, y - 112], [x + 60, y - 84], [x - 4, y - 84]], '#2a2026');
  if (on > 0) { glow(g, x + 28, y - 70, 260, M.practical, 0.45 * on); FX.lightCone(g, x + 28, y - 84, { angle: Math.PI / 2, spread: 0.9, len: 220, color: M.practical, a: 0.22 * on }); }
}
export function book(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot || 0);
  rr(g, -80, -110, 160, 220, 6); g.fillStyle = o.cover || '#2a3a5a'; g.fill();
  g.fillStyle = shade(o.cover || '#2a3a5a', -0.35); g.fillRect(-80, -110, 14, 220);
  if (o.title) text(g, o.title, 6, -40, { size: 22, color: o.ink || '#f2e6c8', font: FONTS.ui, weight: 900 });
  if (o.author) text(g, o.author, 6, 60, { size: 15, color: alpha(o.ink || '#f2e6c8', 0.85), font: FONTS.ui, weight: 800 });
  g.restore();
}
// the motif: a glass bell jar. x = centre, y = base line, w/h = size. o.a = glass opacity, o.fog = breath fog 0..1
export function bellJar(g, x, y, w, h, t = 0, o = {}) {
  const a = o.a ?? 1, rim = o.rim || '#cfe6ff';
  g.save(); g.globalAlpha *= a;
  const path = () => { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); };
  // glass body
  path(); g.closePath(); g.fillStyle = linGrad(g, x - w / 2, 0, x + w / 2, 0, [alpha(rim, 0.16), alpha(rim, 0.03), alpha(rim, 0.05), alpha(rim, 0.18)]); g.fill();
  if (o.fog) { path(); g.closePath(); g.fillStyle = alpha('#dfe8f0', 0.18 * o.fog); g.fill(); }
  path(); g.strokeStyle = alpha(rim, 0.65); g.lineWidth = Math.max(3, w * 0.012); g.stroke();
  // highlights
  g.strokeStyle = alpha('#ffffff', 0.55); g.lineWidth = Math.max(4, w * 0.025); g.lineCap = 'round';
  g.beginPath(); g.arc(x, y - h + w / 2, w / 2 - w * 0.08, Math.PI * 1.12, Math.PI * 1.38); g.stroke();
  g.beginPath(); g.moveTo(x - w / 2 + w * 0.08, y - h + w / 2 + 20); g.lineTo(x - w / 2 + w * 0.08, y - h * 0.18); g.stroke();
  g.strokeStyle = alpha('#ffffff', 0.25); g.lineWidth = Math.max(2, w * 0.01);
  g.beginPath(); g.moveTo(x + w / 2 - w * 0.1, y - h + w / 2 + 40); g.lineTo(x + w / 2 - w * 0.1, y - h * 0.4); g.stroke();
  // knob + base
  circle(g, x, y - h - w * 0.05, w * 0.06, alpha(rim, 0.7)); circle(g, x - w * 0.02, y - h - w * 0.07, w * 0.02, '#ffffff');
  if (!o.noBase) { rr(g, x - w / 2 - w * 0.08, y - 4, w * 1.16, w * 0.06 + 6, 6); g.fillStyle = o.base || '#1a1420'; g.fill();
  g.fillStyle = alpha(rim, 0.35); g.fillRect(x - w / 2 - w * 0.06, y - 4, w * 1.12, 3); }
  glow(g, x - w * 0.22, y - h * 0.7, w * 0.35, '#ffffff', 0.06);
  g.restore();
}
// fig tree: figs = array of {label?, state 0 ripe → 1 black/fallen}; returns fig positions
export function figTree(g, x, GY, s, t, o = {}) {
  const ink = o.ink || '#120e16', M = o.M;
  g.save(); g.translate(x, GY); g.scale(s, s);
  seg(g, [[0, 0], [-6, -200], [10, -320]], 34, ink);
  const br = [[[-6, -200], [-150, -330], [-260, -360]], [[4, -250], [170, -360], [260, -380]], [[10, -320], [-60, -460], [-140, -520]], [[10, -320], [90, -470], [150, -540]], [[8, -300], [10, -500], [0, -590]]];
  for (const b of br) seg(g, b, 16, ink);
  const r = rng(o.seed || 5);
  for (let i = 0; i < 26; i++) { const lx = -300 + r() * 600, ly = -330 - r() * 280; g.fillStyle = shade(o.leaf || '#2f4a32', -0.2 + r() * 0.3); g.beginPath(); g.ellipse(lx, ly, 46, 26, r() * 3, 0, 7); g.fill(); }
  g.restore();
  const spots = [[-255, -352], [255, -372], [-138, -512], [148, -532], [0, -585], [-80, -430], [90, -440]];
  const out = [];
  (o.figs || []).forEach((f, i) => {
    const [sx, sy] = spots[i % spots.length]; const st = clamp(f.state || 0);
    const fall = clamp((st - 0.6) / 0.4), fx = x + sx * s, fy = GY + (sy + 30) * s + fall * fall * (-(sy + 30) * s - 14 * s);
    const col = mix(mix('#8a3a7a', '#5a2a4a', clamp(st / 0.5)), '#120a10', clamp((st - 0.3) / 0.4));
    const rad = 26 * s * (1 - 0.25 * clamp(st / 0.6));
    if (st < 0.3) glow(g, fx, fy, rad * 4, o.glowC || '#ffcf8f', 0.35 * (1 - st / 0.3) * (f.glow ?? 1));
    seg(g, [[fx, fy - rad * 1.6], [fx, fy - rad * 0.8]], 4 * s, ink);
    g.fillStyle = col; g.beginPath(); g.ellipse(fx, fy, rad * 0.9, rad, 0, 0, 7); g.fill();
    if (st < 0.4) circle(g, fx - rad * 0.3, fy - rad * 0.35, rad * 0.2, alpha('#ffffff', 0.5 * (1 - st / 0.4)));
    if (st > 0.35) { g.strokeStyle = alpha('#000', 0.4); g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(fx + (k - 1) * rad * 0.3, fy, rad * 0.5, 1, 2.2); g.stroke(); } }
    out.push({ x: fx, y: fy, r: rad, st });
  });
  return out;
}

// ---------- sets ----------
function floor(g, GY, M, k = -0.1) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, k), shade(M.dark, -0.3)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
  FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.22)', 0.08);
}
function citySky(g, M, GY, o = {}) {
  backdrop(g, M.sky);
  if (o.stars !== false) FX.stars(g, 0, { count: 90, area: [-E.W, 0, E.W * 3, GY - 300], color: '#dfe6ff' });
  if (o.moon) FX.moon(g, E.W / 2 + 420, GY - 640, 34);
  FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 120, maxH: 420, color: mix(M.sky[0], '#05060c', 0.5), windowColor: alpha(M.practical, 0.6), lit: 0.22, seed: o.seed || 8 });
}

// bedroom / study (Wellesley home, England flat, London flat). o.window: 'suburb'|'city'|'snow'|'dawn', o.bed, o.desk
export function room(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = ground(), CX = E.W / 2, wall = shade(M.wall, -0.25), wallD = shade(M.wall, -0.55);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [wallD, wall, shade(wall, -0.15)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H + 4);
    const wx = CX + (o.winX ?? -40) - 230, wy = GY - 640, ww = 460, wh = 440;
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: wallD, bar: 12, blinds: o.blinds || 0 }, (g, x, y, w, h) => {
      const kind = o.window || 'suburb';
      const sky = kind === 'dawn' ? ['#1d2550', '#6a5a8e', '#e8a07a'] : kind === 'snow' ? ['#0e1430', '#2a3460', '#4a5488'] : kind === 'day' ? ['#8fb0d8', '#cfdcea', '#efe3d2'] : M.sky;
      g.fillStyle = linGrad(g, 0, y, 0, y + h, sky); g.fillRect(x, y, w, h);
      if (kind === 'city' || kind === 'snow' || kind === 'dawn') FX.skyline(g, { x: x - 20, y: y + h, w: w + 40, minH: 60, maxH: 220, color: mix(sky[0], '#000', 0.55), windowColor: alpha(M.practical, 0.7), lit: kind === 'dawn' ? 0.1 : 0.3, seed: 4 });
      else { FX.moon(g, x + w * 0.72, y + h * 0.25, 22); FX.tree(g, x + w * 0.2, y + h + 20, 1.1, mix(sky[0], '#000', 0.6)); FX.tree(g, x + w * 0.85, y + h + 30, 0.9, mix(sky[0], '#000', 0.6)); }
      if (kind === 'snow') FX.snow(g, t, { count: 60, speed: 40 });
    });
    glow(g, wx + ww / 2, wy + wh / 2, 520, M.key, 0.1);
    if (o.shelf !== false) { const sx = CX + 330; g.fillStyle = wallD; g.fillRect(sx, GY - 520, 260, 14); g.fillRect(sx, GY - 400, 260, 14); const r = rng(9); for (const yy of [GY - 520, GY - 400]) { let bx = sx + 6; while (bx < sx + 240) { const bw = 12 + r() * 14, bh = 50 + r() * 36; g.fillStyle = mix(['#7a3a3a', '#3a5a7a', '#6a5a3a', '#4a3a5a'][Math.floor(r() * 4)], wallD, 0.45); g.fillRect(bx, yy - bh, bw, bh); bx += bw + 2; } } }
  });
  layer(g, cam, 0.9, (g) => {
    floor(g, GY, M);
    FX.pool(g, CX + (o.winX ?? -40), GY + 40, 380, 60, M.key, 0.14);
    if (o.bed) FX.bed(g, { x: CX + 120, y: GY, w: 460, color: shade(M.wall, 0.1), frame: wallD, pillow: shade(M.key, -0.2) });
    if (o.desk) { const dx = CX + (o.deskX ?? -300); const top = desk(g, dx, GY); if (o.typewriter !== false) typewriter(g, dx + 30, top, 0.9, { lines: o.lines ?? 4 }); if (o.lamp !== false) lamp(g, dx - 140, top, M, o.lampOn ?? 1); }
  });
  return { GY, CX, M };
}

// Manhattan night street with the Barbizon facade
export function street(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => citySky(g, M, GY - 160, { moon: o.moon }));
  layer(g, cam, 0.5, (g) => {
    const top = GY - 1100; const c = shade(M.wall, 0.05);
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(c, -0.1), c, shade(c, -0.45)]); g.fillRect(CX - 520, top, 1040, GY - top);
    for (let row = 0; row < 12; row++) for (let col = 0; col < 8; col++) { const wx = CX - 470 + col * 120, wy = top + 60 + row * 78; const lit = ((row * 7 + col * 3) % 5) < 2; g.fillStyle = lit ? alpha(M.practical, 0.85) : shade(c, -0.5); g.fillRect(wx, wy, 44, 50); if (lit) glow(g, wx + 22, wy + 25, 60, M.practical, 0.18); }
    rr(g, CX - 200, GY - 330, 400, 70, 8); g.fillStyle = '#1a0e14'; g.fill();
    text(g, 'THE BARBIZON', CX, GY - 295, { size: 44, color: '#ffb0c8', glow: 26, glowColor: 'rgba(255,90,140,.9)', spacing: 6 });
    rr(g, CX - 90, GY - 230, 180, 230, 6); g.fillStyle = alpha(M.practical, 0.9); g.fill(); glow(g, CX, GY - 120, 300, M.practical, 0.35);
    poly(g, [[CX - 260, GY - 250], [CX + 260, GY - 250], [CX + 230, GY - 214], [CX - 230, GY - 214]], '#3a1a24');
    FX.facade(g, { x: CX - 1700, y: GY, w: 1150, h: 620, color: shade(M.wall, -0.2), win: M.practical, cols: 9, rows: 5, lit: 0.4, seed: 3 });
    FX.facade(g, { x: CX + 560, y: GY, w: 1150, h: 700, color: shade(M.wall, -0.25), win: M.practical, cols: 9, rows: 6, lit: 0.35, seed: 5 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.road, 0.05), shade(M.dark, -0.3)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    g.fillStyle = alpha('#000', 0.3); g.fillRect(-E.W * 2, GY + 70, E.W * 5, 6);
    for (const x of [CX - 700, CX + 700]) FX.lampPost(g, x, GY + 10, 380, { light: M.practical, a: 0.25 });
    FX.pool(g, CX, GY + 40, 360, 50, M.practical, 0.3);
  });
  return { GY, CX, M };
}

// rooftop over Manhattan at night
export function rooftop(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 160, area: [-E.W, 0, E.W * 3, E.H * 0.6] }); FX.moon(g, CX + 520, GY - 720, 40); });
  layer(g, cam, 0.35, (g) => { FX.skyline(g, { x: -E.W, y: GY - 60, w: E.W * 3, minH: 200, maxH: 640, minW: 60, maxW: 160, color: '#0c1024', windowColor: alpha(M.practical, 0.75), lit: 0.3, seed: 21 }); FX.fog(g, GY - 260, 240, M.fog, 0.25); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#1d2036', '#0a0b14']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    g.fillStyle = '#141626'; g.fillRect(-E.W * 2, GY - 40, E.W * 5, 40); g.fillStyle = alpha(M.rim, 0.25); g.fillRect(-E.W * 2, GY - 40, E.W * 5, 3);
    const wt = CX - 700; g.fillStyle = '#10121e'; g.fillRect(wt - 80, GY - 420, 160, 230); poly(g, [[wt - 92, GY - 420], [wt + 92, GY - 420], [wt, GY - 480]], '#10121e'); for (const dx of [-60, 60]) seg(g, [[wt + dx, GY - 190], [wt + dx * 1.2, GY - 40]], 8, '#10121e');
  });
  return { GY: GY - 40, CX, M };
}

// Mademoiselle office: warm interior, big windows on Manhattan, desks
export function office(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = ground(), CX = E.W / 2, wall = shade(M.wall, -0.3), wallD = shade(M.wall, -0.6);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = wall; g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    for (const i of [-2, -1, 0, 1, 2]) {
      const wx = CX + i * 420 - 170, wy = GY - 700;
      FX.windowFrame(g, { x: wx, y: wy, w: 340, h: 520, cols: 2, rows: 3, frame: wallD, bar: 10, blinds: 10 }, (g, x, y, w, h) => {
        g.fillStyle = linGrad(g, 0, y, 0, y + h, mood('golden').sky); g.fillRect(x, y, w, h);
        FX.skyline(g, { x: x - 10, y: y + h, w: w + 20, minH: 120, maxH: 380, color: '#3a2a3a', windowColor: alpha('#ffe7b0', 0.6), lit: 0.15, seed: 30 + i });
      });
      glow(g, wx + 170, wy + 260, 380, M.key, 0.12);
    }
    text(g, 'MADEMOISELLE', CX, GY - 760, { size: 40, color: alpha('#ffd0dc', 0.85), font: FONTS.serif, weight: 900, italic: true, spacing: 8 });
  });
  layer(g, cam, 0.9, (g) => {
    floor(g, GY, M, -0.2);
    for (const i of [-2, 2]) { const dx = CX + i * 380; const top = desk(g, dx, GY, { w: 300 }); typewriter(g, dx, top, 0.8); }
    FX.pool(g, CX, GY + 40, 600, 70, M.key, 0.14);
  });
  return { GY, CX, M };
}

// Wellesley suburb house exterior. o.mood day|dusk|night, o.search (flashlight beams), o.crawl (crawl-space hatch glow)
export function suburb(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); if (o.mood === 'night') { FX.stars(g, t, { count: 140 }); FX.moon(g, CX - 560, GY - 700, 30); } else FX.sun(g, CX + 600, GY - 260, 50, '#fff3dc', M.key, 4); FX.clouds(g, { y: GY - 760, color: '#ffe7c7', a: 0.08 }); });
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: GY - 120, amp: 40, color: mix(M.sky[0], '#000', 0.5) }); for (let i = -6; i < 8; i++) FX.tree(g, CX + i * 260 + ((i * 53) % 90), GY - 90, 1.3 + (i % 3) * 0.2, mix(M.sky[0], '#000', 0.62)); });
  layer(g, cam, 0.6, (g) => {
    const hx = CX + (o.houseX ?? 160), w = 760, top = GY - 420, c = shade(M.wall, -0.15);
    g.fillStyle = c; g.fillRect(hx - w / 2, top, w, 420); poly(g, [[hx - w / 2 - 50, top + 4], [hx + w / 2 + 50, top + 4], [hx, top - 230]], shade(c, -0.35));
    g.fillStyle = shade(c, -0.5); g.fillRect(hx + 180, top - 200, 60, 120);
    const lit = o.mood === 'day' ? 0.4 : 1;
    for (const [wx, wy] of [[-260, 90], [-100, 90], [140, 90], [260, 90], [-260, 250], [260, 250]]) { g.fillStyle = mix(shade(c, -0.5), M.practical, lit * (o.dark ? 0.2 : 0.85)); g.fillRect(hx + wx - 40, top + wy, 80, 100); g.fillStyle = shade(c, -0.4); g.fillRect(hx + wx - 3, top + wy, 6, 100); if (lit > 0.5 && !o.dark) glow(g, hx + wx, top + wy + 50, 120, M.practical, 0.2); }
    FX.door(g, { x: hx - 50, y: GY, w: 100, h: 190, color: shade(c, -0.3), open: 0, light: M.practical });
    g.fillStyle = shade(c, -0.55); g.fillRect(hx - w / 2, GY - 34, w, 34);              // foundation
    if (o.crawl) { const k = o.crawl; g.fillStyle = mix('#05040a', '#fff3dc', 0.85 * k); g.fillRect(hx + 160, GY - 30, 70, 26); glow(g, hx + 195, GY - 16, 260 * k, '#fff3dc', 0.5 * k); }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.grass, -0.35), shade(M.dark, -0.4)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    if (o.mood !== 'night') FX.pool(g, CX, GY + 40, 600, 60, M.key, 0.12);
  });
  return { GY, CX, M };
}

// McLean Hospital: cool interior, tall windows with trees, bed / chairs
export function hospital(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = ground(), CX = E.W / 2, wall = shade(M.wall, -0.15), wallD = shade(M.wall, -0.5);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [wallD, wall]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    g.fillStyle = shade(wall, 0.08); g.fillRect(-E.W * 2, GY - 300, E.W * 5, 10);
    for (const i of o.windows || [-1, 1]) {
      const wx = CX + i * 380 - 150, wy = GY - 720;
      FX.windowFrame(g, { x: wx, y: wy, w: 300, h: 560, cols: 2, rows: 4, frame: wallD, bar: 9, arch: true }, (g, x, y, w, h) => {
        g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#cfe0f0', '#9fb8d0', '#6a86a0']); g.fillRect(x, y, w, h);
        FX.tree(g, x + w * 0.4, y + h + 60, 1.6, '#3a5060');
      });
      FX.godRays(g, wx + 150, wy + 120, { angle: Math.PI * 0.62 - i * 0.12, spread: 0.4, len: 1200, color: '#dfeaff', a: 0.06, t });
    }
  });
  layer(g, cam, 0.9, (g) => {
    floor(g, GY, M, 0.05);
    for (const i of o.windows || [-1, 1]) FX.pool(g, CX + i * 380 + 120, GY + 60, 260, 46, '#dfeaff', 0.16);
    if (o.bed) FX.bed(g, { x: CX + 140, y: GY, w: 440, color: '#c8d2e0', frame: '#3a4058', pillow: '#eef2f8' });
    if (o.chairs) { FX.chair(g, CX - 230, GY, 1.4, '#1c2034'); FX.chair(g, CX + 230, GY, 1.4, '#1c2034'); }
    if (o.door) { FX.door(g, { x: CX - 90, y: GY, w: 180, h: 420, color: '#2a2e48', open: o.door, light: '#fff6e0' }); if (o.door > 0) { FX.pool(g, CX, GY + 50, 280 * o.door, 50, '#fff6e0', 0.35); glow(g, CX, GY - 200, 400 * o.door, '#fff6e0', 0.25); } }
  });
  return { GY, CX, M };
}

// Cambridge party: warm hall, arched windows, crowd silhouettes, string lights
export function party(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = ground(), CX = E.W / 2, wall = shade(M.wall, -0.35);
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = wall; g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    for (const i of [-3, -1, 1, 3]) FX.windowFrame(g, { x: CX + i * 260 - 90, y: GY - 640, w: 180, h: 420, cols: 2, rows: 3, frame: shade(wall, -0.4), bar: 8, arch: true }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, mood('night').sky); g.fillRect(x, y, w, h); FX.stars(g, 0, { count: 12, area: [x, y, w, h] }); });
    for (let k = 0; k < 2; k++) for (let i = -14; i <= 14; i++) { const x = CX + i * 70, y = GY - 700 + k * 60 + Math.cos(i * 0.45) * 30; circle(g, x, y, 5, '#ffe2a8'); glow(g, x, y, 40, '#ffcf8f', 0.5); }
  });
  layer(g, cam, 0.7, (g) => { FX.crowd(g, t, { x: -E.W * 0.5, y: GY - 120, w: E.W * 2, rows: 3, rowH: 30, size: 2.4, color: shade(wall, -0.5), cheer: 0.3 }); });
  layer(g, cam, 0.9, (g) => { floor(g, GY, M, -0.25); FX.pool(g, CX, GY + 40, 520, 60, M.key, 0.2); });
  return { GY, CX, M };
}

// abstract dark stage with a spotlight (bell jar / fig tree / data)
export function stage(g, t, cam, o = {}) {
  const M = mood(o.mood || 'void'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.2, (g) => { backdrop(g, o.sky || [shade(M.sky[0], -0.2), M.sky[1], shade(M.fog, -0.1)]); FX.stars(g, t, { count: 60, color: '#9fb6d8' }); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.floor, 0.1), M.dark]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    if (o.spot !== false) { FX.lightCone(g, CX + (o.spotX || 0), -100, { angle: Math.PI / 2, spread: 0.34, len: GY + 200, color: o.spotC || '#dfe8ff', a: 0.12 }); FX.pool(g, CX + (o.spotX || 0), GY + 20, 420, 60, o.spotC || '#dfe8ff', 0.28); }
  });
  return { GY, CX, M };
}

// London, winter 1962–63: snowy terrace street at night, one lit window
export function london(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#0a0f24', '#1a2246', '#2e3866']); FX.stars(g, t, { count: 40 }); });
  layer(g, cam, 0.5, (g) => {
    for (let i = -4; i <= 4; i++) {
      const hx = CX + i * 340, top = GY - 640, c = shade('#2a2e4a', (i % 2) * 0.05);
      g.fillStyle = c; g.fillRect(hx - 168, top, 336, 640); g.fillStyle = shade(c, -0.4); g.fillRect(hx - 176, top - 20, 352, 22); g.fillRect(hx + 90, top - 90, 40, 70);
      g.fillStyle = '#e8eef8'; g.fillRect(hx - 176, top - 26, 352, 8);
      for (const [wx, wy] of [[-90, 90], [60, 90], [-90, 290], [60, 290]]) { const lit = o.lit && i === 0 && wy === 90 && wx === 60; g.fillStyle = lit ? mix('#ffcf8a', '#1a1e34', 1 - (o.lit || 0)) : '#141830'; g.fillRect(hx + wx - 34, top + wy, 68, 120); if (lit) glow(g, hx + wx, top + wy + 60, 200, '#ffcf8a', 0.45 * o.lit); }
      FX.door(g, { x: hx - 40, y: GY, w: 80, h: 170, color: shade(c, -0.3) });
    }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#c8d2e6', '#5a6488']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.lampPost(g, CX - 520, GY + 6, 360, { light: '#ffcf8a', a: 0.22 }); FX.pool(g, CX - 486, GY + 30, 240, 40, '#ffcf8a', 0.3); });
  FX.snow(g, t, { count: 220, speed: 70 });
  return { GY, CX, M };
}

// travel backdrops for 'wherever she went': ship deck / Paris café / Bangkok
export function travel(g, t, cam, o = {}) {
  const place = o.place || 'ship', GY = ground(), CX = E.W / 2;
  const M = mood(place === 'ship' ? 'day' : place === 'paris' ? 'dusk' : 'golden');
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.sun(g, CX + 500, GY - 380, 46, '#fff3dc', M.key, 4); FX.clouds(g, { y: GY - 760, color: '#ffffff', a: 0.12 }); });
  layer(g, cam, 0.4, (g) => {
    const sil = mix(M.sky[0], '#000', 0.55);
    if (place === 'ship') { g.fillStyle = linGrad(g, 0, GY - 200, 0, GY, ['#3a6a9a', '#1a3a5a']); g.fillRect(-E.W * 2, GY - 200, E.W * 5, 260); for (let i = 0; i < 30; i++) { g.fillStyle = alpha('#ffffff', 0.15); g.fillRect(-E.W + ((i * 173 + t * 40) % (E.W * 3)), GY - 180 + (i % 6) * 30, 60, 3); } }
    if (place === 'paris') { poly(g, [[CX - 380, GY - 120], [CX - 300, GY - 120], [CX - 330, GY - 700]], sil); poly(g, [[CX - 420, GY - 120], [CX - 260, GY - 120], [CX - 300, GY - 320], [CX - 380, GY - 320]], sil); FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 60, maxH: 180, color: sil, windowColor: alpha(M.practical, 0.6), lit: 0.25, seed: 14 }); }
    if (place === 'bangkok') { for (const [x, h] of [[-420, 560], [-250, 420], [380, 500]]) { poly(g, [[CX + x - 60, GY - 120], [CX + x + 60, GY - 120], [CX + x, GY - 120 - h]], sil); circle(g, CX + x, GY - 120 - h * 0.45, 50, sil); } FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 40, maxH: 140, color: sil, windowColor: alpha(M.practical, 0.5), lit: 0.2, seed: 15 }); for (let i = -5; i < 6; i++) FX.tree(g, CX + i * 300, GY - 100, 0.9, sil); }
  });
  layer(g, cam, 0.9, (g) => {
    if (place === 'ship') { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#6a4a34', '#2a1a14']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; for (let x = -E.W; x < E.W * 2; x += 60) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x - 120, E.H * 2); g.stroke(); } seg(g, [[-E.W, GY - 110], [E.W * 2, GY - 110]], 8, '#efe6d6'); for (let x = -E.W; x < E.W * 2; x += 140) seg(g, [[x, GY - 110], [x, GY]], 6, '#efe6d6'); }
    else { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.floor, -0.1), shade(M.dark, -0.3)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H); if (place === 'paris') { for (const dx of [-520, 520]) { rr(g, CX + dx - 90, GY - 130, 180, 14, 6); g.fillStyle = '#1e1418'; g.fill(); seg(g, [[CX + dx, GY - 120], [CX + dx, GY]], 8, '#1e1418'); } poly(g, [[CX - 700, GY - 520], [CX + 700, GY - 520], [CX + 660, GY - 460], [CX - 660, GY - 460]], '#8f3328'); } }
    FX.pool(g, CX, GY + 40, 500, 60, M.key, 0.14);
  });
  return { GY, CX, M };
}

export const SETS = { travel, room, street, rooftop, office, suburb, hospital, party, stage, london };
