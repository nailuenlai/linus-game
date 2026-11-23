import * as THREE from 'three';
import {
  ISLANDS,
  MAIN_LANDMARKS,
  getIslandAt,
  getIslandMooringPoint,
  findNearestLandPoint,
  findNearestWaterPoint,
  getTerrainHeight
} from './data/islands.js';
import { NPC_MAP } from './data/npcs.js';
import { FURNITURE_MAP } from './data/shopItems.js';
import { audio } from './systems/audio.js';
import { GameStore } from './systems/storage.js';
import { TimeWeatherSystem } from './systems/timeWeather.js';
import { InputSystem } from './systems/input.js';
import { WaterSystem } from './world/water.js';
import { buildArchipelago, updateAnimatedProps, updateHouseExterior } from './world/islandBuilder.js';
import { AmbientAnimalsSystem } from './world/ambientAnimals.js';
import { InteriorManager } from './world/interiorManager.js';
import { PlayerEntity } from './entities/player.js';
import { BoatEntity } from './entities/boat.js';
import { NpcManager } from './entities/npcEntity.js';
import { FishSystem } from './entities/fishSystem.js';
import { BugSystem } from './entities/bugSystem.js';
import { HudManager } from './ui/hud.js';
import { ModalManager } from './ui/modals.js';

class BreezeArchipelagoGame {
  constructor() {
    this.started = false;
    this.currentIslandId = 'main';
    this.cameraTarget = new THREE.Vector3(0, 2, 11);
    this.cameraDist = 17;
    this.savedExteriorCameraYaw = 0;
    this.returnExteriorPos = { x: -14, z: 16, yaw: 0 };

    this._initRenderer();
    this._initSystems();
    this._bindUI();

    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this._loop();
  }

  _initRenderer() {
    this.container = document.getElementById('canvas-container');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 560);
    this.camera.position.set(0, 14, 28);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  _initSystems() {
    this.store = new GameStore();
    audio.setMuted(this.store.state.settings.muted);

    this.timeWeather = new TimeWeatherSystem(this.scene);

    // Exterior world container so interiors can cleanly swap visibility
    this.exteriorRoot = new THREE.Group();
    this.scene.add(this.exteriorRoot);

    this.water = new WaterSystem(this.exteriorRoot);

    const worldData = buildArchipelago(this.exteriorRoot, this.timeWeather, this.store.state.house.level);
    this.obstacles = worldData.obstacles;
    this.interactables = worldData.interactables;
    this.animatedProps = worldData.animatedProps;
    this.houseExteriorGroup = worldData.houseExteriorGroup;

    this.ambientAnimals = new AmbientAnimalsSystem(this.exteriorRoot);

    const labelsEl = document.getElementById('world-labels');
    this.interiors = new InteriorManager(this.scene, labelsEl);
    this.player = new PlayerEntity(this.scene);
    this.boat = new BoatEntity(this.exteriorRoot, this.timeWeather);
    this.npcs = new NpcManager(this.exteriorRoot, labelsEl);
    this.fishSystem = new FishSystem(this.exteriorRoot, labelsEl);
    this.bugSystem = new BugSystem(this.exteriorRoot, labelsEl);

    this._syncPlayerVisuals();

    this.hud = new HudManager();
    this.modals = new ModalManager({
      store: this.store,
      audio,
      hud: this.hud,
      timeWeather: this.timeWeather,
      onCosmeticChange: () => this._syncPlayerVisuals(),
      onUpgradeChange: () => this._syncPlayerVisuals(),
      onHouseChange: () => this._syncHouseVisuals(),
      onEnterHouse: () => this._enterHouse(),
      onStartPlaceFurniture: id => this._startPlaceFurniture(id),
      onMuseumChange: () => this._syncMuseumVisuals(),
      onSummonBoat: () => this._summonBoatNearby(),
      onFastTravelHome: () => this._fastTravelHome(),
      onModalOpen: () => this.input?.resetAll()
    });

    this.store.subscribe(() => this.hud.syncStore(this.store));
    this.hud.syncStore(this.store);

    this.input = new InputSystem({
      canvasContainer: this.container,
      joystickZone: document.getElementById('joystick-zone'),
      joystickKnob: document.getElementById('joystick-knob'),
      primaryBtn: document.getElementById('btn-primary-action'),
      secondaryBtn: document.getElementById('btn-secondary-action')
    });

    this.input.on('onPrimaryDown', () => this._handlePrimaryAction());
    this.input.on('onSecondaryPress', () => this._handleSecondaryAction());
    this.input.on('onToolKey', tool => this._selectTool(tool));
    this.input.on('onShortcut', key => this._handleShortcut(key));

    this.toolBarEl = document.getElementById('tool-bar');
    this.decorateBarEl = document.getElementById('decorate-bar');
    this.decorateLabelEl = document.getElementById('decorate-bar-label');
  }

