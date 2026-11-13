// YouTube thumbnails for The Lore Behind Edgar Allan Poe (psychedelic style).
import { registerShot, text, FONTS } from '/engine/core.js';
import { W, H, K, spiralBG, ringsBG, misreg, poeBust, raven, eye, scrap, finish, person, POSE } from '/projects/edgar-allan-poe/scenes/_kit.js';

function block(g, x, y, str, size, fill, color, rot, seed) { scrap(g, x, y, str.length * size * 0.6 + 70, size * 1.3, rot, fill, seed, { amp: 7, draw: (g) => text(g, str, 0, size * 0.06, { size, color, font: FONTS.title, weight: 900, spacing: 2 }) }); }
// A: "WHAT KILLED POE?"
registerShot('t1', { draw(g) {
  spiralBG(g, 0.3, K.acid, K.ink, 20, 0);
  for (const [x, y, r] of [[0.08, 0.2, 34], [0.93, 0.15, 26], [0.88, 0.82, 40], [0.12, 0.85, 30]]) eye(g, W() * x, H() * y, r, 0.4);
  misreg(g, 0.2, (col) => poeBust(g, W() * 0.68, H() * 0.6, 1.25, col, { flat: col !== K.ink }), { d: 14 });
  misreg(g, 0.2, (col) => raven(g, W() * 0.86, H() * 0.24, 0.75, 0.2, col, { perched: true, facing: -1 }), { d: 8 });
  block(g, W() * 0.27, H() * 0.3, 'WHAT', 150, K.magenta, K.bone, -0.06, 11);
  block(g, W() * 0.28, H() * 0.55, 'KILLED', 150, K.ink, K.acid, 0.03, 21);
  block(g, W() * 0.25, H() * 0.8, 'POE?', 170, K.bone, K.ink, -0.04, 31);
  finish(g, 0);
} });
// B: "5 DAYS MISSING"
registerShot('t2', { draw(g) {
  ringsBG(g, 0.2, K.magenta, K.violet2);
  misreg(g, 0.2, (col) => { g.save(); g.translate(W() * 0.74, H() * 0.62); g.rotate(-0.3); poeBust(g, 0, 0, 1.2, col, { flat: col !== K.ink, closed: true, eyes: K.bone }); g.restore(); }, { d: 14 });
  block(g, W() * 0.3, H() * 0.32, '5 DAYS', 170, K.acid, K.ink, -0.05, 41);
  block(g, W() * 0.32, H() * 0.6, 'MISSING', 140, K.ink, K.bone, 0.04, 51);
  scrap(g, W() * 0.3, H() * 0.83, 620, 80, -0.02, K.bone, 61, { amp: 4, tape: true, draw: (g) => text(g, "FOUND IN ANOTHER MAN'S CLOTHES", 0, 3, { size: 30, color: K.blood, font: FONTS.ui, weight: 900, spacing: 2 }) });
  finish(g, 0);
} });
