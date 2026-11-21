import * as THREE from 'three';
import { ISLANDS, getTerrainHeight, getPondAt, getIslandEdgeRadius } from '../data/islands.js';
import { BUG_LIST, matchesTime, matchesWeather, pickWeightedCreature, rollCreatureSize } from '../data/creatures.js';

export class BugSystem {
  constructor(scene) {
    this.scene = scene;
    this.bugs = [];
    this.spawnTimer = 0;
  }

  _buildBugMesh(creature) {
    const g = new THREE.Group();
    const col = creature.color || 0xffd166;
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      flatShading: true,
      emissive: creature.glow ? col : 0x000000,
      emissiveIntensity: creature.glow ? 1.4 : 0
    });

    if (creature.behavior === 'fly') {
      // Butterfly / Firefly / Dragonfly / Moth with flapping wings!
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.06, 0.24, 4, 5),
        new THREE.MeshStandardMaterial({ color: 0x332b24 })
      );
      body.rotation.x = Math.PI / 2;
      g.add(body);

      const wingSize = creature.id === 'firefly' ? 0.16 : 0.34;
      const wingGeo = new THREE.BoxGeometry(wingSize, 0.03, wingSize * 0.9);
      const wingL = new THREE.Mesh(wingGeo, mat);
      wingL.position.x = -wingSize * 0.55;
      const wingR = new THREE.Mesh(wingGeo, mat);
      wingR.position.x = wingSize * 0.55;
      g.add(wingL, wingR);

      if (creature.glow) {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 6, 6),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 })
        );
        g.add(halo);
      }

      return { group: g, wingL, wingR };
    } else {
      // Ground Beetle / Ladybug / Snail / Mantis / Crab
      const shell = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), mat);
      shell.scale.set(0.95, 0.65, 1.2);
      shell.position.y = 0.18;
      shell.castShadow = true;
      g.add(shell);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 5, 5),
        new THREE.MeshStandardMaterial({ color: 0x26201c })
      );
      head.position.set(0, 0.16, 0.24);
      g.add(head);

      return { group: g, wingL: null, wingR: null };
    }
  }

  _spawnBugOnIsland(isl, isNight, isRain, luckBonus) {
    const candidates = BUG_LIST.filter(
      b => b.islands.includes(isl.id) && matchesTime(b.time, isNight) && matchesWeather(b.weather, isRain)
    );
    if (!candidates.length) return;

    const creature = pickWeightedCreature(candidates, luckBonus);
    // Find valid land spot
    for (let attempt = 0; attempt < 10; attempt++) {
      const ang = Math.random() * Math.PI * 2;
      const r = (0.2 + Math.random() * 0.62) * getIslandEdgeRadius(isl, ang);
      const x = isl.x + Math.cos(ang) * r;
      const z = isl.z + Math.sin(ang) * r;
      const h = getTerrainHeight(x, z);
      if (h > 0.7 && !getPondAt(x, z)) {
        const built = this._buildBugMesh(creature);
        const y = creature.behavior === 'fly' ? h + 1.15 : h;
        built.group.position.set(x, y, z);
        this.scene.add(built.group);

        this.bugs.push({
          creature,
          islandId: isl.id,
          group: built.group,
          wingL: built.wingL,
          wingR: built.wingR,
          x,
          y,
          z,
          baseY: y,
          yaw: Math.random() * Math.PI * 2,
          turnTimer: 1 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          fleeing: false,
          fleeTimer: 0
        });
        return;
      }
    }
  }

  getNearestBug(x, z, maxDist = 4.5) {
    let best = null;
    let bestD = maxDist;
    for (const b of this.bugs) {
      if (b.fleeing) continue;
      const d = Math.hypot(b.x - x, b.z - z);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    return best;
  }

  attemptCatch(playerX, playerZ, playerYaw, netLevel) {
    const reach = 2.0 + netLevel * 0.45;
    const hitRadius = 1.9 + netLevel * 0.55;
    const fx = playerX + Math.sin(playerYaw) * reach;
    const fz = playerZ + Math.cos(playerYaw) * reach;

    let caughtIndex = -1;
    let bestD = hitRadius;
    for (let i = 0; i < this.bugs.length; i++) {
      const b = this.bugs[i];
      if (b.fleeing) continue;
      // Check both distance to net sweep center and direct close proximity
      const dNet = Math.hypot(b.x - fx, b.z - fz);
      const dSelf = Math.hypot(b.x - playerX, b.z - playerZ);
      const d = Math.min(dNet, dSelf);
      if (d < bestD) {
        bestD = d;
        caughtIndex = i;
      }
    }

    if (caughtIndex === -1) return null;

    const bug = this.bugs[caughtIndex];
    this.scene.remove(bug.group);
    this.bugs.splice(caughtIndex, 1);

    const size = rollCreatureSize(bug.creature);
    return { creature: bug.creature, size };
  }

  update(dt, time, playerPos, playerSpeedMag, isNight, isRain, netLevel, luckBonus) {
    // Maintain ~4-5 bugs per island around the archipelago
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.4;
      for (const isl of ISLANDS) {
        const count = this.bugs.filter(b => b.islandId === isl.id).length;
        if (count < 5) {
          this._spawnBugOnIsland(isl, isNight, isRain, luckBonus);
        }
      }
    }

    for (let i = this.bugs.length - 1; i >= 0; i--) {
      const b = this.bugs[i];

      // Despawn gracefully if time/weather no longer matches and player isn't right next to it
      const distPlayer = Math.hypot(b.x - playerPos.x, b.z - playerPos.z);
      if ((!matchesTime(b.creature.time, isNight) || !matchesWeather(b.creature.weather, isRain)) && distPlayer > 18) {
        this.scene.remove(b.group);
        this.bugs.splice(i, 1);
        continue;
      }

      if (b.fleeing) {
        b.fleeTimer += dt;
        b.x += Math.sin(b.yaw) * 9.5 * dt;
        b.z += Math.cos(b.yaw) * 9.5 * dt;
        b.y += 4.5 * dt;
        b.group.position.set(b.x, b.y, b.z);
        if (b.wingL) {
          const fl = Math.sin(time * 28) * 0.75;
          b.wingL.rotation.z = fl;
          b.wingR.rotation.z = -fl;
        }
        if (b.fleeTimer > 1.4) {
          this.scene.remove(b.group);
          this.bugs.splice(i, 1);
        }
        continue;
      }

      // Check if player sprints right on top of a skittish bug
      const scareResist = (netLevel - 1) * 0.16;
      const effectiveSkittish = Math.max(0, b.creature.skittish - scareResist);
      if (effectiveSkittish > 0.18 && distPlayer < 2.1 && playerSpeedMag > 0.85) {
        if (Math.random() < effectiveSkittish * dt * 2.2) {
          b.fleeing = true;
          b.yaw = Math.atan2(b.x - playerPos.x, b.z - playerPos.z);
          continue;
        }
      }

      // Wander
      b.turnTimer -= dt;
      if (b.turnTimer <= 0) {
        b.yaw += (Math.random() - 0.5) * 1.9;
        b.turnTimer = 1.2 + Math.random() * 2.2;
      }

      const spd = b.creature.behavior === 'fly' ? 1.85 : 0.65;
      const nx = b.x + Math.sin(b.yaw) * spd * dt;
      const nz = b.z + Math.cos(b.yaw) * spd * dt;
      const nh = getTerrainHeight(nx, nz);

      if (nh > 0.65 && !getPondAt(nx, nz)) {
        b.x = nx;
        b.z = nz;
        b.y = b.creature.behavior === 'fly'
          ? nh + 1.15 + Math.sin(time * 4.5 + b.phase) * 0.25
          : nh;
      } else {
        b.yaw += Math.PI * 0.75;
      }

      b.group.position.set(b.x, b.y, b.z);
      b.group.rotation.y = b.yaw;

      if (b.wingL) {
        const fl = Math.sin(time * 16 + b.phase) * 0.65;
        b.wingL.rotation.z = fl;
        b.wingR.rotation.z = -fl;
      }
    }
  }
}
