// YouTube thumbnails for the Yi Sun-sin video (shadow-collage style).
import { registerShot, text, FONTS, rng } from '/engine/core.js';
import { W, H, C, paperOver, halftone, scrap, sunDisc, ship, bust, tornFrame } from '/projects/yi-sun-sin/scenes/_kit.js';

function bigScrap(g, x, y, str, size, fill, color, rot, seed, font = FONTS.title) {
  scrap(g, x, y, str.length * size * 0.62 + 70, size * 1.25, rot, fill, seed, { amp: 7, draw: (g) => text(g, str, 0, size * 0.05, { size, color, font, weight: 900, spacing: 2 }) });
}
// A: "13 VS 133"
registerShot('t1', { draw(g) {
  g.fillStyle = C.paper; g.fillRect(0, 0, W(), H()); halftone(g, 0, 0, W(), H(), 'rgba(12,10,10,.16)', 14, 0.7, -1);
  sunDisc(g, W() * 0.26, H() * 0.46, 380, C.red);
  const r = rng(4); for (let i = 0; i < 42; i++) ship(g, 'jp', W() * 0.5 + (i % 7) * 135 + (Math.floor(i / 7) % 2) * 60, H() * 0.36 + Math.floor(i / 7) * 62, 0.3, { facing: -1 });
  for (let i = 0; i < 13; i++) ship(g, i === 6 ? 'turtle' : 'panok', W() * 0.47 + i * 80, H() * 0.86 + (i % 2) * 14, 0.42, { sail: C.red, rim: i === 6 ? C.red : null });
  bust(g, 'YI', W() * 0.25, H() * 0.55, 210, { facing: 1 });
  bigScrap(g, W() * 0.57, H() * 0.17, '13', 190, C.red, C.paper, -0.05, 11);
  text(g, 'VS', W() * 0.695, H() * 0.2, { size: 80, color: C.ink, font: FONTS.title, weight: 900, stroke: 10, strokeColor: C.paper });
  bigScrap(g, W() * 0.85, H() * 0.17, '133', 190, C.ink, C.paper, 0.04, 21);
  paperOver(g, 0.35); tornFrame(g, 0, C.ink);
} });
// B: "NEVER LOST"
registerShot('t2', { draw(g) {
  g.fillStyle = C.red; g.fillRect(0, 0, W(), H()); halftone(g, 0, 0, W(), H(), C.red2, 14, 0.7);
  sunDisc(g, W() * 0.72, H() * 0.42, 360, C.paper);
  ship(g, 'turtle', W() * 0.36, H() * 0.95, 2.4, { smoke: 0.4 });
  bust(g, 'YI', W() * 0.74, H() * 0.6, 220, { facing: -1, rim: C.red });
  bigScrap(g, W() * 0.27, H() * 0.18, 'NEVER', 170, C.paper, C.ink, -0.05, 41);
  bigScrap(g, W() * 0.3, H() * 0.42, 'LOST', 190, C.ink, C.paper, 0.03, 51);
  scrap(g, W() * 0.3, H() * 0.63, 700, 90, -0.02, C.paper, 61, { amp: 5, tape: true, draw: (g) => text(g, '23 BATTLES · 0 DEFEATS', 0, 4, { size: 46, color: C.red, font: FONTS.ui, weight: 900, spacing: 3 }) });
  paperOver(g, 0.35); tornFrame(g, 0, C.ink);
} });
