import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import * as ts from 'typescript/lib/tsserverlibrary';
import { getLanguageService, newHTMLDataProvider, TextDocument } from 'vscode-html-languageservice';
import * as path from 'path';
import * as fs from 'fs';

const CORE_DATA = {
  version: 1.1 as const,
  tags: [
    { name: "meld-slot", description: "Slot projection target for Shadow DOM composition.", attributes: [] },
    { name: "meld-portal", description: "Teleports content to the document body.", attributes: [] },
    {
      name: "m-button",
      description: "Meld UI Button component.",
      attributes: [
        { name: "variant", description: "Visual variant: 'primary', 'secondary', 'danger', or 'ghost'." },
        { name: "disabled", description: "Disables user interaction." },
        { name: "loading", description: "Displays a loading spinner and disables interaction." },
        { name: "size", description: "Button sizing: 'sm', 'md', 'lg'." }
      ]
    },
    {
      name: "m-input",
      description: "Meld UI Text Input component.",
      attributes: [
        { name: "label", description: "Heading label text." },
        { name: "placeholder", description: "Placeholder helper text." },
        { name: "value", description: "Current text value." },
        { name: "type", description: "Input element type (e.g. 'text', 'password', 'email')." }
      ]
    },
    {
      name: "m-select",
      description: "Meld UI Dropdown Select component.",
      attributes: [
        { name: "label", description: "Heading label text." },
        { name: "value", description: "Currently selected option value." }
      ]
    },
    {
      name: "m-switch",
      description: "Meld UI Toggle Switch component.",
      attributes: [
        { name: "label", description: "Beside-switch label text." },
        { name: "checked", description: "Boolean state." }
      ]
    },
    {
      name: "m-tabs",
      description: "Meld UI Tabbed Layout component.",
      attributes: []
    },
    {
      name: "m-breadcrumb",
      description: "Meld UI Hierarchical Breadcrumb Navigation component.",
      attributes: []
    },
    {
      name: "m-dropdown",
      description: "Meld UI Action Popover Dropdown component.",
      attributes: [
        { name: "label", description: "Dropdown trigger button text label." }
      ]
    },
    {
      name: "m-stack",
      description: "Meld UI Vertical Stack Layout component.",
      attributes: [
        { name: "gap", description: "Vertical spacing gap size: 'sm', 'md', 'lg'." }
      ]
    },
    {
      name: "m-group",
      description: "Meld UI Horizontal Group Layout component.",
      attributes: [
        { name: "gap", description: "Horizontal spacing gap size: 'sm', 'md', 'lg'." }
      ]
    },
    {
      name: "m-card",
      description: "Meld UI Card panel component.",
      attributes: []
    },
    {
      name: "m-modal",
      description: "Meld UI Dialog Modal dialog component.",
      attributes: []
    },
    {
      name: "m-drawer",
      description: "Meld UI Slide-out Side Drawer component.",
      attributes: [
        { name: "position", description: "Edge slide direction: 'left' or 'right'." },
        { name: "open", description: "Visual open state." }
      ]
    },
    {
      name: "m-badge",
      description: "Meld UI Category or Status Badge.",
      attributes: [
        { name: "variant", description: "Theme variant: 'info', 'success', 'warning', 'danger'." }
      ]
    },
    {
      name: "m-alert",
      description: "Meld UI Alert banner notice.",
      attributes: [
        { name: "variant", description: "Theme variant: 'info', 'success', 'warning', 'danger'." }
      ]
    },
    {
      name: "m-table",
      description: "Meld UI Data Table component.",
      attributes: []
    },
    {
      name: "m-toast",
      description: "Meld UI Toast Notification overlay manager.",
      attributes: []
    }
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
