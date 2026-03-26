import vscode from "vscode";
import { Maybe } from "../util/type";
import { ExtensionConfig } from "../config";
import { Starlister } from "./starlister";
import { Starmap } from "./star";

export class Speedrunner extends Starlister {
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
