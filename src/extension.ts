import vscode from "vscode";

import { names } from "./util/const";
import { getConfigSection, withConfig } from "./config";
import { AchievedProvider } from "./provider/achieved";
import { DecorationProvider } from "./provider/decorate";
import { SummaryProvider } from "./provider/summary";
import { makeTracer } from "./util/tracer";

export function activate(context: vscode.ExtensionContext) {
  const tracer = makeTracer("ts-achieve");

  tracer.trace("activate");

  withConfig((config) => {
    const achievedProvider = new AchievedProvider(config, tracer, context);

    const summaryProvider = new SummaryProvider(
      config,
      tracer,
      achievedProvider.achieveMap,
    );
    vscode.window.registerTreeDataProvider(
      names.views.summary,
      summaryProvider,
    );

    vscode.window.registerTreeDataProvider(names.views.list, achievedProvider);

    // const speedrunProvider = new SpeedrunProvider(config);
    // vscode.window.registerTreeDataProvider(
    //   names.views.speedrun,
    //   speedrunProvider,
    // );

    const decorationProvider = new DecorationProvider(tracer);
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
      tracer.trace("refresh");
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
