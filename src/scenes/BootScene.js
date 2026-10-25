import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

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
      g.fillStyle(0x2b355c).fillRoundedRect(10, 20, 28, 23, 8);
      g.fillStyle(0xf2a56f).fillCircle(24, 16, 11);
      g.fillStyle(0x23314a).fillRoundedRect(11, 3, 27, 13, 7);
      g.fillStyle(0xffffff).fillCircle(20, 16, 2).fillCircle(28, 16, 2);
      g.fillStyle(0xef534e).fillRect(7, 25, 5, 15).fillRect(36, 25, 5, 15);
    });
    const npc = (key, shirt, skin, hair) => this.texture(key, (g) => {
      g.fillStyle(shirt).fillRoundedRect(11, 22, 26, 21, 8);
      g.fillStyle(skin).fillCircle(24, 16, 10);
      g.fillStyle(hair).fillRoundedRect(13, 4, 22, 10, 5);
      g.fillStyle(0x30263b).fillCircle(20, 16, 1.7).fillCircle(28, 16, 1.7);
    });
    npc('npc-volunteer', 0x2f9e78, 0xd99061, 0x4a2d28);
    npc('npc-hungry', 0xf2a83b, 0x9c5e42, 0x352b31);
    npc('npc-sleepy', 0x7963a8, 0xd99061, 0x26354f);
    npc('npc-tourist', 0x3f97c9, 0xf0b879, 0xb8753c);
    npc('npc-chai', 0xc65b3f, 0x8e5239, 0xe8e1ce);
    npc('npc-dancer', 0xe6558a, 0xf0b879, 0x29243a);
    npc('police', 0x5065a8, 0xc98761, 0x182b55);

    this.texture('tent', (g) => {
      g.fillStyle(0xf8e7bd).fillTriangle(2, 35, 24, 2, 46, 35);
      g.fillStyle(0xd34e47).fillTriangle(24, 2, 46, 35, 37, 35);
      g.fillStyle(0x68454c).fillRect(9, 35, 30, 11).fillRect(20, 29, 8, 17);
      g.lineStyle(2, 0x583e49).strokeTriangle(2, 35, 24, 2, 46, 35);
    }, 52, 50);
    this.texture('stall', (g) => {
      g.fillStyle(0xea754f).fillRect(3, 13, 42, 32);
      g.fillStyle(0xffd55e).fillTriangle(0, 13, 24, 2, 48, 13);
      g.fillStyle(0x603d38).fillRect(8, 27, 32, 5);
      g.lineStyle(2, 0x5b3b3d).strokeRect(3, 13, 42, 32);
    }, 52, 50);
    this.texture('barricade', (g) => {
      g.fillStyle(0xf8a92d).fillRoundedRect(3, 14, 50, 19, 3);
      g.fillStyle(0x443740).fillRect(9, 32, 7, 14).fillRect(40, 32, 7, 14);
      g.fillStyle(0x533e3b).fillRect(8, 18, 40, 4);
      g.lineStyle(2, 0x523d3e).strokeRoundedRect(3, 14, 50, 19, 3);
    }, 56, 48);
    this.texture('tree', (g) => {
      g.fillStyle(0x70523d).fillRect(21, 29, 8, 20);
      g.fillStyle(0x4b995c).fillCircle(24, 19, 18).fillCircle(14, 26, 12).fillCircle(34, 27, 12);
      g.lineStyle(2, 0x287243).strokeCircle(24, 19, 18);
    }, 52, 52);
    this.texture('food', (g) => { g.fillStyle(0xf8e0a1).fillRoundedRect(5, 12, 37, 28, 6); g.fillStyle(0xdb5c43).fillCircle(18, 26, 7); g.fillStyle(0x4e9d69).fillCircle(31, 24, 6); }, 48, 48);
    this.texture('water', (g) => { g.fillStyle(0x4bb7df).fillRoundedRect(15, 8, 18, 34, 5); g.fillStyle(0xe8f6ff).fillRect(18, 15, 12, 14); g.fillStyle(0x2e7ec0).fillRect(19, 5, 10, 6); }, 48, 48);
    this.texture('chai', (g) => { g.fillStyle(0x78513e).fillRoundedRect(10, 18, 27, 20, 6); g.lineStyle(3, 0x78513e).strokeCircle(38, 27, 8); g.fillStyle(0xf6d36b).fillRect(15, 13, 16, 7); }, 48, 48);
    this.texture('banner', (g) => { g.fillStyle(0xdf5354).fillRect(6, 11, 37, 27); g.fillStyle(0xffe9a4).fillRect(10, 18, 28, 4); g.lineStyle(2, 0x743a42).strokeRect(6, 11, 37, 27); }, 48, 48);
    this.texture('placard', (g) => { g.fillStyle(0x90644b).fillRect(22, 25, 4, 20); g.fillStyle(0xffecab).fillRoundedRect(6, 5, 36, 25, 3); g.fillStyle(0x6f4944).fillRect(12, 13, 23, 3); }, 48, 48);
    this.texture('spark', (g) => { g.fillStyle(0xffde52).fillCircle(8, 8, 7); }, 16, 16);
    this.texture('shadow', (g) => { g.fillStyle(0x5b3d36, .18).fillEllipse(24, 35, 34, 10); }, 48, 48);
  }
}
