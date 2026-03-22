import vscode, { MarkdownString } from "vscode";

import { Maybe } from "./type";
import { loadingText, names } from "./const";
import { capitalize, isObject, log, uncapitalize } from "./util";

export type AchieveMap = Map<number, AchieveProvision>;

// region constants

const tsDiagnosticCategories = ["Error", "Suggestion", "Message"] as const;
type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export const achieveKinds = [
  "meta",
  "message",
  "suggestion",
  "syntax",
  "type",
  "tsconfig",
  "strict",
] as const;
export type AchieveKind = (typeof achieveKinds)[number];

// region type TsDiagnostic

export type TsDiagnostic = {
  code: number;
  category: TsDiagnosticCategory;
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

export const classify = (dm: TsDiagnostic): AchieveKind => {
  if (dm.category !== "Error") {
    return uncapitalize(dm.category);
  } else if (dm.code < 2000) {
    return "syntax";
  } else if (dm.code < 5000) {
    return "type";
  } else {
    return "tsconfig";
  }
};

// region type Provision

export type Provision =
  | PathProvision
  | SummaryProvision
  | AchieveProvision
  | ButtonProvision;

export type Refreshable = {
  refresh(): void;
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

type Compute = (achievements: AchieveProvision[]) => LabelComputation;

export class SummaryProvision extends vscode.TreeItem implements Configurable {
  private _compute: Compute;

  constructor(compute: Compute) {
    super(loadingText);
    this._compute = compute;
  }
  compute(achievements: AchieveProvision[]) {
    const { label, description } = this._compute(achievements);
    this.label = label;
    this.description = description;
  }

  refresh() {}

  reconfigure(_config: ExtensionConfig): void {
    this.refresh();
  }
}

// region PathProvision

type KindFilter = (diagnostic: TsDiagnostic) => boolean;

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

type Achievement = TsDiagnostic & {
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

export type ExtensionConfig = {
  revealDescription: boolean;
};

export class AchieveProvision
  extends vscode.TreeItem
  implements Achievement, Configurable, ExtensionConfig
{
  static defaultDescription = "?" as const;

  private _errorMessage: string;

  revealDescription = false;
  isUnlocked = false;
  timestamp: Maybe<Timestamp> = undefined;
  _lifetime = 0;
  code: number;
  category: TsDiagnosticCategory;
  configuration: ExtensionConfig;

  constructor(
    message: string,
    diagnostic: TsDiagnostic,
    configuration: ExtensionConfig,
  ) {
    super(loadingText);

    this.code = diagnostic.code;
    this.category = diagnostic.category;
    this.configuration = configuration;
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
    this.label = this.computeLabel();
    this.description =
      this.isUnlocked || this.revealDescription
        ? this._errorMessage
        : AchieveProvision.defaultDescription;
  }

  computeLabel(): string {
    return this.code.toString();
  }
}

export class ButtonProvision extends vscode.TreeItem {
  constructor(label: string | vscode.TreeItemLabel) {
    super(label);
    this.checkboxState = 1;
  }
}
