import { tsDiagnosticCategories } from "../util/const";
import { diagnosticMessages } from "../util/diagnosticMessages";
import { choose } from "../util/random";
import { computeKind, isTsDiagnostic } from "./diagnostic";
import { expect } from "chai";

export const randomDiagnostic = () => {
  return choose(Object.entries(diagnosticMessages));
};

suite("diagnostic.ts", () => {
  const [message, diagnostic] = randomDiagnostic();

  suite("isTsDiagnostic", () => {
    test("works", () => {
      expect(isTsDiagnostic(diagnostic)).true;
    });
    test("doesn't detect bad error codes", () => {
      expect(isTsDiagnostic({ code: -1, category: "Error" })).true;
    });
    test("does detect bad error categories", () => {
      expect(isTsDiagnostic({ code: 0, category: "" })).false;
    });
  });

  suite("computeKind", () => {
    tsDiagnosticCategories.forEach((category) => {
      test(`\`reportsUnnecessary\` overrides category "${category}"`, () => {
        expect(
          computeKind({
            code: -1,
            category,
            messageTemplate: message,
            reportsUnnecessary: true,
          }),
        ).ok;
      });
    });
  });
});
