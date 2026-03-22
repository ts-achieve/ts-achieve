import vscode from "vscode";

export type Tracer = {
  channel: vscode.OutputChannel;
  trace: (...args: any[]) => void;
};

export type Tracing = {
  tracer: Tracer;
};

export const makeTracer = (name: string): Tracer => {
  const channel = vscode.window.createOutputChannel(name);
  return {
    channel,
    trace: (...args: any[]) => {
      const timestamp = `achieved ${new Date().toLocaleTimeString()}:`;

      channel.appendLine(timestamp + " " + args.map(show).join(", "));
      console.log(timestamp, ...args);
    },
  };
};

const show = (x: unknown): string => {
  if (typeof x === "string") {
    return x;
  } else {
    return JSON.stringify(x, null, 2);
  }
};
