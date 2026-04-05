import { expectTypeOf } from "expect-type";
import {
  biject,
  Biject,
  bijectPrefix,
  BijectPrefix,
  GreaterOf,
  greaterOf,
  Length,
  length,
  literal,
  Max,
  max,
  RightPad,
  rightpad,
  succeed,
  Successor,
  Tuple,
  tuple,
} from "./type";
import assert from "assert";

suite("`succeed`", () => {
  test("is well-typed", () => {
    expectTypeOf<1>().toEqualTypeOf<Successor<0>>();
    expectTypeOf<1>().toEqualTypeOf(succeed(0));
    expectTypeOf<2>().toEqualTypeOf<Successor<1>>();
    expectTypeOf<2>().toEqualTypeOf(succeed(1));
    expectTypeOf<3>().toEqualTypeOf<Successor<2>>();
    expectTypeOf<3>().toEqualTypeOf(succeed(2));
    expectTypeOf<4>().toEqualTypeOf<Successor<3>>();
    expectTypeOf<4>().toEqualTypeOf(succeed(3));
  });
});

suite("`greaterOf`", () => {
  test("is well-typed", () => {
    expectTypeOf<0>().toEqualTypeOf<GreaterOf<0, 0>>();
    expectTypeOf<0>().toEqualTypeOf(greaterOf(0, 0));
    expectTypeOf<1>().toEqualTypeOf<GreaterOf<0, 1>>();
    expectTypeOf<1>().toEqualTypeOf(greaterOf(0, 1));
    expectTypeOf<1>().toEqualTypeOf<GreaterOf<1, 0>>();
    expectTypeOf<1>().toEqualTypeOf(greaterOf(1, 0));
    expectTypeOf<1>().toEqualTypeOf<GreaterOf<1, 1>>();
    expectTypeOf<1>().toEqualTypeOf(greaterOf(1, 1));
  });
});

suite("`max`", () => {
  test("is well-typed", () => {
    expectTypeOf<0>().toEqualTypeOf<Max<[0, 0, 0, 0]>>();
    expectTypeOf<0>().toEqualTypeOf(max(0, 0, 0, 0));
    expectTypeOf<3>().toEqualTypeOf<Max<[0, 1, 2, 3]>>();
    expectTypeOf<3>().toEqualTypeOf(max(0, 1, 2, 3));
    expectTypeOf<3>().toEqualTypeOf<Max<[3, 2, 1, 0]>>();
    expectTypeOf<3>().toEqualTypeOf(max(3, 2, 1, 0));
    expectTypeOf<3>().toEqualTypeOf<Max<[0, 1, 2, 3, 2, 1, 0]>>();
    expectTypeOf<3>().toEqualTypeOf(max(0, 1, 2, 3, 2, 1, 0));
  });
  test("splits on unions", () => {
    expectTypeOf<5>().toEqualTypeOf<Max<[0 | 3, 1 | 4, 2 | 5]>>();
  });
});

suite("`tuple`", () => {
  test("is well-typed", () => {
    expectTypeOf<[any, any, any, any]>().toEqualTypeOf<Tuple<4>>();
    expectTypeOf<[number, number, number, number]>().toEqualTypeOf(tuple(4));
  });
  test("is well-valued", () => {
    assert.deepStrictEqual(tuple(0), []);
    assert.deepStrictEqual(tuple(1), [0]);
    assert.deepStrictEqual(tuple(2), [0, 1]);
    assert.deepStrictEqual(tuple(3), [0, 1, 2]);
  });
});

suite("`biject`", () => {
  test("is well-typed", () => {
    expectTypeOf<[never, never, never, never]>().toEqualTypeOf<
      Biject<never, Tuple<4>>
    >();
  });
  test("is well-valued", () => {
    assert.deepStrictEqual(
      biject([], (x) => x),
      [],
    );
    assert.deepStrictEqual(
      biject([0, 1, 2, 3], (x) => x),
      [0, 1, 2, 3],
    );
    assert.deepStrictEqual(biject([0, 1, 2, 3], literal), ["0", "1", "2", "3"]);
  });
});

suite("`bijectPrefix`", () => {
  test("is well-typed", () => {
    expectTypeOf<["a0", "a1", "a2", "a3"]>().toEqualTypeOf<
      BijectPrefix<"a", ["0", "1", "2", "3"]>
    >();
  });
  test("is well-valued", () => {
    assert.deepStrictEqual(bijectPrefix("a", ["0", "1", "2", "3"]), [
      "a0",
      "a1",
      "a2",
      "a3",
    ]);
  });
});

suite("`length`", () => {
  test("is well-typed", () => {
    expectTypeOf<0>().toEqualTypeOf<Length<"">>();
    expectTypeOf<0>().toEqualTypeOf(length(""));
    expectTypeOf<1>().toEqualTypeOf<Length<" ">>();
    expectTypeOf<1>().toEqualTypeOf(length(" "));
    expectTypeOf<2>().toEqualTypeOf<Length<"  ">>();
    expectTypeOf<2>().toEqualTypeOf(length("  "));
    expectTypeOf<3>().toEqualTypeOf<Length<"   ">>();
    expectTypeOf<3>().toEqualTypeOf(length("   "));
  });
});

suite("`rightpad`", () => {
  test("is well-typed", () => {
    expectTypeOf<"">().toEqualTypeOf<RightPad<"", 0>>();
    expectTypeOf<"">().toEqualTypeOf(rightpad("", 0));
    expectTypeOf<"aaaa">().toEqualTypeOf<RightPad<"", 4, "a">>();
    expectTypeOf<"aaaa">().toEqualTypeOf(rightpad("", 4, "a"));
    expectTypeOf<"abab">().toEqualTypeOf<RightPad<"", 4, "ab">>();
    expectTypeOf<"abab">().toEqualTypeOf(rightpad("", 4, "ab"));
    expectTypeOf<"abcdefgh">().toEqualTypeOf<RightPad<"abcdefgh", 4>>();
    expectTypeOf<"abcdefgh">().toEqualTypeOf(rightpad("abcdefgh", 4));
  });
});
