import vscode from "vscode";

import { Starmap } from "../star/star";

export type Eventable<T> = T | undefined | null | void;

export abstract class StarProviderBase<
  T,
> implements vscode.TreeDataProvider<T> {
  starmap: Starmap;

  protected _onDidChangeTreeData: vscode.EventEmitter<Eventable<T>> =
    new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<Eventable<T>> =
    this._onDidChangeTreeData.event;

  constructor(...args: any[]) {
    this.starmap = this.loadStarmap(...args);
  }

  abstract getTreeItem(element: T): vscode.TreeItem;

  abstract getChildren(element?: T | undefined): vscode.ProviderResult<T[]>;

  abstract loadStarmap(..._: any[]): Starmap;

  abstract update(..._: any[]): void;

  refresh(): void {
    this._onDidChangeTreeData.fire();
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
