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

export const kindOf = (
  diagnostic: TsDiagnostic,
  messageTemplate: string,
): StarKind => {
  if (messageTemplate.includes("strict mode")) {
    return "error-tsconfig-strict";
  } else if (messageTemplate.includes("accessor")) {
    return "error-oop-class";
  } else {
    return (Object.keys(taxonomy).find((key) =>
      (taxonomy[key as keyof typeof taxonomy] as number[]).includes(
        diagnostic.code,
      ),
    ) ?? "other") as StarKind;
  }
};

export const diagnosticToStar = (
  diagnostic: TsDiagnostic,
  messageTemplate: string,
) => {
  return {
    code: diagnostic.code,
    kind: kindOf(diagnostic, messageTemplate),
    messageTemplate,
  };
};
