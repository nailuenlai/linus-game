import * as THREE from 'three';
import { ISLANDS, getTerrainHeight, getIslandEdgeRadius, getPondAt } from '../data/islands.js';

function seededRandom(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function buildArchipelago(scene, timeWeather) {
  const obstacles = [];
  const interactables = [];
  const animatedProps = [];

  for (const isl of ISLANDS) {
    _buildIslandTerrain(scene, isl);
    _buildDock(scene, isl, timeWeather);

    if (isl.id === 'main') {
      _buildMainIslandProps(scene, isl, timeWeather, obstacles, interactables, animatedProps);
    } else if (isl.id === 'coconut') {
      _buildCoconutIslandProps(scene, isl, timeWeather, obstacles, animatedProps);
    } else if (isl.id === 'sakura') {
      _buildSakuraIslandProps(scene, isl, timeWeather, obstacles, animatedProps);
    } else if (isl.id === 'ruins') {
      _buildRuinsIslandProps(scene, isl, timeWeather, obstacles, animatedProps);
    }
  }

  _buildSkyClouds(scene, animatedProps);

  return { obstacles, interactables, animatedProps };
}

function _buildIslandTerrain(scene, isl) {
  const size = isl.radius * 2.75;
  const segs = 44;
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = [];
  const cSand = new THREE.Color(isl.sandColor);
  const cGrass = new THREE.Color(isl.grassColor);
  const cAccent = new THREE.Color(isl.grassAccent);
  const cDeep = new THREE.Color(0xb8a378);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + isl.x;
    const wz = pos.getZ(i) + isl.z;
    const h = getTerrainHeight(wx, wz);
    pos.setY(i, h);

    if (h < -0.15) {
      tmp.copy(cDeep);
    } else if (h < 0.82) {
      const t = Math.max(0, Math.min(1, (h + 0.15) / 0.97));
      tmp.lerpColors(cDeep, cSand, t);
    } else if (h < 1.35) {
      const t = (h - 0.82) / 0.53;
      tmp.lerpColors(cSand, cGrass, t);
    } else {
      const patch = (Math.sin(wx * 0.25) * Math.cos(wz * 0.25) + 1) * 0.5;
      tmp.lerpColors(cGrass, cAccent, patch * 0.65);
    }
    colors.push(tmp.r, tmp.g, tmp.b);
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.02,
    flatShading: true
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(isl.x, 0, isl.z);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function _buildDock(scene, isl, timeWeather) {
  const dockGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa67449, roughness: 0.9, flatShading: true });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x7a5130, roughness: 0.95, flatShading: true });

  const edgeR = getIslandEdgeRadius(isl, isl.dockAngle);
  const startR = edgeR - 3.5;
  const dockLen = 9.5;
  const dirX = Math.cos(isl.dockAngle);
  const dirZ = Math.sin(isl.dockAngle);

  const midR = startR + dockLen * 0.5;
  dockGroup.position.set(isl.x + dirX * midR, 0.58, isl.z + dirZ * midR);
  dockGroup.rotation.y = Math.atan2(dirX, dirZ);

  // Planks
  for (let i = 0; i < 9; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 0.92), woodMat);
    plank.position.set(0, 0, -dockLen / 2 + 0.55 + i * 1.05);
    plank.castShadow = true;
    plank.receiveShadow = true;
    dockGroup.add(plank);
  }

  // Support posts
  for (const sx of [-1.45, 1.45]) {
    for (const sz of [-3.6, 0, 3.8]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.4, 6), postMat);
      post.position.set(sx, -0.75, sz);
      post.castShadow = true;
      dockGroup.add(post);
    }
  }

  // Harbor Lantern on dock tip
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 6), postMat);
  lanternPost.position.set(1.45, 1.2, 4.1);
  dockGroup.add(lanternPost);

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xffb74d,
    emissiveIntensity: 0.6
  });
  timeWeather.registerNightMaterial(lampMat, 1.3);
  const lamp = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), lampMat);
  lamp.position.set(1.45, 2.5, 4.1);
  dockGroup.add(lamp);

  scene.add(dockGroup);
}

function _createOakTree(scale = 1, foliageColor = 0x52a858) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.42, 2.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x8a5b36, flatShading: true })
  );
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  g.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: foliageColor, flatShading: true });
  const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 0), leafMat);
  c1.position.set(0, 2.9, 0);
  c1.castShadow = true;
  const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), leafMat);
  c2.position.set(0.8, 2.5, 0.45);
  c2.castShadow = true;
  const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), leafMat);
  c3.position.set(-0.75, 2.4, -0.4);
  c3.castShadow = true;
  g.add(c1, c2, c3);
  g.scale.setScalar(scale);
  return g;
}

