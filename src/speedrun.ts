import vscode from "vscode";

import { Maybe } from "./util/type";
import { ExtensionConfig } from "./config";
import { Tracer } from "./util/tracer";
import { ProviderBase } from "./provider/base";
import { Refreshable } from "./provider/provision";

type Speedrun = {
  start: Date;
  end: Date;
  achieves: number;
  keystrokes: number;
  splits?: any;
  rules?: any;
};

export class SpeedrunProvider extends ProviderBase {
  history: Speedrun[];
  current: Maybe<Speedrun>;

  constructor(config: ExtensionConfig, tracer: Tracer) {
    super(config, tracer);
    this.history = [];
  }
}

export class StartDiv extends vscode.TreeItem implements Refreshable {
  refresh(..._: any[]): void {}
}
