import {
  Container,
  FederatedPointerEvent,
  FederatedWheelEvent,
  Graphics,
  Ticker,
} from "pixi.js";

const MAX_SPEED = 1000;

function easeOutQuart(x: number) {
  return 1 - Math.pow(1 - x, 4);
}

function reverseEaseOutQuart(x: number) {
  return 1 - Math.pow(1 - x, 1 / 4);
}

export class ScrollBox extends Container {
  #items: Container[] = [];
  #itemContainer: Container;
  #margin: number;
  #scrollLock = false;
  #scrollStartX = 0;
  #moveSpeedX = 0;
  #extraTime = 0;
  #extraFirstEase = 0;

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
        this.#itemContainer.x + x
      )
    );
  }

  #onDown(e: FederatedPointerEvent) {
    e.preventDefault();
    if (this.#scrollLock) return;
    this.#scrollLock = true;

    this.#scrollStartX = e.clientX;
  }

  #onUp(e: FederatedPointerEvent) {
    e.preventDefault();
    if (!this.#scrollLock) return;
    this.#scrollLock = false;

    this.#extraTime = reverseEaseOutQuart(
      Math.min(Math.abs(this.#moveSpeedX) / MAX_SPEED, 1)
    );
    this.#extraFirstEase = easeOutQuart(1 - this.#extraTime);
  }

  #onMove(e: FederatedPointerEvent) {
    e.preventDefault();
    if (!this.#scrollLock) return;

    const moveX = e.clientX - this.#scrollStartX;
    this.#setScrollMoveX(moveX);
    this.#moveSpeedX = moveX;
    this.#scrollStartX = e.clientX;
  }

  #onWheel(e: FederatedWheelEvent) {
    e.preventDefault();

    this.#setScrollMoveX(-e.deltaX);
  }

  #updateItemPos() {
    this.#items.forEach((item, i) => {
      item.x = i * (this.#margin + item.width);
    });
  }

  setChild(items: Container[]) {
    this.#items = items;
    this.#items.forEach((item) => {
      this.#itemContainer.addChild(item);
    });
    this.#updateItemPos();
  }

  animation(delta: Ticker) {
    if (this.#extraTime) {
      const moveSpeedX =
        (this.#moveSpeedX * easeOutQuart(this.#extraTime)) /
        this.#extraFirstEase;
      this.#setScrollMoveX(moveSpeedX);
      this.#extraTime -= delta.deltaTime / MAX_SPEED;

      if (this.#extraTime <= 0.0001) {
        this.#moveSpeedX = 0;
        this.#extraTime = 0;
      }
    }
  }
}
