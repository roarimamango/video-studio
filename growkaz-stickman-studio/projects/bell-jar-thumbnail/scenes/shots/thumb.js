// YouTube thumbnail for The Bell Jar video — reuses that project's cast and sets.
import { E, registerShot, mood, glow, alpha, text, FONTS, S, rr, seg, linGrad, radGrad } from '/engine/core.js';
import { bigFace, EXPR } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { bellJar, book } from '/projects/the-bell-jar/scenes/sets/world.js';
import { WHO } from '/projects/the-bell-jar/scenes/cast.js';

const BROW = { worried: 'angry', angry: 'worried' };
const fixFace = (e) => { const b = EXPR[e]?.brows; return BROW[b] ? { brows: BROW[b] } : undefined; };

function draw(g, variant) {
  const ui = S().ui, M = mood('night');
  g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#06202a', '#0e3a44', '#2a1030']); g.fillRect(0, 0, E.W, E.H);
  glow(g, E.W * 0.7, E.H * 0.45, 760, '#22d0c8', 0.35);
  FX.godRays(g, E.W * 0.7, -40, { angle: Math.PI / 2, spread: 0.7, len: 1300, color: '#bff6ff', a: 0.08, count: 9 });
  FX.stars(g, 0, { count: 70, color: '#bff6ff' });
  // Sylvia under the bell jar, right side
  const cx = E.W * 0.76, cy = E.H * 0.6, r = 290;
  bigFace(g, cx, cy, r, { outfit: WHO.SYLVIA, expr: 'sad', face: fixFace('sad'), look: [-0.35, 0.05], rimColor: '#ffc048', rimSide: -1 });
  bellJar(g, cx, E.H * 1.12, r * 2.75, r * 3.15, 0, { a: 1, fog: 0.25, rim: '#d8fbff' });
  // tear
  g.fillStyle = '#9ff0ff'; g.beginPath(); g.ellipse(cx - r * 0.34, cy + r * 0.12, r * 0.05, r * 0.09, 0, 0, 7); g.fill();
  // left: headline
  const L = 90;
  if (variant === 'real') {
    text(g, 'IT WAS', L, 300, { size: 140, color: '#ffffff', align: 'left', spacing: 4, stroke: 14, strokeColor: '#05030c' });
    text(g, 'ALL REAL', L, 460, { size: 160, color: ui.gold, align: 'left', spacing: 4, stroke: 16, strokeColor: '#05030c', glow: 40, glowColor: 'rgba(255,170,40,.8)' });
  } else {
    text(g, 'SHE USED', L, 300, { size: 130, color: '#ffffff', align: 'left', spacing: 4, stroke: 14, strokeColor: '#05030c' });
    text(g, 'A FAKE NAME', L, 450, { size: 118, color: ui.gold, align: 'left', spacing: 2, stroke: 16, strokeColor: '#05030c', glow: 40, glowColor: 'rgba(255,170,40,.8)' });
  }
  // book, bottom-left, with the pseudonym
  g.save(); g.translate(330, 820); g.rotate(-0.12);
  rr(g, -150, -200, 300, 410, 10); g.fillStyle = '#c8202e'; g.fill(); g.fillStyle = '#8a141e'; g.fillRect(-150, -200, 24, 410);
  text(g, 'THE BELL JAR', 12, -130, { size: 44, color: '#fff2d0', font: FONTS.serif, italic: true, weight: 900 });
  bellJar(g, 12, 70, 110, 150, 0, { a: 0.9, rim: '#fff2d0', base: '#6a0e16' });
  text(g, 'VICTORIA LUCAS', 12, 150, { size: 30, color: '#fff2d0', font: FONTS.ui, weight: 900, spacing: 2 });
  if (variant === 'fake') seg(g, [[-120, 150], [140, 150]], 7, ui.gold);
  g.restore();
  // red tag
  g.save(); g.translate(560, 640); g.rotate(-0.06); rr(g, -10, -46, 420, 92, 18); g.fillStyle = '#ff4a2a'; g.fill();
  text(g, variant === 'real' ? 'THE TRUE STORY' : 'THE BELL JAR', 200, 2, { size: 46, color: '#fff', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
}
registerShot('t1', { draw(g) { draw(g, 'real'); } });
registerShot('t2', { draw(g) { draw(g, 'fake'); } });
