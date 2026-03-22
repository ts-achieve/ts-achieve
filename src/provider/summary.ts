import { log } from "console";
import { ExtensionConfig } from "../config";
import { ProviderBase } from "./base";
import { SummaryProvision, Provision, AchieveMap } from "../provision";

export type SummaryRecord = Record<string, SummaryProvision>;

export class SummaryProvider extends ProviderBase {
  summary: SummaryRecord;

  constructor(configuration: ExtensionConfig, achieveMap: AchieveMap) {
    super(configuration, achieveMap);

    this.summary = {
      overall: new SummaryProvision("Overall"),
      messages: new SummaryProvision(
        "Messages",
        (achieve) => achieve.category === "Message",
      ),
      suggestions: new SummaryProvision(
        "Suggestions",
        (achieve) => achieve.category === "Suggestion",
      ),
      errors: new SummaryProvision(
        "Errors",
        (achieve) => achieve.category === "Error",
      ),
    };
  }

  loadAchieves(achieveMap: AchieveMap): AchieveMap {
    return achieveMap;
  }

  get allProvisions(): Provision[] {
    return this.topProvisions;
  }

  get topProvisions(): Provision[] {
    return Object.values(this.summary);
  }

  refresh(achieveMap: AchieveMap): void {
    log("refresh summzzzzzary", this.summary, "wah");
    Object.values(this.summary).forEach((provision) => {
      provision.refresh(achieveMap);
    });
    this._emitter.fire();
  }
}
