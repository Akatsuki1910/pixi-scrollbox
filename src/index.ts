import { Application, Container, Graphics, Text } from "pixi.js";
import { ScrollBox } from "./scrollBox";

const app = new Application();

await app.init({
  background: "#1099bb",
  resizeTo: window,
  antialias: true,
});
app.canvas.addEventListener("wheel", (e) => e.preventDefault(), {
  passive: false,
});

document.body.appendChild(app.canvas);

const createItem = (i: number) => {
  const c = new Container();
  const g = new Graphics({ alpha: 0.5 }).rect(0, 0, 100, 100).fill(0x00ff00);
  const t = new Text({ text: i });
  c.addChild(g);
  c.addChild(t);
  return c;
};

const items = Array.from({ length: 100 }, (_, i) => createItem(i));
const items2 = Array.from({ length: 3 }, (_, i) => createItem(i));

const HEIGHT = 300;

const s = new ScrollBox({
  margin: 10,
  width: window.innerWidth,
  height: HEIGHT,
});
app.stage.addChild(s);
s.setChild(items);

const s2 = new ScrollBox({
  margin: 10,
  width: window.innerWidth,
  height: HEIGHT,
  loop: true,
});
app.stage.addChild(s2);
s2.position.y = HEIGHT + 10;
s2.setChild(items2);

window.addEventListener("resize", () => {
  s.resize(window.innerWidth, HEIGHT);
  s2.resize(window.innerWidth, HEIGHT);
});

app.ticker.add((delta) => {
  s.animation(delta);
  s2.animation(delta);
});
