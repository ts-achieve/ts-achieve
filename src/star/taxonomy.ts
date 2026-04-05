import {
  bijectPrefix,
  DeepKeys,
  DeepValues,
  join,
  not,
  safeConcat,
  safeKeys,
  split,
} from "../util/type";

type Level = {
  leaves: string[];
  branches: Record<string, Level>;
};

type VerboseStarName<
  S extends string = DeepValues<typeof hierarchy>[number],
  T extends Level = typeof hierarchy,
  P extends string = "",
> = S extends any
  ? S extends T["leaves"][number]
    ? P extends ""
      ? S | "other"
      : `${P}-${S | "other"}`
    : keyof T["branches"] extends infer K extends keyof T["branches"] & string
      ? K extends any
        ? P extends ""
          ? VerboseStarName<S, T["branches"][K], K>
          : VerboseStarName<S, T["branches"][K], `${P}-${K}`>
        : never
      : never
  : never;

type VerbosePathName<
  T extends Level = typeof hierarchy,
  P extends string = "",
> = keyof T["branches"] extends never
  ? never
  : keyof T["branches"] extends infer K extends keyof T["branches"] & string
    ? K extends any
      ? P extends ""
        ? K | VerbosePathName<T["branches"][K], K>
        : `${P}-${K}` | VerbosePathName<T["branches"][K], `${P}-${K}`>
      : never
    : never;

export type ConciseName = {} & (
  | DeepKeys<typeof hierarchy>
  | DeepValues<typeof hierarchy>[number]
);

export type VerboseName = VerbosePathName | VerboseStarName;

export const hierarchy = {
  leaves: ["special", "warning"],
  branches: {
    suggestion: {
      leaves: ["type", "language"],
      branches: {},
    },
    error: {
      leaves: ["async", "react", "reference"],
      branches: {
        oop: {
          leaves: [
            "class",
            "abstract",
            "constructor",
            "accessor",
            "accessibility",
            "decorator",
            "this",
          ],
          branches: {},
        },
        type: {
          leaves: ["interface", "assert"],
          branches: {},
        },
        syntax: {
          leaves: [
            "declaration",
            "expression",
            "statement",
            "function",
            "regex",
            "keyword",
          ],
          branches: {},
        },
        tsconfig: {
          leaves: ["strict", "compiler"],
          branches: {},
        },
        module: {
          leaves: ["port", "namespace"],
          branches: {},
        },
      },
    },
  },
} as const satisfies Level;

export const taxonomy = {
  "suggestion-type": [7043, 7044, 7045, 7046, 7047, 7048, 7049, 7050],
  "suggestion-language": [80001, 80002, 80003, 80004, 80005, 80009, 80010],
  "suggestion-other": [6385, 6387, 80006, 80007, 80008],
  "error-syntax-expression": [
    1002, 1003, 1005, 1009, 1010, 1012, 1109, 1121, 1124, 1125, 1126, 1127,
    1132, 1135, 1137, 1140, 1141, 1160, 1161, 1177, 1178, 1180, 1181, 1182,
    1186, 1198, 1199, 1200, 1257, 1260, 1265, 1266, 1327, 1351, 1352, 1353,
    1381, 1382, 1477, 1478, 1487, 1488, 1489,
  ],
  "error-syntax-regex": [
    1499, 1500, 1502, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512,
    1513, 1514, 1515, 1516, 1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524,
    1525, 1526, 1527, 1528, 1529, 1530, 1531, 1532, 1533, 1534, 1535, 1536,
    1537, 1538,
  ],
  "error-syntax-statement": [
    1035, 1036, 1038, 1039, 1040, 1042, 1044, 1046, 1104, 1105, 1107, 1108,
    1113, 1115, 1116, 1128, 1129, 1130, 1134, 1136, 1138, 1139, 1142, 1144,
    1145, 1146, 1472, 1163, 1185, 1188, 1189, 1190, 1196, 1197, 1221, 1313,
    1344, 2410,
  ],
  "error-syntax-function": [
    1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1024, 1025,
    2349,
  ],
  "error-reference": [2339, 2551],
} as const satisfies Partial<Record<VerboseStarName, number[]>>;

export const getAllKinds = (
  currentKinds: VerboseName[] = deepChildrenOf(),
): VerboseName[] => {
  if (
    currentKinds.length > 1 ||
    (currentKinds.length > 0 && currentKinds[0] !== "other")
  ) {
    return currentKinds.concat(
      ...currentKinds.map((kind) => getAllKinds(deepChildrenOf(kind))),
    );
  } else {
    return currentKinds;
  }
};

export const hasChildren = (name: VerboseName) => {
  return deepChildrenOf(name).length > 0;
};

export const deepChildrenOf = (
  parent: string = "",
  level: Level = hierarchy,
): VerboseName[] => {
  const [first, ...rest] = split(parent, "-");
  const prefix = first!;
  const suffix = join(rest, "-");

  if (parent === "other" || level.leaves.includes(prefix)) {
    return [];
  } else if (Object.keys(level.branches).includes(prefix)) {
    const deepChildren = deepChildrenOf(suffix, level.branches[prefix]);
    if (deepChildren.length > 0 && !deepChildren[0]!.includes("-")) {
      deepChildren.push("other");
    }
    return deepChildren.map((child) => `${prefix}-${child}`) as VerboseName[];
  } else {
    return level.leaves.concat(Object.keys(level.branches)) as VerboseName[];
  }
};

export const pathKinds = () => getAllKinds().filter(hasChildren);

export const bottomKinds = () => getAllKinds().filter(not(hasChildren));

export const topKinds = () =>
  safeConcat(hierarchy.leaves, safeKeys(hierarchy.branches));

export const suggestionKinds = () =>
  bijectPrefix("suggestion-", andOther(hierarchy.branches.suggestion.leaves));

const andOther = <T extends readonly string[]>(xs: T) => {
  return [...xs, "other"] as const;
};

export const errorStarKinds = () =>
  bottomKinds().filter((kind) => kind.startsWith("error-"));

export type PathKind = VerbosePathName;
export type StarKind = VerboseStarName;

type ErrorStarKind = StarKind extends infer K extends StarKind
  ? K extends `error-${any}`
    ? K
    : never
  : never;

export const isErrorStarKind = (x: string): x is ErrorStarKind => {
  return errorStarKinds().includes(x as any);
};
