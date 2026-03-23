import vscode from "vscode";

import { Maybe } from "./util/type";
import { names } from "./util/const";
import { AchievedProvider } from "./provider/achieved";
import { DecorationProvider } from "./provider/decorate";
import { makeTracer, Tracer } from "./util/tracer";
import { SpeedrunProvider } from "./provider/speedrun";
import { SummaryProvider } from "./provider/summary";

export type ExtensionConfig = {
  revealDescription: boolean;
  notifyRepeatedAchievements: boolean;
  sort: any[];
};

type Providers = {
  achievedProvider: AchievedProvider;
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
  makeProviders: (
    config: ExtensionConfig,
    tracer: Tracer,
    disposables: vscode.Disposable[],
  ) => Providers,
): vscode.Disposable[] => {
  const tracer = makeTracer("ts-achieve");
  const disposables: vscode.Disposable[] = [];

  tracer.log("extension activation");

  const { achievedProvider, summaryProvider, decorationProvider } =
    makeProviders(getConfig(), tracer, disposables);

  disposables.push(
    vscode.commands.registerCommand(names.commands.refresh, () => {
      tracer.log(names.commands.refresh);
      achievedProvider.refresh();
    }),
  );

  disposables.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      const exConfig = getConfig();
      achievedProvider.reconfigure(exConfig);
      decorationProvider.reconfigure(exConfig);
    }),
  );

  achievedProvider.refresh();
  summaryProvider.refresh(achievedProvider.achieveMap);

  return disposables;
};
