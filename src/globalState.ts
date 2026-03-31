import vscode from "vscode";

import { Maybe } from "./util/type";
import { Star, Starmap } from "./star/star";

export const getStarmap = (
  context: vscode.ExtensionContext,
): Maybe<Starmap> => {
  const maybeStarmap = getGlobalState(context, "starmap");
  if (Array.isArray(maybeStarmap)) {
    return new Map(maybeStarmap as [number, Star][]);
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
