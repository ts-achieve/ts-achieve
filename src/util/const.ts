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

const ex = "tsAchieve" as const;

const commands = {
  setContext: "setContext",
  refresh: `${ex}.command.refresh`,
  startrun: `${ex}.command.startrun`,
  stoprun: `${ex}.command.stoprun`,
  hardReset: `${ex}.command.hardReset`,
  showUnlocked: `${ex}.command.showUnlocked`,
  showLocked: `${ex}.command.showLocked`,
  showAll: `${ex}.command.showAll`,
} as const;

const config = {
  revealDescription: `config.revealDescription`,
  notifyOnReachieve: `config.notifyOnReachieve`,
  subcategorize: `config.subcategorize`,
} as const;

const context = {
  isRunStarted: `${ex}.context.isRunStarted`,
} as const;

const views = {
  list: `${ex}.view.list`,
  summary: `${ex}.view.summary`,
  speedrun: `${ex}.view.speedrun`,
} as const;

const colors = {
  locked: "disabledForeground",
  unlocked: "icon.foreground",
} as const;

export const names = { ex, colors, commands, config, context, views } as const;
