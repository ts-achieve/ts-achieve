import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { Starmap } from "../star/star";

export type Eventable<T> = T | undefined | null | void;

export type Configurable = {
  config: ExtensionConfig;
  reconfigure(config: ExtensionConfig): void;
};

export abstract class StarProviderBase<T>
  implements vscode.TreeDataProvider<T>, Configurable
{
  config: ExtensionConfig;
  starmap: Starmap;

  protected _onDidChangeTreeData: vscode.EventEmitter<Eventable<T>> =
    new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<Eventable<T>> =
    this._onDidChangeTreeData.event;

  constructor(config: ExtensionConfig, ...args: any[]) {
    this.config = config;
    this.starmap = this.loadStarmap(...args);
  }

  abstract getTreeItem(element: T): vscode.TreeItem;

  abstract getChildren(element?: T | undefined): vscode.ProviderResult<T[]>;

  abstract loadStarmap(..._: any[]): Starmap;

  abstract update(..._: any[]): void;

  reconfigure(config: ExtensionConfig): void {
    this.config = config;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
