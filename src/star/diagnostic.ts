import { tsDiagnosticCategories } from "../util/const";
import { includesAny, isObject, Maybe } from "../util/type";
import { Star } from "./star";
import { StarKind, taxonomy } from "./taxonomy";

type TsDiagnosticCategory = (typeof tsDiagnosticCategories)[number];

export type TsDiagnostic = {
  code: number;
  category: TsDiagnosticCategory;
  reportsUnnecessary?: boolean;
};

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
    } else if (includesAny(messageTemplate, "unused", "never used")) {
      return "error-syntax-declaration";
    } else if (includesAny(messageTemplate, "'using'")) {
      return "error-other";
    } else if (includesAny(messageTemplate, "JSDoc")) {
      return "error-javascript-jsdoc";
    } else if (
      includesAny(messageTemplate, "JavaScript", "in TypeScript files")
    ) {
      return "error-javascript-other";
    } else if (includesAny(messageTemplate, "strict mode", "use strict")) {
      return "error-tsconfig-strict mode";
    } else if (
      includesAny(
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
      includesAny(messageTemplate, "--", "compile", "build", "watch")
    ) {
      return "error-tsconfig-build";
    } else if (includesAny(messageTemplate, "jsx", "JSX", "tsx", "TSX")) {
      return "error-react";
    } else if (includesAny(messageTemplate, "promis")) {
      return "error-asynchronous-promise";
    } else if (includesAny(messageTemplate, "async", "await")) {
      return "error-asynchronous-async/await";
    } else if (includesAny(messageTemplate, "overload")) {
      return "error-syntax-function";
    } else if (includesAny(messageTemplate, "namespac")) {
      return "error-module-namespace";
    } else if (includesAny(messageTemplate, "import")) {
      return "error-module-import";
    } else if (includesAny(messageTemplate, "export")) {
      return "error-module-export";
    } else if (includesAny(messageTemplate, "module")) {
      return "error-module-other";
    } else if (
      includesAny(messageTemplate, "circular", "stack", "cyclic", "excessive")
    ) {
      return "error-type-recursion";
    } else if (includesAny(messageTemplate, "generic")) {
      return "error-type-generic";
    } else if (includesAny(messageTemplate, "assert")) {
      return "error-type-assertion";
    } else if (includesAny(messageTemplate, "interface")) {
      return "error-type-interface";
    } else if (
      includesAny(
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
      includesAny(
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
    } else if (includesAny(messageTemplate, "keyword", "reserved")) {
      return "error-syntax-keyword";
    } else if (
      includesAny(messageTemplate, "regular expression", "character class")
    ) {
      return "error-syntax-regex";
    } else if (includesAny(messageTemplate, "abstract")) {
      return "error-oop-abstract";
    } else if (
      includesAny(messageTemplate, "'get'", "getter", "get accessor") &&
      !includesAny(messageTemplate, "'set'", "setter", "set accessor")
    ) {
      return "error-oop-accessor-getter";
    } else if (
      includesAny(messageTemplate, "'set'", "setter", "set accessor") &&
      !includesAny(messageTemplate, "'get'", "getter", "get accessor")
    ) {
      return "error-oop-accessor-setter";
    } else if (includesAny(messageTemplate, "accessor")) {
      return "error-oop-accessor-other";
    } else if (includesAny(messageTemplate, "super")) {
      return "error-oop-instance-super";
    } else if (includesAny(messageTemplate, "'this'")) {
      return "error-oop-instance-this";
    } else if (includesAny(messageTemplate, "decorat")) {
      return "error-oop-decorator";
    } else if (includesAny(messageTemplate, "static")) {
      return "error-oop-static";
    } else if (includesAny(messageTemplate, "'new'", "construct")) {
      return "error-oop-constructor";
    } else if (
      includesAny(messageTemplate, "private", "protected", "accessi")
    ) {
      return "error-oop-accessibility";
    } else if (includesAny(messageTemplate, "override")) {
      return "error-oop-inheritance-override";
    } else if (
      includesAny(messageTemplate, "class", "extend", "implement") &&
      !includesAny(messageTemplate, "type", "implementation")
    ) {
      return "error-oop-inheritance-other";
    } else if (
      includesAny(
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
      includesAny(messageTemplate, "a type annotation", "implicitly")
    ) {
      return "error-type-inference";
    } else if (includesAny(messageTemplate, "enum")) {
      return "error-type-enum";
    } else if (includesAny(messageTemplate, "assign", "missing")) {
      return "error-type-assignment";
    } else if (includesAny(messageTemplate, "symbol'")) {
      return "error-type-primitive-symbol";
    } else if (includesAny(messageTemplate, "literal")) {
      return "error-type-primitive-string";
    } else if (includesAny(messageTemplate, "index signature")) {
      return "error-type-primitive-object";
    } else if (includesAny(messageTemplate, "function", "return", "call")) {
      return "error-type-primitive-function";
    } else if (
      includesAny(messageTemplate, "'null'", "'undefined'", "nullish", "fals")
    ) {
      return "error-type-primitive-falsy";
    } else if (includesAny(messageTemplate, "primitiv")) {
      return "error-type-primitive-other";
    } else if (
      includesAny(
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
    } else if (includesAny(messageTemplate, "declar")) {
      return "error-syntax-declaration";
    } else if (includesAny(messageTemplate, "find")) {
      return "error-reference";
    }
  }

  return "error-other";
};
