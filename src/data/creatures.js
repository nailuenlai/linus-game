export const FISH_LIST = [
  // Main Island & General Sea / Pond
  {
    id: 'sea_bass',
    type: 'fish',
    name: '海鱸魚',
    icon: '🐟',
    islands: ['main', 'coconut', 'sakura', 'ruins', 'ocean'],
    waterType: 'sea',
    time: 'any',
    weather: 'any',
    rarity: 1,
    price: 25,
    minSize: 38,
    maxSize: 65,
    shadowSize: 1.0,
    desc: '微風群島最常見的海魚，活力滿滿，新手釣手的好朋友！'
  },
  {
    id: 'horse_mackerel',
    type: 'fish',
    name: '竹筴魚',
    icon: '🐠',
    islands: ['main', 'coconut', 'ocean'],
    waterType: 'sea',
    time: 'any',
    weather: 'any',
    rarity: 1,
    price: 22,
    minSize: 18,
    maxSize: 34,
    shadowSize: 0.72,
    desc: '成群結隊在陽光海面穿梭的小魚，銀色鱗片閃閃發亮。'
  },
  {
    id: 'crucian_carp',
    type: 'fish',
    name: '鯽魚',
    icon: '🐟',
    islands: ['main', 'sakura'],
    waterType: 'pond',
    time: 'any',
    weather: 'any',
    rarity: 1,
    price: 24,
    minSize: 14,
    maxSize: 28,
    shadowSize: 0.75,
    desc: '悠閒棲息在島嶼淡水池塘裡的小魚，個性非常溫順。'
  },
  {
    id: 'sweetfish',
    type: 'fish',
    name: '香魚',
    icon: '🐟',
    islands: ['main', 'sakura'],
    waterType: 'pond',
    time: 'day',
    weather: 'any',
    rarity: 2,
    price: 42,
    minSize: 16,
    maxSize: 27,
    shadowSize: 0.8,
    desc: '帶著淡淡西瓜清香的清澈淡水魚，白天特別活躍。'
  },
  {
    id: 'red_snapper',
    type: 'fish',
    name: '紅鯛魚',
    icon: '🐡',
    islands: ['main', 'coconut', 'ocean'],
    waterType: 'sea',
    time: 'any',
    weather: 'any',
    rarity: 2,
    price: 60,
    minSize: 40,
    maxSize: 72,
    shadowSize: 1.15,
    desc: '象徵好運的鮮紅海魚，阿狸店長願意出高價收購！'
  },
  {
    id: 'squid',
    type: 'fish',
    name: '海灣魷魚',
    icon: '🦑',
    islands: ['main', 'ruins', 'ocean'],
    waterType: 'sea',
    time: 'night',
    weather: 'any',
    rarity: 2,
    price: 55,
    minSize: 24,
    maxSize: 45,
    shadowSize: 0.9,
    desc: '夜晚被港口燈火吸引而來的透明魷魚，游泳姿態很優雅。'
  },
  // Coconut Lagoon Exclusives
  {
    id: 'clownfish',
    type: 'fish',
    name: '小丑魚',
    icon: '🐠',
    islands: ['coconut'],
    waterType: 'sea',
    time: 'day',
    weather: 'any',
    rarity: 2,
    price: 52,
    minSize: 8,
    maxSize: 15,
    shadowSize: 0.62,
    desc: '橘白相間的熱帶小明星，最喜歡椰林島溫暖清澈的珊瑚海灣。'
  },
  {
    id: 'blue_tang',
    type: 'fish',
    name: '藍倒吊',
    icon: '🐟',
    islands: ['coconut'],
    waterType: 'sea',
    time: 'day',
    weather: 'any',
    rarity: 3,
    price: 78,
    minSize: 18,
    maxSize: 31,
    shadowSize: 0.78,
    desc: '如寶石般湛藍的熱帶魚，尾鰭帶著亮眼檸檬黃。'
  },
  {
    id: 'pufferfish',
    type: 'fish',
    name: '刺河豚',
    icon: '🐡',
    islands: ['coconut', 'main'],
    waterType: 'sea',
    time: 'any',
    weather: 'any',
    rarity: 2,
    price: 48,
    minSize: 20,
    maxSize: 38,
    shadowSize: 0.85,
    desc: '受到驚嚇就會鼓成圓滾滾的一顆刺球，模樣其實很呆萌。'
  },
  {
    id: 'manta_ray',
    type: 'fish',
    name: '鬼蝠魟',
    icon: '🦈',
    islands: ['coconut', 'ocean'],
    waterType: 'sea',
    time: 'day',
    weather: 'sunny',
    rarity: 4,
    price: 165,
    minSize: 240,
    maxSize: 420,
    shadowSize: 1.65,
    desc: '宛如在海裡展翅飛翔的溫柔巨人，晴朗日子會在椰林外海現身。'
  },
  // Sakura Bamboo Isle Exclusives
  {
    id: 'koi',
    type: 'fish',
    name: '紅白錦鯉',
    icon: '🎏',
    islands: ['sakura', 'main'],
    waterType: 'pond',
    time: 'any',
    weather: 'any',
    rarity: 3,
    price: 92,
    minSize: 42,
    maxSize: 75,
    shadowSize: 1.15,
    desc: '優雅漫步在落櫻水面的錦鯉，據說看見它會帶來一整天的好運。'
  },
  {
    id: 'golden_koi',
    type: 'fish',
    name: '黃金錦鯉',
    icon: '✨',
    islands: ['sakura'],
    waterType: 'pond',
    time: 'any',
    weather: 'any',
    rarity: 5,
    price: 240,
    minSize: 55,
    maxSize: 88,
    shadowSize: 1.35,
    desc: '櫻花竹林池塘裡的傳說主宰，鱗片如陽光熔金般耀眼！'
  },
  {
    id: 'sakura_shrimp',
    type: 'fish',
    name: '櫻花甜蝦',
    icon: '🦐',
    islands: ['sakura'],
    waterType: 'sea',
    time: 'any',
    weather: 'any',
    rarity: 2,
    price: 50,
    minSize: 6,
    maxSize: 12,
    shadowSize: 0.58,
    desc: '晶瑩粉紅的小蝦，只在櫻花島周邊海域成群舞動。'
  },
  // Starlight Ruins & Deep Ocean Exclusives
  {
    id: 'crystal_jelly',
    type: 'fish',
    name: '水晶水母',
    icon: '🪼',
    islands: ['ruins'],
    waterType: 'pond',
    time: 'night',
    weather: 'any',
    rarity: 3,
    price: 115,
    minSize: 15,
    maxSize: 32,
    shadowSize: 0.85,
    desc: '在星光遺跡水池裡發散微藍螢光的神秘水母，如飄浮的星辰。'
  },
  {
    id: 'blue_tuna',
    type: 'fish',
    name: '黑鮪魚',
    icon: '🐟',
    islands: ['ocean', 'ruins'],
    waterType: 'sea',
    time: 'any',
    weather: 'any',
    rarity: 4,
    price: 185,
    minSize: 160,
    maxSize: 280,
    shadowSize: 1.6,
    desc: '外海深水處的疾速泳者，需要駕船出海才容易釣到的大物！'
  },
  {
    id: 'oarfish',
    type: 'fish',
    name: '皇帶魚',
    icon: '🐉',
    islands: ['ruins', 'ocean'],
    waterType: 'sea',
    time: 'night',
    weather: 'any',
    rarity: 5,
    price: 280,
    minSize: 320,
    maxSize: 580,
    shadowSize: 1.85,
    desc: '如絲帶般閃耀銀紅光澤的深海龍宮使者，夜晚才浮上淺海。'
  },
  {
    id: 'coelacanth',
    type: 'fish',
    name: '腔棘魚',
    icon: '🦕',
    islands: ['ruins', 'ocean'],
    waterType: 'sea',
    time: 'any',
    weather: 'rain',
    rarity: 5,
    price: 340,
    minSize: 130,
    maxSize: 195,
    shadowSize: 1.75,
    desc: '活化石般的遠古神話魚種，只在雨天於神秘遺跡海域悄悄現身！'
  },
  {
    id: 'rain_frogfish',
    type: 'fish',
    name: '雨滴鬥魚',
    icon: '🐠',
    islands: ['main', 'sakura', 'ruins'],
    waterType: 'pond',
    time: 'any',
    weather: 'rain',
    rarity: 3,
    price: 98,
    minSize: 10,
    maxSize: 18,
    shadowSize: 0.68,
    desc: '下雨時才會浮出水面享受雨滴的寶石色小魚。'
  }
];

