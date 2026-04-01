import vscode, { DiagnosticChangeEvent } from "vscode";

import { names } from "./util/const";
import { getConfig, getConfigSection } from "./config";
import { setStarmap } from "./globalState";
import { unlock } from "./star/star";
import { Decorator } from "./provider/decorator";
import { Summarizer } from "./provider/summarizer";
import { Starlister } from "./provider/starlister";
import { Speedrunner } from "./provider/speedrunner";

export function activate(context: vscode.ExtensionContext) {
  const config = getConfig();
  const decorator = new Decorator(config);
  const starlister = new Starlister(config, context);
  const summarizer = new Summarizer(config, starlister.starmap);
  const speedrunner = new Speedrunner(config, context);

  context.subscriptions.push(
    vscode.commands.registerCommand(names.commands.refresh, () => {
      starlister.refresh();
      summarizer.refresh();
    }),

    vscode.commands.registerCommand(names.commands.hardReset, () => {
      setStarmap(context, undefined);
      starlister.starmap = starlister.loadStarmap(context);
      summarizer.update(starlister.starmap);

      starlister.refresh();
      summarizer.refresh();
    }),

    vscode.window.registerFileDecorationProvider(decorator),
    vscode.window.registerTreeDataProvider(names.views.summary, summarizer),
    vscode.window.registerTreeDataProvider(names.views.list, starlister),
    vscode.window.registerTreeDataProvider(names.views.speedrun, speedrunner),

    vscode.workspace.onDidChangeConfiguration(() => {
      const exConfig = getConfig();
      speedrunner.reconfigure(exConfig);
      starlister.reconfigure(exConfig);
      summarizer.reconfigure(exConfig);
    }),

    vscode.languages.onDidChangeDiagnostics((event) => {
      const diagnosticMap = computeDiagnosticMap(event);
      if (diagnosticMap.size > 0) {
        for (const document of diagnosticMap.keys()) {
          const diagnostics = diagnosticMap.get(document)!;

          for (let i = 0; i < diagnostics.length; i++) {
            const diagnostic = diagnostics[i]!;

            if (typeof diagnostic.code === "number") {
              const star = starlister.starmap.get(diagnostic.code);

              if (star) {
                const unlockedStar = unlock(star, document, diagnostic);
                if (
                  unlockedStar.encounterCount > 1 &&
                  getConfigSection(names.config.notifyRepeatedAchievements)
                ) {
                  vscode.window.showInformationMessage(
                    `Achievement found again!\n${diagnostic.code}: ${diagnostic.message}`,
                  );
                } else if (unlockedStar.encounterCount === 1) {
                  vscode.window.showInformationMessage(
                    `Achievement unlocked!
                  ${diagnostic.code}: ${diagnostic.message}`,
                  );
                }
                setStarmap(context, starlister.starmap);
                starlister.update(unlockedStar);
                summarizer.update(starlister.starmap);
                starlister.refresh();
                summarizer.refresh();
              }
            }
          }
        }

        setStarmap(context, starlister.starmap);
      }
    }),
  );

  setStarmap(context, starlister.starmap);
}

export function deactivate() {}

const computeDiagnosticMap = (
  event: DiagnosticChangeEvent,
): Map<vscode.TextDocument, vscode.Diagnostic[]> => {
  return new Map(
    vscode.workspace.textDocuments
      .filter((document) => event.uris.includes(document.uri))
      .map((document) => [
        document,
        vscode.languages.getDiagnostics(document.uri),
      ]),
  );
};
