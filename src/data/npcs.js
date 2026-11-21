export const NPCS = [
  {
    id: 'tanuki',
    name: '阿狸店長',
    role: '微風雜貨店老闆',
    species: 'tanuki',
    portrait: '🦝',
    islandId: 'main',
    x: 6.8,
    z: -4.2,
    facing: 0.4,
    opensShop: true,
    greeting: '歡迎來到微風雜貨店！除了賣魚蟲、升級裝備，我們還新進了超多可愛的家具與擺設，蓋好自己的小屋就能盡情佈置喔！',
    quests: [
      {
        id: 'q_tanuki_1',
        title: '商店街的第一筆生意',
        desc: '去抓或釣任意 2 隻生物，再回來找阿狸店長聊聊或出售！',
        type: 'catch_any',
        targetCount: 2,
        rewardCoins: 80,
        startText: '新搬來的冒險家你好呀！試著切換「釣竿」或「捕蟲網」，幫我收集 2 隻島上的魚、昆蟲或小蜥蜴來看看吧！',
        progressText: '裝備釣竿去海邊／池塘，或拿捕蟲網「潛行」靠近蝴蝶與小蜥蜴，收集 2 隻就可以囉！',
        completeText: '太厲害了！你果然很有冒險天分！這是給你的見面禮 80 金幣，西邊空地也能蓋自己的小屋喔！'
      },
      {
        id: 'q_tanuki_2',
        title: '佈置自己的溫馨小屋',
        desc: '在微風港灣西側蓋起自己的小屋，並在屋內擺放至少 2 件家具。',
        type: 'placed_furniture',
        targetCount: 2,
        rewardCoins: 200,
        startText: '島上西邊有一塊超棒的海景空地可以蓋你自己的小屋！蓋好後到店裡買 2 件喜歡的家具放進屋裡，我就送你入厝賀禮！',
        progressText: '走到微風港灣西側的小屋預定地就能蓋屋，進屋後點「🛋️ 裝潢」擺放 2 件家具喔！',
        completeText: '哇！你的小屋佈置得超溫馨的！這 200 金幣是商店街送你的入厝賀禮！'
      },
      {
        id: 'q_tanuki_3',
        title: '群島圖鑑達人',
        desc: '在生物圖鑑中登錄至少 12 種不同的魚類、昆蟲或爬蟲。',
        type: 'dex_count',
        targetCount: 12,
        rewardCoins: 280,
        startText: '聽說微風群島共有 7 座各具特色的島嶼！如果你能在圖鑑登錄 12 種不同生物，店裡會贊助你一筆遠航探險基金！',
        progressText: '多探索不同外島、雨天與夜晚，就能很快湊齊 12 種圖鑑囉！',
        completeText: '哇塞，你的圖鑑越來越豐富了！收下這 280 金幣，去買艘新帆船或豪華家具吧！'
      }
    ]
  },
  {
    id: 'otter',
    name: '老海獺船長',
    role: '碼頭領航員',
    species: 'otter',
    portrait: '🦦',
    islandId: 'main',
    x: 3.4,
    z: 27.5,
    facing: 2.8,
    greeting: '啊哈！海風正舒服呢！群島外海共有 6 座外島等你航行探索：椰林、櫻花、遺跡、翡翠雨林、赤岩溫泉還有極光冰晶島！',
    quests: [
      {
        id: 'q_otter_1',
        title: '新手海釣試煉',
        desc: '在微風港灣或海上釣起 3 條魚。',
        type: 'catch_type',
        targetType: 'fish',
        targetCount: 3,
        rewardCoins: 100,
        startText: '想成為大海的探險家，得先練練釣魚！裝備「釣竿」對著水面魚影拋竿，釣 3 條魚給我瞧瞧吧！',
        progressText: '看到水面浮標冒出紅色驚嘆號「！」時趕快按收線，把魚維持在綠色區域裡喔！',
        completeText: '哈哈好身手！這 100 金幣拿去吧！別忘了走到碼頭邊就能登船出海探索 6 座外島喔！'
      },
      {
        id: 'q_otter_2',
        title: '遠航大物挑戰',
        desc: '釣起 1 條稀有度 4 星以上的魚類（例如黑鮪魚、藍槍魚、鬼蝠魟、巨骨舌魚或鯨鯊）。',
        type: 'catch_rarity',
        targetType: 'fish',
        minRarity: 4,
        targetCount: 1,
        rewardCoins: 300,
        startText: '外海深水處和各座外島棲息著傳說級大魚！駕船出去試著釣一條 4 星以上的大物吧！',
        progressText: '升級釣竿會大大提高稀有大魚的出現率喔，也可以試試在船上直接拋竿！',
        completeText: '不可思議！你竟然真的征服了深海大物！這 300 金幣是船長最誠摯的敬意！'
      }
    ]
  },
  {
    id: 'bunny',
    name: '小兔花花',
    role: '昆蟲與爬蟲觀察家',
    species: 'bunny',
    portrait: '🐰',
    islandId: 'main',
    x: -10.2,
    z: 9.8,
    facing: 0.9,
    greeting: '呀呼～抓昆蟲跟小蜥蜴可不能橫衝直撞喔！按住「潛行」悄悄靠近，等地上圓圈變綠再抓準時機揮網！',
    quests: [
      {
        id: 'q_bunny_1',
        title: '潛行捕蟲入門',
        desc: '使用捕蟲網捕捉 3 隻昆蟲。',
        type: 'catch_type',
        targetType: 'bug',
        targetCount: 3,
        rewardCoins: 110,
        startText: '我正在寫昆蟲觀察日記～抓越多一般昆蟲，就越能吸引超稀有的大兜蟲與鍬形蟲出現喔！先幫我抓 3 隻昆蟲吧！',
        progressText: '裝備「捕蟲網」時按「潛行 (Shift)」慢慢靠近，等揮網計量條指針滑入綠區時立刻按下捕捉！',
        completeText: '太棒了，你的潛行技術好厲害！這 110 金幣請收下，繼續多抓幾隻就能解鎖稀有甲蟲囉～'
      },
      {
        id: 'q_bunny_2',
        title: '林間的可愛爬蟲',
        desc: '捕捉 2 隻爬蟲類動物（例如綠安樂蜥、微笑守宮、櫻池澤龜或藍尾石龍子）。',
        type: 'catch_type',
        targetType: 'reptile',
        targetCount: 2,
        rewardCoins: 180,
        startText: '微風群島最近出現了好多可愛的蜥蜴、守宮和烏龜！牠們同樣很機靈，試著用潛行捕網抓 2 隻爬蟲類讓我觀察吧！',
        progressText: '白天有綠安樂蜥、藍尾石龍子，夜晚有微笑守宮，池邊則有櫻池澤龜喔！',
        completeText: '天啊牠們圓圓的眼睛好可愛！！這 180 金幣送給你，別忘了也可以捐到北邊的博物館展示喔！'
      }
    ]
  },
  {
    id: 'curator',
    name: '館長博博',
    role: '微風博物館館長',
    species: 'owl',
    portrait: '🏛️',
    islandId: 'main',
    indoor: 'museum',
    x: 0,
    z: -4.5,
    facing: 0,
    opensMuseum: true,
    greeting: '呼呼～歡迎蒞臨微風群島自然博物館！您釣到的魚、抓到的甲蟲與爬蟲都可以捐贈給本館，我們會為牠們打造最棒的生態展區！',
    quests: [
      {
        id: 'q_museum_1',
        title: '博物館的第一批館藏',
        desc: '向微風博物館捐贈至少 3 種不同的生物。',
        type: 'museum_count',
        targetCount: 3,
        rewardCoins: 180,
        startText: '呼呼！我們剛落成的水族館、昆蟲館與爬蟲溫室正等待新朋友入住！請捐贈任意 3 種不同生物給博物館吧！',
        progressText: '帶著背包裡的新生物進入微風港灣北側的博物館，與我對話就能捐贈喔！',
        completeText: '呼呼～太精彩了！你看牠們在展區裡多麼生氣勃勃！這是本館致贈的 180 金幣研究津貼！'
      },
      {
        id: 'q_museum_2',
        title: '豐富的自然生態展廳',
        desc: '向微風博物館累計捐贈至少 12 種不同的生物。',
        type: 'museum_count',
        targetCount: 12,
        rewardCoins: 420,
        startText: '多虧您的協助，博物館越來越熱鬧了！若能累計捐贈 12 種不同物種，館方將頒發豐厚的研究大獎！',
        progressText: '魚類、昆蟲甲蟲與爬蟲動物皆可捐贈，每捐一種都會立刻出現在 3D 展廳裡喔！',
        completeText: '呼——真是舉世無雙的自然典藏！請收下 420 金幣，期待您收集全群島的奇珍異獸！'
      }
    ]
  },
  {
    id: 'turtle',
    name: '海龜阿慢',
    role: '椰林島日光浴達人',
    species: 'turtle',
    portrait: '🐢',
    islandId: 'coconut',
    x: 92 + 4,
    z: 68 + 6,
    facing: -2.2,
    greeting: '慢～慢～來～歡迎來到熱帶椰林島。這裡的海水清澈又溫暖，沙灘上偶爾還能看見印度星龜和椰林甲蟲喔～',
    quests: [
      {
        id: 'q_turtle_1',
        title: '熱帶海灣的顏色',
        desc: '在熱帶椰林島捕獲 1 隻小丑魚、藍倒吊或蘇眉魚。',
        type: 'catch_ids',
        targetIds: ['clownfish', 'blue_tang', 'napoleonfish'],
        targetCount: 1,
        rewardCoins: 160,
        startText: '你遠道而來辛苦啦～在我們島的沙灘旁，白天常有小丑魚、藍倒吊與蘇眉魚，能幫我釣 1 隻來看看嗎？',
        progressText: '白天在熱帶椰林島海邊拋竿，很容易遇見小丑魚或藍倒吊喔～',
        completeText: '喔～真是療癒的熱帶色彩呢～這是我在沙灘撿到的 160 金幣，送給你慢慢花～'
      }
    ]
  },
  {
    id: 'panda',
    name: '禪師熊貓',
    role: '櫻花竹林守護者',
    species: 'panda',
    portrait: '🐼',
    islandId: 'sakura',
    x: -88 + 5.5,
    z: -66 + 4.5,
    facing: -0.9,
    greeting: '落櫻紛飛，竹影搖曳。旅人，不妨在池畔靜心垂釣，或於夜色中欣賞流螢與鍬形蟲。',
    quests: [
      {
        id: 'q_panda_1',
        title: '櫻花池畔的緣分',
        desc: '在櫻花竹林島捕獲 1 隻紅白錦鯉、黃金錦鯉、櫻花蝶或星夜流螢。',
        type: 'catch_ids',
        targetIds: ['koi', 'golden_koi', 'sakura_butterfly', 'firefly'],
        targetCount: 1,
        rewardCoins: 220,
        startText: '櫻花島的池塘住著高雅的錦鯉，林間則有櫻花蝶與夜裡的流螢。若能與其中任一位結緣，老夫必有重謝。',
        progressText: '試著在櫻花島池塘邊釣錦鯉，或在花樹下潛行捕捉櫻花蝶、夜裡尋找流螢吧。',
        completeText: '善哉善哉，你與這座島嶼果然有緣！這 220 金幣請收下，願微風常伴你左右。'
      }
    ]
  },
  {
    id: 'owl',
    name: '博學貓頭鷹',
    role: '遺跡學者',
    species: 'owl',
    portrait: '🦉',
    islandId: 'ruins',
    x: 86 - 5,
    z: -82 + 4.5,
    facing: 1.4,
    greeting: '呼呼～竟然有旅人航行到神秘遺跡島！這裡的古代水晶蘊含著星光，連遠古巨蜥與黃金鬼鍬形蟲都會被吸引而來呢！',
    quests: [
      {
        id: 'q_owl_1',
        title: '星光遺跡的珍稀標本',
        desc: '在神秘遺跡島捕獲任意 1 隻專屬稀有生物（水晶水母、月神蛾、彩虹吉丁蟲、皇帶魚、腔棘魚或遠古巨蜥）。',
        type: 'catch_ids',
        targetIds: ['crystal_jelly', 'lunar_moth', 'jewel_beetle', 'oarfish', 'coelacanth', 'komodo_monitor', 'golden_stag'],
        targetCount: 1,
        rewardCoins: 360,
        startText: '呼呼！我正在研究遺跡島的古代生態！無論是夜裡的月神蛾、皇帶魚，雨天的腔棘魚，或是晴天的彩虹吉丁蟲與遠古巨蜥，找到任何一種都請給我看一眼！',
        progressText: '神秘遺跡島的珍稀生物常在夜晚或雨天現身，部分稀有昆蟲與爬蟲需先累積捕獲數才會現身喔！',
        completeText: '呼——太驚人了！！這可是足以寫進群島百科的大發現！請收下這 360 金幣的研究獎金！'
      }
    ]
  },
  {
    id: 'monkey',
    name: '小猴奇奇',
    role: '翡翠雨林甲蟲獵人',
    species: 'monkey',
    portrait: '🐒',
    islandId: 'jungle',
    x: -98 - 5,
    z: 74 + 6,
    facing: 0.7,
    greeting: '吱吱！歡迎來到甲蟲與爬蟲的天堂——翡翠雨林島！這裡藏著美他利佛細身鍬形蟲、南洋大兜蟲，還有傳說的赫克力士長戟大兜蟲喔！',
    quests: [
      {
        id: 'q_monkey_1',
        title: '雨林珍稀甲蟲挑戰',
        desc: '捕獲 1 隻雨林大型甲蟲（美他利佛細身鍬形蟲、南洋大兜蟲、彩虹鍬形蟲、大王花金龜、長頸鹿鋸鍬形蟲或赫克力士長戟大兜蟲）。',
        type: 'catch_ids',
        targetIds: ['cyclommatus_stag', 'atlas_beetle', 'rainbow_stag', 'goliath_beetle', 'giraffe_stag', 'hercules_beetle'],
        targetCount: 1,
        rewardCoins: 380,
        startText: '吱吱！想抓到傳說大兜蟲和鍬形蟲，得先多抓些一般昆蟲練練手感牠們才會現身！抓到任何一隻雨林珍稀甲蟲就來炫耀一下吧！',
        progressText: '查看圖鑑就能知道各種大兜蟲需要累積抓幾隻昆蟲解鎖喔！靠近時務必按住「潛行」！',
        completeText: '吱哇！！這角也太帥氣了吧！！你簡直是甲蟲之王！這 380 金幣送給你！'
      },
      {
        id: 'q_monkey_2',
        title: '雨林池塘與爬蟲探索',
        desc: '捕獲 1 隻銀龍魚、巨骨舌魚、綠鬣蜥、高冠變色龍或翡翠樹蚺。',
        type: 'catch_ids',
        targetIds: ['arowana', 'arapaima', 'green_iguana', 'veiled_chameleon', 'emerald_tree_boa'],
        targetCount: 1,
        rewardCoins: 320,
        startText: '雨林深處除了甲蟲，池塘裡還有銀龍魚與巨骨舌魚，樹影間躲著綠鬣蜥、變色龍和翡翠樹蚺！幫我見識其中一種吧！',
        progressText: '白天找綠鬣蜥或變色龍，夜晚可以去池塘釣巨骨舌魚或在林間找翡翠樹蚺喔！',
        completeText: '太猛啦！雨林裡的稀世珍寶都被你收服了！拿去吧，這是 320 金幣！'
      }
    ]
  },
  {
    id: 'fennec',
    name: '沙狐赤赤',
    role: '赤岩溫泉探險家',
    species: 'fennec',
    portrait: '🦊',
    islandId: 'volcano',
    x: 148 + 5,
    z: -6 - 5,
    facing: -1.8,
    greeting: '呼～赤岩溫泉島暖呼呼的超舒服！白天的鬃獅蜥和晚上的豹紋守宮都超可愛，溫泉池裡還有神秘的溫泉金鱒喔！',
    quests: [
      {
        id: 'q_fennec_1',
        title: '赤岩的爬蟲與秘湯魚',
        desc: '捕獲 1 隻鬃獅蜥、豹紋守宮、印度星龜、寶石聖甲蟲或溫泉金鱒。',
        type: 'catch_ids',
        targetIds: ['bearded_dragon', 'leopard_gecko', 'star_tortoise', 'scarab_beetle', 'golden_trout'],
        targetCount: 1,
        rewardCoins: 300,
        startText: '你竟然划船來到東邊的赤岩溫泉島！這裡的陽光岩石最受爬蟲類歡迎，幫我捕捉 1 隻赤岩代表生物來看看吧！',
        progressText: '白天可在紅岩上找鬃獅蜥或星龜，夜晚則有豹紋守宮、寶石聖甲蟲與溫泉金鱒喔！',
        completeText: '太可愛了！赤岩溫泉的靈氣果然孕育出最棒的生物！這 300 金幣請收下！'
      }
    ]
  },
  {
    id: 'penguin',
    name: '企鵝波波',
    role: '極光冰海研究員',
    species: 'penguin',
    portrait: '🐧',
    islandId: 'glacier',
    x: -6 - 5,
    z: -140 + 6,
    facing: 0.6,
    greeting: '啪嗒啪嗒！歡迎來到北方最涼爽的極光冰晶島！冰池裡有肥美的帝王鮭，夜空下還能遇見冰海天使與極光雪蛾喔！',
    quests: [
      {
        id: 'q_penguin_1',
        title: '極光冰海的奇蹟',
        desc: '捕獲 1 隻帝王鮭、冰海天使、翻車魚、鯨鯊、極光雪蛾或冰晶雪蜥。',
        type: 'catch_ids',
        targetIds: ['king_salmon', 'sea_angel', 'ocean_sunfish', 'whale_shark', 'snow_moth', 'crystal_lizard'],
        targetCount: 1,
        rewardCoins: 340,
        startText: '遠航到最北方的極光冰晶島真不簡單！試著在冰池釣條帝王鮭，或在極光夜空下尋找冰海天使、雪蛾與冰晶雪蜥吧！',
        progressText: '冰池全年都有帝王鮭；夜晚的海邊有冰海天使，雪地裡還藏著極光雪蛾與冰晶雪蜥！',
        completeText: '啪嗒啪嗒！太厲害了！！這是我們極地探險隊頒發的 340 金幣獎金！'
      }
    ]
  }
];

export const NPC_MAP = Object.fromEntries(NPCS.map(n => [n.id, n]));