  _syncPlayerVisuals() {
    const s = this.store.state;
    this.player.applyCosmetics(s.equippedHat, s.equippedOutfit);
    this.player.setTool(this.player.tool, s.upgrades.rodLevel, s.upgrades.netLevel);
    this.boat.setLevel(s.upgrades.boatLevel);
  }

  _syncHouseVisuals() {
    if (this.houseExteriorGroup) {
      updateHouseExterior(this.houseExteriorGroup, this.store.state.house.level, this.timeWeather);
    }
    if (this.interiors.mode === 'house') {
      this.interiors.rebuildHouse(this.store);
    }
  }

  _syncMuseumVisuals() {
    if (this.interiors.mode === 'museum') {
      this.interiors.rebuildMuseum(this.store);
    }
  }

  _bindUI() {
    const startBtn = document.getElementById('btn-start-game');
    startBtn.addEventListener('click', () => {
      audio.unlock();
      audio.playCatch(false);
      this.started = true;
      document.getElementById('title-screen').classList.add('hidden');
      this.hud.show();
      this.hud.showIslandBanner('微風港灣', '歡迎來到微風群島');
      this.hud.toast('💡 提示：西邊空地可蓋自己的小屋，北邊有博物館，南邊碼頭可開船探索 6 座外島！', 4200);
    });

    window.addEventListener('pointerdown', () => audio.unlock(), { once: true, capture: true });

    document.querySelectorAll('.tool-slot').forEach(btn => {
      this.input.bindInstantButton(btn, () => {
        audio.playClick();
        this._selectTool(btn.dataset.tool);
      });
    });

    this.input.bindInstantButton(document.getElementById('btn-open-bag'), () => this.modals.openBag());
    this.input.bindInstantButton(document.getElementById('btn-open-dex'), () => this.modals.openDex());
    this.input.bindInstantButton(document.getElementById('btn-open-quests'), () => this.modals.openQuests());
    this.input.bindInstantButton(document.getElementById('quest-tracker'), () => this.modals.openQuests());
    this.input.bindInstantButton(document.getElementById('btn-open-settings'), () => this.modals.openSettings());
    this.input.bindInstantButton(document.getElementById('btn-time-weather'), () => this.modals.openTimeWeather());
    this.input.bindInstantButton(document.getElementById('btn-open-map'), () => {
      const p = this.interiors.mode === 'exterior' ? this._getActivePos() : { ...this.returnExteriorPos };
      this.modals.openMap(p.x, p.z, p.yaw || 0, this.boat.x, this.boat.z);
    });

    // House Decorate floating controls
    this.input.bindInstantButton(document.getElementById('btn-decor-rotate'), () => {
      audio.playClick();
      this.interiors.rotatePreview();
    });
    this.input.bindInstantButton(document.getElementById('btn-decor-confirm'), () => this._confirmFurniturePlacement());
    this.input.bindInstantButton(document.getElementById('btn-decor-cancel'), () => {
      audio.playClick();
      this._cancelFurniturePlacement();
    });
  }

  _selectTool(tool) {
    if (this.interiors.mode !== 'exterior') return;
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    if (this.bugSystem.isTimingActive()) this.bugSystem.cancelTiming();
    if (tool !== 'net') this.input.setSneak(false);
    const u = this.store.state.upgrades;
    this.player.setTool(tool, u.rodLevel, u.netLevel);
    this.hud.setActiveTool(tool);
  }

  _handleShortcut(key) {
    if (!this.started) return;
    if (key === 'rotate') {
      if (this.interiors.mode === 'house' && this.interiors.placingFurnitureId) {
        audio.playClick();
        this.interiors.rotatePreview();
      }
      return;
    }
    if (key === 'close') {
      if (this.modals.isOpen()) this.modals.closeAll();
      else if (this.interiors.placingFurnitureId) this._cancelFurniturePlacement();
      else if (this.fishSystem.isActive()) this.fishSystem.cancel();
      else if (this.bugSystem.isTimingActive()) this.bugSystem.cancelTiming();
      return;
    }
    if (this.modals.isOpen()) {
      this.modals.closeAll();
      return;
    }
    if (key === 'bag') this.modals.openBag();
    else if (key === 'dex') this.modals.openDex();
    else if (key === 'quests') this.modals.openQuests();
    else if (key === 'map') {
      const p = this.interiors.mode === 'exterior' ? this._getActivePos() : { ...this.returnExteriorPos };
      this.modals.openMap(p.x, p.z, p.yaw || 0, this.boat.x, this.boat.z);
    }
  }

