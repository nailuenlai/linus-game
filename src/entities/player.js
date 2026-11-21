import * as THREE from 'three';
import { getTerrainHeight, getPondAt, isPointOnAnyDock } from '../data/islands.js';
import { COSMETIC_MAP } from '../data/shopItems.js';

export class PlayerEntity {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.x = 0;
    this.z = 11;
    this.y = getTerrainHeight(this.x, this.z);
    this.yaw = 0;
    this.speed = 9.2;
    this.walkPhase = 0;
    this.stepCooldown = 0;
    this.inBoat = false;

    this.tool = 'hand'; // 'hand' | 'rod' | 'net'
    this.rodLevel = 1;
    this.netLevel = 1;
    this.swingAnim = 0; // >0 while swinging bug net

    this._buildMesh();
    this.group.position.set(this.x, this.y, this.z);
    scene.add(this.group);
  }

  _buildMesh() {
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    this.shirtMat = new THREE.MeshStandardMaterial({ color: 0xe76f51, flatShading: true });
    this.pantsMat = new THREE.MeshStandardMaterial({ color: 0x3b5978, flatShading: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbb5, flatShading: true });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x4d3422, flatShading: true });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x221a15 });
    const blushMat = new THREE.MeshStandardMaterial({ color: 0xf4978e });
    const packMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, flatShading: true });

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.52, 6);
    this.legL = new THREE.Mesh(legGeo, this.pantsMat);
    this.legL.position.set(-0.18, 0.28, 0);
    this.legL.castShadow = true;
    this.legR = new THREE.Mesh(legGeo, this.pantsMat);
    this.legR.position.set(0.18, 0.28, 0);
    this.legR.castShadow = true;
    this.bodyGroup.add(this.legL, this.legR);

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.72, 7), this.shirtMat);
    torso.position.y = 0.85;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Cute Backpack
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.28), packMat);
    pack.position.set(0, 0.88, -0.34);
    pack.castShadow = true;
    this.bodyGroup.add(pack);

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 1.52;
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Hair cap
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 8, 7, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hair.position.y = 0.04;
    hair.rotation.x = -0.15;
    this.headGroup.add(hair);

    // Eyes & rosy cheeks
    const eyeGeo = new THREE.SphereGeometry(0.055, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.15, 0.02, 0.38);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.15, 0.02, 0.38);
    const blushGeo = new THREE.SphereGeometry(0.05, 5, 5);
    const bL = new THREE.Mesh(blushGeo, blushMat);
    bL.position.set(-0.24, -0.07, 0.34);
    const bR = new THREE.Mesh(blushGeo, blushMat);
    bR.position.set(0.24, -0.07, 0.34);
    this.headGroup.add(eyeL, eyeR, bL, bR);

    // Hat Anchor
    this.hatAnchor = new THREE.Group();
    this.hatAnchor.position.y = 0.34;
    this.headGroup.add(this.hatAnchor);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.52, 6);
    this.armL = new THREE.Group();
    this.armL.position.set(-0.42, 1.05, 0);
    const armLMesh = new THREE.Mesh(armGeo, this.shirtMat);
    armLMesh.position.y = -0.2;
    armLMesh.castShadow = true;
    this.armL.add(armLMesh);

    this.armR = new THREE.Group();
    this.armR.position.set(0.42, 1.05, 0);
    const armRMesh = new THREE.Mesh(armGeo, this.shirtMat);
    armRMesh.position.y = -0.2;
    armRMesh.castShadow = true;
    this.armR.add(armRMesh);
    this.bodyGroup.add(this.armL, this.armR);

    // Tool Anchor on Right Arm
    this.toolAnchor = new THREE.Group();
    this.toolAnchor.position.set(0, -0.4, 0.18);
    this.armR.add(this.toolAnchor);

    this._rebuildToolMesh();
  }

  applyCosmetics(hatId, outfitId) {
    const outfit = COSMETIC_MAP[outfitId];
    if (outfit && outfit.shirtColor) {
      this.shirtMat.color.setHex(outfit.shirtColor);
      this.pantsMat.color.setHex(outfit.pantsColor);
    }

    // Clear old hat
    while (this.hatAnchor.children.length) {
      this.hatAnchor.remove(this.hatAnchor.children[0]);
    }
    const hat = COSMETIC_MAP[hatId];
    if (!hat || hatId === 'hat_none') return;

    const mainMat = new THREE.MeshStandardMaterial({ color: hat.color, flatShading: true });
    const ribMat = new THREE.MeshStandardMaterial({ color: hat.ribbon, flatShading: true });

    if (hatId === 'hat_straw' || hatId === 'hat_explorer') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.08, 10), mainMat);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.34, 9), mainMat);
      crown.position.y = 0.18;
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.43, 0.09, 9), ribMat);
      ribbon.position.y = 0.08;
      this.hatAnchor.add(brim, crown, ribbon);
    } else if (hatId === 'hat_sailor') {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.24, 10), mainMat);
      cap.position.y = 0.12;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.09, 10), ribMat);
      band.position.y = 0.03;
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.32), ribMat);
      visor.position.set(0, 0.02, 0.36);
      this.hatAnchor.add(cap, band, visor);
    } else if (hatId === 'hat_sakura') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 6, 12), ribMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.04;
      this.hatAnchor.add(ring);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), mainMat);
        fl.position.set(Math.cos(a) * 0.39, 0.1, Math.sin(a) * 0.39);
        this.hatAnchor.add(fl);
      }
    } else if (hatId === 'hat_starlight') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.68, 0.07, 10), mainMat);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 8), mainMat);
      cone.position.y = 0.45;
      cone.rotation.z = -0.14;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 8), ribMat);
      band.position.y = 0.08;
      this.hatAnchor.add(brim, cone, band);
    }
  }

  setTool(tool, rodLevel = this.rodLevel, netLevel = this.netLevel) {
    this.tool = tool;
    this.rodLevel = rodLevel;
    this.netLevel = netLevel;
    this._rebuildToolMesh();
  }

  _rebuildToolMesh() {
    while (this.toolAnchor.children.length) {
      this.toolAnchor.remove(this.toolAnchor.children[0]);
    }
    if (this.tool === 'rod') {
      const colors = [0x9c6644, 0x7cb342, 0xf4c430];
      const rodMat = new THREE.MeshStandardMaterial({
        color: colors[Math.min(2, this.rodLevel - 1)],
        flatShading: true
      });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 2.35, 6), rodMat);
      pole.rotation.x = Math.PI * 0.32;
      pole.position.set(0, 0.5, 0.95);
      this.toolAnchor.add(pole);
    } else if (this.tool === 'net') {
      const colors = [0x9c6644, 0x4ea8de, 0xf4c430];
      const handleMat = new THREE.MeshStandardMaterial({
        color: colors[Math.min(2, this.netLevel - 1)],
        flatShading: true
      });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.55, 6), handleMat);
      handle.rotation.x = Math.PI * 0.34;
      handle.position.set(0, 0.32, 0.65);

      const hoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.045, 6, 12),
        handleMat
      );
      hoop.position.set(0, 0.72, 1.48);
      hoop.rotation.x = Math.PI * 0.2;

      const meshBag = new THREE.Mesh(
        new THREE.ConeGeometry(0.37, 0.68, 8, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        })
      );
      meshBag.position.set(0, 0.56, 1.65);
      meshBag.rotation.x = -Math.PI * 0.3;
      this.toolAnchor.add(handle, hoop, meshBag);
    }
  }

  triggerNetSwing() {
    this.swingAnim = 0.32;
  }

  getRodTipWorldPosition() {
    const localTip = new THREE.Vector3(0.42, 1.75, 2.15);
    return localTip.applyMatrix4(this.group.matrixWorld);
  }

  update(dt, moveVec, obstacles, audio, locked = false, isSneaking = false, roomBounds = null) {
    if (this.inBoat) {
      this.legL.rotation.x = -1.2;
      this.legR.rotation.x = -1.2;
      this.armL.rotation.x = -0.35;
      this.armR.rotation.x = this.tool === 'rod' ? -0.45 : -0.35;
      return;
    }

    const activeSpeed = isSneaking ? this.speed * 0.36 : this.speed;
    let moving = false;
    if (!locked && moveVec.mag > 0.08) {
      moving = true;
      const dx = moveVec.x * activeSpeed * dt;
      const dz = moveVec.z * activeSpeed * dt;

      let nx = this.x + dx;
      let nz = this.z + dz;

      // Resolve obstacle collisions softly
      for (const obs of obstacles) {
        const odx = nx - obs.x;
        const odz = nz - obs.z;
        const dist = Math.hypot(odx, odz);
        const minR = obs.r + 0.52;
        if (dist < minR && dist > 0.001) {
          const push = (minR - dist) / dist;
          nx += odx * push;
          nz += odz * push;
        }
      }

      if (roomBounds) {
        // Indoor clamping
        this.x = Math.max(roomBounds.minX, Math.min(roomBounds.maxX, nx));
        this.z = Math.max(roomBounds.minZ, Math.min(roomBounds.maxZ, nz));
      } else {
        // Keep player out of deep water & ponds (can walk on wet sand & any island dock)
        const h = getTerrainHeight(nx, nz);
        const inPond = getPondAt(nx, nz);
        const onPier = this._isOnAnyPier(nx, nz);
        if ((h > 0.14 && !inPond) || onPier) {
          this.x = nx;
          this.z = nz;
        } else {
          const hx = getTerrainHeight(nx, this.z);
          if ((hx > 0.14 && !getPondAt(nx, this.z)) || this._isOnAnyPier(nx, this.z)) {
            this.x = nx;
          }
          const hz = getTerrainHeight(this.x, nz);
          if ((hz > 0.14 && !getPondAt(this.x, nz)) || this._isOnAnyPier(this.x, nz)) {
            this.z = nz;
          }
        }
      }

      const targetYaw = Math.atan2(moveVec.x, moveVec.z);
      let diff = targetYaw - this.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.yaw += diff * Math.min(1, dt * 13);

      this.walkPhase += dt * (isSneaking ? 6.5 : 11) * moveVec.mag;
      this.stepCooldown -= dt;
      if (this.stepCooldown <= 0 && !isSneaking) {
        audio.playStep();
        this.stepCooldown = 0.28;
      }
    }

    // Ground height (0 indoors, or terrain/wooden pier height outdoors)
    let targetY = 0;
    if (!roomBounds) {
      const groundH = getTerrainHeight(this.x, this.z);
      const pierH = this._isOnAnyPier(this.x, this.z) ? 0.68 : -99;
      targetY = Math.max(groundH, pierH);
    }
    this.y += (targetY - this.y) * Math.min(1, dt * 18);

    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.y = this.yaw;

    // Sneak crouch lean
    const crouchY = isSneaking ? -0.14 : 0;
    const crouchTilt = isSneaking ? 0.22 : 0;
    this.bodyGroup.rotation.x += (crouchTilt - this.bodyGroup.rotation.x) * Math.min(1, dt * 12);

    // Limb & bob animation
    if (moving) {
      const s = Math.sin(this.walkPhase);
      const amp = isSneaking ? 0.35 : 0.65;
      this.legL.rotation.x = s * amp;
      this.legR.rotation.x = -s * amp;
      this.armL.rotation.x = -s * (amp * 0.85);
      this.bodyGroup.position.y = crouchY + Math.abs(Math.cos(this.walkPhase)) * (isSneaking ? 0.04 : 0.11);
    } else {
      this.legL.rotation.x *= 0.8;
      this.legR.rotation.x *= 0.8;
      this.armL.rotation.x *= 0.8;
      this.bodyGroup.position.y += (crouchY - this.bodyGroup.position.y) * Math.min(1, dt * 12);
    }

    // Right arm (swinging net or holding tool)
    if (this.swingAnim > 0) {
      this.swingAnim = Math.max(0, this.swingAnim - dt);
      const t = 1 - this.swingAnim / 0.32;
      this.armR.rotation.x = -1.6 + Math.sin(t * Math.PI) * 2.25;
    } else if (this.tool !== 'hand' && !roomBounds) {
      this.armR.rotation.x = (isSneaking ? -0.7 : -0.35) + (moving ? Math.sin(this.walkPhase) * 0.12 : 0);
    } else {
      this.armR.rotation.x = moving ? Math.sin(this.walkPhase) * 0.55 : 0;
    }
  }

  _isOnAnyPier(x, z) {
    return isPointOnAnyDock(x, z);
  }
}
