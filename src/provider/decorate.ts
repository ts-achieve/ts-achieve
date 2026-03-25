import vscode from "vscode";

import { names } from "../util/const";
import { logger } from "../util/logger";
import { ExtensionConfig } from "../config";

export class Decorator implements vscode.FileDecorationProvider {
  config: ExtensionConfig;

  constructor(config: ExtensionConfig) {
    this.config = config;
  }

  provideFileDecoration(
    uri: vscode.Uri,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.FileDecoration> {
    switch (uri.path.slice(1)) {
      case names.colors.locked:
        return {
          propagate: false,
          color: new vscode.ThemeColor(names.colors.locked),
        };
      case names.colors.unlocked:
        return {
          propagate: false,
          color: new vscode.ThemeColor(names.colors.unlocked),
        };
      default:
        logger(`bad path: ${uri.path}`);
        return undefined;
    }
  }
}
