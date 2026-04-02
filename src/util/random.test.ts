import assert from "assert";
import { randomObject, randomString } from "./random";

suite("random", () => {
  test("string", () => {
    const s = randomString();
    assert.ok(s.length >= 1);
  });
  test("object", () => {
    const o = randomObject();
    assert.ok(
      Object.getOwnPropertyNames(o).length +
        Object.getOwnPropertySymbols(o).length >=
        1,
    );
  });
});