function _createPineTree(scale = 1, color = 0x3b8656) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.36, 1.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x73492a, flatShading: true })
  );
  trunk.position.y = 0.9;
  trunk.castShadow = true;
  g.add(trunk);

  const mat = new THREE.MeshStandardMaterial({ color, flatShading: true });
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.55 - i * 0.35, 1.85, 6), mat);
    cone.position.y = 2.0 + i * 1.15;
    cone.castShadow = true;
    g.add(cone);
  }
  g.scale.setScalar(scale);
  return g;
}

function _createPalmTree(scale = 1) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xa67c52, flatShading: true });
  let topX = 0;
  let topY = 0;
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.26 - i * 0.025, 0.32 - i * 0.025, 1.05, 6), trunkMat);
    const lean = i * 0.24;
    seg.position.set(lean, 0.5 + i * 0.92, 0);
    seg.rotation.z = -0.15 - i * 0.04;
    seg.castShadow = true;
    g.add(seg);
    topX = lean + 0.15;
    topY = 0.95 + i * 0.92;
  }

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x52b755, flatShading: true });
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.5, 4), leafMat);
    frond.position.set(topX + Math.cos(ang) * 1.05, topY + 0.15, Math.sin(ang) * 1.05);
    frond.rotation.z = -Math.PI * 0.38;
    frond.rotation.y = -ang;
    frond.castShadow = true;
    g.add(frond);
  }

  // Coconuts
  const cocoMat = new THREE.MeshStandardMaterial({ color: 0x694225, flatShading: true });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const coco = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), cocoMat);
    coco.position.set(topX + Math.cos(a) * 0.35, topY - 0.15, Math.sin(a) * 0.35);
    g.add(coco);
  }

  g.scale.setScalar(scale);
  return g;
}

function _createSakuraTree(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.45, 2.3, 6),
    new THREE.MeshStandardMaterial({ color: 0x6b4b3e, flatShading: true })
  );
  trunk.position.y = 1.15;
  trunk.castShadow = true;
  g.add(trunk);

  const pink1 = new THREE.MeshStandardMaterial({ color: 0xffb3c6, flatShading: true });
  const pink2 = new THREE.MeshStandardMaterial({ color: 0xffd1dc, flatShading: true });
  const blobs = [
    [0, 3.0, 0, 1.55, pink1],
    [1.0, 2.6, 0.45, 1.15, pink2],
    [-0.95, 2.65, -0.35, 1.1, pink1],
    [0.2, 3.7, -0.4, 0.95, pink2]
  ];
  for (const [bx, by, bz, br, bm] of blobs) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(br, 0), bm);
    m.position.set(bx, by, bz);
    m.castShadow = true;
    g.add(m);
  }
  g.scale.setScalar(scale);
  return g;
}

function _createBambooCluster() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x68b664, flatShading: true });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x80cc74, flatShading: true });
  for (let i = 0; i < 4; i++) {
    const h = 4.5 + (i % 2) * 1.6;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, h, 5), mat);
    const ox = (i - 1.5) * 0.42;
    const oz = ((i % 2) - 0.5) * 0.45;
    stalk.position.set(ox, h / 2, oz);
    stalk.rotation.z = (i - 1.5) * 0.04;
    stalk.castShadow = true;
    g.add(stalk);

    const tuft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), leafMat);
    tuft.position.set(ox, h - 0.2, oz);
    g.add(tuft);
  }
  return g;
}

function _createFlowerPatch(colorHex) {
  const g = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4b9952, flatShading: true });
  const petalMat = new THREE.MeshStandardMaterial({ color: colorHex, flatShading: true });
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + 0.3;
    const r = 0.28 + (i % 2) * 0.22;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 4), stemMat);
    stem.position.set(Math.cos(ang) * r, 0.17, Math.sin(ang) * r);
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), petalMat);
    head.position.set(Math.cos(ang) * r, 0.38, Math.sin(ang) * r);
    g.add(stem, head);
  }
  return g;
}

