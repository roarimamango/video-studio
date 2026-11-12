// sea3d.js — toon-shaded 3D sea shots (params.type === 'sea3d'), presets: turtle | fleet | invasion | strait | night | crane
// Camera always travels forward/in at constant speed (no ease-out), continuing through transitions.
import { E, registerShot, clamp, lerp, rng } from '/engine/core.js';
import { W, H, C, paperOver, tornFrame, label, halftone } from '../_kit.js';

function kit(T) {
  const { THREE } = T, grad = new THREE.DataTexture(new Uint8Array([45, 150, 255]), 3, 1, THREE.RedFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toon = (c) => new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: grad });
  const flat = (c, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), ...o });
  const mesh = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
  return { THREE, toon, flat, mesh };
}
// ships face +x
function makeShip(K, kind) {
  const { THREE, mesh, flat, toon } = K, g = new THREE.Group(), ink = flat(C.ink);
  const hullShape = new THREE.Shape(); hullShape.moveTo(-3, 0.6); hullShape.lineTo(3.4, 0.9); hullShape.lineTo(2.6, -0.5); hullShape.lineTo(-2.6, -0.5); hullShape.closePath();
  const hull = mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 2, bevelEnabled: false }), ink); hull.position.z = -1; g.add(hull);
  if (kind === 'turtle') {
    const roof = mesh(new THREE.CylinderGeometry(1.05, 1.05, 5.4, 16, 1, false, 0, Math.PI), toon('#2a2420')); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.position.set(0.1, 0.6, 0); roof.rotation.set(0, 0, Math.PI / 2); roof.rotation.x = Math.PI / 2; g.add(roof);
    for (let i = -5; i <= 5; i++) for (const a of [0.5, 1.1, 1.6, 2.1, 2.6]) { const sp = mesh(new THREE.ConeGeometry(0.07, 0.28, 5), ink); sp.position.set(i * 0.45, 0.6 + Math.sin(a) * 1.05, Math.cos(a) * 1.05); sp.lookAt(i * 0.45, 0.6 + Math.sin(a) * 3, Math.cos(a) * 3); sp.rotateX(Math.PI / 2); g.add(sp); }
    const head = mesh(new THREE.ConeGeometry(0.4, 1.2, 6), ink); head.rotation.z = -Math.PI / 2 - 0.4; head.position.set(3.6, 1.3, 0); g.add(head);
    for (const z of [-1.02, 1.02]) for (let i = -2; i <= 2; i++) g.add(mesh(new THREE.BoxGeometry(0.3, 0.2, 0.05), flat(C.red), i * 1.0, 0.45, z));
  } else {
    const house = mesh(new THREE.BoxGeometry(4, 0.9, 1.7), toon(kind === 'panok' ? '#3a302a' : '#2a2420'), -0.2, 1.3, 0); g.add(house);
    if (kind === 'jp') g.add(mesh(new THREE.BoxGeometry(1.6, 0.9, 1.3), toon('#2a2420'), -0.8, 2.2, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.5, 6), ink, kind === 'jp' ? 1.3 : 0.2, 3.4, 0));
    const sail = mesh(new THREE.PlaneGeometry(2.4, 2.2), flat(kind === 'panok' ? C.red : C.paper, { side: THREE.DoubleSide }), kind === 'jp' ? 1.35 : 0.25, 4.0, 0); sail.rotation.y = Math.PI / 2; g.add(sail);
    if (kind === 'jp') { const mon = mesh(new THREE.CircleGeometry(0.42, 20), flat(C.ink, { side: THREE.DoubleSide }), 1.38, 4.0, 0); mon.rotation.y = Math.PI / 2; g.add(mon); }
  }
  for (let i = -5; i <= 5; i++) for (const s of [-1, 1]) { const oar = mesh(new THREE.BoxGeometry(0.06, 0.06, 1.4), ink, i * 0.5, 0.0, s * 1.5); oar.rotation.x = s * 0.6; g.add(oar); }
  return g;
}
function sea(K, st, color = C.sea, dark = false) {
  const { THREE } = K; const geo = new THREE.PlaneGeometry(600, 600, 120, 120); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, K.toon(color)); m.receiveShadow = true; st.add(m);
  const lines = new THREE.Group(); const lm = K.flat(dark ? '#3a4460' : C.sea2); const r = rng(5);
  for (let i = 0; i < 260; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + r() * 2, 0.08), lm); w.rotation.x = -Math.PI / 2; w.position.set((r() - 0.5) * 160, 0.05, (r() - 0.5) * 160); lines.add(w); } st.add(lines);
  return { m, geo, lines };
}
function waveUpdate(s, t) { const pos = s.geo.attributes.position; const tq = Math.floor(t * 8) / 8; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, Math.round((Math.sin(x * 0.25 + tq * 1.6) + Math.cos(z * 0.3 + tq * 1.2)) * 2) * 0.12); } pos.needsUpdate = true; s.geo.computeVertexNormals(); }

