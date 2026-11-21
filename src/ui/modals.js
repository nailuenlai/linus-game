import { ALL_CREATURES, CREATURE_MAP, FISH_LIST, BUG_LIST, formatRarity } from '../data/creatures.js';
import { SHOP_UPGRADES, SHOP_COSMETICS, COSMETIC_MAP } from '../data/shopItems.js';
import { ISLANDS, ISLAND_MAP } from '../data/islands.js';
import { NPCS } from '../data/npcs.js';

export class ModalManager {
  constructor({ store, audio, hud, timeWeather, onCosmeticChange, onUpgradeChange, onSummonBoat, onFastTravelHome }) {
    this.store = store;
    this.audio = audio;
    this.hud = hud;
    this.timeWeather = timeWeather;
    this.onCosmeticChange = onCosmeticChange;
    this.onUpgradeChange = onUpgradeChange;
    this.onSummonBoat = onSummonBoat;
    this.onFastTravelHome = onFastTravelHome;

    this.backdrop = document.getElementById('modal-backdrop');
    this.titleEl = document.getElementById('modal-title');
    this.bodyEl = document.getElementById('modal-body');
    this.closeBtn = document.getElementById('btn-close-modal');

    this.dialogueBox = document.getElementById('dialogue-box');
    this.dlgPortrait = document.getElementById('dialogue-portrait');
    this.dlgName = document.getElementById('dialogue-name');
    this.dlgRole = document.getElementById('dialogue-role');
    this.dlgText = document.getElementById('dialogue-text');
    this.dlgActions = document.getElementById('dialogue-actions');

    this.catchModal = document.getElementById('catch-modal');
    this.catchNew = document.getElementById('catch-new-badge');
    this.catchIcon = document.getElementById('catch-icon');
    this.catchRarity = document.getElementById('catch-rarity');
    this.catchName = document.getElementById('catch-name');
    this.catchMeta = document.getElementById('catch-meta');
    this.catchDesc = document.getElementById('catch-desc');
    this.btnCatchOk = document.getElementById('btn-catch-ok');

    this.activeModal = null;
    this.shopTab = 'sell';
    this.dexTab = 'fish';

    this.closeBtn.addEventListener('click', () => this.closeAll());
    this.backdrop.addEventListener('click', e => {
      if (e.target === this.backdrop) this.closeAll();
    });
    this.btnCatchOk.addEventListener('click', () => {
      this.audio.playClick();
      this.catchModal.classList.add('hidden');
    });
  }

  isOpen() {
    return (
      !this.backdrop.classList.contains('hidden') ||
      !this.dialogueBox.classList.contains('hidden') ||
      !this.catchModal.classList.contains('hidden')
    );
  }

  closeAll() {
    this.backdrop.classList.add('hidden');
    this.dialogueBox.classList.add('hidden');
    this.catchModal.classList.add('hidden');
    this.activeModal = null;
  }

  _openPanel(title, name) {
    this.closeAll();
    this.activeModal = name;
    this.titleEl.textContent = title;
    this.backdrop.classList.remove('hidden');
    this.audio.playClick();
  }

  // ==================== Catch Celebration ====================
  showCatchModal(creature, size, { isNew, isRecord }) {
    this.closeAll();
    this.catchNew.classList.toggle('hidden', !isNew && !isRecord);
    if (isNew) this.catchNew.textContent = '✨ 新登錄圖鑑！';
    else if (isRecord) this.catchNew.textContent = '🏆 刷新體長紀錄！';

    this.catchIcon.textContent = creature.icon;
    this.catchRarity.textContent = formatRarity(creature.rarity);
    this.catchName.textContent = creature.name;
    const val = this.store.getSellPrice(creature.id);
    this.catchMeta.textContent = `體長 ${size} cm ・ 售價 ${val} 🪙`;
    this.catchDesc.textContent = creature.desc;
    this.catchModal.classList.remove('hidden');
  }

