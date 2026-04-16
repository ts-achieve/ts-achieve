import type { WebviewApi } from "vscode-webview";
import type { Writable, Z, W, Maybe, WindowZ, WorldZ, Message } from "./type";

// region constants

const constants = {
  world: {
    minx: -150,
    maxx: 150,
    miny: 0,
    maxy: 600,
    w: 300,
    h: 600,
  },
  star: {
    w: 40,
    h: 20,
  },
  bullet: {
    r: 2.5,
  },
} as const;

// region types

interface Everything {
  vscode: WebviewApi<State>;
  state: State;
  dom: Dom;
}

interface State {
  combo: number;
  achiever: Achiever;
  startamer: Tamer<Star>;
}

interface Sful {
  s: Z;
}

interface Vful {
  v: Z;
}

interface Movable extends Sful, Vful {
  move: (everything: Everything) => void;
}

interface Drawable<T extends readonly SVGElement[] = readonly SVGElement[]> {
  svgs: Maybe<T>;
}

const isDrawable = (x: unknown): x is Drawable => {
  return typeof x === "object" && !!x && "svgs" in x;
};

interface Collidable extends Sful {
  contains: (z: Z) => boolean;
}

interface Dom {
  worldSvg: SVGSVGElement;
  fps: SVGTextElement;
  comboBar: ComboBar;
}

interface ComboBar {
  fg: HTMLDivElement;
  bg: HTMLDivElement;
}

// region make

const makeEverything = (): Everything => {
  const dom = makeDom();
  return {
    vscode: acquireVsCodeApi(),
    state: makeState(),
    dom,
  };
};

const makeState = (): State => {
  return {
    combo: 0,
    achiever: makeAchiever(),
    startamer: makeStartamer(),
  };
};

const makeDom = (): Dom => {
  const worldSvg = document.getElementById("world") as unknown as SVGSVGElement;
  const fps = document.getElementById("fps") as unknown as SVGTextElement;
  fps.setAttribute(
    "transform",
    `translate(${constants.world.maxx - 5} ${constants.world.maxy - 5})`,
  );
  return {
    worldSvg,
    fps: document.getElementById("fps") as unknown as SVGTextElement,
    comboBar: {
      fg: document.getElementById("combo-fg")! as HTMLDivElement,
      bg: document.getElementById("combo-bg")! as HTMLDivElement,
    },
  };
};

// region achiever

interface Achiever extends Movable, Drawable<[SVGPolygonElement]>, Shooting {
  tamer: Tamer<Bullet>;
  turn: (everything: Everything) => void;
}

const makeAchiever = (): Achiever => {
  const achiever: Pick<Achiever, "s" | "v" | "tamer"> = {
    s: [constants.world.w / 2, constants.world.h / 2],
    v: [0, 0],
    tamer: makeBullettamer(),
  };

  const move = (): void => {
    achiever.s = [achiever.s[0] + achiever.v[0], achiever.s[1] + achiever.v[1]];
  };

  const turn = (): void => {
    achiever.v = toZ([1, rangle()]);
  };

  const shoot = (): Bullet => {
    return achiever.tamer.make("achiever", achiever.s);
  };

  return Object.assign(achiever, { move, turn, shoot, svgs: undefined });
};

const makeAchieverSvg = ({
  dom: { worldSvg },
}: Everything): SVGPolygonElement => {
  const achieverSvg = makeSvgElement("polygon");
  achieverSvg.setAttribute("id", "achiever");
  achieverSvg.setAttribute("points", "0,-20 -20,20 0,10 20,20");

  worldSvg.getElementById("g-achiever")!.appendChild(achieverSvg);

  return achieverSvg;
};

// region shooting, bullet

type ShooterId = "achiever" | number;

interface Shooting {
  shoot: (everything: Everything) => Bullet;
}

interface Bullet
  extends Movable, Drawable<[SVGCircleElement]>, Tamed, Collidable {
  shooterId: ShooterId;
}

const isBullet = (x: unknown): x is Bullet => {
  return isDrawable(x) && !!x.svgs && x.svgs[0].tagName === "circle";
};

