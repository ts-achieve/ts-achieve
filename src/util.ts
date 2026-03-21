export const log = (...messages: any[]) => {
  console.log(`achieved on ${new Date().toLocaleTimeString()}:`, ...messages);
};

export const isObject = (x: unknown): x is object => {
  return typeof x === "object" && !!x;
};

export const capitalize = <S extends string>(string: S): Capitalize<S> => {
  return (
    string.length ? string[0]!.toLocaleUpperCase() + string.slice(1) : ""
  ) as Capitalize<S>;
};

export const uncapitalize = <S extends string>(string: S): Uncapitalize<S> => {
  return (
    string.length ? string[0]!.toLocaleLowerCase() + string.slice(1) : ""
  ) as Uncapitalize<S>;
};
