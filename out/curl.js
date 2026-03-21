"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.curl = void 0;
const child_process_1 = __importDefault(require("child_process"));
const achieve_1 = require("./achieve");
const isObject = (x) => {
    return typeof x === "object" && !!x;
};
const isDiagnosticMessage = (x) => {
    return (isObject(x) &&
        "category" in x &&
        achieve_1.categories.includes(x.category) &&
        "code" in x &&
        typeof x.code === "number");
};
const diagnosticMessagesUrl = "https://raw.githubusercontent.com/microsoft/TypeScript/refs/heads/main/src/compiler/diagnosticMessages.json";
const curl = (context) => {
    const parse = JSON.parse(child_process_1.default.execSync(`curl ${diagnosticMessagesUrl}`, { encoding: "utf8" }));
    const map = new Map();
    for (const [key, value] of Object.entries(parse)) {
        if (isDiagnosticMessage(value)) {
            map.set(value.code, new achieve_1.Achievement(key, value));
        }
    }
    context.globalState.update("achievements", map);
    return map;
};
exports.curl = curl;
//# sourceMappingURL=curl.js.map