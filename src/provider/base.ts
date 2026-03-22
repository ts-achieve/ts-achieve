import vscode from "vscode";

import { trace } from "../util";
import {
  Configurable,
  AchieveMap,
  PathProvision,
  isConfigurable,
  AchieveProvision,
  PathKind,
} from "../provision";
import { ExtensionConfig } from "../config";
import { diagnosticMessages } from "../diagnosticMessages";
import { Summary } from "./summary";
import { errorKinds, topPathKinds } from "../const";

export type Provision = PathProvision | Summary | AchieveProvision;

export type MaybeProvision = Provision | undefined | null | void;

export type PathRecord = Record<PathKind, PathProvision>;

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
      [...topPathKinds, ...errorKinds].map(
        (kind) =>
          [
            kind,
            new PathProvision(
              kind,
              kind === "error"
                ? (achieve) => errorKinds.includes(achieve.kind as any)
                : (achieve) => achieve.kind === kind,
              this.achieveMap,
            ),
          ] as const,
      ),
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
    return ([] as Provision[]).concat(
      Object.values(this.paths),
      this.achieveMap.values().toArray(),
    );
  }

  get topProvisions(): Provision[] {
    return Object.values(this.paths).filter((path) =>
      topPathKinds.includes(path.kind as any),
    );
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
    this.allProvisions.forEach((provision) => provision.refresh());
    this._emitter.fire();
  }

  getChildren(element?: Provision): vscode.ProviderResult<Provision[]> {
    trace("parent:", element);

    if (element) {
      if (element instanceof PathProvision) {
        if (element.kind === "error") {
          return Object.values(this.paths).filter((path) =>
            errorKinds.includes(path.kind as any),
          );
        } else {
          return this.achieveMap.values().filter(element.filter).toArray();
        }
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
