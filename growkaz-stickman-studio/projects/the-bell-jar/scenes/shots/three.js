// shots/three.js — 3D shots, registered by params.type: jar3d | city3d | hosp3d | house3d
import { E, V, registerShot, mood, ease, prog, clamp, text, FONTS, S } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { WHO } from '../cast.js';

function glassJar(T, h = 2.4, r = 0.75) {
  const { THREE } = T; const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0, transmission: 0, side: THREE.DoubleSide, depthWrite: false });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h - r, 48, 1, true), glass); body.position.y = (h - r) / 2; g.add(body);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), glass); dome.position.y = h - r; g.add(dome);
  const edge = new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.5 });
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(r, 0.015, 8, 64), edge); ringM.rotation.x = Math.PI / 2; ringM.position.y = 0.02; g.add(ringM);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshStandardMaterial({ color: 0xcfe6ff, roughness: 0.1 })); knob.position.y = h + 0.05; g.add(knob);
  g.add(T.cyl(r + 0.15, r + 0.2, 0.08, '#1a1420', 0, 0.04, 0, 48));
  return g;
}

const B = {
  // the bell jar, slow orbit: Sylvia inside, alone on a dark stage
  jar3d: {
    init(T, info) {
      const p = info, st = T.stage({ mood: 'void', sky: ['#05070f', '#0e1424', '#1a2238'], fov: V(30, 46), fog: [10, 40], keyPos: [3, 9, 4], keyIntensity: 2.2, ambient: 0.7, bloom: 0.7 });
      st.add(T.ground(60, 60, '#0e1322'));
      const jar = glassJar(T, 2.5, 0.8); st.add(jar);
      const fig = T.figure3D(WHO.SYLVIA, { rim: '#dfe8ff', pose: POSES[p.pose || 'sad'] }); fig.scale.setScalar(0.85); st.add(fig);
      const spot = T.shaft(2.2, 9, '#dfe8ff', 0.08); spot.position.set(0, 4.5, 0); st.add(spot);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; st.add(T.cyl(0.04, 0.04, 6, '#0a0d18', Math.cos(a) * 9, 3, Math.sin(a) * 9)); }
      return { stage: st, fig };
    },
    draw(s, t, info, T) { T.orbit(s.stage.camera, t, { target: [0, 1.1, 0], radius: info.radius ? info.radius : [6.5, 5.2], height: [2.6, 1.7], from: info.from ?? -0.7, to: info.to ?? 0.5, dur: info.dur }); },
  },
  // Manhattan avenue at night, fly up the Barbizon
  city3d: {
    init(T) {
      const M = mood('night'); const st = T.stage({ mood: 'night', fov: V(38, 55), fog: [20, 90], keyPos: [-10, 14, 8], keyIntensity: 1.6, ambient: 1.4, bloom: 0.8 });
      st.add(T.ground(200, 200, '#15182a'));
      st.add(T.box(10, 0.02, 200, '#1d2034', 0, 0.01, 0));
      const r = (i) => ((i * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 18; i++) for (const side of [-1, 1]) { const h = 10 + r(i * 3 + side) * 30, w = 6 + r(i + side) * 4; const b = T.building(9, h, w, { color: '#22263e', win: M.practical, lit: 0.35, seed: i * 2 + side + 5 }); b.position.x = side * (5 + 4 + 1); b.position.z = -i * 11 + 30; b.rotation.y = -side * Math.PI / 2; st.add(b); }
      const bar = T.building(12, 38, 10, { color: '#4a3040', win: '#ffd59a', lit: 0.6, seed: 77 }); bar.position.x = -12; bar.position.z = 2; bar.rotation.y = Math.PI / 2; st.add(bar);
      for (let i = 0; i < 10; i++) { st.add(T.cyl(0.06, 0.06, 4, '#10121e', 5.4, 2, -i * 12 + 30)); st.add(T.sphere(0.18, T.basic('#ffd59a'), 5.0, 4, -i * 12 + 30)); }
      return { stage: st };
    },
    draw(s, t, info, T) { T.dolly(s.stage.camera, t, [[0, { pos: [2, 1.6, 30], look: [-6, 6, 0] }], [info.dur, { pos: [3, 9, 14], look: [-12, 20, 2] }]]); },
    overlay(g, t, info) { const a = clamp(Math.min((t - 0.6) / 0.5, (info.dur - t) / 0.4)); if (a > 0) UI.readout(g, { label: 'NEW YORK CITY ·', value: 'JUNE 1953', x: V(110, 80), y: E.H - V(150, 560), a, size: V(52, 60) }); },
  },
  // McLean Hospital: brick halls in the trees, golden light
  hosp3d: {
    init(T) {
      const M = mood('golden'); const st = T.stage({ mood: 'golden', fov: V(36, 52), fog: [25, 90], keyPos: [-12, 8, 10], keyIntensity: 2.6, ambient: 1.1 });
      st.add(T.ground(200, 200, M.grass));
      const main = T.building(22, 12, 10, { color: '#7a3e30', win: M.practical, lit: 0.5, seed: 11 }); main.position.z = -6; st.add(main);
      st.add(T.cone(9, 5, '#3a2a2a', 0, 14.5, -6, 4));
      for (const x of [-18, 18]) { const w = T.building(10, 9, 9, { color: '#6e382c', win: M.practical, lit: 0.45, seed: 20 + x }); w.position.x = x; w.position.z = -2; st.add(w); }
      for (let i = 0; i < 16; i++) st.add(T.tree3D(-30 + i * 4 + (i % 3), 10 + (i % 4) * 3, 1.3 + (i % 3) * 0.3, '#2a3a2a'));
      st.add(T.box(3, 0.02, 30, '#8a7a6a', 0, 0.02, 10));
      return { stage: st };
    },
    draw(s, t, info, T) { T.orbit(s.stage.camera, t, { target: [0, 5, -6], radius: [40, 32], height: [10, 7], from: -0.35, to: 0.15, dur: info.dur }); },
  },
  // Wellesley house at night: searchers' lights
  house3d: {
    init(T) {
      const st = T.stage({ mood: 'night', fov: V(36, 52), fog: [15, 60], keyPos: [-8, 12, 6], keyIntensity: 0.8, ambient: 0.7, bloom: 0.9 });
      st.add(T.ground(120, 120, '#18241e'));
      const h = T.building(10, 6, 8, { color: '#3a3448', win: '#ffcf8a', lit: 0.5, seed: 9 }); st.add(h); st.add(T.cone(7.6, 3.5, '#262234', 0, 7.75, 0, 4));
      for (let i = 0; i < 12; i++) st.add(T.tree3D(-24 + i * 4.5, -10 - (i % 3) * 3, 1.4 + (i % 2) * 0.3, '#14201a'));
      const people = []; for (let i = 0; i < 6; i++) { const f = T.figure3D({ top: 'trench', color: '#1c1a24' }, { rim: '#fff3c8', pose: POSES.holdFront }); f.position.set(-8 + i * 3.2, 0, 7 + (i % 2) * 2); f.rotation.y = Math.PI + (i - 3) * 0.2; st.add(f); const beam = T.shaft(0.6, 8, '#fff3c8', 0.12); beam.position.set(-8 + i * 3.2, 1.2, 3 + (i % 2) * 2); beam.rotation.x = -Math.PI / 2 + 0.3; st.add(beam); people.push(beam); }
      return { stage: st, people };
    },
    draw(s, t, info, T) { s.people.forEach((b, i) => { b.rotation.z = Math.sin(t * 0.8 + i * 1.7) * 0.5; }); T.orbit(s.stage.camera, t, { target: [0, 2, 2], radius: [22, 18], height: [7, 5], from: 0.25, to: -0.25, dur: info.dur }); },
  },
};

function label3d(g, t, info) { if (!info.label) return; const a = clamp(Math.min((t - 0.6) / 0.5, (info.dur - t) / 0.4)); if (a > 0) UI.readout(g, { label: info.labelSmall || null, value: info.label, x: V(110, 80), y: E.H - V(150, 560), a, size: V(52, 60) }); }
for (const shot of E.shots) { const p = shot.params || {}; const def = B[p.type || '']; if (def) registerShot(shot.id, { kind: '3d', ...def, overlay: def.overlay || label3d }); }
