export class InputSystem {
  constructor({ canvasContainer, joystickZone, joystickKnob, primaryBtn, secondaryBtn }) {
    this.moveX = 0; // -1..1 (right positive)
    this.moveY = 0; // -1..1 (forward/up negative in screen coords -> we normalize to +1 = forward)
    this.cameraYaw = 0;
    this.cameraPitch = 0.62; // cozy angled top-down
    this.cameraYawMin = null;
    this.cameraYawMax = null;
    this.isPrimaryHeld = false;
    this.primaryPointerId = null;
    this.sneakToggle = false;

    this.keys = new Set();
    this.joyActive = false;
    this.joyPointerId = null;
    this.joyOrigin = { x: 0, y: 0 };
    this.joyVec = { x: 0, y: 0 };
    this.maxJoyRadius = 42;

    this.dragPointerId = null;
    this.dragLastX = 0;
    this.dragLastY = 0;

    this.primaryBtn = primaryBtn;
    this.secondaryBtn = secondaryBtn;

    this.callbacks = {
      onPrimaryDown: () => {},
      onPrimaryUp: () => {},
      onSecondaryPress: () => {},
      onToolKey: () => {},
      onShortcut: () => {}
    };

    this._bindGlobalTouchGuard();
    this._bindJoystick(joystickZone, joystickKnob);
    this._bindCameraDrag(canvasContainer);
    this._bindActionButtons(primaryBtn, secondaryBtn);
    this._bindKeyboard();
    this._bindLifecycleResets();
  }

  on(event, fn) {
    this.callbacks[event] = fn;
  }

  isSneaking() {
    return this.sneakToggle || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.keys.has('KeyC');
  }

  toggleSneak() {
    this.sneakToggle = !this.sneakToggle;
    return this.sneakToggle;
  }

  setSneak(val) {
    this.sneakToggle = Boolean(val);
  }

  setCameraYawLimits(min = null, max = null) {
    this.cameraYawMin = min;
    this.cameraYawMax = max;
    if (this.cameraYawMin !== null && this.cameraYawMax !== null) {
      this.cameraYaw = Math.max(this.cameraYawMin, Math.min(this.cameraYawMax, this.cameraYaw));
    }
  }

  /**
   * Resets all in-flight touch/pointer/keyboard states (e.g. on blur, app switch, or modal open).
   */
  resetAll() {
    this.keys.clear();
    if (this._resetJoystick) this._resetJoystick();
    this.dragPointerId = null;
    this._releasePrimary();
    if (this.secondaryBtn) this.secondaryBtn.classList.remove('pressed');
  }

