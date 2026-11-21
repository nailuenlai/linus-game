import {
  ALL_CREATURES,
  CREATURE_MAP,
  FISH_LIST,
  BUG_LIST,
  REPTILE_LIST,
  isCreatureUnlocked,
  formatRarity
} from '../data/creatures.js';
import {
  SHOP_UPGRADES,
  SHOP_COSMETICS,
  SHOP_FURNITURE,
  HOUSE_TIERS,
  MUSEUM_MILESTONES,
  COSMETIC_MAP,
  FURNITURE_MAP
} from '../data/shopItems.js';
import { ISLANDS, ISLAND_MAP } from '../data/islands.js';
import { NPCS } from '../data/npcs.js';

export class ModalManager {
  constructor({
    store,
    audio,
    hud,
    timeWeather,
    onCosmeticChange,
    onUpgradeChange,
    onHouseChange,
    onEnterHouse,
    onStartPlaceFurniture,
    onMuseumChange,
    onSummonBoat,
    onFastTravelHome
  }) {
    this.store = store;
    this.audio = audio;
    this.hud = hud;
    this.timeWeather = timeWeather;
    this.onCosmeticChange = onCosmeticChange;
    this.onUpgradeChange = onUpgradeChange;
    this.onHouseChange = onHouseChange;
    this.onEnterHouse = onEnterHouse;
    this.onStartPlaceFurniture = onStartPlaceFurniture;
    this.onMuseumChange = onMuseumChange;
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
    this.decorTab = 'inv';
    this.museumTab = 'donate';

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
    if (isNew) this.catchNew.textContent = '✨ 新登錄圖鑑！可捐贈博物館！';
    else if (isRecord) this.catchNew.textContent = '🏆 刷新體長紀錄！';

    this.catchIcon.textContent = creature.icon;
    this.catchRarity.textContent = formatRarity(creature.rarity);
    this.catchName.textContent = creature.name;
    const val = this.store.getSellPrice(creature.id);
    const donateNote = !this.store.isDonated(creature.id) ? ' ・ 🏛️ 可捐贈' : '';
    this.catchMeta.textContent = `體長 ${size} cm ・ 售價 ${val} 🪙${donateNote}`;
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

    if (npc.opensMuseum) {
      const donatable = this.store.getDonatableBagItems().length;
      actions.push({
        label: donatable > 0 ? `🎁 捐贈生物 (${donatable} 種新發現)` : '🏛️ 查看博物館典藏',
        cls: 'btn-accent',
        onClick: () => this.openMuseumModal('donate')
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
      { id: 'furniture', label: '🪑 家具裝飾' },
      { id: 'upgrades', label: '🛠️ 工具與船隻' },
      { id: 'cosmetics', label: '👒 帽子服裝' }
    ];

    let html = `<div class="tab-row">`;
    for (const t of tabs) {
      html += `<button class="tab-btn ${this.shopTab === t.id ? 'active' : ''}" data-shop-tab="${t.id}">${t.label}</button>`;
    }
    html += `</div>`;

    if (this.shopTab === 'sell') {
      const totalVal = s.bag.reduce((acc, b) => acc + this.store.getSellPrice(b.id), 0);
      const undonatedCount = this.store.getDonatableBagItems().length;
      html += `
        <div class="summary-bar" style="flex-wrap:wrap;gap:8px">
          <span>🎒 背包戰利品：${s.bag.length} 件（總計 ${totalVal} 🪙）</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${undonatedCount > 0 && s.bag.length > undonatedCount ? `<button class="btn-secondary" style="padding:6px 12px;font-size:12.5px" id="btn-sell-safe">保留未捐贈並賣出其餘</button>` : ''}
            ${s.bag.length > 0 ? `<button class="btn-accent" style="padding:7px 14px;font-size:13px" id="btn-sell-all">全部出售 +${totalVal} 🪙</button>` : ''}
          </div>
        </div>
      `;
      if (!s.bag.length) {
        html += `<div class="empty-state">背包目前空空的～快去海邊釣魚、或潛行捕捉甲蟲與爬蟲再來吧！</div>`;
      } else {
        html += `<div class="list-stack">`;
        for (const item of s.bag) {
          const c = CREATURE_MAP[item.id];
          if (!c) continue;
          const price = this.store.getSellPrice(item.id);
          const donated = this.store.isDonated(item.id);
          const tag = donated
            ? `<span class="badge-tag donated">🏛️ 已捐贈</span>`
            : `<span class="badge-tag donate">🏛️ 未捐贈</span>`;
          html += `
            <div class="list-row">
              <div class="list-row-left">
                <span class="card-emoji">${c.icon}</span>
                <div>
                  <div class="card-title">${c.name} <span style="color:#d48a1c;font-size:12px">${formatRarity(c.rarity)}</span>${tag}</div>
                  <div class="card-sub">體長 ${item.size} cm</div>
                </div>
              </div>
              <button class="small-btn" data-sell-uid="${item.uid}">賣出 +${price} 🪙</button>
            </div>
          `;
        }
        html += `</div>`;
      }
    } else if (this.shopTab === 'furniture') {
      html += `
        <div class="summary-bar">
          <span>🪙 目前金幣：${s.coins.toLocaleString()}</span>
          <span>購買後可進入「🏡 我的小屋」自由擺放佈置！</span>
        </div>
        <div class="item-grid">
      `;
      for (const f of SHOP_FURNITURE) {
        const counts = this.store.getOwnedFurnitureCount(f.id);
        const canAfford = s.coins >= f.price;
        html += `
          <div class="card-item">
            <div class="card-item-top">
              <span class="card-emoji">${f.icon}</span>
              <div>
                <div class="card-title">${f.name}</div>
                <div class="card-sub" style="font-size:11px">${f.category}${counts.total > 0 ? ` ・ 已擁有 ${counts.total}` : ''}</div>
              </div>
            </div>
            <div class="card-sub">${f.desc}</div>
            <div class="card-footer">
              <span class="price-tag">${f.price} 🪙</span>
              <button class="small-btn" data-buy-furn="${f.id}" ${canAfford ? '' : 'disabled'}>購買</button>
            </div>
          </div>
        `;
      }
      html += `</div>`;
    } else if (this.shopTab === 'upgrades') {
      html += `<div class="summary-bar"><span>🪙 目前金幣：${s.coins.toLocaleString()}</span><span>升級工具可提高捕獲率、潛行隱匿與航速！</span></div>`;
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
        const res = this.store.sellAll(false);
        this.audio.playCoin();
        this.hud.toast(`💰 出售了 ${res.count} 件戰利品，獲得 ${res.total} 金幣！`);
        this._renderShop();
      });
    }

    const sellSafeBtn = this.bodyEl.querySelector('#btn-sell-safe');
    if (sellSafeBtn) {
      sellSafeBtn.addEventListener('click', () => {
        const res = this.store.sellAll(true);
        this.audio.playCoin();
        this.hud.toast(`💰 賣出 ${res.count} 件獲得 ${res.total} 金幣，並貼心保留了 ${res.kept} 件未捐贈生物！`);
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

    this.bodyEl.querySelectorAll('[data-buy-furn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const furn = FURNITURE_MAP[btn.dataset.buyFurn];
        if (furn && this.store.buyFurniture(furn)) {
          this.audio.playCoin();
          this.hud.toast(`🪑 買下「${furn.name}」！回到自己的小屋就能擺放囉！`);
          this._renderShop();
        }
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

  // ==================== House Build / Entry Modal ====================
  openHouseExteriorModal() {
    const level = this.store.state.house.level;
    this._openPanel(level === 0 ? '🔨 建造自己的海島小屋' : '🏡 我的海島小屋', 'house_ext');
    const coins = this.store.state.coins;
    const nextTier = HOUSE_TIERS.find(t => t.level === level + 1);

    let html = `<div class="list-stack">`;
    if (level === 0) {
      const t1 = HOUSE_TIERS[0];
      const canAfford = coins >= t1.price;
      html += `
        <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:10px">
          <div class="setting-title">🏡 蓋一間屬於你的「${t1.name}」！</div>
          <div class="setting-desc">${t1.desc}<br/>🎁 首次完工還會免費贈送<strong>「珊瑚編織地毯」</strong>與<strong>「貝殼立燈」</strong>各一件！</div>
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <span class="price-tag">建造費用：${t1.price} 🪙（現有 ${coins} 🪙）</span>
            <button class="btn-primary" id="btn-build-house" ${canAfford ? '' : 'disabled'}>🔨 立刻動工蓋屋！</button>
          </div>
        </div>
      `;
    } else {
      const curTier = HOUSE_TIERS.find(t => t.level === level) || HOUSE_TIERS[0];
      const placedCount = this.store.state.house.placedFurniture.length;
      html += `
        <div class="setting-row">
          <div>
            <div class="setting-title">🏡 ${curTier.name}（Lv.${level}）</div>
            <div class="setting-desc">屋內已擺放 ${placedCount} 件家具與裝飾，隨時都能進屋重新佈置！</div>
          </div>
          <button class="btn-primary" id="btn-enter-house">🚪 進入小屋</button>
        </div>
      `;
      if (nextTier) {
        const canAfford = coins >= nextTier.price;
        html += `
          <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:8px">
            <div class="setting-title">✨ 擴建升級：${nextTier.name}</div>
            <div class="setting-desc">${nextTier.desc}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
              <span class="price-tag">擴建費用：${nextTier.price} 🪙（現有 ${coins} 🪙）</span>
              <button class="btn-accent" id="btn-upgrade-house" ${canAfford ? '' : 'disabled'}>🔨 擴建小屋</button>
            </div>
          </div>
        `;
      }
    }
    html += `</div>`;
    this.bodyEl.innerHTML = html;

    const buildBtn = this.bodyEl.querySelector('#btn-build-house');
    if (buildBtn) {
      buildBtn.addEventListener('click', () => {
        if (this.store.buildOrUpgradeHouse(HOUSE_TIERS[0])) {
          this.audio.playCatch(true);
          this.onHouseChange();
          this.hud.toast('🎉 恭喜！你的溫馨原木小屋落成了！還收到免費地毯與立燈！', 3400);
          this.closeAll();
          this.onEnterHouse();
        }
      });
    }

    const enterBtn = this.bodyEl.querySelector('#btn-enter-house');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        this.audio.playClick();
        this.closeAll();
        this.onEnterHouse();
      });
    }

    const upgBtn = this.bodyEl.querySelector('#btn-upgrade-house');
    if (upgBtn && nextTier) {
      upgBtn.addEventListener('click', () => {
        if (this.store.buildOrUpgradeHouse(nextTier)) {
          this.audio.playCatch(true);
          this.onHouseChange();
          this.hud.toast(`🎉 小屋擴建完成！升級為「${nextTier.name}」！`, 3200);
          this.openHouseExteriorModal();
        }
      });
    }
  }

  // ==================== House Interior Decorate Modal ====================
  openDecorateModal(tab = this.decorTab) {
    this.decorTab = tab;
    this._openPanel('🛋️ 小屋家具與室內佈置', 'decorate');
    this._renderDecorate();
  }

  _renderDecorate() {
    const s = this.store.state;
    const invEntries = Object.entries(s.furnitureInventory).filter(([, c]) => c > 0);
    const placed = s.house.placedFurniture;

    let html = `
      <div class="tab-row">
        <button class="tab-btn ${this.decorTab === 'inv' ? 'active' : ''}" data-decor-tab="inv">📦 家具倉庫 (${invEntries.reduce((a, [, c]) => a + c, 0)})</button>
        <button class="tab-btn ${this.decorTab === 'placed' ? 'active' : ''}" data-decor-tab="placed">🏠 已擺放家具 (${placed.length})</button>
      </div>
    `;

    if (this.decorTab === 'inv') {
      if (!invEntries.length) {
        html += `<div class="empty-state">家具倉庫空空的喔！<br/>可以到微風港灣找「🦝 阿狸店長」的雜貨店購買各種家具、盆栽、魚缸與壁爐！</div>`;
      } else {
        html += `<div class="item-grid">`;
        for (const [id, count] of invEntries) {
          const f = FURNITURE_MAP[id];
          if (!f) continue;
          html += `
            <div class="card-item">
              <div class="card-item-top">
                <span class="card-emoji">${f.icon}</span>
                <div>
                  <div class="card-title">${f.name}</div>
                  <div class="card-sub">剩餘數量：${count}</div>
                </div>
              </div>
              <div class="card-sub">${f.desc}</div>
              <div class="card-footer">
                <span class="card-sub">${f.category}</span>
                <button class="small-btn equip" data-place-furn="${id}">🪑 擺放</button>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }
    } else {
      if (!placed.length) {
        html += `<div class="empty-state">屋裡還沒擺放家具呢！切回「📦 家具倉庫」挑選家具佈置吧！</div>`;
      } else {
        html += `<div class="list-stack">`;
        for (const item of placed) {
          const f = FURNITURE_MAP[item.id];
          if (!f) continue;
          html += `
            <div class="list-row">
              <div class="list-row-left">
                <span class="card-emoji">${f.icon}</span>
                <div>
                  <div class="card-title">${f.name}</div>
                  <div class="card-sub">位置 (${item.x.toFixed(1)}, ${item.z.toFixed(1)})</div>
                </div>
              </div>
              <div style="display:flex;gap:6px">
                <button class="small-btn equip" data-rot-uid="${item.uid}">🔄 轉向</button>
                <button class="small-btn" data-pickup-uid="${item.uid}">📦 收回</button>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }
    }

    this.bodyEl.innerHTML = html;

    this.bodyEl.querySelectorAll('[data-decor-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio.playClick();
        this.decorTab = btn.dataset.decorTab;
        this._renderDecorate();
      });
    });

    this.bodyEl.querySelectorAll('[data-place-furn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.placeFurn;
        this.audio.playClick();
        this.closeAll();
        this.onStartPlaceFurniture(id);
      });
    });

    this.bodyEl.querySelectorAll('[data-rot-uid]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.rotatePlacedFurniture(btn.dataset.rotUid);
        this.audio.playClick();
        this.onHouseChange();
        this._renderDecorate();
      });
    });

    this.bodyEl.querySelectorAll('[data-pickup-uid]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.pickupFurniture(btn.dataset.pickupUid);
        this.audio.playClick();
        this.onHouseChange();
        this.hud.toast('📦 已將家具收回倉庫！');
        this._renderDecorate();
      });
    });
  }

  // ==================== Museum Donation & Collection Modal ====================
  openMuseumModal(tab = this.museumTab) {
    this.museumTab = tab;
    this._openPanel('🏛️ 微風群島自然博物館', 'museum');
    this._renderMuseum();
  }

  _renderMuseum() {
    const s = this.store.state;
    const fishDonated = FISH_LIST.filter(c => s.museum[c.id]).length;
    const bugDonated = BUG_LIST.filter(c => s.museum[c.id]).length;
    const repDonated = REPTILE_LIST.filter(c => s.museum[c.id]).length;
    const totalDonated = fishDonated + bugDonated + repDonated;
    const donatable = this.store.getDonatableBagItems();

    let html = `
      <div class="museum-wing-grid">
        <div class="museum-wing-card">
          <div class="wing-num">🐟 ${fishDonated}/${FISH_LIST.length}</div>
          <div class="wing-lbl">水族生態廳</div>
        </div>
        <div class="museum-wing-card">
          <div class="wing-num">🪲 ${bugDonated}/${BUG_LIST.length}</div>
          <div class="wing-lbl">昆蟲甲蟲廳</div>
        </div>
        <div class="museum-wing-card">
          <div class="wing-num">🦎 ${repDonated}/${REPTILE_LIST.length}</div>
          <div class="wing-lbl">爬蟲溫室廳</div>
        </div>
      </div>
      <div class="tab-row">
        <button class="tab-btn ${this.museumTab === 'donate' ? 'active' : ''}" data-mus-tab="donate">🎁 捐贈生物 (${donatable.length})</button>
        <button class="tab-btn ${this.museumTab === 'milestones' ? 'active' : ''}" data-mus-tab="milestones">🏆 里程碑 (${totalDonated}/${ALL_CREATURES.length})</button>
      </div>
    `;

    if (this.museumTab === 'donate') {
      if (!donatable.length) {
        html += `<div class="empty-state">背包裡目前沒有尚未捐贈的新物種！<br/>去各座島嶼釣新魚、抓大兜蟲或爬蟲，再帶回來捐給館長博博展示吧！</div>`;
      } else {
        html += `
          <div class="summary-bar">
            <span>✨ 發現 ${donatable.length} 種可捐贈的新物種！</span>
            <button class="btn-primary" style="padding:7px 14px;font-size:13px" id="btn-donate-all">✨ 全部捐贈！</button>
          </div>
          <div class="list-stack">
        `;
        for (const item of donatable) {
          const c = CREATURE_MAP[item.id];
          if (!c) continue;
          const bonus = Math.max(15, Math.round(c.price * 0.25));
          html += `
            <div class="list-row">
              <div class="list-row-left">
                <span class="card-emoji">${c.icon}</span>
                <div>
                  <div class="card-title">${c.name} <span style="color:#d48a1c;font-size:12px">${formatRarity(c.rarity)}</span></div>
                  <div class="card-sub">體長 ${item.size} cm ・ 研究津貼 +${bonus} 🪙</div>
                </div>
              </div>
              <button class="small-btn equip" data-donate-uid="${item.uid}">🎁 捐贈</button>
            </div>
          `;
        }
        html += `</div>`;
      }
    } else {
      html += `<div class="list-stack">`;
      for (const ms of MUSEUM_MILESTONES) {
        const done = s.museumMilestones.includes(ms.count);
        const furnName = ms.bonusFurniture ? FURNITURE_MAP[ms.bonusFurniture]?.name : null;
        html += `
          <div class="list-row" style="${done ? 'border-color:#58b870' : ''}">
            <div class="list-row-left">
              <span class="card-emoji">${done ? '🏆' : '🏛️'}</span>
              <div>
                <div class="card-title">捐贈累計 ${ms.count} 種 —「${ms.title}」</div>
                <div class="card-sub">獎勵：${ms.coins} 🪙${furnName ? ` + 贈送家具「${furnName}」` : ''}</div>
              </div>
            </div>
            <span class="price-tag" style="color:${done ? '#357d47' : '#8a643d'}">${done ? '✓ 已達成' : `${totalDonated}/${ms.count}`}</span>
          </div>
        `;
      }
      html += `</div>`;
    }

    this.bodyEl.innerHTML = html;

    this.bodyEl.querySelectorAll('[data-mus-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio.playClick();
        this.museumTab = btn.dataset.musTab;
        this._renderMuseum();
      });
    });

    const donateAllBtn = this.bodyEl.querySelector('#btn-donate-all');
    if (donateAllBtn) {
      donateAllBtn.addEventListener('click', () => {
        const res = this.store.donateAllNewFromBag();
        if (res.count > 0) {
          this.audio.playCatch(true);
          this.onMuseumChange();
          this.hud.toast(`🏛️ 成功捐贈 ${res.count} 種生物！獲得研究津貼 +${res.bonusCoins} 🪙！`, 3200);
          for (const ms of res.newMilestones) {
            const fn = ms.bonusFurniture ? FURNITURE_MAP[ms.bonusFurniture]?.name : '';
            this.hud.toast(`🏆 達成博物館里程碑「${ms.title}」！獲得 ${ms.coins} 🪙${fn ? ` 與「${fn}」` : ''}！`, 4200);
          }
          this._renderMuseum();
        }
      });
    }

    this.bodyEl.querySelectorAll('[data-donate-uid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = this.store.donateBagItem(btn.dataset.donateUid);
        if (res) {
          this.audio.playCatch(res.creature.rarity >= 4);
          this.onMuseumChange();
          this.hud.toast(`🏛️ 已將「${res.creature.name}」捐贈給博物館展示！獲得 +${res.bonusCoins} 🪙！`, 2800);
          for (const ms of res.newMilestones) {
            const fn = ms.bonusFurniture ? FURNITURE_MAP[ms.bonusFurniture]?.name : '';
            this.hud.toast(`🏆 達成博物館里程碑「${ms.title}」！獲得 ${ms.coins} 🪙${fn ? ` 與「${fn}」` : ''}！`, 4200);
          }
          this._renderMuseum();
        }
      });
    });
  }

  // ==================== Bag Modal ====================
  openBag() {
    this._openPanel('🎒 冒險背包', 'bag');
    const s = this.store.state;
    const totalVal = s.bag.reduce((acc, b) => acc + this.store.getSellPrice(b.id), 0);
    const furnTotal = Object.values(s.furnitureInventory).reduce((a, b) => a + b, 0);

    let html = `
      <div class="summary-bar" style="flex-wrap:wrap;gap:6px">
        <span>釣竿 Lv.${s.upgrades.rodLevel}・捕網 Lv.${s.upgrades.netLevel}・船 Lv.${s.upgrades.boatLevel}・家具庫存 ${furnTotal} 件</span>
        <span>戰利品估價：${totalVal} 🪙</span>
      </div>
    `;
    if (!s.bag.length) {
      html += `<div class="empty-state">背包裡還沒有魚、昆蟲或爬蟲！<br/>捕獲後可以賣給阿狸店長，或帶去北側的「🏛️ 微風博物館」捐贈展示！</div>`;
    } else {
      html += `<div class="list-stack">`;
      for (const item of s.bag) {
        const c = CREATURE_MAP[item.id];
        if (!c) continue;
        const donated = this.store.isDonated(item.id);
        const tag = donated
          ? `<span class="badge-tag donated">🏛️ 已捐贈</span>`
          : `<span class="badge-tag donate">🏛️ 可捐博物館</span>`;
        html += `
          <div class="list-row">
            <div class="list-row-left">
              <span class="card-emoji">${c.icon}</span>
              <div>
                <div class="card-title">${c.name} <span style="color:#d48a1c;font-size:12px">${formatRarity(c.rarity)}</span>${tag}</div>
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
    const museum = this.store.state.museum;
    const catchCounts = this.store.getCatchCounts();
    const totalCaught = Object.keys(dex).length;
    const totalDonated = Object.keys(museum).length;

    const list =
      this.dexTab === 'fish' ? FISH_LIST : this.dexTab === 'bug' ? BUG_LIST : REPTILE_LIST;
    const tabCaught = list.filter(c => dex[c.id]).length;

    let html = `
      <div class="summary-bar" style="flex-wrap:wrap;gap:6px">
        <span>📖 圖鑑：${totalCaught}/${ALL_CREATURES.length} ・ 🏛️ 館藏：${totalDonated}/${ALL_CREATURES.length}</span>
        <span>累計捕蟲 ${catchCounts.bug} 隻・捕爬蟲 ${catchCounts.reptile} 隻</span>
      </div>
      <div class="tab-row">
        <button class="tab-btn ${this.dexTab === 'fish' ? 'active' : ''}" data-dex-tab="fish">🐟 魚類 (${FISH_LIST.filter(c => dex[c.id]).length}/${FISH_LIST.length})</button>
        <button class="tab-btn ${this.dexTab === 'bug' ? 'active' : ''}" data-dex-tab="bug">🪲 昆蟲甲蟲 (${BUG_LIST.filter(c => dex[c.id]).length}/${BUG_LIST.length})</button>
        <button class="tab-btn ${this.dexTab === 'reptile' ? 'active' : ''}" data-dex-tab="reptile">🦎 爬蟲類 (${REPTILE_LIST.filter(c => dex[c.id]).length}/${REPTILE_LIST.length})</button>
      </div>
      <div class="item-grid">
    `;

    const timeLabels = { any: '全天', day: '白天', night: '夜晚' };
    const weatherLabels = { any: '不限天氣', sunny: '晴天', rain: '雨天' };

    for (const c of list) {
      const rec = dex[c.id];
      const donated = Boolean(museum[c.id]);
      const islNames = c.islands
        .map(id => (id === 'ocean' ? '外海' : ISLAND_MAP[id]?.name || id))
        .slice(0, 2)
        .join('、');

      if (rec) {
        const musBadge = donated
          ? `<span class="badge-tag donated">🏛️ 已捐</span>`
          : `<span class="badge-tag donate">未捐</span>`;
        html += `
          <div class="card-item">
            <div class="card-item-top">
              <span class="card-emoji">${c.icon}</span>
              <div>
                <div class="card-title">${c.name}${musBadge}</div>
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
        const unlocked = isCreatureUnlocked(c, catchCounts);
        const curNum = c.type === 'bug' ? catchCounts.bug : catchCounts.reptile;
        const typeText = c.type === 'bug' ? '昆蟲' : '爬蟲';
        const lockNote =
          !unlocked && c.requiredCatches > 0
            ? `<br/><span style="color:#b85a2a;font-weight:800">🔒 需累計捕捉 ${c.requiredCatches} 隻${typeText}解鎖 (${curNum}/${c.requiredCatches})</span>`
            : '';
        html += `
          <div class="card-item locked">
            <div class="card-item-top">
              <span class="card-emoji silhouette">${c.icon}</span>
              <div>
                <div class="card-title">${unlocked ? '？？？' : '🔒 未解鎖稀有種'}</div>
                <div style="color:#a8967c;font-size:11px">${formatRarity(c.rarity)}</div>
              </div>
            </div>
            <div class="card-sub">📍 ${islNames}<br/>⏰ ${timeLabels[c.time]} ・ ${weatherLabels[c.weather]}${lockNote}</div>
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
      const islName = npc.indoor === 'museum' ? '微風博物館內' : ISLAND_MAP[npc.islandId]?.name || '';
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
    this._openPanel('🗺️ 微風群島航海圖（7 座島嶼）', 'map');
    let html = `
      <div class="full-map-wrap">
        <canvas id="full-map-canvas" class="full-map-canvas" width="380" height="380"></canvas>
        <div class="map-legend">
          <span>🔺 你的位置</span>
          <span>🟡 小船位置</span>
          <span>🏡 主島</span>
          <span>🌴 椰林島</span>
          <span>🌸 櫻花島</span>
          <span>🏛️ 遺跡島</span>
          <span>🌿 翡翠雨林島</span>
          <span>🌋 赤岩溫泉島</span>
          <span>❄️ 極光冰晶島</span>
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
          <div class="setting-title">🌅 切換時段（赫克力士大兜蟲、南洋大兜蟲、豹紋守宮皆為夜晚出沒！）</div>
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
          <div class="setting-title">🎮 操作與技巧指南</div>
          <div class="setting-desc" style="margin-top:4px;line-height:1.68">
            • <strong>移動／開船</strong>：左下角虛擬搖桿（電腦用 WASD / 方向鍵，滑鼠拖曳轉視角）<br/>
            • <strong>技術捕蟲＆抓爬蟲</strong>：切換「🥅 捕蟲網」→ 按「🤫 潛行 (Shift / C)」悄悄靠近才不會嚇跑稀有甲蟲 → 讓地上瞄準圈變綠後按揮網 → 在<strong>精準時機條</strong>指針滑進綠區時迅速點擊捕捉！<br/>
            • <strong>稀有物種解鎖</strong>：多抓一般昆蟲／爬蟲即可解鎖赫克力士大兜蟲、南洋大兜蟲等稀有物種（可於圖鑑查看進度）<br/>
            • <strong>自建小屋＆家具</strong>：到微風港灣西側空地蓋屋，到阿狸雜貨店買家具，進屋按「🛋️ 裝潢」即可自由擺放！<br/>
            • <strong>生態博物館</strong>：到微風港灣北側的博物館，找館長博博捐贈所有魚、昆蟲與爬蟲，即時展示於 3D 展廳！
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
      if (window.confirm('確定要清除所有金幣、圖鑑、小屋家具、博物館捐贈與任務進度重新開始嗎？')) {
        this.store.reset();
        this.onCosmeticChange();
        this.onUpgradeChange();
        this.onHouseChange();
        this.onMuseumChange();
        this.onFastTravelHome();
        this.hud.toast('✨ 已重設存檔，展開全新的微風群島冒險！');
        this.closeAll();
      }
    });
  }
}
