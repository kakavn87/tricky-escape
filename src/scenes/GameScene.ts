import Phaser from "phaser";
import { TopBar } from "../ui/TopBar";
import { getSafeArea, type SafeArea } from "../ui/SafeArea";

const C = {
  ink: 0x3a2525,
  cream: 0xfff8ea,
  cream2: 0xfff1d7,
  wall: 0xfff7e6,
  stripe: 0xf2dfbf,
  floor: 0xe7a45f,
  floorLight: 0xf0b875,
  floorLine: 0xc47b42,
  blue: 0x2f7f9f,
  blueLight: 0x4d9ab2,
  blueDark: 0x20556f,
  wood: 0x9b5536,
  woodDark: 0x693927,
  woodLight: 0xb96b43,
  gold: 0xffd93d,
  goldDark: 0xc28b19,
  skin: 0xf1b68d,
  white: 0xffffff,
  green: 0x79a94b,
  greenDark: 0x3e7652,
  mountain: 0x5d91a6,
  mountainDark: 0x3e697f,
};

export class GameScene extends Phaser.Scene {
  private level = 1;
  private keyTaken = false;
  private contentRoot!: Phaser.GameObjects.Container;
  private safeArea!: SafeArea;

  private readonly DESIGN_WIDTH = 390;
  private readonly DESIGN_HEIGHT = 844;

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
      this.safeArea.top + Math.max(0, (this.safeArea.height - this.DESIGN_HEIGHT * scale) / 2),
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

  private drawRoom(): void {
    const { width, height } = this.scale;
    const floorY = Math.round(height * 0.79);

    this.add.rectangle(width / 2, height / 2, width, height, C.wall).setDepth(-40);

    // Warm vertical wallpaper stripes.
    const stripeWidth = Math.max(30, Math.round(width * 0.075));
    for (let x = -stripeWidth; x < width + stripeWidth; x += stripeWidth * 2) {
      this.add.rectangle(
        x + stripeWidth / 2,
        floorY / 2,
        stripeWidth,
        floorY,
        C.stripe,
      ).setDepth(-39);
    }

    // Tiny top-to-floor seam shadow.
    this.add.rectangle(width / 2, floorY - 3, width, 6, C.woodDark, 0.85).setDepth(-38);

    // Wooden floor.
    this.add.rectangle(
      width / 2,
      floorY + (height - floorY) / 2,
      width,
      height - floorY,
      C.floor,
    ).setDepth(-38);

    // Floor planks.
    const plankH = Math.max(54, Math.round(height * 0.075));
    for (let y = floorY + plankH; y < height + plankH; y += plankH) {
      this.add.rectangle(width / 2, y, width, 3, C.floorLine, 0.65).setDepth(-37);
    }

    const plankW = Math.max(90, Math.round(width * 0.24));
    for (let row = 0, y = floorY; y < height + plankH; row++, y += plankH) {
      const offset = row % 2 === 0 ? 0 : plankW / 2;
      for (let x = -plankW + offset; x < width + plankW; x += plankW) {
        this.add.line(
          x,
          y,
          x + plankW * 0.35,
          y + plankH,
          C.floorLine,
          0.5,
        ).setLineWidth(2).setDepth(-37);
      }
    }

    // Small warm baseboard.
    this.add.rectangle(width / 2, floorY - 1, width, 8, C.woodLight).setDepth(-36);
  }

