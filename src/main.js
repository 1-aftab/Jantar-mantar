import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#f6d98b',
  pixelArt: false,
  antialias: true,
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
