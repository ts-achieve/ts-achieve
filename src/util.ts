export const log = (...messages: any[]) => {
  console.log(new Date(), ":", "achieve", ...messages);
};

export const isObject = (x: unknown): x is object => {
  return typeof x === "object" && !!x;
};

export const capitalize = <S extends string>(string: S): Capitalize<S> => {
  return (
    string.length ? string[0]!.toLocaleUpperCase() + string.slice(1) : ""
  ) as Capitalize<S>;
};
