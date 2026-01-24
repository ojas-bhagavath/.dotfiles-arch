"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class TaskProvider {
    provideTasks() {
        return [
            this.build(),
            this.serve(),
            this.serve_draft()
        ];
    }
    build() {
        let build = new vscode.Task({ type: "hugo", task: "" }, "Build site", "hugo", new vscode.ShellExecution("hugo"), []);
        build.group = vscode.TaskGroup.Build;
        return build;
    }
    serve() {
        let serve = new vscode.Task({ type: "hugo", task: "server" }, "Serve site", "hugo", new vscode.ShellExecution("hugo server"), []);
        serve.group = vscode.TaskGroup.Build;
        serve.isBackground = true;
        return serve;
    }
    serve_draft() {
        let serve = new vscode.Task({ type: "hugo", task: "server draft" }, "Serve draft site", "hugo", new vscode.ShellExecution("hugo server --buildDrafts"), []);
        serve.group = vscode.TaskGroup.Build;
        serve.isBackground = true;
        return serve;
    }
    resolveTask() {
        return undefined;
    }
}
exports.TaskProvider = TaskProvider;
//# sourceMappingURL=taskProvider.js.map