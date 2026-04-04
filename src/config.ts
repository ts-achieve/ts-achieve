import vscode from "vscode";

import { Maybe } from "./util/type";
import { names } from "./util/const";
import { Decorator } from "./provider/decorator";
import { Speedrunner } from "./provider/speedrunner";
import { Summarizer } from "./provider/summarizer";
import { Starlister, Subcategorize } from "./provider/starlister";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyOnReachieve: boolean;
  subcategorize: Subcategorize;
};

export type Providers = {
  starlistProvider: Starlister;
  summaryProvider: Summarizer;
  speedrunProvider: Speedrunner;
  decorationProvider: Decorator;
};

export const getConfigSection = <K extends keyof ExtensionConfig>(
  section: `config.${K}`,
): Maybe<ExtensionConfig[K]> => {
  return vscode.workspace.getConfiguration(names.ex).get(section);
};

export const getConfig = (): ExtensionConfig => {
  const wsConfig = vscode.workspace.getConfiguration(names.ex);

  const exConfig: ExtensionConfig = {
    revealDescription: wsConfig.get(names.config.revealDescription) ?? false,
    notifyOnReachieve: wsConfig.get(names.config.notifyOnReachieve) ?? false,
    subcategorize: wsConfig.get(names.config.subcategorize) ?? "all",
  };

  return exConfig;
};
