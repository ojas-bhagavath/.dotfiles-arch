/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeymapAnalyzer = void 0;
const vscode = __importStar(__webpack_require__(2));
const Parser_1 = __webpack_require__(3);
const behaviors_1 = __webpack_require__(10);
const keymap = __importStar(__webpack_require__(14));
const util_1 = __webpack_require__(9);
const DIAGNOSTICS_UPDATE_DELAY = 500;
/**
 * Manages all code analysis for .keymap files.
 */
class KeymapAnalyzer {
    parser;
    disposable;
    diagnosticCollection;
    // private errorQuery: Parser.Query;
    includeQuery;
    updateTimeout;
    staleDocuments = new Set();
    constructor(parser) {
        this.parser = parser;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('zmk-keymap');
        // this.errorQuery = this.parser.query('(ERROR) @error');
        this.includeQuery = this.parser.query('(preproc_include path: (_) @include)');
        this.disposable = vscode.Disposable.from(this.diagnosticCollection, this.parser.onDidChangeParse(this.handleParseChanged, this), vscode.languages.registerCompletionItemProvider(keymap.SELECTOR, this, ' ', '&', '('), vscode.languages.registerSignatureHelpProvider(keymap.SELECTOR, this, ' '));
        for (const document of vscode.workspace.textDocuments) {
            if (keymap.isKeymap(document)) {
                this.staleDocuments.add(document);
            }
        }
        this.setUpdateTimeout();
    }
    dispose() {
        this.clearUpdateTimeout();
        this.disposable.dispose();
    }
    provideCompletionItems(document, position, token, context) {
        return this.getCompletions(this.getAnalysisArgs(document, position, context));
    }
    provideSignatureHelp(document, position, token, context) {
        return this.getSignatureHelp(this.getAnalysisArgs(document, position, context));
    }
    handleParseChanged(e) {
        this.staleDocuments.add(e.document);
        this.setUpdateTimeout();
    }
    getAnalysisArgs(document, position, context) {
        const tree = this.parser.parse(document);
        let node = (0, Parser_1.nodeAtPosition)(tree.rootNode, position);
        let isAfter = false;
        const prevToken = (0, Parser_1.findPreviousToken)(document, position);
        const prevNode = prevToken ? (0, Parser_1.nodeAtPosition)(tree.rootNode, prevToken) : undefined;
        if (prevNode && (0, Parser_1.isDescendantOf)(prevNode, node)) {
            isAfter = (0, Parser_1.asPosition)(prevNode.endPosition).isBefore(position);
            node = prevNode;
        }
        return { document, position, context, node, isAfter };
    }
    clearUpdateTimeout() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }
    setUpdateTimeout() {
        this.clearUpdateTimeout();
        this.updateTimeout = setTimeout(() => {
            for (const document of this.staleDocuments) {
                this.updateDiagnostics(document);
            }
            this.staleDocuments.clear();
        }, DIAGNOSTICS_UPDATE_DELAY);
    }
    updateDiagnostics(document) {
        // TODO: Disabled until tree-sitter provides better error diagnostics.
        // const tree = this.parser.parse(document);
        // this.diagnosticCollection.delete(document.uri);
        // if (tree.rootNode.hasError()) {
        //     const diagnostics: vscode.Diagnostic[] = [];
        //     const errors = this.errorQuery.matches(tree.rootNode);
        //     for (const capture of getCaptures(errors)) {
        //         // TODO: provide a more meaningful error message
        //         // see https://github.com/tree-sitter/tree-sitter/issues/255
        //         const range = getNodeRange(capture.node);
        //         diagnostics.push(new vscode.Diagnostic(range, 'Syntax error', vscode.DiagnosticSeverity.Error));
        //     }
        //     // TODO: search for missing nodes too.
        //     this.diagnosticCollection.set(document.uri, diagnostics);
        // }
    }
    getIncludeInfo(document) {
        const tree = this.parser.parse(document);
        const includes = this.includeQuery.matches(tree.rootNode);
        const captures = [...getCaptures(includes)];
        let insertPosition;
        if (captures.length > 0) {
            insertPosition = (0, Parser_1.asPosition)(captures[captures.length - 1].node.endPosition)
                .translate({ lineDelta: 1 })
                .with({ character: 0 });
        }
        else {
            insertPosition = findFirstPositionForInclude(document, tree);
        }
        return {
            paths: captures.map((capture) => (0, util_1.stripIncludeQuotes)(capture.node.text)),
            insertPosition,
        };
    }
    getCompletions(args) {
        const property = (0, Parser_1.getPropertyName)(args.node);
        if (property) {
            const compatible = (0, Parser_1.getCompatible)(args.node);
            return this.getCompletionsForProperty(args, property, compatible);
        }
        return undefined;
    }
    getSignatureHelp(args) {
        const property = (0, Parser_1.getPropertyName)(args.node);
        if (property) {
            const compatible = (0, Parser_1.getCompatible)(args.node);
            return this.getSignaturesForProperty(args, property, compatible);
        }
        return undefined;
    }
    getCompletionsForProperty(args, property, compatible) {
        const behaviors = (0, behaviors_1.getBehaviors)(property, compatible);
        if (behaviors) {
            return this.getCompletionsForBindings(args, behaviors);
        }
        return undefined;
    }
    getSignaturesForProperty(args, property, compatible) {
        const behaviors = (0, behaviors_1.getBehaviors)(property, compatible);
        if (behaviors) {
            return this.getSignaturesForBindings(args, behaviors);
        }
        return undefined;
    }
    getCompletionsForBindings(args, validBehaviors) {
        const { node } = args;
        if (node.type === 'integer_cells') {
            return this.getCompletionsForBehaviors(args, validBehaviors);
        }
        const { behavior, paramIndex } = findCurrentBehavior(args);
        if (behavior) {
            if (paramIndex !== undefined) {
                return this.getBehaviorParamCompletions(args, validBehaviors, behavior, paramIndex);
            }
            return this.getCompletionsForBehaviors(args, validBehaviors, behavior);
        }
        return undefined;
    }
    getSignaturesForBindings(args, validBehaviors) {
        const { behavior, paramIndex } = findCurrentBehavior(args);
        if (behavior && paramIndex !== undefined) {
            const filteredBehaviors = filterBehaviors(validBehaviors, behavior, { matchFullWord: true });
            const signatures = (0, behaviors_1.behaviorsToSignatures)(filteredBehaviors, paramIndex);
            return {
                signatures,
                activeSignature: 0, // TODO?
                activeParameter: paramIndex,
            };
        }
        return undefined;
    }
    getCompletionsForBehaviors(args, validBehaviors, behavior) {
        // Don't trigger completion for behaviors on space if there's a behavior
        // right after the cursor. You're probably just changing alignment.
        if (args.context.triggerCharacter === ' ') {
            const node = (0, Parser_1.getAncesorOfType)(args.node, 'reference') ?? args.node;
            if ((0, Parser_1.asPosition)(node.startPosition).isEqual(args.position)) {
                return;
            }
            if (getNextSiblingOnLine(node)?.type === 'reference') {
                return;
            }
        }
        if (behavior) {
            let range = (0, Parser_1.getNodeRange)(behavior);
            if (!range.isSingleLine) {
                range = range.with({ end: args.position });
            }
            return (0, behaviors_1.behaviorsToCompletions)(filterBehaviors(validBehaviors, behavior), this.getIncludeInfo(args.document), range);
        }
        return (0, behaviors_1.behaviorsToCompletions)(validBehaviors, this.getIncludeInfo(args.document));
    }
    getBehaviorParamCompletions(args, validBehaviors, behaviorNode, paramIndex) {
        // Don't trigger completion for behaviors on space unless there's a behavior
        // right after the cursor. You're probably just changing alignment.
        if (args.context.triggerCharacter === ' ') {
            const node = (0, Parser_1.isDescendantOf)(args.node, behaviorNode) ? behaviorNode : args.node;
            if ((0, Parser_1.asPosition)(node.startPosition).isEqual(args.position)) {
                return;
            }
            const next = getNextSiblingOnLine(node);
            if (next && next.type !== 'reference') {
                return;
            }
        }
        const filteredBehaviors = filterBehaviors(validBehaviors, behaviorNode);
        if (filteredBehaviors.length > 0) {
            const behavior = filteredBehaviors[0];
            if (paramIndex < behavior.parameters.length) {
                return (0, behaviors_1.parameterToCompletions)(behavior.parameters[paramIndex], this.getIncludeInfo(args.document));
            }
        }
        // This is after the last parameter for the behavior. Suggest a new
        // behavior instead.
        return this.getCompletionsForBehaviors(args, validBehaviors);
    }
}
exports.KeymapAnalyzer = KeymapAnalyzer;
function* getCaptures(matches) {
    for (const match of matches) {
        for (const capture of match.captures) {
            yield capture;
        }
    }
}
function findFirstPositionForInclude(document, tree) {
    let line = 0;
    do {
        const node = tree.rootNode.descendantForPosition({ row: line, column: 0 });
        if ((0, Parser_1.nodesEqual)(node, tree.rootNode)) {
            break;
        }
        if (node.type !== 'comment') {
            break;
        }
        line++;
    } while (line < document.lineCount);
    return new vscode.Position(line, 0);
}
function findCurrentBehavior({ node, isAfter }) {
    // Find the child of the integer cells array we're in.
    let current = node;
    while (current && current.parent?.type !== 'integer_cells') {
        current = current.parent;
    }
    if (!current) {
        return { behavior: null };
    }
    if (current.type === 'reference') {
        // We're inside the reference node.
        return { behavior: current, paramIndex: isAfter ? 0 : undefined };
    }
    // Walk back through siblings until we find the reference node.
    let paramIndex = isAfter ? 0 : -1;
    while (current && current.type !== 'reference') {
        paramIndex++;
        current = current.previousNamedSibling;
    }
    if (!current) {
        // Reached start without finding a reference node.
        return { behavior: null };
    }
    return { behavior: current, paramIndex };
}
function filterBehaviors(validBehaviors, behavior, options) {
    const { matchFullWord } = { matchFullWord: false, ...options };
    const text = (0, util_1.truncateAtWhitespace)(behavior.text);
    const filtered = validBehaviors.filter((b) => {
        if (!b.label.startsWith(text)) {
            return false;
        }
        if (matchFullWord) {
            if ((0, util_1.truncateAtWhitespace)(b.label) !== text) {
                return false;
            }
        }
        if (b.if) {
            return (0, behaviors_1.testBehavior)(behavior, b.if);
        }
        return true;
    });
    return filtered;
}
function getNextSiblingOnLine(node) {
    const next = node.nextNamedSibling;
    if (next?.startPosition.row === node.endPosition.row) {
        return next;
    }
    return null;
}


/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeymapParser = void 0;
exports.asPoint = asPoint;
exports.asPosition = asPosition;
exports.nodesEqual = nodesEqual;
exports.isDescendantOf = isDescendantOf;
exports.findPreviousToken = findPreviousToken;
exports.nodeAtPosition = nodeAtPosition;
exports.getAncesorOfType = getAncesorOfType;
exports.getNodeRange = getNodeRange;
exports.getPropertyName = getPropertyName;
exports.getCompatible = getCompatible;
const vscode = __importStar(__webpack_require__(2));
const web_tree_sitter_1 = __importDefault(__webpack_require__(4));
const file_1 = __webpack_require__(8);
const util_1 = __webpack_require__(9);
const WHITESPACE_RE = /\s/;
async function initTreeSitter(context) {
    await web_tree_sitter_1.default.init({
        locateFile(path, prefix) {
            const uri = vscode.Uri.joinPath(context.extensionUri, 'dist', path);
            return uri.toString(true);
        },
    });
}
async function loadLanguage(context) {
    const wasmBinary = await (0, file_1.fetchResource)(context, 'dist/tree-sitter-devicetree.wasm');
    return await web_tree_sitter_1.default.Language.load(wasmBinary);
}
async function createParser(context) {
    await initTreeSitter(context);
    const parser = new web_tree_sitter_1.default();
    const language = await loadLanguage(context);
    parser.setLanguage(language);
    return { parser, language };
}
/**
 * Parses `.keymap` files.
 */
class KeymapParser {
    parser;
    language;
    static async init(context) {
        const { parser, language } = await createParser(context);
        return new KeymapParser(parser, language);
    }
    _onDidChangeParse = new vscode.EventEmitter();
    onDidChangeParse = this._onDidChangeParse.event;
    disposable;
    trees = {};
    constructor(parser, language) {
        this.parser = parser;
        this.language = language;
        this.disposable = vscode.Disposable.from(vscode.workspace.onDidCloseTextDocument((document) => this.deleteTree(document)), vscode.workspace.onDidChangeTextDocument((e) => this.updateTree(e)));
    }
    dispose() {
        this.disposable.dispose();
    }
    /**
     * Returns an up-to-date parse tree for a document.
     */
    parse(document) {
        return this.trees[document.uri.toString()] ?? this.openDocument(document);
    }
    /**
     * Builds a tree-sitter query for keymap files.
     */
    query(expression) {
        return this.language.query(expression);
    }
    getTree(document) {
        return this.trees[document.uri.toString()];
    }
    setTree(document, tree) {
        this.trees[document.uri.toString()] = tree;
        this._onDidChangeParse.fire({ document });
        return tree;
    }
    deleteTree(document) {
        delete this.trees[document.uri.toString()];
    }
    getParserInput(document) {
        return (index, startPosition) => {
            if (startPosition && startPosition.row < document.lineCount) {
                const line = document.lineAt(startPosition.row);
                return line.text.slice(startPosition.column);
            }
            return null;
        };
    }
    openDocument(document) {
        return this.setTree(document, this.parser.parse(document.getText()));
    }
    updateTree(e) {
        const tree = this.getTree(e.document);
        if (!tree) {
            return;
        }
        for (const change of e.contentChanges) {
            const startIndex = change.rangeOffset;
            const oldEndIndex = change.rangeOffset + change.rangeLength;
            const newEndIndex = change.rangeOffset + change.text.length;
            const startPosition = asPoint(e.document.positionAt(startIndex));
            const oldEndPosition = asPoint(e.document.positionAt(oldEndIndex));
            const newEndPosition = asPoint(e.document.positionAt(newEndIndex));
            tree.edit({ startIndex, oldEndIndex, newEndIndex, startPosition, oldEndPosition, newEndPosition });
        }
        // TODO: figure out how to make this work to be more efficient.
        // const newTree = this.parser.parse(this.getParserInput(e.document), tree);
        const newTree = this.parser.parse(e.document.getText(), tree);
        this.setTree(e.document, newTree);
    }
}
exports.KeymapParser = KeymapParser;
/**
 * Converts a vscode position to a tree-sitter point.
 */
function asPoint(position) {
    return { row: position.line, column: position.character };
}
/**
 * Converts a tree-sitter point to a vscode position.
 */
function asPosition(point) {
    return new vscode.Position(point.row, point.column);
}
/**
 * Returns whether two nodes are equal.
 * TODO: replace this with a.equals(b) once tree-sitter's equals() is fixed.
 */
function nodesEqual(a, b) {
    return a.id === b.id;
}
/**
 * Returns whether `node` is a descendant of `other`.
 */
function isDescendantOf(node, other) {
    let current = node;
    while (current) {
        if (nodesEqual(current, other)) {
            return true;
        }
        current = current.parent;
    }
    return false;
}
/**
 * Finds a position inside the first non-whitespace token which is before the
 * given position.
 */
function findPreviousToken(document, position) {
    const line = document.lineAt(position.line);
    for (let i = position.character - 1; i >= 0; i--) {
        const char = line.text[i];
        if (char !== undefined && !WHITESPACE_RE.test(char)) {
            return position.with({ character: i });
        }
    }
    return undefined;
}
/**
 * Gets the named descendant of `root` at a position.
 */
function nodeAtPosition(root, position) {
    const point = asPoint(position);
    return root.namedDescendantForPosition(point);
}
/**
 * Returns the closest ancestor that has a given node type.
 */
function getAncesorOfType(node, type) {
    while (node && node.type !== type) {
        node = node.parent;
    }
    return node;
}
/**
 * Gets the start/end position of a node as a vscode range.
 */
function getNodeRange(node) {
    return new vscode.Range(asPosition(node.startPosition), asPosition(node.endPosition));
}
/**
 * Gets the name of the DeviceTree property which includes the given node,
 * or `undefined` if it is not part of a property.
 */
function getPropertyName(node) {
    const prop = getAncesorOfType(node, 'property');
    return prop?.childForFieldName('name')?.text;
}
/**
 * Gets the "compatible" property of the DeviceTree node which includes the given node,
 * or `undefined` if it is not part of a node with such a property.
 */
function getCompatible(node) {
    const dtNode = getAncesorOfType(node, 'node');
    const properties = dtNode?.descendantsOfType('property');
    const compatible = properties?.find((x) => x.childForFieldName('name')?.text === 'compatible');
    const value = compatible?.childForFieldName('value');
    return value ? (0, util_1.stripQuotes)(value.text) : undefined;
}


/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __dirname = "/";
/* provided dependency */ var process = __webpack_require__(5);
// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != "undefined" ? Module : {};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

if (ENVIRONMENT_IS_NODE) {}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// include: /src/lib/binding_web/prefix.js
var TreeSitter = function() {
  var initPromise;
  var document = typeof window == "object" ? {
    currentScript: window.document.currentScript
  } : null;
  class Parser {
    constructor() {
      this.initialize();
    }
    initialize() {
      throw new Error("cannot construct a Parser before calling `init()`");
    }
    static init(moduleOptions) {
      if (initPromise) return initPromise;
      Module = Object.assign({}, Module, moduleOptions);
      return initPromise = new Promise(resolveInitPromise => {
        // end include: /src/lib/binding_web/prefix.js
        // Sometimes an existing Module object exists with properties
        // meant to overwrite the default module functionality. Here
        // we collect those properties and reapply _after_ we configure
        // the current environment's defaults to avoid having to be so
        // defensive during initialization.
        var moduleOverrides = Object.assign({}, Module);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        // `/` should be present at the end if `scriptDirectory` is not empty
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module["locateFile"]) {
            return Module["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        // Hooks that are implemented differently in different runtime environments.
        var readAsync, readBinary;
        if (ENVIRONMENT_IS_NODE) {
          // These modules will usually be used on Node.js. Load them eagerly to avoid
          // the complexity of lazy-loading.
          var fs = __webpack_require__(6);
          var nodePath = __webpack_require__(7);
          scriptDirectory = __dirname + "/";
          // include: node_shell_read.js
          readBinary = filename => {
            // We need to re-wrap `file://` strings to URLs. Normalizing isn't
            // necessary in that case, the path should already be absolute.
            filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
            var ret = fs.readFileSync(filename);
            return ret;
          };
          readAsync = (filename, binary = true) => {
            // See the comment in the `readBinary` function.
            filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
            return new Promise((resolve, reject) => {
              fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
                if (err) reject(err); else resolve(binary ? data.buffer : data);
              });
            });
          };
          // end include: node_shell_read.js
          if (!Module["thisProgram"] && process.argv.length > 1) {
            thisProgram = process.argv[1].replace(/\\/g, "/");
          }
          arguments_ = process.argv.slice(2);
          if (true) {
            module["exports"] = Module;
          }
          quit_ = (status, toThrow) => {
            process.exitCode = status;
            throw toThrow;
          };
        } else // Note that this includes Node.js workers when relevant (pthreads is enabled).
        // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
        // ENVIRONMENT_IS_NODE.
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            // Check worker, not web, since window could be polyfilled
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            // web
            scriptDirectory = document.currentScript.src;
          }
          // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
          // otherwise, slice off the final part of the url to find the script directory.
          // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
          // and scriptDirectory will correctly be replaced with an empty string.
          // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
          // they are removed because they could contain a slash.
          if (scriptDirectory.startsWith("blob:")) {
            scriptDirectory = "";
          } else {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
          }
          {
            // include: web_or_worker_shell_read.js
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = url => {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
              };
            }
            readAsync = url => {
              // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
              // See https://github.com/github/fetch/pull/92#issuecomment-140665932
              // Cordova or Electron apps are typically loaded from a file:// url.
              // So use XHR on webview if URL is a file URL.
              if (isFileURI(url)) {
                return new Promise((reject, resolve) => {
                  var xhr = new XMLHttpRequest;
                  xhr.open("GET", url, true);
                  xhr.responseType = "arraybuffer";
                  xhr.onload = () => {
                    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                      // file URLs can return 0
                      resolve(xhr.response);
                    }
                    reject(xhr.status);
                  };
                  xhr.onerror = reject;
                  xhr.send(null);
                });
              }
              return fetch(url, {
                credentials: "same-origin"
              }).then(response => {
                if (response.ok) {
                  return response.arrayBuffer();
                }
                return Promise.reject(new Error(response.status + " : " + response.url));
              });
            };
          }
        } else // end include: web_or_worker_shell_read.js
        {}
        var out = Module["print"] || console.log.bind(console);
        var err = Module["printErr"] || console.error.bind(console);
        // Merge back in the overrides
        Object.assign(Module, moduleOverrides);
        // Free the object hierarchy contained in the overrides, this lets the GC
        // reclaim data used.
        moduleOverrides = null;
        // Emit code to handle expected values on the Module object. This applies Module.x
        // to the proper local x. This has two benefits: first, we only emit it if it is
        // expected to arrive, and second, by using a local everywhere else that can be
        // minified.
        if (Module["arguments"]) arguments_ = Module["arguments"];
        if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
        if (Module["quit"]) quit_ = Module["quit"];
        // perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
        // end include: shell.js
        // include: preamble.js
        // === Preamble library stuff ===
        // Documentation for the public APIs defined in this file must be updated in:
        //    site/source/docs/api_reference/preamble.js.rst
        // A prebuilt local version of the documentation is available at:
        //    site/build/text/docs/api_reference/preamble.js.txt
        // You can also build docs locally as HTML or other formats in site/
        // An online HTML version (which may be of a different version of Emscripten)
        //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
        var dynamicLibraries = Module["dynamicLibraries"] || [];
        var wasmBinary;
        if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
        // Wasm globals
        var wasmMemory;
        //========================================
        // Runtime essentials
        //========================================
        // whether we are quitting the application. no code should run after this.
        // set in exit() and abort()
        var ABORT = false;
        // set by exit() and abort().  Passed to 'onExit' handler.
        // NOTE: This is also used as the process return code code in shell environments
        // but only when noExitRuntime is false.
        var EXITSTATUS;
        // Memory management
        var /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /** @type {!Float64Array} */ HEAPF64;
        var HEAP_DATA_VIEW;
        // include: runtime_shared.js
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module["HEAP_DATA_VIEW"] = HEAP_DATA_VIEW = new DataView(b);
          Module["HEAP8"] = HEAP8 = new Int8Array(b);
          Module["HEAP16"] = HEAP16 = new Int16Array(b);
          Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module["HEAP32"] = HEAP32 = new Int32Array(b);
          Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        // end include: runtime_shared.js
        // In non-standalone/normal mode, we create the memory here.
        // include: runtime_init_memory.js
        // Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)
        // check for full engine support (use string 'subarray' to avoid closure compiler confusion)
        if (Module["wasmMemory"]) {
          wasmMemory = Module["wasmMemory"];
        } else {
          var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 33554432;
          wasmMemory = new WebAssembly.Memory({
            "initial": INITIAL_MEMORY / 65536,
            // In theory we should not need to emit the maximum if we want "unlimited"
            // or 4GB of memory, but VMs error on that atm, see
            // https://github.com/emscripten-core/emscripten/issues/14130
            // And in the pthreads case we definitely need to emit a maximum. So
            // always emit one.
            "maximum": 2147483648 / 65536
          });
        }
        updateMemoryViews();
        // end include: runtime_init_memory.js
        // include: runtime_stack_check.js
        // end include: runtime_stack_check.js
        // include: runtime_assertions.js
        // end include: runtime_assertions.js
        var __ATPRERUN__ = [];
        // functions called before the runtime is initialized
        var __ATINIT__ = [];
        // functions called during startup
        var __ATMAIN__ = [];
        // functions called during shutdown
        var __ATPOSTRUN__ = [];
        // functions called after the main() is called
        var __RELOC_FUNCS__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module["preRun"]) {
            if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
            while (Module["preRun"].length) {
              addOnPreRun(Module["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
          runtimeInitialized = true;
          callRuntimeCallbacks(__RELOC_FUNCS__);
          callRuntimeCallbacks(__ATINIT__);
        }
        function preMain() {
          callRuntimeCallbacks(__ATMAIN__);
        }
        function postRun() {
          if (Module["postRun"]) {
            if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
            while (Module["postRun"].length) {
              addOnPostRun(Module["postRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb);
        }
        // include: runtime_math.js
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
        // end include: runtime_math.js
        // A counter of dependencies for calling run(). If we need to
        // do asynchronous work before running, increment this and
        // decrement it. Incrementing must happen in a place like
        // Module.preRun (used by emcc to add file preloading).
        // Note that you can add dependencies in preRun, even though
        // it happens right before run - run will be postponed until
        // the dependencies are met.
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        // overridden to take different actions when all run dependencies are fulfilled
        function getUniqueRunDependency(id) {
          return id;
        }
        function addRunDependency(id) {
          runDependencies++;
          Module["monitorRunDependencies"]?.(runDependencies);
        }
        function removeRunDependency(id) {
          runDependencies--;
          Module["monitorRunDependencies"]?.(runDependencies);
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        /** @param {string|number=} what */ function abort(what) {
          Module["onAbort"]?.(what);
          what = "Aborted(" + what + ")";
          // TODO(sbc): Should we remove printing and leave it up to whoever
          // catches the exception?
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          what += ". Build with -sASSERTIONS for more info.";
          // Use a wasm runtime error, because a JS error might be seen as a foreign
          // exception, which means we'd run destructors on it. We need the error to
          // simply make the program stop.
          // FIXME This approach does not work in Wasm EH because it currently does not assume
          // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
          // a trap or not based on a hidden field within the object. So at the moment
          // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
          // allows this in the wasm spec.
          // Suppress closure compiler warning here. Closure compiler's builtin extern
          // definition for WebAssembly.RuntimeError claims it takes no arguments even
          // though it can.
          // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
          /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
          // Throw the error whether or not MODULARIZE is set because abort is used
          // in code paths apart from instantiation where an exception is expected
          // to be thrown when abort is called.
          throw e;
        }
        // include: memoryprofiler.js
        // end include: memoryprofiler.js
        // include: URIUtils.js
        // Prefix of data URIs emitted by SINGLE_FILE and related options.
        var dataURIPrefix = "data:application/octet-stream;base64,";
        /**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);
        /**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");
        // end include: URIUtils.js
        // include: runtime_exceptions.js
        // end include: runtime_exceptions.js
        function findWasmBinary() {
          var f = "tree-sitter.wasm";
          if (!isDataURI(f)) {
            return locateFile(f);
          }
          return f;
        }
        var wasmBinaryFile;
        function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          }
          throw "both async and sync fetching of the wasm failed";
        }
        function getBinaryPromise(binaryFile) {
          // If we don't have the binary yet, load it asynchronously using readAsync.
          if (!wasmBinary) {
            // Fetch the binary using readAsync
            return readAsync(binaryFile).then(response => new Uint8Array(/** @type{!ArrayBuffer} */ (response)), // Fall back to getBinarySync if readAsync fails
            () => getBinarySync(binaryFile));
          }
          // Otherwise, getBinarySync should be able to get it synchronously
          return Promise.resolve().then(() => getBinarySync(binaryFile));
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
          !isFileURI(binaryFile) && // Avoid instantiateStreaming() on Node.js environment for now, as while
          // Node.js v18.1.0 implements it, it does not have a full fetch()
          // implementation yet.
          // Reference:
          //   https://github.com/emscripten-core/emscripten/pull/16917
          !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
            return fetch(binaryFile, {
              credentials: "same-origin"
            }).then(response => {
              // Suppress closure warning here since the upstream definition for
              // instantiateStreaming only allows Promise<Repsponse> rather than
              // an actual Response.
              // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
              /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(response, imports);
              return result.then(callback, function(reason) {
                // We expect the most common failure cause to be a bad MIME type for the binary,
                // in which case falling back to ArrayBuffer instantiation should work.
                err(`wasm streaming compile failed: ${reason}`);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback);
              });
            });
          }
          return instantiateArrayBuffer(binaryFile, imports, callback);
        }
        function getWasmImports() {
          // prepare imports
          return {
            "env": wasmImports,
            "wasi_snapshot_preview1": wasmImports,
            "GOT.mem": new Proxy(wasmImports, GOTHandler),
            "GOT.func": new Proxy(wasmImports, GOTHandler)
          };
        }
        // Create the wasm instance.
        // Receives the wasm imports, returns the exports.
        function createWasm() {
          var info = getWasmImports();
          // Load the wasm module and create an instance of using native support in the JS engine.
          // handle a generated wasm instance, receiving its exports and
          // performing other necessary setup
          /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
            wasmExports = instance.exports;
            wasmExports = relocateExports(wasmExports, 1024);
            var metadata = getDylinkMetadata(module);
            if (metadata.neededDynlibs) {
              dynamicLibraries = metadata.neededDynlibs.concat(dynamicLibraries);
            }
            mergeLibSymbols(wasmExports, "main");
            LDSO.init();
            loadDylibs();
            addOnInit(wasmExports["__wasm_call_ctors"]);
            __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"]);
            removeRunDependency("wasm-instantiate");
            return wasmExports;
          }
          // wait for the pthread pool (if any)
          addRunDependency("wasm-instantiate");
          // Prefer streaming instantiation if available.
          function receiveInstantiationResult(result) {
            // 'result' is a ResultObject object which has both the module and instance.
            // receiveInstance() will swap in the exports (to Module.asm) so they can be called
            receiveInstance(result["instance"], result["module"]);
          }
          // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
          // to manually instantiate the Wasm module themselves. This allows pages to
          // run the instantiation parallel to any other async startup actions they are
          // performing.
          // Also pthreads and wasm workers initialize the wasm instance through this
          // path.
          if (Module["instantiateWasm"]) {
            try {
              return Module["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err(`Module.instantiateWasm callback failed with error: ${e}`);
              return false;
            }
          }
          if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
          instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult);
          return {};
        }
        // include: runtime_debug.js
        // end include: runtime_debug.js
        // === Body ===
        var ASM_CONSTS = {};
        // end include: preamble.js
        /** @constructor */ function ExitStatus(status) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${status})`;
          this.status = status;
        }
        var GOT = {};
        var currentModuleWeakSymbols = new Set([]);
        var GOTHandler = {
          get(obj, symName) {
            var rtn = GOT[symName];
            if (!rtn) {
              rtn = GOT[symName] = new WebAssembly.Global({
                "value": "i32",
                "mutable": true
              });
            }
            if (!currentModuleWeakSymbols.has(symName)) {
              // Any non-weak reference to a symbol marks it as `required`, which
              // enabled `reportUndefinedSymbols` to report undefeind symbol errors
              // correctly.
              rtn.required = true;
            }
            return rtn;
          }
        };
        var LE_HEAP_LOAD_F32 = byteOffset => HEAP_DATA_VIEW.getFloat32(byteOffset, true);
        var LE_HEAP_LOAD_F64 = byteOffset => HEAP_DATA_VIEW.getFloat64(byteOffset, true);
        var LE_HEAP_LOAD_I16 = byteOffset => HEAP_DATA_VIEW.getInt16(byteOffset, true);
        var LE_HEAP_LOAD_I32 = byteOffset => HEAP_DATA_VIEW.getInt32(byteOffset, true);
        var LE_HEAP_LOAD_U32 = byteOffset => HEAP_DATA_VIEW.getUint32(byteOffset, true);
        var LE_HEAP_STORE_F32 = (byteOffset, value) => HEAP_DATA_VIEW.setFloat32(byteOffset, value, true);
        var LE_HEAP_STORE_F64 = (byteOffset, value) => HEAP_DATA_VIEW.setFloat64(byteOffset, value, true);
        var LE_HEAP_STORE_I16 = (byteOffset, value) => HEAP_DATA_VIEW.setInt16(byteOffset, value, true);
        var LE_HEAP_STORE_I32 = (byteOffset, value) => HEAP_DATA_VIEW.setInt32(byteOffset, value, true);
        var LE_HEAP_STORE_U32 = (byteOffset, value) => HEAP_DATA_VIEW.setUint32(byteOffset, value, true);
        var callRuntimeCallbacks = callbacks => {
          while (callbacks.length > 0) {
            // Pass the module as the first argument.
            callbacks.shift()(Module);
          }
        };
        var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
        /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
          var endIdx = idx + maxBytesToRead;
          var endPtr = idx;
          // TextDecoder needs to know the byte length in advance, it doesn't stop on
          // null terminator by itself.  Also, use the length info to avoid running tiny
          // strings through TextDecoder, since .subarray() allocates garbage.
          // (As a tiny code save trick, compare endPtr against endIdx using a negation,
          // so that undefined means Infinity)
          while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
          if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
            return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
          }
          var str = "";
          // If building with TextDecoder, we have already computed the string length
          // above, so test loop end condition against that
          while (idx < endPtr) {
            // For UTF8 byte structure, see:
            // http://en.wikipedia.org/wiki/UTF-8#Description
            // https://www.ietf.org/rfc/rfc2279.txt
            // https://tools.ietf.org/html/rfc3629
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode(((u0 & 31) << 6) | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
            }
          }
          return str;
        };
        var getDylinkMetadata = binary => {
          var offset = 0;
          var end = 0;
          function getU8() {
            return binary[offset++];
          }
          function getLEB() {
            var ret = 0;
            var mul = 1;
            while (1) {
              var byte = binary[offset++];
              ret += ((byte & 127) * mul);
              mul *= 128;
              if (!(byte & 128)) break;
            }
            return ret;
          }
          function getString() {
            var len = getLEB();
            offset += len;
            return UTF8ArrayToString(binary, offset - len, len);
          }
          /** @param {string=} message */ function failIf(condition, message) {
            if (condition) throw new Error(message);
          }
          var name = "dylink.0";
          if (binary instanceof WebAssembly.Module) {
            var dylinkSection = WebAssembly.Module.customSections(binary, name);
            if (dylinkSection.length === 0) {
              name = "dylink";
              dylinkSection = WebAssembly.Module.customSections(binary, name);
            }
            failIf(dylinkSection.length === 0, "need dylink section");
            binary = new Uint8Array(dylinkSection[0]);
            end = binary.length;
          } else {
            var int32View = new Uint32Array(new Uint8Array(binary.subarray(0, 24)).buffer);
            var magicNumberFound = int32View[0] == 1836278016 || int32View[0] == 6386541;
            failIf(!magicNumberFound, "need to see wasm magic number");
            // \0asm
            // we should see the dylink custom section right after the magic number and wasm version
            failIf(binary[8] !== 0, "need the dylink section to be first");
            offset = 9;
            var section_size = getLEB();
            //section size
            end = offset + section_size;
            name = getString();
          }
          var customSection = {
            neededDynlibs: [],
            tlsExports: new Set,
            weakImports: new Set
          };
          if (name == "dylink") {
            customSection.memorySize = getLEB();
            customSection.memoryAlign = getLEB();
            customSection.tableSize = getLEB();
            customSection.tableAlign = getLEB();
            // shared libraries this module needs. We need to load them first, so that
            // current module could resolve its imports. (see tools/shared.py
            // WebAssembly.make_shared_library() for "dylink" section extension format)
            var neededDynlibsCount = getLEB();
            for (var i = 0; i < neededDynlibsCount; ++i) {
              var libname = getString();
              customSection.neededDynlibs.push(libname);
            }
          } else {
            failIf(name !== "dylink.0");
            var WASM_DYLINK_MEM_INFO = 1;
            var WASM_DYLINK_NEEDED = 2;
            var WASM_DYLINK_EXPORT_INFO = 3;
            var WASM_DYLINK_IMPORT_INFO = 4;
            var WASM_SYMBOL_TLS = 256;
            var WASM_SYMBOL_BINDING_MASK = 3;
            var WASM_SYMBOL_BINDING_WEAK = 1;
            while (offset < end) {
              var subsectionType = getU8();
              var subsectionSize = getLEB();
              if (subsectionType === WASM_DYLINK_MEM_INFO) {
                customSection.memorySize = getLEB();
                customSection.memoryAlign = getLEB();
                customSection.tableSize = getLEB();
                customSection.tableAlign = getLEB();
              } else if (subsectionType === WASM_DYLINK_NEEDED) {
                var neededDynlibsCount = getLEB();
                for (var i = 0; i < neededDynlibsCount; ++i) {
                  libname = getString();
                  customSection.neededDynlibs.push(libname);
                }
              } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
                var count = getLEB();
                while (count--) {
                  var symname = getString();
                  var flags = getLEB();
                  if (flags & WASM_SYMBOL_TLS) {
                    customSection.tlsExports.add(symname);
                  }
                }
              } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
                var count = getLEB();
                while (count--) {
                  var modname = getString();
                  var symname = getString();
                  var flags = getLEB();
                  if ((flags & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
                    customSection.weakImports.add(symname);
                  }
                }
              } else {
                // unknown subsection
                offset += subsectionSize;
              }
            }
          }
          return customSection;
        };
        /**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
          if (type.endsWith("*")) type = "*";
          switch (type) {
           case "i1":
            return HEAP8[ptr];

           case "i8":
            return HEAP8[ptr];

           case "i16":
            return LE_HEAP_LOAD_I16(((ptr) >> 1) * 2);

           case "i32":
            return LE_HEAP_LOAD_I32(((ptr) >> 2) * 4);

           case "i64":
            abort("to do getValue(i64) use WASM_BIGINT");

           case "float":
            return LE_HEAP_LOAD_F32(((ptr) >> 2) * 4);

           case "double":
            return LE_HEAP_LOAD_F64(((ptr) >> 3) * 8);

           case "*":
            return LE_HEAP_LOAD_U32(((ptr) >> 2) * 4);

           default:
            abort(`invalid type for getValue: ${type}`);
          }
        }
        var newDSO = (name, handle, syms) => {
          var dso = {
            refcount: Infinity,
            name: name,
            exports: syms,
            global: true
          };
          LDSO.loadedLibsByName[name] = dso;
          if (handle != undefined) {
            LDSO.loadedLibsByHandle[handle] = dso;
          }
          return dso;
        };
        var LDSO = {
          loadedLibsByName: {},
          loadedLibsByHandle: {},
          init() {
            newDSO("__main__", 0, wasmImports);
          }
        };
        var ___heap_base = 78112;
        var zeroMemory = (address, size) => {
          HEAPU8.fill(0, address, address + size);
          return address;
        };
        var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
        var getMemory = size => {
          // After the runtime is initialized, we must only use sbrk() normally.
          if (runtimeInitialized) {
            // Currently we don't support freeing of static data when modules are
            // unloaded via dlclose.  This function is tagged as `noleakcheck` to
            // avoid having this reported as leak.
            return zeroMemory(_malloc(size), size);
          }
          var ret = ___heap_base;
          // Keep __heap_base stack aligned.
          var end = ret + alignMemory(size, 16);
          ___heap_base = end;
          GOT["__heap_base"].value = end;
          return ret;
        };
        var isInternalSym = symName => [ "__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "_emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors", "__start_em_asm", "__stop_em_asm", "__start_em_js", "__stop_em_js" ].includes(symName) || symName.startsWith("__em_js__");
        var uleb128Encode = (n, target) => {
          if (n < 128) {
            target.push(n);
          } else {
            target.push((n % 128) | 128, n >> 7);
          }
        };
        var sigToWasmTypes = sig => {
          var typeNames = {
            "i": "i32",
            "j": "i64",
            "f": "f32",
            "d": "f64",
            "e": "externref",
            "p": "i32"
          };
          var type = {
            parameters: [],
            results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
          };
          for (var i = 1; i < sig.length; ++i) {
            type.parameters.push(typeNames[sig[i]]);
          }
          return type;
        };
        var generateFuncType = (sig, target) => {
          var sigRet = sig.slice(0, 1);
          var sigParam = sig.slice(1);
          var typeCodes = {
            "i": 127,
            // i32
            "p": 127,
            // i32
            "j": 126,
            // i64
            "f": 125,
            // f32
            "d": 124,
            // f64
            "e": 111
          };
          // Parameters, length + signatures
          target.push(96);
          /* form: func */ uleb128Encode(sigParam.length, target);
          for (var i = 0; i < sigParam.length; ++i) {
            target.push(typeCodes[sigParam[i]]);
          }
          // Return values, length + signatures
          // With no multi-return in MVP, either 0 (void) or 1 (anything else)
          if (sigRet == "v") {
            target.push(0);
          } else {
            target.push(1, typeCodes[sigRet]);
          }
        };
        var convertJsFunctionToWasm = (func, sig) => {
          // If the type reflection proposal is available, use the new
          // "WebAssembly.Function" constructor.
          // Otherwise, construct a minimal wasm module importing the JS function and
          // re-exporting it.
          if (typeof WebAssembly.Function == "function") {
            return new WebAssembly.Function(sigToWasmTypes(sig), func);
          }
          // The module is static, with the exception of the type section, which is
          // generated based on the signature passed in.
          var typeSectionBody = [ 1 ];
          // count: 1
          generateFuncType(sig, typeSectionBody);
          // Rest of the module is static
          var bytes = [ 0, 97, 115, 109, // magic ("\0asm")
          1, 0, 0, 0, // version: 1
          1 ];
          // Write the overall length of the type section followed by the body
          uleb128Encode(typeSectionBody.length, bytes);
          bytes.push(...typeSectionBody);
          // The rest of the module is static
          bytes.push(2, 7, // import section
          // (import "e" "f" (func 0 (type 0)))
          1, 1, 101, 1, 102, 0, 0, 7, 5, // export section
          // (export "f" (func 0 (type 0)))
          1, 1, 102, 0, 0);
          // We can compile this wasm module synchronously because it is very small.
          // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
          var module = new WebAssembly.Module(new Uint8Array(bytes));
          var instance = new WebAssembly.Instance(module, {
            "e": {
              "f": func
            }
          });
          var wrappedFunc = instance.exports["f"];
          return wrappedFunc;
        };
        var wasmTableMirror = [];
        /** @type {WebAssembly.Table} */ var wasmTable = new WebAssembly.Table({
          "initial": 28,
          "element": "anyfunc"
        });
        var getWasmTableEntry = funcPtr => {
          var func = wasmTableMirror[funcPtr];
          if (!func) {
            if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
            wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
          }
          return func;
        };
        var updateTableMap = (offset, count) => {
          if (functionsInTableMap) {
            for (var i = offset; i < offset + count; i++) {
              var item = getWasmTableEntry(i);
              // Ignore null values.
              if (item) {
                functionsInTableMap.set(item, i);
              }
            }
          }
        };
        var functionsInTableMap;
        var getFunctionAddress = func => {
          // First, create the map if this is the first use.
          if (!functionsInTableMap) {
            functionsInTableMap = new WeakMap;
            updateTableMap(0, wasmTable.length);
          }
          return functionsInTableMap.get(func) || 0;
        };
        var freeTableIndexes = [];
        var getEmptyTableSlot = () => {
          // Reuse a free index if there is one, otherwise grow.
          if (freeTableIndexes.length) {
            return freeTableIndexes.pop();
          }
          // Grow the table
          try {
            wasmTable.grow(1);
          } catch (err) {
            if (!(err instanceof RangeError)) {
              throw err;
            }
            throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
          }
          return wasmTable.length - 1;
        };
        var setWasmTableEntry = (idx, func) => {
          wasmTable.set(idx, func);
          // With ABORT_ON_WASM_EXCEPTIONS wasmTable.get is overridden to return wrapped
          // functions so we need to call it here to retrieve the potential wrapper correctly
          // instead of just storing 'func' directly into wasmTableMirror
          wasmTableMirror[idx] = wasmTable.get(idx);
        };
        /** @param {string=} sig */ var addFunction = (func, sig) => {
          // Check if the function is already in the table, to ensure each function
          // gets a unique index.
          var rtn = getFunctionAddress(func);
          if (rtn) {
            return rtn;
          }
          // It's not in the table, add it now.
          var ret = getEmptyTableSlot();
          // Set the new value.
          try {
            // Attempting to call this with JS function will cause of table.set() to fail
            setWasmTableEntry(ret, func);
          } catch (err) {
            if (!(err instanceof TypeError)) {
              throw err;
            }
            var wrapped = convertJsFunctionToWasm(func, sig);
            setWasmTableEntry(ret, wrapped);
          }
          functionsInTableMap.set(func, ret);
          return ret;
        };
        var updateGOT = (exports, replace) => {
          for (var symName in exports) {
            if (isInternalSym(symName)) {
              continue;
            }
            var value = exports[symName];
            if (symName.startsWith("orig$")) {
              symName = symName.split("$")[1];
              replace = true;
            }
            GOT[symName] ||= new WebAssembly.Global({
              "value": "i32",
              "mutable": true
            });
            if (replace || GOT[symName].value == 0) {
              if (typeof value == "function") {
                GOT[symName].value = addFunction(value);
              } else if (typeof value == "number") {
                GOT[symName].value = value;
              } else {
                err(`unhandled export type for '${symName}': ${typeof value}`);
              }
            }
          }
        };
        /** @param {boolean=} replace */ var relocateExports = (exports, memoryBase, replace) => {
          var relocated = {};
          for (var e in exports) {
            var value = exports[e];
            if (typeof value == "object") {
              // a breaking change in the wasm spec, globals are now objects
              // https://github.com/WebAssembly/mutable-global/issues/1
              value = value.value;
            }
            if (typeof value == "number") {
              value += memoryBase;
            }
            relocated[e] = value;
          }
          updateGOT(relocated, replace);
          return relocated;
        };
        var isSymbolDefined = symName => {
          // Ignore 'stub' symbols that are auto-generated as part of the original
          // `wasmImports` used to instantiate the main module.
          var existing = wasmImports[symName];
          if (!existing || existing.stub) {
            return false;
          }
          return true;
        };
        var dynCallLegacy = (sig, ptr, args) => {
          sig = sig.replace(/p/g, "i");
          var f = Module["dynCall_" + sig];
          return f(ptr, ...args);
        };
        var dynCall = (sig, ptr, args = []) => {
          // Without WASM_BIGINT support we cannot directly call function with i64 as
          // part of their signature, so we rely on the dynCall functions generated by
          // wasm-emscripten-finalize
          if (sig.includes("j")) {
            return dynCallLegacy(sig, ptr, args);
          }
          var rtn = getWasmTableEntry(ptr)(...args);
          return rtn;
        };
        var stackSave = () => _emscripten_stack_get_current();
        var stackRestore = val => __emscripten_stack_restore(val);
        var createInvokeFunction = sig => (ptr, ...args) => {
          var sp = stackSave();
          try {
            return dynCall(sig, ptr, args);
          } catch (e) {
            stackRestore(sp);
            // Create a try-catch guard that rethrows the Emscripten EH exception.
            // Exceptions thrown from C++ will be a pointer (number) and longjmp
            // will throw the number Infinity. Use the compact and fast "e !== e+0"
            // test to check if e was not a Number.
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        };
        var resolveGlobalSymbol = (symName, direct = false) => {
          var sym;
          // First look for the orig$ symbol which is the symbol without i64
          // legalization performed.
          if (direct && ("orig$" + symName in wasmImports)) {
            symName = "orig$" + symName;
          }
          if (isSymbolDefined(symName)) {
            sym = wasmImports[symName];
          } else // Asm.js-style exception handling: invoke wrapper generation
          if (symName.startsWith("invoke_")) {
            // Create (and cache) new invoke_ functions on demand.
            sym = wasmImports[symName] = createInvokeFunction(symName.split("_")[1]);
          }
          return {
            sym: sym,
            name: symName
          };
        };
        /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        /**
      * @param {string=} libName
      * @param {Object=} localScope
      * @param {number=} handle
      */ var loadWebAssemblyModule = (binary, flags, libName, localScope, handle) => {
          var metadata = getDylinkMetadata(binary);
          currentModuleWeakSymbols = metadata.weakImports;
          // loadModule loads the wasm module after all its dependencies have been loaded.
          // can be called both sync/async.
          function loadModule() {
            // The first thread to load a given module needs to allocate the static
            // table and memory regions.  Later threads re-use the same table region
            // and can ignore the memory region (since memory is shared between
            // threads already).
            // If `handle` is specified than it is assumed that the calling thread has
            // exclusive access to it for the duration of this function.  See the
            // locking in `dynlink.c`.
            var firstLoad = !handle || !HEAP8[(handle) + (8)];
            if (firstLoad) {
              // alignments are powers of 2
              var memAlign = Math.pow(2, metadata.memoryAlign);
              // prepare memory
              var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0;
              // TODO: add to cleanups
              var tableBase = metadata.tableSize ? wasmTable.length : 0;
              if (handle) {
                HEAP8[(handle) + (8)] = 1;
                LE_HEAP_STORE_U32((((handle) + (12)) >> 2) * 4, memoryBase);
                LE_HEAP_STORE_I32((((handle) + (16)) >> 2) * 4, metadata.memorySize);
                LE_HEAP_STORE_U32((((handle) + (20)) >> 2) * 4, tableBase);
                LE_HEAP_STORE_I32((((handle) + (24)) >> 2) * 4, metadata.tableSize);
              }
            } else {
              memoryBase = LE_HEAP_LOAD_U32((((handle) + (12)) >> 2) * 4);
              tableBase = LE_HEAP_LOAD_U32((((handle) + (20)) >> 2) * 4);
            }
            var tableGrowthNeeded = tableBase + metadata.tableSize - wasmTable.length;
            if (tableGrowthNeeded > 0) {
              wasmTable.grow(tableGrowthNeeded);
            }
            // This is the export map that we ultimately return.  We declare it here
            // so it can be used within resolveSymbol.  We resolve symbols against
            // this local symbol map in the case there they are not present on the
            // global Module object.  We need this fallback because Modules sometime
            // need to import their own symbols
            var moduleExports;
            function resolveSymbol(sym) {
              var resolved = resolveGlobalSymbol(sym).sym;
              if (!resolved && localScope) {
                resolved = localScope[sym];
              }
              if (!resolved) {
                resolved = moduleExports[sym];
              }
              return resolved;
            }
            // TODO kill ↓↓↓ (except "symbols local to this module", it will likely be
            // not needed if we require that if A wants symbols from B it has to link
            // to B explicitly: similarly to -Wl,--no-undefined)
            // wasm dynamic libraries are pure wasm, so they cannot assist in
            // their own loading. When side module A wants to import something
            // provided by a side module B that is loaded later, we need to
            // add a layer of indirection, but worse, we can't even tell what
            // to add the indirection for, without inspecting what A's imports
            // are. To do that here, we use a JS proxy (another option would
            // be to inspect the binary directly).
            var proxyHandler = {
              get(stubs, prop) {
                // symbols that should be local to this module
                switch (prop) {
                 case "__memory_base":
                  return memoryBase;

                 case "__table_base":
                  return tableBase;
                }
                if (prop in wasmImports && !wasmImports[prop].stub) {
                  // No stub needed, symbol already exists in symbol table
                  return wasmImports[prop];
                }
                // Return a stub function that will resolve the symbol
                // when first called.
                if (!(prop in stubs)) {
                  var resolved;
                  stubs[prop] = (...args) => {
                    resolved ||= resolveSymbol(prop);
                    return resolved(...args);
                  };
                }
                return stubs[prop];
              }
            };
            var proxy = new Proxy({}, proxyHandler);
            var info = {
              "GOT.mem": new Proxy({}, GOTHandler),
              "GOT.func": new Proxy({}, GOTHandler),
              "env": proxy,
              "wasi_snapshot_preview1": proxy
            };
            function postInstantiation(module, instance) {
              // add new entries to functionsInTableMap
              updateTableMap(tableBase, metadata.tableSize);
              moduleExports = relocateExports(instance.exports, memoryBase);
              if (!flags.allowUndefined) {
                reportUndefinedSymbols();
              }
              function addEmAsm(addr, body) {
                var args = [];
                var arity = 0;
                for (;arity < 16; arity++) {
                  if (body.indexOf("$" + arity) != -1) {
                    args.push("$" + arity);
                  } else {
                    break;
                  }
                }
                args = args.join(",");
                var func = `(${args}) => { ${body} };`;
                ASM_CONSTS[start] = eval(func);
              }
              // Add any EM_ASM function that exist in the side module
              if ("__start_em_asm" in moduleExports) {
                var start = moduleExports["__start_em_asm"];
                var stop = moduleExports["__stop_em_asm"];
                while (start < stop) {
                  var jsString = UTF8ToString(start);
                  addEmAsm(start, jsString);
                  start = HEAPU8.indexOf(0, start) + 1;
                }
              }
              function addEmJs(name, cSig, body) {
                // The signature here is a C signature (e.g. "(int foo, char* bar)").
                // See `create_em_js` in emcc.py` for the build-time version of this
                // code.
                var jsArgs = [];
                cSig = cSig.slice(1, -1);
                if (cSig != "void") {
                  cSig = cSig.split(",");
                  for (var i in cSig) {
                    var jsArg = cSig[i].split(" ").pop();
                    jsArgs.push(jsArg.replace("*", ""));
                  }
                }
                var func = `(${jsArgs}) => ${body};`;
                moduleExports[name] = eval(func);
              }
              for (var name in moduleExports) {
                if (name.startsWith("__em_js__")) {
                  var start = moduleExports[name];
                  var jsString = UTF8ToString(start);
                  // EM_JS strings are stored in the data section in the form
                  // SIG<::>BODY.
                  var parts = jsString.split("<::>");
                  addEmJs(name.replace("__em_js__", ""), parts[0], parts[1]);
                  delete moduleExports[name];
                }
              }
              // initialize the module
              var applyRelocs = moduleExports["__wasm_apply_data_relocs"];
              if (applyRelocs) {
                if (runtimeInitialized) {
                  applyRelocs();
                } else {
                  __RELOC_FUNCS__.push(applyRelocs);
                }
              }
              var init = moduleExports["__wasm_call_ctors"];
              if (init) {
                if (runtimeInitialized) {
                  init();
                } else {
                  // we aren't ready to run compiled code yet
                  __ATINIT__.push(init);
                }
              }
              return moduleExports;
            }
            if (flags.loadAsync) {
              if (binary instanceof WebAssembly.Module) {
                var instance = new WebAssembly.Instance(binary, info);
                return Promise.resolve(postInstantiation(binary, instance));
              }
              return WebAssembly.instantiate(binary, info).then(result => postInstantiation(result.module, result.instance));
            }
            var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
            var instance = new WebAssembly.Instance(module, info);
            return postInstantiation(module, instance);
          }
          // now load needed libraries and the module itself.
          if (flags.loadAsync) {
            return metadata.neededDynlibs.reduce((chain, dynNeeded) => chain.then(() => loadDynamicLibrary(dynNeeded, flags, localScope)), Promise.resolve()).then(loadModule);
          }
          metadata.neededDynlibs.forEach(needed => loadDynamicLibrary(needed, flags, localScope));
          return loadModule();
        };
        var mergeLibSymbols = (exports, libName) => {
          // add symbols into global namespace TODO: weak linking etc.
          for (var [sym, exp] of Object.entries(exports)) {
            // When RTLD_GLOBAL is enabled, the symbols defined by this shared object
            // will be made available for symbol resolution of subsequently loaded
            // shared objects.
            // We should copy the symbols (which include methods and variables) from
            // SIDE_MODULE to MAIN_MODULE.
            const setImport = target => {
              if (!isSymbolDefined(target)) {
                wasmImports[target] = exp;
              }
            };
            setImport(sym);
            // Special case for handling of main symbol:  If a side module exports
            // `main` that also acts a definition for `__main_argc_argv` and vice
            // versa.
            const main_alias = "__main_argc_argv";
            if (sym == "main") {
              setImport(main_alias);
            }
            if (sym == main_alias) {
              setImport("main");
            }
            if (sym.startsWith("dynCall_") && !Module.hasOwnProperty(sym)) {
              Module[sym] = exp;
            }
          }
        };
        /** @param {boolean=} noRunDep */ var asyncLoad = (url, onload, onerror, noRunDep) => {
          var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
          readAsync(url).then(arrayBuffer => {
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          }, err => {
            if (onerror) {
              onerror();
            } else {
              throw `Loading data file "${url}" failed.`;
            }
          });
          if (dep) addRunDependency(dep);
        };
        /**
       * @param {number=} handle
       * @param {Object=} localScope
       */ function loadDynamicLibrary(libName, flags = {
          global: true,
          nodelete: true
        }, localScope, handle) {
          // when loadDynamicLibrary did not have flags, libraries were loaded
          // globally & permanently
          var dso = LDSO.loadedLibsByName[libName];
          if (dso) {
            // the library is being loaded or has been loaded already.
            if (!flags.global) {
              if (localScope) {
                Object.assign(localScope, dso.exports);
              }
            } else if (!dso.global) {
              // The library was previously loaded only locally but not
              // we have a request with global=true.
              dso.global = true;
              mergeLibSymbols(dso.exports, libName);
            }
            // same for "nodelete"
            if (flags.nodelete && dso.refcount !== Infinity) {
              dso.refcount = Infinity;
            }
            dso.refcount++;
            if (handle) {
              LDSO.loadedLibsByHandle[handle] = dso;
            }
            return flags.loadAsync ? Promise.resolve(true) : true;
          }
          // allocate new DSO
          dso = newDSO(libName, handle, "loading");
          dso.refcount = flags.nodelete ? Infinity : 1;
          dso.global = flags.global;
          // libName -> libData
          function loadLibData() {
            // for wasm, we can use fetch for async, but for fs mode we can only imitate it
            if (handle) {
              var data = LE_HEAP_LOAD_U32((((handle) + (28)) >> 2) * 4);
              var dataSize = LE_HEAP_LOAD_U32((((handle) + (32)) >> 2) * 4);
              if (data && dataSize) {
                var libData = HEAP8.slice(data, data + dataSize);
                return flags.loadAsync ? Promise.resolve(libData) : libData;
              }
            }
            var libFile = locateFile(libName);
            if (flags.loadAsync) {
              return new Promise(function(resolve, reject) {
                asyncLoad(libFile, resolve, reject);
              });
            }
            // load the binary synchronously
            if (!readBinary) {
              throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`);
            }
            return readBinary(libFile);
          }
          // libName -> exports
          function getExports() {
            // module not preloaded - load lib data and create new module from it
            if (flags.loadAsync) {
              return loadLibData().then(libData => loadWebAssemblyModule(libData, flags, libName, localScope, handle));
            }
            return loadWebAssemblyModule(loadLibData(), flags, libName, localScope, handle);
          }
          // module for lib is loaded - update the dso & global namespace
          function moduleLoaded(exports) {
            if (dso.global) {
              mergeLibSymbols(exports, libName);
            } else if (localScope) {
              Object.assign(localScope, exports);
            }
            dso.exports = exports;
          }
          if (flags.loadAsync) {
            return getExports().then(exports => {
              moduleLoaded(exports);
              return true;
            });
          }
          moduleLoaded(getExports());
          return true;
        }
        var reportUndefinedSymbols = () => {
          for (var [symName, entry] of Object.entries(GOT)) {
            if (entry.value == 0) {
              var value = resolveGlobalSymbol(symName, true).sym;
              if (!value && !entry.required) {
                // Ignore undefined symbols that are imported as weak.
                continue;
              }
              if (typeof value == "function") {
                /** @suppress {checkTypes} */ entry.value = addFunction(value, value.sig);
              } else if (typeof value == "number") {
                entry.value = value;
              } else {
                throw new Error(`bad export type for '${symName}': ${typeof value}`);
              }
            }
          }
        };
        var loadDylibs = () => {
          if (!dynamicLibraries.length) {
            reportUndefinedSymbols();
            return;
          }
          // Load binaries asynchronously
          addRunDependency("loadDylibs");
          dynamicLibraries.reduce((chain, lib) => chain.then(() => loadDynamicLibrary(lib, {
            loadAsync: true,
            global: true,
            nodelete: true,
            allowUndefined: true
          })), Promise.resolve()).then(() => {
            // we got them all, wonderful
            reportUndefinedSymbols();
            removeRunDependency("loadDylibs");
          });
        };
        var noExitRuntime = Module["noExitRuntime"] || true;
        /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
          if (type.endsWith("*")) type = "*";
          switch (type) {
           case "i1":
            HEAP8[ptr] = value;
            break;

           case "i8":
            HEAP8[ptr] = value;
            break;

           case "i16":
            LE_HEAP_STORE_I16(((ptr) >> 1) * 2, value);
            break;

           case "i32":
            LE_HEAP_STORE_I32(((ptr) >> 2) * 4, value);
            break;

           case "i64":
            abort("to do setValue(i64) use WASM_BIGINT");

           case "float":
            LE_HEAP_STORE_F32(((ptr) >> 2) * 4, value);
            break;

           case "double":
            LE_HEAP_STORE_F64(((ptr) >> 3) * 8, value);
            break;

           case "*":
            LE_HEAP_STORE_U32(((ptr) >> 2) * 4, value);
            break;

           default:
            abort(`invalid type for setValue: ${type}`);
          }
        }
        var ___memory_base = new WebAssembly.Global({
          "value": "i32",
          "mutable": false
        }, 1024);
        var ___stack_pointer = new WebAssembly.Global({
          "value": "i32",
          "mutable": true
        }, 78112);
        var ___table_base = new WebAssembly.Global({
          "value": "i32",
          "mutable": false
        }, 1);
        var __abort_js = () => {
          abort("");
        };
        __abort_js.sig = "v";
        var nowIsMonotonic = 1;
        var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
        __emscripten_get_now_is_monotonic.sig = "i";
        var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
        __emscripten_memcpy_js.sig = "vppp";
        var _emscripten_date_now = () => Date.now();
        _emscripten_date_now.sig = "d";
        var _emscripten_get_now;
        // Modern environment where performance.now() is supported:
        // N.B. a shorter form "_emscripten_get_now = performance.now;" is
        // unfortunately not allowed even in current browsers (e.g. FF Nightly 75).
        _emscripten_get_now = () => performance.now();
        _emscripten_get_now.sig = "d";
        var getHeapMax = () => // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
        // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
        // for any code that deals with heap sizes, which would require special
        // casing all heap size related code to treat 0 specially.
        2147483648;
        var growMemory = size => {
          var b = wasmMemory.buffer;
          var pages = (size - b.byteLength + 65535) / 65536;
          try {
            // round size grow request up to wasm page size (fixed 64KB per spec)
            wasmMemory.grow(pages);
            // .grow() takes a delta compared to the previous size
            updateMemoryViews();
            return 1;
          } /*success*/ catch (e) {}
        };
        // implicit 0 return to save code size (caller will cast "undefined" into 0
        // anyhow)
        var _emscripten_resize_heap = requestedSize => {
          var oldSize = HEAPU8.length;
          // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
          requestedSize >>>= 0;
          // With multithreaded builds, races can happen (another thread might increase the size
          // in between), so return a failure, and let the caller retry.
          // Memory resize rules:
          // 1.  Always increase heap size to at least the requested size, rounded up
          //     to next page multiple.
          // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
          //     geometrically: increase the heap size according to
          //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
          //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
          // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
          //     linearly: increase the heap size by at least
          //     MEMORY_GROWTH_LINEAR_STEP bytes.
          // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
          //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
          // 4.  If we were unable to allocate as much memory, it may be due to
          //     over-eager decision to excessively reserve due to (3) above.
          //     Hence if an allocation fails, cut down on the amount of excess
          //     growth, in an attempt to succeed to perform a smaller allocation.
          // A limit is set for how much we can grow. We should not exceed that
          // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          // Loop through potential heap size increases. If we attempt a too eager
          // reservation that fails, cut down on the attempted size and reserve a
          // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
            // ensure geometric growth
            // but limit overreserving (default to capping at +96MB overgrowth at most)
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = growMemory(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        };
        _emscripten_resize_heap.sig = "ip";
        var _fd_close = fd => 52;
        _fd_close.sig = "ii";
        var convertI32PairToI53Checked = (lo, hi) => ((hi + 2097152) >>> 0 < 4194305 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
        function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          return 70;
        }
        _fd_seek.sig = "iiiiip";
        var printCharBuffers = [ null, [], [] ];
        var printChar = (stream, curr) => {
          var buffer = printCharBuffers[stream];
          if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        };
        var _fd_write = (fd, iov, iovcnt, pnum) => {
          // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
          var num = 0;
          for (var i = 0; i < iovcnt; i++) {
            var ptr = LE_HEAP_LOAD_U32(((iov) >> 2) * 4);
            var len = LE_HEAP_LOAD_U32((((iov) + (4)) >> 2) * 4);
            iov += 8;
            for (var j = 0; j < len; j++) {
              printChar(fd, HEAPU8[ptr + j]);
            }
            num += len;
          }
          LE_HEAP_STORE_U32(((pnum) >> 2) * 4, num);
          return 0;
        };
        _fd_write.sig = "iippp";
        function _tree_sitter_log_callback(isLexMessage, messageAddress) {
          if (currentLogCallback) {
            const message = UTF8ToString(messageAddress);
            currentLogCallback(message, isLexMessage !== 0);
          }
        }
        function _tree_sitter_parse_callback(inputBufferAddress, index, row, column, lengthAddress) {
          const INPUT_BUFFER_SIZE = 10 * 1024;
          const string = currentParseCallback(index, {
            row: row,
            column: column
          });
          if (typeof string === "string") {
            setValue(lengthAddress, string.length, "i32");
            stringToUTF16(string, inputBufferAddress, INPUT_BUFFER_SIZE);
          } else {
            setValue(lengthAddress, 0, "i32");
          }
        }
        var runtimeKeepaliveCounter = 0;
        var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
        var _proc_exit = code => {
          EXITSTATUS = code;
          if (!keepRuntimeAlive()) {
            Module["onExit"]?.(code);
            ABORT = true;
          }
          quit_(code, new ExitStatus(code));
        };
        _proc_exit.sig = "vi";
        /** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
          EXITSTATUS = status;
          _proc_exit(status);
        };
        var handleException = e => {
          // Certain exception types we do not treat as errors since they are used for
          // internal control flow.
          // 1. ExitStatus, which is thrown by exit()
          // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
          //    that wish to return to JS event loop.
          if (e instanceof ExitStatus || e == "unwind") {
            return EXITSTATUS;
          }
          quit_(1, e);
        };
        var lengthBytesUTF8 = str => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
            // unit, not a Unicode code point of the character! So decode
            // UTF16->UTF32->UTF8.
            // See http://unicode.org/faq/utf_bom.html#utf16-3
            var c = str.charCodeAt(i);
            // possibly a lead surrogate
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        };
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
          // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
          // undefined and false each don't write out any bytes.
          if (!(maxBytesToWrite > 0)) return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          // -1 for string null terminator.
          for (var i = 0; i < str.length; ++i) {
            // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
            // unit, not a Unicode code point of the character! So decode
            // UTF16->UTF32->UTF8.
            // See http://unicode.org/faq/utf_bom.html#utf16-3
            // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
            // and https://www.ietf.org/rfc/rfc2279.txt
            // and https://tools.ietf.org/html/rfc3629
            var u = str.charCodeAt(i);
            // possibly a lead surrogate
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
            }
            if (u <= 127) {
              if (outIdx >= endIdx) break;
              heap[outIdx++] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              heap[outIdx++] = 192 | (u >> 6);
              heap[outIdx++] = 128 | (u & 63);
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              heap[outIdx++] = 224 | (u >> 12);
              heap[outIdx++] = 128 | ((u >> 6) & 63);
              heap[outIdx++] = 128 | (u & 63);
            } else {
              if (outIdx + 3 >= endIdx) break;
              heap[outIdx++] = 240 | (u >> 18);
              heap[outIdx++] = 128 | ((u >> 12) & 63);
              heap[outIdx++] = 128 | ((u >> 6) & 63);
              heap[outIdx++] = 128 | (u & 63);
            }
          }
          // Null-terminate the pointer to the buffer.
          heap[outIdx] = 0;
          return outIdx - startIdx;
        };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        var stackAlloc = sz => __emscripten_stack_alloc(sz);
        var stringToUTF8OnStack = str => {
          var size = lengthBytesUTF8(str) + 1;
          var ret = stackAlloc(size);
          stringToUTF8(str, ret, size);
          return ret;
        };
        var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
          // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
          maxBytesToWrite ??= 2147483647;
          if (maxBytesToWrite < 2) return 0;
          maxBytesToWrite -= 2;
          // Null terminator.
          var startPtr = outPtr;
          var numCharsToWrite = (maxBytesToWrite < str.length * 2) ? (maxBytesToWrite / 2) : str.length;
          for (var i = 0; i < numCharsToWrite; ++i) {
            // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
            var codeUnit = str.charCodeAt(i);
            // possibly a lead surrogate
            LE_HEAP_STORE_I16(((outPtr) >> 1) * 2, codeUnit);
            outPtr += 2;
          }
          // Null-terminate the pointer to the HEAP.
          LE_HEAP_STORE_I16(((outPtr) >> 1) * 2, 0);
          return outPtr - startPtr;
        };
        var AsciiToString = ptr => {
          var str = "";
          while (1) {
            var ch = HEAPU8[ptr++];
            if (!ch) return str;
            str += String.fromCharCode(ch);
          }
        };
        var wasmImports = {
          /** @export */ __heap_base: ___heap_base,
          /** @export */ __indirect_function_table: wasmTable,
          /** @export */ __memory_base: ___memory_base,
          /** @export */ __stack_pointer: ___stack_pointer,
          /** @export */ __table_base: ___table_base,
          /** @export */ _abort_js: __abort_js,
          /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
          /** @export */ _emscripten_memcpy_js: __emscripten_memcpy_js,
          /** @export */ emscripten_get_now: _emscripten_get_now,
          /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
          /** @export */ fd_close: _fd_close,
          /** @export */ fd_seek: _fd_seek,
          /** @export */ fd_write: _fd_write,
          /** @export */ memory: wasmMemory,
          /** @export */ tree_sitter_log_callback: _tree_sitter_log_callback,
          /** @export */ tree_sitter_parse_callback: _tree_sitter_parse_callback
        };
        var wasmExports = createWasm();
        var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])();
        var ___wasm_apply_data_relocs = () => (___wasm_apply_data_relocs = wasmExports["__wasm_apply_data_relocs"])();
        var _malloc = Module["_malloc"] = a0 => (_malloc = Module["_malloc"] = wasmExports["malloc"])(a0);
        var _calloc = Module["_calloc"] = (a0, a1) => (_calloc = Module["_calloc"] = wasmExports["calloc"])(a0, a1);
        var _realloc = Module["_realloc"] = (a0, a1) => (_realloc = Module["_realloc"] = wasmExports["realloc"])(a0, a1);
        var _free = Module["_free"] = a0 => (_free = Module["_free"] = wasmExports["free"])(a0);
        var _ts_language_symbol_count = Module["_ts_language_symbol_count"] = a0 => (_ts_language_symbol_count = Module["_ts_language_symbol_count"] = wasmExports["ts_language_symbol_count"])(a0);
        var _ts_language_state_count = Module["_ts_language_state_count"] = a0 => (_ts_language_state_count = Module["_ts_language_state_count"] = wasmExports["ts_language_state_count"])(a0);
        var _ts_language_version = Module["_ts_language_version"] = a0 => (_ts_language_version = Module["_ts_language_version"] = wasmExports["ts_language_version"])(a0);
        var _ts_language_field_count = Module["_ts_language_field_count"] = a0 => (_ts_language_field_count = Module["_ts_language_field_count"] = wasmExports["ts_language_field_count"])(a0);
        var _ts_language_next_state = Module["_ts_language_next_state"] = (a0, a1, a2) => (_ts_language_next_state = Module["_ts_language_next_state"] = wasmExports["ts_language_next_state"])(a0, a1, a2);
        var _ts_language_symbol_name = Module["_ts_language_symbol_name"] = (a0, a1) => (_ts_language_symbol_name = Module["_ts_language_symbol_name"] = wasmExports["ts_language_symbol_name"])(a0, a1);
        var _ts_language_symbol_for_name = Module["_ts_language_symbol_for_name"] = (a0, a1, a2, a3) => (_ts_language_symbol_for_name = Module["_ts_language_symbol_for_name"] = wasmExports["ts_language_symbol_for_name"])(a0, a1, a2, a3);
        var _strncmp = Module["_strncmp"] = (a0, a1, a2) => (_strncmp = Module["_strncmp"] = wasmExports["strncmp"])(a0, a1, a2);
        var _ts_language_symbol_type = Module["_ts_language_symbol_type"] = (a0, a1) => (_ts_language_symbol_type = Module["_ts_language_symbol_type"] = wasmExports["ts_language_symbol_type"])(a0, a1);
        var _ts_language_field_name_for_id = Module["_ts_language_field_name_for_id"] = (a0, a1) => (_ts_language_field_name_for_id = Module["_ts_language_field_name_for_id"] = wasmExports["ts_language_field_name_for_id"])(a0, a1);
        var _ts_lookahead_iterator_new = Module["_ts_lookahead_iterator_new"] = (a0, a1) => (_ts_lookahead_iterator_new = Module["_ts_lookahead_iterator_new"] = wasmExports["ts_lookahead_iterator_new"])(a0, a1);
        var _ts_lookahead_iterator_delete = Module["_ts_lookahead_iterator_delete"] = a0 => (_ts_lookahead_iterator_delete = Module["_ts_lookahead_iterator_delete"] = wasmExports["ts_lookahead_iterator_delete"])(a0);
        var _ts_lookahead_iterator_reset_state = Module["_ts_lookahead_iterator_reset_state"] = (a0, a1) => (_ts_lookahead_iterator_reset_state = Module["_ts_lookahead_iterator_reset_state"] = wasmExports["ts_lookahead_iterator_reset_state"])(a0, a1);
        var _ts_lookahead_iterator_reset = Module["_ts_lookahead_iterator_reset"] = (a0, a1, a2) => (_ts_lookahead_iterator_reset = Module["_ts_lookahead_iterator_reset"] = wasmExports["ts_lookahead_iterator_reset"])(a0, a1, a2);
        var _ts_lookahead_iterator_next = Module["_ts_lookahead_iterator_next"] = a0 => (_ts_lookahead_iterator_next = Module["_ts_lookahead_iterator_next"] = wasmExports["ts_lookahead_iterator_next"])(a0);
        var _ts_lookahead_iterator_current_symbol = Module["_ts_lookahead_iterator_current_symbol"] = a0 => (_ts_lookahead_iterator_current_symbol = Module["_ts_lookahead_iterator_current_symbol"] = wasmExports["ts_lookahead_iterator_current_symbol"])(a0);
        var _memset = Module["_memset"] = (a0, a1, a2) => (_memset = Module["_memset"] = wasmExports["memset"])(a0, a1, a2);
        var _memcpy = Module["_memcpy"] = (a0, a1, a2) => (_memcpy = Module["_memcpy"] = wasmExports["memcpy"])(a0, a1, a2);
        var _ts_parser_delete = Module["_ts_parser_delete"] = a0 => (_ts_parser_delete = Module["_ts_parser_delete"] = wasmExports["ts_parser_delete"])(a0);
        var _ts_parser_reset = Module["_ts_parser_reset"] = a0 => (_ts_parser_reset = Module["_ts_parser_reset"] = wasmExports["ts_parser_reset"])(a0);
        var _ts_parser_set_language = Module["_ts_parser_set_language"] = (a0, a1) => (_ts_parser_set_language = Module["_ts_parser_set_language"] = wasmExports["ts_parser_set_language"])(a0, a1);
        var _ts_parser_timeout_micros = Module["_ts_parser_timeout_micros"] = a0 => (_ts_parser_timeout_micros = Module["_ts_parser_timeout_micros"] = wasmExports["ts_parser_timeout_micros"])(a0);
        var _ts_parser_set_timeout_micros = Module["_ts_parser_set_timeout_micros"] = (a0, a1, a2) => (_ts_parser_set_timeout_micros = Module["_ts_parser_set_timeout_micros"] = wasmExports["ts_parser_set_timeout_micros"])(a0, a1, a2);
        var _ts_parser_set_included_ranges = Module["_ts_parser_set_included_ranges"] = (a0, a1, a2) => (_ts_parser_set_included_ranges = Module["_ts_parser_set_included_ranges"] = wasmExports["ts_parser_set_included_ranges"])(a0, a1, a2);
        var _memmove = Module["_memmove"] = (a0, a1, a2) => (_memmove = Module["_memmove"] = wasmExports["memmove"])(a0, a1, a2);
        var _memcmp = Module["_memcmp"] = (a0, a1, a2) => (_memcmp = Module["_memcmp"] = wasmExports["memcmp"])(a0, a1, a2);
        var _ts_query_new = Module["_ts_query_new"] = (a0, a1, a2, a3, a4) => (_ts_query_new = Module["_ts_query_new"] = wasmExports["ts_query_new"])(a0, a1, a2, a3, a4);
        var _ts_query_delete = Module["_ts_query_delete"] = a0 => (_ts_query_delete = Module["_ts_query_delete"] = wasmExports["ts_query_delete"])(a0);
        var _iswspace = Module["_iswspace"] = a0 => (_iswspace = Module["_iswspace"] = wasmExports["iswspace"])(a0);
        var _iswalnum = Module["_iswalnum"] = a0 => (_iswalnum = Module["_iswalnum"] = wasmExports["iswalnum"])(a0);
        var _ts_query_pattern_count = Module["_ts_query_pattern_count"] = a0 => (_ts_query_pattern_count = Module["_ts_query_pattern_count"] = wasmExports["ts_query_pattern_count"])(a0);
        var _ts_query_capture_count = Module["_ts_query_capture_count"] = a0 => (_ts_query_capture_count = Module["_ts_query_capture_count"] = wasmExports["ts_query_capture_count"])(a0);
        var _ts_query_string_count = Module["_ts_query_string_count"] = a0 => (_ts_query_string_count = Module["_ts_query_string_count"] = wasmExports["ts_query_string_count"])(a0);
        var _ts_query_capture_name_for_id = Module["_ts_query_capture_name_for_id"] = (a0, a1, a2) => (_ts_query_capture_name_for_id = Module["_ts_query_capture_name_for_id"] = wasmExports["ts_query_capture_name_for_id"])(a0, a1, a2);
        var _ts_query_string_value_for_id = Module["_ts_query_string_value_for_id"] = (a0, a1, a2) => (_ts_query_string_value_for_id = Module["_ts_query_string_value_for_id"] = wasmExports["ts_query_string_value_for_id"])(a0, a1, a2);
        var _ts_query_predicates_for_pattern = Module["_ts_query_predicates_for_pattern"] = (a0, a1, a2) => (_ts_query_predicates_for_pattern = Module["_ts_query_predicates_for_pattern"] = wasmExports["ts_query_predicates_for_pattern"])(a0, a1, a2);
        var _ts_query_disable_capture = Module["_ts_query_disable_capture"] = (a0, a1, a2) => (_ts_query_disable_capture = Module["_ts_query_disable_capture"] = wasmExports["ts_query_disable_capture"])(a0, a1, a2);
        var _ts_tree_copy = Module["_ts_tree_copy"] = a0 => (_ts_tree_copy = Module["_ts_tree_copy"] = wasmExports["ts_tree_copy"])(a0);
        var _ts_tree_delete = Module["_ts_tree_delete"] = a0 => (_ts_tree_delete = Module["_ts_tree_delete"] = wasmExports["ts_tree_delete"])(a0);
        var _ts_init = Module["_ts_init"] = () => (_ts_init = Module["_ts_init"] = wasmExports["ts_init"])();
        var _ts_parser_new_wasm = Module["_ts_parser_new_wasm"] = () => (_ts_parser_new_wasm = Module["_ts_parser_new_wasm"] = wasmExports["ts_parser_new_wasm"])();
        var _ts_parser_enable_logger_wasm = Module["_ts_parser_enable_logger_wasm"] = (a0, a1) => (_ts_parser_enable_logger_wasm = Module["_ts_parser_enable_logger_wasm"] = wasmExports["ts_parser_enable_logger_wasm"])(a0, a1);
        var _ts_parser_parse_wasm = Module["_ts_parser_parse_wasm"] = (a0, a1, a2, a3, a4) => (_ts_parser_parse_wasm = Module["_ts_parser_parse_wasm"] = wasmExports["ts_parser_parse_wasm"])(a0, a1, a2, a3, a4);
        var _ts_parser_included_ranges_wasm = Module["_ts_parser_included_ranges_wasm"] = a0 => (_ts_parser_included_ranges_wasm = Module["_ts_parser_included_ranges_wasm"] = wasmExports["ts_parser_included_ranges_wasm"])(a0);
        var _ts_language_type_is_named_wasm = Module["_ts_language_type_is_named_wasm"] = (a0, a1) => (_ts_language_type_is_named_wasm = Module["_ts_language_type_is_named_wasm"] = wasmExports["ts_language_type_is_named_wasm"])(a0, a1);
        var _ts_language_type_is_visible_wasm = Module["_ts_language_type_is_visible_wasm"] = (a0, a1) => (_ts_language_type_is_visible_wasm = Module["_ts_language_type_is_visible_wasm"] = wasmExports["ts_language_type_is_visible_wasm"])(a0, a1);
        var _ts_tree_root_node_wasm = Module["_ts_tree_root_node_wasm"] = a0 => (_ts_tree_root_node_wasm = Module["_ts_tree_root_node_wasm"] = wasmExports["ts_tree_root_node_wasm"])(a0);
        var _ts_tree_root_node_with_offset_wasm = Module["_ts_tree_root_node_with_offset_wasm"] = a0 => (_ts_tree_root_node_with_offset_wasm = Module["_ts_tree_root_node_with_offset_wasm"] = wasmExports["ts_tree_root_node_with_offset_wasm"])(a0);
        var _ts_tree_edit_wasm = Module["_ts_tree_edit_wasm"] = a0 => (_ts_tree_edit_wasm = Module["_ts_tree_edit_wasm"] = wasmExports["ts_tree_edit_wasm"])(a0);
        var _ts_tree_included_ranges_wasm = Module["_ts_tree_included_ranges_wasm"] = a0 => (_ts_tree_included_ranges_wasm = Module["_ts_tree_included_ranges_wasm"] = wasmExports["ts_tree_included_ranges_wasm"])(a0);
        var _ts_tree_get_changed_ranges_wasm = Module["_ts_tree_get_changed_ranges_wasm"] = (a0, a1) => (_ts_tree_get_changed_ranges_wasm = Module["_ts_tree_get_changed_ranges_wasm"] = wasmExports["ts_tree_get_changed_ranges_wasm"])(a0, a1);
        var _ts_tree_cursor_new_wasm = Module["_ts_tree_cursor_new_wasm"] = a0 => (_ts_tree_cursor_new_wasm = Module["_ts_tree_cursor_new_wasm"] = wasmExports["ts_tree_cursor_new_wasm"])(a0);
        var _ts_tree_cursor_delete_wasm = Module["_ts_tree_cursor_delete_wasm"] = a0 => (_ts_tree_cursor_delete_wasm = Module["_ts_tree_cursor_delete_wasm"] = wasmExports["ts_tree_cursor_delete_wasm"])(a0);
        var _ts_tree_cursor_reset_wasm = Module["_ts_tree_cursor_reset_wasm"] = a0 => (_ts_tree_cursor_reset_wasm = Module["_ts_tree_cursor_reset_wasm"] = wasmExports["ts_tree_cursor_reset_wasm"])(a0);
        var _ts_tree_cursor_reset_to_wasm = Module["_ts_tree_cursor_reset_to_wasm"] = (a0, a1) => (_ts_tree_cursor_reset_to_wasm = Module["_ts_tree_cursor_reset_to_wasm"] = wasmExports["ts_tree_cursor_reset_to_wasm"])(a0, a1);
        var _ts_tree_cursor_goto_first_child_wasm = Module["_ts_tree_cursor_goto_first_child_wasm"] = a0 => (_ts_tree_cursor_goto_first_child_wasm = Module["_ts_tree_cursor_goto_first_child_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_wasm"])(a0);
        var _ts_tree_cursor_goto_last_child_wasm = Module["_ts_tree_cursor_goto_last_child_wasm"] = a0 => (_ts_tree_cursor_goto_last_child_wasm = Module["_ts_tree_cursor_goto_last_child_wasm"] = wasmExports["ts_tree_cursor_goto_last_child_wasm"])(a0);
        var _ts_tree_cursor_goto_first_child_for_index_wasm = Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = a0 => (_ts_tree_cursor_goto_first_child_for_index_wasm = Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_index_wasm"])(a0);
        var _ts_tree_cursor_goto_first_child_for_position_wasm = Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = a0 => (_ts_tree_cursor_goto_first_child_for_position_wasm = Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_position_wasm"])(a0);
        var _ts_tree_cursor_goto_next_sibling_wasm = Module["_ts_tree_cursor_goto_next_sibling_wasm"] = a0 => (_ts_tree_cursor_goto_next_sibling_wasm = Module["_ts_tree_cursor_goto_next_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_next_sibling_wasm"])(a0);
        var _ts_tree_cursor_goto_previous_sibling_wasm = Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = a0 => (_ts_tree_cursor_goto_previous_sibling_wasm = Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_previous_sibling_wasm"])(a0);
        var _ts_tree_cursor_goto_descendant_wasm = Module["_ts_tree_cursor_goto_descendant_wasm"] = (a0, a1) => (_ts_tree_cursor_goto_descendant_wasm = Module["_ts_tree_cursor_goto_descendant_wasm"] = wasmExports["ts_tree_cursor_goto_descendant_wasm"])(a0, a1);
        var _ts_tree_cursor_goto_parent_wasm = Module["_ts_tree_cursor_goto_parent_wasm"] = a0 => (_ts_tree_cursor_goto_parent_wasm = Module["_ts_tree_cursor_goto_parent_wasm"] = wasmExports["ts_tree_cursor_goto_parent_wasm"])(a0);
        var _ts_tree_cursor_current_node_type_id_wasm = Module["_ts_tree_cursor_current_node_type_id_wasm"] = a0 => (_ts_tree_cursor_current_node_type_id_wasm = Module["_ts_tree_cursor_current_node_type_id_wasm"] = wasmExports["ts_tree_cursor_current_node_type_id_wasm"])(a0);
        var _ts_tree_cursor_current_node_state_id_wasm = Module["_ts_tree_cursor_current_node_state_id_wasm"] = a0 => (_ts_tree_cursor_current_node_state_id_wasm = Module["_ts_tree_cursor_current_node_state_id_wasm"] = wasmExports["ts_tree_cursor_current_node_state_id_wasm"])(a0);
        var _ts_tree_cursor_current_node_is_named_wasm = Module["_ts_tree_cursor_current_node_is_named_wasm"] = a0 => (_ts_tree_cursor_current_node_is_named_wasm = Module["_ts_tree_cursor_current_node_is_named_wasm"] = wasmExports["ts_tree_cursor_current_node_is_named_wasm"])(a0);
        var _ts_tree_cursor_current_node_is_missing_wasm = Module["_ts_tree_cursor_current_node_is_missing_wasm"] = a0 => (_ts_tree_cursor_current_node_is_missing_wasm = Module["_ts_tree_cursor_current_node_is_missing_wasm"] = wasmExports["ts_tree_cursor_current_node_is_missing_wasm"])(a0);
        var _ts_tree_cursor_current_node_id_wasm = Module["_ts_tree_cursor_current_node_id_wasm"] = a0 => (_ts_tree_cursor_current_node_id_wasm = Module["_ts_tree_cursor_current_node_id_wasm"] = wasmExports["ts_tree_cursor_current_node_id_wasm"])(a0);
        var _ts_tree_cursor_start_position_wasm = Module["_ts_tree_cursor_start_position_wasm"] = a0 => (_ts_tree_cursor_start_position_wasm = Module["_ts_tree_cursor_start_position_wasm"] = wasmExports["ts_tree_cursor_start_position_wasm"])(a0);
        var _ts_tree_cursor_end_position_wasm = Module["_ts_tree_cursor_end_position_wasm"] = a0 => (_ts_tree_cursor_end_position_wasm = Module["_ts_tree_cursor_end_position_wasm"] = wasmExports["ts_tree_cursor_end_position_wasm"])(a0);
        var _ts_tree_cursor_start_index_wasm = Module["_ts_tree_cursor_start_index_wasm"] = a0 => (_ts_tree_cursor_start_index_wasm = Module["_ts_tree_cursor_start_index_wasm"] = wasmExports["ts_tree_cursor_start_index_wasm"])(a0);
        var _ts_tree_cursor_end_index_wasm = Module["_ts_tree_cursor_end_index_wasm"] = a0 => (_ts_tree_cursor_end_index_wasm = Module["_ts_tree_cursor_end_index_wasm"] = wasmExports["ts_tree_cursor_end_index_wasm"])(a0);
        var _ts_tree_cursor_current_field_id_wasm = Module["_ts_tree_cursor_current_field_id_wasm"] = a0 => (_ts_tree_cursor_current_field_id_wasm = Module["_ts_tree_cursor_current_field_id_wasm"] = wasmExports["ts_tree_cursor_current_field_id_wasm"])(a0);
        var _ts_tree_cursor_current_depth_wasm = Module["_ts_tree_cursor_current_depth_wasm"] = a0 => (_ts_tree_cursor_current_depth_wasm = Module["_ts_tree_cursor_current_depth_wasm"] = wasmExports["ts_tree_cursor_current_depth_wasm"])(a0);
        var _ts_tree_cursor_current_descendant_index_wasm = Module["_ts_tree_cursor_current_descendant_index_wasm"] = a0 => (_ts_tree_cursor_current_descendant_index_wasm = Module["_ts_tree_cursor_current_descendant_index_wasm"] = wasmExports["ts_tree_cursor_current_descendant_index_wasm"])(a0);
        var _ts_tree_cursor_current_node_wasm = Module["_ts_tree_cursor_current_node_wasm"] = a0 => (_ts_tree_cursor_current_node_wasm = Module["_ts_tree_cursor_current_node_wasm"] = wasmExports["ts_tree_cursor_current_node_wasm"])(a0);
        var _ts_node_symbol_wasm = Module["_ts_node_symbol_wasm"] = a0 => (_ts_node_symbol_wasm = Module["_ts_node_symbol_wasm"] = wasmExports["ts_node_symbol_wasm"])(a0);
        var _ts_node_field_name_for_child_wasm = Module["_ts_node_field_name_for_child_wasm"] = (a0, a1) => (_ts_node_field_name_for_child_wasm = Module["_ts_node_field_name_for_child_wasm"] = wasmExports["ts_node_field_name_for_child_wasm"])(a0, a1);
        var _ts_node_children_by_field_id_wasm = Module["_ts_node_children_by_field_id_wasm"] = (a0, a1) => (_ts_node_children_by_field_id_wasm = Module["_ts_node_children_by_field_id_wasm"] = wasmExports["ts_node_children_by_field_id_wasm"])(a0, a1);
        var _ts_node_first_child_for_byte_wasm = Module["_ts_node_first_child_for_byte_wasm"] = a0 => (_ts_node_first_child_for_byte_wasm = Module["_ts_node_first_child_for_byte_wasm"] = wasmExports["ts_node_first_child_for_byte_wasm"])(a0);
        var _ts_node_first_named_child_for_byte_wasm = Module["_ts_node_first_named_child_for_byte_wasm"] = a0 => (_ts_node_first_named_child_for_byte_wasm = Module["_ts_node_first_named_child_for_byte_wasm"] = wasmExports["ts_node_first_named_child_for_byte_wasm"])(a0);
        var _ts_node_grammar_symbol_wasm = Module["_ts_node_grammar_symbol_wasm"] = a0 => (_ts_node_grammar_symbol_wasm = Module["_ts_node_grammar_symbol_wasm"] = wasmExports["ts_node_grammar_symbol_wasm"])(a0);
        var _ts_node_child_count_wasm = Module["_ts_node_child_count_wasm"] = a0 => (_ts_node_child_count_wasm = Module["_ts_node_child_count_wasm"] = wasmExports["ts_node_child_count_wasm"])(a0);
        var _ts_node_named_child_count_wasm = Module["_ts_node_named_child_count_wasm"] = a0 => (_ts_node_named_child_count_wasm = Module["_ts_node_named_child_count_wasm"] = wasmExports["ts_node_named_child_count_wasm"])(a0);
        var _ts_node_child_wasm = Module["_ts_node_child_wasm"] = (a0, a1) => (_ts_node_child_wasm = Module["_ts_node_child_wasm"] = wasmExports["ts_node_child_wasm"])(a0, a1);
        var _ts_node_named_child_wasm = Module["_ts_node_named_child_wasm"] = (a0, a1) => (_ts_node_named_child_wasm = Module["_ts_node_named_child_wasm"] = wasmExports["ts_node_named_child_wasm"])(a0, a1);
        var _ts_node_child_by_field_id_wasm = Module["_ts_node_child_by_field_id_wasm"] = (a0, a1) => (_ts_node_child_by_field_id_wasm = Module["_ts_node_child_by_field_id_wasm"] = wasmExports["ts_node_child_by_field_id_wasm"])(a0, a1);
        var _ts_node_next_sibling_wasm = Module["_ts_node_next_sibling_wasm"] = a0 => (_ts_node_next_sibling_wasm = Module["_ts_node_next_sibling_wasm"] = wasmExports["ts_node_next_sibling_wasm"])(a0);
        var _ts_node_prev_sibling_wasm = Module["_ts_node_prev_sibling_wasm"] = a0 => (_ts_node_prev_sibling_wasm = Module["_ts_node_prev_sibling_wasm"] = wasmExports["ts_node_prev_sibling_wasm"])(a0);
        var _ts_node_next_named_sibling_wasm = Module["_ts_node_next_named_sibling_wasm"] = a0 => (_ts_node_next_named_sibling_wasm = Module["_ts_node_next_named_sibling_wasm"] = wasmExports["ts_node_next_named_sibling_wasm"])(a0);
        var _ts_node_prev_named_sibling_wasm = Module["_ts_node_prev_named_sibling_wasm"] = a0 => (_ts_node_prev_named_sibling_wasm = Module["_ts_node_prev_named_sibling_wasm"] = wasmExports["ts_node_prev_named_sibling_wasm"])(a0);
        var _ts_node_descendant_count_wasm = Module["_ts_node_descendant_count_wasm"] = a0 => (_ts_node_descendant_count_wasm = Module["_ts_node_descendant_count_wasm"] = wasmExports["ts_node_descendant_count_wasm"])(a0);
        var _ts_node_parent_wasm = Module["_ts_node_parent_wasm"] = a0 => (_ts_node_parent_wasm = Module["_ts_node_parent_wasm"] = wasmExports["ts_node_parent_wasm"])(a0);
        var _ts_node_descendant_for_index_wasm = Module["_ts_node_descendant_for_index_wasm"] = a0 => (_ts_node_descendant_for_index_wasm = Module["_ts_node_descendant_for_index_wasm"] = wasmExports["ts_node_descendant_for_index_wasm"])(a0);
        var _ts_node_named_descendant_for_index_wasm = Module["_ts_node_named_descendant_for_index_wasm"] = a0 => (_ts_node_named_descendant_for_index_wasm = Module["_ts_node_named_descendant_for_index_wasm"] = wasmExports["ts_node_named_descendant_for_index_wasm"])(a0);
        var _ts_node_descendant_for_position_wasm = Module["_ts_node_descendant_for_position_wasm"] = a0 => (_ts_node_descendant_for_position_wasm = Module["_ts_node_descendant_for_position_wasm"] = wasmExports["ts_node_descendant_for_position_wasm"])(a0);
        var _ts_node_named_descendant_for_position_wasm = Module["_ts_node_named_descendant_for_position_wasm"] = a0 => (_ts_node_named_descendant_for_position_wasm = Module["_ts_node_named_descendant_for_position_wasm"] = wasmExports["ts_node_named_descendant_for_position_wasm"])(a0);
        var _ts_node_start_point_wasm = Module["_ts_node_start_point_wasm"] = a0 => (_ts_node_start_point_wasm = Module["_ts_node_start_point_wasm"] = wasmExports["ts_node_start_point_wasm"])(a0);
        var _ts_node_end_point_wasm = Module["_ts_node_end_point_wasm"] = a0 => (_ts_node_end_point_wasm = Module["_ts_node_end_point_wasm"] = wasmExports["ts_node_end_point_wasm"])(a0);
        var _ts_node_start_index_wasm = Module["_ts_node_start_index_wasm"] = a0 => (_ts_node_start_index_wasm = Module["_ts_node_start_index_wasm"] = wasmExports["ts_node_start_index_wasm"])(a0);
        var _ts_node_end_index_wasm = Module["_ts_node_end_index_wasm"] = a0 => (_ts_node_end_index_wasm = Module["_ts_node_end_index_wasm"] = wasmExports["ts_node_end_index_wasm"])(a0);
        var _ts_node_to_string_wasm = Module["_ts_node_to_string_wasm"] = a0 => (_ts_node_to_string_wasm = Module["_ts_node_to_string_wasm"] = wasmExports["ts_node_to_string_wasm"])(a0);
        var _ts_node_children_wasm = Module["_ts_node_children_wasm"] = a0 => (_ts_node_children_wasm = Module["_ts_node_children_wasm"] = wasmExports["ts_node_children_wasm"])(a0);
        var _ts_node_named_children_wasm = Module["_ts_node_named_children_wasm"] = a0 => (_ts_node_named_children_wasm = Module["_ts_node_named_children_wasm"] = wasmExports["ts_node_named_children_wasm"])(a0);
        var _ts_node_descendants_of_type_wasm = Module["_ts_node_descendants_of_type_wasm"] = (a0, a1, a2, a3, a4, a5, a6) => (_ts_node_descendants_of_type_wasm = Module["_ts_node_descendants_of_type_wasm"] = wasmExports["ts_node_descendants_of_type_wasm"])(a0, a1, a2, a3, a4, a5, a6);
        var _ts_node_is_named_wasm = Module["_ts_node_is_named_wasm"] = a0 => (_ts_node_is_named_wasm = Module["_ts_node_is_named_wasm"] = wasmExports["ts_node_is_named_wasm"])(a0);
        var _ts_node_has_changes_wasm = Module["_ts_node_has_changes_wasm"] = a0 => (_ts_node_has_changes_wasm = Module["_ts_node_has_changes_wasm"] = wasmExports["ts_node_has_changes_wasm"])(a0);
        var _ts_node_has_error_wasm = Module["_ts_node_has_error_wasm"] = a0 => (_ts_node_has_error_wasm = Module["_ts_node_has_error_wasm"] = wasmExports["ts_node_has_error_wasm"])(a0);
        var _ts_node_is_error_wasm = Module["_ts_node_is_error_wasm"] = a0 => (_ts_node_is_error_wasm = Module["_ts_node_is_error_wasm"] = wasmExports["ts_node_is_error_wasm"])(a0);
        var _ts_node_is_missing_wasm = Module["_ts_node_is_missing_wasm"] = a0 => (_ts_node_is_missing_wasm = Module["_ts_node_is_missing_wasm"] = wasmExports["ts_node_is_missing_wasm"])(a0);
        var _ts_node_is_extra_wasm = Module["_ts_node_is_extra_wasm"] = a0 => (_ts_node_is_extra_wasm = Module["_ts_node_is_extra_wasm"] = wasmExports["ts_node_is_extra_wasm"])(a0);
        var _ts_node_parse_state_wasm = Module["_ts_node_parse_state_wasm"] = a0 => (_ts_node_parse_state_wasm = Module["_ts_node_parse_state_wasm"] = wasmExports["ts_node_parse_state_wasm"])(a0);
        var _ts_node_next_parse_state_wasm = Module["_ts_node_next_parse_state_wasm"] = a0 => (_ts_node_next_parse_state_wasm = Module["_ts_node_next_parse_state_wasm"] = wasmExports["ts_node_next_parse_state_wasm"])(a0);
        var _ts_query_matches_wasm = Module["_ts_query_matches_wasm"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_ts_query_matches_wasm = Module["_ts_query_matches_wasm"] = wasmExports["ts_query_matches_wasm"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
        var _ts_query_captures_wasm = Module["_ts_query_captures_wasm"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_ts_query_captures_wasm = Module["_ts_query_captures_wasm"] = wasmExports["ts_query_captures_wasm"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
        var _iswalpha = Module["_iswalpha"] = a0 => (_iswalpha = Module["_iswalpha"] = wasmExports["iswalpha"])(a0);
        var _iswblank = Module["_iswblank"] = a0 => (_iswblank = Module["_iswblank"] = wasmExports["iswblank"])(a0);
        var _iswdigit = Module["_iswdigit"] = a0 => (_iswdigit = Module["_iswdigit"] = wasmExports["iswdigit"])(a0);
        var _iswlower = Module["_iswlower"] = a0 => (_iswlower = Module["_iswlower"] = wasmExports["iswlower"])(a0);
        var _iswupper = Module["_iswupper"] = a0 => (_iswupper = Module["_iswupper"] = wasmExports["iswupper"])(a0);
        var _iswxdigit = Module["_iswxdigit"] = a0 => (_iswxdigit = Module["_iswxdigit"] = wasmExports["iswxdigit"])(a0);
        var _memchr = Module["_memchr"] = (a0, a1, a2) => (_memchr = Module["_memchr"] = wasmExports["memchr"])(a0, a1, a2);
        var _strlen = Module["_strlen"] = a0 => (_strlen = Module["_strlen"] = wasmExports["strlen"])(a0);
        var _strcmp = Module["_strcmp"] = (a0, a1) => (_strcmp = Module["_strcmp"] = wasmExports["strcmp"])(a0, a1);
        var _strncat = Module["_strncat"] = (a0, a1, a2) => (_strncat = Module["_strncat"] = wasmExports["strncat"])(a0, a1, a2);
        var _strncpy = Module["_strncpy"] = (a0, a1, a2) => (_strncpy = Module["_strncpy"] = wasmExports["strncpy"])(a0, a1, a2);
        var _towlower = Module["_towlower"] = a0 => (_towlower = Module["_towlower"] = wasmExports["towlower"])(a0);
        var _towupper = Module["_towupper"] = a0 => (_towupper = Module["_towupper"] = wasmExports["towupper"])(a0);
        var _setThrew = (a0, a1) => (_setThrew = wasmExports["setThrew"])(a0, a1);
        var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);
        var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);
        var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();
        var dynCall_jiji = Module["dynCall_jiji"] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module["dynCall_jiji"] = wasmExports["dynCall_jiji"])(a0, a1, a2, a3, a4);
        var _orig$ts_parser_timeout_micros = Module["_orig$ts_parser_timeout_micros"] = a0 => (_orig$ts_parser_timeout_micros = Module["_orig$ts_parser_timeout_micros"] = wasmExports["orig$ts_parser_timeout_micros"])(a0);
        var _orig$ts_parser_set_timeout_micros = Module["_orig$ts_parser_set_timeout_micros"] = (a0, a1) => (_orig$ts_parser_set_timeout_micros = Module["_orig$ts_parser_set_timeout_micros"] = wasmExports["orig$ts_parser_set_timeout_micros"])(a0, a1);
        // include: postamble.js
        // === Auto-generated postamble setup entry stuff ===
        Module["AsciiToString"] = AsciiToString;
        Module["stringToUTF16"] = stringToUTF16;
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
          if (!calledRun) run();
          if (!calledRun) dependenciesFulfilled = runCaller;
        };
        // try this again later, after new deps are fulfilled
        function callMain(args = []) {
          var entryFunction = resolveGlobalSymbol("main").sym;
          // Main modules can't tell if they have main() at compile time, since it may
          // arrive from a dynamic library.
          if (!entryFunction) return;
          args.unshift(thisProgram);
          var argc = args.length;
          var argv = stackAlloc((argc + 1) * 4);
          var argv_ptr = argv;
          args.forEach(arg => {
            LE_HEAP_STORE_U32(((argv_ptr) >> 2) * 4, stringToUTF8OnStack(arg));
            argv_ptr += 4;
          });
          LE_HEAP_STORE_U32(((argv_ptr) >> 2) * 4, 0);
          try {
            var ret = entryFunction(argc, argv);
            // if we're not running an evented main loop, it's time to exit
            exitJS(ret, /* implicit = */ true);
            return ret;
          } catch (e) {
            return handleException(e);
          }
        }
        function run(args = arguments_) {
          if (runDependencies > 0) {
            return;
          }
          preRun();
          // a preRun added a dependency, run will be called later
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            // run may have just been called through dependencies being fulfilled just in this very frame,
            // or while the async setStatus time below was happening
            if (calledRun) return;
            calledRun = true;
            Module["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            preMain();
            Module["onRuntimeInitialized"]?.();
            if (shouldRunNow) callMain(args);
            postRun();
          }
          if (Module["setStatus"]) {
            Module["setStatus"]("Running...");
            setTimeout(function() {
              setTimeout(function() {
                Module["setStatus"]("");
              }, 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
        }
        if (Module["preInit"]) {
          if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
          while (Module["preInit"].length > 0) {
            Module["preInit"].pop()();
          }
        }
        // shouldRunNow refers to calling main(), not run().
        var shouldRunNow = true;
        if (Module["noInitialRun"]) shouldRunNow = false;
        run();
        // end include: postamble.js
        // include: /src/lib/binding_web/binding.js
        /* eslint-disable-next-line spaced-comment */ /// <reference types="emscripten" />
        /* eslint-disable-next-line spaced-comment */ /// <reference path="tree-sitter-web.d.ts"/>
        const C = Module;
        const INTERNAL = {};
        const SIZE_OF_INT = 4;
        const SIZE_OF_CURSOR = 4 * SIZE_OF_INT;
        const SIZE_OF_NODE = 5 * SIZE_OF_INT;
        const SIZE_OF_POINT = 2 * SIZE_OF_INT;
        const SIZE_OF_RANGE = 2 * SIZE_OF_INT + 2 * SIZE_OF_POINT;
        const ZERO_POINT = {
          row: 0,
          column: 0
        };
        const QUERY_WORD_REGEX = /[\w-.]*/g;
        const PREDICATE_STEP_TYPE_CAPTURE = 1;
        const PREDICATE_STEP_TYPE_STRING = 2;
        const LANGUAGE_FUNCTION_REGEX = /^_?tree_sitter_\w+/;
        let VERSION;
        let MIN_COMPATIBLE_VERSION;
        let TRANSFER_BUFFER;
        let currentParseCallback;
        // eslint-disable-next-line no-unused-vars
        let currentLogCallback;
        // eslint-disable-next-line no-unused-vars
        class ParserImpl {
          static init() {
            TRANSFER_BUFFER = C._ts_init();
            VERSION = getValue(TRANSFER_BUFFER, "i32");
            MIN_COMPATIBLE_VERSION = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
          }
          initialize() {
            C._ts_parser_new_wasm();
            this[0] = getValue(TRANSFER_BUFFER, "i32");
            this[1] = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
          }
          delete() {
            C._ts_parser_delete(this[0]);
            C._free(this[1]);
            this[0] = 0;
            this[1] = 0;
          }
          setLanguage(language) {
            let address;
            if (!language) {
              address = 0;
              language = null;
            } else if (language.constructor === Language) {
              address = language[0];
              const version = C._ts_language_version(address);
              if (version < MIN_COMPATIBLE_VERSION || VERSION < version) {
                throw new Error(`Incompatible language version ${version}. ` + `Compatibility range ${MIN_COMPATIBLE_VERSION} through ${VERSION}.`);
              }
            } else {
              throw new Error("Argument must be a Language");
            }
            this.language = language;
            C._ts_parser_set_language(this[0], address);
            return this;
          }
          getLanguage() {
            return this.language;
          }
          parse(callback, oldTree, options) {
            if (typeof callback === "string") {
              currentParseCallback = (index, _) => callback.slice(index);
            } else if (typeof callback === "function") {
              currentParseCallback = callback;
            } else {
              throw new Error("Argument must be a string or a function");
            }
            if (this.logCallback) {
              currentLogCallback = this.logCallback;
              C._ts_parser_enable_logger_wasm(this[0], 1);
            } else {
              currentLogCallback = null;
              C._ts_parser_enable_logger_wasm(this[0], 0);
            }
            let rangeCount = 0;
            let rangeAddress = 0;
            if (options?.includedRanges) {
              rangeCount = options.includedRanges.length;
              rangeAddress = C._calloc(rangeCount, SIZE_OF_RANGE);
              let address = rangeAddress;
              for (let i = 0; i < rangeCount; i++) {
                marshalRange(address, options.includedRanges[i]);
                address += SIZE_OF_RANGE;
              }
            }
            const treeAddress = C._ts_parser_parse_wasm(this[0], this[1], oldTree ? oldTree[0] : 0, rangeAddress, rangeCount);
            if (!treeAddress) {
              currentParseCallback = null;
              currentLogCallback = null;
              throw new Error("Parsing failed");
            }
            const result = new Tree(INTERNAL, treeAddress, this.language, currentParseCallback);
            currentParseCallback = null;
            currentLogCallback = null;
            return result;
          }
          reset() {
            C._ts_parser_reset(this[0]);
          }
          getIncludedRanges() {
            C._ts_parser_included_ranges_wasm(this[0]);
            const count = getValue(TRANSFER_BUFFER, "i32");
            const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const result = new Array(count);
            if (count > 0) {
              let address = buffer;
              for (let i = 0; i < count; i++) {
                result[i] = unmarshalRange(address);
                address += SIZE_OF_RANGE;
              }
              C._free(buffer);
            }
            return result;
          }
          getTimeoutMicros() {
            return C._ts_parser_timeout_micros(this[0]);
          }
          setTimeoutMicros(timeout) {
            C._ts_parser_set_timeout_micros(this[0], timeout);
          }
          setLogger(callback) {
            if (!callback) {
              callback = null;
            } else if (typeof callback !== "function") {
              throw new Error("Logger callback must be a function");
            }
            this.logCallback = callback;
            return this;
          }
          getLogger() {
            return this.logCallback;
          }
        }
        class Tree {
          constructor(internal, address, language, textCallback) {
            assertInternal(internal);
            this[0] = address;
            this.language = language;
            this.textCallback = textCallback;
          }
          copy() {
            const address = C._ts_tree_copy(this[0]);
            return new Tree(INTERNAL, address, this.language, this.textCallback);
          }
          delete() {
            C._ts_tree_delete(this[0]);
            this[0] = 0;
          }
          edit(edit) {
            marshalEdit(edit);
            C._ts_tree_edit_wasm(this[0]);
          }
          get rootNode() {
            C._ts_tree_root_node_wasm(this[0]);
            return unmarshalNode(this);
          }
          rootNodeWithOffset(offsetBytes, offsetExtent) {
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            setValue(address, offsetBytes, "i32");
            marshalPoint(address + SIZE_OF_INT, offsetExtent);
            C._ts_tree_root_node_with_offset_wasm(this[0]);
            return unmarshalNode(this);
          }
          getLanguage() {
            return this.language;
          }
          walk() {
            return this.rootNode.walk();
          }
          getChangedRanges(other) {
            if (other.constructor !== Tree) {
              throw new TypeError("Argument must be a Tree");
            }
            C._ts_tree_get_changed_ranges_wasm(this[0], other[0]);
            const count = getValue(TRANSFER_BUFFER, "i32");
            const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const result = new Array(count);
            if (count > 0) {
              let address = buffer;
              for (let i = 0; i < count; i++) {
                result[i] = unmarshalRange(address);
                address += SIZE_OF_RANGE;
              }
              C._free(buffer);
            }
            return result;
          }
          getIncludedRanges() {
            C._ts_tree_included_ranges_wasm(this[0]);
            const count = getValue(TRANSFER_BUFFER, "i32");
            const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const result = new Array(count);
            if (count > 0) {
              let address = buffer;
              for (let i = 0; i < count; i++) {
                result[i] = unmarshalRange(address);
                address += SIZE_OF_RANGE;
              }
              C._free(buffer);
            }
            return result;
          }
        }
        class Node {
          constructor(internal, tree) {
            assertInternal(internal);
            this.tree = tree;
          }
          get typeId() {
            marshalNode(this);
            return C._ts_node_symbol_wasm(this.tree[0]);
          }
          get grammarId() {
            marshalNode(this);
            return C._ts_node_grammar_symbol_wasm(this.tree[0]);
          }
          get type() {
            return this.tree.language.types[this.typeId] || "ERROR";
          }
          get grammarType() {
            return this.tree.language.types[this.grammarId] || "ERROR";
          }
          get endPosition() {
            marshalNode(this);
            C._ts_node_end_point_wasm(this.tree[0]);
            return unmarshalPoint(TRANSFER_BUFFER);
          }
          get endIndex() {
            marshalNode(this);
            return C._ts_node_end_index_wasm(this.tree[0]);
          }
          get text() {
            return getText(this.tree, this.startIndex, this.endIndex);
          }
          get parseState() {
            marshalNode(this);
            return C._ts_node_parse_state_wasm(this.tree[0]);
          }
          get nextParseState() {
            marshalNode(this);
            return C._ts_node_next_parse_state_wasm(this.tree[0]);
          }
          get isNamed() {
            marshalNode(this);
            return C._ts_node_is_named_wasm(this.tree[0]) === 1;
          }
          get hasError() {
            marshalNode(this);
            return C._ts_node_has_error_wasm(this.tree[0]) === 1;
          }
          get hasChanges() {
            marshalNode(this);
            return C._ts_node_has_changes_wasm(this.tree[0]) === 1;
          }
          get isError() {
            marshalNode(this);
            return C._ts_node_is_error_wasm(this.tree[0]) === 1;
          }
          get isMissing() {
            marshalNode(this);
            return C._ts_node_is_missing_wasm(this.tree[0]) === 1;
          }
          get isExtra() {
            marshalNode(this);
            return C._ts_node_is_extra_wasm(this.tree[0]) === 1;
          }
          equals(other) {
            return this.id === other.id;
          }
          child(index) {
            marshalNode(this);
            C._ts_node_child_wasm(this.tree[0], index);
            return unmarshalNode(this.tree);
          }
          namedChild(index) {
            marshalNode(this);
            C._ts_node_named_child_wasm(this.tree[0], index);
            return unmarshalNode(this.tree);
          }
          childForFieldId(fieldId) {
            marshalNode(this);
            C._ts_node_child_by_field_id_wasm(this.tree[0], fieldId);
            return unmarshalNode(this.tree);
          }
          childForFieldName(fieldName) {
            const fieldId = this.tree.language.fields.indexOf(fieldName);
            if (fieldId !== -1) return this.childForFieldId(fieldId);
            return null;
          }
          fieldNameForChild(index) {
            marshalNode(this);
            const address = C._ts_node_field_name_for_child_wasm(this.tree[0], index);
            if (!address) {
              return null;
            }
            const result = AsciiToString(address);
            // must not free, the string memory is owned by the language
            return result;
          }
          childrenForFieldName(fieldName) {
            const fieldId = this.tree.language.fields.indexOf(fieldName);
            if (fieldId !== -1 && fieldId !== 0) return this.childrenForFieldId(fieldId);
            return [];
          }
          childrenForFieldId(fieldId) {
            marshalNode(this);
            C._ts_node_children_by_field_id_wasm(this.tree[0], fieldId);
            const count = getValue(TRANSFER_BUFFER, "i32");
            const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const result = new Array(count);
            if (count > 0) {
              let address = buffer;
              for (let i = 0; i < count; i++) {
                result[i] = unmarshalNode(this.tree, address);
                address += SIZE_OF_NODE;
              }
              C._free(buffer);
            }
            return result;
          }
          firstChildForIndex(index) {
            marshalNode(this);
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            setValue(address, index, "i32");
            C._ts_node_first_child_for_byte_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          firstNamedChildForIndex(index) {
            marshalNode(this);
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            setValue(address, index, "i32");
            C._ts_node_first_named_child_for_byte_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          get childCount() {
            marshalNode(this);
            return C._ts_node_child_count_wasm(this.tree[0]);
          }
          get namedChildCount() {
            marshalNode(this);
            return C._ts_node_named_child_count_wasm(this.tree[0]);
          }
          get firstChild() {
            return this.child(0);
          }
          get firstNamedChild() {
            return this.namedChild(0);
          }
          get lastChild() {
            return this.child(this.childCount - 1);
          }
          get lastNamedChild() {
            return this.namedChild(this.namedChildCount - 1);
          }
          get children() {
            if (!this._children) {
              marshalNode(this);
              C._ts_node_children_wasm(this.tree[0]);
              const count = getValue(TRANSFER_BUFFER, "i32");
              const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
              this._children = new Array(count);
              if (count > 0) {
                let address = buffer;
                for (let i = 0; i < count; i++) {
                  this._children[i] = unmarshalNode(this.tree, address);
                  address += SIZE_OF_NODE;
                }
                C._free(buffer);
              }
            }
            return this._children;
          }
          get namedChildren() {
            if (!this._namedChildren) {
              marshalNode(this);
              C._ts_node_named_children_wasm(this.tree[0]);
              const count = getValue(TRANSFER_BUFFER, "i32");
              const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
              this._namedChildren = new Array(count);
              if (count > 0) {
                let address = buffer;
                for (let i = 0; i < count; i++) {
                  this._namedChildren[i] = unmarshalNode(this.tree, address);
                  address += SIZE_OF_NODE;
                }
                C._free(buffer);
              }
            }
            return this._namedChildren;
          }
          descendantsOfType(types, startPosition, endPosition) {
            if (!Array.isArray(types)) types = [ types ];
            if (!startPosition) startPosition = ZERO_POINT;
            if (!endPosition) endPosition = ZERO_POINT;
            // Convert the type strings to numeric type symbols.
            const symbols = [];
            const typesBySymbol = this.tree.language.types;
            for (let i = 0, n = typesBySymbol.length; i < n; i++) {
              if (types.includes(typesBySymbol[i])) {
                symbols.push(i);
              }
            }
            // Copy the array of symbols to the WASM heap.
            const symbolsAddress = C._malloc(SIZE_OF_INT * symbols.length);
            for (let i = 0, n = symbols.length; i < n; i++) {
              setValue(symbolsAddress + i * SIZE_OF_INT, symbols[i], "i32");
            }
            // Call the C API to compute the descendants.
            marshalNode(this);
            C._ts_node_descendants_of_type_wasm(this.tree[0], symbolsAddress, symbols.length, startPosition.row, startPosition.column, endPosition.row, endPosition.column);
            // Instantiate the nodes based on the data returned.
            const descendantCount = getValue(TRANSFER_BUFFER, "i32");
            const descendantAddress = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const result = new Array(descendantCount);
            if (descendantCount > 0) {
              let address = descendantAddress;
              for (let i = 0; i < descendantCount; i++) {
                result[i] = unmarshalNode(this.tree, address);
                address += SIZE_OF_NODE;
              }
            }
            // Free the intermediate buffers
            C._free(descendantAddress);
            C._free(symbolsAddress);
            return result;
          }
          get nextSibling() {
            marshalNode(this);
            C._ts_node_next_sibling_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          get previousSibling() {
            marshalNode(this);
            C._ts_node_prev_sibling_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          get nextNamedSibling() {
            marshalNode(this);
            C._ts_node_next_named_sibling_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          get previousNamedSibling() {
            marshalNode(this);
            C._ts_node_prev_named_sibling_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          get descendantCount() {
            marshalNode(this);
            return C._ts_node_descendant_count_wasm(this.tree[0]);
          }
          get parent() {
            marshalNode(this);
            C._ts_node_parent_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          descendantForIndex(start, end = start) {
            if (typeof start !== "number" || typeof end !== "number") {
              throw new Error("Arguments must be numbers");
            }
            marshalNode(this);
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            setValue(address, start, "i32");
            setValue(address + SIZE_OF_INT, end, "i32");
            C._ts_node_descendant_for_index_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          namedDescendantForIndex(start, end = start) {
            if (typeof start !== "number" || typeof end !== "number") {
              throw new Error("Arguments must be numbers");
            }
            marshalNode(this);
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            setValue(address, start, "i32");
            setValue(address + SIZE_OF_INT, end, "i32");
            C._ts_node_named_descendant_for_index_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          descendantForPosition(start, end = start) {
            if (!isPoint(start) || !isPoint(end)) {
              throw new Error("Arguments must be {row, column} objects");
            }
            marshalNode(this);
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            marshalPoint(address, start);
            marshalPoint(address + SIZE_OF_POINT, end);
            C._ts_node_descendant_for_position_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          namedDescendantForPosition(start, end = start) {
            if (!isPoint(start) || !isPoint(end)) {
              throw new Error("Arguments must be {row, column} objects");
            }
            marshalNode(this);
            const address = TRANSFER_BUFFER + SIZE_OF_NODE;
            marshalPoint(address, start);
            marshalPoint(address + SIZE_OF_POINT, end);
            C._ts_node_named_descendant_for_position_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          walk() {
            marshalNode(this);
            C._ts_tree_cursor_new_wasm(this.tree[0]);
            return new TreeCursor(INTERNAL, this.tree);
          }
          toString() {
            marshalNode(this);
            const address = C._ts_node_to_string_wasm(this.tree[0]);
            const result = AsciiToString(address);
            C._free(address);
            return result;
          }
        }
        class TreeCursor {
          constructor(internal, tree) {
            assertInternal(internal);
            this.tree = tree;
            unmarshalTreeCursor(this);
          }
          delete() {
            marshalTreeCursor(this);
            C._ts_tree_cursor_delete_wasm(this.tree[0]);
            this[0] = this[1] = this[2] = 0;
          }
          reset(node) {
            marshalNode(node);
            marshalTreeCursor(this, TRANSFER_BUFFER + SIZE_OF_NODE);
            C._ts_tree_cursor_reset_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
          }
          resetTo(cursor) {
            marshalTreeCursor(this, TRANSFER_BUFFER);
            marshalTreeCursor(cursor, TRANSFER_BUFFER + SIZE_OF_CURSOR);
            C._ts_tree_cursor_reset_to_wasm(this.tree[0], cursor.tree[0]);
            unmarshalTreeCursor(this);
          }
          get nodeType() {
            return this.tree.language.types[this.nodeTypeId] || "ERROR";
          }
          get nodeTypeId() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_node_type_id_wasm(this.tree[0]);
          }
          get nodeStateId() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_node_state_id_wasm(this.tree[0]);
          }
          get nodeId() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_node_id_wasm(this.tree[0]);
          }
          get nodeIsNamed() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_node_is_named_wasm(this.tree[0]) === 1;
          }
          get nodeIsMissing() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0]) === 1;
          }
          get nodeText() {
            marshalTreeCursor(this);
            const startIndex = C._ts_tree_cursor_start_index_wasm(this.tree[0]);
            const endIndex = C._ts_tree_cursor_end_index_wasm(this.tree[0]);
            return getText(this.tree, startIndex, endIndex);
          }
          get startPosition() {
            marshalTreeCursor(this);
            C._ts_tree_cursor_start_position_wasm(this.tree[0]);
            return unmarshalPoint(TRANSFER_BUFFER);
          }
          get endPosition() {
            marshalTreeCursor(this);
            C._ts_tree_cursor_end_position_wasm(this.tree[0]);
            return unmarshalPoint(TRANSFER_BUFFER);
          }
          get startIndex() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_start_index_wasm(this.tree[0]);
          }
          get endIndex() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_end_index_wasm(this.tree[0]);
          }
          get currentNode() {
            marshalTreeCursor(this);
            C._ts_tree_cursor_current_node_wasm(this.tree[0]);
            return unmarshalNode(this.tree);
          }
          get currentFieldId() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_field_id_wasm(this.tree[0]);
          }
          get currentFieldName() {
            return this.tree.language.fields[this.currentFieldId];
          }
          get currentDepth() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_depth_wasm(this.tree[0]);
          }
          get currentDescendantIndex() {
            marshalTreeCursor(this);
            return C._ts_tree_cursor_current_descendant_index_wasm(this.tree[0]);
          }
          gotoFirstChild() {
            marshalTreeCursor(this);
            const result = C._ts_tree_cursor_goto_first_child_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
          gotoLastChild() {
            marshalTreeCursor(this);
            const result = C._ts_tree_cursor_goto_last_child_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
          gotoFirstChildForIndex(goalIndex) {
            marshalTreeCursor(this);
            setValue(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalIndex, "i32");
            const result = C._ts_tree_cursor_goto_first_child_for_index_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
          gotoFirstChildForPosition(goalPosition) {
            marshalTreeCursor(this);
            marshalPoint(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalPosition);
            const result = C._ts_tree_cursor_goto_first_child_for_position_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
          gotoNextSibling() {
            marshalTreeCursor(this);
            const result = C._ts_tree_cursor_goto_next_sibling_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
          gotoPreviousSibling() {
            marshalTreeCursor(this);
            const result = C._ts_tree_cursor_goto_previous_sibling_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
          gotoDescendant(goalDescendantindex) {
            marshalTreeCursor(this);
            C._ts_tree_cursor_goto_descendant_wasm(this.tree[0], goalDescendantindex);
            unmarshalTreeCursor(this);
          }
          gotoParent() {
            marshalTreeCursor(this);
            const result = C._ts_tree_cursor_goto_parent_wasm(this.tree[0]);
            unmarshalTreeCursor(this);
            return result === 1;
          }
        }
        class Language {
          constructor(internal, address) {
            assertInternal(internal);
            this[0] = address;
            this.types = new Array(C._ts_language_symbol_count(this[0]));
            for (let i = 0, n = this.types.length; i < n; i++) {
              if (C._ts_language_symbol_type(this[0], i) < 2) {
                this.types[i] = UTF8ToString(C._ts_language_symbol_name(this[0], i));
              }
            }
            this.fields = new Array(C._ts_language_field_count(this[0]) + 1);
            for (let i = 0, n = this.fields.length; i < n; i++) {
              const fieldName = C._ts_language_field_name_for_id(this[0], i);
              if (fieldName !== 0) {
                this.fields[i] = UTF8ToString(fieldName);
              } else {
                this.fields[i] = null;
              }
            }
          }
          get version() {
            return C._ts_language_version(this[0]);
          }
          get fieldCount() {
            return this.fields.length - 1;
          }
          get stateCount() {
            return C._ts_language_state_count(this[0]);
          }
          fieldIdForName(fieldName) {
            const result = this.fields.indexOf(fieldName);
            if (result !== -1) {
              return result;
            } else {
              return null;
            }
          }
          fieldNameForId(fieldId) {
            return this.fields[fieldId] || null;
          }
          idForNodeType(type, named) {
            const typeLength = lengthBytesUTF8(type);
            const typeAddress = C._malloc(typeLength + 1);
            stringToUTF8(type, typeAddress, typeLength + 1);
            const result = C._ts_language_symbol_for_name(this[0], typeAddress, typeLength, named);
            C._free(typeAddress);
            return result || null;
          }
          get nodeTypeCount() {
            return C._ts_language_symbol_count(this[0]);
          }
          nodeTypeForId(typeId) {
            const name = C._ts_language_symbol_name(this[0], typeId);
            return name ? UTF8ToString(name) : null;
          }
          nodeTypeIsNamed(typeId) {
            return C._ts_language_type_is_named_wasm(this[0], typeId) ? true : false;
          }
          nodeTypeIsVisible(typeId) {
            return C._ts_language_type_is_visible_wasm(this[0], typeId) ? true : false;
          }
          nextState(stateId, typeId) {
            return C._ts_language_next_state(this[0], stateId, typeId);
          }
          lookaheadIterator(stateId) {
            const address = C._ts_lookahead_iterator_new(this[0], stateId);
            if (address) return new LookaheadIterable(INTERNAL, address, this);
            return null;
          }
          query(source) {
            const sourceLength = lengthBytesUTF8(source);
            const sourceAddress = C._malloc(sourceLength + 1);
            stringToUTF8(source, sourceAddress, sourceLength + 1);
            const address = C._ts_query_new(this[0], sourceAddress, sourceLength, TRANSFER_BUFFER, TRANSFER_BUFFER + SIZE_OF_INT);
            if (!address) {
              const errorId = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
              const errorByte = getValue(TRANSFER_BUFFER, "i32");
              const errorIndex = UTF8ToString(sourceAddress, errorByte).length;
              const suffix = source.substr(errorIndex, 100).split("\n")[0];
              let word = suffix.match(QUERY_WORD_REGEX)[0];
              let error;
              switch (errorId) {
               case 2:
                error = new RangeError(`Bad node name '${word}'`);
                break;

               case 3:
                error = new RangeError(`Bad field name '${word}'`);
                break;

               case 4:
                error = new RangeError(`Bad capture name @${word}`);
                break;

               case 5:
                error = new TypeError(`Bad pattern structure at offset ${errorIndex}: '${suffix}'...`);
                word = "";
                break;

               default:
                error = new SyntaxError(`Bad syntax at offset ${errorIndex}: '${suffix}'...`);
                word = "";
                break;
              }
              error.index = errorIndex;
              error.length = word.length;
              C._free(sourceAddress);
              throw error;
            }
            const stringCount = C._ts_query_string_count(address);
            const captureCount = C._ts_query_capture_count(address);
            const patternCount = C._ts_query_pattern_count(address);
            const captureNames = new Array(captureCount);
            const stringValues = new Array(stringCount);
            for (let i = 0; i < captureCount; i++) {
              const nameAddress = C._ts_query_capture_name_for_id(address, i, TRANSFER_BUFFER);
              const nameLength = getValue(TRANSFER_BUFFER, "i32");
              captureNames[i] = UTF8ToString(nameAddress, nameLength);
            }
            for (let i = 0; i < stringCount; i++) {
              const valueAddress = C._ts_query_string_value_for_id(address, i, TRANSFER_BUFFER);
              const nameLength = getValue(TRANSFER_BUFFER, "i32");
              stringValues[i] = UTF8ToString(valueAddress, nameLength);
            }
            const setProperties = new Array(patternCount);
            const assertedProperties = new Array(patternCount);
            const refutedProperties = new Array(patternCount);
            const predicates = new Array(patternCount);
            const textPredicates = new Array(patternCount);
            for (let i = 0; i < patternCount; i++) {
              const predicatesAddress = C._ts_query_predicates_for_pattern(address, i, TRANSFER_BUFFER);
              const stepCount = getValue(TRANSFER_BUFFER, "i32");
              predicates[i] = [];
              textPredicates[i] = [];
              const steps = [];
              let stepAddress = predicatesAddress;
              for (let j = 0; j < stepCount; j++) {
                const stepType = getValue(stepAddress, "i32");
                stepAddress += SIZE_OF_INT;
                const stepValueId = getValue(stepAddress, "i32");
                stepAddress += SIZE_OF_INT;
                if (stepType === PREDICATE_STEP_TYPE_CAPTURE) {
                  steps.push({
                    type: "capture",
                    name: captureNames[stepValueId]
                  });
                } else if (stepType === PREDICATE_STEP_TYPE_STRING) {
                  steps.push({
                    type: "string",
                    value: stringValues[stepValueId]
                  });
                } else if (steps.length > 0) {
                  if (steps[0].type !== "string") {
                    throw new Error("Predicates must begin with a literal value");
                  }
                  const operator = steps[0].value;
                  let isPositive = true;
                  let matchAll = true;
                  let captureName;
                  switch (operator) {
                   case "any-not-eq?":
                   case "not-eq?":
                    isPositive = false;

                   case "any-eq?":
                   case "eq?":
                    if (steps.length !== 3) {
                      throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}`);
                    }
                    if (steps[1].type !== "capture") {
                      throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}"`);
                    }
                    matchAll = !operator.startsWith("any-");
                    if (steps[2].type === "capture") {
                      const captureName1 = steps[1].name;
                      const captureName2 = steps[2].name;
                      textPredicates[i].push(captures => {
                        const nodes1 = [];
                        const nodes2 = [];
                        for (const c of captures) {
                          if (c.name === captureName1) nodes1.push(c.node);
                          if (c.name === captureName2) nodes2.push(c.node);
                        }
                        const compare = (n1, n2, positive) => positive ? n1.text === n2.text : n1.text !== n2.text;
                        return matchAll ? nodes1.every(n1 => nodes2.some(n2 => compare(n1, n2, isPositive))) : nodes1.some(n1 => nodes2.some(n2 => compare(n1, n2, isPositive)));
                      });
                    } else {
                      captureName = steps[1].name;
                      const stringValue = steps[2].value;
                      const matches = n => n.text === stringValue;
                      const doesNotMatch = n => n.text !== stringValue;
                      textPredicates[i].push(captures => {
                        const nodes = [];
                        for (const c of captures) {
                          if (c.name === captureName) nodes.push(c.node);
                        }
                        const test = isPositive ? matches : doesNotMatch;
                        return matchAll ? nodes.every(test) : nodes.some(test);
                      });
                    }
                    break;

                   case "any-not-match?":
                   case "not-match?":
                    isPositive = false;

                   case "any-match?":
                   case "match?":
                    if (steps.length !== 3) {
                      throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}.`);
                    }
                    if (steps[1].type !== "capture") {
                      throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`);
                    }
                    if (steps[2].type !== "string") {
                      throw new Error(`Second argument of \`#${operator}\` predicate must be a string. Got @${steps[2].value}.`);
                    }
                    captureName = steps[1].name;
                    const regex = new RegExp(steps[2].value);
                    matchAll = !operator.startsWith("any-");
                    textPredicates[i].push(captures => {
                      const nodes = [];
                      for (const c of captures) {
                        if (c.name === captureName) nodes.push(c.node.text);
                      }
                      const test = (text, positive) => positive ? regex.test(text) : !regex.test(text);
                      if (nodes.length === 0) return !isPositive;
                      return matchAll ? nodes.every(text => test(text, isPositive)) : nodes.some(text => test(text, isPositive));
                    });
                    break;

                   case "set!":
                    if (steps.length < 2 || steps.length > 3) {
                      throw new Error(`Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
                    }
                    if (steps.some(s => s.type !== "string")) {
                      throw new Error(`Arguments to \`#set!\` predicate must be a strings.".`);
                    }
                    if (!setProperties[i]) setProperties[i] = {};
                    setProperties[i][steps[1].value] = steps[2] ? steps[2].value : null;
                    break;

                   case "is?":
                   case "is-not?":
                    if (steps.length < 2 || steps.length > 3) {
                      throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
                    }
                    if (steps.some(s => s.type !== "string")) {
                      throw new Error(`Arguments to \`#${operator}\` predicate must be a strings.".`);
                    }
                    const properties = operator === "is?" ? assertedProperties : refutedProperties;
                    if (!properties[i]) properties[i] = {};
                    properties[i][steps[1].value] = steps[2] ? steps[2].value : null;
                    break;

                   case "not-any-of?":
                    isPositive = false;

                   case "any-of?":
                    if (steps.length < 2) {
                      throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected at least 1. Got ${steps.length - 1}.`);
                    }
                    if (steps[1].type !== "capture") {
                      throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`);
                    }
                    for (let i = 2; i < steps.length; i++) {
                      if (steps[i].type !== "string") {
                        throw new Error(`Arguments to \`#${operator}\` predicate must be a strings.".`);
                      }
                    }
                    captureName = steps[1].name;
                    const values = steps.slice(2).map(s => s.value);
                    textPredicates[i].push(captures => {
                      const nodes = [];
                      for (const c of captures) {
                        if (c.name === captureName) nodes.push(c.node.text);
                      }
                      if (nodes.length === 0) return !isPositive;
                      return nodes.every(text => values.includes(text)) === isPositive;
                    });
                    break;

                   default:
                    predicates[i].push({
                      operator: operator,
                      operands: steps.slice(1)
                    });
                  }
                  steps.length = 0;
                }
              }
              Object.freeze(setProperties[i]);
              Object.freeze(assertedProperties[i]);
              Object.freeze(refutedProperties[i]);
            }
            C._free(sourceAddress);
            return new Query(INTERNAL, address, captureNames, textPredicates, predicates, Object.freeze(setProperties), Object.freeze(assertedProperties), Object.freeze(refutedProperties));
          }
          static load(input) {
            let bytes;
            if (input instanceof Uint8Array) {
              bytes = Promise.resolve(input);
            } else {
              const url = input;
              if (typeof process !== "undefined" && process.versions && process.versions.node) {
                const fs = __webpack_require__(6);
                bytes = Promise.resolve(fs.readFileSync(url));
              } else {
                bytes = fetch(url).then(response => response.arrayBuffer().then(buffer => {
                  if (response.ok) {
                    return new Uint8Array(buffer);
                  } else {
                    const body = new TextDecoder("utf-8").decode(buffer);
                    throw new Error(`Language.load failed with status ${response.status}.\n\n${body}`);
                  }
                }));
              }
            }
            return bytes.then(bytes => loadWebAssemblyModule(bytes, {
              loadAsync: true
            })).then(mod => {
              const symbolNames = Object.keys(mod);
              const functionName = symbolNames.find(key => LANGUAGE_FUNCTION_REGEX.test(key) && !key.includes("external_scanner_"));
              if (!functionName) {
                console.log(`Couldn't find language function in WASM file. Symbols:\n${JSON.stringify(symbolNames, null, 2)}`);
              }
              const languageAddress = mod[functionName]();
              return new Language(INTERNAL, languageAddress);
            });
          }
        }
        class LookaheadIterable {
          constructor(internal, address, language) {
            assertInternal(internal);
            this[0] = address;
            this.language = language;
          }
          get currentTypeId() {
            return C._ts_lookahead_iterator_current_symbol(this[0]);
          }
          get currentType() {
            return this.language.types[this.currentTypeId] || "ERROR";
          }
          delete() {
            C._ts_lookahead_iterator_delete(this[0]);
            this[0] = 0;
          }
          resetState(stateId) {
            return C._ts_lookahead_iterator_reset_state(this[0], stateId);
          }
          reset(language, stateId) {
            if (C._ts_lookahead_iterator_reset(this[0], language[0], stateId)) {
              this.language = language;
              return true;
            }
            return false;
          }
          [Symbol.iterator]() {
            const self = this;
            return {
              next() {
                if (C._ts_lookahead_iterator_next(self[0])) {
                  return {
                    done: false,
                    value: self.currentType
                  };
                }
                return {
                  done: true,
                  value: ""
                };
              }
            };
          }
        }
        class Query {
          constructor(internal, address, captureNames, textPredicates, predicates, setProperties, assertedProperties, refutedProperties) {
            assertInternal(internal);
            this[0] = address;
            this.captureNames = captureNames;
            this.textPredicates = textPredicates;
            this.predicates = predicates;
            this.setProperties = setProperties;
            this.assertedProperties = assertedProperties;
            this.refutedProperties = refutedProperties;
            this.exceededMatchLimit = false;
          }
          delete() {
            C._ts_query_delete(this[0]);
            this[0] = 0;
          }
          matches(node, {startPosition: startPosition = ZERO_POINT, endPosition: endPosition = ZERO_POINT, startIndex: startIndex = 0, endIndex: endIndex = 0, matchLimit: matchLimit = 4294967295, maxStartDepth: maxStartDepth = 4294967295, timeoutMicros: timeoutMicros = 0} = {}) {
            if (typeof matchLimit !== "number") {
              throw new Error("Arguments must be numbers");
            }
            marshalNode(node);
            C._ts_query_matches_wasm(this[0], node.tree[0], startPosition.row, startPosition.column, endPosition.row, endPosition.column, startIndex, endIndex, matchLimit, maxStartDepth, timeoutMicros);
            const rawCount = getValue(TRANSFER_BUFFER, "i32");
            const startAddress = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const didExceedMatchLimit = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
            const result = new Array(rawCount);
            this.exceededMatchLimit = Boolean(didExceedMatchLimit);
            let filteredCount = 0;
            let address = startAddress;
            for (let i = 0; i < rawCount; i++) {
              const pattern = getValue(address, "i32");
              address += SIZE_OF_INT;
              const captureCount = getValue(address, "i32");
              address += SIZE_OF_INT;
              const captures = new Array(captureCount);
              address = unmarshalCaptures(this, node.tree, address, captures);
              if (this.textPredicates[pattern].every(p => p(captures))) {
                result[filteredCount] = {
                  pattern: pattern,
                  captures: captures
                };
                const setProperties = this.setProperties[pattern];
                if (setProperties) result[filteredCount].setProperties = setProperties;
                const assertedProperties = this.assertedProperties[pattern];
                if (assertedProperties) result[filteredCount].assertedProperties = assertedProperties;
                const refutedProperties = this.refutedProperties[pattern];
                if (refutedProperties) result[filteredCount].refutedProperties = refutedProperties;
                filteredCount++;
              }
            }
            result.length = filteredCount;
            C._free(startAddress);
            return result;
          }
          captures(node, {startPosition: startPosition = ZERO_POINT, endPosition: endPosition = ZERO_POINT, startIndex: startIndex = 0, endIndex: endIndex = 0, matchLimit: matchLimit = 4294967295, maxStartDepth: maxStartDepth = 4294967295, timeoutMicros: timeoutMicros = 0} = {}) {
            if (typeof matchLimit !== "number") {
              throw new Error("Arguments must be numbers");
            }
            marshalNode(node);
            C._ts_query_captures_wasm(this[0], node.tree[0], startPosition.row, startPosition.column, endPosition.row, endPosition.column, startIndex, endIndex, matchLimit, maxStartDepth, timeoutMicros);
            const count = getValue(TRANSFER_BUFFER, "i32");
            const startAddress = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
            const didExceedMatchLimit = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
            const result = [];
            this.exceededMatchLimit = Boolean(didExceedMatchLimit);
            const captures = [];
            let address = startAddress;
            for (let i = 0; i < count; i++) {
              const pattern = getValue(address, "i32");
              address += SIZE_OF_INT;
              const captureCount = getValue(address, "i32");
              address += SIZE_OF_INT;
              const captureIndex = getValue(address, "i32");
              address += SIZE_OF_INT;
              captures.length = captureCount;
              address = unmarshalCaptures(this, node.tree, address, captures);
              if (this.textPredicates[pattern].every(p => p(captures))) {
                const capture = captures[captureIndex];
                const setProperties = this.setProperties[pattern];
                if (setProperties) capture.setProperties = setProperties;
                const assertedProperties = this.assertedProperties[pattern];
                if (assertedProperties) capture.assertedProperties = assertedProperties;
                const refutedProperties = this.refutedProperties[pattern];
                if (refutedProperties) capture.refutedProperties = refutedProperties;
                result.push(capture);
              }
            }
            C._free(startAddress);
            return result;
          }
          predicatesForPattern(patternIndex) {
            return this.predicates[patternIndex];
          }
          disableCapture(captureName) {
            const captureNameLength = lengthBytesUTF8(captureName);
            const captureNameAddress = C._malloc(captureNameLength + 1);
            stringToUTF8(captureName, captureNameAddress, captureNameLength + 1);
            C._ts_query_disable_capture(this[0], captureNameAddress, captureNameLength);
            C._free(captureNameAddress);
          }
          didExceedMatchLimit() {
            return this.exceededMatchLimit;
          }
        }
        function getText(tree, startIndex, endIndex) {
          const length = endIndex - startIndex;
          let result = tree.textCallback(startIndex, null, endIndex);
          startIndex += result.length;
          while (startIndex < endIndex) {
            const string = tree.textCallback(startIndex, null, endIndex);
            if (string && string.length > 0) {
              startIndex += string.length;
              result += string;
            } else {
              break;
            }
          }
          if (startIndex > endIndex) {
            result = result.slice(0, length);
          }
          return result;
        }
        function unmarshalCaptures(query, tree, address, result) {
          for (let i = 0, n = result.length; i < n; i++) {
            const captureIndex = getValue(address, "i32");
            address += SIZE_OF_INT;
            const node = unmarshalNode(tree, address);
            address += SIZE_OF_NODE;
            result[i] = {
              name: query.captureNames[captureIndex],
              node: node
            };
          }
          return address;
        }
        function assertInternal(x) {
          if (x !== INTERNAL) throw new Error("Illegal constructor");
        }
        function isPoint(point) {
          return (point && typeof point.row === "number" && typeof point.column === "number");
        }
        function marshalNode(node) {
          let address = TRANSFER_BUFFER;
          setValue(address, node.id, "i32");
          address += SIZE_OF_INT;
          setValue(address, node.startIndex, "i32");
          address += SIZE_OF_INT;
          setValue(address, node.startPosition.row, "i32");
          address += SIZE_OF_INT;
          setValue(address, node.startPosition.column, "i32");
          address += SIZE_OF_INT;
          setValue(address, node[0], "i32");
        }
        function unmarshalNode(tree, address = TRANSFER_BUFFER) {
          const id = getValue(address, "i32");
          address += SIZE_OF_INT;
          if (id === 0) return null;
          const index = getValue(address, "i32");
          address += SIZE_OF_INT;
          const row = getValue(address, "i32");
          address += SIZE_OF_INT;
          const column = getValue(address, "i32");
          address += SIZE_OF_INT;
          const other = getValue(address, "i32");
          const result = new Node(INTERNAL, tree);
          result.id = id;
          result.startIndex = index;
          result.startPosition = {
            row: row,
            column: column
          };
          result[0] = other;
          return result;
        }
        function marshalTreeCursor(cursor, address = TRANSFER_BUFFER) {
          setValue(address + 0 * SIZE_OF_INT, cursor[0], "i32");
          setValue(address + 1 * SIZE_OF_INT, cursor[1], "i32");
          setValue(address + 2 * SIZE_OF_INT, cursor[2], "i32");
          setValue(address + 3 * SIZE_OF_INT, cursor[3], "i32");
        }
        function unmarshalTreeCursor(cursor) {
          cursor[0] = getValue(TRANSFER_BUFFER + 0 * SIZE_OF_INT, "i32");
          cursor[1] = getValue(TRANSFER_BUFFER + 1 * SIZE_OF_INT, "i32");
          cursor[2] = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
          cursor[3] = getValue(TRANSFER_BUFFER + 3 * SIZE_OF_INT, "i32");
        }
        function marshalPoint(address, point) {
          setValue(address, point.row, "i32");
          setValue(address + SIZE_OF_INT, point.column, "i32");
        }
        function unmarshalPoint(address) {
          const result = {
            row: getValue(address, "i32") >>> 0,
            column: getValue(address + SIZE_OF_INT, "i32") >>> 0
          };
          return result;
        }
        function marshalRange(address, range) {
          marshalPoint(address, range.startPosition);
          address += SIZE_OF_POINT;
          marshalPoint(address, range.endPosition);
          address += SIZE_OF_POINT;
          setValue(address, range.startIndex, "i32");
          address += SIZE_OF_INT;
          setValue(address, range.endIndex, "i32");
          address += SIZE_OF_INT;
        }
        function unmarshalRange(address) {
          const result = {};
          result.startPosition = unmarshalPoint(address);
          address += SIZE_OF_POINT;
          result.endPosition = unmarshalPoint(address);
          address += SIZE_OF_POINT;
          result.startIndex = getValue(address, "i32") >>> 0;
          address += SIZE_OF_INT;
          result.endIndex = getValue(address, "i32") >>> 0;
          return result;
        }
        function marshalEdit(edit) {
          let address = TRANSFER_BUFFER;
          marshalPoint(address, edit.startPosition);
          address += SIZE_OF_POINT;
          marshalPoint(address, edit.oldEndPosition);
          address += SIZE_OF_POINT;
          marshalPoint(address, edit.newEndPosition);
          address += SIZE_OF_POINT;
          setValue(address, edit.startIndex, "i32");
          address += SIZE_OF_INT;
          setValue(address, edit.oldEndIndex, "i32");
          address += SIZE_OF_INT;
          setValue(address, edit.newEndIndex, "i32");
          address += SIZE_OF_INT;
        }
        // end include: /src/lib/binding_web/binding.js
        // include: /src/lib/binding_web/suffix.js
        for (const name of Object.getOwnPropertyNames(ParserImpl.prototype)) {
          Object.defineProperty(Parser.prototype, name, {
            value: ParserImpl.prototype[name],
            enumerable: false,
            writable: false
          });
        }
        Parser.Language = Language;
        Module.onRuntimeInitialized = () => {
          ParserImpl.init();
          resolveInitPromise();
        };
      });
    }
  }
  return Parser;
}();

if (true) {
  module.exports = TreeSitter;
}


/***/ }),
/* 5 */
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 6 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 7 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchResource = fetchResource;
const vscode = __importStar(__webpack_require__(2));
async function fetchResource(context, ...pathSegments) {
    const uri = vscode.Uri.joinPath(context.extensionUri, ...pathSegments);
    return await vscode.workspace.fs.readFile(uri);
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = decode;
exports.encode = encode;
exports.truncateAtWhitespace = truncateAtWhitespace;
exports.stripQuotes = stripQuotes;
exports.stripIncludeQuotes = stripIncludeQuotes;
exports.dirname = dirname;
exports.camelCaseToWords = camelCaseToWords;
function decode(input) {
    return new TextDecoder().decode(input);
}
function encode(input) {
    return new TextEncoder().encode(input);
}
/**
 * Removes all text after the first instance of whitespace in the given string.
 */
function truncateAtWhitespace(text) {
    return text.replace(/\s.+$/s, '');
}
function stripQuotes(text) {
    if (text.startsWith('"') && text.endsWith('"')) {
        return text.substring(1, text.length - 1);
    }
    return text;
}
function stripIncludeQuotes(text) {
    if (text.startsWith('<') && text.endsWith('>')) {
        return text.substring(1, text.length - 1);
    }
    return stripQuotes(text);
}
function dirname(uri) {
    const sepIndex = uri.path.lastIndexOf('/');
    if (sepIndex < 0) {
        return uri;
    }
    const dirname = uri.path.slice(0, sepIndex);
    return uri.with({ path: dirname });
}
function camelCaseToWords(str) {
    return str.replace(/([a-z])([A-Z])/, (_, end, start) => end + ' ' + start.toLowerCase());
}


/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getBehaviors = getBehaviors;
exports.testBehavior = testBehavior;
exports.behaviorsToSignatures = behaviorsToSignatures;
exports.behaviorsToCompletions = behaviorsToCompletions;
exports.parameterToCompletions = parameterToCompletions;
const vscode = __importStar(__webpack_require__(2));
const behaviors_yaml_1 = __importDefault(__webpack_require__(11));
const keycodes_1 = __webpack_require__(12);
const keymap_1 = __webpack_require__(14);
const mouse_1 = __webpack_require__(20);
const util_1 = __webpack_require__(9);
const BEHAVIORS_INCLUDE = 'behaviors.dtsi';
const PREFERRED_BEHAVIOR = '&kp';
const BEHAVIORS = behaviors_yaml_1.default.behaviors;
const MACRO_BEHAVIORS = behaviors_yaml_1.default.macroBehaviors;
function isParamMatch(behavior, params) {
    let node = behavior.nextNamedSibling;
    for (const param of params) {
        if (!node || node.text !== param) {
            return false;
        }
        node = node.nextNamedSibling;
    }
    return true;
}
function getBehaviors(property, compatible) {
    if (compatible === 'zmk,behavior-macro') {
        const result = (BEHAVIORS[property] ?? []).concat(MACRO_BEHAVIORS[property] ?? []);
        return result.length > 0 ? result : undefined;
    }
    return BEHAVIORS[property];
}
function testBehavior(behavior, filter) {
    if (Array.isArray(filter)) {
        return filter.every((f) => testBehavior(behavior, f));
    }
    if (filter.params && !isParamMatch(behavior, filter.params)) {
        return false;
    }
    if (filter.paramsNot && isParamMatch(behavior, filter.paramsNot)) {
        return false;
    }
    return true;
}
/**
 * Gets a list of function signatures for behaviors.
 * @param behaviors A list of behaviors valid for this location.
 * @param activeParameter The index of the active parameter. The returned
 *      signatures will be filtered to those where this is a valid parameter.
 */
function behaviorsToSignatures(behaviors, activeParameter) {
    let filtered = behaviors;
    if (activeParameter !== undefined) {
        filtered = behaviors.filter((b) => activeParameter < b.parameters.length);
    }
    return filtered.map((b) => {
        const sig = new vscode.SignatureInformation(b.label, new vscode.MarkdownString(b.documentation));
        sig.parameters = b.parameters.map(getParameterInformation);
        sig.activeParameter = activeParameter;
        return sig;
    });
}
/**
 * Gets a list of code completions for behaviors.
 * @param behaviors A list of behaviors valid for this location.
 * @param range The range to replace when a completion is committed.
 */
function behaviorsToCompletions(behaviors, includeInfo, range) {
    const additionalTextEdits = (0, keymap_1.addMissingSystemInclude)(includeInfo, BEHAVIORS_INCLUDE);
    function getEntry(b) {
        const label = (0, util_1.truncateAtWhitespace)(b.label);
        const completion = new vscode.CompletionItem(label, vscode.CompletionItemKind.Function);
        completion.documentation = new vscode.MarkdownString(b.documentation);
        completion.range = range;
        completion.additionalTextEdits = additionalTextEdits;
        // TODO: remember the last-used behavior and prefer that.
        if (label === PREFERRED_BEHAVIOR) {
            completion.preselect = true;
        }
        return [label, completion];
    }
    const dedupe = new Map(behaviors.map(getEntry));
    return [...dedupe.values()];
}
/**
 * Gets a list of code completions for the active parameter.
 * @param parameter The active parameter.
 */
function parameterToCompletions(parameter, includeInfo) {
    if (Array.isArray(parameter.type)) {
        const additionalTextEdits = parameter.include ? (0, keymap_1.addMissingSystemInclude)(includeInfo, parameter.include) : [];
        return parameter.type.map((v) => {
            const completion = new vscode.CompletionItem(v.label, vscode.CompletionItemKind.EnumMember);
            completion.documentation = new vscode.MarkdownString(v.documentation);
            completion.additionalTextEdits = additionalTextEdits;
            return completion;
        });
    }
    switch (parameter.type) {
        case 'keycode':
            return (0, keycodes_1.getKeycodeCompletions)(includeInfo);
        case 'modifier':
            return (0, keycodes_1.getModifierCompletions)(includeInfo);
        case 'mouseButton':
            return (0, mouse_1.getMouseButtonCompletions)(includeInfo);
    }
    return [];
}
/**
 * Gets the ParameterInformation for a parameter
 */
function getParameterInformation(parameter) {
    let documentation = parameter.documentation;
    if (typeof documentation === 'string' && parameter.type) {
        const typeName = (0, util_1.camelCaseToWords)(parameter.type);
        documentation = new vscode.MarkdownString(`\`${typeName}\`: ${documentation}`);
    }
    return { label: parameter.label, documentation };
}


/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"parameters":{"keycode":{"documentation":"Key code","label":"KEYCODE","type":"keycode"},"layer":{"documentation":"Layer index","label":"LAYER","type":"integer"},"mouseButton":{"documentation":"Mouse button","label":"BUTTON","type":"mouseButton"}},"behaviors":{"bindings":[{"label":"&kp KEYCODE","documentation":"[Key press](https://zmk.dev/docs/keymaps/behaviors/key-press)\\n\\nSends standard key codes on press/release.\\n","parameters":[{"documentation":"Key code","label":"KEYCODE","type":"keycode"}]},{"label":"&kt KEYCODE","documentation":"[Key toggle](https://zmk.dev/docs/keymaps/behaviors/key-toggle)\\n\\nToggles whether a key is pressed.\\n","parameters":[{"documentation":"Key code","label":"KEYCODE","type":"keycode"}]},{"label":"&mo LAYER","documentation":"[Momentary layer](https://zmk.dev/docs/keymaps/behaviors/layers#momentary-layer)\\n\\nSwitches to a layer while the key is held.\\n","parameters":[{"documentation":"Layer index","label":"LAYER","type":"integer"}]},{"label":"&lt LAYER TAP","documentation":"[Layer-tap](https://zmk.dev/docs/keymaps/behaviors/layers#layer-tap)\\n\\n* **On hold:** switches to a layer\\n* **On tap:** sends a keycode\\n","parameters":[{"label":"LAYER","type":"integer","documentation":"Layer index to use when held"},{"label":"TAP","type":"keycode","documentation":"Key code to send when tapped"}]},{"label":"&to","documentation":"[To layer](https://zmk.dev/docs/keymaps/behaviors/layers#to-layer)\\n\\nEnables a layer and disables all other layers except the default layer.\\n","parameters":[{"documentation":"Layer index","label":"LAYER","type":"integer"}]},{"label":"&tog LAYER","documentation":"[Toggle layer](https://zmk.dev/docs/keymaps/behaviors/layers#toggle-layer)\\n\\nToggles whether a layer is enabled.\\n","parameters":[{"documentation":"Layer index","label":"LAYER","type":"integer"}]},{"label":"&trans","documentation":"[Transparent](https://zmk.dev/docs/keymaps/behaviors/misc#transparent)\\n\\nPasses key presses down to the next active layer in the stack.\\nDoes nothing if on the base layer.\\n","parameters":[]},{"label":"&none","documentation":"[None](https://zmk.dev/docs/keymaps/behaviors/misc#none)\\n\\nIgnores a key press so it will *not* be passed down to the next active layer in the stack.\\n","parameters":[]},{"label":"&mt MODIFIER TAP","documentation":"[Mod-tap](https://zmk.dev/docs/keymaps/behaviors/mod-tap)\\n\\n* **On hold:** holds a modifier\\n* **On tap:** sends a keycode\\n","parameters":[{"label":"MODIFIER","documentation":"Modifier to send when held","type":"modifier"},{"label":"TAP","documentation":"Key code to send when tapped","type":"keycode"}]},{"label":"&gresc","documentation":"[Grave escape](https://zmk.dev/docs/keymaps/behaviors/mod-morph)\\n\\nSends `&kp ESCAPE` normally or `&kp GRAVE` when either Shift or GUI modifiers are held.\\n","parameters":[]},{"label":"&sk KEYCODE","documentation":"[Sticky key](https://zmk.dev/docs/keymaps/behaviors/sticky-key)\\n\\nSends a key and keeps it pressed until another key is pressed.\\n","parameters":[{"documentation":"Key code","label":"KEYCODE","type":"keycode"}]},{"label":"&sl LAYER","documentation":"[Sticky layer](https://zmk.dev/docs/keymaps/behaviors/sticky-layer)\\n\\nActivates a layer until another key is pressed.\\n","parameters":[{"documentation":"Layer index","label":"LAYER","type":"integer"}]},{"label":"&caps_word","documentation":"[Caps word](https://zmk.dev/docs/keymaps/behaviors/caps-word)\\n\\nActs like caps lock but automatically deactivates when a \\"break\\" key is pressed.\\n","parameters":[]},{"label":"&key_repeat","documentation":"[Key repeat](https://zmk.dev/docs/keymaps/behaviors/key-repeat)\\n\\nSends whatever key code was last sent.\\n","parameters":[]},{"label":"&sys_reset","documentation":"[Reset](https://zmk.dev/docs/keymaps/behaviors/reset#reset)\\n\\nResets the keyboard and restarts its firmware.\\n","parameters":[]},{"label":"&bootloader","documentation":"[Bootloader reset](https://zmk.dev/docs/keymaps/behaviors/reset#bootloader-reset)\\n\\nResets the keyboard and puts it into bootloader mode, allowing you to flash new firmware.\\n","parameters":[]},{"label":"&bt ACTION","documentation":"[Bluetooth command](https://zmk.dev/docs/keymaps/behaviors/bluetooth)\\n","if":[{"paramsNot":["BT_SEL"]},{"paramsNot":["BT_DISC"]}],"parameters":[{"label":"ACTION","include":"dt-bindings/zmk/bt.h","type":[{"label":"BT_CLR","documentation":"Clear bond information between the keyboard and host for the selected profile."},{"label":"BT_NXT","documentation":"Switch to the next profile, cycling through to the first one when the end is reached."},{"label":"BT_PRV","documentation":"Switch to the previous profile, cycling through to the last one when the beginning is reached."},{"label":"BT_SEL","documentation":"Select the 0-indexed profile by number."},{"label":"BT_DISC","documentation":"Disconnect from the 0-indexed profile by number, if it\'s currently connected and inactive."}]}]},{"label":"&bt BT_SEL PROFILE","documentation":"[Bluetooth command](https://zmk.dev/docs/keymaps/behaviors/bluetooth)\\n\\nSelect the 0-indexed profile by number.\\n","if":{"params":["BT_SEL"]},"parameters":[{"label":"BT_SEL","include":"dt-bindings/zmk/bt.h","type":[{"label":"BT_SEL","documentation":"Selects the 0-indexed profile by number."}]},{"label":"PROFILE","documentation":"0-based index of the profile to select.","type":"integer"}]},{"label":"&bt BT_DISC PROFILE","documentation":"[Bluetooth command](https://zmk.dev/docs/keymaps/behaviors/bluetooth)\\n\\nDisconnect from the 0-indexed profile by number, if it\'s currently connected and inactive.\\n","if":{"params":["BT_DISC"]},"parameters":[{"label":"BT_DISC","include":"dt-bindings/zmk/bt.h","type":[{"label":"BT_DISC","documentation":"Disconnect from the 0-indexed profile by number, if it\'s currently connected and inactive."}]},{"label":"PROFILE","documentation":"0-based index of the profile from which to disconnect.","type":"integer"}]},{"label":"&out ACTION","documentation":"[Output selection command](https://zmk.dev/docs/keymaps/behaviors/outputs)\\n","parameters":[{"label":"ACTION","include":"dt-bindings/zmk/outputs.h","type":[{"label":"OUT_USB","documentation":"Prefer sending to USB."},{"label":"OUT_BLE","documentation":"Prefer sending to the current bluetooth profile."},{"label":"OUT_TOG","documentation":"Toggle between USB and BLE."}]}]},{"label":"&rgb_ug ACTION","documentation":"[RGB underglow command](https://zmk.dev/docs/keymaps/behaviors/lighting#rgb-underglow)\\n","parameters":[{"label":"ACTION","include":"dt-bindings/zmk/rgb.h","type":[{"label":"RGB_TOG","documentation":"Toggles the RGB feature on and off."},{"label":"RGB_HUI","documentation":"Increases the hue of the RGB feature."},{"label":"RGB_HUD","documentation":"Decreases the hue of the RGB feature."},{"label":"RGB_SAI","documentation":"Increases the saturation of the RGB feature."},{"label":"RGB_SAD","documentation":"Decreases the saturation of the RGB feature. 😢"},{"label":"RGB_BRI","documentation":"Increases the brightness of the RGB feature."},{"label":"RGB_BRD","documentation":"Decreases the brightness of the RGB feature."},{"label":"RGB_SPI","documentation":"Increases the speed of the RGB feature effect\'s animation."},{"label":"RGB_SPD","documentation":"Decreases the speed of the RGB feature effect\'s animation."},{"label":"RGB_EFF","documentation":"Cycles the RGB feature\'s effect forwards."},{"label":"RGB_EFR","documentation":"Cycles the RGB feature\'s effect reverse."}]}]},{"label":"&bl ACTION","documentation":"[Backlight command](https://zmk.dev/docs/keymaps/behaviors/backlight)\\n","if":{"paramsNot":["BL_SET"]},"parameters":[{"label":"ACTION","include":"dt-bindings/zmk/backlight.h","type":[{"label":"BL_ON","documentation":"Turn on backlight"},{"label":"BL_OFF","documentation":"Turn off backlight"},{"label":"BL_TOG","documentation":"Toggle backlight on and off"},{"label":"BL_INC","documentation":"Increase brightness"},{"label":"BL_DEC","documentation":"Decrease brightness"},{"label":"BL_CYCLE","documentation":"Cycle brightness"},{"label":"BL_SET","documentation":"Set a specific brightness"}]}]},{"label":"&bl BL_SET BRIGHTNESS","documentation":"[Backlight command](https://zmk.dev/docs/keymaps/behaviors/backlight)\\n\\nSet backlight brightness\\n","if":{"params":["BL_SET"]},"parameters":[{"label":"BL_SET","include":"dt-bindings/zmk/backlight.h","type":[{"label":"BL_SET","documentation":"Set a specific brightness"}]},{"label":"BRIGHTNESS","documentation":"Brightness as a percentage","type":"integer"}]},{"label":"&ext_power ACTION","documentation":"[External power control](https://zmk.dev/docs/keymaps/behaviors/power#external-power-control)\\n","parameters":[{"label":"ACTION","include":"dt-bindings/zmk/ext_power.h","type":[{"label":"EP_OFF","documentation":"Disable the external power."},{"label":"EP_ON","documentation":"Enable the external power."},{"label":"EP_TOG","documentation":"Toggle the external power on/off."}]}]},{"label":"&mkp BUTTON","documentation":"[Mouse button press](https://zmk.dev/docs/keymaps/behaviors/mouse-emulation#mouse-button-press)\\n\\nSends a mouse button press.\\n","parameters":[{"documentation":"Mouse button","label":"BUTTON","type":"mouseButton"}]},{"label":"&soft_off","documentation":"[Soft Off](https://zmk.dev/docs/keymaps/behaviors/soft-off)\\n\\nPuts the keyboard into an off state. It can be turned back on with the reset button,\\nor on specific keyboards, with a dedicated on button.\\n","parameters":[]},{"label":"&studio_unlock","documentation":"[ZMK Studio Unlock](https://zmk.dev/docs/keymaps/behaviors/studio-unlock)\\n\\nGrants [ZMK Studio](https://zmk.dev/docs/features/studio) access to make changes to the keyboard.\\n","parameters":[]}],"sensor-bindings":[{"label":"&inc_dec_kp CW_KEY CCW_KEY","documentation":"[Encoder key press](https://zmk.dev/docs/features/encoders)\\n\\nSends keycodes when rotating an encoder.\\n","parameters":[{"label":"CW_KEY","documentation":"Keycode to send when the encoder is rotated clockwise.","type":"keycode"},{"label":"CCW_KEY","documentation":"Keycode to send when the encoder is rotated counter-clockwise.","type":"keycode"}]}]},"macroBehaviors":{"bindings":[{"label":"&macro_tap","documentation":"[Tap mode](https://zmk.dev/docs/keymaps/behaviors/macros#binding-activation-mode)\\n\\nSwitch the macro to key tap mode\\n","parameters":[]},{"label":"&macro_press","documentation":"[Press mode](https://zmk.dev/docs/keymaps/behaviors/macros#binding-activation-mode)\\n\\nSwitch the macro to key press mode\\n","parameters":[]},{"label":"&macro_release","documentation":"[Release mode](https://zmk.dev/docs/keymaps/behaviors/macros#binding-activation-mode)\\n\\nSwitch the macro to key release mode\\n","parameters":[]},{"label":"&macro_tap_time TAP_MS","documentation":"[Tap time](https://zmk.dev/docs/keymaps/behaviors/macros#tap-time)\\n\\nChange the duration of taps when in tap mode\\n","parameters":[{"label":"TAP_MS","documentation":"Tap duration in milliseconds","type":"integer"}]},{"label":"&macro_wait_time WAIT_MS","documentation":"[Wait time](https://zmk.dev/docs/keymaps/behaviors/macros#wait-time)\\n\\nChange the time to wait between bindings\\n","parameters":[{"label":"WAIT_MS","documentation":"Delay in milliseconds","type":"integer"}]},{"label":"&macro_pause_for_release","documentation":"[Pause for release](https://zmk.dev/docs/keymaps/behaviors/macros#processing-continuation-on-release)\\n\\nPause the macro until the key that triggered the macro is released\\n","parameters":[]}]}}');

/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getKeycodeCompletions = getKeycodeCompletions;
exports.getModifierCompletions = getModifierCompletions;
const markdown_escape_1 = __importDefault(__webpack_require__(13));
const vscode = __importStar(__webpack_require__(2));
const keymap_1 = __webpack_require__(14);
const hid_1 = __importDefault(__webpack_require__(15));
const operating_systems_1 = __importDefault(__webpack_require__(19));
const KEYS_INCLUDE = 'dt-bindings/zmk/keys.h';
const keycodeCompletions = [];
const modifierCompletions = [];
/**
 * Gets completion items for a keycode value.
 */
function getKeycodeCompletions(includeInfo) {
    if (keycodeCompletions.length === 0) {
        initKeycodeCompletions();
    }
    const additionalTextEdits = (0, keymap_1.addMissingSystemInclude)(includeInfo, KEYS_INCLUDE);
    if (additionalTextEdits.length > 0) {
        return keycodeCompletions.map((item) => {
            return { ...item, additionalTextEdits };
        });
    }
    return keycodeCompletions;
}
/**
 * Gets completion items for a modifier value.
 */
function getModifierCompletions(includeInfo) {
    if (modifierCompletions.length === 0) {
        initModifierCompletions();
    }
    const additionalTextEdits = (0, keymap_1.addMissingSystemInclude)(includeInfo, KEYS_INCLUDE);
    if (additionalTextEdits.length > 0) {
        return modifierCompletions.map((item) => {
            return { ...item, additionalTextEdits };
        });
    }
    return modifierCompletions;
}
function initKeycodeCompletions() {
    for (const definition of hid_1.default) {
        addKeyDefinition(definition);
    }
}
function addKeyDefinition(def) {
    const documentation = getKeyDocumentation(def);
    for (const name of def.names) {
        const completion = {
            label: name,
            detail: def.context,
            kind: vscode.CompletionItemKind.EnumMember,
            documentation,
        };
        if (isMacro(name)) {
            // Don't insert the "(code)" part of a macro.
            // TODO: can this be implemented so that committing with tab/enter
            // also inserts the parenthesis?
            completion.insertText = name.split('(')[0];
            completion.commitCharacters = ['('];
        }
        keycodeCompletions.push(completion);
    }
}
function initModifierCompletions() {
    for (const definition of hid_1.default) {
        addModifierDefinition(definition);
    }
}
function addModifierDefinition(def) {
    // Keys with a macro as a possible name are modifiers.
    if (!def.names.some(isMacro)) {
        return;
    }
    const documentation = getKeyDocumentation(def);
    for (const name of def.names) {
        // ...but the macro itself is only valid as a modifier to a keycode.
        if (isMacro(name)) {
            continue;
        }
        const completion = {
            label: name,
            detail: 'Modifier',
            kind: vscode.CompletionItemKind.EnumMember,
            documentation,
        };
        modifierCompletions.push(completion);
    }
}
function getKeyDocumentation(def) {
    const support = operating_systems_1.default.map((os) => `* ${os.title}: ${supportIcon(def.os[os.key])}`);
    let aliases = '';
    if (def.names.length > 1) {
        aliases = 'Aliases: ' + def.names.map((n) => `\`${n}\``).join(', ');
    }
    const markdown = `${(0, markdown_escape_1.default)(def.description)}\n\n${aliases}\n\n${support.join('\n')}`;
    return new vscode.MarkdownString(markdown, true);
}
function isMacro(name) {
    return name.includes('(');
}
function supportIcon(support) {
    if (support === true) {
        return '✔️';
    }
    if (support === false) {
        return '❌';
    }
    return '❔';
}


/***/ }),
/* 13 */
/***/ ((module) => {

var replacements = [
  [/\*/g, '\\*', 'asterisks'],
  [/#/g, '\\#', 'number signs'],
  [/\//g, '\\/', 'slashes'],
  [/\(/g, '\\(', 'parentheses'],
  [/\)/g, '\\)', 'parentheses'],
  [/\[/g, '\\[', 'square brackets'],
  [/\]/g, '\\]', 'square brackets'],
  [/</g, '&lt;', 'angle brackets'],
  [/>/g, '&gt;', 'angle brackets'],
  [/_/g, '\\_', 'underscores'],
  [/`/g, '\\`', 'codeblocks']
]

module.exports = function (string, skips) {
  skips = skips || []
  return replacements.reduce(function (string, replacement) {
    var name = replacement[2]
    return name && skips.indexOf(name) !== -1
      ? string
      : string.replace(replacement[0], replacement[1])
  }, string)
}


/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SELECTOR = void 0;
exports.isKeymap = isKeymap;
exports.addMissingSystemInclude = addMissingSystemInclude;
const vscode = __importStar(__webpack_require__(2));
exports.SELECTOR = {
    pattern: '**/*.keymap',
};
function isKeymap(document) {
    return document.uri.path.endsWith('.keymap');
}
function addMissingSystemInclude(includeInfo, path) {
    if (includeInfo.paths.includes(path)) {
        return [];
    }
    return [getSystemIncludeTextEdit(includeInfo.insertPosition, path)];
}
function getSystemIncludeTextEdit(position, path) {
    return vscode.TextEdit.insert(position, `#include <${path}>\n`);
}


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _hid_applications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);
/* harmony import */ var _hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18);
/* harmony import */ var _hid_usage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: CC-BY-NC-SA-4.0
 */







/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([
  {
    names: ["A"],
    description: "a and A",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x04),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["B"],
    description: "b and B",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x05),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C"],
    description: "c and C",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x06),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["D"],
    description: "d and D",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x07),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["E"],
    description: "e and E",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x08),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F"],
    description: "f and F",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x09),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["G"],
    description: "g and G",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x0a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["H"],
    description: "h and H",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x0b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["I"],
    description: "i and I",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x0c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["J"],
    description: "j and J",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x0d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["K"],
    description: "k and K",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x0e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["L"],
    description: "l and L",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x0f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["M"],
    description: "m and M",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x10),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["N"],
    description: "n and N",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x11),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["O"],
    description: "o and O",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x12),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["P"],
    description: "p and P",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x13),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["Q"],
    description: "q and Q",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x14),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["R"],
    description: "r and R",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x15),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["S"],
    description: "s and S",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x16),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["T"],
    description: "t and T",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x17),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["U"],
    description: "u and U",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x18),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=83",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["V"],
    description: "v and V",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x19),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["W"],
    description: "w and W",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["X"],
    description: "x and X",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["Y"],
    description: "y and Y",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["Z"],
    description: "z and Z",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_1", "N1"],
    description: "1 and ! [Exclamation]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["EXCLAMATION", "EXCL"],
    description: "! [Exclamation]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1e),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_2", "N2"],
    description: "2 and @ [At Sign]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["AT_SIGN", "AT"],
    description: "@ [At Sign]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x1f),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_3", "N3"],
    description: "3 and # [Hash / Pound]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x20),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["HASH", "POUND"],
    description: "# [Hash / Pound]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x20),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_4", "N4"],
    description: "4 and $ [Dollar]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x21),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["DOLLAR", "DLLR"],
    description: "$ [Dollar]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x21),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_5", "N5"],
    description: "5 and % [Percent]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x22),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PERCENT", "PRCNT"],
    description: "% [Percent]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x22),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_6", "N6"],
    description: "6 and ^ [Caret]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x23),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["CARET"],
    description: "^ [Caret]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x23),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_7", "N7"],
    description: "7 and & [Ampersand]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x24),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["AMPERSAND", "AMPS"],
    description: "& [Ampersand]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x24),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_8", "N8"],
    description: "8 and * [Asterisk / Star]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x25),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["ASTERISK", "ASTRK", "STAR"],
    description: "* [Asterisk / Star]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x25),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_9", "N9"],
    description: "9 and ( [Left Parenthesis]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x26),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_PARENTHESIS", "LPAR"],
    description: "( [Left Parenthesis]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x26),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NUMBER_0", "N0"],
    description: "0 and ) [Right Parenthesis]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x27),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_PARENTHESIS", "RPAR"],
    description: ") [Right Parenthesis]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x27),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RETURN", "ENTER", "RET"],
    description: "Return (Enter)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x28),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["ESCAPE", "ESC"],
    description: "Escape",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x29),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["BACKSPACE", "BSPC"],
    description: "Backspace",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["TAB"],
    description: "Tab",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["SPACE"],
    description: "Space",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["MINUS"],
    description: "- [Minus] and _ [Underscore]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["UNDERSCORE", "UNDER"],
    description: "_ [Underscore]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2d),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["EQUAL"],
    description: "= [Equal] and + [Plus]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PLUS"],
    description: "+ [Plus]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2e),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_BRACKET", "LBKT"],
    description: "[ [Left Bracket] and { [Left Brace]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_BRACE", "LBRC"],
    description: "{ [Left Brace]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x2f),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_BRACKET", "RBKT"],
    description: "] [Right Bracket] and } [Right Brace]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x30),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_BRACE", "RBRC"],
    description: "} [Right Brace]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x30),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["BACKSLASH", "BSLH"],
    description: "\\ [Backslash] and | [Pipe]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x31),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PIPE"],
    description: "| [Pipe]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x31),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NON_US_HASH", "NUHS"],
    description: "Non-US # [Hash/Pound] and ~ [Tilde]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x32),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["TILDE2"],
    description: "~ [Tilde]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x32),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["SEMICOLON", "SEMI"],
    description: "; [Semicolon] and : [Colon]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x33),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["COLON"],
    description: ": [Colon]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x33),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["SINGLE_QUOTE", "SQT", "APOSTROPHE", "APOS"],
    description: "' [Apostrophe] and \" [Quote (Double)]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x34),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["DOUBLE_QUOTES", "DQT"],
    description: '" [Quote (Double)]',
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x34),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["GRAVE"],
    description: "` [Grave Accent] and ~ [Tilde]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x35),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["TILDE"],
    description: "~ [Tilde]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x35),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["COMMA"],
    description: ", [Comma] and < [Less Than]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x36),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LESS_THAN", "LT"],
    description: "< [Less Than]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x36),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PERIOD", "DOT"],
    description: ". [Period] and > [Greater Than]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x37),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["GREATER_THAN", "GT"],
    description: "> [Greater Than]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x37),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["SLASH", "FSLH"],
    description: "/ [Forward Slash] and ? [Question Mark]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x38),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["QUESTION", "QMARK"],
    description: "? [Question Mark]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x38),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["CAPSLOCK", "CAPS", "CLCK"],
    description: "Caps Lock",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x39),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F1"],
    description: "F1",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x3a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F2"],
    description: "F2",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x3b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F3"],
    description: "F3",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x3c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F4"],
    description: "F4",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x3d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=84",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F5"],
    description: "F5",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x3e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F6"],
    description: "F6",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x3f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F7"],
    description: "F7",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x40),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F8"],
    description: "F8",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x41),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F9"],
    description: "F9",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x42),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F10"],
    description: "F10",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x43),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F11"],
    description: "F11",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x44),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F12"],
    description: "F12",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x45),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PRINTSCREEN", "PSCRN"],
    description: "Print Screen",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x46),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["SCROLLLOCK", "SLCK"],
    description: "Scroll Lock",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x47),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PAUSE_BREAK"],
    description: "Pause / Break",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x48),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["INSERT", "INS"],
    description: "Insert",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x49),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["HOME"],
    description: "Home",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x4a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PAGE_UP", "PG_UP"],
    description: "Page Up",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x4b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["DELETE", "DEL"],
    description: "Delete",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x4c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["END"],
    description: "End",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x4d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PAGE_DOWN", "PG_DN"],
    description: "Page Down",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x4e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_ARROW", "RIGHT"],
    description: "⮕ [Right Arrow]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x4f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_ARROW", "LEFT"],
    description: "⬅ [Left Arrow]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x50),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["DOWN_ARROW", "DOWN"],
    description: "⬇ [Down Arrow]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x51),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["UP_ARROW", "UP"],
    description: "⬆ [Up Arrow]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x52),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMLOCK", "KP_NUM", "KP_NLCK"],
    description: "Numlock and Clear",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x53),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["CLEAR2"],
    description: "Clear",
    context: "Keypad",
    clarify: null,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x53),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["KP_DIVIDE", "KP_SLASH"],
    description: "/ [Divide]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x54),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_MULTIPLY", "KP_ASTERISK"],
    description: "* [Multiply]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x55),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_MINUS", "KP_SUBTRACT"],
    description: "- [Minus]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x56),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_PLUS"],
    description: "+ [Plus]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x57),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_ENTER"],
    description: "Enter",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x58),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_1", "KP_N1"],
    description: "1",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x59),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_2", "KP_N2"],
    description: "2",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x5a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_3", "KP_N3"],
    description: "3",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x5b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_4", "KP_N4"],
    description: "4",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x5c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_5", "KP_N5"],
    description: "5",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x5d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_6", "KP_N6"],
    description: "6",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x5e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_7", "KP_N7"],
    description: "7",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x5f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_8", "KP_N8"],
    description: "8",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x60),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_9", "KP_N9"],
    description: "9",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x61),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_NUMBER_0", "KP_N0"],
    description: "0",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x62),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=85",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["KP_DOT"],
    description: ". [Dot]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x63),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["NON_US_BACKSLASH", "NON_US_BSLH", "NUBS"],
    description: "Non-US \\ [Backslash] and | [Pipe]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x64),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["PIPE2"],
    description: "| [Pipe]",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x64),
      },
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["K_APPLICATION", "K_APP", "K_CONTEXT_MENU", "K_CMENU"],
    description: "Application (Context Menu)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x65),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {
      ios: ["iosApplication"],
    },
  },
  {
    names: ["K_POWER", "K_PWR"],
    description: "Power",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x66),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: false,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {
      macos: ["macosPower"],
      ios: ["iosPower"],
    },
  },
  {
    names: ["KP_EQUAL"],
    description: "= [Equal]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x67),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: null,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F13"],
    description: "F13",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x68),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F14"],
    description: "F14",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x69),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F15"],
    description: "F15",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x6a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F16"],
    description: "F16",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x6b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F17"],
    description: "F17",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x6c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F18"],
    description: "F18",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x6d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F19"],
    description: "F19",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x6e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F20"],
    description: "F20",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x6f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F21"],
    description: "F21",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x70),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F22"],
    description: "F22",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x71),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F23"],
    description: "F23",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x72),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["F24"],
    description: "F24",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x73),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["K_EXECUTE", "K_EXEC"],
    description: "Execute",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x74),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_HELP"],
    description: "Help",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x75),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_MENU"],
    description: "Menu",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x76),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_SELECT"],
    description: "Select",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x77),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_STOP"],
    description: "Stop",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x78),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_AGAIN", "K_REDO"],
    description: "Again",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x79),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_UNDO"],
    description: "Undo",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x7a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_CUT"],
    description: "Cut",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x7b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_COPY"],
    description: "Copy",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x7c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_PASTE"],
    description: "Paste",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x7d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_FIND"],
    description: "Find",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x7e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_MUTE"],
    description: "Mute",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x7f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: true,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_VOLUME_UP", "K_VOL_UP"],
    description: "Volume Up",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x80),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_VOLUME_DOWN", "K_VOL_DN"],
    description: "Volume Down",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x81),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LOCKING_CAPS", "LCAPS"],
    description: "Locking Caps Lock",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x82),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LOCKING_NUM", "LNLCK"],
    description: "Locking Num Lock",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x83),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LOCKING_SCROLL", "LSLCK"],
    description: "Locking Scroll Lock",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x84),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: true,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["KP_COMMA"],
    description: ", [Comma]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x85),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["KP_EQUAL_AS400"],
    description: "= [Equal] (AS/400 keyboards)",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x86),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_1", "INT1", "INT_RO"],
    description: "ろ (International 1)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x87),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_2", "INT2", "INT_KATAKANAHIRAGANA", "INT_KANA"],
    description: "かな (International 2)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x88),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_3", "INT3", "INT_YEN"],
    description: "¥ (International 3)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x89),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_4", "INT4", "INT_HENKAN"],
    description: "変換 (International 4)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x8a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=86",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_5", "INT5", "INT_MUHENKAN"],
    description: "無変換 (International 5)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x8b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_6", "INT6", "INT_KPJPCOMMA"],
    description: ", [カンマ] (International 6)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x8c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_7", "INT7"],
    description: "International 7",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x8d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_8", "INT8"],
    description: "International 8",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x8e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["INTERNATIONAL_9", "INT9"],
    description: "International 9",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x8f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_1", "LANG1", "LANG_HANGEUL"],
    description: "한/영 (Language 1)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x90),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_2", "LANG2", "LANG_HANJA"],
    description: "한자 (Language 2)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x91),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: true,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_3", "LANG3", "LANG_KATAKANA"],
    description: "カタカナ (Language 3)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x92),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_4", "LANG4", "LANG_HIRAGANA"],
    description: "ひらがな (Language 4)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x93),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_5", "LANG5", "LANG_ZENKAKUHANKAKU"],
    description: "半角/全角 (Language 5)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x94),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_6", "LANG6"],
    description: "Language 6",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x95),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_7", "LANG7"],
    description: "Language 7",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x96),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_8", "LANG8"],
    description: "Language 8",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x97),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["LANGUAGE_9", "LANG9"],
    description: "Language 9",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x98),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["ALT_ERASE"],
    description: "Alternate Erase",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x99),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["SYSREQ", "ATTENTION"],
    description: "SysReq / Attention",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x9a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["K_CANCEL"],
    description: "Cancel",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x9b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["CLEAR"],
    description: "Clear",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x9c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["PRIOR"],
    description: "Prior",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x9d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["RETURN2", "RET2"],
    description: "Return",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x9e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["SEPARATOR"],
    description: "Separator",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0x9f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["OUT"],
    description: "Out",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xa0),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["OPER"],
    description: "Oper",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xa1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["CLEAR_AGAIN"],
    description: "Clear / Again",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xa2),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["CRSEL"],
    description: "CrSel / Props",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xa3),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["EXSEL"],
    description: "ExSel",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xa4),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["KP_LEFT_PARENTHESIS", "KP_LPAR"],
    description: "( [Left Parenthesis]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xb6),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["KP_RIGHT_PARENTHESIS", "KP_RPAR"],
    description: ") [Right Parenthesis]",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xb7),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=87",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["KP_CLEAR"],
    description: "Clear",
    context: "Keypad",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xd8),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=88",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_CONTROL", "LCTRL", "LC(code)"],
    description: "Left Control",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe0),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=88",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_SHIFT", "LSHIFT", "LSHFT", "LS(code)"],
    description: "Left Shift ⇧",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=88",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["LEFT_ALT", "LALT", "LA(code)"],
    description: "Left Alt",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe2),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=88",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: [
      "LEFT_GUI",
      "LGUI",
      "LG(code)",
      "LEFT_WIN",
      "LWIN",
      "LEFT_COMMAND",
      "LCMD",
      "LEFT_META",
      "LMETA",
    ],
    description: "Left GUI (Windows / Command / Meta)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe3),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=88",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_CONTROL", "RCTRL", "RC(code)"],
    description: "Right Control",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe4),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=88",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_SHIFT", "RSHIFT", "RSHFT", "RS(code)"],
    description: "Right Shift ⇧",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe5),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=89",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["RIGHT_ALT", "RALT", "RA(code)"],
    description: "Right Alt",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe6),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=89",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: [
      "RIGHT_GUI",
      "RGUI",
      "RG(code)",
      "RIGHT_WIN",
      "RWIN",
      "RIGHT_COMMAND",
      "RCMD",
      "RIGHT_META",
      "RMETA",
    ],
    description: "Right GUI (Windows / Command / Meta)",
    context: "Keyboard",
    clarify: false,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe7),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=89",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["K_PLAY_PAUSE", "K_PP"],
    description: "Play / Pause",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe8),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_STOP2"],
    description: "Stop",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xe9),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_PREVIOUS", "K_PREV"],
    description: "Previous",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xea),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_NEXT"],
    description: "Next",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xeb),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_EJECT"],
    description: "Eject",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xec),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_VOLUME_UP2", "K_VOL_UP2"],
    description: "Volume Up",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xed),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_VOLUME_DOWN2", "K_VOL_DN2"],
    description: "Volume Down",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xee),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_MUTE2"],
    description: "Mute",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xef),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_WWW"],
    description: "Internet Browser",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf0),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_BACK"],
    description: "Back",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf1),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_FORWARD"],
    description: "Forward",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf2),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_STOP3"],
    description: "Stop",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf3),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_FIND2"],
    description: "Find",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf4),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_SCROLL_UP"],
    description: "Scroll Up",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf5),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_SCROLL_DOWN"],
    description: "Scroll Down",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf6),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_EDIT"],
    description: "Edit",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf7),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_SLEEP"],
    description: "Sleep",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf8),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_LOCK", "K_SCREENSAVER", "K_COFFEE"],
    description: "Lock",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xf9),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_REFRESH"],
    description: "Refresh",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xfa),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["K_CALCULATOR", "K_CALC"],
    description: "Calculator",
    context: "Keyboard",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.keyboard,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.key, 0xfb),
      },
    ],
    documentation:
      "https://source.android.com/devices/input/keyboard-devices#hid-keyboard-and-keypad-page-0x07",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: false,
      ios: false,
    },
    footnotes: {},
  },
  {
    names: ["C_POWER", "C_PWR"],
    description: "Power",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x30),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=132",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: true,
      ios: true,
    },
    footnotes: {
      macos: ["macosPower"],
      ios: ["iosPower"],
    },
  },
  {
    names: ["C_RESET"],
    description: "Reset",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x31),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=132",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_SLEEP"],
    description: "Sleep",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x32),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=132",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_SLEEP_MODE"],
    description: "Sleep Mode",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x34),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=132",
    os: {
      windows: null,
      linux: false,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU"],
    description: "Menu",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x40),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_PICK", "C_MENU_SELECT"],
    description: "Pick",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x41),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_UP"],
    description: "Up",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x42),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_DOWN"],
    description: "Down",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x43),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_LEFT"],
    description: "Left",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x44),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_RIGHT"],
    description: "Right",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x45),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_ESCAPE", "C_MENU_ESC"],
    description: "Escape",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x46),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_INCREASE", "C_MENU_INC"],
    description: "Value Increase",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x47),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MENU_DECREASE", "C_MENU_DEC"],
    description: "Value Decrease",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x48),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_DATA_ON_SCREEN"],
    description: "Data On Screen",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x60),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_CAPTIONS", "C_SUBTITLES"],
    description: "Closed Caption",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x61),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_SNAPSHOT"],
    description: "Snapshot",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x65),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_PIP"],
    description: "Picture-in-Picture Toggle",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x67),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: false,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_RED_BUTTON", "C_RED"],
    description: "Red Button",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x69),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_GREEN_BUTTON", "C_GREEN"],
    description: "Green Button",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x6a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_BLUE_BUTTON", "C_BLUE"],
    description: "Blue Button",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x6b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_YELLOW_BUTTON", "C_YELLOW"],
    description: "Yellow Button",
    context: "Consumer Menu",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x6c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=133",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_ASPECT"],
    description: "Aspect",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x6d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_BRIGHTNESS_INC", "C_BRI_INC", "C_BRI_UP"],
    description: "Increase Brightness",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x6f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: true,
      linux: true,
      android: null,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_BRIGHTNESS_DEC", "C_BRI_DEC", "C_BRI_DN"],
    description: "Decrease Brightness",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x70),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: true,
      linux: true,
      android: null,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_BACKLIGHT_TOGGLE", "C_BKLT_TOG"],
    description: "Backlight Toggle",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x72),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_BRIGHTNESS_MINIMUM", "C_BRI_MIN"],
    description: "Minimum Brightness",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x73),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_BRIGHTNESS_MAXIMUM", "C_BRI_MAX"],
    description: "Maximum Brightness",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x74),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_BRIGHTNESS_AUTO", "C_BRI_AUTO"],
    description: "Auto Brightness",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x75),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=134",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_STEP", "C_MODE_STEP"],
    description: "Mode Step",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x82),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_RECALL_LAST", "C_CHAN_LAST"],
    description: "Recall Last",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x83),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_COMPUTER"],
    description: "Computer",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x88),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_TV"],
    description: "TV",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x89),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_WWW"],
    description: "WWW",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x8a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_DVD"],
    description: "DVD",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x8b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_PHONE"],
    description: "Telephone",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x8c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_GUIDE"],
    description: "Program Guide",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x8d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_VIDEOPHONE"],
    description: "Video Phone",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x8e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_GAMES"],
    description: "Games",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x8f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_MESSAGES"],
    description: "Messages",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x90),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_CD"],
    description: "CD",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x91),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_VCR"],
    description: "VCR",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x92),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_TUNER"],
    description: "Tuner",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x93),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_QUIT"],
    description: "Quit",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x94),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_HELP"],
    description: "Help",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x95),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_TAPE"],
    description: "Tape",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x96),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_CABLE"],
    description: "Cable",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x97),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_SATELLITE"],
    description: "Satellite",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x98),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_HOME"],
    description: "Home",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x9a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=136",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_CHANNEL_INC", "C_CHAN_INC"],
    description: "Channel Increment",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x9c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=136",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_CHANNEL_DEC", "C_CHAN_DEC"],
    description: "Channel Decrement",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x9d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=136",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MEDIA_VCR_PLUS"],
    description: "VCR Plus",
    context: "Consumer Media",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xa0),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=135",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_PLAY"],
    description: "Play",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb0),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_PAUSE"],
    description: "Pause",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_RECORD", "C_REC"],
    description: "Record",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb2),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_FAST_FORWARD", "C_FF"],
    description: "Fast Forward",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb3),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_REWIND", "C_RW"],
    description: "Rewind",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb4),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_NEXT"],
    description: "Next",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb5),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_PREVIOUS", "C_PREV"],
    description: "Previous",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb6),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_STOP"],
    description: "Stop",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb7),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: false,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_EJECT"],
    description: "Eject",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb8),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_RANDOM_PLAY", "C_SHUFFLE"],
    description: "Random Play",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xb9),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_REPEAT"],
    description: "Repeat",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xbc),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_SLOW_TRACKING", "C_SLOW2"],
    description: "Slow Tracking",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xbf),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_STOP_EJECT"],
    description: "Stop / Eject",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xcc),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: null,
      linux: false,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_PLAY_PAUSE", "C_PP"],
    description: "Play / Pause",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xcd),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=137",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_VOICE_COMMAND"],
    description: "Voice Command",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xcf),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=132",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_MUTE"],
    description: "Mute",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xe2),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=139",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_BASS_BOOST"],
    description: "Bass Boost",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xe5),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=139",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_VOLUME_UP", "C_VOL_UP"],
    description: "Volume Up",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xe9),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=139",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_VOLUME_DOWN", "C_VOL_DN"],
    description: "Volume Down",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xea),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=139",
    os: {
      windows: true,
      linux: true,
      android: true,
      macos: true,
      ios: true,
    },
    footnotes: {},
  },
  {
    names: ["C_SLOW"],
    description: "Slow",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0xf5),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=141",
    os: {
      windows: false,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_ALTERNATE_AUDIO_INCREMENT", "C_ALT_AUDIO_INC"],
    description: "Alternate Audio Increment",
    context: "Consumer",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x173),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf",
    os: {
      windows: null,
      linux: false,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_CCC"],
    description: "Consumer Control Configuration",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x183),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_WORD"],
    description: "Word Processor",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x184),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_TEXT_EDITOR"],
    description: "Text Editor",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x185),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_SPREADSHEET", "C_AL_SHEET"],
    description: "Spreadsheet",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x186),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_GRAPHICS_EDITOR"],
    description: "Graphics Editor",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x187),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_PRESENTATION"],
    description: "Presentation",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x188),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_DATABASE", "C_AL_DB"],
    description: "Database App",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x189),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_EMAIL", "C_AL_MAIL"],
    description: "Email Reader",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x18a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_NEWS"],
    description: "Newsreader",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x18b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_VOICEMAIL"],
    description: "Voicemail",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x18c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_CONTACTS", "C_AL_ADDRESS_BOOK"],
    description: "Contacts / Address Book",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x18d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_CALENDAR", "C_AL_CAL"],
    description: "Calendar / Schedule",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x18e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_TASK_MANAGER"],
    description: "Task / Project Manager",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x18f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_JOURNAL"],
    description: "Log / Journal / Timecard",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x190),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_FINANCE"],
    description: "Checkbook / Finance",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x191),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_CALCULATOR", "C_AL_CALC"],
    description: "Calculator",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x192),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_AV_CAPTURE_PLAYBACK"],
    description: "A/V Capture / Playback",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x193),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_MY_COMPUTER"],
    description: "Local Machine Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x194),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_WWW"],
    description: "Internet Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x196),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=147",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_NETWORK_CHAT", "C_AL_CHAT"],
    description: "Network Chat",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x199),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_LOGOFF"],
    description: "Logoff",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x19c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_LOCK", "C_AL_SCREENSAVER", "C_AL_COFFEE"],
    description: "Terminal Lock / Screensaver",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x19e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_CONTROL_PANEL"],
    description: "Control Panel",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x19f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_SELECT_TASK"],
    description: "Select Task / Application",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1a2),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_NEXT_TASK"],
    description: "Next Task / Application",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1a3),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_PREVIOUS_TASK", "C_AL_PREV_TASK"],
    description: "Previous Task / Application",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1a4),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_HELP"],
    description: "Integrated Help Center",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1a6),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_DOCUMENTS", "C_AL_DOCS"],
    description: "Documents",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1a7),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_SPELLCHECK", "C_AL_SPELL"],
    description: "Spell Check",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1ab),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_KEYBOARD_LAYOUT"],
    description: "Keyboard Layout",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1ae),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_SCREEN_SAVER"],
    description: "Screen Saver",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1b1),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_FILE_BROWSER", "C_AL_FILES"],
    description: "File Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1b4),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_IMAGE_BROWSER", "C_AL_IMAGES"],
    description: "Image Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1b6),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_AUDIO_BROWSER", "C_AL_AUDIO", "C_AL_MUSIC"],
    description: "Audio Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1b7),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_MOVIE_BROWSER", "C_AL_MOVIES"],
    description: "Movie Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1b8),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=148",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_INSTANT_MESSAGING", "C_AL_IM"],
    description: "Instant Messaging",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1bc),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=149",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AL_OEM_FEATURES", "C_AL_TIPS", "C_AL_TUTORIAL"],
    description: "OEM Features / Tips / Tutorial Browser",
    context: "Consumer AL",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x1bd),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=149",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_NEW"],
    description: "New",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x201),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_OPEN"],
    description: "Open",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x202),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_CLOSE"],
    description: "Close",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x203),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_EXIT"],
    description: "Exit",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x204),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_SAVE"],
    description: "Save",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x207),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_PRINT"],
    description: "Print",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x208),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_PROPERTIES", "C_AC_PROPS"],
    description: "Properties",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x209),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_UNDO"],
    description: "Undo",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x21a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_COPY"],
    description: "Copy",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x21b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_CUT"],
    description: "Cut",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x21c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_PASTE"],
    description: "Paste",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x21d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_FIND"],
    description: "Find",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x21f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_SEARCH"],
    description: "Search",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x221),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: true,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_GOTO"],
    description: "Go To",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x222),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_HOME"],
    description: "Home",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x223),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_BACK"],
    description: "Back",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x224),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_FORWARD"],
    description: "Forward",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x225),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_STOP"],
    description: "Stop",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x226),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_REFRESH"],
    description: "Refresh",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x227),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_BOOKMARKS", "C_AC_FAVORITES", "C_AC_FAVOURITES"],
    description: "Bookmarks",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x22a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_ZOOM_IN"],
    description: "Zoom In",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x22d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_ZOOM_OUT"],
    description: "Zoom Out",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x22e),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_ZOOM"],
    description: "Zoom",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x22f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=150",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_VIEW_TOGGLE"],
    description: "View Toggle",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x232),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=151",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_SCROLL_UP"],
    description: "Scroll Up",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x233),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=151",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_SCROLL_DOWN"],
    description: "Scroll Down",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x234),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=151",
    os: {
      windows: null,
      linux: true,
      android: true,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_EDIT"],
    description: "Edit",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x23d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=151",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_CANCEL"],
    description: "Cancel",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x25f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=152",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_INSERT", "C_AC_INS"],
    description: "Insert Mode",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x269),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=152",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_DEL"],
    description: "Delete",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x26a),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=152",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_REDO"],
    description: "Redo / Repeat",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x279),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=152",
    os: {
      windows: false,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_REPLY"],
    description: "Reply",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x289),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=153",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_FORWARD_MAIL"],
    description: "Forward",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x28b),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=153",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_SEND"],
    description: "Send",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x28c),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=153",
    os: {
      windows: null,
      linux: true,
      android: false,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_DESKTOP_SHOW_ALL_WINDOWS"],
    description: "Desktop Show All Windows",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x29f),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=153",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: true,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_DESKTOP_SHOW_ALL_APPLICATIONS"],
    description: "Desktop Show All Applications",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2a2),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=153",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: true,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_KEYBOARD_INPUT_ASSIST_PREVIOUS", "C_KBIA_PREV"],
    description: "Previous",
    context: "Consumer KBIA",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2c7),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=157",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_KEYBOARD_INPUT_ASSIST_NEXT", "C_KBIA_NEXT"],
    description: "Next",
    context: "Consumer KBIA",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2c8),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=157",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_KEYBOARD_INPUT_ASSIST_PREVIOUS_GROUP", "C_KBIA_PREV_GRP"],
    description: "Previous Group",
    context: "Consumer KBIA",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2c9),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=157",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_KEYBOARD_INPUT_ASSIST_NEXT_GROUP", "C_KBIA_NEXT_GRP"],
    description: "Next Group",
    context: "Consumer KBIA",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2ca),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=157",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_KEYBOARD_INPUT_ASSIST_ACCEPT", "C_KBIA_ACCEPT"],
    description: "Accept",
    context: "Consumer KBIA",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2cb),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=157",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_KEYBOARD_INPUT_ASSIST_CANCEL", "C_KBIA_CANCEL"],
    description: "Cancel",
    context: "Consumer KBIA",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x2cc),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=157",
    os: {
      windows: null,
      linux: true,
      android: null,
      macos: null,
      ios: null,
    },
    footnotes: {},
  },
  {
    names: ["C_AC_NEXT_KEYBOARD_LAYOUT_SELECT", "GLOBE"],
    description: "AC Next Keyboard Layout Select (Apple Globe)",
    context: "Consumer AC",
    clarify: true,
    usages: [
      {
        application: _hid_applications__WEBPACK_IMPORTED_MODULE_0__.consumer,
        item: (0,_hid_usage__WEBPACK_IMPORTED_MODULE_2__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x29d),
      },
    ],
    documentation: "https://usb.org/sites/default/files/hut1_2.pdf#page=153",
    os: {
      windows: null,
      linux: null,
      android: null,
      macos: true,
      ios: true,
    },
    footnotes: {
      macos: ["globe"],
    },
  },
]);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   consumer: () => (/* binding */ consumer),
/* harmony export */   keyboard: () => (/* binding */ keyboard)
/* harmony export */ });
/* harmony import */ var _hid_usage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(17);
/* harmony import */ var _hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18);
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: CC-BY-NC-SA-4.0
 */




const keyboard = (0,_hid_usage__WEBPACK_IMPORTED_MODULE_0__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.genericDesktop, 0x06);
const consumer = (0,_hid_usage__WEBPACK_IMPORTED_MODULE_0__["default"])(_hid_usage_pages__WEBPACK_IMPORTED_MODULE_1__.consumer, 0x01);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ usage)
/* harmony export */ });
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: CC-BY-NC-SA-4.0
 */

function usage(page, id) {
  return (page << 16) | id;
}


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   consumer: () => (/* binding */ consumer),
/* harmony export */   genericDesktop: () => (/* binding */ genericDesktop),
/* harmony export */   key: () => (/* binding */ key)
/* harmony export */ });
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: CC-BY-NC-SA-4.0
 */

const genericDesktop = 0x01;
const key = 0x07;
const consumer = 0x0c;


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: CC-BY-NC-SA-4.0
 */

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([
  {
    key: "windows",
    className: "windows",
    heading: "W",
    title: "Windows",
  },
  {
    key: "linux",
    className: "linux",
    heading: "L",
    title: "Linux",
  },
  {
    key: "android",
    className: "android",
    heading: "A",
    title: "Android",
  },
  {
    key: "macos",
    className: "macos",
    heading: "m",
    title: "macOS",
  },
  {
    key: "ios",
    className: "ios",
    heading: "i",
    title: "iOS",
  },
]);


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMouseButtonCompletions = getMouseButtonCompletions;
const vscode = __importStar(__webpack_require__(2));
const keymap_1 = __webpack_require__(14);
const MOUSE_INCLUDE = 'dt-bindings/zmk/mouse.h';
// TODO: parse this from dt-bindings/zmk/mouse.h?
const mouseButtonCompletions = [
    {
        label: 'LCLK',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Left click',
    },
    {
        label: 'RCLK',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Right click',
    },
    {
        label: 'MCLK',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Middle click',
    },
    {
        label: 'MB1',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Mouse button 1 (left click)',
    },
    {
        label: 'MB2',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Mouse button 2 (right click)',
    },
    {
        label: 'MB3',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Mouse button 3 (middle click)',
    },
    {
        label: 'MB4',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Mouse button 4',
    },
    {
        label: 'MB5',
        kind: vscode.CompletionItemKind.EnumMember,
        documentation: 'Mouse button 5',
    },
];
function getMouseButtonCompletions(includeInfo) {
    const additionalTextEdits = (0, keymap_1.addMissingSystemInclude)(includeInfo, MOUSE_INCLUDE);
    if (additionalTextEdits.length > 0) {
        return mouseButtonCompletions.map((item) => {
            return { ...item, additionalTextEdits };
        });
    }
    return mouseButtonCompletions;
}


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SetupWizard = void 0;
const vscode = __importStar(__webpack_require__(2));
const build_1 = __webpack_require__(22);
const config_1 = __webpack_require__(96);
const hardware_1 = __webpack_require__(97);
const OPEN_REPO_ACTION = 'Open ZMK config template';
const TEMPLATE_URL = 'https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Fzmkfirmware%2Funified-zmk-config-template';
class SetupWizard {
    context;
    disposable;
    constructor(context) {
        this.context = context;
        this.disposable = vscode.commands.registerCommand('zmk.addKeyboard', this.runWizard, this);
    }
    dispose() {
        this.disposable.dispose();
    }
    async runWizard() {
        // TODO: make a custom quick pick which allows going back a step.
        const config = await getConfig();
        if (!config) {
            return;
        }
        const parts = await this.pickKeyboardParts(config);
        if (!parts) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Fetching keyboard files',
        }, async () => {
            await copyConfigFiles(config, parts.keyboard);
        });
        try {
            const builds = getBuildItems(parts);
            await (0, build_1.addToBuildMatrix)(this.context, config, builds);
        }
        catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`Failed to update build matrix: ${e}`);
        }
    }
    async pickKeyboardParts(config) {
        const hardware = (0, hardware_1.getHardware)(this.context, config);
        const keyboard = await this.pickKeyboard(hardware);
        if (!keyboard) {
            return undefined;
        }
        switch (keyboard.type) {
            case 'board':
                return { keyboard, board: keyboard };
            case 'shield': {
                const board = await this.pickController(hardware, keyboard);
                if (!board) {
                    return undefined;
                }
                return {
                    keyboard,
                    board,
                    shield: keyboard,
                };
            }
        }
    }
    async pickKeyboard(hardware) {
        const getItems = async () => {
            return getHardwarePickItems((await hardware).keyboards);
        };
        const result = await vscode.window.showQuickPick(getItems(), {
            title: 'Pick a keyboard',
            placeHolder: 'Keyboard',
            ignoreFocusOut: true,
            matchOnDescription: true,
        });
        return result?.item;
    }
    async pickController(hardware, shield) {
        const getItems = async () => {
            const compatible = (0, hardware_1.filterToShield)((await hardware).controllers, shield);
            return getHardwarePickItems(compatible);
        };
        const result = await vscode.window.showQuickPick(getItems(), {
            title: 'Pick an MCU board',
            placeHolder: 'Controller',
            ignoreFocusOut: true,
            matchOnDescription: true,
        });
        return result?.item;
    }
}
exports.SetupWizard = SetupWizard;
async function getConfig() {
    try {
        return await (0, config_1.getConfigLocation)();
    }
    catch (e) {
        if (e instanceof config_1.ConfigMissingError) {
            showConfigMissingError();
        }
        console.error(e);
    }
    return undefined;
}
async function showConfigMissingError() {
    const response = await vscode.window.showErrorMessage('Could not find a ZMK config repo in the workspace. Go to the template repo and click "Use this template" to create a new repo.', OPEN_REPO_ACTION);
    if (response === OPEN_REPO_ACTION) {
        vscode.env.openExternal(vscode.Uri.parse(TEMPLATE_URL));
    }
}
function getBuildItems(parts) {
    if (parts.shield) {
        return getShieldBuildItems(parts.board, parts.shield);
    }
    return getBoardBuildItems(parts.board);
}
function getBoardBuildItems(board) {
    const ids = board.siblings ?? [board.id];
    return ids.map((id) => {
        return { board: id };
    });
}
function getShieldBuildItems(board, shield) {
    const ids = shield.siblings ?? [shield.id];
    return ids.map((id) => {
        return { shield: id, board: board.id };
    });
}
function getHardwarePickItems(hardware) {
    return hardware.map((item) => {
        return {
            label: item.name,
            description: item.id,
            item,
        };
    });
}
async function copyConfigFiles(config, keyboard) {
    const files = (0, hardware_1.getKeyboardFiles)(keyboard);
    const configUri = vscode.Uri.joinPath(config.config, `${keyboard.id}.conf`);
    const keymapUri = vscode.Uri.joinPath(config.config, `${keyboard.id}.keymap`);
    await Promise.all([copyFile(config, configUri, files.configUrl), copyFile(config, keymapUri, files.keymapUrl)]);
    const keymap = await vscode.workspace.openTextDocument(keymapUri);
    vscode.window.showTextDocument(keymap);
}
async function exists(uri) {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    }
    catch (e) {
        if (e instanceof vscode.FileSystemError) {
            return false;
        }
        throw e;
    }
}
async function copyFile(config, dest, source) {
    // Don't overwrite existing files.
    if (await exists(dest)) {
        return;
    }
    try {
        const buffer = await fetchFile(config, source);
        await vscode.workspace.fs.writeFile(dest, buffer);
    }
    catch (e) {
        vscode.window.showWarningMessage(`Failed to copy [${source}](${source}): ${e}`);
        return;
    }
}
async function fetchFile(config, uri) {
    if (uri.toString().startsWith(config.workspace.uri.toString())) {
        return await vscode.workspace.fs.readFile(uri);
    }
    const response = await fetch(uri.toString());
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return new Uint8Array(await response.arrayBuffer());
}


/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildItemEquals = buildItemEquals;
exports.addToBuildMatrix = addToBuildMatrix;
const vscode = __importStar(__webpack_require__(2));
const yaml = __importStar(__webpack_require__(23));
const yaml_1 = __webpack_require__(23);
const file_1 = __webpack_require__(8);
const util_1 = __webpack_require__(9);
function buildItemEquals(a, b) {
    return a.board === b.board && a.shield === b.shield;
}
/**
 * Appends the given builds to a config repo's build.yaml file.
 */
async function addToBuildMatrix(context, config, builds) {
    const matrix = await readMatrix(context, config);
    const currentItems = parseInclude(matrix);
    if (!matrix.contents) {
        matrix.contents = new yaml_1.YAMLMap();
    }
    if (!matrix.has('include') || !matrix.get('include')) {
        matrix.set('include', new yaml_1.YAMLSeq());
    }
    const include = matrix.get('include');
    for (const build of builds) {
        if (!currentItems.some((x) => buildItemEquals(x, build))) {
            include.add(build);
        }
    }
    await writeMatrix(config, matrix);
}
function getMatrixUri(config) {
    const settings = vscode.workspace.getConfiguration('zmk', config.workspace);
    const path = settings.get('buildMatrixPath') || 'build.yaml';
    return vscode.Uri.joinPath(config.workspace.uri, path);
}
async function readMatrix(context, config) {
    try {
        const uri = getMatrixUri(config);
        const file = (0, util_1.decode)(await vscode.workspace.fs.readFile(uri));
        return parseDocument(file);
    }
    catch (e) {
        if (e instanceof vscode.FileSystemError) {
            return await getEmptyMatrix(context);
        }
        throw e;
    }
}
/**
 * Parses the build matrix's "include" field as a list of build items.
 */
function parseInclude(matrix) {
    const include = matrix.get('include');
    if (!(include instanceof yaml_1.YAMLSeq)) {
        return [];
    }
    const items = [];
    for (const map of include.items) {
        if (!(map instanceof yaml_1.YAMLMap)) {
            continue;
        }
        const board = map.get('board');
        if (typeof board !== 'string') {
            continue;
        }
        const item = {
            board,
        };
        const shield = map.get('shield');
        if (typeof shield === 'string') {
            item.shield = shield;
        }
        items.push(item);
    }
    return items;
}
async function writeMatrix(config, matrix) {
    const text = stringify(matrix);
    const file = new TextEncoder().encode(text);
    const uri = getMatrixUri(config);
    await vscode.workspace.fs.writeFile(uri, file);
}
/**
 * Calls yaml.stringify() but preserves comments before the document.
 */
function stringify(matrix) {
    let text = yaml.stringify(matrix);
    if (matrix.commentBefore) {
        const comment = matrix.commentBefore
            .split('\n')
            .map((line) => '#' + line)
            .join('\n');
        text = comment + '\n---\n' + text;
    }
    return text;
}
async function getEmptyMatrix(context) {
    const file = (0, util_1.decode)(await (0, file_1.fetchResource)(context, 'templates/build.yaml'));
    return parseDocument(file);
}
function parseDocument(source) {
    if (isEmptyDocument(source)) {
        // YAML parser will fail to parse an empty document. An easy fix is to
        // add the "include" key that we're going to add later anyways.
        source += '\ninclude:';
    }
    return yaml.parseDocument(source, { strict: false });
}
const HEADER_RE = /((?:^\s*(#.*)?$[\r\n]+)+)^---$/m;
function isEmptyDocument(source) {
    return source.replace(HEADER_RE, '').trim().length === 0;
}


/***/ }),
/* 23 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alias: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Alias),
/* harmony export */   CST: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.CST),
/* harmony export */   Composer: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Composer),
/* harmony export */   Document: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Document),
/* harmony export */   Lexer: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Lexer),
/* harmony export */   LineCounter: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.LineCounter),
/* harmony export */   Pair: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Pair),
/* harmony export */   Parser: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Parser),
/* harmony export */   Scalar: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Scalar),
/* harmony export */   Schema: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Schema),
/* harmony export */   YAMLError: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLError),
/* harmony export */   YAMLMap: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLMap),
/* harmony export */   YAMLParseError: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLParseError),
/* harmony export */   YAMLSeq: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLSeq),
/* harmony export */   YAMLWarning: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLWarning),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   isAlias: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isAlias),
/* harmony export */   isCollection: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isCollection),
/* harmony export */   isDocument: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isDocument),
/* harmony export */   isMap: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isMap),
/* harmony export */   isNode: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isNode),
/* harmony export */   isPair: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isPair),
/* harmony export */   isScalar: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isScalar),
/* harmony export */   isSeq: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isSeq),
/* harmony export */   parse: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.parse),
/* harmony export */   parseAllDocuments: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.parseAllDocuments),
/* harmony export */   parseDocument: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.parseDocument),
/* harmony export */   stringify: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.stringify),
/* harmony export */   visit: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.visit),
/* harmony export */   visitAsync: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.visitAsync)
/* harmony export */ });
/* harmony import */ var _dist_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24);
// `export * as default from ...` fails on Webpack v4
// https://github.com/eemeli/yaml/issues/228

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_dist_index_js__WEBPACK_IMPORTED_MODULE_0__);



/***/ }),
/* 24 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alias: () => (/* reexport safe */ _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_4__.Alias),
/* harmony export */   CST: () => (/* reexport module object */ _parse_cst_js__WEBPACK_IMPORTED_MODULE_10__),
/* harmony export */   Composer: () => (/* reexport safe */ _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__.Composer),
/* harmony export */   Document: () => (/* reexport safe */ _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__.Document),
/* harmony export */   Lexer: () => (/* reexport safe */ _parse_lexer_js__WEBPACK_IMPORTED_MODULE_11__.Lexer),
/* harmony export */   LineCounter: () => (/* reexport safe */ _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_12__.LineCounter),
/* harmony export */   Pair: () => (/* reexport safe */ _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_6__.Pair),
/* harmony export */   Parser: () => (/* reexport safe */ _parse_parser_js__WEBPACK_IMPORTED_MODULE_13__.Parser),
/* harmony export */   Scalar: () => (/* reexport safe */ _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_7__.Scalar),
/* harmony export */   Schema: () => (/* reexport safe */ _schema_Schema_js__WEBPACK_IMPORTED_MODULE_2__.Schema),
/* harmony export */   YAMLError: () => (/* reexport safe */ _errors_js__WEBPACK_IMPORTED_MODULE_3__.YAMLError),
/* harmony export */   YAMLMap: () => (/* reexport safe */ _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_8__.YAMLMap),
/* harmony export */   YAMLParseError: () => (/* reexport safe */ _errors_js__WEBPACK_IMPORTED_MODULE_3__.YAMLParseError),
/* harmony export */   YAMLSeq: () => (/* reexport safe */ _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_9__.YAMLSeq),
/* harmony export */   YAMLWarning: () => (/* reexport safe */ _errors_js__WEBPACK_IMPORTED_MODULE_3__.YAMLWarning),
/* harmony export */   isAlias: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isAlias),
/* harmony export */   isCollection: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isCollection),
/* harmony export */   isDocument: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isDocument),
/* harmony export */   isMap: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isMap),
/* harmony export */   isNode: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isNode),
/* harmony export */   isPair: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isPair),
/* harmony export */   isScalar: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isScalar),
/* harmony export */   isSeq: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isSeq),
/* harmony export */   parse: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.parse),
/* harmony export */   parseAllDocuments: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.parseAllDocuments),
/* harmony export */   parseDocument: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.parseDocument),
/* harmony export */   stringify: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.stringify),
/* harmony export */   visit: () => (/* reexport safe */ _visit_js__WEBPACK_IMPORTED_MODULE_15__.visit),
/* harmony export */   visitAsync: () => (/* reexport safe */ _visit_js__WEBPACK_IMPORTED_MODULE_15__.visitAsync)
/* harmony export */ });
/* harmony import */ var _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29);
/* harmony import */ var _schema_Schema_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(47);
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72);
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(30);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(27);
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(38);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(37);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(49);
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(52);
/* harmony import */ var _parse_cst_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(88);
/* harmony import */ var _parse_lexer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(92);
/* harmony import */ var _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(93);
/* harmony import */ var _parse_parser_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(94);
/* harmony import */ var _public_api_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(95);
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(28);



















/***/ }),
/* 25 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Composer: () => (/* binding */ Composer)
/* harmony export */ });
/* harmony import */ var _doc_directives_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(26);
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29);
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(27);
/* harmony import */ var _compose_doc_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(73);
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(83);







function getErrorPos(src) {
    if (typeof src === 'number')
        return [src, src + 1];
    if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === 'string' ? source.length : 1)];
}
function parsePrelude(prelude) {
    let comment = '';
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
            case '#':
                comment +=
                    (comment === '' ? '' : afterEmptyLine ? '\n\n' : '\n') +
                        (source.substring(1) || ' ');
                atComment = true;
                afterEmptyLine = false;
                break;
            case '%':
                if (prelude[i + 1]?.[0] !== '#')
                    i += 1;
                atComment = false;
                break;
            default:
                // This may be wrong after doc-end, but in that case it doesn't matter
                if (!atComment)
                    afterEmptyLine = true;
                atComment = false;
        }
    }
    return { comment, afterEmptyLine };
}
/**
 * Compose a stream of CST nodes into a stream of YAML Documents.
 *
 * ```ts
 * import { Composer, Parser } from 'yaml'
 *
 * const src: string = ...
 * const tokens = new Parser().parse(src)
 * const docs = new Composer().compose(tokens)
 * ```
 */
class Composer {
    constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
            const pos = getErrorPos(source);
            if (warning)
                this.warnings.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLWarning(pos, code, message));
            else
                this.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(pos, code, message));
        };
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        this.directives = new _doc_directives_js__WEBPACK_IMPORTED_MODULE_0__.Directives({ version: options.version || '1.2' });
        this.options = options;
    }
    decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        //console.log({ dc: doc.comment, prelude, comment })
        if (comment) {
            const dc = doc.contents;
            if (afterDoc) {
                doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
            }
            else if (afterEmptyLine || doc.directives.docStart || !dc) {
                doc.commentBefore = comment;
            }
            else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_3__.isCollection)(dc) && !dc.flow && dc.items.length > 0) {
                let it = dc.items[0];
                if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(it))
                    it = it.key;
                const cb = it.commentBefore;
                it.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
            else {
                const cb = dc.commentBefore;
                dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
        }
        if (afterDoc) {
            Array.prototype.push.apply(doc.errors, this.errors);
            Array.prototype.push.apply(doc.warnings, this.warnings);
        }
        else {
            doc.errors = this.errors;
            doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
        return {
            comment: parsePrelude(this.prelude).comment,
            directives: this.directives,
            errors: this.errors,
            warnings: this.warnings
        };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
            yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
    }
    /** Advance the composer by one CST token. */
    *next(token) {
        switch (token.type) {
            case 'directive':
                this.directives.add(token.source, (offset, message, warning) => {
                    const pos = getErrorPos(token);
                    pos[0] += offset;
                    this.onError(pos, 'BAD_DIRECTIVE', message, warning);
                });
                this.prelude.push(token.source);
                this.atDirectives = true;
                break;
            case 'document': {
                const doc = (0,_compose_doc_js__WEBPACK_IMPORTED_MODULE_4__.composeDoc)(this.options, this.directives, token, this.onError);
                if (this.atDirectives && !doc.directives.docStart)
                    this.onError(token, 'MISSING_CHAR', 'Missing directives-end/doc-start indicator line');
                this.decorate(doc, false);
                if (this.doc)
                    yield this.doc;
                this.doc = doc;
                this.atDirectives = false;
                break;
            }
            case 'byte-order-mark':
            case 'space':
                break;
            case 'comment':
            case 'newline':
                this.prelude.push(token.source);
                break;
            case 'error': {
                const msg = token.source
                    ? `${token.message}: ${JSON.stringify(token.source)}`
                    : token.message;
                const error = new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg);
                if (this.atDirectives || !this.doc)
                    this.errors.push(error);
                else
                    this.doc.errors.push(error);
                break;
            }
            case 'doc-end': {
                if (!this.doc) {
                    const msg = 'Unexpected doc-end without preceding document';
                    this.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg));
                    break;
                }
                this.doc.directives.docEnd = true;
                const end = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_5__.resolveEnd)(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
                this.decorate(this.doc, true);
                if (end.comment) {
                    const dc = this.doc.comment;
                    this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
                }
                this.doc.range[2] = end.offset;
                break;
            }
            default:
                this.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', `Unsupported token ${token.type}`));
        }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
            this.decorate(this.doc, true);
            yield this.doc;
            this.doc = null;
        }
        else if (forceDoc) {
            const opts = Object.assign({ _directives: this.directives }, this.options);
            const doc = new _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__.Document(undefined, opts);
            if (this.atDirectives)
                this.onError(endOffset, 'MISSING_CHAR', 'Missing directives-end indicator line');
            doc.range = [0, endOffset, endOffset];
            this.decorate(doc, false);
            yield doc;
        }
    }
}




/***/ }),
/* 26 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Directives: () => (/* binding */ Directives)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(28);



const escapeChars = {
    '!': '%21',
    ',': '%2C',
    '[': '%5B',
    ']': '%5D',
    '{': '%7B',
    '}': '%7D'
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, ch => escapeChars[ch]);
class Directives {
    constructor(yaml, tags) {
        /**
         * The directives-end/doc-start marker `---`. If `null`, a marker may still be
         * included in the document's stringified representation.
         */
        this.docStart = null;
        /** The doc-end marker `...`.  */
        this.docEnd = false;
        this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
        const copy = new Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
        const res = new Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
            case '1.1':
                this.atNextDocument = true;
                break;
            case '1.2':
                this.atNextDocument = false;
                this.yaml = {
                    explicit: Directives.defaultYaml.explicit,
                    version: '1.2'
                };
                this.tags = Object.assign({}, Directives.defaultTags);
                break;
        }
        return res;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(line, onError) {
        if (this.atNextDocument) {
            this.yaml = { explicit: Directives.defaultYaml.explicit, version: '1.1' };
            this.tags = Object.assign({}, Directives.defaultTags);
            this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
            case '%TAG': {
                if (parts.length !== 2) {
                    onError(0, '%TAG directive should contain exactly two parts');
                    if (parts.length < 2)
                        return false;
                }
                const [handle, prefix] = parts;
                this.tags[handle] = prefix;
                return true;
            }
            case '%YAML': {
                this.yaml.explicit = true;
                if (parts.length !== 1) {
                    onError(0, '%YAML directive should contain exactly one part');
                    return false;
                }
                const [version] = parts;
                if (version === '1.1' || version === '1.2') {
                    this.yaml.version = version;
                    return true;
                }
                else {
                    const isValid = /^\d+\.\d+$/.test(version);
                    onError(6, `Unsupported YAML version ${version}`, isValid);
                    return false;
                }
            }
            default:
                onError(0, `Unknown directive ${name}`, true);
                return false;
        }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(source, onError) {
        if (source === '!')
            return '!'; // non-specific tag
        if (source[0] !== '!') {
            onError(`Not a valid tag: ${source}`);
            return null;
        }
        if (source[1] === '<') {
            const verbatim = source.slice(2, -1);
            if (verbatim === '!' || verbatim === '!!') {
                onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
                return null;
            }
            if (source[source.length - 1] !== '>')
                onError('Verbatim tags must end with a >');
            return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
            onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
            try {
                return prefix + decodeURIComponent(suffix);
            }
            catch (error) {
                onError(String(error));
                return null;
            }
        }
        if (handle === '!')
            return source; // local tag
        onError(`Could not resolve tag: ${source}`);
        return null;
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
            if (tag.startsWith(prefix))
                return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === '!' ? tag : `!<${tag}>`;
    }
    toString(doc) {
        const lines = this.yaml.explicit
            ? [`%YAML ${this.yaml.version || '1.2'}`]
            : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(doc.contents)) {
            const tags = {};
            (0,_visit_js__WEBPACK_IMPORTED_MODULE_1__.visit)(doc.contents, (_key, node) => {
                if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(node) && node.tag)
                    tags[node.tag] = true;
            });
            tagNames = Object.keys(tags);
        }
        else
            tagNames = [];
        for (const [handle, prefix] of tagEntries) {
            if (handle === '!!' && prefix === 'tag:yaml.org,2002:')
                continue;
            if (!doc || tagNames.some(tn => tn.startsWith(prefix)))
                lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join('\n');
    }
}
Directives.defaultYaml = { explicit: false, version: '1.2' };
Directives.defaultTags = { '!!': 'tag:yaml.org,2002:' };




/***/ }),
/* 27 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ALIAS: () => (/* binding */ ALIAS),
/* harmony export */   DOC: () => (/* binding */ DOC),
/* harmony export */   MAP: () => (/* binding */ MAP),
/* harmony export */   NODE_TYPE: () => (/* binding */ NODE_TYPE),
/* harmony export */   PAIR: () => (/* binding */ PAIR),
/* harmony export */   SCALAR: () => (/* binding */ SCALAR),
/* harmony export */   SEQ: () => (/* binding */ SEQ),
/* harmony export */   hasAnchor: () => (/* binding */ hasAnchor),
/* harmony export */   isAlias: () => (/* binding */ isAlias),
/* harmony export */   isCollection: () => (/* binding */ isCollection),
/* harmony export */   isDocument: () => (/* binding */ isDocument),
/* harmony export */   isMap: () => (/* binding */ isMap),
/* harmony export */   isNode: () => (/* binding */ isNode),
/* harmony export */   isPair: () => (/* binding */ isPair),
/* harmony export */   isScalar: () => (/* binding */ isScalar),
/* harmony export */   isSeq: () => (/* binding */ isSeq)
/* harmony export */ });
const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR;
const isSeq = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
function isCollection(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
function isNode(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case ALIAS:
            case MAP:
            case SCALAR:
            case SEQ:
                return true;
        }
    return false;
}
const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;




/***/ }),
/* 28 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   visit: () => (/* binding */ visit),
/* harmony export */   visitAsync: () => (/* binding */ visitAsync)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);


const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove node');
/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isDocument)(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        visit_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current node */
visit.SKIP = SKIP;
/** Remove the current node */
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(ctrl) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = visit_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(node)) {
            path = Object.freeze(path.concat(node));
            const ck = visit_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = visit_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
/**
 * Apply an async visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `Promise`: Must resolve to one of the following values
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isDocument)(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visitAsync.BREAK = BREAK;
/** Do not visit the children of the current node */
visitAsync.SKIP = SKIP;
/** Remove the current node */
visitAsync.REMOVE = REMOVE;
async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(ctrl) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = await visitAsync_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(node)) {
            path = Object.freeze(path.concat(node));
            const ck = await visitAsync_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = await visitAsync_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
function initVisitor(visitor) {
    if (typeof visitor === 'object' &&
        (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
            Alias: visitor.Node,
            Map: visitor.Node,
            Scalar: visitor.Node,
            Seq: visitor.Node
        }, visitor.Value && {
            Map: visitor.Value,
            Scalar: visitor.Value,
            Seq: visitor.Value
        }, visitor.Collection && {
            Map: visitor.Collection,
            Seq: visitor.Collection
        }, visitor);
    }
    return visitor;
}
function callVisitor(key, node, visitor, path) {
    if (typeof visitor === 'function')
        return visitor(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(node))
        return visitor.Map?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(node))
        return visitor.Seq?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(node))
        return visitor.Pair?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(node))
        return visitor.Scalar?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isAlias)(node))
        return visitor.Alias?.(key, node, path);
    return undefined;
}
function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(parent)) {
        parent.items[key] = node;
    }
    else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(parent)) {
        if (key === 'key')
            parent.key = node;
        else
            parent.value = node;
    }
    else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isDocument)(parent)) {
        parent.contents = node;
    }
    else {
        const pt = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isAlias)(parent) ? 'alias' : 'scalar';
        throw new Error(`Cannot replace node with ${pt} parent`);
    }
}




/***/ }),
/* 29 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Document: () => (/* binding */ Document)
/* harmony export */ });
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(30);
/* harmony import */ var _nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(35);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(27);
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(38);
/* harmony import */ var _nodes_toJS_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34);
/* harmony import */ var _schema_Schema_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(47);
/* harmony import */ var _stringify_stringifyDocument_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(71);
/* harmony import */ var _anchors_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(31);
/* harmony import */ var _applyReviver_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(33);
/* harmony import */ var _createNode_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(36);
/* harmony import */ var _directives_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(26);












class Document {
    constructor(value, replacer, options) {
        /** A comment before this Document */
        this.commentBefore = null;
        /** A comment immediately after this Document */
        this.comment = null;
        /** Errors encountered during parsing. */
        this.errors = [];
        /** Warnings encountered during parsing. */
        this.warnings = [];
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.NODE_TYPE, { value: _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.DOC });
        let _replacer = null;
        if (typeof replacer === 'function' || Array.isArray(replacer)) {
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const opt = Object.assign({
            intAsBigInt: false,
            keepSourceTokens: false,
            logLevel: 'warn',
            prettyErrors: true,
            strict: true,
            stringKeys: false,
            uniqueKeys: true,
            version: '1.2'
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
            this.directives = options._directives.atDocument();
            if (this.directives.yaml.explicit)
                version = this.directives.yaml.version;
        }
        else
            this.directives = new _directives_js__WEBPACK_IMPORTED_MODULE_10__.Directives({ version });
        this.setSchema(version, options);
        // @ts-expect-error We can't really know that this matches Contents.
        this.contents =
            value === undefined ? null : this.createNode(value, _replacer, options);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
        const copy = Object.create(Document.prototype, {
            [_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.NODE_TYPE]: { value: _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
            copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        // @ts-expect-error We can't really know that this matches Contents.
        copy.contents = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isNode)(this.contents)
            ? this.contents.clone(copy.schema)
            : this.contents;
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** Adds a value to the document. */
    add(value) {
        if (assertCollection(this.contents))
            this.contents.add(value);
    }
    /** Adds a value to the document. */
    addIn(path, value) {
        if (assertCollection(this.contents))
            this.contents.addIn(path, value);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(node, name) {
        if (!node.anchor) {
            const prev = (0,_anchors_js__WEBPACK_IMPORTED_MODULE_7__.anchorNames)(this);
            node.anchor =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                !name || prev.has(name) ? (0,_anchors_js__WEBPACK_IMPORTED_MODULE_7__.findNewAnchor)(name || 'a', prev) : name;
        }
        return new _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
        let _replacer = undefined;
        if (typeof replacer === 'function') {
            value = replacer.call({ '': value }, '', value);
            _replacer = replacer;
        }
        else if (Array.isArray(replacer)) {
            const keyToStr = (v) => typeof v === 'number' || v instanceof String || v instanceof Number;
            const asStr = replacer.filter(keyToStr).map(String);
            if (asStr.length > 0)
                replacer = replacer.concat(asStr);
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = (0,_anchors_js__WEBPACK_IMPORTED_MODULE_7__.createNodeAnchors)(this, 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        anchorPrefix || 'a');
        const ctx = {
            aliasDuplicateObjects: aliasDuplicateObjects ?? true,
            keepUndefined: keepUndefined ?? false,
            onAnchor,
            onTagObj,
            replacer: _replacer,
            schema: this.schema,
            sourceObjects
        };
        const node = (0,_createNode_js__WEBPACK_IMPORTED_MODULE_9__.createNode)(value, tag, ctx);
        if (flow && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(node))
            node.flow = true;
        setAnchors();
        return node;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_3__.Pair(k, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path)) {
            if (this.contents == null)
                return false;
            // @ts-expect-error Presumed impossible if Strict extends false
            this.contents = null;
            return true;
        }
        return assertCollection(this.contents)
            ? this.contents.deleteIn(path)
            : false;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(key, keepScalar) {
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents)
            ? this.contents.get(key, keepScalar)
            : undefined;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path))
            return !keepScalar && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isScalar)(this.contents)
                ? this.contents.value
                : this.contents;
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents)
            ? this.contents.getIn(path, keepScalar)
            : undefined;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(key) {
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents) ? this.contents.has(key) : false;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(path) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path))
            return this.contents !== undefined;
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents) ? this.contents.hasIn(path) : false;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(key, value) {
        if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = (0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.collectionFromPath)(this.schema, [key], value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.set(key, value);
        }
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path)) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = value;
        }
        else if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = (0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.collectionFromPath)(this.schema, Array.from(path), value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.setIn(path, value);
        }
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(version, options = {}) {
        if (typeof version === 'number')
            version = String(version);
        let opt;
        switch (version) {
            case '1.1':
                if (this.directives)
                    this.directives.yaml.version = '1.1';
                else
                    this.directives = new _directives_js__WEBPACK_IMPORTED_MODULE_10__.Directives({ version: '1.1' });
                opt = { resolveKnownTags: false, schema: 'yaml-1.1' };
                break;
            case '1.2':
            case 'next':
                if (this.directives)
                    this.directives.yaml.version = version;
                else
                    this.directives = new _directives_js__WEBPACK_IMPORTED_MODULE_10__.Directives({ version });
                opt = { resolveKnownTags: true, schema: 'core' };
                break;
            case null:
                if (this.directives)
                    delete this.directives;
                opt = null;
                break;
            default: {
                const sv = JSON.stringify(version);
                throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
            }
        }
        // Not using `instanceof Schema` to allow for duck typing
        if (options.schema instanceof Object)
            this.schema = options.schema;
        else if (opt)
            this.schema = new _schema_Schema_js__WEBPACK_IMPORTED_MODULE_5__.Schema(Object.assign(opt, options));
        else
            throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
            anchors: new Map(),
            doc: this,
            keep: !json,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(this.contents, jsonArg ?? '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? (0,_applyReviver_js__WEBPACK_IMPORTED_MODULE_8__.applyReviver)(reviver, { '': res }, '', res)
            : res;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    /** A YAML representation of the document. */
    toString(options = {}) {
        if (this.errors.length > 0)
            throw new Error('Document with errors cannot be stringified');
        if ('indent' in options &&
            (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
            const s = JSON.stringify(options.indent);
            throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return (0,_stringify_stringifyDocument_js__WEBPACK_IMPORTED_MODULE_6__.stringifyDocument)(this, options);
    }
}
function assertCollection(contents) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(contents))
        return true;
    throw new Error('Expected a YAML collection as document contents');
}




/***/ }),
/* 30 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alias: () => (/* binding */ Alias)
/* harmony export */ });
/* harmony import */ var _doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(28);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(27);
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(32);
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34);






class Alias extends _Node_js__WEBPACK_IMPORTED_MODULE_3__.NodeBase {
    constructor(source) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_2__.ALIAS);
        this.source = source;
        Object.defineProperty(this, 'tag', {
            set() {
                throw new Error('Alias nodes cannot have tags');
            }
        });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(doc) {
        let found = undefined;
        (0,_visit_js__WEBPACK_IMPORTED_MODULE_1__.visit)(doc, {
            Node: (_key, node) => {
                if (node === this)
                    return _visit_js__WEBPACK_IMPORTED_MODULE_1__.visit.BREAK;
                if (node.anchor === this.source)
                    found = node;
            }
        });
        return found;
    }
    toJSON(_arg, ctx) {
        if (!ctx)
            return { source: this.source };
        const { anchors, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc);
        if (!source) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new ReferenceError(msg);
        }
        let data = anchors.get(source);
        if (!data) {
            // Resolve anchors for Node.prototype.toJS()
            (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(source, null, ctx);
            data = anchors.get(source);
        }
        /* istanbul ignore if */
        if (!data || data.res === undefined) {
            const msg = 'This should not happen: Alias anchor was not resolved?';
            throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
                data.aliasCount = getAliasCount(doc, source, anchors);
            if (data.count * data.aliasCount > maxAliasCount) {
                const msg = 'Excessive alias count indicates a resource exhaustion attack';
                throw new ReferenceError(msg);
            }
        }
        return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
            (0,_doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__.anchorIsValid)(this.source);
            if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
                const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                throw new Error(msg);
            }
            if (ctx.implicitKey)
                return `${src} `;
        }
        return src;
    }
}
function getAliasCount(doc, node, anchors) {
    if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isAlias)(node)) {
        const source = node.resolve(doc);
        const anchor = anchors && source && anchors.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
    }
    else if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(node)) {
        let count = 0;
        for (const item of node.items) {
            const c = getAliasCount(doc, item, anchors);
            if (c > count)
                count = c;
        }
        return count;
    }
    else if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isPair)(node)) {
        const kc = getAliasCount(doc, node.key, anchors);
        const vc = getAliasCount(doc, node.value, anchors);
        return Math.max(kc, vc);
    }
    return 1;
}




/***/ }),
/* 31 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   anchorIsValid: () => (/* binding */ anchorIsValid),
/* harmony export */   anchorNames: () => (/* binding */ anchorNames),
/* harmony export */   createNodeAnchors: () => (/* binding */ createNodeAnchors),
/* harmony export */   findNewAnchor: () => (/* binding */ findNewAnchor)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(28);



/**
 * Verify that the input string is a valid anchor.
 *
 * Will throw on errors.
 */
function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
    }
    return true;
}
function anchorNames(root) {
    const anchors = new Set();
    (0,_visit_js__WEBPACK_IMPORTED_MODULE_1__.visit)(root, {
        Value(_key, node) {
            if (node.anchor)
                anchors.add(node.anchor);
        }
    });
    return anchors;
}
/** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
function findNewAnchor(prefix, exclude) {
    for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
            return name;
    }
}
function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map();
    let prevAnchors = null;
    return {
        onAnchor: (source) => {
            aliasObjects.push(source);
            if (!prevAnchors)
                prevAnchors = anchorNames(doc);
            const anchor = findNewAnchor(prefix, prevAnchors);
            prevAnchors.add(anchor);
            return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
            for (const source of aliasObjects) {
                const ref = sourceObjects.get(source);
                if (typeof ref === 'object' &&
                    ref.anchor &&
                    ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(ref.node) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(ref.node))) {
                    ref.node.anchor = ref.anchor;
                }
                else {
                    const error = new Error('Failed to resolve repeated object (this should not happen)');
                    error.source = source;
                    throw error;
                }
            }
        },
        sourceObjects
    };
}




/***/ }),
/* 32 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NodeBase: () => (/* binding */ NodeBase)
/* harmony export */ });
/* harmony import */ var _doc_applyReviver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(33);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34);




class NodeBase {
    constructor(type) {
        Object.defineProperty(this, _identity_js__WEBPACK_IMPORTED_MODULE_1__.NODE_TYPE, { value: type });
    }
    /** Create a copy of this node.  */
    clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** A plain JavaScript representation of this node. */
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isDocument)(doc))
            throw new TypeError('A document argument is required');
        const ctx = {
            anchors: new Map(),
            doc,
            keep: true,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = (0,_toJS_js__WEBPACK_IMPORTED_MODULE_2__.toJS)(this, '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? (0,_doc_applyReviver_js__WEBPACK_IMPORTED_MODULE_0__.applyReviver)(reviver, { '': res }, '', res)
            : res;
    }
}




/***/ }),
/* 33 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyReviver: () => (/* binding */ applyReviver)
/* harmony export */ });
/**
 * Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
 * in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
 * 2021 edition: https://tc39.es/ecma262/#sec-json.parse
 *
 * Includes extensions for handling Map and Set objects.
 */
function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
            for (let i = 0, len = val.length; i < len; ++i) {
                const v0 = val[i];
                const v1 = applyReviver(reviver, val, String(i), v0);
                // eslint-disable-next-line @typescript-eslint/no-array-delete
                if (v1 === undefined)
                    delete val[i];
                else if (v1 !== v0)
                    val[i] = v1;
            }
        }
        else if (val instanceof Map) {
            for (const k of Array.from(val.keys())) {
                const v0 = val.get(k);
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    val.delete(k);
                else if (v1 !== v0)
                    val.set(k, v1);
            }
        }
        else if (val instanceof Set) {
            for (const v0 of Array.from(val)) {
                const v1 = applyReviver(reviver, val, v0, v0);
                if (v1 === undefined)
                    val.delete(v0);
                else if (v1 !== v0) {
                    val.delete(v0);
                    val.add(v1);
                }
            }
        }
        else {
            for (const [k, v0] of Object.entries(val)) {
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    delete val[k];
                else if (v1 !== v0)
                    val[k] = v1;
            }
        }
    }
    return reviver.call(obj, key, val);
}




/***/ }),
/* 34 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toJS: () => (/* binding */ toJS)
/* harmony export */ });
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);


/**
 * Recursively convert any node or its contents to native JavaScript
 *
 * @param value - The input value
 * @param arg - If `value` defines a `toJSON()` method, use this
 *   as its first argument
 * @param ctx - Conversion context, originally set in Document#toJS(). If
 *   `{ keep: true }` is not set, output should be suitable for JSON
 *   stringification.
 */
function toJS(value, arg, ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!ctx || !(0,_identity_js__WEBPACK_IMPORTED_MODULE_0__.hasAnchor)(value))
            return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: undefined };
        ctx.anchors.set(value, data);
        ctx.onCreate = res => {
            data.res = res;
            delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
            ctx.onCreate(res);
        return res;
    }
    if (typeof value === 'bigint' && !ctx?.keep)
        return Number(value);
    return value;
}




/***/ }),
/* 35 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collection: () => (/* binding */ Collection),
/* harmony export */   collectionFromPath: () => (/* binding */ collectionFromPath),
/* harmony export */   isEmptyPath: () => (/* binding */ isEmptyPath)
/* harmony export */ });
/* harmony import */ var _doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(36);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(32);




function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
            const a = [];
            a[k] = v;
            v = a;
        }
        else {
            v = new Map([[k, v]]);
        }
    }
    return (0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(v, undefined, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
            throw new Error('This should not happen, please report a bug.');
        },
        schema,
        sourceObjects: new Map()
    });
}
// Type guard is intentionally a little wrong so as to be more useful,
// as it does not cover untypable empty non-string iterables (e.g. []).
const isEmptyPath = (path) => path == null ||
    (typeof path === 'object' && !!path[Symbol.iterator]().next().done);
class Collection extends _Node_js__WEBPACK_IMPORTED_MODULE_2__.NodeBase {
    constructor(type, schema) {
        super(type);
        Object.defineProperty(this, 'schema', {
            value: schema,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
            copy.schema = schema;
        copy.items = copy.items.map(it => (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isNode)(it) || (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(it) ? it.clone(schema) : it);
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(path, value) {
        if (isEmptyPath(path))
            this.add(value);
        else {
            const [key, ...rest] = path;
            const node = this.get(key, true);
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node))
                node.addIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.delete(key);
        const node = this.get(key, true);
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node))
            return node.deleteIn(rest);
        else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
            return !keepScalar && (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) ? node.value : node;
        else
            return (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
        return this.items.every(node => {
            if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(node))
                return false;
            const n = node.value;
            return (n == null ||
                (allowScalar &&
                    (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(n) &&
                    n.value == null &&
                    !n.commentBefore &&
                    !n.comment &&
                    !n.tag));
        });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.has(key);
        const node = this.get(key, true);
        return (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node) ? node.hasIn(rest) : false;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
            this.set(key, value);
        }
        else {
            const node = this.get(key, true);
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node))
                node.setIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
}




/***/ }),
/* 36 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNode: () => (/* binding */ createNode)
/* harmony export */ });
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(30);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(37);




const defaultTagPrefix = 'tag:yaml.org,2002:';
function findTagObject(value, tagName, tags) {
    if (tagName) {
        const match = tags.filter(t => t.tag === tagName);
        const tagObj = match.find(t => !t.format) ?? match[0];
        if (!tagObj)
            throw new Error(`Tag ${tagName} not found`);
        return tagObj;
    }
    return tags.find(t => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isDocument)(value))
        value = value.contents;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isNode)(value))
        return value;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(value)) {
        const map = ctx.schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
    }
    if (value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean ||
        (typeof BigInt !== 'undefined' && value instanceof BigInt) // not supported everywhere
    ) {
        // https://tc39.es/ecma262/#sec-serializejsonproperty
        value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    // Detect duplicate references to the same object & use Alias nodes for all
    // after first. The `ref` wrapper allows for circular references to resolve.
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === 'object') {
        ref = sourceObjects.get(value);
        if (ref) {
            if (!ref.anchor)
                ref.anchor = onAnchor(value);
            return new _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__.Alias(ref.anchor);
        }
        else {
            ref = { anchor: null, node: null };
            sourceObjects.set(value, ref);
        }
    }
    if (tagName?.startsWith('!!'))
        tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
        if (value && typeof value.toJSON === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            value = value.toJSON();
        }
        if (!value || typeof value !== 'object') {
            const node = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__.Scalar(value);
            if (ref)
                ref.node = node;
            return node;
        }
        tagObj =
            value instanceof Map
                ? schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.MAP]
                : Symbol.iterator in Object(value)
                    ? schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.SEQ]
                    : schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.MAP];
    }
    if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
    }
    const node = tagObj?.createNode
        ? tagObj.createNode(ctx.schema, value, ctx)
        : typeof tagObj?.nodeClass?.from === 'function'
            ? tagObj.nodeClass.from(ctx.schema, value, ctx)
            : new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__.Scalar(value);
    if (tagName)
        node.tag = tagName;
    else if (!tagObj.default)
        node.tag = tagObj.tag;
    if (ref)
        ref.node = node;
    return node;
}




/***/ }),
/* 37 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scalar: () => (/* binding */ Scalar),
/* harmony export */   isScalarValue: () => (/* binding */ isScalarValue)
/* harmony export */ });
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(32);
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34);




const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
class Scalar extends _Node_js__WEBPACK_IMPORTED_MODULE_1__.NodeBase {
    constructor(value) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR);
        this.value = value;
    }
    toJSON(arg, ctx) {
        return ctx?.keep ? this.value : (0,_toJS_js__WEBPACK_IMPORTED_MODULE_2__.toJS)(this.value, arg, ctx);
    }
    toString() {
        return String(this.value);
    }
}
Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar.PLAIN = 'PLAIN';
Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';




/***/ }),
/* 38 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pair: () => (/* binding */ Pair),
/* harmony export */   createPair: () => (/* binding */ createPair)
/* harmony export */ });
/* harmony import */ var _doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(36);
/* harmony import */ var _stringify_stringifyPair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39);
/* harmony import */ var _addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(44);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(27);





function createPair(key, value, ctx) {
    const k = (0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(key, undefined, ctx);
    const v = (0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(value, undefined, ctx);
    return new Pair(k, v);
}
class Pair {
    constructor(key, value = null) {
        Object.defineProperty(this, _identity_js__WEBPACK_IMPORTED_MODULE_3__.NODE_TYPE, { value: _identity_js__WEBPACK_IMPORTED_MODULE_3__.PAIR });
        this.key = key;
        this.value = value;
    }
    clone(schema) {
        let { key, value } = this;
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isNode)(key))
            key = key.clone(schema);
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isNode)(value))
            value = value.clone(schema);
        return new Pair(key, value);
    }
    toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? new Map() : {};
        return (0,_addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_2__.addPairToJSMap)(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
        return ctx?.doc
            ? (0,_stringify_stringifyPair_js__WEBPACK_IMPORTED_MODULE_1__.stringifyPair)(this, ctx, onComment, onChompKeep)
            : JSON.stringify(this);
    }
}




/***/ }),
/* 39 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyPair: () => (/* binding */ stringifyPair)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(40);
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(41);





function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(key) && key.comment) || null;
    if (simpleKeys) {
        if (keyComment) {
            throw new Error('With simple keys, key nodes cannot have comments');
        }
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(key) || (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(key) && typeof key === 'object')) {
            const msg = 'With simple keys, collection cannot be used as a key value';
            throw new Error(msg);
        }
    }
    let explicitKey = !simpleKeys &&
        (!key ||
            (keyComment && value == null && !ctx.inFlow) ||
            (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(key) ||
            ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(key)
                ? key.type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar.BLOCK_FOLDED || key.type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar.BLOCK_LITERAL
                : typeof key === 'object'));
    ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.stringify)(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
            throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
        explicitKey = true;
    }
    if (ctx.inFlow) {
        if (allNullValues || value == null) {
            if (keyCommentDone && onComment)
                onComment();
            return str === '' ? '?' : explicitKey ? `? ${str}` : str;
        }
    }
    else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(keyComment));
        }
        else if (chompKeep && onChompKeep)
            onChompKeep();
        return str;
    }
    if (keyCommentDone)
        keyComment = null;
    if (explicitKey) {
        if (keyComment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(keyComment));
        str = `? ${str}\n${indent}:`;
    }
    else {
        str = `${str}:`;
        if (keyComment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
    }
    else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === 'object')
            value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(value))
        ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq &&
        indentStep.length >= 2 &&
        !ctx.inFlow &&
        !explicitKey &&
        (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(value) &&
        !value.flow &&
        !value.tag &&
        !value.anchor) {
        // If indentSeq === false, consider '- ' as part of indentation where possible
        ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.stringify)(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
    let ws = ' ';
    if (keyComment || vsb || vcb) {
        ws = vsb ? '\n' : '';
        if (vcb) {
            const cs = commentString(vcb);
            ws += `\n${(0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.indentComment)(cs, ctx.indent)}`;
        }
        if (valueStr === '' && !ctx.inFlow) {
            if (ws === '\n')
                ws = '\n\n';
        }
        else {
            ws += `\n${ctx.indent}`;
        }
    }
    else if (!explicitKey && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf('\n');
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
            let hasPropsLine = false;
            if (hasNewline && (vs0 === '&' || vs0 === '!')) {
                let sp0 = valueStr.indexOf(' ');
                if (vs0 === '&' &&
                    sp0 !== -1 &&
                    sp0 < nl0 &&
                    valueStr[sp0 + 1] === '!') {
                    sp0 = valueStr.indexOf(' ', sp0 + 1);
                }
                if (sp0 === -1 || nl0 < sp0)
                    hasPropsLine = true;
            }
            if (!hasPropsLine)
                ws = `\n${ctx.indent}`;
        }
    }
    else if (valueStr === '' || valueStr[0] === '\n') {
        ws = '';
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
        if (valueCommentDone && onComment)
            onComment();
    }
    else if (valueComment && !valueCommentDone) {
        str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(valueComment));
    }
    else if (chompKeep && onChompKeep) {
        onChompKeep();
    }
    return str;
}




/***/ }),
/* 40 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createStringifyContext: () => (/* binding */ createStringifyContext),
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/* harmony import */ var _doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41);
/* harmony import */ var _stringifyString_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(42);





function createStringifyContext(doc, options) {
    const opt = Object.assign({
        blockQuote: true,
        commentString: _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.stringifyComment,
        defaultKeyType: null,
        defaultStringType: 'PLAIN',
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: 'false',
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: 'null',
        simpleKeys: false,
        singleQuote: null,
        trueStr: 'true',
        verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
        case 'block':
            inFlow = false;
            break;
        case 'flow':
            inFlow = true;
            break;
        default:
            inFlow = null;
    }
    return {
        anchors: new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? ' ' : '',
        indent: '',
        indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
        inFlow,
        options: opt
    };
}
function getTagObject(tags, item) {
    if (item.tag) {
        const match = tags.filter(t => t.tag === item.tag);
        if (match.length > 0)
            return match.find(t => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(item)) {
        obj = item.value;
        let match = tags.filter(t => t.identify?.(obj));
        if (match.length > 1) {
            const testMatch = match.filter(t => t.test);
            if (testMatch.length > 0)
                match = testMatch;
        }
        tagObj =
            match.find(t => t.format === item.format) ?? match.find(t => !t.format);
    }
    else {
        obj = item;
        tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
        const name = obj?.constructor?.name ?? typeof obj;
        throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
}
// needs to be called before value stringifier to allow for circular anchor refs
function stringifyProps(node, tagObj, { anchors, doc }) {
    if (!doc.directives)
        return '';
    const props = [];
    const anchor = ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node)) && node.anchor;
    if (anchor && (0,_doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__.anchorIsValid)(anchor)) {
        anchors.add(anchor);
        props.push(`&${anchor}`);
    }
    const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
    if (tag)
        props.push(doc.directives.tagString(tag));
    return props.join(' ');
}
function stringify(item, ctx, onComment, onChompKeep) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(item))
        return item.toString(ctx, onComment, onChompKeep);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isAlias)(item)) {
        if (ctx.doc.directives)
            return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
            throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        }
        else {
            if (ctx.resolvedAliases)
                ctx.resolvedAliases.add(item);
            else
                ctx.resolvedAliases = new Set([item]);
            item = item.resolve(ctx.doc);
        }
    }
    let tagObj = undefined;
    const node = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isNode)(item)
        ? item
        : ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
    if (!tagObj)
        tagObj = getTagObject(ctx.doc.schema.tags, node);
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === 'function'
        ? tagObj.stringify(node, ctx, onComment, onChompKeep)
        : (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node)
            ? (0,_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__.stringifyString)(node, ctx, onComment, onChompKeep)
            : node.toString(ctx, onComment, onChompKeep);
    if (!props)
        return str;
    return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) || str[0] === '{' || str[0] === '['
        ? `${props} ${str}`
        : `${props}\n${ctx.indent}${str}`;
}




/***/ }),
/* 41 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   indentComment: () => (/* binding */ indentComment),
/* harmony export */   lineComment: () => (/* binding */ lineComment),
/* harmony export */   stringifyComment: () => (/* binding */ stringifyComment)
/* harmony export */ });
/**
 * Stringifies a comment.
 *
 * Empty comment lines are left empty,
 * lines consisting of a single space are replaced by `#`,
 * and all other lines are prefixed with a `#`.
 */
const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
        return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith('\n')
    ? indentComment(comment, indent)
    : comment.includes('\n')
        ? '\n' + indentComment(comment, indent)
        : (str.endsWith(' ') ? '' : ' ') + comment;




/***/ }),
/* 42 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyString: () => (/* binding */ stringifyString)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
/* harmony import */ var _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43);



const getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
});
// Also checks for lines starting with %, as parsing the output as YAML 1.1 will
// presume that's starting a new document.
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
        return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
        return false;
    for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === '\n') {
            if (i - start > limit)
                return true;
            start = i + 1;
            if (strLen - start <= limit)
                return false;
        }
    }
    return true;
}
function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
        return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    let str = '';
    let start = 0;
    for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
            // space before newline needs to be escaped to not be folded
            str += json.slice(start, i) + '\\ ';
            i += 1;
            start = i;
            ch = '\\';
        }
        if (ch === '\\')
            switch (json[i + 1]) {
                case 'u':
                    {
                        str += json.slice(start, i);
                        const code = json.substr(i + 2, 4);
                        switch (code) {
                            case '0000':
                                str += '\\0';
                                break;
                            case '0007':
                                str += '\\a';
                                break;
                            case '000b':
                                str += '\\v';
                                break;
                            case '001b':
                                str += '\\e';
                                break;
                            case '0085':
                                str += '\\N';
                                break;
                            case '00a0':
                                str += '\\_';
                                break;
                            case '2028':
                                str += '\\L';
                                break;
                            case '2029':
                                str += '\\P';
                                break;
                            default:
                                if (code.substr(0, 2) === '00')
                                    str += '\\x' + code.substr(2);
                                else
                                    str += json.substr(i, 6);
                        }
                        i += 5;
                        start = i + 1;
                    }
                    break;
                case 'n':
                    if (implicitKey ||
                        json[i + 2] === '"' ||
                        json.length < minMultiLineLength) {
                        i += 1;
                    }
                    else {
                        // folding will eat first newline
                        str += json.slice(start, i) + '\n\n';
                        while (json[i + 2] === '\\' &&
                            json[i + 3] === 'n' &&
                            json[i + 4] !== '"') {
                            str += '\n';
                            i += 2;
                        }
                        str += indent;
                        // space after newline needs to be escaped to not be folded
                        if (json[i + 2] === ' ')
                            str += '\\';
                        i += 1;
                        start = i + 1;
                    }
                    break;
                default:
                    i += 1;
            }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey
        ? str
        : (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(str, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false ||
        (ctx.implicitKey && value.includes('\n')) ||
        /[ \t]\n|\n[ \t]/.test(value) // single quoted string can't have leading or trailing whitespace around newline
    )
        return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
    return ctx.implicitKey
        ? res
        : (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(res, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
        qs = doubleQuotedString;
    else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
            qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
            qs = doubleQuotedString;
        else
            qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
}
// The negative lookbehind avoids a polynomial search,
// but isn't supported yet on Safari: https://caniuse.com/js-regexp-lookbehind
let blockEndNewlines;
try {
    blockEndNewlines = new RegExp('(^|(?<!\n))\n+(?!\n|$)', 'g');
}
catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    // 1. Block can't end in whitespace unless the last line is non-empty.
    // 2. Strings consisting of only whitespace are best rendered explicitly.
    if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
        return quotedString(value, ctx);
    }
    const indent = ctx.indent ||
        (ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
    const literal = blockQuote === 'literal'
        ? true
        : blockQuote === 'folded' || type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_FOLDED
            ? false
            : type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL
                ? true
                : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
        return literal ? '|\n' : '>\n';
    // determine chomping from whitespace at value end
    let chomp;
    let endStart;
    for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== '\n' && ch !== '\t' && ch !== ' ')
            break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf('\n');
    if (endNlPos === -1) {
        chomp = '-'; // strip
    }
    else if (value === end || endNlPos !== end.length - 1) {
        chomp = '+'; // keep
        if (onChompKeep)
            onChompKeep();
    }
    else {
        chomp = ''; // clip
    }
    if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === '\n')
            end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    // determine indent indicator from whitespace at value start
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === ' ')
            startWithSpace = true;
        else if (ch === '\n')
            startNlPos = startEnd;
        else
            break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? '2' : '1'; // root is at -1
    let header = (literal ? '|' : '>') + (startWithSpace ? indentSize : '') + chomp;
    if (comment) {
        header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
        if (onComment)
            onComment();
    }
    if (literal) {
        value = value.replace(/\n+/g, `$&${indent}`);
        return `${header}\n${indent}${start}${value}${end}`;
    }
    value = value
        .replace(/\n+/g, '\n$&')
        .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
        //                ^ more-ind. ^ empty     ^ capture next empty lines only at end of indent
        .replace(/\n+/g, `$&${indent}`);
    const body = (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(`${start}${value}${end}`, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_BLOCK, getFoldOptions(ctx, true));
    return `${header}\n${indent}${body}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if ((implicitKey && value.includes('\n')) ||
        (inFlow && /[[\]{},]/.test(value))) {
        return quotedString(value, ctx);
    }
    if (!value ||
        /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        // not allowed:
        // - empty string, '-' or '?'
        // - start with an indicator character (except [?:-]) or /[?-] /
        // - '\n ', ': ' or ' \n' anywhere
        // - '#' not preceded by a non-space char
        // - end with ' ' or ':'
        return implicitKey || inFlow || !value.includes('\n')
            ? quotedString(value, ctx)
            : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey &&
        !inFlow &&
        type !== _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.PLAIN &&
        value.includes('\n')) {
        // Where allowed & type not set explicitly, prefer block style for multiline strings
        return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
        if (indent === '') {
            ctx.forceBlockIndent = true;
            return blockString(item, ctx, onComment, onChompKeep);
        }
        else if (implicitKey && indent === indentStep) {
            return quotedString(value, ctx);
        }
    }
    const str = value.replace(/\n+/g, `$&\n${indent}`);
    // Verify that output will be parsed as a string, as e.g. plain numbers and
    // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
    // and others in v1.1.
    if (actualString) {
        const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
            return quotedString(value, ctx);
    }
    return implicitKey
        ? str
        : (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(str, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === 'string'
        ? item
        : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE) {
        // force double quotes on control characters & unpaired surrogates
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
            type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
        switch (_type) {
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_FOLDED:
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL:
                return implicitKey || inFlow
                    ? quotedString(ss.value, ctx) // blocks are not valid inside flow containers
                    : blockString(ss, ctx, onComment, onChompKeep);
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE:
                return doubleQuotedString(ss.value, ctx);
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_SINGLE:
                return singleQuotedString(ss.value, ctx);
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.PLAIN:
                return plainString(ss, ctx, onComment, onChompKeep);
            default:
                return null;
        }
    };
    let res = _stringify(type);
    if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = (implicitKey && defaultKeyType) || defaultStringType;
        res = _stringify(t);
        if (res === null)
            throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
}




/***/ }),
/* 43 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FOLD_BLOCK: () => (/* binding */ FOLD_BLOCK),
/* harmony export */   FOLD_FLOW: () => (/* binding */ FOLD_FLOW),
/* harmony export */   FOLD_QUOTED: () => (/* binding */ FOLD_QUOTED),
/* harmony export */   foldFlowLines: () => (/* binding */ foldFlowLines)
/* harmony export */ });
const FOLD_FLOW = 'flow';
const FOLD_BLOCK = 'block';
const FOLD_QUOTED = 'quoted';
/**
 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
 * terminated with `\n` and started with `indent`.
 */
function foldFlowLines(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
        return text;
    if (lineWidth < minContentWidth)
        minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
        return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === 'number') {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
            folds.push(0);
        else
            end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
            end = i + endStep;
    }
    for (let ch; (ch = text[(i += 1)]);) {
        if (mode === FOLD_QUOTED && ch === '\\') {
            escStart = i;
            switch (text[i + 1]) {
                case 'x':
                    i += 3;
                    break;
                case 'u':
                    i += 5;
                    break;
                case 'U':
                    i += 9;
                    break;
                default:
                    i += 1;
            }
            escEnd = i;
        }
        if (ch === '\n') {
            if (mode === FOLD_BLOCK)
                i = consumeMoreIndentedLines(text, i, indent.length);
            end = i + indent.length + endStep;
            split = undefined;
        }
        else {
            if (ch === ' ' &&
                prev &&
                prev !== ' ' &&
                prev !== '\n' &&
                prev !== '\t') {
                // space surrounded by non-space can be replaced with newline + indent
                const next = text[i + 1];
                if (next && next !== ' ' && next !== '\n' && next !== '\t')
                    split = i;
            }
            if (i >= end) {
                if (split) {
                    folds.push(split);
                    end = split + endStep;
                    split = undefined;
                }
                else if (mode === FOLD_QUOTED) {
                    // white-space collected at end may stretch past lineWidth
                    while (prev === ' ' || prev === '\t') {
                        prev = ch;
                        ch = text[(i += 1)];
                        overflow = true;
                    }
                    // Account for newline escape, but don't break preceding escape
                    const j = i > escEnd + 1 ? i - 2 : escStart - 1;
                    // Bail out if lineWidth & minContentWidth are shorter than an escape string
                    if (escapedFolds[j])
                        return text;
                    folds.push(j);
                    escapedFolds[j] = true;
                    end = j + endStep;
                    split = undefined;
                }
                else {
                    overflow = true;
                }
            }
        }
        prev = ch;
    }
    if (overflow && onOverflow)
        onOverflow();
    if (folds.length === 0)
        return text;
    if (onFold)
        onFold();
    let res = text.slice(0, folds[0]);
    for (let i = 0; i < folds.length; ++i) {
        const fold = folds[i];
        const end = folds[i + 1] || text.length;
        if (fold === 0)
            res = `\n${indent}${text.slice(0, end)}`;
        else {
            if (mode === FOLD_QUOTED && escapedFolds[fold])
                res += `${text[fold]}\\`;
            res += `\n${indent}${text.slice(fold + 1, end)}`;
        }
    }
    return res;
}
/**
 * Presumes `i + 1` is at the start of a line
 * @returns index of last newline in more-indented block
 */
function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === ' ' || ch === '\t') {
        if (i < start + indent) {
            ch = text[++i];
        }
        else {
            do {
                ch = text[++i];
            } while (ch && ch !== '\n');
            end = i;
            start = i + 1;
            ch = text[start];
        }
    }
    return end;
}




/***/ }),
/* 44 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addPairToJSMap: () => (/* binding */ addPairToJSMap)
/* harmony export */ });
/* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(45);
/* harmony import */ var _schema_yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(46);
/* harmony import */ var _stringify_stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(40);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(27);
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34);






function addPairToJSMap(ctx, map, { key, value }) {
    if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isNode)(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
    // TODO: Should drop this special case for bare << handling
    else if ((0,_schema_yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_1__.isMergeKey)(ctx, key))
        (0,_schema_yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_1__.addMergeToJSMap)(ctx, map, value);
    else {
        const jsKey = (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(key, '', ctx);
        if (map instanceof Map) {
            map.set(jsKey, (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(value, jsKey, ctx));
        }
        else if (map instanceof Set) {
            map.add(jsKey);
        }
        else {
            const stringKey = stringifyKey(key, jsKey, ctx);
            const jsValue = (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(value, stringKey, ctx);
            if (stringKey in map)
                Object.defineProperty(map, stringKey, {
                    value: jsValue,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            else
                map[stringKey] = jsValue;
        }
    }
    return map;
}
function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
        return '';
    if (typeof jsKey !== 'object')
        return String(jsKey);
    if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isNode)(key) && ctx?.doc) {
        const strCtx = (0,_stringify_stringify_js__WEBPACK_IMPORTED_MODULE_2__.createStringifyContext)(ctx.doc, {});
        strCtx.anchors = new Set();
        for (const node of ctx.anchors.keys())
            strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
            let jsonStr = JSON.stringify(strKey);
            if (jsonStr.length > 40)
                jsonStr = jsonStr.substring(0, 36) + '..."';
            (0,_log_js__WEBPACK_IMPORTED_MODULE_0__.warn)(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
            ctx.mapKeyWarned = true;
        }
        return strKey;
    }
    return JSON.stringify(jsKey);
}




/***/ }),
/* 45 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
/* provided dependency */ var process = __webpack_require__(5);
function debug(logLevel, ...messages) {
    if (logLevel === 'debug')
        console.log(...messages);
}
function warn(logLevel, warning) {
    if (logLevel === 'debug' || logLevel === 'warn') {
        if (typeof process !== 'undefined' && process.emitWarning)
            process.emitWarning(warning);
        else
            console.warn(warning);
    }
}




/***/ }),
/* 46 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addMergeToJSMap: () => (/* binding */ addMergeToJSMap),
/* harmony export */   isMergeKey: () => (/* binding */ isMergeKey),
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37);



// If the value associated with a merge key is a single mapping node, each of
// its key/value pairs is inserted into the current mapping, unless the key
// already exists in it. If the value associated with the merge key is a
// sequence, then this sequence is expected to contain mapping nodes and each
// of these nodes is merged in turn according to its order in the sequence.
// Keys in mapping nodes earlier in the sequence override keys specified in
// later mapping nodes. -- http://yaml.org/type/merge.html
const MERGE_KEY = '<<';
const merge = {
    identify: value => value === MERGE_KEY ||
        (typeof value === 'symbol' && value.description === MERGE_KEY),
    default: 'key',
    tag: 'tag:yaml.org,2002:merge',
    test: /^<<$/,
    resolve: () => Object.assign(new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
};
const isMergeKey = (ctx, key) => (merge.identify(key) ||
    ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(key) &&
        (!key.type || key.type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar.PLAIN) &&
        merge.identify(key.value))) &&
    ctx?.doc.schema.tags.some(tag => tag.tag === merge.tag && tag.default);
function addMergeToJSMap(ctx, map, value) {
    value = ctx && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isAlias)(value) ? value.resolve(ctx.doc) : value;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(value))
        for (const it of value.items)
            mergeValue(ctx, map, it);
    else if (Array.isArray(value))
        for (const it of value)
            mergeValue(ctx, map, it);
    else
        mergeValue(ctx, map, value);
}
function mergeValue(ctx, map, value) {
    const source = ctx && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isAlias)(value) ? value.resolve(ctx.doc) : value;
    if (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(source))
        throw new Error('Merge sources must be maps or map aliases');
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value] of srcMap) {
        if (map instanceof Map) {
            if (!map.has(key))
                map.set(key, value);
        }
        else if (map instanceof Set) {
            map.add(key);
        }
        else if (!Object.prototype.hasOwnProperty.call(map, key)) {
            Object.defineProperty(map, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
    }
    return map;
}




/***/ }),
/* 47 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Schema: () => (/* binding */ Schema)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(48);
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(53);
/* harmony import */ var _tags_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(54);






const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat)
            ? (0,_tags_js__WEBPACK_IMPORTED_MODULE_4__.getTags)(compat, 'compat')
            : compat
                ? (0,_tags_js__WEBPACK_IMPORTED_MODULE_4__.getTags)(null, compat)
                : null;
        this.name = (typeof schema === 'string' && schema) || 'core';
        this.knownTags = resolveKnownTags ? _tags_js__WEBPACK_IMPORTED_MODULE_4__.coreKnownTags : {};
        this.tags = (0,_tags_js__WEBPACK_IMPORTED_MODULE_4__.getTags)(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.MAP, { value: _common_map_js__WEBPACK_IMPORTED_MODULE_1__.map });
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR, { value: _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string });
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SEQ, { value: _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq });
        // Used by createMap()
        this.sortMapEntries =
            typeof sortMapEntries === 'function'
                ? sortMapEntries
                : sortMapEntries === true
                    ? sortMapEntriesByKey
                    : null;
    }
    clone() {
        const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
    }
}




/***/ }),
/* 48 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   map: () => (/* binding */ map)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49);



const map = {
    collection: 'map',
    default: true,
    nodeClass: _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__.YAMLMap,
    tag: 'tag:yaml.org,2002:map',
    resolve(map, onError) {
        if (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(map))
            onError('Expected a mapping for this tag');
        return map;
    },
    createNode: (schema, obj, ctx) => _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__.YAMLMap.from(schema, obj, ctx)
};




/***/ }),
/* 49 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLMap: () => (/* binding */ YAMLMap),
/* harmony export */   findPair: () => (/* binding */ findPair)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(50);
/* harmony import */ var _addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(44);
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(35);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(27);
/* harmony import */ var _Pair_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(38);
/* harmony import */ var _Scalar_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(37);







function findPair(items, key) {
    const k = (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(key) ? key.value : key;
    for (const it of items) {
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(it)) {
            if (it.key === key || it.key === k)
                return it;
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(it.key) && it.key.value === k)
                return it;
        }
    }
    return undefined;
}
class YAMLMap extends _Collection_js__WEBPACK_IMPORTED_MODULE_2__.Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:map';
    }
    constructor(schema) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_3__.MAP, schema);
        this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
            if (typeof replacer === 'function')
                value = replacer.call(obj, key, value);
            else if (Array.isArray(replacer) && !replacer.includes(key))
                return;
            if (value !== undefined || keepUndefined)
                map.items.push((0,_Pair_js__WEBPACK_IMPORTED_MODULE_4__.createPair)(key, value, ctx));
        };
        if (obj instanceof Map) {
            for (const [key, value] of obj)
                add(key, value);
        }
        else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj))
                add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === 'function') {
            map.items.sort(schema.sortMapEntries);
        }
        return map;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(pair, overwrite) {
        let _pair;
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(pair))
            _pair = pair;
        else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
            // In TypeScript, this never happens.
            _pair = new _Pair_js__WEBPACK_IMPORTED_MODULE_4__.Pair(pair, pair?.value);
        }
        else
            _pair = new _Pair_js__WEBPACK_IMPORTED_MODULE_4__.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
            if (!overwrite)
                throw new Error(`Key ${_pair.key} already set`);
            // For scalars, keep the old node & its comments and anchors
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(prev.value) && (0,_Scalar_js__WEBPACK_IMPORTED_MODULE_5__.isScalarValue)(_pair.value))
                prev.value.value = _pair.value;
            else
                prev.value = _pair.value;
        }
        else if (sortEntries) {
            const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
            if (i === -1)
                this.items.push(_pair);
            else
                this.items.splice(i, 0, _pair);
        }
        else {
            this.items.push(_pair);
        }
    }
    delete(key) {
        const it = findPair(this.items, key);
        if (!it)
            return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(node) ? node.value : node) ?? undefined;
    }
    has(key) {
        return !!findPair(this.items, key);
    }
    set(key, value) {
        this.add(new _Pair_js__WEBPACK_IMPORTED_MODULE_4__.Pair(key, value), true);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const item of this.items)
            (0,_addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_1__.addPairToJSMap)(ctx, map, item);
        return map;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        for (const item of this.items) {
            if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(item))
                throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
            ctx = Object.assign({}, ctx, { allNullValues: true });
        return (0,_stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_0__.stringifyCollection)(this, ctx, {
            blockItemPrefix: '',
            flowChars: { start: '{', end: '}' },
            itemIndent: ctx.indent || '',
            onChompKeep,
            onComment
        });
    }
}




/***/ }),
/* 50 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyCollection: () => (/* binding */ stringifyCollection)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(40);
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41);




function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false; // flag for the preceding node's status
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item)) {
            if (!chompKeep && item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
            if (item.comment)
                comment = item.comment;
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item)) {
            const ik = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item.key) ? item.key : null;
            if (ik) {
                if (!chompKeep && ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
            }
        }
        chompKeep = false;
        let str = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(item, itemCtx, () => (comment = null), () => (chompKeep = true));
        if (comment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.lineComment)(str, itemIndent, commentString(comment));
        if (chompKeep && comment)
            chompKeep = false;
        lines.push(blockItemPrefix + str);
    }
    let str;
    if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
    }
    else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
            const line = lines[i];
            str += line ? `\n${indent}${line}` : '\n';
        }
    }
    if (comment) {
        str += '\n' + (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(commentString(comment), indent);
        if (onComment)
            onComment();
    }
    else if (chompKeep && onChompKeep)
        onChompKeep();
    return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item)) {
            if (item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, false);
            if (item.comment)
                comment = item.comment;
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item)) {
            const ik = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item.key) ? item.key : null;
            if (ik) {
                if (ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, false);
                if (ik.comment)
                    reqNewline = true;
            }
            const iv = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item.value) ? item.value : null;
            if (iv) {
                if (iv.comment)
                    comment = iv.comment;
                if (iv.commentBefore)
                    reqNewline = true;
            }
            else if (item.value == null && ik?.comment) {
                comment = ik.comment;
            }
        }
        if (comment)
            reqNewline = true;
        let str = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(item, itemCtx, () => (comment = null));
        if (i < items.length - 1)
            str += ',';
        if (comment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.lineComment)(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes('\n')))
            reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
        return start + end;
    }
    else {
        if (!reqNewline) {
            const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
            reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
            let str = start;
            for (const line of lines)
                str += line ? `\n${indentStep}${indent}${line}` : '\n';
            return `${str}\n${indent}${end}`;
        }
        else {
            return `${start}${fcPadding}${lines.join(' ')}${fcPadding}${end}`;
        }
    }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
        comment = comment.replace(/^\n+/, '');
    if (comment) {
        const ic = (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(commentString(comment), indent);
        lines.push(ic.trimStart()); // Avoid double indent on first line
    }
}




/***/ }),
/* 51 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   seq: () => (/* binding */ seq)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(52);



const seq = {
    collection: 'seq',
    default: true,
    nodeClass: _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_1__.YAMLSeq,
    tag: 'tag:yaml.org,2002:seq',
    resolve(seq, onError) {
        if (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(seq))
            onError('Expected a sequence for this tag');
        return seq;
    },
    createNode: (schema, obj, ctx) => _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_1__.YAMLSeq.from(schema, obj, ctx)
};




/***/ }),
/* 52 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLSeq: () => (/* binding */ YAMLSeq)
/* harmony export */ });
/* harmony import */ var _doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(36);
/* harmony import */ var _stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(50);
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(35);
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(27);
/* harmony import */ var _Scalar_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(37);
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(34);







class YAMLSeq extends _Collection_js__WEBPACK_IMPORTED_MODULE_2__.Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:seq';
    }
    constructor(schema) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_3__.SEQ, schema);
        this.items = [];
    }
    add(value) {
        this.items.push(value);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return undefined;
        const it = this.items[idx];
        return !keepScalar && (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(it) ? it.value : it;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(key) {
        const idx = asItemIndex(key);
        return typeof idx === 'number' && idx < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(prev) && (0,_Scalar_js__WEBPACK_IMPORTED_MODULE_4__.isScalarValue)(value))
            prev.value = value;
        else
            this.items[idx] = value;
    }
    toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
            ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
            seq.push((0,_toJS_js__WEBPACK_IMPORTED_MODULE_5__.toJS)(item, String(i++), ctx));
        return seq;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        return (0,_stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_1__.stringifyCollection)(this, ctx, {
            blockItemPrefix: '- ',
            flowChars: { start: '[', end: ']' },
            itemIndent: (ctx.indent || '') + '  ',
            onChompKeep,
            onComment
        });
    }
    static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
            let i = 0;
            for (let it of obj) {
                if (typeof replacer === 'function') {
                    const key = obj instanceof Set ? it : String(i++);
                    it = replacer.call(obj, key, it);
                }
                seq.items.push((0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(it, undefined, ctx));
            }
        }
        return seq;
    }
}
function asItemIndex(key) {
    let idx = (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(key) ? key.value : key;
    if (idx && typeof idx === 'string')
        idx = Number(idx);
    return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
        ? idx
        : null;
}




/***/ }),
/* 53 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   string: () => (/* binding */ string)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(42);


const string = {
    identify: value => typeof value === 'string',
    default: true,
    tag: 'tag:yaml.org,2002:str',
    resolve: str => str,
    stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_0__.stringifyString)(item, ctx, onComment, onChompKeep);
    }
};




/***/ }),
/* 54 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   coreKnownTags: () => (/* binding */ coreKnownTags),
/* harmony export */   getTags: () => (/* binding */ getTags)
/* harmony export */ });
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48);
/* harmony import */ var _common_null_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(55);
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(53);
/* harmony import */ var _core_bool_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(56);
/* harmony import */ var _core_float_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(57);
/* harmony import */ var _core_int_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(59);
/* harmony import */ var _core_schema_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(60);
/* harmony import */ var _json_schema_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(61);
/* harmony import */ var _yaml_1_1_binary_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(62);
/* harmony import */ var _yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(46);
/* harmony import */ var _yaml_1_1_omap_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(63);
/* harmony import */ var _yaml_1_1_pairs_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(64);
/* harmony import */ var _yaml_1_1_schema_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(65);
/* harmony import */ var _yaml_1_1_set_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(69);
/* harmony import */ var _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(70);

















const schemas = new Map([
    ['core', _core_schema_js__WEBPACK_IMPORTED_MODULE_7__.schema],
    ['failsafe', [_common_map_js__WEBPACK_IMPORTED_MODULE_0__.map, _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq, _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string]],
    ['json', _json_schema_js__WEBPACK_IMPORTED_MODULE_8__.schema],
    ['yaml11', _yaml_1_1_schema_js__WEBPACK_IMPORTED_MODULE_13__.schema],
    ['yaml-1.1', _yaml_1_1_schema_js__WEBPACK_IMPORTED_MODULE_13__.schema]
]);
const tagsByName = {
    binary: _yaml_1_1_binary_js__WEBPACK_IMPORTED_MODULE_9__.binary,
    bool: _core_bool_js__WEBPACK_IMPORTED_MODULE_4__.boolTag,
    float: _core_float_js__WEBPACK_IMPORTED_MODULE_5__.float,
    floatExp: _core_float_js__WEBPACK_IMPORTED_MODULE_5__.floatExp,
    floatNaN: _core_float_js__WEBPACK_IMPORTED_MODULE_5__.floatNaN,
    floatTime: _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_15__.floatTime,
    int: _core_int_js__WEBPACK_IMPORTED_MODULE_6__.int,
    intHex: _core_int_js__WEBPACK_IMPORTED_MODULE_6__.intHex,
    intOct: _core_int_js__WEBPACK_IMPORTED_MODULE_6__.intOct,
    intTime: _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_15__.intTime,
    map: _common_map_js__WEBPACK_IMPORTED_MODULE_0__.map,
    merge: _yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_10__.merge,
    null: _common_null_js__WEBPACK_IMPORTED_MODULE_1__.nullTag,
    omap: _yaml_1_1_omap_js__WEBPACK_IMPORTED_MODULE_11__.omap,
    pairs: _yaml_1_1_pairs_js__WEBPACK_IMPORTED_MODULE_12__.pairs,
    seq: _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq,
    set: _yaml_1_1_set_js__WEBPACK_IMPORTED_MODULE_14__.set,
    timestamp: _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_15__.timestamp
};
const coreKnownTags = {
    'tag:yaml.org,2002:binary': _yaml_1_1_binary_js__WEBPACK_IMPORTED_MODULE_9__.binary,
    'tag:yaml.org,2002:merge': _yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_10__.merge,
    'tag:yaml.org,2002:omap': _yaml_1_1_omap_js__WEBPACK_IMPORTED_MODULE_11__.omap,
    'tag:yaml.org,2002:pairs': _yaml_1_1_pairs_js__WEBPACK_IMPORTED_MODULE_12__.pairs,
    'tag:yaml.org,2002:set': _yaml_1_1_set_js__WEBPACK_IMPORTED_MODULE_14__.set,
    'tag:yaml.org,2002:timestamp': _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_15__.timestamp
};
function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(_yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_10__.merge)
            ? schemaTags.concat(_yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_10__.merge)
            : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
        if (Array.isArray(customTags))
            tags = [];
        else {
            const keys = Array.from(schemas.keys())
                .filter(key => key !== 'yaml11')
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
    }
    if (Array.isArray(customTags)) {
        for (const tag of customTags)
            tags = tags.concat(tag);
    }
    else if (typeof customTags === 'function') {
        tags = customTags(tags.slice());
    }
    if (addMergeTag)
        tags = tags.concat(_yaml_1_1_merge_js__WEBPACK_IMPORTED_MODULE_10__.merge);
    return tags.reduce((tags, tag) => {
        const tagObj = typeof tag === 'string' ? tagsByName[tag] : tag;
        if (!tagObj) {
            const tagName = JSON.stringify(tag);
            const keys = Object.keys(tagsByName)
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags.includes(tagObj))
            tags.push(tagObj);
        return tags;
    }, []);
}




/***/ }),
/* 55 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nullTag: () => (/* binding */ nullTag)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);


const nullTag = {
    identify: value => value == null,
    createNode: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(null),
    default: true,
    tag: 'tag:yaml.org,2002:null',
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === 'string' && nullTag.test.test(source)
        ? source
        : ctx.options.nullStr
};




/***/ }),
/* 56 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   boolTag: () => (/* binding */ boolTag)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);


const boolTag = {
    identify: value => typeof value === 'boolean',
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: str => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(str[0] === 't' || str[0] === 'T'),
    stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
            const sv = source[0] === 't' || source[0] === 'T';
            if (value === sv)
                return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
};




/***/ }),
/* 57 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   float: () => (/* binding */ float),
/* harmony export */   floatExp: () => (/* binding */ floatExp),
/* harmony export */   floatNaN: () => (/* binding */ floatNaN)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(58);



const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: str => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: str => parseFloat(str),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber)(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
        const node = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(parseFloat(str));
        const dot = str.indexOf('.');
        if (dot !== -1 && str[str.length - 1] === '0')
            node.minFractionDigits = str.length - dot - 1;
        return node;
    },
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};




/***/ }),
/* 58 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyNumber: () => (/* binding */ stringifyNumber)
/* harmony export */ });
function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === 'bigint')
        return String(value);
    const num = typeof value === 'number' ? value : Number(value);
    if (!isFinite(num))
        return isNaN(num) ? '.nan' : num < 0 ? '-.inf' : '.inf';
    let n = JSON.stringify(value);
    if (!format &&
        minFractionDigits &&
        (!tag || tag === 'tag:yaml.org,2002:float') &&
        /^\d/.test(n)) {
        let i = n.indexOf('.');
        if (i < 0) {
            i = n.length;
            n += '.';
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
            n += '0';
    }
    return n;
}




/***/ }),
/* 59 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   int: () => (/* binding */ int),
/* harmony export */   intHex: () => (/* binding */ intHex),
/* harmony export */   intOct: () => (/* binding */ intOct)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);


const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
const intResolve = (str, offset, radix, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix));
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
    return (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber)(node);
}
const intOct = {
    identify: value => intIdentify(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: node => intStringify(node, 8, '0o')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber
};
const intHex = {
    identify: value => intIdentify(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};




/***/ }),
/* 60 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schema: () => (/* binding */ schema)
/* harmony export */ });
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48);
/* harmony import */ var _common_null_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(55);
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(53);
/* harmony import */ var _bool_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(56);
/* harmony import */ var _float_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(57);
/* harmony import */ var _int_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(59);








const schema = [
    _common_map_js__WEBPACK_IMPORTED_MODULE_0__.map,
    _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq,
    _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string,
    _common_null_js__WEBPACK_IMPORTED_MODULE_1__.nullTag,
    _bool_js__WEBPACK_IMPORTED_MODULE_4__.boolTag,
    _int_js__WEBPACK_IMPORTED_MODULE_6__.intOct,
    _int_js__WEBPACK_IMPORTED_MODULE_6__.int,
    _int_js__WEBPACK_IMPORTED_MODULE_6__.intHex,
    _float_js__WEBPACK_IMPORTED_MODULE_5__.floatNaN,
    _float_js__WEBPACK_IMPORTED_MODULE_5__.floatExp,
    _float_js__WEBPACK_IMPORTED_MODULE_5__.float
];




/***/ }),
/* 61 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schema: () => (/* binding */ schema)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(48);
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);




function intIdentify(value) {
    return typeof value === 'bigint' || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
    {
        identify: value => typeof value === 'string',
        default: true,
        tag: 'tag:yaml.org,2002:str',
        resolve: str => str,
        stringify: stringifyJSON
    },
    {
        identify: value => value == null,
        createNode: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(null),
        default: true,
        tag: 'tag:yaml.org,2002:null',
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
    },
    {
        identify: value => typeof value === 'boolean',
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^true|false$/,
        resolve: str => str === 'true',
        stringify: stringifyJSON
    },
    {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: str => parseFloat(str),
        stringify: stringifyJSON
    }
];
const jsonError = {
    default: true,
    tag: '',
    test: /^/,
    resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
    }
};
const schema = [_common_map_js__WEBPACK_IMPORTED_MODULE_1__.map, _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq].concat(jsonScalars, jsonError);




/***/ }),
/* 62 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   binary: () => (/* binding */ binary)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
/* harmony import */ var _stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(42);



const binary = {
    identify: value => value instanceof Uint8Array, // Buffer inherits from Uint8Array
    default: false,
    tag: 'tag:yaml.org,2002:binary',
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(src, onError) {
        if (typeof Buffer === 'function') {
            return Buffer.from(src, 'base64');
        }
        else if (typeof atob === 'function') {
            // On IE 11, atob() can't handle newlines
            const str = atob(src.replace(/[\n\r]/g, ''));
            const buffer = new Uint8Array(str.length);
            for (let i = 0; i < str.length; ++i)
                buffer[i] = str.charCodeAt(i);
            return buffer;
        }
        else {
            onError('This environment does not support reading binary tags; either Buffer or atob is required');
            return src;
        }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        const buf = value; // checked earlier by binary.identify()
        let str;
        if (typeof Buffer === 'function') {
            str =
                buf instanceof Buffer
                    ? buf.toString('base64')
                    : Buffer.from(buf.buffer).toString('base64');
        }
        else if (typeof btoa === 'function') {
            let s = '';
            for (let i = 0; i < buf.length; ++i)
                s += String.fromCharCode(buf[i]);
            str = btoa(s);
        }
        else {
            throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
        }
        if (!type)
            type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL;
        if (type !== _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE) {
            const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
            const n = Math.ceil(str.length / lineWidth);
            const lines = new Array(n);
            for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
                lines[i] = str.substr(o, lineWidth);
            }
            str = lines.join(type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL ? '\n' : ' ');
        }
        return (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_1__.stringifyString)({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
};




/***/ }),
/* 63 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLOMap: () => (/* binding */ YAMLOMap),
/* harmony export */   omap: () => (/* binding */ omap)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49);
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(52);
/* harmony import */ var _pairs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(64);






class YAMLOMap extends _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq {
    constructor() {
        super();
        this.add = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.add.bind(this);
        this.delete = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.delete.bind(this);
        this.get = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.get.bind(this);
        this.has = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.has.bind(this);
        this.set = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.set.bind(this);
        this.tag = YAMLOMap.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(_, ctx) {
        if (!ctx)
            return super.toJSON(_);
        const map = new Map();
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const pair of this.items) {
            let key, value;
            if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(pair)) {
                key = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__.toJS)(pair.key, '', ctx);
                value = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__.toJS)(pair.value, key, ctx);
            }
            else {
                key = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__.toJS)(pair, '', ctx);
            }
            if (map.has(key))
                throw new Error('Ordered maps must not include duplicate keys');
            map.set(key, value);
        }
        return map;
    }
    static from(schema, iterable, ctx) {
        const pairs = (0,_pairs_js__WEBPACK_IMPORTED_MODULE_4__.createPairs)(schema, iterable, ctx);
        const omap = new this();
        omap.items = pairs.items;
        return omap;
    }
}
YAMLOMap.tag = 'tag:yaml.org,2002:omap';
const omap = {
    collection: 'seq',
    identify: value => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: 'tag:yaml.org,2002:omap',
    resolve(seq, onError) {
        const pairs = (0,_pairs_js__WEBPACK_IMPORTED_MODULE_4__.resolvePairs)(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs.items) {
            if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(key)) {
                if (seenKeys.includes(key.value)) {
                    onError(`Ordered maps must not include duplicate keys: ${key.value}`);
                }
                else {
                    seenKeys.push(key.value);
                }
            }
        }
        return Object.assign(new YAMLOMap(), pairs);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
};




/***/ }),
/* 64 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createPairs: () => (/* binding */ createPairs),
/* harmony export */   pairs: () => (/* binding */ pairs),
/* harmony export */   resolvePairs: () => (/* binding */ resolvePairs)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(38);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(37);
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(52);





function resolvePairs(seq, onError) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
            let item = seq.items[i];
            if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item))
                continue;
            else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(item)) {
                if (item.items.length > 1)
                    onError('Each pair must have its own sequence indicator');
                const pair = item.items[0] || new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__.Scalar(null));
                if (item.commentBefore)
                    pair.key.commentBefore = pair.key.commentBefore
                        ? `${item.commentBefore}\n${pair.key.commentBefore}`
                        : item.commentBefore;
                if (item.comment) {
                    const cn = pair.value ?? pair.key;
                    cn.comment = cn.comment
                        ? `${item.comment}\n${cn.comment}`
                        : item.comment;
                }
                item = pair;
            }
            seq.items[i] = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item) ? item : new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(item);
        }
    }
    else
        onError('Expected a sequence for this tag');
    return seq;
}
function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs = new _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq(schema);
    pairs.tag = 'tag:yaml.org,2002:pairs';
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
            if (typeof replacer === 'function')
                it = replacer.call(iterable, String(i++), it);
            let key, value;
            if (Array.isArray(it)) {
                if (it.length === 2) {
                    key = it[0];
                    value = it[1];
                }
                else
                    throw new TypeError(`Expected [key, value] tuple: ${it}`);
            }
            else if (it && it instanceof Object) {
                const keys = Object.keys(it);
                if (keys.length === 1) {
                    key = keys[0];
                    value = it[key];
                }
                else {
                    throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
                }
            }
            else {
                key = it;
            }
            pairs.items.push((0,_nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.createPair)(key, value, ctx));
        }
    return pairs;
}
const pairs = {
    collection: 'seq',
    default: false,
    tag: 'tag:yaml.org,2002:pairs',
    resolve: resolvePairs,
    createNode: createPairs
};




/***/ }),
/* 65 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schema: () => (/* binding */ schema)
/* harmony export */ });
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48);
/* harmony import */ var _common_null_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(55);
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(53);
/* harmony import */ var _binary_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(62);
/* harmony import */ var _bool_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(66);
/* harmony import */ var _float_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(67);
/* harmony import */ var _int_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(68);
/* harmony import */ var _merge_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(46);
/* harmony import */ var _omap_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(63);
/* harmony import */ var _pairs_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(64);
/* harmony import */ var _set_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(69);
/* harmony import */ var _timestamp_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(70);














const schema = [
    _common_map_js__WEBPACK_IMPORTED_MODULE_0__.map,
    _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq,
    _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string,
    _common_null_js__WEBPACK_IMPORTED_MODULE_1__.nullTag,
    _bool_js__WEBPACK_IMPORTED_MODULE_5__.trueTag,
    _bool_js__WEBPACK_IMPORTED_MODULE_5__.falseTag,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.intBin,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.intOct,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.int,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.intHex,
    _float_js__WEBPACK_IMPORTED_MODULE_6__.floatNaN,
    _float_js__WEBPACK_IMPORTED_MODULE_6__.floatExp,
    _float_js__WEBPACK_IMPORTED_MODULE_6__.float,
    _binary_js__WEBPACK_IMPORTED_MODULE_4__.binary,
    _merge_js__WEBPACK_IMPORTED_MODULE_8__.merge,
    _omap_js__WEBPACK_IMPORTED_MODULE_9__.omap,
    _pairs_js__WEBPACK_IMPORTED_MODULE_10__.pairs,
    _set_js__WEBPACK_IMPORTED_MODULE_11__.set,
    _timestamp_js__WEBPACK_IMPORTED_MODULE_12__.intTime,
    _timestamp_js__WEBPACK_IMPORTED_MODULE_12__.floatTime,
    _timestamp_js__WEBPACK_IMPORTED_MODULE_12__.timestamp
];




/***/ }),
/* 66 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   falseTag: () => (/* binding */ falseTag),
/* harmony export */   trueTag: () => (/* binding */ trueTag)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);


function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
        return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
    identify: value => value === true,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(true),
    stringify: boolStringify
};
const falseTag = {
    identify: value => value === false,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(false),
    stringify: boolStringify
};




/***/ }),
/* 67 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   float: () => (/* binding */ float),
/* harmony export */   floatExp: () => (/* binding */ floatExp),
/* harmony export */   floatNaN: () => (/* binding */ floatNaN)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(58);



const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, '')),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber)(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
        const node = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(parseFloat(str.replace(/_/g, '')));
        const dot = str.indexOf('.');
        if (dot !== -1) {
            const f = str.substring(dot + 1).replace(/_/g, '');
            if (f[f.length - 1] === '0')
                node.minFractionDigits = f.length;
        }
        return node;
    },
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};




/***/ }),
/* 68 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   int: () => (/* binding */ int),
/* harmony export */   intBin: () => (/* binding */ intBin),
/* harmony export */   intHex: () => (/* binding */ intHex),
/* harmony export */   intOct: () => (/* binding */ intOct)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);


const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === '-' || sign === '+')
        offset += 1;
    str = str.substring(offset).replace(/_/g, '');
    if (intAsBigInt) {
        switch (radix) {
            case 2:
                str = `0b${str}`;
                break;
            case 8:
                str = `0o${str}`;
                break;
            case 16:
                str = `0x${str}`;
                break;
        }
        const n = BigInt(str);
        return sign === '-' ? BigInt(-1) * n : n;
    }
    const n = parseInt(str, radix);
    return sign === '-' ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? '-' + prefix + str.substr(1) : prefix + str;
    }
    return (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber)(node);
}
const intBin = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'BIN',
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: node => intStringify(node, 2, '0b')
};
const intOct = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: node => intStringify(node, 8, '0')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber
};
const intHex = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};




/***/ }),
/* 69 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLSet: () => (/* binding */ YAMLSet),
/* harmony export */   set: () => (/* binding */ set)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(38);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49);




class YAMLSet extends _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap {
    constructor(schema) {
        super(schema);
        this.tag = YAMLSet.tag;
    }
    add(key) {
        let pair;
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(key))
            pair = key;
        else if (key &&
            typeof key === 'object' &&
            'key' in key &&
            'value' in key &&
            key.value === null)
            pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(key.key, null);
        else
            pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(key, null);
        const prev = (0,_nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.findPair)(this.items, pair.key);
        if (!prev)
            this.items.push(pair);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key, keepPair) {
        const pair = (0,_nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.findPair)(this.items, key);
        return !keepPair && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(pair)
            ? (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(pair.key)
                ? pair.key.value
                : pair.key
            : pair;
    }
    set(key, value) {
        if (typeof value !== 'boolean')
            throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = (0,_nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.findPair)(this.items, key);
        if (prev && !value) {
            this.items.splice(this.items.indexOf(prev), 1);
        }
        else if (!prev && value) {
            this.items.push(new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(key));
        }
    }
    toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        if (this.hasAllNullValues(true))
            return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
            throw new Error('Set items must all have null values');
    }
    static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
            for (let value of iterable) {
                if (typeof replacer === 'function')
                    value = replacer.call(iterable, value, value);
                set.items.push((0,_nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.createPair)(value, null, ctx));
            }
        return set;
    }
}
YAMLSet.tag = 'tag:yaml.org,2002:set';
const set = {
    collection: 'map',
    identify: value => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: 'tag:yaml.org,2002:set',
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(map)) {
            if (map.hasAllNullValues(true))
                return Object.assign(new YAMLSet(), map);
            else
                onError('Set items must all have null values');
        }
        else
            onError('Expected a mapping for this tag');
        return map;
    }
};




/***/ }),
/* 70 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   floatTime: () => (/* binding */ floatTime),
/* harmony export */   intTime: () => (/* binding */ intTime),
/* harmony export */   timestamp: () => (/* binding */ timestamp)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);


/** Internal types handle bigint as number, because TS can't figure it out. */
function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts
        .replace(/_/g, '')
        .split(':')
        .reduce((res, p) => res * num(60) + num(p), num(0));
    return (sign === '-' ? num(-1) * res : res);
}
/**
 * hhhh:mm:ss.sss
 *
 * Internal types handle bigint as number, because TS can't figure it out.
 */
function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === 'bigint')
        num = n => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
        return (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber)(node);
    let sign = '';
    if (value < 0) {
        sign = '-';
        value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60]; // seconds, including ms
    if (value < 60) {
        parts.unshift(0); // at least one : is required
    }
    else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60); // minutes
        if (value >= 60) {
            value = (value - parts[0]) / _60;
            parts.unshift(value); // hours
        }
    }
    return (sign +
        parts
            .map(n => String(n).padStart(2, '0'))
            .join(':')
            .replace(/000000\d*$/, '') // % 60 may introduce error
    );
}
const intTime = {
    identify: value => typeof value === 'bigint' || Number.isInteger(value),
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
};
const floatTime = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: str => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
};
const timestamp = {
    identify: value => value instanceof Date,
    default: true,
    tag: 'tag:yaml.org,2002:timestamp',
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp('^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' + // YYYY-Mm-Dd
        '(?:' + // time is optional
        '(?:t|T|[ \\t]+)' + // t | T | whitespace
        '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' + // Hh:Mm:Ss(.ss)?
        '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' + // Z | +5 | -03:30
        ')?$'),
    resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
            throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd');
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + '00').substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== 'Z') {
            let d = parseSexagesimal(tz, false);
            if (Math.abs(d) < 30)
                d *= 60;
            date -= 60000 * d;
        }
        return new Date(date);
    },
    stringify: ({ value }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, '')
};




/***/ }),
/* 71 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyDocument: () => (/* binding */ stringifyDocument)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(40);
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41);




function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
            lines.push(dir);
            hasDirectives = true;
        }
        else if (doc.directives.docStart)
            hasDirectives = true;
    }
    if (hasDirectives)
        lines.push('---');
    const ctx = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.createStringifyContext)(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
        if (lines.length !== 1)
            lines.unshift('');
        const cs = commentString(doc.commentBefore);
        lines.unshift((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(cs, ''));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(doc.contents)) {
            if (doc.contents.spaceBefore && hasDirectives)
                lines.push('');
            if (doc.contents.commentBefore) {
                const cs = commentString(doc.contents.commentBefore);
                lines.push((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(cs, ''));
            }
            // top-level block scalars need to be indented if followed by a comment
            ctx.forceBlockIndent = !!doc.comment;
            contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? undefined : () => (chompKeep = true);
        let body = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(doc.contents, ctx, () => (contentComment = null), onChompKeep);
        if (contentComment)
            body += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.lineComment)(body, '', commentString(contentComment));
        if ((body[0] === '|' || body[0] === '>') &&
            lines[lines.length - 1] === '---') {
            // Top-level block scalars with a preceding doc marker ought to use the
            // same line for their header.
            lines[lines.length - 1] = `--- ${body}`;
        }
        else
            lines.push(body);
    }
    else {
        lines.push((0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
        if (doc.comment) {
            const cs = commentString(doc.comment);
            if (cs.includes('\n')) {
                lines.push('...');
                lines.push((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(cs, ''));
            }
            else {
                lines.push(`... ${cs}`);
            }
        }
        else {
            lines.push('...');
        }
    }
    else {
        let dc = doc.comment;
        if (dc && chompKeep)
            dc = dc.replace(/^\n+/, '');
        if (dc) {
            if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '')
                lines.push('');
            lines.push((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(commentString(dc), ''));
        }
    }
    return lines.join('\n') + '\n';
}




/***/ }),
/* 72 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLError: () => (/* binding */ YAMLError),
/* harmony export */   YAMLParseError: () => (/* binding */ YAMLParseError),
/* harmony export */   YAMLWarning: () => (/* binding */ YAMLWarning),
/* harmony export */   prettifyError: () => (/* binding */ prettifyError)
/* harmony export */ });
class YAMLError extends Error {
    constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
    }
}
class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLParseError', pos, code, message);
    }
}
class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLWarning', pos, code, message);
    }
}
const prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
        return;
    error.linePos = error.pos.map(pos => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src
        .substring(lc.lineStarts[line - 1], lc.lineStarts[line])
        .replace(/[\n\r]+$/, '');
    // Trim to max 80 chars, keeping col position near the middle
    if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = '…' + lineStr.substring(trimStart);
        ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + '…';
    // Include previous line in context if pointing at line start
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        // Regexp won't match if start is trimmed
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
            prev = prev.substring(0, 79) + '…\n';
        lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end && end.line === line && end.col > col) {
            count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = ' '.repeat(ci) + '^'.repeat(count);
        error.message += `:\n\n${lineStr}\n${pointer}\n`;
    }
};




/***/ }),
/* 73 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeDoc: () => (/* binding */ composeDoc)
/* harmony export */ });
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(29);
/* harmony import */ var _compose_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(74);
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(83);
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(77);





function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new _doc_Document_js__WEBPACK_IMPORTED_MODULE_0__.Document(undefined, opts);
    const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
    };
    const props = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_3__.resolveProps)(start, {
        indicator: 'doc-start',
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
    });
    if (props.found) {
        doc.directives.docStart = true;
        if (value &&
            (value.type === 'block-map' || value.type === 'block-seq') &&
            !props.hasNewline)
            onError(props.end, 'MISSING_CHAR', 'Block collection cannot start on same line with directives-end marker');
    }
    // @ts-expect-error If Contents is set, let's trust the user
    doc.contents = value
        ? (0,_compose_node_js__WEBPACK_IMPORTED_MODULE_1__.composeNode)(ctx, value, props, onError)
        : (0,_compose_node_js__WEBPACK_IMPORTED_MODULE_1__.composeEmptyNode)(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_2__.resolveEnd)(end, contentEnd, false, onError);
    if (re.comment)
        doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
}




/***/ }),
/* 74 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeEmptyNode: () => (/* binding */ composeEmptyNode),
/* harmony export */   composeNode: () => (/* binding */ composeNode)
/* harmony export */ });
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(30);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
/* harmony import */ var _compose_collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(75);
/* harmony import */ var _compose_scalar_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(84);
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(83);
/* harmony import */ var _util_empty_scalar_position_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(87);







const CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
        case 'alias':
            node = composeAlias(ctx, token, onError);
            if (anchor || tag)
                onError(token, 'ALIAS_PROPS', 'An alias node must not specify any properties');
            break;
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'block-scalar':
            node = (0,_compose_scalar_js__WEBPACK_IMPORTED_MODULE_3__.composeScalar)(ctx, token, tag, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        case 'block-map':
        case 'block-seq':
        case 'flow-collection':
            node = (0,_compose_collection_js__WEBPACK_IMPORTED_MODULE_2__.composeCollection)(CN, ctx, token, props, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        default: {
            const message = token.type === 'error'
                ? token.message
                : `Unsupported token (type: ${token.type})`;
            onError(token, 'UNEXPECTED_TOKEN', message);
            node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
            isSrcToken = false;
        }
    }
    if (anchor && node.anchor === '')
        onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    if (atKey &&
        ctx.options.stringKeys &&
        (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) ||
            typeof node.value !== 'string' ||
            (node.tag && node.tag !== 'tag:yaml.org,2002:str'))) {
        const msg = 'With stringKeys, all keys must be strings';
        onError(tag ?? token, 'NON_STRING_KEY', msg);
    }
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        if (token.type === 'scalar' && token.source === '')
            node.comment = comment;
        else
            node.commentBefore = comment;
    }
    // @ts-expect-error Type checking misses meaning of isSrcToken
    if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
    return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
        type: 'scalar',
        offset: (0,_util_empty_scalar_position_js__WEBPACK_IMPORTED_MODULE_5__.emptyScalarPosition)(offset, before, pos),
        indent: -1,
        source: ''
    };
    const node = (0,_compose_scalar_js__WEBPACK_IMPORTED_MODULE_3__.composeScalar)(ctx, token, tag, onError);
    if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === '')
            onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    }
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        node.comment = comment;
        node.range[2] = end;
    }
    return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__.Alias(source.substring(1));
    if (alias.source === '')
        onError(offset, 'BAD_ALIAS', 'Alias cannot be an empty string');
    if (alias.source.endsWith(':'))
        onError(offset + source.length - 1, 'BAD_ALIAS', 'Alias ending in : is ambiguous', true);
    const valueEnd = offset + source.length;
    const re = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_4__.resolveEnd)(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
        alias.comment = re.comment;
    return alias;
}




/***/ }),
/* 75 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeCollection: () => (/* binding */ composeCollection)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49);
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(52);
/* harmony import */ var _resolve_block_map_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(76);
/* harmony import */ var _resolve_block_seq_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(81);
/* harmony import */ var _resolve_flow_collection_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(82);








function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === 'block-map'
        ? (0,_resolve_block_map_js__WEBPACK_IMPORTED_MODULE_4__.resolveBlockMap)(CN, ctx, token, onError, tag)
        : token.type === 'block-seq'
            ? (0,_resolve_block_seq_js__WEBPACK_IMPORTED_MODULE_5__.resolveBlockSeq)(CN, ctx, token, onError, tag)
            : (0,_resolve_flow_collection_js__WEBPACK_IMPORTED_MODULE_6__.resolveFlowCollection)(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    // If we got a tagName matching the class, or the tag name is '!',
    // then use the tagName from the node class used to create it.
    if (tagName === '!' || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
    }
    if (tagName)
        coll.tag = tagName;
    return coll;
}
function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken
        ? null
        : ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
    if (token.type === 'block-seq') {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken
            ? anchor.offset > tagToken.offset
                ? anchor
                : tagToken
            : (anchor ?? tagToken);
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
            const message = 'Missing newline after block sequence props';
            onError(lastProp, 'MISSING_CHAR', message);
        }
    }
    const expType = token.type === 'block-map'
        ? 'map'
        : token.type === 'block-seq'
            ? 'seq'
            : token.start.source === '{'
                ? 'map'
                : 'seq';
    // shortcut: check if it's a generic YAMLMap or YAMLSeq
    // before jumping into the custom tag logic.
    if (!tagToken ||
        !tagName ||
        tagName === '!' ||
        (tagName === _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.tagName && expType === 'map') ||
        (tagName === _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq.tagName && expType === 'seq')) {
        return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find(t => t.tag === tagName && t.collection === expType);
    if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt && kt.collection === expType) {
            ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
            tag = kt;
        }
        else {
            if (kt?.collection) {
                onError(tagToken, 'BAD_COLLECTION_TYPE', `${kt.tag} used for ${expType} collection, but expects ${kt.collection}`, true);
            }
            else {
                onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, true);
            }
            return resolveCollection(CN, ctx, token, onError, tagName);
        }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg), ctx.options) ?? coll;
    const node = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(res)
        ? res
        : new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
        node.format = tag.format;
    return node;
}




/***/ }),
/* 76 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveBlockMap: () => (/* binding */ resolveBlockMap)
/* harmony export */ });
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(38);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49);
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77);
/* harmony import */ var _util_contains_newline_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(78);
/* harmony import */ var _util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(79);
/* harmony import */ var _util_map_includes_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(80);







const startColMsg = 'All mapping items must start at the same column';
function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        // key properties
        const keyProps = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_2__.resolveProps)(start, {
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            parentIndent: bm.indent,
            startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
            if (key) {
                if (key.type === 'block-seq')
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'A block sequence may not be used as an implicit map key');
                else if ('indent' in key && key.indent !== bm.indent)
                    onError(offset, 'BAD_INDENT', startColMsg);
            }
            if (!keyProps.anchor && !keyProps.tag && !sep) {
                commentEnd = keyProps.end;
                if (keyProps.comment) {
                    if (map.comment)
                        map.comment += '\n' + keyProps.comment;
                    else
                        map.comment = keyProps.comment;
                }
                continue;
            }
            if (keyProps.newlineAfterProp || (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_3__.containsNewline)(key)) {
                onError(key ?? start[start.length - 1], 'MULTILINE_IMPLICIT_KEY', 'Implicit keys need to be on a single line');
            }
        }
        else if (keyProps.found?.indent !== bm.indent) {
            onError(offset, 'BAD_INDENT', startColMsg);
        }
        // key value
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key
            ? composeNode(ctx, key, keyProps, onError)
            : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
            (0,_util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_4__.flowIndentCheck)(bm.indent, key, onError);
        ctx.atKey = false;
        if ((0,_util_map_includes_js__WEBPACK_IMPORTED_MODULE_5__.mapIncludes)(ctx, map.items, keyNode))
            onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
        // value properties
        const valueProps = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_2__.resolveProps)(sep ?? [], {
            indicator: 'map-value-ind',
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: bm.indent,
            startOnNewline: !key || key.type === 'block-scalar'
        });
        offset = valueProps.end;
        if (valueProps.found) {
            if (implicitKey) {
                if (value?.type === 'block-map' && !valueProps.hasNewline)
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'Nested mappings are not allowed in compact mappings');
                if (ctx.options.strict &&
                    keyProps.start < valueProps.found.offset - 1024)
                    onError(keyNode.range, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit block mapping key');
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
            if (ctx.schema.compat)
                (0,_util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_4__.flowIndentCheck)(bm.indent, value, onError);
            offset = valueNode.range[2];
            const pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_0__.Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
        else {
            // key with no value
            if (implicitKey)
                onError(keyNode.range, 'MISSING_CHAR', 'Implicit map keys need to be followed by map values');
            if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_0__.Pair(keyNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
    }
    if (commentEnd && commentEnd < offset)
        onError(commentEnd, 'IMPOSSIBLE', 'Map comment with trailing content');
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
}




/***/ }),
/* 77 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveProps: () => (/* binding */ resolveProps)
/* harmony export */ });
function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = '';
    let commentSep = '';
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
        if (reqSpace) {
            if (token.type !== 'space' &&
                token.type !== 'newline' &&
                token.type !== 'comma')
                onError(token.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
            reqSpace = false;
        }
        if (tab) {
            if (atNewline && token.type !== 'comment' && token.type !== 'newline') {
                onError(tab, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
            }
            tab = null;
        }
        switch (token.type) {
            case 'space':
                // At the doc level, tabs at line start may be parsed
                // as leading white space rather than indentation.
                // In a flow collection, only the parser handles indent.
                if (!flow &&
                    (indicator !== 'doc-start' || next?.type !== 'flow-collection') &&
                    token.source.includes('\t')) {
                    tab = token;
                }
                hasSpace = true;
                break;
            case 'comment': {
                if (!hasSpace)
                    onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                const cb = token.source.substring(1) || ' ';
                if (!comment)
                    comment = cb;
                else
                    comment += commentSep + cb;
                commentSep = '';
                atNewline = false;
                break;
            }
            case 'newline':
                if (atNewline) {
                    if (comment)
                        comment += token.source;
                    else
                        spaceBefore = true;
                }
                else
                    commentSep += token.source;
                atNewline = true;
                hasNewline = true;
                if (anchor || tag)
                    newlineAfterProp = token;
                hasSpace = true;
                break;
            case 'anchor':
                if (anchor)
                    onError(token, 'MULTIPLE_ANCHORS', 'A node can have at most one anchor');
                if (token.source.endsWith(':'))
                    onError(token.offset + token.source.length - 1, 'BAD_ALIAS', 'Anchor ending in : is ambiguous', true);
                anchor = token;
                if (start === null)
                    start = token.offset;
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            case 'tag': {
                if (tag)
                    onError(token, 'MULTIPLE_TAGS', 'A node can have at most one tag');
                tag = token;
                if (start === null)
                    start = token.offset;
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            }
            case indicator:
                // Could here handle preceding comments differently
                if (anchor || tag)
                    onError(token, 'BAD_PROP_ORDER', `Anchors and tags must be after the ${token.source} indicator`);
                if (found)
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.source} in ${flow ?? 'collection'}`);
                found = token;
                atNewline =
                    indicator === 'seq-item-ind' || indicator === 'explicit-key-ind';
                hasSpace = false;
                break;
            case 'comma':
                if (flow) {
                    if (comma)
                        onError(token, 'UNEXPECTED_TOKEN', `Unexpected , in ${flow}`);
                    comma = token;
                    atNewline = false;
                    hasSpace = false;
                    break;
                }
            // else fallthrough
            default:
                onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.type} token`);
                atNewline = false;
                hasSpace = false;
        }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace &&
        next &&
        next.type !== 'space' &&
        next.type !== 'newline' &&
        next.type !== 'comma' &&
        (next.type !== 'scalar' || next.source !== '')) {
        onError(next.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
    }
    if (tab &&
        ((atNewline && tab.indent <= parentIndent) ||
            next?.type === 'block-map' ||
            next?.type === 'block-seq'))
        onError(tab, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
    return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
    };
}




/***/ }),
/* 78 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containsNewline: () => (/* binding */ containsNewline)
/* harmony export */ });
function containsNewline(key) {
    if (!key)
        return null;
    switch (key.type) {
        case 'alias':
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            if (key.source.includes('\n'))
                return true;
            if (key.end)
                for (const st of key.end)
                    if (st.type === 'newline')
                        return true;
            return false;
        case 'flow-collection':
            for (const it of key.items) {
                for (const st of it.start)
                    if (st.type === 'newline')
                        return true;
                if (it.sep)
                    for (const st of it.sep)
                        if (st.type === 'newline')
                            return true;
                if (containsNewline(it.key) || containsNewline(it.value))
                    return true;
            }
            return false;
        default:
            return true;
    }
}




/***/ }),
/* 79 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   flowIndentCheck: () => (/* binding */ flowIndentCheck)
/* harmony export */ });
/* harmony import */ var _util_contains_newline_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(78);


function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === 'flow-collection') {
        const end = fc.end[0];
        if (end.indent === indent &&
            (end.source === ']' || end.source === '}') &&
            (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_0__.containsNewline)(fc)) {
            const msg = 'Flow end indicator should be more indented than parent';
            onError(end, 'BAD_INDENT', msg, true);
        }
    }
}




/***/ }),
/* 80 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapIncludes: () => (/* binding */ mapIncludes)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);


function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
        return false;
    const isEqual = typeof uniqueKeys === 'function'
        ? uniqueKeys
        : (a, b) => a === b || ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(a) && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(b) && a.value === b.value);
    return items.some(pair => isEqual(pair.key, search));
}




/***/ }),
/* 81 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveBlockSeq: () => (/* binding */ resolveBlockSeq)
/* harmony export */ });
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(52);
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(77);
/* harmony import */ var _util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(79);




function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_0__.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    if (ctx.atKey)
        ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
        const props = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_1__.resolveProps)(start, {
            indicator: 'seq-item-ind',
            next: value,
            offset,
            onError,
            parentIndent: bs.indent,
            startOnNewline: true
        });
        if (!props.found) {
            if (props.anchor || props.tag || value) {
                if (value && value.type === 'block-seq')
                    onError(props.end, 'BAD_INDENT', 'All sequence items must start at the same column');
                else
                    onError(offset, 'MISSING_CHAR', 'Sequence item without - indicator');
            }
            else {
                commentEnd = props.end;
                if (props.comment)
                    seq.comment = props.comment;
                continue;
            }
        }
        const node = value
            ? composeNode(ctx, value, props, onError)
            : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
            (0,_util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_2__.flowIndentCheck)(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
}




/***/ }),
/* 82 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveFlowCollection: () => (/* binding */ resolveFlowCollection)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(38);
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49);
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(52);
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(83);
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(77);
/* harmony import */ var _util_contains_newline_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(78);
/* harmony import */ var _util_map_includes_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(80);









const blockMsg = 'Block collections are not allowed within flow collections';
const isBlock = (token) => token && (token.type === 'block-map' || token.type === 'block-seq');
function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === '{';
    const fcName = isMap ? 'flow map' : 'flow sequence';
    const NodeClass = (tag?.nodeClass ?? (isMap ? _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap : _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq));
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
        ctx.atRoot = false;
    if (ctx.atKey)
        ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_5__.resolveProps)(start, {
            flow: fcName,
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
        });
        if (!props.found) {
            if (!props.anchor && !props.tag && !sep && !value) {
                if (i === 0 && props.comma)
                    onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
                else if (i < fc.items.length - 1)
                    onError(props.start, 'UNEXPECTED_TOKEN', `Unexpected empty item in ${fcName}`);
                if (props.comment) {
                    if (coll.comment)
                        coll.comment += '\n' + props.comment;
                    else
                        coll.comment = props.comment;
                }
                offset = props.end;
                continue;
            }
            if (!isMap && ctx.options.strict && (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_6__.containsNewline)(key))
                onError(key, // checked by containsNewline()
                'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
        }
        if (i === 0) {
            if (props.comma)
                onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
        }
        else {
            if (!props.comma)
                onError(props.start, 'MISSING_CHAR', `Missing , between ${fcName} items`);
            if (props.comment) {
                let prevItemComment = '';
                loop: for (const st of start) {
                    switch (st.type) {
                        case 'comma':
                        case 'space':
                            break;
                        case 'comment':
                            prevItemComment = st.source.substring(1);
                            break loop;
                        default:
                            break loop;
                    }
                }
                if (prevItemComment) {
                    let prev = coll.items[coll.items.length - 1];
                    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(prev))
                        prev = prev.value ?? prev.key;
                    if (prev.comment)
                        prev.comment += '\n' + prevItemComment;
                    else
                        prev.comment = prevItemComment;
                    props.comment = props.comment.substring(prevItemComment.length + 1);
                }
            }
        }
        if (!isMap && !sep && !props.found) {
            // item is a value in a seq
            // → key & sep are empty, start does not include ? or :
            const valueNode = value
                ? composeNode(ctx, value, props, onError)
                : composeEmptyNode(ctx, props.end, sep, null, props, onError);
            coll.items.push(valueNode);
            offset = valueNode.range[2];
            if (isBlock(value))
                onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
        }
        else {
            // item is a key+value pair
            // key value
            ctx.atKey = true;
            const keyStart = props.end;
            const keyNode = key
                ? composeNode(ctx, key, props, onError)
                : composeEmptyNode(ctx, keyStart, start, null, props, onError);
            if (isBlock(key))
                onError(keyNode.range, 'BLOCK_IN_FLOW', blockMsg);
            ctx.atKey = false;
            // value properties
            const valueProps = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_5__.resolveProps)(sep ?? [], {
                flow: fcName,
                indicator: 'map-value-ind',
                next: value,
                offset: keyNode.range[2],
                onError,
                parentIndent: fc.indent,
                startOnNewline: false
            });
            if (valueProps.found) {
                if (!isMap && !props.found && ctx.options.strict) {
                    if (sep)
                        for (const st of sep) {
                            if (st === valueProps.found)
                                break;
                            if (st.type === 'newline') {
                                onError(st, 'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
                                break;
                            }
                        }
                    if (props.start < valueProps.found.offset - 1024)
                        onError(valueProps.found, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit flow sequence key');
                }
            }
            else if (value) {
                if ('source' in value && value.source && value.source[0] === ':')
                    onError(value, 'MISSING_CHAR', `Missing space after : in ${fcName}`);
                else
                    onError(valueProps.start, 'MISSING_CHAR', `Missing , or : between ${fcName} items`);
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : valueProps.found
                    ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
                    : null;
            if (valueNode) {
                if (isBlock(value))
                    onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
            }
            else if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            if (isMap) {
                const map = coll;
                if ((0,_util_map_includes_js__WEBPACK_IMPORTED_MODULE_7__.mapIncludes)(ctx, map.items, keyNode))
                    onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
                map.items.push(pair);
            }
            else {
                const map = new _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap(ctx.schema);
                map.flow = true;
                map.items.push(pair);
                const endRange = (valueNode ?? keyNode).range;
                map.range = [keyNode.range[0], endRange[1], endRange[2]];
                coll.items.push(map);
            }
            offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
    }
    const expectedEnd = isMap ? '}' : ']';
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce && ce.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
    else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot
            ? `${name} must end with a ${expectedEnd}`
            : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? 'MISSING_CHAR' : 'BAD_INDENT', msg);
        if (ce && ce.source.length !== 1)
            ee.unshift(ce);
    }
    if (ee.length > 0) {
        const end = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_4__.resolveEnd)(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
            if (coll.comment)
                coll.comment += '\n' + end.comment;
            else
                coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
    }
    else {
        coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
}




/***/ }),
/* 83 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveEnd: () => (/* binding */ resolveEnd)
/* harmony export */ });
function resolveEnd(end, offset, reqSpace, onError) {
    let comment = '';
    if (end) {
        let hasSpace = false;
        let sep = '';
        for (const token of end) {
            const { source, type } = token;
            switch (type) {
                case 'space':
                    hasSpace = true;
                    break;
                case 'comment': {
                    if (reqSpace && !hasSpace)
                        onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                    const cb = source.substring(1) || ' ';
                    if (!comment)
                        comment = cb;
                    else
                        comment += sep + cb;
                    sep = '';
                    break;
                }
                case 'newline':
                    if (comment)
                        sep += source;
                    hasSpace = true;
                    break;
                default:
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
            }
            offset += source.length;
        }
    }
    return { comment, offset };
}




/***/ }),
/* 84 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeScalar: () => (/* binding */ composeScalar)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37);
/* harmony import */ var _resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(85);
/* harmony import */ var _resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(86);





function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === 'block-scalar'
        ? (0,_resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_2__.resolveBlockScalar)(ctx, token, onError)
        : (0,_resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_3__.resolveFlowScalar)(token, ctx.options.strict, onError);
    const tagName = tagToken
        ? ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg))
        : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
    }
    else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === 'scalar')
        tag = findScalarTagByTest(ctx, value, token, onError);
    else
        tag = ctx.schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
    let scalar;
    try {
        const res = tag.resolve(value, msg => onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg), ctx.options);
        scalar = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(res) ? res : new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(res);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg);
        scalar = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
        scalar.type = type;
    if (tagName)
        scalar.tag = tagName;
    if (tag.format)
        scalar.format = tag.format;
    if (comment)
        scalar.comment = comment;
    return scalar;
}
function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === '!')
        return schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR]; // non-specific tag
    const matchWithTest = [];
    for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
            if (tag.default && tag.test)
                matchWithTest.push(tag);
            else
                return tag;
        }
    }
    for (const tag of matchWithTest)
        if (tag.test?.test(value))
            return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
        // Ensure that the known tag is available for stringifying,
        // but does not get used by default.
        schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
        return kt;
    }
    onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, tagName !== 'tag:yaml.org,2002:str');
    return schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
}
function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
    const tag = schema.tags.find(tag => (tag.default === true || (atKey && tag.default === 'key')) &&
        tag.test?.test(value)) || schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
    if (schema.compat) {
        const compat = schema.compat.find(tag => tag.default && tag.test?.test(value)) ??
            schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
        if (tag.tag !== compat.tag) {
            const ts = directives.tagString(tag.tag);
            const cs = directives.tagString(compat.tag);
            const msg = `Value may be parsed as either ${ts} or ${cs}`;
            onError(token, 'TAG_RESOLVE_FAILED', msg, true);
        }
    }
    return tag;
}




/***/ }),
/* 85 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveBlockScalar: () => (/* binding */ resolveBlockScalar)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);


function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
        return { value: '', type: null, comment: '', range: [start, start, start] };
    const type = header.mode === '>' ? _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_FOLDED : _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    // determine the end of content & start of chomping
    let chompStart = lines.length;
    for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === '' || content === '\r')
            chompStart = i;
        else
            break;
    }
    // shortcut for empty contents
    if (chompStart === 0) {
        const value = header.chomp === '+' && lines.length > 0
            ? '\n'.repeat(Math.max(1, lines.length - 1))
            : '';
        let end = start + header.length;
        if (scalar.source)
            end += scalar.source.length;
        return { value, type, comment: header.comment, range: [start, end, end] };
    }
    // find the indentation level to trim from start
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === '' || content === '\r') {
            if (header.indent === 0 && indent.length > trimIndent)
                trimIndent = indent.length;
        }
        else {
            if (indent.length < trimIndent) {
                const message = 'Block scalars with more-indented leading empty lines must use an explicit indentation indicator';
                onError(offset + indent.length, 'MISSING_CHAR', message);
            }
            if (header.indent === 0)
                trimIndent = indent.length;
            contentStart = i;
            if (trimIndent === 0 && !ctx.atRoot) {
                const message = 'Block scalar values in collections must be indented';
                onError(offset, 'BAD_INDENT', message);
            }
            break;
        }
        offset += indent.length + content.length + 1;
    }
    // include trailing more-indented empty lines in content
    for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
            chompStart = i + 1;
    }
    let value = '';
    let sep = '';
    let prevMoreIndented = false;
    // leading whitespace is kept intact
    for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + '\n';
    for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === '\r';
        if (crlf)
            content = content.slice(0, -1);
        /* istanbul ignore if already caught in lexer */
        if (content && indent.length < trimIndent) {
            const src = header.indent
                ? 'explicit indentation indicator'
                : 'first line';
            const message = `Block scalar lines must not be less indented than their ${src}`;
            onError(offset - content.length - (crlf ? 2 : 1), 'BAD_INDENT', message);
            indent = '';
        }
        if (type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL) {
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
        }
        else if (indent.length > trimIndent || content[0] === '\t') {
            // more-indented content within a folded block
            if (sep === ' ')
                sep = '\n';
            else if (!prevMoreIndented && sep === '\n')
                sep = '\n\n';
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
            prevMoreIndented = true;
        }
        else if (content === '') {
            // empty line
            if (sep === '\n')
                value += '\n';
            else
                sep = '\n';
        }
        else {
            value += sep + content;
            sep = ' ';
            prevMoreIndented = false;
        }
    }
    switch (header.chomp) {
        case '-':
            break;
        case '+':
            for (let i = chompStart; i < lines.length; ++i)
                value += '\n' + lines[i][0].slice(trimIndent);
            if (value[value.length - 1] !== '\n')
                value += '\n';
            break;
        default:
            value += '\n';
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
    /* istanbul ignore if should not happen */
    if (props[0].type !== 'block-scalar-header') {
        onError(props[0], 'IMPOSSIBLE', 'Block scalar header not found');
        return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = '';
    let error = -1;
    for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === '-' || ch === '+'))
            chomp = ch;
        else {
            const n = Number(ch);
            if (!indent && n)
                indent = n;
            else if (error === -1)
                error = offset + i;
        }
    }
    if (error !== -1)
        onError(error, 'UNEXPECTED_TOKEN', `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = '';
    let length = source.length;
    for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
            case 'space':
                hasSpace = true;
            // fallthrough
            case 'newline':
                length += token.source.length;
                break;
            case 'comment':
                if (strict && !hasSpace) {
                    const message = 'Comments must be separated from other tokens by white space characters';
                    onError(token, 'MISSING_CHAR', message);
                }
                length += token.source.length;
                comment = token.source.substring(1);
                break;
            case 'error':
                onError(token, 'UNEXPECTED_TOKEN', token.message);
                length += token.source.length;
                break;
            /* istanbul ignore next should not happen */
            default: {
                const message = `Unexpected token in block scalar header: ${token.type}`;
                onError(token, 'UNEXPECTED_TOKEN', message);
                const ts = token.source;
                if (ts && typeof ts === 'string')
                    length += ts.length;
            }
        }
    }
    return { mode, indent, chomp, comment, length };
}
/** @returns Array of lines split up as `[indent, content]` */
function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1]
        ? [m[1], first.slice(m[1].length)]
        : ['', first];
    const lines = [line0];
    for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
    return lines;
}




/***/ }),
/* 86 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveFlowScalar: () => (/* binding */ resolveFlowScalar)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(83);



function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
        case 'scalar':
            _type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.PLAIN;
            value = plainValue(source, _onError);
            break;
        case 'single-quoted-scalar':
            _type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_SINGLE;
            value = singleQuotedValue(source, _onError);
            break;
        case 'double-quoted-scalar':
            _type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE;
            value = doubleQuotedValue(source, _onError);
            break;
        /* istanbul ignore next should not happen */
        default:
            onError(scalar, 'UNEXPECTED_TOKEN', `Expected a flow scalar value, but found: ${type}`);
            return {
                value: '',
                type: null,
                comment: '',
                range: [offset, offset + source.length, offset + source.length]
            };
    }
    const valueEnd = offset + source.length;
    const re = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_1__.resolveEnd)(end, valueEnd, strict, onError);
    return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
    };
}
function plainValue(source, onError) {
    let badChar = '';
    switch (source[0]) {
        /* istanbul ignore next should not happen */
        case '\t':
            badChar = 'a tab character';
            break;
        case ',':
            badChar = 'flow indicator character ,';
            break;
        case '%':
            badChar = 'directive indicator character %';
            break;
        case '|':
        case '>': {
            badChar = `block scalar indicator ${source[0]}`;
            break;
        }
        case '@':
        case '`': {
            badChar = `reserved character ${source[0]}`;
            break;
        }
    }
    if (badChar)
        onError(0, 'BAD_SCALAR_START', `Plain value cannot start with ${badChar}`);
    return foldLines(source);
}
function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, 'MISSING_CHAR', "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
    /**
     * The negative lookbehind here and in the `re` RegExp is to
     * prevent causing a polynomial search time in certain cases.
     *
     * The try-catch is for Safari, which doesn't support this yet:
     * https://caniuse.com/js-regexp-lookbehind
     */
    let first, line;
    try {
        first = new RegExp('(.*?)(?<![ \t])[ \t]*\r?\n', 'sy');
        line = new RegExp('[ \t]*(.*?)(?:(?<![ \t])[ \t]*)?\r?\n', 'sy');
    }
    catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
        return source;
    let res = match[1];
    let sep = ' ';
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while ((match = line.exec(source))) {
        if (match[1] === '') {
            if (sep === '\n')
                res += sep;
            else
                sep = '\n';
        }
        else {
            res += sep + match[1];
            sep = ' ';
        }
        pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? '');
}
function doubleQuotedValue(source, onError) {
    let res = '';
    for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === '\r' && source[i + 1] === '\n')
            continue;
        if (ch === '\n') {
            const { fold, offset } = foldNewline(source, i);
            res += fold;
            i = offset;
        }
        else if (ch === '\\') {
            let next = source[++i];
            const cc = escapeCodes[next];
            if (cc)
                res += cc;
            else if (next === '\n') {
                // skip escaped newlines, but still trim the following line
                next = source[i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === '\r' && source[i + 1] === '\n') {
                // skip escaped CRLF newlines, but still trim the following line
                next = source[++i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === 'x' || next === 'u' || next === 'U') {
                const length = { x: 2, u: 4, U: 8 }[next];
                res += parseCharCode(source, i + 1, length, onError);
                i += length;
            }
            else {
                const raw = source.substr(i - 1, 2);
                onError(i - 1, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
                res += raw;
            }
        }
        else if (ch === ' ' || ch === '\t') {
            // trim trailing whitespace
            const wsStart = i;
            let next = source[i + 1];
            while (next === ' ' || next === '\t')
                next = source[++i + 1];
            if (next !== '\n' && !(next === '\r' && source[i + 2] === '\n'))
                res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        }
        else {
            res += ch;
        }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, 'MISSING_CHAR', 'Missing closing "quote');
    return res;
}
/**
 * Fold a single newline into a space, multiple newlines to N - 1 newlines.
 * Presumes `source[offset] === '\n'`
 */
function foldNewline(source, offset) {
    let fold = '';
    let ch = source[offset + 1];
    while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        if (ch === '\r' && source[offset + 2] !== '\n')
            break;
        if (ch === '\n')
            fold += '\n';
        offset += 1;
        ch = source[offset + 1];
    }
    if (!fold)
        fold = ' ';
    return { fold, offset };
}
const escapeCodes = {
    '0': '\0', // null character
    a: '\x07', // bell character
    b: '\b', // backspace
    e: '\x1b', // escape character
    f: '\f', // form feed
    n: '\n', // line feed
    r: '\r', // carriage return
    t: '\t', // horizontal tab
    v: '\v', // vertical tab
    N: '\u0085', // Unicode next line
    _: '\u00a0', // Unicode non-breaking space
    L: '\u2028', // Unicode line separator
    P: '\u2029', // Unicode paragraph separator
    ' ': ' ',
    '"': '"',
    '/': '/',
    '\\': '\\',
    '\t': '\t'
};
function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    if (isNaN(code)) {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
        return raw;
    }
    return String.fromCodePoint(code);
}




/***/ }),
/* 87 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   emptyScalarPosition: () => (/* binding */ emptyScalarPosition)
/* harmony export */ });
function emptyScalarPosition(offset, before, pos) {
    if (before) {
        if (pos === null)
            pos = before.length;
        for (let i = pos - 1; i >= 0; --i) {
            let st = before[i];
            switch (st.type) {
                case 'space':
                case 'comment':
                case 'newline':
                    offset -= st.source.length;
                    continue;
            }
            // Technically, an empty scalar is immediately after the last non-empty
            // node, but it's more useful to place it after any whitespace.
            st = before[++i];
            while (st?.type === 'space') {
                offset += st.source.length;
                st = before[++i];
            }
            break;
        }
    }
    return offset;
}




/***/ }),
/* 88 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BOM: () => (/* binding */ BOM),
/* harmony export */   DOCUMENT: () => (/* binding */ DOCUMENT),
/* harmony export */   FLOW_END: () => (/* binding */ FLOW_END),
/* harmony export */   SCALAR: () => (/* binding */ SCALAR),
/* harmony export */   createScalarToken: () => (/* reexport safe */ _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__.createScalarToken),
/* harmony export */   isCollection: () => (/* binding */ isCollection),
/* harmony export */   isScalar: () => (/* binding */ isScalar),
/* harmony export */   prettyToken: () => (/* binding */ prettyToken),
/* harmony export */   resolveAsScalar: () => (/* reexport safe */ _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__.resolveAsScalar),
/* harmony export */   setScalarValue: () => (/* reexport safe */ _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__.setScalarValue),
/* harmony export */   stringify: () => (/* reexport safe */ _cst_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify),
/* harmony export */   tokenType: () => (/* binding */ tokenType),
/* harmony export */   visit: () => (/* reexport safe */ _cst_visit_js__WEBPACK_IMPORTED_MODULE_2__.visit)
/* harmony export */ });
/* harmony import */ var _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(89);
/* harmony import */ var _cst_stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(90);
/* harmony import */ var _cst_visit_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(91);




/** The byte order mark */
const BOM = '\u{FEFF}';
/** Start of doc-mode */
const DOCUMENT = '\x02'; // C0: Start of Text
/** Unexpected end of flow-mode */
const FLOW_END = '\x18'; // C0: Cancel
/** Next token is a scalar value */
const SCALAR = '\x1f'; // C0: Unit Separator
/** @returns `true` if `token` is a flow or block collection */
const isCollection = (token) => !!token && 'items' in token;
/** @returns `true` if `token` is a flow or block scalar; not an alias */
const isScalar = (token) => !!token &&
    (token.type === 'scalar' ||
        token.type === 'single-quoted-scalar' ||
        token.type === 'double-quoted-scalar' ||
        token.type === 'block-scalar');
/* istanbul ignore next */
/** Get a printable representation of a lexer token */
function prettyToken(token) {
    switch (token) {
        case BOM:
            return '<BOM>';
        case DOCUMENT:
            return '<DOC>';
        case FLOW_END:
            return '<FLOW_END>';
        case SCALAR:
            return '<SCALAR>';
        default:
            return JSON.stringify(token);
    }
}
/** Identify the type of a lexer token. May return `null` for unknown tokens. */
function tokenType(source) {
    switch (source) {
        case BOM:
            return 'byte-order-mark';
        case DOCUMENT:
            return 'doc-mode';
        case FLOW_END:
            return 'flow-error-end';
        case SCALAR:
            return 'scalar';
        case '---':
            return 'doc-start';
        case '...':
            return 'doc-end';
        case '':
        case '\n':
        case '\r\n':
            return 'newline';
        case '-':
            return 'seq-item-ind';
        case '?':
            return 'explicit-key-ind';
        case ':':
            return 'map-value-ind';
        case '{':
            return 'flow-map-start';
        case '}':
            return 'flow-map-end';
        case '[':
            return 'flow-seq-start';
        case ']':
            return 'flow-seq-end';
        case ',':
            return 'comma';
    }
    switch (source[0]) {
        case ' ':
        case '\t':
            return 'space';
        case '#':
            return 'comment';
        case '%':
            return 'directive-line';
        case '*':
            return 'alias';
        case '&':
            return 'anchor';
        case '!':
            return 'tag';
        case "'":
            return 'single-quoted-scalar';
        case '"':
            return 'double-quoted-scalar';
        case '|':
        case '>':
            return 'block-scalar-header';
    }
    return null;
}




/***/ }),
/* 89 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createScalarToken: () => (/* binding */ createScalarToken),
/* harmony export */   resolveAsScalar: () => (/* binding */ resolveAsScalar),
/* harmony export */   setScalarValue: () => (/* binding */ setScalarValue)
/* harmony export */ });
/* harmony import */ var _compose_resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(85);
/* harmony import */ var _compose_resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(86);
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72);
/* harmony import */ var _stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(42);





function resolveAsScalar(token, strict = true, onError) {
    if (token) {
        const _onError = (pos, code, message) => {
            const offset = typeof pos === 'number' ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
            if (onError)
                onError(offset, code, message);
            else
                throw new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return (0,_compose_resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_1__.resolveFlowScalar)(token, strict, _onError);
            case 'block-scalar':
                return (0,_compose_resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_0__.resolveBlockScalar)({ options: { strict } }, token, _onError);
        }
    }
    return null;
}
/**
 * Create a new scalar token with `value`
 *
 * Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
 * as this function does not support any schema operations and won't check for such conflicts.
 *
 * @param value The string representation of the value, which will have its content properly indented.
 * @param context.end Comments and whitespace after the end of the value, or after the block scalar header. If undefined, a newline will be added.
 * @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
 * @param context.indent The indent level of the token.
 * @param context.inFlow Is this scalar within a flow collection? This may affect the resolved type of the token's value.
 * @param context.offset The offset position of the token.
 * @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
 */
function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = 'PLAIN' } = context;
    const source = (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__.stringifyString)({ type, value }, {
        implicitKey,
        indent: indent > 0 ? ' '.repeat(indent) : '',
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
        { type: 'newline', offset: -1, indent, source: '\n' }
    ];
    switch (source[0]) {
        case '|':
        case '>': {
            const he = source.indexOf('\n');
            const head = source.substring(0, he);
            const body = source.substring(he + 1) + '\n';
            const props = [
                { type: 'block-scalar-header', offset, indent, source: head }
            ];
            if (!addEndtoBlockProps(props, end))
                props.push({ type: 'newline', offset: -1, indent, source: '\n' });
            return { type: 'block-scalar', offset, indent, props, source: body };
        }
        case '"':
            return { type: 'double-quoted-scalar', offset, indent, source, end };
        case "'":
            return { type: 'single-quoted-scalar', offset, indent, source, end };
        default:
            return { type: 'scalar', offset, indent, source, end };
    }
}
/**
 * Set the value of `token` to the given string `value`, overwriting any previous contents and type that it may have.
 *
 * Best efforts are made to retain any comments previously associated with the `token`,
 * though all contents within a collection's `items` will be overwritten.
 *
 * Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
 * as this function does not support any schema operations and won't check for such conflicts.
 *
 * @param token Any token. If it does not include an `indent` value, the value will be stringified as if it were an implicit key.
 * @param value The string representation of the value, which will have its content properly indented.
 * @param context.afterKey In most cases, values after a key should have an additional level of indentation.
 * @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
 * @param context.inFlow Being within a flow collection may affect the resolved type of the token's value.
 * @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
 */
function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = 'indent' in token ? token.indent : null;
    if (afterKey && typeof indent === 'number')
        indent += 2;
    if (!type)
        switch (token.type) {
            case 'single-quoted-scalar':
                type = 'QUOTE_SINGLE';
                break;
            case 'double-quoted-scalar':
                type = 'QUOTE_DOUBLE';
                break;
            case 'block-scalar': {
                const header = token.props[0];
                if (header.type !== 'block-scalar-header')
                    throw new Error('Invalid block scalar header');
                type = header.source[0] === '>' ? 'BLOCK_FOLDED' : 'BLOCK_LITERAL';
                break;
            }
            default:
                type = 'PLAIN';
        }
    const source = (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__.stringifyString)({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? ' '.repeat(indent) : '',
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
        case '|':
        case '>':
            setBlockScalarValue(token, source);
            break;
        case '"':
            setFlowScalarValue(token, source, 'double-quoted-scalar');
            break;
        case "'":
            setFlowScalarValue(token, source, 'single-quoted-scalar');
            break;
        default:
            setFlowScalarValue(token, source, 'scalar');
    }
}
function setBlockScalarValue(token, source) {
    const he = source.indexOf('\n');
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + '\n';
    if (token.type === 'block-scalar') {
        const header = token.props[0];
        if (header.type !== 'block-scalar-header')
            throw new Error('Invalid block scalar header');
        header.source = head;
        token.source = body;
    }
    else {
        const { offset } = token;
        const indent = 'indent' in token ? token.indent : -1;
        const props = [
            { type: 'block-scalar-header', offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, 'end' in token ? token.end : undefined))
            props.push({ type: 'newline', offset: -1, indent, source: '\n' });
        for (const key of Object.keys(token))
            if (key !== 'type' && key !== 'offset')
                delete token[key];
        Object.assign(token, { type: 'block-scalar', indent, props, source: body });
    }
}
/** @returns `true` if last token is a newline */
function addEndtoBlockProps(props, end) {
    if (end)
        for (const st of end)
            switch (st.type) {
                case 'space':
                case 'comment':
                    props.push(st);
                    break;
                case 'newline':
                    props.push(st);
                    return true;
            }
    return false;
}
function setFlowScalarValue(token, source, type) {
    switch (token.type) {
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            token.type = type;
            token.source = source;
            break;
        case 'block-scalar': {
            const end = token.props.slice(1);
            let oa = source.length;
            if (token.props[0].type === 'block-scalar-header')
                oa -= token.props[0].source.length;
            for (const tok of end)
                tok.offset += oa;
            delete token.props;
            Object.assign(token, { type, source, end });
            break;
        }
        case 'block-map':
        case 'block-seq': {
            const offset = token.offset + source.length;
            const nl = { type: 'newline', offset, indent: token.indent, source: '\n' };
            delete token.items;
            Object.assign(token, { type, source, end: [nl] });
            break;
        }
        default: {
            const indent = 'indent' in token ? token.indent : -1;
            const end = 'end' in token && Array.isArray(token.end)
                ? token.end.filter(st => st.type === 'space' ||
                    st.type === 'comment' ||
                    st.type === 'newline')
                : [];
            for (const key of Object.keys(token))
                if (key !== 'type' && key !== 'offset')
                    delete token[key];
            Object.assign(token, { type, indent, source, end });
        }
    }
}




/***/ }),
/* 90 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/**
 * Stringify a CST document, token, or collection item
 *
 * Fair warning: This applies no validation whatsoever, and
 * simply concatenates the sources in their logical order.
 */
const stringify = (cst) => 'type' in cst ? stringifyToken(cst) : stringifyItem(cst);
function stringifyToken(token) {
    switch (token.type) {
        case 'block-scalar': {
            let res = '';
            for (const tok of token.props)
                res += stringifyToken(tok);
            return res + token.source;
        }
        case 'block-map':
        case 'block-seq': {
            let res = '';
            for (const item of token.items)
                res += stringifyItem(item);
            return res;
        }
        case 'flow-collection': {
            let res = token.start.source;
            for (const item of token.items)
                res += stringifyItem(item);
            for (const st of token.end)
                res += st.source;
            return res;
        }
        case 'document': {
            let res = stringifyItem(token);
            if (token.end)
                for (const st of token.end)
                    res += st.source;
            return res;
        }
        default: {
            let res = token.source;
            if ('end' in token && token.end)
                for (const st of token.end)
                    res += st.source;
            return res;
        }
    }
}
function stringifyItem({ start, key, sep, value }) {
    let res = '';
    for (const st of start)
        res += st.source;
    if (key)
        res += stringifyToken(key);
    if (sep)
        for (const st of sep)
            res += st.source;
    if (value)
        res += stringifyToken(value);
    return res;
}




/***/ }),
/* 91 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   visit: () => (/* binding */ visit)
/* harmony export */ });
const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove item');
/**
 * Apply a visitor to a CST document or item.
 *
 * Walks through the tree (depth-first) starting from the root, calling a
 * `visitor` function with two arguments when entering each item:
 *   - `item`: The current item, which included the following members:
 *     - `start: SourceToken[]` – Source tokens before the key or value,
 *       possibly including its anchor or tag.
 *     - `key?: Token | null` – Set for pair values. May then be `null`, if
 *       the key before the `:` separator is empty.
 *     - `sep?: SourceToken[]` – Source tokens between the key and the value,
 *       which should include the `:` map value indicator if `value` is set.
 *     - `value?: Token` – The value of a sequence item, or of a map pair.
 *   - `path`: The steps from the root to the current node, as an array of
 *     `['key' | 'value', number]` tuples.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this token, continue with
 *      next sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current item, then continue with the next one
 *   - `number`: Set the index of the next step. This is useful especially if
 *     the index of the current token has changed.
 *   - `function`: Define the next visitor for this item. After the original
 *     visitor is called on item entry, next visitors are called after handling
 *     a non-empty `key` and when exiting the item.
 */
function visit(cst, visitor) {
    if ('type' in cst && cst.type === 'document')
        cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current item */
visit.SKIP = SKIP;
/** Remove the current item */
visit.REMOVE = REMOVE;
/** Find the item at `path` from `cst` as the root */
visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && 'items' in tok) {
            item = tok.items[index];
        }
        else
            return undefined;
    }
    return item;
};
/**
 * Get the immediate parent collection of the item at `path` from `cst` as the root.
 *
 * Throws an error if the collection is not found, which should never happen if the item itself exists.
 */
visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && 'items' in coll)
        return coll;
    throw new Error('Parent collection not found');
};
function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === 'symbol')
        return ctrl;
    for (const field of ['key', 'value']) {
        const token = item[field];
        if (token && 'items' in token) {
            for (let i = 0; i < token.items.length; ++i) {
                const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    token.items.splice(i, 1);
                    i -= 1;
                }
            }
            if (typeof ctrl === 'function' && field === 'key')
                ctrl = ctrl(item, path);
        }
    }
    return typeof ctrl === 'function' ? ctrl(item, path) : ctrl;
}




/***/ }),
/* 92 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Lexer: () => (/* binding */ Lexer)
/* harmony export */ });
/* harmony import */ var _cst_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(88);


/*
START -> stream

stream
  directive -> line-end -> stream
  indent + line-end -> stream
  [else] -> line-start

line-end
  comment -> line-end
  newline -> .
  input-end -> END

line-start
  doc-start -> doc
  doc-end -> stream
  [else] -> indent -> block-start

block-start
  seq-item-start -> block-start
  explicit-key-start -> block-start
  map-value-start -> block-start
  [else] -> doc

doc
  line-end -> line-start
  spaces -> doc
  anchor -> doc
  tag -> doc
  flow-start -> flow -> doc
  flow-end -> error -> doc
  seq-item-start -> error -> doc
  explicit-key-start -> error -> doc
  map-value-start -> doc
  alias -> doc
  quote-start -> quoted-scalar -> doc
  block-scalar-header -> line-end -> block-scalar(min) -> line-start
  [else] -> plain-scalar(false, min) -> doc

flow
  line-end -> flow
  spaces -> flow
  anchor -> flow
  tag -> flow
  flow-start -> flow -> flow
  flow-end -> .
  seq-item-start -> error -> flow
  explicit-key-start -> flow
  map-value-start -> flow
  alias -> flow
  quote-start -> quoted-scalar -> flow
  comma -> flow
  [else] -> plain-scalar(true, 0) -> flow

quoted-scalar
  quote-end -> .
  [else] -> quoted-scalar

block-scalar(min)
  newline + peek(indent < min) -> .
  [else] -> block-scalar(min)

plain-scalar(is-flow, min)
  scalar-end(is-flow) -> .
  peek(newline + (indent < min)) -> .
  [else] -> plain-scalar(min)
*/
function isEmpty(ch) {
    switch (ch) {
        case undefined:
        case ' ':
        case '\n':
        case '\r':
        case '\t':
            return true;
        default:
            return false;
    }
}
const hexDigits = new Set('0123456789ABCDEFabcdef');
const tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
const flowIndicatorChars = new Set(',[]{}');
const invalidAnchorChars = new Set(' ,[]{}\n\r\t');
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
/**
 * Splits an input string into lexical tokens, i.e. smaller strings that are
 * easily identifiable by `tokens.tokenType()`.
 *
 * Lexing starts always in a "stream" context. Incomplete input may be buffered
 * until a complete token can be emitted.
 *
 * In addition to slices of the original input, the following control characters
 * may also be emitted:
 *
 * - `\x02` (Start of Text): A document starts with the next token
 * - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
 * - `\x1f` (Unit Separator): Next token is a scalar value
 * - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
 */
class Lexer {
    constructor() {
        /**
         * Flag indicating whether the end of the current buffer marks the end of
         * all input
         */
        this.atEnd = false;
        /**
         * Explicit indent set in block scalar header, as an offset from the current
         * minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
         * explicitly set.
         */
        this.blockScalarIndent = -1;
        /**
         * Block scalars that include a + (keep) chomping indicator in their header
         * include trailing empty lines, which are otherwise excluded from the
         * scalar's contents.
         */
        this.blockScalarKeep = false;
        /** Current input */
        this.buffer = '';
        /**
         * Flag noting whether the map value indicator : can immediately follow this
         * node within a flow context.
         */
        this.flowKey = false;
        /** Count of surrounding flow collection levels. */
        this.flowLevel = 0;
        /**
         * Minimum level of indentation required for next lines to be parsed as a
         * part of the current scalar value.
         */
        this.indentNext = 0;
        /** Indentation level of the current line. */
        this.indentValue = 0;
        /** Position of the next \n character. */
        this.lineEndPos = null;
        /** Stores the state of the lexer if reaching the end of incpomplete input */
        this.next = null;
        /** A pointer to `buffer`; the current position of the lexer. */
        this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(source, incomplete = false) {
        if (source) {
            if (typeof source !== 'string')
                throw TypeError('source is not a string');
            this.buffer = this.buffer ? this.buffer + source : source;
            this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? 'stream';
        while (next && (incomplete || this.hasChars(1)))
            next = yield* this.parseNext(next);
    }
    atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === ' ' || ch === '\t')
            ch = this.buffer[++i];
        if (!ch || ch === '#' || ch === '\n')
            return true;
        if (ch === '\r')
            return this.buffer[i + 1] === '\n';
        return false;
    }
    charAt(n) {
        return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
            let indent = 0;
            while (ch === ' ')
                ch = this.buffer[++indent + offset];
            if (ch === '\r') {
                const next = this.buffer[indent + offset + 1];
                if (next === '\n' || (!next && !this.atEnd))
                    return offset + indent + 1;
            }
            return ch === '\n' || indent >= this.indentNext || (!ch && !this.atEnd)
                ? offset + indent
                : -1;
        }
        if (ch === '-' || ch === '.') {
            const dt = this.buffer.substr(offset, 3);
            if ((dt === '---' || dt === '...') && isEmpty(this.buffer[offset + 3]))
                return -1;
        }
        return offset;
    }
    getLine() {
        let end = this.lineEndPos;
        if (typeof end !== 'number' || (end !== -1 && end < this.pos)) {
            end = this.buffer.indexOf('\n', this.pos);
            this.lineEndPos = end;
        }
        if (end === -1)
            return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === '\r')
            end -= 1;
        return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
        return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
    }
    peek(n) {
        return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
        switch (next) {
            case 'stream':
                return yield* this.parseStream();
            case 'line-start':
                return yield* this.parseLineStart();
            case 'block-start':
                return yield* this.parseBlockStart();
            case 'doc':
                return yield* this.parseDocument();
            case 'flow':
                return yield* this.parseFlowCollection();
            case 'quoted-scalar':
                return yield* this.parseQuotedScalar();
            case 'block-scalar':
                return yield* this.parseBlockScalar();
            case 'plain-scalar':
                return yield* this.parsePlainScalar();
        }
    }
    *parseStream() {
        let line = this.getLine();
        if (line === null)
            return this.setNext('stream');
        if (line[0] === _cst_js__WEBPACK_IMPORTED_MODULE_0__.BOM) {
            yield* this.pushCount(1);
            line = line.substring(1);
        }
        if (line[0] === '%') {
            let dirEnd = line.length;
            let cs = line.indexOf('#');
            while (cs !== -1) {
                const ch = line[cs - 1];
                if (ch === ' ' || ch === '\t') {
                    dirEnd = cs - 1;
                    break;
                }
                else {
                    cs = line.indexOf('#', cs + 1);
                }
            }
            while (true) {
                const ch = line[dirEnd - 1];
                if (ch === ' ' || ch === '\t')
                    dirEnd -= 1;
                else
                    break;
            }
            const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
            yield* this.pushCount(line.length - n); // possible comment
            this.pushNewline();
            return 'stream';
        }
        if (this.atLineEnd()) {
            const sp = yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - sp);
            yield* this.pushNewline();
            return 'stream';
        }
        yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.DOCUMENT;
        return yield* this.parseLineStart();
    }
    *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
            return this.setNext('line-start');
        if (ch === '-' || ch === '.') {
            if (!this.atEnd && !this.hasChars(4))
                return this.setNext('line-start');
            const s = this.peek(3);
            if ((s === '---' || s === '...') && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                this.indentValue = 0;
                this.indentNext = 0;
                return s === '---' ? 'doc' : 'stream';
            }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
            this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
            return this.setNext('block-start');
        if ((ch0 === '-' || ch0 === '?' || ch0 === ':') && isEmpty(ch1)) {
            const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
            this.indentNext = this.indentValue + 1;
            this.indentValue += n;
            return yield* this.parseBlockStart();
        }
        return 'doc';
    }
    *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
            return this.setNext('doc');
        let n = yield* this.pushIndicators();
        switch (line[n]) {
            case '#':
                yield* this.pushCount(line.length - n);
            // fallthrough
            case undefined:
                yield* this.pushNewline();
                return yield* this.parseLineStart();
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel = 1;
                return 'flow';
            case '}':
            case ']':
                // this is an error
                yield* this.pushCount(1);
                return 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'doc';
            case '"':
            case "'":
                return yield* this.parseQuotedScalar();
            case '|':
            case '>':
                n += yield* this.parseBlockScalarHeader();
                n += yield* this.pushSpaces(true);
                yield* this.pushCount(line.length - n);
                yield* this.pushNewline();
                return yield* this.parseBlockScalar();
            default:
                return yield* this.parsePlainScalar();
        }
    }
    *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
            nl = yield* this.pushNewline();
            if (nl > 0) {
                sp = yield* this.pushSpaces(false);
                this.indentValue = indent = sp;
            }
            else {
                sp = 0;
            }
            sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
            return this.setNext('flow');
        if ((indent !== -1 && indent < this.indentNext && line[0] !== '#') ||
            (indent === 0 &&
                (line.startsWith('---') || line.startsWith('...')) &&
                isEmpty(line[3]))) {
            // Allowing for the terminal ] or } at the same (rather than greater)
            // indent level as the initial [ or { is technically invalid, but
            // failing here would be surprising to users.
            const atFlowEndMarker = indent === this.indentNext - 1 &&
                this.flowLevel === 1 &&
                (line[0] === ']' || line[0] === '}');
            if (!atFlowEndMarker) {
                // this is an error
                this.flowLevel = 0;
                yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.FLOW_END;
                return yield* this.parseLineStart();
            }
        }
        let n = 0;
        while (line[n] === ',') {
            n += yield* this.pushCount(1);
            n += yield* this.pushSpaces(true);
            this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
            case undefined:
                return 'flow';
            case '#':
                yield* this.pushCount(line.length - n);
                return 'flow';
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel += 1;
                return 'flow';
            case '}':
            case ']':
                yield* this.pushCount(1);
                this.flowKey = true;
                this.flowLevel -= 1;
                return this.flowLevel ? 'flow' : 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'flow';
            case '"':
            case "'":
                this.flowKey = true;
                return yield* this.parseQuotedScalar();
            case ':': {
                const next = this.charAt(1);
                if (this.flowKey || isEmpty(next) || next === ',') {
                    this.flowKey = false;
                    yield* this.pushCount(1);
                    yield* this.pushSpaces(true);
                    return 'flow';
                }
            }
            // fallthrough
            default:
                this.flowKey = false;
                return yield* this.parsePlainScalar();
        }
    }
    *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
            while (end !== -1 && this.buffer[end + 1] === "'")
                end = this.buffer.indexOf("'", end + 2);
        }
        else {
            // double-quote
            while (end !== -1) {
                let n = 0;
                while (this.buffer[end - 1 - n] === '\\')
                    n += 1;
                if (n % 2 === 0)
                    break;
                end = this.buffer.indexOf('"', end + 1);
            }
        }
        // Only looking for newlines within the quotes
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf('\n', this.pos);
        if (nl !== -1) {
            while (nl !== -1) {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = qb.indexOf('\n', cs);
            }
            if (nl !== -1) {
                // this is an error caused by an unexpected unindent
                end = nl - (qb[nl - 1] === '\r' ? 2 : 1);
            }
        }
        if (end === -1) {
            if (!this.atEnd)
                return this.setNext('quoted-scalar');
            end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? 'flow' : 'doc';
    }
    *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
            const ch = this.buffer[++i];
            if (ch === '+')
                this.blockScalarKeep = true;
            else if (ch > '0' && ch <= '9')
                this.blockScalarIndent = Number(ch) - 1;
            else if (ch !== '-')
                break;
        }
        return yield* this.pushUntil(ch => isEmpty(ch) || ch === '#');
    }
    *parseBlockScalar() {
        let nl = this.pos - 1; // may be -1 if this.pos === 0
        let indent = 0;
        let ch;
        loop: for (let i = this.pos; (ch = this.buffer[i]); ++i) {
            switch (ch) {
                case ' ':
                    indent += 1;
                    break;
                case '\n':
                    nl = i;
                    indent = 0;
                    break;
                case '\r': {
                    const next = this.buffer[i + 1];
                    if (!next && !this.atEnd)
                        return this.setNext('block-scalar');
                    if (next === '\n')
                        break;
                } // fallthrough
                default:
                    break loop;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('block-scalar');
        if (indent >= this.indentNext) {
            if (this.blockScalarIndent === -1)
                this.indentNext = indent;
            else {
                this.indentNext =
                    this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
            }
            do {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = this.buffer.indexOf('\n', cs);
            } while (nl !== -1);
            if (nl === -1) {
                if (!this.atEnd)
                    return this.setNext('block-scalar');
                nl = this.buffer.length;
            }
        }
        // Trailing insufficiently indented tabs are invalid.
        // To catch that during parsing, we include them in the block scalar value.
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === ' ')
            ch = this.buffer[++i];
        if (ch === '\t') {
            while (ch === '\t' || ch === ' ' || ch === '\r' || ch === '\n')
                ch = this.buffer[++i];
            nl = i - 1;
        }
        else if (!this.blockScalarKeep) {
            do {
                let i = nl - 1;
                let ch = this.buffer[i];
                if (ch === '\r')
                    ch = this.buffer[--i];
                const lastChar = i; // Drop the line if last char not more indented
                while (ch === ' ')
                    ch = this.buffer[--i];
                if (ch === '\n' && i >= this.pos && i + 1 + indent > lastChar)
                    nl = i;
                else
                    break;
            } while (true);
        }
        yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while ((ch = this.buffer[++i])) {
            if (ch === ':') {
                const next = this.buffer[i + 1];
                if (isEmpty(next) || (inFlow && flowIndicatorChars.has(next)))
                    break;
                end = i;
            }
            else if (isEmpty(ch)) {
                let next = this.buffer[i + 1];
                if (ch === '\r') {
                    if (next === '\n') {
                        i += 1;
                        ch = '\n';
                        next = this.buffer[i + 1];
                    }
                    else
                        end = i;
                }
                if (next === '#' || (inFlow && flowIndicatorChars.has(next)))
                    break;
                if (ch === '\n') {
                    const cs = this.continueScalar(i + 1);
                    if (cs === -1)
                        break;
                    i = Math.max(i, cs - 2); // to advance, but still account for ' #'
                }
            }
            else {
                if (inFlow && flowIndicatorChars.has(ch))
                    break;
                end = i;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('plain-scalar');
        yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? 'flow' : 'doc';
    }
    *pushCount(n) {
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos += n;
            return n;
        }
        return 0;
    }
    *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
            yield s;
            this.pos += s.length;
            return s.length;
        }
        else if (allowEmpty)
            yield '';
        return 0;
    }
    *pushIndicators() {
        switch (this.charAt(0)) {
            case '!':
                return ((yield* this.pushTag()) +
                    (yield* this.pushSpaces(true)) +
                    (yield* this.pushIndicators()));
            case '&':
                return ((yield* this.pushUntil(isNotAnchorChar)) +
                    (yield* this.pushSpaces(true)) +
                    (yield* this.pushIndicators()));
            case '-': // this is an error
            case '?': // this is an error outside flow collections
            case ':': {
                const inFlow = this.flowLevel > 0;
                const ch1 = this.charAt(1);
                if (isEmpty(ch1) || (inFlow && flowIndicatorChars.has(ch1))) {
                    if (!inFlow)
                        this.indentNext = this.indentValue + 1;
                    else if (this.flowKey)
                        this.flowKey = false;
                    return ((yield* this.pushCount(1)) +
                        (yield* this.pushSpaces(true)) +
                        (yield* this.pushIndicators()));
                }
            }
        }
        return 0;
    }
    *pushTag() {
        if (this.charAt(1) === '<') {
            let i = this.pos + 2;
            let ch = this.buffer[i];
            while (!isEmpty(ch) && ch !== '>')
                ch = this.buffer[++i];
            return yield* this.pushToIndex(ch === '>' ? i + 1 : i, false);
        }
        else {
            let i = this.pos + 1;
            let ch = this.buffer[i];
            while (ch) {
                if (tagChars.has(ch))
                    ch = this.buffer[++i];
                else if (ch === '%' &&
                    hexDigits.has(this.buffer[i + 1]) &&
                    hexDigits.has(this.buffer[i + 2])) {
                    ch = this.buffer[(i += 3)];
                }
                else
                    break;
            }
            return yield* this.pushToIndex(i, false);
        }
    }
    *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === '\n')
            return yield* this.pushCount(1);
        else if (ch === '\r' && this.charAt(1) === '\n')
            return yield* this.pushCount(2);
        else
            return 0;
    }
    *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
            ch = this.buffer[++i];
        } while (ch === ' ' || (allowTabs && ch === '\t'));
        const n = i - this.pos;
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos = i;
        }
        return n;
    }
    *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
            ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
    }
}




/***/ }),
/* 93 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineCounter: () => (/* binding */ LineCounter)
/* harmony export */ });
/**
 * Tracks newlines during parsing in order to provide an efficient API for
 * determining the one-indexed `{ line, col }` position for any offset
 * within the input.
 */
class LineCounter {
    constructor() {
        this.lineStarts = [];
        /**
         * Should be called in ascending order. Otherwise, call
         * `lineCounter.lineStarts.sort()` before calling `linePos()`.
         */
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        /**
         * Performs a binary search and returns the 1-indexed { line, col }
         * position of `offset`. If `line === 0`, `addNewLine` has never been
         * called or `offset` is before the first known newline.
         */
        this.linePos = (offset) => {
            let low = 0;
            let high = this.lineStarts.length;
            while (low < high) {
                const mid = (low + high) >> 1; // Math.floor((low + high) / 2)
                if (this.lineStarts[mid] < offset)
                    low = mid + 1;
                else
                    high = mid;
            }
            if (this.lineStarts[low] === offset)
                return { line: low + 1, col: 1 };
            if (low === 0)
                return { line: 0, col: offset };
            const start = this.lineStarts[low - 1];
            return { line: low, col: offset - start + 1 };
        };
    }
}




/***/ }),
/* 94 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Parser: () => (/* binding */ Parser)
/* harmony export */ });
/* harmony import */ var _cst_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(88);
/* harmony import */ var _lexer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(92);



function includesToken(list, type) {
    for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
            return true;
    return false;
}
function findNonEmptyIndex(list) {
    for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
            case 'space':
            case 'comment':
            case 'newline':
                break;
            default:
                return i;
        }
    }
    return -1;
}
function isFlowToken(token) {
    switch (token?.type) {
        case 'alias':
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'flow-collection':
            return true;
        default:
            return false;
    }
}
function getPrevProps(parent) {
    switch (parent.type) {
        case 'document':
            return parent.start;
        case 'block-map': {
            const it = parent.items[parent.items.length - 1];
            return it.sep ?? it.start;
        }
        case 'block-seq':
            return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
            return [];
    }
}
/** Note: May modify input array */
function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
        return [];
    let i = prev.length;
    loop: while (--i >= 0) {
        switch (prev[i].type) {
            case 'doc-start':
            case 'explicit-key-ind':
            case 'map-value-ind':
            case 'seq-item-ind':
            case 'newline':
                break loop;
        }
    }
    while (prev[++i]?.type === 'space') {
        /* loop */
    }
    return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
    if (fc.start.type === 'flow-seq-start') {
        for (const it of fc.items) {
            if (it.sep &&
                !it.value &&
                !includesToken(it.start, 'explicit-key-ind') &&
                !includesToken(it.sep, 'map-value-ind')) {
                if (it.key)
                    it.value = it.key;
                delete it.key;
                if (isFlowToken(it.value)) {
                    if (it.value.end)
                        Array.prototype.push.apply(it.value.end, it.sep);
                    else
                        it.value.end = it.sep;
                }
                else
                    Array.prototype.push.apply(it.start, it.sep);
                delete it.sep;
            }
        }
    }
}
/**
 * A YAML concrete syntax tree (CST) parser
 *
 * ```ts
 * const src: string = ...
 * for (const token of new Parser().parse(src)) {
 *   // token: Token
 * }
 * ```
 *
 * To use the parser with a user-provided lexer:
 *
 * ```ts
 * function* parse(source: string, lexer: Lexer) {
 *   const parser = new Parser()
 *   for (const lexeme of lexer.lex(source))
 *     yield* parser.next(lexeme)
 *   yield* parser.end()
 * }
 *
 * const src: string = ...
 * const lexer = new Lexer()
 * for (const token of parse(src, lexer)) {
 *   // token: Token
 * }
 * ```
 */
class Parser {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(onNewLine) {
        /** If true, space and sequence indicators count as indentation */
        this.atNewLine = true;
        /** If true, next token is a scalar value */
        this.atScalar = false;
        /** Current indentation level */
        this.indent = 0;
        /** Current offset since the start of parsing */
        this.offset = 0;
        /** On the same line with a block map key */
        this.onKeyLine = false;
        /** Top indicates the node that's currently being built */
        this.stack = [];
        /** The source of the current token, set in parse() */
        this.source = '';
        /** The type of the current token, set in parse() */
        this.type = '';
        // Must be defined after `next()`
        this.lexer = new _lexer_js__WEBPACK_IMPORTED_MODULE_1__.Lexer();
        this.onNewLine = onNewLine;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
            this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
            yield* this.next(lexeme);
        if (!incomplete)
            yield* this.end();
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(source) {
        this.source = source;
        if (this.atScalar) {
            this.atScalar = false;
            yield* this.step();
            this.offset += source.length;
            return;
        }
        const type = (0,_cst_js__WEBPACK_IMPORTED_MODULE_0__.tokenType)(source);
        if (!type) {
            const message = `Not a YAML token: ${source}`;
            yield* this.pop({ type: 'error', offset: this.offset, message, source });
            this.offset += source.length;
        }
        else if (type === 'scalar') {
            this.atNewLine = false;
            this.atScalar = true;
            this.type = 'scalar';
        }
        else {
            this.type = type;
            yield* this.step();
            switch (type) {
                case 'newline':
                    this.atNewLine = true;
                    this.indent = 0;
                    if (this.onNewLine)
                        this.onNewLine(this.offset + source.length);
                    break;
                case 'space':
                    if (this.atNewLine && source[0] === ' ')
                        this.indent += source.length;
                    break;
                case 'explicit-key-ind':
                case 'map-value-ind':
                case 'seq-item-ind':
                    if (this.atNewLine)
                        this.indent += source.length;
                    break;
                case 'doc-mode':
                case 'flow-error-end':
                    return;
                default:
                    this.atNewLine = false;
            }
            this.offset += source.length;
        }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
        while (this.stack.length > 0)
            yield* this.pop();
    }
    get sourceToken() {
        const st = {
            type: this.type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
        return st;
    }
    *step() {
        const top = this.peek(1);
        if (this.type === 'doc-end' && (!top || top.type !== 'doc-end')) {
            while (this.stack.length > 0)
                yield* this.pop();
            this.stack.push({
                type: 'doc-end',
                offset: this.offset,
                source: this.source
            });
            return;
        }
        if (!top)
            return yield* this.stream();
        switch (top.type) {
            case 'document':
                return yield* this.document(top);
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return yield* this.scalar(top);
            case 'block-scalar':
                return yield* this.blockScalar(top);
            case 'block-map':
                return yield* this.blockMap(top);
            case 'block-seq':
                return yield* this.blockSequence(top);
            case 'flow-collection':
                return yield* this.flowCollection(top);
            case 'doc-end':
                return yield* this.documentEnd(top);
        }
        /* istanbul ignore next should not happen */
        yield* this.pop();
    }
    peek(n) {
        return this.stack[this.stack.length - n];
    }
    *pop(error) {
        const token = error ?? this.stack.pop();
        /* istanbul ignore if should not happen */
        if (!token) {
            const message = 'Tried to pop an empty stack';
            yield { type: 'error', offset: this.offset, source: '', message };
        }
        else if (this.stack.length === 0) {
            yield token;
        }
        else {
            const top = this.peek(1);
            if (token.type === 'block-scalar') {
                // Block scalars use their parent rather than header indent
                token.indent = 'indent' in top ? top.indent : 0;
            }
            else if (token.type === 'flow-collection' && top.type === 'document') {
                // Ignore all indent for top-level flow collections
                token.indent = 0;
            }
            if (token.type === 'flow-collection')
                fixFlowSeqItems(token);
            switch (top.type) {
                case 'document':
                    top.value = token;
                    break;
                case 'block-scalar':
                    top.props.push(token); // error
                    break;
                case 'block-map': {
                    const it = top.items[top.items.length - 1];
                    if (it.value) {
                        top.items.push({ start: [], key: token, sep: [] });
                        this.onKeyLine = true;
                        return;
                    }
                    else if (it.sep) {
                        it.value = token;
                    }
                    else {
                        Object.assign(it, { key: token, sep: [] });
                        this.onKeyLine = !it.explicitKey;
                        return;
                    }
                    break;
                }
                case 'block-seq': {
                    const it = top.items[top.items.length - 1];
                    if (it.value)
                        top.items.push({ start: [], value: token });
                    else
                        it.value = token;
                    break;
                }
                case 'flow-collection': {
                    const it = top.items[top.items.length - 1];
                    if (!it || it.value)
                        top.items.push({ start: [], key: token, sep: [] });
                    else if (it.sep)
                        it.value = token;
                    else
                        Object.assign(it, { key: token, sep: [] });
                    return;
                }
                /* istanbul ignore next should not happen */
                default:
                    yield* this.pop();
                    yield* this.pop(token);
            }
            if ((top.type === 'document' ||
                top.type === 'block-map' ||
                top.type === 'block-seq') &&
                (token.type === 'block-map' || token.type === 'block-seq')) {
                const last = token.items[token.items.length - 1];
                if (last &&
                    !last.sep &&
                    !last.value &&
                    last.start.length > 0 &&
                    findNonEmptyIndex(last.start) === -1 &&
                    (token.indent === 0 ||
                        last.start.every(st => st.type !== 'comment' || st.indent < token.indent))) {
                    if (top.type === 'document')
                        top.end = last.start;
                    else
                        top.items.push({ start: last.start });
                    token.items.splice(-1, 1);
                }
            }
        }
    }
    *stream() {
        switch (this.type) {
            case 'directive-line':
                yield { type: 'directive', offset: this.offset, source: this.source };
                return;
            case 'byte-order-mark':
            case 'space':
            case 'comment':
            case 'newline':
                yield this.sourceToken;
                return;
            case 'doc-mode':
            case 'doc-start': {
                const doc = {
                    type: 'document',
                    offset: this.offset,
                    start: []
                };
                if (this.type === 'doc-start')
                    doc.start.push(this.sourceToken);
                this.stack.push(doc);
                return;
            }
        }
        yield {
            type: 'error',
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML stream`,
            source: this.source
        };
    }
    *document(doc) {
        if (doc.value)
            return yield* this.lineEnd(doc);
        switch (this.type) {
            case 'doc-start': {
                if (findNonEmptyIndex(doc.start) !== -1) {
                    yield* this.pop();
                    yield* this.step();
                }
                else
                    doc.start.push(this.sourceToken);
                return;
            }
            case 'anchor':
            case 'tag':
            case 'space':
            case 'comment':
            case 'newline':
                doc.start.push(this.sourceToken);
                return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
            this.stack.push(bv);
        else {
            yield {
                type: 'error',
                offset: this.offset,
                message: `Unexpected ${this.type} token in YAML document`,
                source: this.source
            };
        }
    }
    *scalar(scalar) {
        if (this.type === 'map-value-ind') {
            const prev = getPrevProps(this.peek(2));
            const start = getFirstKeyStartProps(prev);
            let sep;
            if (scalar.end) {
                sep = scalar.end;
                sep.push(this.sourceToken);
                delete scalar.end;
            }
            else
                sep = [this.sourceToken];
            const map = {
                type: 'block-map',
                offset: scalar.offset,
                indent: scalar.indent,
                items: [{ start, key: scalar, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
        }
        else
            yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
        switch (this.type) {
            case 'space':
            case 'comment':
            case 'newline':
                scalar.props.push(this.sourceToken);
                return;
            case 'scalar':
                scalar.source = this.source;
                // block-scalar source includes trailing newline
                this.atNewLine = true;
                this.indent = 0;
                if (this.onNewLine) {
                    let nl = this.source.indexOf('\n') + 1;
                    while (nl !== 0) {
                        this.onNewLine(this.offset + nl);
                        nl = this.source.indexOf('\n', nl) + 1;
                    }
                }
                yield* this.pop();
                break;
            /* istanbul ignore next should not happen */
            default:
                yield* this.pop();
                yield* this.step();
        }
    }
    *blockMap(map) {
        const it = map.items[map.items.length - 1];
        // it.sep is true-ish if pair already has key or : separator
        switch (this.type) {
            case 'newline':
                this.onKeyLine = false;
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    it.start.push(this.sourceToken);
                }
                return;
            case 'space':
            case 'comment':
                if (it.value) {
                    map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    if (this.atIndentedComment(it.start, map.indent)) {
                        const prev = map.items[map.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            Array.prototype.push.apply(end, it.start);
                            end.push(this.sourceToken);
                            map.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
        }
        if (this.indent >= map.indent) {
            const atMapIndent = !this.onKeyLine && this.indent === map.indent;
            const atNextItem = atMapIndent &&
                (it.sep || it.explicitKey) &&
                this.type !== 'seq-item-ind';
            // For empty nodes, assign newline-separated not indented empty tokens to following node
            let start = [];
            if (atNextItem && it.sep && !it.value) {
                const nl = [];
                for (let i = 0; i < it.sep.length; ++i) {
                    const st = it.sep[i];
                    switch (st.type) {
                        case 'newline':
                            nl.push(i);
                            break;
                        case 'space':
                            break;
                        case 'comment':
                            if (st.indent > map.indent)
                                nl.length = 0;
                            break;
                        default:
                            nl.length = 0;
                    }
                }
                if (nl.length >= 2)
                    start = it.sep.splice(nl[1]);
            }
            switch (this.type) {
                case 'anchor':
                case 'tag':
                    if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        it.sep.push(this.sourceToken);
                    }
                    else {
                        it.start.push(this.sourceToken);
                    }
                    return;
                case 'explicit-key-ind':
                    if (!it.sep && !it.explicitKey) {
                        it.start.push(this.sourceToken);
                        it.explicitKey = true;
                    }
                    else if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start, explicitKey: true });
                    }
                    else {
                        this.stack.push({
                            type: 'block-map',
                            offset: this.offset,
                            indent: this.indent,
                            items: [{ start: [this.sourceToken], explicitKey: true }]
                        });
                    }
                    this.onKeyLine = true;
                    return;
                case 'map-value-ind':
                    if (it.explicitKey) {
                        if (!it.sep) {
                            if (includesToken(it.start, 'newline')) {
                                Object.assign(it, { key: null, sep: [this.sourceToken] });
                            }
                            else {
                                const start = getFirstKeyStartProps(it.start);
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start, key: null, sep: [this.sourceToken] }]
                                });
                            }
                        }
                        else if (it.value) {
                            map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else if (isFlowToken(it.key) &&
                            !includesToken(it.sep, 'newline')) {
                            const start = getFirstKeyStartProps(it.start);
                            const key = it.key;
                            const sep = it.sep;
                            sep.push(this.sourceToken);
                            // @ts-expect-error type guard is wrong here
                            delete it.key;
                            // @ts-expect-error type guard is wrong here
                            delete it.sep;
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key, sep }]
                            });
                        }
                        else if (start.length > 0) {
                            // Not actually at next item
                            it.sep = it.sep.concat(start, this.sourceToken);
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    else {
                        if (!it.sep) {
                            Object.assign(it, { key: null, sep: [this.sourceToken] });
                        }
                        else if (it.value || atNextItem) {
                            map.items.push({ start, key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start: [], key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    this.onKeyLine = true;
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (atNextItem || it.value) {
                        map.items.push({ start, key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        this.stack.push(fs);
                    }
                    else {
                        Object.assign(it, { key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    return;
                }
                default: {
                    const bv = this.startBlockValue(map);
                    if (bv) {
                        if (atMapIndent && bv.type !== 'block-seq') {
                            map.items.push({ start });
                        }
                        this.stack.push(bv);
                        return;
                    }
                }
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
            case 'newline':
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        seq.items.push({ start: [this.sourceToken] });
                }
                else
                    it.start.push(this.sourceToken);
                return;
            case 'space':
            case 'comment':
                if (it.value)
                    seq.items.push({ start: [this.sourceToken] });
                else {
                    if (this.atIndentedComment(it.start, seq.indent)) {
                        const prev = seq.items[seq.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            Array.prototype.push.apply(end, it.start);
                            end.push(this.sourceToken);
                            seq.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
            case 'anchor':
            case 'tag':
                if (it.value || this.indent <= seq.indent)
                    break;
                it.start.push(this.sourceToken);
                return;
            case 'seq-item-ind':
                if (this.indent !== seq.indent)
                    break;
                if (it.value || includesToken(it.start, 'seq-item-ind'))
                    seq.items.push({ start: [this.sourceToken] });
                else
                    it.start.push(this.sourceToken);
                return;
        }
        if (this.indent > seq.indent) {
            const bv = this.startBlockValue(seq);
            if (bv) {
                this.stack.push(bv);
                return;
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === 'flow-error-end') {
            let top;
            do {
                yield* this.pop();
                top = this.peek(1);
            } while (top && top.type === 'flow-collection');
        }
        else if (fc.end.length === 0) {
            switch (this.type) {
                case 'comma':
                case 'explicit-key-ind':
                    if (!it || it.sep)
                        fc.items.push({ start: [this.sourceToken] });
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'map-value-ind':
                    if (!it || it.value)
                        fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        Object.assign(it, { key: null, sep: [this.sourceToken] });
                    return;
                case 'space':
                case 'comment':
                case 'newline':
                case 'anchor':
                case 'tag':
                    if (!it || it.value)
                        fc.items.push({ start: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (!it || it.value)
                        fc.items.push({ start: [], key: fs, sep: [] });
                    else if (it.sep)
                        this.stack.push(fs);
                    else
                        Object.assign(it, { key: fs, sep: [] });
                    return;
                }
                case 'flow-map-end':
                case 'flow-seq-end':
                    fc.end.push(this.sourceToken);
                    return;
            }
            const bv = this.startBlockValue(fc);
            /* istanbul ignore else should not happen */
            if (bv)
                this.stack.push(bv);
            else {
                yield* this.pop();
                yield* this.step();
            }
        }
        else {
            const parent = this.peek(2);
            if (parent.type === 'block-map' &&
                ((this.type === 'map-value-ind' && parent.indent === fc.indent) ||
                    (this.type === 'newline' &&
                        !parent.items[parent.items.length - 1].sep))) {
                yield* this.pop();
                yield* this.step();
            }
            else if (this.type === 'map-value-ind' &&
                parent.type !== 'flow-collection') {
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                fixFlowSeqItems(fc);
                const sep = fc.end.splice(1, fc.end.length);
                sep.push(this.sourceToken);
                const map = {
                    type: 'block-map',
                    offset: fc.offset,
                    indent: fc.indent,
                    items: [{ start, key: fc, sep }]
                };
                this.onKeyLine = true;
                this.stack[this.stack.length - 1] = map;
            }
            else {
                yield* this.lineEnd(fc);
            }
        }
    }
    flowScalar(type) {
        if (this.onNewLine) {
            let nl = this.source.indexOf('\n') + 1;
            while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf('\n', nl) + 1;
            }
        }
        return {
            type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
    }
    startBlockValue(parent) {
        switch (this.type) {
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return this.flowScalar(this.type);
            case 'block-scalar-header':
                return {
                    type: 'block-scalar',
                    offset: this.offset,
                    indent: this.indent,
                    props: [this.sourceToken],
                    source: ''
                };
            case 'flow-map-start':
            case 'flow-seq-start':
                return {
                    type: 'flow-collection',
                    offset: this.offset,
                    indent: this.indent,
                    start: this.sourceToken,
                    items: [],
                    end: []
                };
            case 'seq-item-ind':
                return {
                    type: 'block-seq',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [this.sourceToken] }]
                };
            case 'explicit-key-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                start.push(this.sourceToken);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, explicitKey: true }]
                };
            }
            case 'map-value-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                };
            }
        }
        return null;
    }
    atIndentedComment(start, indent) {
        if (this.type !== 'comment')
            return false;
        if (this.indent <= indent)
            return false;
        return start.every(st => st.type === 'newline' || st.type === 'space');
    }
    *documentEnd(docEnd) {
        if (this.type !== 'doc-mode') {
            if (docEnd.end)
                docEnd.end.push(this.sourceToken);
            else
                docEnd.end = [this.sourceToken];
            if (this.type === 'newline')
                yield* this.pop();
        }
    }
    *lineEnd(token) {
        switch (this.type) {
            case 'comma':
            case 'doc-start':
            case 'doc-end':
            case 'flow-seq-end':
            case 'flow-map-end':
            case 'map-value-ind':
                yield* this.pop();
                yield* this.step();
                break;
            case 'newline':
                this.onKeyLine = false;
            // fallthrough
            case 'space':
            case 'comment':
            default:
                // all other values are errors
                if (token.end)
                    token.end.push(this.sourceToken);
                else
                    token.end = [this.sourceToken];
                if (this.type === 'newline')
                    yield* this.pop();
        }
    }
}




/***/ }),
/* 95 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parse: () => (/* binding */ parse),
/* harmony export */   parseAllDocuments: () => (/* binding */ parseAllDocuments),
/* harmony export */   parseDocument: () => (/* binding */ parseDocument),
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/* harmony import */ var _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29);
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72);
/* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(45);
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(27);
/* harmony import */ var _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(93);
/* harmony import */ var _parse_parser_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(94);








function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter = options.lineCounter || (prettyErrors && new _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_5__.LineCounter()) || null;
    return { lineCounter, prettyErrors };
}
/**
 * Parse the input as a stream of YAML documents.
 *
 * Documents should be separated from each other by `...` or `---` marker lines.
 *
 * @returns If an empty `docs` array is returned, it will be of type
 *   EmptyStream and contain additional stream information. In
 *   TypeScript, you should use `'empty' in docs` as a type guard for it.
 */
function parseAllDocuments(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new _parse_parser_js__WEBPACK_IMPORTED_MODULE_6__.Parser(lineCounter?.addNewLine);
    const composer = new _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__.Composer(options);
    const docs = Array.from(composer.compose(parser.parse(source)));
    if (prettyErrors && lineCounter)
        for (const doc of docs) {
            doc.errors.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
            doc.warnings.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
        }
    if (docs.length > 0)
        return docs;
    return Object.assign([], { empty: true }, composer.streamInfo());
}
/** Parse an input string into a single YAML.Document */
function parseDocument(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new _parse_parser_js__WEBPACK_IMPORTED_MODULE_6__.Parser(lineCounter?.addNewLine);
    const composer = new _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__.Composer(options);
    // `doc` is always set by compose.end(true) at the very latest
    let doc = null;
    for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
        if (!doc)
            doc = _doc;
        else if (doc.options.logLevel !== 'silent') {
            doc.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(_doc.range.slice(0, 2), 'MULTIPLE_DOCS', 'Source contains multiple documents; please use YAML.parseAllDocuments()'));
            break;
        }
    }
    if (prettyErrors && lineCounter) {
        doc.errors.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
        doc.warnings.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
    }
    return doc;
}
function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === 'function') {
        _reviver = reviver;
    }
    else if (options === undefined && reviver && typeof reviver === 'object') {
        options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
        return null;
    doc.warnings.forEach(warning => (0,_log_js__WEBPACK_IMPORTED_MODULE_3__.warn)(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
        if (doc.options.logLevel !== 'silent')
            throw doc.errors[0];
        else
            doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === 'function' || Array.isArray(replacer)) {
        _replacer = replacer;
    }
    else if (options === undefined && replacer) {
        options = replacer;
    }
    if (typeof options === 'string')
        options = options.length;
    if (typeof options === 'number') {
        const indent = Math.round(options);
        options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
            return undefined;
    }
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_4__.isDocument)(value) && !_replacer)
        return value.toString(options);
    return new _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__.Document(value, _replacer, options).toString(options);
}




/***/ }),
/* 96 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigMissingError = void 0;
exports.getConfigLocation = getConfigLocation;
const vscode = __importStar(__webpack_require__(2));
const yaml = __importStar(__webpack_require__(23));
const util_1 = __webpack_require__(9);
class ConfigMissingError extends Error {
}
exports.ConfigMissingError = ConfigMissingError;
/**
 * If there is only one ZMK config in the workspace, returns it.
 *
 * If there are multiple, prompts the user to select one and returns it or
 * undefined if the user cancels selection.
 *
 * @throws ConfigMissingError if there are no ZMK configs in the workspace.
 */
async function getConfigLocation() {
    const allConfigs = await findAllConfigs();
    if (allConfigs.length === 0) {
        throw new ConfigMissingError();
    }
    if (allConfigs.length === 1) {
        return allConfigs[0];
    }
    const items = getConfigPickItems(allConfigs);
    const result = await vscode.window.showQuickPick(items, {
        title: 'Add to which workspace?',
        placeHolder: 'Pick ZMK config workspace',
        ignoreFocusOut: true,
    });
    return result?.location;
}
async function findAllConfigs() {
    const configs = await Promise.all(vscode.workspace.workspaceFolders?.map(locateConfigInWorkspace) ?? []);
    return configs.filter((x) => x !== undefined);
}
async function locateBoardRoot(workspace) {
    try {
        const uri = vscode.Uri.joinPath(workspace.uri, 'zephyr/module.yml');
        const file = (0, util_1.decode)(await vscode.workspace.fs.readFile(uri));
        const module = yaml.parse(file);
        const boardRoot = module?.build?.settings?.board_root;
        if (boardRoot) {
            return vscode.Uri.joinPath(workspace.uri, boardRoot);
        }
    }
    catch (e) {
        if (e instanceof vscode.FileSystemError) {
            return undefined;
        }
        throw e;
    }
    return undefined;
}
async function locateConfigInWorkspace(workspace) {
    const boardRoot = await locateBoardRoot(workspace);
    const settings = vscode.workspace.getConfiguration('zmk', workspace);
    const path = settings.get('configPath');
    if (path) {
        const config = vscode.Uri.joinPath(workspace.uri, path);
        return { workspace, config, boardRoot: boardRoot ?? config };
    }
    const glob = await vscode.workspace.findFiles(new vscode.RelativePattern(workspace, '**/west.yml'));
    if (glob.length === 0) {
        return undefined;
    }
    const config = (0, util_1.dirname)(glob[0]);
    return {
        workspace,
        config,
        boardRoot: boardRoot ?? config,
    };
}
async function getConfigPickItems(configs) {
    return configs.map((location) => {
        return {
            label: location.workspace.name,
            description: location.config.path.substring(location.workspace.uri.path.length),
            location,
        };
    });
}


/***/ }),
/* 97 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getHardware = getHardware;
exports.getKeyboardFiles = getKeyboardFiles;
exports.filterToShield = filterToShield;
const vscode = __importStar(__webpack_require__(2));
const yaml = __importStar(__webpack_require__(23));
const file_1 = __webpack_require__(8);
const util_1 = __webpack_require__(9);
const BASE_URL = 'https://raw.githubusercontent.com/zmkfirmware/zmk/main';
const METADATA_URL = 'https://zmk.dev/hardware-metadata.json';
async function getHardware(context, config) {
    const sources = await Promise.all([getZmkHardware(context), getUserHardware(config)]);
    const groups = sources.flat().reduce((groups, hardware) => {
        if (isKeyboard(hardware)) {
            groups.keyboards.push(hardware);
        }
        else if (isController(hardware)) {
            groups.controllers.push(hardware);
        }
        return groups;
    }, { keyboards: [], controllers: [] });
    sortHardware(groups.keyboards);
    sortHardware(groups.controllers);
    return groups;
}
function sortHardware(hardware) {
    hardware.sort((a, b) => a.name.localeCompare(b.name));
}
function getKeyboardFiles(keyboard) {
    return {
        configUrl: vscode.Uri.parse(`${keyboard.baseUri}/${keyboard.id}.conf`),
        keymapUrl: vscode.Uri.parse(`${keyboard.baseUri}/${keyboard.id}.keymap`),
    };
}
function filterToShield(boards, shield) {
    if (shield.requires === undefined || shield.requires.length === 0) {
        throw new Error(`Shield ${shield.id} is missing "requires" field.`);
    }
    return boards.filter((board) => shield.requires?.every((interconnect) => board.exposes?.includes(interconnect)));
}
function isKeyboard(hardware) {
    switch (hardware.type) {
        case 'board':
            return hardware.features?.includes('keys') ?? false;
        case 'shield':
            return true;
    }
    return false;
}
function isController(hardware) {
    return hardware.type === 'board' && !isKeyboard(hardware);
}
async function getZmkHardwareMetadata(context) {
    const response = await fetch(METADATA_URL, { credentials: 'same-origin' });
    if (response.ok) {
        return await response.text();
    }
    vscode.window.showInformationMessage(`Failed to fetch ${METADATA_URL} (${await response.text()}). Falling back to built-in keyboard list.`);
    return (0, util_1.decode)(await (0, file_1.fetchResource)(context, 'dist/hardware.json'));
}
async function getZmkHardware(context) {
    const file = await getZmkHardwareMetadata(context);
    return JSON.parse(file).map((hardware) => ({
        ...hardware,
        baseUri: `${BASE_URL}/${hardware.directory}`,
    }));
}
async function getUserHardware(config) {
    const meta = await vscode.workspace.findFiles(new vscode.RelativePattern(config.boardRoot, '**/*.zmk.yml'));
    return Promise.all(meta.map(async (uri) => {
        const file = (0, util_1.decode)(await vscode.workspace.fs.readFile(uri));
        const hardware = yaml.parse(file);
        return {
            ...hardware,
            baseUri: (0, util_1.dirname)(uri).toString(),
        };
    }));
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const KeymapAnalyzer_1 = __webpack_require__(1);
const Parser_1 = __webpack_require__(3);
const SetupWizard_1 = __webpack_require__(21);
async function activate(context) {
    const parser = await Parser_1.KeymapParser.init(context);
    const analyzer = new KeymapAnalyzer_1.KeymapAnalyzer(parser);
    const setupWizard = new SetupWizard_1.SetupWizard(context);
    context.subscriptions.push(parser, analyzer, setupWizard);
}
function deactivate() { }

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map