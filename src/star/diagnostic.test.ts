import { expectTypeOf } from "expect-type";
import { CodeToMessage, codeToMessage, kindOf } from "./diagnostic";
import assert from "assert";

suite("diagnostic.test.ts", () => {
  test("type check", () => {
    expectTypeOf<
      CodeToMessage<1002>
    >().toEqualTypeOf<"Unterminated string literal.">();
    expectTypeOf(codeToMessage(1003)!).toEqualTypeOf(
      "Identifier expected." as const,
    );
  });
  test("`kindOf`", () => {
    assert.strictEqual(
      kindOf({ code: 1, category: "Error" }),
      "other-suggestion",
    );
  });
});
