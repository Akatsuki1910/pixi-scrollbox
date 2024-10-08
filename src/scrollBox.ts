import {
  Container,
  FederatedPointerEvent,
  FederatedWheelEvent,
  Graphics,
  Sprite,
  Texture,
  Ticker,
  type AllFederatedEventMap,
} from "pixi.js";

const MAX_SPEED = 1000;

function easeOutQuart(x: number) {
  return 1 - Math.pow(1 - x, 4);
}

function reverseEaseOutQuart(x: number) {
  return 1 - Math.pow(1 - x, 1 / 4);
}

const ON_DOWN_LIST = [
  "mousedown",
  "touchstart",
] as const satisfies (keyof AllFederatedEventMap)[];
const ON_UP_LIST = [
  "mouseup",
  "touchend",
  "mouseupoutside",
  "touchendoutside",
] as const satisfies (keyof AllFederatedEventMap)[];
const ON_MOVE_LIST = [
  "mousemove",
  "touchmove",
] as const satisfies (keyof AllFederatedEventMap)[];
const ON_WHEEL_LIST = [
  "wheel",
] as const satisfies (keyof AllFederatedEventMap)[];

export class ScrollBox extends Container {
  #bg: Graphics;
  #items: Container[] = [];
  #itemContainer: Container;
  #margin: number;
  #scrollLock = false;
  #scrollStartX = 0;
  #moveSpeedX = 0;
  #extraTime = 0;
  #extraFirstEase = 0;

  constructor({
    margin,
    width,
    height,
  }: {
    margin: number;
    width: number;
    height: number;
  }) {
    super();
    this.#margin = margin;

    this.#bg = new Graphics({ alpha: 0.5 })
      .rect(0, 0, width, height)
      .fill(0xff0000);
    this.addChild(this.#bg);

    this.#itemContainer = new Container();
    this.addChild(this.#itemContainer);

    const mask = new Sprite(Texture.WHITE);
    mask.width = this.#bg.width;
    mask.height = this.#bg.height;
    this.addChild(mask);
    this.mask = mask;

    this.interactive = true;

    this.#eventSet(ON_DOWN_LIST, this.#onDown);
    this.#eventSet(ON_UP_LIST, this.#onUp);
    this.#eventSet(ON_MOVE_LIST, this.#onMove);
    this.#eventSet(ON_WHEEL_LIST, this.#onWheel);
  }

  #eventSet<T>(types: (keyof AllFederatedEventMap)[], fn: (e: T) => void) {
    types.forEach((type) => {
      this.addEventListener(type, (e) => {
        fn.bind(this)(e as T);
      });
    });
  }

  #validateSetContainerX(x: number) {
    this.#itemContainer.x = Math.min(
      0,
      Math.max(
        -(
          this.#items.length * this.#items[0].width +
          (this.#items.length - 1) * this.#margin -
          this.#bg.width
        ),
        x
      )
    );
  }

  #setScrollMoveX(x: number) {
    this.#validateSetContainerX(this.#itemContainer.x + x);
  }

  #onDown(e: FederatedPointerEvent) {
    if (this.#scrollLock) return;
    this.#scrollLock = true;

    this.#scrollStartX = e.clientX;
  }

  #onUp() {
    if (!this.#scrollLock) return;
    this.#scrollLock = false;

    this.#extraTime = reverseEaseOutQuart(
      Math.min(Math.abs(this.#moveSpeedX) / MAX_SPEED, 1)
    );
    this.#extraFirstEase = easeOutQuart(1 - this.#extraTime);
  }

  #onMove(e: FederatedPointerEvent) {
    if (!this.#scrollLock) return;

    const moveX = e.clientX - this.#scrollStartX;
    this.#setScrollMoveX(moveX);
    this.#moveSpeedX = moveX;
    this.#scrollStartX = e.clientX;
  }

  #onWheel(e: FederatedWheelEvent) {
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

  resize(width: number, height: number) {
    this.#bg.width = width;
    this.#bg.height = height;
    if (this.mask) {
      (this.mask as Sprite).width = this.#bg.width;
      (this.mask as Sprite).height = this.#bg.height;
    }
    this.#validateSetContainerX(this.#itemContainer.x);
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
