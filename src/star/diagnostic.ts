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
  } else if (category === "Suggestion") {
    if (taxonomy["suggestion-type"].includes(code as any)) {
      return "suggestion-type";
    } else if (taxonomy["suggestion-language"].includes(code as any)) {
      return "suggestion-language";
    } else {
      return "suggestion-other";
    }
  } else if (messageTemplate) {
    if (includesAny(messageTemplate, "strict mode", "use strict")) {
      return "error-tsconfig-strict";
    } else if (
      includesAny(
        messageTemplate,
        "tsconfig",
        "'jsx",
        "'target'",
        "baseUrl",
        "rootDir",
        "allowJs",
        "composite",
        "isolatedModules",
        "moduleResolution",
        "preserveConstEnums",
        "verbatimModuleSyntax",
        "erasableSyntaxOnly",
        "exactOptionalPropertyTypes",
      )
    ) {
      return "error-tsconfig-other";
    } else if (
      includesAny(messageTemplate, "--", "compile", "build", "watch")
    ) {
      return "error-tsconfig-compiler";
    } else if (includesAny(messageTemplate, "jsx", "JSX", "tsx", "TSX")) {
      return "error-react";
    } else if (includesAny(messageTemplate, "overload")) {
      return "error-syntax-function";
    } else if (includesAny(messageTemplate, "namespac")) {
      return "error-module-namespace";
    } else if (includesAny(messageTemplate, "import", "export")) {
      return "error-module-port";
    } else if (includesAny(messageTemplate, "module")) {
      return "error-module-other";
    } else if (includesAny(messageTemplate, "assert", "'!'")) {
      return "error-type-assert";
    } else if (includesAny(messageTemplate, "interface")) {
      return "error-type-interface";
    } else if (includesAny(messageTemplate, "switch", "case")) {
      return "error-syntax-statement";
    } else if (includesAny(messageTemplate, "keyword", "reserved")) {
      return "error-syntax-keyword";
    } else if (includesAny(messageTemplate, "async", "await", "promis")) {
      return "error-async";
    } else if (includesAny(messageTemplate, "character class")) {
      return "error-syntax-regex";
    } else if (includesAny(messageTemplate, "abstract")) {
      return "error-oop-abstract";
    } else if (includesAny(messageTemplate, "'this'", "super")) {
      return "error-oop-this";
    } else if (includesAny(messageTemplate, "decorat")) {
      return "error-oop-decorator";
    } else if (includesAny(messageTemplate, "'new'", "construct")) {
      return "error-oop-constructor";
    } else if (
      includesAny(
        messageTemplate,
        "accessor",
        "'set'",
        "setter",
        "'get'",
        "getter",
      )
    ) {
      return "error-oop-accessor";
    } else if (includesAny(messageTemplate, "class", "implement")) {
      return "error-oop-class";
    } else if (
      includesAny(
        messageTemplate,
        "type",
        "infer",
        "[Symbol",
        "unique symbol",
        "'any'",
        "'null'",
        "'undefined'",
        "'never'",
        "nullish",
        "truthy",
        "truthi",
        "falsy",
        "falsi",
        "'bigint'",
        "primitive",
        "tuple",
        "readonly",
      )
    ) {
      return "error-type-other";
    }
  }

  return (Object.keys(taxonomy).find((key) =>
    (taxonomy[key as keyof typeof taxonomy] as number[]).includes(code),
  ) ?? "error-other") as StarKind;
};

/**
 * case-insensitive
 */
const includesAny = (haystack: string, ...needles: string[]) => {
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
