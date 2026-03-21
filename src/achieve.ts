import vscode from "vscode";

export const categories = ["Error", "Message"] as const;
export type Category = (typeof categories)[number];

const statistics = ["overall"] as const;
type StatisticType = (typeof statistics)[number];

export type DiagnosticMessage = {
  code: number;
  category: Category;
};

type Provision = Statistic | Achievement;

export class Provider implements vscode.TreeDataProvider<Provision> {
  summary: Map<string, Statistic>;
  achievements: Map<number, Achievement>;

  private _emitter: vscode.EventEmitter<Achievement | undefined | null | void>;

  readonly onDidChangeTreeData: vscode.Event<
    Achievement | undefined | null | void
  >;

  constructor(achievements: Map<number, Achievement>) {
    this.summary = new Map<string, Statistic>();
    this.achievements = achievements;
    this._emitter = new vscode.EventEmitter<
      Achievement | undefined | null | void
    >();
    this.onDidChangeTreeData = this._emitter.event;
  }

  get provisions(): Provision[] {
    return (this.summary as Map<string, Provision>)
      .values()
      .toArray()
      .concat(this.achievements.values().toArray());
  }

  refresh(): void {
    console.log("fire!");
    this._emitter.fire();
  }

  getChildren(
    element?: Achievement | undefined,
  ): vscode.ProviderResult<Achievement[]> {
    if (element) {
      return [];
    } else {
      console.log(this.achievements);
      return this.achievements.values().toArray();
    }
  }

  getTreeItem(element: Achievement): Achievement | Thenable<Achievement> {
    return element;
  }
}

export class Statistic<T = number> extends vscode.TreeItem {
  type: StatisticType;
  private _compute: (achievements: Achievement[]) => T;

  constructor(
    type: StatisticType,
    compute: (achievements: Achievement[]) => T,
  ) {
    super("");
    this.type = type;
    this._compute = compute;
  }

  compute(achievements: Achievement[]) {
    this.label = `${this.type}: ${this._compute(achievements)}`;
  }
}

export class Achievement extends vscode.TreeItem implements DiagnosticMessage {
  isAchieved: boolean;
  code: number;
  category: Category;
  private _message: string;

  constructor(message: string, diagnostic: DiagnosticMessage) {
    super(`${diagnostic.code}: ?`);
    this.isAchieved = false;
    this.code = diagnostic.code;
    this.category = diagnostic.category;
    this._message = message;
  }

  achieve(): void {
    this.isAchieved = true;
    this.label = `${this.code}: ${this._message}`;
  }

  get message(): string {
    return this.isAchieved ? this._message : "?";
  }
}
