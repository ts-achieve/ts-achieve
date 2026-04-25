import vscode from "vscode";

import { isObject, repeat } from "../util/type";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { StarKind } from "./taxonomy";
import { computeKind, TsDiagnostic } from "./diagnostic";

export const diagnosticToStar = (
  diagnostic: TsDiagnostic,
  messageTemplate: string,
): LockedStar => {
  return {
    ...diagnostic,
    kind: computeKind({ ...diagnostic, messageTemplate }),
    messageTemplate,
  };
};

export type Starmap = Map<number, Star>;

export const makeStarmap = (): Starmap => {
  return new Map(
    Object.entries(diagnosticMessages)
      .filter(([_, { category }]) => category !== "Message")
      .map(([key, value]) => {
        return [value.code, diagnosticToStar(value, key)];
      }),
  );
};

interface LockedStar extends TsDiagnostic {
  kind: StarKind;
  messageTemplate: string;
}

export interface UnlockedStar extends LockedStar {
  time: number;
  triggerText: string;
  fileName: string;
  messageText: string;
  encounterCount: number;
  lastEncounter: number;
}

export type Star = LockedStar | UnlockedStar;

export const isStar = (x: unknown): x is Star => {
  return (
    isObject(x) &&
    "code" in x &&
    typeof x.code === "number" &&
    "kind" in x &&
    typeof x.kind === "string" &&
    "messageTemplate" in x &&
    typeof x.messageTemplate === "string"
  );
};

export const isUnlocked = (x: LockedStar): x is UnlockedStar => {
  return (
    isObject(x) &&
    "time" in x &&
    typeof x.time === "number" &&
    "triggerText" in x &&
    typeof x.triggerText === "string" &&
    "fileName" in x &&
    typeof x.fileName === "string" &&
    "messageText" in x &&
    typeof x.messageText === "string" &&
    "encounterCount" in x &&
    typeof x.encounterCount === "number"
  );
};

export const unlock = (
  star: Star,
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
): UnlockedStar => {
  return {
    ...star,
    time: isUnlocked(star) ? star.time : Date.now(),
    triggerText: repeat(5, (n) => {
      const lineNumber = diagnostic.range.start.line - 2 + n;
      if (0 <= lineNumber && lineNumber < document.lineCount) {
        return (
          (lineNumber + 1).toString().padEnd(4) +
          document.lineAt(lineNumber).text
        );
      } else {
        return "";
      }
    })
      .concat([""])
      .join("\n"),
    fileName: document.fileName,
    messageText: diagnostic.message,
    encounterCount: isUnlocked(star) ? star.encounterCount + 1 : 1,
    lastEncounter: Date.now(),
  };
};