function _createRock(scale = 1, color = 0x9aa3a6) {
  const m = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.85, 0),
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95 })
  );
  m.scale.set(scale * 1.15, scale * 0.72, scale);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function _buildMainIslandProps(scene, isl, timeWeather, obstacles, interactables, animatedProps) {
  // === 1. Cozy General Store (微風雜貨店) ===
  const shopX = 8.5;
  const shopZ = -9.2;
  const shopY = getTerrainHeight(shopX, shopZ);
  const shop = new THREE.Group();
  shop.position.set(shopX, shopY, shopZ);
  shop.rotation.y = -0.35;

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff2d6, flatShading: true });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x8f5b34, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd95f4a, flatShading: true });

  // Main cottage body
  const body = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3.6, 5.2), wallMat);
  body.position.y = 1.8;
  body.castShadow = true;
  body.receiveShadow = true;
  shop.add(body);

  // Pitched roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.7, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.85;
  roof.castShadow = true;
  shop.add(roof);

  // Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.85), new THREE.MeshStandardMaterial({ color: 0xb87456, flatShading: true }));
  chimney.position.set(-1.9, 4.7, -1.2);
  shop.add(chimney);

  // Wooden door
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.18), trimMat);
  door.position.set(0, 1.1, 2.62);
  shop.add(door);

  // Glowing shop windows
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xfff1ba,
    emissive: 0xffbe55,
    emissiveIntensity: 0.45
  });
  timeWeather.registerNightMaterial(winMat, 1.1);
  for (const wx of [-2.0, 2.0]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.05, 0.16), winMat);
    win.position.set(wx, 1.9, 2.62);
    shop.add(win);
  }

  // Striped Awning
  for (let i = 0; i < 6; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.16, 1.7),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xe56b5b : 0xfff8ea, flatShading: true })
    );
    stripe.position.set(-2.8 + i * 1.12, 2.85, 3.25);
    stripe.rotation.x = 0.25;
    stripe.castShadow = true;
    shop.add(stripe);
  }

  // Wooden counter + crate beside door
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.9), trimMat);
  crate.position.set(-2.3, 0.42, 3.2);
  shop.add(crate);

  // Glowing shop entry pad
  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.45, 24),
    new THREE.MeshBasicMaterial({ color: 0xf7c948, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.set(0, 0.08, 4.3);
  shop.add(padRing);
  animatedProps.push({ type: 'pulse', mesh: padRing });

  scene.add(shop);
  obstacles.push({ x: shopX, z: shopZ, r: 4.3 });
  interactables.push({
    id: 'shop_counter',
    type: 'shop',
    label: '微風雜貨店',
    icon: '🏪',
    x: shopX - Math.sin(-0.35) * 4.4,
    z: shopZ + Math.cos(-0.35) * 4.4,
    radius: 3.4
  });

  // === 2. Cozy Plaza Campfire & Rest Bench ===
  const plazaX = -1.5;
  const plazaZ = 3.2;
  const plazaY = getTerrainHeight(plazaX, plazaZ);
  const stonePlaza = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.6, 0.14, 16),
    new THREE.MeshStandardMaterial({ color: 0xdccbb0, flatShading: true })
  );
  stonePlaza.position.set(plazaX, plazaY + 0.02, plazaZ);
  stonePlaza.receiveShadow = true;
  scene.add(stonePlaza);

  // Rest Bench (for changing time/weather!)
  const benchX = -4.2;
  const benchZ = 2.0;
  const benchY = getTerrainHeight(benchX, benchZ);
  const bench = new THREE.Group();
  bench.position.set(benchX, benchY, benchZ);
  bench.rotation.y = 0.7;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.75), trimMat);
  seat.position.y = 0.62;
  seat.castShadow = true;
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.14), trimMat);
  back.position.set(0, 1.05, -0.32);
  back.castShadow = true;
  bench.add(seat, back);
  for (const lx of [-0.95, 0.95]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.68), new THREE.MeshStandardMaterial({ color: 0x5c3c24 }));
    leg.position.set(lx, 0.31, 0);
    bench.add(leg);
  }
  scene.add(bench);
  obstacles.push({ x: benchX, z: benchZ, r: 1.25 });
  interactables.push({
    id: 'rest_bench',
    type: 'bench',
    label: '廣場休息長椅',
    icon: '🪑',
    x: benchX,
    z: benchZ,
    radius: 3.2
  });

  // Glowing Plaza Lantern Post
  const lampPost = new THREE.Group();
  lampPost.position.set(plazaX + 2.6, plazaY, plazaZ + 2.2);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.2, 6), trimMat);
  pole.position.y = 1.6;
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff6cc, emissive: 0xffb347, emissiveIntensity: 0.5 });
  timeWeather.registerNightMaterial(bulbMat, 1.4);
  const bulb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), bulbMat);
  bulb.position.y = 3.35;
  lampPost.add(pole, bulb);
  scene.add(lampPost);
  obstacles.push({ x: plazaX + 2.6, z: plazaZ + 2.2, r: 0.5 });

  // === 3. Trees, Flowers, Rocks on Main Island ===
  const rand = seededRandom(101);
  const treeSpots = [
    [-22, 6], [-18, 16], [-10, 19], [-24, -4], [-21, -16],
    [-8, -22], [3, -23], [16, -18], [23, -8], [24, 5],
    [18, 16], [12, 21], [-2, -17], [17, 4], [-15, 12]
  ];
  treeSpots.forEach(([tx, tz], idx) => {
    const h = getTerrainHeight(tx, tz);
    if (h < 0.85 || getPondAt(tx, tz)) return;
    const scale = 0.85 + rand() * 0.4;
    const tree = idx % 3 === 0 ? _createPineTree(scale) : _createOakTree(scale, idx % 2 ? 0x52a858 : 0x66b85a);
    tree.position.set(tx, h - 0.1, tz);
    tree.rotation.y = rand() * Math.PI * 2;
    scene.add(tree);
    obstacles.push({ x: tx, z: tz, r: 0.95 * scale });
  });

  // Flower meadows
  const flowerColors = [0xff758f, 0xffd166, 0xffffff, 0x90e0ef, 0xff9f1c];
  for (let i = 0; i < 24; i++) {
    const ang = rand() * Math.PI * 2;
    const rad = 8 + rand() * 20;
    const fx = Math.cos(ang) * rad;
    const fz = Math.sin(ang) * rad;
    if (Math.hypot(fx - shopX, fz - shopZ) < 6.5) continue;
    const h = getTerrainHeight(fx, fz);
    if (h < 1.0 || getPondAt(fx, fz)) continue;
    const f = _createFlowerPatch(flowerColors[i % flowerColors.length]);
    f.position.set(fx, h, fz);
    scene.add(f);
  }

  // Coastal rocks
  for (const [rx, rz, sc] of [[-26, 15, 1.2], [25, -15, 1.3], [19, 23, 0.95], [-19, -23, 1.1]]) {
    const h = getTerrainHeight(rx, rz);
    const rock = _createRock(sc);
    rock.position.set(rx, h + 0.2, rz);
    scene.add(rock);
    obstacles.push({ x: rx, z: rz, r: 0.9 * sc });
  }
}

