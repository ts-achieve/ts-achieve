import child from "child_process";
import vscode from "vscode";

import { diagnosticMessagesUrl } from "../const";
import { AchieveProvision, AchieveMap, isTsDiagnostic } from "../provision";
import { ProviderBase } from "./base";
import { ExtensionConfig } from "../config";
import { Maybe } from "../type";
import { trace } from "../util";

export class AchievedProvider extends ProviderBase {
  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
  }

  override loadAchieves(context: vscode.ExtensionContext) {
    const maybeMap: Maybe<Map<number, AchieveProvision>> =
      context.globalState.get("achieves");

    trace("mappy", maybeMap ?? "no achieves in global state");
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