  // ==================== Indoor Transitions & Furniture Placement ====================
  _getActiveCameraYaw(isIndoors) {
    if (isIndoors) {
      return Math.max(-0.85, Math.min(0.85, this.input.cameraYaw));
    }
    return this.input.cameraYaw;
  }

  _enterHouse() {
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    if (this.bugSystem.isTimingActive()) this.bugSystem.cancelTiming();
    this.input.setSneak(false);

    this.returnExteriorPos = {
      x: MAIN_LANDMARKS.house.x + Math.sin(MAIN_LANDMARKS.house.facing) * 4.5,
      z: MAIN_LANDMARKS.house.z + Math.cos(MAIN_LANDMARKS.house.facing) * 4.5,
      yaw: MAIN_LANDMARKS.house.facing
    };

    const wasExterior = this.interiors.mode === 'exterior';
    if (wasExterior) {
      this.savedExteriorCameraYaw = this.input.cameraYaw;
    }
    this.exteriorRoot.visible = false;
    this.bugSystem.hideAllLabels();
    const spawn = this.interiors.enterHouse(this.store);
    this.input.cameraYaw = 0;
    this.input.setCameraYawLimits(-0.85, 0.85);
    this.player.x = spawn.x;
    this.player.y = spawn.y;
    this.player.z = spawn.z;
    this.player.yaw = spawn.yaw;
    this.player.group.position.set(spawn.x, spawn.y, spawn.z);
    this.cameraTarget.set(spawn.x, spawn.y + 1.4, spawn.z);

    this.toolBarEl.classList.add('hidden');
    this.decorateBarEl.classList.add('hidden');
    this.hud.setIslandName('🏡 我的小屋');
    this.hud.showIslandBanner('我的小屋', '按「🛋️ 裝潢家具」自由佈置房間');
    audio.playClick();
  }

  _enterMuseum() {
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    if (this.bugSystem.isTimingActive()) this.bugSystem.cancelTiming();
    this.input.setSneak(false);

    this.returnExteriorPos = {
      x: MAIN_LANDMARKS.museum.x + Math.sin(MAIN_LANDMARKS.museum.facing) * 5.6,
      z: MAIN_LANDMARKS.museum.z + Math.cos(MAIN_LANDMARKS.museum.facing) * 5.6,
      yaw: MAIN_LANDMARKS.museum.facing
    };

    const wasExterior = this.interiors.mode === 'exterior';
    if (wasExterior) {
      this.savedExteriorCameraYaw = this.input.cameraYaw;
    }
    this.exteriorRoot.visible = false;
    this.bugSystem.hideAllLabels();
    const spawn = this.interiors.enterMuseum(this.store);
    this.input.cameraYaw = 0;
    this.input.setCameraYawLimits(-0.85, 0.85);
    this.player.x = spawn.x;
    this.player.y = spawn.y;
    this.player.z = spawn.z;
    this.player.yaw = spawn.yaw;
    this.player.group.position.set(spawn.x, spawn.y, spawn.z);
    this.cameraTarget.set(spawn.x, spawn.y + 1.4, spawn.z);

    this.toolBarEl.classList.add('hidden');
    this.decorateBarEl.classList.add('hidden');
    this.hud.setIslandName('🏛️ 微風博物館');
    this.hud.showIslandBanner('微風自然博物館', '左翼水族・右翼昆蟲甲蟲・北翼爬蟲溫室');
    audio.playClick();
  }

  _exitInterior() {
    this.interiors.exitToExterior();
    this.exteriorRoot.visible = true;
    this.decorateBarEl.classList.add('hidden');
    this.toolBarEl.classList.remove('hidden');

    this.input.setCameraYawLimits(null, null);
    this.input.cameraYaw = this.savedExteriorCameraYaw;

    const ret = this.returnExteriorPos;
    this.player.x = ret.x;
    this.player.z = ret.z;
    this.player.y = getTerrainHeight(ret.x, ret.z);
    this.player.yaw = ret.yaw || 0;
    this.player.group.position.set(this.player.x, this.player.y, this.player.z);
    this.cameraTarget.set(this.player.x, this.player.y + 1.4, this.player.z);

    this.hud.setIslandName('微風港灣');
    audio.playClick();
  }

