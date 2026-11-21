import * as THREE from 'three';

export class TimeWeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.hour = 9.5; // Starts at 09:30 AM
    this.weather = 'sunny'; // 'sunny' | 'rain'
    this.weatherTimer = 140; // seconds until random weather shift
    this.timeSpeed = 1; // 1 = ~1 game hour every 16s (~6.4 min full day)

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(0xdaf4ff, 0x6ba665, 0.9);
    scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff5dc, 1.35);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 160;
    const d = 52;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0008;
    scene.add(this.sunLight);
    scene.add(this.sunLight.target);

    // Sky fog
    this.skyColor = new THREE.Color(0x8ed6f0);
    scene.background = this.skyColor;
    scene.fog = new THREE.FogExp2(0x8ed6f0, 0.0048);

    // Night Starfield
    this.stars = this._createStars();
    scene.add(this.stars);

    // Rain particles (follows player)
    this.rain = this._createRain();
    scene.add(this.rain);

    // Drifting Sakura petals (anchored around Sakura Island)
    this.petals = this._createSakuraPetals();
    scene.add(this.petals);

    // Lamps / glowing night objects registered by islandBuilder
    this.nightLights = [];
  }

  registerNightMaterial(mat, baseIntensity = 0.85) {
    this.nightLights.push({ mat, baseIntensity });
  }

  _createStars() {
    const count = 260;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.42;
      const r = 210;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) + 12;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfffbe0,
      size: 2.2,
      transparent: true,
      opacity: 0,
      fog: false
    });
    return new THREE.Points(geo, mat);
  }

  _createRain() {
    const count = 420;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = Math.random() * 34;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xcbe8ff,
      size: 0.45,
      transparent: true,
      opacity: 0.65
    });
    const points = new THREE.Points(geo, mat);
    points.visible = false;
    return points;
  }

  _createSakuraPetals() {
    const count = 90;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -88 + (Math.random() - 0.5) * 52;
      pos[i * 3 + 1] = 1 + Math.random() * 14;
      pos[i * 3 + 2] = -66 + (Math.random() - 0.5) * 52;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffc2d4,
      size: 0.55,
      transparent: true,
      opacity: 0.85
    });
    return new THREE.Points(geo, mat);
  }

  isNight() {
    return this.hour >= 19 || this.hour < 5.5;
  }

  isRain() {
    return this.weather === 'rain';
  }

  setHour(h) {
    this.hour = ((h % 24) + 24) % 24;
  }

  setWeather(w) {
    this.weather = w === 'rain' ? 'rain' : 'sunny';
    this.weatherTimer = 150 + Math.random() * 90;
  }

  getFormattedTime() {
    const h = Math.floor(this.hour);
    const m = Math.floor((this.hour - h) * 60);
    const mm = String(m).padStart(2, '0');
    const hh = String(h).padStart(2, '0');
    let period = '白天';
    if (h >= 5 && h < 8) period = '清晨';
    else if (h >= 8 && h < 12) period = '上午';
    else if (h >= 12 && h < 16) period = '午後';
    else if (h >= 16 && h < 19) period = '黃昏';
    else period = '夜晚';
    return `${period} ${hh}:${mm}`;
  }

  getWeatherIcon() {
    if (this.weather === 'rain') return '🌧️';
    if (this.isNight()) return '🌙';
    if (this.hour >= 16.5 && this.hour < 19) return '🌅';
    return '☀️';
  }

  update(dt, focusPos) {
    // Advance time
    if (this.timeSpeed > 0) {
      this.hour = (this.hour + (dt / 16) * this.timeSpeed) % 24;
    }

    // Occasional gentle weather shifts
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      this.weather = this.weather === 'sunny' && Math.random() < 0.35 ? 'rain' : 'sunny';
      this.weatherTimer = 130 + Math.random() * 110;
    }

    // Compute sky & sun colors by hour
    const h = this.hour;
    const cNight = new THREE.Color(0x162442);
    const cDawn = new THREE.Color(0xf6b289);
    const cDay = new THREE.Color(0x88d4ef);
    const cSunset = new THREE.Color(0xf08c63);
    const cRainTint = new THREE.Color(0x6d8799);

    let sky = new THREE.Color();
    let sunCol = new THREE.Color(0xfff5db);
    let sunInt = 1.3;
    let hemiInt = 0.88;
    let starAlpha = 0;

    if (h >= 5 && h < 7.5) {
      const t = (h - 5) / 2.5;
      sky.lerpColors(cNight, cDawn, t);
      sunCol.setHex(0xffc994);
      sunInt = 0.4 + t * 0.7;
      hemiInt = 0.4 + t * 0.4;
      starAlpha = 1 - t;
    } else if (h >= 7.5 && h < 10) {
      const t = (h - 7.5) / 2.5;
      sky.lerpColors(cDawn, cDay, t);
      sunCol.lerpColors(new THREE.Color(0xffcfa0), new THREE.Color(0xfff7e2), t);
      sunInt = 1.1 + t * 0.25;
      hemiInt = 0.8 + t * 0.12;
    } else if (h >= 10 && h < 16.5) {
      sky.copy(cDay);
      sunCol.setHex(0xfff7e2);
      sunInt = 1.35;
      hemiInt = 0.92;
    } else if (h >= 16.5 && h < 19) {
      const t = (h - 16.5) / 2.5;
      sky.lerpColors(cDay, cSunset, t);
      sunCol.lerpColors(new THREE.Color(0xfff0cc), new THREE.Color(0xff9b6a), t);
      sunInt = 1.35 - t * 0.45;
      hemiInt = 0.9 - t * 0.25;
    } else if (h >= 19 && h < 20.5) {
      const t = (h - 19) / 1.5;
      sky.lerpColors(cSunset, cNight, t);
      sunCol.lerpColors(new THREE.Color(0xff9b6a), new THREE.Color(0x88b4f0), t);
      sunInt = 0.9 - t * 0.45;
      hemiInt = 0.65 - t * 0.27;
      starAlpha = t;
    } else {
      sky.copy(cNight);
      sunCol.setHex(0x8cb8f5);
      sunInt = 0.48;
      hemiInt = 0.38;
      starAlpha = 1;
    }

    if (this.weather === 'rain') {
      sky.lerp(cRainTint, 0.52);
      sunInt *= 0.62;
      hemiInt *= 0.82;
      starAlpha *= 0.2;
    }

    this.skyColor.copy(sky);
    this.scene.background = this.skyColor;
    this.scene.fog.color.copy(this.skyColor);
    this.scene.fog.density = this.weather === 'rain' ? 0.0072 : 0.0044;

    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = sunInt;
    this.hemiLight.intensity = hemiInt;

    // Position sun/moon around focusPos so shadows stay crisp near player!
    const angle = ((h - 6) / 12) * Math.PI;
    const sunElev = this.isNight() ? 38 : Math.max(14, Math.sin(Math.max(0.15, Math.min(Math.PI - 0.15, angle))) * 54);
    const sunHoriz = this.isNight() ? -32 : Math.cos(angle) * 44;
    this.sunLight.position.set(focusPos.x + sunHoriz, sunElev, focusPos.z + 28);
    this.sunLight.target.position.set(focusPos.x, 0, focusPos.z);

    // Stars follow player loosely
    this.stars.position.set(focusPos.x, 0, focusPos.z);
    this.stars.material.opacity = starAlpha * 0.9;
    this.stars.visible = starAlpha > 0.02;

    // Night lantern & crystal glow
    const nightGlow = this.isNight() ? 1 : (h >= 17.5 ? (h - 17.5) / 1.5 : 0);
    for (const item of this.nightLights) {
      item.mat.emissiveIntensity = item.baseIntensity * (0.2 + nightGlow * 1.15);
    }

    // Rain animation
    this.rain.visible = this.weather === 'rain';
    if (this.rain.visible) {
      this.rain.position.set(focusPos.x, 0, focusPos.z);
      const posAttr = this.rain.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - dt * 28;
        if (y < 0) y = 32 + Math.random() * 4;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // Sakura petals drifting
    const pAttr = this.petals.geometry.attributes.position;
    const tNow = performance.now() * 0.001;
    for (let i = 0; i < pAttr.count; i++) {
      let y = pAttr.getY(i) - dt * 1.1;
      let x = pAttr.getX(i) + Math.sin(tNow + i) * dt * 0.9;
      if (y < 0.2) {
        y = 11 + Math.random() * 4;
        x = -88 + (Math.random() - 0.5) * 50;
      }
      pAttr.setY(i, y);
      pAttr.setX(i, x);
    }
    pAttr.needsUpdate = true;
  }
}
