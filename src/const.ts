export const loadingText = "Loading…";
export const diagnosticMessagesUrl =
  "https://raw.githubusercontent.com/microsoft/TypeScript/refs/heads/main/src/compiler/diagnosticMessages.json" as const;

export const tsDiagnosticCategories = [
  "Error",
  "Suggestion",
  "Message",
] as const;

export const achieveKinds = [
  "meta",
  "message",
  "warning",
  "suggestion",
  "syntax",
  "type",
  "tsconfig",
  "strict",
] as const;

export const statistics = [
  "overall",
  "errors",
  "warnings",
  "suggestions",
  "messages",
] as const;

export const configOptions = [
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
  show: `${ex}.show`,
  refresh: `${ex}.refresh`,
} as const;

const config = {
  revealDescription: `config.revealDescription`,
  notifyRepeatedAchievements: `config.notifyRepeatedAchievements`,
  sort: `config.sort`,
} as const;

const views = {
  list: `${ex}.view.list`,
  speedrun: `${ex}.view.speedrun`,
} as const;

const colors = {
  lockedAchievement: "disabledForeground",
  unlockedAchievement: "icon.foreground",
} as const;

export const names = { ex, colors, commands, config, views } as const;
