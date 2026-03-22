import child from "child_process";
import vscode from "vscode";

import { diagnosticMessagesUrl } from "../util/const";
import { AchieveProvision, AchieveMap, isTsDiagnostic } from "./provision";
import { ProviderBase } from "./base";
import { ExtensionConfig } from "../config";
import { Maybe } from "../util/type";
import { Tracer } from "../util/tracer";

export class AchievedProvider extends ProviderBase {
  constructor(
    config: ExtensionConfig,
    tracer: Tracer,
    context: vscode.ExtensionContext,
  ) {
    super(config, tracer, context);
  }

  override loadAchieves(context: vscode.ExtensionContext) {
    const maybeMap: Maybe<Map<number, AchieveProvision>> =
      context.globalState.get("achieves");

    this.tracer.trace("mappy", maybeMap ?? "no achieves in global state");
    return maybeMap && Object.keys(maybeMap).length
      ? maybeMap
      : curl(this.tracer);
  }
}

const curl = (tracer: Tracer): AchieveMap => {
  const parse = JSON.parse(
    child.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }),
  );

  const map = new Map<number, AchieveProvision>();

  for (const [key, value] of Object.entries(parse)) {
    if (isTsDiagnostic(value)) {
      map.set(value.code, new AchieveProvision(tracer, key, value));
    }
  }

  return map;
};
