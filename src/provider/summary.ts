import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { ProviderBase } from "./base";
import { AchieveMap, AchieveProvision, Configurable } from "../provision";
import { loadingText } from "../const";

export type SummaryRecord = Record<string, Summary>;

export class SummaryProvider extends ProviderBase {
  summary: SummaryRecord;

  constructor(configuration: ExtensionConfig, achieveMap: AchieveMap) {
    super(configuration, achieveMap);

    this.summary = {
      overall: new UnlockedSummary("Overall"),
      messages: new UnlockedSummary(
        "Messages",
        (achieve) => achieve.diagnostic.category === "Message",
      ),
      suggestions: new UnlockedSummary(
        "Suggestions",
        (achieve) => achieve.diagnostic.category === "Suggestion",
      ),
      errors: new UnlockedSummary(
        "Errors",
        (achieve) => achieve.diagnostic.category === "Error",
      ),
      lifetime: new TallySummary("Lifetime errors", () => {
        return achieveMap
          .values()
          .map((achieve) => achieve.lifetime)
          .reduce((xs, x) => xs + x, 0);
      }),
    };
  }

  loadAchieves(achieveMap: AchieveMap): AchieveMap {
    return achieveMap;
  }

  get allProvisions() {
    return this.topProvisions;
  }

  get topProvisions() {
    return Object.values(this.summary);
  }

  refresh(achieveMap: AchieveMap): void {
    Object.values(this.summary).forEach((provision) => {
      provision.refresh(achieveMap.values().toArray());
    });
    this._emitter.fire();
  }
}

type ComputedLabel = {
  label: string;
  description?: string;
};

export abstract class Summary extends vscode.TreeItem implements Configurable {
  title: string;

  constructor(label: string | vscode.TreeItemLabel, title: string) {
    super(label);
    this.title = title;
  }

  abstract summarize(achieves?: AchieveProvision[]): ComputedLabel;

  refresh(achieves?: AchieveProvision[]) {
    if (achieves) {
      const { label, description } = this.summarize(achieves);

      this.label = label;
      if (description) {
        this.description = description;
      }
    }
  }

  reconfigure(_config: ExtensionConfig): void {
    this.refresh();
  }
}

type Tally = () => number;

export class TallySummary extends Summary {
  tally: Tally;

  constructor(title: string, tally: Tally) {
    super(loadingText, title);
    this.tally = tally;
  }

  summarize(): ComputedLabel {
    return {
      label: `${this.title}: ${this.tally()}`,
    };
  }
}

type Condition = (achieve: AchieveProvision) => boolean;

export class UnlockedSummary extends Summary {
  denominator: Condition;

  constructor(title: string, denominator: Condition = () => true) {
    super(loadingText, title);
    this.denominator = denominator;
  }

  summarize(achieves: AchieveProvision[]): ComputedLabel {
    const denominated = achieves.filter(this.denominator);

    const achieved = denominated.filter((achieve) => achieve.isUnlocked).length;
    const total = denominated.length;
    return {
      label: `${this.title}: ${((achieved / total) * 100).toFixed(2)}%`,
      description: `(${achieved} of ${total})`,
    };
  }
}
