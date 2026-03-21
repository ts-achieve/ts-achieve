"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Achievement = exports.Statistic = exports.Provider = exports.categories = void 0;
const vscode_1 = __importDefault(require("vscode"));
exports.categories = ["Error", "Message"];
const statistics = ["overall"];
class Provider {
    summary;
    achievements;
    _emitter;
    onDidChangeTreeData;
    constructor(achievements) {
        this.summary = new Map();
        this.achievements = achievements;
        this._emitter = new vscode_1.default.EventEmitter();
        this.onDidChangeTreeData = this._emitter.event;
    }
    get provisions() {
        return this.summary
            .values()
            .toArray()
            .concat(this.achievements.values().toArray());
    }
    refresh() {
        console.log("fire!");
        this._emitter.fire();
    }
    getChildren(element) {
        if (element) {
            return [];
        }
        else {
            console.log(this.achievements);
            return this.achievements.values().toArray();
        }
    }
    getTreeItem(element) {
        return element;
    }
}
exports.Provider = Provider;
class Statistic extends vscode_1.default.TreeItem {
    type;
    _compute;
    constructor(type, compute) {
        super("");
        this.type = type;
        this._compute = compute;
    }
    compute(achievements) {
        this.label = `${this.type}: ${this._compute(achievements)}`;
    }
}
exports.Statistic = Statistic;
class Achievement extends vscode_1.default.TreeItem {
    isAchieved;
    code;
    category;
    _message;
    constructor(message, diagnostic) {
        super(`${diagnostic.code}: ?`);
        this.isAchieved = false;
        this.code = diagnostic.code;
        this.category = diagnostic.category;
        this._message = message;
    }
    achieve() {
        this.isAchieved = true;
        this.label = `${this.code}: ${this._message}`;
    }
    get message() {
        return this.isAchieved ? this._message : "?";
    }
}
exports.Achievement = Achievement;
//# sourceMappingURL=achieve.js.map