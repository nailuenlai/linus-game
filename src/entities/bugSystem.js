import * as THREE from 'three';
import { ISLANDS, getTerrainHeight, getPondAt, getIslandEdgeRadius } from '../data/islands.js';
import {
  LAND_CREATURES,
  matchesTime,
  matchesWeather,
  isCreatureUnlocked,
  pickWeightedCreature,
  rollCreatureSize
} from '../data/creatures.js';
import { buildCreatureModel } from '../world/furnitureBuilder.js';

export class BugSystem {
  constructor(root, labelsContainer) {
    this.root = root;
    this.labelsContainer = labelsContainer;
    this.bugs = [];
    this.spawnTimer = 0;

    // 3D Net Aiming Reticle Ring on ground
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1.05, 24),
      new THREE.MeshBasicMaterial({
        color: 0xf7c948,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72
      })
    );
    this.reticle.rotation.x = -Math.PI / 2;
    this.reticle.visible = false;
    root.add(this.reticle);

    // Skill-based Timing Strike Mini-Game state
    this.timingActive = false;
    this.timingTarget = null;
    this.cursorPos = 0;
    this.cursorDir = 1;
    this.cursorSpeed = 1.6;
    this.zoneCenter = 0.5;
    this.zoneWidth = 0.24;
    this.timingElapsed = 0;
    this.timingMaxTime = 2.8;

    // Timing Mini-Game UI elements
    this.uiOverlay = document.getElementById('bug-catch-overlay');
    this.uiTitle = document.getElementById('bug-catch-title');
    this.uiZone = document.getElementById('bug-catch-zone');
    this.uiCursor = document.getElementById('bug-catch-cursor');
    this.uiTimerFill = document.getElementById('bug-catch-timer-fill');
  }

  isTimingActive() {
    return this.timingActive;
  }

  cancelTiming() {
    this.timingActive = false;
    this.timingTarget = null;
    if (this.uiOverlay) this.uiOverlay.classList.add('hidden');
  }

  hideAllLabels() {
    for (const b of this.bugs) {
      if (b.alertEl) b.alertEl.style.opacity = '0';
    }
    this.reticle.visible = false;
  }

  _spawnCreatureOnIsland(isl, isNight, isRain, luckBonus, catchCounts) {
    const candidates = LAND_CREATURES.filter(
      c =>
        c.islands.includes(isl.id) &&
        matchesTime(c.time, isNight) &&
        matchesWeather(c.weather, isRain) &&
        isCreatureUnlocked(c, catchCounts)
    );
    if (!candidates.length) return;

    const creature = pickWeightedCreature(candidates, luckBonus);
    for (let attempt = 0; attempt < 10; attempt++) {
      const ang = Math.random() * Math.PI * 2;
      const r = (0.18 + Math.random() * 0.65) * getIslandEdgeRadius(isl, ang);
      const x = isl.x + Math.cos(ang) * r;
      const z = isl.z + Math.sin(ang) * r;
      const h = getTerrainHeight(x, z);
      if (h > 0.72 && !getPondAt(x, z)) {
        const built = buildCreatureModel(creature);
        const y = creature.behavior === 'fly' ? h + 1.15 : h;
        built.group.position.set(x, y, z);
        this.root.add(built.group);

        const alertEl = document.createElement('div');
        alertEl.className = 'bug-alert-badge';
        alertEl.style.opacity = '0';
        this.labelsContainer.appendChild(alertEl);

        this.bugs.push({
          creature,
          islandId: isl.id,
          group: built.group,
          wingL: built.wingL,
          wingR: built.wingR,
          tailMesh: built.tailMesh,
          alertEl,
          x,
          y,
          z,
          yaw: Math.random() * Math.PI * 2,
          turnTimer: 1 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          alert: 0,
          fleeing: false,
          fleeTimer: 0
        });
        return;
      }
    }
  }

  _getAimPoint(playerX, playerZ, playerYaw, netLevel) {
    const reach = 2.0 + netLevel * 0.35;
    return {
      x: playerX + Math.sin(playerYaw) * reach,
      z: playerZ + Math.cos(playerYaw) * reach,
      hitRadius: 1.25 + netLevel * 0.24
    };
  }

  /**
   * Returns the creature currently locked inside the aimed net reticle (precision aiming required!).
   */
  getAimedTarget(playerX, playerZ, playerYaw, netLevel) {
    const aim = this._getAimPoint(playerX, playerZ, playerYaw, netLevel);
    let best = null;
    let bestD = aim.hitRadius;
    for (const b of this.bugs) {
      if (b.fleeing) continue;
      const d = Math.hypot(b.x - aim.x, b.z - aim.z);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    return best;
  }

  getNearestBug(x, z, maxDist = 4.2) {
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

  /**
   * Step 1 of skill-based catching: Swing net at aimed target -> starts timing strike bar!
   * If no target is inside the reticle, nearby creatures get spooked!
   */
  startNetSwing(playerX, playerZ, playerYaw, netLevel, audio) {
    const target = this.getAimedTarget(playerX, playerZ, playerYaw, netLevel);
    if (!target) {
      // Swinging wildly spooks nearby bugs/reptiles!
      let spookedAny = false;
      for (const b of this.bugs) {
        if (b.fleeing) continue;
        const d = Math.hypot(b.x - playerX, b.z - playerZ);
        if (d < 4.8) {
          b.alert = Math.min(1, b.alert + 0.55 + (b.creature.skittish || 0.3) * 0.55);
          if (b.alert >= 1) {
            this._triggerFlee(b, playerX, playerZ);
            spookedAny = true;
          }
        }
      }
      return { started: false, spookedAny };
    }

    // Start the Skill Timing Strike Mini-Game!
    const rarity = target.creature.rarity || 1;
    const skittish = target.creature.skittish || 0.3;

    this.timingActive = true;
    this.timingTarget = target;
    this.cursorPos = Math.random() < 0.5 ? 0.04 : 0.96;
    this.cursorDir = this.cursorPos < 0.5 ? 1 : -1;

    // Higher rarity = narrower sweet zone & faster needle; upgraded net helps!
    this.zoneWidth = Math.max(0.11, 0.31 - (rarity - 1) * 0.042 + (netLevel - 1) * 0.045);
    this.zoneCenter = 0.28 + Math.random() * 0.44;
    this.cursorSpeed = Math.max(1.05, 1.25 + (rarity - 1) * 0.36 + skittish * 0.32 - (netLevel - 1) * 0.22);
    this.timingElapsed = 0;
    this.timingMaxTime = Math.max(1.85, 3.1 - (rarity - 1) * 0.24 + (netLevel - 1) * 0.35);

    if (this.uiOverlay) {
      this.uiTitle.textContent = `${target.creature.icon} 鎖定「${target.creature.name}」！抓準綠區按揮網！`;
      this.uiZone.style.left = `${(this.zoneCenter - this.zoneWidth / 2) * 100}%`;
      this.uiZone.style.width = `${this.zoneWidth * 100}%`;
      this.uiCursor.style.left = `${this.cursorPos * 100}%`;
      this.uiTimerFill.style.width = '100%';
      this.uiOverlay.classList.remove('hidden');
    }
    audio.playNibble();
    return { started: true, target };
  }

  /**
   * Step 2 of skill-based catching: Player taps during timing bar!
   */
  resolveTimingStrike(playerX, playerZ, audio) {
    if (!this.timingActive || !this.timingTarget) return null;
    const target = this.timingTarget;
    const halfW = this.zoneWidth / 2;
    const hit = Math.abs(this.cursorPos - this.zoneCenter) <= halfW + 0.018;

    this.cancelTiming();

    if (hit) {
      const idx = this.bugs.indexOf(target);
      if (idx !== -1) {
        this._removeBugAt(idx);
      }
      const size = rollCreatureSize(target.creature);
      return { success: true, creature: target.creature, size };
    } else {
      this._triggerFlee(target, playerX, playerZ);
      audio.playFail();
      return {
        success: false,
        message: `💨 差一點！${target.creature.name}反應太快逃跑了！`
      };
    }
  }

  _triggerFlee(b, fromX, fromZ) {
    b.fleeing = true;
    b.fleeTimer = 0;
    b.yaw = Math.atan2(b.x - fromX, b.z - fromZ);
    if (b.alertEl) {
      b.alertEl.textContent = '💨';
      b.alertEl.className = 'bug-alert-badge danger';
    }
  }

  _removeBugAt(idx) {
    const b = this.bugs[idx];
    this.root.remove(b.group);
    if (b.alertEl && b.alertEl.parentNode) {
      b.alertEl.parentNode.removeChild(b.alertEl);
    }
    this.bugs.splice(idx, 1);
  }

  update(
    dt,
    time,
    camera,
    playerPos,
    playerSpeedMag,
    isSneaking,
    isHoldingNet,
    inBoat,
    isNight,
    isRain,
    netLevel,
    luckBonus,
    catchCounts,
    audio,
    onEscaped,
    hideLabels = false
  ) {
    // 1. Update Timing Strike Mini-Game if active
    if (this.timingActive) {
      this.timingElapsed += dt;
      this.cursorPos += this.cursorDir * this.cursorSpeed * dt;
      if (this.cursorPos >= 0.98) {
        this.cursorPos = 0.98;
        this.cursorDir = -1;
      } else if (this.cursorPos <= 0.02) {
        this.cursorPos = 0.02;
        this.cursorDir = 1;
      }

      if (this.uiCursor) this.uiCursor.style.left = `${this.cursorPos * 100}%`;
      if (this.uiTimerFill) {
        const leftPct = Math.max(0, 1 - this.timingElapsed / this.timingMaxTime) * 100;
        this.uiTimerFill.style.width = `${leftPct}%`;
      }

      if (this.timingElapsed >= this.timingMaxTime) {
        const escapedTarget = this.timingTarget;
        this.cancelTiming();
        if (escapedTarget) {
          this._triggerFlee(escapedTarget, playerPos.x, playerPos.z);
          audio.playFail();
          if (onEscaped) onEscaped(`⏰ 猶豫太久，${escapedTarget.creature.name}溜走了！`);
        }
      }
    }

    // 2. Update 3D Ground Aiming Reticle when holding Net on land
    if (isHoldingNet && !inBoat && !hideLabels && !this.timingActive) {
      const aim = this._getAimPoint(playerPos.x, playerPos.z, playerPos.yaw, netLevel);
      const ah = getTerrainHeight(aim.x, aim.z);
      if (ah > 0.2) {
        this.reticle.visible = true;
        this.reticle.position.set(aim.x, ah + 0.08, aim.z);
        const locked = this.getAimedTarget(playerPos.x, playerPos.z, playerPos.yaw, netLevel);
        this.reticle.material.color.setHex(locked ? 0x4ade80 : isSneaking ? 0x60a5fa : 0xf7c948);
        const rScale = (aim.hitRadius / 1.0) * (locked ? 1.0 + Math.sin(time * 10) * 0.06 : 1.0);
        this.reticle.scale.set(rScale, rScale, 1);
      } else {
        this.reticle.visible = false;
      }
    } else {
      this.reticle.visible = false;
    }

    // 3. Maintain ~5-6 bugs & reptiles per island
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.5;
      for (const isl of ISLANDS) {
        const count = this.bugs.filter(b => b.islandId === isl.id).length;
        if (count < 6) {
          this._spawnCreatureOnIsland(isl, isNight, isRain, luckBonus, catchCounts);
        }
      }
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const tmpV = new THREE.Vector3();

    for (let i = this.bugs.length - 1; i >= 0; i--) {
      const b = this.bugs[i];
      const distPlayer = Math.hypot(b.x - playerPos.x, b.z - playerPos.z);

      // Despawn stale creatures when time/weather changed far away
      if (
        b !== this.timingTarget &&
        (!matchesTime(b.creature.time, isNight) || !matchesWeather(b.creature.weather, isRain)) &&
        distPlayer > 18
      ) {
        this._removeBugAt(i);
        continue;
      }

      if (b.fleeing) {
        b.fleeTimer += dt;
        const fleeSpd = b.creature.behavior === 'fly' ? 10.5 : 8.5;
        b.x += Math.sin(b.yaw) * fleeSpd * dt;
        b.z += Math.cos(b.yaw) * fleeSpd * dt;
        if (b.creature.behavior === 'fly') {
          b.y += 4.5 * dt;
        } else {
          const fh = getTerrainHeight(b.x, b.z);
          b.y = Math.max(0.2, fh) + Math.abs(Math.sin(time * 20)) * 0.18;
        }
        b.group.position.set(b.x, b.y, b.z);
        b.group.rotation.y = b.yaw;
        if (b.wingL) {
          const fl = Math.sin(time * 28) * 0.75;
          b.wingL.rotation.z = fl;
          b.wingR.rotation.z = -fl;
        }
        if (b.fleeTimer > 1.25) {
          this._removeBugAt(i);
        }
        continue;
      }

      // Freeze targeted creature during timing bar
      if (b === this.timingTarget) {
        b.group.position.set(b.x, b.y + Math.sin(time * 26) * 0.03, b.z);
        if (b.alertEl) b.alertEl.style.opacity = '0';
        continue;
      }

      // === Stealth & Awareness Mechanic ===
      const skittish = b.creature.skittish || 0.25;
      const netStealth = (netLevel - 1) * 0.14;
      const noticeDist = Math.max(2.6, 3.0 + skittish * 4.8 - netStealth * 3.0);

      if (!inBoat && distPlayer < noticeDist) {
        const prox = 1 - distPlayer / noticeDist; // 0..1
        const runningFast = !isSneaking && playerSpeedMag > 0.42;
        if (runningFast) {
          // Running near skittish beetles/reptiles spikes alert fast!
          b.alert += dt * (0.48 + skittish * 1.65) * (0.45 + prox * 1.35) * (1 - netStealth * 0.55);
        } else if (distPlayer < 1.35 && skittish > 0.45) {
          // Stepping directly onto a super rare beetle still spooks it slowly
          b.alert += dt * skittish * 0.55;
        } else if (isSneaking) {
          // Sneaking keeps calm / slowly reduces alert
          b.alert = Math.max(0, b.alert - dt * 0.35);
        } else {
          // Standing still slowly calms down
          b.alert = Math.max(0, b.alert - dt * 0.25);
        }
      } else {
        b.alert = Math.max(0, b.alert - dt * 0.45);
      }

      if (b.alert >= 1.0) {
        this._triggerFlee(b, playerPos.x, playerPos.z);
        if (distPlayer < 10 && onEscaped) {
          onEscaped(`💨 腳步聲太大，嚇跑了${b.creature.name}！試著按「潛行」悄悄靠近！`);
        }
        continue;
      }

      // Update floating alert indicator (`👀` or `❗`)
      if (b.alertEl) {
        if (!hideLabels && b.alert > 0.22 && distPlayer < 24) {
          tmpV.set(b.x, b.y + 0.95, b.z).project(camera);
          if (tmpV.z <= 1) {
            b.alertEl.style.left = `${(tmpV.x * 0.5 + 0.5) * w}px`;
            b.alertEl.style.top = `${(-tmpV.y * 0.5 + 0.5) * h}px`;
            b.alertEl.style.opacity = '1';
            if (b.alert > 0.65) {
              b.alertEl.textContent = '❗';
              b.alertEl.className = 'bug-alert-badge danger';
            } else {
              b.alertEl.textContent = '👀';
              b.alertEl.className = 'bug-alert-badge warn';
            }
          } else {
            b.alertEl.style.opacity = '0';
          }
        } else {
          b.alertEl.style.opacity = '0';
        }
      }

      // Wander movement
      b.turnTimer -= dt;
      if (b.turnTimer <= 0) {
        b.yaw += (Math.random() - 0.5) * 2.0;
        b.turnTimer = 1.1 + Math.random() * 2.2;
      }

      let spd = b.creature.behavior === 'fly' ? 2.05 : 0.68;
      if (b.creature.type === 'reptile') {
        spd = b.creature.modelType === 'tortoise' ? 0.35 : b.creature.modelType === 'snake' ? 0.45 : 1.05;
      }
      // Pause attentively if alert > 0.35
      if (b.alert > 0.35 && b.creature.behavior !== 'fly') spd *= 0.2;

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
      if (b.tailMesh) {
        b.tailMesh.rotation.y = Math.sin(time * 5 + b.phase) * 0.22;
      }
    }
  }
}