  _startPlaceFurniture(furnitureId) {
    if (this.interiors.mode !== 'house') return;
    const f = FURNITURE_MAP[furnitureId];
    if (!f) return;
    this.interiors.startPlacement(furnitureId);
    this.decorateLabelEl.textContent = `${f.icon} 擺放「${f.name}」`;
    this.decorateBarEl.classList.remove('hidden');
    this.hud.toast(`🪑 移動位置決定擺放點，按「✅ 放置」或空白鍵即可放下！`, 2600);
  }

  _confirmFurniturePlacement() {
    const res = this.interiors.confirmPlacement(this.store);
    if (!res) return;
    const f = FURNITURE_MAP[res.entry.id];
    audio.playCoin();
    this.hud.toast(`✨ 已放置「${f?.name || '家具'}」！`);
    if (res.remaining <= 0) {
      this.decorateBarEl.classList.add('hidden');
    }
  }

  _cancelFurniturePlacement() {
    this.interiors.cancelPlacement();
    this.decorateBarEl.classList.add('hidden');
  }

  // ==================== Context & Action Handling ====================
  _getActivePos() {
    if (this.player.inBoat) {
      return { x: this.boat.x, y: 0.6, z: this.boat.z, yaw: this.boat.yaw };
    }
    return { x: this.player.x, y: this.player.y, z: this.player.z, yaw: this.player.yaw };
  }