const makeBullettamer = (): Tamer<Bullet> => {
  return makeTamerWith(
    (id: number, shooterId: ShooterId, [x, y]: Z): Bullet => {
      const bullet: Pick<Bullet, "s" | "v"> = {
        s: [x, y - 20],
        v: [0, -10],
      };

      const move = (): void => {
        bullet.s = [bullet.s[0] + bullet.v[0], bullet.s[1] + bullet.v[1]];
      };

      const contains = (z: Z) => {
        return (
          Math.sqrt((x - z[0]) ** 2 + (y - z[1]) ** 2) < constants.bullet.r
        );
      };

      return Object.assign(bullet, {
        id,
        shooterId,
        move,
        contains,
        svgs: undefined,
      });
    },
    (bullet) => untameDrawable(bullet),
  );
};

const makeBulletSvg = ({ dom: { worldSvg } }: Everything) => {
  const bulletSvg = makeSvgElement("circle");
  bulletSvg.classList.add("bullet");
  bulletSvg.setAttribute("r", constants.bullet.r.toString());
  bulletSvg.setAttribute("cx", "0");
  bulletSvg.setAttribute("cy", "0");

  worldSvg.getElementById("g-bullet")!.appendChild(bulletSvg);

  return bulletSvg;
};

// region taming

interface Tamed {
  id: number;
}

interface Tamer<T> {
  list: T[];
  peek: () => number;
  make: (...args: any[]) => T;
  unmake: (star: T) => number;
}

const untameDrawable = <T extends Tamed & Drawable>(drawable: T) => {
  if (drawable.svgs) {
    for (const svg of drawable.svgs) {
      svg.remove();
    }
  }

  return drawable.id;
};

const makeTamerWith = <T>(
  make: Tamer<T>["make"],
  unmake: Tamer<T>["unmake"],
) => {
  let id = 0;

  const list: T[] = [];

  const peek = () => id;

  return {
    list,
    peek,
    make: (...args: Parameters<Tamer<T>["make"]>) => {
      const tamed = make(id++, ...args);
      list.push(tamed);

      return tamed;
    },
    unmake: (tame: T) => {
      list.splice(list.indexOf(tame), 1);
      return unmake(tame);
    },
  };
};

// region star

interface Star
  extends
    Drawable<[SVGRectElement, SVGTextElement]>,
    Movable,
    Tamed,
    Collidable {
  code: number;
}

const isStar = (x: unknown): x is Star => {
  return (
    isDrawable(x) &&
    !!x.svgs &&
    x.svgs[0].tagName === "rect" &&
    x.svgs[1].tagName === "text"
  );
};

const makeStartamer = (): Tamer<Star> => {
  return makeTamerWith(
    (id: number, code: number): Star => {
      const s: WorldZ = [
        constants.world.minx + constants.world.w * Math.random(),
        -constants.star.h,
      ];
      const v: WorldZ = [0, 0.5];
      const move = () => {
        if (s[1] >= 150) {
          v[1] = 0;
        }
        s[0] += v[0];
        s[1] += v[1];
      };

      const contains = (z: Z) => {
        return (
          s[0] - constants.star.w / 2 < z[0] &&
          z[0] < s[0] + constants.star.w / 2 &&
          s[1] - constants.star.h / 2 < z[1] &&
          z[1] < s[1] + constants.star.h / 2
        );
      };

      return { id, code, s, v, move, contains, svgs: undefined };
    },
    (star) => untameDrawable(star),
  );
};

const makeStarSvgs = (
  worldSvg: SVGSVGElement,
  code: number,
): [SVGRectElement, SVGTextElement] => {
  try {
    const starSvg = makeSvgElement("rect");
    starSvg.setAttribute("x", (-constants.star.w / 2).toString());
    starSvg.setAttribute("y", (-constants.star.h / 2).toString());
    starSvg.setAttribute("width", constants.star.w.toString());
    starSvg.setAttribute("height", constants.star.h.toString());

    const textSvg = makeSvgElement("text");
    textSvg.innerHTML = code.toString();

    starSvg.classList.add("star");
    textSvg.classList.add("star");

    worldSvg.getElementById("g-star")!.append(starSvg, textSvg);

    return [starSvg, textSvg];
  } catch (error: any) {
    return err(error.stack);
  }
};

