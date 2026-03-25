import vscode, { TreeItem } from "vscode";

import { ExtensionConfig } from "../config";
import { diagnosticMessages } from "../util/diagnosticMessages";
import {
  errorKinds,
  loadingText,
  names,
  pathKinds,
  topPathKinds,
} from "../util/const";
import { isStar, isUnlocked, Star, Starmap, UnlockedStar } from "./star";
import { diagnosticToStar, Message } from "./diagnostic";
import { biject, capitalize } from "../util/type";
import { getStarmap } from "../globalState";
import { logger } from "../util/logger";

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

type Folder = { kind: PathKind } & vscode.TreeItem;

export class Starlister extends StarProviderBase<Star | Folder> {
  folders: Record<PathKind, Folder>;

  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
    this.folders = Object.fromEntries(
      biject(pathKinds, (kind) => {
        const folder = Object.assign(
          new TreeItem(loadingText, vscode.TreeItemCollapsibleState.Expanded),
          { kind },
        );
        return [kind, folder];
      }),
    ) as Record<PathKind, Folder>;
  }

  update(unlockedStar?: UnlockedStar): void {
    if (unlockedStar) {
      this.starmap.set(unlockedStar.code, unlockedStar);
    }
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
    providable?: Star | Folder,
  ): vscode.ProviderResult<(Star | Folder)[]> {
    if (!providable) {
      return Object.values(this.folders).filter((folder) =>
        topPathKinds.includes(folder.kind as any),
      );
    } else if (isStar(providable)) {
      return [];
    } else if (providable.kind === "error") {
      return Object.values(this.folders).filter((folder) =>
        errorKinds.includes(folder.kind as any),
      );
    } else {
      return this.starmap
        .values()
        .filter((star) => star.kind === providable.kind)
        .toArray();
    }
  }

  getTreeItem(providable: Star | Folder): vscode.TreeItem {
    if (isStar(providable)) {
      const star = providable;

      const label = star.code.toString();

      if (isUnlocked(star)) {
        return {
          label,
          description: star.messageTemplate,
          resourceUri: vscode.Uri.parse(names.colors.unlocked),
          iconPath: new vscode.ThemeIcon(
            "star-full",
            new vscode.ThemeColor(names.colors.unlocked),
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
          resourceUri: vscode.Uri.parse(names.colors.locked),
          iconPath: new vscode.ThemeIcon(
            "lock",
            new vscode.ThemeColor(names.colors.locked),
          ),
        };
      }
    } else {
      const stars = this.starmap
        .values()
        .toArray()
        .filter((star) =>
          providable.kind === "error"
            ? errorKinds.includes(star.kind as any)
            : star.kind === providable.kind,
        );

      const achieved = stars.filter(isUnlocked).length;
      const total = stars.length;

      const newFolder = new TreeItem(
        `${capitalize(
          toPathTitle(providable.kind),
        )}: ${((achieved / total) * 100).toFixed(2)}%`,
        providable.collapsibleState,
      );
      newFolder.description = `(${achieved} of ${total})`;

      logger(providable.collapsibleState, newFolder.collapsibleState);

      return newFolder;
    }
  }
}