  _getContext() {
    const pos = this._getActivePos();
    const u = this.store.state.upgrades;

    // 0. Indoor contexts (House / Museum)
    if (this.interiors.mode === 'house') {
      if (this.interiors.placingFurnitureId) {
        return {
          primary: { type: 'place_confirm', icon: '✅', label: '放置這裡', mode: 'net' },
          secondary: { type: 'place_rotate', icon: '🔄', label: '旋轉' }
        };
      }
      if (this.interiors.isNearExit(pos.x, pos.z)) {
        return {
          primary: { type: 'exit_interior', icon: '🚪', label: '離開小屋' },
          secondary: { type: 'open_decorate', icon: '🛋️', label: '裝潢家具' }
        };
      }
      const nearFurn = this.interiors.getNearestPlacedFurniture(pos.x, pos.z, 2.3);
      if (nearFurn) {
        return {
          primary: { type: 'pickup_furn', icon: '📦', label: '收回家具', uid: nearFurn.uid, id: nearFurn.id },
          secondary: { type: 'open_decorate', icon: '🛋️', label: '裝潢家具' }
        };
      }
      return {
        primary: { type: 'open_decorate', icon: '🛋️', label: '裝潢家具', mode: 'net' },
        secondary: { type: 'exit_interior', icon: '🚪', label: '離開小屋' }
      };
    }

    if (this.interiors.mode === 'museum') {
      const donatable = this.store.getDonatableBagItems().length;
      if (this.interiors.isNearExit(pos.x, pos.z)) {
        return {
          primary: { type: 'exit_interior', icon: '🚪', label: '離開博物館' },
          secondary: { type: 'open_museum_modal', icon: '🎁', label: '捐贈館藏' }
        };
      }
      if (this.interiors.isNearCurator(pos.x, pos.z)) {
        return {
          primary: {
            type: 'curator_npc',
            icon: '🦉',
            label: donatable > 0 ? `捐贈 (${donatable})` : '與館長對話',
            mode: donatable > 0 ? 'alert' : ''
          },
          secondary: { type: 'exit_interior', icon: '🚪', label: '離開' }
        };
      }
      return {
        primary: {
          type: 'open_museum_modal',
          icon: '🎁',
          label: donatable > 0 ? `捐贈 (${donatable})` : '查看館藏',
          mode: donatable > 0 ? 'alert' : 'fish'
        },
        secondary: { type: 'exit_interior', icon: '🚪', label: '離開' }
      };
    }

    // 1. Active Bug Timing Mini-Game takes top priority
    if (this.bugSystem.isTimingActive()) {
      return {
        primary: { type: 'bug_strike', icon: '⚡', label: '精準捕獲！', mode: 'alert' },
        secondary: null
      };
    }

    // 2. Active Fishing states
    if (this.fishSystem.state === 'reeling') {
      return {
        primary: { type: 'fish_reel', icon: '🎣', label: '按住收線', mode: 'fish' },
        secondary: null
      };
    }
    if (this.fishSystem.state === 'biting') {
      return {
        primary: { type: 'fish_hook', icon: '❗', label: '快拉竿！', mode: 'alert' },
        secondary: null
      };
    }
    if (this.fishSystem.state === 'waiting') {
      return {
        primary: { type: 'fish_cancel', icon: '🎣', label: '收回釣線', mode: 'fish' },
        secondary: null
      };
    }

    // 3. Sailing in Boat
    if (this.player.inBoat) {
      const landSpot = findNearestLandPoint(this.boat.x, this.boat.z, 15);
      const secondary = landSpot
        ? { type: 'disembark', icon: '🏝️', label: '上岸', spot: landSpot }
        : null;

      if (this.player.tool === 'rod') {
        const castSpot = this.fishSystem.findCastSpot(this.boat.x, this.boat.z, this.boat.yaw, true);
        if (castSpot) {
          return {
            primary: { type: 'fish_cast', icon: '🎣', label: '船釣拋竿', mode: 'fish', spot: castSpot },
            secondary
          };
        }
      }
      if (landSpot) {
        return {
          primary: { type: 'disembark', icon: '🏝️', label: '靠岸下船', spot: landSpot },
          secondary: null
        };
      }
      return {
        primary: { type: 'boat_horn', icon: '⛵', label: '鳴笛出海', mode: 'fish' },
        secondary: null
      };
    }

    // 4. On Land
    const distBoat = Math.hypot(this.boat.x - pos.x, this.boat.z - pos.z);
    const boardSecondary = distBoat < 11.5 ? { type: 'board', icon: '⛵', label: '登船出海' } : null;

    const nearNpc = this.npcs.getNearestNpc(pos.x, pos.z, 4.0);
    let nearInteract = null;
    for (const inter of this.interactables) {
      if (Math.hypot(inter.x - pos.x, inter.z - pos.z) < inter.radius) {
        nearInteract = inter;
        break;
      }
    }

    if (this.player.tool === 'rod') {
      const castSpot = this.fishSystem.findCastSpot(pos.x, pos.z, pos.yaw, false);
      if (castSpot) {
        return {
          primary: { type: 'fish_cast', icon: '🎣', label: '拋竿釣魚', mode: 'fish', spot: castSpot },
          secondary: boardSecondary
        };
      }
      if (nearNpc) {
        return { primary: { type: 'npc', icon: '💬', label: '對話', npc: nearNpc.data }, secondary: boardSecondary };
      }
      return {
        primary: { type: 'fish_hint', icon: '🎣', label: '靠近水邊', mode: 'fish' },
        secondary: boardSecondary
      };
    }

    if (this.player.tool === 'net') {
      const aimed = this.bugSystem.getAimedTarget(pos.x, pos.z, pos.yaw, u.netLevel);
      const sneaking = this.input.isSneaking();
      const sneakSecondary = {
        type: 'toggle_sneak',
        icon: sneaking ? '🤫' : '🦶',
        label: sneaking ? '潛行中' : '潛行',
        extraClass: sneaking ? 'active-sneak' : ''
      };
      return {
        primary: {
          type: 'net_swing',
          icon: '🥅',
          label: aimed ? '鎖定揮網！' : '揮動捕網',
          mode: aimed ? 'alert' : 'net'
        },
        secondary: sneakSecondary
      };
    }

    // Hand tool context
    if (nearNpc) {
      return { primary: { type: 'npc', icon: '💬', label: '對話', npc: nearNpc.data }, secondary: boardSecondary };
    }
    if (nearInteract) {
      let label = '互動';
      if (nearInteract.type === 'shop') label = '逛商店';
      else if (nearInteract.type === 'bench') label = '休息調時';
      else if (nearInteract.type === 'house') label = this.store.state.house.level === 0 ? '蓋小屋' : '進小屋';
      else if (nearInteract.type === 'museum') label = '進博物館';
      return {
        primary: {
          type: nearInteract.type,
          icon: nearInteract.icon,
          label
        },
        secondary: boardSecondary
      };
    }
    if (boardSecondary) {
      return { primary: { type: 'board', icon: '⛵', label: '登船出海', mode: 'fish' }, secondary: null };
    }

    return {
      primary: { type: 'explore_hint', icon: '✋', label: '互動' },
      secondary: null
    };
  }