  /**
   * Binds a real-time HUD button with zero-delay pointerdown and touch/dblclick zoom guards.
   */
  bindInstantButton(el, onPress) {
    if (!el) return;
    const prevent = e => e.preventDefault();
    el.addEventListener('touchstart', prevent, { passive: false });
    el.addEventListener('touchend', prevent, { passive: false });
    el.addEventListener('dblclick', prevent);

    let activePointerId = null;
    const clearPressed = e => {
      if (e && typeof e.pointerId === 'number' && activePointerId !== null && e.pointerId !== activePointerId) {
        return;
      }
      activePointerId = null;
      el.classList.remove('pressed');
    };

    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      activePointerId = e.pointerId;
      el.classList.add('pressed');
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointer events in tests may not support capture
      }
      onPress(e);
    });
    el.addEventListener('pointerup', clearPressed);
    el.addEventListener('pointercancel', clearPressed);
    el.addEventListener('lostpointercapture', () => {
      activePointerId = null;
      el.classList.remove('pressed');
    });
  }

  _bindGlobalTouchGuard() {
    const prevent = e => e.preventDefault();
    document.addEventListener('gesturestart', prevent, { passive: false });
    document.addEventListener('gesturechange', prevent, { passive: false });
    document.addEventListener('gestureend', prevent, { passive: false });
    document.addEventListener('dblclick', prevent);

    // Block multi-touch pinch-zoom while keeping single-finger clicks & modal scroll working
    document.addEventListener(
      'touchstart',
      e => {
        if (e.touches.length > 1) e.preventDefault();
      },
      { passive: false }
    );
    document.addEventListener(
      'touchmove',
      e => {
        if (e.touches.length > 1 || (typeof e.scale === 'number' && e.scale !== 1)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  _guardTouchSurface(el) {
    const prevent = e => e.preventDefault();
    for (const type of ['touchstart', 'touchmove', 'touchend']) {
      el.addEventListener(type, prevent, { passive: false });
    }
    el.addEventListener('dblclick', prevent);
  }

  _bindJoystick(zone, knob) {
    this.joystickKnob = knob;
    this._guardTouchSurface(zone);

    const updateKnob = (dx, dy) => {
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, this.maxJoyRadius);
      const ang = Math.atan2(dy, dx);
      const kx = Math.cos(ang) * clamped;
      const ky = Math.sin(ang) * clamped;
      knob.style.transform = `translate(${kx}px, ${ky}px)`;
      const norm = clamped / this.maxJoyRadius;
      this.joyVec.x = Math.cos(ang) * norm;
      this.joyVec.y = Math.sin(ang) * norm;
    };

    const resetKnob = () => {
      this.joyActive = false;
      this.joyPointerId = null;
      this.joyVec.x = 0;
      this.joyVec.y = 0;
      knob.style.transform = 'translate(0px, 0px)';
    };
    this._resetJoystick = resetKnob;

    zone.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (this.joyPointerId !== null) return;
      e.preventDefault();
      e.stopPropagation();
      this.joyPointerId = e.pointerId;
      this.joyActive = true;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Fallback to window pointermove/pointerup listeners
      }
      const rect = zone.getBoundingClientRect();
      this.joyOrigin.x = rect.left + rect.width / 2;
      this.joyOrigin.y = rect.top + rect.height / 2;
      updateKnob(e.clientX - this.joyOrigin.x, e.clientY - this.joyOrigin.y);
    });

    const moveHandler = e => {
      if (e.pointerId !== this.joyPointerId) return;
      e.preventDefault();
      updateKnob(e.clientX - this.joyOrigin.x, e.clientY - this.joyOrigin.y);
    };
    zone.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointermove', moveHandler);

    const endHandler = e => {
      if (e.pointerId !== this.joyPointerId) return;
      resetKnob();
    };
    zone.addEventListener('pointerup', endHandler);
    zone.addEventListener('pointercancel', endHandler);
    zone.addEventListener('lostpointercapture', () => {
      if (this.joyPointerId !== null) resetKnob();
    });
    window.addEventListener('pointerup', endHandler);
    window.addEventListener('pointercancel', endHandler);
  }

  _bindCameraDrag(container) {
    this._guardTouchSurface(container);

    container.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (this.dragPointerId !== null) return;
      e.preventDefault();
      this.dragPointerId = e.pointerId;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      try {
        container.setPointerCapture(e.pointerId);
      } catch {
        // Fallback to window listeners
      }
    });

    window.addEventListener('pointermove', e => {
      if (e.pointerId !== this.dragPointerId) return;
      const dx = e.clientX - this.dragLastX;
      const dy = e.clientY - this.dragLastY;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      this.cameraYaw -= dx * 0.0062;
      if (this.cameraYawMin !== null && this.cameraYawMax !== null) {
        this.cameraYaw = Math.max(this.cameraYawMin, Math.min(this.cameraYawMax, this.cameraYaw));
      }
      this.cameraPitch = Math.max(0.36, Math.min(0.95, this.cameraPitch + dy * 0.0032));
    });

    const stopDrag = e => {
      if (e.pointerId === this.dragPointerId) this.dragPointerId = null;
    };
    container.addEventListener('pointerup', stopDrag);
    container.addEventListener('pointercancel', stopDrag);
    container.addEventListener('lostpointercapture', () => {
      this.dragPointerId = null;
    });
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
  }

  _releasePrimary() {
    this.primaryPointerId = null;
    if (!this.isPrimaryHeld) {
      if (this.primaryBtn) this.primaryBtn.classList.remove('pressed');
      return;
    }
    this.isPrimaryHeld = false;
    if (this.primaryBtn) this.primaryBtn.classList.remove('pressed');
    this.callbacks.onPrimaryUp();
  }

  _bindActionButtons(primaryBtn, secondaryBtn) {
    const prevent = e => e.preventDefault();
    primaryBtn.addEventListener('touchstart', prevent, { passive: false });
    primaryBtn.addEventListener('touchend', prevent, { passive: false });
    primaryBtn.addEventListener('dblclick', prevent);

    const pDown = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (this.primaryPointerId !== null) return;
      this.primaryPointerId = e.pointerId;
      try {
        primaryBtn.setPointerCapture(e.pointerId);
      } catch {
        // Fallback to window pointerup/pointercancel
      }
      this.isPrimaryHeld = true;
      primaryBtn.classList.add('pressed');
      this.callbacks.onPrimaryDown();
    };

    const pUp = e => {
      if (this.primaryPointerId === null || e.pointerId !== this.primaryPointerId) return;
      this._releasePrimary();
    };

    primaryBtn.addEventListener('pointerdown', pDown);
    primaryBtn.addEventListener('pointerup', pUp);
    primaryBtn.addEventListener('pointercancel', pUp);
    primaryBtn.addEventListener('lostpointercapture', () => {
      if (this.primaryPointerId !== null) this._releasePrimary();
    });
    window.addEventListener('pointerup', pUp);
    window.addEventListener('pointercancel', pUp);

    this.bindInstantButton(secondaryBtn, () => {
      this.callbacks.onSecondaryPress();
    });
  }

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const code = e.code;
      const wasDown = this.keys.has(code);
      this.keys.add(code);

      if (!wasDown) {
        if (code === 'Space' || code === 'KeyE') {
          e.preventDefault();
          this.isPrimaryHeld = true;
          this.callbacks.onPrimaryDown();
        } else if (code === 'KeyF') {
          this.callbacks.onSecondaryPress();
        } else if (code === 'KeyR') {
          this.callbacks.onShortcut('rotate');
        } else if (code === 'Digit1') {
          this.callbacks.onToolKey('hand');
        } else if (code === 'Digit2') {
          this.callbacks.onToolKey('rod');
        } else if (code === 'Digit3') {
          this.callbacks.onToolKey('net');
        } else if (code === 'KeyB') {
          this.callbacks.onShortcut('bag');
        } else if (code === 'KeyN') {
          this.callbacks.onShortcut('dex');
        } else if (code === 'KeyQ') {
          this.callbacks.onShortcut('quests');
        } else if (code === 'KeyM') {
          this.callbacks.onShortcut('map');
        } else if (code === 'Escape') {
          this.callbacks.onShortcut('close');
        }
      }
    });

    window.addEventListener('keyup', e => {
      this.keys.delete(e.code);
      if (e.code === 'Space' || e.code === 'KeyE') {
        if (this.isPrimaryHeld && this.primaryPointerId === null) {
          this.isPrimaryHeld = false;
          this.callbacks.onPrimaryUp();
        }
      }
    });
  }

  _bindLifecycleResets() {
    window.addEventListener('blur', () => this.resetAll());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetAll();
    });
  }

  /**
   * Computes camera-relative world movement vector { x, z, mag }.
   */
  getMoveVector(yaw = this.cameraYaw) {
    let sx = this.joyVec.x;
    let sy = this.joyVec.y;

    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) sx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) sx += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) sy -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) sy += 1;

    const mag = Math.min(1, Math.hypot(sx, sy));
    if (mag < 0.08) return { x: 0, z: 0, mag: 0 };

    const nx = sx / Math.hypot(sx, sy);
    const ny = sy / Math.hypot(sx, sy);

    // Rotate screen vector by active camera yaw so "up" always moves away from camera
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const wx = nx * cos + ny * sin;
    const wz = -nx * sin + ny * cos;

    return { x: wx * mag, z: wz * mag, mag };
  }
}
