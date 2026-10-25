import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
  // Canvas keeps the app lightweight; a capped high-DPI backing store makes modern phones crisp without exhausting GPU memory.
  type: Phaser.CANVAS,
  parent: 'game',
  backgroundColor: '#f6d98b',
  pixelArt: false,
  antialias: true,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  render: { antialias: true, roundPixels: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, GameScene, UIScene]
};

const game = new Phaser.Game(config);

// Android back should close menus first, never silently discard a mission.
document.addEventListener('backbutton', (event) => {
  event.preventDefault();
  const play = game.scene.getScene('GameScene');
  if (play?.scene.isActive()) play.handleBackButton();
}, false);
