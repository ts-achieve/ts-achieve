import vscode from "vscode";

import { TreeProviderBase } from "./provider";
import { isUnlocked, Star, Starmap, UnlockedStar } from "../star/star";
import {
  deepChildrenOf,
  hasChildren,
  pathKinds,
  topKinds,
} from "../star/taxonomy";
import { uncapitalize } from "../util/type";
import { makeTooltip, toPathTitle } from "./starlister";
import { consoleLog } from "../util/console";

const topSummaryKinds = ["overall", "favorite", "lifetime"] as const;

const summaryKinds = [...topSummaryKinds, ...pathKinds()] as const;

type SummaryKind = (typeof summaryKinds)[number];

export class Summarizer extends TreeProviderBase<SummaryKind> {
  kinds: SummaryKind[];

  constructor(starmap: Starmap, kinds?: SummaryKind[]) {
    super(starmap);
    this.kinds = kinds ?? Array.from(summaryKinds);
    consoleLog("Summarizer construction");
  }

  update(newMap: Starmap): void {
    this.starmap = newMap;
    consoleLog("Summarizer update");
  }

  loadStarmap(starmap: Starmap): Starmap {
    consoleLog("Summarizer starmap load");
    return starmap;
  }

  getChildren(providable?: SummaryKind): vscode.ProviderResult<SummaryKind[]> {
    if (!providable) {
      consoleLog("Summarizer children call (top-level)");
      return [...topSummaryKinds];
    } else if (providable === "lifetime") {
      return [...topKinds()];
    } else {
      const deepChildren = deepChildrenOf(providable);
      if (deepChildren.length > 0) {
        return deepChildren;
      } else {
        return undefined;
      }
    }
  }

  getTreeItem(providable: SummaryKind): vscode.TreeItem {
    switch (providable) {
      case "overall":
        const stars = this.starmap.values().toArray();

        const achieved = stars.filter(isUnlocked).length;
        const total = stars.length;

        return {
          label: `Overall: ${((achieved / total) * 100).toFixed(2)}%`,
          description: `(${achieved} of ${total})`,
        };
      case "favorite":
        const favorites = this.starmap
          .values()
          .toArray()
          .filter(isUnlocked)
          .sort((a, b) => a.encounterCount - b.encounterCount);
        const favorite = favorites.at(-1);

        return favorite
          ? {
              label: `Favorite achievement: ${favorite.code}`,
              description: `(${favorite.encounterCount} encounters)`,
              tooltip: makeTooltip(favorite),
            }
          : {
              label: `Favorite achievement: none`,
            };

      default:
        const statistic =
          providable === "lifetime"
            ? "encounter"
            : toPathTitle(uncapitalize(providable));
        const condition =
          providable === "lifetime"
            ? () => true
            : (star: Star) => star.kind.startsWith(providable);

        return {
          label: `Lifetime ${statistic}s: ${this.starmap
            .values()
            .filter((star) => isUnlocked(star) && condition(star))
            .map((star) => (star as UnlockedStar).encounterCount)
            .reduce((xs, x) => xs + x, 0)}`,
          collapsibleState:
            providable === "lifetime" || hasChildren(providable)
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
        };
    }
  }
}
