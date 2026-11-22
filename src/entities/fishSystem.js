import * as THREE from 'three';
import { ISLANDS, getTerrainHeight, getPondAt, getIslandAt, getIslandEdgeRadius, WATER_LEVEL } from '../data/islands.js';
import { FISH_LIST, matchesTime, matchesWeather, pickWeightedCreature, rollCreatureSize } from '../data/creatures.js';

export class FishSystem {
  constructor(scene, labelsContainer) {
    this.scene = scene;
    this.labelsContainer = labelsContainer;

    this.shadows = [];
    this.spawnTimer = 0;

    // Fishing state machine: 'idle' | 'waiting' | 'biting' | 'reeling'
    this.state = 'idle';
    this.targetFish = null;
    this.bobberPos = new THREE.Vector3();
    this.nibbleCount = 0;
    this.maxNibbles = 2;
    this.stateTimer = 0;

    // Reeling mini-game state
    this.reelProgress = 0.25;
    this.sweetCenter = 0.5;
    this.sweetWidth = 0.3;
    this.fishPos = 0.5;
    this.fishVel = 0;
    this.fishTargetTimer = 0;
    this.fishDesired = 0.5;

    // 3D Bobber + Ripple + Line
    this.bobberGroup = this._createBobber();
    this.bobberGroup.visible = false;
    scene.add(this.bobberGroup);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3()
    ]);
    this.line = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0xf4f8fa, transparent: true, opacity: 0.85 })
    );
    this.line.visible = false;
    scene.add(this.line);

    this.ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.52, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    this.ripple.rotation.x = -Math.PI / 2;
    this.ripple.visible = false;
    scene.add(this.ripple);
    this.rippleAnim = 0;

    // Bite '!' world alert element
    this.biteEl = document.createElement('div');
    this.biteEl.className = 'bite-alert hidden';
    this.biteEl.textContent = '!';
    labelsContainer.appendChild(this.biteEl);

    // Fishing UI elements
    this.uiOverlay = document.getElementById('fishing-overlay');
    this.uiSweet = document.getElementById('fishing-sweet-zone');
    this.uiMarker = document.getElementById('fishing-fish-marker');
    this.uiFill = document.getElementById('fishing-progress-fill');
    this.uiStatus = document.getElementById('fishing-status-text');
  }

  _createBobber() {
    const g = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xe63946, flatShading: true })
    );
    const bot = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true })
    );
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.28, 5),
      new THREE.MeshStandardMaterial({ color: 0xffe066 })
    );
    pin.position.y = 0.22;
    g.add(top, bot, pin);
    return g;
  }

  _createShadowMesh(creature) {
    const size = creature?.shadowSize || 1;
    const isRare = (creature?.rarity || 1) >= 4;
    const id = creature?.id || '';
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({
      color: isRare ? 0x103c52 : 0x0b2a38,
      transparent: true,
      opacity: 0.62
    });

    if (id === 'manta_ray') {
      const diamond = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.95, 4), mat);
      diamond.rotation.x = Math.PI / 2;
      diamond.scale.set(1.45, 1, 0.14);
      const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.9, 4), mat);
      whip.rotation.x = Math.PI / 2;
      whip.position.z = -0.82;
      g.add(diamond, whip);
    } else if (id === 'moray_eel' || id === 'oarfish' || id === 'arowana' || id === 'arapaima') {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 5), mat);
      body.scale.set(0.45, 0.14, 2.65);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.68, 4), mat);
      tail.rotation.x = Math.PI / 2;
      tail.scale.set(0.6, 1, 0.18);
      tail.position.z = -1.05;
      g.add(body, tail);
    } else if (id === 'crystal_jelly' || id === 'squid') {
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 5), mat);
      bell.scale.set(0.85, 0.16, 1.05);
      bell.position.z = 0.25;
      g.add(bell);
      for (const sx of [-0.18, 0, 0.18]) {
        const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.72, 4), mat);
        tent.rotation.x = Math.PI / 2;
        tent.position.set(sx, 0, -0.42);
        g.add(tent);
      }
    } else if (id === 'pufferfish') {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), mat);
      body.scale.set(0.95, 0.16, 1.02);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 4), mat);
      tail.rotation.x = Math.PI / 2;
      tail.scale.set(0.8, 1, 0.2);
      tail.position.z = -0.62;
      g.add(body, tail);
    } else if (id === 'sea_angel') {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 5), mat);
      body.scale.set(0.55, 0.14, 1.3);
      const wings = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 5), mat);
      wings.scale.set(1.5, 0.1, 0.55);
      wings.position.z = 0.05;
      g.add(body, wings);
    } else {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 7, 5), mat);
      body.scale.set(0.62, 0.14, 1.55);
      g.add(body);

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 4), mat);
      tail.rotation.x = Math.PI / 2;
      tail.scale.set(0.9, 1, 0.2);
      tail.position.z = -0.82;
      g.add(tail);

      // Iconic dorsal fin peeking near surface for whale shark, ocean sunfish & blue marlin!
      if (id === 'whale_shark' || id === 'ocean_sunfish' || id === 'blue_marlin') {
        const fin = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), mat);
        fin.scale.set(0.28, 1, 1.15);
        fin.position.set(0, 0.2, 0.02);
        fin.rotation.x = -0.28;
        g.add(fin);
      }
    }

    if (isRare) {
      const sparkle = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.82, 16),
        new THREE.MeshBasicMaterial({ color: 0xffe66d, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      );
      sparkle.rotation.x = -Math.PI / 2;
      sparkle.position.y = 0.06;
      g.add(sparkle);
    }

    g.scale.setScalar(size);
    return g;
  }

  _spawnShadowNear(x, z, waterType, islandId, isNight, isRain, luckBonus) {
    const candidates = FISH_LIST.filter(
      f =>
        f.waterType === waterType &&
        f.islands.includes(islandId) &&
        matchesTime(f.time, isNight) &&
        matchesWeather(f.weather, isRain)
    );
    if (!candidates.length) return;
    const creature = pickWeightedCreature(candidates, luckBonus);
    const mesh = this._createShadowMesh(creature);
    mesh.position.set(x, WATER_LEVEL - 0.08, z);
    this.scene.add(mesh);

    this.shadows.push({
      creature,
      waterType,
      islandId,
      mesh,
      x,
      z,
      yaw: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      turnTimer: 1 + Math.random() * 2.5,
      homeX: x,
      homeZ: z
    });
  }

  /**
   * Finds a water spot right in front of the player (or boat) suitable for casting.
   */
  findCastSpot(originX, originZ, yaw, inBoat) {
    const distances = inBoat ? [5.2, 6.8, 4.0] : [5.5, 7.2, 4.2, 8.8];
    for (const d of distances) {
      const cx = originX + Math.sin(yaw) * d;
      const cz = originZ + Math.cos(yaw) * d;
      const pond = getPondAt(cx, cz);
      if (pond) {
        return { x: cx, z: cz, waterType: 'pond', islandId: pond.island.id };
      }
      if (getTerrainHeight(cx, cz) < -0.18) {
        const isl = getIslandAt(cx, cz, 16);
        return { x: cx, z: cz, waterType: 'sea', islandId: isl ? isl.id : 'ocean' };
      }
    }
    return null;
  }

  isActive() {
    return this.state !== 'idle';
  }

  startCast(spot, isNight, isRain, rodLevel, luckBonus, audio) {
    this.bobberPos.set(spot.x, WATER_LEVEL + 0.04, spot.z);
    this.bobberGroup.position.copy(this.bobberPos);
    this.bobberGroup.visible = true;
    this.line.visible = true;
    this._triggerRipple();
    audio.playSplash();

    // Find nearest existing fish shadow near bobber, or spawn one gracefully so fishing always feels rewarding!
    let best = null;
    let bestD = 12;
    for (const sh of this.shadows) {
      if (sh.waterType !== spot.waterType) continue;
      const d = Math.hypot(sh.x - spot.x, sh.z - spot.z);
      if (d < bestD) {
        bestD = d;
        best = sh;
      }
    }

    if (!best) {
      const ang = Math.random() * Math.PI * 2;
      const sx = spot.x + Math.cos(ang) * 3.8;
      const sz = spot.z + Math.sin(ang) * 3.8;
      this._spawnShadowNear(sx, sz, spot.waterType, spot.islandId, isNight, isRain, luckBonus + (rodLevel - 1) * 0.35);
      best = this.shadows[this.shadows.length - 1] || null;
    }

    this.targetFish = best;
    this.state = 'waiting';
    this.nibbleCount = 0;
    this.maxNibbles = 1 + Math.floor(Math.random() * 2);
    this.stateTimer = 1.4 + Math.random() * 1.1;
    this.biteEl.classList.add('hidden');
  }

  onActionPress(rodLevel, audio) {
    if (this.state === 'waiting') {
      // Pulled up too early -> cancel gently
      this.cancel();
      audio.playSplash();
      return { event: 'cancelled' };
    }
    if (this.state === 'biting') {
      // Hooked! Start reeling mini-game!
      this.state = 'reeling';
      this.biteEl.classList.add('hidden');
      this.uiOverlay.classList.remove('hidden');

      const rarity = this.targetFish?.creature?.rarity || 1;
      // Sweet zone size scales generously with rodLevel
      this.sweetWidth = Math.min(0.46, 0.25 + (rodLevel - 1) * 0.08 - (rarity - 1) * 0.02);
      this.sweetCenter = 0.5;
      this.fishPos = 0.5;
      this.fishVel = 0;
      this.fishDesired = 0.5;
      this.fishTargetTimer = 0.6;
      this.reelProgress = 0.3;

      this.uiStatus.textContent = `🎣 上鉤了！按住按鈕讓魚保持在綠區內！`;
      audio.playSplash();
      return { event: 'hooked' };
    }
    return null;
  }

  cancel() {
    this.state = 'idle';
    this.targetFish = null;
    this.bobberGroup.visible = false;
    this.line.visible = false;
    this.ripple.visible = false;
    this.biteEl.classList.add('hidden');
    this.uiOverlay.classList.add('hidden');
  }

  _triggerRipple() {
    this.ripple.position.set(this.bobberPos.x, WATER_LEVEL + 0.06, this.bobberPos.z);
    this.ripple.visible = true;
    this.rippleAnim = 0.01;
  }

  update(dt, time, camera, playerPos, rodTipPos, isHoldingAction, rodLevel, isNight, isRain, luckBonus, audio, onCaught, onEscaped) {
    // 1. Spawn ambient fish shadows around islands & ponds
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.shadows.length < 36) {
      this.spawnTimer = 1.6;
      for (const isl of ISLANDS) {
        // Sea fish around island coastline
        const seaCount = this.shadows.filter(s => s.islandId === isl.id && s.waterType === 'sea').length;
        if (seaCount < 3) {
          const a = Math.random() * Math.PI * 2;
          const r = getIslandEdgeRadius(isl, a) + 4.5 + Math.random() * 5.5;
          const sx = isl.x + Math.cos(a) * r;
          const sz = isl.z + Math.sin(a) * r;
          if (getTerrainHeight(sx, sz) < -0.25) {
            this._spawnShadowNear(sx, sz, 'sea', isl.id, isNight, isRain, luckBonus);
          }
        }
        // Pond fish
        if (isl.pond) {
          const pondCount = this.shadows.filter(s => s.islandId === isl.id && s.waterType === 'pond').length;
          if (pondCount < 2) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * (isl.pond.radius * 0.65);
            this._spawnShadowNear(
              isl.pond.x + Math.cos(a) * r,
              isl.pond.z + Math.sin(a) * r,
              'pond',
              isl.id,
              isNight,
              isRain,
              luckBonus
            );
          }
        }
      }
    }

    // 2. Update fish shadow swimming
    for (let i = this.shadows.length - 1; i >= 0; i--) {
      const sh = this.shadows[i];
      if (sh === this.targetFish && this.state !== 'idle') {
        // Target fish swims toward bobber
        const dx = this.bobberPos.x - sh.x;
        const dz = this.bobberPos.z - sh.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.75) {
          sh.yaw = Math.atan2(dx, dz);
          sh.x += (dx / dist) * 2.4 * dt;
          sh.z += (dz / dist) * 2.4 * dt;
        }
        sh.mesh.position.set(sh.x, WATER_LEVEL - 0.08, sh.z);
        sh.mesh.rotation.y = sh.yaw + Math.sin(time * 8) * 0.12;
        continue;
      }

      // Ambient wandering
      sh.turnTimer -= dt;
      if (sh.turnTimer <= 0) {
        const toHome = Math.atan2(sh.homeX - sh.x, sh.homeZ - sh.z);
        sh.yaw = Math.hypot(sh.homeX - sh.x, sh.homeZ - sh.z) > 5
          ? toHome
          : sh.yaw + (Math.random() - 0.5) * 1.4;
        sh.turnTimer = 1.5 + Math.random() * 2.5;
      }
      const nx = sh.x + Math.sin(sh.yaw) * 1.05 * dt;
      const nz = sh.z + Math.cos(sh.yaw) * 1.05 * dt;
      const valid = sh.waterType === 'pond' ? Boolean(getPondAt(nx, nz)) : getTerrainHeight(nx, nz) < -0.22;
      if (valid) {
        sh.x = nx;
        sh.z = nz;
      } else {
        sh.yaw += Math.PI * 0.8;
      }
      sh.mesh.position.set(sh.x, WATER_LEVEL - 0.08, sh.z);
      sh.mesh.rotation.y = sh.yaw + Math.sin(time * 5 + sh.phase) * 0.1;

      // Refresh stale shadows when weather/time changed far away
      if (
        (!matchesTime(sh.creature.time, isNight) || !matchesWeather(sh.creature.weather, isRain)) &&
        Math.hypot(sh.x - playerPos.x, sh.z - playerPos.z) > 22
      ) {
        this.scene.remove(sh.mesh);
        this.shadows.splice(i, 1);
      }
    }

    // 3. Ripple animation
    if (this.rippleAnim > 0) {
      this.rippleAnim += dt * 1.8;
      if (this.rippleAnim >= 1) {
        this.rippleAnim = 0;
        this.ripple.visible = false;
      } else {
        const s = 0.6 + this.rippleAnim * 2.8;
        this.ripple.scale.set(s, s, 1);
        this.ripple.material.opacity = (1 - this.rippleAnim) * 0.72;
      }
    }

    if (this.state === 'idle') return;

    // 4. Update fishing line from rod tip to bobber
    const linePos = this.line.geometry.attributes.position;
    linePos.setXYZ(0, rodTipPos.x, rodTipPos.y, rodTipPos.z);
    linePos.setXYZ(1, this.bobberGroup.position.x, this.bobberGroup.position.y + 0.18, this.bobberGroup.position.z);
    linePos.needsUpdate = true;

    // 5. State machine progression
    if (this.state === 'waiting') {
      this.bobberGroup.position.y = WATER_LEVEL + 0.04 + Math.sin(time * 3.5) * 0.05;
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.nibbleCount < this.maxNibbles) {
          this.nibbleCount++;
          this.bobberGroup.position.y = WATER_LEVEL - 0.12;
          this._triggerRipple();
          audio.playNibble();
          this.stateTimer = 0.9 + Math.random() * 1.1;
        } else {
          // BITE!
          this.state = 'biting';
          this.stateTimer = 1.65 + (rodLevel - 1) * 0.25; // generous window to tap!
          this._triggerRipple();
          audio.playBite();
          this.biteEl.classList.remove('hidden');
        }
      }
    } else if (this.state === 'biting') {
      this.bobberGroup.position.y = WATER_LEVEL - 0.18 + Math.sin(time * 26) * 0.06;
      // Project '!' alert over bobber
      const proj = this.bobberGroup.position.clone().add(new THREE.Vector3(0, 1.35, 0)).project(camera);
      this.biteEl.style.left = `${(proj.x * 0.5 + 0.5) * window.innerWidth}px`;
      this.biteEl.style.top = `${(-proj.y * 0.5 + 0.5) * window.innerHeight}px`;

      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this._removeTargetShadow();
        this.cancel();
        audio.playFail();
        onEscaped('魚兒溜走了！看到「！」時要趕快按收線喔～');
      }
    } else if (this.state === 'reeling') {
      this.bobberGroup.position.y = WATER_LEVEL - 0.1 + Math.sin(time * 22) * 0.09;
      if (Math.random() < dt * 2.2) this._triggerRipple();

      // Sweet zone moves right when holding action, gently drifts left when released (classic Stardew-feel horizontal bar!)
      const ctrlSpeed = 0.85 + (rodLevel - 1) * 0.14;
      const halfW = this.sweetWidth / 2;
      if (isHoldingAction) {
        this.sweetCenter = Math.min(1 - halfW, this.sweetCenter + ctrlSpeed * dt);
      } else {
        this.sweetCenter = Math.max(halfW, this.sweetCenter - ctrlSpeed * 0.78 * dt);
      }

      // Fish swims unpredictably depending on rarity
      const rarity = this.targetFish?.creature?.rarity || 1;
      this.fishTargetTimer -= dt;
      if (this.fishTargetTimer <= 0) {
        this.fishDesired = 0.1 + Math.random() * 0.8;
        this.fishTargetTimer = Math.max(0.45, 1.3 - rarity * 0.14) + Math.random() * 0.55;
      }
      const fishSpeed = 0.42 + rarity * 0.11;
      const diff = this.fishDesired - this.fishPos;
      this.fishVel += Math.sign(diff) * fishSpeed * 2.2 * dt;
      this.fishVel *= 0.92;
      this.fishPos = Math.max(0.06, Math.min(0.94, this.fishPos + this.fishVel * dt));

      const inZone = Math.abs(this.fishPos - this.sweetCenter) <= halfW + 0.035;
      const fillRate = 0.34 + (rodLevel - 1) * 0.06;
      const drainRate = 0.17 + (rarity - 1) * 0.025;
      this.reelProgress = Math.max(0, Math.min(1, this.reelProgress + (inZone ? fillRate : -drainRate) * dt));

      // Update UI bar
      this.uiSweet.style.left = `${(this.sweetCenter - halfW) * 100}%`;
      this.uiSweet.style.width = `${this.sweetWidth * 100}%`;
      this.uiMarker.style.left = `${this.fishPos * 100}%`;
      this.uiFill.style.width = `${this.reelProgress * 100}%`;

      if (this.reelProgress >= 1) {
        const caughtCreature = this.targetFish.creature;
        this._removeTargetShadow();
        this.cancel();
        const size = rollCreatureSize(caughtCreature);
        onCaught({ creature: caughtCreature, size });
      } else if (this.reelProgress <= 0) {
        this._removeTargetShadow();
        this.cancel();
        audio.playFail();
        onEscaped('魚線鬆脫了！下次保持讓魚在綠區裡再試一次！');
      }
    }
  }

  _removeTargetShadow() {
    if (!this.targetFish) return;
    const idx = this.shadows.indexOf(this.targetFish);
    if (idx !== -1) {
      this.scene.remove(this.targetFish.mesh);
      this.shadows.splice(idx, 1);
    }
    this.targetFish = null;
  }
}
