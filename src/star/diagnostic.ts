import { tsDiagnosticCategories } from "../util/const";
import { isObject, RequiredBy } from "../util/type";
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

const computeKind = (
  { code, category, reportsUnnecessary }: RequiredBy<TsDiagnostic, "code">,
  messageTemplate?: string,
): StarKind => {
  if (code > 7000 && code < 8000) {
    console.log("nyeh", { code, category, reportsUnnecessary });
  }
  if (reportsUnnecessary === true) {
    return "warning";
  } else if (category === "Message") {
    return "message";
  } else if (category === "Suggestion") {
    if (taxonomy["suggestion-type"].includes(code as any)) {
      console.log("yuh", code);
      return "suggestion-type";
    } else if (taxonomy["suggestion-language"].includes(code as any)) {
      return "suggestion-language";
    } else {
      return "suggestion-other";
    }
  } else if (messageTemplate) {
    if (messageTemplate.includes("strict mode")) {
      return "error-tsconfig-strict";
    } else if (messageTemplate.includes("accessor")) {
      return "error-oop-class";
    } else {
      return (Object.keys(taxonomy).find((key) =>
        (taxonomy[key as keyof typeof taxonomy] as number[]).includes(code),
      ) ?? "error-other") as StarKind;
    }
  } else {
    return "error-other";
  }
};

export const diagnosticToStar = (
  diagnostic: TsDiagnostic,
  messageTemplate: string,
) => {
  return {
    code: diagnostic.code,
    kind: computeKind(diagnostic, messageTemplate),
    messageTemplate,
  };
};
