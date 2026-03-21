import child from "child_process";
import vscode from "vscode";

import { Maybe } from "./type";
import { log } from "./util";
import { diagnosticMessagesUrl } from "./const";
import { PathRecord, MaybeNode } from "./achieve";
import {
  Provision,
  Configurable,
  AchieveMap,
  ExtensionConfig,
  achieveKinds,
  PathProvision,
  classify,
  isConfigurable,
  AchieveProvision,
  TsDiagnostic,
  isTsDiagnostic,
} from "./provision";

export abstract class ProviderBase
  implements vscode.TreeDataProvider<Provision>, Configurable
{
  paths: PathRecord;
  achieves: AchieveMap;
  config: ExtensionConfig;

  protected _emitter: vscode.EventEmitter<MaybeNode>;

  readonly onDidChangeTreeData: vscode.Event<MaybeNode>;

  constructor(context: vscode.ExtensionContext, config: ExtensionConfig) {
    this.config = config;

    this.achieves = fetchAchieveMap(context, this.config);

    this.paths = Object.fromEntries(
      achieveKinds.map((kind) => [
        kind,
        new PathProvision(
          kind,
          (achievement) => classify(achievement) === kind,
          this.achieves,
        ),
      ]),
    ) as PathRecord;

    this._emitter = new vscode.EventEmitter<MaybeNode>();
    this.onDidChangeTreeData = this._emitter.event;
  }

  get allProvisions(): Provision[] {
    return this.topProvisions.concat(this.achieves.values().toArray());
  }

  get topProvisions(): Provision[] {
    return Object.values(this.paths);
  }

  reconfigure(config: ExtensionConfig): void {
    this.allProvisions.forEach((provision) => {
      if (isConfigurable(provision)) {
        provision.reconfigure(config);
      }
    });
    this.refresh();
  }

  refresh(): void {
    this._emitter.fire();
  }

  getChildren(element?: Provision): vscode.ProviderResult<Provision[]> {
    log("parent:", element);
    if (element) {
      if (element instanceof PathProvision) {
        return this.achieves
          .values()
          .filter((achievement) => classify(achievement) === element.kind)
          .toArray();
      } else {
        return [];
      }
    } else {
      return this.topProvisions;
    }
  }

  getTreeItem(element: Provision): Provision | Thenable<Provision> {
    return element;
  }
}

const fetchAchieveMap = (
  context: vscode.ExtensionContext,
  config: ExtensionConfig,
): AchieveMap => {
  const maybeMap: Maybe<Map<number, AchieveProvision>> =
    context.globalState.get("achieves");

  return maybeMap && Object.keys(maybeMap).length ? maybeMap : curl(config);
};

const curl = (config: ExtensionConfig): AchieveMap => {
  const parse: Record<string, TsDiagnostic> = JSON.parse(
    child.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }),
  );

  const map = new Map<number, AchieveProvision>();
  for (const [key, value] of Object.entries(parse)) {
    if (isTsDiagnostic(value)) {
      map.set(value.code, new AchieveProvision(key, value, config));
    }
  }

  return map;
};
