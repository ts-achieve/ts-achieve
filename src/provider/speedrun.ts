import { Maybe } from "../util/type";
import { ExtensionConfig } from "../config";
import { Tracer } from "../util/tracer";
import { ProviderBase } from "./base";
import { AchieveMap, ProvisionBase } from "./provision";
import { loadingText } from "../util/const";

export class SpeedrunProvider extends ProviderBase {
  history: Speedrun[];
  current: Maybe<Speedrun>;

  constructor(config: ExtensionConfig, tracer: Tracer) {
    super(config, tracer);
    this.history = [];
  }

  get isRunning(): boolean {
    return !!this.current;
  }

  startRun() {
    if (this.isRunning) {
      this.tracer.error("started run already exists");
      return;
    }

    const run = {
      start: new Date(),
      end: undefined,
      achieves: this.loadAchieves(),
      keystrokes: 0,
    };

    this.current = run;

    return run;
  }
}

type Speedrun = {
  start: Date;
  end: Maybe<Date>;
  achieves: AchieveMap;
  keystrokes: number;
  splits?: any;
  ruleset?: any;
};

export class Runner extends ProvisionBase {
  t: Maybe<number> = undefined;
  isRunning: boolean = false;

  constructor(tracer: Tracer) {
    super(tracer, loadingText);
  }

  override refresh(..._: any[]): void {}
}
