import { expectTypeOf, UnionToTuple } from "expect-type";
import { diagnosticMessages } from "./diagnosticMessages";

// region shared

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

expectTypeOf<[any, any, any, any]>().toEqualTypeOf<Tuple<4>>();
expectTypeOf<[number, number, number, number]>().toEqualTypeOf(tuple(4));

type Biject<T, L extends any[] | readonly any[]> = Tuple<L["length"], T>;

export const biject = <U, L extends any[] | readonly any[]>(
  xs: ReadWrite<L>,
  f: (x: L[number]) => U,
) => {
  return xs.map(f) as Biject<U, L>;
};

expectTypeOf<[never, never, never, never]>().toEqualTypeOf<
  Biject<never, Tuple<4>>
>();

// region number

type Successor<N extends number> = [
  N,
  ...Tuple<N>,
]["length"] extends infer T extends number
  ? T
  : never;

export const successor = <N extends number>(n: N) => (n + 1) as Successor<N>;

expectTypeOf<1>().toEqualTypeOf<Successor<0>>();
expectTypeOf<1>().toEqualTypeOf(successor(0));
expectTypeOf<2>().toEqualTypeOf<Successor<1>>();
expectTypeOf<2>().toEqualTypeOf(successor(1));
expectTypeOf<3>().toEqualTypeOf<Successor<2>>();
expectTypeOf<3>().toEqualTypeOf(successor(2));
expectTypeOf<4>().toEqualTypeOf<Successor<3>>();
expectTypeOf<4>().toEqualTypeOf(successor(3));

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

expectTypeOf<0>().toEqualTypeOf<GreaterOf<0, 0>>();
expectTypeOf<0>().toEqualTypeOf(greaterOf(0, 0));
expectTypeOf<1>().toEqualTypeOf<GreaterOf<0, 1>>();
expectTypeOf<1>().toEqualTypeOf(greaterOf(0, 1));
expectTypeOf<1>().toEqualTypeOf<GreaterOf<1, 0>>();
expectTypeOf<1>().toEqualTypeOf(greaterOf(1, 0));
expectTypeOf<1>().toEqualTypeOf<GreaterOf<1, 1>>();
expectTypeOf<1>().toEqualTypeOf(greaterOf(1, 1));

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

expectTypeOf<0>().toEqualTypeOf<Max<[0, 0, 0, 0]>>();
expectTypeOf<0>().toEqualTypeOf(max(0, 0, 0, 0));
expectTypeOf<3>().toEqualTypeOf<Max<[0, 1, 2, 3]>>();
expectTypeOf<3>().toEqualTypeOf(max(0, 1, 2, 3));
expectTypeOf<3>().toEqualTypeOf<Max<[3, 2, 1, 0]>>();
expectTypeOf<3>().toEqualTypeOf(max(3, 2, 1, 0));
expectTypeOf<3>().toEqualTypeOf<Max<[0, 1, 2, 3, 2, 1, 0]>>();
expectTypeOf<3>().toEqualTypeOf(max(0, 1, 2, 3, 2, 1, 0));

expectTypeOf<5>().toEqualTypeOf<Max<[0 | 3, 1 | 4, 2 | 5]>>();

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

expectTypeOf<0>().toEqualTypeOf<Length<"">>();
expectTypeOf<0>().toEqualTypeOf(length(""));
expectTypeOf<1>().toEqualTypeOf<Length<" ">>();
expectTypeOf<1>().toEqualTypeOf(length(" "));
expectTypeOf<2>().toEqualTypeOf<Length<"  ">>();
expectTypeOf<2>().toEqualTypeOf(length("  "));
expectTypeOf<3>().toEqualTypeOf<Length<"   ">>();
expectTypeOf<3>().toEqualTypeOf(length("   "));

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

expectTypeOf<"">().toEqualTypeOf<RightPad<"", 0>>();
expectTypeOf<"">().toEqualTypeOf(rightpad("", 0));
expectTypeOf<"aaaa">().toEqualTypeOf<RightPad<"", 4, "a">>();
expectTypeOf<"aaaa">().toEqualTypeOf(rightpad("", 4, "a"));
expectTypeOf<"abab">().toEqualTypeOf<RightPad<"", 4, "ab">>();
expectTypeOf<"abab">().toEqualTypeOf(rightpad("", 4, "ab"));
expectTypeOf<"abcdefgh">().toEqualTypeOf<RightPad<"abcdefgh", 4>>();
expectTypeOf<"abcdefgh">().toEqualTypeOf(rightpad("abcdefgh", 4));

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

expectTypeOf<
  CodeToMessage<1002>
>().toEqualTypeOf<"Unterminated string literal.">();
expectTypeOf(codeToMessage(1003)!).toEqualTypeOf(
  "Identifier expected." as const,
);

// region block scope dependent

expectTypeOf<["0", "0", "0", "0"]>().toEqualTypeOf(
  biject([0, 0, 0, 0] as const, literal),
);
