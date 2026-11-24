import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Warm casual-game room: cream striped wall + wooden floor.
    this.add.rectangle(cx, height / 2, width, height, 0xfaf3e4);

    const wall = this.add.graphics();
    const stripeW = 38;
    for (let x = -stripeW; x < width + stripeW; x += stripeW * 2) {
      wall.fillStyle(0xf3e6cd, 1);
      wall.fillRect(x, 0, stripeW, height * 0.78);
    }

    // Wooden floor.
    const floorY = height * 0.78;
    const floor = this.add.graphics();
    floor.fillStyle(0xd99a58, 1);
    floor.fillRect(0, floorY, width, height - floorY);
    floor.lineStyle(3, 0x9a5d35, 0.8);
    floor.lineBetween(0, floorY, width, floorY);

    for (let y = floorY + 42; y < height; y += 42) {
      floor.lineStyle(2, 0xb8743e, 0.7);
      floor.lineBetween(0, y, width, y);
    }
    for (let x = -width; x < width * 2; x += 58) {
      floor.lineStyle(2, 0xb8743e, 0.7);
      floor.lineBetween(x, floorY, x + 58, height);
    }

    // Small top utility row.
    this.drawMenuButton(cx - 145, 62);
    this.drawLightButton(cx + 145, 62);

    // Main title.
    this.add.text(cx, 70, "TRICKY ESCAPE", {
      fontFamily: "Fredoka",
      fontSize: "36px",
      fontStyle: "700",
      color: "#2D2424",
      stroke: "#FFF9EF",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(cx, 112, "Tiny puzzles. Unexpected solutions.", {
      fontFamily: "Nunito",
      fontSize: "16px",
      fontStyle: "800",
      color: "#6d5141",
    }).setOrigin(0.5);

    // Hero illustration: a tilted framed picture hiding a key.
    const hero = this.add.container(cx, 310);
    hero.setAngle(-3);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x8d5b3e, 0.20);
    shadow.fillRoundedRect(-133, -126, 266, 252, 14);

    const frame = this.add.graphics();
    frame.fillStyle(0x7c432c, 1);
    frame.lineStyle(4, 0x2d2424, 1);
    frame.fillRoundedRect(-140, -132, 280, 264, 14);
    frame.strokeRoundedRect(-140, -132, 280, 264, 14);

    const inner = this.add.graphics();
    inner.fillStyle(0xf7d58f, 1);
    inner.fillRoundedRect(-121, -113, 242, 226, 5);
    inner.lineStyle(3, 0x2d2424, 0.65);
    inner.strokeRoundedRect(-121, -113, 242, 226, 5);

    // Simple landscape illustration.
    const scene = this.add.graphics();
    scene.fillStyle(0x9ddcf2, 1);
    scene.fillRect(-113, -105, 226, 138);
    scene.fillStyle(0xffd45a, 1);
    scene.fillCircle(63, -66, 22);
    scene.fillStyle(0x78aeb7, 1);
    scene.fillTriangle(-105, 32, -25, -42, 35, 32);
    scene.fillStyle(0x5f8791, 1);
    scene.fillTriangle(-22, 32, 42, -54, 112, 32);
    scene.fillStyle(0x6fae4f, 1);
    scene.fillTriangle(-113, 33, -50, -5, 15, 33);
    scene.fillStyle(0x3f7d45, 1);
    scene.fillRect(-113, 32, 226, 30);

    // Key peeking out from behind the frame.
    const key = this.add.graphics();
    key.lineStyle(8, 0x2d2424, 1);
    key.strokeCircle(108, 48, 17);
    key.lineStyle(6, 0xf7b52b, 1);
    key.strokeCircle(108, 48, 17);
    key.lineStyle(8, 0xf7b52b, 1);
    key.lineBetween(96, 60, 58, 92);
    key.lineBetween(58, 92, 48, 82);
    key.lineBetween(65, 86, 55, 76);
    key.fillStyle(0xffd93d, 1);
    key.fillCircle(108, 48, 8);

    hero.add([shadow, frame, inner, scene, key]);

    // Play CTA.
    const button = this.add.container(cx, height - 130);
    const bShadow = this.add.graphics();
    bShadow.fillStyle(0x8f4d2e, 1);
    bShadow.fillRoundedRect(-128, -32 + 8, 256, 64, 12);

    const bPlate = this.add.graphics();
    bPlate.fillStyle(0xffc044, 1);
    bPlate.lineStyle(4, 0x2d2424, 1);
    bPlate.fillRoundedRect(-128, -32, 256, 64, 12);
    bPlate.strokeRoundedRect(-128, -32, 256, 64, 12);

    const play = this.add.text(0, -2, "PLAY", {
      fontFamily: "Fredoka",
      fontSize: "28px",
      fontStyle: "700",
      color: "#2D2424",
    }).setOrigin(0.5);

    button.add([bShadow, bPlate, play]);
    bPlate.setInteractive(new Phaser.Geom.Rectangle(-128, -32, 256, 64), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => {
        this.tweens.add({
          targets: button,
          scale: 0.95,
          duration: 70,
          yoyo: true,
          onComplete: () => this.scene.start("GameScene", { level: 1 }),
        });
      });

    this.add.text(cx, height - 42, "Can you find the trick?", {
      fontFamily: "Nunito",
      fontSize: "14px",
      fontStyle: "800",
      color: "#7b573f",
    }).setOrigin(0.5);
  }

  private drawMenuButton(x: number, y: number): void {
    const g = this.add.graphics();
    g.fillStyle(0xfffbf3, 1);
    g.lineStyle(3, 0x2d2424, 1);
    g.fillRoundedRect(x - 27, y - 27, 54, 54, 14);
    g.strokeRoundedRect(x - 27, y - 27, 54, 54, 14);
    g.lineStyle(4, 0x2d2424, 1);
    g.lineBetween(x - 11, y - 9, x + 11, y - 9);
    g.lineBetween(x - 11, y, x + 11, y);
    g.lineBetween(x - 11, y + 9, x + 11, y + 9);
  }

  private drawLightButton(x: number, y: number): void {
    const g = this.add.graphics();
    g.fillStyle(0xffd93d, 1);
    g.lineStyle(3, 0x2d2424, 1);
    g.fillRoundedRect(x - 27, y - 27, 54, 54, 14);
    g.strokeRoundedRect(x - 27, y - 27, 54, 54, 14);

    g.lineStyle(3, 0x2d2424, 1);
    g.strokeCircle(x, y - 4, 11);
    g.lineBetween(x - 7, y + 7, x + 7, y + 7);
    g.lineBetween(x - 5, y + 12, x + 5, y + 12);

    g.lineStyle(2, 0x2d2424, 0.8);
    g.lineBetween(x, y - 24, x, y - 18);
    g.lineBetween(x - 18, y - 15, x - 14, y - 11);
    g.lineBetween(x + 18, y - 15, x + 14, y - 11);
  }
}
