import child from "child_process";
import vscode from "vscode";

import { capitalize, log } from "./util";
import { diagnosticMessagesUrl, StatisticType } from "./const";
import {
  StatisticNode,
  AchievementNode,
  Node,
  TsDiagnostic,
  isTsDiagnostic,
  KindNode,
  AchievementKind,
  classify,
  achievementKinds,
} from "./node";
import { Maybe } from "./type";

type MaybeNode = Node | undefined | null | void;

type KindRecord = Record<AchievementKind, KindNode>;
type SummaryRecord = Record<string, StatisticNode>;

export class Provider implements vscode.TreeDataProvider<Node> {
  kinds: KindRecord;
  summary: SummaryRecord;
  achievements: Map<number, AchievementNode>;

  private _emitter: vscode.EventEmitter<MaybeNode>;

  readonly onDidChangeTreeData: vscode.Event<MaybeNode>;

  constructor(context: vscode.ExtensionContext) {
    this.kinds = Object.fromEntries(
      achievementKinds.map((kind) => [kind, new KindNode(kind)]),
    ) as KindRecord;

    this.achievements = getAchievements(context);

    this.summary = {};
    this.setAchievementProportionSummary("overall", () =>
      this.achievements.values().toArray(),
    );
    this.setAchievementProportionSummary("errors", () =>
      this.achievements
        .values()
        .filter((achievement) => achievement.category === "Error")
        .toArray(),
    );
    this.setAchievementProportionSummary("messages", () =>
      this.achievements
        .values()
        .filter((achievement) => achievement.category === "Message")
        .toArray(),
    );

    this._emitter = new vscode.EventEmitter<MaybeNode>();
    this.onDidChangeTreeData = this._emitter.event;
  }

  get provisions(): Node[] {
    return ([] as Node[]).concat(
      Object.values(this.summary),
      Object.values(this.kinds),
    );
  }

  refresh(): void {
    log("fire");
    Object.values(this.summary).forEach((statistic) =>
      statistic.compute(this.achievements.values().toArray()),
    );
    this._emitter.fire();
  }

  getChildren(element?: Node): vscode.ProviderResult<Node[]> {
    if (element) {
      if (element instanceof KindNode) {
        return this.achievements
          .values()
          .filter((achievement) => classify(achievement) === element.kind)
          .toArray();
      } else {
        return [];
      }
    } else {
      return this.provisions;
    }
  }

  getTreeItem(element: Node): Node | Thenable<Node> {
    return element;
  }

  setAchievementProportionSummary(
    key: StatisticType,
    collection: () => AchievementNode[],
    label?: string,
  ) {
    Object.assign(this.summary, {
      [key]: new StatisticNode(() => {
        const achieved = collection().filter(
          (achievement) => achievement.isAchieved,
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

const getAchievements = (
  context: vscode.ExtensionContext,
): Map<number, AchievementNode> => {
  const maybeMap: Maybe<Map<number, AchievementNode>> =
    context.globalState.get("achievements");

  if (maybeMap && Object.keys(maybeMap).length) {
    return maybeMap;
  } else {
    return curl(context);
  }
};

export const curl = (
  context: vscode.ExtensionContext,
): Map<number, AchievementNode> => {
  const parse: Record<string, TsDiagnostic> = JSON.parse(
    child.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }),
  );

  const map = new Map<number, AchievementNode>();
  for (const [key, value] of Object.entries(parse)) {
    if (isTsDiagnostic(value)) {
      map.set(value.code, new AchievementNode(key, value));
    }
  }

  context.globalState.update("achievements", map);

  return map;
};
