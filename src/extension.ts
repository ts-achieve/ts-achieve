import vscode from "vscode";

import { trace } from "./util";
import { names } from "./const";
import { getConfigSection, withConfig } from "./config";
import { AchievedProvider } from "./provider/achieved";
import { DecorationProvider } from "./provider/decorate";
import { SummaryProvider } from "./provider/summary";

export function activate(context: vscode.ExtensionContext) {
  trace("activate");

  withConfig((config) => {
    const achievedProvider = new AchievedProvider(config, context);

    const summaryProvider = new SummaryProvider(
      config,
      achievedProvider.achieveMap,
    );
    vscode.window.registerTreeDataProvider(
      names.views.summary,
      summaryProvider,
    );

    vscode.window.registerTreeDataProvider(names.views.list, achievedProvider);

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
            const achieve = achievedProvider.achieveMap.get(diagnostic.code);

            if (achieve) {
              if (achieve.isUnlocked) {
                achieve.encounter(event, diagnostic);

                if (getConfigSection(names.config.notifyRepeatedAchievements)) {
                  vscode.window.showInformationMessage(
                    `Achievement found again!\n${diagnostic.code}: ${diagnostic.message}`,
                  );
                }
              } else {
                achieve.unlock(event, diagnostic);
                vscode.window.showInformationMessage(
                  `Achievement unlocked!\n${diagnostic.code}: ${diagnostic.message}`,
                );
                achievedProvider.refresh();
                summaryProvider.refresh(achievedProvider.achieveMap);
              }
            }
          }
        }

        context.globalState.update("achieves", achievedProvider.achieveMap);
      }
    });

    vscode.commands.registerCommand(names.commands.refresh, () => {
      trace("refresh");
      achievedProvider.refresh();
    });

    achievedProvider.refresh();
    summaryProvider.refresh(achievedProvider.achieveMap);
    context.globalState.update("achieves", achievedProvider.achieveMap);

    return {
      achieves: achievedProvider,
      // speedrun: speedrunProvider,
      decoration: decorationProvider,
    };
  });
}

export function deactivate() {}
