import child from "child_process";
import vscode from "vscode";

import { diagnosticMessagesUrl } from "../const";
import { AchieveProvision, AchieveMap, isTsDiagnostic } from "../provision";
import { ProviderBase } from "./base";
import { ExtensionConfig } from "../config";
import { Maybe } from "../type";

export class AchievedProvider extends ProviderBase {
  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
  }

  loadAchieves(context: vscode.ExtensionContext) {
    const maybeMap: Maybe<Map<number, AchieveProvision>> =
      context.globalState.get("achieves");

    return maybeMap && Object.keys(maybeMap).length ? maybeMap : curl();
  }
}

const curl = (): AchieveMap => {
  const parse = JSON.parse(
    child.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }),
  );

  const map = new Map<number, AchieveProvision>();

  for (const [key, value] of Object.entries(parse)) {
    if (isTsDiagnostic(value)) {
      map.set(value.code, new AchieveProvision(key, value));
    }
  }

  return map;
};
