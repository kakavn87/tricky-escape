import Phaser from "phaser";
import { TopBar } from "../ui/TopBar";
import { getSafeArea, type SafeArea } from "../ui/SafeArea";

const COLORS = {
  ink: 0x2d2424,
  cream: 0xfaf6f0,
  wall: 0xf7dfc0,
  wallShadow: 0xe9bd8b,
  floor: 0xe5b98a,
  floorLine: 0xc58a52,
  wood: 0x9a6545,
  woodDark: 0x70462f,
  door: 0x5d83b2,
  doorDark: 0x3c5b82,
  yellow: 0xffd93d,
  skin: 0xf2bd8e,
  shirt: 0x6e8fd0,
  pants: 0x4f5f83,
  white: 0xffffff,
};

export class GameScene extends Phaser.Scene {
  private level = 1;
  private keyTaken = false;
  private contentRoot!: Phaser.GameObjects.Container;
  private safeArea!: SafeArea;

  private readonly DESIGN_WIDTH = 390;
  private readonly DESIGN_HEIGHT = 760;

  constructor() {
    super("GameScene");
  }

  init(data: { level?: number }): void {
    this.level = data.level ?? 1;
    this.keyTaken = false;
  }

  create(): void {
    this.layoutMetrics();
    this.drawRoom();
    this.createHud();

    this.contentRoot = this.add.container(0, 0).setDepth(10);
    this.createLevel();
    this.layoutContent();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private layoutMetrics(): void {
    this.safeArea = getSafeArea(this.scale.width, this.scale.height);
  }

  private get contentScale(): number {
    return Math.min(
      this.safeArea.width / this.DESIGN_WIDTH,
      this.safeArea.height / this.DESIGN_HEIGHT,
      1.35,
    );
  }

  private layoutContent(): void {
    if (!this.contentRoot) return;

    const scale = this.contentScale;
    this.contentRoot.setScale(scale);
    this.contentRoot.setPosition(
      this.safeArea.centerX - (this.DESIGN_WIDTH * scale) / 2,
      this.safeArea.top + Math.max(4, (this.safeArea.height - this.DESIGN_HEIGHT * scale) / 2),
    );
  }

  private handleResize(): void {
    this.layoutMetrics();
    this.drawRoom();
    this.layoutContent();
  }

  private cleanup(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
  }

  /**
   * Full-bleed room. The room owns the entire canvas; TopBar sits above it.
   * There is intentionally no dark background strip above/below the room.
   */
  private drawRoom(): void {
    const { width, height } = this.scale;
    const floorY = Math.round(height * 0.58);

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.floor).setDepth(-30);

    this.add.rectangle(width / 2, floorY / 2, width, floorY, COLORS.wall)
      .setStrokeStyle(6, COLORS.woodDark)
      .setDepth(-29);

    this.add.rectangle(width / 2, floorY + (height - floorY) / 2, width, height - floorY, COLORS.floor)
      .setStrokeStyle(6, COLORS.woodDark)
      .setDepth(-29);

    this.add.rectangle(width / 2, floorY, width, 8, COLORS.floorLine).setDepth(-28);

    // Subtle wall panels.
    const panelStep = Math.max(44, width / 34);
    for (let x = 20; x < width + panelStep; x += panelStep) {
      this.add.rectangle(x, Math.min(floorY - 28, 74), 3, Math.min(82, floorY * 0.38), COLORS.wallShadow, 0.42)
        .setDepth(-28);
    }

    // Floor boards.
    const boardStep = Math.max(58, width / 22);
    for (let x = -boardStep; x < width + boardStep; x += boardStep) {
      this.add.line(0, 0, x, floorY + 24, x + boardStep * 0.7, height, COLORS.floorLine, 0.16)
        .setLineWidth(2)
        .setDepth(-28);
    }
  }

  private createHud(): void {
    new TopBar(this, {
      level: this.level,
      onMenu: () => this.scene.start("MenuScene"),
      onHint: () => this.showVisualHint(),
    });
  }

  private addText(
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.Text {
    const obj = this.add.text(x, y, text, style);
    this.contentRoot.add(obj);
    return obj;
  }

  private addRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    alpha = 1,
  ): Phaser.GameObjects.Rectangle {
    const obj = this.add.rectangle(x, y, width, height, color, alpha);
    this.contentRoot.add(obj);
    return obj;
  }

