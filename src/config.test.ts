import vscode from "vscode";

import { expect } from "chai";
import { names } from "./util/const";
import { subcategorizations, Subcategorize } from "./provider/starlister";

suite("config.ts", () => {
  const config = vscode.workspace.getConfiguration(names.ex);

  test("exists a config", () => {
    expect(config).ok;
  });

  const oldSubcategorize: Subcategorize = config.get(
    names.config.subcategorize,
  )!;

  test("is gettable from", () => {
    expect(subcategorizations).includes(oldSubcategorize);
  });
});
