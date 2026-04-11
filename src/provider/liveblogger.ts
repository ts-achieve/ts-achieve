import vscode from "vscode";

import { names } from "../util/const";
import { consoleErr } from "../util/console";
import { UnlockedStar } from "../star/star";
import { WebviewProviderBase } from "./provider";

type LivebloggerMessage = {
  type: "";
  value: "";
};

export class Liveblogger extends WebviewProviderBase {
  static readonly viewType = names.views.liveblog;

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, "liveblogger");
  }

  update(_star: UnlockedStar) {
    throw new Error("implement me");
  }

  _onDidReceiveMessage(data: LivebloggerMessage) {
    switch (data.type) {
      default:
        consoleErr("unhandled message:", data);
    }
  }
}
