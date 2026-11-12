// shots/templates.js — every 2D shot is a template + params from story/shots.json (params.type).
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, rng, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, radGrad, text, measure, FONTS, S, wordTime, backdrop } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos, EXPR } from '/engine/rig2d.js';
// engine draws 'worried' and 'angry' brows mirrored; swap them so sad faces read as sad
const BROW = { worried: 'angry', angry: 'worried' };
const fixFace = (e) => { const b = EXPR[e]?.brows; return BROW[b] ? { brows: BROW[b] } : undefined; };
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS, ground, bellJar, figTree, book, typewriter, desk, lamp } from '../sets/world.js';
import { WHO } from '../cast.js';

const T = {};                 // template registry
const pick = (v, t) => (Array.isArray(v) ? keyed(v, t) : v);
const keyed = (keys, t) => { let cur = keys[0][1]; for (const [k, v] of keys) if (t >= k) cur = v; return cur; };
const fade = (t, dur, a = 0.3, b = 0.3) => clamp(Math.min(t / a, (dur - t) / b));
const camOf = (p, t, dur) => { const c = p.cam || [1, 1.06, 0, 0, 0, 0]; const k = ease.inOut(clamp(t / dur)); return { z: lerp(c[0], c[1], k), x: lerp(c[2] || 0, c[3] ?? c[2] ?? 0, k), y: lerp(c[4] || 0, c[5] ?? c[4] ?? 0, k), r: p.roll ? p.roll * Math.sin(t * 0.4) : 0 }; };
const drawSet = (g, t, cam, p) => { const so = { ...(p.so || {}) }; if (p.litFade) so.lit = 1 - clamp((t - p.litFade[0]) / (p.litFade[1] - p.litFade[0])); return (SETS[p.set || 'stage'])(g, t, cam, so); };

// ---- figures from params ----
function figures(g, t, info, GY, CX, M, list, cam) {
  for (const [i, f] of (list || []).entries()) {
    const of = WHO[f.who] || WHO.INK, s = f.s ?? 1.5;
    let x = CX + (f.x ?? 0), pose;
    if (f.walk) { const k = clamp((t - (f.walk[2] || 0)) / ((f.walk[3] || info.dur) - (f.walk[2] || 0))); x = CX + lerp(f.walk[0], f.walk[1], k); pose = k > 0 && k < 1 ? walkPose(t * Math.PI * 2 * 0.9, {}) : POSES.stand; }
    else pose = breathe(Array.isArray(f.p) ? posesAt(t, f.p) : POSES[f.p || 'stand'], t, f.still ? 0 : 1, i + 1);
    const y = (f.y != null ? GY + f.y : GY);
    const draw = (g) => drawFigure(g, { x, y, s, facing: f.f ?? 1, outfit: of, pose, rot: f.rot, expr: pick(f.e || 'neutral', t), face: fixFace(pick(f.e || 'neutral', t)), look: f.look, blink: (t % (2.7 + i * 0.4)) > 2.6 + i * 0.4,
      talk: f.talk ? 0.6 * Math.abs(Math.sin(t * 9)) : 0, prop: f.prop, alpha: f.a != null ? pick(f.a, t) : (f.fadeIn ? clamp((t - f.fadeIn) / 0.4) : 1) * (f.fadeOut != null ? 1 - clamp((t - f.fadeOut) / 1.0) : 1), dim: f.dim, shadow: f.shadow,
      rim: { color: f.rimC || M.rim, dir: f.rim || [0, -1], w: 4.5 } });
    if (f.blur) blurLayer(g, f.blur, draw, cam, f.depth || 1.6); else layer(g, cam, f.depth || 1, draw);
  }
}
function fxs(g, t, list, M) {
  for (const n of list || []) {
    if (n === 'dust') FX.dust(g, t, { count: 40, color: shade(M.key, 0.3), a: 0.35 });
    if (n === 'rain') FX.rain(g, t, { color: '#b8c8ff', a: 0.22 });
    if (n === 'snow') FX.snow(g, t, { count: 140, speed: 60 });
    if (n === 'drops') FX.drops(g, t, { count: 40, color: '#cfe0ff', rMax: 10, drift: 3 });
    if (n === 'streak') FX.lensStreak(g, E.W / 2, E.H * 0.32, E.W * 1.2, shade(M.key, 0.2), 0.16);
    if (n === 'fog') FX.fog(g, E.H * 0.55, 300, M.fog, 0.2);
    if (n === 'vignette') veil(g, '#000', 0.25);
  }
}
// overlays usable on any template
function overlays(g, t, info, p) {
  const o = p.ov || {}, ui = S().ui;
  if (o.date) { const a = fade(t, info.dur, 0.4, 0.4) * ease.out(prog(t, o.dateAt ?? 0.2, (o.dateAt ?? 0.2) + 0.4)); UI.readout(g, { label: o.dateLabel || null, value: o.date, x: V(110, 80), y: E.H - V(150, 560), a, size: V(52, 60) }); }
  if (o.line) UI.bigLine(g, t - (o.lineAt || 0), { str: o.line, dur: info.dur - (o.lineAt || 0), y: o.lineY != null ? E.H * o.lineY : E.H * 0.18, size: o.lineSize || V(64, 66), color: o.lineColor || ui.gold });
  for (const c of o.callouts || []) UI.callout(g, t, { at: [E.W / 2 + c.at[0], E.H * c.at[1]], to: [E.W / 2 + c.to[0], E.H * c.to[1]], str: c.str, start: c.start || 0.3, color: c.color || ui.cream });
  for (const l of o.labels || []) { const a = fade(t - (l.at || 0), info.dur - (l.at || 0), 0.3, 0.3) * (t >= (l.at || 0) ? 1 : 0); text(g, l.str, E.W / 2 + (l.x || 0), E.H * (l.y ?? 0.15), { size: l.size || V(44, 48), color: l.color || ui.cream, font: l.serif ? FONTS.serif : FONTS.ui, italic: !!l.serif, weight: 900, spacing: l.serif ? 1 : 3, alpha: a, glow: 16, glowColor: 'rgba(0,0,0,.8)' }); }
  if (o.badge) UI.badge(g, { str: o.badge, a: fade(t, info.dur, 0.3, 0.3) });
}

