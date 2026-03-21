import vscode from "vscode";
import { Provider } from "./provider";
import { log } from "./util";

export function activate(context: vscode.ExtensionContext) {
  log("activate");

  const provider = new Provider(context);

  vscode.window.registerTreeDataProvider("achievementsList", provider);

  vscode.workspace.onDidChangeTextDocument((event) => {
    log("document change detection");
    const diagnostics = vscode.languages.getDiagnostics(event.document.uri);
    if (diagnostics.length > 0) {
      for (let i = 0; i < diagnostics.length; i++) {
        const diagnostic = diagnostics[i]!;
        const code = diagnostic.code;
        if (typeof code === "number") {
          if (!provider.achievements.get(code)?.isAchieved) {
            log("achievement");
            vscode.window.showInformationMessage(
              `Achievement unlocked!\n${diagnostic.code}: ${diagnostic.message}`,
            );
            provider.achievements.get(code)!.achieve();
            provider.refresh();
          } else {
            log("repeated achievement");
          }
        } else {
          log("bad error code");
        }
      }
    } else {
      log("no error, quitting");
    }
  });

  vscode.commands.registerCommand("achievements.refresh", () => {
    log("refreshing");
    provider.refresh();
  });
}

export function deactivate() {}
