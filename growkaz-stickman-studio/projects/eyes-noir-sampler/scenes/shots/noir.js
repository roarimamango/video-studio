// The Lore Behind What You See — NOIR CASE FILE sampler.
// Paper cut-out 2D figures living inside lit 3D noir sets; a "rabbit hole" camera that pushes into an object
// (a pupil, a painting, a screen) and falls through into the next scene. Calm camera, jarring content.
import { E, registerShot, ease, clamp, lerp, prog, rng } from '/engine/core.js';
import { POSE, person, hash } from '/projects/edgar-allan-poe/scenes/_kit.js';
import { mixP } from '/projects/king-arthur-anime/scenes/shots/anime.js';

const W = () => E.W, H = () => E.H;
const K = { ink: '#0a0a0d', slate: '#1b2029', steel: '#3a4554', fog: '#6d7a88', paper: '#ece4d0', manila: '#cdb27a', amber: '#e8a33a', sodium: '#ffb347', red: '#c8102e', stone: '#8c8984', gold: '#7a5a1c', cyan: '#7fe8ff' };
const MONO = '"FreeMono", "Liberation Mono", monospace';
const SERIF = '"Playfair Display", serif';

// ---------------------------------------------------------------- 2D helpers
const mono = (g, size, w = 700) => { g.font = `${w} ${size}px ${MONO}`; };
function paper(g, x, y, w, h, rot, fill = K.paper, seed = 1) {   // torn paper strip with drop shadow
  g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18; g.shadowOffsetY = 8; g.fillStyle = fill; g.beginPath();
  const r = rng(seed); g.moveTo(-w / 2, -h / 2); for (let i = 1; i <= 12; i++) g.lineTo(-w / 2 + (w * i) / 12, -h / 2 + (r() - 0.5) * 6); for (let i = 1; i <= 4; i++) g.lineTo(w / 2 + (r() - 0.5) * 6, -h / 2 + (h * i) / 4); for (let i = 11; i >= 0; i--) g.lineTo(-w / 2 + (w * i) / 12, h / 2 + (r() - 0.5) * 6); g.closePath(); g.fill(); g.restore();
}
// typewriter on a paper strip; chars appear at `cps`, block cursor blinks
function typed(g, t, at, x, y, str, o = {}) {
  if (t < at) return; const size = o.size || 38, n = Math.min(str.length, Math.floor((t - at) * (o.cps || 26))); mono(g, size); const full = g.measureText(str).width;
  paper(g, x, y, full + 70, size * 1.75, o.rot ?? -0.015, o.fill || K.paper, str.length);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.015); g.textBaseline = 'middle'; g.fillStyle = o.color || K.ink; mono(g, size); g.textAlign = 'left';
  const s = str.slice(0, n); for (let i = 0; i < s.length; i++) { g.globalAlpha = 0.82 + hash(i * 7 + str.length) * 0.18; g.fillText(s[i], -full / 2 + g.measureText(str.slice(0, i)).width, (hash(i * 3) - 0.5) * 2); }
  g.globalAlpha = 1; if (n < str.length || Math.floor(t * 2.5) % 2) { const cx = -full / 2 + g.measureText(s).width; g.fillStyle = K.red; g.fillRect(cx + 2, -size * 0.45, size * 0.5, size * 0.9); }
  g.restore();
}
// rubber stamp: slams in, rough ink
function stamp(g, t, at, x, y, str, o = {}) {
  if (t < at) return; const k = ease.out(prog(t, at, at + 0.12)), sc = lerp(1.7, 1, k), size = o.size || 92;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(sc, sc); g.globalAlpha = k * 0.92; g.strokeStyle = o.color || K.red; g.fillStyle = o.color || K.red; g.lineWidth = size * 0.08;
  g.font = `900 ${size}px ${SERIF}`; const w = g.measureText(str).width; g.strokeRect(-w / 2 - size * 0.3, -size * 0.7, w + size * 0.6, size * 1.3); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, 0, size * 0.02);
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 160; i++) { g.beginPath(); g.arc((hash(i) - 0.5) * (w + size), (hash(i + 99) - 0.5) * size * 1.3, 1 + hash(i * 5) * 4, 0, 7); g.fill(); }
  g.restore();
}
// manila evidence tag with a string hole
function evidence(g, t, at, x, y, label, o = {}) {
  if (t < at) return; const k = ease.out(prog(t, at, at + 0.35)); const yy = lerp(y - 160, y, k);
  mono(g, 30); const w = Math.max(360, g.measureText(label).width + 120), h = 120;
  g.save(); g.translate(x, yy); g.rotate(o.rot ?? 0.05); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; g.shadowOffsetY = 10; g.fillStyle = K.manila;
  g.beginPath(); g.moveTo(-w / 2 + 40, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2, h / 2); g.lineTo(-w / 2 + 40, h / 2); g.lineTo(-w / 2, 0); g.closePath(); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = K.ink; g.beginPath(); g.arc(-w / 2 + 34, 0, 10, 0, 7); g.fill(); g.strokeStyle = K.paper; g.lineWidth = 3; g.beginPath(); g.moveTo(-w / 2 + 34, 0); g.quadraticCurveTo(-w / 2 - 40, -60, -w / 2 - 80, -140); g.stroke();
  g.fillStyle = K.red; mono(g, 22); g.textBaseline = 'middle'; g.fillText(o.top || 'EVIDENCE', -w / 2 + 64, -26); g.fillStyle = K.ink; mono(g, 30); g.fillText(label, -w / 2 + 64, 18);
  g.restore();
}
// rabbit-hole transitions: an iris that opens from black at the start / closes onto the target at the end
function irisIn(g, t, dur = 0.5) { if (t >= dur) return; const r = ease.in(t / dur) * Math.hypot(W(), H()) * 0.6; g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, W(), H()); g.moveTo(W() / 2 + Math.max(1, r), H() / 2); g.arc(W() / 2, H() / 2, Math.max(1, r), 0, 7, true); g.fill('evenodd'); g.restore(); }
function irisOut(g, t, t0, t1) { if (t < t0) return; const r = (1 - ease.in(prog(t, t0, t1))) * Math.hypot(W(), H()) * 0.6; g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, W(), H()); g.moveTo(W() / 2 + Math.max(0.5, r), H() / 2); g.arc(W() / 2, H() / 2, Math.max(0.5, r), 0, 7, true); g.fill('evenodd'); g.restore(); }
// film scratches + dust (deterministic)
function film(g, t) { const f = Math.floor(t * 24); g.save(); g.globalAlpha = 0.18; g.strokeStyle = K.paper; g.lineWidth = 1.5; for (let i = 0; i < 2; i++) if (hash(f * 3 + i) > 0.55) { const x = hash(f + i * 17) * W(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (hash(f + i) - 0.5) * 20, H()); g.stroke(); } g.fillStyle = K.paper; for (let i = 0; i < 6; i++) { g.globalAlpha = 0.25 * hash(f * 7 + i); g.beginPath(); g.arc(hash(f * 11 + i) * W(), hash(f * 13 + i) * H(), 1 + hash(i + f) * 2.5, 0, 7); g.fill(); } g.restore(); }

