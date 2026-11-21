export const SHOP_UPGRADES = [
  {
    id: 'rod_lv2',
    category: 'upgrade',
    target: 'rodLevel',
    level: 2,
    requires: null,
    name: '竹製精工釣竿',
    icon: '🎣',
    price: 150,
    desc: '收線區域變寬、收線更快，更容易吸引稀有魚類！'
  },
  {
    id: 'rod_lv3',
    category: 'upgrade',
    target: 'rodLevel',
    level: 3,
    requires: 'rod_lv2',
    name: '黃金大師釣竿',
    icon: '✨',
    price: 480,
    desc: '傳說級釣竿！極寬收線區與大幅提升傳說魚上鉤機率。'
  },
  {
    id: 'net_lv2',
    category: 'upgrade',
    target: 'netLevel',
    level: 2,
    requires: null,
    name: '寬口輕盈捕蟲網',
    icon: '🥅',
    price: 140,
    desc: '捕蟲範圍大幅擴大，接近稀有昆蟲時不容易驚動牠們。'
  },
  {
    id: 'net_lv3',
    category: 'upgrade',
    target: 'netLevel',
    level: 3,
    requires: 'net_lv2',
    name: '黃金星光捕蟲網',
    icon: '🌟',
    price: 440,
    desc: '超大捕獲半徑，連最害羞的月神蛾都能輕鬆收入囊中！'
  },
  {
    id: 'boat_lv2',
    category: 'upgrade',
    target: 'boatLevel',
    level: 2,
    requires: null,
    name: '乘風白帆小船',
    icon: '⛵',
    price: 260,
    desc: '加裝潔白三角風帆！海上航速提升 45%，輕鬆前往各座外島。'
  },
  {
    id: 'boat_lv3',
    category: 'upgrade',
    target: 'boatLevel',
    level: 3,
    requires: 'boat_lv2',
    name: '星光探險帆艇',
    icon: '🚤',
    price: 680,
    desc: '附帶船頭提燈與金色船身！頂級航速，遠航遺跡島如履平地。'
  },
  {
    id: 'lucky_charm',
    category: 'upgrade',
    target: 'luckyCharm',
    level: 1,
    requires: null,
    name: '海神幸運御守',
    icon: '🧿',
    price: 350,
    desc: '提升稀有魚蟲遇見率，且出售給商店時金幣額外 +25%！'
  }
];

export const SHOP_COSMETICS = [
  // Hats
  {
    id: 'hat_none',
    slot: 'hat',
    name: '不戴帽子',
    icon: '🙂',
    price: 0,
    free: true,
    desc: '享受清爽的海風吹拂髮梢。'
  },
  {
    id: 'hat_straw',
    slot: 'hat',
    name: '陽光草帽',
    icon: '👒',
    price: 90,
    color: 0xe8c77b,
    ribbon: 0xe05d4f,
    desc: '充滿夏日度假氛圍的編織草帽。'
  },
  {
    id: 'hat_sailor',
    slot: 'hat',
    name: '小小船長帽',
    icon: '⚓',
    price: 160,
    color: 0xf8f9fa,
    ribbon: 0x22577a,
    desc: '戴上它就像真正的大海探險家！'
  },
  {
    id: 'hat_sakura',
    slot: 'hat',
    name: '落櫻花冠',
    icon: '🌸',
    price: 220,
    color: 0xffb3c6,
    ribbon: 0x70c178,
    desc: '用櫻花與綠葉編織而成的夢幻花環。'
  },
  {
    id: 'hat_explorer',
    slot: 'hat',
    name: '冒險家遮陽帽',
    icon: '🤠',
    price: 240,
    color: 0x8d5b35,
    ribbon: 0xd9a043,
    desc: '翻山越嶺、探索遺跡必備的經典帽子。'
  },
  {
    id: 'hat_starlight',
    slot: 'hat',
    name: '星光尖頂帽',
    icon: '🧙',
    price: 420,
    color: 0x2c4b82,
    ribbon: 0xf4d35e,
    desc: '點綴著星辰光澤的神秘尖帽，在夜晚格外耀眼。'
  },
  // Outfits (shirt colors)
  {
    id: 'outfit_coral',
    slot: 'outfit',
    name: '珊瑚暖橘衣',
    icon: '👕',
    price: 0,
    free: true,
    shirtColor: 0xe76f51,
    pantsColor: 0x3b5978,
    desc: '經典元氣的島嶼冒險服裝。'
  },
  {
    id: 'outfit_ocean',
    slot: 'outfit',
    name: '海風水手服',
    icon: '🎽',
    price: 110,
    shirtColor: 0x2a9d8f,
    pantsColor: 0x264653,
    desc: '清爽的海洋青色，最適合出海航行。'
  },
  {
    id: 'outfit_sakura',
    slot: 'outfit',
    name: '櫻粉羽織',
    icon: '👘',
    price: 180,
    shirtColor: 0xf284a2,
    pantsColor: 0x5c4742,
    desc: '溫柔淡雅的櫻花粉色穿搭。'
  },
  {
    id: 'outfit_forest',
    slot: 'outfit',
    name: '森之旅人裝',
    icon: '🧥',
    price: 160,
    shirtColor: 0x4d9057,
    pantsColor: 0x5e4934,
    desc: '融入大自然的森林綠，抓蟲更有感覺！'
  },
  {
    id: 'outfit_sunny',
    slot: 'outfit',
    name: '向日葵黃毛衣',
    icon: '💛',
    price: 150,
    shirtColor: 0xf4b942,
    pantsColor: 0x4b6584,
    desc: '像太陽一樣溫暖明亮的黃色上衣。'
  }
];

export const COSMETIC_MAP = Object.fromEntries(SHOP_COSMETICS.map(c => [c.id, c]));
export const UPGRADE_MAP = Object.fromEntries(SHOP_UPGRADES.map(u => [u.id, u]));