// ===== templates =====
// generic: set + figures + optional bell jar
T.scene = (g, t, info, p) => {
  const cam = camOf(p, t, info.dur);
  if (p.bgBlur) { blurLayer(g, p.bgBlur, (g) => drawSet(g, t, cam, p)); veil(g, '#0a0810', p.veil ?? 0.25); }
  const { GY, CX, M } = p.bgBlur ? { GY: ground(), CX: E.W / 2, M: mood(p.so?.mood || 'night') } : drawSet(g, t, cam, p);
  if (p.jar) layer(g, cam, 1, (g) => bellJar(g, CX + (p.jar.x || 0), GY + 6, p.jar.w || 300, p.jar.h || 480, t, { a: p.jar.a != null ? pick(p.jar.a, t) : 1, fog: p.jar.fog }));
  if (p.jarDrop) { const k = ease.out(prog(t, p.jarDrop[0], p.jarDrop[1])); layer(g, cam, 1, (g) => bellJar(g, CX + (p.jarDrop[2] || 0), lerp(-200, GY + 6, k), 300, 480, t, { a: 1 })); if (t > p.jarDrop[1] && t < p.jarDrop[1] + 0.6) { const [sx, sy] = shake(t, 6 * (1 - prog(t, p.jarDrop[1], p.jarDrop[1] + 0.6)), 30); g.translate(sx, sy); FX.rings(g, CX + (p.jarDrop[2] || 0), GY, t - p.jarDrop[1], { count: 2, r0: 60, r1: 420, speed: 1.4, color: '#dfe8ff', a: 0.4 }); } }
  if (p.jarLift) { const k = ease.inOut(prog(t, p.jarLift[0], p.jarLift[1])); layer(g, cam, 1, (g) => bellJar(g, CX + (p.jarLift[2] || 0), GY + 6 - k * (E.H * 1.2), 300, 480, t, { a: 1, noBase: k > 0.01 })); }
  if (p.jars) layer(g, cam, 1, (g) => { for (const j of p.jars) { const k = p.jarsLift ? ease.inOut(prog(t, p.jarsLift[0] + (j.d || 0), p.jarsLift[1] + (j.d || 0))) : 0; bellJar(g, CX + j.x, GY + 6 - k * E.H * 1.1, j.w || 150, j.h || 240, t, { a: 1 - k * 0.3, noBase: k > 0.01 }); } });
  figures(g, t, info, GY, CX, M, p.figs, cam);
  if (p.jarFront) layer(g, cam, 1, (g) => bellJar(g, CX + (p.jarFront.x || 0), GY + 6, p.jarFront.w || 300, p.jarFront.h || 480, t, { a: p.jarFront.a ?? 1, fog: p.jarFront.fog }));
  if (p.extra && EXTRA[p.extra]) EXTRA[p.extra](g, t, info, { GY, CX, M, cam, p });
  fxs(g, t, p.fx || ['dust'], M);
};
// giant face close-up over the blurred set
T.face = (g, t, info, p) => {
  const cam = { z: 1.5, x: p.bx || -120, y: p.by || -120 };
  blurLayer(g, 14, (g) => drawSet(g, t, cam, p)); veil(g, '#0a0810', p.veil ?? 0.35);
  const M = mood(p.so?.mood || p.moodName || 'night'), of = WHO[p.who || 'SYLVIA'];
  const r = V(300, 330) * (1 + 0.05 * t / Math.max(1, info.dur) * 3) * (p.scale || 1);
  bigFace(g, E.W / 2 + (p.x || 0), E.H * V(0.6, 0.55), r, { outfit: of, expr: pick(p.e || 'neutral', t), face: fixFace(pick(p.e || 'neutral', t)), look: p.look || [0, 0], blink: (t % 3.1) > 3.0, rimColor: p.rimC || M.rim, rimSide: p.rimSide ?? -1, tilt: p.tilt || 0 });
  if (p.jar) bellJar(g, E.W / 2 + (p.x || 0), E.H * 1.08, r * 2.9, r * 3.2, t, { a: p.jar === true ? 1 : pick(p.jar, t), fog: p.fog });
  if (p.tears) { const k = prog(t, p.tears, p.tears + 1.5); circle(g, E.W / 2 - r * 0.34, E.H * 0.6 + r * 0.05 + k * r * 0.5, r * 0.05, alpha('#8fd0ff', 0.9 * (1 - k * 0.5))); }
  fxs(g, t, p.fx || ['dust'], M);
};
// open book with a quote being "typed"
T.quote = (g, t, info, p) => {
  const M = mood('interiorWarm'); backdrop(g, ['#120c10', '#24161c', '#2e1c20']); glow(g, E.W * 0.5, E.H * 0.2, E.W * 0.6, M.practical, 0.18);
  const z = 1 + 0.05 * t / info.dur * 2; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.rotate(-0.02); g.translate(-E.W / 2, -E.H / 2);
  const pw = V(1500, 980), ph = V(760, 1100), px = (E.W - pw) / 2, py = (E.H - ph) / 2 + 30;
  g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(px + 20, py + 26, pw, ph);
  rr(g, px, py, pw, ph, 14); g.fillStyle = '#e9dfc8'; g.fill();
  g.fillStyle = linGrad(g, E.W / 2 - 50, 0, E.W / 2 + 50, 0, ['rgba(0,0,0,0)', 'rgba(60,40,20,.35)', 'rgba(0,0,0,0)']); g.fillRect(E.W / 2 - 50, py, 100, ph);
  if (p.header) text(g, p.header, px + pw * 0.25, py + 70, { size: 26, color: '#8a6a4a', font: FONTS.ui, weight: 900, spacing: 4 });
  const words = p.text.split(' '), size = p.size || V(54, 50), lh = size * 1.32, maxW = (p.full ? pw - 200 : pw / 2 - 120);
  const total = words.length, shown = Math.floor(total * clamp(prog(t, p.from ?? 0.15, p.to ?? Math.max(0.6, info.dur - 0.8))) + 0.999);
  g.save(); g.font = `italic 900 ${size}px "${FONTS.serif}"`; let line = '', y = py + (p.full ? 160 : 180), lines = [];
  for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; } lines.push(line); g.restore();
  let count = 0; const x0 = p.full ? px + 100 : E.W / 2 + 60;
  for (const ln of lines) { const ws = ln.split(' '); let out = []; for (const w of ws) { if (count < shown) out.push(w); count++; } if (out.length) text(g, out.join(' '), x0, y, { size, color: '#2a1c18', font: FONTS.serif, italic: true, weight: 900, align: 'left' }); y += lh; }
  if (!p.full) { g.fillStyle = 'rgba(40,30,30,.18)'; for (let i = 0; i < 14; i++) g.fillRect(px + 90, py + 160 + i * 38, pw / 2 - 200 - ((i * 37) % 120), 8); }
  if (p.by) text(g, p.by, x0, y + 30, { size: 30, color: '#8a6a4a', font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: ease.out(prog(t, info.dur - 1.4, info.dur - 0.9)) });
  g.restore(); FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 }); veil(g, '#000', 0.12);
};
// big date / title line over a blurred set
T.date = (g, t, info, p) => {
  const cam = { z: 1.2 + 0.05 * t / info.dur, x: p.bx || 0, y: -60 }; blurLayer(g, 10, (g) => drawSet(g, t, cam, p)); veil(g, '#07060c', 0.45);
  const ui = S().ui, a = fade(t, info.dur, 0.4, 0.4), k = ease.outBack(prog(t, 0.1, 0.6));
  g.save(); g.globalAlpha *= a; g.translate(E.W / 2, E.H * 0.47); g.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k);
  text(g, p.str, 0, 0, { size: p.size || V(150, 130), color: ui.gold, glow: 40, glowColor: 'rgba(255,150,60,.8)', spacing: 8 });
  if (p.sub) text(g, p.sub, 0, V(120, 110), { size: V(44, 44), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 6, alpha: ease.out(prog(t, 0.5, 0.9)) });
  g.restore(); FX.dust(g, t, { count: 30, a: 0.3 });
};
// REAL → NOVEL character mapping card
T.map = (g, t, info, p) => {
  blurLayer(g, 12, (g) => drawSet(g, t, { z: 1.3, x: 0, y: -80 }, p)); veil(g, '#07060c', 0.55);
  const ui = S().ui, M = mood('night'), GY = E.H * 0.72, of = WHO[p.who], k1 = ease.out(prog(t, 0.1, 0.5)), k2 = ease.out(prog(t, p.swapAt || 1.2, (p.swapAt || 1.2) + 0.5));
  const lx = E.W * 0.3, rx = E.W * 0.7;
  drawFigure(g, { x: lx, y: GY, s: 1.7, facing: 1, outfit: of, pose: breathe(POSES[p.p || 'stand'], t), expr: p.e || 'neutral', face: fixFace(p.e || 'neutral'), rim: { color: '#ffd59a', dir: [0, -1], w: 5 }, alpha: k1 });
  text(g, 'REAL LIFE', lx, E.H * 0.16, { size: 26, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: k1 });
  text(g, p.real, lx, E.H * 0.24, { size: V(50, 44), color: ui.cream, font: FONTS.ui, weight: 900, alpha: k1 });
  const ax = lerp(lx + 150, rx - 150, k2); seg(g, [[lx + 150, E.H * 0.5], [ax, E.H * 0.5]], 6, alpha(ui.gold, 0.9)); if (k2 > 0.05) poly(g, [[ax + 24, E.H * 0.5], [ax - 6, E.H * 0.5 - 18], [ax - 6, E.H * 0.5 + 18]], ui.gold);
  g.save(); g.globalAlpha *= k2; drawFigure(g, { x: rx, y: GY, s: 1.7, facing: -1, outfit: { ...of }, pose: breathe(POSES[p.p2 || p.p || 'stand'], t, 1, 3), expr: p.e2 || p.e || 'neutral', face: fixFace(p.e2 || p.e || 'neutral'), rim: { color: '#9fd0ff', dir: [0, -1], w: 5 }, dim: true });
  g.globalCompositeOperation = 'source-atop'; g.restore();
  bookPages(g, rx, E.H * 0.5, t, k2);
  text(g, 'IN THE NOVEL', rx, E.H * 0.16, { size: 26, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: k2 });
  text(g, p.fict, rx, E.H * 0.24, { size: V(50, 44), color: ui.gold, font: FONTS.serif, italic: true, weight: 900, alpha: k2, glow: 18, glowColor: 'rgba(255,170,60,.6)' });
  FX.dust(g, t, { count: 30, a: 0.3 });
};
function bookPages(g, x, y, t, k) { if (k <= 0) return; for (let i = 0; i < 6; i++) { const a = t * 0.6 + i; const px = x + Math.cos(a) * 170, py = y + Math.sin(a * 1.3) * 120; g.save(); g.globalAlpha *= 0.35 * k; g.translate(px, py); g.rotate(a); g.fillStyle = '#efe6d0'; g.fillRect(-14, -18, 28, 36); g.restore(); } }
// book cover (pseudonym reveal / name swap)
T.cover = (g, t, info, p) => {
  const M = mood('interiorWarm'); backdrop(g, ['#100a0e', '#20141a', '#2a1a1e']); glow(g, E.W / 2, E.H * 0.45, E.W * 0.5, M.practical, 0.2);
  const z = 1 + 0.06 * t / info.dur * 2, ui = S().ui; g.save(); g.translate(E.W / 2, E.H * 0.5); g.scale(z, z); g.rotate(-0.03 + 0.01 * Math.sin(t * 0.5));
  const w = V(520, 620), h = w * 1.45; g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(-w / 2 + 24, -h / 2 + 30, w, h);
  rr(g, -w / 2, -h / 2, w, h, 8); g.fillStyle = p.cover || '#8a1e2a'; g.fill(); g.fillStyle = shade(p.cover || '#8a1e2a', -0.35); g.fillRect(-w / 2, -h / 2, 26, h);
  if (!p.nojar) bellJar(g, 10, h * 0.2, w * 0.36, w * 0.5, t, { a: 0.9, rim: '#f2e6c8', base: shade(p.cover || '#8a1e2a', -0.5) });
  else { for (let i = 0; i < 5; i++) ring(g, 10, h * 0.05, w * (0.08 + i * 0.05), 3, alpha('#f2e6c8', 0.5 - i * 0.08)); }
  text(g, p.title || 'THE BELL JAR', 10, -h * 0.36, { size: w * 0.105, color: '#f2e6c8', font: FONTS.serif, weight: 900, italic: true });
  text(g, p.kind || 'a novel', 10, -h * 0.27, { size: w * 0.05, color: alpha('#f2e6c8', 0.7), font: FONTS.serif, weight: 900, italic: true });
  const sw = p.swapAt != null ? ease.inOut(prog(t, p.swapAt, p.swapAt + 0.6)) : 0;
  const n1 = p.author || 'VICTORIA LUCAS', n2 = p.swap || 'SYLVIA PLATH';
  text(g, n1, 10, h * 0.33, { size: w * 0.075, color: '#f2e6c8', font: FONTS.ui, weight: 900, spacing: 4, alpha: 1 - sw });
  if (sw > 0) { text(g, n2, 10, h * 0.33, { size: w * 0.075, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 4, alpha: sw, glow: 20, glowColor: 'rgba(255,170,60,.7)' }); }
  if (p.strike) { const k = ease.out(prog(t, p.strike, p.strike + 0.4)); seg(g, [[-w * 0.36, h * 0.33], [-w * 0.36 + w * 0.76 * k, h * 0.33]], 7, ui.accent); }
  if (p.year) text(g, p.year, 10, h * 0.43, { size: w * 0.05, color: alpha('#f2e6c8', 0.6), font: FONTS.ui, weight: 900, spacing: 4 });
  if (p.stamp) { const k = ease.outBack(prog(t, p.stamp, p.stamp + 0.35)); if (k > 0) { g.save(); g.rotate(-0.25); g.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k); g.globalAlpha *= clamp(k * 1.5); rr(g, -w * 0.45, -60, w * 0.9, 120, 14); g.strokeStyle = p.stampC || ui.accent; g.lineWidth = 10; g.stroke(); text(g, p.stampText || 'BANNED', 0, 4, { size: 84, color: p.stampC || ui.accent, font: FONTS.ui, weight: 900, spacing: 8 }); g.restore(); } }
  g.restore();
  if (p.label) text(g, p.label, E.W / 2, E.H * 0.93, { size: V(36, 40), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 4, alpha: ease.out(prog(t, 0.4, 0.8)) });
  FX.dust(g, t, { count: 30, a: 0.3 }); veil(g, '#000', 0.1);
};
// newspaper insert
T.paper = (g, t, info, p) => {
  backdrop(g, ['#0c0e18', '#161a2a']); const z = 1.0 + 0.12 * ease.out(prog(t, 0, info.dur)), r = -0.06 + 0.05 * ease.out(prog(t, 0, 1.2));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.rotate(r); const w = V(1100, 860), h = V(760, 1180);
  g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(-w / 2 + 20, -h / 2 + 24, w, h); g.fillStyle = '#e8e2d2'; g.fillRect(-w / 2, -h / 2, w, h);
  text(g, p.mast || 'THE EVENING NEWS', 0, -h / 2 + 70, { size: 54, color: '#1a1a1a', font: FONTS.serif, weight: 900, italic: true }); g.fillStyle = '#1a1a1a'; g.fillRect(-w / 2 + 40, -h / 2 + 112, w - 80, 4); g.fillRect(-w / 2 + 40, -h / 2 + 122, w - 80, 2);
  text(g, p.head, 0, -h / 2 + 210, { size: p.headSize || 110, color: '#121212', font: FONTS.ui, weight: 900, spacing: 2 });
  if (p.sub) text(g, p.sub, 0, -h / 2 + 300, { size: 34, color: '#2a2a2a', font: FONTS.ui, weight: 900 });
  const phx = -w / 2 + 70, phy = -h / 2 + 350, pw = 300, ph = 330; g.fillStyle = '#9a9488'; g.fillRect(phx, phy, pw, ph); bigFace(g, phx + pw / 2, phy + ph * 0.5, 100, { outfit: WHO.SYLVIA, expr: 'smile', rimColor: '#e8e2d2' });
  g.fillStyle = 'rgba(30,30,30,.35)'; for (let i = 0; i < 9; i++) g.fillRect(phx + pw + 40, phy + 10 + i * 36, w - pw - 180 - ((i * 41) % 90), 12);
  g.restore(); veil(g, '#000', 0.15); FX.dust(g, t, { count: 25, a: 0.25 });
};
// letters / envelopes
T.letters = (g, t, info, p) => {
  const M = mood('interiorWarm'); backdrop(g, ['#160e12', '#2a1a1e']); glow(g, E.W / 2, E.H * 0.4, E.W * 0.5, M.practical, 0.18);
  const r = rng(7), n = p.count || 14;
  for (let i = 0; i < n; i++) { const k = ease.out(prog(t, i * (info.dur * 0.5 / n), i * (info.dur * 0.5 / n) + 0.7)); if (k <= 0) continue; const tx = E.W / 2 + (r() - 0.5) * V(1100, 700), ty = E.H * 0.52 + (r() - 0.5) * V(420, 900), rot = (r() - 0.5) * 0.6;
    g.save(); g.translate(lerp(E.W / 2, tx, k), lerp(-200, ty, k)); g.rotate(rot * k); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-120, -70, 250, 150); g.fillStyle = '#efe6d2'; g.fillRect(-125, -75, 250, 150); seg(g, [[-125, -75], [0, 10], [125, -75]], 3, '#bfb29a'); g.fillStyle = '#c8402e'; g.fillRect(70, -60, 36, 44); g.fillStyle = 'rgba(40,30,30,.5)'; g.fillRect(-60, 20, 120, 6); g.fillRect(-60, 36, 90, 6); g.restore(); }
  if (p.label) text(g, p.label, E.W / 2, E.H * 0.12, { size: V(44, 46), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 4, alpha: fade(t, info.dur), glow: 16, glowColor: 'rgba(0,0,0,.9)' });
  FX.dust(g, t, { count: 30, a: 0.3 });
};
// rejection slips / papers raining onto a desk
T.slips = (g, t, info, p) => {
  const cam = camOf(p, t, info.dur); const { GY, CX, M } = SETS.room(g, t, cam, { mood: 'interiorWarm', window: 'day', desk: true, deskX: 0, lamp: true });
  const r = rng(3);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX - 210, y: GY, s: 1.5 * 0.72 / 0.72, facing: 1, outfit: WHO.SYLVIA, pose: breathe(POSES.sit, t), expr: pick(p.e || [[0, 'determined']], t), face: fixFace(pick(p.e || [[0, 'determined']], t)), rim: { color: M.rim, dir: [0, -1] } });
    for (let i = 0; i < 18; i++) { const st = i * 0.3, k = prog(t, st, st + 1.2); if (k <= 0) continue; const x = CX - 120 + r() * 300, y = lerp(-100, GY - 140 - i * 2, ease.out(k)); g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 1.2 * (1 - k * 0.6)); g.fillStyle = '#efe9dc'; g.fillRect(-40, -26, 80, 52); g.fillStyle = alpha('#c8402e', 0.8); g.fillRect(-30, -14, 60, 8); g.restore(); }
  });
  fxs(g, t, ['dust'], M);
};
// report card: straight A's + prize
T.grades = (g, t, info, p) => {
  backdrop(g, ['#10141e', '#1c2232']); glow(g, E.W / 2, E.H * 0.4, E.W * 0.5, '#ffd59a', 0.12);
  const ui = S().ui, w = V(820, 760), h = V(820, 1000); g.save(); g.translate(E.W / 2 - V(220, 0), E.H / 2); g.rotate(-0.04);
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-w / 2 + 16, -h / 2 + 20, w, h); g.fillStyle = '#ece6d6'; g.fillRect(-w / 2, -h / 2, w, h);
  text(g, 'SMITH COLLEGE', 0, -h / 2 + 70, { size: 46, color: '#2a2a3a', font: FONTS.serif, weight: 900, italic: true });
  const subj = ['ENGLISH', 'LITERATURE', 'HISTORY', 'GERMAN', 'ART'];
  subj.forEach((s, i) => { const y = -h / 2 + 190 + i * 110; text(g, s, -w / 2 + 70, y, { size: 36, color: '#3a3a4a', font: FONTS.ui, weight: 900, align: 'left' }); const k = ease.outBack(prog(t, 0.3 + i * 0.25, 0.6 + i * 0.25)); if (k > 0) { g.save(); g.translate(w / 2 - 120, y); g.scale(k, k); text(g, 'A', 0, 0, { size: 80, color: '#c8402e', font: FONTS.ui, weight: 900 }); g.restore(); } });
  g.restore();
  if (p.prize) { const k = ease.outBack(prog(t, p.prize, p.prize + 0.5)); if (k > 0) { g.save(); g.translate(E.W / 2 + V(480, 260), E.H * V(0.48, 0.78)); g.scale(k, k); g.rotate(Math.sin(t) * 0.05); poly(g, [[-50, 40], [-80, 230], [-10, 190], [0, 60]], '#3a6ea5'); poly(g, [[50, 40], [80, 230], [10, 190], [0, 60]], '#3a6ea5'); circle(g, 0, 0, 110, ui.gold); ring(g, 0, 0, 90, 6, shade(ui.gold, -0.3)); text(g, '1st', 0, -8, { size: 64, color: '#5a3a10', font: FONTS.ui, weight: 900 }); text(g, 'PRIZE', 0, 46, { size: 28, color: '#5a3a10', font: FONTS.ui, weight: 900, spacing: 3 }); glow(g, 0, 0, 260, ui.gold, 0.3); g.restore(); } }
  FX.dust(g, t, { count: 30, a: 0.3 });
};
// electricity motif: 'chair' (empty electric chair, sparks) | 'nerves' (blueprint figure, glowing nerves) | 'bolt' (word + bolt)
T.electric = (g, t, info, p) => {
  const ui = S().ui;
  if (p.mode === 'nerves') {
    UI.blueprint(g, {}); const x = E.W / 2, y = E.H * 0.86; UI.lineFigure(g, { x, y, s: 2.8, pose: POSES.stand, color: alpha(ui.blueprint, 0.9) });
    const k = prog(t, 0.6, info.dur - 0.5), pts = [[0, -208 * 2.8], [0, -174 * 2.8], [0, -100 * 2.8], [13 * 2.8, -101 * 2.8], [-9 * 2.8, -100 * 2.8], [3 * 2.8, 0], [-11 * 2.8, 0]];
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const r = rng(i + 3); const a = pts[Math.floor(r() * 3)], b = pts[3 + Math.floor(r() * 4)]; const kk = clamp(k * 1.6 - i * 0.03); if (kk <= 0) continue; g.strokeStyle = alpha('#9fe0ff', 0.6 * (0.6 + 0.4 * Math.sin(t * 20 + i))); g.lineWidth = 2; g.beginPath(); g.moveTo(x + a[0], y + a[1]); for (let s = 1; s <= 8; s++) { const u = s / 8 * kk; g.lineTo(x + lerp(a[0], b[0], u) + (r() - 0.5) * 40, y + lerp(a[1], b[1], u) + (r() - 0.5) * 30); } g.stroke(); }
    g.restore(); glow(g, x, y - 400, 500 * k, '#9fe0ff', 0.25 * k);
    if (p.label) text(g, p.label, E.W * 0.78, E.H * 0.3, { size: V(40, 44), color: ui.blueprint, font: FONTS.ui, weight: 900, spacing: 4, alpha: ease.out(prog(t, 1, 1.5)) });
    return;
  }
  const M = mood('storm'); backdrop(g, ['#05060c', '#0e1224', '#141a30']);
  const z = 1 + 0.06 * t / info.dur * 2; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const GY = ground(), CX = E.W / 2;
  FX.lightCone(g, CX, -100, { angle: Math.PI / 2, spread: 0.3, len: GY + 200, color: '#cfe0ff', a: 0.1 }); FX.pool(g, CX, GY + 20, 360, 50, '#cfe0ff', 0.2);
  g.fillStyle = linGrad(g, 0, GY, 0, E.H, ['#14182a', '#05060c']); g.fillRect(-E.W, GY, E.W * 3, E.H);
  if (p.mode !== 'bolt') { const c = '#0a0a10', rimc = alpha('#cfe0ff', 0.6); for (const [col, off] of [[rimc, -4], [c, 0]]) { g.save(); g.translate(off, off); seg(g, [[CX - 90, GY], [CX - 90, GY - 150], [CX + 90, GY - 150], [CX + 90, GY]], 22, col); seg(g, [[CX - 90, GY - 150], [CX - 80, GY - 420]], 26, col); seg(g, [[CX + 90, GY - 150], [CX + 80, GY - 420]], 26, col); seg(g, [[CX - 80, GY - 420], [CX + 80, GY - 420]], 26, col); seg(g, [[CX - 100, GY - 260], [CX + 100, GY - 260]], 18, col); g.restore(); } }
  const flick = (Math.sin(t * 31) * Math.sin(t * 17)) > 0.3;
  if (flick || p.mode === 'bolt') FX.lightning(g, { x1: CX + 40, y1: -40, x2: CX, y2: p.mode === 'bolt' ? GY : GY - 430, seed: Math.floor(t * 8), color: '#cfe8ff', w: 4 });
  for (let i = 0; i < 12; i++) { const r = rng(i + Math.floor(t * 6)); FX.sparkle(g, CX + (r() - 0.5) * 300, GY - 420 + r() * 300, 10 + r() * 16, '#cfe8ff', 0.7 * (flick ? 1 : 0.3)); }
  g.restore();
  if (p.label) text(g, p.label, E.W / 2, E.H * 0.14, { size: V(48, 50), color: '#cfe8ff', font: FONTS.ui, weight: 900, spacing: 8, glow: 24, glowColor: 'rgba(120,180,255,.9)', alpha: fade(t, info.dur) });
  if (flick) veil(g, '#cfe0ff', 0.06, 'lighter');
};
// the fig tree. p.phase: 'reveal' | 'labels' | 'sit' | 'wither' | 'fall' | 'phones'
const FIGS = ['POET', 'PROFESSOR', 'EDITOR', 'WIFE & MOTHER', 'TRAVEL', 'OLYMPIC', 'LOVERS'];
T.fig = (g, t, info, p) => {
  const cam = camOf(p, t, info.dur); const { GY, CX, M } = SETS.stage(g, t, cam, { mood: 'dusk', sky: ['#1a1230', '#3d2a50', '#6a4060'], spotC: '#ffcf8f' });
  const n = p.n ?? 7, ui = S().ui; const s = p.s || 1.2;
  const states = []; for (let i = 0; i < n; i++) {
    let st = 0; if (p.phase === 'wither') st = clamp(prog(t, 0.3 + i * 0.25, 2 + i * 0.25)) * 0.58; if (p.phase === 'fall') st = 0.58 + clamp(prog(t, 0.2 + i * 0.4, 1.2 + i * 0.4)) * 0.42; if (p.phase === 'lost') st = i === (p.keep ?? 2) ? 0 : clamp(prog(t, 0.5, 2)) * 0.5;
    states.push({ state: st, glow: p.phase === 'reveal' ? ease.out(prog(t, 0.3 + i * 0.2, 0.8 + i * 0.2)) : 1 });
  }
  let figs = [];
  layer(g, cam, 1, (g) => {
    figs = figTree(g, CX + (p.tx || 0), GY, s, t, { M, figs: states, leaf: '#2f4a3a' });
    if (p.sitter) drawFigure(g, { x: CX + (p.tx || 0) + 4 * s, y: GY - 200 * s, s: 0.95 * s, facing: 1, outfit: WHO.SYLVIA, pose: breathe(POSES.sit, t), expr: pick(p.e || 'worried', t), face: fixFace(pick(p.e || 'worried', t)), look: p.look || [0, -0.6], rim: { color: '#ffcf8f', dir: [0, -1], w: 4 }, shadow: false });
  });
  if (p.labels) figs.forEach((f, i) => { const at = Array.isArray(p.labels) ? p.labels[i] : 0.3 + i * 0.35; if (at == null || t < at) return; const a = ease.out(prog(t, at, at + 0.3)) * (1 - f.st); const zz = 1 + (cam.z - 1); const fx = (f.x - E.W / 2 - cam.x) * zz + E.W / 2, fy = (f.y - E.H / 2 - cam.y) * zz + E.H / 2; text(g, FIGS[i], fx, fy - 56 * s * zz, { size: V(30, 32), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 3, alpha: a, glow: 12, glowColor: 'rgba(0,0,0,.9)' }); });
  FX.dust(g, t, { count: 40, color: '#ffcf8f', a: 0.35 });
};
// phones: the fig tree on screens today
T.phones = (g, t, info, p) => {
  backdrop(g, ['#0c0a18', '#1a1430']); const n = p.n || 5, ui = S().ui;
  for (let i = 0; i < n; i++) { const k = ease.outBack(prog(t, 0.2 + i * 0.25, 0.6 + i * 0.25)); if (k <= 0) continue; const x = E.W / 2 + (i - (n - 1) / 2) * V(330, 200), y = E.H * 0.52 + Math.sin(t + i) * 10 + (i % 2) * 40;
    g.save(); g.translate(x, y); g.scale(k, k); g.rotate((i - (n - 1) / 2) * 0.05); rr(g, -130, -250, 260, 500, 30); g.fillStyle = '#0a0a10'; g.fill(); rr(g, -116, -232, 232, 464, 20); g.fillStyle = linGrad(g, 0, -232, 0, 232, ['#3d2a50', '#6a4060']); g.fill();
    g.save(); g.beginPath(); g.rect(-116, -232, 232, 464); g.clip(); figTree(g, 0, 150, 0.32, t, { figs: [0, 0, 0, 0, 0, 0, 0].map(() => ({ state: 0 })), leaf: '#2f4a3a' }); g.restore();
    circle(g, -70, 190, 14, '#e04a6a'); text(g, ['12.4K', '88K', '230K', '41K', '1.2M'][i % 5], -10, 190, { size: 26, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' });
    glow(g, 0, 0, 300, '#ffcf8f', 0.12); g.restore(); }
  FX.dust(g, t, { count: 40, a: 0.3 });
};
// title card over the bell jar
T.title = (g, t, info, p) => {
  const cam = { z: 1 + 0.05 * t / info.dur, x: 0 }; const { GY, CX, M } = SETS.stage(g, t, cam, { mood: 'void' });
  layer(g, cam, 1, (g) => { bellJar(g, CX, GY + 6, 300, 480, t, { a: 0.9, fog: 0.3 }); drawFigure(g, { x: CX, y: GY, s: 1.2, outfit: WHO.SYLVIA, pose: breathe(POSES.sad, t), expr: 'sad', face: fixFace('sad'), rim: { color: '#dfe8ff', dir: [0, -1], w: 4 } }); });
  UI.titleCard(g, t, { lines: p.lines || ['THE LORE BEHIND', 'THE BELL JAR'], dur: info.dur, y: E.H * 0.28 });
  FX.dust(g, t, { count: 40, color: '#dfe8ff', a: 0.3 });
};
T.end = (g, t, info, p) => {
  UI.endScreen(g, t, { question: p.question || 'You are not alone.', cast: [WHO.SYLVIA, WHO.AURELIA, WHO.DOCTOR, WHO.TED, WHO.JOAN], moodColors: ['#0e1020', '#1a1a34', '#2a2440'], rim: '#cfe0ff' });
  if (p.help) text(g, p.help, E.W / 2, E.H * 0.5, { size: V(36, 40), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(prog(t, 0.8, 1.3)) });
};
// data card
T.data = (g, t, info, p) => {
  blurLayer(g, 12, (g) => drawSet(g, t, { z: 1.3, x: 0, y: -60 }, p)); veil(g, '#07060c', 0.45);
  UI.dataCard(g, t, { title: p.title, subtitle: p.subtitle, from: p.from, to: p.to, decimals: p.decimals || 0, unit: p.unit || '', start: 0.4, dur: Math.max(1, info.dur - 1.2), labels: p.labelsC || [[0, null], [1, null]], shape: p.shape || 1.7, arrow: p.arrow ?? true, total: info.dur });
};

// shot-specific extras (drawn after figures, inside the generic scene)
const EXTRA = {
  bees(g, t, info, { GY, CX }) { for (let i = 0; i < 9; i++) { const x = CX - 260 + Math.sin(t * 2.1 + i * 1.7) * 140 + i * 12, y = GY - 420 + Math.cos(t * 2.7 + i) * 80; circle(g, x, y, 7, '#f2c21a'); g.fillStyle = '#120e16'; g.fillRect(x - 2, y - 7, 3, 14); g.fillStyle = alpha('#ffffff', 0.6); g.beginPath(); g.ellipse(x, y - 9, 5, 3 + Math.abs(Math.sin(t * 60 + i)) * 4, 0, 0, 7); g.fill(); } },
  clock(g, t, info, { GY, CX }) { FX.clock(g, CX + 520, GY - 520, 70, t * 40); },
  luncheon(g, t, info, { GY, CX }) { rr(g, CX - 520, GY - 120, 1040, 22, 8); g.fillStyle = '#e8e2d6'; g.fill(); g.fillStyle = '#2a1a1e'; g.fillRect(CX - 500, GY - 100, 1000, 100); for (let i = 0; i < 6; i++) { const x = CX - 420 + i * 170; g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(x, GY - 126, 46, 12, 0, 0, 7); g.fill(); g.fillStyle = '#e0704a'; g.beginPath(); g.ellipse(x, GY - 132, 22, 8, 0, 0, 7); g.fill(); } if (t > 2) for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i * 0.25) % 1; g.fillStyle = alpha('#8fd06a', 0.5 * (1 - k)); g.beginPath(); g.arc(CX - 300 + i * 200, GY - 300 - k * 120, 14 + k * 20, 0, 7); g.fill(); } },
  pages(g, t, info, { GY, CX }) { const n = Math.floor(clamp(t / info.dur) * 14); for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#efe9dc' : '#e6dfcf'; g.fillRect(CX + 20, GY - 126 - i * 4, 90, 5); } },
  bundle(g, t, info, { GY, CX }) { const x = CX + 350, y = GY - 238 + Math.sin(t * 2) * 2; g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(x, y, 44, 26, -0.3, 0, 7); g.fill(); circle(g, x + 30, y - 20, 17, S().ink); },
  clothes(g, t, info, { GY, CX, cam }) { layer(g, cam, 1, (g) => { const r = rng(4); for (let i = 0; i < 9; i++) { const st = 0.4 + i * 0.45; const k = prog(t, st, st + 3.5); if (k <= 0) continue; const x = CX + 120 + k * (300 + r() * 500), y = GY - 260 - Math.sin(k * 3) * 120 + k * k * 600, rot = k * (r() * 8 - 4); g.save(); g.translate(x, y); g.rotate(rot); const c = ['#f2c21a', '#e04a6a', '#f4efe6', '#3a6ea5', '#8a5ad6', '#3fb950'][i % 6]; poly(g, [[-30, -30], [30, -30], [44, 34], [-44, 34]], c); g.fillStyle = alpha('#fff', 0.25); g.fillRect(-30, -30, 60, 6); g.restore(); } }); },
  flashlights(g, t, info, { GY, CX }) { for (let i = 0; i < 5; i++) { const x = CX - 700 + i * 340 + Math.sin(t * 0.7 + i) * 60, ang = -Math.PI / 2 - 0.6 + Math.sin(t * 0.8 + i * 1.7) * 0.5; FX.lightCone(g, x, GY - 140, { angle: Math.PI + ang + Math.PI / 2, spread: 0.18, len: 900, color: '#fff3c8', a: 0.14 }); } },
  typewriterGlow(g, t, info, { GY, CX, M }) { glow(g, CX - 270, GY - 160, 200, M.practical, 0.2); },
  breath(g, t, info, { GY, CX }) { const k = 0.5 + 0.5 * Math.sin(t * 1.4); glow(g, CX + 30, GY - 280, 160, '#dfe8ff', 0.08 + 0.1 * k); },
  heart(g, t, info, { GY, CX }) { const k = ease.outBack(prog(t, 1.4, 1.9)); if (k > 0) { g.save(); g.translate(CX, GY - 470); g.scale(k, k); g.fillStyle = '#e04a6a'; g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -10, -40, -60, 0, -30); g.bezierCurveTo(40, -60, 60, -10, 0, 30); g.fill(); glow(g, 0, 0, 120, '#e04a6a', 0.4); g.restore(); } },
  bite(g, t, info, { GY, CX }) { if (t > 2.1 && t < 3.2) { FX.rings(g, CX + 30, GY - 300, t - 2.1, { count: 2, r0: 20, r1: 160, speed: 2, color: '#ffe2a8', a: 0.7 }); text(g, '!', CX + 60, GY - 420, { size: 90, color: S().ui.gold, glow: 20, glowColor: 'rgba(255,170,60,.8)' }); } },
  rings(g, t, info, { GY, CX }) { const k = ease.outBack(prog(t, 0.6, 1.2)); if (k > 0) { g.save(); g.translate(CX, GY - 480); g.scale(k, k); ring(g, -22, 0, 40, 10, S().ui.gold); ring(g, 22, 0, 40, 10, S().ui.gold); glow(g, 0, 0, 160, S().ui.gold, 0.35); g.restore(); } },
  gavel(g, t, info, { GY, CX }) { const k = key(t, [[0, -0.9], [0.8, -0.9], [1.0, 0.1], [1.3, 0]]); g.save(); g.translate(CX + 240, GY - 160); g.rotate(k); rr(g, -10, -200, 20, 200, 6); g.fillStyle = '#4a2a1a'; g.fill(); rr(g, -60, -240, 120, 56, 12); g.fillStyle = '#5a3420'; g.fill(); g.restore(); rr(g, CX + 120, GY - 150, 200, 30, 8); g.fillStyle = '#3a2214'; g.fill(); if (t > 1.0 && t < 1.6) FX.rings(g, CX + 220, GY - 150, t - 1.0, { count: 2, r0: 20, r1: 200, speed: 2, color: '#ffe2a8', a: 0.6 }); },
  medal(g, t, info, { GY, CX }) { const ui = S().ui, k = ease.outBack(prog(t, 0.5, 1.1)); if (k > 0) { g.save(); g.translate(CX, GY - 560); g.scale(k, k); circle(g, 0, 0, 120, ui.gold); ring(g, 0, 0, 98, 6, shade(ui.gold, -0.3)); text(g, 'PULITZER', 0, -10, { size: 34, color: '#5a3a10', font: FONTS.ui, weight: 900, spacing: 3 }); text(g, '1982', 0, 34, { size: 30, color: '#5a3a10', font: FONTS.ui, weight: 900 }); glow(g, 0, 0, 300, ui.gold, 0.35); g.restore(); } },
  bestseller(g, t, info, { GY, CX }) { const r = rng(2); for (let i = 0; i < 16; i++) { const k = ease.out(prog(t, 0.3 + i * 0.12, 0.6 + i * 0.12)); if (k <= 0) continue; const x = CX + 380 + (i % 4) * 30 - 40, y = GY - 22 - Math.floor(i / 1) * 30; g.save(); g.translate(x + (1 - k) * 300, y); rr(g, -110, -14, 220, 28, 4); g.fillStyle = r() > 0.5 ? '#8a1e2a' : '#7a1a26'; g.fill(); g.fillStyle = '#f2e6c8'; g.fillRect(-90, -4, 120, 6); g.restore(); } },
  candle(g, t, info, { GY, CX }) { const k = 1 - prog(t, info.dur * 0.35, info.dur - 0.3); glow(g, CX - 270, GY - 230, 240 * k + 10, '#ffcf8a', 0.5 * k); },
  door(g, t, info, { GY, CX }) { const k = ease.inOut(prog(t, 0.6, info.dur - 0.4)); glow(g, CX + 320, GY - 220, 400 * k + 60, '#fff6e0', 0.35 * k + 0.1); },
};

// ---- register every non-3D shot by its params.type ----
for (const shot of E.shots) {
  const p = shot.params || {}; const fn = T[p.type || ''];
  if (!fn) continue;
  registerShot(shot.id, { draw(g, t, info) { fn(g, t, info, p); overlays(g, t, info, p); } });
}
