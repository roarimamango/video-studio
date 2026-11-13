// The Lore Behind Edgar Allan Poe — psychedelic sampler: 3D worlds + 2D cut-out characters + collage + chaos camera.
import { E, registerShot, ease, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { scrap, halftone, paperOver } from '/projects/yi-sun-sin/scenes/_kit.js';

const W = () => E.W, H = () => E.H;
const K = { ink: '#07040c', violet: '#6a1fd0', violet2: '#2a0a5a', acid: '#c8ff3a', magenta: '#ff2e9a', blood: '#e0103a', bone: '#f4ffe8', teal: '#20e0c8' };
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- the chaos camera: speed/roll/zoom jump every 0.25 s (forward, backward, stall, upside down) ----------
const SPEEDS = [3.2, -2.0, 0.25, 1.4, -0.8, 4.5], ROLLS = [0, Math.PI, Math.PI / 2, -Math.PI / 2, 0.35, Math.PI * 1.15], ZOOMS = [1, 1.35, 0.85, 1.7, 1.1];
function chaos(t, seed = 0, L = 0.25) {
  const n = Math.floor(t / L); let pos = 0;
  for (let i = 0; i < n; i++) pos += SPEEDS[Math.floor(hash(i + seed) * SPEEDS.length)] * L;
  pos += SPEEDS[Math.floor(hash(n + seed) * SPEEDS.length)] * (t - n * L);
  const r0 = ROLLS[Math.floor(hash(n - 1 + seed * 3) * ROLLS.length)], r1 = ROLLS[Math.floor(hash(n + seed * 3) * ROLLS.length)], k = ease.out(clamp((t - n * L) / 0.1));
  const z0 = ZOOMS[Math.floor(hash(n - 1 + seed * 7) * ZOOMS.length)], z1 = ZOOMS[Math.floor(hash(n + seed * 7) * ZOOMS.length)];
  return { pos, roll: lerp(r0, r1, k), zoom: lerp(z0, z1, k), seg: n };
}
const twos = (t) => Math.floor(t * 12) / 12;
// apply the same roll/zoom to the 2D layer so characters move with the 3D camera
const withChaos = (g, c, fn) => { g.save(); g.translate(W() / 2, H() / 2); g.rotate(c.roll); g.scale(c.zoom, c.zoom); g.translate(-W() / 2, -H() / 2); fn(); g.restore(); };
// print misregistration: draw a shape three times (magenta, acid, then ink/colour)
function misreg(g, t, draw, o = {}) { const d = o.d ?? 9, k = Math.floor(t * 12); for (const [col, dx, dy] of [[K.magenta, -d + hash(k) * 4, d * 0.4], [K.acid, d - hash(k + 3) * 4, -d * 0.3]]) { g.save(); g.translate(dx, dy); g.globalAlpha *= 0.85; draw(col); g.restore(); } draw(o.main || K.ink); }

// ---------- 2D characters ----------
export function poe(g, x, y, s, col, o = {}) {           // Poe bust: swept hair, high forehead, moustache, cravat
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  g.beginPath(); g.moveTo(-210, 330); g.quadraticCurveTo(-200, 170, -70, 140); g.lineTo(70, 140); g.quadraticCurveTo(200, 170, 210, 330); g.fill();      // coat
  g.fillRect(-36, 70, 72, 90);                                                                                                                        // neck
  g.beginPath(); g.ellipse(0, -10, 88, 112, 0, 0, 7); g.fill();                                                                                         // head
  for (const [hx, hy, r] of [[-86, -10, 52], [88, -26, 58], [-60, -80, 46], [40, -96, 56], [100, 20, 34], [-96, 40, 30]]) { g.beginPath(); g.arc(hx, hy, r, 0, 7); g.fill(); }   // swept hair
  if (!o.flat) {
    g.fillStyle = o.eyes || K.acid; for (const ex of [-32, 32]) { g.beginPath(); g.ellipse(ex, -6, 16, 6, 0, 0, 7); g.fill(); }                          // glowing eyes
    g.fillStyle = o.cravat || K.bone; g.beginPath(); g.moveTo(-50, 150); g.lineTo(0, 175); g.lineTo(50, 150); g.lineTo(40, 195); g.lineTo(0, 178); g.lineTo(-40, 195); g.fill();   // cravat
  }
  g.fillStyle = o.flat ? col : K.ink; g.beginPath(); g.moveTo(-46, 48); g.quadraticCurveTo(0, 26, 46, 48); g.quadraticCurveTo(30, 62, 0, 50); g.quadraticCurveTo(-30, 62, -46, 48); g.fill();   // moustache
  g.restore();
}
function raven(g, x, y, s, t, col) {
  const flap = Math.sin(twos(t) * 18); g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  g.beginPath(); g.ellipse(0, 0, 120, 55, -0.1, 0, 7); g.fill(); g.beginPath(); g.arc(110, -35, 40, 0, 7); g.fill();
  g.beginPath(); g.moveTo(140, -42); g.lineTo(215, -22); g.lineTo(140, -20); g.fill();                                                                 // beak
  g.beginPath(); g.moveTo(-120, 0); g.lineTo(-230, -30); g.lineTo(-220, 30); g.fill();                                                                 // tail
  for (const side of [-1, 1]) { g.beginPath(); g.moveTo(-40, -10); g.lineTo(-170, -10 - 190 * flap * side * 0.5 - 150 * (side > 0 ? 1 : 0.6)); g.lineTo(-60, -40 - 120 * flap); g.lineTo(40, -20); g.fill(); }
  g.fillStyle = K.acid; g.beginPath(); g.arc(122, -42, 9, 0, 7); g.fill(); g.restore();
}
function heart(g, x, y, s, t, col) {                     // anatomical-ish heart, beating thump-thump
  const ph = (t * 1.6) % 1, beat = 1 + 0.16 * Math.exp(-((ph - 0.05) ** 2) / 0.002) + 0.1 * Math.exp(-((ph - 0.22) ** 2) / 0.002);
  g.save(); g.translate(x, y); g.scale(s * beat, s * beat); g.fillStyle = col;
  g.beginPath(); g.moveTo(0, 170); g.bezierCurveTo(-210, 40, -170, -120, -40, -90); g.bezierCurveTo(-10, -84, 10, -60, 20, -40); g.bezierCurveTo(60, -130, 220, -90, 160, 40); g.bezierCurveTo(120, 110, 40, 140, 0, 170); g.fill();
  g.lineWidth = 34; g.strokeStyle = col; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, -80); g.quadraticCurveTo(-30, -170, 40, -190); g.stroke(); g.beginPath(); g.moveTo(40, -60); g.quadraticCurveTo(70, -160, 130, -150); g.stroke(); g.beginPath(); g.moveTo(-60, -70); g.lineTo(-110, -160); g.stroke();
  g.strokeStyle = K.ink; g.lineWidth = 6; for (const [a, b, c, d] of [[-80, -20, -20, 90], [40, -30, 90, 60], [-10, 0, 20, 120]]) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 30, (b + d) / 2, c, d); g.stroke(); }
  g.restore();
}
function ransom(g, t, lines, y0, size0, at = 0) {
  const r = rng(9); let n = 0;
  lines.forEach((str, li) => { const size = li ? size0 * 1.7 : size0, y = y0 + li * size0 * 1.9, letters = str.split(''), tot = letters.length * size * 0.68; let x = W() / 2 - tot / 2;
    letters.forEach((ch) => { const st = at + n * 0.03; n++; if (ch === ' ' || t < st) { x += size * 0.68; return; } const fill = [K.acid, K.magenta, K.bone, K.violet, K.ink][Math.floor(r() * 5)], col = fill === K.ink || fill === K.violet ? K.bone : K.ink, font = [FONTS.title, FONTS.serif, FONTS.ui][Math.floor(r() * 3)];
      scrap(g, x + size * 0.34 + (hash(n + Math.floor(t * 8)) - 0.5) * 6, y + (hash(n * 3 + Math.floor(t * 8)) - 0.5) * 6, size * 0.66, size * 0.95, (r() - 0.5) * 0.4, fill, 400 + n, { amp: 3, draw: (g) => text(g, ch, 0, 4, { size: size * 0.78, color: col, font, italic: font === FONTS.serif, weight: 900 }) }); x += size * 0.68; }); });
}
function spiralBG(g, t, a, b, rays = 18, speed = 2.4) {   // hypnotic ray spiral
  g.save(); g.translate(W() / 2, H() / 2); g.rotate(twos(t) * speed); for (let i = 0; i < rays; i++) { g.fillStyle = i % 2 ? a : b; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 12; k++) { const r = k * 160, ang = (i / rays) * Math.PI * 2 + k * 0.18; g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } for (let k = 12; k >= 0; k--) { const r = k * 160, ang = ((i + 1) / rays) * Math.PI * 2 + k * 0.18; g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } g.fill(); } g.restore();
}
const finish = (g, t) => { paperOver(g, 0.22); g.save(); g.globalAlpha = 0.18; halftone(g, 0, 0, W(), H(), K.ink, 12, 0.9, -1); g.restore(); };

