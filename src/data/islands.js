export const WATER_LEVEL = 0;

export const ISLANDS = [
  {
    id: 'main',
    name: '微風港灣',
    subtitle: '起始主島・商店街與港口',
    emoji: '🏡',
    x: 0,
    z: 0,
    radius: 38,
    maxHeight: 3.4,
    grassColor: 0x6ec068,
    grassAccent: 0x5aac56,
    sandColor: 0xf4dca4,
    mapColor: '#76c86b',
    dockAngle: Math.PI * 0.5, // South dock (+z)
    pond: { x: -13, z: -7, radius: 7.2 },
    seed: 1.1,
    description: '溫暖海風吹拂的家園，有阿狸的雜貨商店、淡水鯉魚池塘與木頭碼頭。'
  },
  {
    id: 'coconut',
    name: '熱帶椰林島',
    subtitle: '東南外島・珊瑚海灣與棕櫚',
    emoji: '🌴',
    x: 92,
    z: 68,
    radius: 28,
    maxHeight: 2.9,
    grassColor: 0x82c95c,
    grassAccent: 0x69b54a,
    sandColor: 0xfae4ab,
    mapColor: '#f3d478',
    dockAngle: Math.PI * 1.18, // Facing northwest back toward main
    pond: null,
    seed: 2.7,
    description: '陽光燦爛的金色沙灘與椰子林，常有熱帶魚群與獨角仙出沒。'
  },
  {
    id: 'sakura',
    name: '櫻花竹林島',
    subtitle: '西北外島・落櫻池畔與石燈籠',
    emoji: '🌸',
    x: -88,
    z: -66,
    radius: 30,
    maxHeight: 3.6,
    grassColor: 0x68b578,
    grassAccent: 0x549c66,
    sandColor: 0xebd9b7,
    mapColor: '#f3a4be',
    dockAngle: Math.PI * 0.2, // Facing southeast toward main
    pond: { x: -88 - 5, z: -66 - 4, radius: 6.4 },
    seed: 4.3,
    description: '粉色櫻花瓣隨風飄落的靜謐之島，夜晚池塘邊能遇見閃耀流螢。'
  },
  {
    id: 'ruins',
    name: '神秘遺跡島',
    subtitle: '東北外島・古代石柱與星光水晶',
    emoji: '🏛️',
    x: 86,
    z: -82,
    radius: 29,
    maxHeight: 4.2,
    grassColor: 0x4f997b,
    grassAccent: 0x3e8268,
    sandColor: 0xd6cfb8,
    mapColor: '#76b5c5',
    dockAngle: Math.PI * 0.72, // Facing southwest toward main
    pond: { x: 86 + 6, z: -82 - 3, radius: 5.5 },
    seed: 6.9,
    description: '長滿青苔的古老祭壇與發光水晶，深海與夜色藏著傳說級生物。'
  }
];

export const ISLAND_MAP = Object.fromEntries(ISLANDS.map(i => [i.id, i]));

/**
 * Deterministic organic coastal radius variation for an island at a given angle.
 */
export function getIslandEdgeRadius(island, angle) {
  const s = island.seed;
  const wobble =
    Math.sin(angle * 3 + s) * 0.08 +
    Math.cos(angle * 5 - s * 1.4) * 0.045 +
    Math.sin(angle * 2 + s * 0.7) * 0.05;
  return island.radius * (1 + wobble);
}

/**
 * Computes terrain height at world coordinates (x, z).
 * Values > WATER_LEVEL (0) are land; values < 0 are underwater/ocean floor.
 */
