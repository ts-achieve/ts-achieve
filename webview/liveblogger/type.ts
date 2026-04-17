import type { WebviewApi } from "vscode-webview";

// region general util

export type Maybe<T> = T | undefined;
export type Writable<T> = { -readonly [K in keyof T]: T[K] };

type Z = [number, number];
export type WorldW = [number, number];

export type WorldZ = Z;
export type WindowZ = Z;

export type Message = {
  type: "star";
  value: [number, string];
};

export interface Directional {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// region specific util

export interface Everything {
  vscode: WebviewApi<State>;
  state: State;
  dom: Dom;
}

export interface State {
  now: number;
  combo: number;
  achiever: Achiever;
  startamer: Startamer;
  bullettamer: Bullettamer;
}

export interface Sful {
  s: Z;
}

export interface Vful {
  v: Z;
}

export interface Movable extends Sful, Vful {
  move: (now: number) => void;
}

export type Behave = (behaver: Sful & Vful, now: number) => void;

export interface Drawable<
  T extends readonly SVGElement[] = readonly SVGElement[],
> {
  svgs: Maybe<T>;
}

export interface Created {
  startTime: number;
}

export interface Collidable extends Sful {
  contains: (z: Z) => boolean;
}

export interface Dom {
  worldSvg: SVGSVGElement;
  fps: SVGTextElement;
  comboBar: ComboBar;
}

export interface ComboBar {
  fg: HTMLDivElement;
  bg: HTMLDivElement;
}

// region achiever

export interface Achiever
  extends Movable, Shooting, Drawable<[SVGPolygonElement]> {
  turn: (everything: Everything) => void;
}

// region shooting, bullet

export type ShooterId = "achiever" | number;

export interface Shooting {
  shoot: (tamer: Bullettamer) => Bullet;
}

export interface Bullet
  extends Movable, Tamed, Collidable, Drawable<[SVGCircleElement]> {
  shooterId: ShooterId;
}

export interface BulletOptions extends Sful, Pick<Bullet, "shooterId"> {}

// region taming

export interface Tamed {
  tamedId: number;
}

export interface Tamer<T, O> {
  list: T[];
  peek: () => number;
  make: (behave: Behave, options: O) => T;
  unmake: (tamed: T) => number;
}

export type Bullettamer = Tamer<Bullet, BulletOptions>;
export type Startamer = Tamer<Star, StarOptions>;

// region star

export interface Star
  extends
    Movable,
    Tamed,
    Collidable,
    Shooting,
    Created,
    Drawable<[SVGRectElement, SVGTextElement]> {
  code: number;
}

export interface StarOptions extends Created, Pick<Star, "code"> {}
