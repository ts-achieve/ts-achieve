import vscode from "vscode";

import { names } from "../util/const";

export class Decorator implements vscode.FileDecorationProvider {
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
        return undefined;
    }
  }
}
