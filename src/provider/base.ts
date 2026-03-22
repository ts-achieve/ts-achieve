import vscode from "vscode";

import { log } from "../util";
import { achieveKinds } from "../const";
import {
  Provision,
  Configurable,
  AchieveMap,
  PathProvision,
  isConfigurable,
  AchieveProvision,
  MaybeProvision,
} from "../provision";
import { ExtensionConfig } from "../config";
import { diagnosticMessages } from "../diagnosticMessages";

export type AchieveKind = (typeof achieveKinds)[number];

export type PathRecord = Record<AchieveKind, PathProvision>;

export abstract class ProviderBase
  implements vscode.TreeDataProvider<Provision>, Configurable
{
  paths: PathRecord;
  achieveMap: AchieveMap;
  config: ExtensionConfig;

  protected _emitter: vscode.EventEmitter<MaybeProvision>;

  readonly onDidChangeTreeData: vscode.Event<MaybeProvision>;

  constructor(config: ExtensionConfig, ...loadArgs: any[]) {
    this.config = config;

    this.achieveMap = this.loadAchieves(...loadArgs);

    this.paths = Object.fromEntries(
      achieveKinds.map((kind) => [
        kind,
        new PathProvision(
          kind,
          (achieve) => achieve.kind === kind,
          this.achieveMap,
        ),
      ]),
    ) as PathRecord;

    this._emitter = new vscode.EventEmitter<MaybeProvision>();
    this.onDidChangeTreeData = this._emitter.event;
  }

  loadAchieves(..._args: any[]): AchieveMap {
    return new Map(
      Object.entries(diagnosticMessages).map(([key, value]) => {
        return [value.code, new AchieveProvision(key, value)];
      }),
    );
  }

  get allProvisions(): Provision[] {
    return this.topProvisions.concat(this.achieveMap.values().toArray());
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

  refresh(..._args: any[]): void {
    this._emitter.fire();
  }

  getChildren(element?: Provision): vscode.ProviderResult<Provision[]> {
    log("parent:", element);

    if (element) {
      if (element instanceof PathProvision) {
        return this.achieveMap
          .values()
          .filter((achievement) => achievement.kind === element.kind)
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
