import child from "child_process";

import { diagnosticMessagesUrl } from "../util/const";
import {
  diagnosticToStar,
  isDiagnosticMessage,
  isTsDiagnostic,
} from "./diagnostic";
import { Star, Starmap } from "./star";

export const curl = (): Starmap => {
  const map = new Map<number, Star>();

  for (const [key, value] of Object.entries(
    JSON.parse(
      child.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }),
    ),
  )) {
    if (isDiagnosticMessage(key) && isTsDiagnostic(value)) {
      map.set(value.code, diagnosticToStar(value, key));
    }
  }

  return map;
};
