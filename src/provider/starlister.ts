import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { fetchStarmap } from "../globalState";
import { names, showing } from "../util/const";
import { capitalize, mod, not, split, succeed } from "../util/type";
import { StarProviderBase } from "./provider";
import {
  Star,
  UnlockedStar,
  Starmap,
  isStar,
  isUnlocked,
  makeStarmap,
} from "../star/star";
import { PathKind, topKinds, StarKind, deepChildrenOf } from "../star/taxonomy";

export const toPathTitle = (s: string) => {
  const capitalizeOOP = (s: string) => (s === "oop" ? "OOP" : s);
  if (s.includes("-")) {
    return `${capitalizeOOP(split(s, "-").at(-1)!)} ${split(s, "-")[0]}`;
  } else {
    return s;
  }
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
  extends StarProviderBase<T | PathKind | StarKind | Star>
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
    return fetchStarmap(context) ?? makeStarmap();
  }

  getChildren(
    providable?: T | PathKind | StarKind | Star,
  ): vscode.ProviderResult<(T | PathKind | StarKind | Star)[]> {
    switch (this.showing) {
      case 0:
        if (!providable) {
          if (this.subcategorize !== "none") {
            return topKinds();
          } else {
            return this.starmap.values().toArray();
          }
        } else if (isStar(providable)) {
          return undefined;
        } else if (typeof providable === "string") {
          const deepChildren = deepChildrenOf(providable);
          if (deepChildren.length > 0) {
            return deepChildren;
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

  getDescendants(): (T | PathKind | StarKind | Star)[] {
    const descendants = [];

    const next = (children?: (T | PathKind | StarKind | Star)[]) =>
      (children ?? [undefined])
        .map((child) => this.getChildren(child))
        .filter((x) => Array.isArray(x))
        .flat();

    let children = next();

    while (Array.isArray(children) && children.length > 0) {
      descendants.push(...children);
      children = next(children);
    }

    return descendants as (T | PathKind | StarKind | Star)[];
  }

  getTreeItem(providable: T | PathKind | StarKind | Star): vscode.TreeItem {
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
\`\`\`

Internal category: \`${star.kind}\`
`.trim(),
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
\`\`\`

Internal category: \`${star.kind}\`
`.trim(),
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
    } else if (typeof providable === "string") {
      const stars = this.starmap
        .values()
        .toArray()
        .filter((star) => {
          if (star.code > 7000) {
            console.log(
              star.code,
              star.kind,
              providable,
              star.kind.startsWith(providable),
            );
          }
          return star.kind.startsWith(providable);
        });

      const achieved = stars.filter(isUnlocked).length;
      const total = stars.length;

      return {
        label: `${capitalize(toPathTitle(providable))}s`,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        description: `${((achieved / total) * 100).toFixed(2)}% (${achieved} of ${total})`,
      };
    }
    return {};
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
