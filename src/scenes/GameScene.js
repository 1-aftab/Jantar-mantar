import Phaser from 'phaser';
import { MISSIONS, findMission } from '../game/missions.js';
import { loadSave, writeSave } from '../game/SaveManager.js';

const W = 2800;
const H = 1800;
const clamp = Phaser.Math.Clamp;
const distance = Phaser.Math.Distance.Between;

const DIALOGUE = {
  volunteer: ["We have supplies, yaar! Just not a GPS.", "Good energy. Very suspiciously good energy."],
  hungry: ["My stomach is doing a dharna of its own.", "One snack, one democracy, please."],
  chaiUncle: ["My chai kettle has gone on a solo protest!", "Without chai, even my slogans whisper."],
  sleepy: ["Five more minutes… for the cause…", "I can walk. I think. Is that a tent?"],
  tourist: ["Is this the queue for the historical monument?", "Oh! This is not a flash mob?"],
  dancer: ["My feet have submitted a dance petition!", "Beat drop, slogan up!"],
  police: ["Please move along. Preferably not through that tent.", "No running! Unless it is toward snacks."],
};

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.save = loadSave();
    this.settings = this.save.settings;
    this.score = this.save.score || 0;
    this.chaos = 12;
    this.stamina = 100;
    this.inventory = { snack: 0, water: 0, chai: 0, banner: 0, placard: 0 };
    this.activeMission = null;
    this.progress = {};
    this.paused = false;
    this.hidden = false;
    this.chaseTime = 0;
    this.hasEvaded = false;
    this.eventTimer = 12000;
    this.ambientTimer = 0;
    this.currentMessage = '';
    this.missionObjects = { dance: new Set(), barricade: new Set() };

    this.physics.world.setBounds(0, 0, W, H);
    this.drawGround();
    this.solids = this.physics.add.staticGroup();
    this.barriers = this.physics.add.group({ immovable: true, allowGravity: false });
    this.items = this.physics.add.group({ allowGravity: false, immovable: true });
    this.people = this.physics.add.group({ allowGravity: false, immovable: true });
    this.police = this.physics.add.group({ allowGravity: false, immovable: true });
    this.buildGround();
    this.createPlayer();
    this.createNPCs();
    this.createPolice();
    this.createItems();
    this.createControls();
    this.createWorldLabels();
    this.createParticles();

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.barriers);
    this.physics.add.collider(this.police, this.solids);
    this.physics.add.collider(this.police, this.barriers);
    this.physics.add.overlap(this.player, this.police, () => this.onCaught());

    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.05);
    this.cameras.main.setBackgroundColor('#f6d98b');

    this.input.keyboard.on('keydown-E', () => this.interact());
    this.input.keyboard.on('keydown-SPACE', () => this.interact());
    this.input.keyboard.on('keydown-F', () => this.dance());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.on('pointerdown', (pointer) => {
      if (!pointer.wasTouch) return;
      // A short tap in the play area is a contextual action on mobile.
      if (pointer.duration < 220) this.interact();
    });
    this.events.on('mobile-action', (action) => {
      if (action === 'interact') this.interact();
      if (action === 'dance') this.dance();
      if (action === 'pause') this.togglePause();
      if (action === 'sprint') this.mobileSprint = !this.mobileSprint;
    });
    this.events.on('mobile-move', (movement) => { this.mobileMovement = movement; });
    this.events.on('select-mission', (id) => this.startMission(id));
    this.events.on('settings-changed', (settings) => { this.settings = settings; this.save.settings = settings; writeSave(this.save); });

    this.time.delayedCall(500, () => {
      this.say(this.volunteer, "Welcome to Jantar Mantar! Visit the Mission Board, hero.");
      if (!this.save.seenIntro) {
        this.save.seenIntro = true;
        writeSave(this.save);
        this.events.emit('show-help');
      }
      this.emitState();
    });
  }

  drawGround() {
    const g = this.add.graphics();
    g.fillStyle(0xf6d98b).fillRect(0, 0, W, H);
    g.fillStyle(0xe9cb7d).fillRoundedRect(80, 720, 2640, 230, 22);
    g.fillStyle(0xe6c273).fillRoundedRect(1290, 80, 260, 1640, 22);
    // hand-painted paving marks
    for (let x = 120; x < W; x += 95) {
      for (let y = 100; y < H; y += 85) {
        const wobble = ((x * 7 + y * 3) % 5) * 0.02;
        g.fillStyle(0xc99a5e, 0.11 + wobble).fillCircle(x + (y % 29), y, 2);
      }
    }
    g.lineStyle(6, 0xd6aa68, 0.45).strokeRoundedRect(80, 720, 2640, 230, 22);
    // stage carpet
    g.fillStyle(0xce584c).fillRoundedRect(2180, 130, 420, 225, 18);
    g.fillStyle(0xffdf79).fillRect(2205, 155, 370, 42);
    g.fillStyle(0x5d3b43).fillRect(2220, 205, 335, 125);
    this.add.text(2390, 170, 'SLOGAN STAGE', { fontFamily: 'sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#5d3b43' }).setOrigin(.5).setDepth(1);
  }

  addSolid(key, x, y, label, scale = 1) {
    const o = this.solids.create(x, y, key).setScale(scale).refreshBody();
    o.setDepth(y / 100);
    o.setData('label', label);
    return o;
  }

  buildGround() {
    // Fixed decorations and collision anchors.
    [[350, 420], [650, 390], [960, 270], [230, 1160], [630, 1430], [1060, 1510], [1530, 1370], [1940, 1510], [2600, 1310], [2670, 550], [1810, 420]].forEach(([x, y]) => this.addSolid('tree', x, y, 'tree'));
    [[350, 260], [530, 270], [815, 420], [970, 430], [420, 1390], [760, 1370], [1550, 1210], [1870, 1290]].forEach(([x, y], i) => this.addSolid('tent', x, y, `tent ${i + 1}`));
    this.addSolid('stall', 900, 930, 'Snack Stall');
    this.addSolid('stall', 1450, 1010, 'Water Cooler');
    this.addSolid('stall', 1960, 820, 'First Aid Camp');
    this.addSolid('stall', 520, 950, 'Chai Stall');
    // board is visual/interactable rather than solid so it is easy to access
    this.missionBoard = this.add.container(220, 690).setDepth(8);
    const board = this.add.graphics();
    board.fillStyle(0x714a3e).fillRoundedRect(-55, -47, 110, 92, 8);
    board.fillStyle(0xffeab7).fillRoundedRect(-47, -39, 94, 76, 4);
    board.lineStyle(3, 0x51363b).strokeRoundedRect(-55, -47, 110, 92, 8);
    this.missionBoard.add([board, this.add.text(0, -9, 'MISSION\nBOARD', { fontSize: '16px', fontStyle: 'bold', align: 'center', color: '#593941' }).setOrigin(.5)]);
    this.missionBoard.setData('kind', 'board').setData('label', 'Mission Board');

    [[1170, 815], [1235, 815], [1300, 815]].forEach(([x, y], idx) => {
      const b = this.barriers.create(x, y, 'barricade').setDepth(y / 100).setData('kind', 'barricade').setData('label', 'Confused Barricade').setData('id', idx).setData('used', false);
      b.body.setSize(54, 28).setOffset(1, 12);
    });
    // hiding nook, obvious bush sign.
    const hide = this.add.container(2450, 1200).setDepth(12);
    const hg = this.add.graphics();
    hg.fillStyle(0x4a975b).fillCircle(-20, 0, 23).fillCircle(4, -8, 28).fillCircle(27, 5, 22);
    hg.lineStyle(3, 0x2f6e45).strokeCircle(4, -8, 28);
    hide.add([hg, this.add.text(4, 42, 'HIDE', { fontSize: '14px', color: '#31513a', fontStyle: 'bold' }).setOrigin(.5)]);
    hide.setData('kind', 'hide').setData('label', 'Hiding Bush');
    this.hideSpot = hide;
    // Mission landmarks are target zones only.
    this.aidZone = { x: 1960, y: 875, label: 'First Aid Camp' };
    this.exitZone = { x: 2680, y: 820, label: 'Metro Exit' };
    this.stageZone = { x: 2390, y: 265, label: 'Slogan Stage' };
  }

  createPlayer() {
    this.playerShadow = this.add.image(320, 820, 'shadow').setDepth(8);
    this.player = this.physics.add.sprite(320, 810, 'player').setDepth(10).setCollideWorldBounds(true);
    this.player.body.setSize(28, 25).setOffset(10, 21);
    this.player.setData('label', 'You');
  }

  createNPC(key, x, y, kind, name, text) {
    const npc = this.people.create(x, y, key).setDepth(y / 100).setData('kind', kind).setData('name', name).setData('text', text).setData('baseX', x).setData('baseY', y).setData('phase', Math.random() * 6.2).setData('helped', false);
    npc.body.setSize(28, 25).setOffset(10, 21);
    return npc;
  }

  createNPCs() {
    this.volunteer = this.createNPC('npc-volunteer', 325, 710, 'volunteer', 'Ravi the Volunteer', 'volunteer');
    this.chaiUncle = this.createNPC('npc-chai', 580, 900, 'chaiUncle', 'Chai Uncle', 'chaiUncle');
    this.sleepy = this.createNPC('npc-sleepy', 920, 1500, 'sleepy', 'Snoozy', 'sleepy');
    this.sleepy.setTint(0x9b9b9b);
    this.tourist = this.createNPC('npc-tourist', 2280, 890, 'tourist', 'Maya the Tourist', 'tourist');
    this.tourist.setData('following', false);
    const hungryPositions = [[720, 960], [1050, 1040], [1600, 850], [1730, 1040], [720, 1170], [2150, 740], [1790, 570]];
    this.hungry = hungryPositions.map(([x, y], i) => this.createNPC(i % 2 ? 'npc-hungry' : 'npc-volunteer', x, y, 'hungry', `Hungry Friend ${i + 1}`, 'hungry'));
    this.dancers = [[1530, 610], [1860, 700], [2210, 500], [1060, 620]].map(([x, y], i) => this.createNPC('npc-dancer', x, y, 'dancer', `Dance Captain ${i + 1}`, 'dancer'));
    // a cinematic, no-collision crowd that makes the protest ground feel populated
    const crowd = [[300, 1040], [420, 1090], [560, 1120], [760, 610], [910, 650], [1110, 510], [1360, 620], [1530, 500], [1710, 640], [1990, 570], [2220, 690], [2430, 610], [2130, 1080], [1960, 1120]];
    crowd.forEach(([x, y], i) => this.createNPC(i % 3 === 0 ? 'npc-dancer' : i % 3 === 1 ? 'npc-volunteer' : 'npc-hungry', x, y, 'crowd', 'Protester', 'dancer'));
  }

  createPolice() {
    const paths = [
      [[1500, 330], [1910, 330], [1910, 640], [1500, 640]],
      [[2430, 1040], [2660, 1040], [2660, 1420], [2300, 1420]],
      [[900, 1120], [1170, 1120], [1170, 1420], [850, 1420]]
    ];
    paths.forEach((path, index) => {
      const p = this.police.create(path[0][0], path[0][1], 'police').setDepth(10).setData('kind', 'police').setData('path', path).setData('pathIndex', 1).setData('chasing', false).setData('lost', 0);
      p.body.setSize(28, 25).setOffset(10, 21);
      p.setData('name', `Officer ${index + 1}`);
    });
  }

  createItem(key, x, y, kind, label) {
    const item = this.items.create(x, y, key).setDepth(y / 100).setData('kind', kind).setData('label', label).setData('homeX', x).setData('homeY', y).setData('taken', false);
    item.body.setCircle(17, 7, 7);
    return item;
  }

  createItems() {
    [[820, 860], [850, 1020], [760, 870], [1000, 900], [620, 1010], [950, 1140]].forEach(([x, y]) => this.createItem('food', x, y, 'snack', 'Snack Parcel'));
    [[1420, 930], [1510, 930], [1410, 1090], [1510, 1100], [1630, 980], [1340, 1000], [1480, 1180]].forEach(([x, y]) => this.createItem('water', x, y, 'water', 'Water Bottle'));
    this.chaiItem = this.createItem('chai', 740, 1490, 'chai', 'Missing Chai Kettle');
    this.bannerItem = this.createItem('banner', 1180, 390, 'banner', 'Runaway Banner');
    [[1290, 490], [1370, 500], [1450, 490], [1330, 550], [1410, 560]].forEach(([x, y]) => this.createItem('placard', x, y, 'placard', 'Lost Placard'));
  }

  createWorldLabels() {
    const labels = [
      [900, 875, 'SNACK\nSTATION'], [1450, 955, 'WATER\nCOOLERS'], [520, 895, 'CHAI\nCORNER'], [1960, 780, 'FIRST AID'], [2680, 770, 'METRO\nEXIT']
    ];
    labels.forEach(([x, y, txt]) => this.add.text(x, y, txt, { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', align: 'center', color: '#663e42', stroke: '#ffe5a8', strokeThickness: 3 }).setOrigin(.5).setDepth(5));
  }

  createParticles() {
    this.sparkEmitter = this.add.particles(0, 0, 'spark', { speed: { min: 30, max: 120 }, scale: { start: .9, end: 0 }, lifespan: 600, quantity: 0, emitting: false, blendMode: 'ADD' }).setDepth(100);
  }

  createControls() {
    this.keys = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', up2: 'UP', down2: 'DOWN', left2: 'LEFT', right2: 'RIGHT', sprint: 'SHIFT' });
    this.mobileMovement = { x: 0, y: 0 };
    this.mobileSprint = false;
  }

  update(_, delta) {
    if (this.paused) return;
    this.updatePlayer(delta);
    this.updateNPCs(delta);
    this.updatePolice(delta);
    this.updateEscort();
    this.updateItems();
    this.updateRandomEvents(delta);
    this.playerShadow.setPosition(this.player.x, this.player.y + 18);
    this.playerShadow.setDepth(this.player.depth - .1);
    if (this.activeMission?.id === 'final' && this.chaos >= 80 && this.hasEvaded) this.checkCompletion();
    this.ambientTimer += delta;
    if (this.ambientTimer > 250) { this.ambientTimer = 0; this.emitState(); }
  }

  updatePlayer(delta) {
    if (this.hidden) { this.player.setVelocity(0); return; }
    let x = (this.keys.left.isDown ? -1 : 0) + (this.keys.right.isDown ? 1 : 0) + (this.keys.left2.isDown ? -1 : 0) + (this.keys.right2.isDown ? 1 : 0) + this.mobileMovement.x;
    let y = (this.keys.up.isDown ? -1 : 0) + (this.keys.down.isDown ? 1 : 0) + (this.keys.up2.isDown ? -1 : 0) + (this.keys.down2.isDown ? 1 : 0) + this.mobileMovement.y;
    const moving = x !== 0 || y !== 0;
    if (moving) { const len = Math.hypot(x, y); x /= len; y /= len; }
    const sprinting = (this.keys.sprint.isDown || this.mobileSprint) && moving && this.stamina > 1;
    const speed = sprinting ? 270 : 175;
    this.player.setVelocity(x * speed, y * speed);
    this.player.setFlipX(x < 0);
    if (sprinting) this.stamina = clamp(this.stamina - delta * .024, 0, 100);
    else this.stamina = clamp(this.stamina + delta * .017, 0, 100);
    if (moving) this.player.y += Math.sin(this.time.now / 80) * .12;
  }

  updateNPCs(delta) {
    this.people.getChildren().forEach((npc) => {
      if (!npc.active) return;
      const kind = npc.getData('kind');
      if (kind === 'crowd' || kind === 'dancer') {
        const phase = npc.getData('phase');
        npc.y = npc.getData('baseY') + Math.sin(this.time.now / 700 + phase) * 5;
        npc.setDepth(npc.y / 100);
      }
    });
  }

  updatePolice(delta) {
    let anyChasing = false;
    this.police.getChildren().forEach((officer) => {
      const seesPlayer = !this.hidden && distance(officer.x, officer.y, this.player.x, this.player.y) < (this.chaos > 55 ? 450 : 210);
      if (seesPlayer) officer.setData('chasing', true);
      if (officer.getData('chasing')) {
        if (seesPlayer) {
          officer.setData('lost', 0);
          this.moveOfficer(officer, this.player.x, this.player.y, 155 + Math.min(this.chaos, 60));
          anyChasing = true;
        } else {
          officer.setData('lost', officer.getData('lost') + delta);
          if (officer.getData('lost') > 3400) {
            officer.setData('chasing', false);
            if (this.chaseTime > 1500) { this.hasEvaded = true; this.bumpProgress('evade', 1); this.toast('Escaped the patrol! Smooth moves.'); }
            this.chaseTime = 0;
          } else {
            officer.setVelocity(0);
          }
        }
      } else {
        const path = officer.getData('path');
        let index = officer.getData('pathIndex');
        const target = path[index];
        this.moveOfficer(officer, target[0], target[1], 75);
        if (distance(officer.x, officer.y, target[0], target[1]) < 12) officer.setData('pathIndex', (index + 1) % path.length);
      }
      officer.setFlipX(officer.body.velocity.x < 0);
      officer.setDepth(officer.y / 100);
    });
    if (anyChasing) this.chaseTime += delta;
  }

  moveOfficer(officer, x, y, speed) {
    let dx = x - officer.x; let dy = y - officer.y;
    // small steering offset gives patrols a practical, cheap obstacle avoidance behaviour.
    const aheadX = officer.x + Math.sign(dx) * 24;
    const aheadY = officer.y + Math.sign(dy) * 24;
    this.solids.getChildren().concat(this.barriers.getChildren()).forEach((wall) => {
      if (distance(aheadX, aheadY, wall.x, wall.y) < 55) { dx += (officer.y - wall.y) * 1.6; dy += (wall.x - officer.x) * 1.6; }
    });
    const length = Math.hypot(dx, dy) || 1;
    officer.setVelocity((dx / length) * speed, (dy / length) * speed);
  }

  updateEscort() {
    if (this.sleepy.getData('following')) this.follow(this.sleepy, 55);
    if (this.tourist.getData('following')) this.follow(this.tourist, 65);
    if (this.sleepy.getData('following') && distance(this.sleepy.x, this.sleepy.y, this.aidZone.x, this.aidZone.y) < 85) {
      this.sleepy.setData('following', false); this.sleepy.setData('helped', true); this.bumpProgress('escort', 1); this.say(this.sleepy, 'I made it! I am awake-ish.');
    }
    if (this.tourist.getData('following') && distance(this.tourist.x, this.tourist.y, this.exitZone.x, this.exitZone.y) < 85) {
      this.tourist.setData('following', false); this.tourist.setData('helped', true); this.bumpProgress('guide', 1); this.say(this.tourist, 'Metro! The true monument was friendship.');
    }
  }

  follow(npc, trailing) {
    const d = distance(npc.x, npc.y, this.player.x, this.player.y);
    if (d > trailing) this.physics.moveToObject(npc, this.player, 125);
    else npc.setVelocity(0);
    npc.setDepth(npc.y / 100);
  }

  updateItems() {
    this.items.getChildren().forEach((item) => {
      if (!item.active || item.getData('taken')) return;
      item.y = item.getData('homeY') + Math.sin(this.time.now / 480 + item.x) * 4;
      item.setDepth(item.y / 100);
    });
  }

  updateRandomEvents(delta) {
    this.eventTimer -= delta;
    if (this.eventTimer > 0) return;
    this.eventTimer = Phaser.Math.Between(16000, 25000);
    const events = [
      () => { this.addChaos(6); this.toast('☕ RANDOM EVENT: Missing chai rumour! Everyone looks under a placard.'); },
      () => { this.addChaos(-4); this.toast('🥘 RANDOM EVENT: A volunteer found emergency samosas. Peace briefly returns.'); },
      () => { this.addChaos(9); this.toast('📹 RANDOM EVENT: Amateur cameraman shouts “one more take!”'); },
      () => { this.addChaos(5); this.toast('🕺 RANDOM EVENT: A dance circle appears near the stage!'); this.dancers.forEach(d => d.setTint(0xffdc68)); },
      () => { this.addChaos(3); this.toast('🧭 RANDOM EVENT: Two tourists argue about which tent is the monument.'); }
    ];
    Phaser.Utils.Array.GetRandom(events)();
  }

  nearestInteractable() {
    const entries = [];
    entries.push(this.missionBoard, this.hideSpot, ...this.items.getChildren(), ...this.barriers.getChildren(), ...this.people.getChildren());
    return entries.filter((o) => o?.active !== false && distance(this.player.x, this.player.y, o.x, o.y) < 88).sort((a, b) => distance(this.player.x, this.player.y, a.x, a.y) - distance(this.player.x, this.player.y, b.x, b.y))[0];
  }

  interact() {
    if (this.paused) return;
    if (this.hidden) { this.hidden = false; this.player.setVisible(true); this.toast('You step out. Try not to moonwalk into a patrol.'); return; }
    if (this.activeMission?.id === 'banner' && this.inventory.banner > 0 && distance(this.player.x, this.player.y, this.stageZone.x, this.stageZone.y) < 185) {
      this.returnBanner();
      return;
    }
    const target = this.nearestInteractable();
    if (!target) { this.toast('Nothing close enough. Try the Mission Board or a person with a !'); return; }
    const kind = target.getData('kind');
    if (kind === 'board') { this.events.emit('open-missions', { missions: MISSIONS, completed: this.save.completed, active: this.activeMission?.id }); return; }
    if (kind === 'hide') { this.hidden = true; this.player.setVelocity(0).setVisible(false); this.toast('Hidden! Patrols lose track after a moment. Press E to exit.'); return; }
    if (['snack', 'water', 'chai', 'banner', 'placard'].includes(kind)) return this.pickup(target);
    if (kind === 'barricade') return this.handleBarricade(target);
    if (kind === 'hungry') return this.feed(target);
    if (kind === 'sleepy') return this.helpSleepy(target);
    if (kind === 'tourist') return this.helpTourist(target);
    if (['dancer', 'crowd', 'volunteer', 'chaiUncle', 'police'].includes(kind)) return this.talk(target);
  }

  pickup(item) {
    const kind = item.getData('kind');
    if ((kind === 'chai' && this.activeMission?.id !== 'chai') || (kind === 'banner' && this.activeMission?.id !== 'banner') || (kind === 'placard' && this.activeMission?.id !== 'cleanup')) {
      this.toast(`${item.getData('label')}: maybe a later mission needs this.`); return;
    }
    this.inventory[kind] = (this.inventory[kind] || 0) + 1;
    item.setData('taken', true).disableBody(true, true);
    this.spark(item.x, item.y, 10);
    this.blip(560);
    this.toast(`Picked up ${item.getData('label')}!`);
    this.bumpProgress('collect', 1, kind);
    // Supply crates renew so the world cannot become unwinnable.
    if (kind === 'snack' || kind === 'water') this.time.delayedCall(15000, () => { item.setData('taken', false).enableBody(false, item.getData('homeX'), item.getData('homeY'), true, true); });
    this.emitState();
  }

  feed(npc) {
    if (npc.getData('helped')) { this.say(npc, 'Thanks again! My slogans have seasoning now.'); return; }
    // In Mission 1 the crowd first needs three snack parcels, then water; later the water mission is water-only.
    const snackGoalDone = this.objectiveProgress({ type: 'deliver', item: 'snack' }) >= 3;
    const wantsWater = this.activeMission?.id === 'water' || (this.activeMission?.id === 'feed' && snackGoalDone);
    const supply = wantsWater ? 'water' : 'snack';
    if (this.inventory[supply] < 1) { this.say(npc, wantsWater ? 'Water, please! Even my slogan is dry.' : 'A snack parcel would be legendary.'); return; }
    this.inventory[supply]--;
    npc.setData('helped', true).setTint(0xa7e985);
    this.addChaos(-3); this.score += 25;
    this.bumpProgress('deliver', 1, supply);
    this.say(npc, wantsWater ? 'Hydration achieved! Democracy flows.' : 'Bless this snack and its mysterious chutney.');
    this.spark(npc.x, npc.y - 10, 14); this.blip(720); this.emitState();
  }

  handleBarricade(barricade) {
    if (this.activeMission?.id !== 'barricade') { this.toast('It is movable, but the Barricade mission keeps the paperwork happy.'); return; }
    if (barricade.getData('used')) { this.toast('This barricade has already been re-confused.'); return; }
    barricade.setData('used', true);
    const dx = barricade.x < 1270 ? -95 : 95;
    this.tweens.add({ targets: barricade, x: barricade.x + dx, angle: barricade.x < 1270 ? -12 : 12, duration: 500, ease: 'Back.out', onComplete: () => barricade.body.reset(barricade.x, barricade.y) });
    this.addChaos(7); this.score += 30; this.bumpProgress('barricade', 1);
    this.toast('Barricade moved. It looks even less certain now.'); this.spark(barricade.x, barricade.y, 8); this.blip(320);
  }

  helpSleepy(npc) {
    if (this.activeMission?.id !== 'sleepy') { this.say(npc, 'I am saving my awake minutes for a mission.'); return; }
    if (!npc.getData('awake')) { npc.setData('awake', true).setData('following', true).clearTint(); this.bumpProgress('wake', 1); this.say(npc, 'Huh? Is lunch over? I will follow you.'); this.addChaos(2); }
    else this.say(npc, 'I am following. At least, my feet are.');
  }

  helpTourist(npc) {
    if (this.activeMission?.id !== 'tourist') { this.say(npc, 'I am looking for the monument-shaped Metro station.'); return; }
    if (!npc.getData('following') && !npc.getData('helped')) { npc.setData('following', true); this.say(npc, 'A guide! Excellent. I will not take pictures of barricades now.'); }
  }

  talk(npc) {
    const kind = npc.getData('kind');
    if (kind === 'chaiUncle' && this.activeMission?.id === 'chai' && this.inventory.chai > 0) {
      this.inventory.chai--; this.bumpProgress('return', 1, 'chaiUncle'); this.score += 60; this.addChaos(-9); this.say(npc, 'The kettle returns! National stability restored.'); this.spark(npc.x, npc.y, 18); this.emitState(); return;
    }
    if (kind === 'volunteer' && this.activeMission?.id === 'banner' && this.inventory.banner > 0 && distance(npc.x, npc.y, this.stageZone.x, this.stageZone.y) < 9999) { /* stage handled below */ }
    const line = Phaser.Utils.Array.GetRandom(DIALOGUE[npc.getData('text')] || ['A very important protest thing is happening.']);
    this.say(npc, line);
    if (kind === 'police') this.addChaos(-1);
    // Return banner when player speaks at stage-adjacent volunteer crowd.
    if (this.activeMission?.id === 'banner' && this.inventory.banner > 0 && distance(this.player.x, this.player.y, this.stageZone.x, this.stageZone.y) < 180) this.returnBanner();
  }

  returnBanner() {
    this.inventory.banner--; this.bumpProgress('return', 1, 'stage'); this.score += 70; this.addChaos(-4); this.toast('Banner reattached! It says: “POLITE MAYHEM ONLY.”'); this.spark(this.stageZone.x, this.stageZone.y, 20); this.emitState();
  }

  dance() {
    if (this.paused || this.hidden) return;
    this.player.setTint(0xffdf6c);
    this.tweens.add({ targets: this.player, angle: 360, scaleX: 1.18, scaleY: 1.18, duration: 430, yoyo: true, onComplete: () => this.player.clearTint().setAngle(0).setScale(1) });
    this.spark(this.player.x, this.player.y, 24); this.addChaos(9); this.blip(840);
    const closeDancer = this.dancers.filter(d => distance(this.player.x, this.player.y, d.x, d.y) < 160 && !this.missionObjects.dance.has(d));
    if (closeDancer.length) {
      const dancer = closeDancer[0]; this.missionObjects.dance.add(dancer); dancer.setTint(0xffe16a); this.tweens.add({ targets: dancer, y: dancer.y - 12, duration: 160, yoyo: true, repeat: 4 });
      this.bumpProgress('dance', 1); this.say(dancer, 'Aiyo! Dance circle activated!');
    } else if (this.activeMission?.id === 'final' && distance(this.player.x, this.player.y, this.stageZone.x, this.stageZone.y) < 180) {
      this.bumpProgress('dance', 1); this.toast('Grand finale dance circle: certified chaotic.');
    } else this.toast('You dance bravely. Find a crowd cluster to recruit people!');
  }

  bumpProgress(type, amount = 1, item) {
    if (!this.activeMission) return;
    const relevant = this.activeMission.objectives.find((o) => o.type === type && (!o.item || o.item === item) && (!o.target || o.target === item));
    if (!relevant) return;
    const key = `${type}:${relevant.item || relevant.target || 'any'}`;
    this.progress[key] = Math.min(relevant.count, (this.progress[key] || 0) + amount);
    this.emitState();
    this.checkCompletion();
  }

  objectiveProgress(objective) { return this.progress[`${objective.type}:${objective.item || objective.target || 'any'}`] || 0; }

  addChaos(amount) {
    this.chaos = clamp(this.chaos + amount, 0, 100);
    this.save.bestChaos = Math.max(this.save.bestChaos || 0, this.chaos);
    if (this.activeMission?.id === 'final' && amount > 0) this.bumpProgress('chaos', 1); // corrected beneath
    if (this.activeMission?.id === 'final') {
      const objective = this.activeMission.objectives.find(o => o.type === 'chaos');
      const key = 'chaos:any'; this.progress[key] = Math.max(this.progress[key] || 0, Math.min(objective.count, this.chaos));
      this.checkCompletion();
    }
    this.emitState();
  }

  startMission(id) {
    const mission = findMission(id);
    if (!mission || this.activeMission) return;
    const index = MISSIONS.findIndex(m => m.id === id);
    const unlocked = index === 0 || this.save.completed.includes(MISSIONS[index - 1]?.id);
    if (!unlocked) { this.toast('Complete the previous mission first. The board enjoys bureaucracy.'); return; }
    if (this.save.completed.includes(id)) { this.toast('Already completed! Your legend is on the board.'); return; }
    this.activeMission = mission;
    this.progress = {};
    if (id === 'water') this.hungry.forEach((npc) => npc.setData('helped', false).clearTint());
    this.missionObjects.dance.clear(); this.missionObjects.barricade.clear();
    this.events.emit('close-panels');
    this.toast(`MISSION START: ${mission.title}`);
    this.events.emit('mission-started', mission);
    this.emitState();
  }

  checkCompletion() {
    if (!this.activeMission) return;
    const done = this.activeMission.objectives.every((objective) => this.objectiveProgress(objective) >= objective.count);
    if (!done) return;
    const mission = this.activeMission;
    this.activeMission = null;
    this.score += mission.reward;
    this.addChaos(-12);
    this.save.score = this.score;
    if (!this.save.completed.includes(mission.id)) this.save.completed.push(mission.id);
    writeSave(this.save);
    this.events.emit('mission-complete', mission);
    this.toast(`MISSION COMPLETE! +${mission.reward} points — ${mission.title}`);
    this.blip(980); this.emitState();
  }

  onCaught() {
    if (this.hidden || this.catchCooldown) return;
    this.catchCooldown = true;
    this.player.setVelocity(0); this.player.setPosition(320, 810);
    this.addChaos(-16); this.score = Math.max(0, this.score - 20); this.stamina = 55;
    this.toast('🚨 Patrol timeout! You are gently returned to the Mission Board.');
    if (this.settings.shake) this.cameras.main.shake(130, .005);
    this.time.delayedCall(1800, () => { this.catchCooldown = false; });
  }

  say(npc, text) {
    if (npc.bubble) npc.bubble.destroy();
    const bubble = this.add.text(npc.x, npc.y - 48, text, { fontFamily: 'sans-serif', fontSize: '15px', color: '#432d3d', backgroundColor: '#fff4d3', padding: { x: 9, y: 6 }, wordWrap: { width: 210 }, align: 'center' }).setOrigin(.5, 1).setDepth(100);
    npc.bubble = bubble;
    this.tweens.add({ targets: bubble, y: bubble.y - 10, alpha: 0, delay: 2800, duration: 350, onComplete: () => bubble.destroy() });
  }

  toast(text) { this.currentMessage = text; this.events.emit('toast', text); }
  spark(x, y, quantity) { this.sparkEmitter.explode(quantity, x, y); if (this.settings.shake) this.cameras.main.shake(70, .002); }

  blip(frequency = 520) {
    if (!this.settings.sfx) return;
    try {
      const ctx = this.sound.context || new AudioContext();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = frequency; osc.type = 'triangle'; gain.gain.setValueAtTime(.035, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .09);
      osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .1);
    } catch { /* mobile browsers can defer audio until a gesture */ }
  }

  togglePause() {
    this.paused = !this.paused;
    this.player.setVelocity(0);
    this.events.emit('pause-changed', this.paused);
  }

  handleBackButton() {
    if (this.paused) this.togglePause();
    else this.togglePause();
  }

  emitState() {
    this.events.emit('state', {
      score: this.score, chaos: Math.round(this.chaos), stamina: Math.round(this.stamina), inventory: { ...this.inventory },
      mission: this.activeMission ? { ...this.activeMission, progress: this.activeMission.objectives.map(o => ({ ...o, value: this.objectiveProgress(o) })) } : null,
      message: this.currentMessage, completed: this.save.completed, bestChaos: this.save.bestChaos || 0
    });
  }
}
