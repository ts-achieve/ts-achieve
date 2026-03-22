import vscode, { MarkdownString } from "vscode";

import { Maybe } from "./type";
import {
  loadingText,
  names,
  statistics,
  tsDiagnosticCategories,
} from "./const";
import { capitalize, isObject, log, uncapitalize } from "./util";
import { ExtensionConfig } from "./config";
import { AchieveKind } from "./provider/base";

export type AchieveMap = Map<number, AchieveProvision>;

// region constants

// region type TsDiagnostic

export type StatisticType = (typeof statistics)[number];

export type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export type TsDiagnostic = {
  code: number;
  category: TsDiagnosticCategory;
  reportsUnnecessary?: boolean;
};

export const isTsDiagnostic = (x: unknown): x is TsDiagnostic => {
  return (
    isObject(x) &&
    "category" in x &&
    tsDiagnosticCategories.includes(x.category as any) &&
    "code" in x &&
    typeof x.code === "number"
  );
};

const classify = (diagnostic: TsDiagnostic): AchieveKind => {
  if (diagnostic.category !== "Error") {
    return uncapitalize(diagnostic.category);
  } else if (diagnostic.reportsUnnecessary) {
    return "warning";
  } else if (diagnostic.code < 2000) {
    return "syntax";
  } else if (diagnostic.code < 5000) {
    return "type";
  } else {
    return "tsconfig";
  }
};

// region type Provision

export type Provision = PathProvision | SummaryProvision | AchieveProvision;

export type MaybeProvision = Provision | undefined | null | void;

export type Refreshable = {
  refresh(...args: any[]): void;
};

export type Configurable = Refreshable & {
  reconfigure(config: ExtensionConfig): void;
};

export const isConfigurable = (x: unknown): x is Configurable => {
  return (
    isObject(x) && "reconfigure" in x && typeof x.reconfigure === "function"
  );
};

type LabelComputation = {
  label: string;
  description: string;
};

export type Condition = (achieve: AchieveProvision) => boolean;

export class SummaryProvision extends vscode.TreeItem implements Configurable {
  denominator: Condition;
  title: string;

  constructor(title: string, denominator: Condition = () => true) {
    super(loadingText);
    this.title = title;
    this.denominator = denominator;
  }

  summarize(achieves: AchieveProvision[]): LabelComputation {
    const achieved = achieves.filter((achieve) => achieve.isUnlocked).length;
    const total = achieves.length;
    return {
      label: `${this.title}: ${((achieved / total) * 100).toFixed(2)}%`,
      description: `(${achieved} of ${total})`,
    };
  }

  refresh(achieveMap?: AchieveMap) {
    log("refrest provison");
    if (achieveMap) {
      const { label, description } = this.summarize(
        achieveMap.values().filter(this.denominator).toArray(),
      );
      this.label = label;
      this.description = description;
    }
  }

  reconfigure(_config: ExtensionConfig): void {
    this.refresh();
  }
}

// region PathProvision

type KindFilter = (achieve: Achieve) => boolean;

export class PathProvision extends vscode.TreeItem implements Refreshable {
  kind: AchieveKind;
  filter: KindFilter;
  achievements: AchieveMap;
  cache: AchieveProvision[];

  constructor(kind: AchieveKind, filter: KindFilter, achievements: AchieveMap) {
    super(
      `${capitalize(kind)}${kind === "message" ? "" : kind === "meta" ? " Achievement" : " Error"}s`,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.kind = kind;
    this.filter = filter;
    this.achievements = achievements;
    this.cache = this.refresh();
  }

  refresh(): AchieveProvision[] {
    this.cache = this.achievements.values().filter(this.filter).toArray();
    return this.cache;
  }
}

// region achievement

type Achieve = TsDiagnostic & {
  kind: AchieveKind;
  isUnlocked: boolean;
  timestamp: Maybe<Timestamp>;
  lifetime: number;
};

type Timestamp = {
  time: Date;
  text: string;
  fileName: string;
  message: string;
};

export class AchieveProvision
  extends vscode.TreeItem
  implements Achieve, Configurable, Pick<ExtensionConfig, "revealDescription">
{
  static defaultDescription = "?" as const;

  private _errorMessage: string;

  revealDescription = false;
  isUnlocked = false;
  timestamp: Maybe<Timestamp> = undefined;
  _lifetime = 0;

  code;
  kind;
  category;

  constructor(message: string, diagnostic: TsDiagnostic) {
    super(loadingText);

    this.code = diagnostic.code;
    this.category = diagnostic.category;
    this.kind = classify(diagnostic);

    this._errorMessage = message;
    this.iconPath = new vscode.ThemeIcon(
      "lock",
      new vscode.ThemeColor(names.colors.lockedAchievement),
    );
    this.resourceUri = vscode.Uri.parse("tsAchieve.colors.achievement.locked");
    this.refresh();
  }

  get lifetime(): number {
    return this._lifetime;
  }

  reconfigure(config: ExtensionConfig): void {
    log(this.revealDescription, config.revealDescription);
    this.revealDescription = config.revealDescription;
    this.refresh();
  }

  encounter(
    event: vscode.TextDocumentChangeEvent,
    diagnostic: vscode.Diagnostic,
  ): Timestamp {
    log("encounter", this, event, diagnostic);

    const last = {
      time: new Date(),
      text: event.document.lineAt(diagnostic.range.start.line).text,
      fileName: event.document.fileName,
      message: diagnostic.message,
    };

    const first = this.timestamp ?? last;

    this.tooltip = new MarkdownString(
      `
Unlocked on ${first.time.toLocaleString()} in file "${first.fileName}" with line
\`\`\`ts
${first.text}
\`\`\`
which triggered the message: "${first.message}"

Lifetime encounters: ${++this._lifetime}, most recently on ${last.time.toLocaleString()}
    `.trim(),
    );

    return last;
  }

  unlock(
    event: vscode.TextDocumentChangeEvent,
    diagnostic: vscode.Diagnostic,
  ): void {
    this.isUnlocked = true;
    this.iconPath = new vscode.ThemeIcon(
      "star-full",
      new vscode.ThemeColor(names.colors.unlockedAchievement),
    );
    this.resourceUri = vscode.Uri.parse(
      "tsAchieve.colors.achievement.unlocked",
    );
    this.timestamp = this.encounter(event, diagnostic);

    this.refresh();
  }

  refresh(): void {
    this.label = this.code.toString();
    this.description =
      this.isUnlocked || this.revealDescription
        ? this._errorMessage
        : AchieveProvision.defaultDescription;
  }
}