  private addCircle(
    x: number,
    y: number,
    radius: number,
    color: number,
    alpha = 1,
  ): Phaser.GameObjects.Arc {
    const obj = this.add.circle(x, y, radius, color, alpha);
    this.contentRoot.add(obj);
    return obj;
  }

  private addContainer(x: number, y: number): Phaser.GameObjects.Container {
    const obj = this.add.container(x, y);
    this.contentRoot.add(obj);
    return obj;
  }

  private createLevel(): void {
    if (this.level === 1) this.createKeyPuzzle();
    else if (this.level === 2) this.createGuardPuzzle();
    else this.createDoorPuzzle();
  }

  private createKeyPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;

    // Door + large lock.
    this.createDoor(cx, 652, 142, 190);

    // Character: expressive, simple vector cartoon.
    this.createCharacter(cx + 92, 620);

    // Picture frame, slightly tilted.
    const frame = this.addContainer(cx, 220);
    frame.setAngle(-2.5);

    const shadow = this.add.graphics();
    shadow.fillStyle(COLORS.ink, 0.18);
    shadow.fillRoundedRect(-89, -74, 178, 150, 14);

    const border = this.add.graphics();
    border.fillStyle(COLORS.wood, 1);
    border.lineStyle(3, COLORS.ink, 1);
    border.fillRoundedRect(-86, -72, 172, 144, 10);
    border.strokeRoundedRect(-86, -72, 172, 144, 10);

    const inner = this.add.graphics();
    inner.fillStyle(0xf7d58d, 1);
    inner.fillRoundedRect(-70, -56, 140, 112, 5);
    inner.lineStyle(3, 0xb77945, 1);
    inner.strokeRoundedRect(-70, -56, 140, 112, 5);

    const landscape = this.createLandscapeArt();
    frame.add([shadow, border, inner, landscape]);

    // Key is genuinely hidden behind the frame.
    const key = this.createKeyGraphic(0, 0);
    key.setVisible(false);
    key.setPosition(cx + 76, 305);
    this.contentRoot.add(key);
    this.keyObject = key;

    // Gentle visual affordance, not explanatory text.
    const frameGlow = this.add.graphics();
    frameGlow.lineStyle(3, COLORS.yellow, 0.2);
    frameGlow.strokeRoundedRect(cx - 91, 147, 182, 150, 14);
    frameGlow.setDepth(-1);
    this.tweens.add({
      targets: frameGlow,
      alpha: 0.05,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    frame.setSize(180, 150).setInteractive({ useHandCursor: true });
    frame.on("pointerdown", () => {
      if (this.keyTaken || key.visible) return;

      this.tweens.add({
        targets: frame,
        angle: 7,
        y: 232,
        duration: 180,
        ease: "Quad.easeOut",
        onComplete: () => {
          frame.setAngle(7);
          key.setVisible(true);
          this.animateKeyReveal(key);
          this.createDust(cx, 285);
        },
      });
    });

    key.setSize(52, 52).setInteractive({ useHandCursor: true });
    this.input.setDraggable(key);

    key.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const localX = (dragX - this.contentRoot.x) / this.contentRoot.scaleX;
      const localY = (dragY - this.contentRoot.y) / this.contentRoot.scaleY;
      key.setPosition(localX, localY);
    });

