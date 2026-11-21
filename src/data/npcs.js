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
    greeting: '歡迎來到微風雜貨店！想賣掉剛釣到的魚和昆蟲，還是添購新裝備與新帽子呢？',
    quests: [
      {
        id: 'q_tanuki_1',
        title: '商店街的第一筆生意',
        desc: '去抓或釣任意 2 隻生物，再回來找阿狸店長聊聊或出售！',
        type: 'catch_any',
        targetCount: 2,
        rewardCoins: 80,
        startText: '新搬來的冒險家你好呀！試著切換「釣竿」或「捕蟲網」，幫我收集 2 隻島上的魚或昆蟲來看看吧！',
        progressText: '只要裝備釣竿去海邊／池塘，或拿捕蟲網找花叢裡的蝴蝶，收集 2 隻就可以了喔！',
        completeText: '太厲害了！你果然很有冒險天分！這是給你的開業見面禮 80 金幣，記得常來升級工具喔！'
      },
      {
        id: 'q_tanuki_2',
        title: '圖鑑小達人',
        desc: '在生物圖鑑中登錄至少 6 種不同的魚或昆蟲。',
        type: 'dex_count',
        targetCount: 6,
        rewardCoins: 180,
        startText: '聽說各座外島有好多珍奇生物！如果你能在圖鑑登錄 6 種不同生物，店裡會贊助你一筆探險基金喔！',
        progressText: '再多探索不同時段或搭船去外島看看，就能很快湊齊 6 種圖鑑囉！',
        completeText: '哇塞，你的圖鑑越來越豐富了！收下這 180 金幣，去買艘新帆船或新帽子吧！'
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
    greeting: '啊哈！海風正舒服呢！旁邊那艘小船隨時可以開出海，往東南、西北、東北都能發現外島喔！',
    quests: [
      {
        id: 'q_otter_1',
        title: '新手海釣試煉',
        desc: '在微風港灣或海上釣起 3 條魚。',
        type: 'catch_type',
        targetType: 'fish',
        targetCount: 3,
        rewardCoins: 100,
        startText: '想成為大海的男兒／女兒，得先練練釣魚！裝備「釣竿」對著水面魚影拋竿，釣 3 條魚給我瞧瞧吧！',
        progressText: '看到水面浮標冒出紅色驚嘆號「！」時趕快按收線，把魚維持在綠色區域裡喔！',
        completeText: '哈哈好身手！這 100 金幣拿去吧！別忘了走到碼頭邊就能登船出海探索外島喔！'
      },
      {
        id: 'q_otter_2',
        title: '遠航大物挑戰',
        desc: '釣起 1 條稀有度 4 星以上的魚類（例如黑鮪魚、鬼蝠魟或皇帶魚）。',
        type: 'catch_rarity',
        targetType: 'fish',
        minRarity: 4,
        targetCount: 1,
        rewardCoins: 280,
        startText: '外海深水處和外島周圍偶爾會出現傳說級大魚！駕船出去試著釣一條 4 星以上的大物吧！',
        progressText: '升級釣竿會大大提高稀有大魚的出現率喔，也可以試試在船上直接拋竿！',
        completeText: '不可思議！你竟然真的征服了深海大物！這 280 金幣是船長最誠摯的敬意！'
      }
    ]
  },
  {
    id: 'bunny',
    name: '小兔花花',
    role: '昆蟲觀察家',
    species: 'bunny',
    portrait: '🐰',
    islandId: 'main',
    x: -11.5,
    z: 9.5,
    facing: 0.9,
    greeting: '呀呼～你看到花叢裡飛來飛去的蝴蝶了嗎？輕輕靠近再用捕蟲網揮下去就對了！',
    quests: [
      {
        id: 'q_bunny_1',
        title: '花叢裡的訪客',
        desc: '使用捕蟲網捕捉 3 隻昆蟲。',
        type: 'catch_type',
        targetType: 'bug',
        targetCount: 3,
        rewardCoins: 95,
        startText: '我正在寫昆蟲觀察日記～可以請你幫忙抓 3 隻昆蟲讓我研究看看嗎？',
        progressText: '裝備「捕蟲網」靠近蝴蝶或瓢蟲，按互動鍵揮網就可以抓到囉！',
        completeText: '天啊牠們好可愛！！謝謝你幫了我大忙，這 95 金幣請收下～'
      },
      {
        id: 'q_bunny_2',
        title: '雨天或夜晚的昆蟲',
        desc: '捕捉 1 隻只在夜晚或雨天出現的昆蟲（例如流螢、獨角仙、蝸牛、鈴蟲或月神蛾）。',
        type: 'catch_special_bug',
        targetCount: 1,
        rewardCoins: 200,
        startText: '你知道嗎？不同時間和天氣會出現完全不同的蟲蟲！可以點左上角的時間牌或廣場長椅切換時段，去抓 1 隻夜行或雨天昆蟲吧！',
        progressText: '夜晚會有流螢、鈴蟲與獨角仙，下雨天則會有可愛的雨天蝸牛出來散步喔！',
        completeText: '哇！這隻真的超珍貴！我已經把牠畫進日記裡了，給你 200 金幣當作謝禮！'
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
    greeting: '慢～慢～來～歡迎來到熱帶椰林島。這裡的海水清澈又溫暖，最適合放空和找熱帶魚了～',
    quests: [
      {
        id: 'q_turtle_1',
        title: '熱帶海灣的顏色',
        desc: '在熱帶椰林島捕獲 1 隻小丑魚或藍倒吊。',
        type: 'catch_ids',
        targetIds: ['clownfish', 'blue_tang'],
        targetCount: 1,
        rewardCoins: 160,
        startText: '你遠道而來辛苦啦～在我們島的沙灘旁，白天常有橘色的小丑魚和藍倒吊，能幫我釣 1 隻來看看嗎？',
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
    greeting: '落櫻紛飛，竹影搖曳。旅人，不妨在池畔靜心垂釣，或於夜色中欣賞流螢飛舞。',
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
        progressText: '試著在櫻花島池塘邊釣錦鯉，或在花樹下捕捉櫻花蝶、夜裡尋找發光流螢吧。',
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
    greeting: '呼呼～竟然有旅人航行到神秘遺跡島！這裡的古代水晶蘊含著星光，會吸引稀有的遠古生物呢！',
    quests: [
      {
        id: 'q_owl_1',
        title: '星光遺跡的珍稀標本',
        desc: '在神秘遺跡島捕獲任意 1 隻專屬稀有生物（水晶水母、月神蛾、彩虹吉丁蟲、皇帶魚或腔棘魚）。',
        type: 'catch_ids',
        targetIds: ['crystal_jelly', 'lunar_moth', 'jewel_beetle', 'oarfish', 'coelacanth'],
        targetCount: 1,
        rewardCoins: 360,
        startText: '呼呼！我正在研究遺跡島的生態！無論是夜裡的月神蛾、水晶水母、皇帶魚，晴天的彩虹吉丁蟲，或是雨天的傳說腔棘魚，找到任何一種都請給我看一眼！',
        progressText: '神秘遺跡島的珍稀生物常在夜晚或雨天現身，別忘了可以用左上角按鈕調整時段與天氣喔！',
        completeText: '呼——太驚人了！！這可是足以寫進群島百科的大發現！請收下這 360 金幣的研究獎金！'
      }
    ]
  }
];

export const NPC_MAP = Object.fromEntries(NPCS.map(n => [n.id, n]));
