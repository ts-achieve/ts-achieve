import vscode from "vscode";

import { Starmap } from "../star/star";
import { consoleLog } from "../util/console";

export type Eventable<T> = T | undefined | null | void;

export abstract class StarProviderBase<
  T = never,
> implements vscode.TreeDataProvider<T> {
  starmap: Starmap;

  protected _onDidChangeTreeData: vscode.EventEmitter<Eventable<T>> =
    new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<Eventable<T>> =
    this._onDidChangeTreeData.event;

  constructor(...args: any[]) {
    this.starmap = this.loadStarmap(...args);
    this.refresh();
    consoleLog("StarProvider construction");
  }

  abstract getTreeItem(element: T): vscode.TreeItem;

  abstract getChildren(element?: T | undefined): vscode.ProviderResult<T[]>;

  /**
   * how to use the constructor arguments to get a {@linkcode Starmap}
   */
  abstract loadStarmap(..._: any[]): Starmap;

  abstract update(..._: any[]): void;

  /**
   * wrapper for {@linkcode vscode.EventEmitter.fire}
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
    consoleLog("StarProvider refresh");
  }
}

const sortPriorities = [
  "kind (errors first)",
  "kind (errors last)",
  "locked first",
  "unlocked first",
  "code (ascending)",
  "code (descending)",
  "alphabetic (forwards)",
  "alphabetic (backwards)",
];

export type SortPriority = (typeof sortPriorities)[number];
