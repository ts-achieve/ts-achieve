import vscode from "vscode";

import { StatisticType } from "./const";
import { capitalize, log } from "./util";
import {
  SummaryProvision,
  AchieveProvision,
  Provision,
  PathProvision,
  AchieveKind,
} from "./provision";
import { ProviderBase } from "./provide";
import { ExtensionConfig } from "./config";

export type MaybeNode = Provision | undefined | null | void;

export type PathRecord = Record<AchieveKind, PathProvision>;
export type SummaryRecord = Record<string, SummaryProvision>;

export class AchieveProvider extends ProviderBase {
  summary: SummaryRecord;

  constructor(
    context: vscode.ExtensionContext,
    configuration: ExtensionConfig,
  ) {
    super(context, configuration);

    this.summary = {};
    this.setAchievementProportionSummary("overall", () =>
      this.achieves.values().toArray(),
    );
    this.setAchievementProportionSummary("messages", () =>
      this.achieves
        .values()
        .filter((achievement) => achievement.category === "Message")
        .toArray(),
    );
    this.setAchievementProportionSummary("suggestions", () =>
      this.achieves
        .values()
        .filter((achievement) => achievement.category === "Suggestion")
        .toArray(),
    );
    this.setAchievementProportionSummary("errors", () =>
      this.achieves
        .values()
        .filter((achievement) => achievement.category === "Error")
        .toArray(),
    );
  }

  get topProvisions(): Provision[] {
    return ([] as Provision[]).concat(
      Object.values(this.summary),
      Object.values(this.paths),
    );
  }

  refresh(): void {
    log("fire");
    Object.values(this.summary).forEach((statistic) =>
      statistic.compute(this.achieves.values().toArray()),
    );
    this._emitter.fire();
  }

  setAchievementProportionSummary(
    key: StatisticType,
    collection: () => AchieveProvision[],
    label?: string,
  ) {
    Object.assign(this.summary, {
      [key]: new SummaryProvision(() => {
        const achieved = collection().filter(
          (achievement) => achievement.isUnlocked,
        ).length;
        const total = collection().length;
        return {
          label: `${label ?? capitalize(key)}: ${((achieved / total) * 100).toFixed(2)}%`,
          description: `(${achieved} of ${total})`,
        };
      }),
    });
  }
}
