import vscode from "vscode";

import { Maybe } from "./util/type";
import { isStar, Star, Starmap } from "./star/star";
import { computeKind } from "./star/diagnostic";
import { diagnosticMessages } from "./util/diagnosticMessages";
import { consoleLog } from "./util/console";

/**
 * Calls {@linkcode getGlobalState} to retrieve the stringified data
 * stored in {@linkcode vscode.ExtensionContext.globalState}. If successful,
 * then parses the data to make and return a new {@linkcode Starmap}.
 */
export const fetchStarmap = (
  context: vscode.ExtensionContext,
): Maybe<Starmap> => {
  consoleLog("`fetchStarmap` call");
  const maybeStarmap = getGlobalState(context, "starmap");

  if (Array.isArray(maybeStarmap)) {
    consoleLog(". passing starmap check");
    const newStarmap = new Map<number, Star>();

    for (const oldStar of maybeStarmap) {
      if (Array.isArray(oldStar)) {
        const maybeStar = oldStar[1];

        if (isStar(maybeStar)) {
          const diagnostic =
            diagnosticMessages[
              maybeStar.messageTemplate as keyof typeof diagnosticMessages
            ];

          const newStar = {
            ...maybeStar,
            category: diagnostic.category,
            kind: computeKind(maybeStar),
          };

          if ("reportsUnnecessary" in diagnostic) {
            Object.assign(newStar, {
              reportsUnnecessary: diagnostic.reportsUnnecessary,
            });
          }

          newStarmap.set(maybeStar.code, newStar);
        }
      }
    }
    consoleLog(". starmap reconstruction");

    setStarmap(context, newStarmap);

    return newStarmap;
  } else {
    consoleLog(". failing starmap check");

    return undefined;
  }
};

export const setStarmap = (
  context: vscode.ExtensionContext,
  starmap: Maybe<Starmap>,
): string => {
  consoleLog("`setStarmap` call");
  return setGlobalState(context, "starmap", starmap?.entries().toArray());
};

/**
 * Retrieves the value at `key` from {@linkcode vscode.ExtensionContext.globalState}:
 * - If found, then calls {@linkcode JSON.parse} on it and returns it.
 * - Otherwise, returns `undefined`.
 */
export const getGlobalState = (
  context: vscode.ExtensionContext,
  key: string,
): unknown => {
  consoleLog("`getGlobalState` call");

  const serialization = context.globalState.get(key);

  if (serialization && typeof serialization === "string") {
    const value = JSON.parse(serialization);

    return value;
  } else {
    return undefined;
  }
};

/**
 * Calls {@linkcode JSON.stringify} on `value`, stores it
 * in {@linkcode vscode.ExtensionContext.globalState} at
 * `key`, and then returns the stored value.
 */
export const setGlobalState = (
  context: vscode.ExtensionContext,
  key: string,
  value: unknown,
): string => {
  consoleLog("`setGlobalState` call");

  const serialization = JSON.stringify(value);

  context.globalState.update(key, serialization);

  return serialization;
};
