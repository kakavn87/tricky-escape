import Phaser from "phaser";

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
  private levelData: Record<number, LevelData> = {
    1: {
      title: "THE MISSING KEY",
      instruction: "The key is hiding somewhere. Look closely!",
      room: 1,
    },
    2: {
      title: "A SLEEPY GUARD",
      instruction: "Find a way to distract the guard.",
      room: 2,
    },
    3: {
      title: "THE FOURTH DOOR",
      instruction: "Three doors. One sneaky way out.",
      room: 3,
    },
  };

  constructor() {
    super("GameScene");
  }

  init(data: { level?: number }): void {
    this.level = data.level ?? 1;
    this.keyTaken = false;
  }

  create(): void {
    this.drawRoom();
    this.createHud();
    this.createLevel();
  }

  private drawRoom(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x14243b);
    this.add.rectangle(width / 2, 430, width - 34, 520, 0xf0c477)
      .setStrokeStyle(7, 0x6b432c);
    this.add.rectangle(width / 2, 185, width - 34, 180, 0x76503f)
      .setStrokeStyle(7, 0x4b2c20);
    this.add.rectangle(width / 2, 510, width - 34, 8, 0xd59a50);
    this.add.rectangle(width / 2, 682, width - 34, 220, 0xb96f3f);
    this.add.rectangle(width / 2, 665, width - 34, 12, 0x744128);

    // Decorative wall panels.
    for (let x = 60; x < width - 20; x += 55) {
      this.add.rectangle(x, 145, 4, 80, 0x9d6c55, 0.45);
    }
    this.add.text(width / 2, 120, "ROOM 01", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "900",
      color: "#fff4d6",
      letterSpacing: 3,
    }).setOrigin(0.5);
  }

  private createHud(): void {
    const { width } = this.scale;
    this.add.text(22, 28, "✕", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#ffffff",
    }).setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start("MenuScene"));
    this.add.text(width / 2, 36, `LEVEL ${String(this.level).padStart(2, "0")}`, {
      fontFamily: "Nunito",
      fontSize: "17px",
      fontStyle: "900",
      color: "#ffffff",
      letterSpacing: 2,
    }).setOrigin(0.5);
    this.add.text(width - 22, 28, "💡", {
      fontFamily: "Arial",
      fontSize: "24px",
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      this.showFeedback(
        this.level === 1
          ? "1) Tap the picture. 2) Drag the key to the EXIT door."
          : this.level === 2
            ? "Drag the bottle onto the sleeping guard."
            : "Drag the THREE DOORS sign into the green SECRET EXIT area."
      );
    });
  }

  private createLevel(): void {
    const data = this.levelData[this.level] ?? this.levelData[3];
    const { width } = this.scale;

    this.add.text(width / 2, 548, data.title, {
      fontFamily: "Baloo 2",
      fontSize: "27px",
      fontStyle: "900",
      color: "#fff8e8",
      stroke: "#4a2a1e",
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 584, data.instruction, {
      fontFamily: "Nunito",
      fontSize: "14px",
      fontStyle: "700",
      color: "#fff8e8",
      align: "center",
      wordWrap: { width: width - 70 },
    }).setOrigin(0.5);

    if (this.level === 1) this.createKeyPuzzle();
    else if (this.level === 2) this.createGuardPuzzle();
    else this.createDoorPuzzle();
  }

  private createKeyPuzzle(): void {
    const { width } = this.scale;
    const frame = this.add.container(width / 2, 300);
    const shadow = this.add.rectangle(3, 9, 172, 145, 0x422e28, 0.45);
    const picture = this.add.rectangle(0, 0, 172, 145, 0xf0cf86).setStrokeStyle(10, 0x8b5838);
    const art = this.add.text(0, -4, "🌄", { fontSize: "66px", fontFamily: "Arial" }).setOrigin(0.5);
    frame.add([shadow, picture, art]);

    // Small visual clue: the key is visibly peeking out from behind the frame.
    const keyClue = this.add.text(width / 2 + 78, 373, "🔑", {
      fontSize: "18px",
      fontFamily: "Arial",
    }).setOrigin(0.5).setAlpha(0.9);

    const tapHint = this.add.text(width / 2, 410, "👆  SOMETHING IS BEHIND THE PICTURE", {
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

    const key = this.add.container(width / 2 + 78, 390);
    const keyShadow = this.add.ellipse(3, 7, 38, 13, 0x332211, 0.3);
    const keyIcon = this.add.text(0, 0, "🗝️", { fontSize: "36px", fontFamily: "Arial" }).setOrigin(0.5);
    key.add([keyShadow, keyIcon]);
    key.setVisible(false);
    key.setSize(46, 46).setInteractive({ useHandCursor: true });
    this.input.setDraggable(key);
    key.on("pointerdown", () => {
      if (!key.visible || this.keyTaken) return;
      this.showFeedback("Now drag the key to the EXIT door below.");
    });
    key.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      key.setPosition(dragX, dragY);
    });
    key.on("dragend", () => {
      if (Math.abs(key.x - width / 2) < 85 && key.y > 650 && key.y < 850) {
        this.keyTaken = true;
        this.success("DOOR UNLOCKED!");
      } else {
        this.tweens.add({ targets: key, x: width / 2 + 78, y: 390, duration: 250, ease: "Back" });
      }
    });
    this.keyObject = key;

    // Clear drop target for the key.
    this.add.rectangle(width / 2, 760, 138, 175, 0x4c342c).setStrokeStyle(8, 0x8d5a36);
    this.add.circle(width / 2 + 38, 760, 6, 0xffd56b);
    this.add.text(width / 2, 690, "DRAG KEY HERE", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
    }).setOrigin(0.5);
    this.add.text(width / 2, 864, "EXIT", {
      fontFamily: "Nunito",
      fontSize: "14px",
      fontStyle: "900",
      color: "#fff7db",
    }).setOrigin(0.5);
  }

  private createGuardPuzzle(): void {
    const { width } = this.scale;
    this.add.rectangle(width / 2, 300, 190, 130, 0x9f734e).setStrokeStyle(8, 0x70482e);
    this.add.text(width / 2, 390, "DRAG BOTTLE TO GUARD", {
      fontFamily: "Nunito",
      fontSize: "12px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 9, right: 9, top: 6, bottom: 6 },
    }).setOrigin(0.5);
    this.add.text(width / 2, 292, "😴", { fontSize: "82px", fontFamily: "Arial" }).setOrigin(0.5);
    const bottle = this.add.text(width / 2 - 110, 440, "🍼", {
      fontSize: "48px",
      fontFamily: "Arial",
    }).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });
    bottle.on("pointerdown", () => this.showFeedback("Maybe the guard needs a little drink?"));
    bottle.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      bottle.setPosition(dragX, dragY);
    });
    bottle.on("dragend", () => {
      if (bottle.y < 370) {
        this.tweens.add({
          targets: bottle,
          x: width / 2,
          y: 300,
          duration: 400,
          onComplete: () => {
            this.add.text(width / 2, 300, "😋", { fontSize: "78px" }).setOrigin(0.5);
            this.success("THE GUARD IS DISTRACTED!");
          },
        });
      } else {
        this.tweens.add({ targets: bottle, x: width / 2 - 110, y: 440, duration: 250 });
      }
    });
    this.input.setDraggable(bottle);
    this.add.text(width / 2, 760, "🚪", { fontSize: "100px" }).setOrigin(0.5);
    this.add.text(width / 2, 690, "EXIT", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "900",
      color: "#fff7db",
    }).setOrigin(0.5);
  }

  private createDoorPuzzle(): void {
    const { width } = this.scale;
    const doors = [width / 2 - 112, width / 2, width / 2 + 112];
    doors.forEach((x, index) => {
      const door = this.add.container(x, 340);
      const panel = this.add.rectangle(0, 0, 84, 148, 0x5a78a2).setStrokeStyle(6, 0x344e73);
      const knob = this.add.circle(28, 0, 5, 0xf5d28a);
      const number = this.add.text(0, -48, String(index + 1), {
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

    const title = this.add.text(width / 2, 218, "THREE DOORS", {
      fontFamily: "Baloo 2",
      fontSize: "30px",
      fontStyle: "800",
      color: "#ffffff",
      backgroundColor: "#684333",
      padding: { left: 12, right: 12, top: 7, bottom: 7 },
    }).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });

    const dragHint = this.add.text(width / 2, 258, "↕  DRAG THIS DOWN", {
      fontFamily: "Nunito",
      fontSize: "12px",
      fontStyle: "900",
      color: "#fff1c9",
      backgroundColor: "#17243a",
      padding: { left: 9, right: 9, top: 6, bottom: 6 },
    }).setOrigin(0.5);

    const dropZone = this.add.rectangle(width / 2, 485, 220, 58, 0x2f6f55, 0.75)
      .setStrokeStyle(3, 0x8ee6b1);
    this.add.text(width / 2, 485, "DROP HERE → SECRET EXIT", {
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
      title.setPosition(x, y);
      dragHint.setAlpha(0.25);
    });
    title.on("dragend", () => {
      if (title.y > 440 && Math.abs(title.x - width / 2) < 120) {
        dragHint.destroy();
        dropZone.destroy();
        this.success("YOU FOUND THE FOURTH DOOR!");
      } else {
        this.tweens.add({
          targets: title,
          x: width / 2,
          y: 218,
          duration: 250,
          ease: "Back",
        });
        dragHint.setAlpha(1);
      }
    });
    this.add.text(width / 2, 470, "Maybe the answer isn't a door...", {
      fontFamily: "Nunito",
      fontSize: "13px",
      color: "#fce7bd",
    }).setOrigin(0.5);
  }

  private showFeedback(message: string): void {
    this.feedback?.destroy();
    const { width } = this.scale;
    this.feedback = this.add.text(width / 2, 710, message, {
      fontFamily: "Nunito",
      fontSize: "15px",
      fontStyle: "800",
      color: "#ffffff",
      backgroundColor: "#17243a",
      padding: { left: 14, right: 14, top: 9, bottom: 9 },
      align: "center",
      wordWrap: { width: width - 45 },
    }).setOrigin(0.5);
  }

  private success(message: string): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x07111f, 0.72).setDepth(10);
    this.add.text(width / 2, height / 2 - 70, "🎉", { fontSize: "68px" }).setOrigin(0.5).setDepth(11);
    this.add.text(width / 2, height / 2 + 5, message, {
      fontFamily: "Baloo 2",
      fontSize: "26px",
      fontStyle: "800",
      color: "#facc15",
      align: "center",
      wordWrap: { width: width - 70 },
    }).setOrigin(0.5).setDepth(11);
    const next = this.add.text(width / 2, height / 2 + 105, this.level < 3 ? "NEXT LEVEL  →" : "PLAY AGAIN  ↻", {
      fontFamily: "Nunito",
      fontSize: "19px",
      fontStyle: "900",
      color: "#ffffff",
      backgroundColor: "#e88a23",
      padding: { left: 22, right: 22, top: 14, bottom: 14 },
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
    next.on("pointerdown", () => this.scene.restart({ level: this.level < 3 ? this.level + 1 : 1 }));
    this.tweens.add({ targets: next, scale: 1.05, duration: 650, yoyo: true, repeat: -1 });
    for (let i = 0; i < 18; i++) {
      const particle = this.add.circle(width / 2, height / 2, Phaser.Math.Between(3, 7), Phaser.Utils.Array.GetRandom([0xfacc15, 0x60a5fa, 0xf472b6, 0x34d399])).setDepth(12);
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
