// wys.js — shot templates for "The Lore Behind What You See" (params.type = 'world' | 2D template name).
// Clean noir: one subject per shot, soft light, one text element at a time, slow pushes; rabbit-hole dives between exhibits.
import { E, registerShot, ease, clamp, lerp, prog, rng } from '/engine/core.js';
import { W, H, K, MONO, SERIF, mono, hash, paper, typed, stamp, evidence, overlays, irisIn, irisOut, film, eyeArt, nazar, medusa, swirl, fresco, feed, filmLeader, flowers, eyesPhoto, ring, bobo, cigarette, cut, figure, actedFigure, poseOf } from '../_kit.js';

// ================================================================ 3D helpers
function live(T, w, h, draw) { const tex = T.canvasTex(w, h, () => {}); const g = tex.image.getContext('2d'); return { tex, upd(t) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); draw(g, w, h, t); g.restore(); tex.needsUpdate = true; } }; }
function livePlane(T, w, h, px, draw, o = {}) { const { THREE } = T; const L = live(T, px, Math.round((px * h) / w), draw); const mat = o.lit ? new THREE.MeshStandardMaterial({ map: L.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, roughness: 1 }) : new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, color: new THREE.Color(o.tint || '#ffffff') }); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); return { mesh: m, upd: L.upd }; }
const tex = (T, w, h, draw, rep) => T.canvasTex(w, h, draw, rep);
function spot(T, st, color, I, pos, target, o = {}) { const { THREE } = T; const s = new THREE.SpotLight(new THREE.Color(color), I, o.dist ?? 30, o.angle ?? 0.6, o.pen ?? 0.8, o.decay ?? 1); s.position.set(...pos); s.target.position.set(...target); s.castShadow = false; st.add(s, s.target); return s; }
function pointL(T, st, color, I, pos, dist = 8) { const { THREE } = T; const p = new THREE.PointLight(new THREE.Color(color), I, dist, 1.2); p.position.set(...pos); st.add(p); return p; }
function blob(T, x, z, r = 0.5) { const { THREE } = T; const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshBasicMaterial({ map: blobTex(T), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); return m; }
let _blob; const blobTex = (T) => (_blob ||= tex(T, 64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
const glowMat = (T, c) => new T.THREE.MeshBasicMaterial({ color: new T.THREE.Color(c) });
function frameArt(T, st, w, h, x, y, z, ry, draw, o = {}) { const fr = T.box(w + 0.3, h + 0.3, 0.08, T.mat(o.frame || '#8a6422', { metalness: 0.5, roughness: 0.45 }), x, y, z); fr.rotation.y = ry; st.add(fr); const P = livePlane(T, w, h, o.px || 600, draw); P.mesh.position.set(x + Math.sin(ry) * 0.05, y, z + Math.cos(ry) * 0.05); P.mesh.rotation.y = ry; st.add(P.mesh); return P; }
const v = (a) => a;

// ================================================================ 3D worlds
// each returns { anchors: {name: [x,y,z, nx,ny,nz]}, cams: {name: {from,to,look0,look1}}, lives: [...] }
const WORLDS = {
  kitchen(T, st, p) {   // Newcastle staff coffee room
    const { THREE } = T, lives = [];
    st.add(T.ground(16, 16, '#ffffff', T.tiles('#5a5e66', 10, [5, 5]))); st.add(T.plane(16, 6, '#b8b4a8', 0, 3, -3)); const lw = T.plane(16, 6, '#a8a498', -4, 3, 0); lw.rotation.y = Math.PI / 2; st.add(lw);
    st.add(T.box(5, 0.9, 0.8, '#6a5a48', 0.5, 0.45, -2.55)); st.add(T.box(5.05, 0.06, 0.85, '#d8d4c8', 0.5, 0.93, -2.55));
    st.add(T.cyl(0.14, 0.16, 0.36, '#c8c8cc', -1.2, 1.14, -2.6)); st.add(T.box(0.05, 0.16, 0.05, '#222', -1.02, 1.2, -2.6));
    for (let i = 0; i < 5; i++) st.add(T.cyl(0.06, 0.05, 0.13, ['#e8e4d8', '#c8102e', '#2a5ea8', '#e8e4d8', '#46525f'][i], -0.4 + i * 0.18, 1.02, -2.4));
    st.add(T.box(0.42, 0.3, 0.3, '#3a2a1e', 1.3, 1.11, -2.5)); st.add(T.box(0.2, 0.02, 0.04, '#111', 1.3, 1.265, -2.5));
    const pic = livePlane(T, 0.9, 1.05, 420, (g, w, h, t) => { g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; mono(g, 26); g.fillText('TEA    30p', 40, h * 0.82); g.fillText('COFFEE 50p', 40, h * 0.9); g.save(); g.beginPath(); g.rect(30, 30, w - 60, h * 0.62); g.clip(); g.translate(30, 30); (p.pic === 'eyes' || (p.picSwap != null && t > p.picSwap) ? eyesPhoto : flowers)(g, w - 60, h * 0.62, t); g.restore(); });
    pic.mesh.position.set(1.3, 2.0, -2.97); st.add(pic.mesh); lives.push(pic);
    st.add(T.box(1.6, 0.04, 1.2, '#2a2a30', 0.5, 2.9, -0.5)); st.add(T.plane(1.4, 1.0, glowMat(T, '#f4f2ea'), 0.5, 2.87, -0.5)).rotation.x = Math.PI / 2;
    spot(T, st, '#f2f0ea', 22, [0.5, 2.85, -0.5], [0.8, 0, -2], { angle: 1.0, pen: 1 });
    return { lives, anchors: { pic: [1.3, 2.1, -2.97, 0, 0, 1], box: [1.3, 1.2, -2.5, 0, 0.6, 1] },
      cams: { wide: { from: [3.4, 2.1, 4.2], to: [2.6, 1.9, 2.6], look0: [0.2, 1.3, -2.5], look1: [0.6, 1.4, -2.6] }, box: { from: [2.2, 1.7, 0.6], to: [1.8, 1.55, -0.6], look0: [1.3, 1.15, -2.5], look1: [1.3, 1.25, -2.5] }, wall: { from: [1.6, 1.9, 0.8], to: [1.4, 2.0, -0.6], look0: [1.3, 1.8, -3], look1: [1.3, 2.0, -3] } } };
  },
  board(T, st, p) {   // the evidence board
    const { THREE } = T, lives = [];
    st.add(T.plane(18, 10, new THREE.MeshStandardMaterial({ map: tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#7a5a3a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { g.fillStyle = hash(i) > 0.5 ? 'rgba(50,30,15,.45)' : 'rgba(170,130,90,.35)'; g.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2 + hash(i) * 3, 2); } }, [5, 3]), roughness: 1 }), 0, 0, 0));
    const ART = { eyes: (g, w, h, t) => eyesPhoto(g, w, h, t), nazar: (g, w, h) => { g.fillStyle = '#1a1c22'; g.fillRect(0, 0, w, h); nazar(g, w / 2, h / 2, w * 0.38); }, medusa: (g, w, h, t) => medusa(g, w, h, t), mesmer: (g, w, h) => { g.fillStyle = '#4a1a1e'; g.fillRect(0, 0, w, h); figure(g, 'MESMER', w * 0.5, h * 0.98, w / 330, poseOf('point')); }, swirl: (g, w, h, t) => swirl(g, w, h, t), cig: (g, w, h, t) => { g.fillStyle = '#2a2e36'; g.fillRect(0, 0, w, h); figure(g, 'WOMAN', w * 0.5, h * 0.98, w / 330, poseOf('holdFront'), { prop: 'cig', t }); }, ring: ring, film: (g, w, h, t) => filmLeader(g, w, h, t), bobo: (g, w, h, t) => { g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, w, h); bobo(g, w / 2, h * 0.95, w / 700, t); }, tv: (g, w, h, t) => { g.fillStyle = '#20242c'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3026'; g.fillRect(w * 0.15, h * 0.2, w * 0.7, h * 0.55); g.fillStyle = '#9fb4c8'; g.fillRect(w * 0.2, h * 0.25, w * 0.5, h * 0.45); }, phone: (g, w, h, t) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.save(); g.translate(w * 0.28, h * 0.08); feed(g, w * 0.44, h * 0.84, t); g.restore(); } };
    const pins = p.polas || ['eyes', 'nazar', 'mesmer', 'swirl', 'cig', 'ring', 'film', 'bobo', 'tv', 'phone'];
    const spots = [[-5.6, 2.6], [-3.2, 3.0], [-6.2, -0.4], [-3.6, -2.6], [-6.0, -3.2], [3.2, 3.0], [5.6, 2.4], [6.2, -0.6], [3.6, -2.7], [6.0, -3.3]];
    const pinM = T.mat('#c8102e'), strM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#b0102a') });
    pins.forEach((k, i) => { const [x, y] = spots[i % spots.length], rot = (hash(i * 3) - 0.5) * 0.2; const P = livePlane(T, 1.5, 1.75, 300, (g, w, h, t) => { g.fillStyle = K.cream; g.fillRect(0, 0, w, h); g.save(); g.beginPath(); g.rect(16, 16, w - 32, w - 32); g.clip(); g.translate(16, 16); ART[k](g, w - 32, w - 32, t); g.restore(); g.fillStyle = K.ink; mono(g, 22); g.fillText(`EXHIBIT ${'ABCDEFGHIJ'[i]}`, 20, h - 20); }); P.mesh.position.set(x, y, 0.03); P.mesh.rotation.z = rot; P.static = !['eyes', 'medusa', 'swirl', 'film', 'phone'].includes(k); st.add(P.mesh); lives.push(P); st.add(T.sphere(0.07, pinM, x, y + 0.75, 0.08));
      const a = new THREE.Vector3(x, y + 0.75, 0.09), b = new THREE.Vector3(0, 0.5, 0.09), len = a.distanceTo(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 5), strM); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); st.add(c); });
    const big = livePlane(T, 2.8, 3.2, 640, (g, w, h, t) => { g.fillStyle = K.cream; g.fillRect(0, 0, w, h); g.fillStyle = '#0b0b0e'; g.fillRect(28, 28, w - 56, w - 56); const bl = p.blinkAt != null && t > p.blinkAt && t < p.blinkAt + 0.3 ? 1 - Math.sin(prog(t, p.blinkAt, p.blinkAt + 0.3) * Math.PI) : 1; eyeArt(g, w / 2, 28 + (w - 56) / 2, w * 0.2, { open: bl, pupil: 0.36, look: Math.sin(t * 0.8) * 0.3 }); g.fillStyle = K.red; mono(g, 28); g.fillText(p.bigLabel || 'THE WITNESS', 36, h - 32); });
    big.mesh.position.set(0, 0.2, 0.05); st.add(big.mesh); lives.push(big); st.add(T.sphere(0.09, pinM, 0, 1.75, 0.1));
    spot(T, st, '#ffe2b8', 30, [1.5, 5, 8], [0, 0, 0], { angle: 0.7, pen: 0.9, dist: 22 });
    return { lives, anchors: { big: [0, 0.4, 0.05, 0, 0, 1] }, cams: { wide: { from: [0.8, 0.3, 11], to: [0, 0.2, 9.2], look0: [0, 0.1, 0], look1: [0, 0.2, 0] }, pan: { from: [-4.4, 0.5, 5], to: [3.8, 0.4, 5], look0: [-4.4, 0.3, 0], look1: [3.8, 0.3, 0] }, pull: { from: [0, 0.4, 0.4], to: [0.5, 0.2, 9.5], look0: [0, 0.4, 0], look1: [0, 0.15, 0], ease: 'out' } } };
  },
  alley(T, st, p) {
    const { THREE } = T, lives = [];
    st.add(T.ground(8, 60, '#ffffff', tex(T, 256, 512, (g, w, h) => { g.fillStyle = '#24272e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(170,190,220,${0.05 + hash(i) * 0.12})`; g.fillRect(hash(i * 3) * w, hash(i * 5) * h, 2 + hash(i) * 30, 2); } }, [2, 8])));
    const brick = tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#3a3230'; g.fillRect(0, 0, w, h); g.fillStyle = '#4e423e'; for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) g.fillRect(i * 64 + (j % 2) * 32 + 3, j * 32 + 3, 58, 26); }, [12, 3]);
    for (const sx of [-1, 1]) { const wl = T.plane(60, 10, new THREE.MeshStandardMaterial({ map: brick, roughness: 0.95 }), sx * 3, 5, -20); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); }
    const L = live(T, 256, 256, () => {}); const mat = new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, color: new THREE.Color('#d0d6de') }); const geo = new THREE.PlaneGeometry(1, 1); const r = rng(21);
    for (let i = 0; i < 50; i++) { const sx = i % 2 ? 1 : -1; const m = new THREE.Mesh(geo, mat); m.scale.setScalar(0.45 + r() * 0.5); m.position.set(sx * 2.97, 0.9 + r() * 4.5, 2 - r() * 30); m.rotation.y = -sx * Math.PI / 2; m.rotation.z = (r() - 0.5) * 0.5; st.add(m); }
    const hero = new THREE.Mesh(geo, mat); hero.scale.setScalar(0.8); hero.position.set(2.96, 2.3, -6); hero.rotation.y = -Math.PI / 2; st.add(hero);
    lives.push({ upd(t) { const g = L.tex.image.getContext('2d'); g.clearRect(0, 0, 256, 256); const sn = p.snapAt ?? 1e9; const look = t < sn ? Math.sin(t * 1.5) * 0.6 : lerp(Math.sin(sn * 1.5) * 0.6, 0, ease.out(prog(t, sn, sn + 0.15))); g.save(); g.filter = 'drop-shadow(5px 0 0 #ece4d0) drop-shadow(-5px 0 0 #ece4d0) drop-shadow(0 5px 0 #ece4d0) drop-shadow(0 -5px 0 #ece4d0)'; nazar(g, 128, 128, 104, look); g.restore(); L.tex.needsUpdate = true; } });
    st.add(T.cyl(0.06, 0.08, 5, '#15151a', -2.6, 2.5, -9)); st.add(T.box(0.9, 0.06, 0.06, '#15151a', -2.15, 4.95, -9)); st.add(T.sphere(0.18, glowMat(T, '#ffc36b'), -1.75, 4.85, -9));
    spot(T, st, '#ffb347', 30, [-1.75, 4.8, -9], [-1.6, 0, -9], { angle: 0.7, pen: 0.6, dist: 14 });
    return { lives, rain: true, anchors: { charm: [2.96, 2.3, -6, -1, 0, 0] }, cams: { wide: { from: [0.2, 1.7, 5], to: [0.4, 1.9, -1.5], look0: [0, 2, -20], look1: [0.6, 2.1, -12] }, charm: { from: [0.4, 1.9, -1], to: [0.8, 2.1, -3.2], look0: [1.6, 2.2, -8], look1: [2.96, 2.3, -6] } } };
  },
  museum(T, st, p) {
    const { THREE } = T, lives = [];
    st.add(T.ground(10, 50, '#ffffff', tex(T, 256, 256, (g, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#2e3036' : '#6a6a70'; g.fillRect((i * w) / 2, (j * h) / 2, w / 2, h / 2); } }, [5, 25])));
    for (const sx of [-1, 1]) { const wl = T.plane(50, 8, '#3a3f4a', sx * 3.4, 4, -10); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); } st.add(T.plane(8, 8, '#30343e', 0, 4, -14.2));
    const stone = T.mat('#a8a49c'); for (const z of [2, -2, -6, -10]) for (const sx of [-1, 1]) { const x = sx * 2.3; st.add(T.box(0.8, 1.1, 0.8, '#4a4c52', x, 0.55, z)); st.add(T.box(0.75, 0.38, 0.38, stone, x, 1.32, z)); st.add(T.sphere(0.26, stone, x, 1.78, z)); st.add(T.box(0.14, 0.16, 0.14, stone, x, 1.55, z)); }
    for (const z of [2, -6]) spot(T, st, '#c8d4e6', 26, [0, 7, z], [0, 0, z - 1], { angle: 0.9 });
    const med = frameArt(T, st, 3.7, 2.7, 0, 2.4, -14.05, 0, medusa, { px: 760, frame: '#6a4e1a' }); lives.push(med);
    spot(T, st, '#ffd9a0', 24, [0, 6.5, -10], [0, 2.4, -14], { angle: 0.5 });
    return { lives, anchors: { eye: [-0.177, 2.42, -13.95, 0, 0, 1] }, cams: { wide: { from: [-0.6, 1.7, 6.5], to: [-0.2, 2.0, -1], look0: [0, 1.9, -14], look1: [0, 2.3, -14] }, near: { from: [0.8, 1.8, -4], to: [0.2, 2.2, -8.5], look0: [0, 2.2, -14], look1: [-0.1, 2.4, -14] } } };
  },
  salon(T, st, p) {   // Mesmer's parlour, Paris 1780s
    const { THREE } = T, lives = [];
    st.add(T.ground(20, 20, '#ffffff', T.planks('#5a3a24', 18, [5, 5]))); st.add(T.plane(20, 8, '#5a1e24', 0, 4, -5)); for (const sx of [-1, 1]) { const wl = T.plane(20, 8, '#4e1a20', sx * 6, 4, 0); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); }
    for (let i = -2; i <= 2; i++) { st.add(T.box(0.12, 8, 0.12, '#b08a3a', i * 2.4, 4, -4.9)); }
    st.add(T.cyl(0.9, 1.0, 0.6, '#3a2418', 0, 0.3, -1.5, 24)); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const rod = T.cyl(0.02, 0.02, 1.0, '#c0a060', Math.cos(a) * 0.6, 0.9, -1.5 + Math.sin(a) * 0.6, 6); rod.rotation.z = Math.cos(a) * 0.5; rod.rotation.x = -Math.sin(a) * 0.5; st.add(rod); }
    const ch = new THREE.Group(); ch.position.set(0, 5, -1.5); st.add(ch); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ch.add(T.sphere(0.07, glowMat(T, '#ffd890'), Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7)); } ch.add(T.cyl(0.02, 0.02, 2, '#b08a3a', 0, 1, 0));
    pointL(T, st, '#ffcf8a', p.dim ? 2 : 6, [0, 4.6, -1.5], 12);
    const win = T.plane(1.6, 2.6, glowMat(T, '#6a7c98'), -3, 3, -4.95); st.add(win); st.add(T.box(1.8, 0.1, 0.1, '#2a1a12', -3, 3, -4.93)); st.add(T.box(0.1, 2.7, 0.1, '#2a1a12', -3, 3, -4.93));
    return { lives, anchors: {}, cams: { wide: { from: [3.4, 2.4, 5.2], to: [2.4, 2.1, 3.6], look0: [0, 1.3, -1.5], look1: [0, 1.4, -1.8] }, close: { from: [1.6, 1.7, 2.2], to: [1.1, 1.65, 1.2], look0: [0, 1.5, -1], look1: [0, 1.55, -1] } } };
  },
  hall(T, st, p) {   // the royal commission
    const lives = [];
    st.add(T.ground(20, 20, '#ffffff', T.planks('#4a3020', 18, [5, 5]))); st.add(T.plane(20, 8, '#2e3a48', 0, 4, -4.5));
    st.add(T.box(5.5, 0.12, 1.4, '#3a2416', 0, 1.0, -1.6)); st.add(T.box(5.6, 0.95, 0.06, '#2a1a10', 0, 0.5, -0.92));
    for (let i = 0; i < 6; i++) { st.add(T.plane(0.5, 0.36, T.mat('#efe8d6'), -2 + i * 0.8, 1.07, -1.3)).rotation.x = -Math.PI / 2; }
    for (const x of [-2.4, 2.4]) { st.add(T.cyl(0.05, 0.05, 0.4, '#e8e0cc', x, 1.26, -1.8)); st.add(T.sphere(0.05, glowMat(T, '#ffcf70'), x, 1.5, -1.8)); pointL(T, st, '#ffcf8a', 3, [x, 1.6, -1.6], 6); }
    for (let i = 0; i < 3; i++) st.add(T.box(1.6, 2.4, 0.06, '#8a6422', -3 + i * 3, 3.6, -4.45));
    return { lives, anchors: {}, cams: { wide: { from: [0.6, 1.9, 5.2], to: [0.2, 1.8, 3.6], look0: [0, 1.6, -2], look1: [0, 1.6, -2] } } };
  },
  church(T, st, p) {   // Santa Croce nave
    const lives = [];
    st.add(T.ground(14, 60, '#ffffff', T.tiles('#8a8070', 6, [3, 14]))); for (const sx of [-1, 1]) { const wl = T.plane(60, 14, '#b8a888', sx * 5, 7, -20); wl.rotation.y = -sx * Math.PI / 2; st.add(wl); for (let i = 0; i < 6; i++) { st.add(T.cyl(0.35, 0.4, 9, '#d8ccb0', sx * 3.6, 4.5, 2 - i * 6, 12)); const fz = -1 - i * 6; const fr = livePlane(T, 4, 3, 360, (g, w, h) => fresco(g, w, h, i * 2 + (sx > 0 ? 1 : 0))); fr.mesh.position.set(sx * 4.96, 7.5, fz); fr.mesh.rotation.y = -sx * Math.PI / 2; fr.static = true; st.add(fr.mesh); lives.push(fr); } }
    const ceil = livePlane(T, 10, 8, 700, (g, w, h, t) => swirl(g, w, h, t, { spin: p.spin ?? 0.15, eye: !!p.ceilEye })); ceil.mesh.position.set(0, 12, -8); ceil.mesh.rotation.x = Math.PI / 2; st.add(ceil.mesh); lives.push(ceil);
    st.add(T.plane(10, 14, '#a89878', 0, 7, -32));
    spot(T, st, '#fff0d0', 40, [-3, 13, 4], [0, 0, -8], { angle: 0.8, dist: 40 }); spot(T, st, '#fff0d0', 20, [0, 2, 6], [0, 12, -8], { angle: 0.6, dist: 30 });
    return { lives, anchors: { ceil: [0, 11.99, -8, 0, -1, 0] }, cams: { wide: { from: [0.4, 1.7, 7], to: [0.2, 1.8, 1], look0: [0, 2.4, -30], look1: [0, 2.6, -30] }, up: { from: [0.6, 1.6, 1.5], to: [0.3, 1.8, -2], look0: [0, 2.5, -14], look1: [0, 12, -8] } } };
  },
  street(T, st, p) {   // Fifth Avenue, 1929
    const { THREE } = T, lives = [];
    st.add(T.ground(30, 120, '#4a4a50')); for (const sx of [-1, 1]) { st.add(T.box(3, 0.15, 120, '#6a6a70', sx * 5.5, 0.07, -40)); for (let i = 0; i < 9; i++) { const b = T.building(5, 10 + hash(i * 3 + sx) * 12, 6, { color: ['#3a3a44', '#46424a', '#36404a'][i % 3], lit: 0.35, seed: i + (sx > 0 ? 20 : 0) }); b.position.set(sx * 10, 0, 6 - i * 9); st.add(b); } }
    for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { st.add(T.cyl(0.05, 0.06, 4, '#151518', sx * 4.6, 2, 4 - i * 10)); st.add(T.sphere(0.16, glowMat(T, '#ffe2a0'), sx * 4.6, 4.1, 4 - i * 10)); }
    // crowd cut-out strips along the pavements
    for (const sx of [-1, 1]) { const C = livePlane(T, 30, 2.2, 1400, (g, w, h, t) => { const r = rng(sx > 0 ? 5 : 9); for (let i = 0; i < 26; i++) { const x = (i + 0.5) / 26 * w, s = 0.95 + r() * 0.2; const who = r() > 0.5 ? 'GENT' : r() > 0.5 ? 'WOMAN' : 'MAN'; figure(g, who, x, h * 0.98, s * 1.05, poseOf(r() > 0.6 ? 'cheer' : 'stand'), { facing: -sx, edge: '#9a9488', d: 3 }); } }, { lit: true }); C.mesh.position.set(sx * 5.4, 1.1, -10); C.mesh.rotation.y = -sx * Math.PI / 2; C.static = true; st.add(C.mesh); lives.push(C); }
    return { lives, flashes: true, anchors: {}, cams: { wide: { from: [0, 1.7, 9], to: [0, 1.75, 5], look0: [0, 2, -30], look1: [0, 2, -30] }, low: { from: [1.6, 0.9, 4], to: [1.2, 1.0, 2.4], look0: [-0.5, 1.5, -6], look1: [-0.4, 1.6, -6] } } };
  },
  office(T, st, p) {   // night office: desk, typewriter, lamp, window
    const lives = [];
    st.add(T.ground(16, 16, '#ffffff', T.planks('#4a3424', 16, [4, 4]))); st.add(T.plane(16, 6, '#3e4a52', 0, 3, -3.5)); const lw = T.plane(16, 6, '#38444c', -4, 3, 0); lw.rotation.y = Math.PI / 2; st.add(lw);
    const wp = T.windowPane(2.6, 2.2, { lit: true, power: 0.5, cols: 4, rows: 3, glowColor: '#6d84a8', frame: '#1a1a20' }); wp.position.set(1.6, 2.6, -3.45); st.add(wp);
    st.add(T.box(2.6, 0.08, 1.2, '#5a3a24', 0, 1.0, -1.8)); for (const x of [-1.2, 1.2]) st.add(T.box(0.08, 1.0, 1.1, '#3a2416', x, 0.5, -1.8));
    st.add(T.box(0.7, 0.18, 0.5, '#1c1c20', -0.1, 1.13, -1.8)); st.add(T.box(0.6, 0.06, 0.12, '#2a2a30', -0.1, 1.26, -1.95)); st.add(T.plane(0.42, 0.5, T.mat('#efe8d6'), -0.1, 1.45, -2.0)).rotation.x = -0.25;
    st.add(T.cyl(0.02, 0.02, 0.6, '#222', 0.8, 1.32, -2.0)); st.add(T.cone(0.2, 0.18, '#1a3a2a', 0.8, 1.66, -2.0, 16)); pointL(T, st, '#ffd28a', 5, [0.8, 1.55, -1.95], 6);
    return { lives, anchors: { page: [-0.1, 1.45, -2.0, 0, 0.25, 1] }, cams: { wide: { from: [2.6, 2.1, 3.2], to: [1.8, 1.9, 2.0], look0: [0, 1.3, -1.8], look1: [0, 1.35, -1.8] }, close: { from: [1.0, 1.6, 0.6], to: [0.6, 1.55, -0.4], look0: [-0.1, 1.3, -1.9], look1: [-0.1, 1.4, -1.95] } } };
  },
  cinema(T, st, p) {
    const { THREE } = T, lives = [];
    st.add(T.ground(20, 30, '#2a1416')); st.add(T.plane(20, 9, '#1e1416', 0, 4.5, -9.3));
    const scr = livePlane(T, 7.4, 3.4, 800, (g, w, h, t) => filmLeader(g, w, h, t, p.flash || [])); scr.mesh.position.set(0, 3.4, -9.2); st.add(scr.mesh); lives.push(scr);
    for (const sx of [-1, 1]) st.add(T.box(1.4, 4, 0.2, '#5a1418', sx * 4.3, 3.4, -9.1));
    const seat = T.mat('#5a1a20'); for (let row = 0; row < 7; row++) for (let i = -6; i <= 6; i++) { const z = 3 - row * 1.3, x = i * 0.62; st.add(T.box(0.54, 0.5, 0.5, seat, x, 0.25, z)); st.add(T.box(0.54, 0.75, 0.1, seat, x, 0.75, z + 0.25)); }
    for (let row = 0; row < 7; row++) { const R = livePlane(T, 8.2, 0.9, 1000, (g, w, h, t) => { const turn = p.turnAt != null ? ease.inOut(prog(t, p.turnAt + row * 0.03, p.turnAt + 0.4 + row * 0.03)) : 0; for (let i = 0; i < 13; i++) { if (hash(i + row * 31) < 0.22) continue; const x = ((i + 0.5) / 13) * w, y = h * 0.42, r = h * 0.3; cut(g, () => { g.fillStyle = K.ink; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, h, r * 1.8, r * 1.1, 0, Math.PI, 0); g.fill(); }, '#9a9080', 3); if (turn > 0) { g.fillStyle = `rgba(236,228,208,${turn})`; for (const dx of [-0.35, 0.35]) { g.beginPath(); g.ellipse(x + dx * r, y, r * 0.16, r * 0.1 + r * 0.06 * turn, 0, 0, 7); g.fill(); } } } }); R.mesh.position.set(0.1, 1.25, 3 - row * 1.3 + 0.32); R.static = p.turnAt == null; st.add(R.mesh); lives.push(R); }
    const beam = new THREE.Mesh(new THREE.ConeGeometry(3.6, 15, 32, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#d8d0ff'), transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.set(0, 3.6, -1.6); beam.rotation.x = Math.PI / 2; st.add(beam);
    spot(T, st, '#e8e2ff', 16, [0, 4, 6], [0, 3.4, -9], { angle: 0.5 });
    return { lives, anchors: { screen: [0, 3.4, -9.2, 0, 0, 1] }, cams: { wide: { from: [0.4, 1.6, 6.8], to: [0.2, 2.0, 3.0], look0: [0, 2.6, -9], look1: [0, 2.8, -9] }, front: { from: [0.2, 2.4, 1.5], to: [0.1, 2.9, -2.5], look0: [0, 3.2, -9], look1: [0, 3.4, -9.2] }, faces: { from: [0, 2.6, -6.5], to: [0, 2.4, -5], look0: [0, 1.2, 3], look1: [0, 1.2, 3] } } };
  },
  lab(T, st, p) {   // Bandura's playroom
    const lives = [];
    st.add(T.ground(16, 16, '#ffffff', T.tiles('#9aa0a6', 10, [5, 5]))); st.add(T.plane(16, 6, '#c8ccc4', 0, 3, -3.5)); const lw = T.plane(16, 6, '#bcc0b8', -4, 3, 0); lw.rotation.y = Math.PI / 2; st.add(lw);
    st.add(T.box(2.4, 1.3, 0.06, '#1c2228', 1.8, 2.2, -3.46)); st.add(T.plane(2.2, 1.1, T.mat('#4a5866', { metalness: 0.4, roughness: 0.2 }), 1.8, 2.2, -3.42));
    st.add(T.box(1.2, 0.5, 0.8, '#d0b070', -2.4, 0.25, -2.6)); for (let i = 0; i < 4; i++) st.add(T.box(0.25, 0.25, 0.25, ['#c8102e', '#2a5ea8', '#e8a33a', '#3a8a5a'][i], -2.8 + i * 0.3, 0.62, -2.6));
    st.add(T.box(2.4, 0.04, 1.6, '#2a2a30', 0, 3.6, -0.8)); st.add(T.plane(2.2, 1.4, glowMat(T, '#f6f4ee'), 0, 3.57, -0.8)).rotation.x = Math.PI / 2;
    spot(T, st, '#f6f4ee', 24, [0, 3.55, -0.8], [0, 0, -1.2], { angle: 1.1 });
    return { lives, anchors: {}, cams: { wide: { from: [2.8, 2.0, 4], to: [2.0, 1.8, 2.6], look0: [-0.2, 1.0, -1.5], look1: [-0.2, 1.0, -1.6] }, low: { from: [1.4, 0.9, 1.8], to: [1.0, 0.9, 0.9], look0: [-0.3, 0.9, -1.4], look1: [-0.3, 0.9, -1.4] } } };
  },
  living(T, st, p) {   // 1970s living room, TV glow
    const { THREE } = T, lives = [];
    st.add(T.ground(16, 16, '#5a4a3a')); st.add(T.plane(16, 6, '#6a5a40', 0, 3, -3.5)); const lw = T.plane(16, 6, '#625238', -4, 3, 0); lw.rotation.y = Math.PI / 2; st.add(lw);
    for (let i = 0; i < 16; i++) st.add(T.box(0.04, 6, 0.02, '#5a4a32', -7 + i * 0.9, 3, -3.48));
    st.add(T.box(3, 0.5, 1, '#8a5a2a', -0.6, 0.4, -2.4)); st.add(T.box(3, 0.8, 0.25, '#8a5a2a', -0.6, 0.95, -2.85)); for (const x of [-2.1, 0.9]) st.add(T.box(0.25, 0.7, 1, '#7a4a20', x, 0.6, -2.4));
    st.add(T.box(1.3, 1.0, 0.9, '#4a3020', 1.0, 0.5, 1.0)); st.add(T.box(1.1, 0.8, 0.05, '#111', 1.0, 0.55, 0.53));
    const scr = livePlane(T, 0.9, 0.62, 320, (g, w, h, t) => { const ch = p.tv || 'news'; g.fillStyle = '#8aa0b4'; g.fillRect(0, 0, w, h); if (ch === 'news') { g.fillStyle = '#2a3040'; g.fillRect(0, h * 0.7, w, h * 0.3); g.fillStyle = '#c8102e'; g.fillRect(w * 0.05, h * 0.74, w * 0.3, h * 0.1); figure(g, 'MAN', w * 0.5, h * 0.98, h / 320, poseOf('talk')); } else if (ch === 'crime') { g.fillStyle = '#1a1e28'; g.fillRect(0, 0, w, h); figure(g, 'DET', w * 0.3 + Math.sin(t) * 10, h * 0.98, h / 300, poseOf('point')); figure(g, 'MAN', w * 0.75, h * 0.98, h / 300, poseOf('handsOnHead'), { facing: -1 }); } else if (ch === 'thin') { g.fillStyle = '#e8d8c8'; g.fillRect(0, 0, w, h); figure(g, 'WOMAN', w * 0.5, h * 0.98, h / 280, poseOf('wave'), { color: '#2a2a32' }); } g.fillStyle = 'rgba(255,255,255,.06)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); });
    scr.mesh.position.set(1.0, 0.56, 0.52); scr.mesh.rotation.y = Math.PI; st.add(scr.mesh); lives.push(scr);
    pointL(T, st, '#9fc4e8', 5, [1.0, 0.7, 0.2], 6); pointL(T, st, '#ffcf8a', 1.5, [-3, 2.5, -1], 6);
    const win = livePlane(T, 1.6, 1.8, 240, (g, w, h, t) => { g.fillStyle = '#1a2230'; g.fillRect(0, 0, w, h); if (p.stranger) { figure(g, 'DET', w * 0.5, h * 0.98, h / 330, poseOf('stand'), { edge: '#3a4250', d: 3 }); } g.strokeStyle = '#2a1a10'; g.lineWidth = 12; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); });
    win.mesh.position.set(-3.98, 2.2, -1.2); win.mesh.rotation.y = Math.PI / 2; st.add(win.mesh); lives.push(win);
    return { lives, anchors: { tv: [1.0, 0.56, 0.52, 0, 0, -1] }, cams: { wide: { from: [2.6, 1.8, 3.2], to: [2.2, 1.6, 2.2], look0: [-0.6, 0.9, -2.4], look1: [-0.6, 0.95, -2.4] }, tv: { from: [-0.4, 1.0, -1.4], to: [0.3, 0.8, -0.6], look0: [1.0, 0.56, 0.52], look1: [1.0, 0.56, 0.52] }, window: { from: [-1.4, 1.8, 0.8], to: [-2.2, 2.0, 0.2], look0: [-4, 2.1, -1.2], look1: [-4, 2.2, -1.2] } } };
  },
  island(T, st, p) {   // rural Fiji village, dusk
    const { THREE } = T, lives = [];
    st.add(T.ground(80, 80, '#c8b48a')); const sea = T.plane(200, 80, new THREE.MeshStandardMaterial({ color: new THREE.Color('#3a6a8a'), roughness: 0.3, metalness: 0.2 }), 0, 0.02, -60); sea.rotation.x = -Math.PI / 2; st.add(sea);
    const palm = (x, z, s) => { const tr = T.cyl(0.1 * s, 0.16 * s, 5 * s, '#5a4430', x, 2.5 * s, z, 8); tr.rotation.z = 0.12; st.add(tr); for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const lf = T.box(2.2 * s, 0.04, 0.45 * s, '#2a4a2a', x + 0.3 * s + Math.cos(a) * 1.0 * s, 4.9 * s - 0.25 * s, z + Math.sin(a) * 1.0 * s); lf.rotation.y = -a; lf.rotation.z = -0.35; st.add(lf); } };
    palm(-4, -6, 1.1); palm(5, -9, 1.3); palm(-8, -14, 1.2); palm(9, -3, 1.0);
    const hut = (x, z, ry, tvOn) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.add(T.box(3, 1.8, 2.4, '#8a6a44', 0, 0.9, 0)); const roof = T.cone(2.4, 1.6, '#6a5a3a', 0, 2.6, 0, 4); roof.rotation.y = Math.PI / 4; g.add(roof); g.add(T.box(0.8, 1.3, 0.05, tvOn ? '#9fc4e8' : '#2a1a10', 0, 0.65, 1.21)); st.add(g); if (tvOn) { const l = pointL(T, st, '#9fc4e8', 3, [x, 0.8, z + 1.6], 5); } };
    hut(-2.5, -3, 0.2, !!p.tv); hut(3.5, -5, -0.3, false);
    if (p.antenna) { st.add(T.cyl(0.03, 0.03, 3, '#222', -1.8, 3.4, -3)); st.add(T.box(1.2, 0.03, 0.03, '#222', -1.8, 4.6, -3)); st.add(T.box(0.8, 0.03, 0.03, '#222', -1.8, 4.3, -3)); }
    return { lives, anchors: { door: [-2.36, 0.65, -1.8, 0.2, 0, 1] }, cams: { wide: { from: [1.5, 1.7, 7], to: [0.8, 1.7, 5], look0: [0, 1.6, -6], look1: [-0.4, 1.6, -6] }, hut: { from: [0.8, 1.4, 3], to: [0, 1.3, 1.6], look0: [-2.4, 1, -2], look1: [-2.4, 0.9, -2] } } };
  },
  bedroom(T, st, p) {
    const { THREE } = T, lives = [];
    st.add(T.ground(16, 16, '#3a3e48')); st.add(T.plane(16, 7, '#3e4654', 0, 3.5, -4.2)); const lw = T.plane(16, 7, '#384050', -4, 3.5, 0); lw.rotation.y = Math.PI / 2; st.add(lw);
    st.add(T.box(2.4, 0.5, 3.2, '#2e323c', 0, 0.25, -2.4)); st.add(T.box(2.4, 0.25, 2.2, '#5a6478', 0, 0.62, -1.9)); st.add(T.box(1.2, 0.2, 0.6, '#8a90a0', 0, 0.62, -3.6)); st.add(T.box(2.6, 1.3, 0.12, '#262a32', 0, 0.9, -4.0));
    const phone = livePlane(T, 0.22, 0.4, 200, (g, w, h, t) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.save(); g.translate(8, 8); feed(g, w - 16, h - 16, t); g.restore(); }); phone.mesh.position.set(0.05, 1.12, -2.2); phone.mesh.rotation.x = -0.15; st.add(phone.mesh); lives.push(phone);
    pointL(T, st, '#8fe9ff', 5, [0.05, 1.2, -2.0], 5); pointL(T, st, '#8a9ab8', 1.5, [2, 3, 1], 10);
    const screens = []; if (p.screens) { const r = rng(66); for (let i = 0; i < 24; i++) { const sc = livePlane(T, 0.7, 1.2, 140, (g, w, h, t) => feed(g, w, h, t, i)); const onBack = i % 3 !== 0; if (onBack) sc.mesh.position.set(-3.4 + r() * 6.8, 1.4 + r() * 3.6, -4.15); else { sc.mesh.position.set(-3.95, 1.2 + r() * 3.8, -3.6 + r() * 5); sc.mesh.rotation.y = Math.PI / 2; } sc.at = (p.screensAt ?? 0.5) + i * 0.12; st.add(sc.mesh); screens.push(sc); lives.push({ upd(t) { const k = ease.out(prog(t, sc.at, sc.at + 0.3)); sc.mesh.scale.setScalar(Math.max(0.001, k)); if (k > 0) sc.upd(t); } }); } }
    return { lives, anchors: { phone: [0.05, 1.12, -2.2, 0, 0.15, 1] }, cams: { wide: { from: [2.8, 2.0, 2.8], to: [2.2, 1.8, 1.8], look0: [-0.4, 1.4, -3], look1: [-0.3, 1.3, -2.8] }, close: { from: [1.2, 1.5, 0.2], to: [0.8, 1.4, -0.6], look0: [0, 1.3, -2.4], look1: [0.05, 1.2, -2.3] } } };
  },
  scroll(T, st, p) {   // endless corridor of posts
    const { THREE } = T, lives = [];
    const tx = [0, 1, 2, 3, 4, 5].map((i) => { const L = live(T, 160, 280, () => {}); return { L, i }; });
    tx.forEach(({ L, i }) => lives.push({ upd(t) { const g = L.tex.image.getContext('2d'); g.clearRect(0, 0, 160, 280); feed(g, 160, 280, t * 0.6, i, { speed: 0.5 }); L.tex.needsUpdate = true; } }));
    const geo = new THREE.PlaneGeometry(1.6, 2.8); for (let i = 0; i < 160; i++) { const wall = i % 4, d = Math.floor(i / 4), along = (hash(i) - 0.5) * 8; const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tx[i % 6].L.tex, color: new THREE.Color('#c8ccd4') })); const z = 8 - d * 3; if (wall === 0) { m.position.set(-4.5, along * 0.5, z); m.rotation.y = Math.PI / 2; } else if (wall === 1) { m.position.set(4.5, along * 0.5, z); m.rotation.y = -Math.PI / 2; } else if (wall === 2) { m.position.set(along, 3.6, z); m.rotation.x = Math.PI / 2; } else { m.position.set(along, -3.6, z); m.rotation.x = -Math.PI / 2; } st.add(m); }
    return { lives, anchors: {}, cams: { glide: { from: [0, 0, 10], to: [0, 0, -14], look0: [0, 0, -30], look1: [0, 0, -40], roll: 0.04 } } };
  },
  mirror(T, st, p) {   // dim bathroom, a mirror
    const lives = [];
    st.add(T.ground(10, 10, '#ffffff', T.tiles('#5a6066', 10, [4, 4]))); st.add(T.plane(10, 6, '#4a5258', 0, 3, -2)); st.add(T.box(1.6, 0.9, 0.6, '#d8d8d2', 0, 0.45, -1.7)); st.add(T.box(1.7, 0.06, 0.65, '#e8e8e2', 0, 0.92, -1.7));
    st.add(T.box(1.5, 1.4, 0.04, '#1a1a1e', 0, 1.9, -1.97)); const m = livePlane(T, 1.36, 1.26, 420, (g, w, h, t) => { g.fillStyle = '#22262c'; g.fillRect(0, 0, w, h); figure(g, 'MAN', w * 0.5, h * 1.55, h / 210, poseOf('stand'), { edge: '#4a5058', d: 4 }); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, w, h); });
    m.mesh.position.set(0, 1.9, -1.94); st.add(m.mesh); lives.push(m); pointL(T, st, '#ffd8a0', 2.5, [0.6, 2.4, -0.6], 5);
    return { lives, anchors: { mirror: [0, 2.0, -1.94, 0, 0, 1] }, cams: { wide: { from: [1.2, 1.8, 2.6], to: [0.6, 1.8, 1.4], look0: [0, 1.6, -2], look1: [0, 1.8, -2] } } };
  },
};

// ================================================================ 3D shot
const V3 = (a, b, k) => a.map((x, i) => lerp(x, b[i], k));
function makeWorld(shot) {
  const p = shot.params || {};
  return { kind: '3d',
    init(T, info) {
      const lite = { kitchen: 0.9, lab: 1.0, church: 0.9, island: 1.0, board: 0.7, street: 0.75 }[p.world] ?? 0.7;
      const skies = { island: ['#e8a070', '#f4c890', '#a8c0d0'], street: ['#1a2030', '#3a4458'], church: '#2a2620', kitchen: '#2a2a2e' };
      const st = T.stage({ sky: skies[p.world] || '#14161c', fog: p.fog || [10, 45], fogColor: p.world === 'island' ? '#d8b890' : '#14161c', fov: p.fov || 42, ambient: p.ambient ?? lite, keyIntensity: p.key ?? 0.8, keyColor: p.keyColor || '#f2e6d0', keyPos: [-4, 9, 6], bloom: 0.35 });
      st.sun.castShadow = false;
      const w = WORLDS[p.world](T, st, p);
      const figs = (p.figs || []).map((f) => { const hgt = f.h ?? 2.5, wide = f.act === 'faint' || f.wide ? 1.0 : 0.62; const F = livePlane(T, hgt * wide * 1.7, hgt, 380, (g, ww, hh, t) => actedFigure(g, ww, hh, t, { ...f, cx: 0.5, s: (f.s ?? 2.0) * (hgt * wide * 1.7 > hgt ? 1 : 1) }), { lit: false, tint: f.tint || '#ffffff' });
        F.mesh.position.set(f.pos[0], hgt / 2 + (f.pos[1] || 0), f.pos[2]); F.mesh.rotation.y = f.ry || 0; st.add(F.mesh); if (!f.noBlob) st.add(blob(T, f.pos[0], f.pos[2], 0.45)); return { ...F, f, base: [...F.mesh.position.toArray()] }; });
      // 2D props as cut-out planes in 3D: {k:'bobo'|..., pos, h}
      const props = (p.props || []).map((o) => { const P = livePlane(T, o.h * 0.8, o.h, 260, (g, ww, hh, t) => { if (o.k === 'bobo') { const tilt = o.hitAt != null && t > o.hitAt ? Math.sin((t - o.hitAt) * 6) * 0.25 * Math.exp(-(t - o.hitAt) * 1.5) + (o.down && t > o.down ? -0.9 * ease.out(prog(t, o.down, o.down + 0.5)) : 0) : 0; cut(g, () => bobo(g, ww / 2, hh * 0.97, hh / 340, t, { tilt })); } }, { tint: '#ffffff' }); P.mesh.position.set(o.pos[0], o.h / 2, o.pos[2]); P.mesh.rotation.y = o.ry || 0; st.add(P.mesh); st.add(blob(T, o.pos[0], o.pos[2], 0.4)); return P; });
      return { stage: st, w, figs, props, info };
    },
    draw(s, t, info) {
      const p = shot.params || {}, dur = info.dur;
      for (const l of s.w.lives) { if (l.static && l.done) continue; l.upd(t); if (l.static) l.done = true; }
      for (const F of s.figs) { if (F.f.move) { const k = ease.inOut(clamp((t - (F.f.move[2] || 0)) / ((F.f.move[3] || dur) - (F.f.move[2] || 0)))); F.mesh.position.x = F.base[0] + F.f.move[0] * k; F.mesh.position.z = F.base[2] + F.f.move[1] * k; } F.upd(t); }
      for (const P of s.props) P.upd(t);
      const cam = s.stage.camera, C = typeof p.cam === 'object' ? p.cam : s.w.cams[p.cam || Object.keys(s.w.cams)[0]];
      const span = p.dive ? Math.max(0.5, dur - 1.6) : dur, e = C.ease === 'out' ? ease.out : ease.inOut, k = e(clamp(t / span));
      let pos = V3(C.from, C.to, k), look = V3(C.look0, C.look1, k);
      if (p.dive) { const A = s.w.anchors[p.dive], tgt = A.slice(0, 3), n = A.slice(3), d0 = dur - 1.6, d = ease.inOut(prog(t, d0, dur - 0.12)); look = V3(look, tgt, ease.inOut(prog(t, d0 - 0.8, d0 + 0.3))); const stop = tgt.map((x, i) => x + n[i] * 0.05); pos = V3(pos, stop, d); }
      cam.position.set(...pos); cam.lookAt(...look); if (C.roll) cam.rotateZ(Math.sin(t * 0.4) * C.roll);
    },
    overlay(g, t, info, s) {
      const p = shot.params || {}, dur = info.dur;
      if (s.w.rain) { g.save(); g.strokeStyle = 'rgba(200,212,232,.28)'; g.lineWidth = 2; const f = Math.floor(t * 24); for (let i = 0; i < 110; i++) { const x = hash(i * 7 + f) * W(), y = hash(i * 13 + f * 3) * H(); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 44); g.stroke(); } g.restore(); }
      if (s.w.flashes) for (const fa of p.flashAt || []) if (t > fa && t < fa + 0.12) { g.save(); g.globalAlpha = 0.45 * (1 - (t - fa) / 0.12); g.fillStyle = '#fff'; g.fillRect(0, 0, W(), H()); g.restore(); }
      overlays(g, t, p.ov);
      if (p.irisIn) irisIn(g, t, 0.8); if (p.dive) irisOut(g, t, dur - 0.5, dur);
      film(g, t);
    } };
}

// ================================================================ 2D templates
const DESK = (g) => { const gr = g.createRadialGradient(W() * 0.5, H() * 0.45, 100, W() * 0.5, H() * 0.5, W() * 0.75); gr.addColorStop(0, '#4a3a2a'); gr.addColorStop(1, '#16110d'); g.fillStyle = gr; g.fillRect(0, 0, W(), H()); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let i = 0; i < 18; i++) { g.beginPath(); g.moveTo(0, i * 64 + 10); g.bezierCurveTo(W() * 0.3, i * 64 + 30, W() * 0.6, i * 64 - 10, W(), i * 64 + 14); g.stroke(); } };
const PHOTO_ART = { flowers, eyes: eyesPhoto, ring, nazar: (g, w, h, t) => { g.fillStyle = '#20232a'; g.fillRect(0, 0, w, h); nazar(g, w / 2, h / 2, w * 0.36, Math.sin(t * 1.2) * 0.5); },
  medusa: (g, w, h, t) => medusa(g, w, h, t), swirl: (g, w, h, t) => swirl(g, w, h, t),
  cig: (g, w, h, t) => { g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, w, h); figure(g, 'WOMAN', w * 0.5, h * 1.0, w / 300, poseOf('holdFront'), { prop: 'cig', t }); },
  parade: (g, w, h, t) => { g.fillStyle = '#b8b0a0'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a8478'; g.fillRect(0, 0, w, h * 0.45); for (let i = 0; i < 4; i++) figure(g, 'WOMAN', w * (0.2 + i * 0.2), h * 0.98, w / 700, poseOf('holdFront'), { prop: 'cig', t: t + i }); },
  bobo: (g, w, h, t) => { g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, w, h); bobo(g, w / 2, h * 0.95, w / 600, t); },
  selfie: (g, w, h, t) => { g.fillStyle = '#c8bca8'; g.fillRect(0, 0, w, h); faceArt(g, w / 2, h * 0.55, h * 0.3, { filter: 1 }); },
  popcorn: (g, w, h, t) => { g.fillStyle = '#2a1416'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8102e'; g.beginPath(); g.moveTo(w * 0.3, h * 0.35); g.lineTo(w * 0.7, h * 0.35); g.lineTo(w * 0.62, h * 0.95); g.lineTo(w * 0.38, h * 0.95); g.fill(); g.fillStyle = '#f2efe6'; for (let i = 0; i < 6; i++) g.fillRect(w * (0.33 + i * 0.06), h * 0.35, w * 0.03, h * 0.6); for (let i = 0; i < 28; i++) { g.fillStyle = '#f4e8c8'; g.beginPath(); g.arc(w * (0.32 + hash(i) * 0.36), h * (0.2 + hash(i * 3) * 0.17), w * 0.03, 0, 7); g.fill(); } },
  fresco: (g, w, h) => fresco(g, w, h, 3),
};
// a drawn face (front), with optional "filter" (smooth/slim/bright) and "warp" (mirror illusion)
function faceArt(g, x, y, r, o = {}) {
  const f = o.filter || 0, wp = o.warp || 0, t = o.t || 0;
  g.save(); g.translate(x, y); const sx = 1 - 0.12 * f + Math.sin(t * 1.3) * 0.06 * wp, sy = 1 + Math.sin(t * 0.9 + 1) * 0.08 * wp; g.scale(sx, sy); g.rotate(Math.sin(t * 0.7) * 0.05 * wp);
  g.fillStyle = f ? '#e8c8b0' : '#c8a088'; g.beginPath(); g.ellipse(0, 0, r * 0.78, r, 0, 0, 7); g.fill(); g.fillStyle = '#2a1e18'; g.beginPath(); g.ellipse(0, -r * 0.62, r * 0.84, r * 0.5, 0, Math.PI, 0); g.fill();
  if (!f) { g.fillStyle = 'rgba(120,70,50,.25)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((hash(i) - 0.5) * r * 1.2, (hash(i * 3) - 0.3) * r, r * 0.02, 0, 7); g.fill(); } }
  for (const ex of [-1, 1]) { const er = r * (0.16 + 0.05 * f) * (1 + Math.sin(t * 1.1 + ex) * 0.12 * wp); g.fillStyle = '#f2efe6'; g.beginPath(); g.ellipse(ex * r * 0.33 + ex * Math.sin(t) * r * 0.05 * wp, -r * 0.05, er * 1.4, er, 0, 0, 7); g.fill(); g.fillStyle = f ? '#4a8ac8' : '#4a3a2a'; g.beginPath(); g.arc(ex * r * 0.33, -r * 0.05, er * 0.7, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(ex * r * 0.33, -r * 0.05, er * 0.3, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex * r * 0.33 - er * 0.25, -r * 0.05 - er * 0.25, er * 0.15, 0, 7); g.fill(); }
  g.strokeStyle = '#7a4a3a'; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(0, r * 0.05); g.lineTo(-r * 0.06, r * 0.3); g.lineTo(r * 0.04, r * 0.32); g.stroke();
  g.fillStyle = f ? '#c84a5a' : '#8a4a40'; g.beginPath(); g.ellipse(0, r * 0.55, r * (0.24 + 0.04 * f), r * (0.06 + 0.03 * f), 0, 0, 7); g.fill();
  if (f) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, r * 0.78, r, 0, 0, 7); g.fill(); g.restore(); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,240,200,.8)'; const a = i * 1.1 + t; g.beginPath(); g.arc(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.2, r * 0.03, 0, 7); g.fill(); } }
  g.restore();
}
const T2 = {
  title(g, t, info, p) {   // exhibit card on dark desk
    DESK(g); const k = ease.out(prog(t, 0, 0.6)); paper(g, W() / 2, H() / 2 + (1 - k) * 60, 1100, 560, -0.02, K.manila, 31);
    g.save(); g.translate(W() / 2, H() / 2 + (1 - k) * 60); g.rotate(-0.02); g.fillStyle = K.red; mono(g, 40); g.textAlign = 'center'; g.fillText(p.top || 'EXHIBIT', 0, -140);
    g.fillStyle = K.ink; g.font = `900 ${p.size || 104}px ${SERIF}`; const n = Math.floor(clamp((t - 0.4) / 0.9) * (p.name || '').length); g.fillText((p.name || '').slice(0, n), 0, 20); if (p.sub) { mono(g, 34); g.fillStyle = '#3a3026'; g.fillText(p.sub.slice(0, Math.floor(clamp((t - 1.2) / 0.8) * p.sub.length)), 0, 120); } g.restore();
  },
  doc(g, t, info, p) {   // a document on the desk; kinds: news | typed | slogan
    DESK(g); const w = p.kind === 'news' ? 1180 : 1000, h = p.kind === 'slogan' ? 420 : 820; paper(g, W() / 2, H() / 2 + 30, w, h, p.rot ?? -0.015, p.kind === 'news' ? '#e4dcc6' : K.cream, 13);
    g.save(); g.translate(W() / 2, H() / 2 + 30); g.rotate(p.rot ?? -0.015); g.textAlign = 'center'; g.fillStyle = K.ink;
    if (p.kind === 'news') { g.font = `900 52px ${SERIF}`; g.fillText(p.mast || 'THE DAILY RECORD', 0, -h / 2 + 90); g.fillRect(-w / 2 + 50, -h / 2 + 112, w - 100, 4); mono(g, 20, 400); g.fillText(p.date || '', 0, -h / 2 + 145); g.fillRect(-w / 2 + 50, -h / 2 + 162, w - 100, 2);
      const words = (p.head || '').split(' '), n = Math.floor(clamp((t - 0.3) / 1.0) * words.length + 0.0001); g.font = `900 ${p.hs || 78}px ${SERIF}`; const lines = []; let ln = ''; for (const wd of words.slice(0, n)) { const tst = ln ? ln + ' ' + wd : wd; if (g.measureText(tst).width > w - 140 && ln) { lines.push(ln); ln = wd; } else ln = tst; } if (ln) lines.push(ln); lines.forEach((l, i) => g.fillText(l, 0, -h / 2 + 260 + i * (p.hs || 78) * 1.1));
      g.fillStyle = 'rgba(13,13,16,.55)'; for (let c = 0; c < 3; c++) for (let i = 0; i < 9; i++) g.fillRect(-w / 2 + 60 + c * (w - 120) / 3, 80 + i * 26, (w - 120) / 3 - 30 - (i === 8 ? 80 : 0), 9); }
    else if (p.kind === 'typed') { g.textAlign = 'left'; mono(g, 30); g.fillText(p.title || '', -w / 2 + 70, -h / 2 + 100); g.fillRect(-w / 2 + 70, -h / 2 + 120, w - 140, 2); mono(g, 30, 400); let total = 0; (p.lines || []).forEach((l, i) => { const st = 0.5 + total / 16; total += l.length; const n = Math.floor(clamp((t - st) * 16 / Math.max(1, l.length)) * l.length); g.fillText(l.slice(0, n), -w / 2 + 70, -h / 2 + 190 + i * 52); }); }
    else if (p.kind === 'slogan') { mono(g, p.size || 64); const s = p.text || '', n = Math.min(s.length, Math.floor(Math.max(0, t - 0.4) * 10)); g.fillText(s.slice(0, n), 0, 18); }
    g.restore(); if (p.stamp) stamp(g, t, p.stampAt ?? 2, W() * (p.sx ?? 0.66), H() * (p.sy ?? 0.66), p.stamp, { size: p.stampSize || 96, rot: -0.14 });
  },
  stat(g, t, info, p) {   // a big number on an index card
    DESK(g); paper(g, W() / 2, H() / 2, 1140, 640, 0.012, K.cream, 41); g.save(); g.translate(W() / 2, H() / 2); g.rotate(0.012); g.textAlign = 'center'; g.fillStyle = K.red; mono(g, 30); g.fillText(p.top || '', 0, -220);
    const k = ease.out(prog(t, 0.4, 2.0)); let num = p.num; if (p.to != null) { num = (p.pre || '') + Math.round(lerp(p.from ?? 0, p.to, k)).toLocaleString('en-US') + (p.suf || ''); }
    if (p.fromTxt) { g.fillStyle = '#5a5046'; g.font = `900 120px ${SERIF}`; g.fillText(p.fromTxt, -300, 50); g.fillStyle = K.ink; mono(g, 80); g.fillText('→', -40, 40); g.fillStyle = K.red; g.font = `900 170px ${SERIF}`; if (t > 1.0) g.fillText(p.toTxt, 300, 60); }
    else if (p.chart) { g.strokeStyle = 'rgba(13,13,16,.2)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-440, 140 - i * 50); g.lineTo(440, 140 - i * 50); g.stroke(); } g.strokeStyle = K.red; g.lineWidth = 8; g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60; if (u > k) break; const yy = 140 - (u ** 1.6) * 240 - Math.sin(u * 20) * 6; i ? g.lineTo(-440 + u * 880, yy) : g.moveTo(-440, yy); } g.stroke(); }
    else { g.fillStyle = K.ink; g.font = `900 ${p.ns || 200}px ${SERIF}`; g.fillText(num, 0, 70); }
    g.fillStyle = K.ink; mono(g, p.ls || 36); g.fillText(p.label || '', 0, 210); if (p.sub) { mono(g, 24, 400); g.fillStyle = '#5a5046'; g.fillText(p.sub, 0, 260); } g.restore();
  },
  photo(g, t, info, p) {   // a polaroid of an object, pushed slowly
    DESK(g); const s = 1 + t * 0.012; g.save(); g.translate(W() / 2, H() / 2); g.scale(s, s); g.rotate(p.rot ?? 0.03); const pw = p.wide ? 1100 : 760, ph = p.wide ? 640 : 760; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = K.cream; g.fillRect(-pw / 2 - 30, -ph / 2 - 30, pw + 60, ph + 130); g.shadowColor = 'transparent';
    g.save(); g.beginPath(); g.rect(-pw / 2, -ph / 2, pw, ph); g.clip(); g.translate(-pw / 2, -ph / 2); PHOTO_ART[p.art](g, pw, ph, t); g.restore(); if (p.cap) { g.fillStyle = K.ink; mono(g, 30); g.textAlign = 'left'; g.fillText(p.cap, -pw / 2, ph / 2 + 70); } g.restore();
  },
  eye(g, t, info, p) {   // one giant eye; pupil dilates; optional reflection
    g.fillStyle = p.bg || '#16181e'; g.fillRect(0, 0, W(), H()); const r = H() * 0.3 * (1 + t * 0.015);
    eyeArt(g, W() / 2, H() / 2, r, { pupil: 0.3 + ease.inOut(prog(t, 0.5, info.dur)) * 0.18, look: Math.sin(t * 0.7) * 0.2, open: p.blinkAt != null && t > p.blinkAt ? 1 - ease.in(prog(t, p.blinkAt, p.blinkAt + 0.25)) : 1,
      inPupil: p.refl ? (px, py, pr) => { g.save(); g.translate(px, py); g.globalAlpha = 0.75; if (p.refl === 'phone' || p.refl === 'tv' || p.refl === 'screen') { g.fillStyle = K.cyan; const ww = p.refl === 'tv' ? pr * 0.9 : pr * 0.55, hh = p.refl === 'tv' ? pr * 0.65 : pr * 0.95; g.fillRect(-ww / 2, -hh / 2, ww, hh); g.fillStyle = '#000'; g.fillRect(-ww / 2 + pr * 0.06, -hh / 2 + pr * 0.06, ww - pr * 0.12, hh - pr * 0.12); g.fillStyle = K.cyan; g.globalAlpha = 0.5; g.fillRect(-ww / 2 + pr * 0.1, -hh / 2 + pr * 0.1, ww - pr * 0.2, (hh - pr * 0.2) * 0.4); } else if (p.refl === 'bobo') { bobo(g, 0, pr * 0.6, pr / 330, t); } else if (p.refl === 'figure') { figure(g, 'WOMAN', 0, pr * 0.7, pr / 260, poseOf('wave'), { color: '#c8ccd4', eyes: false, edge: '#000', d: 1 }); } g.restore(); } : null });
  },
  face(g, t, info, p) {   // face: 'mirror' warp, 'filter' split, 'filtered'
    g.fillStyle = '#1c1f26'; g.fillRect(0, 0, W(), H());
    if (p.mode === 'split') { const k = ease.inOut(prog(t, 0.8, 2.2)); const xs = W() * (1 - k); faceArt(g, W() / 2, H() / 2, H() * 0.34, {}); g.save(); g.beginPath(); g.rect(xs, 0, W(), H()); g.clip(); g.fillStyle = '#2a2430'; g.fillRect(0, 0, W(), H()); faceArt(g, W() / 2, H() / 2, H() * 0.34, { filter: 1, t }); g.restore(); g.fillStyle = K.paper; g.fillRect(xs - 3, 0, 6, H()); }
    else if (p.mode === 'mirror') { const gr = g.createRadialGradient(W() / 2, H() / 2, 50, W() / 2, H() / 2, W() * 0.6); gr.addColorStop(0, '#3a3832'); gr.addColorStop(1, '#0c0c0e'); g.fillStyle = gr; g.fillRect(0, 0, W(), H()); faceArt(g, W() / 2, H() / 2, H() * 0.36, { warp: clamp((t - 0.3) / 2.0) * (p.warp ?? 1), t }); }
    else faceArt(g, W() / 2, H() / 2, H() * 0.36, { filter: 1, t });
  },
  phones(g, t, info, p) {   // two feeds side by side: fewer happy / fewer sad
    DESK(g); for (const [i, lab] of [[0, p.a || 'FEWER HAPPY POSTS'], [1, p.b || 'FEWER SAD POSTS']]) { const x = W() * (0.32 + i * 0.36), y = H() * 0.48; g.fillStyle = '#0c0c0e'; g.beginPath(); g.roundRect(x - 170, y - 330, 340, 660, 36); g.fill(); g.save(); g.beginPath(); g.rect(x - 150, y - 300, 300, 600); g.clip(); g.translate(x - 150, y - 300); feed(g, 300, 600, t * 0.5, i * 3); g.fillStyle = i ? 'rgba(232,163,58,.18)' : 'rgba(46,94,168,.25)'; g.fillRect(0, 0, 300, 600); g.restore(); if (t > 0.6 + i * 0.8) { g.fillStyle = K.paper; mono(g, 26); g.textAlign = 'center'; g.fillText(lab, x, y + 380); } }
  },
  ecg(g, t, info, p) {   // paper heart-rate chart with symptom words
    DESK(g); const bx = W() * 0.08, by = H() * 0.5, bw = W() * 0.84, bh = 300; paper(g, bx + bw / 2, by, bw, bh, 0.004, '#efe6cf', 77); g.save(); g.strokeStyle = 'rgba(200,16,46,.16)'; g.lineWidth = 1; for (let x = bx; x < bx + bw; x += 30) { g.beginPath(); g.moveTo(x, by - bh / 2 + 10); g.lineTo(x, by + bh / 2 - 10); g.stroke(); }
    const bpm = Math.round(lerp(72, 170, ease.in(prog(t, 0.2, info.dur * 0.8)))); g.strokeStyle = K.red; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 400; i++) { const u = i / 400, tt = t * 1.4 - (1 - u) * 2.6, ph = ((((tt * bpm) / 60) % 1) + 1) % 1, vv = Math.exp(-((ph - 0.5) ** 2) / 0.001) - 0.35 * Math.exp(-((ph - 0.56) ** 2) / 0.0007); const px = bx + 30 + u * (bw - 260), py = by + 20 - vv * 100; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.fillStyle = K.red; mono(g, 64); g.textBaseline = 'middle'; g.fillText(String(bpm), bx + bw - 210, by - 10); mono(g, 24); g.fillText('BPM', bx + bw - 90, by - 6); g.restore();
    const ws = p.words || []; let cur = null; for (const w of ws) if (t >= w[0]) cur = w[1]; if (cur) { const at = ws.find((w) => w[1] === cur)[0]; typed(g, t, at, W() / 2, H() * 0.2, cur, { size: 52, cps: 30 }); }
  },
};
function make2D(shot) { const p = shot.params || {};
  return { draw(g, t, info) { const dur = info.dur;
    // slow push for every 2D shot; rabbit-hole zoom into (dx,dy) when dive2 is set
    let s = 1 + t * (p.push ?? 0.01), cx = W() / 2, cy = H() / 2; if (p.dive2) { const d = ease.in(prog(t, dur - 1.5, dur)); s *= 1 + d * d * 40; cx = W() * p.dive2[0]; cy = H() * p.dive2[1]; }
    g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); T2[p.type](g, t, info, p); g.restore();
    overlays(g, t, p.ov); if (p.irisIn) irisIn(g, t, 0.8); if (p.dive2) irisOut(g, t, dur - 0.45, dur); film(g, t);
  } };
}

for (const shot of E.shots) { const p = shot.params || {}; if (p.type === 'world') registerShot(shot.id, makeWorld(shot)); else if (T2[p.type]) registerShot(shot.id, make2D(shot)); }
