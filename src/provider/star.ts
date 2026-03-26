import vscode from "vscode";

import { StarKind, starKinds } from "../util/const";
import { isObject } from "../util/type";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { diagnosticToStar, Message } from "./diagnostic";

export type Starmap = Map<number, Star>;

export const makeStarmap = (): Starmap => {
  return new Map(
    Object.entries(diagnosticMessages).map(([key, value]) => {
      return [value.code, diagnosticToStar(value, key as Message)];
    }),
  );
};

type LockedStar = {
  code: number;
  kind: StarKind;
  messageTemplate: string;
};

export const isStar = (x: unknown): x is Star => {
  return (
    isObject(x) &&
    "code" in x &&
    typeof x.code === "number" &&
    "kind" in x &&
    starKinds.includes(x.kind as any) &&
    "messageTemplate" in x &&
    typeof x.messageTemplate === "string"
  );
};

export type Encounter = LockedStar & {
  time: number;
  triggerText: string;
  fileName: string;
  messageText: string;
};

export type UnlockedStar = Encounter & {
  lifetime: number;
  lastEncounter: number;
};

export type Star = LockedStar | UnlockedStar;

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
    "lifetime" in x &&
    typeof x.lifetime === "number"
  );
};

export const unlock = (
  star: Star,
  event: vscode.TextDocumentChangeEvent,
  diagnostic: vscode.Diagnostic,
): UnlockedStar => {
  return {
    code: star.code,
    kind: star.kind,
    messageTemplate: star.messageTemplate,
    time: Date.now(),
    triggerText: event.document.lineAt(diagnostic.range.start.line).text,
    fileName: event.document.fileName,
    messageText: diagnostic.message,
    lifetime: isUnlocked(star) ? star.lifetime + 1 : 1,
    lastEncounter: Date.now(),
  };
};
