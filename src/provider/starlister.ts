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
  showing,
  pathKinds,
} from "../util/const";
import {
  capitalize,
  includes,
  mod,
  not,
  safeConcat,
  Split,
  split,
  succeed,
} from "../util/type";
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
    case "module":
    case "statement":
    case "expression":
    case "regex":
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

type Showing = (typeof showing)[keyof typeof showing];

export type Configurable = {
  reconfigure(config: ExtensionConfig): void;
};

export type Subcategorize = "none" | "achievements only" | "all";

export class Starlister<T = never>
  extends StarProviderBase<T | Star | PathKind>
  implements Configurable
{
  showing: Showing;
  subcategorize: Subcategorize = "all";

  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(context);
    this.configure(config);
    this.showing = showing.all;
  }

  configure(config: ExtensionConfig): void {
    this.subcategorize = config.subcategorize;
  }

  reconfigure(config: ExtensionConfig): void {
    this.configure(config);
    this.refresh();
  }

  cycleShowing(): void {
    this.showing = mod(succeed(this.showing), 3);
    vscode.commands.executeCommand(
      "setContext",
      "tsAchieve.showing",
      this.showing,
    );
    this.refresh();
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
    switch (this.showing) {
      case 0:
        if (!providable) {
          if (this.subcategorize !== "none") {
            return Array.from(topKinds);
          } else {
            return this.starmap.values().toArray();
          }
        } else if (isStar(providable)) {
          return undefined;
        } else if (typeof providable === "string") {
          if (providable === "suggestion") {
            return Array.from(suggestionKinds);
          } else if (providable === "error") {
            if (this.subcategorize === "all") {
              return Array.from(errorKinds);
            } else {
              return this.starmap
                .values()
                .filter((star) =>
                  safeConcat(errorKinds, syntaxErrorKinds).includes(
                    star.kind as any,
                  ),
                )
                .toArray();
            }
          } else if (providable === "syntax") {
            if (this.subcategorize === "all") {
              return Array.from(syntaxErrorKinds);
            } else {
              return undefined;
            }
          } else {
            return this.starmap
              .values()
              .filter((star) => star.kind === providable)
              .toArray();
          }
        } else {
          return undefined;
        }
      case 1:
        return providable
          ? undefined
          : this.starmap.values().filter(isUnlocked).toArray();
      case 2:
        return providable
          ? undefined
          : this.starmap.values().filter(not(isUnlocked)).toArray();
    }
    this.showing satisfies never;
  }

  getDescendants(): (T | Star | PathKind)[] {
    const descendants = [];

    const next = (children?: (T | Star | PathKind)[]) =>
      (children ?? [undefined])
        .map((child) => this.getChildren(child))
        .filter((x) => Array.isArray(x))
        .flat();

    let children = next();

    while (Array.isArray(children) && children.length > 0) {
      descendants.push(...children);
      children = next(children);
    }

    return descendants as (T | Star | PathKind)[];
  }

  expandAll(): void {
    this.getDescendants().forEach((descendant) => {
      if (includes(pathKinds, descendant)) {
        console.log(descendant);
        this.getTreeItem(descendant).collapsibleState =
          vscode.TreeItemCollapsibleState.Expanded;
      }
    });
  }

  getTreeItem(providable: Star | PathKind): vscode.TreeItem {
    if (isStar(providable)) {
      const star = providable;

      const label = star.code.toString();

      if (isUnlocked(star)) {
        const tooltip = new vscode.MarkdownString(
          `
$(star-full) Unlocked on ${dateAtTime(star.time)}

${++star.encounterCount} lifetime encounters (last: ${dateAtTime(star.lastEncounter)})

---

$(location) Unlock location: \`${star.fileName}\`

\`\`\`ts
${star.triggerText}
\`\`\`

---

$(info) Unlock message:

\`\`\`
${star.messageText} (ts${star.code})
\`\`\``.trim(),
        );
        tooltip.supportThemeIcons = true;
        harden(tooltip);
        return {
          label,
          description: star.messageTemplate,
          resourceUri: vscode.Uri.parse(names.colors.unlocked),
          iconPath: new vscode.ThemeIcon(
            "star-full",
            new vscode.ThemeColor(names.colors.unlocked),
          ),
          tooltip,
        };
      } else {
        const tooltip = new vscode.MarkdownString(
          `
$(star-empty) Locked
`.trim(),
        );
        if (
          vscode.workspace
            .getConfiguration(names.ex)
            .get(names.config.revealDescription)
        ) {
          tooltip.appendMarkdown(
            `
[]()


---

$(info) Message template:

\`\`\`
${star.messageTemplate} (ts${star.code})
\`\`\``.trim(),
          );
        }
        tooltip.supportThemeIcons = true;
        harden(tooltip);
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
          tooltip,
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

const dateAtTime = (time: number) => {
  const date = new Date(time);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

const harden = (markdown: vscode.MarkdownString): vscode.MarkdownString => {
  markdown.appendMarkdown("\n[]()");
  return markdown;
};
