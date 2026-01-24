"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const axios = require("axios");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const taskProvider_1 = require("./taskProvider");
function activate(context) {
    const workspaceRoot = vscode.workspace.rootPath;
    if (!workspaceRoot) {
        return;
    }
    const hugo = new Hugo(workspaceRoot);
    if (!hugo.isHugoFolder()) {
        return;
    }
    const taskProvider = new taskProvider_1.TaskProvider();
    vscode.tasks.registerTaskProvider("hugo", taskProvider);
    let version = vscode.commands.registerCommand("hugo.version", () => {
        hugo.version().then((v) => {
            vscode.window.showInformationMessage("Local version: " + v);
        });
    });
    let createContent = vscode.commands.registerCommand("hugo.createContent", () => {
        vscode.window.showQuickPick(hugo.sections()).then((sectionName) => {
            if (!sectionName) {
                return;
            }
            vscode.window.showInputBox({ placeHolder: `Create content in "${sectionName}"` }).then((fileName) => {
                if (!fileName) {
                    return;
                }
                let fullFileName = path.join(sectionName, fileName.replace(/ /g, "-") + ".md");
                hugo.new(fullFileName).then((p) => {
                    // commands.executeCommand<void>("vscode.open", right, opts);
                    vscode.window.showTextDocument(vscode.Uri.parse("file://" + p));
                });
            });
        });
    });
    let remoteVersion = vscode.commands.registerCommand("hugo.remoteVersion", () => {
        hugo.remoteVersion().then((v) => {
            vscode.window.showInformationMessage("Remote version: " + v);
        });
    });
    let fromArchetype = vscode.commands.registerCommand("hugo.fromarchetype", () => {
        vscode.window.showQuickPick(hugo.archetypes()).then((archetypeName) => {
            if (!archetypeName) {
                return;
            }
            let fromFile = archetypeName.endsWith(".md");
            let sectionName = fromFile ? archetypeName.substring(0, archetypeName.length - 3) : archetypeName;
            vscode.window.showInputBox({ placeHolder: `Create "${archetypeName}" in "${sectionName}"` }).then((fileName) => {
                if (!fileName) {
                    return;
                }
                let fullFileName = path.join(sectionName, fileName.replace(/ /g, "-"));
                if (fromFile) {
                    if (!fullFileName.endsWith(".md")) {
                        fullFileName += ".md";
                    }
                    hugo.new(fullFileName).then((p) => {
                        let indexFile = "file://" + p;
                        vscode.window.showTextDocument(vscode.Uri.parse(indexFile));
                    });
                }
                else {
                    hugo.new(fullFileName, ["--kind", archetypeName]).then((p) => {
                        let indexFile = "file://" + p + "/index.md";
                        vscode.window.showTextDocument(vscode.Uri.parse(indexFile));
                    });
                }
            });
        });
    });
    context.subscriptions.push(version);
    context.subscriptions.push(createContent);
    context.subscriptions.push(remoteVersion);
    context.subscriptions.push(fromArchetype);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
class Hugo {
    constructor(projectRoot, serverProcess) {
        this.projectRoot = projectRoot;
        this.serverProcess = serverProcess;
    }
    runServer() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO run server, config option;
            if (this.serverProcess) {
                return this;
            }
            let { process } = yield this.run("server", ["--buildDrafts"]);
            return new Hugo(this.projectRoot, process);
        });
    }
    isHugoFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield exists("config.toml")) || exists("config.yaml") || exists("config.json");
        });
    }
    remoteVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield axios.default.get("https://github.com/gohugoio/hugo/releases/latest");
            return path.basename(response.request.path);
        });
    }
    stopServer() {
        if (!this.serverProcess) {
            return this;
        }
        this.serverProcess.kill("SIGTERM");
        return new Hugo(this.projectRoot);
    }
    version() {
        return __awaiter(this, void 0, void 0, function* () {
            let { stdout } = yield this.spawn("version");
            let matched = stdout.match(/v[0-9.]*/);
            if (matched) {
                return matched[0];
            }
            throw new Error(`Version not found in ${stdout}`);
        });
    }
    new(p, flag = []) {
        return __awaiter(this, void 0, void 0, function* () {
            this.spawn("new", flag.concat([p]));
            return this.projectRoot + "/content/" + p;
        });
    }
    sections() {
        let contentFolder = path.join(this.projectRoot, "content/");
        return walk(contentFolder).map((item) => item.replace(contentFolder, ""));
    }
    archetypes() {
        let archetypes = path.join(this.projectRoot, "archetypes/");
        return walk(archetypes, false, false).map((item) => item.replace(archetypes, ""));
    }
    spawn(command = "", args = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {};
            if (this.projectRoot !== "") {
                options.cwd = this.projectRoot;
            }
            return yield exec(["hugo", command].concat(args).join(" "), options);
        });
    }
    run(command = "", args = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {};
            if (this.projectRoot !== "") {
                options.cwd = this.projectRoot;
            }
            return yield run(["hugo", command].concat(args).join(" "), options);
        });
    }
}
function exec(command, options) {
    return new Promise((resolve, reject) => {
        cp.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                // todo enable debug
                vscode.window.showErrorMessage(stderr);
                reject({ error, stdout, stderr });
            }
            resolve({ stdout, stderr });
        });
    });
}
function run(command, options) {
    return new Promise((resolve, reject) => {
        let process = cp.exec(command, options);
        process.on("error", reject);
        process.on("close", (code, signal) => {
            if (code !== 0) {
                reject(`Programm close with code ${code}, ${signal}`);
            }
        });
        process.on("exit", (code, signal) => {
            if (code !== 0) {
                reject(`Programm exit with code ${code}, ${signal}`);
            }
        });
        console.log(`Programm started, pid ${process.pid}`);
        resolve({ process });
    });
}
function exists(file) {
    return new Promise((resolve, _reject) => {
        fs.exists(file, (value) => {
            resolve(value);
        });
    });
}
function walk(dirPath, recursive = true, isDirectory = true) {
    let result = [];
    for (let p of fs.readdirSync(dirPath)) {
        let newPath = path.join(dirPath, p);
        if (!isDirectory || fs.lstatSync(newPath).isDirectory()) {
            result.push(newPath);
            if (recursive) {
                for (let d of walk(newPath)) {
                    result.push(d);
                }
            }
        }
    }
    return result;
}
//# sourceMappingURL=main.js.map