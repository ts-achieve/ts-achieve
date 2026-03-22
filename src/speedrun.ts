import vscode from "vscode";

import { Maybe } from "./type";
import { ProviderBase } from "./provide";
import { ExtensionConfig } from "./config";

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

  constructor(context: vscode.ExtensionContext, config: ExtensionConfig) {
    super(context, config);
    this.history = [];
  }
}
