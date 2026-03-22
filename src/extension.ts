import vscode from "vscode";

import { log } from "./util";
import { withConfig } from "./config";
import { AchieveProvider } from "./achieve";
import { DecorationProvider } from "./decorate";
import { names } from "./const";

export function activate(context: vscode.ExtensionContext) {
  log("activate");

  withConfig((config) => {
    const achievesProvider = new AchieveProvider(context, config);

    vscode.window.registerTreeDataProvider(names.views.list, achievesProvider);

    // const speedrunProvider = new SpeedrunProvider(context, config);
    // vscode.window.registerTreeDataProvider(
    //   names.views.speedrun,
    //   speedrunProvider,
    // );

    const decorationProvider = new DecorationProvider();
    vscode.window.registerFileDecorationProvider(decorationProvider);

    vscode.workspace.onDidChangeTextDocument((event) => {
      const diagnostics = vscode.languages.getDiagnostics(event.document.uri);
      if (diagnostics.length > 0) {
        for (let i = 0; i < diagnostics.length; i++) {
          const diagnostic = diagnostics[i]!;

          if (typeof diagnostic.code === "number") {
            const achieve = achievesProvider.achieves.get(diagnostic.code);

            if (achieve) {
              if (achieve.isUnlocked) {
                achieve.encounter(event, diagnostic);
                if (achievesProvider.config.notifyRepeatedAchievements) {
                vscode.window.showInformationMessage(
                  `Achievement found again!\n${diagnostic.code}: ${diagnostic.message}`,
                );
                }
              } else {
                achieve.unlock(event, diagnostic);
                vscode.window.showInformationMessage(
                  `Achievement unlocked!\n${diagnostic.code}: ${diagnostic.message}`,
                );
                achievesProvider.refresh();
              }
            }
          }
        }

        context.globalState.update("achieves", achievesProvider.achieves);
      }
    });

    vscode.commands.registerCommand(names.commands.refresh, () => {
      log("refresh");
      achievesProvider.refresh();
    });

    context.globalState.update("achieves", achievesProvider.achieves);

    return {
      achieves: achievesProvider,
      // speedrun: speedrunProvider,
      decoration: decorationProvider,
    };
  });
}

export function deactivate() {}
