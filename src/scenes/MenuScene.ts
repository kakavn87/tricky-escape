import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    this.add.rectangle(cx, height / 2, width, height, 0x17243a);
    this.add.circle(cx, 230, 94, 0x263e5e).setStrokeStyle(4, 0x3e6085);
    this.add.text(cx, 194, "🗝️", {
      fontFamily: "Arial",
      fontSize: "76px",
    }).setOrigin(0.5);
    this.add.text(cx, 355, "TRICKY", {
      fontFamily: "Baloo 2",
      fontSize: "58px",
      fontStyle: "800",
      color: "#ffffff",
      stroke: "#0b1220",
      strokeThickness: 7,
    }).setOrigin(0.5);
    this.add.text(cx, 405, "ESCAPE", {
      fontFamily: "Baloo 2",
      fontSize: "58px",
      fontStyle: "800",
      color: "#facc15",
      stroke: "#0b1220",
      strokeThickness: 7,
    }).setOrigin(0.5);
    this.add.text(cx, 470, "Tiny puzzles. Unexpected solutions.", {
      fontFamily: "Nunito",
      fontSize: "17px",
      fontStyle: "700",
      color: "#c8d5e6",
    }).setOrigin(0.5);

    const button = this.add.container(cx, 625);
    const shadow = this.add.rectangle(0, 9, 230, 72, 0xa34d15, 0.9).setOrigin(0.5);
    const plate = this.add.rectangle(0, 0, 230, 72, 0xffb12b).setOrigin(0.5)
      .setStrokeStyle(3, 0xffd56b);
    const label = this.add.text(0, -2, "PLAY", {
      fontFamily: "Baloo 2",
      fontSize: "34px",
      fontStyle: "800",
      color: "#38200c",
    }).setOrigin(0.5);
    button.add([shadow, plate, label]);
    plate.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scale: 0.94,
        duration: 70,
        yoyo: true,
        onComplete: () => this.scene.start("GameScene", { level: 1 }),
      });
    });

    this.add.text(cx, height - 58, "A little brain teaser adventure", {
      fontFamily: "Nunito",
      fontSize: "13px",
      color: "#8295af",
    }).setOrigin(0.5);
  }
}
