import vscode from "vscode";

import { log } from "./util";
import { Configurable } from "./provision";
import { names } from "./const";
import { ExtensionConfig } from "./config";

export class DecorationProvider
  implements vscode.FileDecorationProvider, Configurable
{
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
        log(`bad path: ${uri.path}`);
        return undefined;
    }
  }

  reconfigure(_config: ExtensionConfig): void {
    this.refresh();
  }

  refresh(): void {}
}
