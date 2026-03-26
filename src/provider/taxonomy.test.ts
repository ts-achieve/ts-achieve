import { categories, taxonomize } from "./taxonomy";

const suite = (name: string, f: () => void) => {
  console.log("- suite:", name);
  f();
};

const test = (name: string, f: () => void) => {
  console.log("  - test:", name);
  f();
};

export const testsuite = () => {
  console.log("Running tests…");
  suite("provider/taxonomy", () => {
    test("categories", () => {
      console.log(categories());
      console.log(taxonomize(7046));
      console.log(taxonomize(80004));
      console.log(taxonomize(6387));
      console.log(taxonomize(1103));
    });
  });
};
