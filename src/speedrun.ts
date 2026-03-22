// import vscode from "vscode";

import { Maybe } from "./type";
import { ProviderBase } from "./provider/base";
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

  constructor(config: ExtensionConfig) {
    super(config);
    this.history = [];
  }
}
