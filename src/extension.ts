'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from 'vscode';
import {spawn, ChildProcess} from "child_process";

const OUTPUT_REGEXP = /.+:(\d+):(\d+)-(\d+): \(([EW])\d+\) (.*)/;

let diagnosticCollection: vscode.DiagnosticCollection;
let currentDiagnostic: vscode.Diagnostic;

function parseDocumentDiagnostics(document: vscode.TextDocument, luacOutput: string) {
    const matches = OUTPUT_REGEXP.exec(luacOutput);
    if (!matches) {
        return;
    }
    const message = {
        line: parseInt(matches[1]),
        at: matches[3],
        text: matches[5]
    }
    if (!message.line) {
        return;
    }

    var errorLine = document.lineAt(message.line - 1).text;

    var rangeLine = message.line - 1;
    var rangeStart = new vscode.Position(rangeLine, 0);
    var rangeEnd = new vscode.Position(rangeLine, errorLine.length);
    if (message.at !== "eof") {
        var linePosition = errorLine.indexOf(message.at);
        if (linePosition >= 0) {
            rangeStart = new vscode.Position(rangeLine, linePosition);
            rangeEnd = new vscode.Position(rangeLine, linePosition + message.at.length);
        }
    }
    var range = new vscode.Range(rangeStart, rangeEnd);
    currentDiagnostic = new vscode.Diagnostic(range, message.text, vscode.DiagnosticSeverity.Error);
}

function lintDocument(document: vscode.TextDocument, warnOnError: Boolean = false) {
    let luacheckerConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('luachecker');
    if (!luacheckerConfig.get("enable")) {
        return;
    }

    if (document.languageId !== "lua") {
        return;
    }
    currentDiagnostic = null;

    const options = {
        cwd: path.dirname(document.fileName)
    };

    // Determine the interpreter to use
    let luacheck = luacheckerConfig.get<string>("luacheck");

    let cmd = ['--no-color', '--codes', '--ranges', "--filename=" + document.fileName, '-'];
    let globals = luacheckerConfig.get<string>("globals");
    if (globals.length > 0) {
        cmd.push('--globals')
        cmd.push(globals)
    }
    let ignore = luacheckerConfig.get<string>("ignore");
    if (ignore.length > 0) {
        cmd.push('--ignore')
        cmd.push(ignore)
    }
    // let cmd = ['-'];
    // if (luacheck === "luac") {
    //     cmd = "-p";
    // } else {
    //     cmd = "-bl";
    // }

    // var luaProcess: ChildProcess = spawn(luacheck, [cmd, "-"], options);
    var luaProcess: ChildProcess = spawn(luacheck, cmd, options);
    luaProcess.stdout.setEncoding("utf8");
    luaProcess.stdout.on("data", (data: Buffer) => {
        if (data.length == 0) {
            return;
        }
        parseDocumentDiagnostics(document, data.toString());
    });
    luaProcess.stderr.on("data", error => {
        vscode.window.showErrorMessage(luacheck + " error: " + error);
    });
    luaProcess.stderr.on("error", error => {
        vscode.window.showErrorMessage(luacheck + " error: " + error);
    });
    // Pass current file contents to lua's stdin
    luaProcess.stdin.end(new Buffer(document.getText()));
    luaProcess.on("exit", (code: number, signal: string) => {
        if (!currentDiagnostic) {
            diagnosticCollection.clear();
        } else {
            diagnosticCollection.set(document.uri, [currentDiagnostic]);

            // Optionally show warining message
            if (warnOnError && luacheckerConfig.get<boolean>("warnOnSave")) {
                vscode.window.showWarningMessage("Current file contains an error: '${currentDiagnostic.message}' at line ${currentDiagnostic.range.start.line}");
            }
        }
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "lua-luachecker" is now active!');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('lua');
context.subscriptions.push(diagnosticCollection);

    vscode.workspace.onDidSaveTextDocument(document => lintDocument(document, true));
    vscode.workspace.onDidChangeTextDocument(event => lintDocument(event.document));
    vscode.workspace.onDidOpenTextDocument(document => lintDocument(document));
    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor) => lintDocument(editor.document));
}

// this method is called when your extension is deactivated
export function deactivate() {
}