import type { WebviewApi } from "vscode-webview";

// region general util

export type Maybe<T> = T | undefined;
export type Writable<T> = { -readonly [K in keyof T]: T[K] };

export type PrependParameter<P, F extends (...args: any[]) => any> = (
  ...args: [P, ...Parameters<F>]
) => ReturnType<F>;

export type Methodless<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

type Z = [number, number];
export type WorldW = [number, number];

export type WorldZ = Z;
export type WindowZ = Z;

export type S = WorldZ;
export type V = WorldZ;

export type Radian = number;

export interface Message {
  type: "star";
  value: [number, string];
}

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
  comboBar: ComboBar;
  worldSvg: SVGSVGElement;
  fps: SVGTextElement;
  tell: SVGTextElement;
  logDiv: HTMLDivElement;
}

export interface ComboBar {
  fg: HTMLDivElement;
  bg: HTMLDivElement;
}

// region achiever

export interface Achiever
  extends
    Movable,
    Collidable,
    Shooting,
    Drawable<[SVGPolygonElement, SVGCircleElement]> {
  turn: (v?: WorldZ) => void;
  suffer: () => void;
}

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

export interface StarOptions extends TameOptions<
  Created &
    Pick<Star, "code"> & {
      achiever: Achiever;
    }
> {}

// region shooting, bullet

export type ShooterId = "achiever" | number;

export interface Shooting {
  shoot: (tamer: Bullettamer) => Bullet;
  isReloaded: (now: number, last: number) => boolean;
}

export interface ReloadSettings {
  startTime: number;
  capacity: number;
  fireGap: number;
}

export interface Bullet
  extends
    Movable,
    Tamed,
    Collidable,
    Drawable<[SVGCircleElement, SVGTextElement]> {
  shooterId: ShooterId;
}

export interface BulletOptions extends TameOptions<
  Sful & Vful & Pick<Bullet, "shooterId">
> {}

// region taming

export interface Tamed {
  tamedId: number;
}

export interface Tamer<T, O> {
  list: T[];
  peek: () => number;
  make: (options: O) => T;
  unmake: (tamed: T) => number;
}

type TameOptions<T> = {
  [P in keyof T]: T[P];
};

export interface Bullettamer extends Tamer<Bullet, BulletOptions> {}
export interface Startamer extends Tamer<Star, StarOptions> {}