    key.on("dragend", () => {
      if (Math.abs(key.x - cx) < 82 && key.y > 570) {
        this.keyTaken = true;
        this.success("DOOR UNLOCKED!");
      } else {
        this.tweens.add({
          targets: key,
          x: cx + 76,
          y: 305,
          duration: 280,
          ease: "Back.easeOut",
        });
      }
    });
  }

  private createLandscapeArt(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();

    // Sun.
    g.fillStyle(0xffa94d, 1);
    g.fillCircle(28, -23, 18);
    g.lineStyle(3, COLORS.ink, 1);
    g.strokeCircle(28, -23, 18);

    // Mountains.
    g.fillStyle(0x4e9b70, 1);
    g.beginPath();
    g.moveTo(-61, 38);
    g.lineTo(-18, -14);
    g.lineTo(6, 15);
    g.lineTo(31, -7);
    g.lineTo(68, 38);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x2f765b, 1);
    g.beginPath();
    g.moveTo(-61, 38);
    g.lineTo(-23, 5);
    g.lineTo(0, 38);
    g.closePath();
    g.fillPath();

    // Snow cap / highlight.
    g.fillStyle(0xfff4d5, 1);
    g.beginPath();
    g.moveTo(-18, -14);
    g.lineTo(-7, 1);
    g.lineTo(-17, -1);
    g.lineTo(-23, 5);
    g.closePath();
    g.fillPath();

    return g;
  }

  private createDoor(
    cx: number,
    cy: number,
    width: number,
    height: number,
  ): Phaser.GameObjects.Container {
    const door = this.addContainer(cx, cy);

    const shadow = this.add.graphics();
    shadow.fillStyle(COLORS.ink, 0.22);
    shadow.fillRoundedRect(-width / 2 + 5, -height / 2 + 8, width, height, 12);

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.door, 1);
    panel.lineStyle(4, COLORS.ink, 1);
    panel.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    panel.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Door inset.
    panel.lineStyle(3, COLORS.doorDark, 1);
    panel.strokeRoundedRect(-width / 2 + 15, -height / 2 + 15, width - 30, height - 30, 7);

    // Large lock plate.
    panel.fillStyle(0xfff1c4, 1);
    panel.lineStyle(3, COLORS.ink, 1);
    panel.fillRoundedRect(-25, -18, 50, 62, 12);
    panel.strokeRoundedRect(-25, -18, 50, 62, 12);

    // Lock shackle.
    panel.lineStyle(8, COLORS.ink, 1);
    panel.beginPath();
    panel.arc(0, -16, 15, Math.PI, 0, false);
    panel.strokePath();

    // Keyhole.
    panel.fillStyle(COLORS.ink, 1);
    panel.fillCircle(0, 13, 7);
    panel.fillRect(-3, 13, 6, 13);

    door.add([shadow, panel]);
    this.contentRoot.add(door);
    return door;
  }

  private createCharacter(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.addContainer(x, y);

    const shadow = this.add.ellipse(0, 65, 58, 15, COLORS.ink, 0.18);
    const legs = this.add.graphics();
    legs.fillStyle(COLORS.pants, 1);
    legs.lineStyle(3, COLORS.ink, 1);
    legs.fillRoundedRect(-23, 26, 18, 40, 7);
    legs.fillRoundedRect(5, 26, 18, 40, 7);
    legs.strokeRoundedRect(-23, 26, 18, 40, 7);
    legs.strokeRoundedRect(5, 26, 18, 40, 7);

    const body = this.add.graphics();
    body.fillStyle(COLORS.shirt, 1);
    body.lineStyle(3, COLORS.ink, 1);
    body.fillRoundedRect(-29, -8, 58, 54, 18);
    body.strokeRoundedRect(-29, -8, 58, 54, 18);

    const head = this.add.graphics();
    head.fillStyle(COLORS.skin, 1);
    head.lineStyle(3, COLORS.ink, 1);
    head.fillCircle(0, -35, 34);
    head.strokeCircle(0, -35, 34);

    // Hair.
    head.fillStyle(0x5a3b2e, 1);
    head.beginPath();
    head.arc(0, -48, 31, Math.PI, 0, false);
    head.fillPath();

    // Eyes.
    head.fillStyle(COLORS.white, 1);
    head.fillCircle(-12, -36, 8);
    head.fillCircle(12, -36, 8);
    head.fillStyle(COLORS.ink, 1);
    head.fillCircle(-10, -35, 3);
    head.fillCircle(10, -35, 3);

    // Confused mouth.
    head.lineStyle(3, COLORS.ink, 1);
    head.beginPath();
    head.arc(0, -20, 8, Math.PI * 1.05, Math.PI * 1.95, false);
    head.strokePath();

    // One hand scratching head.
    const arm = this.add.graphics();
    arm.lineStyle(8, COLORS.skin, 1);
    arm.lineCap = 1;
    arm.beginPath();
    arm.moveTo(24, 3);
    arm.lineTo(39, -27);
    arm.lineTo(27, -47);
    arm.strokePath();

    c.add([shadow, legs, body, head, arm]);
    this.contentRoot.add(c);

    this.tweens.add({
      targets: arm,
      angle: { from: -3, to: 3 },
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return c;
  }

  private createKeyGraphic(x: number, y: number): Phaser.GameObjects.Container {
    const key = this.addContainer(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(COLORS.ink, 0.18);
    shadow.fillCircle(3, 5, 13);
    shadow.fillRoundedRect(9, 0, 35, 10, 4);

    const g = this.add.graphics();
    g.fillStyle(COLORS.yellow, 1);
    g.lineStyle(3, COLORS.ink, 1);
    g.fillCircle(0, 0, 14);
    g.strokeCircle(0, 0, 14);
    g.fillRoundedRect(8, -5, 34, 10, 4);
    g.strokeRoundedRect(8, -5, 34, 10, 4);

    g.fillStyle(COLORS.cream, 1);
    g.fillCircle(0, 0, 5);

    g.fillStyle(COLORS.yellow, 1);
    g.fillRect(27, -4, 5, 8);
    g.fillRect(36, -4, 5, 8);

    key.add([shadow, g]);
    return key;
  }

  private animateKeyReveal(key: Phaser.GameObjects.Container): void {
    const glow = this.add.circle(key.x, key.y, 25, COLORS.yellow, 0.18).setDepth(key.depth - 1);
    this.tweens.add({
      targets: glow,
      scale: 1.35,
      alpha: 0,
      duration: 750,
      repeat: -1,
      ease: "Sine.easeOut",
    });

    this.tweens.add({
      targets: key,
      y: key.y - 7,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createDust(x: number, y: number): void {
    for (let i = 0; i < 9; i++) {
      const p = this.add.circle(
        x + Phaser.Math.Between(-55, 55),
        y + Phaser.Math.Between(-8, 8),
        Phaser.Math.Between(2, 5),
        0xf4d6b2,
        0.7,
      ).setDepth(20);

      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-30, 30),
        y: p.y + Phaser.Math.Between(-25, 20),
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(350, 600),
        onComplete: () => p.destroy(),
      });
    }
  }

  private createGuardPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;

    this.createDoor(cx, 650, 142, 190);
    this.createCharacter(cx + 90, 615);

    const guard = this.addContainer(cx - 75, 265);
    const body = this.add.graphics();
    body.fillStyle(0x7f91a8, 1);
    body.lineStyle(3, COLORS.ink, 1);
    body.fillRoundedRect(-38, 8, 76, 70, 22);
    body.strokeRoundedRect(-38, 8, 76, 70, 22);

    const head = this.add.graphics();
    head.fillStyle(COLORS.skin, 1);
    head.lineStyle(3, COLORS.ink, 1);
    head.fillCircle(0, -20, 34);
    head.strokeCircle(0, -20, 34);

    head.lineStyle(3, COLORS.ink, 1);
    head.beginPath();
    head.moveTo(-14, -18);
    head.lineTo(-5, -14);
    head.moveTo(14, -18);
    head.lineTo(5, -14);
    head.strokePath();

    head.fillStyle(COLORS.ink, 1);
    head.fillCircle(-12, -6, 2);
    head.fillCircle(12, -6, 2);

    guard.add([body, head]);
    this.contentRoot.add(guard);

    // Bottle.
    const bottle = this.createBottle(cx - 105, 390);
    bottle.setInteractive({ useHandCursor: true });
    this.input.setDraggable(bottle);

    bottle.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      bottle.setPosition(
        (dragX - this.contentRoot.x) / this.contentRoot.scaleX,
        (dragY - this.contentRoot.y) / this.contentRoot.scaleY,
      );
    });

    bottle.on("dragend", () => {
      if (bottle.y < 320) {
        this.success("THE GUARD IS DISTRACTED!");
      } else {
        this.tweens.add({
          targets: bottle,
          x: cx - 105,
          y: 390,
          duration: 250,
          ease: "Back.easeOut",
        });
      }
    });
  }

  private createBottle(x: number, y: number): Phaser.GameObjects.Container {
    const bottle = this.addContainer(x, y);

    const shadow = this.add.ellipse(0, 31, 42, 11, COLORS.ink, 0.18);
    const g = this.add.graphics();

    g.fillStyle(0x8fd3f4, 1);
    g.lineStyle(3, COLORS.ink, 1);
    g.fillRoundedRect(-20, -20, 40, 55, 10);
    g.strokeRoundedRect(-20, -20, 40, 55, 10);

    g.fillStyle(0x8fd3f4, 1);
    g.fillRoundedRect(-9, -34, 18, 17, 5);
    g.strokeRoundedRect(-9, -34, 18, 17, 5);

    g.fillStyle(0xfff0b8, 1);
    g.fillRoundedRect(-17, -8, 34, 20, 5);

    bottle.add([shadow, g]);
    this.contentRoot.add(bottle);
    return bottle;
  }

  private createDoorPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;
    const doorXs = [cx - 112, cx, cx + 112];

    doorXs.forEach((x) => {
      const door = this.createDoor(x, 330, 84, 148);
      const panel = door.list[1] as Phaser.GameObjects.Graphics;
      panel.setInteractive(new Phaser.Geom.Rectangle(-42, -74, 84, 148), Phaser.Geom.Rectangle.Contains);
      panel.on("pointerdown", () => {
        this.tweens.add({
          targets: door,
          x: x + 5,
          duration: 45,
          yoyo: true,
          repeat: 3,
        });
      });
    });

    // The trick is visual: the character is looking above the doors.
    this.createCharacter(cx, 610);

    const ceilingExit = this.add.graphics();
    ceilingExit.fillStyle(COLORS.cream, 1);
    ceilingExit.lineStyle(3, COLORS.ink, 1);
    ceilingExit.fillRoundedRect(cx - 62, 105, 124, 44, 12);
    ceilingExit.strokeRoundedRect(cx - 62, 105, 124, 44, 12);
    ceilingExit.fillStyle(COLORS.yellow, 1);
    ceilingExit.fillCircle(cx, 127, 12);
    ceilingExit.setInteractive(new Phaser.Geom.Rectangle(cx - 62, 105, 124, 44), Phaser.Geom.Rectangle.Contains);
    ceilingExit.on("pointerdown", () => this.success("YOU FOUND THE FOURTH DOOR!"));

    this.tweens.add({
      targets: ceilingExit,
      y: "-=3",
      alpha: { from: 0.75, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private showVisualHint(): void {
    if (this.level === 1) {
      const frame = this.contentRoot.list.find(
        (child) => child instanceof Phaser.GameObjects.Container && Math.abs(child.x - this.DESIGN_WIDTH / 2) < 2,
      );
      if (frame) {
        this.tweens.add({ targets: frame, angle: 3, duration: 120, yoyo: true, repeat: 4 });
      }
    } else if (this.level === 2) {
      this.tweens.add({ targets: this.contentRoot.list.find((child) => child instanceof Phaser.GameObjects.Container), x: "+=5", duration: 120, yoyo: true, repeat: 4 });
    } else {
      this.tweens.add({
        targets: this.contentRoot,
        y: "-=4",
        duration: 180,
        yoyo: true,
        repeat: 3,
      });
    }
  }

  private success(message: string): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x07111f, 0.68)
      .setDepth(100);

    this.add.text(width / 2, height / 2 + 5, message, {
      fontFamily: "Fredoka",
      fontSize: "26px",
      fontStyle: "700",
      color: "#FFD93D",
      align: "center",
      wordWrap: { width: width - 70 },
    }).setOrigin(0.5).setDepth(101);

    const next = this.add.text(
      width / 2,
      height / 2 + 105,
      this.level < 3 ? "NEXT LEVEL  →" : "PLAY AGAIN  ↻",
      {
        fontFamily: "Nunito",
        fontSize: "19px",
        fontStyle: "900",
        color: "#2D2424",
        backgroundColor: "#FFD93D",
        padding: { left: 22, right: 22, top: 14, bottom: 14 },
      },
    ).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    next.on("pointerdown", () => this.scene.restart({ level: this.level < 3 ? this.level + 1 : 1 }));
    this.tweens.add({ targets: next, scale: 1.05, duration: 650, yoyo: true, repeat: -1 });

    for (let i = 0; i < 18; i++) {
      const particle = this.add.circle(
        width / 2,
        height / 2,
        Phaser.Math.Between(3, 7),
        Phaser.Utils.Array.GetRandom([0xffd93d, 0x60a5fa, 0xf472b6, 0x34d399]),
      ).setDepth(102);

      this.tweens.add({
        targets: particle,
        x: Phaser.Math.Between(20, width - 20),
        y: Phaser.Math.Between(80, height - 80),
        alpha: 0,
        duration: Phaser.Math.Between(550, 1000),
        onComplete: () => particle.destroy(),
      });
    }
  }
}
