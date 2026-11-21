import * as THREE from 'three';

function makeMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: opts.flatShading !== undefined ? opts.flatShading : true,
    roughness: opts.roughness !== undefined ? opts.roughness : 0.68,
    metalness: opts.metalness !== undefined ? opts.metalness : 0.06,
    emissive: opts.emissive !== undefined ? opts.emissive : 0x000000,
    emissiveIntensity: opts.emissiveIntensity !== undefined ? opts.emissiveIntensity : 0,
    transparent: Boolean(opts.transparent),
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    side: opts.side || THREE.FrontSide
  });
}

function addEyes(parent, x, y, z, r = 0.032, mat = null, pupilMat = null) {
  const m = mat || makeMat(0x181412, { roughness: 0.25 });
  const geo = new THREE.SphereGeometry(r, 6, 5);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(geo, m);
    eye.position.set(sx * x, y, z);
    parent.add(eye);
    if (pupilMat) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(r * 0.52, 5, 4), pupilMat);
      p.position.set(sx * (x + r * 0.12), y, z + r * 0.62);
      parent.add(p);
    }
  }
}

function addAntennae(parent, mat, { x = 0.05, y = 0.12, z = 0.22, len = 0.24, spread = 0.45, pitch = 0.55, club = false, feathery = false, clubMat = null } = {}) {
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group();
    piv.position.set(sx * x, y, z);
    piv.rotation.x = pitch;
    piv.rotation.z = -sx * spread;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, len, 4), mat);
    stem.position.y = len * 0.5;
    piv.add(stem);
    if (club) {
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.026, 5, 4), clubMat || mat);
      tip.position.y = len;
      piv.add(tip);
    }
    if (feathery) {
      for (let i = 0; i < 4; i++) {
        const frond = new THREE.Mesh(new THREE.BoxGeometry(0.085 - i * 0.01, 0.014, 0.014), clubMat || mat);
        frond.position.set(sx * 0.03, len * (0.35 + i * 0.18), 0);
        piv.add(frond);
      }
    }
    parent.add(piv);
  }
}

function addSixLegs(group, mat, { spreadX = 0.24, y = 0.12, zOffsets = [-0.18, 0, 0.18], len = 0.22, thickness = 0.038, tilt = -0.45, jointMat = null } = {}) {
  for (const sx of [-1, 1]) {
    for (let i = 0; i < zOffsets.length; i++) {
      const sz = zOffsets[i];
      const leg = new THREE.Mesh(new THREE.BoxGeometry(len, thickness, thickness), jointMat && i === 1 ? jointMat : mat);
      leg.position.set(sx * spreadX, y, sz);
      leg.rotation.z = sx * tilt;
      leg.rotation.y = sx * (i === 0 ? 0.25 : i === 2 ? -0.25 : 0);
      group.add(leg);
    }
  }
}

function addFourLegs(group, mat, { x = 0.18, zFront = 0.2, zBack = -0.2, y = 0.09, lenX = 0.15, h = 0.08, w = 0.08, footMat = null, toePads = false, pillar = false } = {}) {
  for (const [lx, lz] of [[-x, zFront], [x, zFront], [-x, zBack], [x, zBack]]) {
    const sx = Math.sign(lx);
    if (pillar) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.55, w * 0.68, h, 6), mat);
      leg.position.set(lx, h * 0.5, lz);
      leg.castShadow = true;
      group.add(leg);
      if (footMat) {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, 0.04, w * 1.15), footMat);
        claw.position.set(lx, 0.02, lz + 0.03);
        group.add(claw);
      }
    } else {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(lenX, h, w), mat);
      leg.position.set(lx, y, lz);
      leg.rotation.z = sx * -0.22;
      group.add(leg);
      if (toePads) {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.025, 6), footMat || mat);
        pad.position.set(lx + sx * (lenX * 0.45), 0.025, lz + 0.02);
        group.add(pad);
      }
    }
  }
}

function addGlowHalo(group, color, radius = 0.32, y = 0.15, opacity = 0.34) {
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 8, 6),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
  );
  halo.position.y = y;
  group.add(halo);
  return halo;
}

function createWingPivots(group, y = 0.02, offsetX = 0.04) {
  const wingL = new THREE.Group();
  wingL.position.set(-offsetX, y, 0);
  const wingR = new THREE.Group();
  wingR.position.set(offsetX, y, 0);
  group.add(wingL, wingR);
  return { wingL, wingR };
}

function createTailPivot(group, y = 0.16, z = -0.28) {
  const tail = new THREE.Group();
  tail.position.set(0, y, z);
  group.add(tail);
  return tail;
}

// ============================================================================
// INDIVIDUAL INSECT BUILDERS (24 UNIQUE SPECIES)
// ============================================================================

