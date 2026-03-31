import { powerOfTen, safeConcat, sequence, Tuple } from "../util/type";
import { isUnlocked, Starmap } from "./star";

type SpecialStar = {
  name: string;
  description: string;
  condition: (starmap: Starmap) => boolean;
};

export const loadSpecialStars = () => {
  return safeConcat(encounterStars(), milestoneStars());
};

const encounterStars = (): Tuple<7, SpecialStar> =>
  sequence(7, (n) => {
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

const milestoneStars = (): Tuple<7, SpecialStar> =>
  sequence(7, (n) => {
    const milestone = powerOfTen(n);
    return {
      name: `${milestone} stars`,
      description: `At least ${milestone} achievements are unlocked.`,
      condition: (starmap: Starmap) => {
        return (
          starmap.values().toArray().filter(isUnlocked).length >= milestone
        );
      },
    } as const;
  });
