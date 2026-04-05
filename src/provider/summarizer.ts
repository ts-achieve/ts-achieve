import vscode from "vscode";

import { StarProviderBase } from "./provider";
import { isUnlocked, Star, Starmap, UnlockedStar } from "../star/star";
import {
  deepChildrenOf,
  hasChildren,
  isErrorStarKind,
  pathKinds,
  topKinds,
} from "../star/taxonomy";
import { uncapitalize } from "../util/type";
import { toPathTitle } from "./starlister";

const summaryKinds = ["overall", "encounter", ...pathKinds()] as const;
type SummaryKind = (typeof summaryKinds)[number];

export class Summarizer extends StarProviderBase<SummaryKind> {
  kinds: SummaryKind[];

  constructor(starmap: Starmap, kinds?: SummaryKind[]) {
    super(starmap);
    this.kinds = kinds ?? Array.from(summaryKinds);
  }

  update(newMap: Starmap): void {
    this.starmap = newMap;
  }

  loadStarmap(starmap: Starmap): Starmap {
    return starmap;
  }

  getChildren(kind?: SummaryKind): vscode.ProviderResult<SummaryKind[]> {
    if (!kind) {
      return ["overall", "encounter"];
    } else if (kind === "encounter") {
      return Array.from(topKinds());
    } else {
      const deepChildren = deepChildrenOf(kind);
      if (deepChildren.length > 0) {
        return deepChildren;
      } else {
        return undefined;
      }
    }
  }

  getTreeItem(kind: SummaryKind): vscode.TreeItem {
    switch (kind) {
      case "overall":
        const stars = this.starmap.values().toArray();

        const achieved = stars.filter(isUnlocked).length;
        const total = stars.length;

        return {
          label: `Overall: ${((achieved / total) * 100).toFixed(2)}%`,
          description: `(${achieved} of ${total})`,
        };
      default:
        const statistic =
          kind === "encounter" ? kind : toPathTitle(uncapitalize(kind));
        const condition =
          kind === "encounter"
            ? () => true
            : kind === "error"
              ? (star: Star) => isErrorStarKind(star.kind as any)
              : (star: Star) => star.kind === kind;

        return {
          label: `Lifetime ${statistic}s: ${this.starmap
            .values()
            .filter((star) => isUnlocked(star) && condition(star))
            .map((star) => (star as UnlockedStar).encounterCount)
            .reduce((xs, x) => xs + x, 0)}`,
          collapsibleState:
            kind === "encounter" || hasChildren(kind)
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
        };
    }
  }
}
