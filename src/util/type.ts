import { Not, UnionToTuple } from "expect-type";

// region shared

export type Maybe<T> = T | undefined;

export type Writable<T> = { -readonly [K in keyof T]: T[K] };
export type ReadWrite<T> = T | Readonly<T> | Writable<T>;

export const isObject = (
  x: unknown,
): x is Exclude<object, any[] | readonly any[]> => {
  return typeof x === "object" && !!x && !Array.isArray(x);
};

export type DeepKeys<T, K extends keyof T = keyof T> =
  | keyof T
  | (K extends any ? keyof T[K] : never);

export type TestObject = {
  a: 1;
  b: 2;
  c: {
    d: {
      e: [3, 4];
      f: 5;
    };
    g: 6;
    h: {
      i: 7;
      j: [8];
      k: {};
    };
  };
};

export type LeafKeys<T, K extends keyof T = keyof T> = {} & (
  | (keyof T extends infer L extends keyof T
      ? L extends any
        ? T[L] extends object
          ? never
          : L
        : never
      : never)
  | (K extends any
      ? T[K] extends readonly any[]
        ? never
        : T[K] extends object
          ? LeafKeys<T[K]>
          : never
      : never)
);

// region array

export const includes = <T>(xs: readonly T[], x: unknown): x is T => {
  return xs.includes(x as any);
};

// region tuple

export type Tuple<N extends number = number, T = any> = number extends N
  ? T[]
  : N extends any
    ? _Tuple<N, T>
    : never;

type _Tuple<
  N extends number,
  T,
  A extends readonly any[] = [],
> = A["length"] extends N ? A : _Tuple<N, T, [T, ...A]>;

export const tuple = <N extends number>(n: N) => {
  return Array(n).keys().toArray() as Tuple<N, number>;
};

export type Biject<T, L extends readonly any[]> = Tuple<L["length"], T>;

export const biject = <U, L extends readonly any[]>(
  xs: L,
  f: (x: L[number]) => U,
) => {
  const ys = [];
  for (let i = 0; i < xs.length; i++) {
    ys.push(f(xs[i]));
  }
  return ys as Biject<U, ReadWrite<L>>;
};

export type BijectPrefix<
  L extends string[],
  P extends string,
  A extends string[] = [],
> = L extends [infer F extends string, ...infer R extends string[]]
  ? BijectPrefix<R, P, [...A, `${P}${F}`]>
  : A;

export const bijectPrefix = <L extends string[], P extends string>(
  list: L,
  prefix: P,
) => {
  return list.map((s) => `${prefix}${s}`) as BijectPrefix<L, P>;
};

type Upto<N extends number, A extends number = never> = N extends 0
  ? N | A
  : Upto<Predecessor<N>, Predecessor<N> | A>;

export const sequence = <N extends number, T>(n: N, f: (x: Upto<N>) => T) => {
  const xs = [];
  for (let i = 0; i < n; i++) {
    xs.push(f(i as any));
  }
  return xs as Tuple<N, T>;
};

export const unsafeSequence = <T>(n: number, f: (x: number) => T): T[] => {
  return sequence(n, f);
};

export type Concat<
  T extends readonly any[],
  Us extends readonly (readonly any[])[],
> = Us extends [
  infer F extends readonly any[],
  ...infer R extends readonly (readonly any[])[],
]
  ? Concat<[...T, ...F], R>
  : Writable<T>;

export const safeConcat = <
  T extends readonly any[],
  Us extends readonly (readonly any[])[],
>(
  first: T,
  ...others: Us
) => {
  return first.concat(...others) as Concat<T, Us>;
};

// region number

export type Successor<N extends number> = [
  N,
  ...Tuple<N>,
]["length"] extends infer T extends number
  ? T
  : never;

export const succeed = <N extends number>(n: N) => (n + 1) as Successor<N>;

export type Predecessor<N extends number> =
  Tuple<N> extends [any, ...infer L] ? L["length"] : never;

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

export type Modulo<M extends number, N extends number> = M extends any
  ? Minus<M, N> extends never
    ? M
    : Modulo<Minus<M, N>, N>
  : never;

export const mod = <M extends number, N extends number>(n: M, d: N) => {
  return (((n % d) + d) % d) as Modulo<M, N>;
};

// type Times<
//   M extends number,
//   N extends number,
//   A extends number = 0,
// > = N extends 0 ? A : Times<M, Predecessor<N>, Plus<A, M>>;

// type Power<
//   M extends number,
//   N extends number,
//   A extends number = 1,
// > = N extends 0 ? A : Power<M, Predecessor<N>, Times<A, M>>;

type PowerOfTen<N extends number, A extends string = "1"> = N extends 0
  ? Parse<A>
  : PowerOfTen<Predecessor<N>, `${A}0`>;

type Parse<S extends string> = S extends `${infer N extends number}`
  ? N
  : never;

export const powerOfTen = <N extends number>(exponent: N) => {
  return (10 ** exponent) as PowerOfTen<N>;
};

export type GreaterOf<M extends number, N extends number> =
  Tuple<M> extends [...Tuple<N>, ...any[]] ? M : N;

export const greaterOf = <M extends number, N extends number>(m: M, n: N) => {
  return Math.max(m, n) as GreaterOf<M, N>;
};

export type Max<L extends readonly number[]> =
  UnionToTuple<_Max<L>> extends infer T extends readonly number[]
    ? _Max<T>
    : never;

type _Max<
  L extends readonly number[],
  M extends number = 0,
> = L extends readonly [
  infer F extends number,
  ...infer R extends readonly number[],
]
  ? F extends any
    ? _Max<R, GreaterOf<M, F>>
    : never
  : M;

export const max = <L extends readonly number[]>(...xs: L) => {
  return Math.max(...xs) as Max<L>;
};

// region string

export type CharsOf<
  S extends string,
  A extends string = never,
> = S extends `${infer F}${infer R}` ? CharsOf<R, A | F> : A;

export const alphabet = "abcdefghijklmnopqrstuvwxyz";

export type Alphabetic = CharsOf<typeof alphabet>;

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

export const capitalize = <S extends string>(string: S): Capitalize<S> => {
  return (
    string.length ? string[0]!.toLocaleUpperCase() + string.slice(1) : ""
  ) as Capitalize<S>;
};

export const uncapitalize = <S extends string>(string: S): Uncapitalize<S> => {
  return (
    string.length ? string[0]!.toLocaleLowerCase() + string.slice(1) : ""
  ) as Uncapitalize<S>;
};

export type Length<
  S extends string,
  A extends number = 0,
> = S extends `${any}${infer R}` ? Length<R, Successor<A>> : A;

export const length = <S extends string>(s: S) => s.length as Length<S>;

export type RightPad<
  S extends string,
  N extends number,
  P extends string = " ",
> = GreaterOf<N, Length<S>> extends Length<S> ? S : RightPad<`${S}${P}`, N, P>;

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

export type Split<
  S extends string,
  C extends string = "",
  A extends string[] = [],
> = S extends `${infer F}${C}${infer R}` ? Split<R, C, [...A, F]> : [...A, S];

export const split = <S extends string, C extends string>(
  string: S,
  splitter: C,
) => {
  return string.split(splitter) as Split<S, C>;
};

// region function

export const not = <T, B extends boolean>(f: (x: T) => B) => {
  return ((x: T) => !f(x)) as (x: T) => Not<B>;
};
