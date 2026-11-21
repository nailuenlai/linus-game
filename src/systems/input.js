export class InputSystem {
  constructor({ canvasContainer, joystickZone, joystickKnob, primaryBtn, secondaryBtn }) {
    this.moveX = 0; // -1..1 (right positive)
    this.moveY = 0; // -1..1 (forward/up negative in screen coords -> we normalize to +1 = forward)
    this.cameraYaw = 0;
    this.cameraPitch = 0.62; // cozy angled top-down
    this.isPrimaryHeld = false;
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

    this.callbacks = {
      onPrimaryDown: () => {},
      onPrimaryUp: () => {},
      onSecondaryPress: () => {},
      onToolKey: () => {},
      onShortcut: () => {}
    };

    this._bindJoystick(joystickZone, joystickKnob);
    this._bindCameraDrag(canvasContainer);
    this._bindActionButtons(primaryBtn, secondaryBtn);
    this._bindKeyboard();
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

  _bindJoystick(zone, knob) {
    this.joystickKnob = knob;
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

    zone.addEventListener('pointerdown', e => {
      if (this.joyPointerId !== null) return;
      e.preventDefault();
      e.stopPropagation();
      this.joyPointerId = e.pointerId;
      this.joyActive = true;
      zone.setPointerCapture(e.pointerId);
      const rect = zone.getBoundingClientRect();
      this.joyOrigin.x = rect.left + rect.width / 2;
      this.joyOrigin.y = rect.top + rect.height / 2;
      updateKnob(e.clientX - this.joyOrigin.x, e.clientY - this.joyOrigin.y);
    });

    zone.addEventListener('pointermove', e => {
      if (e.pointerId !== this.joyPointerId) return;
      e.preventDefault();
      updateKnob(e.clientX - this.joyOrigin.x, e.clientY - this.joyOrigin.y);
    });

    const endHandler = e => {
      if (e.pointerId !== this.joyPointerId) return;
      resetKnob();
    };
    zone.addEventListener('pointerup', endHandler);
    zone.addEventListener('pointercancel', endHandler);
  }

  _bindCameraDrag(container) {
    container.addEventListener('pointerdown', e => {
      if (this.dragPointerId !== null) return;
      this.dragPointerId = e.pointerId;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
    });

    window.addEventListener('pointermove', e => {
      if (e.pointerId !== this.dragPointerId) return;
      const dx = e.clientX - this.dragLastX;
      const dy = e.clientY - this.dragLastY;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      this.cameraYaw -= dx * 0.0062;
      this.cameraPitch = Math.max(0.36, Math.min(0.95, this.cameraPitch + dy * 0.0032));
    });

    const stopDrag = e => {
      if (e.pointerId === this.dragPointerId) this.dragPointerId = null;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
  }

  _bindActionButtons(primaryBtn, secondaryBtn) {
    const pDown = e => {
      e.preventDefault();
      this.isPrimaryHeld = true;
      primaryBtn.classList.add('pressed');
      this.callbacks.onPrimaryDown();
    };
    const pUp = () => {
      if (!this.isPrimaryHeld) return;
      this.isPrimaryHeld = false;
      primaryBtn.classList.remove('pressed');
      this.callbacks.onPrimaryUp();
    };

    primaryBtn.addEventListener('pointerdown', pDown);
    window.addEventListener('pointerup', pUp);
    window.addEventListener('pointercancel', pUp);

    secondaryBtn.addEventListener('click', e => {
      e.preventDefault();
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
        if (this.isPrimaryHeld) {
          this.isPrimaryHeld = false;
          this.callbacks.onPrimaryUp();
        }
      }
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.isPrimaryHeld = false;
    });
  }

  /**
   * Computes camera-relative world movement vector { x, z, mag }.
   */
  getMoveVector() {
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

    // Rotate screen vector by cameraYaw so "up" always moves away from camera
    const cos = Math.cos(this.cameraYaw);
    const sin = Math.sin(this.cameraYaw);
    const wx = nx * cos + ny * sin;
    const wz = -nx * sin + ny * cos;

    return { x: wx * mag, z: wz * mag, mag };
  }
}
