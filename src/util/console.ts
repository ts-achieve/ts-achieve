import { biject, length, max, plus, rightpad } from "./type";

const printKinds = ["log", "err"] as const;
type PrintKind = (typeof printKinds)[number];

/**
 * Prints the arguments to {@linkcode console}, prepended with
 * the {@linkcode Kindstamp} `[log]` and a {@linkcode Timestamp}.
 *
 * @see {@linkcode consoleErr}
 */
export const consoleLog = (...args: any[]) => {
  print("log", args);
};

/**
 * Prints the arguments to {@linkcode console}, prepended with
 * the {@linkcode Kindstamp} `[err]` and a {@linkcode Timestamp}.
 *
 * @see {@linkcode consoleLog}
 */
export const consoleErr = (...args: any[]) => {
  print("err", args);
};

const print = (kind: PrintKind, args: any[]) => {
  console.log(stampKind(kind), stampTime(), ...args);
};

type Kindstamp<K extends PrintKind = PrintKind> = ReturnType<
  typeof stampKind<K>
>;

const stampKind = <K extends PrintKind>(kind: K) => {
  return `${rightpad(`[${kind}]`, plus(max(...biject(printKinds, length)), 2))}` as const;
};

type Timestamp = ReturnType<typeof stampTime>;

const stampTime = () => {
  return `${new Date().toLocaleTimeString()}: achieved` as const;
};
