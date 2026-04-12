export const showing = {
  all: 0,
  unlocked: 1,
  locked: 2,
} as const;

export const loadingText = "Loading…";
export const diagnosticMessagesUrl =
  "https://raw.githubusercontent.com/microsoft/TypeScript/refs/heads/main/src/compiler/diagnosticMessages.json" as const;

export const tsDiagnosticCategories = [
  "Error",
  "Suggestion",
  "Message",
] as const;

export const sortPriorities = [
  "kind (errors first)",
  "kind (errors last)",
  "locked first",
  "unlocked first",
  "code (ascending)",
  "code (descending)",
  "alphabetic (forwards)",
  "alphabetic (backwards)",
] as const;

// region names

type ContributeName<S extends string, P extends string> = {
  [K in S]: `${P}${K}`;
};

const ex = "tsAchieve" as const;

const commands = {
  refresh: `${ex}.command.refresh`,
  startrun: `${ex}.command.startrun`,
  stoprun: `${ex}.command.stoprun`,
  hardReset: `${ex}.command.hardReset`,
  logStarmap: `${ex}.command.logStarmap`,
  showUnlocked: `${ex}.command.showUnlocked`,
  showLocked: `${ex}.command.showLocked`,
  showAll: `${ex}.command.showAll`,
} as const satisfies ContributeName<any, `${typeof ex}.command.`>;

const config = {
  revealDescription: `config.revealDescription`,
  notifyOnReachieve: `config.notifyOnReachieve`,
  subcategorize: `config.subcategorize`,
} as const satisfies ContributeName<any, `config.`>;

const context = {
  isRunStarted: `${ex}.context.isRunStarted`,
} as const satisfies ContributeName<any, `${typeof ex}.context.`>;

const views = {
  list: `${ex}.view.list`,
  summary: `${ex}.view.summary`,
  speedrun: `${ex}.view.speedrun`,
  liveblog: `${ex}.view.liveblog`,
} as const satisfies ContributeName<any, `${typeof ex}.view.`>;

const colors = {
  locked: "disabledForeground",
  unlocked: "icon.foreground",
} as const;

export const names = { ex, colors, commands, config, context, views } as const;
