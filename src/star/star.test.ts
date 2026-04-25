import { repeat } from "../util/type";
import { randomDiagnostic } from "./diagnostic.test";
import { diagnosticToStar, isStar, isUnlocked } from "./star";
import { expect } from "chai";

const TRIALS = 100;

suite("star.ts", () => {
  repeat(TRIALS, (n) => {
    suite(`diagnosticToStar, ${n + 1} of ${TRIALS}`, () => {
      const [message, diagnostic] = randomDiagnostic();

      const star = diagnosticToStar(diagnostic, message);

      test("returns a star", () => {
        expect(isStar(star)).true;
      });

      test("that is locked", () => {
        expect(isUnlocked(star)).false;
      });

      test("and preserves `code`, `category`, `message`", () => {
        expect(diagnostic.code).equal(star.code);
        expect(diagnostic.category).equal(star.category);
        expect(message).equal(star.messageTemplate);
      });
    });
  });
});