  private createHud(): void {
    new TopBar(this, {
      level: this.level,
      onMenu: () => this.scene.start("MenuScene"),
      onHint: () => this.showVisualHint(),
    });
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

    this.createDoor(cx - 8, 640, 176, 238);
    this.createRug(cx - 8, 786);
    this.createCharacter(cx + 126, 650);

    // The key is visible immediately. It is intentionally drawn after the picture
    // so the complete draggable shape is readable without any click.
    const picture = this.createPicture(cx, 235);

    const key = this.createKeyGraphic(cx + 84, 292);
    key.setAngle(-38);

    picture.setInteractive(
      new Phaser.Geom.Rectangle(-98, -72, 196, 144),
      Phaser.Geom.Rectangle.Contains,
    );

    picture.on("pointerdown", () => {
      if (this.keyTaken) return;

      // A small reaction makes the hiding spot understandable without text.
      this.tweens.add({
        targets: picture,
        angle: { from: picture.angle, to: picture.angle + 3 },
        duration: 110,
        yoyo: true,
        ease: "Sine.easeOut",
      });
    });

    key.setSize(58, 58).setInteractive({ useHandCursor: true });
    this.input.setDraggable(key);

    key.on("dragstart", () => {
      this.tweens.killTweensOf(key);
    });

    key.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      key.setPosition(
        (dragX - this.contentRoot.x) / this.contentRoot.scaleX,
        (dragY - this.contentRoot.y) / this.contentRoot.scaleY,
      );
    });

    key.on("dragend", () => {
      const lockX = cx - 8;
      const lockY = 624;
      if (Phaser.Math.Distance.Between(key.x, key.y, lockX, lockY) < 62) {
        this.keyTaken = true;
        key.setVisible(false);
        this.success("DOOR UNLOCKED!");
      } else {
        this.tweens.add({
          targets: key,
          x: cx + 78,
          y: 307,
          duration: 280,
          ease: "Back.easeOut",
          onComplete: () => this.animateKeyReveal(key),
        });
      }
    });
  }

  private createPicture(x: number, y: number): Phaser.GameObjects.Container {
    const frame = this.addContainer(x, y);
    frame.setAngle(-4);

    const shadow = this.add.graphics();
    shadow.fillStyle(C.ink, 0.18);
    shadow.fillRoundedRect(-91, -67, 182, 142, 12);

    const outer = this.add.graphics();
    outer.fillStyle(C.wood, 1);
    outer.lineStyle(4, C.ink, 1);
    outer.fillRoundedRect(-88, -70, 176, 140, 10);
    outer.strokeRoundedRect(-88, -70, 176, 140, 10);

    const inner = this.add.graphics();
    inner.fillStyle(0xf4d49a, 1);
    inner.lineStyle(3, C.woodDark, 1);
    inner.fillRoundedRect(-73, -55, 146, 110, 4);
    inner.strokeRoundedRect(-73, -55, 146, 110, 4);

    const art = this.createLandscapeArt();
    art.setPosition(0, 2);

    frame.add([shadow, outer, inner, art]);
    return frame;
  }

  private createLandscapeArt(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();

    // Sky.
    g.fillStyle(0x77c8e8, 1);
    g.fillRoundedRect(-68, -50, 136, 100, 2);

    // Sun.
    g.fillStyle(0xffc934, 1);
    g.lineStyle(2, C.ink, 0.8);
    g.fillCircle(28, -23, 16);
    g.strokeCircle(28, -23, 16);

    // Clouds.
    g.fillStyle(C.white, 0.92);
    g.fillCircle(-42, -24, 10);
    g.fillCircle(-31, -28, 13);
    g.fillCircle(-19, -23, 9);
    g.fillCircle(49, -29, 10);
    g.fillCircle(59, -26, 13);

    // Far mountains.
    g.fillStyle(C.mountain, 1);
    g.beginPath();
    g.moveTo(-68, 50);
    g.lineTo(-23, -15);
    g.lineTo(3, 20);
    g.lineTo(32, -8);
    g.lineTo(68, 50);
    g.closePath();
    g.fillPath();

    // Snow.
    g.fillStyle(C.cream, 0.95);
    g.beginPath();
    g.moveTo(-23, -15);
    g.lineTo(-9, 4);
    g.lineTo(-19, 0);
    g.lineTo(-28, 8);
    g.closePath();
    g.fillPath();

    // Hills.
    g.fillStyle(C.green, 1);
    g.beginPath();
    g.moveTo(-68, 28);
    g.lineTo(-42, 17);
    g.lineTo(-15, 22);
    g.lineTo(12, 30);
    g.lineTo(38, 20);
    g.lineTo(68, 34);
    g.lineTo(68, 50);
    g.lineTo(-68, 50);
    g.closePath();
    g.fillPath();

    // Pine trees.
    g.fillStyle(C.greenDark, 1);
    for (const x of [-52, -42, 47, 58]) {
      g.beginPath();
      g.moveTo(x, 43);
      g.lineTo(x + 8, 18);
      g.lineTo(x + 16, 43);
      g.closePath();
      g.fillPath();
    }

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
    shadow.fillStyle(C.ink, 0.20);
    shadow.fillRoundedRect(-width / 2 + 7, -height / 2 + 9, width, height, 14);

    const panel = this.add.graphics();
    panel.fillStyle(C.blue, 1);
    panel.lineStyle(4, C.ink, 1);
    panel.fillRoundedRect(-width / 2, -height / 2, width, height, 13);
    panel.strokeRoundedRect(-width / 2, -height / 2, width, height, 13);

    // Raised door panels.
    panel.lineStyle(3, C.blueDark, 1);
    panel.strokeRoundedRect(-width / 2 + 18, -height / 2 + 18, width - 36, height * 0.40, 8);
    panel.strokeRoundedRect(-width / 2 + 18, 12, width - 36, height * 0.40, 8);

    // Vertical wood grain.
    panel.lineStyle(2, C.blueDark, 0.45);
    for (const x of [-width / 2 + 42, -width / 2 + 76, width / 2 - 45]) {
      panel.beginPath();
      panel.moveTo(x, -height / 2 + 28);
      panel.lineTo(x, height / 2 - 28);
      panel.strokePath();
    }

    // Large gold lock.
    panel.fillStyle(C.gold, 1);
    panel.lineStyle(4, C.ink, 1);
    panel.fillCircle(0, -24, 27);
    panel.strokeCircle(0, -24, 27);

    panel.lineStyle(8, C.ink, 1);
    panel.beginPath();
    panel.arc(0, -31, 15, Math.PI, 0, false);
    panel.strokePath();

    panel.fillStyle(C.ink, 1);
    panel.fillCircle(0, -23, 6);
    panel.fillRect(-3, -23, 6, 15);

    // Handle.
    panel.fillStyle(C.gold, 1);
    panel.lineStyle(3, C.ink, 1);
    panel.fillRoundedRect(27, 15, 30, 13, 6);
    panel.strokeRoundedRect(27, 15, 30, 13, 6);
    panel.fillRoundedRect(48, 4, 13, 35, 6);
    panel.strokeRoundedRect(48, 4, 13, 35, 6);

    door.add([shadow, panel]);
    this.contentRoot.add(door);
    return door;
  }

  private createRug(x: number, y: number): void {
    const rug = this.add.graphics();
    rug.fillStyle(C.ink, 0.16);
    rug.fillEllipse(x + 3, y + 7, 230, 52);

    rug.fillStyle(0xf2c989, 1);
    rug.lineStyle(3, C.woodDark, 0.8);
    rug.fillEllipse(x, y, 226, 50);
    rug.strokeEllipse(x, y, 226, 50);

    rug.lineStyle(2, C.woodLight, 0.9);
    rug.strokeEllipse(x, y, 198, 36);
    rug.strokeEllipse(x, y, 168, 25);

    rug.lineStyle(1.5, C.woodLight, 0.75);
    rug.strokeEllipse(x, y, 126, 16);
  }

  private createCharacter(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.addContainer(x, y);

    const shadow = this.add.ellipse(0, 72, 68, 18, C.ink, 0.18);

    const legs = this.add.graphics();
    legs.lineStyle(8, C.ink, 1);
    legs.beginPath();
    legs.moveTo(-13, 30);
    legs.lineTo(-16, 73);
    legs.moveTo(13, 30);
    legs.lineTo(17, 73);
    legs.strokePath();

    const body = this.add.graphics();
    body.fillStyle(C.cream, 1);
    body.lineStyle(4, C.ink, 1);
    body.fillRoundedRect(-29, -2, 58, 52, 24);
    body.strokeRoundedRect(-29, -2, 58, 52, 24);

    const head = this.add.graphics();
    head.fillStyle(C.cream, 1);
    head.lineStyle(4, C.ink, 1);
    head.fillCircle(0, -40, 39);
    head.strokeCircle(0, -40, 39);

    // Hair tuft.
    head.fillStyle(C.ink, 1);
    head.beginPath();
    head.arc(4, -69, 29, Math.PI * 1.05, Math.PI * 1.95, false);
    head.fillPath();

    // Eyes.
    head.fillStyle(C.white, 1);
    head.fillCircle(-14, -43, 10);
    head.fillCircle(14, -43, 10);
    head.fillStyle(C.ink, 1);
    head.fillCircle(-12, -41, 4);
    head.fillCircle(12, -41, 4);

    // Confused eyebrows + mouth.
    head.lineStyle(3, C.ink, 1);
    head.beginPath();
    head.moveTo(-22, -58);
    head.lineTo(-8, -62);
    head.moveTo(8, -62);
    head.lineTo(22, -58);
    head.strokePath();
    head.beginPath();
    head.arc(0, -25, 9, Math.PI * 0.15, Math.PI * 0.85, false);
    head.strokePath();

    // Scratching arm.
    const arm = this.add.graphics();
    arm.lineStyle(8, C.ink, 1);
    arm.beginPath();
    arm.moveTo(24, 8);
    arm.lineTo(43, -22);
    arm.lineTo(30, -52);
    arm.strokePath();

    c.add([shadow, legs, body, head, arm]);
    this.contentRoot.add(c);

    return c;
  }

  private createKeyGraphic(x: number, y: number): Phaser.GameObjects.Container {
    const key = this.addContainer(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(C.ink, 0.18);
    shadow.fillCircle(4, 5, 17);
    shadow.fillRoundedRect(13, 0, 48, 13, 5);

    const g = this.add.graphics();
    g.fillStyle(C.gold, 1);
    g.lineStyle(4, C.ink, 1);
    g.fillCircle(0, 0, 18);
    g.strokeCircle(0, 0, 18);
    g.fillRoundedRect(11, -6, 48, 12, 5);
    g.strokeRoundedRect(11, -6, 48, 12, 5);

    g.fillStyle(C.cream, 1);
    g.fillCircle(0, 0, 7);

    g.fillStyle(C.gold, 1);
    g.fillRect(40, -5, 7, 10);
    g.fillRect(51, -5, 7, 10);

    key.add([shadow, g]);
    this.contentRoot.add(key);
    return key;
  }

  private animateKeyReveal(key: Phaser.GameObjects.Container): void {
    const glow = this.add.circle(key.x, key.y, 27, C.gold, 0.20).setDepth(key.depth - 1);
    this.tweens.add({
      targets: glow,
      scale: 1.4,
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

  private createGuardPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;

    this.createDoor(cx - 8, 640, 176, 238);
    this.createCharacter(cx + 126, 650);

    const guard = this.addContainer(cx - 82, 250);
    const body = this.add.graphics();
    body.fillStyle(0x687b91, 1);
    body.lineStyle(4, C.ink, 1);
    body.fillRoundedRect(-39, 10, 78, 76, 24);
    body.strokeRoundedRect(-39, 10, 78, 76, 24);

    const head = this.add.graphics();
    head.fillStyle(C.skin, 1);
    head.lineStyle(4, C.ink, 1);
    head.fillCircle(0, -20, 38);
    head.strokeCircle(0, -20, 38);

    head.fillStyle(C.ink, 1);
    head.fillCircle(-12, -18, 4);
    head.fillCircle(12, -18, 4);

    head.lineStyle(3, C.ink, 1);
    head.beginPath();
    head.moveTo(-18, -34);
    head.lineTo(-5, -29);
    head.moveTo(18, -34);
    head.lineTo(5, -29);
    head.strokePath();

    guard.add([body, head]);
    this.contentRoot.add(guard);

    const bottle = this.createBottle(cx - 112, 395);
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
        this.success("GUARD DISTRACTED!");
      } else {
        this.tweens.add({
          targets: bottle,
          x: cx - 112,
          y: 395,
          duration: 250,
          ease: "Back.easeOut",
        });
      }
    });
  }

  private createBottle(x: number, y: number): Phaser.GameObjects.Container {
    const bottle = this.addContainer(x, y);
    const shadow = this.add.ellipse(0, 34, 46, 12, C.ink, 0.18);
    const g = this.add.graphics();

    g.fillStyle(0x86cde1, 1);
    g.lineStyle(4, C.ink, 1);
    g.fillRoundedRect(-21, -20, 42, 56, 10);
    g.strokeRoundedRect(-21, -20, 42, 56, 10);
    g.fillRoundedRect(-9, -37, 18, 18, 5);
    g.strokeRoundedRect(-9, -37, 18, 18, 5);
    g.fillStyle(0xffe5a6, 1);
    g.fillRoundedRect(-17, -7, 34, 21, 5);

    bottle.add([shadow, g]);
    this.contentRoot.add(bottle);
    return bottle;
  }

  private createDoorPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;
    const xs = [cx - 105, cx, cx + 105];

    xs.forEach((x) => {
      const door = this.createDoor(x, 380, 82, 150);
      const panel = door.list[1] as Phaser.GameObjects.Graphics;
      panel.setInteractive(
        new Phaser.Geom.Rectangle(-41, -75, 82, 150),
        Phaser.Geom.Rectangle.Contains,
      );
      panel.on("pointerdown", () => {
        this.tweens.add({
          targets: door,
          x: x + 6,
          duration: 45,
          yoyo: true,
          repeat: 3,
        });
      });
    });

    this.createCharacter(cx + 110, 670);

    // A small, deliberately unexpected exit above the doors.
    const exit = this.add.graphics();
    exit.fillStyle(C.cream, 1);
    exit.lineStyle(4, C.ink, 1);
    exit.fillRoundedRect(cx - 55, 115, 110, 48, 12);
    exit.strokeRoundedRect(cx - 55, 115, 110, 48, 12);
    exit.fillStyle(C.gold, 1);
    exit.fillCircle(cx, 139, 14);
    exit.setInteractive(
      new Phaser.Geom.Rectangle(cx - 55, 115, 110, 48),
      Phaser.Geom.Rectangle.Contains,
    );
    exit.on("pointerdown", () => this.success("YOU FOUND IT!"));

    this.tweens.add({
      targets: exit,
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
      const picture = this.contentRoot.list.find(
        (child) => child instanceof Phaser.GameObjects.Container &&
          Math.abs(child.x - this.DESIGN_WIDTH / 2) < 2 &&
          Math.abs(child.y - 235) < 8,
      );
      if (picture) {
        this.tweens.add({ targets: picture, angle: 3, duration: 120, yoyo: true, repeat: 5 });
      }
    } else if (this.level === 2) {
      const bottle = this.contentRoot.list.find(
        (child) => child instanceof Phaser.GameObjects.Container &&
          Math.abs(child.x - (this.DESIGN_WIDTH / 2 - 112)) < 5,
      );
      if (bottle) {
        this.tweens.add({ targets: bottle, scale: 1.12, duration: 140, yoyo: true, repeat: 4 });
      }
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

    const overlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x3a2525, 0.64)
      .setDepth(100);

    this.add.text(width / 2, height / 2 - 20, message, {
      fontFamily: "Fredoka",
      fontSize: "26px",
      fontStyle: "700",
      color: "#FFD93D",
      align: "center",
      wordWrap: { width: width - 70 },
    }).setOrigin(0.5).setDepth(101);

    const nextLevel = this.level < 3 ? this.level + 1 : 1;
    // Use the plate itself as the hit target. This is more reliable on touch
    // devices than putting the interactive area on a Container.
    const button = this.add.container(width / 2, height / 2 + 75).setDepth(101);

    const shadow = this.add.graphics();
    shadow.fillStyle(C.goldDark, 0.85);
    shadow.fillRoundedRect(-96, -31 + 7, 192, 62, 14);

    const plate = this.add.graphics();
    plate.fillStyle(C.gold, 1);
    plate.lineStyle(4, C.ink, 1);
    plate.fillRoundedRect(-96, -31, 192, 62, 14);
    plate.strokeRoundedRect(-96, -31, 192, 62, 14);
    plate.setInteractive(
      new Phaser.Geom.Rectangle(-96, -31, 192, 62),
      Phaser.Geom.Rectangle.Contains,
      true,
    );

    const label = this.add.text(
      0,
      0,
      this.level < 3 ? "NEXT LEVEL  →" : "PLAY AGAIN  ↻",
      {
        fontFamily: "Nunito",
        fontSize: "19px",
        fontStyle: "900",
        color: "#3A2525",
      },
    ).setOrigin(0.5);

    button.add([shadow, plate, label]);

    const goNext = (): void => {
      if (!plate.input?.enabled) return;
      plate.disableInteractive();
      overlay.destroy();
      this.tweens.killTweensOf(button);
      this.scene.restart({ level: nextLevel });
    };

    plate.on("pointerup", goNext);
    plate.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scale: 0.97,
        duration: 70,
        yoyo: true,
        ease: "Quad.easeOut",
      });
    });

    this.tweens.add({
      targets: button,
      scale: 1.035,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
