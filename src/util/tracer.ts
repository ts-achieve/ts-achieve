import vscode from "vscode";
import { biject, length, max, plus, rightpad, show } from "./type";

const traceKinds = ["log", "error"] as const;
type TraceKind = (typeof traceKinds)[number];

export type Tracer = {
  channel: vscode.OutputChannel;
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

export type Tracing = {
  tracer: Tracer;
};

const makeTimestamp = <K extends TraceKind>(kind: K) => {
  return `${rightpad(`[${kind}]`, plus(max(...biject(traceKinds, length)), 2))} ${new Date().toLocaleTimeString()}: achieved` as const;
};

export const makeTracer = (name: string): Tracer => {
  const channel = vscode.window.createOutputChannel(name);
  const tracer = {
    channel,
    log: (...args: any[]) => {
      const timestamp = makeTimestamp("log");

      channel.appendLine(timestamp + " " + args.map(show).join(", "));
      console.log(timestamp, ...args);
    },
    error: (...args: any[]) => {
      const timestamp = makeTimestamp("error");

      channel.appendLine(timestamp + " " + args.map(show).join(", "));
      console.error(timestamp, ...args);
    },
  };

  tracer.log("tracer construction");

  return tracer;
};
