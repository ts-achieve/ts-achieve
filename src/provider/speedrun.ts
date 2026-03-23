import vscode from "vscode";
import { Maybe } from "../util/type";
import { ExtensionConfig } from "../config";
import { StarlistProvider } from "./provider";
import { Starmap } from "./star";

export class SpeedrunProvider extends StarlistProvider {
  history: Speedrun[];
  current: Maybe<Speedrun>;

  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
    this.history = [];
  }

  get isRunning(): boolean {
    return !!this.current;
  }
}

type Speedrun = {
  start: Date;
  end: Maybe<Date>;
  starmap: Starmap;
  keystrokes: number;
  splits?: any;
  ruleset?: any;
};
