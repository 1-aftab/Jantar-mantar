import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // One original painted environment plate, bundled with the game for offline play.
    this.load.image('plaza-bg', 'assets/protest-plaza-background.png');
  }

  create() {
    this.makeTextures();
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  texture(key, draw, w = 48, h = 48) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    draw(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeTextures() {
    this.texture('player', (g) => {
      g.fillStyle(0x51394c, .22).fillEllipse(24, 43, 34, 7);
      g.fillStyle(0x202a4e).fillRoundedRect(9, 21, 30, 21, 8);
      g.fillStyle(0x415e9f).fillRoundedRect(12, 24, 24, 15, 6);
      g.fillStyle(0xef5951).fillRoundedRect(6, 24, 8, 13, 4).fillRoundedRect(35, 24, 8, 13, 4);
      g.fillStyle(0x172644).fillRoundedRect(13, 39, 9, 6, 3).fillRoundedRect(27, 39, 9, 6, 3);
      g.fillStyle(0xe9a16c).fillCircle(24, 16, 11);
      g.fillStyle(0xfae0bc).fillCircle(21, 17, 2).fillCircle(29, 17, 2);
      g.fillStyle(0x283150).fillRoundedRect(10, 4, 28, 13, 7);
      g.fillStyle(0x5f75ba).fillRoundedRect(13, 5, 21, 4, 2);
      g.fillStyle(0x593846).fillRect(21, 20, 6, 2);
      g.lineStyle(1.5, 0x30273e, .8).strokeRoundedRect(9, 21, 30, 21, 8);
    });

    const npc = (key, shirt, skin, hair, accent) => this.texture(key, (g) => {
      g.fillStyle(0x51394c, .19).fillEllipse(24, 43, 32, 7);
      g.fillStyle(shirt).fillRoundedRect(10, 22, 28, 20, 8);
      g.fillStyle(accent).fillRoundedRect(13, 25, 22, 5, 3);
      g.fillStyle(skin).fillCircle(24, 16, 10.5);
      g.fillStyle(hair).fillRoundedRect(12, 4, 24, 10, 6);
      g.fillStyle(0xffe7c5, .6).fillCircle(20, 16, 1.7).fillCircle(28, 16, 1.7);
      g.fillStyle(0x33263c).fillCircle(20, 16, 1).fillCircle(28, 16, 1).fillRect(21, 20, 6, 1.5);
      g.fillStyle(0xffffff, .42).fillCircle(17, 27, 2);
      g.lineStyle(1.4, 0x3f3043, .75).strokeRoundedRect(10, 22, 28, 20, 8);
    });
    npc('npc-volunteer', 0x218c73, 0xd99061, 0x4a2d28, 0xe9d766);
    npc('npc-hungry', 0xef9134, 0x9c5e42, 0x352b31, 0xffd76c);
    npc('npc-sleepy', 0x7357a8, 0xd99061, 0x26354f, 0xa88ddb);
    npc('npc-tourist', 0x3e94c5, 0xf0b879, 0xb8753c, 0x83d1f0);
    npc('npc-chai', 0xbd543d, 0x8e5239, 0xe8e1ce, 0xffc45a);
    npc('npc-dancer', 0xd9477b, 0xf0b879, 0x29243a, 0xffba68);
    npc('police', 0x425f9b, 0xc98761, 0x17294f, 0x9ec3ed);

    this.texture('tent', (g) => {
      g.fillStyle(0x51394c, .22).fillEllipse(26, 45, 43, 7);
      g.fillStyle(0x6e4650).fillRoundedRect(7, 30, 38, 16, 3);
      g.fillStyle(0xf8e6be).fillTriangle(2, 33, 24, 3, 46, 33);
      g.fillStyle(0xd64d4b).fillTriangle(24, 3, 46, 33, 35, 33);
      g.fillStyle(0xffc45c).fillTriangle(24, 3, 14, 33, 25, 33);
      g.fillStyle(0x4b3941).fillRoundedRect(20, 31, 9, 15, 2);
      g.fillStyle(0xffe7a2).fillCircle(24, 22, 2.3);
      g.lineStyle(2, 0x543a42).strokeTriangle(2, 33, 24, 3, 46, 33).strokeRoundedRect(7, 30, 38, 16, 3);
    }, 52, 50);

    this.texture('stall', (g) => {
      g.fillStyle(0x51394c, .22).fillEllipse(24, 46, 42, 6);
      g.fillStyle(0xd85e42).fillRoundedRect(3, 14, 42, 30, 3);
      g.fillStyle(0x6d4239).fillRect(7, 30, 34, 8);
      g.fillStyle(0xffd567).fillTriangle(0, 14, 24, 2, 48, 14);
      [5, 13, 21, 29, 37].forEach((x) => g.fillStyle(x % 16 ? 0xf3e5ba : 0xd6524e).fillTriangle(x, 13, x + 4, 7, x + 8, 13));
      g.fillStyle(0xffe6a4).fillCircle(14, 26, 3).fillCircle(24, 25, 3).fillCircle(34, 26, 3);
      g.lineStyle(2, 0x573941).strokeRoundedRect(3, 14, 42, 30, 3);
    }, 52, 50);

    this.texture('barricade', (g) => {
      g.fillStyle(0x51394c, .22).fillEllipse(28, 43, 47, 6);
      g.fillStyle(0x4a3b40).fillRoundedRect(8, 30, 7, 15, 2).fillRoundedRect(41, 30, 7, 15, 2);
      g.fillStyle(0xf6a925).fillRoundedRect(2, 13, 52, 20, 4);
      g.fillStyle(0xffdc54).fillRoundedRect(4, 16, 48, 5, 2);
      g.fillStyle(0x563e40).fillRect(8, 24, 40, 4);
      g.lineStyle(2, 0x523d3e).strokeRoundedRect(2, 13, 52, 20, 4);
    }, 56, 48);

    this.texture('tree', (g) => {
      g.fillStyle(0x51394c, .2).fillEllipse(25, 47, 40, 7);
      g.fillStyle(0x704d3b).fillRoundedRect(20, 27, 10, 22, 4);
      g.fillStyle(0x9b6a42).fillRect(24, 25, 3, 20);
      g.fillStyle(0x397b47).fillCircle(24, 17, 19).fillCircle(13, 26, 12).fillCircle(35, 27, 13);
      g.fillStyle(0x58a85b).fillCircle(19, 13, 10).fillCircle(32, 18, 12).fillCircle(13, 23, 8);
      g.fillStyle(0x8dc66a).fillCircle(20, 11, 3).fillCircle(33, 19, 3).fillCircle(12, 24, 2);
      g.lineStyle(1.5, 0x28643d).strokeCircle(24, 17, 19);
    }, 52, 52);

    this.texture('food', (g) => {
      g.fillStyle(0x51394c, .2).fillEllipse(24, 40, 31, 5);
      g.fillStyle(0xf9dc92).fillRoundedRect(5, 12, 37, 27, 7);
      g.fillStyle(0xe16349).fillCircle(17, 25, 7).fillStyle(0x4a9d66).fillCircle(30, 24, 6);
      g.fillStyle(0xfff1c0).fillCircle(21, 18, 3).fillStyle(0xffffff, .6).fillCircle(14, 18, 2);
      g.lineStyle(1.5, 0x7a5146).strokeRoundedRect(5, 12, 37, 27, 7);
    });
    this.texture('water', (g) => {
      g.fillStyle(0x51394c, .2).fillEllipse(24, 41, 19, 5);
      g.fillStyle(0x3aa9d8).fillRoundedRect(15, 8, 18, 34, 5);
      g.fillStyle(0xe8f8ff).fillRoundedRect(18, 16, 12, 13, 3).fillStyle(0x84d7ee).fillRect(19, 21, 10, 4);
      g.fillStyle(0x2670a7).fillRoundedRect(19, 5, 10, 7, 2).fillStyle(0xffffff, .5).fillRect(18, 11, 3, 22);
      g.lineStyle(1.2, 0x276991).strokeRoundedRect(15, 8, 18, 34, 5);
    });
    this.texture('chai', (g) => {
      g.fillStyle(0x51394c, .2).fillEllipse(24, 40, 28, 5);
      g.fillStyle(0x79503d).fillRoundedRect(10, 18, 27, 19, 6);
      g.fillStyle(0xf9d567).fillRoundedRect(15, 13, 17, 8, 3).fillStyle(0xfff0c2).fillRect(17, 17, 12, 2);
      g.lineStyle(3, 0x79503d).strokeCircle(38, 27, 8).lineStyle(1.2, 0x4e393b).strokeRoundedRect(10, 18, 27, 19, 6);
    });
    this.texture('banner', (g) => {
      g.fillStyle(0x51394c, .2).fillEllipse(24, 41, 26, 5);
      g.fillStyle(0xd84755).fillRoundedRect(6, 10, 37, 28, 3).fillStyle(0xffe796).fillRect(10, 18, 28, 4).fillRect(10, 27, 20, 3);
      g.fillStyle(0x704048).fillRect(5, 9, 3, 32).lineStyle(1.5, 0x703b47).strokeRoundedRect(6, 10, 37, 28, 3);
    });
    this.texture('placard', (g) => {
      g.fillStyle(0x51394c, .2).fillEllipse(24, 42, 23, 5);
      g.fillStyle(0x90644b).fillRoundedRect(22, 25, 5, 20, 2);
      g.fillStyle(0xffebad).fillRoundedRect(6, 5, 36, 25, 4);
      g.fillStyle(0xc85a4d).fillRoundedRect(12, 12, 23, 3, 1).fillStyle(0x65474a).fillRoundedRect(15, 19, 17, 2, 1);
      g.lineStyle(1.3, 0x6f4944).strokeRoundedRect(6, 5, 36, 25, 4);
    });
    this.texture('spark', (g) => { g.fillStyle(0xffdf52).fillCircle(8, 8, 7).fillStyle(0xffffff, .7).fillCircle(6, 6, 2); }, 16, 16);
    this.texture('shadow', (g) => { g.fillStyle(0x39283a, .22).fillEllipse(24, 35, 34, 9); }, 48, 48);
  }
}
