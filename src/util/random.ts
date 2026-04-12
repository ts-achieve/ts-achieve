import { alphabet, split } from "./type";

export const choose = <T>(xs: readonly T[]): T =>
  xs[Math.floor(Math.random() * xs.length)]!;

const primitiveNames = [
  "string",
  "number",
  "boolean",
  "symbol",
  "bigint",
  "null",
  "undefined",
  "void",
] as const;

export type PrimitiveMap = {
  string: string;
  number: number;
  boolean: boolean;
  symbol: symbol;
  bigint: bigint;
  null: null;
  undefined: undefined;
  void: void;
};

type PrimitiveName = keyof PrimitiveMap & {};

export type Primitive<K extends PrimitiveName = PrimitiveName> = K extends any
  ? PrimitiveMap[K]
  : never;

const randomPrimitive = <T extends PrimitiveName>(
  ...types: T[]
): Primitive<T> => {
  const randomType = choose(types.length > 0 ? types : primitiveNames);
  switch (randomType) {
    case "bigint":
      return randomBigint() as Primitive<T>;
    case "boolean":
      return randomBoolean() as Primitive<T>;
    case "number":
      return Math.random() as Primitive<T>;
    case "string":
      return randomString() as Primitive<T>;
    case "symbol":
      return Symbol() as Primitive<T>;
    case "null":
      return null as Primitive<T>;
    case "void":
    case "undefined":
      return undefined as Primitive<T>;
  }
  randomType satisfies never;
};

export const randomBoolean = () => {
  return Math.random() < 0.5 ? false : true;
};

const randomChar = () => {
  return choose(split(alphabet, ""));
};

export const randomString = (): string => {
  return geometric("", (s) => s + randomChar());
};

const geometric = <T>(initial: T, succeed: (x: T) => T): T => {
  let length = 1;
  while (Math.random() < 2 / 3) length++;

  let x = initial;
  for (let i = 0; i < length; i++) {
    x = succeed(x);
  }
  return x;
};

const randomBigint = () =>
  BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

const randomKey = () => randomPrimitive("number", "string", "symbol");

export const randomObject = (): object => {
  return geometric({}, (x) =>
    Object.assign(x, {
      [randomKey()]:
        Math.random() < 1 / primitiveNames.length
          ? randomObject()
          : randomPrimitive(),
    }),
  );
};
