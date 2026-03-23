import vscode from "vscode";

import { names } from "./util/const";
import { logger } from "./util/logger";
import { getConfigSection, withConfig } from "./config";
import { setStarmap } from "./globalState";
import { DecorationProvider } from "./provider/decorate";
import { SummaryProvider } from "./provider/summary";
import { SpeedrunProvider } from "./provider/speedrun";
import { unlock } from "./provider/star";
import { StarlistProvider } from "./provider/provider";

export function activate(context: vscode.ExtensionContext) {
  try {
    withConfig((config) => {
      const decorationProvider = new DecorationProvider(config);
      const starlistProvider = new StarlistProvider(config, context);
      const summaryProvider = new SummaryProvider(
        config,
        starlistProvider.starmap,
      );
      const speedrunProvider = new SpeedrunProvider(config, context);

      context.subscriptions.push(
        vscode.commands.registerCommand(names.commands.refresh, () => {
          logger(names.commands.refresh);
          starlistProvider.refresh();
        }),
        vscode.window.registerFileDecorationProvider(decorationProvider),
        vscode.window.registerTreeDataProvider(
          names.views.summary,
          summaryProvider,
        ),
        vscode.window.registerTreeDataProvider(
          names.views.list,
          starlistProvider,
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
              const star = starlistProvider.starmap.get(diagnostic.code);

              if (star) {
                const unlockedStar = unlock(star, event, diagnostic);
                if (
                  unlockedStar.lifetime > 1 &&
                  getConfigSection(names.config.notifyRepeatedAchievements)
                ) {
                  vscode.window.showInformationMessage(
                    `Achievement found again!\n${diagnostic.code}: ${diagnostic.message}`,
                  );
                } else if (unlockedStar.lifetime === 1) {
                  vscode.window.showInformationMessage(
                    `Achievement unlocked!\n${diagnostic.code}: ${diagnostic.message}`,
                  );
                }
                setStarmap(context, starlistProvider.starmap);
                starlistProvider.refresh(unlockedStar);
                summaryProvider.refresh(starlistProvider.starmap);
              }
            }
          }

          setStarmap(context, starlistProvider.starmap);
        }
      });

      setStarmap(context, starlistProvider.starmap);

      return {
        starlistProvider,
        summaryProvider,
        speedrunProvider,
        decorationProvider,
      };
    });
  } catch (e: any) {
    logger(e.stack);
  }
}

export function deactivate() {}
