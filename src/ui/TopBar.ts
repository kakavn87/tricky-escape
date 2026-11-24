import Phaser from "phaser";
import { getSafeArea } from "./SafeArea";
import type { SafeArea } from "./SafeArea";

const COLORS = {
  ink: 0x2d2424,
  cream: 0xfff8ef,
  yellow: 0xffd93d,
  yellowLight: 0xffffe08,
  shadow: 0x2d2424,
};

export type TopBarOptions = {
  level: number;
  onMenu: () => void;
  onHint: () => void;
};

export class TopBar extends Phaser.GameObjects.Container {
  private readonly level: number;
  private readonly onMenu: () => void;
  private readonly onHint: () => void;

  private menuButton!: Phaser.GameObjects.Container;
  private levelBadge!: Phaser.GameObjects.Container;
  private hintButton!: Phaser.GameObjects.Container;
  private safeArea!: SafeArea;

  constructor(scene: Phaser.Scene, options: TopBarOptions) {
    super(scene, 0, 0);

    this.level = options.level;
    this.onMenu = options.onMenu;
    this.onHint = options.onHint;

    scene.add.existing(this);
    this.setDepth(1000);

    this.build();
    this.layout();

    scene.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private build(): void {
    this.menuButton = this.createButton(56, 50);
    this.menuButton.add(this.createMenuIcon());
    this.menuButton.setInteractive(
      new Phaser.Geom.Rectangle(-28, -25, 56, 50),
      Phaser.Geom.Rectangle.Contains,
    );
    this.menuButton.on("pointerup", this.onMenu);

    this.levelBadge = this.createButton(132, 42);
    const label = this.scene.add.text(0, 0, `LEVEL ${String(this.level).padStart(2, "0")}`, {
      fontFamily: "Fredoka",
      fontSize: "18px",
      fontStyle: "700",
      color: "#2D2424",
      letterSpacing: 1.4,
    }).setOrigin(0.5);
    this.levelBadge.add(label);

    this.hintButton = this.createButton(56, 50);
    this.hintButton.add(this.createBulbIcon());
    this.hintButton.setInteractive(
      new Phaser.Geom.Rectangle(-28, -25, 56, 50),
      Phaser.Geom.Rectangle.Contains,
    );
    this.hintButton.on("pointerup", this.onHint);

    this.add([this.menuButton, this.levelBadge, this.hintButton]);
  }

  private createButton(width: number, height: number): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(COLORS.shadow, 0.18);
    shadow.fillRoundedRect(-width / 2 + 2, -height / 2 + 4, width, height, 14);

    const surface = this.scene.add.graphics();
    surface.fillStyle(COLORS.cream, 1);
    surface.fillRoundedRect(-width / 2, -height / 2, width, height, 14);
    surface.lineStyle(3, COLORS.ink, 1);
    surface.strokeRoundedRect(-width / 2, -height / 2, width, height, 14);

    button.add([shadow, surface]);
    return button;
  }

  private createMenuIcon(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.lineStyle(3, COLORS.ink, 1);
    g.beginPath();
    g.moveTo(-10, -8);
    g.lineTo(10, -8);
    g.moveTo(-10, 0);
    g.lineTo(10, 0);
    g.moveTo(-10, 8);
    g.lineTo(10, 8);
    g.strokePath();

    return g;
  }

  private createBulbIcon(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();

    g.fillStyle(COLORS.yellow, 1);
    g.fillCircle(0, -2, 10);
    g.lineStyle(3, COLORS.ink, 1);
    g.strokeCircle(0, -2, 10);

    g.lineStyle(3, COLORS.ink, 1);
    g.beginPath();
    g.moveTo(-5, 8);
    g.lineTo(-4, 13);
    g.lineTo(4, 13);
    g.lineTo(5, 8);
    g.strokePath();

    g.lineStyle(2, COLORS.ink, 1);
    g.beginPath();
    g.moveTo(-3, 16);
    g.lineTo(3, 16);
    g.strokePath();

    g.lineStyle(2, COLORS.yellowLight, 1);
    g.beginPath();
    g.moveTo(0, -18);
    g.lineTo(0, -13);
    g.moveTo(-14, -10);
    g.lineTo(-10, -7);
    g.moveTo(14, -10);
    g.lineTo(10, -7);
    g.strokePath();

    return g;
  }

  private layout(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.safeArea = getSafeArea(width, height);

    const horizontalInset = Math.max(18, this.safeArea.left - 2);
    const top = Math.max(38, this.safeArea.top - 34);

    this.menuButton.setPosition(horizontalInset + 28, top);
    this.levelBadge.setPosition(this.safeArea.centerX, top);
    this.hintButton.setPosition(width - horizontalInset - 28, top);
  }

  private handleResize(): void {
    this.layout();
  }

  override destroy(fromScene?: boolean): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    super.destroy(fromScene);
  }
}
