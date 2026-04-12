import vscode from "vscode";

import { Starmap } from "../star/star";
import { consoleLog } from "../util/console";
import { readFromUri } from "../util/fs";
import { Maybe, Serializable, biject, slice } from "../util/type";

export type Eventable<T> = T | undefined | null | void;

export abstract class TreeProviderBase<
  T = never,
> implements vscode.TreeDataProvider<T> {
  starmap: Starmap;

  protected _onDidChangeTreeData: vscode.EventEmitter<Eventable<T>> =
    new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<Eventable<T>> =
    this._onDidChangeTreeData.event;

  constructor(...args: any[]) {
    this.starmap = this.loadStarmap(...args);
    this.refresh();
    consoleLog("StarProvider construction");
  }

  abstract getTreeItem(element: T): vscode.TreeItem;

  abstract getChildren(element?: T | undefined): vscode.ProviderResult<T[]>;

  /**
   * how to use the constructor arguments to get a {@linkcode Starmap}
   */
  abstract loadStarmap(..._: any[]): Starmap;

  abstract update(..._: any[]): void;

  /**
   * wrapper for {@linkcode vscode.EventEmitter.fire}
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
    consoleLog("StarProvider refresh");
  }
}

const replaceables = ["nonce", "cssUri", "jsUri", "cspSource"] as const;

type Replaceable = `\${${(typeof replaceables)[number]}}`;

const makeNonce = () => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

type WebviewMessage = {
  type: string;
  value: Serializable;
};

export abstract class WebviewProviderBase
  implements vscode.WebviewViewProvider
{
  protected _extensionUri: vscode.Uri;
  protected _view: Maybe<vscode.WebviewView>;
  name: string;

  constructor(extensionUri: vscode.Uri, name: string) {
    this._extensionUri = extensionUri;
    this.name = name;
  }

  protected abstract _onDidReceiveMessage(data: WebviewMessage): any;
  protected _onDidResolveWebviewView(): void {}

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

    this._view.webview.onDidReceiveMessage((data) =>
      this._onDidReceiveMessage(data),
    );

    this._onDidResolveWebviewView();
  }

  protected _getHtmlForWebview(webview: vscode.Webview) {
    const [htmlUri, cssUri, jsUri] = biject(
      ["html", "css", "js"] as const,
      (ext) =>
        webview.asWebviewUri(
          vscode.Uri.joinPath(
            this._extensionUri,
            "html",
            `${this.name}.${ext}`,
          ),
        ),
    );

    const nonce = makeNonce();

    const htmlData = readFromUri(htmlUri)!.replace(
      /\${(nonce|cssUri|jsUri|cspSource)}/g,
      (substring: string) => {
        const sliced = slice(substring as Replaceable, 2, 1);

        switch (sliced) {
          case "nonce":
            return nonce;
          case "cssUri":
            return cssUri.toString();
          case "jsUri":
            return jsUri.toString();
          case "cspSource":
            return webview.cspSource;
        }

        sliced satisfies never;
      },
    );

    return htmlData;
  }
}
