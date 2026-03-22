import vscode from "vscode";

import { names } from "./const";
import { AchieveProvider } from "./achieve";
import { DecorationProvider } from "./decorate";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyRepeatedAchievements: boolean;
};

type Providers = {
  achieves: AchieveProvider;
  // speedrun: SpeedrunProvider;
  decoration: DecorationProvider;
};

const makeExConfig = (): ExtensionConfig => {
  const wsConfig = vscode.workspace.getConfiguration(names.ex);

  return {
    revealDescription: wsConfig.get(names.config.revealDescription) ?? false,
    notifyRepeatedAchievements:
      wsConfig.get(names.config.notifyRepeatedAchievements) ?? false,
  };
};

export const withConfig = (
  makeProviders: (config: ExtensionConfig) => Providers,
) => {
  const { achieves, decoration } = makeProviders(makeExConfig());

  vscode.workspace.onDidChangeConfiguration(() => {
    const exConfig = makeExConfig();
    achieves.reconfigure(exConfig);
    decoration.reconfigure(exConfig);
  });
};
