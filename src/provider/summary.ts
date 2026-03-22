import vscode from "vscode";

import { ExtensionConfig } from "../config";
import { ProviderBase } from "./base";
import { AchieveMap, AchieveProvision, Configurable } from "../provision";
import { errorKinds, loadingText } from "../const";

export type SummaryRecord = Record<string, Summary>;

export class SummaryProvider extends ProviderBase {
  summary: SummaryRecord;

  constructor(configuration: ExtensionConfig, achieveMap: AchieveMap) {
    super(configuration, achieveMap);

    this.summary = {
      overall: new UnlockedSummary("Overall"),
      lifetimeMessages: new TallySummary("Lifetime messages", () => {
        return achieveMap
          .values()
          .filter((achieve) => achieve.kind === "message")
          .map((achieve) => achieve.lifetime)
          .reduce((xs, x) => xs + x, 0);
      }),
      lifetimeSuggestions: new TallySummary("Lifetime suggestions", () => {
        return achieveMap
          .values()
          .filter((achieve) => achieve.kind === "suggestion")
          .map((achieve) => achieve.lifetime)
          .reduce((xs, x) => xs + x, 0);
      }),
      lifetimeWarnings: new TallySummary("Lifetime warnings", () => {
        return achieveMap
          .values()
          .filter((achieve) => achieve.kind === "warning")
          .map((achieve) => achieve.lifetime)
          .reduce((xs, x) => xs + x, 0);
      }),
      lifetimeErrors: new TallySummary("Lifetime errors", () => {
        return achieveMap
          .values()
          .filter((achieve) => errorKinds.includes(achieve.kind as any))
          .map((achieve) => achieve.lifetime)
          .reduce((xs, x) => xs + x, 0);
      }),
    };
  }

  override loadAchieves(achieveMap: AchieveMap): AchieveMap {
    return achieveMap;
  }

  override get allProvisions() {
    return this.topProvisions;
  }

  override get topProvisions() {
    return Object.values(this.summary);
  }

  override refresh(achieveMap: AchieveMap): void {
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