function _buildCoconutIslandProps(scene, isl, timeWeather, obstacles, animatedProps) {
  const rand = seededRandom(202);
  // Palm trees
  for (let i = 0; i < 13; i++) {
    const ang = (i / 13) * Math.PI * 2 + rand() * 0.3;
    const rad = 8 + rand() * 12;
    const tx = isl.x + Math.cos(ang) * rad;
    const tz = isl.z + Math.sin(ang) * rad;
    const h = getTerrainHeight(tx, tz);
    if (h < 0.75) continue;
    const palm = _createPalmTree(0.9 + rand() * 0.35);
    palm.position.set(tx, h - 0.1, tz);
    palm.rotation.y = rand() * Math.PI * 2;
    scene.add(palm);
    obstacles.push({ x: tx, z: tz, r: 0.75 });
  }

  // Beach Umbrella & Towel near center-south
  const ux = isl.x - 2;
  const uz = isl.z + 8;
  const uy = getTerrainHeight(ux, uz);
  const umbrella = new THREE.Group();
  umbrella.position.set(ux, uy, uz);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.0, 6),
    new THREE.MeshStandardMaterial({ color: 0xf2e4c8 })
  );
  pole.position.y = 1.5;
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 0.85, 8),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b, flatShading: true })
  );
  top.position.y = 2.95;
  top.castShadow = true;
  const towel = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.06, 2.7),
    new THREE.MeshStandardMaterial({ color: 0x4ecdc4 })
  );
  towel.position.set(1.2, 0.04, 0.4);
  towel.rotation.y = 0.25;
  umbrella.add(pole, top, towel);
  scene.add(umbrella);
  obstacles.push({ x: ux, z: uz, r: 0.6 });

  // Tiki Torches
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    emissive: 0xff6d00,
    emissiveIntensity: 0.75
  });
  timeWeather.registerNightMaterial(flameMat, 1.5);
  for (const [ox, oz] of [[4, -5], [-7, -2], [8, 4]]) {
    const tx = isl.x + ox;
    const tz = isl.z + oz;
    const th = getTerrainHeight(tx, tz);
    const torch = new THREE.Group();
    torch.position.set(tx, th, tz);
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 2.1, 5),
      new THREE.MeshStandardMaterial({ color: 0x7f4f24 })
    );
    stick.position.y = 1.05;
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), flameMat);
    flame.position.y = 2.3;
    torch.add(stick, flame);
    scene.add(torch);
    animatedProps.push({ type: 'bob', mesh: flame, baseY: 2.3, speed: 4.5, amp: 0.08 });
  }

  // Tropical Hibiscus & Starfish
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 5 + rand() * 14;
    const fx = isl.x + Math.cos(a) * r;
    const fz = isl.z + Math.sin(a) * r;
    const fh = getTerrainHeight(fx, fz);
    if (fh < 0.7) continue;
    const f = _createFlowerPatch(i % 2 ? 0xff4d6d : 0xffbe0b);
    f.position.set(fx, fh, fz);
    scene.add(f);
  }
}