const PRESET = {
  turtle(T, K) {
    const st = T.stage({ mood: 'void', sky: [C.paper, C.paper2, C.paper3], fog: [40, 160], fogColor: C.paper2, fov: 32, keyPos: [-20, 14, 10], keyColor: '#fff4e0', keyIntensity: 3.0, ambient: 0.9, shadowSize: 14, bloom: 0 });
    const sun = new K.THREE.Mesh(new K.THREE.CircleGeometry(14, 64), K.flat(C.red, { fog: false })); sun.position.set(20, 22, -120); st.scene.add(sun);
    const s = sea(K, st); const hero = makeShip(K, 'turtle'); st.add(hero);
    return { stage: st, s, ships: [{ o: hero, x: 0, z: 0, v: 0.6 }], cam: (t) => [[8 - t * 0.9, 2.2 + t * 0.12, 9 - t * 1.2], [t * 0.6, 1.0, 0]] };
  },
  fleet(T, K, info) {
    const st = T.stage({ mood: 'void', sky: [C.paper, C.paper2], fog: [30, 140], fogColor: C.paper2, fov: 34, keyPos: [-30, 12, -10], keyIntensity: 2.8, ambient: 0.9, shadowSize: 30, bloom: 0 });
    const s = sea(K, st); const ships = [];
    const nK = info.nK ?? 7, nJ = info.nJ ?? 16;
    for (let i = 0; i < nK; i++) { const o = makeShip(K, i === 0 ? 'turtle' : 'panok'); o.position.set(-14 - (i % 2) * 4, 0, (i - nK / 2) * 5); st.add(o); ships.push({ o, x: o.position.x, z: o.position.z, v: info.vK ?? 0.8 }); }
    for (let i = 0; i < nJ; i++) { const o = makeShip(K, 'jp'); o.rotation.y = Math.PI; o.position.set(16 + (i % 4) * 6, 0, (Math.floor(i / 4) - 2) * 7 + (i % 2) * 2); st.add(o); ships.push({ o, x: o.position.x, z: o.position.z, v: -(info.vJ ?? 0.6) }); }
    return { stage: st, s, ships, cam: (t) => [[-26 + t * 1.4, 7 - t * 0.25, 30 - t * 1.6], [2 + t * 0.6, 1, 0]] };
  },
  invasion(T, K, info) {
    const st = T.stage({ mood: 'void', sky: [C.paper2, C.paper3, '#c8a878'], fog: [40, 220], fogColor: C.paper3, fov: 36, keyPos: [30, 10, -40], keyIntensity: 2.6, ambient: 0.8, shadowSize: 60, bloom: 0 });
    const sun = new K.THREE.Mesh(new K.THREE.CircleGeometry(16, 64), K.flat(C.red, { fog: false })); sun.position.set(-30, 26, -160); st.scene.add(sun);
    const s = sea(K, st); const ships = []; const r = rng(4);
    for (let i = 0; i < (info.n ?? 60); i++) { const o = makeShip(K, 'jp'); o.rotation.y = -Math.PI / 2; o.position.set((r() - 0.5) * 120, 0, -20 - r() * 140); st.add(o); ships.push({ o, x: o.position.x, z: o.position.z, vz: 1.4 }); }
    const shore = K.mesh(new K.THREE.BoxGeometry(300, 3, 30), K.flat(C.ink), 0, 0.5, 40); st.add(shore);
    return { stage: st, s, ships, cam: (t) => [[0, 9 + t * 0.4, 48 - t * 2.2], [0, 4, -60]] };
  },
  strait(T, K, info) {
    const st = T.stage({ mood: 'void', sky: [C.paper, C.paper2, C.paper3], fog: [30, 150], fogColor: C.paper2, fov: 34, keyPos: [-10, 16, 20], keyIntensity: 2.6, ambient: 0.9, shadowSize: 40, bloom: 0 });
    const s = sea(K, st); const ships = [];
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) { const h = 5 + (i * 37 % 5); const hill = K.mesh(new K.THREE.SphereGeometry(10 + (i % 3) * 2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.flat(C.ink), (i - 4) * 16, -1, side * (24 + (i % 2) * 6)); hill.scale.y = h / 10; st.add(hill); }
    const yi = makeShip(K, info.hero || 'panok'); yi.position.set(-6, 0, 0); st.add(yi); ships.push({ o: yi, x: -6, z: 0, v: info.vK ?? 0 });
    const r = rng(8); for (let i = 0; i < (info.nJ ?? 24); i++) { const o = makeShip(K, 'jp'); o.rotation.y = Math.PI; o.position.set(10 + (i % 6) * 6 + r() * 2, 0, ((i % 5) - 2) * 4.5 + r()); st.add(o); ships.push({ o, x: o.position.x, z: o.position.z, v: -(info.vJ ?? 0.9), push: info.push }); }
    return { stage: st, s, ships, cam: (t) => [[-30 + t * 1.6, 6 + t * 0.1, 14 - t * 0.6], [6 + t * 0.4, 1, 0]] };
  },
  night(T, K, info) {
    const st = T.stage({ mood: 'void', sky: ['#05070f', '#0e1424', '#24304a'], fog: [25, 120], fogColor: '#0e1424', fov: 34, keyPos: [-30, 20, -60], keyColor: '#e8e0ff', keyIntensity: 2.4, ambient: 1.4, shadowSize: 30, bloom: 0.6 });
    const moon = new K.THREE.Mesh(new K.THREE.CircleGeometry(14, 48), K.flat(C.paper, { fog: false })); moon.position.set(10, 22, -120); st.scene.add(moon);
    const s = sea(K, st, '#3a4868', true); const ships = [];
    const r = rng(11); for (let i = 0; i < 14; i++) { const kind = i < 5 ? (i === 0 ? 'panok' : 'panok') : 'jp', o = makeShip(K, kind); if (kind === 'jp') o.rotation.y = Math.PI; o.position.set(kind === 'jp' ? 8 + r() * 30 : -10 - r() * 14, 0, (r() - 0.5) * 40); st.add(o); ships.push({ o, x: o.position.x, z: o.position.z, v: kind === 'jp' ? -0.4 : 0.5 });
      if (kind === 'jp' && i % 2) { const fire = K.mesh(new K.THREE.ConeGeometry(1.2, 3.5, 6), K.flat(i % 4 === 1 ? C.red : C.gold), 0, 3, 0); o.add(fire); const l = new K.THREE.PointLight(0xff7030, 30, 18); l.position.set(0, 3, 0); o.add(l); } }
    return { stage: st, s, ships, cam: (t) => [[-24 + t * 1.2, 5, 22 - t * 1.4], [4 + t * 0.4, 1.5, 0]] };
  },
};
for (const shot of E.shots) {
  const p = shot.params || {}; if (p.type !== 'sea3d') continue;
  registerShot(shot.id, { kind: '3d',
    init(T, info) { const K = kit(T); return PRESET[info.preset || 'turtle'](T, K, info); },
    draw(s, t, info) { waveUpdate(s.s, t); const tq = Math.floor(t * 8) / 8;
      for (const sh of s.ships) { sh.o.position.x = sh.x + (sh.v || 0) * t; if (sh.vz) sh.o.position.z = sh.z + sh.vz * t; if (sh.push && t > sh.push) { sh.o.position.x += (t - sh.push) * 3; sh.o.rotation.y = Math.PI + Math.sin(t * 2 + sh.z) * 0.4; } sh.o.position.y = Math.sin(tq * 2 + sh.x) * 0.12; sh.o.rotation.z = Math.sin(tq * 1.7 + sh.z) * 0.03; }
      const [pos, look] = s.cam(t); s.stage.camera.position.set(...pos); s.stage.camera.lookAt(...look); },
    overlay(g, t, info) { paperOver(g, 0.42); g.save(); g.globalAlpha = 0.28; halftone(g, 0, H() * 0.66, W(), H() * 0.34, C.ink, 10, 0.9); g.restore();
      for (const l of info.ov?.labels || []) if (t >= (l.at || 0)) label(g, W() * (l.x ?? 0.5), H() * (l.y ?? 0.15), l.str, l.rot ?? -0.03, 7 + l.str.length, t, { size: l.size || 32, tape: true, fill: l.red ? C.red : C.paper, color: l.red ? C.paper : C.ink });
      if (info.ov?.date && t > 0.2) label(g, W() * 0.2, H() * 0.86, info.ov.date, -0.04, 61, t, { size: 40, tape: true });
      tornFrame(g, t, C.ink); },
  });
}
