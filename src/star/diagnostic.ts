import { StarKind, tsDiagnosticCategories } from "../util/const";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { isObject, Maybe } from "../util/type";
import { taxonomy } from "./taxonomy";

type Dictionary = {
  -readonly [K in keyof typeof diagnosticMessages]: {
    -readonly [L in keyof (typeof diagnosticMessages)[K]]: (typeof diagnosticMessages)[K][L];
  };
};

export type Message = keyof Dictionary;

export const isDiagnosticMessage = (x: unknown): x is Message => {
  return typeof x === "string" && x in diagnosticMessages;
};

export type CodeToMessage<N extends number> = Message extends infer M extends
  Message
  ? M extends any
    ? Dictionary[M] extends { code: N }
      ? M
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
  if (diagnostic.category === "Suggestion") {
    if (taxonomy.suggestion.type.includes(diagnostic.code as any)) {
      return "type-suggestion";
    } else if (taxonomy.suggestion.language.includes(diagnostic.code as any)) {
      return "language";
    } else {
      return "other-suggestion";
    }
  } else if (diagnostic.category === "Error") {
    if ("reportsUnnecessary" in diagnostic) {
      return "warning";
    } else {
      if (taxonomy.error.strict.includes(diagnostic.code as any)) {
        return "strict";
      } else if (taxonomy.error.syntax.async.includes(diagnostic.code as any)) {
        return "async";
      } else if (taxonomy.error.syntax.class.includes(diagnostic.code as any)) {
        return "class";
      } else if (
        taxonomy.error.syntax.statement.includes(diagnostic.code as any)
      ) {
        return "statement";
      } else if (
        taxonomy.error.syntax.function.includes(diagnostic.code as any)
      ) {
        return "function";
      } else {
        return "other-error";
      }
    }
  } else {
    return "message";
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
