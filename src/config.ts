import vscode from "vscode";

import { Maybe } from "./util/type";
import { names } from "./util/const";
import { DecorationProvider } from "./provider/decorate";
import { SpeedrunProvider } from "./provider/speedrun";
import { SummaryProvider } from "./provider/summary";
import { StarlistProvider } from "./provider/provider";
import { logger } from "./util/logger";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyRepeatedAchievements: boolean;
  sort: any[];
};

export type Providers = {
  starlistProvider: StarlistProvider;
  summaryProvider: SummaryProvider;
  speedrunProvider: SpeedrunProvider;
  decorationProvider: DecorationProvider;
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
): void => {
  logger("extension activation");

  const providers = makeProviders(getConfig());

  vscode.workspace.onDidChangeConfiguration(() => {
    const exConfig = getConfig();
    Object.values(providers).forEach((provider) =>
      provider.reconfigure(exConfig),
    );
  });
};
