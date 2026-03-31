import { categories, taxonomize } from "./taxonomy";

suite("provider/taxonomy", () => {
  test("categories", () => {
    console.log(categories());
    console.log(taxonomize(7046));
    console.log(taxonomize(80004));
    console.log(taxonomize(6387));
    console.log(taxonomize(1103));
  });
});
