import { powerOfTen, sequence } from "../util/type";
import { isUnlocked, Starmap } from "./star";

type SpecialStar = {
  name: string;
  description: string;
  condition: (starmap: Starmap) => boolean;
};

const loadSpecialStars = () => {
  return;
};

const encounterStars = sequence(7, (n) => {
  const milestone = powerOfTen(n);
  return {
    name: `${milestone} encounters`,
    description: `At least ${milestone} achievements are encountered.`,
    condition: (starmap: Starmap) => {
      return (
        starmap
          .values()
          .toArray()
          .reduce(
            (sum, star) => sum + (isUnlocked(star) ? star.encounterCount : 0),
            0,
          ) >= milestone
      );
    },
  } as const;
});

const milestoneStars = sequence(7, (n) => {
  const milestone = powerOfTen(n);
  return {
    name: `${milestone} stars`,
    description: `At least ${milestone} achievements are unlocked.`,
    condition: (starmap: Starmap) => {
      return starmap.values().toArray().filter(isUnlocked).length >= milestone;
    },
  } as const;
});
