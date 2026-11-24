import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import "./style.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#0b1220",
    scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 390,
    height: 844,
    min: { width: 320, height: 568 },
    max: { width: 540, height: 1000 },
  },
  render: {
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    pixelArt: false,
    roundPixels: true,
  },
  input: {
    activePointers: 2,
  },
  scene: [BootScene, MenuScene, GameScene],
};

new Phaser.Game(config);
