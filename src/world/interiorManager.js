import * as THREE from 'three';
import { FISH_LIST, BUG_LIST, REPTILE_LIST, CREATURE_MAP } from '../data/creatures.js';
import { FURNITURE_MAP, HOUSE_TIERS } from '../data/shopItems.js';
import { buildFurnitureMesh, buildCreatureModel } from './furnitureBuilder.js';
import { renderCreatureIcon } from '../ui/creatureIcons.js';

export class InteriorManager {
  constructor(scene, labelsContainer) {
    this.scene = scene;
    this.labelsContainer = labelsContainer;

    this.mode = 'exterior'; // 'exterior' | 'house' | 'museum'
    this.roomRoot = new THREE.Group();
    this.roomRoot.visible = false;
    scene.add(this.roomRoot);

    this.indoorLight = new THREE.PointLight(0xfff4df, 1.4, 42);
    this.indoorLight.position.set(0, 9.5, 2);
    this.roomRoot.add(this.indoorLight);

    this.houseGroup = new THREE.Group();
    this.museumGroup = new THREE.Group();
    this.roomRoot.add(this.houseGroup, this.museumGroup);

    this.houseHalfSize = 5.5;
    this.houseObstacles = [];
    this.houseAnims = [];
    this.placedMeshes = [];

    // Furniture placement preview state
    this.placingFurnitureId = null;
    this.placingRot = 0;
    this.placingPos = { x: 0, z: 0 };
    this.previewGroup = null;
    this.previewRing = null;

    // Museum dynamic exhibit state
    this.museumObstacles = [];
    this.museumExhibits = []; // { creature, mesh, wingL, wingR, tailMesh, basePos, phase, kind }
    this.curatorMesh = null;
    this.curatorLabel = document.createElement('div');
    this.curatorLabel.className = 'world-label';
    this.curatorLabel.style.opacity = '0';
    this.curatorLabel.innerHTML = '<span>🏛️ 館長博博</span>';
    labelsContainer.appendChild(this.curatorLabel);

    this.exhibitLabel = document.createElement('div');
    this.exhibitLabel.className = 'world-label';
    this.exhibitLabel.style.opacity = '0';
    labelsContainer.appendChild(this.exhibitLabel);
  }

  enterHouse(store) {
    this.mode = 'house';
    this.roomRoot.visible = true;
    this.houseGroup.visible = true;
    this.museumGroup.visible = false;
    this.curatorLabel.style.opacity = '0';
    this.exhibitLabel.style.opacity = '0';
    this.cancelPlacement();
    this.rebuildHouse(store);
    return { x: 0, y: 0, z: this.houseHalfSize - 1.5, yaw: Math.PI };
  }

  enterMuseum(store) {
    this.mode = 'museum';
    this.roomRoot.visible = true;
    this.houseGroup.visible = false;
    this.museumGroup.visible = true;
    this.cancelPlacement();
    this.rebuildMuseum(store);
    return { x: 0, y: 0, z: 8.2, yaw: Math.PI };
  }

  exitToExterior() {
    this.mode = 'exterior';
    this.roomRoot.visible = false;
    this.houseGroup.visible = false;
    this.museumGroup.visible = false;
    this.curatorLabel.style.opacity = '0';
    this.exhibitLabel.style.opacity = '0';
    this.cancelPlacement();
  }

  getRoomBounds() {
    if (this.mode === 'house') {
      const m = this.houseHalfSize - 0.65;
      return { minX: -m, maxX: m, minZ: -m, maxZ: m };
    }
    if (this.mode === 'museum') {
      return { minX: -12.6, maxX: 12.6, minZ: -9.6, maxZ: 9.8 };
    }
    return null;
  }

  getObstacles() {
    if (this.mode === 'house') return this.houseObstacles;
    if (this.mode === 'museum') return this.museumObstacles;
    return [];
  }

  getExitPoint() {
    if (this.mode === 'house') return { x: 0, z: this.houseHalfSize - 0.75 };
    if (this.mode === 'museum') return { x: 0, z: 9.2 };
    return null;
  }

  isNearExit(x, z) {
    const ex = this.getExitPoint();
    if (!ex) return false;
    return Math.hypot(x - ex.x, z - ex.z) < 2.2;
  }

  isNearCurator(x, z) {
    if (this.mode !== 'museum') return false;
    return Math.hypot(x - 0, z - -2.2) < 3.6;
  }