// noir eye (also used inside textures)
function eyeArt(g, x, y, r, o = {}) {
  const open = o.open ?? 1, pup = o.pupil ?? 0.38, lx = x + (o.look || 0) * r * 0.45, ly = y + (o.lookY || 0) * r * 0.3;
  g.save(); g.beginPath(); g.ellipse(x, y, r * 1.75, Math.max(0.5, r * open), 0, 0, 7); g.clip();
  g.fillStyle = '#e9e4d8'; g.fillRect(x - r * 2, y - r * 1.3, r * 4, r * 2.6);
  g.strokeStyle = 'rgba(200,16,46,.55)'; g.lineWidth = Math.max(1, r * 0.018); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r); g.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 1.3, y + Math.sin(a + 0.3) * r * 0.8, x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.8); g.stroke(); }
  const gr = g.createRadialGradient(lx, ly, r * 0.1, lx, ly, r * 0.85); gr.addColorStop(0, o.iris || '#7d8a96'); gr.addColorStop(0.7, '#3b4652'); gr.addColorStop(1, '#0d1014'); g.fillStyle = gr; g.beginPath(); g.arc(lx, ly, r * 0.85, 0, 7); g.fill();
  g.strokeStyle = 'rgba(10,10,13,.5)'; g.lineWidth = Math.max(1, r * 0.012); for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; g.beginPath(); g.moveTo(lx + Math.cos(a) * r * pup, ly + Math.sin(a) * r * pup); g.lineTo(lx + Math.cos(a) * r * 0.82, ly + Math.sin(a) * r * 0.82); g.stroke(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(lx, ly, r * pup, 0, 7); g.fill();
  if (o.inPupil) o.inPupil(lx, ly, r * pup);
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(lx - r * 0.25, ly - r * 0.25, r * 0.1, r * 0.07, -0.5, 0, 7); g.fill();
  g.restore(); g.strokeStyle = K.ink; g.lineWidth = Math.max(2, r * 0.07); g.beginPath(); g.ellipse(x, y, r * 1.75, Math.max(0.5, r * open), 0, 0, 7); g.stroke();
}

// paper cut-out figure: ink silhouette + cream paper border + small glinting eyes; fedora/trench for the detective
const EDGE = (c, d = 5) => `drop-shadow(${d}px 0 0 ${c}) drop-shadow(-${d}px 0 0 ${c}) drop-shadow(0 ${d}px 0 ${c}) drop-shadow(0 -${d}px 0 ${c})`;
function cut(g, draw, edge = K.paper, d = 5) { g.save(); g.filter = EDGE(edge, d); draw(); g.restore(); }
function figure(g, who, x, y, s, pose, o = {}) {
  let q; cut(g, () => { q = person(g, who === 'DET' ? 'MAN' : who, x, y, s, pose, { flat: true, color: o.color || K.ink, facing: o.facing ?? 1 });
    if (who === 'DET') { const [hx, hy] = q.head, r = 30 * s; g.fillStyle = o.color || K.ink; g.beginPath(); g.ellipse(hx, hy - r * 0.55, r * 1.6, r * 0.28, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(hx - r * 0.9, hy - r * 0.6); g.lineTo(hx - r * 0.7, hy - r * 1.55); g.lineTo(hx + r * 0.7, hy - r * 1.55); g.lineTo(hx + r * 0.9, hy - r * 0.6); g.fill();
      g.beginPath(); g.moveTo(q.sh[0] - 22 * s, q.sh[1]); g.lineTo(q.sh[0] + 22 * s, q.sh[1]); g.lineTo(q.hip[0] + 40 * s, y - 40 * s); g.lineTo(q.hip[0] - 44 * s, y - 40 * s); g.fill(); } }, o.edge || K.paper, o.d ?? 5);
  if (o.eyes !== false) { const [hx, hy] = q.head, f = o.facing ?? 1; g.fillStyle = o.eyeCol || K.paper; for (const dx of [-9, 9]) { g.beginPath(); g.ellipse(hx + (dx + 6 * f) * s, hy + 2 * s, 4.5 * s, (o.blink ? 0.6 : 2.6) * s, 0, 0, 7); g.fill(); } }
  return q;
}

// ---------------------------------------------------------------- 3D helpers
function live(T, w, h, draw) { const tex = T.canvasTex(w, h, () => {}); const c = tex.image, g = c.getContext('2d'); return { tex, upd(t) { g.clearRect(0, 0, w, h); g.save(); draw(g, w, h, t); g.restore(); tex.needsUpdate = true; } }; }
function cutPlane(T, w, h, px, draw, o = {}) { const { THREE } = T; const L = live(T, px, Math.round(px * h / w), draw); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.lit === false ? new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ map: L.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, roughness: 1 })); m.castShadow = !!o.shadow; return { mesh: m, upd: L.upd }; }
function spot(T, st, color, intensity, pos, target, o = {}) { const { THREE } = T; const s = new THREE.SpotLight(T.THREE.Color ? new THREE.Color(color) : color, intensity, o.dist ?? 30, o.angle ?? 0.5, o.pen ?? 0.6, o.decay ?? 1); s.position.set(...pos); s.target.position.set(...target); s.castShadow = !!o.shadow; if (o.shadow) s.shadow.mapSize.set(1024, 1024); st.add(s, s.target); return s; }
const tex2 = (T, w, h, draw, rep) => T.canvasTex(w, h, draw, rep);
// rabbit-hole camera: glide from A to B, then dive into `dive` (camera ends a hair in front of it, looking straight at it)
function rabbit(cam, t, o) {
  const { from, to, look0, look1, dive, diveFrom = 2.55, end = 3.4, push = 0.06 } = o;
  const k = ease.inOut(clamp(t / diveFrom)), p = from.map((v, i) => lerp(v, to[i], k)), l = look0.map((v, i) => lerp(v, look1[i], k));
  const d = ease.inOut(prog(t, diveFrom, end - 0.18)); const lk = l.map((v, i) => lerp(v, dive[i], ease.inOut(prog(t, diveFrom - 0.6, diveFrom + 0.2))));
  const n = o.normal || [0, 0, 1], stop = dive.map((v, i) => v + n[i] * push);
  cam.position.set(...p.map((v, i) => lerp(v, stop[i], d))); cam.lookAt(...lk);
  if (o.fov) { cam.fov = o.fov; cam.updateProjectionMatrix(); }
}

