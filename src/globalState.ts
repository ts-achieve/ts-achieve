import vscode from "vscode";

import { Maybe } from "./util/type";
import { isStar, Star, Starmap } from "./star/star";

export const getStarmap = (
  context: vscode.ExtensionContext,
): Maybe<Starmap> => {
  const maybeStarmap = getGlobalState(context, "starmap");
  if (Array.isArray(maybeStarmap)) {
    const map = new Map<number, Star>();

    for (const x of maybeStarmap) {
      if (Array.isArray(x)) {
        const maybeStar = x[1];

        if (isStar(maybeStar)) {
          map.set(maybeStar.code, {
            ...maybeStar,
            kind: "other",
          });
        }
      }
    }
    return map;
  } else {
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