  _handlePrimaryAction() {
    if (!this.started || this.modals.isOpen()) return;
    const ctx = this._getContext();
    const act = ctx.primary;
    const u = this.store.state.upgrades;
    const luck = u.luckyCharm ? 1 : 0;

    // Indoor actions
    if (act.type === 'place_confirm') {
      this._confirmFurniturePlacement();
      return;
    }
    if (act.type === 'exit_interior') {
      this._exitInterior();
      return;
    }
    if (act.type === 'open_decorate') {
      this.modals.openDecorateModal('inv');
      return;
    }
    if (act.type === 'pickup_furn' && act.uid) {
      const f = FURNITURE_MAP[act.id];
      this.store.pickupFurniture(act.uid);
      audio.playClick();
      this._syncHouseVisuals();
      this.hud.toast(`📦 已收回「${f?.name || '家具'}」到倉庫！`);
      return;
    }
    if (act.type === 'curator_npc') {
      this.modals.openNpcDialogue(NPC_MAP.curator);
      return;
    }
    if (act.type === 'open_museum_modal') {
      this.modals.openMuseumModal('donate');
      return;
    }

    // Bug Timing Strike resolution
    if (act.type === 'bug_strike') {
      this.player.triggerNetSwing();
      audio.playNetSwing();
      const res = this.bugSystem.resolveTimingStrike(this.player.x, this.player.z, audio);
      if (res?.success) {
        this._onCreatureCaught({ creature: res.creature, size: res.size });
      } else if (res?.message) {
        this.hud.toast(res.message, 2600);
      }
      return;
    }

    // Fishing actions
    if (act.type === 'fish_hook' || act.type === 'fish_cancel') {
      this.fishSystem.onActionPress(u.rodLevel, audio);
      return;
    }
    if (act.type === 'fish_reel') return;
    if (act.type === 'fish_cast' && act.spot) {
      this.fishSystem.startCast(
        act.spot,
        this.timeWeather.isNight(),
        this.timeWeather.isRain(),
        u.rodLevel,
        luck,
        audio
      );
      return;
    }
    if (act.type === 'fish_hint') {
      this.hud.toast('🌊 請面向海邊、碼頭或池塘水面再拋竿喔！');
      return;
    }

    // Net swing (starts skill timing bar when aimed at a bug/reptile!)
    if (act.type === 'net_swing') {
      this.player.triggerNetSwing();
      audio.playNetSwing();
      const res = this.bugSystem.startNetSwing(this.player.x, this.player.z, this.player.yaw, u.netLevel, audio);
      if (!res.started && res.spookedAny) {
        this.hud.toast('💨 揮空嚇跑了附近的生物！瞄準地上圓圈變綠再揮網！');
      }
      return;
    }

    // Outdoor landmarks & NPCs
    if (act.type === 'npc' && act.npc) {
      this.modals.openNpcDialogue(act.npc);
      return;
    }
    if (act.type === 'shop') {
      this.modals.openShop('sell');
      return;
    }
    if (act.type === 'house') {
      this.modals.openHouseExteriorModal();
      return;
    }
    if (act.type === 'museum') {
      this._enterMuseum();
      return;
    }
    if (act.type === 'bench') {
      this.modals.openTimeWeather();
      return;
    }
    if (act.type === 'board') {
      this._boardBoat();
      return;
    }
    if (act.type === 'disembark' && act.spot) {
      this._disembarkBoat(act.spot);
      return;
    }
    if (act.type === 'boat_horn') {
      audio.playBoatHorn();
      this.hud.toast('⛵ 叭叭～往地圖上的 6 座外島航行，或在船上切「🎣 釣竿」海釣吧！');
      return;
    }
    if (act.type === 'explore_hint') {
      this.hud.toast('💡 靠近動物朋友、小屋或博物館可互動，或切換「🎣 釣竿／🥅 捕蟲網」開始收集！');
    }
  }

  _handleSecondaryAction() {
    if (!this.started || this.modals.isOpen()) return;
    const ctx = this._getContext();
    const act = ctx.secondary;
    if (!act) return;

    if (act.type === 'board') this._boardBoat();
    else if (act.type === 'disembark' && act.spot) this._disembarkBoat(act.spot);
    else if (act.type === 'toggle_sneak') {
      const on = this.input.toggleSneak();
      audio.playClick();
      this.hud.toast(on ? '🤫 已開啟潛行模式，悄悄靠近稀有甲蟲與爬蟲吧！' : '🏃 已關閉潛行模式');
    } else if (act.type === 'open_decorate') this.modals.openDecorateModal('inv');
    else if (act.type === 'exit_interior') this._exitInterior();
    else if (act.type === 'place_rotate') {
      audio.playClick();
      this.interiors.rotatePreview();
    } else if (act.type === 'open_museum_modal') this.modals.openMuseumModal('donate');
  }

