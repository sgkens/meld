import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import * as ts from 'typescript/lib/tsserverlibrary';
import { getLanguageService, newHTMLDataProvider, TextDocument } from 'vscode-html-languageservice';
import * as path from 'path';
import * as fs from 'fs';

const CORE_DATA = {
  version: 1.1 as const,
  tags: [
    { name: "meld-slot", description: "Slot projection target for Shadow DOM composition.", attributes: [] },
    { name: "meld-portal", description: "Teleports content to the document body.", attributes: [] }
  ],
  globalAttributes: [
    { name: "ref", description: "Get a direct reference to the DOM element." }
  ]
};

export = (mod: { typescript: typeof ts }) => {
  return {
    create(info: ts.server.PluginCreateInfo) {
      const logger = (msg: string) => info.project.projectService.logger.info(`[Meld LSP] ${msg}`);
      const customData = [newHTMLDataProvider('meld-core', CORE_DATA)];
      const projectDir = info.project.getCurrentDirectory();
      const pluginsDir = path.join(projectDir, 'src', 'plugins');

      if (fs.existsSync(pluginsDir)) {
        const files = fs.readdirSync(pluginsDir);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            try {
              const data = JSON.parse(fs.readFileSync(path.join(pluginsDir, file), 'utf8'));
              customData.push(newHTMLDataProvider(file, data));
              logger(`Loaded definitions from ${file}`);
            } catch (e) {}
          }
        });
      }

      const htmlService = getLanguageService({ customDataProviders: customData });

      const meldTemplateService = {
        getCompletionsAtPosition(context: any, position: any) {
          const doc = TextDocument.create(context.fileName, 'html', 1, context.text);
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

        getQuickInfoAtPosition(context: any, position: any) {
          const doc = TextDocument.create(context.fileName, 'html', 1, context.text);
          const offset = context.toOffset(position);
          const htmlDoc = htmlService.parseHTMLDocument(doc);
          const hover = htmlService.doHover(doc, doc.positionAt(offset), htmlDoc);
          if (!hover || !hover.contents) return undefined;

          const documentation: ts.SymbolDisplayPart[] = [];
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

        getSemanticDiagnostics(context: any) {
          return [];
        }
      };

      return decorateWithTemplateLanguageService(
        mod.typescript,
        info.languageService,
        info.project,
        meldTemplateService as any,
        { tags: ['meldHtml'], enableForStringWithSubstitutions: true }
      );
    },
  };
};
