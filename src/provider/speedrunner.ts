import vscode from "vscode";

import { makeStarmap } from "../star/star";
import { names } from "../util/const";
import { biject, slice } from "../util/type";
import { readHtml } from "./fs";
import { consoleErr, consoleLog } from "../util/console";

export class Speedrunner implements vscode.WebviewViewProvider {
  static readonly viewType = names.views.speedrun;

  private _extensionUri: vscode.Uri;
  private _view?: vscode.WebviewView;
  isRunning: boolean;

  constructor(_extensionUri: vscode.Uri) {
    this._extensionUri = _extensionUri;
    this.isRunning = false;
  }

  update(code: number) {
    if (this.isRunning) {
      if (this._view) {
        this._view.webview.postMessage({ type: "star", value: code });
      }
    }
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    this._view.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._view.webview.html = this._getHtmlForWebview(webviewView.webview);

    this._view.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "isRunning":
          this.isRunning = data.value;
          consoleLog("isRunning:", this.isRunning);
          break;
        case "request":
          switch (data.value) {
            case "map":
              this.deliverMap();
              break;
          }
          break;
        default:
          consoleErr("unhandled message:", data);
      }
    });
    this.deliverMap();
  }

  private deliverMap = () => {
    if (this._view) {
      this._view.webview.postMessage({
        type: "emptymap",
        value: makeStarmap().entries().toArray(),
      });
    }
  };

  private _getHtmlForWebview(webview: vscode.Webview) {
    const [htmlUri, cssUri, jsUri] = biject(
      ["html", "css", "js"] as const,
      (ext) =>
        webview.asWebviewUri(
          vscode.Uri.joinPath(this._extensionUri, "html", `speedrunner.${ext}`),
        ),
    );

    const nonce = getNonce();

    const htmlData = readHtml(htmlUri)!.replace(
      /\${(nonce|cssUri|jsUri|cspSource|currentTime|startTime)}/g,
      (substring: string) => {
        const chop = slice(substring as Replaceable, 2, 1);

        switch (chop) {
          case "nonce":
            return nonce;
          case "cssUri":
            return cssUri.toString();
          case "jsUri":
            return jsUri.toString();
          case "cspSource":
            return webview.cspSource;
          case "currentTime":
            return Date.now().toString();
          case "startTime":
            return Date.now().toString();
        }

        chop satisfies never;
      },
    );

    return htmlData;
  }
}

const rawReplaceables = [
  "nonce",
  "cssUri",
  "jsUri",
  "cspSource",
  "startTime",
  "currentTime",
] as const;

type Replaceable = `\${${(typeof rawReplaceables)[number]}}`;

const getNonce = () => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
