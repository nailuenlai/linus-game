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
    desc: '擴大捕網判定與潛行隱匿度，並放寬精準揮網的成功綠區！'
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
    desc: '頂級捕蟲神網！極高隱匿性與減緩瞄準指標速度，助你擒獲長戟大兜蟲！'
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
    desc: '附帶船頭提燈與金色船身！頂級航速，遠航極光與火山外島如履平地。'
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
    desc: '提升稀有魚、甲蟲與爬蟲遇見率，且出售給商店時金幣額外 +25%！'
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
    desc: '翻山越嶺、探索雨林與遺跡必備的經典帽子。'
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
  // Outfits
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
    desc: '融入大自然的森林綠，潛行抓甲蟲更有感覺！'
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

export const SHOP_FURNITURE = [
  {
    id: 'furn_bed',
    name: '暖木單人床',
    icon: '🛏️',
    category: '家具',
    price: 150,
    walkable: false,
    radius: 0.95,
    desc: '鋪著柔軟海藍格紋棉被的原木小床，冒險累了最想窩進去！'
  },
  {
    id: 'furn_sofa',
    name: '海洋藍布沙發',
    icon: '🛋️',
    category: '家具',
    price: 180,
    walkable: false,
    radius: 0.95,
    desc: '蓬鬆舒適的雙人布沙發，附贈兩顆暖橘色抱枕。'
  },
  {
    id: 'furn_table',
    name: '原木小茶几',
    icon: '🪵',
    category: '家具',
    price: 95,
    walkable: false,
    radius: 0.72,
    desc: '溫潤橡木打造的圓角茶几，上面擺著小茶壺與茶杯。'
  },
  {
    id: 'furn_dining_table',
    name: '橡木餐桌組',
    icon: '🍽️',
    category: '家具',
    price: 200,
    walkable: false,
    radius: 0.95,
    desc: '附帶兩張木椅的溫馨餐桌，桌上還放著新鮮水果籃。'
  },
  {
    id: 'furn_bookshelf',
    name: '復古博物書架',
    icon: '📚',
    category: '家具',
    price: 165,
    walkable: false,
    radius: 0.78,
    desc: '塞滿魚類百科與甲蟲圖鑑的木頭書櫃，充滿書香氣息。'
  },
  {
    id: 'furn_wardrobe',
    name: '鄉村原木衣櫃',
    icon: '🚪',
    category: '家具',
    price: 175,
    walkable: false,
    radius: 0.78,
    desc: '手工雕花木門衣櫃，收納所有帽子與冒險穿搭。'
  },
  {
    id: 'furn_cushion',
    name: '櫻花圓座墊',
    icon: '🪷',
    category: '飾品',
    price: 70,
    walkable: true,
    radius: 0.45,
    desc: '軟綿綿的粉櫻色坐墊，可隨意擺在茶几或地毯旁。'
  },
  {
    id: 'furn_rug',
    name: '珊瑚編織地毯',
    icon: '🧶',
    category: '地毯',
    price: 120,
    walkable: true,
    radius: 0,
    desc: '鋪在地板上立刻讓小屋溫暖度倍增的手工編織圓地毯（可踩踏）。'
  },
  {
    id: 'furn_lamp',
    name: '貝殼立燈',
    icon: '💡',
    category: '燈飾',
    price: 115,
    walkable: false,
    radius: 0.5,
    desc: '散發柔和暖黃光暈的珍珠貝殼造型落地燈。'
  },
  {
    id: 'furn_star_globe',
    name: '星光水晶球座燈',
    icon: '🔮',
    category: '燈飾',
    price: 270,
    walkable: false,
    radius: 0.6,
    desc: '仿造神秘遺跡水晶打造的懸浮星光燈座，魔幻又療癒！'
  },
  {
    id: 'furn_plant',
    name: '龜背芋盆栽',
    icon: '🪴',
    category: '植栽',
    price: 85,
    walkable: false,
    radius: 0.55,
    desc: '生機盎然的陶盆熱帶觀葉植物，為房間注入雨林綠意。'
  },
  {
    id: 'furn_bonsai',
    name: '櫻花小盆景',
    icon: '🌸',
    category: '植栽',
    price: 160,
    walkable: false,
    radius: 0.58,
    desc: '取自櫻花竹林島的精緻微型櫻花盆景，四季盛開！'
  },
  {
    id: 'furn_aquarium',
    name: '迷你熱帶魚缸',
    icon: '🐠',
    category: '生態擺設',
    price: 260,
    walkable: false,
    radius: 0.85,
    desc: '發著蔚藍燈光的室內觀賞魚缸，裡面有小魚悠閒游動！'
  },
  {
    id: 'furn_terrarium',
    name: '甲蟲生態展示箱',
    icon: '🪲',
    category: '生態擺設',
    price: 245,
    walkable: false,
    radius: 0.82,
    desc: '放有原木樹枝與青苔的專業昆蟲飼養箱，超適合甲蟲迷！'
  },
  {
    id: 'furn_fireplace',
    name: '溫馨紅磚壁爐',
    icon: '🔥',
    category: '豪華家具',
    price: 320,
    walkable: false,
    radius: 0.9,
    desc: '跳動著溫暖火苗的紅磚小壁爐，雨夜聽雨取暖最幸福。'
  },
  {
    id: 'furn_trophy',
    name: '黃金海島獎盃',
    icon: '🏆',
    category: '豪華擺設',
    price: 420,
    walkable: false,
    radius: 0.58,
    desc: '象徵微風群島傳奇冒險家的閃耀純金紀念獎盃！'
  }
];

export const HOUSE_TIERS = [
  {
    level: 1,
    name: '溫馨原木小屋',
    price: 50,
    roomHalfSize: 5.5,
    desc: '在微風港灣蓋起屬於自己的海島原木小屋！內部 11×11 空間可自由擺放家具。'
  },
  {
    level: 2,
    name: '寬敞海景木屋別墅',
    price: 360,
    roomHalfSize: 7.5,
    desc: '擴建小屋為豪華雙坡海景別墅！室內空間擴大至 15×15，擺得下整套家具收藏！'
  }
];

export const MUSEUM_MILESTONES = [
  { count: 5, coins: 160, title: '自然愛好者', bonusFurniture: 'furn_plant' },
  { count: 15, coins: 350, title: '群島生態學家', bonusFurniture: 'furn_terrarium' },
  { count: 30, coins: 650, title: '博物典藏大師', bonusFurniture: 'furn_aquarium' },
  { count: 50, coins: 1200, title: '傳奇自然守護者', bonusFurniture: 'furn_trophy' }
];

export const COSMETIC_MAP = Object.fromEntries(SHOP_COSMETICS.map(c => [c.id, c]));
export const UPGRADE_MAP = Object.fromEntries(SHOP_UPGRADES.map(u => [u.id, u]));
export const FURNITURE_MAP = Object.fromEntries(SHOP_FURNITURE.map(f => [f.id, f]));
