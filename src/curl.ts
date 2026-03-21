import child from "child_process";
import vscode from "vscode";
import { Achievement, categories, DiagnosticMessage } from "./achieve";

const isObject = (x: unknown): x is object => {
  return typeof x === "object" && !!x;
};

const isDiagnosticMessage = (x: unknown): x is DiagnosticMessage => {
  return (
    isObject(x) &&
    "category" in x &&
    categories.includes(x.category as any) &&
    "code" in x &&
    typeof x.code === "number"
  );
};

const diagnosticMessagesUrl =
  "https://raw.githubusercontent.com/microsoft/TypeScript/refs/heads/main/src/compiler/diagnosticMessages.json" as const;

export const curl = (
  context: vscode.ExtensionContext,
): Map<number, Achievement> => {
  const parse: Record<string, DiagnosticMessage> = JSON.parse(
    child.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }),
  );

  const map = new Map<number, Achievement>();
  for (const [key, value] of Object.entries(parse)) {
    if (isDiagnosticMessage(value)) {
      map.set(value.code, new Achievement(key, value));
    }
  }

  context.globalState.update("achievements", map);

  return map;
};
