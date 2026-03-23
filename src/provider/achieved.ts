import child from "child_process";
import vscode from "vscode";

import { diagnosticMessagesUrl } from "../util/const";
import { Tracer } from "../util/tracer";
import { AchieveProvision, AchieveMap, isTsDiagnostic } from "./provision";
import { ProviderBase } from "./base";
import { ExtensionConfig } from "../config";
import { getAchieveMap } from "../globalState";

export class AchievedProvider extends ProviderBase {
  constructor(
    config: ExtensionConfig,
    tracer: Tracer,
    context: vscode.ExtensionContext,
  ) {
    super(config, tracer, context);
  }

  override loadAchieves(context: vscode.ExtensionContext) {
    return getAchieveMap(context, this.tracer) ?? curl(this.tracer);
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