const BUG_BUILDERS = {
  // 1. 紋白蝶 — Creamy white rounded wings, charcoal forewing tips & twin dark spots
  cabbage_butterfly() {
    const g = new THREE.Group();
    const whiteMat = makeMat(0xfefae0, { roughness: 0.72 });
    const creamMat = makeMat(0xf4ecc2, { roughness: 0.78 });
    const tipMat = makeMat(0x3a3a3a, { roughness: 0.7 });
    const bodyMat = makeMat(0x525049);

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.24, 4, 6), bodyMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    addAntennae(g, bodyMat, { x: 0.025, y: 0.04, z: 0.14, len: 0.17, club: true });

    const { wingL, wingR } = createWingPivots(g, 0.02, 0.03);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 7), whiteMat);
      fore.scale.set(1.15, 1, 0.92);
      fore.position.set(sx * 0.25, 0, 0.09);
      piv.add(fore);

      const hind = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.018, 7), creamMat);
      hind.scale.set(1.0, 1, 1.05);
      hind.position.set(sx * 0.17, -0.005, -0.14);
      piv.add(hind);

      // Iconic dark charcoal corner tip
      const corner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.024, 0.11), tipMat);
      corner.position.set(sx * 0.42, 0.004, 0.2);
      corner.rotation.y = sx * 0.35;
      piv.add(corner);

      // Two distinctive black spots on forewing
      const spot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.026, 6), tipMat);
      spot1.position.set(sx * 0.25, 0.005, 0.11);
      const spot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.026, 6), tipMat);
      spot2.position.set(sx * 0.21, 0.005, -0.01);
      piv.add(spot1, spot2);
    }
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 2. 七星瓢蟲 — Glossy crimson dome, center seam, 7 black spots, white-cheeked black pronotum
  ladybug() {
    const g = new THREE.Group();
    const redMat = makeMat(0xe63946, { roughness: 0.24, metalness: 0.08 });
    const blackMat = makeMat(0x1b1918, { roughness: 0.32 });
    const whiteMat = makeMat(0xfffcf5);

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
      redMat
    );
    shell.scale.set(1.02, 0.92, 1.18);
    shell.position.set(0, 0.08, -0.04);
    shell.castShadow = true;
    g.add(shell);

    // Center elytra seam
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.03, 0.52), blackMat);
    seam.position.set(0, 0.295, -0.06);
    g.add(seam);

    // 7 distinct black spots (1 center front + 3 left + 3 right)
    const dotGeo = new THREE.SphereGeometry(0.042, 6, 5);
    const spots = [
      [0, 0.305, 0.12],
      [-0.12, 0.275, 0.08], [0.12, 0.275, 0.08],
      [-0.17, 0.23, -0.06], [0.17, 0.23, -0.06],
      [-0.09, 0.255, -0.19], [0.09, 0.255, -0.19]
    ];
    for (const [dx, dy, dz] of spots) {
      const dot = new THREE.Mesh(dotGeo, blackMat);
      dot.scale.set(1, 0.55, 1);
      dot.position.set(dx, dy, dz);
      g.add(dot);
    }

    // Black pronotum & head with 2 white cheek dots
    const pronotum = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 6), blackMat);
    pronotum.scale.set(1.15, 0.72, 0.78);
    pronotum.position.set(0, 0.17, 0.22);
    g.add(pronotum);

    for (const sx of [-0.1, 0.1]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.036, 5, 4), whiteMat);
      cheek.position.set(sx, 0.22, 0.24);
      g.add(cheek);
    }
    addAntennae(g, blackMat, { x: 0.05, y: 0.15, z: 0.32, len: 0.12, pitch: 0.9, club: true });
    addSixLegs(g, blackMat, { spreadX: 0.24, y: 0.07, zOffsets: [-0.14, 0.0, 0.13], len: 0.16, thickness: 0.03 });
    g.scale.setScalar(0.95);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 3. 帝王斑蝶 — Vivid orange wings framed with thick black margins, dark veins & white border beads
  monarch_butterfly() {
    const g = new THREE.Group();
    const orangeMat = makeMat(0xf48c25, { roughness: 0.55 });
    const deepOrange = makeMat(0xd95f18, { roughness: 0.58 });
    const blackMat = makeMat(0x1b1918, { roughness: 0.65 });
    const whiteMat = makeMat(0xffffff, { roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.3, 4, 6), blackMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    addAntennae(g, blackMat, { x: 0.025, y: 0.045, z: 0.18, len: 0.22, club: true });

    const { wingL, wingR } = createWingPivots(g, 0.02, 0.035);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      // Black outer silhouette frame (forewing + hindwing)
      const foreRim = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.022, 0.34), blackMat);
      foreRim.position.set(sx * 0.27, 0, 0.12);
      foreRim.rotation.y = sx * -0.18;
      piv.add(foreRim);

      const foreInner = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.026, 0.23), orangeMat);
      foreInner.position.set(sx * 0.23, 0.002, 0.11);
      foreInner.rotation.y = sx * -0.18;
      piv.add(foreInner);

      // Dark vein stripes across forewing
      for (const vz of [0.05, 0.15]) {
        const vein = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.028, 0.022), blackMat);
        vein.position.set(sx * 0.24, 0.004, vz);
        vein.rotation.y = sx * -0.22;
        piv.add(vein);
      }

      const hindRim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 7), blackMat);
      hindRim.scale.set(1.05, 1, 1.15);
      hindRim.position.set(sx * 0.2, -0.004, -0.17);
      piv.add(hindRim);

      const hindInner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 7), deepOrange);
      hindInner.scale.set(1.02, 1, 1.12);
      hindInner.position.set(sx * 0.18, -0.002, -0.15);
      piv.add(hindInner);

      // Iconic white dots along black outer margin
      for (let i = 0; i < 3; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 4, 4), whiteMat);
        dot.position.set(sx * (0.48 - i * 0.03), 0.014, 0.24 - i * 0.09);
        piv.add(dot);
      }
    }
    g.scale.setScalar(1.08);
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 4. 紅蜻蜓 — Slender segmented crimson tail, big compound eyes, 4 translucent iridescent wings
  red_dragonfly() {
    const g = new THREE.Group();
    const redMat = makeMat(0xd9483b, { roughness: 0.35, metalness: 0.15 });
    const darkRed = makeMat(0x8c241b, { roughness: 0.4 });
    const eyeMat = makeMat(0x6e1812, { roughness: 0.18, metalness: 0.25 });
    const wingMat = makeMat(0xe8f9ff, { transparent: true, opacity: 0.58, roughness: 0.15, metalness: 0.2, side: THREE.DoubleSide });
    const stigmaMat = makeMat(0x3a201d);

    // Thorax
    const thorax = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.22), redMat);
    thorax.position.set(0, 0.02, 0.12);
    g.add(thorax);

    // Head with huge bulging compound eyes
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 6, 5), darkRed);
    head.position.set(0, 0.04, 0.28);
    g.add(head);
    addEyes(g, 0.068, 0.06, 0.31, 0.052, eyeMat);

    // Segmented slender crimson abdomen
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036 - i * 0.003, 0.04 - i * 0.003, 0.14, 6),
        i % 2 === 0 ? redMat : darkRed
      );
      seg.rotation.x = Math.PI / 2;
      seg.position.set(0, 0.01, -0.05 - i * 0.125);
      g.add(seg);
    }

    // 4 translucent elongated wings (fore + hind per pivot)
    const { wingL, wingR } = createWingPivots(g, 0.07, 0.05);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      const fore = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.012, 0.11), wingMat);
      fore.position.set(sx * 0.29, 0.01, 0.14);
      fore.rotation.y = sx * -0.14;
      piv.add(fore);

      const stigma1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.016, 0.03), stigmaMat);
      stigma1.position.set(sx * 0.5, 0.012, 0.18);
      piv.add(stigma1);

      const hind = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.012, 0.125), wingMat);
      hind.position.set(sx * 0.25, -0.01, 0.01);
      hind.rotation.y = sx * 0.12;
      piv.add(hind);
    }
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 5. 雨天蝸牛 — Banded spiral-coiled caramel shell, soft cream foot & tall eye stalks
  snail() {
    const g = new THREE.Group();
    const shellMain = makeMat(0xbc8a5f, { roughness: 0.45 });
    const shellBand = makeMat(0x7c4d2b, { roughness: 0.48 });
    const footMat = makeMat(0xf1dec9, { roughness: 0.85 });
    const eyeMat = makeMat(0x1e1815);

    // Soft elongated muscular foot
    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 5, 7), footMat);
    foot.rotation.x = Math.PI / 2;
    foot.scale.set(1.05, 1.0, 0.65);
    foot.position.set(0, 0.065, 0.06);
    foot.castShadow = true;
    g.add(foot);

    // Coiled spiral shell built from layered offset torus + domes
    const shellGroup = new THREE.Group();
    shellGroup.position.set(0, 0.24, -0.05);
    shellGroup.rotation.x = -0.22;

    const outerCoil = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.095, 7, 12), shellMain);
    outerCoil.rotation.y = Math.PI / 2;
    outerCoil.castShadow = true;
    shellGroup.add(outerCoil);

    const bandCoil = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.042, 6, 12), shellBand);
    bandCoil.rotation.y = Math.PI / 2;
    bandCoil.scale.set(1.06, 1.06, 2.3);
    shellGroup.add(bandCoil);

    const innerCap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 6), shellBand);
    innerCap.scale.set(1.45, 0.9, 0.9);
    shellGroup.add(innerCap);

    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 6), shellMain);
    apex.rotation.z = -Math.PI / 2;
    apex.position.set(0.16, 0, 0);
    shellGroup.add(apex);
    g.add(shellGroup);

    // Extended twin upper eye stalks + lower feelers
    for (const sx of [-1, 1]) {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.18, 5), footMat);
      stalk.position.set(sx * 0.055, 0.18, 0.31);
      stalk.rotation.x = 0.42;
      stalk.rotation.z = -sx * 0.25;
      g.add(stalk);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 5, 5), eyeMat);
      eye.position.set(sx * 0.08, 0.26, 0.35);
      g.add(eye);

      const feeler = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.08, 4), footMat);
      feeler.position.set(sx * 0.04, 0.06, 0.33);
      feeler.rotation.x = Math.PI * 0.42;
      g.add(feeler);
    }
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 6. 鈴蟲 — Sleek dark-brown bell cricket, flat teardrop singing wings, huge bent jumping legs & sweeping antennae
  cricket() {
    const g = new THREE.Group();
    const bodyMat = makeMat(0x3a2c22, { roughness: 0.45 });
    const wingMat = makeMat(0x5c4635, { roughness: 0.55 });
    const legMat = makeMat(0x2b2018, { roughness: 0.55 });

    // Slim tapered abdomen + flat wide acoustic singing wings (鈴蟲寬圓鳴翅!)
    const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.17, 7, 6), bodyMat);
    abdomen.scale.set(0.92, 0.58, 1.48);
    abdomen.position.set(0, 0.14, -0.08);
    abdomen.castShadow = true;
    g.add(abdomen);

    const wingCover = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.045, 7), wingMat);
    wingCover.scale.set(1.05, 1, 1.38);
    wingCover.position.set(0, 0.21, -0.1);
    g.add(wingCover);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), bodyMat);
    head.position.set(0, 0.16, 0.22);
    g.add(head);
    addEyes(g, 0.065, 0.18, 0.27, 0.026);

    // Extra-long sweeping cricket antennae
    addAntennae(g, legMat, { x: 0.04, y: 0.18, z: 0.29, len: 0.46, spread: 0.55, pitch: 0.9 });

    // Muscular folded hind jumping legs (V-shaped!)
    for (const sx of [-1, 1]) {
      const femur = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.09, 0.28), legMat);
      femur.position.set(sx * 0.2, 0.21, -0.1);
      femur.rotation.x = -0.65;
      femur.rotation.y = sx * 0.2;
      g.add(femur);

      const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.34, 4), legMat);
      tibia.position.set(sx * 0.23, 0.14, -0.25);
      tibia.rotation.x = 0.72;
      g.add(tibia);

      // Front & mid legs
      for (const lz of [0.06, 0.17]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.028), legMat);
        leg.position.set(sx * 0.15, 0.08, lz);
        leg.rotation.z = sx * -0.45;
        g.add(leg);
      }

      // Twin tail cerci
      const cercus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.016, 0.2, 4), legMat);
      cercus.position.set(sx * 0.06, 0.14, -0.37);
      cercus.rotation.x = -Math.PI * 0.42;
      cercus.rotation.z = sx * -0.22;
      g.add(cercus);
    }
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 7. 珊瑚寄居蟹 — Tilted pastel striped spiral sea shell, coral crab body, big left claw & stalked eyes
  hermit_crab() {
    const g = new THREE.Group();
    const crabMat = makeMat(0xf76c45, { roughness: 0.52 });
    const clawMat = makeMat(0xe8482e, { roughness: 0.42 });
    const shellPink = makeMat(0xffc2b4, { roughness: 0.55 });
    const shellCream = makeMat(0xfff1e6, { roughness: 0.6 });
    const shellCoral = makeMat(0xe07a5f, { roughness: 0.5 });

    // Conical spiral snail shell tilted back on its body
    const shell = new THREE.Group();
    shell.position.set(0, 0.24, -0.08);
    shell.rotation.x = -0.58;
    shell.rotation.z = 0.22;
    const tiers = [
      { r1: 0.21, r2: 0.17, h: 0.16, y: 0, m: shellPink },
      { r1: 0.17, r2: 0.12, h: 0.15, y: 0.13, m: shellCream },
      { r1: 0.12, r2: 0.07, h: 0.13, y: 0.24, m: shellCoral },
      { r1: 0.07, r2: 0.01, h: 0.12, y: 0.34, m: shellPink }
    ];
    for (const t of tiers) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(t.r2, t.r1, t.h, 8), t.m);
      seg.position.y = t.y;
      seg.castShadow = true;
      shell.add(seg);
    }
    g.add(shell);

    // Coral-orange crab front emerging from shell opening
    const front = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 6), crabMat);
    front.scale.set(1.1, 0.72, 0.95);
    front.position.set(0, 0.13, 0.16);
    g.add(front);

    // Asymmetric claws (big left crusher claw + smaller right claw)
    const bigClaw = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 5), clawMat);
    bigClaw.scale.set(0.95, 0.75, 1.35);
    bigClaw.position.set(-0.17, 0.13, 0.33);
    bigClaw.rotation.y = 0.3;
    const smallClaw = new THREE.Mesh(new THREE.SphereGeometry(0.078, 6, 5), clawMat);
    smallClaw.scale.set(0.9, 0.7, 1.25);
    smallClaw.position.set(0.15, 0.12, 0.31);
    smallClaw.rotation.y = -0.25;
    g.add(bigClaw, smallClaw);

    // Cute stalked crab eyes
    for (const sx of [-0.06, 0.06]) {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.1, 4), crabMat);
      stalk.position.set(sx, 0.22, 0.26);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 5, 5), makeMat(0x181412));
      eye.position.set(sx, 0.27, 0.27);
      g.add(stalk, eye);
    }

    // 4 jointed walking legs
    for (const sx of [-1, 1]) {
      for (const [lz, rx] of [[0.14, -0.2], [0.02, 0.15]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.042), crabMat);
        leg.position.set(sx * 0.23, 0.08, lz);
        leg.rotation.z = sx * -0.45;
        leg.rotation.y = sx * rx;
        g.add(leg);
      }
    }
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 8. 獨角仙 — Glossy mahogany Japanese rhino beetle with unmistakable Y-forked upward horn!
  rhino_beetle() {
    const g = new THREE.Group();
    const shellMat = makeMat(0x5c2c16, { roughness: 0.24, metalness: 0.22 });
    const darkMat = makeMat(0x36190d, { roughness: 0.28, metalness: 0.25 });

    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.29, 9, 7), shellMat);
    elytra.scale.set(0.96, 0.74, 1.32);
    elytra.position.set(0, 0.23, -0.1);
    elytra.castShadow = true;
    g.add(elytra);

    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.56), darkMat);
    seam.position.set(0, 0.435, -0.1);
    g.add(seam);

    const thorax = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), darkMat);
    thorax.scale.set(1.05, 0.78, 0.92);
    thorax.position.set(0, 0.23, 0.22);
    thorax.castShadow = true;
    g.add(thorax);

    // Small thoracic horn
    const miniHorn = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.15, 5), darkMat);
    miniHorn.position.set(0, 0.38, 0.24);
    miniHorn.rotation.x = 0.45;
    g.add(miniHorn);

    // Iconic long upward-curving head horn with Y-forked crown tip!
    const hornBase = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.052, 0.44, 6), darkMat);
    hornBase.position.set(0, 0.34, 0.45);
    hornBase.rotation.x = Math.PI * 0.28;
    g.add(hornBase);

    for (const sx of [-1, 1]) {
      const fork = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.16, 4), darkMat);
      fork.position.set(sx * 0.055, 0.53, 0.61);
      fork.rotation.z = -sx * 0.55;
      fork.rotation.x = 0.25;
      g.add(fork);
    }

    addSixLegs(g, darkMat, { spreadX: 0.26, y: 0.12, len: 0.24 });
    g.scale.setScalar(1.08);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 9. 深山鍬形蟲 — Chestnut stag beetle with wide flaring ear-like head crown ridges & amber leg patches
  miyama_stag() {
    const g = new THREE.Group();
    const bodyMat = makeMat(0x4a3020, { roughness: 0.35, metalness: 0.18 });
    const jawMat = makeMat(0x2b1b12, { roughness: 0.3, metalness: 0.22 });
    const amberMat = makeMat(0xc99238, { roughness: 0.4 });

    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), bodyMat);
    elytra.scale.set(0.92, 0.6, 1.38);
    elytra.position.set(0, 0.2, -0.14);
    elytra.castShadow = true;
    g.add(elytra);

    const thorax = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.22), bodyMat);
    thorax.position.set(0, 0.2, 0.18);
    g.add(thorax);

    // Wide head with unmistakable Miyama "ear-like" flared crown plates (耳狀頭冠!)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.15, 0.22), jawMat);
    head.position.set(0, 0.21, 0.36);
    g.add(head);
    for (const sx of [-1, 1]) {
      const earCrest = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.18), bodyMat);
      earCrest.position.set(sx * 0.2, 0.26, 0.33);
      earCrest.rotation.z = sx * -0.4;
      g.add(earCrest);

      // Gently curved antler-like mandibles with mid tooth & forked tip
      const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.036, 0.44, 5), jawMat);
      jaw.rotation.x = Math.PI * 0.48;
      jaw.rotation.z = sx * 0.15;
      jaw.position.set(sx * 0.12, 0.22, 0.62);
      g.add(jaw);

      const midTooth = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), jawMat);
      midTooth.rotation.z = sx * Math.PI * 0.5;
      midTooth.position.set(sx * 0.06, 0.22, 0.64);
      g.add(midTooth);

      const fork = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.13, 4), jawMat);
      fork.rotation.z = sx * Math.PI * 0.38;
      fork.position.set(sx * 0.06, 0.23, 0.84);
      g.add(fork);
    }

    // Yellow-amber femur highlights characteristic of Miyama stag
    addSixLegs(g, jawMat, { spreadX: 0.24, y: 0.11, len: 0.22, jointMat: amberMat });
    g.scale.setScalar(1.06);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 10. 翡翠鳳蝶 — Velvety black swallowtail with glowing emerald bands & long hindwing tails (燕尾!)
  tropical_swallowtail() {
    const g = new THREE.Group();
    const blackMat = makeMat(0x162221, { roughness: 0.45 });
    const emeraldMat = makeMat(0x2ec4b6, { roughness: 0.22, metalness: 0.42, emissive: 0x0b524b, emissiveIntensity: 0.35 });
    const aquaMat = makeMat(0x72efdd, { roughness: 0.25, metalness: 0.35 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.32, 4, 6), blackMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    addAntennae(g, blackMat, { x: 0.025, y: 0.05, z: 0.18, len: 0.22, club: true });

    const { wingL, wingR } = createWingPivots(g, 0.02, 0.035);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      // Swept triangular black forewing
      const fore = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.022, 0.32), blackMat);
      fore.position.set(sx * 0.29, 0, 0.14);
      fore.rotation.y = sx * -0.28;
      piv.add(fore);

      // Luminous emerald diagonal band
      const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.026, 0.12), emeraldMat);
      band1.position.set(sx * 0.25, 0.004, 0.11);
      band1.rotation.y = sx * -0.32;
      piv.add(band1);

      // Hindwing with emerald center
      const hind = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.32), blackMat);
      hind.position.set(sx * 0.17, -0.005, -0.17);
      hind.rotation.y = sx * 0.14;
      piv.add(hind);

      const band2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.14), aquaMat);
      band2.position.set(sx * 0.16, -0.002, -0.12);
      piv.add(band2);

      // Iconic long swallowtail ribbon tail!
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.02, 0.26), blackMat);
      tail.position.set(sx * 0.18, -0.006, -0.4);
      tail.rotation.y = sx * -0.12;
      piv.add(tail);

      const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), aquaMat);
      tailTip.scale.set(1, 0.4, 1.3);
      tailTip.position.set(sx * 0.19, -0.004, -0.52);
      piv.add(tailTip);
    }
    g.scale.setScalar(1.1);
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 11. 櫻花蝶 — Delicate cherry-blossom petal wings with rose blush centers & golden accents
  sakura_butterfly() {
    const g = new THREE.Group();
    const petalMat = makeMat(0xffc2d4, { roughness: 0.55 });
    const roseMat = makeMat(0xff759f, { roughness: 0.5 });
    const goldMat = makeMat(0xffe08a, { roughness: 0.35, metalness: 0.2 });
    const bodyMat = makeMat(0x8c4a5e);

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.25, 4, 6), bodyMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    addAntennae(g, bodyMat, { x: 0.022, y: 0.04, z: 0.14, len: 0.18, club: true, clubMat: goldMat });

    const { wingL, wingR } = createWingPivots(g, 0.02, 0.03);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      // Twin-lobed sakura petal forewing (creates natural cherry-blossom notch!)
      const lobeA = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 7), petalMat);
      lobeA.scale.set(1.25, 1, 0.85);
      lobeA.position.set(sx * 0.25, 0, 0.16);
      const lobeB = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 7), petalMat);
      lobeB.scale.set(1.15, 1, 0.8);
      lobeB.position.set(sx * 0.24, 0, 0.01);
      piv.add(lobeA, lobeB);

      const blush = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 6), roseMat);
      blush.position.set(sx * 0.14, 0.004, 0.08);
      piv.add(blush);

      // Petal hindwing
      const hind = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.018, 7), petalMat);
      hind.scale.set(0.95, 1, 1.15);
      hind.position.set(sx * 0.15, -0.004, -0.17);
      piv.add(hind);

      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 5, 4), goldMat);
      dot.scale.set(1, 0.4, 1);
      dot.position.set(sx * 0.22, 0.01, -0.15);
      piv.add(dot);
    }
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 12. 星夜流螢 — Dark beetle body, signature coral-red pronotum, translucent wings & glowing lantern tail!
  firefly() {
    const g = new THREE.Group();
    const darkMat = makeMat(0x28262e, { roughness: 0.45 });
    const collarMat = makeMat(0xe75a4d, { roughness: 0.5 });
    const glowMat = makeMat(0xe9ff70, { emissive: 0xd9f94d, emissiveIntensity: 1.6, roughness: 0.2 });
    const wingMat = makeMat(0xd6d2c4, { transparent: true, opacity: 0.55, side: THREE.DoubleSide });

    // Dark head + signature red pronotum shield
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), darkMat);
    head.position.set(0, 0.02, 0.22);
    const pronotum = new THREE.Mesh(new THREE.SphereGeometry(0.085, 7, 5), collarMat);
    pronotum.scale.set(1.15, 0.65, 0.95);
    pronotum.position.set(0, 0.04, 0.12);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.16, 4, 6), darkMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.set(0, 0.02, -0.04);
    g.add(head, pronotum, torso);
    addAntennae(g, darkMat, { x: 0.03, y: 0.04, z: 0.26, len: 0.16, pitch: 0.85 });

    // Glowing lantern tail segments!
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), glowMat);
    lantern.scale.set(0.95, 0.85, 1.35);
    lantern.position.set(0, 0.0, -0.2);
    g.add(lantern);

    // Flapping open elytra + thin underwings
    const { wingL, wingR } = createWingPivots(g, 0.06, 0.04);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      const elytron = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.11), darkMat);
      elytron.position.set(sx * 0.13, 0.02, 0.04);
      elytron.rotation.y = sx * -0.32;
      const under = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.012, 0.12), wingMat);
      under.position.set(sx * 0.16, -0.01, -0.03);
      under.rotation.y = sx * 0.18;
      piv.add(elytron, under);
    }

    addGlowHalo(g, 0xe9ff70, 0.28, 0.0, 0.38);
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 13. 蘭花螳螂 — Upright white-and-blush orchid mantis with petal-lobed legs & folded scythe arms!
  orchid_mantis() {
    const g = new THREE.Group();
    const petalWhite = makeMat(0xfff5f8, { roughness: 0.55 });
    const blushPink = makeMat(0xffa6c1, { roughness: 0.52 });
    const deepRose = makeMat(0xe85d88, { roughness: 0.45 });
    const eyeMat = makeMat(0x7a324b, { roughness: 0.25 });

    // Flared heart-shaped orchid-petal abdomen angled slightly upward
    const abd = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), petalWhite);
    abd.scale.set(1.15, 0.52, 1.35);
    abd.position.set(0, 0.27, -0.14);
    abd.rotation.x = 0.25;
    abd.castShadow = true;
    g.add(abd);

    const abdRim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.16), blushPink);
    abdRim.position.set(0, 0.31, -0.24);
    abdRim.rotation.x = 0.25;
    g.add(abdRim);

    // Tall upright slender thorax
    const thorax = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.34, 6), petalWhite);
    thorax.position.set(0, 0.37, 0.14);
    thorax.rotation.x = 0.45;
    g.add(thorax);

    // Triangular mantis head with big side compound eyes
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.15, 3), blushPink);
    head.rotation.x = Math.PI;
    head.position.set(0, 0.54, 0.24);
    g.add(head);
    addEyes(g, 0.085, 0.56, 0.26, 0.036, eyeMat);
    addAntennae(g, deepRose, { x: 0.03, y: 0.58, z: 0.27, len: 0.2, spread: 0.4, pitch: 0.6 });

    // Folded raptorial praying-mantis scythe forearms!
    for (const sx of [-1, 1]) {
      const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), blushPink);
      upperArm.position.set(sx * 0.09, 0.38, 0.27);
      upperArm.rotation.x = -0.5;
      const scythe = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 4), deepRose);
      scythe.position.set(sx * 0.1, 0.28, 0.33);
      scythe.rotation.x = Math.PI * 0.72;
      g.add(upperArm, scythe);

      // 4 orchid-petal lobed walking legs (wide flat pink-white petal thighs!)
      for (const [lz, rotY] of [[0.03, -0.25], [-0.15, 0.32]]) {
        const petalThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.025, 6), blushPink);
        petalThigh.scale.set(1.3, 1, 0.85);
        petalThigh.position.set(sx * 0.23, 0.17, lz);
        petalThigh.rotation.z = sx * -0.6;
        petalThigh.rotation.y = sx * rotY;
        g.add(petalThigh);

        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 4), petalWhite);
        shin.position.set(sx * 0.31, 0.09, lz);
        shin.rotation.z = sx * -0.18;
        g.add(shin);
      }
    }
    g.scale.setScalar(1.05);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 14. 彩虹吉丁蟲 — Sleek elongated metallic emerald bullet body with twin magenta-gold racing stripes!
  jewel_beetle() {
    const g = new THREE.Group();
    const emeraldMat = makeMat(0x16c79a, { roughness: 0.16, metalness: 0.78 });
    const magentaMat = makeMat(0xe02898, { roughness: 0.18, metalness: 0.72 });
    const goldMat = makeMat(0xffd166, { roughness: 0.18, metalness: 0.75 });
    const darkTeal = makeMat(0x0c6b58, { roughness: 0.2, metalness: 0.65 });

    // Torpedo/bullet-shaped elongated slender elytra (玉蟲經典紡錘身型!)
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 7), emeraldMat);
    elytra.scale.set(0.72, 0.56, 1.95);
    elytra.position.set(0, 0.16, -0.06);
    elytra.castShadow = true;
    g.add(elytra);

    // Pointed tapered tail end
    const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 6), emeraldMat);
    tailTip.rotation.x = -Math.PI / 2;
    tailTip.scale.set(1.1, 1, 0.65);
    tailTip.position.set(0, 0.15, -0.45);
    g.add(tailTip);

    // Twin iridescent magenta-gold dorsal racing stripes!
    for (const sx of [-0.075, 0.075]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.028, 0.68), magentaMat);
      stripe.position.set(sx, 0.27, -0.06);
      g.add(stripe);
    }
    const midGold = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.03, 0.72), goldMat);
    midGold.position.set(0, 0.28, -0.05);
    g.add(midGold);

    // Sleek metallic pronotum & small head
    const pronotum = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 7), emeraldMat);
    pronotum.rotation.x = Math.PI / 2;
    pronotum.scale.set(1, 1, 0.7);
    pronotum.position.set(0, 0.17, 0.3);
    g.add(pronotum);

    addEyes(g, 0.08, 0.18, 0.39, 0.026);
    addAntennae(g, goldMat, { x: 0.04, y: 0.17, z: 0.42, len: 0.16, spread: 0.6, pitch: 0.95 });
    addSixLegs(g, darkTeal, { spreadX: 0.2, y: 0.09, zOffsets: [-0.2, 0.0, 0.2], len: 0.18, thickness: 0.03 });
    g.scale.setScalar(1.06);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 15. 大王花金龜 — Massive chunky burgundy elytra + stark ivory-white zebra-striped pronotum!
  goliath_beetle() {
    const g = new THREE.Group();
    const maroonMat = makeMat(0x631d25, { roughness: 0.58, metalness: 0.08 });
    const ivoryMat = makeMat(0xf8f6f0, { roughness: 0.62 });
    const blackMat = makeMat(0x1a1716, { roughness: 0.4 });

    // Massive broad velvety burgundy-maroon elytra
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.35, 9, 7), maroonMat);
    elytra.scale.set(1.05, 0.76, 1.24);
    elytra.position.set(0, 0.26, -0.14);
    elytra.castShadow = true;
    g.add(elytra);

    // White shoulder chevron triangles
    for (const sx of [-0.21, 0.21]) {
      const patch = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.18), ivoryMat);
      patch.position.set(sx, 0.42, 0.08);
      patch.rotation.y = sx > 0 ? 0.35 : -0.35;
      g.add(patch);
    }

    // Iconic stark-white pronotum with bold vertical black stripes!
    const pronotum = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), ivoryMat);
    pronotum.scale.set(1.12, 0.76, 0.95);
    pronotum.position.set(0, 0.27, 0.26);
    pronotum.castShadow = true;
    g.add(pronotum);

    for (const sx of [-0.14, -0.05, 0.05, 0.14]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.06, 0.44), blackMat);
      stripe.position.set(sx, 0.44 - Math.abs(sx) * 0.3, 0.26);
      g.add(stripe);
    }

    // White head + stubby Y-shaped shovel horn
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.18), ivoryMat);
    head.position.set(0, 0.23, 0.48);
    g.add(head);
    for (const sx of [-0.06, 0.06]) {
      const stub = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.16, 4), blackMat);
      stub.position.set(sx, 0.27, 0.61);
      stub.rotation.x = Math.PI * 0.36;
      stub.rotation.z = -sx * 0.35;
      g.add(stub);
    }

    addSixLegs(g, blackMat, { spreadX: 0.33, y: 0.14, zOffsets: [-0.22, 0.02, 0.24], len: 0.28, thickness: 0.052 });
    g.scale.setScalar(1.14);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 16. 彩虹鍬形蟲 — Iridescent emerald-magenta-gold metallic armor & smooth skyward-sweeping mandibles!
  rainbow_stag() {
    const g = new THREE.Group();
    const tealMat = makeMat(0x16c7b7, { roughness: 0.16, metalness: 0.78 });
    const magentaMat = makeMat(0xd946ef, { roughness: 0.18, metalness: 0.75 });
    const goldMat = makeMat(0xffbe3b, { roughness: 0.16, metalness: 0.8 });
    const darkIridescent = makeMat(0x1b4d5c, { roughness: 0.2, metalness: 0.65 });

    // Iridescent magenta-violet elytra with teal & gold highlights
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.25, 9, 7), magentaMat);
    elytra.scale.set(0.95, 0.64, 1.35);
    elytra.position.set(0, 0.21, -0.12);
    elytra.castShadow = true;
    g.add(elytra);

    // Emerald-gold iridescent sheen bands
    const sheen = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.56), tealMat);
    sheen.position.set(0, 0.36, -0.12);
    g.add(sheen);

    // Emerald-teal metallic thorax
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), tealMat);
    thorax.scale.set(1.1, 0.68, 0.88);
    thorax.position.set(0, 0.22, 0.22);
    g.add(thorax);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.2), goldMat);
    head.position.set(0, 0.22, 0.38);
    g.add(head);

    // Iconic smooth slender skyward-curving mandibles (彩虹鍬招牌上揚弧形大顎!)
    for (const sx of [-1, 1]) {
      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.032, 0.32, 5), goldMat);
      seg1.rotation.x = Math.PI * 0.44;
      seg1.rotation.z = sx * 0.14;
      seg1.position.set(sx * 0.11, 0.24, 0.58);
      g.add(seg1);

      const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.26, 5), magentaMat);
      seg2.rotation.x = Math.PI * 0.22; // curves gracefully upward!
      seg2.rotation.z = sx * -0.12;
      seg2.position.set(sx * 0.1, 0.36, 0.78);
      g.add(seg2);
    }

    addSixLegs(g, darkIridescent, { spreadX: 0.24, y: 0.11, len: 0.22, jointMat: goldMat });
    g.scale.setScalar(1.08);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 17. 美他利佛細身鍬形蟲 — Gleaming antique-bronze compact body & extraordinarily long straight serrated mandibles!
  cyclommatus_stag() {
    const g = new THREE.Group();
    const bronzeMat = makeMat(0xc49131, { roughness: 0.2, metalness: 0.78 });
    const darkBronze = makeMat(0x7c5514, { roughness: 0.24, metalness: 0.72 });

    // Compact metallic-bronze oval body (distinctly shorter than its giant mandibles!)
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bronzeMat);
    elytra.scale.set(0.86, 0.56, 1.28);
    elytra.position.set(0, 0.19, -0.22);
    elytra.castShadow = true;
    g.add(elytra);

    const thorax = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), darkBronze);
    thorax.position.set(0, 0.2, 0.06);
    g.add(thorax);

    // Wide broad flat metallic head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.22), bronzeMat);
    head.position.set(0, 0.21, 0.24);
    g.add(head);

    // Extraordinarily long slender straight bronze mandibles with serrated inner saw-teeth!
    for (const sx of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.034, 0.86, 6), bronzeMat);
      jaw.rotation.x = Math.PI * 0.52;
      jaw.rotation.z = sx * 0.06;
      jaw.position.set(sx * 0.12, 0.21, 0.72);
      g.add(jaw);

      // Fine serrated inner teeth along the straight mandible
      for (let t = 0; t < 4; t++) {
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.06, 4), darkBronze);
        tooth.rotation.z = sx * Math.PI * 0.5;
        tooth.position.set(sx * 0.085, 0.21, 0.52 + t * 0.16);
        g.add(tooth);
      }

      // Forked pincer tip
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.12, 4), darkBronze);
      tip.rotation.z = sx * Math.PI * 0.42;
      tip.position.set(sx * 0.07, 0.19, 1.15);
      g.add(tip);
    }

    addSixLegs(g, darkBronze, { spreadX: 0.23, y: 0.11, zOffsets: [-0.32, -0.14, 0.06], len: 0.22 });
    g.scale.setScalar(1.06);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 18. 寶石聖甲蟲 — Royal amethyst-violet domed scarab with golden Egyptian sun-crest & gem glow!
  scarab_beetle() {
    const g = new THREE.Group();
    const violetMat = makeMat(0x7b2cbf, { roughness: 0.15, metalness: 0.78, emissive: 0x3b0d69, emissiveIntensity: 0.55 });
    const goldMat = makeMat(0xffd166, { roughness: 0.18, metalness: 0.85, emissive: 0x8f6600, emissiveIntensity: 0.35 });
    const indigoMat = makeMat(0x3c1361, { roughness: 0.25, metalness: 0.6 });

    // Sculpted gem-like rounded dome carapace
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 7), violetMat);
    shell.scale.set(1.02, 0.72, 1.16);
    shell.position.set(0, 0.21, -0.06);
    shell.castShadow = true;
    g.add(shell);

    // Ornate gold midline & horizontal collar belt
    const midLine = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.035, 0.52), goldMat);
    midLine.position.set(0, 0.4, -0.08);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 5, 12), goldMat);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1.05, 1.18, 1);
    belt.position.set(0, 0.22, -0.06);
    g.add(midLine, belt);

    // Broad shield pronotum
    const pronotum = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.15, 8), violetMat);
    pronotum.scale.set(1.1, 1, 0.85);
    pronotum.position.set(0, 0.21, 0.22);
    g.add(pronotum);

    // Scalloped golden sun-crown clypeus (聖甲蟲鋸齒日輪頭冠!)
    for (let i = -2; i <= 2; i++) {
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 4), goldMat);
      ray.rotation.x = Math.PI * 0.46;
      ray.rotation.z = -i * 0.25;
      ray.position.set(i * 0.052, 0.2, 0.42 - Math.abs(i) * 0.025);
      g.add(ray);
    }

    addSixLegs(g, indigoMat, { spreadX: 0.26, y: 0.11, len: 0.22, jointMat: goldMat });
    addGlowHalo(g, 0x9d4edd, 0.34, 0.22, 0.26);
    g.scale.setScalar(1.04);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 19. 極光雪蛾 — Fluffy frost-white arctic silk moth, feathery plumes & aurora cyan/lavender eye-rings!
  snow_moth() {
    const g = new THREE.Group();
    const snowMat = makeMat(0xf0fbff, { roughness: 0.78, emissive: 0x8bd8f5, emissiveIntensity: 0.35 });
    const auroraMat = makeMat(0x72efdd, { roughness: 0.35, emissive: 0x48bfe3, emissiveIntensity: 0.55 });
    const lavMat = makeMat(0xc8b6ff, { roughness: 0.45, emissive: 0x8f75e8, emissiveIntensity: 0.35 });
    const goldMat = makeMat(0xffe08a);

    // Plump fluffy silk-moth torso
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), snowMat);
    body.scale.set(0.95, 0.9, 1.75);
    g.add(body);
    addAntennae(g, goldMat, { x: 0.04, y: 0.06, z: 0.18, len: 0.22, spread: 0.55, pitch: 0.5, feathery: true, clubMat: auroraMat });

    const { wingL, wingR } = createWingPivots(g, 0.03, 0.05);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.028, 8), snowMat);
      fore.scale.set(1.22, 1, 0.88);
      fore.position.set(sx * 0.3, 0, 0.1);
      piv.add(fore);

      const auroraEdge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.032, 0.36), auroraMat);
      auroraEdge.position.set(sx * 0.52, 0.004, 0.1);
      auroraEdge.rotation.y = sx * -0.16;
      piv.add(auroraEdge);

      const eyeSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.034, 7), lavMat);
      eyeSpot.position.set(sx * 0.28, 0.006, 0.11);
      piv.add(eyeSpot);

      const hind = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.024, 8), snowMat);
      hind.scale.set(1.05, 1, 1.0);
      hind.position.set(sx * 0.22, -0.005, -0.18);
      piv.add(hind);

      const hindGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 6), auroraMat);
      hindGlow.position.set(sx * 0.22, -0.002, -0.18);
      piv.add(hindGlow);
    }
    addGlowHalo(g, 0xbef5ff, 0.36, 0.02, 0.24);
    g.scale.setScalar(1.06);
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 20. 南洋大兜蟲 — Glossy metallic olive-bronze armor & 3 sweeping curved bull-like battle horns!
  atlas_beetle() {
    const g = new THREE.Group();
    const bronzeGreen = makeMat(0x2d4a32, { roughness: 0.18, metalness: 0.72 });
    const darkArmor = makeMat(0x18261a, { roughness: 0.22, metalness: 0.65 });
    const sheenGold = makeMat(0x6e8544, { roughness: 0.2, metalness: 0.75 });

    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.32, 9, 7), bronzeGreen);
    elytra.scale.set(1.02, 0.78, 1.28);
    elytra.position.set(0, 0.25, -0.14);
    elytra.castShadow = true;
    g.add(elytra);

    const thorax = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), sheenGold);
    thorax.scale.set(1.12, 0.85, 0.92);
    thorax.position.set(0, 0.27, 0.22);
    thorax.castShadow = true;
    g.add(thorax);

    // TWO sweeping side thoracic battle horns (curving outward then forward & up!)
    for (const sx of [-1, 1]) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.055, 0.38, 6), darkArmor);
      base.position.set(sx * 0.22, 0.34, 0.42);
      base.rotation.x = Math.PI * 0.42;
      base.rotation.z = sx * -0.35;
      g.add(base);

      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.34, 5), darkArmor);
      tip.position.set(sx * 0.22, 0.42, 0.7);
      tip.rotation.x = Math.PI * 0.34;
      tip.rotation.z = sx * 0.25;
      g.add(tip);
    }

    // Center curved head horn rising dramatically between the two side horns!
    const midBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.048, 0.36, 6), darkArmor);
    midBase.position.set(0, 0.21, 0.5);
    midBase.rotation.x = Math.PI * 0.4;
    const midTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.28, 5), darkArmor);
    midTip.position.set(0, 0.36, 0.72);
    midTip.rotation.x = Math.PI * 0.18;
    g.add(midBase, midTip);

    addSixLegs(g, darkArmor, { spreadX: 0.28, y: 0.13, len: 0.26, thickness: 0.044 });
    g.scale.setScalar(1.18);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 21. 月神蛾 — Luminous pale aqua-mint moon-moth with LONG ribbon hindwing tails & crescent moon eyes!
  lunar_moth() {
    const g = new THREE.Group();
    const moonMint = makeMat(0xa8f9ff, { roughness: 0.35, emissive: 0x56cfe1, emissiveIntensity: 0.65 });
    const paleGold = makeMat(0xfff0a5, { roughness: 0.3, emissive: 0xffd166, emissiveIntensity: 0.45 });
    const roseTrim = makeMat(0xd4a5d8, { roughness: 0.45 });
    const whiteBody = makeMat(0xf5feff, { emissive: 0x90e0ef, emissiveIntensity: 0.3 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.24, 5, 6), whiteBody);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    addAntennae(g, paleGold, { x: 0.04, y: 0.06, z: 0.16, len: 0.24, spread: 0.52, pitch: 0.55, feathery: true, clubMat: paleGold });

    const { wingL, wingR } = createWingPivots(g, 0.02, 0.045);
    for (const [piv, sx] of [[wingL, -1], [wingR, 1]]) {
      // Swept pointed moon-moth forewing with lavender-rose leading edge
      const fore = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.022, 0.32), moonMint);
      fore.position.set(sx * 0.31, 0, 0.14);
      fore.rotation.y = sx * -0.24;
      piv.add(fore);

      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.026, 0.05), roseTrim);
      trim.position.set(sx * 0.31, 0.004, 0.28);
      trim.rotation.y = sx * -0.24;
      piv.add(trim);

      // Golden moon eye-spot on forewing
      const eye1 = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 7), paleGold);
      eye1.position.set(sx * 0.28, 0.005, 0.12);
      piv.add(eye1);

      // Hindwing + SIGNATURE LONG TWISTING RIBBON TAIL!
      const hind = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.02, 7), moonMint);
      hind.scale.set(1.0, 1, 1.15);
      hind.position.set(sx * 0.2, -0.004, -0.18);
      piv.add(hind);

      const eye2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.028, 6), paleGold);
      eye2.position.set(sx * 0.2, 0, -0.16);
      piv.add(eye2);

      const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.02, 0.34), moonMint);
      ribbon1.position.set(sx * 0.19, -0.006, -0.46);
      ribbon1.rotation.y = sx * -0.16;
      const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.02, 0.22), paleGold);
      ribbon2.position.set(sx * 0.23, -0.006, -0.68);
      ribbon2.rotation.y = sx * 0.22;
      piv.add(ribbon1, ribbon2);
    }
    addGlowHalo(g, 0x90f1ff, 0.42, 0.02, 0.3);
    g.scale.setScalar(1.12);
    return { group: g, wingL, wingR, tailMesh: null };
  },

  // 22. 長頸鹿鋸鍬形蟲 — Obsidian jet-black sleek armor + world's longest wavy S-curved saw-toothed mandibles!
  giraffe_stag() {
    const g = new THREE.Group();
    const obsidianMat = makeMat(0x171616, { roughness: 0.16, metalness: 0.55 });
    const sheenMat = makeMat(0x2e2b29, { roughness: 0.22, metalness: 0.48 });

    // Elongated sleek jet-black elytra + pronotum
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.24, 9, 7), obsidianMat);
    elytra.scale.set(0.84, 0.56, 1.52);
    elytra.position.set(0, 0.2, -0.24);
    elytra.castShadow = true;
    g.add(elytra);

    const thorax = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.26), sheenMat);
    thorax.position.set(0, 0.21, 0.12);
    g.add(thorax);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.22), obsidianMat);
    head.position.set(0, 0.21, 0.34);
    g.add(head);

    // Iconic WAVY S-CURVED ultra-long saw-toothed mandibles (波浪狀超長大顎!)
    for (const sx of [-1, 1]) {
      // Base segment angling outward
      const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.036, 0.36, 5), obsidianMat);
      s1.rotation.x = Math.PI * 0.5;
      s1.rotation.z = sx * -0.26;
      s1.position.set(sx * 0.14, 0.22, 0.58);
      g.add(s1);

      // Middle segment waving inward
      const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.025, 0.36, 5), obsidianMat);
      s2.rotation.x = Math.PI * 0.5;
      s2.rotation.z = sx * 0.26;
      s2.position.set(sx * 0.15, 0.22, 0.88);
      g.add(s2);

      // Tip segment curving inward into sharp fork
      const s3 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.021, 0.28, 5), obsidianMat);
      s3.rotation.x = Math.PI * 0.5;
      s3.rotation.z = sx * 0.35;
      s3.position.set(sx * 0.08, 0.22, 1.14);
      g.add(s3);

      // Pronounced large basal tooth + mid saw teeth
      const bigTooth = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.1, 4), sheenMat);
      bigTooth.rotation.z = sx * Math.PI * 0.5;
      bigTooth.position.set(sx * 0.09, 0.22, 0.56);
      const midTooth = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.085, 4), sheenMat);
      midTooth.rotation.z = sx * Math.PI * 0.5;
      midTooth.position.set(sx * 0.11, 0.22, 0.84);
      g.add(bigTooth, midTooth);
    }

    addSixLegs(g, obsidianMat, { spreadX: 0.26, y: 0.11, zOffsets: [-0.36, -0.14, 0.1], len: 0.26 });
    g.scale.setScalar(1.14);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 23. 赫克力士長戟大兜蟲 — Ochre-gold black-spotted elytra, pitch-black thorax, colossal twin lance horns with golden fringe!
  hercules_beetle() {
    const g = new THREE.Group();
    const ochreMat = makeMat(0xdcb03e, { roughness: 0.26, metalness: 0.28 });
    const blackMat = makeMat(0x161412, { roughness: 0.2, metalness: 0.45 });
    const fuzzMat = makeMat(0xc48a28, { roughness: 0.85 });

    // Iconic golden-ochre elytra with irregular dark ink spots
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.33, 10, 7), ochreMat);
    elytra.scale.set(0.96, 0.74, 1.38);
    elytra.position.set(0, 0.25, -0.16);
    elytra.castShadow = true;
    g.add(elytra);

    const spotGeo = new THREE.SphereGeometry(0.045, 5, 4);
    for (const [dx, dy, dz, sc] of [
      [-0.14, 0.42, -0.04, 1.1], [0.16, 0.41, -0.18, 1.2],
      [-0.18, 0.36, -0.32, 0.9], [0.09, 0.44, -0.34, 0.85],
      [-0.06, 0.45, -0.2, 0.8], [0.21, 0.34, -0.02, 0.9]
    ]) {
      const sp = new THREE.Mesh(spotGeo, blackMat);
      sp.scale.set(sc, 0.45, sc);
      sp.position.set(dx, dy, dz);
      g.add(sp);
    }

    // Jet-black glossy pronotum
    const thorax = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), blackMat);
    thorax.scale.set(1.02, 0.82, 0.96);
    thorax.position.set(0, 0.26, 0.26);
    thorax.castShadow = true;
    g.add(thorax);

    // Colossal upper pronotum lance horn (長戟上角) + golden fuzzy underside fringe!
    const upperHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.066, 0.92, 6), blackMat);
    upperHorn.rotation.x = Math.PI * 0.48;
    upperHorn.position.set(0, 0.38, 0.76);
    g.add(upperHorn);

    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.045, 0.62), fuzzMat);
    fringe.position.set(0, 0.345, 0.8);
    fringe.rotation.x = -0.05;
    g.add(fringe);

    // Opposing curved lower cephalic horn (下角) with upward mid-tooth
    const lowerHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.046, 0.68, 6), blackMat);
    lowerHorn.rotation.x = Math.PI * 0.37;
    lowerHorn.position.set(0, 0.19, 0.68);
    g.add(lowerHorn);

    const lowerTooth = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.1, 4), blackMat);
    lowerTooth.position.set(0, 0.26, 0.76);
    g.add(lowerTooth);

    addSixLegs(g, blackMat, { spreadX: 0.28, y: 0.13, zOffsets: [-0.26, -0.04, 0.18], len: 0.27, thickness: 0.045 });
    g.scale.setScalar(1.22);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 24. 黃金鬼鍬形蟲 — Solid 24k metallic gold body, jet-black joints, stout curved pincer jaws & golden halo!
  golden_stag() {
    const g = new THREE.Group();
    const goldMat = makeMat(0xffd23f, { roughness: 0.14, metalness: 0.88, emissive: 0xb88200, emissiveIntensity: 0.38 });
    const deepGold = makeMat(0xe09f1f, { roughness: 0.18, metalness: 0.82 });
    const blackMat = makeMat(0x181614, { roughness: 0.25, metalness: 0.35 });

    // Radiant solid-gold broad elytra
    const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 7), goldMat);
    elytra.scale.set(0.98, 0.68, 1.32);
    elytra.position.set(0, 0.22, -0.14);
    elytra.castShadow = true;
    g.add(elytra);

    // Broad sculpted golden pronotum with tiny black edge accent
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), deepGold);
    thorax.scale.set(1.16, 0.66, 0.82);
    thorax.position.set(0, 0.22, 0.2);
    g.add(thorax);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.2), goldMat);
    head.position.set(0, 0.22, 0.38);
    g.add(head);
    addEyes(g, 0.15, 0.23, 0.4, 0.032, blackMat);

    // Stout powerfully arched pincer mandibles (黃金鬼招牌厚實彎曲鬼顎!)
    for (const sx of [-1, 1]) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.044, 0.3, 6), goldMat);
      base.rotation.x = Math.PI * 0.48;
      base.rotation.z = sx * -0.35;
      base.position.set(sx * 0.15, 0.23, 0.56);
      g.add(base);

      const hook = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.26, 5), deepGold);
      hook.rotation.x = Math.PI * 0.48;
      hook.rotation.z = sx * 0.65;
      hook.position.set(sx * 0.14, 0.24, 0.76);
      g.add(hook);

      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.1, 4), blackMat);
      tooth.rotation.z = sx * Math.PI * 0.5;
      tooth.position.set(sx * 0.1, 0.23, 0.62);
      g.add(tooth);
    }

    addSixLegs(g, goldMat, { spreadX: 0.26, y: 0.11, len: 0.24, jointMat: blackMat });
    addGlowHalo(g, 0xffd23f, 0.42, 0.24, 0.28);
    g.scale.setScalar(1.14);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  }
};

