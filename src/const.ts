export const loadingText = "Loading…";
export const diagnosticMessagesUrl =
  "https://raw.githubusercontent.com/microsoft/TypeScript/refs/heads/main/src/compiler/diagnosticMessages.json" as const;

export const statistics = ["overall", "errors", "messages"] as const;
export type StatisticType = (typeof statistics)[number];
