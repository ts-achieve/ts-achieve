import { log } from "console";
import { ExtensionConfig } from "../config";
import { ProviderBase } from "./base";
import {
  SummaryProvision,
  Provision,
  StatisticType,
  AchieveProvision,
} from "../provision";
import { capitalize } from "../util";

export type SummaryRecord = Record<string, SummaryProvision>;

export class SummaryProvider extends ProviderBase {
  summary: SummaryRecord;

  constructor(configuration: ExtensionConfig) {
    super(configuration);

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
