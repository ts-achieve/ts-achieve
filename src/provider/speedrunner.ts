import vscode from "vscode";

import { Maybe } from "../util/type";
import { Starlister } from "./starlister";
import { makeStarmap, Starmap } from "../star/star";
import { ExtensionConfig } from "../config";

type Speedrun = {
  start: Date;
  end: Maybe<Date>;
  starmap: Starmap;
  keystrokes: number;
  splits?: any;
  ruleset?: any;
};

export class Speedrunner extends Starlister<Speedrun> {
  history: Speedrun[];
  current: Maybe<Speedrun>;

  constructor(config: ExtensionConfig, context: vscode.ExtensionContext) {
    super(config, context);
    this.history = [];
    this.current = {
      start: new Date(),
      end: undefined,
      starmap: this.starmap,
      keystrokes: 0,
    };
  }

  override loadStarmap(): Starmap {
    return makeStarmap();
  }

  get isRunning(): boolean {
    return !!this.current;
  }

  override getTreeItem(): vscode.TreeItem {
    return {
      label: (Date.now() - (this.current?.start.valueOf() ?? 0)).toString(),
      description: "nyeh",
    };
  }
}
