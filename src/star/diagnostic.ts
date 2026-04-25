import { tsDiagnosticCategories } from "../util/const";
import { insensitivelyIncludesAny, isObject, Maybe } from "../util/type";
import { Star } from "./star";
import { StarKind, taxonomy } from "./taxonomy";

type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export interface TsDiagnostic {
  code: number;
  category: TsDiagnosticCategory;
  reportsUnnecessary?: boolean;
}

export const isTsDiagnostic = (x: unknown): x is TsDiagnostic => {
  return (
    isObject(x) &&
    "category" in x &&
    tsDiagnosticCategories.includes(x.category as any) &&
    "code" in x &&
    typeof x.code === "number"
  );
};

export const computeKind = ({
  code,
  category,
  reportsUnnecessary,
  messageTemplate,
}: Omit<Star, "kind">): StarKind => {
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
    const taxonomization = Object.keys(taxonomy).find((key) =>
      (taxonomy[key as keyof typeof taxonomy] as number[]).includes(code),
    ) as Maybe<StarKind>;

    if (taxonomization) {
      return taxonomization;
    } else if (insensitivelyIncludesAny(messageTemplate, "unused", "never used")) {
      return "error-syntax-declaration";
    } else if (insensitivelyIncludesAny(messageTemplate, "'using'")) {
      return "error-other";
    } else if (insensitivelyIncludesAny(messageTemplate, "JSDoc")) {
      return "error-javascript-jsdoc";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "JavaScript", "in TypeScript files")
    ) {
      return "error-javascript-other";
    } else if (insensitivelyIncludesAny(messageTemplate, "strict mode", "use strict")) {
      return "error-tsconfig-strict mode";
    } else if (
      insensitivelyIncludesAny(
        messageTemplate,
        "tsconfig",
        "'jsx",
        "'module'",
        "'target'",
        "'exclude'",
        "'include'",
        "noEmit",
        "baseUrl",
        "rootDir",
        "allowJs",
        "composite",
        "esModuleInterop",
        "isolatedModules",
        "moduleResolution",
        "preserveConstEnums",
        "verbatimModuleSyntax",
        "erasableSyntaxOnly",
        "exactOptionalPropertyTypes",
        "allowImportingTsExtensions",
      )
    ) {
      return "error-tsconfig-other";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "--", "compile", "build", "watch")
    ) {
      return "error-tsconfig-build";
    } else if (insensitivelyIncludesAny(messageTemplate, "jsx", "JSX", "tsx", "TSX")) {
      return "error-react";
    } else if (insensitivelyIncludesAny(messageTemplate, "promis")) {
      return "error-asynchronous-promise";
    } else if (insensitivelyIncludesAny(messageTemplate, "async", "await")) {
      return "error-asynchronous-async/await";
    } else if (insensitivelyIncludesAny(messageTemplate, "overload")) {
      return "error-syntax-function";
    } else if (insensitivelyIncludesAny(messageTemplate, "namespac")) {
      return "error-module-namespace";
    } else if (insensitivelyIncludesAny(messageTemplate, "import")) {
      return "error-module-import";
    } else if (insensitivelyIncludesAny(messageTemplate, "export")) {
      return "error-module-export";
    } else if (insensitivelyIncludesAny(messageTemplate, "module")) {
      return "error-module-other";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "circular", "stack", "cyclic", "excessive")
    ) {
      return "error-type-recursion";
    } else if (insensitivelyIncludesAny(messageTemplate, "generic")) {
      return "error-type-generic";
    } else if (insensitivelyIncludesAny(messageTemplate, "assert")) {
      return "error-type-assertion";
    } else if (insensitivelyIncludesAny(messageTemplate, "interface")) {
      return "error-type-interface";
    } else if (
      insensitivelyIncludesAny(
        messageTemplate,
        "switch",
        "case",
        "'break'",
        "'continue'",
        "'return'",
        "'yield'",
        "left-hand",
      )
    ) {
      return "error-syntax-statement";
    } else if (
      insensitivelyIncludesAny(
        messageTemplate,
        "expression",
        "token",
        "destructur",
        "rest",
        "unicode",
        "opera",
      )
    ) {
      return "error-syntax-expression";
    } else if (insensitivelyIncludesAny(messageTemplate, "keyword", "reserved")) {
      return "error-syntax-keyword";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "regular expression", "character class")
    ) {
      return "error-syntax-regex";
    } else if (insensitivelyIncludesAny(messageTemplate, "abstract")) {
      return "error-oop-abstract";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "'get'", "getter", "get accessor") &&
      !insensitivelyIncludesAny(messageTemplate, "'set'", "setter", "set accessor")
    ) {
      return "error-oop-accessor-getter";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "'set'", "setter", "set accessor") &&
      !insensitivelyIncludesAny(messageTemplate, "'get'", "getter", "get accessor")
    ) {
      return "error-oop-accessor-setter";
    } else if (insensitivelyIncludesAny(messageTemplate, "accessor")) {
      return "error-oop-accessor-other";
    } else if (insensitivelyIncludesAny(messageTemplate, "super")) {
      return "error-oop-instance-super";
    } else if (insensitivelyIncludesAny(messageTemplate, "'this'")) {
      return "error-oop-instance-this";
    } else if (insensitivelyIncludesAny(messageTemplate, "decorat")) {
      return "error-oop-decorator";
    } else if (insensitivelyIncludesAny(messageTemplate, "static")) {
      return "error-oop-static";
    } else if (insensitivelyIncludesAny(messageTemplate, "'new'", "construct")) {
      return "error-oop-constructor";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "private", "protected", "accessi")
    ) {
      return "error-oop-accessibility";
    } else if (insensitivelyIncludesAny(messageTemplate, "override")) {
      return "error-oop-inheritance-override";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "class", "extend", "implement") &&
      !insensitivelyIncludesAny(messageTemplate, "type", "implementation")
    ) {
      return "error-oop-inheritance-other";
    } else if (
      insensitivelyIncludesAny(
        messageTemplate,
        "array",
        "tuple",
        "readonly",
        "read-only",
        "iterator",
      )
    ) {
      return "error-type-array";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "a type annotation", "implicitly")
    ) {
      return "error-type-inference";
    } else if (insensitivelyIncludesAny(messageTemplate, "enum")) {
      return "error-type-enum";
    } else if (insensitivelyIncludesAny(messageTemplate, "assign", "missing")) {
      return "error-type-assignment";
    } else if (insensitivelyIncludesAny(messageTemplate, "symbol'")) {
      return "error-type-primitive-symbol";
    } else if (insensitivelyIncludesAny(messageTemplate, "literal")) {
      return "error-type-primitive-string";
    } else if (insensitivelyIncludesAny(messageTemplate, "index signature")) {
      return "error-type-primitive-object";
    } else if (insensitivelyIncludesAny(messageTemplate, "function", "return", "call")) {
      return "error-type-primitive-function";
    } else if (
      insensitivelyIncludesAny(messageTemplate, "'null'", "'undefined'", "nullish", "fals")
    ) {
      return "error-type-primitive-falsy";
    } else if (insensitivelyIncludesAny(messageTemplate, "primitiv")) {
      return "error-type-primitive-other";
    } else if (
      insensitivelyIncludesAny(
        messageTemplate,
        "type",
        "bigint",
        "infer",
        "[Symbol",
        "'any'",
        "'never'",
        "truth",
        "assign",
      )
    ) {
      return "error-type-other";
    } else if (insensitivelyIncludesAny(messageTemplate, "declar")) {
      return "error-syntax-declaration";
    } else if (insensitivelyIncludesAny(messageTemplate, "find")) {
      return "error-reference";
    }
  }

  return "error-other";
};
