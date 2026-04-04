import { tsDiagnosticCategories } from "../util/const";
import { isObject } from "../util/type";
import { StarKind, taxonomy } from "./taxonomy";

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
      } else if (taxonomy.error.tsconfig.includes(diagnostic.code as any)) {
        return "tsconfig";
      } else if (taxonomy.error.type.includes(diagnostic.code as any)) {
        return "type-error";
      } else if (
        taxonomy.error.syntax.expression.includes(diagnostic.code as any)
      ) {
        return "expression";
      } else if (taxonomy.error.module.includes(diagnostic.code as any)) {
        return "module";
      } else if (taxonomy.error.syntax.async.includes(diagnostic.code as any)) {
        return "async";
      } else if (taxonomy.error.syntax.regex.includes(diagnostic.code as any)) {
        return "regex";
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
  messageTemplate: string,
) => {
  return {
    code: diagnostic.code,
    kind: kindOf(diagnostic),
    messageTemplate,
  };
};