  _boardBoat() {
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    if (this.bugSystem.isTimingActive()) this.bugSystem.cancelTiming();
    this.input.setSneak(false);
    this.player.inBoat = true;
    this.boat.seatAnchor.add(this.player.group);
    this.player.group.position.set(0, 0, 0);
    this.player.group.rotation.set(0, 0, 0);
    audio.playBoatHorn();
    this.hud.toast('⛵ 已登船出海！跟著右上角小地圖探索 6 座外島吧！');
  }

  _disembarkBoat(spot) {
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    this.player.inBoat = false;
    this.scene.add(this.player.group);
    this.player.x = spot.x;
    this.player.z = spot.z;
    this.player.y = spot.y;
    this.player.group.position.set(spot.x, spot.y, spot.z);
    audio.playSplash();
    this.hud.toast(`🏝️ 已登上${spot.island.name}！`);
  }

  _summonBoatNearby() {
    if (this.interiors.mode !== 'exterior') {
      this.hud.toast('⛵ 請先離開室內回到島上再召喚小船喔！');
      return;
    }
    if (this.player.inBoat) {
      this.hud.toast('⛵ 你現在就在船上囉！');
      return;
    }
    const wp = findNearestWaterPoint(this.player.x, this.player.z);
    this.boat.teleportTo(wp.x, wp.z);
    audio.playBoatHorn();
    this.hud.toast('⛵ 已將小船召喚到最近的岸邊水域！');
  }

  _fastTravelHome() {
    if (this.interiors.mode !== 'exterior') {
      this._exitInterior();
    }
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    if (this.bugSystem.isTimingActive()) this.bugSystem.cancelTiming();
    if (this.player.inBoat) {
      this.player.inBoat = false;
      this.scene.add(this.player.group);
    }
    this.player.x = 0;
    this.player.z = 26;
    this.player.y = getTerrainHeight(0, 26);
    this.player.group.position.set(this.player.x, this.player.y, this.player.z);

    const moor = getIslandMooringPoint(ISLANDS[0]);
    this.boat.teleportTo(moor.x + 2.5, moor.z + 1.2);
    audio.playSplash();
    this.hud.showIslandBanner('微風港灣', '快速返航');
  }

  _onCreatureCaught({ creature, size }) {
    const res = this.store.recordCatch(creature, size);
    audio.playCatch(creature.rarity >= 4 || res.isNew);
    this.modals.showCatchModal(creature, size, res);

    if (res.newlyUnlocked && res.newlyUnlocked.length > 0) {
      for (const u of res.newlyUnlocked) {
        this.hud.toast(`🔓 捕獲達標！現在有機會在野外出沒「${u.icon} ${u.name}」了！`, 4600);
      }
    }
  }

  _updateIslandTracking(pos) {
    if (this.interiors.mode !== 'exterior') return;
    const isl = getIslandAt(pos.x, pos.z, 12);
    const nextId = isl ? isl.id : 'ocean';
    if (nextId !== this.currentIslandId) {
      this.currentIslandId = nextId;
      if (isl) {
        this.hud.setIslandName(isl.name);
        const firstTime = this.store.discoverIsland(isl.id);
        this.hud.showIslandBanner(isl.name, firstTime ? '✨ 發現新外島！' : isl.subtitle);
        if (firstTime) audio.playCatch(true);
      } else {
        this.hud.setIslandName('微風外海');
      }
    }
  }

