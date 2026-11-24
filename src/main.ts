import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import "./style.css";

const config = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#FAF6F0",
  // Phaser uses this as the renderer backing resolution. Cap DPR at 2
  // to keep text / Graphics crisp without excessive mobile GPU cost.
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 390,
    height: 844,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  input: {
    activePointers: 2,
  },
  scene: [BootScene, MenuScene, GameScene],
} as Phaser.Types.Core.GameConfig & { resolution: number };

const startGame = (): void => {
  new Phaser.Game(config);
};

if (document.fonts) {
  document.fonts.ready.then(startGame);
} else {
  startGame();
}