  // ==================== NPC Dialogue ====================
  openNpcDialogue(npc) {
    this.closeAll();
    this.audio.playNpcChirp();
    this.dlgPortrait.textContent = npc.portrait;
    this.dlgName.textContent = npc.name;
    this.dlgRole.textContent = npc.role;

    const status = this.store.getNpcQuestStatus(npc);
    let speech = npc.greeting;
    const actions = [];

    if (status.state === 'ready') {
      speech = status.quest.completeText;
      actions.push({
        label: `🎁 領取獎勵 (+${status.quest.rewardCoins} 🪙)`,
        cls: 'btn-primary',
        onClick: () => {
          this.store.completeQuest(status.quest);
          this.audio.playCatch(true);
          this.hud.toast(`🎉 完成委託「${status.quest.title}」，獲得 ${status.quest.rewardCoins} 金幣！`);
          this.closeAll();
        }
      });
    } else if (status.state === 'available') {
      speech = status.quest.startText;
      actions.push({
        label: `⭐ 接受委託：${status.quest.title}`,
        cls: 'btn-primary',
        onClick: () => {
          this.store.acceptQuest(status.quest);
          this.audio.playCoin();
          this.hud.toast(`📜 已接取委託：${status.quest.title}`);
          this.closeAll();
        }
      });
    } else if (status.state === 'active') {
      const prog = this.store.getQuestProgress(status.quest);
      speech = `${status.quest.progressText}（目前進度：${prog}/${status.quest.targetCount}）`;
    }

    if (npc.opensShop) {
      actions.push({
        label: '🏪 打開雜貨商店',
        cls: 'btn-accent',
        onClick: () => this.openShop('sell')
      });
    }

    actions.push({
      label: '再見囉',
      cls: 'btn-secondary',
      onClick: () => {
        this.audio.playClick();
        this.closeAll();
      }
    });

    this.dlgText.textContent = speech;
    this.dlgActions.innerHTML = '';
    for (const act of actions) {
      const btn = document.createElement('button');
      btn.className = act.cls;
      btn.textContent = act.label;
      btn.addEventListener('click', act.onClick);
      this.dlgActions.appendChild(btn);
    }

    this.dialogueBox.classList.remove('hidden');
  }

  // ==================== Shop Modal ====================
  openShop(tab = this.shopTab) {
    this.shopTab = tab;
    this._openPanel('🏪 阿狸的微風雜貨店', 'shop');
    this._renderShop();
  }

