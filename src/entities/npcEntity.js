import * as THREE from 'three';
import { NPCS } from '../data/npcs.js';
import { getTerrainHeight } from '../data/islands.js';

export class NpcManager {
  constructor(scene, labelsContainer) {
    this.scene = scene;
    this.labelsContainer = labelsContainer;
    this.entities = [];

    for (const data of NPCS) {
      const group = this._buildAnimalMesh(data.species);
      const y = getTerrainHeight(data.x, data.z);
      group.position.set(data.x, y, data.z);
      group.rotation.y = data.facing || 0;
      scene.add(group);

      const labelEl = document.createElement('div');
      labelEl.className = 'world-label';
      labelEl.innerHTML = `<span class="npc-label-name">${data.portrait} ${data.name}</span>`;
      labelsContainer.appendChild(labelEl);

      this.entities.push({
        data,
        group,
        baseY: y,
        labelEl,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  _buildAnimalMesh(species) {
    const g = new THREE.Group();
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1b1512 });

    const palettes = {
      tanuki: { body: 0x9c6644, belly: 0xedd6b5, shirt: 0x4ea664, ear: 0x5c3c24 },
      otter: { body: 0x7f5539, belly: 0xe6ccb2, shirt: 0x266791, ear: 0x5c3c24 },
      bunny: { body: 0xfff5ec, belly: 0xffe5ec, shirt: 0xf284a2, ear: 0xffb3c6 },
      turtle: { body: 0x70b868, belly: 0xf3df9e, shirt: 0x3b7a57, ear: 0x4f9952 },
      panda: { body: 0xfbfbfb, belly: 0x262626, shirt: 0xd64045, ear: 0x222222 },
      owl: { body: 0x8d6e63, belly: 0xefe2ce, shirt: 0x3f5e8a, ear: 0x5d4037 }
    };
    const p = palettes[species] || palettes.tanuki;

    const bodyMat = new THREE.MeshStandardMaterial({ color: p.body, flatShading: true });
    const bellyMat = new THREE.MeshStandardMaterial({ color: p.belly, flatShading: true });
    const shirtMat = new THREE.MeshStandardMaterial({ color: p.shirt, flatShading: true });
    const earMat = new THREE.MeshStandardMaterial({ color: p.ear, flatShading: true });

    // Torso / Outfit
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.48, 0.85, 8), shirtMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    g.add(torso);

    // Little feet
    const footGeo = new THREE.SphereGeometry(0.16, 6, 5);
    const fL = new THREE.Mesh(footGeo, bodyMat);
    fL.position.set(-0.22, 0.16, 0.08);
    const fR = new THREE.Mesh(footGeo, bodyMat);
    fR.position.set(0.22, 0.16, 0.08);
    g.add(fL, fR);

    // Cute arms
    const armGeo = new THREE.CapsuleGeometry(0.11, 0.25, 4, 6);
    const aL = new THREE.Mesh(armGeo, bodyMat);
    aL.position.set(-0.5, 0.72, 0.06);
    aL.rotation.z = 0.3;
    const aR = new THREE.Mesh(armGeo, bodyMat);
    aR.position.set(0.5, 0.72, 0.06);
    aR.rotation.z = -0.3;
    g.add(aL, aR);

    // Head
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), bodyMat);
    head.position.y = 1.42;
    head.castShadow = true;
    g.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.065, 6, 6);
    const eL = new THREE.Mesh(eyeGeo, eyeMat);
    eL.position.set(-0.18, 1.47, 0.42);
    const eR = new THREE.Mesh(eyeGeo, eyeMat);
    eR.position.set(0.18, 1.47, 0.42);
    g.add(eL, eR);

    // Species-specific cute details
    if (species === 'bunny') {
      const earGeo = new THREE.CapsuleGeometry(0.1, 0.46, 4, 6);
      const earL = new THREE.Mesh(earGeo, bodyMat);
      earL.position.set(-0.18, 2.08, 0);
      earL.rotation.z = 0.14;
      const earR = new THREE.Mesh(earGeo, bodyMat);
      earR.position.set(0.18, 2.08, 0);
      earR.rotation.z = -0.14;
      g.add(earL, earR);
    } else if (species === 'turtle') {
      const shell = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.58, 0),
        new THREE.MeshStandardMaterial({ color: 0x3b7a57, flatShading: true })
      );
      shell.scale.set(0.95, 1.0, 0.65);
      shell.position.set(0, 0.75, -0.35);
      shell.castShadow = true;
      g.add(shell);
    } else if (species === 'owl') {
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.24, 4),
        new THREE.MeshStandardMaterial({ color: 0xf4a261, flatShading: true })
      );
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 1.38, 0.5);
      g.add(beak);
      // Owl ear tufts
      for (const sx of [-0.28, 0.28]) {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 4), earMat);
        tuft.position.set(sx, 1.88, 0);
        g.add(tuft);
      }
    } else {
      // Round ears (Tanuki, Otter, Panda)
      const earGeo = new THREE.SphereGeometry(0.16, 6, 6);
      const earL = new THREE.Mesh(earGeo, earMat);
      earL.position.set(-0.34, 1.82, 0);
      const earR = new THREE.Mesh(earGeo, earMat);
      earR.position.set(0.34, 1.82, 0);
      g.add(earL, earR);

      // Snout
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), bellyMat);
      snout.scale.set(1.15, 0.85, 0.9);
      snout.position.set(0, 1.34, 0.42);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 5), eyeMat);
      nose.position.set(0, 1.38, 0.57);
      g.add(snout, nose);

      if (species === 'tanuki') {
        // Cozy shop apron & fluffy tail
        const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.45, 4, 6), earMat);
        tail.position.set(0, 0.45, -0.52);
        tail.rotation.x = -0.8;
        g.add(tail);
      } else if (species === 'otter') {
        // Sailor cap for Otter Captain
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.32, 0.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true })
        );
        cap.position.y = 1.9;
        g.add(cap);
      } else if (species === 'panda') {
        // Dark eye patches
        const patchGeo = new THREE.SphereGeometry(0.11, 6, 6);
        const pL = new THREE.Mesh(patchGeo, earMat);
        pL.position.set(-0.18, 1.46, 0.36);
        const pR = new THREE.Mesh(patchGeo, earMat);
        pR.position.set(0.18, 1.46, 0.36);
        g.add(pL, pR);
      }
    }

    return g;
  }

  getNearestNpc(x, z, maxDist = 4.2) {
    let best = null;
    let bestD = maxDist;
    for (const ent of this.entities) {
      const d = Math.hypot(ent.data.x - x, ent.data.z - z);
      if (d < bestD) {
        bestD = d;
        best = ent;
      }
    }
    return best;
  }

  update(dt, time, camera, playerPos, store, hideLabels = false) {
    const tmpV = new THREE.Vector3();
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const ent of this.entities) {
      // Gentle idle breathing bob
      ent.group.position.y = ent.baseY + Math.sin(time * 2.6 + ent.phase) * 0.04;

      // Turn toward player when nearby
      const dx = playerPos.x - ent.data.x;
      const dz = playerPos.z - ent.data.z;
      const dist = Math.hypot(dx, dz);
      const targetYaw = dist < 8 ? Math.atan2(dx, dz) : ent.data.facing || 0;
      let diff = targetYaw - ent.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      ent.group.rotation.y += diff * Math.min(1, dt * 6);

      // Update floating world label
      if (hideLabels || dist > 36) {
        ent.labelEl.style.opacity = '0';
        continue;
      }

      tmpV.set(ent.data.x, ent.baseY + 2.55, ent.data.z);
      tmpV.project(camera);
      if (tmpV.z > 1) {
        ent.labelEl.style.opacity = '0';
        continue;
      }

      const sx = (tmpV.x * 0.5 + 0.5) * w;
      const sy = (-tmpV.y * 0.5 + 0.5) * h;
      ent.labelEl.style.left = `${sx}px`;
      ent.labelEl.style.top = `${sy}px`;
      ent.labelEl.style.opacity = '1';

      // Quest indicator badge
      const qStatus = store.getNpcQuestStatus(ent.data);
      let badgeHtml = '';
      if (qStatus.state === 'available') {
        badgeHtml = '<span class="quest-mark">!</span>';
      } else if (qStatus.state === 'ready') {
        badgeHtml = '<span class="quest-mark ready">✓</span>';
      } else if (qStatus.state === 'active') {
        badgeHtml = '<span class="quest-mark" style="background:#7ea8be">?</span>';
      }

      const key = `${qStatus.state}`;
      if (ent.lastBadgeKey !== key) {
        ent.lastBadgeKey = key;
        ent.labelEl.innerHTML = `${badgeHtml}<span>${ent.data.portrait} ${ent.data.name}</span>`;
      }
    }
  }
}
