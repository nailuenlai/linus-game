import { CREATURE_MAP } from '../data/creatures.js';
import { NPCS } from '../data/npcs.js';

const SAVE_KEY = 'breeze_archipelago_save_v1';

export function createDefaultState() {
  return {
    coins: 80,
    bag: [], // { uid, id, size, caughtAt }
    dex: {}, // { [creatureId]: { count, maxSize } }
    upgrades: {
      rodLevel: 1,
      netLevel: 1,
      boatLevel: 1,
      luckyCharm: 0
    },
    ownedUpgrades: [],
    ownedCosmetics: ['hat_none', 'outfit_coral'],
    equippedHat: 'hat_none',
    equippedOutfit: 'outfit_coral',
    discoveredIslands: ['main'],
    quests: {
      active: {}, // { [questId]: { progress: 0 } }
      completed: [] // questId[]
    },
    settings: {
      muted: false,
      timeSpeed: 1
    }
  };
}

export class GameStore {
  constructor() {
    this.state = this.load();
    this.listeners = new Set();
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      const def = createDefaultState();
      return {
        ...def,
        ...parsed,
        upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
        quests: {
          active: { ...(parsed.quests?.active || {}) },
          completed: [...(parsed.quests?.completed || [])]
        },
        settings: { ...def.settings, ...(parsed.settings || {}) }
      };
    } catch {
      return createDefaultState();
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore private browsing quota errors
    }
  }

  reset() {
    this.state = createDefaultState();
    this.save();
    this.emit();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of this.listeners) fn(this.state);
  }

  addCoins(amount) {
    this.state.coins = Math.max(0, Math.round(this.state.coins + amount));
    this.save();
    this.emit();
  }

  spendCoins(amount) {
    if (this.state.coins < amount) return false;
    this.state.coins -= amount;
    this.save();
    this.emit();
    return true;
  }

  getSellPrice(creatureId) {
    const c = CREATURE_MAP[creatureId];
    if (!c) return 0;
    const mult = this.state.upgrades.luckyCharm ? 1.25 : 1;
    return Math.round(c.price * mult);
  }

  recordCatch(creature, size) {
    const isNew = !this.state.dex[creature.id];
    const prev = this.state.dex[creature.id] || { count: 0, maxSize: 0 };
    this.state.dex[creature.id] = {
      count: prev.count + 1,
      maxSize: Math.max(prev.maxSize, size)
    };

    this.state.bag.push({
      uid: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      id: creature.id,
      size
    });

    // Update active quest progress
    this._advanceQuestsOnCatch(creature);

    this.save();
    this.emit();
    return { isNew, isRecord: !isNew && size > prev.maxSize };
  }

  _advanceQuestsOnCatch(creature) {
    const dexTotal = Object.keys(this.state.dex).length;
    for (const npc of NPCS) {
      for (const q of npc.quests) {
        const entry = this.state.quests.active[q.id];
        if (!entry) continue;
        if (q.type === 'catch_any') {
          entry.progress = Math.min(q.targetCount, entry.progress + 1);
        } else if (q.type === 'catch_type' && creature.type === q.targetType) {
          entry.progress = Math.min(q.targetCount, entry.progress + 1);
        } else if (
          q.type === 'catch_rarity' &&
          creature.type === q.targetType &&
          creature.rarity >= q.minRarity
        ) {
          entry.progress = Math.min(q.targetCount, entry.progress + 1);
        } else if (q.type === 'catch_ids' && q.targetIds.includes(creature.id)) {
          entry.progress = Math.min(q.targetCount, entry.progress + 1);
        } else if (
          q.type === 'catch_special_bug' &&
          creature.type === 'bug' &&
          (creature.time === 'night' || creature.weather === 'rain')
        ) {
          entry.progress = Math.min(q.targetCount, entry.progress + 1);
        } else if (q.type === 'dex_count') {
          entry.progress = Math.min(q.targetCount, dexTotal);
        }
      }
    }
  }

  getQuestProgress(quest) {
    if (quest.type === 'dex_count') {
      return Math.min(quest.targetCount, Object.keys(this.state.dex).length);
    }
    return this.state.quests.active[quest.id]?.progress || 0;
  }

  isQuestReady(quest) {
    if (!this.state.quests.active[quest.id]) return false;
    return this.getQuestProgress(quest) >= quest.targetCount;
  }

  acceptQuest(quest) {
    if (this.state.quests.completed.includes(quest.id)) return;
    if (this.state.quests.active[quest.id]) return;
    const initial = quest.type === 'dex_count' ? Math.min(quest.targetCount, Object.keys(this.state.dex).length) : 0;
    this.state.quests.active[quest.id] = { progress: initial };
    this.save();
    this.emit();
  }

  completeQuest(quest) {
    if (!this.isQuestReady(quest)) return false;
    delete this.state.quests.active[quest.id];
    if (!this.state.quests.completed.includes(quest.id)) {
      this.state.quests.completed.push(quest.id);
    }
    this.state.coins += quest.rewardCoins;
    this.save();
    this.emit();
    return true;
  }

  getNpcCurrentQuest(npc) {
    for (const q of npc.quests) {
      if (!this.state.quests.completed.includes(q.id)) {
        return q;
      }
    }
    return null;
  }

  getNpcQuestStatus(npc) {
    const q = this.getNpcCurrentQuest(npc);
    if (!q) return { state: 'none', quest: null };
    if (this.state.quests.active[q.id]) {
      if (this.isQuestReady(q)) return { state: 'ready', quest: q };
      return { state: 'active', quest: q };
    }
    return { state: 'available', quest: q };
  }

  sellItem(uid) {
    const idx = this.state.bag.findIndex(b => b.uid === uid);
    if (idx === -1) return 0;
    const item = this.state.bag[idx];
    const earned = this.getSellPrice(item.id);
    this.state.bag.splice(idx, 1);
    this.state.coins += earned;
    this.save();
    this.emit();
    return earned;
  }

  sellAll() {
    if (!this.state.bag.length) return { count: 0, total: 0 };
    let total = 0;
    const count = this.state.bag.length;
    for (const item of this.state.bag) {
      total += this.getSellPrice(item.id);
    }
    this.state.bag = [];
    this.state.coins += total;
    this.save();
    this.emit();
    return { count, total };
  }

  buyUpgrade(item) {
    if (this.state.ownedUpgrades.includes(item.id)) return false;
    if (item.requires && !this.state.ownedUpgrades.includes(item.requires)) return false;
    if (!this.spendCoins(item.price)) return false;
    this.state.ownedUpgrades.push(item.id);
    this.state.upgrades[item.target] = item.level;
    this.save();
    this.emit();
    return true;
  }

  buyCosmetic(item) {
    if (this.state.ownedCosmetics.includes(item.id)) return true;
    if (!this.spendCoins(item.price)) return false;
    this.state.ownedCosmetics.push(item.id);
    this.equipCosmetic(item);
    return true;
  }

  equipCosmetic(item) {
    if (!this.state.ownedCosmetics.includes(item.id)) return;
    if (item.slot === 'hat') this.state.equippedHat = item.id;
    if (item.slot === 'outfit') this.state.equippedOutfit = item.id;
    this.save();
    this.emit();
  }

  discoverIsland(islandId) {
    if (!this.state.discoveredIslands.includes(islandId)) {
      this.state.discoveredIslands.push(islandId);
      this.save();
      this.emit();
      return true;
    }
    return false;
  }
}