// ============================================================ n01 — interrogation room
registerShot('n01', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: ['#050507', '#0d0f14'], fog: [6, 24], fogColor: '#07080b', fov: 40, ambient: 0.35, keyIntensity: 0.3, keyColor: '#8fa3c0', bloom: 0.35 });
    st.add(T.ground(30, 30, '#2a2c33', T.tiles('#202229', 10, [6, 6])));
    const wall = T.plane(30, 12, '#2a2f38', 0, 6, -5); st.add(wall); const side = T.plane(30, 12, '#232831', -6, 6, 0); side.rotation.y = Math.PI / 2; st.add(side);
    st.add(T.box(4.2, 0.12, 2.4, '#2b211a', 0.2, 1.5, 0)); for (const [x, z] of [[-1.7, -1], [2.1, -1], [-1.7, 1], [2.1, 1]]) st.add(T.box(0.1, 1.5, 0.1, '#16110d', x, 0.75, z));
    st.add(T.box(0.7, 0.08, 0.7, '#1a1a1e', -1.4, 0.95, 1.7)); st.add(T.box(0.7, 0.9, 0.08, '#1a1a1e', -1.4, 1.4, 2.05));
    const lamp = new THREE.Group(); lamp.position.set(0.2, 6.2, 0); st.add(lamp);
    lamp.add(T.cyl(0.015, 0.015, 3.2, '#111', 0, -1.6, 0)); const shade = T.cone(0.75, 0.55, '#0e0e10', 0, -3.3, 0, 24); lamp.add(shade);
    lamp.add(T.sphere(0.16, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2a8') }), 0, -3.55, 0));
    const sl = new THREE.SpotLight(new THREE.Color('#ffd28a'), 14, 12, 0.7, 0.6, 1.4); sl.position.set(0, -3.5, 0); sl.castShadow = true; sl.shadow.mapSize.set(1024, 1024); const tg = new THREE.Object3D(); tg.position.set(0, -6, 0); lamp.add(sl, tg); sl.target = tg;
    // the case file + eye polaroid (target of the dive)
    const folder = T.plane(1.7, 1.15, new THREE.MeshStandardMaterial({ map: tex2(T, 680, 460, (g, w, h) => {
      g.fillStyle = K.manila; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 400; i++) g.fillRect(hash(i) * w, hash(i + 5) * h, 2, 2);
      g.fillStyle = K.ink; mono(g, 30); g.fillText('CASE No. 0417', 34, 60); mono(g, 20, 400); g.fillText('SUBJECT: THE HUMAN EYE', 34, 98); g.fillText('STATUS:  OPEN', 34, 128); for (let i = 0; i < 7; i++) g.fillRect(34, 170 + i * 30, 230 - hash(i) * 80, 8);
      g.save(); g.translate(w * 0.72, h * 0.5); g.rotate(0.04); g.fillStyle = '#f2efe6'; g.fillRect(-120, -150, 240, 290); g.fillStyle = '#111'; g.fillRect(-104, -134, 208, 208); eyeArt(g, 0, -30, 56, { pupil: 0.42 }); g.fillStyle = K.ink; mono(g, 18, 400); g.fillText('exhibit 0', -50, 116); g.restore();
      g.fillStyle = '#9a9aa0'; g.fillRect(w * 0.72 - 20, h * 0.5 - 168, 40, 50);
    }), roughness: 0.95 }), 0.4, 1.565, 0.2); folder.rotation.x = -Math.PI / 2; st.add(folder);
    // detective: paper cut-out standing in the room, smoke curling
    const det = cutPlane(T, 1.6, 2.9, 420, (g, w, h, t) => { figure(g, 'DET', w * 0.45, h * 0.97, 2.15, mixP(POSE.stand, POSE.grip, 0.35 + 0.05 * Math.sin(t * 2)), { facing: 1 });
      g.strokeStyle = 'rgba(220,220,225,.55)'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 30, x = w * 0.62 + Math.sin(u * 9 - t * 3) * 14 * u, y = h * 0.36 - u * h * 0.3; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.fillStyle = K.amber; g.beginPath(); g.arc(w * 0.62, h * 0.36, 4, 0, 7); g.fill(); });
    const blinds = tex2(T, 512, 384, (g, w, h) => { g.save(); g.translate(w / 2, h / 2); g.transform(1, 0, -0.35, 1, 0, 0); for (let i = 0; i < 9; i++) { const y = -h / 2 + 30 + i * 36; const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, 'rgba(255,214,150,0)'); gr.addColorStop(0.25, 'rgba(255,214,150,.55)'); gr.addColorStop(0.75, 'rgba(255,214,150,.55)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(-w / 2, y, w, 20); } g.restore(); });
    const bl = T.plane(5.5, 4, new THREE.MeshBasicMaterial({ map: blinds, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), -2.4, 2.6, -4.97); st.add(bl);
    const bf = T.plane(5, 3.6, new THREE.MeshBasicMaterial({ map: blinds, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }), -3.4, 0.01, 1.6); bf.rotation.x = -Math.PI / 2; st.add(bf);
    det.mesh.position.set(-2.5, 1.45, -0.9); det.mesh.rotation.y = 0.45; det.mesh.castShadow = true; st.add(det.mesh);
    return { stage: st, lamp, det };
  },
  draw(s, t) { s.lamp.rotation.z = Math.sin(t * 1.1) * 0.1; s.lamp.rotation.x = Math.cos(t * 0.8) * 0.05; s.det.upd(t);
    // folder polaroid centre: x = 0.4 + (0.72-0.5)*1.7 = 0.774, z = 0.2 + (0.5-0.5-30/460)*1.15 ≈ 0.125
    rabbit(s.stage.camera, t, { from: [3.6, 3.6, 6.6], to: [1.2, 3.0, 1.9], look0: [-1.2, 1.5, -0.6], look1: [0.774, 1.57, 0.125], dive: [0.774, 1.57, 0.125], normal: [0, 1, 0.4], diveFrom: 2.6, end: 3.55, push: 0.06, fov: 40 }); },
  overlay(g, t) {
    typed(g, t, 0.3, W() * 0.22, H() * 0.12, 'CASE No. 0417', { size: 40 });
    typed(g, t, 1.0, W() * 0.27, H() * 0.2, 'SUBJECT: WHAT YOU SEE', { size: 32, rot: 0.01 });
    irisOut(g, t, 3.38, 3.6); film(g, t);
  },
});

// ============================================================ n02 — museum at night, Medusa
function medusaArt(g, w, h, t) {
  const gr = g.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#3a3f46'); gr.addColorStop(1, '#0c0d10'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.04)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.moveTo(hash(i) * w, 0); g.lineTo(hash(i + 3) * w, h); g.stroke(); }
  const x = w / 2, y = h * 0.47, s = h / 900;
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = K.ink; g.strokeStyle = K.ink; g.lineCap = 'round';
  for (let i = 0; i < 15; i++) { const a = -Math.PI + (i / 14) * Math.PI, wv = Math.sin(t * 3 + i * 1.3);
    const x0 = Math.cos(a) * 120, y0 = Math.sin(a) * 150 - 10, x1 = Math.cos(a) * 330 + wv * 50, y1 = Math.sin(a) * 300 - 30, mx = Math.cos(a + 0.45 * wv) * 240, my = Math.sin(a + 0.45 * wv) * 250;
    g.lineWidth = 30; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); g.beginPath(); g.ellipse(x1, y1, 32, 20, a + wv * 0.4, 0, 7); g.fill();
    g.strokeStyle = K.red; g.lineWidth = 4; g.beginPath(); g.moveTo(x1 + Math.cos(a) * 28, y1 + Math.sin(a) * 28); g.lineTo(x1 + Math.cos(a) * 55, y1 + Math.sin(a) * 55); g.stroke(); g.strokeStyle = K.ink; }
  g.beginPath(); g.ellipse(0, 0, 128, 165, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-62, 130); g.lineTo(-200, 460); g.lineTo(200, 460); g.lineTo(62, 130); g.fill();
  const glow = 0.75 + 0.25 * Math.sin(t * 7); for (const ex of [-48, 48]) { g.save(); g.shadowColor = K.sodium; g.shadowBlur = 40; g.fillStyle = `rgba(255,190,90,${glow})`; g.beginPath(); g.ellipse(ex, -12, 28, 12, 0, 0, 7); g.fill(); g.restore(); g.fillStyle = '#000'; g.beginPath(); g.ellipse(ex, -12, 5, 11, 0, 0, 7); g.fill(); }
  g.restore();
}
registerShot('n02', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: ['#050608', '#0b0d12'], fog: [8, 26], fogColor: '#06070a', fov: 42, ambient: 0.55, keyIntensity: 0.5, keyColor: '#7d94b8', bloom: 0.5 });
    st.add(T.ground(10, 50, '#ffffff', tex2(T, 256, 256, (g, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#1a1b1f' : '#4a4a50'; g.fillRect(i * w / 2, j * h / 2, w / 2, h / 2); } }, [5, 25])));
    for (const sx of [-1, 1]) { const wl = T.plane(50, 8, '#1c2028', sx * 3.4, 4, -10); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); }
    st.add(T.plane(8, 8, '#14171d', 0, 4, -14.2));
    const stone = T.mat('#8c8984'); for (const z of [2, -2, -6, -10]) for (const sx of [-1, 1]) { const x = sx * 2.3; st.add(T.box(0.8, 1.1, 0.8, '#2a2c31', x, 0.55, z)); st.add(T.box(0.75, 0.38, 0.38, stone, x, 1.32, z)); st.add(T.sphere(0.26, stone, x, 1.78, z)); st.add(T.box(0.14, 0.16, 0.14, stone, x, 1.55, z)); }
    for (const z of [2, -6]) spot(T, st, '#b7c6dc', 30, [0, 7, z], [0, 0, z - 1], { angle: 0.8, pen: 0.8 });
    st.add(T.box(4.3, 3.3, 0.15, '#5c4416', 0, 2.4, -14.05));
    const med = cutPlane(T, 3.7, 2.7, 900, medusaArt, { lit: false }); med.mesh.position.set(0, 2.4, -13.95); st.add(med.mesh);
    spot(T, st, '#ffcf8a', 30, [0, 6.5, -10], [0, 2.4, -14], { angle: 0.45, pen: 0.5 });
    // the visitor who turns to stone
    const vic = cutPlane(T, 1.6, 2.8, 420, (g, w, h, t) => {
      const pose = mixP(POSE.stand, POSE.thrown, ease.inOut(prog(t, 0.4, 1.0)) * 0.4);
      figure(g, 'MAN', w * 0.5, h * 0.97, 2.0, pose, { facing: -1 });
      const top = h * (0.97 - ease.inOut(prog(t, 1.0, 2.6)) * 0.97); g.save(); g.beginPath(); g.rect(0, top, w, h); g.clip(); figure(g, 'MAN', w * 0.5, h * 0.97, 2.0, pose, { facing: -1, color: '#5e5b57', eyes: false });
      g.strokeStyle = '#2a2a2a'; g.lineWidth = 2; const r = rng(4); for (let i = 0; i < 22; i++) { const cx = w * 0.4 + r() * w * 0.2, cy = h * 0.2 + r() * h * 0.75; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (r() - 0.5) * 20, cy + 16); g.lineTo(cx + (r() - 0.5) * 16, cy + 32); g.stroke(); } g.restore(); }, { shadow: true });
    vic.mesh.position.set(0.9, 1.4, -7.5); vic.mesh.rotation.y = -0.2; st.add(vic.mesh);
    spot(T, st, '#d8e2f0', 10, [1.5, 6, -6], [0.9, 0, -7.5], { angle: 0.35, pen: 0.6, shadow: true });
    return { stage: st, med, vic };
  },
  draw(s, t) { s.med.upd(t); s.vic.upd(t);
    rabbit(s.stage.camera, t, { from: [-0.6, 1.7, 6.5], to: [-0.2, 2.1, -4.5], look0: [0, 1.9, -14], look1: [-0.1, 2.45, -14], dive: [-0.177, 2.42, -13.95], normal: [0, 0, 1], diveFrom: 2.35, end: 3.4, push: 0.04 }); },
  overlay(g, t) { irisIn(g, t, 0.5);
    evidence(g, t, 0.55, W() * 0.2, H() * 0.15, 'ANCIENT GREECE', { top: 'EXHIBIT A' });
    typed(g, t, 1.3, W() * 0.7, H() * 0.86, 'ONE LOOK. TURNED TO STONE.', { size: 34, rot: 0.012 });
    irisOut(g, t, 3.18, 3.4); film(g, t); },
});

