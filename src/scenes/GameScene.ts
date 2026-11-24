import Phaser from "phaser";
import { TopBar } from "../ui/TopBar";
import { getSafeArea, type SafeArea } from "../ui/SafeArea";

type LevelData = {
  title: string;
  instruction: string;
  room: number;
};

export class GameScene extends Phaser.Scene {
  private level = 1;
  private keyObject?: Phaser.GameObjects.Container;
  private keyTaken = false;
  private feedback?: Phaser.GameObjects.Text;
  private contentRoot!: Phaser.GameObjects.Container;
  private safeArea!: SafeArea;
  private topBar!: TopBar;

  private readonly DESIGN_WIDTH = 390;
  private readonly DESIGN_HEIGHT = 760;

  private levelData: Record<number, LevelData> = {
    1: { title: "THE MISSING KEY", instruction: "The key is hiding somewhere. Look closely!", room: 1 },
    2: { title: "A SLEEPY GUARD", instruction: "Find a way to distract the guard.", room: 2 },
    3: { title: "THE FOURTH DOOR", instruction: "Three doors. One sneaky way out.", room: 3 },
  };

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
      this.safeArea.top + Math.max(8, (this.safeArea.height - this.DESIGN_HEIGHT * scale) / 2),
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
    const top = this.safeArea.top;
    const bottom = height - this.safeArea.bottom;
    const floorY = top + (bottom - top) * 0.58;

    this.add.rectangle(width / 2, height / 2, width, height, 0x14243b).setDepth(-20);

    this.add.rectangle(width / 2, (top + floorY) / 2, width, floorY - top, 0x76503f)
      .setStrokeStyle(6, 0x4b2c20).setDepth(-19);

    this.add.rectangle(width / 2, (floorY + bottom) / 2, width, bottom - floorY, 0xf0c477)
      .setStrokeStyle(6, 0x6b432c).setDepth(-19);

    this.add.rectangle(width / 2, floorY + 2, width, 8, 0xd59a50).setDepth(-18);

    for (let x = 24; x < width; x += Math.max(42, width / 34)) {
      this.add.rectangle(x, top + 38, 3, Math.min(76, (floorY - top) * 0.52), 0x9d6c55, 0.42)
        .setDepth(-18);
    }

    this.add.text(width / 2, top + 22, "ROOM 01", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "900",
      color: "#fff4d6",
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(-17);
  }

