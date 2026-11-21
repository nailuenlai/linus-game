import * as THREE from 'three';
import {
  ISLANDS,
  getIslandAt,
  getIslandMooringPoint,
  findNearestLandPoint,
  findNearestWaterPoint,
  getTerrainHeight
} from './data/islands.js';
import { audio } from './systems/audio.js';
import { GameStore } from './systems/storage.js';
import { TimeWeatherSystem } from './systems/timeWeather.js';
import { InputSystem } from './systems/input.js';
import { WaterSystem } from './world/water.js';
import { buildArchipelago, updateAnimatedProps } from './world/islandBuilder.js';
import { AmbientAnimalsSystem } from './world/ambientAnimals.js';
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
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 420);
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
    this.water = new WaterSystem(this.scene);

    const worldData = buildArchipelago(this.scene, this.timeWeather);
    this.obstacles = worldData.obstacles;
    this.interactables = worldData.interactables;
    this.animatedProps = worldData.animatedProps;

    this.ambientAnimals = new AmbientAnimalsSystem(this.scene);

    const labelsEl = document.getElementById('world-labels');
    this.player = new PlayerEntity(this.scene);
    this.boat = new BoatEntity(this.scene, this.timeWeather);
    this.npcs = new NpcManager(this.scene, labelsEl);
    this.fishSystem = new FishSystem(this.scene, labelsEl);
    this.bugSystem = new BugSystem(this.scene);

    // Apply saved cosmetics & upgrades
    this._syncPlayerVisuals();

    this.hud = new HudManager();
    this.modals = new ModalManager({
      store: this.store,
      audio,
      hud: this.hud,
      timeWeather: this.timeWeather,
      onCosmeticChange: () => this._syncPlayerVisuals(),
      onUpgradeChange: () => this._syncPlayerVisuals(),
      onSummonBoat: () => this._summonBoatNearby(),
      onFastTravelHome: () => this._fastTravelHome()
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
  }

  _syncPlayerVisuals() {
    const s = this.store.state;
    this.player.applyCosmetics(s.equippedHat, s.equippedOutfit);
    this.player.setTool(this.player.tool, s.upgrades.rodLevel, s.upgrades.netLevel);
    this.boat.setLevel(s.upgrades.boatLevel);
  }

  _bindUI() {
    // Start button
    const startBtn = document.getElementById('btn-start-game');
    startBtn.addEventListener('click', () => {
      audio.unlock();
      audio.playCatch(false);
      this.started = true;
      document.getElementById('title-screen').classList.add('hidden');
      this.hud.show();
      this.hud.showIslandBanner('微風港灣', '歡迎來到微風群島');
      this.hud.toast('💡 提示：找阿狸店長接任務，或到南邊碼頭開小船探索外島！', 3800);
    });

    // Unlock Web Audio on any interaction
    window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

    // Tool buttons
    document.querySelectorAll('.tool-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playClick();
        this._selectTool(btn.dataset.tool);
      });
    });

    // HUD top menu buttons
    document.getElementById('btn-open-bag').addEventListener('click', () => this.modals.openBag());
    document.getElementById('btn-open-dex').addEventListener('click', () => this.modals.openDex());
    document.getElementById('btn-open-quests').addEventListener('click', () => this.modals.openQuests());
    document.getElementById('quest-tracker').addEventListener('click', () => this.modals.openQuests());
    document.getElementById('btn-open-settings').addEventListener('click', () => this.modals.openSettings());
    document.getElementById('btn-time-weather').addEventListener('click', () => this.modals.openTimeWeather());
    document.getElementById('btn-open-map').addEventListener('click', () => {
      const p = this._getActivePos();
      this.modals.openMap(p.x, p.z, p.yaw, this.boat.x, this.boat.z);
    });
  }

  _selectTool(tool) {
    if (this.fishSystem.isActive()) {
      this.fishSystem.cancel();
    }
    const u = this.store.state.upgrades;
    this.player.setTool(tool, u.rodLevel, u.netLevel);
    this.hud.setActiveTool(tool);
  }

  _handleShortcut(key) {
    if (!this.started) return;
    if (key === 'close') {
      if (this.modals.isOpen()) this.modals.closeAll();
      else if (this.fishSystem.isActive()) this.fishSystem.cancel();
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
      const p = this._getActivePos();
      this.modals.openMap(p.x, p.z, p.yaw, this.boat.x, this.boat.z);
    }
  }

  _getActivePos() {
    if (this.player.inBoat) {
      return { x: this.boat.x, y: 0.6, z: this.boat.z, yaw: this.boat.yaw };
    }
    return { x: this.player.x, y: this.player.y, z: this.player.z, yaw: this.player.yaw };
  }

  _getContext() {
    const pos = this._getActivePos();
    const u = this.store.state.upgrades;

    // 1. Active Fishing states take priority
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

    // 2. Sailing in Boat
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

    // 3. On Land
    const distBoat = Math.hypot(this.boat.x - pos.x, this.boat.z - pos.z);
    const secondary = distBoat < 11.5 ? { type: 'board', icon: '⛵', label: '登船出海' } : null;

    // Check nearby NPC or Shop/Bench
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
          secondary
        };
      }
      if (nearNpc) {
        return { primary: { type: 'npc', icon: '💬', label: '對話', npc: nearNpc.data }, secondary };
      }
      return {
        primary: { type: 'fish_hint', icon: '🎣', label: '靠近水邊', mode: 'fish' },
        secondary
      };
    }

    if (this.player.tool === 'net') {
      const nearBug = this.bugSystem.getNearestBug(pos.x, pos.z, 4.2 + u.netLevel * 0.5);
      return {
        primary: {
          type: 'net_swing',
          icon: '🥅',
          label: nearBug ? '捕捉！' : '揮動捕網',
          mode: nearBug ? 'alert' : 'net'
        },
        secondary
      };
    }

    // Hand tool context
    if (nearNpc) {
      return { primary: { type: 'npc', icon: '💬', label: '對話', npc: nearNpc.data }, secondary };
    }
    if (nearInteract) {
      return {
        primary: {
          type: nearInteract.type,
          icon: nearInteract.icon,
          label: nearInteract.type === 'shop' ? '逛商店' : '休息調時'
        },
        secondary
      };
    }
    if (secondary) {
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

    if (act.type === 'fish_hook' || act.type === 'fish_cancel') {
      this.fishSystem.onActionPress(u.rodLevel, audio);
      return;
    }
    if (act.type === 'fish_reel') {
      // Holding state is handled continuously in update()
      return;
    }
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
    if (act.type === 'net_swing') {
      this.player.triggerNetSwing();
      audio.playNetSwing();
      const caught = this.bugSystem.attemptCatch(this.player.x, this.player.z, this.player.yaw, u.netLevel);
      if (caught) {
        this._onCreatureCaught(caught);
      }
      return;
    }
    if (act.type === 'npc' && act.npc) {
      this.modals.openNpcDialogue(act.npc);
      return;
    }
    if (act.type === 'shop') {
      this.modals.openShop('sell');
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
      this.hud.toast('⛵ 叭叭～往地圖上的外島航行，或在船上切「🎣 釣竿」海釣吧！');
      return;
    }
    if (act.type === 'explore_hint') {
      this.hud.toast('💡 靠近動物朋友可對話，或切換「🎣 釣竿／🥅 捕蟲網」開始收集！');
    }
  }

  _handleSecondaryAction() {
    if (!this.started || this.modals.isOpen()) return;
    const ctx = this._getContext();
    const act = ctx.secondary;
    if (!act) return;

    if (act.type === 'board') {
      this._boardBoat();
    } else if (act.type === 'disembark' && act.spot) {
      this._disembarkBoat(act.spot);
    }
  }

  _boardBoat() {
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
    this.player.inBoat = true;
    this.boat.seatAnchor.add(this.player.group);
    this.player.group.position.set(0, 0, 0);
    this.player.group.rotation.set(0, 0, 0);
    audio.playBoatHorn();
    this.hud.toast('⛵ 已登船出海！跟著右上角小地圖探索各座外島吧！');
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
    if (this.fishSystem.isActive()) this.fishSystem.cancel();
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
  }

  _updateIslandTracking(pos) {
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
    const moveVec = modalLocked ? { x: 0, z: 0, mag: 0 } : this.input.getMoveVector();

    // Freeze movement while fishing line is cast
    const moveLocked = modalLocked || this.fishSystem.isActive();

    // Update Player & Boat
    this.player.update(dt, moveVec, this.obstacles, audio, moveLocked);
    this.boat.update(dt, this.elapsed, this.player.inBoat, moveVec, this.water, moveLocked);

    const activePos = this._getActivePos();
    const u = this.store.state.upgrades;
    const luck = u.luckyCharm ? 1 : 0;

    // Update World, Time/Weather, Water, Wildlife
    this.timeWeather.update(dt, activePos);
    this.water.update(dt, this.elapsed, this.timeWeather.isNight());
    updateAnimatedProps(this.animatedProps, dt, this.elapsed);
    this.ambientAnimals.update(dt, this.elapsed);

    // Update Camera
    if (!this.started) {
      // Gentle scenic orbit around Main Island during Title Screen
      const orbitA = this.elapsed * 0.16;
      this.camera.position.set(Math.sin(orbitA) * 34, 17, Math.cos(orbitA) * 34);
      this.camera.lookAt(2, 2.5, -2);
    } else {
      const targetDist = this.player.inBoat ? 24.5 : 16.5;
      this.cameraDist += (targetDist - this.cameraDist) * Math.min(1, dt * 4);

      const desiredFocus = new THREE.Vector3(activePos.x, activePos.y + 1.4, activePos.z);
      this.cameraTarget.lerp(desiredFocus, Math.min(1, dt * 8));

      const yaw = this.input.cameraYaw;
      const pitch = this.input.cameraPitch;
      const horiz = Math.cos(pitch) * this.cameraDist;
      const vert = Math.sin(pitch) * this.cameraDist;

      this.camera.position.set(
        this.cameraTarget.x + Math.sin(yaw) * horiz,
        this.cameraTarget.y + vert,
        this.cameraTarget.z + Math.cos(yaw) * horiz
      );
      this.camera.lookAt(this.cameraTarget);
    }

    // Update Entities (NPCs, Bugs, Fishing)
    const rodTip = this.player.getRodTipWorldPosition();
    this.npcs.update(dt, this.elapsed, this.camera, activePos, this.store, modalLocked);
    this.bugSystem.update(
      dt,
      this.elapsed,
      activePos,
      moveVec.mag,
      this.timeWeather.isNight(),
      this.timeWeather.isRain(),
      u.netLevel,
      luck
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

    // Update HUD
    if (this.started) {
      this._updateIslandTracking(activePos);
      this.hud.updateTimeWeather(this.timeWeather);
      this.hud.updateMinimap(activePos.x, activePos.z, activePos.yaw, this.boat.x, this.boat.z);
      const ctx = this._getContext();
      this.hud.updateActionButtons(ctx.primary, ctx.secondary);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

new BreezeArchipelagoGame();
