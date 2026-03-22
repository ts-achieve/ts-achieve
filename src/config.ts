import vscode from "vscode";

import { Maybe } from "./type";
import { names } from "./const";
import { AchievedProvider } from "./provider/achieved";
import { DecorationProvider } from "./provider/decorate";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyRepeatedAchievements: boolean;
  sort: any[];
};

type Providers = {
  achieves: AchievedProvider;
  // speedrun: SpeedrunProvider;
  decoration: DecorationProvider;
};

export const getConfigSection = (
  section: string,
): Maybe<ExtensionConfig[keyof ExtensionConfig]> => {
  return vscode.workspace.getConfiguration(names.ex).get(section);
};

const getConfig = (): ExtensionConfig => {
  const wsConfig = vscode.workspace.getConfiguration(names.ex);

  const exConfig: ExtensionConfig = {
    revealDescription: wsConfig.get(names.config.revealDescription) ?? false,
    notifyRepeatedAchievements:
      wsConfig.get(names.config.notifyRepeatedAchievements) ?? false,
    sort: wsConfig.get(names.config.sort) ?? [],
  };

  return exConfig;
};

export const withConfig = (
  makeProviders: (config: ExtensionConfig) => Providers,
) => {
  const { achieves, decoration } = makeProviders(getConfig());

  vscode.workspace.onDidChangeConfiguration(() => {
    const exConfig = getConfig();
    achieves.reconfigure(exConfig);
    decoration.reconfigure(exConfig);
  });
};
