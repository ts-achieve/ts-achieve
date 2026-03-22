import { expectTypeOf } from "vitest";
import { diagnosticMessages } from "./diagnosticMessages";

export type Maybe<T> = T | undefined;

type Dictionary = {
  -readonly [K in keyof typeof diagnosticMessages]: {
    -readonly [L in keyof (typeof diagnosticMessages)[K]]: (typeof diagnosticMessages)[K][L];
  };
};

type Message = keyof Dictionary;

type CodeToMessage<N extends number> = Message extends infer U extends Message
  ? U extends any
    ? Dictionary[U] extends { code: N }
      ? U
      : never
    : never
  : never;

export const codeToMessage = <N extends number>(
  code: N,
): Maybe<CodeToMessage<N>> => {
  return Object.values(diagnosticMessages).find((value) => {
    return value.code === code;
  }) as Maybe<CodeToMessage<N>>;
};

expectTypeOf<
  CodeToMessage<1002>
>().toEqualTypeOf<"Unterminated string literal.">();
expectTypeOf(codeToMessage(1003)!).toEqualTypeOf(
  "Identifier expected." as const,
);