export const BUG_LIST = [
  // Main Island & General
  {
    id: 'cabbage_butterfly',
    type: 'bug',
    name: '紋白蝶',
    icon: '🦋',
    islands: ['main', 'sakura', 'coconut'],
    behavior: 'fly',
    time: 'day',
    weather: 'sunny',
    rarity: 1,
    price: 20,
    minSize: 4.2,
    maxSize: 6.4,
    color: 0xfefae0,
    skittish: 0.15,
    desc: '在花叢間輕盈飛舞的純白蝴蝶，帶來春天的氣息。'
  },
  {
    id: 'monarch_butterfly',
    type: 'bug',
    name: '帝王斑蝶',
    icon: '🦋',
    islands: ['main', 'coconut'],
    behavior: 'fly',
    time: 'day',
    weather: 'sunny',
    rarity: 2,
    price: 44,
    minSize: 8.5,
    maxSize: 11.2,
    color: 0xf48c25,
    skittish: 0.25,
    desc: '擁有橘黑彩繪翅膀的旅行家，喜歡隨著海風長途飛翔。'
  },
  {
    id: 'ladybug',
    type: 'bug',
    name: '七星瓢蟲',
    icon: '🐞',
    islands: ['main', 'sakura'],
    behavior: 'ground',
    time: 'day',
    weather: 'any',
    rarity: 1,
    price: 24,
    minSize: 0.6,
    maxSize: 1.1,
    color: 0xe63946,
    skittish: 0.1,
    desc: '圓滾滾的紅色小點點，小兔花花最喜歡的花園守護者！'
  },
  {
    id: 'red_dragonfly',
    type: 'bug',
    name: '紅蜻蜓',
    icon: '🪰',
    islands: ['main', 'sakura'],
    behavior: 'fly',
    time: 'day',
    weather: 'any',
    rarity: 2,
    price: 38,
    minSize: 3.8,
    maxSize: 5.5,
    color: 0xd9483b,
    skittish: 0.4,
    desc: '敏捷穿梭在池塘上空的紅色精靈，需要看準時機揮網！'
  },
  {
    id: 'snail',
    type: 'bug',
    name: '雨天蝸牛',
    icon: '🐌',
    islands: ['main', 'sakura', 'ruins'],
    behavior: 'ground',
    time: 'any',
    weather: 'rain',
    rarity: 2,
    price: 54,
    minSize: 3.2,
    maxSize: 5.8,
    color: 0xbc8a5f,
    skittish: 0.0,
    desc: '下起小雨時會背著漂亮螺殼出來散步，完全不會被嚇跑。'
  },
  {
    id: 'cricket',
    type: 'bug',
    name: '鈴蟲',
    icon: '🦗',
    islands: ['main', 'sakura'],
    behavior: 'ground',
    time: 'night',
    weather: 'any',
    rarity: 2,
    price: 46,
    minSize: 2.0,
    maxSize: 3.2,
    color: 0x4a3b2c,
    skittish: 0.25,
    desc: '夜幕降臨後在草叢裡奏出如風鈴般清脆的旋律。'
  },
  // Coconut Lagoon Exclusives
  {
    id: 'rhino_beetle',
    type: 'bug',
    name: '獨角仙',
    icon: '🪲',
    islands: ['coconut', 'main'],
    behavior: 'ground',
    time: 'night',
    weather: 'any',
    rarity: 3,
    price: 110,
    minSize: 6.5,
    maxSize: 9.2,
    color: 0x5c3317,
    skittish: 0.45,
    desc: '擁有帥氣大角的甲蟲王者，夜晚常聚集在椰子樹幹附近！'
  },
  {
    id: 'tropical_swallowtail',
    type: 'bug',
    name: '翡翠鳳蝶',
    icon: '🦋',
    islands: ['coconut'],
    behavior: 'fly',
    time: 'day',
    weather: 'sunny',
    rarity: 3,
    price: 88,
    minSize: 10.5,
    maxSize: 14.0,
    color: 0x2ec4b6,
    skittish: 0.45,
    desc: '翅膀折射出熱帶瀉湖般藍綠光澤的美麗大型鳳蝶。'
  },
  {
    id: 'hermit_crab',
    type: 'bug',
    name: '珊瑚寄居蟹',
    icon: '🦀',
    islands: ['coconut'],
    behavior: 'ground',
    time: 'any',
    weather: 'any',
    rarity: 2,
    price: 62,
    minSize: 4.5,
    maxSize: 8.2,
    color: 0xf77f5e,
    skittish: 0.2,
    desc: '背著粉彩貝殼在椰林沙灘橫著走的害羞小傢伙。'
  },
  // Sakura Bamboo Isle Exclusives
  {
    id: 'sakura_butterfly',
    type: 'bug',
    name: '櫻花蝶',
    icon: '🌸',
    islands: ['sakura'],
    behavior: 'fly',
    time: 'day',
    weather: 'any',
    rarity: 3,
    price: 96,
    minSize: 7.0,
    maxSize: 9.5,
    color: 0xffb3c6,
    skittish: 0.35,
    desc: '翅膀宛如櫻花花瓣般柔美，不仔細看還以為是飄落的花瓣。'
  },
  {
    id: 'orchid_mantis',
    type: 'bug',
    name: '蘭花螳螂',
    icon: '🦗',
    islands: ['sakura'],
    behavior: 'ground',
    time: 'day',
    weather: 'any',
    rarity: 4,
    price: 155,
    minSize: 5.5,
    maxSize: 7.8,
    color: 0xffccd5,
    skittish: 0.4,
    desc: '偽裝成粉白蘭花的昆蟲界藝術品，靜靜躲在櫻花島的花叢裡。'
  },
  {
    id: 'firefly',
    type: 'bug',
    name: '星夜流螢',
    icon: '✨',
    islands: ['sakura', 'main'],
    behavior: 'fly',
    time: 'night',
    weather: 'sunny',
    rarity: 3,
    price: 105,
    minSize: 1.2,
    maxSize: 2.0,
    color: 0xe9ff70,
    glow: true,
    skittish: 0.2,
    desc: '在晴朗夏夜池畔緩緩提燈飛舞的小螢火蟲，溫暖又夢幻。'
  },
  // Starlight Ruins Exclusives
  {
    id: 'lunar_moth',
    type: 'bug',
    name: '月神蛾',
    icon: '🦋',
    islands: ['ruins'],
    behavior: 'fly',
    time: 'night',
    weather: 'any',
    rarity: 5,
    price: 230,
    minSize: 11.0,
    maxSize: 15.5,
    color: 0xa8f9ff,
    glow: true,
    skittish: 0.55,
    desc: '散發淡淡月華微光的神秘大蛾，夜晚圍繞著遺跡水晶翩然起舞。'
  },
  {
    id: 'jewel_beetle',
    type: 'bug',
    name: '彩虹吉丁蟲',
    icon: '🪲',
    islands: ['ruins', 'coconut'],
    behavior: 'ground',
    time: 'day',
    weather: 'sunny',
    rarity: 4,
    price: 190,
    minSize: 3.5,
    maxSize: 4.8,
    color: 0x38d9a9,
    skittish: 0.55,
    desc: '背甲閃耀著綠紫金三色金屬光澤，被古代島民視為寶石！'
  }
];

export const ALL_CREATURES = [...FISH_LIST, ...BUG_LIST];
export const CREATURE_MAP = Object.fromEntries(ALL_CREATURES.map(c => [c.id, c]));

export function matchesTime(creatureTime, isNight) {
  if (creatureTime === 'any') return true;
  if (creatureTime === 'night') return isNight;
  if (creatureTime === 'day') return !isNight;
  return true;
}

export function matchesWeather(creatureWeather, isRain) {
  if (creatureWeather === 'any') return true;
  if (creatureWeather === 'rain') return isRain;
  if (creatureWeather === 'sunny') return !isRain;
  return true;
}

export function pickWeightedCreature(candidates, luckBonus = 0) {
  if (!candidates.length) return null;
  const weights = candidates.map(c => {
    // Base weight inversely related to rarity; luckBonus boosts rare creatures!
    const base = Math.pow(0.46 + luckBonus * 0.14, c.rarity - 1);
    return Math.max(0.05, base);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function rollCreatureSize(creature) {
  const t = Math.pow(Math.random(), 0.85);
  const val = creature.minSize + (creature.maxSize - creature.minSize) * t;
  return Math.round(val * 10) / 10;
}

export function formatRarity(r) {
  return '★'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r));
}