// region draw

const drawSvgAt = (svg: SVGElement, [x, y]: WorldZ) => {
  svg.setAttribute("transform", `translate(${x} ${y})`);
};

const drawPointSvg = (
  { dom: { worldSvg } }: Everything,
  z: WorldZ,
): SVGCircleElement => {
  const pointSvg = makeSvgElement("circle");
  pointSvg.classList.add("point");
  pointSvg.setAttribute("r", "2.5");
  drawSvgAt(pointSvg, z);

  worldSvg.appendChild(pointSvg);

  return pointSvg;
};

// region specific util

const windowToWorld = ([x, y]: WindowZ): WorldZ => {
  const clientW = window.innerWidth;
  const clientH = window.innerHeight;

  return [
    relerp(0, clientW)(constants.world.minx, constants.world.maxx)(x),
    relerp(0, clientH)(constants.world.miny, constants.world.maxy)(y),
  ];
};

interface Directional {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const checkBounds = (thing: Sful, margin?: Partial<Directional>) => {
  if (thing.s[0] < constants.world.minx - (margin?.left ?? 0)) {
    return "left";
  } else if (thing.s[0] > constants.world.maxx + (margin?.right ?? 0)) {
    return "right";
  } else if (thing.s[1] < constants.world.miny - (margin?.top ?? 0)) {
    return "top";
  } else if (thing.s[1] > constants.world.maxy + (margin?.bottom ?? 0)) {
    return "bottom";
  }
};

const clampToWorld = (thing: Sful) => {
  thing.s = [
    clamp(constants.world.minx, constants.world.maxx)(thing.s[0]),
    clamp(constants.world.miny, constants.world.maxy)(thing.s[1]),
  ];
};

// region general util

const log = (...args: any[]) => {
  try {
    const logDiv = document.getElementById("log")!;
    logDiv.innerHTML =
      `<p>${new Date().toLocaleTimeString()}: ${args.join(" ")}</p>` +
      logDiv.innerHTML;
    Array.from(logDiv.childNodes)
      .slice(200)
      .forEach((node) => node.remove());
  } catch (error: any) {
    log(error.stack);
    console.log(error.stack);
  }
};

const err = (...args: any[]) => {
  const logDiv = document.getElementById("log")!;
  logDiv.innerHTML =
    `<p>${new Date().toLocaleTimeString()}: FATAL ERROR ${args.join(" ")}</p>` +
    logDiv.innerHTML;
  throw new Error();
};

const mod = (n: number, d: number) => ((n % d) + d) % d;

const stringify = (x: unknown) =>
  ["string", "number"].includes(typeof x) ? x : JSON.stringify(x, null, 2);

const maybeGet = (x: object, key: keyof any, fallback: any = undefined) =>
  key in x ? x[key as keyof typeof x] : fallback;

const clamp = (min: number, max: number) => (n: number) =>
  Math.min(max, Math.max(min, n));

const unpx = (x: string) =>
  parseFloat(x.slice(-2) === "px" ? x.slice(0, -2) : x);

const clone = <T extends readonly any[]>(xs: T) => {
  const ys = [];
  for (let i = 0; i < xs.length; i++) {
    ys.push(xs[i]);
  }
  return ys as unknown as Writable<T>;
};

const makeSvgElement = <K extends keyof SVGElementTagNameMap>(
  qualifiedName: K,
): SVGElementTagNameMap[K] => {
  return document.createElementNS("http://www.w3.org/2000/svg", qualifiedName);
};

const rangle = () => 2 * Math.PI * Math.random();

const toZ = ([r, a]: W): Z => [r * Math.cos(a), r * Math.sin(a)];
const toW = ([x, y]: Z): W => [Math.sqrt(x ** 2 + y ** 2), Math.atan2(y, x)];

const lerp = (start: number, end: number) => (t: number) =>
  start + (end - start) * t;

const unlerp = (start: number, end: number) => (value: number) =>
  (value - start) / (end - start);

const relerp =
  (start0: number, end0: number) =>
  (start1: number, end1: number) =>
  (value0: number) =>
    start1 + (value0 - start0) * ((end1 - start1) / (end0 - start0));

// region loop

const tick = (now: number, last: number, everything: Everything): void => {
  try {
    const achiever = everything.state.achiever;

    if (now % 20 < now - last) {
      achiever.shoot(everything);
    }

    if (now % 500 < now - last) {
      achiever.turn(everything);
    }

    achiever.move(everything);

    for (const bullet of achiever.tamer.list) {
      bullet.move(everything);

      if (checkBounds(bullet, { top: 10 }) !== undefined) {
        achiever.tamer.unmake(bullet);
      }
    }

    for (const star of everything.state.startamer.list) {
      star.move(everything);

      if (checkBounds(star) === "bottom") {
        everything.state.startamer.unmake(star);
      }
      for (const bullet of achiever.tamer.list) {
        if (star.contains(bullet.s)) {
          achiever.tamer.unmake(bullet);
          everything.state.startamer.unmake(star);
        }
      }
    }

    clampToWorld(achiever);

    everything.state.combo = clamp(0, 100)(everything.state.combo - 0.1);

    if (now % 250 < now - last) {
      redraw(everything, 1000 / (now - last));
    } else {
      redraw(everything);
    }

    requestAnimationFrame((future) => tick(future, now, everything));
  } catch (error: any) {
    log(error.stack);
  }
};

const redraw = (everything: Everything, fps?: number): void => {
  everything.state.achiever.svgs ??= [makeAchieverSvg(everything)];
  const achieverSvg = everything.state.achiever.svgs[0];
  drawSvgAt(achieverSvg, everything.state.achiever.s);

  for (const bullet of everything.state.achiever.tamer.list) {
    bullet.svgs ??= [makeBulletSvg(everything)];
    drawSvgAt(bullet.svgs[0], bullet.s);
  }

  for (const star of everything.state.startamer.list) {
    star.svgs ??= makeStarSvgs(everything.dom.worldSvg, star.code);
    drawSvgAt(star.svgs[0], star.s);
    drawSvgAt(star.svgs[1], star.s);
  }

  everything.dom.comboBar.fg.style.width =
    unpx(getComputedStyle(everything.dom.comboBar.bg).width) *
      (everything.state.combo / 100) +
    "px";

  document.documentElement.style.setProperty(
    "--combo-width",
    `${everything.state.combo}%`,
  );

  if (fps !== undefined) {
    everything.dom.fps.innerHTML = fps.toFixed(2);
  }
};

const receiveMessage = (e: MessageEvent<Message>, everything: Everything) => {
  try {
    const message = e.data;
    switch (message.type) {
      case "star": {
        everything.state.startamer.list.push(
          everything.state.startamer.make(message.value[0]),
        );
        everything.state.combo++;
        break;
      }
      default: {
        log("implement me");
      }
    }
  } catch (error: any) {
    log(error, error.stack);
  }
};

window.onload = () => {
  try {
    log("starting up…");

    const everything = makeEverything();

    drawPointSvg(everything, [0, 0]);
    drawPointSvg(everything, [0, 20]);
    drawPointSvg(everything, [-10, 20]);
    drawPointSvg(everything, [10, 20]);
    drawPointSvg(everything, [constants.world.minx, constants.world.miny]);
    drawPointSvg(everything, [constants.world.maxx, constants.world.miny]);
    drawPointSvg(everything, [constants.world.minx, constants.world.maxy]);
    drawPointSvg(everything, [constants.world.maxx, constants.world.maxy]);

    window.addEventListener("message", (e) => receiveMessage(e, everything));

    requestAnimationFrame((now) => tick(now, 0, everything));
  } catch (error: any) {
    log(error, error.stack);
  }
};