export function getTerrainHeight(x, z) {
  let maxH = -3.8;

  for (const isl of ISLANDS) {
    const dx = x - isl.x;
    const dz = z - isl.z;
    const dist = Math.hypot(dx, dz);
    if (dist > isl.radius * 1.45) continue;

    const angle = Math.atan2(dz, dx);
    const edgeR = getIslandEdgeRadius(isl, angle);
    const norm = dist / edgeR;

    if (norm < 1.32) {
      // Smooth coastal slope from ocean floor up to plateau
      let h;
      if (norm < 0.72) {
        // Interior rolling hills
        const t = norm / 0.72;
        const base = isl.maxHeight * (1 - 0.55 * t * t);
        const hills =
          Math.sin(dx * 0.14 + isl.seed) * Math.cos(dz * 0.14 - isl.seed) * 0.55 * (1 - t * 0.5);
        h = base + hills;
      } else {
        // Beach & underwater slope
        const t = (norm - 0.72) / 0.6; // 0 to 1
        const startH = isl.maxHeight * 0.45;
        // smoothstep falloff down to -3.8
        const smooth = t * t * (3 - 2 * t);
        h = startH * (1 - smooth) + -3.8 * smooth;
      }

      // Flatten central plaza & shop area on main island for cozy architecture
      if (isl.id === 'main') {
        const plazaDist = Math.hypot(x - 2, z - 2);
        if (plazaDist < 12) {
          const blend = Math.max(0, 1 - plazaDist / 12);
          h = h * (1 - blend * 0.75) + 2.15 * (blend * 0.75);
        }
        // Flatten south pier approach
        if (Math.abs(x) < 5 && z > 20 && z < 40) {
          const blend = Math.max(0, 1 - Math.abs(x) / 5);
          const target = Math.max(0.35, h);
          h = h * (1 - blend * 0.4) + target * (blend * 0.4);
        }
      }

      // Carve freshwater pond if island has one
      if (isl.pond) {
        const pd = Math.hypot(x - isl.pond.x, z - isl.pond.z);
        if (pd < isl.pond.radius * 1.35) {
          const pt = Math.max(0, 1 - pd / (isl.pond.radius * 1.35));
          const carve = pt * pt * (3 - 2 * pt);
          h = h * (1 - carve) + -1.25 * carve;
        }
      }

      if (h > maxH) maxH = h;
    }
  }

  return maxH;
}

/**
 * Returns the island if (x, z) is on or very close to that island's shores, else null (open ocean).
 */
export function getIslandAt(x, z, extraMargin = 10) {
  for (const isl of ISLANDS) {
    const dist = Math.hypot(x - isl.x, z - isl.z);
    if (dist <= isl.radius + extraMargin) {
      return isl;
    }
  }
  return null;
}

/**
 * Checks whether (x, z) is inside any freshwater pond.
 */
export function getPondAt(x, z) {
  for (const isl of ISLANDS) {
    if (!isl.pond) continue;
    const d = Math.hypot(x - isl.pond.x, z - isl.pond.z);
    if (d <= isl.pond.radius) {
      return { island: isl, pond: isl.pond };
    }
  }
  return null;
}

/**
 * Returns a convenient dock mooring water position just off an island's beach/dock.
 */
export function getIslandMooringPoint(island) {
  const r = getIslandEdgeRadius(island, island.dockAngle) + 6.5;
  return {
    x: island.x + Math.cos(island.dockAngle) * r,
    z: island.z + Math.sin(island.dockAngle) * r,
    angle: island.dockAngle
  };
}

/**
 * Returns the nearest walkable land point on an island from a water position (for disembarking).
 */
export function findNearestLandPoint(fromX, fromZ, maxDist = 18) {
  let best = null;
  let bestDist = Infinity;

  // Check radial rays toward nearest island center
  let nearestIsl = ISLANDS[0];
  let minIslDist = Infinity;
  for (const isl of ISLANDS) {
    const d = Math.hypot(fromX - isl.x, fromZ - isl.z);
    if (d < minIslDist) {
      minIslDist = d;
      nearestIsl = isl;
    }
  }

  const toCenterAngle = Math.atan2(nearestIsl.z - fromZ, nearestIsl.x - fromX);
  for (let aOff = -0.8; aOff <= 0.8; aOff += 0.2) {
    const ang = toCenterAngle + aOff;
    for (let step = 2.5; step <= maxDist; step += 1.2) {
      const tx = fromX + Math.cos(ang) * step;
      const tz = fromZ + Math.sin(ang) * step;
      const h = getTerrainHeight(tx, tz);
      if (h > 0.32 && !getPondAt(tx, tz)) {
        if (step < bestDist) {
          bestDist = step;
          best = { x: tx, z: tz, y: h, island: nearestIsl };
        }
        break;
      }
    }
  }
  return best;
}

/**
 * Returns nearest deep-enough water point from a land position (for summoning boat).
 */
export function findNearestWaterPoint(fromX, fromZ) {
  let nearestIsl = ISLANDS[0];
  let minIslDist = Infinity;
  for (const isl of ISLANDS) {
    const d = Math.hypot(fromX - isl.x, fromZ - isl.z);
    if (d < minIslDist) {
      minIslDist = d;
      nearestIsl = isl;
    }
  }
  const outAngle = Math.atan2(fromZ - nearestIsl.z, fromX - nearestIsl.x);
  const edgeR = getIslandEdgeRadius(nearestIsl, outAngle);
  const targetR = edgeR + 5.5;
  return {
    x: nearestIsl.x + Math.cos(outAngle) * targetR,
    z: nearestIsl.z + Math.sin(outAngle) * targetR
  };
}