// ============================================================================
// INDIVIDUAL REPTILE BUILDERS (12 UNIQUE SPECIES)
// ============================================================================

const REPTILE_BUILDERS = {
  // 1. 綠安樂蜥 — Slender emerald lizard, sharp snout, iconic puffed bright orange-red throat dewlap!
  green_anole() {
    const g = new THREE.Group();
    const greenMat = makeMat(0x52c459, { roughness: 0.55 });
    const bellyMat = makeMat(0xc9f2b3, { roughness: 0.7 });
    const dewlapMat = makeMat(0xff5a36, { roughness: 0.45, emissive: 0x8f1d00, emissiveIntensity: 0.2 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.088, 0.34, 5, 7), greenMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.set(0, 0.15, 0);
    torso.castShadow = true;
    g.add(torso);

    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.32), bellyMat);
    belly.position.set(0, 0.1, 0);
    g.add(belly);

    // Pointed triangular snout
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.26, 5), greenMat);
    head.rotation.x = Math.PI * 0.5;
    head.scale.set(0.92, 1, 0.68);
    head.position.set(0, 0.19, 0.31);
    g.add(head);
    addEyes(g, 0.055, 0.22, 0.28, 0.025);

    // Signature puffed coral-red throat dewlap (喉囊!)
    const dewlap = new THREE.Mesh(new THREE.SphereGeometry(0.095, 7, 6), dewlapMat);
    dewlap.scale.set(0.32, 1.05, 1.15);
    dewlap.position.set(0, 0.11, 0.25);
    g.add(dewlap);

    const tail = createTailPivot(g, 0.14, -0.2);
    const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.78, 5), greenMat);
    tailMesh.rotation.x = -Math.PI * 0.5;
    tailMesh.position.set(0, 0, -0.39);
    tail.add(tailMesh);

    addFourLegs(g, greenMat, { x: 0.14, zFront: 0.14, zBack: -0.14, y: 0.08, lenX: 0.14, h: 0.055, w: 0.055 });
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 2. 微笑守宮 — Soft peach-cream translucent small gecko, big dark eyes, cute smile & wide adhesive toe pads!
  house_gecko() {
    const g = new THREE.Group();
    const peachMat = makeMat(0xf5d5b3, { roughness: 0.52 });
    const bandMat = makeMat(0xd4a072, { roughness: 0.58 });
    const cheekMat = makeMat(0xf29ca3, { roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.28, 5, 7), peachMat);
    torso.rotation.x = Math.PI / 2;
    torso.scale.set(1.12, 1, 0.78);
    torso.position.set(0, 0.13, 0);
    torso.castShadow = true;
    g.add(torso);

    // Broad rounded cute gecko head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 8, 6), peachMat);
    head.scale.set(1.08, 0.72, 1.18);
    head.position.set(0, 0.16, 0.25);
    g.add(head);
    addEyes(g, 0.075, 0.19, 0.3, 0.036);

    // Cute rosy cheeks to emphasize "微笑守宮"
    for (const sx of [-0.095, 0.095]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.028, 5, 4), cheekMat);
      cheek.position.set(sx, 0.15, 0.31);
      g.add(cheek);
    }

    // Plump tan-banded tail
    const tail = createTailPivot(g, 0.13, -0.18);
    const tailBody = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), peachMat);
    tailBody.scale.set(0.85, 0.68, 2.3);
    tailBody.position.set(0, 0, -0.2);
    tail.add(tailBody);
    for (const tz of [-0.12, -0.24, -0.34]) {
      const ring = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.04), bandMat);
      ring.position.set(0, 0.02, tz);
      tail.add(ring);
    }

    addFourLegs(g, peachMat, { x: 0.15, zFront: 0.13, zBack: -0.12, y: 0.07, lenX: 0.13, h: 0.055, w: 0.06, toePads: true, footMat: bandMat });
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 3. 藍尾石龍子 — Glossy olive-brown striped cylindrical body + vivid electric sapphire-blue metallic tail!
  grass_skink() {
    const g = new THREE.Group();
    const darkOlive = makeMat(0x363d2d, { roughness: 0.26, metalness: 0.18 });
    const goldStripe = makeMat(0xf2e394, { roughness: 0.35 });
    const blueTailMat = makeMat(0x00b4ff, { roughness: 0.18, metalness: 0.55, emissive: 0x0066cc, emissiveIntensity: 0.45 });

    // Smooth cylindrical streamlined skink torso
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 6, 8), darkOlive);
    torso.rotation.x = Math.PI / 2;
    torso.scale.set(1.0, 1.0, 0.78);
    torso.position.set(0, 0.13, 0.02);
    torso.castShadow = true;
    g.add(torso);

    // 3 crisp golden longitudinal stripes along back
    for (const sx of [-0.06, 0, 0.06]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.52), goldStripe);
      stripe.position.set(sx, 0.205 - Math.abs(sx) * 0.25, 0.04);
      g.add(stripe);
    }

    // Smooth tapered conical head
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.092, 0.24, 6), darkOlive);
    head.rotation.x = Math.PI * 0.5;
    head.scale.set(0.95, 1, 0.75);
    head.position.set(0, 0.14, 0.34);
    g.add(head);
    addEyes(g, 0.052, 0.165, 0.33, 0.024);

    // Unmistakable long luminous sapphire-blue tail!
    const tail = createTailPivot(g, 0.12, -0.2);
    const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.88, 6), blueTailMat);
    tailMesh.rotation.x = -Math.PI * 0.5;
    tailMesh.position.set(0, 0, -0.44);
    tail.add(tailMesh);

    addFourLegs(g, darkOlive, { x: 0.14, zFront: 0.17, zBack: -0.14, y: 0.07, lenX: 0.13, h: 0.055, w: 0.055 });
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 4. 櫻池澤龜 — Streamlined olive-green pond turtle shell + iconic bright crimson-red ear stripes!
  red_eared_turtle() {
    const g = new THREE.Group();
    const shellMat = makeMat(0x436b2a, { roughness: 0.45 });
    const rimMat = makeMat(0x8db654, { roughness: 0.55 });
    const skinMat = makeMat(0x558734, { roughness: 0.6 });
    const redEarMat = makeMat(0xe63946, { roughness: 0.4 });

    // Flatter streamlined aquatic pond carapace
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 9, 6, 0, Math.PI * 2, 0, Math.PI * 0.52),
      shellMat
    );
    shell.scale.set(0.96, 0.68, 1.22);
    shell.position.set(0, 0.1, -0.02);
    shell.castShadow = true;
    g.add(shell);

    // Lighter olive rim edge around bottom of shell
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.036, 5, 12), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(0.98, 1.22, 1);
    rim.position.set(0, 0.12, -0.02);
    g.add(rim);

    // Extended neck & head with signature red ear stripes behind both eyes!
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.068, 0.2, 6), skinMat);
    neck.rotation.x = Math.PI * 0.42;
    neck.position.set(0, 0.16, 0.38);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.092, 7, 6), skinMat);
    head.scale.set(0.92, 0.82, 1.22);
    head.position.set(0, 0.2, 0.48);
    g.add(neck, head);
    addEyes(g, 0.056, 0.22, 0.53, 0.022);

    for (const sx of [-0.082, 0.082]) {
      const earStripe = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.038, 0.09), redEarMat);
      earStripe.position.set(sx, 0.21, 0.45);
      g.add(earStripe);
    }

    // 4 webbed swimming feet
    addFourLegs(g, skinMat, { x: 0.25, zFront: 0.18, zBack: -0.2, y: 0.07, lenX: 0.16, h: 0.055, w: 0.1, toePads: true, footMat: rimMat });

    const tail = createTailPivot(g, 0.1, -0.36);
    const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 4), skinMat);
    tailTip.rotation.x = -Math.PI * 0.5;
    tailTip.position.set(0, 0, -0.07);
    tail.add(tailTip);

    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 5. 綠鬣蜥 — Tropical green iguana with tall lime dorsal comb spines, hanging green dewlap & banded whip tail!
  green_iguana() {
    const g = new THREE.Group();
    const greenMat = makeMat(0x43a047, { roughness: 0.55 });
    const limeMat = makeMat(0x9be54a, { roughness: 0.5 });
    const darkBand = makeMat(0x234a26, { roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.48, 5, 7), greenMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.set(0, 0.2, 0);
    torso.castShadow = true;
    g.add(torso);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), greenMat);
    head.scale.set(0.88, 0.85, 1.25);
    head.position.set(0, 0.26, 0.39);
    g.add(head);
    addEyes(g, 0.088, 0.3, 0.42, 0.03);

    // Iconic round subtympanic cheek scale + hanging green dewlap flap!
    for (const sx of [-0.125, 0.125]) {
      const cheek = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 7), limeMat);
      cheek.rotation.z = Math.PI / 2;
      cheek.position.set(sx, 0.22, 0.35);
      g.add(cheek);
    }
    const dewlap = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), limeMat);
    dewlap.rotation.x = Math.PI;
    dewlap.scale.set(0.35, 1, 1.45);
    dewlap.position.set(0, 0.11, 0.34);
    g.add(dewlap);

    // Tall comb-like lime dorsal crest spines running from neck to hips!
    for (let i = 0; i < 7; i++) {
      const h = 0.18 - Math.abs(i - 2) * 0.018;
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.032, h, 4), limeMat);
      spine.position.set(0, 0.36 + h * 0.3, 0.32 - i * 0.1);
      g.add(spine);
    }

    // Very long dark-banded iguana tail
    const tail = createTailPivot(g, 0.18, -0.32);
    const tailBase = new THREE.Mesh(new THREE.ConeGeometry(0.095, 1.15, 6), greenMat);
    tailBase.rotation.x = -Math.PI * 0.5;
    tailBase.position.set(0, 0, -0.57);
    tail.add(tailBase);
    for (let i = 0; i < 4; i++) {
      const r = 0.082 - i * 0.015;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, 0.1, 6), darkBand);
      band.rotation.x = Math.PI * 0.5;
      band.position.set(0, 0, -0.22 - i * 0.22);
      tail.add(band);
    }

    addFourLegs(g, greenMat, { x: 0.22, zFront: 0.2, zBack: -0.2, y: 0.11, lenX: 0.18, h: 0.09, w: 0.09 });
    g.scale.setScalar(1.15);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 6. 鬃獅蜥 — Wide flat pancake-like desert body, triangular head, puffed spiky "beard" collar & lateral flank spikes!
  bearded_dragon() {
    const g = new THREE.Group();
    const sandMat = makeMat(0xdf9b51, { roughness: 0.72 });
    const terraMat = makeMat(0xb5622a, { roughness: 0.74 });
    const beardMat = makeMat(0x4a3121, { roughness: 0.75 });

    // Wide flat pancake-like desert torso
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.26, 9, 6), sandMat);
    torso.scale.set(1.22, 0.48, 1.38);
    torso.position.set(0, 0.15, -0.02);
    torso.castShadow = true;
    g.add(torso);

    // Terracotta desert crossbands on flat back
    for (const bz of [0.1, -0.04, -0.18]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.065), terraMat);
      band.position.set(0, 0.26, bz);
      g.add(band);
    }

    // Lateral spikes lining both sides of pancake body!
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 4), terraMat);
        sp.rotation.z = sx * -Math.PI * 0.45;
        sp.position.set(sx * 0.32, 0.15, 0.16 - i * 0.11);
        g.add(sp);
      }
    }

    // Broad triangular head + puffed spiky "beard" fringe around jaw!
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 4), sandMat);
    head.rotation.x = Math.PI * 0.5;
    head.rotation.y = Math.PI * 0.25;
    head.scale.set(1.15, 1, 0.58);
    head.position.set(0, 0.21, 0.4);
    g.add(head);
    addEyes(g, 0.095, 0.25, 0.4, 0.028);

    // Puffed dark spiky beard under throat & cheeks!
    const beardPouch = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 5), beardMat);
    beardPouch.scale.set(1.25, 0.62, 0.85);
    beardPouch.position.set(0, 0.13, 0.34);
    g.add(beardPouch);
    for (let i = -2; i <= 2; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.1, 4), beardMat);
      spike.position.set(i * 0.068, 0.15, 0.34 - Math.abs(i) * 0.03);
      spike.rotation.z = -i * 0.42;
      spike.rotation.x = 0.45;
      g.add(spike);
    }

    const tail = createTailPivot(g, 0.14, -0.34);
    const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.68, 6), sandMat);
    tailMesh.rotation.x = -Math.PI * 0.5;
    tailMesh.position.set(0, 0, -0.34);
    tail.add(tailMesh);

    addFourLegs(g, sandMat, { x: 0.28, zFront: 0.18, zBack: -0.2, y: 0.09, lenX: 0.18, h: 0.08, w: 0.09 });
    g.scale.setScalar(1.06);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 7. 豹紋守宮 — Marigold-yellow body covered in bold espresso leopard spots & iconic bulbous carrot fat tail!
  leopard_gecko() {
    const g = new THREE.Group();
    const yellowMat = makeMat(0xffca3a, { roughness: 0.5 });
    const paleBelly = makeMat(0xfff4d6, { roughness: 0.6 });
    const spotMat = makeMat(0x302016, { roughness: 0.55 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.34, 6, 8), yellowMat);
    torso.rotation.x = Math.PI / 2;
    torso.scale.set(1.12, 1, 0.8);
    torso.position.set(0, 0.14, 0.02);
    torso.castShadow = true;
    g.add(torso);

    // Wide smiling blunt leopard gecko head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), yellowMat);
    head.scale.set(1.08, 0.72, 1.15);
    head.position.set(0, 0.17, 0.3);
    g.add(head);
    addEyes(g, 0.075, 0.2, 0.35, 0.032);

    // Bold dark espresso leopard spots scattered on back & head!
    const dotGeo = new THREE.SphereGeometry(0.03, 5, 4);
    for (const [dx, dy, dz, s] of [
      [-0.06, 0.23, 0.15, 1.1], [0.07, 0.225, 0.08, 1.0], [-0.08, 0.22, -0.04, 1.15],
      [0.05, 0.23, -0.1, 0.95], [0.0, 0.235, 0.02, 0.85], [-0.04, 0.24, 0.29, 0.8],
      [0.05, 0.24, 0.26, 0.75], [0.08, 0.21, -0.18, 1.0]
    ]) {
      const dot = new THREE.Mesh(dotGeo, spotMat);
      dot.scale.set(s, 0.45, s);
      dot.position.set(dx, dy, dz);
      g.add(dot);
    }

    // Unmistakable bulbous plump carrot-shaped fat tail (肥嘟嘟大尾巴!)
    const tail = createTailPivot(g, 0.14, -0.2);
    const fatTail = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), paleBelly);
    fatTail.scale.set(0.95, 0.72, 2.25);
    fatTail.position.set(0, 0, -0.25);
    fatTail.castShadow = true;
    tail.add(fatTail);

    for (const [tx, ty, tz] of [[-0.05, 0.08, -0.16], [0.06, 0.075, -0.26], [-0.03, 0.065, -0.36], [0.02, 0.05, -0.44]]) {
      const tdot = new THREE.Mesh(dotGeo, spotMat);
      tdot.scale.set(1.1, 0.5, 1.1);
      tdot.position.set(tx, ty, tz);
      tail.add(tdot);
    }

    addFourLegs(g, yellowMat, { x: 0.17, zFront: 0.16, zBack: -0.14, y: 0.075, lenX: 0.15, h: 0.06, w: 0.065 });
    g.scale.setScalar(1.04);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 8. 印度星龜 — High-domed pyramidal dark ebony tortoise shell with radiating golden star-burst patterns!
  star_tortoise() {
    const g = new THREE.Group();
    const ebonyMat = makeMat(0x211912, { roughness: 0.42 });
    const goldStarMat = makeMat(0xf4d35e, { roughness: 0.35, emissive: 0x705408, emissiveIntensity: 0.2 });
    const skinMat = makeMat(0xd6b06b, { roughness: 0.68 });

    // High-domed sculpted tortoise carapace
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 9, 7, 0, Math.PI * 2, 0, Math.PI * 0.58),
      ebonyMat
    );
    shell.scale.set(0.94, 1.18, 1.16);
    shell.position.set(0, 0.12, 0);
    shell.castShadow = true;
    g.add(shell);

    // Pyramidal bumpy scute domes with golden star-burst rays!
    const scutePositions = [
      [0, 0.48, 0.04], [0, 0.44, -0.18],
      [-0.2, 0.34, 0.08], [0.2, 0.34, 0.08],
      [-0.2, 0.32, -0.14], [0.2, 0.32, -0.14]
    ];
    for (const [sx, sy, sz] of scutePositions) {
      const pyr = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.1, 6), ebonyMat);
      pyr.position.set(sx, sy, sz);
      g.add(pyr);
      // Golden radiating star bars across each scute
      for (let a = 0; a < 3; a++) {
        const ray = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.022, 0.028), goldStarMat);
        ray.position.set(sx, sy + 0.02, sz);
        ray.rotation.y = (a * Math.PI) / 3;
        ray.rotation.z = sx > 0 ? -0.45 : sx < 0 ? 0.45 : 0;
        g.add(ray);
      }
    }

    // Rounded tortoise head & elephantine columnar legs
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 7, 6), skinMat);
    head.scale.set(0.95, 0.9, 1.12);
    head.position.set(0, 0.18, 0.4);
    g.add(head);
    addEyes(g, 0.065, 0.21, 0.46, 0.022);

    addFourLegs(g, skinMat, { x: 0.22, zFront: 0.18, zBack: -0.18, h: 0.18, w: 0.11, pillar: true, footMat: goldStarMat });
    g.scale.setScalar(1.06);
    return { group: g, wingL: null, wingR: null, tailMesh: null };
  },

  // 9. 高冠變色龍 — Leaf-shaped laterally flat torso with turquoise/yellow vertical stripes, tall casque helmet & spiral tail!
  veiled_chameleon() {
    const g = new THREE.Group();
    const leafGreen = makeMat(0x38b000, { roughness: 0.52 });
    const cyanStripe = makeMat(0x00bbf9, { roughness: 0.45 });
    const yellowStripe = makeMat(0xffe14d, { roughness: 0.48 });
    const casqueMat = makeMat(0x289963, { roughness: 0.45 });

    // Tall laterally-compressed arched chameleon body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 9, 7), leafGreen);
    body.scale.set(0.56, 0.98, 1.38);
    body.position.set(0, 0.32, 0);
    body.castShadow = true;
    g.add(body);

    // Colorful turquoise & yellow vertical tiger bars along flanks
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28 - i * 0.02, 0.048),
        i % 2 === 0 ? cyanStripe : yellowStripe
      );
      bar.position.set(0, 0.34, 0.16 - i * 0.12);
      g.add(bar);
    }

    // Iconic tall sweeping helmet casque (高冠頭盔!)
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.24), leafGreen);
    snout.position.set(0, 0.37, 0.34);
    g.add(snout);

    const casque = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 4), casqueMat);
    casque.scale.set(0.55, 1, 1.15);
    casque.position.set(0, 0.56, 0.25);
    casque.rotation.x = -0.35;
    g.add(casque);

    // Protruding conical turret eyes!
    for (const sx of [-1, 1]) {
      const turret = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.08, 6), yellowStripe);
      turret.rotation.z = sx * -Math.PI * 0.5;
      turret.position.set(sx * 0.1, 0.4, 0.36);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 5, 5), makeMat(0x181412));
      pupil.position.set(sx * 0.14, 0.4, 0.37);
      g.add(turret, pupil);
    }

    // Tightly coiled spiral tail!
    const tail = createTailPivot(g, 0.26, -0.3);
    const spiral = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.042, 6, 12, Math.PI * 1.75), leafGreen);
    spiral.rotation.y = Math.PI / 2;
    spiral.position.set(0, -0.04, -0.14);
    const innerSpiral = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.028, 5, 10, Math.PI * 1.4), cyanStripe);
    innerSpiral.rotation.y = Math.PI / 2;
    innerSpiral.position.set(0, -0.04, -0.14);
    tail.add(spiral, innerSpiral);

    // Tall slender gripping mitten legs
    addFourLegs(g, leafGreen, { x: 0.14, zFront: 0.15, zBack: -0.15, h: 0.24, w: 0.065, pillar: true, footMat: yellowStripe });
    g.scale.setScalar(1.12);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 10. 冰晶雪蜥 — Frosted translucent ice-cyan lizard sprouting jagged glowing crystal shards along spine & tail!
  crystal_lizard() {
    const g = new THREE.Group();
    const iceBody = makeMat(0x9be7f5, { roughness: 0.18, metalness: 0.22, emissive: 0x3ba8c9, emissiveIntensity: 0.45 });
    const snowMat = makeMat(0xecfaff, { roughness: 0.45, emissive: 0x80d8f0, emissiveIntensity: 0.25 });
    const crystalMat = makeMat(0x48cae4, {
      roughness: 0.1,
      metalness: 0.35,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.88
    });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.44, 5, 7), iceBody);
    torso.rotation.x = Math.PI / 2;
    torso.position.set(0, 0.19, 0);
    torso.castShadow = true;
    g.add(torso);

    const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), snowMat);
    head.scale.set(0.95, 0.72, 1.32);
    head.position.set(0, 0.23, 0.36);
    g.add(head);
    addEyes(g, 0.075, 0.26, 0.41, 0.028, makeMat(0x023e8a));

    // Faceted crystal crown & cheek shards
    for (const sx of [-1, 1]) {
      const cheekIce = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), crystalMat);
      cheekIce.scale.set(0.6, 1.5, 0.7);
      cheekIce.position.set(sx * 0.13, 0.27, 0.29);
      cheekIce.rotation.z = sx * -0.55;
      g.add(cheekIce);
    }

    // Jagged glowing ice-crystal cluster sprouting down the spine!
    for (let i = 0; i < 5; i++) {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.075 - i * 0.006, 0), crystalMat);
      shard.scale.set(0.55, 1.9, 0.75);
      shard.position.set(0, 0.36, 0.2 - i * 0.13);
      shard.rotation.x = -0.3;
      g.add(shard);
    }

    // Ice tail tipped with a sparkling crystal cluster
    const tail = createTailPivot(g, 0.17, -0.28);
    const tailCore = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.78, 5), iceBody);
    tailCore.rotation.x = -Math.PI * 0.5;
    tailCore.position.set(0, 0, -0.39);
    const tailCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), crystalMat);
    tailCrystal.scale.set(0.7, 0.7, 1.6);
    tailCrystal.position.set(0, 0.02, -0.78);
    tail.add(tailCore, tailCrystal);

    addFourLegs(g, snowMat, { x: 0.2, zFront: 0.18, zBack: -0.18, y: 0.1, lenX: 0.17, h: 0.08, w: 0.08 });
    addGlowHalo(g, 0x90e0ef, 0.45, 0.24, 0.22);
    g.scale.setScalar(1.12);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  },

  // 11. 翡翠樹蚺 — Lush emerald coiled serpent, vivid yellow underbelly, snow-white diamond saddle marks & red forked tongue!
  emerald_tree_boa() {
    const g = new THREE.Group();
    const emeraldMat = makeMat(0x15a34a, { roughness: 0.34, metalness: 0.12 });
    const yellowMat = makeMat(0xfef08a, { roughness: 0.48 });
    const whiteMark = makeMat(0xffffff, { roughness: 0.4 });
    const goldEye = makeMat(0xffd166, { emissive: 0xd99b00, emissiveIntensity: 0.45 });
    const tongueMat = makeMat(0xe63946);

    // Double-layered coiled emerald body with bright yellow under-rim
    const coil1 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.092, 7, 14), emeraldMat);
    coil1.rotation.x = Math.PI / 2;
    coil1.position.y = 0.095;
    coil1.castShadow = true;
    g.add(coil1);

    const bellyRim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 6, 14), yellowMat);
    bellyRim.rotation.x = Math.PI / 2;
    bellyRim.position.y = 0.045;
    g.add(bellyRim);

    const coil2 = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.078, 7, 12), emeraldMat);
    coil2.rotation.x = Math.PI / 2;
    coil2.position.y = 0.21;
    coil2.castShadow = true;
    g.add(coil2);

    // Crisp white diamond saddle markings ringing the emerald coils!
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const diamond = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.032, 0.065), whiteMark);
      diamond.rotation.y = Math.PI / 4;
      diamond.position.set(Math.cos(a) * 0.3, 0.175, Math.sin(a) * 0.3);
      g.add(diamond);
    }

    // Raised S-curved neck & triangular pit-boa head
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.22, 0.14);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.076, 0.28, 6), emeraldMat);
    neck.position.set(0, 0.14, 0.04);
    neck.rotation.x = 0.32;
    headPivot.add(neck);

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.125, 0.24, 4), emeraldMat);
    head.rotation.x = Math.PI * 0.5;
    head.rotation.y = Math.PI * 0.25;
    head.scale.set(1.05, 1, 0.62);
    head.position.set(0, 0.27, 0.16);
    headPivot.add(head);
    addEyes(headPivot, 0.068, 0.3, 0.16, 0.026, goldEye);

    // Tiny flicking red forked tongue!
    const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.012, 0.13), tongueMat);
    tongue.position.set(0, 0.255, 0.31);
    headPivot.add(tongue);
    g.add(headPivot);

    g.scale.setScalar(1.22);
    // Use headPivot as tailMesh so the boa's raised head sways gently!
    return { group: g, wingL: null, wingR: null, tailMesh: headPivot };
  },

  // 12. 遠古巨蜥 — Massive heavy-set prehistoric Komodo monitor with armored plates, thick neck, forked tongue & whip tail!
  komodo_monitor() {
    const g = new THREE.Group();
    const slateMat = makeMat(0x52493e, { roughness: 0.82 });
    const armorMat = makeMat(0x7c6e5c, { roughness: 0.78 });
    const darkMat = makeMat(0x2e2822, { roughness: 0.8 });
    const tongueMat = makeMat(0xd95f6e, { roughness: 0.4 });

    // Heavy broad muscular monitor torso
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.62, 6, 8), slateMat);
    torso.rotation.x = Math.PI / 2;
    torso.scale.set(1.12, 1, 0.84);
    torso.position.set(0, 0.24, -0.02);
    torso.castShadow = true;
    g.add(torso);

    // Rugged prehistoric osteoderm back armor plates
    for (let i = 0; i < 5; i++) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.26 - i * 0.015, 0.055, 0.1), armorMat);
      plate.position.set(0, 0.4, 0.22 - i * 0.13);
      g.add(plate);
    }

    // Long thick muscular monitor neck & blunt powerful snout
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.26, 7), slateMat);
    neck.rotation.x = Math.PI * 0.44;
    neck.position.set(0, 0.28, 0.42);
    g.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.34), slateMat);
    head.position.set(0, 0.3, 0.62);
    head.castShadow = true;
    g.add(head);
    addEyes(g, 0.1, 0.34, 0.63, 0.026, makeMat(0x1a1510));

    // Peeking forked pinkish-amber monitor tongue!
    const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.016, 0.16), tongueMat);
    tongue.position.set(0, 0.26, 0.84);
    g.add(tongue);

    // Heavy powerful whip tail with dark bands
    const tail = createTailPivot(g, 0.21, -0.4);
    const tailBase = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.05, 7), slateMat);
    tailBase.rotation.x = -Math.PI * 0.5;
    tailBase.position.set(0, 0, -0.52);
    tail.add(tailBase);
    for (let i = 0; i < 3; i++) {
      const r = 0.12 - i * 0.024;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, 0.12, 7), darkMat);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.set(0, 0, -0.22 - i * 0.24);
      tail.add(ring);
    }

    // Thick clawed pillar legs
    addFourLegs(g, slateMat, { x: 0.28, zFront: 0.22, zBack: -0.24, h: 0.22, w: 0.12, pillar: true, footMat: darkMat });
    g.scale.setScalar(1.32);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  }
};

