import vscode from "vscode";

import { makeStarmap, Starmap } from "../star/star";
import { names } from "../util/const";
import { consoleErr, consoleLog } from "../util/console";
import { WebviewProviderBase } from "./provider";

export type SpeedrunnerMessage =
  | { type: "running"; value: boolean }
  | { type: "request"; value: "map" }
  | { type: "star"; value: number }
  | {
      type: "emptymap";
      value: ReturnType<ReturnType<Starmap["entries"]>["toArray"]>;
    };

export class Speedrunner extends WebviewProviderBase {
  static readonly viewType = names.views.speedrun;

  isRunning: boolean;

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, "speedrunner");
    this.isRunning = false;
  }

  update(code: number) {
    if (this.isRunning) {
      if (this._view) {
        this._view.webview.postMessage({
          type: "star",
          value: code,
        } satisfies SpeedrunnerMessage);
      }
    }
  }

  _onDidReceiveMessage(data: SpeedrunnerMessage) {
    switch (data.type) {
      case "running":
        this.isRunning = data.value;
        consoleLog("isRunning:", this.isRunning);
        break;
      case "request":
        switch (data.value) {
          case "map":
            this._deliverMap();
            break;
        }
        break;
      default:
        consoleErr("unhandled message:", data);
    }
  }

  override _onDidResolveWebviewView() {
    this._deliverMap();
  }

  private _deliverMap = () => {
    if (this._view) {
      this._view.webview.postMessage({
        type: "emptymap",
        value: makeStarmap().entries().toArray(),
      } satisfies SpeedrunnerMessage);
    }
  };
}
