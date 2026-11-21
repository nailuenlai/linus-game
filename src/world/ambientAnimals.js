import * as THREE from 'three';
import { ISLANDS, getTerrainHeight, getPondAt } from '../data/islands.js';

export class AmbientAnimalsSystem {
  constructor(scene) {
    this.scene = scene;
    this.walkers = [];
    this.seagulls = [];

    this._spawnLandCritters();
    this._spawnSeagulls();
  }

  _createChick(color = 0xffdd57) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, flatShading: true });
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), bodyMat);
    body.position.y = 0.32;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), bodyMat);
    head.position.set(0, 0.58, 0.14);
    g.add(head);

    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.18, 4),
      new THREE.MeshStandardMaterial({ color: 0xf48c25, flatShading: true })
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.56, 0.34);
    g.add(beak);
    return g;
  }

  _createDuck() {
    const g = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({ color: 0xfafaf5, flatShading: true });
    const orange = new THREE.MeshStandardMaterial({ color: 0xf48c25, flatShading: true });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 6), white);
    body.scale.set(0.9, 0.72, 1.25);
    body.position.y = 0.35;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 7, 6), white);
    head.position.set(0, 0.68, 0.25);
    g.add(head);

    const bill = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.22), orange);
    bill.position.set(0, 0.64, 0.48);
    g.add(bill);
    return g;
  }

  _createCrab() {
    const g = new THREE.Group();
    const red = new THREE.MeshStandardMaterial({ color: 0xe75a4d, flatShading: true });
    const shell = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), red);
    shell.scale.set(1.2, 0.55, 0.9);
    shell.position.y = 0.22;
    shell.castShadow = true;
    g.add(shell);

    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.22), red);
    clawL.position.set(-0.34, 0.25, 0.22);
    const clawR = clawL.clone();
    clawR.position.x = 0.34;
    g.add(clawL, clawR);
    return g;
  }

  _createFoxCub() {
    const g = new THREE.Group();
    const fur = new THREE.MeshStandardMaterial({ color: 0xe67e38, flatShading: true });
    const cream = new THREE.MeshStandardMaterial({ color: 0xfff3dc, flatShading: true });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 0.72), fur);
    body.position.y = 0.38;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), fur);
    head.position.set(0, 0.68, 0.32);
    g.add(head);

    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 4), fur);
    earL.position.set(-0.15, 0.95, 0.28);
    const earR = earL.clone();
    earR.position.x = 0.15;
    g.add(earL, earR);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 5), cream);
    tail.rotation.x = -Math.PI * 0.35;
    tail.position.set(0, 0.45, -0.45);
    g.add(tail);
    return g;
  }

  _spawnLandCritters() {
    const specs = [
      // Main island chicks & ducks
      { type: 'chick', island: ISLANDS[0], x: -4, z: 12, color: 0xffe066 },
      { type: 'chick', island: ISLANDS[0], x: -6, z: 14, color: 0xfff3b0 },
      { type: 'duck', island: ISLANDS[0], x: -7, z: -2 },
      { type: 'duck', island: ISLANDS[0], x: -17, z: -13 },
      // Coconut lagoon crabs
      { type: 'crab', island: ISLANDS[1], x: 92 - 14, z: 68 + 8 },
      { type: 'crab', island: ISLANDS[1], x: 92 + 12, z: 68 - 10 },
      // Sakura island fox cubs
      { type: 'fox', island: ISLANDS[2], x: -88 + 10, z: -66 - 8 },
      { type: 'duck', island: ISLANDS[2], x: -88 - 12, z: -66 + 4 },
      // Ruins island mystical white fox
      { type: 'fox', island: ISLANDS[3], x: 86 - 10, z: -82 - 8 }
    ];

    for (const s of specs) {
      let mesh;
      if (s.type === 'chick') mesh = this._createChick(s.color);
      else if (s.type === 'duck') mesh = this._createDuck();
      else if (s.type === 'crab') mesh = this._createCrab();
      else mesh = this._createFoxCub();

      const h = getTerrainHeight(s.x, s.z);
      mesh.position.set(s.x, Math.max(0.2, h), s.z);
      this.scene.add(mesh);

      this.walkers.push({
        mesh,
        type: s.type,
        homeX: s.x,
        homeZ: s.z,
        targetX: s.x,
        targetZ: s.z,
        waitTimer: Math.random() * 3,
        speed: s.type === 'crab' ? 1.8 : 1.5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  _spawnSeagulls() {
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 5), white);
      body.rotation.x = Math.PI / 2;
      g.add(body);

      const wingGeo = new THREE.BoxGeometry(0.85, 0.06, 0.28);
      const wingL = new THREE.Mesh(wingGeo, white);
      wingL.position.x = -0.45;
      const wingR = new THREE.Mesh(wingGeo, white);
      wingR.position.x = 0.45;
      g.add(wingL, wingR);

      const isl = ISLANDS[i % ISLANDS.length];
      this.scene.add(g);
      this.seagulls.push({
        group: g,
        wingL,
        wingR,
        centerX: isl.x,
        centerZ: isl.z,
        radius: isl.radius * (0.85 + Math.random() * 0.45),
        height: 15 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt, time) {
    // Update wandering island critters
    for (const w of this.walkers) {
      w.waitTimer -= dt;
      const dx = w.targetX - w.mesh.position.x;
      const dz = w.targetZ - w.mesh.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.35) {
        const vx = (dx / dist) * w.speed * dt;
        const vz = (dz / dist) * w.speed * dt;
        const nx = w.mesh.position.x + vx;
        const nz = w.mesh.position.z + vz;
        const nh = getTerrainHeight(nx, nz);
        if (nh > 0.3 && !getPondAt(nx, nz)) {
          w.mesh.position.x = nx;
          w.mesh.position.z = nz;
          const hop = Math.abs(Math.sin(time * 9 + w.phase)) * 0.22;
          w.mesh.position.y = nh + hop;
          const desiredYaw = Math.atan2(dx, dz);
          w.mesh.rotation.y = desiredYaw + (w.type === 'crab' ? Math.PI / 2 : 0);
        } else {
          w.targetX = w.mesh.position.x;
          w.targetZ = w.mesh.position.z;
        }
      } else {
        const h = getTerrainHeight(w.mesh.position.x, w.mesh.position.z);
        w.mesh.position.y = h + Math.sin(time * 2.5 + w.phase) * 0.03;
        if (w.waitTimer <= 0) {
          const ang = Math.random() * Math.PI * 2;
          const rad = 2 + Math.random() * 6;
          w.targetX = w.homeX + Math.cos(ang) * rad;
          w.targetZ = w.homeZ + Math.sin(ang) * rad;
          w.waitTimer = 2.5 + Math.random() * 4.5;
        }
      }
    }

    // Update circling seagulls
    for (const s of this.seagulls) {
      s.angle += s.speed * dt;
      const x = s.centerX + Math.cos(s.angle) * s.radius;
      const z = s.centerZ + Math.sin(s.angle) * s.radius;
      const y = s.height + Math.sin(time * 1.4 + s.phase) * 1.2;
      s.group.position.set(x, y, z);
      s.group.rotation.y = -s.angle;
      const flap = Math.sin(time * 5.2 + s.phase) * 0.42;
      s.wingL.rotation.z = flap;
      s.wingR.rotation.z = -flap;
    }
  }
}