// ============================================================ n03 — rainy alley, evil eye
function nazarArt(g, w, h, t, look) {
  g.save(); g.filter = EDGE(K.paper, 6); const cx = w / 2, cy = h / 2, R = w * 0.42;
  for (const [r, c] of [[1, '#0e2a6e'], [0.74, '#ece4d0'], [0.5, '#4f8fc0'], [0.26, '#050505']]) { g.fillStyle = c; g.beginPath(); g.arc(cx + (r < 0.6 ? look * R * 0.22 : 0), cy, R * r, 0, 7); g.fill(); }
  g.restore(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(cx + look * R * 0.22 - R * 0.08, cy - R * 0.08, R * 0.05, 0, 7); g.fill();
}
registerShot('n03', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: ['#04050a', '#0c1018'], fog: [5, 30], fogColor: '#06080d', fov: 44, ambient: 0.5, keyIntensity: 0.45, keyColor: '#6f8bb0', bloom: 0.7 });
    st.add(T.ground(8, 60, '#ffffff', tex2(T, 256, 512, (g, w, h) => { g.fillStyle = '#0e1015'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(150,170,200,${0.05 + hash(i) * 0.12})`; g.fillRect(hash(i * 3) * w, hash(i * 5) * h, 2 + hash(i) * 30, 2); } }, [2, 8])));
    const brick = tex2(T, 256, 256, (g, w, h) => { g.fillStyle = '#1e1a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2e2524'; for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) g.fillRect(i * 64 + (j % 2) * 32 + 3, j * 32 + 3, 58, 26); }, [12, 3]);
    for (const sx of [-1, 1]) { const wl = T.plane(60, 10, new THREE.MeshStandardMaterial({ map: brick, roughness: 0.95 }), sx * 3, 5, -20); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); }
    const charms = []; const r = rng(21); const L = live(T, 256, 256, () => {}); const mat = new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, color: new THREE.Color('#b8c0cc') });
    const geo = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < 70; i++) { const sx = i % 2 ? 1 : -1, z = 2 - r() * 34, y = 0.8 + r() * 5, s = 0.45 + r() * 0.5; const m = new THREE.Mesh(geo, mat); m.scale.setScalar(s); m.position.set(sx * 2.97, y, z); m.rotation.y = -sx * Math.PI / 2; m.rotation.z = (r() - 0.5) * 0.5; st.add(m); charms.push(m); }
    const hero = new THREE.Mesh(geo, mat); hero.scale.setScalar(0.8); hero.position.set(2.96, 2.3, -6); hero.rotation.y = -Math.PI / 2; st.add(hero);
    // sodium street lamp
    st.add(T.cyl(0.06, 0.08, 5, '#0b0b0d', -2.6, 2.5, -9)); st.add(T.box(0.9, 0.06, 0.06, '#0b0b0d', -2.15, 4.95, -9)); st.add(T.sphere(0.18, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc36b') }), -1.75, 4.85, -9));
    spot(T, st, '#ffb347', 40, [-1.75, 4.8, -9], [-1.6, 0, -9], { angle: 0.6, pen: 0.5, dist: 14, shadow: true });
    const wom = cutPlane(T, 1.3, 2.6, 380, (g, w, h, t) => figure(g, 'WOMAN', w * 0.5, h * 0.97, 1.85, mixP(POSE.stand, POSE.raise, ease.inOut(prog(t, 1.2, 1.6)) * 0.6), { facing: 1 }), { shadow: true });
    wom.mesh.position.set(-1.3, 1.3, -9.4); wom.mesh.rotation.y = 0.15; st.add(wom.mesh);
    return { stage: st, L, wom };
  },
  draw(s, t) { const look = t < 1.2 ? Math.sin(t * 5) * 0.6 : lerp(Math.sin(1.2 * 5) * 0.6, 0, ease.out(prog(t, 1.2, 1.3))); s.L.upd(t); { const g = s.L.tex.image.getContext('2d'); g.clearRect(0, 0, 256, 256); nazarArt(g, 256, 256, t, look); s.L.tex.needsUpdate = true; } s.wom.upd(t);
    rabbit(s.stage.camera, t, { from: [0.2, 1.6, 5], to: [0.6, 2.0, -2.8], look0: [0, 1.9, -20], look1: [1.6, 2.2, -8], dive: [2.96, 2.3, -6], normal: [-1, 0, 0], diveFrom: 2.35, end: 3.4, push: 0.03 }); },
  overlay(g, t) { irisIn(g, t, 0.5);
    g.save(); g.strokeStyle = 'rgba(190,205,230,.35)'; g.lineWidth = 2; const f = Math.floor(t * 24); for (let i = 0; i < 140; i++) { const x = hash(i * 7 + f) * W(), y = hash(i * 13 + f * 3) * H(); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 46); g.stroke(); } g.restore();
    evidence(g, t, 0.55, W() * 0.2, H() * 0.15, 'THE EVIL EYE', { top: 'EXHIBIT B' });
    typed(g, t, 1.35, W() * 0.68, H() * 0.86, 'FEARED FOR 5,000 YEARS', { size: 34, rot: 0.012 });
    irisOut(g, t, 3.18, 3.4); film(g, t); },
});

// ============================================================ n04 — Florence 1817, Stendhal syndrome
function swirlArt(g, w, h, t) {
  g.fillStyle = '#0d1320'; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(t * 0.5);
  for (let i = 0; i < 26; i++) { g.fillStyle = i % 2 ? '#1d2c4a' : '#b98a2e'; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 12; k++) { const r = k * 70, a = (i / 26) * Math.PI * 2 + k * 0.25 + Math.sin(t + k) * 0.03; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } for (let k = 12; k >= 0; k--) { const r = k * 70, a = ((i + 1) / 26) * Math.PI * 2 + k * 0.25; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); }
  g.restore(); const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  eyeArt(g, w / 2, h / 2, h * 0.17, { pupil: 0.3 + 0.12 * Math.sin(t * 3), look: Math.sin(t * 1.7) * 0.4 });
}
registerShot('n04', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: '#070506', fog: [6, 22], fogColor: '#080506', fov: 42, ambient: 0.16, keyIntensity: 0.15, keyColor: '#c0a080', bloom: 0.55 });
    st.add(T.ground(20, 20, '#ffffff', T.planks('#2a1a12', 18, [4, 4])));
    const red = '#4a0e14'; st.add(T.plane(20, 8, red, 0, 4, -5.2)); for (const sx of [-1, 1]) { const wl = T.plane(20, 8, red, sx * 5, 4, 0); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); }
    const minis = [(g, w, h) => { g.fillStyle = '#2a2016'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a5030'; g.beginPath(); g.ellipse(w / 2, h * 0.4, w * 0.18, h * 0.22, 0, 0, 7); g.fill(); g.fillRect(w * 0.25, h * 0.6, w * 0.5, h * 0.4); }, (g, w, h) => { g.fillStyle = '#1a2230'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5040'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.4, h * 0.45); g.lineTo(w, h); g.fill(); g.fillStyle = '#c8a050'; g.beginPath(); g.arc(w * 0.75, h * 0.25, 18, 0, 7); g.fill(); }];
    for (const [x, z, ry, i] of [[-3.2, -5.1, 0, 0], [3.2, -5.1, 0, 1], [-4.9, -2, Math.PI / 2, 1], [4.9, -2, -Math.PI / 2, 0]]) { const fr = T.box(1.5, 1.9, 0.08, T.mat('#8a6422', { metalness: 0.6, roughness: 0.4 }), x, 2.4, z); fr.rotation.y = ry; st.add(fr); const p = T.plane(1.2, 1.6, new THREE.MeshStandardMaterial({ map: tex2(T, 192, 256, minis[i]) }), x + Math.sin(ry) * 0.05, 2.4, z + Math.cos(ry) * 0.05); p.rotation.y = ry; st.add(p); }
    st.add(T.box(3.6, 2.8, 0.1, T.mat('#9a7226', { metalness: 0.6, roughness: 0.35 }), 0, 2.5, -5.1));
    const art = cutPlane(T, 3.1, 2.3, 820, swirlArt, { lit: false }); art.mesh.position.set(0, 2.5, -5.03); st.add(art.mesh);
    const torch = spot(T, st, '#fff1d6', 55, [1.5, 2.2, 3], [0, 2.5, -5], { angle: 0.32, pen: 0.45, dist: 16, shadow: true });
    const man = cutPlane(T, 2.6, 2.6, 520, (g, w, h, t) => { const k = ease.in(prog(t, 1.5, 2.3)); g.translate(w * 0.5, h * 0.97); g.rotate(-k * 1.3 + Math.sin(t * 6) * 0.03 * (1 - k)); figure(g, 'GENT', 0, 0, 1.75, mixP(POSE.stand, POSE.thrown, 0.2 + k * 0.6), { facing: 1 }); }, { shadow: true });
    man.mesh.position.set(-0.75, 1.3, -2.9); man.mesh.rotation.y = 0.1; st.add(man.mesh);
    return { stage: st, art, man, torch };
  },
  draw(s, t) { s.art.upd(t); s.man.upd(t); s.torch.target.position.set(Math.sin(t * 1.3) * 2.2, 2.2 + Math.sin(t * 2.1) * 0.4, -5); if (t > 2.2) s.torch.target.position.set(0, 2.5, -5);
    rabbit(s.stage.camera, t, { from: [2.6, 1.8, 5], to: [0.7, 2.2, 1.0], look0: [-0.5, 2.0, -5], look1: [0, 2.5, -5], dive: [0, 2.5, -5.03], normal: [0, 0, 1], diveFrom: 2.35, end: 3.4, push: 0.03 }); },
  overlay(g, t) { irisIn(g, t, 0.5);
    // paper chart recorder strip
    const bx = W() * 0.1, by = H() * 0.84, bw = W() * 0.8, bh = 120; paper(g, bx + bw / 2, by, bw, bh, 0.005, '#efe6cf', 77);
    g.save(); g.strokeStyle = 'rgba(200,16,46,.18)'; g.lineWidth = 1; for (let x = bx; x < bx + bw; x += 24) { g.beginPath(); g.moveTo(x, by - bh / 2 + 8); g.lineTo(x, by + bh / 2 - 8); g.stroke(); } for (let y = by - bh / 2 + 10; y < by + bh / 2; y += 20) { g.beginPath(); g.moveTo(bx, y); g.lineTo(bx + bw - 160, y); g.stroke(); }
    const bpm = Math.round(lerp(70, 188, ease.in(prog(t, 0.4, 2.2)))); g.strokeStyle = K.red; g.lineWidth = 3.5; g.beginPath(); for (let i = 0; i <= 320; i++) { const u = i / 320, tt = t * 2 - (1 - u) * 2.2, ph = (((tt * bpm) / 60) % 1 + 1) % 1, v = Math.exp(-((ph - 0.5) ** 2) / 0.001) - 0.35 * Math.exp(-((ph - 0.56) ** 2) / 0.0007); const px = bx + 20 + u * (bw - 200), py = by + 10 - v * 44; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.fillStyle = bpm > 150 ? K.red : K.ink; mono(g, 40); g.textBaseline = 'middle'; g.fillText(`${bpm}`, bx + bw - 150, by - 6); mono(g, 18); g.fillText('BPM', bx + bw - 66, by - 2); g.restore();
    evidence(g, t, 0.5, W() * 0.2, H() * 0.15, 'FLORENCE, 1817', { top: 'EXHIBIT C' });
    stamp(g, t, 1.9, W() * 0.74, H() * 0.18, 'STENDHAL SYNDROME', { size: 54, rot: -0.08 });
    irisOut(g, t, 3.18, 3.4); film(g, t); },
});

// ============================================================ n05 — 1957 cinema
function filmArt(g, w, h, t) {
  const f = Math.floor(t * 24); g.fillStyle = '#d9d2c0'; g.fillRect(0, 0, w, h);
  if ([20, 33, 46].includes(f)) { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, w, h); g.fillStyle = K.red; g.font = `900 ${h * 0.26}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f === 33 ? 'DRINK' : 'EAT POPCORN', w / 2, h / 2); return; }
  g.strokeStyle = '#2a2620'; g.lineWidth = 6; for (const r of [0.18, 0.32]) { g.beginPath(); g.arc(w / 2, h / 2, h * r, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  const sw = ((t * 1.2) % 1) * Math.PI * 2; g.fillStyle = 'rgba(42,38,32,.35)'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, h * 0.6, -Math.PI / 2, -Math.PI / 2 + sw); g.fill();
  g.fillStyle = '#1a1814'; g.font = `900 ${h * 0.4}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.max(1, 5 - Math.floor(t * 1.2))), w / 2, h / 2 + 6);
  g.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 0; i < 160; i++) g.fillRect(hash(i + f * 17) * w, hash(i * 3 + f) * h, 2, 2);
}
registerShot('n05', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: '#050405', fog: [8, 26], fogColor: '#050405', fov: 42, ambient: 0.12, keyIntensity: 0.1, bloom: 0.9 });
    st.add(T.ground(20, 30, '#120a0b'));
    st.add(T.plane(20, 9, '#0d0909', 0, 4.5, -9.3));
    const scr = cutPlane(T, 7.4, 3.4, 900, filmArt, { lit: false }); scr.mesh.position.set(0, 3.4, -9.2); st.add(scr.mesh);
    for (const sx of [-1, 1]) st.add(T.box(1.4, 4, 0.2, '#3a0a10', sx * 4.3, 3.4, -9.1));
    const seat = T.mat('#3a0d12'); for (let row = 0; row < 7; row++) for (let i = -6; i <= 6; i++) { const z = 3 - row * 1.3, x = i * 0.62; st.add(T.box(0.54, 0.5, 0.5, seat, x, 0.25, z)); st.add(T.box(0.54, 0.75, 0.1, seat, x, 0.75, z + 0.25)); }
    // audience: one paper cut-out strip of heads per row; heads all turn round at 1.9 s
    const rows = []; for (let row = 0; row < 7; row++) { const p = cutPlane(T, 8.2, 0.9, 1100, (g, w, h, t) => { const turn = ease.inOut(prog(t, 1.9 + row * 0.02, 2.15 + row * 0.02)); for (let i = 0; i < 13; i++) { if (hash(i + row * 31) < 0.22) continue; const x = (i + 0.5) / 13 * w + (hash(i * row) - 0.5) * 20, y = h * 0.42, r = h * 0.3;
        cut(g, () => { g.fillStyle = K.ink; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, h, r * 1.8, r * 1.1, 0, Math.PI, 0); g.fill(); }, '#8a8070', 3);
        if (turn > 0) { g.fillStyle = `rgba(236,228,208,${turn})`; for (const dx of [-0.35, 0.35]) { g.beginPath(); g.ellipse(x + dx * r, y, r * 0.16, r * 0.1 + r * 0.06 * turn, 0, 0, 7); g.fill(); } } } }); p.mesh.position.set(0.1, 1.25, 3 - row * 1.3 + 0.32); st.add(p.mesh); rows.push(p); }
    // projector beam
    const beam = new THREE.Mesh(new THREE.ConeGeometry(3.6, 15, 32, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#d8d0ff'), transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.set(0, 3.6, -1.6); beam.rotation.x = Math.PI / 2; st.add(beam);
    spot(T, st, '#e8e2ff', 20, [0, 4, 6], [0, 3.4, -9], { angle: 0.4, pen: 0.4 });
    return { stage: st, scr, rows };
  },
  draw(s, t) { s.scr.upd(t); s.rows.forEach((r) => r.upd(t));
    rabbit(s.stage.camera, t, { from: [0.4, 1.55, 6.8], to: [0.1, 2.7, -1.5], look0: [0, 2.6, -9], look1: [0, 3.4, -9.2], dive: [0, 3.4, -9.2], normal: [0, 0, 1], diveFrom: 2.35, end: 3.4, push: 0.04 }); },
  overlay(g, t) { irisIn(g, t, 0.5);
    // newspaper clipping slides in
    if (t > 0.7) { const k = ease.out(prog(t, 0.7, 1.05)), x = lerp(W() + 400, W() * 0.76, k), y = H() * 0.3; paper(g, x, y, 520, 300, 0.05, '#e6dec6', 57);
      g.save(); g.translate(x, y); g.rotate(0.05); g.fillStyle = K.ink; g.textAlign = 'center'; g.font = `900 22px ${SERIF}`; g.fillText('THE EVENING STAR · SEPT. 1957', 0, -110); g.fillRect(-230, -96, 460, 3);
      g.font = `900 46px ${SERIF}`; g.fillText('HIDDEN ADS', 0, -46); g.fillText('IN THE MOVIES?', 0, 8); g.fillStyle = 'rgba(10,10,13,.6)'; for (let i = 0; i < 4; i++) g.fillRect(-220, 46 + i * 22, 440 - (i === 3 ? 160 : 0), 8); g.restore(); }
    evidence(g, t, 0.45, W() * 0.2, H() * 0.15, 'NEW JERSEY, 1957', { top: 'EXHIBIT D' });
    stamp(g, t, 2.2, W() * 0.76, H() * 0.32, 'HOAX', { size: 110, rot: -0.2 });
    irisOut(g, t, 3.18, 3.4); film(g, t); },
});

// ============================================================ n06 — bedroom, the feed
function feedArt(g, w, h, t, seed = 0) {
  g.fillStyle = '#0c0e12'; g.fillRect(0, 0, w, h); const off = (t * 260 + seed * 97) % 220;
  for (let i = -1; i < Math.ceil(h / 220) + 1; i++) { const y = i * 220 - off, k = i + Math.floor((t * 260 + seed * 97) / 220) + seed; g.fillStyle = '#1b2029'; g.fillRect(14, y + 10, w - 28, 200);
    g.fillStyle = ['#3a4554', '#6d7a88', '#c8102e', '#2a2f38'][((k % 4) + 4) % 4]; g.fillRect(24, y + 46, w - 48, 120); g.fillStyle = K.paper; g.beginPath(); g.arc(40, y + 28, 12, 0, 7); g.fill(); g.fillRect(60, y + 22, 90, 10);
    g.fillStyle = K.red; g.beginPath(); const hx = 36, hy = y + 186; g.moveTo(hx, hy + 9); g.bezierCurveTo(hx - 16, hy - 2, hx - 8, hy - 14, hx, hy - 5); g.bezierCurveTo(hx + 8, hy - 14, hx + 16, hy - 2, hx, hy + 9); g.fill(); g.fillStyle = K.paper; g.fillRect(56, y + 182, 50, 8); }
  g.fillStyle = K.red; g.beginPath(); g.arc(w - 30, 30, 22, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `900 20px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.min(99, 3 + Math.floor(t * 9) + seed)), w - 30, 31);
}
registerShot('n06', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: '#040507', fog: [5, 16], fogColor: '#040507', fov: 42, ambient: 0.1, keyIntensity: 0.08, keyColor: '#6080a0', bloom: 1.0 });
    st.add(T.ground(16, 16, '#15171c')); st.add(T.plane(16, 7, '#1a1e26', 0, 3.5, -4.2)); const lw = T.plane(16, 7, '#161a21', -4, 3.5, 0); lw.rotation.y = Math.PI / 2; st.add(lw);
    st.add(T.box(2.4, 0.5, 3.2, '#22252c', 0, 0.25, -2.4)); st.add(T.box(2.4, 0.25, 2.2, '#3a4150', 0, 0.62, -1.9)); st.add(T.box(1.2, 0.2, 0.6, '#5a6070', 0, 0.62, -3.6)); st.add(T.box(2.6, 1.3, 0.12, '#1a1c22', 0, 0.9, -4.0));
    const fig = cutPlane(T, 1.6, 1.6, 420, (g, w, h, t) => { const x = w * 0.5, y = h * 0.62; cut(g, () => { g.fillStyle = K.ink; g.beginPath(); g.arc(x, y - 110, 70, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y + 120, 150, 150, 0, Math.PI, 0); g.fill(); g.fillRect(x - 30, y - 50, 60, 60); }, '#22303a', 4);
      g.fillStyle = 'rgba(127,232,255,.35)'; g.beginPath(); g.arc(x, y - 110, 70, 0.2, Math.PI - 0.2); g.fill(); g.fillStyle = K.cyan; const bl = (Math.floor(t * 24) % 50) < 2; for (const dx of [-24, 24]) { g.beginPath(); g.ellipse(x + dx, y - 108, 9, bl ? 1 : 5, 0, 0, 7); g.fill(); } }, { shadow: false });
    fig.mesh.position.set(0, 1.45, -2.9); st.add(fig.mesh);
    const phone = cutPlane(T, 0.22, 0.4, 220, (g, w, h, t) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.save(); g.translate(8, 8); feedArt(g, w - 16, h - 16, t); g.restore(); }, { lit: false });
    phone.mesh.position.set(0.05, 1.12, -2.2); phone.mesh.rotation.x = -0.15; st.add(phone.mesh);
    const pl = new THREE.PointLight(new THREE.Color('#7fe8ff'), 6, 5, 1.2); pl.position.set(0.05, 1.2, -2.0); st.add(pl);
    // screens multiplying across the walls
    const screens = []; const r = rng(66); for (let i = 0; i < 26; i++) { const sc = cutPlane(T, 0.7, 1.2, 160, (g, w, h, t) => feedArt(g, w, h, t, i), { lit: false }); const onBack = i % 3 !== 0; if (onBack) sc.mesh.position.set(-3.4 + r() * 6.8, 1.4 + r() * 3.6, -4.15); else { sc.mesh.position.set(-3.95, 1.2 + r() * 3.8, -3.6 + r() * 5); sc.mesh.rotation.y = Math.PI / 2; } sc.at = 0.4 + i * 0.07; st.add(sc.mesh); screens.push(sc); }
    return { stage: st, fig, phone, screens };
  },
  draw(s, t) { s.fig.upd(t); s.phone.upd(t); s.screens.forEach((sc) => { const k = ease.out(prog(t, sc.at, sc.at + 0.18)); sc.mesh.scale.setScalar(Math.max(0.001, k)); if (k > 0) sc.upd(t); });
    rabbit(s.stage.camera, t, { from: [2.8, 2.0, 2.8], to: [0.9, 1.5, -0.6], look0: [-0.4, 1.8, -3.5], look1: [0.05, 1.12, -2.2], dive: [0.05, 1.12, -2.2], normal: [0, 0.15, 1], diveFrom: 2.35, end: 3.4, push: 0.03 }); },
  overlay(g, t) { irisIn(g, t, 0.5);
    evidence(g, t, 0.5, W() * 0.2, H() * 0.15, 'THE FEED', { top: 'EXHIBIT E' });
    typed(g, t, 1.3, W() * 0.7, H() * 0.86, 'IT NEVER ENDS.', { size: 38, rot: 0.012 });
    irisOut(g, t, 3.18, 3.4); film(g, t); },
});

