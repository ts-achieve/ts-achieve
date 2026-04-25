import vscode from "vscode";

import { names } from "../util/const";
import { consoleErr } from "../util/console";
import { UnlockedStar } from "../star/star";
import { WebviewProviderBase } from "./provider";
import { StarKind } from "../star/taxonomy";

interface LivebloggerMessage {
  type: "star";
  value: [number, StarKind];
}

export class Liveblogger extends WebviewProviderBase {
  static readonly viewType = names.views.liveblog;

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, "liveblogger");
  }

  update(star: UnlockedStar) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "star",
        value: [star.code, star.kind],
      } satisfies LivebloggerMessage);
    }
  }

  _onDidReceiveMessage(data: LivebloggerMessage) {
    switch (data.type) {
      default:
        consoleErr("unhandled message:", data);
    }
  }
}
