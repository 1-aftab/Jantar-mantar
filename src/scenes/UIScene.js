import Phaser from 'phaser';

const C = { ink: '#392b3c', cream: '#fff1c4', orange: '#ec8a4b', red: '#df5451', teal: '#3a9878', blue: '#4568ad', gold: '#f5c85a' };

export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    this.play = this.scene.get('GameScene');
    this.state = {};
    this.makeHud();
    this.makeTouchControls();
    this.makePanels();
    this.wireEvents();
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.drawMinimap() });
  }

  wireEvents() {
    this.play.events.on('state', (state) => { this.state = state; this.updateHud(); });
    this.play.events.on('toast', (text) => this.showToast(text));
    this.play.events.on('open-missions', (data) => this.openMissions(data));
    this.play.events.on('close-panels', () => this.closeAll());
    this.play.events.on('mission-complete', (mission) => this.showCompletion(mission));
    this.play.events.on('mission-started', () => this.closeAll());
    this.play.events.on('pause-changed', (paused) => { if (paused) this.openPause(); else this.closeAll(); });
    this.play.events.on('show-help', () => this.openHelp());
  }

  makeHud() {
    // top-left status plaque
    const plaque = this.add.graphics().fillStyle(0x392b3c, .9).fillRoundedRect(16, 14, 360, 105, 15).lineStyle(2, 0xffd475, .8).strokeRoundedRect(16, 14, 360, 105, 15);
    plaque.setScrollFactor(0).setDepth(1000);
    this.titleText = this.add.text(30, 25, 'JANTAR MANTAR', { fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffe5a1' }).setScrollFactor(0).setDepth(1001);
    this.scoreText = this.add.text(31, 52, '★ 0', { fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setScrollFactor(0).setDepth(1001);
    this.chaosText = this.add.text(126, 52, 'CHAOS 12%', { fontFamily: 'sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#ffce61' }).setScrollFactor(0).setDepth(1001);
    this.chaosBar = this.add.graphics().setScrollFactor(0).setDepth(1001);
    this.staminaLabel = this.add.text(30, 83, 'SPRINT', { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#f7e8c4' }).setScrollFactor(0).setDepth(1001);
    this.staminaBar = this.add.graphics().setScrollFactor(0).setDepth(1001);

    this.missionBox = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.missionText = this.add.text(31, 136, 'NO ACTIVE MISSION\nVisit the Mission Board!', { fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#fff5d5', lineSpacing: 3, wordWrap: { width: 340 } }).setScrollFactor(0).setDepth(1001);

    this.inventoryText = this.add.text(20, 667, '🍱 0    💧 0    ☕ 0', { fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#4a3040', backgroundColor: '#ffe9b1', padding: { x: 10, y: 5 } }).setScrollFactor(0).setDepth(1001);
    this.hintText = this.add.text(640, 680, 'WASD / Arrows move • E interact • F dance • Shift sprint • Esc pause', { fontFamily: 'sans-serif', fontSize: '14px', color: '#4c3341', fontStyle: 'bold', backgroundColor: '#ffe9b1cc', padding: { x: 8, y: 4 } }).setOrigin(.5).setScrollFactor(0).setDepth(1001);

    this.mapBg = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.miniMap = this.add.graphics().setScrollFactor(0).setDepth(1001);
    this.mapLabel = this.add.text(1098, 23, 'POCKET MAP', { fontSize: '13px', fontStyle: 'bold', color: '#fff0c5' }).setScrollFactor(0).setDepth(1001);
    this.toastText = this.add.text(640, 610, '', { fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#442d3c', backgroundColor: '#fff4d0', padding: { x: 13, y: 8 }, align: 'center', wordWrap: { width: 720 } }).setOrigin(.5).setScrollFactor(0).setDepth(1200).setVisible(false);
  }

  updateHud() {
    const s = this.state;
    this.scoreText.setText(`★ ${s.score || 0}`);
    this.chaosText.setText(`CHAOS ${s.chaos || 0}%`);
    this.chaosBar.clear().fillStyle(0x553642).fillRoundedRect(235, 80, 125, 10, 5).fillStyle((s.chaos || 0) > 65 ? 0xdf5451 : 0xf5c85a).fillRoundedRect(235, 80, 1.25 * (s.chaos || 0), 10, 5);
    this.staminaBar.clear().fillStyle(0x553642).fillRoundedRect(93, 87, 126, 10, 5).fillStyle(0x6dc89b).fillRoundedRect(93, 87, 1.26 * (s.stamina || 0), 10, 5);
    const inv = s.inventory || {};
    this.inventoryText.setText(`🍱 ${inv.snack || 0}    💧 ${inv.water || 0}    ☕ ${inv.chai || 0}    🪧 ${inv.placard || 0}`);
    this.missionBox.clear().fillStyle(0x392b3c, .88).fillRoundedRect(16, 128, 360, s.mission ? 135 : 64, 14).lineStyle(2, 0xffd475, .75).strokeRoundedRect(16, 128, 360, s.mission ? 135 : 64, 14);
    if (!s.mission) {
      this.missionText.setText('NO ACTIVE MISSION\nVisit the Mission Board (south-west)!');
    } else {
      const lines = s.mission.progress.map((o) => `• ${o.type === 'deliver' ? `Deliver ${o.item}` : o.type === 'collect' ? `Collect ${o.item}` : o.type === 'return' ? `Return to ${o.target}` : o.type === 'barricade' ? 'Rearrange barricade' : o.type === 'wake' ? 'Wake Snoozy' : o.type === 'escort' ? 'Escort to First Aid' : o.type === 'guide' ? 'Guide tourist to exit' : o.type === 'dance' ? 'Recruit dance circle' : o.type === 'chaos' ? 'Reach chaos level' : 'Evade patrol'}: ${o.value}/${o.count}`).join('\n');
      this.missionText.setText(`MISSION ${s.mission.number}: ${s.mission.title}\n${lines}`);
    }
  }

  drawMinimap() {
    const p = this.play?.player;
    if (!p) return;
    const x = 1088; const y = 39; const w = 176; const h = 112;
    this.mapBg.clear().fillStyle(0x392b3c, .93).fillRoundedRect(x, y, w, h, 12).lineStyle(2, 0xffd475, .8).strokeRoundedRect(x, y, w, h, 12);
    this.miniMap.clear();
    this.miniMap.fillStyle(0xf1cf82).fillRoundedRect(x + 8, y + 8, w - 16, h - 16, 7);
    this.miniMap.fillStyle(0xdcaa69).fillRect(x + 8, y + 51, w - 16, 18).fillRect(x + 85, y + 8, 17, h - 16);
    this.miniMap.fillStyle(0xcf594d).fillRect(x + 137, y + 12, 23, 16);
    this.miniMap.fillStyle(0x519559).fillCircle(x + 35, y + 30, 4).fillCircle(x + 66, y + 82, 4).fillCircle(x + 122, y + 88, 4);
    this.miniMap.fillStyle(0xfff2a0).fillCircle(x + 8 + (p.x / 2800) * (w - 16), y + 8 + (p.y / 1800) * (h - 16), 5);
    if (this.state.mission) this.miniMap.lineStyle(2, 0xdf5451).strokeCircle(x + 148, y + 58, 4);
  }

  showToast(text) {
    this.toastText.setText(text).setAlpha(1).setVisible(true);
    if (this.toastTween) this.toastTween.stop();
    this.toastTween = this.tweens.add({ targets: this.toastText, alpha: 0, delay: 3000, duration: 500, onComplete: () => this.toastText.setVisible(false) });
  }

  button(x, y, width, height, label, callback, color = 0xe6814b, fontSize = 18) {
    const c = this.add.container(x, y).setScrollFactor(0).setDepth(2001).setSize(width, height);
    const g = this.add.graphics();
    g.fillStyle(color).fillRoundedRect(-width / 2, -height / 2, width, height, 10).lineStyle(2, 0x442d3d, .8).strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    const t = this.add.text(0, 0, label, { fontFamily: 'sans-serif', fontSize: `${fontSize}px`, fontStyle: 'bold', color: '#fff8d7', align: 'center', wordWrap: { width: width - 12 } }).setOrigin(.5);
    c.add([g, t]).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => { this.play.blip(640); callback(); });
    c.on('pointerover', () => g.setAlpha(.85)); c.on('pointerout', () => g.setAlpha(1));
    return c;
  }

  makePanels() {
    this.overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(1900).setVisible(false);
    const shade = this.add.graphics().fillStyle(0x1e1730, .72).fillRect(0, 0, 1280, 720);
    this.panel = this.add.container(640, 360);
    this.panelBg = this.add.graphics();
    this.panelBg.fillStyle(0xffefc0).fillRoundedRect(-330, -260, 660, 520, 20).lineStyle(5, 0x553542).strokeRoundedRect(-330, -260, 660, 520, 20);
    this.panel.add(this.panelBg);
    this.overlay.add([shade, this.panel]);
    this.panelChildren = [];
  }

  clearPanel() {
    this.panelChildren.forEach(child => child.destroy());
    this.panelChildren = [];
  }

  addPanel(child) { this.panel.add(child); this.panelChildren.push(child); return child; }
  panelText(x, y, text, style = {}) { return this.addPanel(this.add.text(x, y, text, { fontFamily: 'sans-serif', fontSize: '20px', color: '#3f2d3d', align: 'center', wordWrap: { width: 580 }, ...style }).setOrigin(.5)); }
  panelButton(x, y, w, h, label, cb, color, size) { const b = this.button(640 + x, 360 + y, w, h, label, cb, color, size); this.panelChildren.push(b); return b; }

  closeAll() { this.overlay.setVisible(false); this.clearPanel(); }

  openMissions(data) {
    this.overlay.setVisible(true); this.clearPanel();
    this.panelText(0, -224, 'MISSION BOARD', { fontSize: '32px', fontStyle: 'bold', color: '#d5554e' });
    this.panelText(0, -192, 'Choose the next act of peaceful, snack-powered mayhem.', { fontSize: '16px' });
    data.missions.forEach((m, i) => {
      const isDone = data.completed.includes(m.id);
      const previous = i === 0 || data.completed.includes(data.missions[i - 1].id);
      const canStart = previous && !isDone && !data.active;
      const color = isDone ? 0x5d9a75 : canStart ? 0xe6814b : 0x8b7d78;
      const label = `${isDone ? '✓ ' : ''}${m.number}. ${m.title}\n+${m.reward} points`;
      const b = this.panelButton(i % 2 ? 165 : -165, -140 + Math.floor(i / 2) * 74, 300, 62, label, () => { if (canStart) this.play.events.emit('select-mission', m.id); else this.showToast(isDone ? 'Already completed — legend status!' : 'Finish the previous mission first.'); }, color, 14);
      if (!canStart && !isDone) b.setAlpha(.7);
    });
    this.panelButton(0, 222, 145, 38, 'CLOSE', () => this.closeAll(), 0x4568ad, 16);
  }

  showCompletion(mission) {
    this.overlay.setVisible(true); this.clearPanel();
    this.panelText(0, -125, 'MISSION COMPLETE!', { fontSize: '37px', fontStyle: 'bold', color: '#d5554e' });
    this.panelText(0, -67, mission.title, { fontSize: '23px', fontStyle: 'bold' });
    this.panelText(0, -20, `+${mission.reward} POINTS\nThe crowd cheers. Someone drops a samosa in celebration.`, { fontSize: '20px', lineSpacing: 8 });
    this.panelButton(0, 110, 245, 53, 'NEXT CHAOS!', () => this.closeAll(), 0xe6814b, 20);
  }

  openPause() {
    this.overlay.setVisible(true); this.clearPanel();
    this.panelText(0, -140, 'PAUSED FOR PEACE', { fontSize: '35px', fontStyle: 'bold', color: '#d5554e' });
    this.panelText(0, -86, 'The protest will remain moderately chaotic.', { fontSize: '20px' });
    this.panelButton(0, -5, 260, 52, 'RESUME', () => this.play.togglePause(), 0xe6814b, 20);
    this.panelButton(0, 61, 260, 48, 'SETTINGS', () => this.openSettings(), 0x4568ad, 19);
    this.panelButton(0, 127, 260, 48, 'HOW TO PLAY', () => this.openHelp(), 0x5d9a75, 19);
  }

  openSettings() {
    this.overlay.setVisible(true); this.clearPanel();
    this.panelText(0, -160, 'SETTINGS', { fontSize: '34px', fontStyle: 'bold', color: '#d5554e' });
    const settings = { ...this.play.settings };
    const refresh = () => {
      this.clearPanel();
      this.panelText(0, -160, 'SETTINGS', { fontSize: '34px', fontStyle: 'bold', color: '#d5554e' });
      [['music', 'MUSIC'], ['sfx', 'SOUND EFFECTS'], ['shake', 'SUBTLE SCREEN SHAKE']].forEach(([key, label], index) => {
        this.panelText(-100, -74 + index * 65, label, { fontSize: '20px', fontStyle: 'bold' });
        this.panelButton(155, -74 + index * 65, 150, 43, settings[key] ? 'ON' : 'OFF', () => { settings[key] = !settings[key]; this.play.events.emit('settings-changed', settings); refresh(); }, settings[key] ? 0x5d9a75 : 0x8b7d78, 18);
      });
      this.panelButton(0, 150, 170, 45, 'BACK', () => this.openPause(), 0x4568ad, 18);
    };
    refresh();
  }

  openHelp() {
    this.overlay.setVisible(true); this.clearPanel();
    this.panelText(0, -192, 'HOW TO CAUSE HELPFUL MAYHEM', { fontSize: '29px', fontStyle: 'bold', color: '#d5554e' });
    this.panelText(0, -65, 'Move with WASD or arrow keys. On mobile, drag anywhere in the large MOVE ring; hold RUN to sprint.\n\nTap once to enable music and effects, then use ACT beside people, supplies, barricades, bushes, and the Mission Board. Press F or DANCE beside colourful crowd clusters.\n\nHigher chaos brings funnier events — and longer police chases. Hide in the bush to lose patrols. Complete missions in order and your save stays on this device.', { fontSize: '19px', lineSpacing: 7 });
    this.panelButton(0, 180, 200, 47, 'GOT IT!', () => this.closeAll(), 0xe6814b, 19);
  }

  makeTouchControls() {
    // A capture-based stick: it keeps tracking after the thumb leaves the ring, unlike a normal Phaser button.
    this.touch = this.add.container(0, 0).setScrollFactor(0).setDepth(1500).setAlpha(.94);
    const baseX = 132; const baseY = 574; const radius = 82; const deadZone = 13;
    this.joystick = { baseX, baseY, radius, pointerId: null };
    const halo = this.add.circle(baseX, baseY, radius + 10, 0xffd46d, .12).setStrokeStyle(2, 0xffedb0, .34);
    const base = this.add.circle(baseX, baseY, radius, 0x252f52, .74).setStrokeStyle(5, 0xffdc7a, .95);
    const inner = this.add.circle(baseX, baseY, 52, 0x4863a3, .28).setStrokeStyle(2, 0xd7ecff, .48);
    const stick = this.add.circle(baseX, baseY, 32, 0xffc957, 1).setStrokeStyle(4, 0x4e3443, .9);
    const glint = this.add.circle(baseX - 10, baseY - 11, 8, 0xffffff, .36);
    const moveLabel = this.add.text(baseX, baseY + 108, 'MOVE', { fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#fff3c6', stroke: '#422f42', strokeThickness: 3 }).setOrigin(.5);
    this.touch.add([halo, base, inner, stick, glint, moveLabel]);
    this.tweens.add({ targets: halo, scale: 1.08, alpha: .05, duration: 950, yoyo: true, repeat: -1 });

    const updateStick = (pointer) => {
      const dx = pointer.x - baseX; const dy = pointer.y - baseY; const length = Math.hypot(dx, dy);
      const capped = Math.min(radius, length);
      const ux = length ? dx / length : 0; const uy = length ? dy / length : 0;
      stick.setPosition(baseX + ux * capped, baseY + uy * capped);
      glint.setPosition(stick.x - 10, stick.y - 11);
      const strength = length <= deadZone ? 0 : Math.min(1, (length - deadZone) / (radius - deadZone));
      this.play.events.emit('mobile-move', { x: ux * strength, y: uy * strength });
    };
    const resetStick = () => {
      this.joystick.pointerId = null;
      this.tweens.add({ targets: [stick, glint], x: baseX, y: baseY, duration: 105, ease: 'Quad.out', onUpdate: (_, target) => {
        if (target === glint) target.setPosition(stick.x - 10, stick.y - 11);
      } });
      this.play.events.emit('mobile-move', { x: 0, y: 0 });
    };
    this.input.on('pointerdown', (pointer) => {
      if (this.overlay?.visible || this.joystick.pointerId !== null) return;
      if (pointer.x < 340 && pointer.y > 390) { this.joystick.pointerId = pointer.id; updateStick(pointer); }
    });
    this.input.on('pointermove', (pointer) => { if (pointer.id === this.joystick.pointerId) updateStick(pointer); });
    this.input.on('pointerup', (pointer) => { if (pointer.id === this.joystick.pointerId) resetStick(); });
    this.input.on('pointerupoutside', (pointer) => { if (pointer.id === this.joystick.pointerId) resetStick(); });

    const touchButton = (x, y, r, label, event, color, hold = false) => {
      const c = this.add.container(x, y).setSize(r * 2, r * 2);
      const ring = this.add.circle(0, 0, r + 6, 0xffffff, .14);
      const b = this.add.circle(0, 0, r, color, .98).setStrokeStyle(4, 0x442d3d, .9).setInteractive({ useHandCursor: true });
      const shine = this.add.circle(-r * .25, -r * .28, r * .23, 0xffffff, .18);
      const t = this.add.text(0, 1, label, { fontFamily: 'sans-serif', fontSize: r > 42 ? '18px' : '15px', fontStyle: 'bold', color: '#fff9db', align: 'center', stroke: '#463044', strokeThickness: 2 }).setOrigin(.5);
      c.add([ring, b, shine, t]); this.touch.add(c);
      const release = () => { c.setScale(1); if (hold) this.play.events.emit('mobile-sprint', false); };
      b.on('pointerdown', (pointer) => { pointer.event?.stopPropagation?.(); c.setScale(.87); if (hold) this.play.events.emit('mobile-sprint', true); else this.play.events.emit('mobile-action', event); });
      b.on('pointerup', release); b.on('pointerout', release);
      if (hold) this.input.on('pointerup', release);
      return c;
    };
    touchButton(1165, 564, 58, 'ACT\nE', 'interact', 0xe6814b);
    touchButton(1051, 630, 46, 'DANCE\nF', 'dance', 0xd04d83);
    touchButton(1228, 661, 38, 'HOLD\nRUN', 'sprint', 0x398b70, true);
    touchButton(1232, 53, 29, 'II', 'pause', 0x4568ad);
  }
}