function _buildSakuraIslandProps(scene, isl, timeWeather, obstacles) {
  const rand = seededRandom(303);

  // Red Wooden Torii Gate
  const gx = isl.x + 8;
  const gz = isl.z + 5;
  const gy = getTerrainHeight(gx, gz);
  const torii = new THREE.Group();
  torii.position.set(gx, gy, gz);
  torii.rotation.y = -0.7;
  const redMat = new THREE.MeshStandardMaterial({ color: 0xd64045, flatShading: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, flatShading: true });
  for (const px of [-1.7, 1.7]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.4, 7), redMat);
    pillar.position.set(px, 2.2, 0);
    pillar.castShadow = true;
    torii.add(pillar);
  }
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.36, 0.55), redMat);
  beam1.position.y = 4.25;
  beam1.castShadow = true;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 0.7), darkMat);
  cap.position.y = 4.52;
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.25, 0.36), redMat);
  beam2.position.y = 3.45;
  torii.add(beam1, cap, beam2);
  scene.add(torii);
  obstacles.push({ x: gx - 1.3, z: gz + 1.0, r: 0.45 });
  obstacles.push({ x: gx + 1.3, z: gz - 1.0, r: 0.45 });

  // Stone Lanterns
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb7b7a4, flatShading: true });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xfff3b0, emissive: 0xffb703, emissiveIntensity: 0.65 });
  timeWeather.registerNightMaterial(glowMat, 1.5);
  for (const [ox, oz] of [[2, -10], [-11, 5], [10, -4]]) {
    const lx = isl.x + ox;
    const lz = isl.z + oz;
    const lh = getTerrainHeight(lx, lz);
    if (lh < 0.7 || getPondAt(lx, lz)) continue;
    const lan = new THREE.Group();
    lan.position.set(lx, lh, lz);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.38, 1.4, 6), stoneMat);
    base.position.y = 0.7;
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.52, 0.45), glowMat);
    core.position.y = 1.65;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.45, 6), stoneMat);
    roof.position.y = 2.15;
    lan.add(base, core, roof);
    scene.add(lan);
    obstacles.push({ x: lx, z: lz, r: 0.55 });
  }

  // Sakura Trees & Bamboo
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rand() * 0.25;
    const r = 10 + rand() * 11;
    const tx = isl.x + Math.cos(a) * r;
    const tz = isl.z + Math.sin(a) * r;
    const th = getTerrainHeight(tx, tz);
    if (th < 0.85 || getPondAt(tx, tz)) continue;
    const obj = i % 3 === 0 ? _createBambooCluster() : _createSakuraTree(0.85 + rand() * 0.35);
    obj.position.set(tx, th - 0.1, tz);
    obj.rotation.y = rand() * Math.PI * 2;
    scene.add(obj);
    obstacles.push({ x: tx, z: tz, r: 0.9 });
  }

  // Pink flowers
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 7 + rand() * 13;
    const fx = isl.x + Math.cos(a) * r;
    const fz = isl.z + Math.sin(a) * r;
    const fh = getTerrainHeight(fx, fz);
    if (fh < 0.9 || getPondAt(fx, fz)) continue;
    const f = _createFlowerPatch(i % 2 ? 0xffb3c6 : 0xffffff);
    f.position.set(fx, fh, fz);
    scene.add(f);
  }
}

