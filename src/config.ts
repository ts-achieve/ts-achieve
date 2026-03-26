import vscode from "vscode";

import { Maybe } from "./util/type";
import { names } from "./util/const";
import { Decorator } from "./provider/decorator";
import { Speedrunner } from "./provider/speedrunner";
import { Summarizer } from "./provider/summarizer";
import { Starlister } from "./provider/starlister";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyRepeatedAchievements: boolean;
  sort: any[];
};

export type Providers = {
  starlistProvider: Starlister;
  summaryProvider: Summarizer;
  speedrunProvider: Speedrunner;
  decorationProvider: Decorator;
};

export const getConfigSection = (
  section: string,
): Maybe<ExtensionConfig[keyof ExtensionConfig]> => {
  return vscode.workspace.getConfiguration(names.ex).get(section);
};

export const getConfig = (): ExtensionConfig => {
  const wsConfig = vscode.workspace.getConfiguration(names.ex);

  const exConfig: ExtensionConfig = {
    revealDescription: wsConfig.get(names.config.revealDescription) ?? false,
    notifyRepeatedAchievements:
      wsConfig.get(names.config.notifyRepeatedAchievements) ?? false,
    sort: wsConfig.get(names.config.sort) ?? [],
  };

  return exConfig;
};
