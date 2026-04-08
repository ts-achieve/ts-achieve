import fs from "fs";
import vscode from "vscode";

import { Maybe } from "../util/type";
import { consoleErr, consoleLog } from "../util/console";

export const readHtml = (uri: vscode.Uri): Maybe<string> => {
  consoleLog("`readHtml` call to", uri);
  try {
    return fs.readFileSync(uri.path, "utf-8");
  } catch (e: any) {
    consoleErr(e.stack);
    return undefined;
  }
};