  _loop() {
    requestAnimationFrame(() => this._loop());

    const dt = Math.min(0.05, this.clock.getDelta());
    this.elapsed += dt;

    const modalLocked = !this.started || this.modals.isOpen();
    const isIndoors = this.interiors.mode !== 'exterior';
    const activeCameraYaw = this._getActiveCameraYaw(isIndoors);
    const moveVec = modalLocked ? { x: 0, z: 0, mag: 0 } : this.input.getMoveVector(activeCameraYaw);

    const moveLocked = modalLocked || this.fishSystem.isActive() || this.bugSystem.isTimingActive();
    const isSneaking = !isIndoors && !this.player.inBoat && this.input.isSneaking();

    // Update Player (with indoor room bounds & furniture obstacles when inside!)
    const activeObstacles = isIndoors ? this.interiors.getObstacles() : this.obstacles;
    const roomBounds = isIndoors ? this.interiors.getRoomBounds() : null;
    this.player.update(dt, moveVec, activeObstacles, audio, moveLocked, isSneaking, roomBounds);

    if (!isIndoors) {
      this.boat.update(dt, this.elapsed, this.player.inBoat, moveVec, this.water, moveLocked);
    }

    const activePos = this._getActivePos();
    const u = this.store.state.upgrades;
    const luck = u.luckyCharm ? 1 : 0;

    // Update Environment & Lighting
    this.timeWeather.update(dt, isIndoors ? { x: 0, y: 0, z: 0 } : activePos);

    if (isIndoors) {
      // Warm cozy indoor atmosphere (no rain/stars/ocean fog indoors)
      this.scene.background = new THREE.Color(this.interiors.mode === 'house' ? 0x3b2f26 : 0x243844);
      this.scene.fog.density = 0.0001;
      this.timeWeather.rain.visible = false;
      this.timeWeather.stars.visible = false;
      this.timeWeather.hemiLight.intensity = 1.05;
      this.timeWeather.sunLight.intensity = 0.85;
      this.timeWeather.sunLight.position.set(8, 22, 14);
      this.timeWeather.sunLight.target.position.set(0, 0, 0);
    } else {
      this.water.update(dt, this.elapsed, this.timeWeather.isNight());
      updateAnimatedProps(this.animatedProps, dt, this.elapsed);
      this.ambientAnimals.update(dt, this.elapsed);
    }

    // Update Camera
    if (!this.started) {
      const orbitA = this.elapsed * 0.16;
      this.camera.position.set(Math.sin(orbitA) * 35, 17, Math.cos(orbitA) * 35);
      this.camera.lookAt(0, 2.5, -2);
    } else {
      const targetDist = isIndoors
        ? this.interiors.mode === 'museum'
          ? 18.5
          : 13.8
        : this.player.inBoat
          ? 24.5
          : 16.5;
      this.cameraDist += (targetDist - this.cameraDist) * Math.min(1, dt * 4);

      const desiredFocus = new THREE.Vector3(activePos.x, activePos.y + 1.4, activePos.z);
      this.cameraTarget.lerp(desiredFocus, Math.min(1, dt * 8));

      const yaw = activeCameraYaw;
      const pitch = isIndoors ? 0.68 : this.input.cameraPitch;
      const horiz = Math.cos(pitch) * this.cameraDist;
      const vert = Math.sin(pitch) * this.cameraDist;

      this.camera.position.set(
        this.cameraTarget.x + Math.sin(yaw) * horiz,
        this.cameraTarget.y + vert,
        this.cameraTarget.z + Math.cos(yaw) * horiz
      );
      this.camera.lookAt(this.cameraTarget);
    }

    // Update Entities
    if (isIndoors) {
      this.npcs.update(dt, this.elapsed, this.camera, activePos, this.store, true);
      this.interiors.update(dt, this.elapsed, this.camera, activePos, this.store, modalLocked);
    } else {
      const rodTip = this.player.getRodTipWorldPosition();
      this.npcs.update(dt, this.elapsed, this.camera, activePos, this.store, modalLocked);
      this.bugSystem.update(
        dt,
        this.elapsed,
        this.camera,
        activePos,
        moveVec.mag,
        isSneaking,
        this.player.tool === 'net',
        this.player.inBoat,
        this.timeWeather.isNight(),
        this.timeWeather.isRain(),
        u.netLevel,
        luck,
        this.store.getCatchCounts(),
        audio,
        msg => this.hud.toast(msg, 2800),
        modalLocked
      );
      this.fishSystem.update(
        dt,
        this.elapsed,
        this.camera,
        activePos,
        rodTip,
        this.input.isPrimaryHeld,
        u.rodLevel,
        this.timeWeather.isNight(),
        this.timeWeather.isRain(),
        luck,
        audio,
        caught => this._onCreatureCaught(caught),
        msg => this.hud.toast(msg)
      );
    }

    // Update HUD
    if (this.started) {
      this._updateIslandTracking(activePos);
      this.hud.updateTimeWeather(this.timeWeather);
      const mapPos = isIndoors ? this.returnExteriorPos : activePos;
      this.hud.updateMinimap(mapPos.x, mapPos.z, mapPos.yaw || 0, this.boat.x, this.boat.z);
      const ctx = this._getContext();
      this.hud.updateActionButtons(ctx.primary, ctx.secondary);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

new BreezeArchipelagoGame();
