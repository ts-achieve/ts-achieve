import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { getStarmap } from "../globalState";
import {
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
import { capitalize, Split, split } from "../util/type";
import { StarProviderBase } from "./provider";
import {
  Star,
  UnlockedStar,
  Starmap,
  isStar,
  isUnlocked,
  makeStarmap,
} from "../star/star";

type PathTitle =
  | `${Capitalize<Extract<PathKind, "special">>} achievements`
  | `${Capitalize<Exclude<TopKind, "special">>}s`
  | `${Capitalize<Split<SuggestionKind, "-">[0]>} suggestions`
  | `${Capitalize<Split<ErrorKind | SyntaxErrorKind, "-">[0]>} errors`;

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
    case "other-suggestion":
    case "language":
      return `${split(capitalize(kind), "-")[0]} suggestions`;

    case "type-error":
    case "other-error":
    case "statement":
    case "strict":
    case "syntax":
    case "async":
    case "class":
    case "function":
    case "tsconfig":
      return `${split(capitalize(kind), "-")[0]} errors`;
  }
  kind satisfies never;
};

export type Folder<K extends PathKind = PathKind> = K extends any
  ? { kind: K } & vscode.TreeItem
  : never;

export class Starlister<T = never> extends StarProviderBase<
  T | Star | PathKind
> {
  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
  }

  update(unlockedStar?: UnlockedStar): void {
    if (unlockedStar) {
      this.starmap.set(unlockedStar.code, unlockedStar);
    }
  }

  loadStarmap(context: vscode.ExtensionContext): Starmap {
    return getStarmap(context) ?? makeStarmap();
  }

  getChildren(
    providable?: T | Star | PathKind,
  ): vscode.ProviderResult<(T | Star | PathKind)[]> {
    if (!providable) {
      return Array.from(topKinds);
    } else if (isStar(providable)) {
      return [];
    } else if (typeof providable === "string") {
      if (providable === "suggestion") {
        return Array.from(suggestionKinds);
      } else if (providable === "error") {
        return Array.from(errorKinds);
      } else if (providable === "syntax") {
        return Array.from(syntaxErrorKinds);
      } else {
        return this.starmap
          .values()
          .filter((star) => star.kind === providable)
          .toArray();
      }
    } else {
      return undefined;
    }
  }

  getTreeItem(providable: Star | PathKind): vscode.TreeItem {
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
Unlocked on ${new Date(star.time)} in file "${star.fileName}" with region
\`\`\`ts
${star.triggerText}
\`\`\`
which triggered the message: "${star.messageText}"

Lifetime encounters: ${++star.encounterCount}, most recently on ${new Date(star.lastEncounter)}
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
          providable === "suggestion"
            ? suggestionKinds.includes(star.kind as any)
            : providable === "syntax"
              ? syntaxErrorKinds.includes(star.kind as any)
              : providable === "error"
                ? errorKinds.includes(star.kind as any)
                : star.kind === providable,
        );

      const achieved = stars.filter(isUnlocked).length;
      const total = stars.length;

      return {
        label: toPathTitle(providable),
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        description: `${((achieved / total) * 100).toFixed(2)}% (${achieved} of ${total})`,
      };
    }
  }
}
