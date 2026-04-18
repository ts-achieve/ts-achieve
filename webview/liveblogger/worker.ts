import type {
  Writable,
  WorldZ,
  WindowZ,
  WorldW,
  Message,
  Dom,
  Drawable,
  Everything,
  Sful,
  State,
  Achiever,
  Bullet,
  Directional,
  Star,
  Tamed,
  Tamer,
  Vful,
  Behave,
  BulletOptions,
  Bullettamer,
  Startamer,
  PrependParameter,
  Maybe,
} from "./type";

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

const isDrawable = (x: unknown): x is Drawable => {
  return typeof x === "object" && !!x && "svgs" in x;
};

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
    now: -1,
    combo: 0,
    achiever: makeAchiever(),
    startamer: makeStartamer(),
    bullettamer: makeBullettamer(),
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
    tell: document.getElementById("tell") as unknown as SVGTextElement,
    comboBar: {
      fg: document.getElementById("combo-fg")! as HTMLDivElement,
      bg: document.getElementById("combo-bg")! as HTMLDivElement,
    },
  };
};

// region achiever

const makeAchiever = (): Achiever => {
  const achiever: Sful & Vful = {
    s: [0, constants.world.h / (4 / 3)],
    v: [0, 0],
  };

  const move = (): void => {
    achiever.s = [achiever.s[0] + achiever.v[0], achiever.s[1] + achiever.v[1]];
  };

  const turn = (): void => {
    achiever.v = toZ([1, rangle()]);
  };

  const shoot = (tamer: Bullettamer): Bullet => {
    return tamer.make({
      shooterId: "achiever",
      s: [achiever.s[0], achiever.s[1] - 20],
      v: [0, -20],
    });
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

// region bullet

const isBullet = (x: unknown): x is Bullet => {
  return isDrawable(x) && !!x.svgs && x.svgs[0].tagName === "circle";
};

const makeBullettamer = (): Bullettamer => {
  return makeTamerWith(
    (tamedId: number, { s, v, shooterId }: BulletOptions): Bullet => {
      const bullet: Pick<Bullet, "s" | "v"> = {
        s: [...s],
        v: [...v],
      };

      const move = (_now: number): void => {
        bullet.s[0] += bullet.v[0];
        bullet.s[1] += bullet.v[1];
      };

      const contains = (z: WorldZ) => {
        return (
          Math.sqrt((bullet.s[0] - z[0]) ** 2 + (bullet.s[1] - z[1]) ** 2) <
          constants.bullet.r
        );
      };

      return Object.assign(bullet, {
        tamedId,
        shooterId: shooterId,
        move,
        contains,
        svgs: undefined,
      });
    },
    (bullet) => removeDrawable(bullet),
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

const removeDrawable = <T extends Tamed & Drawable>(drawable: T) => {
  if (drawable.svgs) {
    for (const svg of drawable.svgs) {
      svg.classList.add("dying");
      if (svg.getAnimations().length) {
        const [x, y] = extractZFromTranslate(svg)!;
        svg.style.transformOrigin = `${x}px ${y}px`;
        svg.onanimationend = () => svg.remove();
      } else {
        svg.remove();
      }
    }
  }

  return drawable.tamedId;
};

const makeTamerWith = <T, O>(
  makelike: PrependParameter<number, Tamer<T, O>["make"]>,
  unmakelike: Tamer<T, O>["unmake"],
): Tamer<T, O> => {
  let id = 0;

  const list: T[] = [];

  return {
    list,
    peek: () => id,
    make: (options) => {
      const tamed = makelike(id++, options);
      list.push(tamed);

      return tamed;
    },
    unmake: (tamed) => {
      list.splice(list.indexOf(tamed), 1);
      return unmakelike(tamed);
    },
  };
};

// region star

const normedDistance = (
  [x0, y0]: WorldZ,
  [x1, y1]: WorldZ,
  norm: number = 1,
): WorldZ => {
  const [zx, zy] = [x1 - x0, y1 - y0];
  const d = Math.sqrt(zx ** 2 + zy ** 2);
  return [(zx * norm) / d, (zy * norm) / d];
};

const isStar = (x: unknown): x is Star => {
  return (
    isDrawable(x) &&
    !!x.svgs &&
    x.svgs[0].tagName === "rect" &&
    x.svgs[1].tagName === "text"
  );
};

const makeStartamer = (): Startamer => {
  try {
    return makeTamerWith(
      (tamedId, { code, startTime, achiever }): Star => {
        const star: Pick<Star, "s" | "v"> = {
          s: [
            constants.world.minx + constants.world.w * Math.random(),
            -constants.star.h,
          ],
          v: [0, 0.5],
        };

        const contains = (z: WorldZ) => {
          return (
            star.s[0] - constants.star.w / 2 < z[0] &&
            z[0] < star.s[0] + constants.star.w / 2 &&
            star.s[1] - constants.star.h / 2 < z[1] &&
            z[1] < star.s[1] + constants.star.h / 2
          );
        };

        const shoot = (tamer: Bullettamer): Bullet => {
          return tamer.make({
            s: star.s,
            v: normedDistance(star.s, achiever.s, 4),
            shooterId: tamedId,
          });
        };

        return Object.assign(star, {
          tamedId: tamedId,
          code: code,
          startTime: startTime,
          move: (_now: number) => {
            if (star.s[1] >= 150) {
              star.v[1] = 0;
            }
            star.s[0] += star.v[0];
            star.s[1] += star.v[1];
          },
          contains,
          shoot,
          svgs: undefined,
        });
      },
      (star) => removeDrawable(star),
    );
  } catch (e: any) {
    return err(e.stack);
  }
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
  } catch (e: any) {
    return err(e.stack);
  }
};

// region draw

const extractArgumentFromTranslate = (svg: SVGElement): Maybe<string> => {
  const transform = getComputedStyle(svg).transform;
  if (transform.startsWith("matrix(") && transform.endsWith(")")) {
    return transform.slice(7, -1);
  }
};

const extractZFromTranslate = (svg: SVGElement): Maybe<WorldZ> => {
  const argument = extractArgumentFromTranslate(svg);
  if (argument) {
    const [xpx, ypx] = argument.split(" ");
    return [unpx(xpx), unpx(ypx)];
  }
};

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
    clamp(constants.world.h / 2, constants.world.maxy)(thing.s[1]),
  ];
};

// region general util

const log = (...args: any[]): void => {
  try {
    const logDiv = document.getElementById("log")!;
    logDiv.innerHTML =
      `<p>${new Date().toLocaleTimeString()}: ${args.join(" ")}</p>` +
      logDiv.innerHTML;
    Array.from(logDiv.childNodes)
      .slice(200)
      .forEach((node) => node.remove());
  } catch (e: any) {
    log(e.stack);
    console.log(e.stack);
  }
};

const err = (...args: any[]): never => {
  const logDiv = document.getElementById("log")!;
  logDiv.innerHTML =
    `<p>${new Date().toLocaleTimeString()}: FATAL ERROR ${args.join(" ")}</p>` +
    logDiv.innerHTML;
  throw new Error();
};

const mod = (n: number, d: number) => ((n % d) + d) % d;

const show = (x: unknown) =>
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

const toZ = ([r, a]: WorldW): WorldZ => [r * Math.cos(a), r * Math.sin(a)];
const toW = ([x, y]: WorldZ): WorldW => [
  Math.sqrt(x ** 2 + y ** 2),
  Math.atan2(y, x),
];

const lerp = (start: number, end: number) => (t: number) =>
  start + (end - start) * t;

const unlerp = (start: number, end: number) => (value: number) =>
  (value - start) / (end - start);

const relerp =
  (start0: number, end0: number) =>
  (start1: number, end1: number) =>
  (value0: number) =>
    start1 + (value0 - start0) * ((end1 - start1) / (end0 - start0));

// region tick

const tick = (now: number, last: number, everything: Everything): void => {
  try {
    everything.state.now = now;

    const { achiever, bullettamer } = everything.state;

    if (now % 20 < now - last) {
      achiever.shoot(bullettamer);
    }

    if (now % 500 < now - last) {
      achiever.turn(everything);
    }

    achiever.move(now);

    for (const bullet of bullettamer.list) {
      bullet.move(now);

      if (checkBounds(bullet, { top: 10 }) !== undefined) {
        bullettamer.unmake(bullet);
      }
    }

    for (const star of everything.state.startamer.list) {
      star.move(now);

      if ((now - star.startTime) % 250 < now - last) {
        star.shoot(bullettamer);
      }

      if (checkBounds(star) === "bottom") {
        everything.state.startamer.unmake(star);
      }

      for (const bullet of bullettamer.list) {
        if (bullet.shooterId === "achiever" && star.contains(bullet.s)) {
          bullettamer.unmake(bullet);
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
  } catch (e: any) {
    return err(e.stack);
  }
};

// region redraw

const redraw = (everything: Everything, fps?: number): void => {
  try {
    everything.state.achiever.svgs ??= [makeAchieverSvg(everything)];
    const achieverSvg = everything.state.achiever.svgs[0];
    drawSvgAt(achieverSvg, everything.state.achiever.s);

    for (const bullet of everything.state.bullettamer.list) {
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
      everything.dom.tell.innerHTML = (
        1 +
        2 * everything.state.startamer.list.length +
        everything.state.bullettamer.list.length
      ).toString();
    }
  } catch (e: any) {
    return err(e.stack);
  }
};

// region receiveMessage

const receiveMessage = (e: MessageEvent<Message>, everything: Everything) => {
  try {
    const message = e.data;
    switch (message.type) {
      case "star":
        const startamer = everything.state.startamer;
        startamer.list.push(
          startamer.make({
            code: message.value[0],
            startTime: everything.state.now,
            achiever: everything.state.achiever,
          }),
        );
        everything.state.combo++;
        break;
      default:
        log("implement me:", message);
    }
  } catch (e: any) {
    return err(e.stack);
  }
};

// region onload

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
  } catch (e: any) {
    return err(e.stack);
  }
};
