import vscode from "vscode";

import { getConfigSection, withConfig } from "./config";
import { names } from "./util/const";
import { AchievedProvider } from "./provider/achieved";
import { DecorationProvider } from "./provider/decorate";
import { SummaryProvider } from "./provider/summary";
import { SpeedrunProvider } from "./provider/speedrun";
import { setAchieveMap } from "./globalState";

export function activate(context: vscode.ExtensionContext) {
  withConfig((config, tracer) => {
    const decorationProvider = new DecorationProvider(tracer);
    const achievedProvider = new AchievedProvider(config, tracer, context);
    const summaryProvider = new SummaryProvider(
      config,
      tracer,
      achievedProvider.achieveMap,
    );
    const speedrunProvider = new SpeedrunProvider(config, tracer);

    context.subscriptions.push(
      vscode.commands.registerCommand(names.commands.refresh, () => {
        tracer.log(names.commands.refresh);
        achievedProvider.refresh();
      }),
      vscode.window.registerFileDecorationProvider(decorationProvider),
      vscode.window.registerTreeDataProvider(
        names.views.summary,
        summaryProvider,
      ),
      vscode.window.registerTreeDataProvider(
        names.views.list,
        achievedProvider,
      ),
      vscode.window.registerTreeDataProvider(
        names.views.speedrun,
        speedrunProvider,
      ),
    );

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

        setAchieveMap(context, tracer, achievedProvider.achieveMap);
      }
    });

    setAchieveMap(context, tracer, achievedProvider.achieveMap);

    return {
      achievedProvider,
      summaryProvider,
      speedrunProvider,
      decorationProvider,
    };
  });
}

export function deactivate() {}
