import * as THREE from 'three';
import { ISLANDS, getIslandEdgeRadius, WATER_LEVEL } from '../data/islands.js';

export class WaterSystem {
  constructor(scene) {
    this.scene = scene;
    this.wakeParticles = [];
    this.wakeTimer = 0;

    // Stylized low-poly ocean plane
    const geo = new THREE.PlaneGeometry(540, 540, 68, 68);
    geo.rotateX(-Math.PI / 2);
    this.baseY = new Float32Array(geo.attributes.position.count);
    for (let i = 0; i < this.baseY.length; i++) {
      this.baseY[i] = 0;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0x269fb5,
      roughness: 0.28,
      metalness: 0.08,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    this.ocean = new THREE.Mesh(geo, mat);
    this.ocean.position.y = WATER_LEVEL;
    this.ocean.receiveShadow = true;
    scene.add(this.ocean);

    // Deep seabed plane beneath ocean so water has rich turquoise depth
    const bedGeo = new THREE.PlaneGeometry(560, 560);
    bedGeo.rotateX(-Math.PI / 2);
    const bedMat = new THREE.MeshBasicMaterial({ color: 0x13596e });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = -3.9;
    scene.add(bed);

    // Coastal foam rings around each island
    this.foamRings = [];
    for (const isl of ISLANDS) {
      const ring = this._createCoastalFoam(isl);
      scene.add(ring);
      this.foamRings.push({ mesh: ring, seed: isl.seed });
    }

    // Freshwater pond water discs
    this.pondMeshes = [];
    for (const isl of ISLANDS) {
      if (!isl.pond) continue;
      const pGeo = new THREE.CircleGeometry(isl.pond.radius * 1.18, 24);
      pGeo.rotateX(-Math.PI / 2);
      const pMat = new THREE.MeshStandardMaterial({
        color: isl.id === 'ruins' ? 0x38b6c9 : 0x3ec1c9,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(isl.pond.x, WATER_LEVEL + 0.05, isl.pond.z);
      scene.add(pMesh);
      this.pondMeshes.push(pMesh);
    }

    // Wake foam pool
    this.wakeGeo = new THREE.SphereGeometry(0.45, 6, 5);
    this.wakeMat = new THREE.MeshBasicMaterial({
      color: 0xeefbff,
      transparent: true,
      opacity: 0.72
    });
  }

  _createCoastalFoam(island) {
    const segs = 48;
    const shapePts = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const r = getIslandEdgeRadius(island, a) * 0.99;
      shapePts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }

    // Build flat ribbon ring around coastline
    const verts = [];
    const indices = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const rInner = getIslandEdgeRadius(island, a) * 0.92;
      const rOuter = getIslandEdgeRadius(island, a) * 1.07;
      verts.push(Math.cos(a) * rInner, 0.04, Math.sin(a) * rInner);
      verts.push(Math.cos(a) * rOuter, 0.03, Math.sin(a) * rOuter);
      if (i < segs) {
        const idx = i * 2;
        indices.push(idx, idx + 1, idx + 2);
        indices.push(idx + 1, idx + 3, idx + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({
      color: 0xdff8fa,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(island.x, WATER_LEVEL + 0.02, island.z);
    return mesh;
  }

  spawnWake(x, z, size = 1) {
    if (this.wakeParticles.length > 36) return;
    const m = new THREE.Mesh(this.wakeGeo, this.wakeMat.clone());
    m.position.set(x + (Math.random() - 0.5) * 0.6, WATER_LEVEL + 0.05, z + (Math.random() - 0.5) * 0.6);
    m.scale.set(size, 0.25, size);
    this.scene.add(m);
    this.wakeParticles.push({ mesh: m, life: 0, maxLife: 1.0 + Math.random() * 0.4 });
  }

  update(dt, time, isNight) {
    // Animate ocean vertices gently
    const pos = this.ocean.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const wave =
        Math.sin(vx * 0.08 + time * 1.35) * 0.14 +
        Math.cos(vz * 0.09 + time * 1.05) * 0.12;
      pos.setY(i, wave);
    }
    pos.needsUpdate = true;

    // Subtle ocean color shift at night
    const targetColor = isNight ? 0x164e6b : 0x28a4ba;
    this.ocean.material.color.lerp(new THREE.Color(targetColor), dt * 1.2);

    // Coastal foam pulse
    for (const f of this.foamRings) {
      const pulse = 1 + Math.sin(time * 1.8 + f.seed) * 0.015;
      f.mesh.scale.set(pulse, 1, pulse);
      f.mesh.material.opacity = 0.42 + Math.sin(time * 1.8 + f.seed) * 0.14;
    }

    // Update wake particles
    for (let i = this.wakeParticles.length - 1; i >= 0; i--) {
      const p = this.wakeParticles[i];
      p.life += dt;
      const t = p.life / p.maxLife;
      if (t >= 1) {
        this.scene.remove(p.mesh);
        p.mesh.material.dispose();
        this.wakeParticles.splice(i, 1);
      } else {
        const s = 0.8 + t * 2.2;
        p.mesh.scale.set(s, 0.2, s);
        p.mesh.material.opacity = (1 - t) * 0.55;
      }
    }
  }
}