  _renderShop() {
    const s = this.store.state;
    const tabs = [
      { id: 'sell', label: `💰 出售 (${s.bag.length})` },
      { id: 'upgrades', label: '🛠️ 工具與船隻' },
      { id: 'cosmetics', label: '👒 帽子與服裝' }
    ];

    let html = `<div class="tab-row">`;
    for (const t of tabs) {
      html += `<button class="tab-btn ${this.shopTab === t.id ? 'active' : ''}" data-shop-tab="${t.id}">${t.label}</button>`;
    }
    html += `</div>`;

    if (this.shopTab === 'sell') {
      const totalVal = s.bag.reduce((acc, b) => acc + this.store.getSellPrice(b.id), 0);
      html += `
        <div class="summary-bar">
          <span>🎒 背包戰利品：${s.bag.length} 件（總計 ${totalVal} 🪙）</span>
          ${s.bag.length > 0 ? `<button class="btn-accent" id="btn-sell-all">全部出售 +${totalVal} 🪙</button>` : ''}
        </div>
      `;
      if (!s.bag.length) {
        html += `<div class="empty-state">背包目前空空的～快去海邊釣魚或花叢裡抓蟲再來賣給阿狸吧！</div>`;
      } else {
        html += `<div class="list-stack">`;
        for (const item of s.bag) {
          const c = CREATURE_MAP[item.id];
          if (!c) continue;
          const price = this.store.getSellPrice(item.id);
          html += `
            <div class="list-row">
              <div class="list-row-left">
                <span class="card-emoji">${c.icon}</span>
                <div>
                  <div class="card-title">${c.name} <span style="color:#d48a1c;font-size:12px">${formatRarity(c.rarity)}</span></div>
                  <div class="card-sub">體長 ${item.size} cm</div>
                </div>
              </div>
              <button class="small-btn" data-sell-uid="${item.uid}">賣出 +${price} 🪙</button>
            </div>
          `;
        }
        html += `</div>`;
      }
    } else if (this.shopTab === 'upgrades') {
      html += `<div class="summary-bar"><span>🪙 目前金幣：${s.coins.toLocaleString()}</span><span>升級工具可提高捕獲率與航速！</span></div>`;
      html += `<div class="item-grid">`;
      for (const up of SHOP_UPGRADES) {
        const owned = s.ownedUpgrades.includes(up.id);
        const locked = up.requires && !s.ownedUpgrades.includes(up.requires);
        const canAfford = s.coins >= up.price;
        let btnHtml = '';
        if (owned) {
          btnHtml = `<button class="small-btn equipped" disabled>已擁有</button>`;
        } else if (locked) {
          btnHtml = `<button class="small-btn" disabled>需先買前階</button>`;
        } else {
          btnHtml = `<button class="small-btn" data-buy-upgrade="${up.id}" ${canAfford ? '' : 'disabled'}>購買</button>`;
        }
        html += `
          <div class="card-item ${locked ? 'locked' : ''}">
            <div class="card-item-top">
              <span class="card-emoji">${up.icon}</span>
              <div class="card-title">${up.name}</div>
            </div>
            <div class="card-sub">${up.desc}</div>
            <div class="card-footer">
              <span class="price-tag">${owned ? '✓ 已裝備' : `${up.price} 🪙`}</span>
              ${btnHtml}
            </div>
          </div>
        `;
      }
      html += `</div>`;
    } else if (this.shopTab === 'cosmetics') {
      html += `<div class="summary-bar"><span>🪙 目前金幣：${s.coins.toLocaleString()}</span><span>換裝會立刻顯示在 3D 角色身上！</span></div>`;
      html += `<div class="item-grid">`;
      for (const cos of SHOP_COSMETICS) {
        const owned = s.ownedCosmetics.includes(cos.id);
        const equipped = s.equippedHat === cos.id || s.equippedOutfit === cos.id;
        const canAfford = s.coins >= cos.price;
        let btnHtml = '';
        if (equipped) {
          btnHtml = `<button class="small-btn equipped" disabled>穿戴中</button>`;
        } else if (owned) {
          btnHtml = `<button class="small-btn equip" data-equip-cos="${cos.id}">換上</button>`;
        } else {
          btnHtml = `<button class="small-btn" data-buy-cos="${cos.id}" ${canAfford ? '' : 'disabled'}>購買</button>`;
        }
        html += `
          <div class="card-item">
            <div class="card-item-top">
              <span class="card-emoji">${cos.icon}</span>
              <div class="card-title">${cos.name}</div>
            </div>
            <div class="card-sub">${cos.desc}</div>
            <div class="card-footer">
              <span class="price-tag">${owned ? '已擁有' : `${cos.price} 🪙`}</span>
              ${btnHtml}
            </div>
          </div>
        `;
      }
      html += `</div>`;
    }

    this.bodyEl.innerHTML = html;

    // Bind events
    this.bodyEl.querySelectorAll('[data-shop-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio.playClick();
        this.shopTab = btn.dataset.shopTab;
        this._renderShop();
      });
    });

    const sellAllBtn = this.bodyEl.querySelector('#btn-sell-all');
    if (sellAllBtn) {
      sellAllBtn.addEventListener('click', () => {
        const res = this.store.sellAll();
        this.audio.playCoin();
        this.hud.toast(`💰 出售了 ${res.count} 件戰利品，獲得 ${res.total} 金幣！`);
        this._renderShop();
      });
    }

    this.bodyEl.querySelectorAll('[data-sell-uid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const earned = this.store.sellItem(btn.dataset.sellUid);
        this.audio.playCoin();
        this.hud.toast(`🪙 賣出獲得 ${earned} 金幣！`);
        this._renderShop();
      });
    });

    this.bodyEl.querySelectorAll('[data-buy-upgrade]').forEach(btn => {
      btn.addEventListener('click', () => {
        const up = SHOP_UPGRADES.find(u => u.id === btn.dataset.buyUpgrade);
        if (up && this.store.buyUpgrade(up)) {
          this.audio.playCatch(true);
          this.hud.toast(`✨ 升級成功！獲得「${up.name}」！`);
          this.onUpgradeChange();
          this._renderShop();
        }
      });
    });

    this.bodyEl.querySelectorAll('[data-buy-cos]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cos = COSMETIC_MAP[btn.dataset.buyCos];
        if (cos && this.store.buyCosmetic(cos)) {
          this.audio.playCoin();
          this.hud.toast(`👒 購買並換上了「${cos.name}」！`);
          this.onCosmeticChange();
          this._renderShop();
        }
      });
    });

    this.bodyEl.querySelectorAll('[data-equip-cos]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cos = COSMETIC_MAP[btn.dataset.equipCos];
        if (cos) {
          this.store.equipCosmetic(cos);
          this.audio.playClick();
          this.onCosmeticChange();
          this._renderShop();
        }
      });
    });
  }

  // ==================== Bag Modal ====================
  openBag() {
    this._openPanel('🎒 冒險背包', 'bag');
    const s = this.store.state;
    const totalVal = s.bag.reduce((acc, b) => acc + this.store.getSellPrice(b.id), 0);

    let html = `
      <div class="summary-bar">
        <span>裝備：釣竿 Lv.${s.upgrades.rodLevel}・捕蟲網 Lv.${s.upgrades.netLevel}・船隻 Lv.${s.upgrades.boatLevel}</span>
        <span>預估總價：${totalVal} 🪙</span>
      </div>
    `;
    if (!s.bag.length) {
      html += `<div class="empty-state">背包裡還沒有魚或昆蟲！<br/>裝備釣竿或捕蟲網去島上探險，捕獲後可以帶去微風雜貨店賣給阿狸店長！</div>`;
    } else {
      html += `<div class="list-stack">`;
      for (const item of s.bag) {
        const c = CREATURE_MAP[item.id];
        if (!c) continue;
        html += `
          <div class="list-row">
            <div class="list-row-left">
              <span class="card-emoji">${c.icon}</span>
              <div>
                <div class="card-title">${c.name} <span style="color:#d48a1c;font-size:12px">${formatRarity(c.rarity)}</span></div>
                <div class="card-sub">體長 ${item.size} cm ・ 雜貨店估價 ${this.store.getSellPrice(item.id)} 🪙</div>
              </div>
            </div>
          </div>
        `;
      }
      html += `</div>`;
    }
    this.bodyEl.innerHTML = html;
  }

  // ==================== Encyclopedia Modal ====================
  openDex(tab = this.dexTab) {
    this.dexTab = tab;
    this._openPanel('📖 微風群島生物圖鑑', 'dex');
    this._renderDex();
  }

  _renderDex() {
    const dex = this.store.state.dex;
    const totalCaught = Object.keys(dex).length;
    const list = this.dexTab === 'fish' ? FISH_LIST : BUG_LIST;
    const tabCaught = list.filter(c => dex[c.id]).length;

    let html = `
      <div class="summary-bar">
        <span>總收集進度：${totalCaught} / ${ALL_CREATURES.length} 種</span>
        <span>本分類：${tabCaught} / ${list.length}</span>
      </div>
      <div class="tab-row">
        <button class="tab-btn ${this.dexTab === 'fish' ? 'active' : ''}" data-dex-tab="fish">🐟 魚類 (${FISH_LIST.filter(c => dex[c.id]).length}/${FISH_LIST.length})</button>
        <button class="tab-btn ${this.dexTab === 'bug' ? 'active' : ''}" data-dex-tab="bug">🦋 昆蟲 (${BUG_LIST.filter(c => dex[c.id]).length}/${BUG_LIST.length})</button>
      </div>
      <div class="item-grid">
    `;

    const timeLabels = { any: '全天', day: '白天', night: '夜晚' };
    const weatherLabels = { any: '不限天氣', sunny: '晴天', rain: '雨天' };

    for (const c of list) {
      const rec = dex[c.id];
      const islNames = c.islands
        .map(id => (id === 'ocean' ? '外海' : ISLAND_MAP[id]?.name || id))
        .slice(0, 2)
        .join('、');

      if (rec) {
        html += `
          <div class="card-item">
            <div class="card-item-top">
              <span class="card-emoji">${c.icon}</span>
              <div>
                <div class="card-title">${c.name}</div>
                <div style="color:#d48a1c;font-size:11px">${formatRarity(c.rarity)}</div>
              </div>
            </div>
            <div class="card-sub">${c.desc}</div>
            <div class="card-footer">
              <span class="card-sub">最大 ${rec.maxSize} cm</span>
              <span class="price-tag">${c.price} 🪙</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="card-item locked">
            <div class="card-item-top">
              <span class="card-emoji silhouette">${c.icon}</span>
              <div>
                <div class="card-title">？？？</div>
                <div style="color:#a8967c;font-size:11px">${formatRarity(c.rarity)}</div>
              </div>
            </div>
            <div class="card-sub">📍 ${islNames}<br/>⏰ ${timeLabels[c.time]} ・ ${weatherLabels[c.weather]}</div>
          </div>
        `;
      }
    }
    html += `</div>`;
    this.bodyEl.innerHTML = html;

    this.bodyEl.querySelectorAll('[data-dex-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio.playClick();
        this.dexTab = btn.dataset.dexTab;
        this._renderDex();
      });
    });
  }

  // ==================== Quests Modal ====================
  openQuests() {
    this._openPanel('📜 島民委託任務', 'quests');
    const s = this.store.state;
    let html = `<div class="list-stack">`;

    for (const npc of NPCS) {
      const islName = ISLAND_MAP[npc.islandId]?.name || '';
      const status = this.store.getNpcQuestStatus(npc);

      if (status.state === 'none') {
        html += `
          <div class="list-row" style="opacity:0.75">
            <div class="list-row-left">
              <span class="card-emoji">${npc.portrait}</span>
              <div>
                <div class="card-title">${npc.name}（${islName}）</div>
                <div class="card-sub">✓ 已完成所有委託！非常感謝你的幫忙！</div>
              </div>
            </div>
          </div>
        `;
      } else {
        const q = status.quest;
        const prog = this.store.getQuestProgress(q);
        const badge =
          status.state === 'ready'
            ? `<span class="price-tag" style="color:#357d47">✓ 可回報！</span>`
            : status.state === 'active'
              ? `<span class="price-tag">進行中 ${prog}/${q.targetCount}</span>`
              : `<span class="card-sub">前往對話接取</span>`;
        html += `
          <div class="list-row">
            <div class="list-row-left">
              <span class="card-emoji">${npc.portrait}</span>
              <div>
                <div class="card-title">${q.title} <span style="font-weight:500;font-size:12px;color:#725d49">(${npc.name}・${islName})</span></div>
                <div class="card-sub">${q.desc}</div>
                <div class="card-sub" style="margin-top:3px">獎勵：<strong>${q.rewardCoins} 🪙</strong></div>
              </div>
            </div>
            <div style="flex-shrink:0;text-align:right">${badge}</div>
          </div>
        `;
      }
    }
    html += `</div>`;
    if (s.quests.completed.length > 0) {
      html += `<p style="text-align:center;font-size:12px;color:#725d49;margin-top:12px">累計已完成 ${s.quests.completed.length} 個島民委託</p>`;
    }
    this.bodyEl.innerHTML = html;
  }

  // ==================== Full Archipelago Map ====================
  openMap(playerX, playerZ, playerYaw, boatX, boatZ) {
    this._openPanel('🗺️ 微風群島航海圖', 'map');
    let html = `
      <div class="full-map-wrap">
        <canvas id="full-map-canvas" class="full-map-canvas" width="360" height="360"></canvas>
        <div class="map-legend">
          <span>🔺 你的位置</span>
          <span>🟡 小船位置</span>
          <span>🏡 主島</span>
          <span>🌴 東南椰林島</span>
          <span>🌸 西北櫻花島</span>
          <span>🏛️ 東北遺跡島</span>
        </div>
        <div class="map-actions">
          <button class="btn-accent" id="btn-summon-boat">⛵ 召喚小船到附近岸邊</button>
          <button class="btn-secondary" id="btn-tp-home">🏡 回到微風港灣碼頭</button>
        </div>
      </div>
    `;
    this.bodyEl.innerHTML = html;

    const canvas = this.bodyEl.querySelector('#full-map-canvas');
    this.hud.drawMapToCanvas(canvas, playerX, playerZ, playerYaw, boatX, boatZ, true);

    this.bodyEl.querySelector('#btn-summon-boat').addEventListener('click', () => {
      this.onSummonBoat();
      this.closeAll();
    });
    this.bodyEl.querySelector('#btn-tp-home').addEventListener('click', () => {
      this.onFastTravelHome();
      this.closeAll();
    });
  }

  // ==================== Time & Weather Modal ====================
  openTimeWeather() {
    this._openPanel('⛅ 時段與天氣調整', 'time');
    const isRain = this.timeWeather.isRain();
    this.bodyEl.innerHTML = `
      <div class="list-stack">
        <div class="setting-row" style="flex-direction:column;align-items:stretch">
          <div class="setting-title">🌅 切換時段（尋找白天或夜行稀有生物！）</div>
          <div class="time-grid">
            <button class="btn-secondary" data-set-hour="6.5">🌄 清晨 06:30</button>
            <button class="btn-secondary" data-set-hour="10.5">☀️ 上午 10:30</button>
            <button class="btn-secondary" data-set-hour="17.5">🌅 黃昏 17:30</button>
            <button class="btn-secondary" data-set-hour="21.5">🌙 星夜 21:30</button>
          </div>
        </div>
        <div class="setting-row" style="flex-direction:column;align-items:stretch">
          <div class="setting-title">🌦️ 切換天氣（雨天限定：腔棘魚、雨天蝸牛、雨滴鬥魚）</div>
          <div class="time-grid">
            <button class="${!isRain ? 'btn-primary' : 'btn-secondary'}" data-set-weather="sunny">☀️ 晴朗微風</button>
            <button class="${isRain ? 'btn-primary' : 'btn-secondary'}" data-set-weather="rain">🌧️ 療癒小雨</button>
          </div>
        </div>
      </div>
    `;

    this.bodyEl.querySelectorAll('[data-set-hour]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.timeWeather.setHour(parseFloat(btn.dataset.setHour));
        this.audio.playClick();
        this.hud.toast(`⏰ 時段已調整為 ${this.timeWeather.getFormattedTime()}`);
        this.closeAll();
      });
    });

    this.bodyEl.querySelectorAll('[data-set-weather]').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.setWeather;
        this.timeWeather.setWeather(w);
        this.audio.playClick();
        this.hud.toast(w === 'rain' ? '🌧️ 天空飄起了療癒小雨！' : '☀️ 雲層散開，恢復晴朗好天氣！');
        this.closeAll();
      });
    });
  }

  // ==================== Settings Modal ====================
  openSettings() {
    this._openPanel('⚙️ 遊戲設定與操作說明', 'settings');
    const muted = this.store.state.settings.muted;
    this.bodyEl.innerHTML = `
      <div class="list-stack">
        <div class="setting-row">
          <div>
            <div class="setting-title">🔊 遊戲音效</div>
            <div class="setting-desc">開關釣魚、水花、金幣與動物對話音效</div>
          </div>
          <button class="${muted ? 'btn-secondary' : 'btn-primary'}" id="btn-toggle-mute">${muted ? '已靜音' : '開啟中'}</button>
        </div>
        <div class="setting-row" style="flex-direction:column;align-items:flex-start">
          <div class="setting-title">🎮 操作指南</div>
          <div class="setting-desc" style="margin-top:4px;line-height:1.65">
            • <strong>移動／開船</strong>：左下角虛擬搖桿（電腦可用 WASD / 方向鍵）<br/>
            • <strong>旋轉視角</strong>：手指或滑鼠在畫面上左右滑動<br/>
            • <strong>釣魚</strong>：切換「🎣 釣竿」→ 面向水面按「拋竿」→ 看到紅色「！」按「收線」→ 按住讓魚保持在綠區內<br/>
            • <strong>抓蟲</strong>：切換「🥅 捕蟲網」→ 靠近蝴蝶或甲蟲按「揮網」<br/>
            • <strong>航海</strong>：走到碼頭小船旁按「⛵ 登船」，靠近外島沙灘按「🏝️ 上岸」
          </div>
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-title">🗑️ 重設遊戲存檔</div>
            <div class="setting-desc">清除本地進度並重新開始冒險</div>
          </div>
          <button class="btn-danger" id="btn-reset-save">重設進度</button>
        </div>
      </div>
    `;

    this.bodyEl.querySelector('#btn-toggle-mute').addEventListener('click', () => {
      const next = !this.store.state.settings.muted;
      this.store.state.settings.muted = next;
      this.store.save();
      this.audio.setMuted(next);
      this.openSettings();
    });

    this.bodyEl.querySelector('#btn-reset-save').addEventListener('click', () => {
      if (window.confirm('確定要清除所有金幣、圖鑑、裝備與任務進度重新開始嗎？')) {
        this.store.reset();
        this.onCosmeticChange();
        this.onUpgradeChange();
        this.onFastTravelHome();
        this.hud.toast('✨ 已重設存檔，展開全新的微風群島冒險！');
        this.closeAll();
      }
    });
  }
}
