import { CREATURE_MAP, LAND_CREATURES } from '../data/creatures.js';
import { NPCS } from '../data/npcs.js';
import { MUSEUM_MILESTONES } from '../data/shopItems.js';

const SAVE_KEY = 'breeze_archipelago_save_v1';

export function createDefaultState() {
  return {
    coins: 90,
    bag: [], // { uid, id, size }
    dex: {}, // { [creatureId]: { count, maxSize } }
    stats: {
      totalFishCaught: 0,
      totalBugsCaught: 0,
      totalReptilesCaught: 0
    },
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
    house: {
      level: 0, // 0 = plot, 1 = cozy cabin, 2 = spacious sea-view villa
      placedFurniture: [] // { uid, id, x, z, rot }
    },
    furnitureInventory: {}, // { [furnitureId]: count }
    museum: {}, // { [creatureId]: { size, donatedAt } }
    museumMilestones: [], // claimed milestone counts
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
      const merged = {
        ...def,
        ...parsed,
        stats: { ...def.stats, ...(parsed.stats || {}) },
        upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
        house: {
          level: parsed.house?.level || 0,
          placedFurniture: Array.isArray(parsed.house?.placedFurniture) ? parsed.house.placedFurniture : []
        },
        furnitureInventory: { ...(parsed.furnitureInventory || {}) },
        museum: { ...(parsed.museum || {}) },
        museumMilestones: Array.isArray(parsed.museumMilestones) ? parsed.museumMilestones : [],
        quests: {
          active: { ...(parsed.quests?.active || {}) },
          completed: [...(parsed.quests?.completed || [])]
        },
        settings: { ...def.settings, ...(parsed.settings || {}) }
      };

      // Backfill catch stats from dex if migrating from earlier save
      if (!parsed.stats) {
        for (const [id, rec] of Object.entries(merged.dex || {})) {
          const c = CREATURE_MAP[id];
          if (!c) continue;
          const cnt = rec?.count || 0;
          if (c.type === 'fish') merged.stats.totalFishCaught += cnt;
          else if (c.type === 'bug') merged.stats.totalBugsCaught += cnt;
          else if (c.type === 'reptile') merged.stats.totalReptilesCaught += cnt;
        }
      }

      return merged;
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

  getCatchCounts() {
    return {
      fish: this.state.stats.totalFishCaught || 0,
      bug: this.state.stats.totalBugsCaught || 0,
      reptile: this.state.stats.totalReptilesCaught || 0
    };
  }

  recordCatch(creature, size) {
    const isNew = !this.state.dex[creature.id];
    const prev = this.state.dex[creature.id] || { count: 0, maxSize: 0 };
    this.state.dex[creature.id] = {
      count: prev.count + 1,
      maxSize: Math.max(prev.maxSize, size)
    };

    let prevCatTotal = 0;
    let newCatTotal = 0;
    if (creature.type === 'fish') {
      prevCatTotal = this.state.stats.totalFishCaught || 0;
      newCatTotal = prevCatTotal + 1;
      this.state.stats.totalFishCaught = newCatTotal;
    } else if (creature.type === 'bug') {
      prevCatTotal = this.state.stats.totalBugsCaught || 0;
      newCatTotal = prevCatTotal + 1;
      this.state.stats.totalBugsCaught = newCatTotal;
    } else if (creature.type === 'reptile') {
      prevCatTotal = this.state.stats.totalReptilesCaught || 0;
      newCatTotal = prevCatTotal + 1;
      this.state.stats.totalReptilesCaught = newCatTotal;
    }

    // Check which rare land creatures just unlocked!
    const newlyUnlocked = LAND_CREATURES.filter(
      c => c.type === creature.type && c.requiredCatches > prevCatTotal && c.requiredCatches <= newCatTotal
    );

    this.state.bag.push({
      uid: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      id: creature.id,
      size
    });

    this._advanceQuestsOnCatch(creature);

    this.save();
    this.emit();
    return { isNew, isRecord: !isNew && size > prev.maxSize, newlyUnlocked };
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
    if (quest.type === 'museum_count') {
      return Math.min(quest.targetCount, Object.keys(this.state.museum).length);
    }
    if (quest.type === 'placed_furniture') {
      return Math.min(quest.targetCount, this.state.house.placedFurniture.length);
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
    const initial =
      quest.type === 'dex_count' || quest.type === 'museum_count' || quest.type === 'placed_furniture'
        ? this.getQuestProgress(quest)
        : 0;
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

  // ==================== Selling ====================
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

  sellAll(keepUndonated = false) {
    if (!this.state.bag.length) return { count: 0, total: 0, kept: 0 };
    let total = 0;
    let count = 0;
    const keptItems = [];
    const reservedSpecies = new Set();

    for (const item of this.state.bag) {
      if (keepUndonated && !this.state.museum[item.id] && !reservedSpecies.has(item.id)) {
        reservedSpecies.add(item.id);
        keptItems.push(item);
      } else {
        total += this.getSellPrice(item.id);
        count++;
      }
    }
    this.state.bag = keptItems;
    this.state.coins += total;
    this.save();
    this.emit();
    return { count, total, kept: keptItems.length };
  }

  // ==================== Upgrades & Cosmetics ====================
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

  // ==================== House & Furniture ====================
  buildOrUpgradeHouse(tier) {
    if (this.state.house.level >= tier.level) return false;
    if (tier.level > this.state.house.level + 1) return false;
    if (!this.spendCoins(tier.price)) return false;
    this.state.house.level = tier.level;
    // Gift starter cozy rug & lamp when first building the house!
    if (tier.level === 1 && Object.keys(this.state.furnitureInventory).length === 0 && this.state.house.placedFurniture.length === 0) {
      this.state.furnitureInventory.furn_rug = (this.state.furnitureInventory.furn_rug || 0) + 1;
      this.state.furnitureInventory.furn_lamp = (this.state.furnitureInventory.furn_lamp || 0) + 1;
    }
    this.save();
    this.emit();
    return true;
  }

  buyFurniture(item) {
    if (!this.spendCoins(item.price)) return false;
    this.state.furnitureInventory[item.id] = (this.state.furnitureInventory[item.id] || 0) + 1;
    this.save();
    this.emit();
    return true;
  }

  getOwnedFurnitureCount(furnitureId) {
    const inInv = this.state.furnitureInventory[furnitureId] || 0;
    const placed = this.state.house.placedFurniture.filter(f => f.id === furnitureId).length;
    return { inInv, placed, total: inInv + placed };
  }

  placeFurniture(furnitureId, x, z, rot = 0) {
    const avail = this.state.furnitureInventory[furnitureId] || 0;
    if (avail <= 0) return null;
    this.state.furnitureInventory[furnitureId] = avail - 1;
    if (this.state.furnitureInventory[furnitureId] <= 0) {
      delete this.state.furnitureInventory[furnitureId];
    }
    const entry = {
      uid: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      id: furnitureId,
      x: Math.round(x * 100) / 100,
      z: Math.round(z * 100) / 100,
      rot
    };
    this.state.house.placedFurniture.push(entry);
    this.save();
    this.emit();
    return entry;
  }

  pickupFurniture(uid) {
    const idx = this.state.house.placedFurniture.findIndex(f => f.uid === uid);
    if (idx === -1) return false;
    const [removed] = this.state.house.placedFurniture.splice(idx, 1);
    this.state.furnitureInventory[removed.id] = (this.state.furnitureInventory[removed.id] || 0) + 1;
    this.save();
    this.emit();
    return true;
  }

  rotatePlacedFurniture(uid) {
    const item = this.state.house.placedFurniture.find(f => f.uid === uid);
    if (!item) return false;
    item.rot = (item.rot + Math.PI / 2) % (Math.PI * 2);
    this.save();
    this.emit();
    return true;
  }

  // ==================== Museum Donations ====================
  isDonated(creatureId) {
    return Boolean(this.state.museum[creatureId]);
  }

  getDonatableBagItems() {
    const seen = new Set();
    const list = [];
    for (const item of this.state.bag) {
      if (!this.state.museum[item.id] && !seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    return list;
  }

  donateBagItem(uid) {
    const idx = this.state.bag.findIndex(b => b.uid === uid);
    if (idx === -1) return null;
    const item = this.state.bag[idx];
    if (this.state.museum[item.id]) return null;

    const creature = CREATURE_MAP[item.id];
    if (!creature) return null;

    this.state.bag.splice(idx, 1);
    this.state.museum[item.id] = {
      size: item.size,
      donatedAt: Date.now()
    };

    // Research stipend (25% of base price, minimum 15 coins)
    const bonusCoins = Math.max(15, Math.round(creature.price * 0.25));
    this.state.coins += bonusCoins;

    const newMilestones = this._checkMuseumMilestones();
    this.save();
    this.emit();
    return { creature, bonusCoins, newMilestones };
  }

  donateAllNewFromBag() {
    const targets = this.getDonatableBagItems();
    if (!targets.length) return { count: 0, bonusCoins: 0, newMilestones: [] };
    let totalBonus = 0;
    const allMilestones = [];
    let count = 0;
    for (const t of targets) {
      const res = this.donateBagItem(t.uid);
      if (res) {
        count++;
        totalBonus += res.bonusCoins;
        allMilestones.push(...res.newMilestones);
      }
    }
    return { count, bonusCoins: totalBonus, newMilestones: allMilestones };
  }

  _checkMuseumMilestones() {
    const total = Object.keys(this.state.museum).length;
    const unlocked = [];
    for (const ms of MUSEUM_MILESTONES) {
      if (total >= ms.count && !this.state.museumMilestones.includes(ms.count)) {
        this.state.museumMilestones.push(ms.count);
        this.state.coins += ms.coins;
        if (ms.bonusFurniture) {
          this.state.furnitureInventory[ms.bonusFurniture] =
            (this.state.furnitureInventory[ms.bonusFurniture] || 0) + 1;
        }
        unlocked.push(ms);
      }
    }
    return unlocked;
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