function _buildRuinsIslandProps(scene, isl, timeWeather, obstacles, animatedProps) {
  const rand = seededRandom(404);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d9996, flatShading: true, roughness: 0.95 });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x72efdd,
    emissive: 0x48bfe3,
    emissiveIntensity: 0.85,
    flatShading: true,
    roughness: 0.2
  });
  timeWeather.registerNightMaterial(crystalMat, 1.75);

  // Ancient Stone Archway & Altar at center
  const ax = isl.x - 1;
  const az = isl.z - 2;
  const ay = getTerrainHeight(ax, az);
  const altar = new THREE.Group();
  altar.position.set(ax, ay, az);

  const dais = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 0.55, 8), stoneMat);
  dais.position.y = 0.25;
  dais.receiveShadow = true;
  altar.add(dais);

  // Floating Starlight Crystal above altar
  const mainCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.15, 0), crystalMat);
  mainCrystal.scale.set(0.75, 1.45, 0.75);
  mainCrystal.position.y = 3.2;
  altar.add(mainCrystal);
  animatedProps.push({ type: 'crystal', mesh: mainCrystal, baseY: 3.2 });

  // Surrounding mossy pillars
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = Math.cos(a) * 5.6;
    const pz = Math.sin(a) * 5.6;
    const ph = i % 2 === 0 ? 4.4 : 2.9;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, ph, 7), stoneMat);
    pillar.position.set(px, ph / 2, pz);
    pillar.castShadow = true;
    altar.add(pillar);
    obstacles.push({ x: ax + px, z: az + pz, r: 0.65 });
  }
  scene.add(altar);

  // Scattered crystals & dark pines
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const r = 11 + rand() * 9;
    const tx = isl.x + Math.cos(a) * r;
    const tz = isl.z + Math.sin(a) * r;
    const th = getTerrainHeight(tx, tz);
    if (th < 0.85 || getPondAt(tx, tz)) continue;
    if (i % 3 === 0) {
      const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), crystalMat);
      crys.scale.set(0.65, 1.6, 0.65);
      crys.position.set(tx, th + 0.9, tz);
      scene.add(crys);
      animatedProps.push({ type: 'crystal', mesh: crys, baseY: th + 0.9 });
      obstacles.push({ x: tx, z: tz, r: 0.65 });
    } else {
      const pine = _createPineTree(0.9 + rand() * 0.35, 0x2d6a5e);
      pine.position.set(tx, th - 0.1, tz);
      scene.add(pine);
      obstacles.push({ x: tx, z: tz, r: 0.9 });
    }
  }
}

function _buildSkyClouds(scene, animatedProps) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.9
  });
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group();
    const parts = 3 + (i % 3);
    for (let j = 0; j < parts; j++) {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4 + (j % 2) * 1.1, 0), mat);
      puff.position.set((j - 1) * 2.5, (j % 2) * 0.7, (j % 2 - 0.5) * 1.4);
      puff.scale.set(1.2, 0.62, 0.95);
      g.add(puff);
    }
    const cx = (Math.random() - 0.5) * 320;
    const cz = (Math.random() - 0.5) * 320;
    const cy = 28 + Math.random() * 14;
    g.position.set(cx, cy, cz);
    scene.add(g);
    animatedProps.push({ type: 'cloud', mesh: g, speed: 0.7 + Math.random() * 0.9 });
  }
}

export function updateAnimatedProps(animatedProps, dt, time) {
  for (const p of animatedProps) {
    if (p.type === 'crystal') {
      p.mesh.rotation.y += dt * 0.85;
      p.mesh.position.y = p.baseY + Math.sin(time * 2.2 + p.baseY) * 0.22;
    } else if (p.type === 'bob') {
      p.mesh.position.y = p.baseY + Math.sin(time * p.speed) * p.amp;
      p.mesh.rotation.y += dt * 2.0;
    } else if (p.type === 'pulse') {
      const s = 1 + Math.sin(time * 3.0) * 0.08;
      p.mesh.scale.set(s, s, 1);
    } else if (p.type === 'cloud') {
      p.mesh.position.x += p.speed * dt;
      if (p.mesh.position.x > 180) p.mesh.position.x = -180;
    }
  }
}
