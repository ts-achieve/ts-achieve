import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { getStarmap } from "../globalState";
import {
  pathKinds,
  topKinds,
  errorKinds,
  names,
  suggestionKinds,
  ErrorKind,
  PathKind,
  SuggestionKind,
  TopKind,
  SyntaxErrorKind,
  syntaxErrorKinds,
} from "../util/const";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { capitalize, biject, Split } from "../util/type";
import { diagnosticToStar, Message } from "./diagnostic";
import { StarProviderBase } from "./provider";
import { Star, UnlockedStar, Starmap, isStar, isUnlocked } from "./star";

type PathTitle =
  | `${Capitalize<Extract<PathKind, "special">>} achievements`
  | `${Capitalize<Exclude<TopKind, "special">>}s`
  | SuggestionTitle
  | ErrorTitle;

type SuggestionTitle =
  `${Capitalize<Split<SuggestionKind, "-">[0]>} suggestions`;
type ErrorTitle =
  `${Capitalize<Split<ErrorKind | SyntaxErrorKind, "-">[0]>} errors`;

export const toPathTitle = (kind: PathKind): PathTitle => {
  switch (kind) {
    case "special":
      return `${capitalize(kind)} achievements`;
    case "message":
    case "suggestion":
    case "warning":
    case "error":
      return `${capitalize(kind)}s`;
    case "type-suggestion":
      return `Type suggestions` as const;
    case "language":
    case "other":
      return `${capitalize(kind)} suggestions`;
    case "type-error":
      return `Type errors` as const;
    case "control-flow":
      return `Control errors` as const;
    case "strict":
    case "syntax":
    case "async":
    case "class":
    case "function":
    case "tsconfig":
      return `${capitalize(kind)} errors`;
  }
  kind satisfies never;
};

type Folder<K extends PathKind = PathKind> = K extends any
  ? { kind: K } & vscode.TreeItem
  : never;

export class Starlister extends StarProviderBase<Star | Folder> {
  folders: Record<PathKind, Folder>;

  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
    this.folders = Object.fromEntries(
      biject(pathKinds, (kind) => {
        const folder = Object.assign(
          new vscode.TreeItem(
            toPathTitle(kind),
            vscode.TreeItemCollapsibleState.Collapsed,
          ),
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
        topKinds.includes(folder.kind as any),
      );
    } else if (isStar(providable)) {
      return [];
    } else if (providable.kind === "suggestion") {
      return Object.values(this.folders).filter((folder) =>
        suggestionKinds.includes(folder.kind as any),
      );
    } else if (providable.kind === "error") {
      return Object.values(this.folders).filter((folder) =>
        errorKinds.includes(folder.kind as any),
      );
    } else if (providable.kind === "syntax") {
      return Object.values(this.folders).filter((folder) =>
        syntaxErrorKinds.includes(folder.kind as any),
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
          providable.kind === "suggestion"
            ? suggestionKinds.includes(star.kind as any)
            : providable.kind === "error"
              ? errorKinds.includes(star.kind as any)
              : star.kind === providable.kind,
        );

      const achieved = stars.filter(isUnlocked).length;
      const total = stars.length;

      providable.description = `${((achieved / total) * 100).toFixed(2)}% (${achieved} of ${total})`;

      return providable;
    }
  }
}
