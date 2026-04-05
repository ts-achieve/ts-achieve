import vscode from "vscode";

import { Maybe } from "./util/type";
import { isStar, Star, Starmap } from "./star/star";
import { computeKind } from "./star/diagnostic";
import { diagnosticMessages } from "./util/diagnosticMessages";
import { logger } from "./util/logger";

/**
 * Calls {@linkcode getGlobalState} to fetch the stringified data
 * stored in {@linkcode vscode.ExtensionContext.globalState}, and then
 * processes the information to make and return a new {@linkcode Starmap}.
 */
export const fetchStarmap = (
  context: vscode.ExtensionContext,
): Maybe<Starmap> => {
  logger("fetchStarmap:");
  const maybeStarmap = getGlobalState(context, "starmap");

  if (Array.isArray(maybeStarmap)) {
    logger("- starmap is well-shapen");
    const starmap = new Map<number, Star>();

    for (const x of maybeStarmap) {
      if (Array.isArray(x)) {
        const maybeStar = x[1];

        if (isStar(maybeStar)) {
          const diagnostic =
            diagnosticMessages[
              maybeStar.messageTemplate as keyof typeof diagnosticMessages
            ];

          const star = {
            ...maybeStar,
            category: diagnostic.category,
            kind: computeKind(maybeStar),
          };

          if ("reportsUnnecessary" in diagnostic) {
            Object.assign(star, {
              reportsUnnecessary: diagnostic.reportsUnnecessary,
            });
          }

          starmap.set(maybeStar.code, star);
        }
      }
    }
    logger("- starmap rebuilt");

    setStarmap(context, starmap);

    return starmap;
  } else {
    logger("- no well-shapen starmap");

    return undefined;
  }
};

export const setStarmap = (
  context: vscode.ExtensionContext,
  starmap: Maybe<Starmap>,
): void => {
  setGlobalState(context, "starmap", starmap?.entries().toArray());
};

export const getGlobalState = (
  context: vscode.ExtensionContext,
  key: string,
): Maybe<unknown> => {
  const serialization = context.globalState.get(key);

  if (serialization && typeof serialization === "string") {
    const value = JSON.parse(serialization);

    return value;
  } else {
    return undefined;
  }
};

export const setGlobalState = (
  context: vscode.ExtensionContext,
  key: string,
  value: unknown,
): string => {
  const serialization = JSON.stringify(value);

  context.globalState.update(key, serialization);

  return serialization;
};
