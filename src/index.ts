import { Application, Container, Graphics, Text } from "pixi.js";
import { ScrollBox } from "./scrollBox";

const app = new Application();

await app.init({ background: "#1099bb", resizeTo: window, antialias: true });

document.body.appendChild(app.canvas);

const items = Array.from({ length: 100 }, (_, i) => {
  const c = new Container();
  const g = new Graphics({ alpha: 0.5 }).rect(0, 0, 100, 100).fill(0x00ff00);
  const t = new Text({ text: i });
  c.addChild(g);
  c.addChild(t);
  return c;
});

const s = new ScrollBox({ margin: 10 });
app.stage.addChild(s);
s.setChild(items);

app.ticker.add((delta) => {
  s.animation(delta);
});