  private createHud(): void {
    this.topBar = new TopBar(this, {
      level: this.level,
      onMenu: () => this.scene.start("MenuScene"),
      onHint: () => {
        this.showFeedback(
          this.level === 1
            ? "Hint: investigate the picture."
            : this.level === 2
              ? "Hint: the guard may be distracted."
              : "Hint: don't assume the exit has to be a door.",
        );
      },
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

  private addEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    alpha = 1,
  ): Phaser.GameObjects.Ellipse {
    const obj = this.add.ellipse(x, y, width, height, color, alpha);
    this.contentRoot.add(obj);
    return obj;
  }

  private addContainer(x: number, y: number): Phaser.GameObjects.Container {
    const obj = this.add.container(x, y);
    this.contentRoot.add(obj);
    return obj;
  }

  private createLevel(): void {
    const data = this.levelData[this.level] ?? this.levelData[3];

    this.addText(this.DESIGN_WIDTH / 2, 430, data.title, {
      fontFamily: "Fredoka",
      fontSize: "24px",
      fontStyle: "700",
      color: "#fff8e8",
      stroke: "#4a2a1e",
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.addText(this.DESIGN_WIDTH / 2, 466, data.instruction, {
      fontFamily: "Nunito",
      fontSize: "14px",
      fontStyle: "700",
      color: "#fff8e8",
      align: "center",
      wordWrap: { width: this.DESIGN_WIDTH - 44 },
    }).setOrigin(0.5);

    if (this.level === 1) this.createKeyPuzzle();
    else if (this.level === 2) this.createGuardPuzzle();
    else this.createDoorPuzzle();
  }

  private createKeyPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;
    const frame = this.addContainer(cx, 220);
    const shadow = this.addRect(3, 9, 172, 145, 0x422e28, 0.45);
    const picture = this.addRect(0, 0, 172, 145, 0xf0cf86).setStrokeStyle(10, 0x8b5838);
    const art = this.addText(0, -4, "🌄", { fontSize: "66px", fontFamily: "Arial" }).setOrigin(0.5);
    frame.add([shadow, picture, art]);

    const keyClue = this.addText(cx + 78, 293, "🔑", {
      fontSize: "18px",
      fontFamily: "Arial",
    }).setOrigin(0.5).setAlpha(0.9);

    const tapHint = this.addText(cx, 330, "👆  SOMETHING IS BEHIND THE PICTURE", {
      fontFamily: "Nunito",
      fontSize: "11px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 9, right: 9, top: 6, bottom: 6 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [frame, keyClue],
      y: "-=4",
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    picture.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      if (this.keyTaken) return;
      this.tweens.add({
        targets: frame,
        angle: 8,
        duration: 90,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          keyClue.setVisible(false);
          tapHint.setVisible(false);
          this.keyObject?.setVisible(true);
          this.showFeedback("You found it! Now drag the key to the EXIT door.");
        },
      });
    });

    const key = this.addContainer(cx + 78, 310);
    const keyShadow = this.addEllipse(3, 7, 38, 13, 0x332211, 0.3);
    const keyIcon = this.addText(0, 0, "🗝️", { fontSize: "36px", fontFamily: "Arial" }).setOrigin(0.5);
    key.add([keyShadow, keyIcon]);
    key.setVisible(false);
    key.setSize(46, 46).setInteractive({ useHandCursor: true });
    this.input.setDraggable(key);

    key.on("pointerdown", () => {
      if (!key.visible || this.keyTaken) return;
      this.showFeedback("Now drag the key to the EXIT door below.");
    });

    key.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const localX = (dragX - this.contentRoot.x) / this.contentRoot.scaleX;
      const localY = (dragY - this.contentRoot.y) / this.contentRoot.scaleY;
      key.setPosition(localX, localY);
    });

    key.on("dragend", () => {
      if (Math.abs(key.x - cx) < 85 && key.y > 575 && key.y < 750) {
        this.keyTaken = true;
        this.success("DOOR UNLOCKED!");
      } else {
        this.tweens.add({ targets: key, x: cx + 78, y: 310, duration: 250, ease: "Back" });
      }
    });
    this.keyObject = key;

    this.addRect(cx, 690, 138, 150, 0x4c342c).setStrokeStyle(8, 0x8d5a36);
    this.addCircle(cx + 38, 690, 6, 0xffd56b);
    this.addText(cx, 620, "DRAG KEY HERE", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
    }).setOrigin(0.5);
    this.addText(cx, 752, "EXIT", {
      fontFamily: "Nunito",
      fontSize: "14px",
      fontStyle: "900",
      color: "#fff7db",
    }).setOrigin(0.5);
  }

  private createGuardPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;
    this.addRect(cx, 220, 190, 130, 0x9f734e).setStrokeStyle(8, 0x70482e);
    this.addText(cx, 310, "DRAG BOTTLE TO GUARD", {
      fontFamily: "Nunito",
      fontSize: "12px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 9, right: 9, top: 6, bottom: 6 },
    }).setOrigin(0.5);
    this.addText(cx, 212, "😴", { fontSize: "82px", fontFamily: "Arial" }).setOrigin(0.5);

    const bottle = this.addText(cx - 110, 360, "🍼", {
      fontSize: "48px",
      fontFamily: "Arial",
    }).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });

    bottle.on("pointerdown", () => this.showFeedback("Maybe the guard needs a little drink?"));
    bottle.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      bottle.setPosition(
        (dragX - this.contentRoot.x) / this.contentRoot.scaleX,
        (dragY - this.contentRoot.y) / this.contentRoot.scaleY,
      );
    });
    bottle.on("dragend", () => {
      if (bottle.y < 290) {
        this.tweens.add({
          targets: bottle,
          x: cx,
          y: 220,
          duration: 400,
          onComplete: () => {
            this.addText(cx, 220, "😋", { fontSize: "78px" }).setOrigin(0.5);
            this.success("THE GUARD IS DISTRACTED!");
          },
        });
      } else {
        this.tweens.add({ targets: bottle, x: cx - 110, y: 360, duration: 250 });
      }
    });
    this.input.setDraggable(bottle);

    this.addText(cx, 665, "🚪", { fontSize: "100px" }).setOrigin(0.5);
    this.addText(cx, 605, "EXIT", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "900",
      color: "#fff7db",
    }).setOrigin(0.5);
  }

  private createDoorPuzzle(): void {
    const cx = this.DESIGN_WIDTH / 2;
    const doors = [cx - 112, cx, cx + 112];

    doors.forEach((x, index) => {
      const door = this.addContainer(x, 275);
      const panel = this.addRect(0, 0, 84, 148, 0x5a78a2).setStrokeStyle(6, 0x344e73);
      const knob = this.addCircle(28, 0, 5, 0xf5d28a);
      const number = this.addText(0, -48, String(index + 1), {
        fontFamily: "Nunito",
        fontSize: "18px",
        fontStyle: "900",
        color: "#ffffff",
      }).setOrigin(0.5);
      door.add([panel, knob, number]);

      panel.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.showFeedback("Nope! Think outside the room...");
        this.tweens.add({ targets: door, x: x + 5, duration: 45, yoyo: true, repeat: 3 });
      });
    });

    const title = this.addText(cx, 150, "THREE DOORS", {
      fontFamily: "Fredoka",
      fontSize: "30px",
      fontStyle: "700",
      color: "#ffffff",
      backgroundColor: "#684333",
      padding: { left: 12, right: 12, top: 7, bottom: 7 },
    }).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });

    const dragHint = this.addText(cx, 190, "↕  DRAG THIS DOWN", {
      fontFamily: "Nunito",
      fontSize: "12px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 9, right: 9, top: 6, bottom: 6 },
    }).setOrigin(0.5);

    const dropZone = this.addRect(cx, 410, 220, 58, 0x2f6f55, 0.75).setStrokeStyle(3, 0x8ee6b1);
    this.addText(cx, 410, "DROP HERE → SECRET EXIT", {
      fontFamily: "Nunito",
      fontSize: "12px",
      fontStyle: "900",
      color: "#ffffff",
    }).setOrigin(0.5);

    title.on("pointerdown", () => {
      this.showFeedback("Drag the THREE DOORS sign into the green SECRET EXIT area.");
      this.tweens.add({ targets: title, scale: 1.06, duration: 120, yoyo: true });
    });

    this.input.setDraggable(title);
    title.on("drag", (_pointer: Phaser.Input.Pointer, x: number, y: number) => {
      title.setPosition(
        (x - this.contentRoot.x) / this.contentRoot.scaleX,
        (y - this.contentRoot.y) / this.contentRoot.scaleY,
      );
      dragHint.setAlpha(0.25);
    });

    title.on("dragend", () => {
      if (title.y > 365 && Math.abs(title.x - cx) < 120) {
        dragHint.destroy();
        dropZone.destroy();
        this.success("YOU FOUND THE FOURTH DOOR!");
      } else {
        this.tweens.add({ targets: title, x: cx, y: 150, duration: 250, ease: "Back" });
        dragHint.setAlpha(1);
      }
    });

    this.addText(cx, 395, "Maybe the answer isn't a door...", {
      fontFamily: "Nunito",
      fontSize: "13px",
      color: "#fce7bd",
    }).setOrigin(0.5);
  }

  private showFeedback(message: string): void {
    this.feedback?.destroy();
    this.feedback = this.addText(this.DESIGN_WIDTH / 2, 540, message, {
      fontFamily: "Nunito",
      fontSize: "15px",
      fontStyle: "800",
      color: "#ffffff",
      backgroundColor: "#17243a",
      padding: { left: 14, right: 14, top: 9, bottom: 9 },
      align: "center",
      wordWrap: { width: this.DESIGN_WIDTH - 45 },
    }).setOrigin(0.5).setDepth(20);
  }

  private success(message: string): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x07111f, 0.72).setDepth(100);
    this.add.text(width / 2, height / 2 - 70, "🎉", { fontSize: "68px" }).setOrigin(0.5).setDepth(101);
    this.add.text(width / 2, height / 2 + 5, message, {
      fontFamily: "Fredoka",
      fontSize: "26px",
      fontStyle: "700",
      color: "#facc15",
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
        color: "#ffffff",
        backgroundColor: "#e88a23",
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
        Phaser.Utils.Array.GetRandom([0xfacc15, 0x60a5fa, 0xf472b6, 0x34d399]),
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