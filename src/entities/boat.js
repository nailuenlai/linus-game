import * as THREE from 'three';
import { ISLANDS, getIslandMooringPoint, getTerrainHeight, WATER_LEVEL } from '../data/islands.js';

export class BoatEntity {
  constructor(scene, timeWeather) {
    this.scene = scene;
    this.timeWeather = timeWeather;
    this.group = new THREE.Group();
    this.level = 1;

    // Start moored right beside Main Island's southern pier
    const moor = getIslandMooringPoint(ISLANDS[0]);
    this.x = moor.x + 2.5;
    this.z = moor.z + 1.2;
    this.yaw = Math.PI * 0.25;
    this.speed = 0;
    this.wakeAccum = 0;

    this.seatAnchor = new THREE.Group();
    this.group.add(this.seatAnchor);

    this.meshGroup = new THREE.Group();
    this.group.add(this.meshGroup);
    this._rebuildMesh();

    this.group.position.set(this.x, WATER_LEVEL, this.z);
    this.group.rotation.y = this.yaw;
    scene.add(this.group);
  }

  setLevel(level) {
    if (this.level === level) return;
    this.level = level;
    this._rebuildMesh();
  }

  getMaxSpeed() {
    if (this.level === 3) return 22;
    if (this.level === 2) return 17.5;
    return 12.2;
  }

  _rebuildMesh() {
    while (this.meshGroup.children.length) {
      this.meshGroup.remove(this.meshGroup.children[0]);
    }

    const hullColors = [0xa46a3f, 0x2a7f9e, 0xe8b443];
    const trimColors = [0x6e4324, 0xfdf7eb, 0x243b6b];
    const hullMat = new THREE.MeshStandardMaterial({
      color: hullColors[Math.min(2, this.level - 1)],
      flatShading: true
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: trimColors[Math.min(2, this.level - 1)],
      flatShading: true
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xc99663, flatShading: true });

    // Boat hull
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 3.6), hullMat);
    hull.position.y = 0.25;
    hull.castShadow = true;
    this.meshGroup.add(hull);

    // Pointed bow
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.48, 1.55, 4), hullMat);
    bow.rotation.x = Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.scale.set(1, 1, 0.48);
    bow.position.set(0, 0.28, 2.5);
    bow.castShadow = true;
    this.meshGroup.add(bow);

    // Inner deck & wooden seat
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.16, 3.0), woodMat);
    deck.position.y = 0.48;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.72), trimMat);
    seat.position.set(0, 0.72, -0.35);
    this.meshGroup.add(deck, seat);

    // Rim rails
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 3.5), trimMat);
    railL.position.set(-1.0, 0.68, 0);
    const railR = railL.clone();
    railR.position.x = 1.0;
    this.meshGroup.add(railL, railR);

    this.sailMesh = null;

    if (this.level >= 2) {
      // Mast + Billowing Sail
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.3, 6), trimMat);
      mast.position.set(0, 2.55, 0.55);
      mast.castShadow = true;
      this.meshGroup.add(mast);

      const sailColor = this.level === 3 ? 0xfff8e7 : 0xffffff;
      const sail = new THREE.Mesh(
        new THREE.ConeGeometry(1.45, 3.2, 3),
        new THREE.MeshStandardMaterial({ color: sailColor, flatShading: true, side: THREE.DoubleSide })
      );
      sail.scale.set(0.25, 1, 1.15);
      sail.position.set(0, 2.85, 0.15);
      sail.castShadow = true;
      this.sailMesh = sail;
      this.meshGroup.add(sail);

      // Cute top pennant flag
      const flag = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.34, 0.78),
        new THREE.MeshStandardMaterial({ color: this.level === 3 ? 0xff595e : 0xf4a261, flatShading: true })
      );
      flag.position.set(0, 4.55, 0.18);
      this.meshGroup.add(flag);
    }

    if (this.level === 3) {
      // Glowing Starlight Bow Lantern
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0xa8f9ff,
        emissive: 0x48bfe3,
        emissiveIntensity: 1.0
      });
      this.timeWeather.registerNightMaterial(lampMat, 1.6);
      const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), lampMat);
      lantern.position.set(0, 1.15, 2.75);
      this.meshGroup.add(lantern);
    }

    this.seatAnchor.position.set(0, 0.56, -0.35);
  }

  teleportTo(x, z) {
    this.x = x;
    this.z = z;
    this.group.position.set(this.x, WATER_LEVEL, this.z);
  }

  update(dt, time, isControlled, moveVec, waterSystem, locked = false) {
    if (isControlled && !locked && moveVec.mag > 0.08) {
      const maxSpd = this.getMaxSpeed();
      const targetSpd = maxSpd * moveVec.mag;
      this.speed += (targetSpd - this.speed) * Math.min(1, dt * 4.5);

      const targetYaw = Math.atan2(moveVec.x, moveVec.z);
      let diff = targetYaw - this.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.yaw += diff * Math.min(1, dt * 5.5);

      const vx = Math.sin(this.yaw) * this.speed * dt;
      const vz = Math.cos(this.yaw) * this.speed * dt;
      const nx = Math.max(-185, Math.min(185, this.x + vx));
      const nz = Math.max(-185, Math.min(185, this.z + vz));

      // Keep boat in water (prevent beaching far inland)
      if (getTerrainHeight(nx, nz) < -0.08) {
        this.x = nx;
        this.z = nz;
      } else {
        // Gentle slide along shore
        if (getTerrainHeight(nx, this.z) < -0.08) this.x = nx;
        else if (getTerrainHeight(this.x, nz) < -0.08) this.z = nz;
        else this.speed *= 0.4;
      }

      // Spawn water wake behind boat
      this.wakeAccum += dt * (this.speed * 0.45);
      if (this.wakeAccum >= 0.45) {
        this.wakeAccum = 0;
        const backX = this.x - Math.sin(this.yaw) * 2.1;
        const backZ = this.z - Math.cos(this.yaw) * 2.1;
        waterSystem.spawnWake(backX, backZ, 0.9 + this.level * 0.18);
      }
    } else {
      this.speed *= Math.max(0, 1 - dt * 3.2);
    }

    // Gentle ocean bobbing & pitch/roll
    const bobY = Math.sin(time * 2.1 + this.x * 0.08) * 0.14;
    const roll = Math.sin(time * 1.7 + this.z * 0.1) * 0.055;
    const pitch = Math.cos(time * 1.4 + this.x * 0.1) * 0.045 - (this.speed / 24) * 0.07;

    this.group.position.set(this.x, WATER_LEVEL + bobY, this.z);
    this.group.rotation.y = this.yaw;
    this.group.rotation.z = roll;
    this.group.rotation.x = pitch;

    if (this.sailMesh) {
      this.sailMesh.rotation.y = Math.sin(time * 2.4) * 0.09;
    }
  }
}
