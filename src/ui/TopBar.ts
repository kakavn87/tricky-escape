import Phaser from "phaser";
import { getSafeArea } from "./SafeArea";
import type { SafeArea } from "./SafeArea";

const COLORS = {
  ink: 0x3a2525,
  cream: 0xfffbf4,
  yellow: 0xffd93d,
  yellowShadow: 0xc28b19,
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
    this.menuButton = this.createButton(58, 58, false);
    this.menuButton.add(this.createMenuIcon());
    this.menuButton.setInteractive(
      new Phaser.Geom.Rectangle(-29, -29, 58, 58),
      Phaser.Geom.Rectangle.Contains,
    );
    this.menuButton.on("pointerup", this.onMenu);

    this.levelBadge = this.createButton(148, 50, false);
    const label = this.scene.add.text(0, 0, `LEVEL ${String(this.level).padStart(2, "0")}`, {
      fontFamily: "Fredoka",
      fontSize: "18px",
      fontStyle: "700",
      color: "#3A2525",
      letterSpacing: 1.2,
    }).setOrigin(0.5);
    this.levelBadge.add(label);

    this.hintButton = this.createButton(58, 58, true);
    this.hintButton.add(this.createBulbIcon());
    this.hintButton.setInteractive(
      new Phaser.Geom.Rectangle(-29, -29, 58, 58),
      Phaser.Geom.Rectangle.Contains,
    );
    this.hintButton.on("pointerup", this.onHint);

    this.add([this.menuButton, this.levelBadge, this.hintButton]);
  }

  private createButton(width: number, height: number, yellow: boolean): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(yellow ? COLORS.yellowShadow : COLORS.ink, 0.32);
    shadow.fillRoundedRect(-width / 2 + 2, -height / 2 + 6, width, height, 15);

    const surface = this.scene.add.graphics();
    surface.fillStyle(yellow ? COLORS.yellow : COLORS.cream, 1);
    surface.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
    surface.lineStyle(3, COLORS.ink, 1);
    surface.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);

    button.add([shadow, surface]);
    return button;
  }

  private createMenuIcon(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.lineStyle(4, COLORS.ink, 1);
    g.beginPath();
    g.moveTo(-11, -9);
    g.lineTo(11, -9);
    g.moveTo(-11, 0);
    g.lineTo(11, 0);
    g.moveTo(-11, 9);
    g.lineTo(11, 9);
    g.strokePath();
    return g;
  }

  private createBulbIcon(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();

    g.fillStyle(0xfff6b5, 1);
    g.lineStyle(3, COLORS.ink, 1);
    g.fillCircle(0, -4, 11);
    g.strokeCircle(0, -4, 11);

    g.fillStyle(COLORS.yellow, 1);
    g.fillCircle(0, -4, 8);

    g.lineStyle(3, COLORS.ink, 1);
    g.beginPath();
    g.moveTo(-5, 6);
    g.lineTo(-4, 13);
    g.lineTo(4, 13);
    g.lineTo(5, 6);
    g.strokePath();

    g.beginPath();
    g.moveTo(-3, 17);
    g.lineTo(3, 17);
    g.strokePath();

    g.lineStyle(2, COLORS.ink, 1);
    g.beginPath();
    g.moveTo(0, -22);
    g.lineTo(0, -17);
    g.moveTo(-17, -14);
    g.lineTo(-13, -11);
    g.moveTo(17, -14);
    g.lineTo(13, -11);
    g.strokePath();

    return g;
  }

  private layout(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.safeArea = getSafeArea(width, height);

    const top = Math.max(34, this.safeArea.top - 34);
    const horizontalInset = Math.max(18, this.safeArea.left);

    this.menuButton.setPosition(horizontalInset + 29, top);
    this.levelBadge.setPosition(this.safeArea.centerX, top);
    this.hintButton.setPosition(width - horizontalInset - 29, top);
  }

  private handleResize(): void {
    this.layout();
  }

  override destroy(fromScene?: boolean): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    super.destroy(fromScene);
  }
}
