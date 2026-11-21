import { ISLANDS } from '../data/islands.js';
import { NPCS } from '../data/npcs.js';

export class HudManager {
  constructor() {
    this.elHud = document.getElementById('hud');
    this.elCoin = document.getElementById('coin-value');
    this.elWeatherIcon = document.getElementById('weather-icon');
    this.elTimeLabel = document.getElementById('time-label');
    this.elIslandLabel = document.getElementById('island-name-label');
    this.elBagBadge = document.getElementById('bag-count-badge');
    this.elQuestDot = document.getElementById('quest-dot-badge');
    this.elQuestTracker = document.getElementById('quest-tracker');
    this.elQuestTrackerText = document.getElementById('quest-tracker-text');

    this.elBanner = document.getElementById('island-banner');
    this.elBannerSub = document.getElementById('island-banner-sub');
    this.elBannerTitle = document.getElementById('island-banner-title');
    this.elToasts = document.getElementById('toast-container');

    this.btnPrimary = document.getElementById('btn-primary-action');
    this.elPrimaryIcon = document.getElementById('primary-action-icon');
    this.elPrimaryLabel = document.getElementById('primary-action-label');

    this.btnSecondary = document.getElementById('btn-secondary-action');
    this.elSecondaryIcon = document.getElementById('secondary-action-icon');
    this.elSecondaryLabel = document.getElementById('secondary-action-label');

    this.toolButtons = Array.from(document.querySelectorAll('.tool-slot'));

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.bannerTimer = null;
    this.lastPrimaryKey = '';
    this.lastSecondaryKey = '';
  }

  show() {
    this.elHud.classList.remove('hidden');
  }

  setActiveTool(tool) {
    for (const btn of this.toolButtons) {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    }
  }

  syncStore(store) {
    const s = store.state;
    this.elCoin.textContent = s.coins.toLocaleString();

    const bagCount = s.bag.length;
    this.elBagBadge.textContent = String(bagCount);
    this.elBagBadge.classList.toggle('hidden', bagCount === 0);

    // Check active/ready quests for tracker pill
    let readyQuest = null;
    let activeQuest = null;
    for (const npc of NPCS) {
      const status = store.getNpcQuestStatus(npc);
      if (status.state === 'ready') {
        readyQuest = { npc, quest: status.quest };
        break;
      }
      if (status.state === 'active' && !activeQuest) {
        activeQuest = { npc, quest: status.quest };
      }
    }

    this.elQuestDot.classList.toggle('hidden', !readyQuest);

    if (readyQuest) {
      this.elQuestTracker.classList.remove('hidden');
      this.elQuestTrackerText.textContent = `✓ 回報給${readyQuest.npc.name}！`;
    } else if (activeQuest) {
      const prog = store.getQuestProgress(activeQuest.quest);
      this.elQuestTracker.classList.remove('hidden');
      this.elQuestTrackerText.textContent = `${activeQuest.quest.title} (${prog}/${activeQuest.quest.targetCount})`;
    } else if (!s.quests.completed.length) {
      this.elQuestTracker.classList.remove('hidden');
      this.elQuestTrackerText.textContent = '找阿狸店長或島民接取委託';
    } else {
      this.elQuestTracker.classList.add('hidden');
    }
  }

  updateTimeWeather(timeWeather) {
    this.elWeatherIcon.textContent = timeWeather.getWeatherIcon();
    this.elTimeLabel.textContent = timeWeather.getFormattedTime();
  }

  setIslandName(name) {
    this.elIslandLabel.textContent = name;
  }

  showIslandBanner(title, sub = '抵達島嶼') {
    this.elBannerTitle.textContent = title;
    this.elBannerSub.textContent = sub;
    this.elBanner.classList.remove('hidden');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.elBanner.classList.add('hidden');
    }, 2800);
  }

  toast(message, duration = 2400) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    this.elToasts.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, duration);
  }

  updateActionButtons(primary, secondary) {
    const pKey = `${primary.icon}|${primary.label}|${primary.mode || ''}`;
    if (pKey !== this.lastPrimaryKey) {
      this.lastPrimaryKey = pKey;
      this.elPrimaryIcon.textContent = primary.icon;
      this.elPrimaryLabel.textContent = primary.label;
      const wasPressed = this.btnPrimary.classList.contains('pressed');
      this.btnPrimary.className =
        'action-btn primary' + (primary.mode ? ` mode-${primary.mode}` : '') + (wasPressed ? ' pressed' : '');
    }

    const sKey = secondary ? `${secondary.icon}|${secondary.label}|${secondary.extraClass || ''}` : 'none';
    if (sKey !== this.lastSecondaryKey) {
      this.lastSecondaryKey = sKey;
      if (secondary) {
        const wasPressed = this.btnSecondary.classList.contains('pressed');
        this.btnSecondary.className =
          'action-btn secondary' + (secondary.extraClass ? ` ${secondary.extraClass}` : '') + (wasPressed ? ' pressed' : '');
        this.elSecondaryIcon.textContent = secondary.icon;
        this.elSecondaryLabel.textContent = secondary.label;
      } else {
        this.btnSecondary.className = 'action-btn secondary hidden';
      }
    }
  }

  drawMapToCanvas(canvas, playerX, playerZ, playerYaw, boatX, boatZ, showLabels = false) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const scale = w / 405; // Covers all 7 islands cleanly
    const cx = w * 0.46;
    const cy = h * 0.56;

    // Ocean gradient
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.72);
    grad.addColorStop(0, '#36a8bd');
    grad.addColorStop(1, '#1d6f85');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle sea rings
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (const r of [60, 120, 175]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Islands
    for (const isl of ISLANDS) {
      const ix = cx + isl.x * scale;
      const iz = cy + isl.z * scale;
      const ir = isl.radius * scale;

      // Shallow turquoise ring
      ctx.fillStyle = 'rgba(130, 234, 240, 0.35)';
      ctx.beginPath();
      ctx.arc(ix, iz, ir + 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Sand rim
      ctx.fillStyle = '#f4dca4';
      ctx.beginPath();
      ctx.arc(ix, iz, ir, 0, Math.PI * 2);
      ctx.fill();

      // Grass interior
      ctx.fillStyle = isl.mapColor;
      ctx.beginPath();
      ctx.arc(ix, iz, ir * 0.78, 0, Math.PI * 2);
      ctx.fill();

      if (showLabels) {
        ctx.fillStyle = '#fff9ee';
        ctx.strokeStyle = 'rgba(42, 30, 20, 0.85)';
        ctx.lineWidth = 3;
        ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        const txt = `${isl.emoji} ${isl.name}`;
        ctx.strokeText(txt, ix, iz - ir - 6);
        ctx.fillText(txt, ix, iz - ir - 6);
      }
    }

    // Boat marker
    const bx = cx + boatX * scale;
    const bz = cy + boatZ * scale;
    ctx.fillStyle = '#ffe066';
    ctx.strokeStyle = '#3a2b1e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx, bz, showLabels ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Player direction arrow
    const px = cx + playerX * scale;
    const pz = cy + playerZ * scale;
    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(-playerYaw + Math.PI);
    ctx.fillStyle = '#ff595e';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    const sz = showLabels ? 9 : 5.5;
    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz * 0.75, sz * 0.8);
    ctx.lineTo(0, sz * 0.35);
    ctx.lineTo(-sz * 0.75, sz * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  updateMinimap(playerX, playerZ, playerYaw, boatX, boatZ) {
    this.drawMapToCanvas(this.minimapCanvas, playerX, playerZ, playerYaw, boatX, boatZ, false);
  }
}
