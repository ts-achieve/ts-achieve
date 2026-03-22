import vscode from "vscode";

import { names } from "./const";
import { AchieveProvider } from "./achieve";
import { ExtensionConfig } from "./provision";
import { DecorationProvider } from "./decorate";
import { SpeedrunProvider } from "./speedrun";

type Providers = {
  achieves: AchieveProvider;
  speedrun: SpeedrunProvider;
  decoration: DecorationProvider;
};

const makeExConfig = (): ExtensionConfig => {
  const wsConfig = vscode.workspace.getConfiguration(names.ex);

  return {
    revealDescription:
      wsConfig.get(names.config.revealDescription) ?? false,
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