/**
 * Builds a unique charming low-poly 3D model for every fish, insect (24 species), and reptile (12 species).
 * Returns { group, wingL, wingR, tailMesh } for smooth idle/flight/tail animations.
 */
export function buildCreatureModel(creature) {
  if (!creature) {
    return { group: new THREE.Group(), wingL: null, wingR: null, tailMesh: null };
  }

  // Dedicated unique model for every single insect & reptile species!
  if (BUG_BUILDERS[creature.id]) {
    return BUG_BUILDERS[creature.id](creature);
  }
  if (REPTILE_BUILDERS[creature.id]) {
    return REPTILE_BUILDERS[creature.id](creature);
  }

  // ==================== FISH (for Museum Aquariums) ====================
  const g = new THREE.Group();
  const col = creature.color || 0xffd166;
  const mainMat = makeMat(col, {
    roughness: creature.metallic ? 0.25 : 0.72,
    metalness: creature.metallic ? 0.55 : 0.05,
    emissive: creature.glow ? col : 0x000000,
    emissiveIntensity: creature.glow ? 0.9 : 0
  });
  const darkMat = makeMat(0x1d1916);

  if (creature.type === 'fish') {
    const scale = Math.max(0.55, Math.min(1.45, (creature.shadowSize || 1) * 0.78));
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), mainMat);
    body.scale.set(0.55, 0.78, 1.45);
    g.add(body);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 4), mainMat);
    tail.rotation.x = Math.PI / 2;
    tail.scale.set(0.25, 1, 1);
    tail.position.z = -0.56;
    g.add(tail);

    const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 4), mainMat);
    dorsal.position.set(0, 0.26, -0.05);
    dorsal.rotation.x = -0.35;
    g.add(dorsal);

    addEyes(g, 0.14, 0.07, 0.28, 0.045, darkMat);

    g.scale.setScalar(scale);
    return { group: g, wingL: null, wingR: null, tailMesh: tail };
  }

  // Safe generic fallback if an unknown creature id is ever added
  const fallback = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), mainMat);
  fallback.position.y = 0.2;
  g.add(fallback);
  return { group: g, wingL: null, wingR: null, tailMesh: null };
}
