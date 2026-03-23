import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { errorKinds, names, pathKinds, topPathKinds } from "../util/const";
import { isUnlocked, Star, Starmap, UnlockedStar } from "./star";
import { diagnosticToStar, Message } from "./diagnostic";
import { capitalize } from "../util/type";
import { getStarmap } from "../globalState";

export type Eventable<T> = T | undefined | null | void;

export type Configurable = {
  config: ExtensionConfig;

  reconfigure(config: ExtensionConfig): void;
  refresh(..._args: any[]): void;
};

export abstract class StarProviderBase<T>
  implements vscode.TreeDataProvider<T>, Configurable
{
  config: ExtensionConfig;
  starmap: Starmap;

  protected _emitter: vscode.EventEmitter<Eventable<T>> =
    new vscode.EventEmitter<Eventable<T>>();
  readonly event: vscode.Event<Eventable<T>> = this._emitter.event;

  constructor(config: ExtensionConfig, ...args: any[]) {
    this.config = config;
    this.starmap = this.loadStarmap(...args);
  }

  abstract getTreeItem(element: T): vscode.TreeItem;

  abstract getChildren(element?: T | undefined): vscode.ProviderResult<T[]>;

  abstract loadStarmap(..._: any[]): Starmap;

  reconfigure(config: ExtensionConfig): void {
    this.config = config;
    this.refresh();
  }

  refresh(..._args: any[]): void {
    this._emitter.fire();
  }
}

export class StarlistProvider extends StarProviderBase<Star | PathKind> {
  override refresh(unlockedStar?: UnlockedStar): void {
    if (unlockedStar) {
      this.starmap.set(unlockedStar.code, unlockedStar);
    }

    this._emitter.fire();
  }

  loadStarmap(context: vscode.ExtensionContext): Starmap {
    return (
      getStarmap(context) ??
      new Map(
        Object.entries(diagnosticMessages).map(([key, value]) => {
          return [value.code, diagnosticToStar(value, key as Message)];
        }),
      )
    );
  }

  getChildren(
    element?: Star | PathKind,
  ): vscode.ProviderResult<(Star | PathKind)[]> {
    if (!element) {
      return topPathKinds.slice(0);
    } else if (typeof element === "object") {
      return [];
    } else if (element === "error") {
      return errorKinds.slice(0);
    } else {
      return this.starmap
        .values()
        .filter((star) => star.kind === element)
        .toArray();
    }
  }

  getTreeItem(providable: Star | PathKind): vscode.TreeItem {
    if (typeof providable === "object") {
      const star = providable;
      const label = star.code.toString();

      if (isUnlocked(star)) {
        return {
          label,
          description: star.messageTemplate,
          resourceUri: vscode.Uri.parse(names.colors.unlockedAchievement),
          iconPath: new vscode.ThemeIcon(
            "star-full",
            new vscode.ThemeColor(names.colors.unlockedAchievement),
          ),

          tooltip: new vscode.MarkdownString(
            `
Unlocked on ${new Date(star.time)} in file "${star.fileName}" with line
\`\`\`ts
${star.triggerText}
\`\`\`
which triggered the message: "${star.messageText}"

Lifetime encounters: ${++star.lifetime}, most recently on ${new Date(star.lastEncounter)}
    `.trim(),
          ),
        };
      } else {
        return {
          label,
          description: vscode.workspace
            .getConfiguration(names.ex)
            .get(names.config.revealDescription)
            ? star.messageTemplate
            : "?",
          resourceUri: vscode.Uri.parse(names.colors.lockedAchievement),
          iconPath: new vscode.ThemeIcon(
            "lock",
            new vscode.ThemeColor(names.colors.lockedAchievement),
          ),
        };
      }
    } else {
      const stars = this.starmap
        .values()
        .toArray()
        .filter((star) => star.kind === providable);
      const achieved = stars.filter(isUnlocked).length;
      const total = stars.length;

      return {
        label: `${capitalize(
          toPathTitle(providable),
        )}: ${((achieved / total) * 100).toFixed(2)}%`,
        description: `(${achieved} of ${total})`,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      };
    }
  }
}

type PathKind = (typeof pathKinds)[number];

type PathTitle =
  | `${Capitalize<Extract<PathKind, "special">>} achievements`
  | `${Capitalize<Extract<PathKind, "message" | "suggestion" | "warning" | "error">>}s`
  | `${Capitalize<Extract<PathKind, "strict" | "syntax" | "tsconfig" | "type">>} errors`;

const toPathTitle = (kind: PathKind): PathTitle => {
  switch (kind) {
    case "special":
      return `${capitalize(kind)} achievements`;
    case "message":
    case "suggestion":
    case "warning":
    case "error":
      return `${capitalize(kind)}s`;
    case "strict":
    case "syntax":
    case "tsconfig":
    case "type":
      return `${capitalize(kind)} errors`;
  }
  kind satisfies never;
};
