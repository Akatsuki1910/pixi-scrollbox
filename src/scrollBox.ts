import {
  Container,
  FederatedPointerEvent,
  FederatedWheelEvent,
  Graphics,
} from "pixi.js";

export class ScrollBox extends Container {
  #items: Container[] = [];
  #itemContainer: Container;
  #margin: number;
  #scrollLock = false;
  #scrollInit = 0;

  constructor({ margin }: { margin: number }) {
    super();
    this.#margin = margin;

    const g = new Graphics({ alpha: 0.5 })
      .rect(0, 0, window.innerWidth, 300)
      .fill(0xff0000);
    this.addChild(g);

    this.#itemContainer = new Container();
    this.addChild(this.#itemContainer);

    this.interactive = true;
    this.on("mousedown", this.#onDown);
    this.on("touchstart", this.#onDown);
    this.on("mouseup", this.#onUp);
    this.on("touchend", this.#onUp);
    this.on("mouseupoutside", this.#onUp);
    this.on("touchendoutside", this.#onUp);
    this.on("mousemove", this.#onMove);
    this.on("touchmove", this.#onMove);
    this.on("wheel", this.#onWheel);
  }

  #setScrollMoveX(x: number) {
    this.#itemContainer.position.x = Math.min(
      0,
      Math.max(
        -(
          this.#items.length * this.#items[0].width +
          (this.#items.length - 1) * this.#margin
        ),
        x
      )
    );
  }

  #onDown(e: FederatedPointerEvent) {
    e.preventDefault();
    if (this.#scrollLock) return;

    this.#scrollLock = true;
    console.log("down");
  }

  #onUp(e: FederatedPointerEvent) {
    e.preventDefault();
    if (!this.#scrollLock) return;

    this.#scrollLock = false;
    console.log("up");
  }

  #onMove(e: FederatedPointerEvent) {
    e.preventDefault();
    if (!this.#scrollLock) return;

    console.log("move");
  }

  #onWheel(e: FederatedWheelEvent) {
    e.preventDefault();

    this.#setScrollMoveX(this.#itemContainer.x - e.deltaX);
  }

  #updateItemPos() {
    this.#items.forEach((item, i) => {
      item.x = i * (this.#margin + item.width);
    });
  }

  get margin() {
    return this.#margin;
  }

  set margin(value) {
    this.#margin = value;
  }

  setChild(items: Container[]) {
    this.#items = items;
    this.#items.forEach((item) => {
      this.#itemContainer.addChild(item);
    });
    this.#updateItemPos();
  }
}
