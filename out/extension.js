"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = __importDefault(require("vscode"));
const achieve_1 = require("./achieve");
const curl_1 = require("./curl");
const getAchievements = (context) => {
    const maybeMap = context.globalState.get("achievements");
    console.log("maybeMap", maybeMap);
    if (Object.keys(maybeMap ?? {}).length) {
        return maybeMap;
    }
    const definitelyMap = (0, curl_1.curl)(context);
    console.log("definitelyMap", definitelyMap);
    return definitelyMap;
};
function activate(context) {
    console.log("achievements");
    const provider = new achieve_1.Provider(getAchievements(context));
    provider.summary.set("overall", new achieve_1.Statistic("overall", (achievements) => achievements
        .values()
        .filter((achievement) => achievement.isAchieved)
        .toArray().length / achievements.length));
    vscode_1.default.window.registerTreeDataProvider("achievementsList", provider);
    vscode_1.default.workspace.onDidChangeTextDocument((event) => {
        console.log("did change text document");
        const diagnostics = vscode_1.default.languages.getDiagnostics(event.document.uri);
        if (diagnostics.length > 0) {
            console.log("diagnostics length > 0");
            for (let i = 0; i < diagnostics.length; i++) {
                const diagnostic = diagnostics[i];
                const code = diagnostic.code;
                if (typeof code === "number") {
                    console.log('typeof code === "number"');
                    if (!provider.achievements.get(code)?.isAchieved) {
                        console.log("!provider.achievements.has(code)");
                        vscode_1.default.window.showInformationMessage(`Achievement unlocked!\n${diagnostic.code}: ${diagnostic.message}`);
                        provider.achievements.get(code).achieve();
                        provider.refresh();
                    }
                }
            }
        }
    });
    vscode_1.default.commands.registerCommand("achievements.refresh", () => {
        console.log("refreshing");
        provider.refresh();
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map