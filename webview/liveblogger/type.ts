export type Maybe<T> = T | undefined;
export type Writable<T> = { -readonly [K in keyof T]: T[K] };

export type Z = [number, number];
export type W = [number, number];

export type WorldZ = Z;
export type WindowZ = Z;

export type Message = {
  type: "star";
  value: [number, string];
};
