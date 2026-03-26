import { DeepKeys, Maybe, UnionToTuple } from "../util/type";

type Taxonomy = DeepKeys<typeof taxonomy>;

export const taxonomy = {
  special: {},
  message: {},
  suggestion: {
    type: [7043, 7044, 7045, 7046, 7047, 7048, 7049, 7050],
    language: [80001, 80002, 80003, 80004, 80005, 80009, 80010],
    other: [6385, 6387, 80006, 80007, 80008],
  },
  warning: {},
  error: {
    syntax: {
      async: [1055, 1058, 1059, 1060, 1062, 1064, 1065, 1103, 1106],
      class: [
        1028, 1029, 1030, 1031, 1034, 1047, 1048, 1049, 1051, 1052, 1053, 1054,
      ],
      "control-flow": [
        1035, 1036, 1038, 1039, 1040, 1042, 1044, 1046, 1104, 1105, 1107, 1108,
        1113,
      ],
      function: [
        1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1024, 1025,
      ],
      expression: [1002, 1005, 1109, 1137],
    },
    type: {},
    tsconfig: [1294],
    strict: [1100, 1101, 1102],
  },
} as const;

export const taxonomize = (
  code: number,
  subtaxonomy: object = taxonomy,
): Maybe<Taxonomy> => {
  for (const [key, value] of Object.entries(subtaxonomy)) {
    if (Array.isArray(value)) {
      if (value.includes(code)) {
        return key as Taxonomy;
      } else {
        continue;
      }
    } else {
      const maybe = taxonomize(code, value);
      if (maybe) {
        return maybe;
      } else {
        continue;
      }
    }
  }

  return undefined;
};

export const categories = (
  subtaxonomy: object = taxonomy,
): UnionToTuple<Taxonomy> => {
  const cats = [];
  for (const [key, value] of Object.entries(subtaxonomy)) {
    if (Array.isArray(value)) {
      cats.push(key);
    } else {
      cats.push(key, ...categories(value));
    }
  }

  return cats as UnionToTuple<Taxonomy>;
};