// ---------- 3D helpers ----------
function kit(T) { const { THREE } = T; const flat = (c, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), ...o }); const toon = (c) => new THREE.MeshToonMaterial({ color: new THREE.Color(c) }); const m = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); return o; }; return { THREE, flat, toon, m }; }
function checker(T, a, b, n = 16) { return T.canvasTex(512, 512, (g, w, h) => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * w / n, j * h / n, w / n, h / n); } }); }
function rollCam(cam, roll) { cam.rotateZ(roll); }

// ================= shots =================
registerShot('p01', { kind: '3d',                        // corridor of doors
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, K.violet2], fog: [6, 60], fogColor: '#12042a', fov: 70, ambient: 1.2, keyIntensity: 1.2, bloom: 1.2 });
    const floor = k.m(new k.THREE.PlaneGeometry(8, 400), k.flat('#ffffff', { map: checker(T, K.ink, K.violet) })); floor.material.map.wrapT = floor.material.map.wrapS = k.THREE.RepeatWrapping; floor.material.map.repeat.set(2, 100); floor.rotation.x = -Math.PI / 2; floor.position.z = -180; st.add(floor);
    const cols = [K.acid, K.magenta, K.teal, K.violet]; for (let i = 0; i < 60; i++) { const z = 10 - i * 5, c = cols[i % 4]; for (const [x, y, w, h] of [[-3.6, 2.5, 0.4, 5], [3.6, 2.5, 0.4, 5], [0, 5, 7.6, 0.4]]) st.add(k.m(new k.THREE.BoxGeometry(w, h, 0.4), k.flat(c), x, y, z)); const door = k.m(new k.THREE.PlaneGeometry(1.2, 2.6), k.flat(i % 3 ? K.ink : K.bone), (i % 2 ? -1 : 1) * 3.38, 1.3, z - 2.5); door.rotation.y = (i % 2 ? 1 : -1) * Math.PI / 2; st.add(door); }
    return { stage: st }; },
  draw(s, t) { const c = chaos(t, 1); const cam = s.stage.camera; cam.position.set(Math.sin(t * 3) * 0.8, 2.2 + Math.sin(t * 5) * 0.4, 14 - c.pos * 7); cam.lookAt(0, 2.2, cam.position.z - 10); rollCam(cam, c.roll); cam.fov = 70 / c.zoom; cam.updateProjectionMatrix(); },
  overlay(g, t) { const c = chaos(t, 1); withChaos(g, c, () => misreg(g, t, (col) => poe(g, W() / 2, H() * 0.48, 1.0 + 0.05 * Math.sin(t * 9), col, { flat: col !== K.ink }))); if (t > 0.4) scrap(g, W() * 0.22, H() * 0.86, 520, 80, -0.05, K.acid, 11, { amp: 4, draw: (g) => text(g, 'BALTIMORE · OCTOBER 1849', 0, 3, { size: 34, color: K.ink, font: FONTS.ui, weight: 900, spacing: 3 }) }); finish(g, t); },
});
registerShot('p02', { kind: '3d',                        // the pit and the pendulum
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.violet2, K.ink], fog: [8, 50], fogColor: '#1a0630', fov: 60, ambient: 1.0, keyIntensity: 1.6, bloom: 1.2 });
    const floor = k.m(new k.THREE.PlaneGeometry(60, 60), k.flat('#ffffff', { map: checker(T, K.acid, K.ink, 24) })); floor.rotation.x = -Math.PI / 2; st.add(floor);
    const piv = new k.THREE.Group(); piv.position.set(0, 16, 0); st.add(piv); piv.add(k.m(new k.THREE.CylinderGeometry(0.08, 0.08, 14, 8), k.flat(K.bone), 0, -7, 0));
    const sh = new k.THREE.Shape(); sh.absarc(0, 0, 3, Math.PI * 1.15, Math.PI * 1.85, false); sh.absarc(0, 1.2, 2.4, Math.PI * 1.8, Math.PI * 1.2, true); const blade = k.m(new k.THREE.ExtrudeGeometry(sh, { depth: 0.15, bevelEnabled: false }), k.flat(K.magenta), 0, -13, 0); piv.add(blade);
    for (let i = 0; i < 4; i++) { const wall = k.m(new k.THREE.BoxGeometry(60, 30, 1), k.flat(i % 2 ? K.violet2 : '#22083e'), 0, 15, -30); wall.position.applyAxisAngle(new k.THREE.Vector3(0, 1, 0), i * Math.PI / 2); wall.rotation.y = i * Math.PI / 2; st.add(wall); }
    return { stage: st, piv }; },
  draw(s, t) { const c = chaos(t, 2); s.piv.rotation.z = Math.sin(t * 2.6) * 0.9; const cam = s.stage.camera, a = c.pos * 0.8; cam.position.set(Math.sin(a) * 15, 7 + Math.sin(t * 2) * 1.5, Math.cos(a) * 15); cam.lookAt(0, 6, 0); rollCam(cam, c.roll + Math.PI); },
  overlay(g, t) { const c = chaos(t, 2); withChaos(g, c, () => misreg(g, t, (col) => raven(g, lerp(-200, W() + 200, (t / 2) % 1), H() * 0.45 + Math.sin(t * 6) * 60, 1.7, t, col))); ransom(g, t, ['NEVERMORE'], H() * 0.82, 90, 0.5); finish(g, t); },
});
registerShot('p03', { kind: '3d',                        // vortex of eyes; the tell-tale heart
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.ink, '#12042a'], fog: [4, 70], fogColor: K.ink, fov: 75, ambient: 1.4, bloom: 0.35 });
    const eye = T.canvasTex(256, 256, (g, w, h) => { g.fillStyle = K.bone; g.fillRect(0, 0, w, h); g.fillStyle = K.acid; g.beginPath(); g.arc(w / 2, h / 2, 70, 0, 7); g.fill(); g.fillStyle = K.ink; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.fill(); g.strokeStyle = K.blood; g.lineWidth = 3; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(0, i * 26); g.quadraticCurveTo(50, i * 26 + 20, 90, h / 2); g.stroke(); } });
    const eyes = []; for (let i = 0; i < 140; i++) { const a = i * 0.6, r = 4 + (i % 5) * 0.6; const e = k.m(new k.THREE.SphereGeometry(0.7 + (i % 3) * 0.3, 20, 14), k.flat('#ffffff', { map: eye }), Math.cos(a) * r, Math.sin(a) * r, 10 - i * 1.2); st.add(e); eyes.push(e); }
    return { stage: st, eyes }; },
  draw(s, t) { const c = chaos(t, 3); const cam = s.stage.camera; cam.position.set(0, 0, 14 - c.pos * 9); cam.lookAt(0, 0, cam.position.z - 10); rollCam(cam, c.roll + t * 1.2); for (const e of s.eyes) { e.lookAt(cam.position); e.rotateY(-Math.PI / 2); } },
  overlay(g, t) { const c = chaos(t, 3); withChaos(g, c, () => misreg(g, t, (col) => heart(g, W() / 2, H() * 0.52, 1.25, t, col === K.ink ? K.blood : col), { main: K.blood })); if (t > 0.6) scrap(g, W() * 0.5, H() * 0.88, 720, 96, 0.03, K.ink, 31, { amp: 5, draw: (g) => text(g, 'THE TELL-TALE HEART', 0, 4, { size: 52, color: K.blood, font: FONTS.serif, italic: true, weight: 900 }) }); finish(g, t); },
});
registerShot('p04', { draw(g, t) {                        // 2D collage chaos: kaleidoscope of Poe
  const k = Math.floor(t * 8), inv = k % 4 === 3, c = chaos(t, 4, 0.18);
  spiralBG(g, t, inv ? K.acid : K.violet, inv ? K.ink : '#14062a', 20, c.pos * 0.6);
  withChaos(g, c, () => { g.save(); g.translate(W() / 2, H() / 2); for (let i = 0; i < 8; i++) { g.save(); g.rotate(i * Math.PI / 4 + twos(t) * 0.8); g.translate(0, -330); if (i % 2) g.scale(-1, 1); poe(g, 0, 0, 0.42, [K.acid, K.magenta, K.bone, K.teal][i % 4], { flat: true }); g.restore(); } g.restore();
    misreg(g, t, (col) => poe(g, W() / 2, H() / 2 + 20, 0.72, col, { flat: col !== K.ink })); });
  const blink = (Math.floor(t * 12) % 10) < 8; if (blink) for (const [ex, ey] of [[0.16, 0.2], [0.84, 0.78]]) for (const dx of [-40, 40]) { g.fillStyle = K.acid; g.beginPath(); g.ellipse(W() * ex + dx, H() * ey, 28, 14, 0, 0, 7); g.fill(); g.fillStyle = K.ink; g.fillRect(W() * ex + dx - 3, H() * ey - 13, 6, 26); }   // black cat eyes
  if (t > 0.3) scrap(g, W() * 0.24, H() * 0.12, 600, 86, -0.06, K.magenta, 41, { amp: 4, draw: (g) => text(g, '"QUOTH THE RAVEN..."', 0, 3, { size: 40, color: K.bone, font: FONTS.serif, italic: true, weight: 900 }) });
  if (k % 7 === 6) { g.fillStyle = 'rgba(244,255,232,.85)'; g.fillRect(0, 0, W(), H()); misreg(g, t, (col) => poe(g, W() / 2, H() * 0.55, 1.1, col, { flat: true }), { main: K.ink }); }   // impact flash
  finish(g, t);
} });
registerShot('p05', { kind: '3d',                        // spiral staircase vortex + title
  init(T) { const k = kit(T), st = T.stage({ mood: 'void', sky: [K.violet2, K.ink], fog: [4, 50], fogColor: '#0a0318', fov: 70, ambient: 1.2, bloom: 0.4 });
    const cols = [K.acid, K.magenta, K.teal, K.violet, K.bone]; const g = new k.THREE.Group(); for (let i = 0; i < 160; i++) { const a = i * 0.32, y = -i * 0.45; const step = k.m(new k.THREE.BoxGeometry(3.2, 0.25, 1.1), k.flat(cols[i % 5]), Math.cos(a) * 3.2, y, Math.sin(a) * 3.2); step.rotation.y = -a; g.add(step); } g.add(k.m(new k.THREE.CylinderGeometry(0.6, 0.6, 80, 12), k.flat(K.ink), 0, -36, 0)); st.add(g);
    return { stage: st, g }; },
  draw(s, t) { const c = chaos(t, 5, 0.3); const cam = s.stage.camera; s.g.rotation.y = t * 1.8 + c.pos * 0.6; cam.position.set(0.1, 6 - c.pos * 3, 0.1); cam.lookAt(0, -60, 0); rollCam(cam, c.roll); },
  overlay(g, t) { const c = chaos(t, 5, 0.3); withChaos(g, c, () => { g.save(); g.translate(W() / 2, H() * 0.5); g.rotate(twos(t) * 3); g.scale(0.5 - t * 0.08, 0.5 - t * 0.08); misreg(g, t, (col) => poe(g, 0, 0, 1, col, { flat: col !== K.ink })); g.restore(); });
    if (t > 0.8) ransom(g, t, ['THE LORE BEHIND', 'EDGAR ALLAN POE'], H() * 0.2, 70, 0.8);
    if (t > 2.0) scrap(g, W() / 2, H() * 0.86, 700, 84, 0.02, K.acid, 51, { amp: 4, tape: true, draw: (g) => text(g, 'WHAT REALLY KILLED HIM?', 0, 3, { size: 40, color: K.ink, font: FONTS.ui, weight: 900, spacing: 3 }) });
    finish(g, t); },
});
