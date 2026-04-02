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

export const nonErrorKinds = [
  "special",
  "message",
  "suggestion",
  "warning",
] as const;

export const topKinds = [...nonErrorKinds, "error"] as const;

export const suggestionKinds = [
  "type-suggestion",
  "language",
  "other-suggestion",
] as const;

export const errorKinds = [
  "syntax",
  "type-error",
  "tsconfig",
  "strict",
  "other-error",
] as const;

export const syntaxErrorKinds = [
  "async",
  "class",
  "statement",
  "function",
] as const;

export const pathKinds = [
  ...topKinds,
  ...suggestionKinds,
  ...errorKinds,
  ...syntaxErrorKinds,
] as const;

export const starKinds = [
  "special",
  "message",
  ...suggestionKinds,
  "warning",
  ...syntaxErrorKinds,
  "type-error",
  "tsconfig",
  "strict",
  "other-error",
] as const;

export type TopKind = (typeof topKinds)[number];
export type SuggestionKind = (typeof suggestionKinds)[number];
export type ErrorKind = (typeof errorKinds)[number];
export type SyntaxErrorKind = (typeof syntaxErrorKinds)[number];
export type PathKind = (typeof pathKinds)[number];
export type StarKind = (typeof starKinds)[number];

export const isErrorKind = (x: string): x is ErrorKind => {
  return errorKinds.includes(x as any);
};

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
  expandAll: `${ex}.command.expandAll`,
  collapseAll: `${ex}.command.collapseAll`,
} as const;

const config = {
  revealDescription: `config.revealDescription`,
  notifyRepeatedAchievements: `config.notifyRepeatedAchievements`,
  sort: `config.sort`,
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
