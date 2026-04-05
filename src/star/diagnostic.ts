import { tsDiagnosticCategories } from "../util/const";
import { capitalize, isObject, RequiredBy, uncapitalize } from "../util/type";
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

export const computeKind = (
  { code, category, reportsUnnecessary }: RequiredBy<TsDiagnostic, "code">,
  messageTemplate?: string,
): StarKind => {
  if (reportsUnnecessary === true) {
    return "warning";
  } else if (category === "Message") {
    return "message";
  } else if (category === "Suggestion") {
    if (taxonomy["suggestion-type"].includes(code as any)) {
      return "suggestion-type";
    } else if (taxonomy["suggestion-language"].includes(code as any)) {
      return "suggestion-language";
    } else {
      return "suggestion-other";
    }
  } else if (messageTemplate) {
    if (messageTemplate.includes("strict mode")) {
      return "error-tsconfig-strict";
    } else if (
      messageTemplate.includes("rootDir") ||
      messageTemplate.includes("moduleResolution") ||
      messageTemplate.includes("isolatedModules") ||
      messageTemplate.includes("verbatimModuleSyntax") ||
      messageTemplate.includes("exactOptionalPropertyTypes")
    ) {
      return "error-tsconfig-other";
    } else if (messageTemplate.includes("namespace")) {
      return "error-module-namespace";
    } else if (
      messageTemplate.includes("import") ||
      messageTemplate.includes("export")
    ) {
      return "error-module-port";
    } else if (messageTemplate.includes("interface")) {
      return "error-type-interface";
    } else if (
      messageTemplate.includes("async") ||
      messageTemplate.includes("await")
    ) {
      return "error-async";
    } else if (
      messageTemplate.includes("'this'") ||
      messageTemplate.includes("'super'")
    ) {
      return "error-oop-this";
    } else if (
      messageTemplate.includes("'new'") ||
      messageTemplate.includes("constructor")
    ) {
      return "error-oop-constructor";
    } else if (
      includesAnyOf(messageTemplate, [
        "accessor",
        "'set'",
        "setter",
        "'get'",
        "getter",
      ])
    ) {
      return "error-oop-accessor";
    }
  }

  return (Object.keys(taxonomy).find((key) =>
    (taxonomy[key as keyof typeof taxonomy] as number[]).includes(code),
  ) ?? "error-other") as StarKind;
};

/**
 * case-insensitive
 */
const includesAnyOf = (haystack: string, needles: string[]) => {
  for (const needle of needles) {
    if (
      haystack.includes(needle.slice(1)) &&
      (haystack.includes(uncapitalize(needle)) ||
        haystack.includes(capitalize(needle)))
    ) {
      return true;
    }
  }

  return false;
};
