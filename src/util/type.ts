import { expectTypeOf } from "expect-type";
import { diagnosticMessages } from "./diagnosticMessages";

expectTypeOf().toEqualTypeOf();

// region shared
/**
 * Convert a union to an intersection.
 * `A | B | C` -\> `A & B & C`
 */
export type UnionToIntersection<Union> = (
  Union extends any ? (distributedUnion: Union) => void : never
) extends (mergedIntersection: infer Intersection) => void
  ? Intersection
  : never;
/**
 * Get the last element of a union.
 * First, converts to a union of `() => T` functions,
 * then uses {@linkcode UnionToIntersection} to get the last one.
 */
export type LastOf<Union> =
  UnionToIntersection<
    Union extends any ? () => Union : never
  > extends () => infer R
    ? R
    : never;
/**
 * Intermediate type for {@linkcode UnionToTuple} which pushes the
 * "last" union member to the end of a tuple, and recursively prepends
 * the remainder of the union.
 */
export type TuplifyUnion<Union, LastElement = LastOf<Union>> =
  IsNever<Union> extends true
    ? []
    : [...TuplifyUnion<Exclude<Union, LastElement>>, LastElement];
/**
 * Convert a union like `1 | 2 | 3` to a tuple like `[1, 2, 3]`.
 */
export type UnionToTuple<Union> = TuplifyUnion<Union>;
export type IsNever<T> = [T] extends [never] ? true : false;

export type Maybe<T> = T | undefined;

export type Writable<T> = { -readonly [K in keyof T]: T[K] };
export type ReadWrite<T> = T | Readonly<T> | Writable<T>;

// region tuple

export type Tuple<N extends number = number, T = any> = number extends N
  ? T[]
  : N extends any
    ? _Tuple<N, T>
    : never;

type _Tuple<N extends number, T, A extends any[] = []> = A["length"] extends N
  ? A
  : _Tuple<N, T, [T, ...A]>;

export const tuple = <N extends number>(n: N) => {
  return Array(n).keys().toArray() as Tuple<N, number>;
};

type Biject<T, L extends any[] | readonly any[]> = Tuple<L["length"], T>;

export const biject = <U, L extends any[] | readonly any[]>(
  xs: ReadWrite<L>,
  f: (x: L[number]) => U,
) => {
  return xs.map(f) as Biject<U, L>;
};

// region number

type Successor<N extends number> = [
  N,
  ...Tuple<N>,
]["length"] extends infer T extends number
  ? T
  : never;

export const successor = <N extends number>(n: N) => (n + 1) as Successor<N>;

type Plus<M extends number, N extends number> = [
  ...Tuple<M>,
  ...Tuple<N>,
]["length"] extends infer T extends number
  ? T
  : never;

export const plus = <M extends number, N extends number>(m: M, n: N) => {
  return (m + n) as Plus<M, N>;
};

type Minus<M extends number, N extends number> =
  Tuple<M> extends [...Tuple<N>, ...infer R] ? R["length"] : never;

export const minus = <M extends number, N extends number>(m: M, n: N) => {
  return (m - n) as Minus<M, N>;
};

type GreaterOf<M extends number, N extends number> =
  Tuple<M> extends [...Tuple<N>, ...any[]] ? M : N;

export const greaterOf = <M extends number, N extends number>(m: M, n: N) => {
  return Math.max(m, n) as GreaterOf<M, N>;
};

type Max<L extends number[]> =
  UnionToTuple<_Max<L>> extends infer T extends number[] ? _Max<T> : never;

type _Max<L extends number[], M extends number = 0> = L extends [
  infer F extends number,
  ...infer R extends number[],
]
  ? F extends any
    ? _Max<R, GreaterOf<M, F>>
    : never
  : M;

export const max = <L extends number[]>(...xs: L) => {
  return Math.max(...xs) as Max<L>;
};

// region string

type Literalizable = string | number | bigint | boolean | null | undefined;

export type Literal<S extends Literalizable> = `${S}`;

export const literal = <S extends Literalizable>(s: S) => {
  return `${s}` as Literal<S>;
};

export const show = (x: unknown): string => {
  if (typeof x === "string") {
    return x;
  } else {
    return JSON.stringify(x, null, 2);
  }
};

type Length<
  S extends string,
  A extends number = 0,
> = S extends `${any}${infer R}` ? Length<R, Successor<A>> : A;

export const length = <S extends string>(s: S) => s.length as Length<S>;

type RightPad<S extends string, N extends number, P extends string = " "> =
  GreaterOf<N, Length<S>> extends Length<S> ? S : RightPad<`${S}${P}`, N, P>;

export const rightpad = <
  S extends string,
  N extends number,
  P extends string = " ",
>(
  s: S,
  maxLength: N,
  fillString?: P,
) => {
  return s.padEnd(maxLength, fillString) as RightPad<S, N, P>;
};

// region diagnosticMessages

type Dictionary = {
  -readonly [K in keyof typeof diagnosticMessages]: {
    -readonly [L in keyof (typeof diagnosticMessages)[K]]: (typeof diagnosticMessages)[K][L];
  };
};

type Message = keyof Dictionary;

type CodeToMessage<N extends number> = Message extends infer U extends Message
  ? U extends any
    ? Dictionary[U] extends { code: N }
      ? U
      : never
    : never
  : never;

export const codeToMessage = <N extends number>(
  code: N,
): Maybe<CodeToMessage<N>> => {
  return Object.values(diagnosticMessages).find((value) => {
    return value.code === code;
  }) as Maybe<CodeToMessage<N>>;
};
