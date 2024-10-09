import { Container, Sprite, Graphics, Text } from "pixi.js";

const cloneParams = <T extends Container>(origin: T, clone: T) => {
  clone.position.set(origin.position.x, origin.position.y);
  clone.scale.set(origin.scale.x, origin.scale.y);
  clone.rotation = origin.rotation;
  clone.alpha = origin.alpha;
  clone.visible = origin.visible;
};

export const cloneContainer = (original: Container) => {
  const clone = new Container();

  cloneParams(original, clone);

  for (const child of original.children) {
    let childClone: Container | null = null;

    switch (true) {
      case child instanceof Sprite:
        childClone = new Sprite(child.texture);
        cloneParams(child, childClone);
        break;
      case child instanceof Graphics:
        childClone = child.clone();
        childClone.alpha = child.alpha;
        break;
      case child instanceof Text:
        childClone = new Text({ text: child.text, style: child.style });
        cloneParams(child, childClone);
        break;
      case child instanceof Container:
        childClone = cloneContainer(child);
        break;
    }

    if (childClone) {
      clone.addChild(childClone);
    }
  }

  return clone;
};
