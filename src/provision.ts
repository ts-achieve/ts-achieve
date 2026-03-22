import vscode, { MarkdownString } from "vscode";

import { Maybe } from "./type";
import {
  nonErrorKinds,
  errorKinds,
  loadingText,
  names,
  statistics,
  tsDiagnosticCategories,
  pathKinds,
} from "./const";
import { capitalize, isObject, trace, uncapitalize } from "./util";
import { ExtensionConfig } from "./config";

export type NonErrorKind = (typeof nonErrorKinds)[number];

export type ErrorKind = (typeof errorKinds)[number];

export type AchieveKind = NonErrorKind | ErrorKind;

export type AchieveMap = Map<number, AchieveProvision>;

// region constants

// region type TsDiagnostic

export type StatisticType = (typeof statistics)[number];

export type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export type TsDiagnostic<
  C extends TsDiagnosticCategory = TsDiagnosticCategory,
> = C extends any
  ? {
      code: number;
      category: C;
      reportsUnnecessary?: boolean;
    }
  : never;

export const isTsDiagnostic = (x: unknown): x is TsDiagnostic => {
  return (
    isObject(x) &&
    "category" in x &&
    tsDiagnosticCategories.includes(x.category as any) &&
    "code" in x &&
    typeof x.code === "number"
  );
};

export const classify = (diagnostic: TsDiagnostic): AchieveKind => {
  if (diagnostic.category === "Error") {
    if ("reportsUnnecessary" in diagnostic) {
      return "warning";
    } else {
      return classifyError(diagnostic);
    }
  } else {
    return uncapitalize(diagnostic.category);
  }
};

const classifyError = (
  diagnostic: Omit<TsDiagnostic<"Error">, "reportsUnnecessary">,
): ErrorKind => {
  if (diagnostic.code < 2000) {
    return "syntax";
  } else if (diagnostic.code < 5000) {
    return "type";
  } else {
    return "tsconfig";
  }
};

// region type Provision

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

// region PathProvision

export type PathKind = (typeof pathKinds)[number];
type PathFilter = (achieve: Achieve) => boolean;
type PathTitle =
  | `${Capitalize<Extract<PathKind, "special">>} achievements`
  | `${Capitalize<Extract<PathKind, "message" | "suggestion" | "warning" | "error">>}s`
  | `${Capitalize<Extract<PathKind, "strict" | "syntax" | "tsconfig" | "type">>} errors`;

export class PathProvision extends vscode.TreeItem implements Refreshable {
  kind: PathKind;
  filter: PathFilter;
  achieveMap: AchieveMap;
  cache: AchieveProvision[];

  static toPathTitle(kind: PathKind): PathTitle {
    switch (kind) {
      case "special":
        return "Special achievements";
      case "message":
      case "suggestion":
      case "warning":
      case "error":
        return `${capitalize(kind)}s`;
      case "strict":
      case "syntax":
      case "tsconfig":
      case "type":
        return `${capitalize(kind)} errors`;
    }
    kind satisfies never;
  }

  constructor(kind: PathKind, filter: PathFilter, achieveMap: AchieveMap) {
    super(loadingText, vscode.TreeItemCollapsibleState.Collapsed);
    this.kind = kind;
    this.filter = filter;
    this.achieveMap = achieveMap;
    this.cache = this.refresh();
  }

  refresh(): AchieveProvision[] {
    this.cache = this.achieveMap.values().filter(this.filter).toArray();

    const achieved = this.cache.filter((achieve) => achieve.isUnlocked).length;
    const total = this.cache.length;
    this.label = `${capitalize(
      PathProvision.toPathTitle(this.kind),
    )}: ${((achieved / total) * 100).toFixed(2)}%`;
    this.description = `(${achieved} of ${total})`;

    return this.cache;
  }
}

// region achievement

type Achieve = {
  diagnostic: TsDiagnostic;
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
  lifetime = 0;

  kind;
  diagnostic;

  constructor(message: string, diagnostic: TsDiagnostic) {
    super(loadingText);

    this.diagnostic = diagnostic;
    this.kind = classify(diagnostic);

    this._errorMessage = message;
    this.iconPath = new vscode.ThemeIcon(
      "lock",
      new vscode.ThemeColor(names.colors.lockedAchievement),
    );
    this.resourceUri = vscode.Uri.parse(names.colors.lockedAchievement);
    this.refresh();
  }

  reconfigure(config: ExtensionConfig): void {
    trace(this.revealDescription, config.revealDescription);
    this.revealDescription = config.revealDescription;
    this.refresh();
  }

  encounter(
    event: vscode.TextDocumentChangeEvent,
    diagnostic: vscode.Diagnostic,
  ): Timestamp {
    trace("encounter", this, event, diagnostic);

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

Lifetime encounters: ${++this.lifetime}, most recently on ${last.time.toLocaleString()}
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
    this.resourceUri = vscode.Uri.parse(names.colors.unlockedAchievement);
    this.timestamp = this.encounter(event, diagnostic);

    this.refresh();
  }

  refresh(): void {
    this.label = this.diagnostic.code.toString();
    this.description =
      this.isUnlocked || this.revealDescription
        ? this._errorMessage
        : AchieveProvision.defaultDescription;
  }
}
