import vscode from "vscode";

import { Maybe } from "./util/type";
import { Tracer } from "./util/tracer";
import { AchieveMap, AchieveProvision } from "./provider/provision";

export const getAchieveMap = (
  context: vscode.ExtensionContext,
  tracer: Tracer,
): Maybe<AchieveMap> => {
  const x = getGlobalState(context, tracer, "achieves");
  tracer.log(x);
  if (Array.isArray(x)) {
    return new Map(x as [number, AchieveProvision][]);
  } else {
    return undefined;
  }
};

export const setAchieveMap = (
  context: vscode.ExtensionContext,
  tracer: Tracer,
  achieveMap: AchieveMap,
): void => {
  setGlobalState(context, tracer, "achieves", achieveMap.entries().toArray());
};

export const getGlobalState = (
  context: vscode.ExtensionContext,
  tracer: Tracer,
  key: string,
): Maybe<unknown> => {
  const serialization = context.globalState.get(key);

  if (serialization && typeof serialization === "string") {
    const value = JSON.parse(serialization);
    tracer.log("global state access", `${key}: ${serialization}`);

    return value;
  } else {
    return undefined;
  }
};

export const setGlobalState = (
  context: vscode.ExtensionContext,
  _tracer: Tracer,
  key: string,
  value: unknown,
): string => {
  const serialization = JSON.stringify(value);

  context.globalState.update(key, serialization);

  return serialization;
};
