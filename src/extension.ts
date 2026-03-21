import vscode from "vscode";
import { Achievement, Provider, Statistic } from "./achieve";
import { curl } from "./curl";

const getAchievements = (
  context: vscode.ExtensionContext,
): Map<number, Achievement> => {
  const maybeMap: Map<number, Achievement> | undefined =
    context.globalState.get("achievements");
  console.log("maybeMap", maybeMap);
  if (maybeMap && Object.keys(maybeMap).length) {
    return maybeMap;
  } else {
    return curl(context);
  }
};

export function activate(context: vscode.ExtensionContext) {
  console.log("achieve");

  const provider = new Provider(getAchievements(context));
  provider.summary.set(
    "overall",
    new Statistic(
      "overall",
      (achievements) =>
        achievements
          .values()
          .filter((achievement) => achievement.isAchieved)
          .toArray().length / achievements.length,
    ),
  );

  vscode.window.registerTreeDataProvider("achievementsList", provider);

  vscode.workspace.onDidChangeTextDocument((event) => {
    console.log("did change text document");
    const diagnostics = vscode.languages.getDiagnostics(event.document.uri);
    if (diagnostics.length > 0) {
      console.log("diagnostics length > 0");
      for (let i = 0; i < diagnostics.length; i++) {
        const diagnostic = diagnostics[i];
        const code = diagnostic.code;
        if (typeof code === "number") {
          console.log('typeof code === "number"');
          if (!provider.achievements.get(code)?.isAchieved) {
            console.log("!provider.achievements.has(code)");
            vscode.window.showInformationMessage(
              `Achievement unlocked!\n${diagnostic.code}: ${diagnostic.message}`,
            );
            provider.achievements.get(code)!.achieve();
            provider.refresh();
          }
        }
      }
    }
  });

  vscode.commands.registerCommand("achievements.refresh", () => {
    console.log("refreshing");
    provider.refresh();
  });
}

export function deactivate() {}
