import assert from "assert";
import { bottomKinds, deepChildrenOf, getAllKinds } from "./taxonomy";

suite("deep children", () => {
  suite("childless kinds", () => {
    const childlessKinds = [
      "special",
      "message",
      "warning",
      "other",
      "suggestion-type",
      "suggestion-language",
      "suggestion-other",
      "error-async",
      "error-reference",
      "error-other",
      "error-oop-class",
      "error-oop-constructor",
      "error-oop-accessor",
      "error-oop-decorator",
      "error-oop-this",
      "error-oop-other",
    ] as const;
    childlessKinds.forEach((kind) => {
      test(`are correct for \`${kind}\``, () => {
        assert.deepStrictEqual(deepChildrenOf(kind), []);
      });
    });
  });

  test("suggestion", () => {
    assert.deepStrictEqual(deepChildrenOf("suggestion"), [
      "suggestion-type",
      "suggestion-language",
      "suggestion-other",
    ]);
  });
  test("error", () => {
    assert.deepStrictEqual(deepChildrenOf("error"), [
      "error-async",
      "error-reference",
      "error-oop",
      "error-type",
      "error-syntax",
      "error-tsconfig",
      "error-module",
      "error-other",
    ]);
  });
  test("error-oop", () => {
    assert.deepStrictEqual(deepChildrenOf("error-oop"), [
      "error-oop-class",
      "error-oop-constructor",
      "error-oop-accessor",
      "error-oop-decorator",
      "error-oop-this",
      "error-oop-other",
    ]);
  });
});

suite("get all kinds", () => {
  test("get all kinds", () => {
    const kinds = getAllKinds();
    console.log("", kinds, bottomKinds());
    assert.ok(kinds);
  });
});
