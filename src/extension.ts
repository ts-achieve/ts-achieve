import vscode from "vscode";

import { names, showing } from "./util/const";
import { getConfig, getConfigSection } from "./config";
import { setStarmap } from "./globalState";
import { unlock, UnlockedStar } from "./star/star";
import { Decorator } from "./provider/decorator";
import { Summarizer } from "./provider/summarizer";
import { Starlister } from "./provider/starlister";

export function activate(context: vscode.ExtensionContext) {
  try {
    const config = getConfig();
    const decorator = new Decorator();
    const starlister = new Starlister(config, context);
    const summarizer = new Summarizer(starlister.starmap);

    vscode.commands.executeCommand(
      "setContext",
      "tsAchieve.showing",
      showing.all,
    );

    context.subscriptions.push(
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
        starlister.refresh();
        summarizer.refresh();
      }),

      vscode.commands.registerCommand(names.commands.hardReset, () => {
        try {
          setStarmap(context, undefined);
          starlister.starmap = starlister.loadStarmap(context);
          summarizer.update(starlister.starmap);

          starlister.refresh();
          summarizer.refresh();
        } catch (e: any) {
          console.log(e.stack);
        }
      }),

      vscode.window.registerFileDecorationProvider(decorator),
      vscode.window.registerTreeDataProvider(names.views.summary, summarizer),
      vscode.window.registerTreeDataProvider(names.views.list, starlister),

      vscode.workspace.onDidChangeConfiguration(() => {
        const exConfig = getConfig();
        starlister.reconfigure(exConfig);
      }),

      vscode.languages.onDidChangeDiagnostics(() => {
        const document = vscode.window.activeTextEditor!.document;
        const diagnostics = vscode.languages.getDiagnostics(document.uri);

        for (let i = 0; i < diagnostics.length; i++) {
          const diagnostic = diagnostics[i]!;

          if (typeof diagnostic.code === "number") {
            const maybeStar = starlister.starmap.get(diagnostic.code);

            if (maybeStar) {
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
      }),
    );

    setStarmap(context, starlister.starmap);
  } catch (e) {
    console.log(e);
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
