import vscode from "vscode";
import { capitalize, isObject, log } from "./util";
import { loadingText } from "./const";

// region constants

const tsDiagnosticCategories = ["Error", "Message"] as const;
type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export const achievementKinds = [
  "message",
  "syntax",
  "type",
  "tsconfig",
  "strict",
] as const;
export type AchievementKind = (typeof achievementKinds)[number];

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

// region type Achievement

type Achievement = TsDiagnostic & {
  isAchieved: boolean;
};

export const classify = (dm: TsDiagnostic): AchievementKind => {
  log(dm);
  if (dm.category === "Message") {
    return "message";
  } else if (dm.code < 2000) {
    return "syntax";
  } else if (dm.code < 5000) {
    return "type";
  } else {
    return "tsconfig";
  }
};

// region type Node

export type Node = KindNode | StatisticNode | AchievementNode;

type LabelComputation = {
  label: string;
  description: string;
};

type Compute = (achievements: AchievementNode[]) => LabelComputation;

export class StatisticNode extends vscode.TreeItem {
  private _compute: Compute;

  constructor(compute: Compute) {
    super(loadingText);
    this._compute = compute;
  }

  compute(achievements: AchievementNode[]) {
    const { label, description } = this._compute(achievements);
    this.label = label;
    this.description = description;
  }
}

export class KindNode extends vscode.TreeItem {
  kind: AchievementKind;

  constructor(kind: AchievementKind) {
    super(
      `${capitalize(kind)}${kind === "message" ? "" : " Error"}s`,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.kind = kind;
  }
}

export class AchievementNode extends vscode.TreeItem implements Achievement {
  static defaultDescription = "?" as const;

  isAchieved: boolean;
  code: number;
  category: TsDiagnosticCategory;
  private _errorMessage: string;

  constructor(message: string, diagnostic: TsDiagnostic) {
    super("");
    this.isAchieved = false;
    this.code = diagnostic.code;
    this.category = diagnostic.category;
    this._errorMessage = message;
    this.refresh();
  }

  achieve(): void {
    this.isAchieved = true;
    this.refresh();
  }

  refresh(): void {
    this.label = this.computeLabel();
    this.description = this.currentDescription;
  }

  computeLabel(): string {
    return `${this.prefix} ${this.code.toString()}`;
  }

  get prefix(): string {
    return this.isAchieved ? "✓" : "✗";
  }

  get currentDescription(): string {
    return this.isAchieved
      ? this._errorMessage
      : AchievementNode.defaultDescription;
  }
}
