import { biject, length, max, plus, rightpad } from "./type";

const stampKinds = ["log", "err"] as const;
type StampKind = (typeof stampKinds)[number];

/**
 * Prints the arguments to {@linkcode console}, prepended with
 * the {@linkcode Kindstamp} `[log]` and a {@linkcode Timestamp}.
 *
 * @see {@linkcode consoleErr}
 */
export const consoleLog = (...args: any[]) => {
  stamp("log", args);
};

/**
 * Prints the arguments to {@linkcode console}, prepended with
 * the {@linkcode Kindstamp} `[err]` and a {@linkcode Timestamp}.
 *
 * @see {@linkcode consoleLog}
 */
export const consoleErr = (...args: any[]) => {
  stamp("err", args);
};

const stamp = (kind: StampKind, args: any[]) => {
  console.log(stampKind(kind), stampTime(), ...args);
};

type Kindstamp<K extends StampKind = StampKind> = ReturnType<
  typeof stampKind<K>
>;

const stampKind = <K extends StampKind>(kind: K) => {
  return `${rightpad(`[${kind}]`, plus(max(...biject(stampKinds, length)), 2))}` as const;
};

type Timestamp = ReturnType<typeof stampTime>;

const stampTime = () => {
  return `${new Date().toLocaleTimeString()}: achieved` as const;
};
