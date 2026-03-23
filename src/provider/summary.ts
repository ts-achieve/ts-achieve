import vscode, { TreeItem } from "vscode";

import { ExtensionConfig } from "../config";
import { StarProviderBase } from "./provider";
import { isErrorKind, isUnlocked, Starmap, UnlockedStar } from "./star";

const summaryKinds = ["overall", "lifetime"] as const;
type SummaryKind = (typeof summaryKinds)[number];

export class SummaryProvider extends StarProviderBase<SummaryKind> {
  kinds: SummaryKind[];

  constructor(
    config: ExtensionConfig,
    starmap: Starmap,
    kinds?: SummaryKind[],
  ) {
    super(config, starmap);
    this.kinds = kinds ?? summaryKinds.slice(0);
  }

  override loadStarmap(starmap: Starmap): Starmap {
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
      case "lifetime":
        return new TreeItem(
          `Lifetime: ${this.starmap
            .values()
            .filter((star) => isUnlocked(star) && isErrorKind(star.kind))
            .map((star) => (star as UnlockedStar).lifetime)
            .reduce((xs, x) => xs + x, 0)}`,
        );
    }
  }

  override getChildren(
    kind?: SummaryKind,
  ): vscode.ProviderResult<SummaryKind[]> {
    return kind ? [] : this.kinds;
  }
}