  // ==================== HOUSE INTERIOR ====================
  rebuildHouse(store) {
    while (this.houseGroup.children.length) {
      this.houseGroup.remove(this.houseGroup.children[0]);
    }
    this.houseObstacles = [];
    this.houseAnims = [];
    this.placedMeshes = [];

    const level = Math.max(1, store.state.house.level || 1);
    const tier = HOUSE_TIERS.find(t => t.level === level) || HOUSE_TIERS[0];
    const hs = tier.roomHalfSize;
    this.houseHalfSize = hs;
    const size = hs * 2;

    // Warm Wooden Plank Floor
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd9a873, roughness: 0.82, flatShading: true });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(size + 0.6, 0.3, size + 0.6), floorMat);
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    this.houseGroup.add(floor);

    // Subtle tile grid lines for clean furniture alignment
    const gridHelper = new THREE.GridHelper(size, Math.round(size / 1.5), 0xb88652, 0xc79660);
    gridHelper.position.y = 0.015;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    this.houseGroup.add(gridHelper);

    // Walls (North, West, East) — cozy cream wallpaper + wood baseboard
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff5e1, roughness: 0.9, flatShading: true });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x8f5b34, flatShading: true });
    const wallH = 4.6;

    const northWall = new THREE.Mesh(new THREE.BoxGeometry(size + 0.6, wallH, 0.35), wallMat);
    northWall.position.set(0, wallH / 2, -hs - 0.15);
    northWall.receiveShadow = true;
    this.houseGroup.add(northWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, wallH, size + 0.6), wallMat);
    westWall.position.set(-hs - 0.15, wallH / 2, 0);
    westWall.receiveShadow = true;
    this.houseGroup.add(westWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, wallH, size + 0.6), wallMat);
    eastWall.position.set(hs + 0.15, wallH / 2, 0);
    eastWall.receiveShadow = true;
    this.houseGroup.add(eastWall);

    // Baseboards
    const baseN = new THREE.Mesh(new THREE.BoxGeometry(size + 0.2, 0.42, 0.42), trimMat);
    baseN.position.set(0, 0.21, -hs - 0.08);
    const baseW = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, size + 0.2), trimMat);
    baseW.position.set(-hs - 0.08, 0.21, 0);
    const baseE = baseW.clone();
    baseE.position.x = hs + 0.08;
    this.houseGroup.add(baseN, baseW, baseE);

    // Bright Scenic Windows on North Wall
    const winGlass = new THREE.MeshStandardMaterial({
      color: 0xaee6f8,
      emissive: 0x72c8e8,
      emissiveIntensity: 0.45
    });
    const winXs = level >= 2 ? [-4.0, 0, 4.0] : [-2.4, 2.4];
    for (const wx of winXs) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.55, 0.18), trimMat);
      frame.position.set(wx, 2.45, -hs + 0.04);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(1.62, 1.28, 0.22), winGlass);
      pane.position.set(wx, 2.45, -hs + 0.05);
      this.houseGroup.add(frame, pane);
    }

    // Welcome Exit Rug at South Center
    const matMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.06, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xe56b5b, flatShading: true })
    );
    matMesh.position.set(0, 0.03, hs - 0.65);
    this.houseGroup.add(matMesh);

    // Render all placed furniture
    for (const entry of store.state.house.placedFurniture) {
      const meta = FURNITURE_MAP[entry.id];
      if (!meta) continue;
      const built = buildFurnitureMesh(entry.id);
      built.group.position.set(entry.x, 0, entry.z);
      built.group.rotation.y = entry.rot || 0;
      this.houseGroup.add(built.group);
      this.placedMeshes.push({ entry, group: built.group });
      this.houseAnims.push(...built.anims);

      if (!meta.walkable && meta.radius > 0) {
        this.houseObstacles.push({ x: entry.x, z: entry.z, r: meta.radius });
      }
    }

    // Re-attach preview if currently placing
    if (this.placingFurnitureId && this.previewGroup) {
      this.houseGroup.add(this.previewGroup);
      if (this.previewRing) this.houseGroup.add(this.previewRing);
    }
  }

  startPlacement(furnitureId) {
    this.cancelPlacement();
    if (this.mode !== 'house') return;
    this.placingFurnitureId = furnitureId;
    this.placingRot = 0;

    const built = buildFurnitureMesh(furnitureId);
    built.group.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.68;
      }
    });
    this.previewGroup = built.group;
    this.houseGroup.add(this.previewGroup);

    this.previewRing = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.85, 24),
      new THREE.MeshBasicMaterial({ color: 0x4fa664, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    this.previewRing.rotation.x = -Math.PI / 2;
    this.previewRing.position.y = 0.05;
    this.houseGroup.add(this.previewRing);
  }

  rotatePreview() {
    this.placingRot = (this.placingRot + Math.PI / 2) % (Math.PI * 2);
  }

  cancelPlacement() {
    if (this.previewGroup && this.previewGroup.parent) {
      this.previewGroup.parent.remove(this.previewGroup);
    }
    if (this.previewRing && this.previewRing.parent) {
      this.previewRing.parent.remove(this.previewRing);
    }
    this.placingFurnitureId = null;
    this.previewGroup = null;
    this.previewRing = null;
  }

  confirmPlacement(store) {
    if (!this.placingFurnitureId) return null;
    const id = this.placingFurnitureId;
    const entry = store.placeFurniture(id, this.placingPos.x, this.placingPos.z, this.placingRot);
    if (!entry) return null;
    const remaining = store.state.furnitureInventory[id] || 0;
    if (remaining <= 0) {
      this.cancelPlacement();
    }
    this.rebuildHouse(store);
    return { entry, remaining };
  }

  getNearestPlacedFurniture(x, z, maxDist = 2.4) {
    let best = null;
    let bestD = maxDist;
    for (const pm of this.placedMeshes) {
      const d = Math.hypot(pm.entry.x - x, pm.entry.z - z);
      if (d < bestD) {
        bestD = d;
        best = pm.entry;
      }
    }
    return best;
  }

  // ==================== MUSEUM INTERIOR ====================
  rebuildMuseum(store) {
    while (this.museumGroup.children.length) {
      this.museumGroup.remove(this.museumGroup.children[0]);
    }
    this.museumObstacles = [];
    this.museumExhibits = [];

    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: 0.72, flatShading: true });
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x2a7f9e, flatShading: true });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9e2d2, flatShading: true });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xfdf9f0, flatShading: true });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8f5b34, flatShading: true });

    // Grand Marble Floor (28 x 22)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(28, 0.3, 22), floorMat);
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    this.museumGroup.add(floor);

    // Central Teal Runner Carpet
    const runner = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 15.5), carpetMat);
    runner.position.set(0, 0.02, 1.5);
    this.museumGroup.add(runner);

    // Outer Walls (N, W, E)
    const wallH = 6.2;
    const nWall = new THREE.Mesh(new THREE.BoxGeometry(28.4, wallH, 0.45), wallMat);
    nWall.position.set(0, wallH / 2, -10.8);
    const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, wallH, 22.4), wallMat);
    wWall.position.set(-13.8, wallH / 2, 0);
    const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, wallH, 22.4), wallMat);
    eWall.position.set(13.8, wallH / 2, 0);
    this.museumGroup.add(nWall, wWall, eWall);

    // Decorative Marble Pillars
    for (const [px, pz] of [[-4.8, 3.2], [4.8, 3.2], [-4.8, -5.2], [4.8, -5.2]]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 5.8, 8), pillarMat);
      col.position.set(px, 2.9, pz);
      col.castShadow = true;
      this.museumGroup.add(col);
      this.museumObstacles.push({ x: px, z: pz, r: 0.65 });
    }

    // Reception Podium + Curator Bobo (館長博博)
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 1.3), woodMat);
    desk.position.set(0, 0.55, -2.8);
    desk.castShadow = true;
    this.museumGroup.add(desk);
    this.museumObstacles.push({ x: 0, z: -2.8, r: 1.4 });

    this.curatorMesh = this._buildCuratorOwl();
    this.curatorMesh.position.set(0, 0, -4.1);
    this.museumGroup.add(this.curatorMesh);

    // Exit Mat
    const exitMat = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.06, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xe56b5b, flatShading: true })
    );
    exitMat.position.set(0, 0.03, 9.6);
    this.museumGroup.add(exitMat);

    // === LEFT WING: AQUARIUM HALL (🐟 水族館) ===
    const donatedFish = FISH_LIST.filter(f => store.isDonated(f.id));
    this._buildAquariumTank(-10.6, -2.5, 4.4, 8.2, donatedFish.slice(0, 15));
    this._buildAquariumTank(-10.6, 5.4, 4.4, 5.8, donatedFish.slice(15));

    // === RIGHT WING: INSECT & BEETLE GALLERY (🪲 昆蟲甲蟲館) ===
    const donatedBugs = BUG_LIST.filter(b => store.isDonated(b.id));
    this._buildInsectGallery(10.2, 1.2, donatedBugs);

    // === NORTH WING: REPTILE CONSERVATORY (🦎 爬蟲溫室) ===
    const donatedReptiles = REPTILE_LIST.filter(r => store.isDonated(r.id));
    this._buildReptileTerrarium(0, -8.4, donatedReptiles);
  }

  _buildAquariumTank(cx, cz, width, depth, fishList) {
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x264653, flatShading: true });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2ec4b6,
      emissive: 0x0077b6,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide
    });
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe9d8a6, flatShading: true });

    const base = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.85, depth + 0.3), baseMat);
    base.position.set(cx, 0.425, cz);
    base.castShadow = true;
    const sand = new THREE.Mesh(new THREE.BoxGeometry(width - 0.15, 0.25, depth - 0.15), sandMat);
    sand.position.set(cx, 0.92, cz);
    const tank = new THREE.Mesh(new THREE.BoxGeometry(width, 2.9, depth), waterMat);
    tank.position.set(cx, 2.3, cz);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.22, depth + 0.3), baseMat);
    cap.position.set(cx, 3.85, cz);
    this.museumGroup.add(base, sand, tank, cap);

    // Collision circles covering the tank footprint
    for (let oz = -depth * 0.35; oz <= depth * 0.35; oz += 2.2) {
      this.museumObstacles.push({ x: cx, z: cz + oz, r: width * 0.52 });
    }

    // Spawn live swimming 3D fish for every donated species!
    fishList.forEach((creature, idx) => {
      const built = buildCreatureModel(creature);
      const laneZ = cz - depth * 0.35 + ((idx % 5) / 4) * (depth * 0.7);
      const laneY = 1.45 + (idx % 3) * 0.65;
      built.group.position.set(cx, laneY, laneZ);
      this.museumGroup.add(built.group);
      this.museumExhibits.push({
        creature,
        mesh: built.group,
        wingL: built.wingL,
        wingR: built.wingR,
        tailMesh: built.tailMesh,
        kind: 'fish',
        cx,
        cz: laneZ,
        baseY: laneY,
        rx: width * 0.32,
        rz: Math.min(1.1, depth * 0.16),
        speed: 0.55 + (idx % 4) * 0.18,
        phase: idx * 1.15
      });
    });
  }

  _buildInsectGallery(cx, cz, bugList) {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7f5539, flatShading: true });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x52a858, flatShading: true });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xf4fff8,
      transparent: true,
      opacity: 0.24
    });

    // Long botanical display greenhouse along East wall
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 14.5), woodMat);
    base.position.set(cx, 0.45, cz);
    base.castShadow = true;
    const moss = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.22, 14.0), mossMat);
    moss.position.set(cx, 0.96, cz);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.7, 14.2), glassMat);
    glass.position.set(cx, 2.35, cz);
    this.museumGroup.add(base, moss, glass);

    // Decorative tree trunks inside the beetle hall
    for (const lz of [-4.5, 0.5, 5.2]) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 2.1, 6), woodMat);
      log.position.set(cx + 0.3, 1.9, cz + lz);
      log.rotation.z = 0.14;
      this.museumGroup.add(log);
    }

    for (let oz = -6.2; oz <= 6.2; oz += 2.2) {
      this.museumObstacles.push({ x: cx, z: cz + oz, r: 2.3 });
    }

    bugList.forEach((creature, idx) => {
      const built = buildCreatureModel(creature);
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = cx - 0.95 + col * 1.85;
      const bz = cz - 5.9 + (row % 12) * 1.08;
      const by = creature.behavior === 'fly' ? 2.25 + (idx % 3) * 0.35 : 1.1;
      built.group.position.set(bx, by, bz);
      built.group.rotation.y = -Math.PI * 0.5;
      this.museumGroup.add(built.group);

      this.museumExhibits.push({
        creature,
        mesh: built.group,
        wingL: built.wingL,
        wingR: built.wingR,
        kind: creature.behavior === 'fly' ? 'fly_bug' : 'ground_bug',
        cx: bx,
        cz: bz,
        baseY: by,
        phase: idx * 0.9
      });
    });
  }

  _buildReptileTerrarium(cx, cz, reptileList) {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa68a64, flatShading: true });
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe6be8a, flatShading: true });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      transparent: true,
      opacity: 0.22
    });

    const base = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.85, 3.6), stoneMat);
    base.position.set(cx, 0.425, cz);
    base.castShadow = true;
    const sand = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.22, 3.2), sandMat);
    sand.position.set(cx, 0.92, cz);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(11.3, 2.5, 3.3), glassMat);
    glass.position.set(cx, 2.2, cz);
    this.museumGroup.add(base, sand, glass);

    // Sun-basking rocks inside terrarium
    for (const rx of [-3.6, 0, 3.6]) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.65, 0),
        new THREE.MeshStandardMaterial({ color: 0x8d7b68, flatShading: true })
      );
      rock.scale.set(1.3, 0.55, 1.0);
      rock.position.set(cx + rx, 1.15, cz - 0.3);
      this.museumGroup.add(rock);
    }

    for (let ox = -4.6; ox <= 4.6; ox += 2.3) {
      this.museumObstacles.push({ x: cx + ox, z: cz, r: 1.95 });
    }

    reptileList.forEach((creature, idx) => {
      const built = buildCreatureModel(creature);
      const rx = cx - 4.7 + (idx % 6) * 1.88;
      const rz = cz + (idx >= 6 ? 0.65 : -0.55);
      built.group.position.set(rx, 1.05, rz);
      built.group.rotation.y = (idx % 3 - 1) * 0.4;
      this.museumGroup.add(built.group);

      this.museumExhibits.push({
        creature,
        mesh: built.group,
        tailMesh: built.tailMesh,
        kind: 'reptile',
        cx: rx,
        cz: rz,
        baseY: 1.05,
        phase: idx * 1.1
      });
    });
  }

  _buildCuratorOwl() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x7d5a50, flatShading: true });
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x264653, flatShading: true });
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xf4ead5, flatShading: true });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf4c430, flatShading: true });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1b1512 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.9, 8), vestMat);
    torso.position.y = 0.68;
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), bodyMat);
    head.position.y = 1.45;
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 6), creamMat);
    face.scale.set(1.1, 0.85, 0.6);
    face.position.set(0, 1.44, 0.28);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 4), goldMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 1.38, 0.52);
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), eyeMat);
    eL.position.set(-0.17, 1.48, 0.44);
    const eR = eL.clone();
    eR.position.x = 0.17;
    // Cute bow tie!
    const bow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0xe63946 }));
    bow.position.set(0, 1.08, 0.44);
    g.add(torso, head, face, beak, eL, eR, bow);
    return g;
  }

  // ==================== UPDATE LOOP ====================
  update(dt, time, camera, playerPos, store, hideLabels = false) {
    if (this.mode === 'house') {
      // Animate furniture props (fish tank, fireplace flame, crystal globe)
      for (const a of this.houseAnims) {
        if (a.type === 'floatSpin') {
          a.mesh.rotation.y += dt * 1.1;
          a.mesh.position.y = a.baseY + Math.sin(time * 2.4) * 0.08;
        } else if (a.type === 'flame') {
          a.mesh.position.y = a.baseY + Math.sin(time * 7) * 0.04;
          const sc = 0.9 + Math.sin(time * 11) * 0.14;
          a.mesh.scale.set(sc, sc * 1.2, sc);
        } else if (a.type === 'swim') {
          const x = Math.sin(time * 1.4) * a.rangeX;
          a.mesh.position.x = x;
          a.mesh.position.y = a.centerY + Math.sin(time * 2.5) * 0.1;
          a.mesh.rotation.y = Math.cos(time * 1.4) > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      }

      // Update furniture placement ghost directly in front of player snapped to 0.75m grid
      if (this.placingFurnitureId && this.previewGroup) {
        const rawX = playerPos.x + Math.sin(playerPos.yaw) * 2.2;
        const rawZ = playerPos.z + Math.cos(playerPos.yaw) * 2.2;
        const lim = this.houseHalfSize - 1.1;
        const snap = v => Math.max(-lim, Math.min(lim, Math.round(v / 0.75) * 0.75));
        this.placingPos.x = snap(rawX);
        this.placingPos.z = snap(rawZ);

        this.previewGroup.position.set(this.placingPos.x, 0.02, this.placingPos.z);
        this.previewGroup.rotation.y = this.placingRot;
        if (this.previewRing) {
          this.previewRing.position.set(this.placingPos.x, 0.05, this.placingPos.z);
          const s = 1 + Math.sin(time * 5) * 0.06;
          this.previewRing.scale.set(s, s, 1);
        }
      }
      return;
    }

    if (this.mode === 'museum') {
      // Animate Curator Bobo
      if (this.curatorMesh) {
        this.curatorMesh.position.y = Math.sin(time * 2.5) * 0.04;
      }

      // Animate all donated exhibits!
      let nearestExhibit = null;
      let nearestDist = 4.2;

      for (const ex of this.museumExhibits) {
        if (ex.kind === 'fish') {
          const a = time * ex.speed + ex.phase;
          const nx = ex.cx + Math.cos(a) * ex.rx;
          const nz = ex.cz + Math.sin(a) * ex.rz;
          const dx = -Math.sin(a) * ex.rx;
          const dz = Math.cos(a) * ex.rz;
          ex.mesh.position.set(nx, ex.baseY + Math.sin(time * 2 + ex.phase) * 0.12, nz);
          ex.mesh.rotation.y = Math.atan2(dx, dz);
          if (ex.tailMesh) ex.tailMesh.rotation.y = Math.sin(time * 8 + ex.phase) * 0.35;
          if (ex.wingL && ex.wingR) {
            const isWinged = ex.creature.id === 'manta_ray' || ex.creature.id === 'sea_angel';
            const fl = Math.sin(time * (isWinged ? 3.8 : 6.2) + ex.phase) * (isWinged ? 0.38 : 0.22);
            ex.wingL.rotation.z = fl;
            ex.wingR.rotation.z = -fl;
          }
        } else if (ex.kind === 'fly_bug') {
          ex.mesh.position.y = ex.baseY + Math.sin(time * 3.5 + ex.phase) * 0.2;
          ex.mesh.rotation.y = Math.sin(time * 0.9 + ex.phase) * 0.7 - Math.PI * 0.5;
          if (ex.wingL) {
            const fl = Math.sin(time * 14 + ex.phase) * 0.65;
            ex.wingL.rotation.z = fl;
            ex.wingR.rotation.z = -fl;
          }
        } else {
          ex.mesh.rotation.y = Math.sin(time * 0.7 + ex.phase) * 0.25 + (ex.kind === 'ground_bug' ? -Math.PI * 0.5 : 0);
        }

        const d = Math.hypot(ex.mesh.position.x - playerPos.x, ex.mesh.position.z - playerPos.z);
        if (d < nearestDist) {
          nearestDist = d;
          nearestExhibit = ex;
        }
      }

      // Floating labels for Curator & nearest donated exhibit
      if (hideLabels) {
        this.curatorLabel.style.opacity = '0';
        this.exhibitLabel.style.opacity = '0';
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const curV = new THREE.Vector3(0, 2.6, -4.1).project(camera);
      if (curV.z <= 1) {
        this.curatorLabel.style.left = `${(curV.x * 0.5 + 0.5) * w}px`;
        this.curatorLabel.style.top = `${(-curV.y * 0.5 + 0.5) * h}px`;
        this.curatorLabel.style.opacity = '1';
      } else {
        this.curatorLabel.style.opacity = '0';
      }

      if (nearestExhibit) {
        const rec = store.state.museum[nearestExhibit.creature.id];
        const ev = nearestExhibit.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)).project(camera);
        if (ev.z <= 1) {
          const labelKey = `${nearestExhibit.creature.id}|${rec?.size || '?'}`;
          if (this._lastExhibitLabelKey !== labelKey) {
            this._lastExhibitLabelKey = labelKey;
            this.exhibitLabel.innerHTML = `${renderCreatureIcon(nearestExhibit.creature, { size: 22, inline: true })}<span>${nearestExhibit.creature.name} (${rec?.size || '?'} cm)</span>`;
          }
          this.exhibitLabel.style.left = `${(ev.x * 0.5 + 0.5) * w}px`;
          this.exhibitLabel.style.top = `${(-ev.y * 0.5 + 0.5) * h}px`;
          this.exhibitLabel.style.opacity = '1';
        } else {
          this.exhibitLabel.style.opacity = '0';
        }
      } else {
        this.exhibitLabel.style.opacity = '0';
      }
    }
  }
}
