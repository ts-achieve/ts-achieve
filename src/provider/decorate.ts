import vscode from "vscode";

import { names } from "../util/const";
import { logger } from "../util/logger";
import { Configurable } from "./provider";
import { ExtensionConfig } from "../config";

export class DecorationProvider
  implements vscode.FileDecorationProvider, Configurable
{
  config: ExtensionConfig;

  constructor(config: ExtensionConfig) {
    this.config = config;
  }

  provideFileDecoration(
    uri: vscode.Uri,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.FileDecoration> {
    switch (uri.path) {
      case "/tsAchieve.colors.achievement.locked":
        return {
          propagate: false,
          color: new vscode.ThemeColor(names.colors.lockedAchievement),
        };
      case "/tsAchieve.colors.achievement.unlocked":
        return {
          propagate: false,
          color: new vscode.ThemeColor(names.colors.unlockedAchievement),
        };
      default:
        logger(`bad path: ${uri.path}`);
        return undefined;
    }
  }

  reconfigure(): void {}
  refresh(): void {}
}
