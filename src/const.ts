export const loadingText = "Loading…";
export const diagnosticMessagesUrl =
  "https://raw.githubusercontent.com/microsoft/TypeScript/refs/heads/main/src/compiler/diagnosticMessages.json" as const;

export const statistics = [
  "overall",
  "errors",
  "suggestions",
  "messages",
] as const;
export type StatisticType = (typeof statistics)[number];

const ex = "tsAchieve" as const;

const commands = {
  show: `${ex}.show`,
  refresh: `${ex}.refresh`,
} as const;

const config = {
  doesShowDescription: `${ex}.config.doesShowDescription`,
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
