import { expectTypeOf } from "expect-type";

import { tsDiagnosticCategories } from "../util/const";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { isObject, Maybe, uncapitalize } from "../util/type";
import { StarKind } from "./star";

type Dictionary = {
  -readonly [K in keyof typeof diagnosticMessages]: {
    -readonly [L in keyof (typeof diagnosticMessages)[K]]: (typeof diagnosticMessages)[K][L];
  };
};

export type Message = keyof Dictionary;

export const isDiagnosticMessage = (x: unknown): x is Message => {
  return typeof x === "string" && x in diagnosticMessages;
};

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

type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export type TsDiagnostic<
  C extends TsDiagnosticCategory = TsDiagnosticCategory,
> = C extends any
  ? {
      code: number;
      category: C;
      reportsUnnecessary?: boolean;
    }
  : never;

export const isTsDiagnostic = (x: unknown): x is TsDiagnostic => {
  return (
    isObject(x) &&
    "category" in x &&
    tsDiagnosticCategories.includes(x.category as any) &&
    "code" in x &&
    typeof x.code === "number"
  );
};

export const kindOf = (diagnostic: TsDiagnostic): StarKind => {
  if (diagnostic.category === "Error") {
    if ("reportsUnnecessary" in diagnostic) {
      return "warning";
    } else {
      if (diagnostic.code < 2000) {
        return "syntax";
      } else if (diagnostic.code < 5000) {
        return "type";
      } else {
        return "tsconfig";
      }
    }
  } else {
    return uncapitalize(diagnostic.category);
  }
};

export const diagnosticToStar = (
  diagnostic: TsDiagnostic,
  messageTemplate: keyof typeof diagnosticMessages,
) => {
  return {
    code: diagnostic.code,
    kind: kindOf(diagnostic),
    messageTemplate,
  };
};
