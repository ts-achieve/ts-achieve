import vscode from "vscode";

import { Maybe } from "./util/type";
import { names } from "./util/const";
import { Subcategorize } from "./provider/starlister";
import { consoleLog } from "./util/console";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyOnReachieve: boolean;
  subcategorize: Subcategorize;
};

export const getConfigSection = <K extends keyof ExtensionConfig>(
  section: `config.${K}`,
): Maybe<ExtensionConfig[K]> => {
  return vscode.workspace.getConfiguration(names.ex).get(section);
};

export const getConfig = (): ExtensionConfig => {
  consoleLog("`getConfig` call");
  const wsConfig = vscode.workspace.getConfiguration(names.ex);

  const exConfig: ExtensionConfig = {
    revealDescription: wsConfig.get(names.config.revealDescription) ?? false,
    notifyOnReachieve: wsConfig.get(names.config.notifyOnReachieve) ?? false,
    subcategorize: wsConfig.get(names.config.subcategorize) ?? "all",
  };

  return exConfig;
};
