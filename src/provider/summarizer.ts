import vscode, { TreeItem } from "vscode";

import { ExtensionConfig } from "../config";
import { StarProviderBase } from "./provider";
import { isUnlocked, Star, Starmap, UnlockedStar } from "../star/star";
import { isErrorKind, pathKinds } from "../util/const";
import { uncapitalize } from "../util/type";
import { toPathTitle } from "./starlister";

const summaryKinds = ["overall", "encounters", ...pathKinds] as const;
type SummaryKind = (typeof summaryKinds)[number];

export class Summarizer extends StarProviderBase<SummaryKind> {
  kinds: SummaryKind[];

  constructor(
    config: ExtensionConfig,
    starmap: Starmap,
    kinds?: SummaryKind[],
  ) {
    super(config, starmap);
    this.kinds = kinds ?? summaryKinds.slice(0);
  }

  update(newMap: Starmap): void {
    this.starmap = newMap;
  }

  loadStarmap(starmap: Starmap): Starmap {
    return starmap;
  }

  getTreeItem(kind: SummaryKind): vscode.TreeItem {
    switch (kind) {
      case "overall":
        const stars = this.starmap.values().toArray();

        const achieved = stars.filter(isUnlocked).length;
        const total = stars.length;

        const treeItem = new TreeItem(
          `Overall: ${((achieved / total) * 100).toFixed(2)}%`,
        );
        treeItem.description = `(${achieved} of ${total})`;

        return treeItem;
      default:
        const statistic =
          kind === "encounters" ? kind : uncapitalize(toPathTitle(kind));
        const condition =
          kind === "encounters"
            ? () => true
            : kind === "error"
              ? (star: Star) => isErrorKind(star.kind as any)
              : (star: Star) => star.kind === kind;

        return new TreeItem(
          `Lifetime ${statistic}: ${this.starmap
            .values()
            .filter((star) => isUnlocked(star) && condition(star))
            .map((star) => (star as UnlockedStar).encounterCount)
            .reduce((xs, x) => xs + x, 0)}`,
        );
    }
  }

  getChildren(kind?: SummaryKind): vscode.ProviderResult<SummaryKind[]> {
    return kind ? [] : this.kinds;
  }
}
