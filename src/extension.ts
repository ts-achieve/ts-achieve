import vscode from "vscode";

import { names, showing } from "./util/const";
import { getConfig, getConfigSection } from "./config";
import { getGlobalState, setStarmap } from "./globalState";
import { unlock, UnlockedStar } from "./star/star";
import { Decorator } from "./provider/decorator";
import { Summarizer } from "./provider/summarizer";
import { Starlister } from "./provider/starlister";
import { consoleLog } from "./util/console";
import { Speedrunner } from "./provider/speedrunner";

export function activate(context: vscode.ExtensionContext) {
  try {
    consoleLog("extension activation initiation");

    const config = getConfig();
    const decorator = new Decorator();
    const starlister = new Starlister(config, context);
    const summarizer = new Summarizer(starlister.starmap);
    const speedrunner = new Speedrunner(context.extensionUri);

    vscode.commands.executeCommand(
      "setContext",
      "tsAchieve.showing",
      showing.all,
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(names.commands.logStarmap, () => {
        consoleLog("starmap log");
        consoleLog(". raw starmap:", getGlobalState(context, "starmap"));
        consoleLog(". parsed starmap:", starlister.starmap);
      }),

      vscode.commands.registerCommand(names.commands.showUnlocked, () => {
        starlister.cycleShowing();
      }),

      vscode.commands.registerCommand(names.commands.showLocked, () => {
        starlister.cycleShowing();
      }),

      vscode.commands.registerCommand(names.commands.showAll, () => {
        starlister.cycleShowing();
      }),

      vscode.commands.registerCommand(names.commands.refresh, () => {
        try {
          starlister.refresh();
          summarizer.refresh();
        } catch (e: any) {
          consoleLog("error during refresh:", e.stack);
        }
      }),

      vscode.commands.registerCommand(names.commands.hardReset, () => {
        try {
          setStarmap(context, undefined);
          starlister.starmap = starlister.loadStarmap(context);
          summarizer.update(starlister.starmap);

          starlister.refresh();
          summarizer.refresh();
        } catch (e: any) {
          consoleLog("error during hard reset:", e.stack);
        }
      }),

      vscode.window.registerFileDecorationProvider(decorator),
      vscode.window.registerTreeDataProvider(names.views.summary, summarizer),
      vscode.window.registerTreeDataProvider(names.views.list, starlister),
      vscode.window.registerWebviewViewProvider(
        Speedrunner.viewType,
        speedrunner,
      ),

      vscode.workspace.onDidChangeConfiguration(() => {
        const exConfig = getConfig();
        starlister.reconfigure(exConfig);
      }),

      vscode.languages.onDidChangeDiagnostics(() => {
        try {
          consoleLog("diagnostic change");
          const document = vscode.window.activeTextEditor!.document;
          const diagnostics = vscode.languages.getDiagnostics(document.uri);

          for (let i = 0; i < diagnostics.length; i++) {
            const diagnostic = diagnostics[i]!;

            if (typeof diagnostic.code === "number") {
              speedrunner.update(diagnostic.code);

              const maybeStar = starlister.starmap.get(diagnostic.code);

              if (maybeStar) {
                consoleLog(". star retrieval:", maybeStar);
                const unlockedStar = unlock(maybeStar, document, diagnostic);

                showInformationMessage(unlockedStar, diagnostic);
                setStarmap(context, starlister.starmap);
                starlister.update(unlockedStar);
                summarizer.update(starlister.starmap);
                starlister.refresh();
                summarizer.refresh();
              }
            }
          }

          setStarmap(context, starlister.starmap);
        } catch (e: any) {
          consoleLog("error during diagnostic change", e.stack);
        }
      }),
    );

    setStarmap(context, starlister.starmap);

    consoleLog("extension activation completion");
  } catch (e: any) {
    consoleLog("error during activate", e.stack);
  }
}

export function deactivate() {}

const showInformationMessage = (
  star: UnlockedStar,
  diagnostic: vscode.Diagnostic,
) => {
  if (
    star.encounterCount > 1 &&
    getConfigSection(names.config.notifyOnReachieve)
  ) {
    vscode.window.showInformationMessage(
      `Achievement found again! ${diagnostic.code}: ${diagnostic.message}`,
    );
  } else if (star.encounterCount === 1) {
    vscode.window.showInformationMessage(
      `Achievement unlocked! ${diagnostic.code}: ${diagnostic.message}`,
    );
  }
};
