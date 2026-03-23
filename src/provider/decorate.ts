import vscode from "vscode";

import { Configurable } from "./provision";
import { names } from "../util/const";
import { ExtensionConfig } from "../config";
import { Tracer, Tracing } from "../util/tracer";

export class DecorationProvider
  implements vscode.FileDecorationProvider, Tracing, Configurable
{
  tracer: Tracer;

  constructor(tracer: Tracer) {
    this.tracer = tracer;
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
        this.tracer.log(`bad path: ${uri.path}`);
        return undefined;
    }
  }

  reconfigure(_config: ExtensionConfig): void {
    this.refresh();
  }

  refresh(): void {}
}
