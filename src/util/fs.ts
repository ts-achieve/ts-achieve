import fs from "fs";
import vscode from "vscode";

import { Maybe } from "./type";
import { consoleErr, consoleLog } from "./console";

export const readFromUri = (uri: vscode.Uri): Maybe<string> => {
  consoleLog("`readFromUri` call to", uri);
  try {
    return fs.readFileSync(uri.path, "utf-8");
  } catch (e: any) {
    consoleErr(e.stack);
    return undefined;
  }
};
