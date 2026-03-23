import { biject, length, max, plus, rightpad } from "./type";

const loggerKinds = ["log", "error"] as const;
type LoggerKind = (typeof loggerKinds)[number];

export const logger = (...args: any[]) => {
  const timestamp = makeTimestamp("log");
  console.log(timestamp, ...args);
};

const makeTimestamp = <K extends LoggerKind>(kind: K) => {
  return `${rightpad(`[${kind}]`, plus(max(...biject(loggerKinds, length)), 2))} ${new Date().toLocaleTimeString()}: achieved` as const;
};
