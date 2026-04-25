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
  sequence,
  safeKeys,
  DeepKeys,
  LeafValues,
  LeafKeys,
  Flat,
} from "./type";
import { expect } from "chai";

// region number

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

// region list

suite("list", () => {
  suite("`Flat`", () => {
    test("is well-typed", () => {
      test("with no elements", () => {
        expectTypeOf<Flat<[]>>().toEqualTypeOf<[]>();
        expectTypeOf<Flat<[[]]>>().toEqualTypeOf<[]>();
        expectTypeOf<Flat<[[[]]]>>().toEqualTypeOf<[]>();
        expectTypeOf<Flat<[[[[]]]]>>().toEqualTypeOf<[]>();
      });

      test("with one element", () => {
        expectTypeOf<Flat<[0]>>().toEqualTypeOf<[0]>();
        expectTypeOf<Flat<[[0]]>>().toEqualTypeOf<[0]>();
      });

      test("with two elements", () => {
        expectTypeOf<Flat<[0, 1]>>().toEqualTypeOf<[0, 1]>();
        expectTypeOf<Flat<[0, [1]]>>().toEqualTypeOf<[0, 1]>();
        expectTypeOf<Flat<[[0], 1]>>().toEqualTypeOf<[0, 1]>();
        expectTypeOf<Flat<[[0], [1]]>>().toEqualTypeOf<[0, 1]>();
        expectTypeOf<Flat<[[0, 1]]>>().toEqualTypeOf<[0, 1]>();
      });

      test("with three elements", () => {
        expectTypeOf<Flat<[0, 1, 2]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0], 1, 2]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[0, [1], 2]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[0, 1, [2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0], [1], 2]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0], 1, [2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[0, [1], [2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0, 1], 2]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[0, [1, 2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0], [1], [2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0, 1], [2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0], [1, 2]]>>().toEqualTypeOf<[0, 1, 2]>();
        expectTypeOf<Flat<[[0, 1, 2]]>>().toEqualTypeOf<[0, 1, 2]>();
      });
    });
  });

  suite("`tuple`", () => {
    test("is well-typed", () => {
      expectTypeOf<[any, any, any, any]>().toEqualTypeOf<Tuple<4>>();
    });
    test("overflows at 999", () => {
      expectTypeOf<Tuple<998>>().toBeArray();
      // @ts-expect-error
      expectTypeOf<Tuple<999>>().toBeArray();
    });
  });

  suite("`sequence`", () => {
    test("is well-typed", () => {
      expectTypeOf<[0, 1, 2, 3]>().toEqualTypeOf(sequence(4));
    });
    test("is well-valued", () => {
      expect(sequence(0)).deep.equal([]);
      expect(sequence(1)).deep.equal([0]);
      expect(sequence(2)).deep.equal([0, 1]);
      expect(sequence(3)).deep.equal([0, 1, 2]);
    });
  });

  suite("`biject`", () => {
    test("is well-typed", () => {
      expectTypeOf<[never, never, never, never]>().toEqualTypeOf<
        Biject<never, Tuple<4>>
      >();
    });
    test("is well-valued", () => {
      expect(biject([], (x) => x)).deep.equal([]);
      expect(biject([0, 1, 2, 3], (x) => x)).deep.equal([0, 1, 2, 3]);
      expect(biject([0, 1, 2, 3], literal)).deep.equal(["0", "1", "2", "3"]);
    });
  });

  suite("`bijectPrefix`", () => {
    test("is well-typed", () => {
      expectTypeOf<["a0", "a1", "a2", "a3"]>().toEqualTypeOf<
        BijectPrefix<"a", ["0", "1", "2", "3"]>
      >();
    });
    test("is well-valued", () => {
      expect(bijectPrefix("a", ["0", "1", "2", "3"])).deep.equal([
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
});

// region string

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

// region object

suite("object", () => {
  test("`safeKeys`", () => {
    expectTypeOf(safeKeys({})).toEqualTypeOf<[]>();
    expectTypeOf(safeKeys({ a: 1 })).toEqualTypeOf<["a"]>();
    expectTypeOf(safeKeys({ a: 1, b: 2 })).toEqualTypeOf<["a", "b"]>();
    expectTypeOf(safeKeys({ a: 1, b: { c: 2 } })).toEqualTypeOf<["a", "b"]>();
    expectTypeOf(safeKeys({ a: 1, b: { c: 2, d: { e: 3 } } }))
      // prettier-ignore
      .toEqualTypeOf<["a", "b"]>();
  });

  test("`type DeepKeys`", () => {
    expectTypeOf<DeepKeys<{}>>().toEqualTypeOf<never>();
    expectTypeOf<DeepKeys<{ a: 1 }>>().toEqualTypeOf<"a">();
    expectTypeOf<DeepKeys<{ a: 1; b: 2 }>>().toEqualTypeOf<"a" | "b">();
    expectTypeOf<DeepKeys<{ a: 1; b: { c: 2 } }>>()
      // prettier-ignore
      .toEqualTypeOf<"a" | "b" | "c">();
    expectTypeOf<DeepKeys<{ a: 1; b: { c: 2; d: { e: 3 } } }>>()
      // prettier-ignore
      .toEqualTypeOf<"a" | "b" | "c" | "d" | "e">();
  });

  test("`type LeafKeys`", () => {
    expectTypeOf<LeafKeys<{}>>().toEqualTypeOf<never>();
    expectTypeOf<LeafKeys<{ a: 1 }>>().toEqualTypeOf<"a">();
    expectTypeOf<LeafKeys<{ a: 1; b: 2 }>>().toEqualTypeOf<"a" | "b">();
    expectTypeOf<LeafKeys<{ a: 1; b: { c: 2 } }>>()
      // prettier-ignore
      .toEqualTypeOf<"a" | "c">();
    expectTypeOf<LeafKeys<{ a: 1; b: { c: 2; d: { e: 3 } } }>>()
      // prettier-ignore
      .toEqualTypeOf<"a" | "c" | "e">();
  });

  test("`type LeafValues`", () => {
    expectTypeOf<LeafValues<{}>>().toEqualTypeOf<never>();
    expectTypeOf<LeafValues<{ a: 1 }>>().toEqualTypeOf<1>();
    expectTypeOf<LeafValues<{ a: 1; b: 2 }>>().toEqualTypeOf<1 | 2>();
    expectTypeOf<LeafValues<{ a: 1; b: { c: 2 } }>>()
      // prettier-ignore
      .toEqualTypeOf<1 | 2>();
    expectTypeOf<LeafValues<{ a: 1; b: { c: 2; d: { e: 3 } } }>>()
      // prettier-ignore
      .toEqualTypeOf<1 | 2 | 3>();
  });
});
