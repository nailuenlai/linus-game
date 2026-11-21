import * as THREE from 'three';
export { buildCreatureModel } from './creatureModels.js';


/**
 * Builds a charming 3D low-poly mesh for any furniture item in SHOP_FURNITURE.
 * Returns { group, anims: [] } where anims can be updated each frame.
 */
export function buildFurnitureMesh(furnitureId) {
  const g = new THREE.Group();
  const anims = [];

  const wood = new THREE.MeshStandardMaterial({ color: 0xb07d4f, flatShading: true });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x7a5130, flatShading: true });
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff8eb, flatShading: true });
  const teal = new THREE.MeshStandardMaterial({ color: 0x2a9d8f, flatShading: true });
  const coral = new THREE.MeshStandardMaterial({ color: 0xe76f51, flatShading: true });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf4c430, metalness: 0.45, roughness: 0.3, flatShading: true });

  switch (furnitureId) {
    case 'furn_bed': {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 2.2), wood);
      frame.position.y = 0.28;
      frame.castShadow = true;
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.56, 1.05, 0.16), darkWood);
      headboard.position.set(0, 0.62, -1.04);
      headboard.castShadow = true;
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.25, 2.04), cream);
      mattress.position.y = 0.56;
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.28, 1.38), teal);
      blanket.position.set(0, 0.58, 0.32);
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.2, 0.45), new THREE.MeshStandardMaterial({ color: 0xffe5b4, flatShading: true }));
      pillow.position.set(0, 0.74, -0.68);
      g.add(frame, headboard, mattress, blanket, pillow);
      break;
    }
    case 'furn_sofa': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.48, 1.0), teal);
      base.position.y = 0.32;
      base.castShadow = true;
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.78, 0.26), teal);
      back.position.set(0, 0.78, -0.38);
      back.castShadow = true;
      for (const sx of [-0.95, 0.95]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 1.0), teal);
        arm.position.set(sx, 0.52, 0);
        g.add(arm);
      }
      for (const px of [-0.55, 0.55]) {
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.16), coral);
        cushion.position.set(px, 0.72, -0.14);
        cushion.rotation.z = px > 0 ? -0.15 : 0.15;
        g.add(cushion);
      }
      g.add(base, back);
      break;
    }
    case 'furn_table': {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 1.0), wood);
      top.position.y = 0.56;
      top.castShadow = true;
      g.add(top);
      for (const [lx, lz] of [[-0.56, -0.36], [0.56, -0.36], [-0.56, 0.36], [0.56, 0.36]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.56, 6), darkWood);
        leg.position.set(lx, 0.28, lz);
        g.add(leg);
      }
      // Cute teapot on top
      const pot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 6), cream);
      pot.position.set(-0.15, 0.76, 0);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 6), teal);
      cup.position.set(0.25, 0.7, 0.12);
      g.add(pot, cup);
      break;
    }
    case 'furn_dining_table': {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.14, 1.25), wood);
      top.position.y = 0.85;
      top.castShadow = true;
      g.add(top);
      for (const [lx, lz] of [[-0.78, -0.48], [0.78, -0.48], [-0.78, 0.48], [0.78, 0.48]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), darkWood);
        leg.position.set(lx, 0.425, lz);
        g.add(leg);
      }
      // Fruit bowl
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.16, 8), cream);
      bowl.position.set(0, 0.98, 0);
      const fruit1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), coral);
      fruit1.position.set(-0.08, 1.1, 0.03);
      const fruit2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), gold);
      fruit2.position.set(0.09, 1.09, -0.04);
      g.add(bowl, fruit1, fruit2);
      break;
    }
    case 'furn_bookshelf': {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.05, 0.56), darkWood);
      frame.position.y = 1.025;
      frame.castShadow = true;
      g.add(frame);
      const bookCols = [0xe63946, 0x457b9d, 0xf4a261, 0x2a9d8f, 0x9b5de5, 0xffca3a];
      for (let row = 0; row < 3; row++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.52), wood);
        shelf.position.set(0, 0.42 + row * 0.56, 0.04);
        g.add(shelf);
        for (let b = 0; b < 5; b++) {
          const bh = 0.34 + ((b + row) % 2) * 0.08;
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, bh, 0.36),
            new THREE.MeshStandardMaterial({ color: bookCols[(row * 5 + b) % bookCols.length], flatShading: true })
          );
          book.position.set(-0.48 + b * 0.24, 0.46 + row * 0.56 + bh / 2, 0.08);
          g.add(book);
        }
      }
      break;
    }
    case 'furn_wardrobe': {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.15, 0.72), wood);
      body.position.y = 1.075;
      body.castShadow = true;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 0.8), darkWood);
      trim.position.y = 2.16;
      const split = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.9, 0.04), darkWood);
      split.position.set(0, 1.08, 0.36);
      const kL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), gold);
      kL.position.set(-0.14, 1.1, 0.4);
      const kR = kL.clone();
      kR.position.x = 0.14;
      g.add(body, trim, split, kL, kR);
      break;
    }
    case 'furn_cushion': {
      const mat = new THREE.MeshStandardMaterial({ color: 0xffb3c6, flatShading: true });
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.18, 12), mat);
      pad.position.y = 0.09;
      pad.castShadow = true;
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), cream);
      btn.position.y = 0.19;
      g.add(pad, btn);
      break;
    }
    case 'furn_rug': {
      const outer = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.55, 0.04, 20),
        new THREE.MeshStandardMaterial({ color: 0xf4a261, flatShading: true })
      );
      outer.position.y = 0.02;
      outer.receiveShadow = true;
      const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(1.12, 1.12, 0.048, 18),
        cream
      );
      inner.position.y = 0.024;
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.054, 16),
        teal
      );
      core.position.y = 0.028;
      g.add(outer, inner, core);
      break;
    }
    case 'furn_lamp': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.12, 8), darkWood);
      base.position.y = 0.06;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.65, 6), wood);
      pole.position.y = 0.88;
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xfff3d1,
        emissive: 0xffc86b,
        emissiveIntensity: 0.75,
        flatShading: true
      });
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.48, 8), shadeMat);
      shade.position.y = 1.82;
      g.add(base, pole, shade);
      break;
    }
    case 'furn_star_globe': {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.36, 0.92, 8), darkWood);
      ped.position.y = 0.46;
      ped.castShadow = true;
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x90e0ef,
        emissive: 0x48bfe3,
        emissiveIntensity: 0.95,
        flatShading: true
      });
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), orbMat);
      orb.position.y = 1.32;
      g.add(ped, orb);
      anims.push({ type: 'floatSpin', mesh: orb, baseY: 1.32 });
      break;
    }
    case 'furn_plant': {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.24, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xc97b55, flatShading: true })
      );
      pot.position.y = 0.25;
      pot.castShadow = true;
      g.add(pot);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3b9c56, flatShading: true });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), leafMat);
        leaf.scale.set(1.2, 0.35, 0.85);
        leaf.position.set(Math.cos(a) * 0.28, 0.72 + (i % 2) * 0.22, Math.sin(a) * 0.28);
        leaf.rotation.y = -a;
        leaf.rotation.z = 0.35;
        g.add(leaf);
      }
      break;
    }
    case 'furn_bonsai': {
      const pot = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.28, 0.56),
        new THREE.MeshStandardMaterial({ color: 0x457b9d, flatShading: true })
      );
      pot.position.y = 0.14;
      pot.castShadow = true;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.75, 6), darkWood);
      trunk.position.set(-0.04, 0.55, 0);
      trunk.rotation.z = -0.22;
      const pink = new THREE.MeshStandardMaterial({ color: 0xffb3c6, flatShading: true });
      const b1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), pink);
      b1.position.set(0.08, 0.98, 0);
      const b2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), pink);
      b2.position.set(-0.22, 0.86, 0.12);
      g.add(pot, trunk, b1, b2);
      break;
    }
    case 'furn_aquarium': {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.65, 0.8), darkWood);
      stand.position.y = 0.325;
      stand.castShadow = true;
      const water = new THREE.Mesh(
        new THREE.BoxGeometry(1.52, 0.92, 0.68),
        new THREE.MeshStandardMaterial({
          color: 0x48cae4,
          emissive: 0x0096c7,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.65
        })
      );
      water.position.y = 1.12;
      const topRim = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.09, 0.78), darkWood);
      topRim.position.y = 1.62;
      // Mini swimming orange fish inside
      const fish = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), coral);
      fish.scale.set(0.6, 0.8, 1.4);
      fish.position.set(0, 1.12, 0);
      g.add(stand, water, topRim, fish);
      anims.push({ type: 'swim', mesh: fish, centerY: 1.12, rangeX: 0.45 });
      break;
    }
    case 'furn_terrarium': {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.62, 0.82), wood);
      stand.position.y = 0.31;
      stand.castShadow = true;
      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(1.36, 0.16, 0.68),
        new THREE.MeshStandardMaterial({ color: 0x5c3d2e, flatShading: true })
      );
      soil.position.y = 0.7;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.88, 6), darkWood);
      log.rotation.z = Math.PI * 0.38;
      log.position.set(0, 0.92, 0);
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, 0.88, 0.74),
        new THREE.MeshStandardMaterial({ color: 0xe0fbfc, transparent: true, opacity: 0.32 })
      );
      glass.position.y = 1.08;
      const miniBeetle = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), gold);
      miniBeetle.position.set(0.12, 1.05, 0.05);
      g.add(stand, soil, log, glass, miniBeetle);
      break;
    }
    case 'furn_fireplace': {
      const brickMat = new THREE.MeshStandardMaterial({ color: 0xb55d4c, flatShading: true });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.65, 0.82), brickMat);
      body.position.y = 0.825;
      body.castShadow = true;
      const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.82, 0.56), new THREE.MeshStandardMaterial({ color: 0x2b211e }));
      hearth.position.set(0, 0.46, 0.18);
      const mantle = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.16, 0.94), darkWood);
      mantle.position.y = 1.72;
      const flame = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xff6d00, emissiveIntensity: 1.2, flatShading: true })
      );
      flame.position.set(0, 0.38, 0.25);
      g.add(body, hearth, mantle, flame);
      anims.push({ type: 'flame', mesh: flame, baseY: 0.38 });
      break;
    }
    case 'furn_trophy': {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.78, 8), darkWood);
      ped.position.y = 0.39;
      ped.castShadow = true;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.32, 8), gold);
      stem.position.y = 0.94;
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.14, 0.48, 8), gold);
      cup.position.y = 1.32;
      g.add(ped, stem, cup);
      anims.push({ type: 'floatSpin', mesh: cup, baseY: 1.32 });
      break;
    }
    default: {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), wood);
      box.position.y = 0.45;
      g.add(box);
    }
  }

  return { group: g, anims };
}