// ============================================================ n07 — evidence board, reverse rabbit hole + title
const POLA = [
  (g, w, h) => eyeArt(g, w / 2, h / 2, h * 0.24),
  (g, w, h) => { g.save(); g.scale(1, 1); medusaArt(g, w, h, 0.3); g.restore(); },
  (g, w, h) => { g.fillStyle = '#16181d'; g.fillRect(0, 0, w, h); nazarArt(g, w, h, 0, 0); },
  (g, w, h) => swirlArt(g, w, h, 0.7),
  (g, w, h) => filmArt(g, w, h, 20 / 24),
  (g, w, h) => feedArt(g, w, h, 0.4),
];
registerShot('n07', { kind: '3d',
  init(T) {
    const { THREE } = T, st = T.stage({ sky: '#060506', fog: [10, 30], fogColor: '#060506', fov: 40, ambient: 0.25, keyIntensity: 0.2, keyColor: '#c0a888', bloom: 0.5 });
    st.add(T.plane(16, 9, new THREE.MeshStandardMaterial({ map: tex2(T, 256, 256, (g, w, h) => { g.fillStyle = '#6a4a2c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { g.fillStyle = hash(i) > 0.5 ? 'rgba(40,24,12,.5)' : 'rgba(150,110,70,.35)'; g.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2 + hash(i) * 3, 2); } }, [5, 3]), roughness: 1 }), 0, 0, 0));
    const pinM = T.mat('#c8102e'), strM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#b0102a') });
    const pos = [[-4.6, 2.2, -0.12], [-5.0, -1.5, 0.1], [-2.6, -2.8, -0.06], [3.0, 2.6, 0.08], [4.9, -0.4, -0.1], [2.8, -2.7, 0.07]];
    pos.forEach(([x, y, rot], i) => { const p = T.plane(1.5, 1.75, new THREE.MeshStandardMaterial({ map: tex2(T, 300, 350, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.save(); g.beginPath(); g.rect(18, 18, w - 36, w - 36); g.clip(); g.translate(18, 18); POLA[i](g, w - 36, w - 36); g.restore(); g.fillStyle = K.ink; mono(g, 22); g.fillText(`EXHIBIT ${'0ABCDE'[i]}`, 22, h - 20); }) }), x, y, 0.02); p.rotation.z = rot; st.add(p); st.add(T.sphere(0.07, pinM, x, y + 0.75, 0.08));
      const a = new THREE.Vector3(x, y + 0.75, 0.09), b = new THREE.Vector3(0, 0.2, 0.09), len = a.distanceTo(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 5), strM); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); st.add(c); });
    const big = cutPlane(T, 2.8, 3.2, 700, (g, w, h, t) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#0b0b0e'; g.fillRect(30, 30, w - 60, w - 60); const bl = t > 2.85 && t < 3.1 ? 1 - Math.sin(prog(t, 2.85, 3.1) * Math.PI) : 1; eyeArt(g, w / 2, 30 + (w - 60) / 2, w * 0.2, { open: bl, pupil: 0.36, look: Math.sin(t * 2) * 0.3 }); g.fillStyle = K.red; mono(g, 30); g.fillText('THE WITNESS', 40, h - 34); });
    big.mesh.position.set(0, 0.2, 0.05); st.add(big.mesh); st.add(T.sphere(0.09, pinM, 0, 1.75, 0.1));
    spot(T, st, '#ffd9a0', 45, [1.5, 5, 7], [0, 0, 0], { angle: 0.55, pen: 0.7, dist: 20, shadow: true });
    return { stage: st, big };
  },
  draw(s, t) { s.big.upd(t); const k = ease.out(clamp(t / 2.3)); const cam = s.stage.camera;
    // eye centre on the big photo: y = 0.2 + (0.5 - (30 + 320)/800)*3.2 ≈ 0.4
    cam.position.set(lerp(0, 0.6, k), lerp(0.4, 0.2, k), lerp(0.25, 9.5, k)); cam.lookAt(0, lerp(0.4, 0.1, k), 0); cam.rotateZ(lerp(0.5, 0, k)); },
  overlay(g, t) { irisIn(g, t, 0.45);
    typed(g, t, 1.4, W() / 2, H() * 0.1, 'THE LORE BEHIND WHAT YOU SEE', { size: 50, cps: 30, rot: -0.01 });
    stamp(g, t, 2.4, W() * 0.78, H() * 0.86, 'CASE OPEN', { size: 60, rot: -0.1 });
    if (t > 3.2) { g.fillStyle = '#000'; g.fillRect(0, 0, W(), H()); }
    film(g, t); },
});
