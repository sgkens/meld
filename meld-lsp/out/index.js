"use strict";
const typescript_template_language_service_decorator_1 = require("typescript-template-language-service-decorator");
const vscode_html_languageservice_1 = require("vscode-html-languageservice");
const path = require("path");
const fs = require("fs");
const CORE_DATA = {
    version: 1.1,
    tags: [
        { name: "meld-slot", description: "Slot projection target for Shadow DOM composition.", attributes: [] },
        { name: "meld-portal", description: "Teleports content to the document body.", attributes: [] }
    ],
    globalAttributes: [
        { name: "ref", description: "Get a direct reference to the DOM element." }
    ]
};
module.exports = (mod) => {
    return {
        create(info) {
            const logger = (msg) => info.project.projectService.logger.info(`[Meld LSP] ${msg}`);
            const customData = [(0, vscode_html_languageservice_1.newHTMLDataProvider)('meld-core', CORE_DATA)];
            const projectDir = info.project.getCurrentDirectory();
            const pluginsDir = path.join(projectDir, 'src', 'plugins');
            if (fs.existsSync(pluginsDir)) {
                const files = fs.readdirSync(pluginsDir);
                files.forEach(file => {
                    if (file.endsWith('.json')) {
                        try {
                            const data = JSON.parse(fs.readFileSync(path.join(pluginsDir, file), 'utf8'));
                            customData.push((0, vscode_html_languageservice_1.newHTMLDataProvider)(file, data));
                            logger(`Loaded definitions from ${file}`);
                        }
                        catch (e) { }
                    }
                });
            }
            const htmlService = (0, vscode_html_languageservice_1.getLanguageService)({ customDataProviders: customData });
            const meldTemplateService = {
                getCompletionsAtPosition(context, position) {
                    const doc = vscode_html_languageservice_1.TextDocument.create(context.fileName, 'html', 1, context.text);
                    const offset = context.toOffset(position);
                    const htmlDoc = htmlService.parseHTMLDocument(doc);
                    const completionList = htmlService.doComplete(doc, doc.positionAt(offset), htmlDoc);
                    return {
                        isGlobalCompletion: false,
                        isMemberCompletion: false,
                        isNewIdentifierLocation: false,
                        entries: completionList.items.map(item => ({
                            name: item.label,
                            kind: mod.typescript.ScriptElementKind.label,
                            kindModifiers: '',
                            sortText: item.sortText || item.label,
                        }))
                    };
                },
                getQuickInfoAtPosition(context, position) {
                    const doc = vscode_html_languageservice_1.TextDocument.create(context.fileName, 'html', 1, context.text);
                    const offset = context.toOffset(position);
                    const htmlDoc = htmlService.parseHTMLDocument(doc);
                    const hover = htmlService.doHover(doc, doc.positionAt(offset), htmlDoc);
                    if (!hover || !hover.contents)
                        return undefined;
                    const documentation = [];
                    const contents = Array.isArray(hover.contents) ? hover.contents : [hover.contents];
                    contents.forEach(content => {
                        const text = typeof content === 'string' ? content : content.value;
                        documentation.push({ text, kind: 'text' });
                    });
                    return {
                        kind: mod.typescript.ScriptElementKind.label,
                        kindModifiers: '',
                        textSpan: {
                            start: hover.range ? doc.offsetAt(hover.range.start) : offset,
                            length: hover.range ? (doc.offsetAt(hover.range.end) - doc.offsetAt(hover.range.start)) : 1,
                        },
                        displayParts: [],
                        documentation,
                    };
                },
                getSemanticDiagnostics(context) {
                    return [];
                }
            };
            return (0, typescript_template_language_service_decorator_1.decorateWithTemplateLanguageService)(mod.typescript, info.languageService, info.project, meldTemplateService, { tags: ['meldHtml'], enableForStringWithSubstitutions: true });
        },
    };
};
//# sourceMappingURL=index.js.map