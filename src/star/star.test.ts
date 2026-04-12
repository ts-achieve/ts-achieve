import { randomDiagnostic } from "./diagnostic.test";
import { diagnosticToStar, isStar, isUnlocked } from "./star";
import { expect } from "chai";

suite("star.ts", () => {
  const [message, diagnostic] = randomDiagnostic();

  const star = diagnosticToStar(diagnostic, message);

  suite("diagnosticToStar", () => {
    test("embeds", () => {
      expect(star).an("object");
      expect(diagnostic).deep.equal({
        code: star.code,
        category: star.category,
      });
      expect(message).equal(star.messageTemplate);
    });

    test("returns a star", () => {
      expect(isStar(star)).true;
    });

    test("returns a locked star", () => {
      expect(isUnlocked(star)).false;
    });
  });
});
