import vscode from "vscode";

import { Starmap } from "../star/star";
import { names } from "../util/const";
import { biject, Maybe, slice } from "../util/type";
import { readHtml } from "./fs";

type Speedrun = {
  start: Date;
  end: Maybe<Date>;
  starmap: Starmap;
  keystrokes: number;
  splits?: any;
  ruleset?: any;
};

export class Speedrunner implements vscode.WebviewViewProvider {
  static readonly viewType = names.views.speedrun;

  starmap: Starmap;

  private _extensionUri: vscode.Uri;
  private _view?: vscode.WebviewView;

  constructor(_extensionUri: vscode.Uri, starmap: Starmap) {
    this._extensionUri = _extensionUri;
    this.starmap = starmap;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "colorSelected": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`#${data.value}`),
          );
          break;
        }
      }
    });
  }

  public addColor() {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: "addColor" });
    }
  }

  public clearColors() {
    if (this._view) {
      this._view.webview.postMessage({ type: "clearColors" });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const [htmlUri, cssUri, jsUri] = biject(
      ["html", "css", "js"] as const,
      (ext) =>
        webview.asWebviewUri(
          vscode.Uri.joinPath(this._extensionUri, ext, `speedrunner.${ext}`),
        ),
    );

    const nonce = getNonce();

    return readHtml(htmlUri)!.replace(
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
