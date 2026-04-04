import vscode from "vscode";

import { Maybe } from "../util/type";
import { Starlister } from "./starlister";
import { makeStarmap, Starmap } from "../star/star";
import { ExtensionConfig } from "../config";

export class Speedrunner extends Starlister<Speedrun> {
  history: Speedrun[];
  current: Maybe<Speedrun>;

  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
    this.history = [];
  }

  override loadStarmap(): Starmap {
    return makeStarmap();
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
