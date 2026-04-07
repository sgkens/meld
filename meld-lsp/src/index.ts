import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import * as ts from 'typescript/lib/tsserverlibrary';
import { getLanguageService } from 'vscode-html-languageservice';
import * as path from 'path';
import * as fs from 'fs';

const CORE_DATA = {
  version: 1.1,
  tags: [
    { name: "meld-slot", description: "Slot projection target for Shadow DOM composition." },
    { name: "meld-portal", description: "Teleports content to the document body." }
  ],
  globalAttributes: [
    { name: "ref", description: "Get a direct reference to the DOM element." }
  ]
};

export = (mod: { typescript: typeof ts }) => {
  return {
    create(info: ts.server.PluginCreateInfo) {
      const logger = (msg: string) => info.project.projectService.logger.info(`[Meld LSP] ${msg}`);
      const customData = [CORE_DATA];
      const projectDir = info.project.getCurrentDirectory();
      const pluginsDir = path.join(projectDir, 'src', 'plugins');

      if (fs.existsSync(pluginsDir)) {
        const files = fs.readdirSync(pluginsDir);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            try {
              const data = JSON.parse(fs.readFileSync(path.join(pluginsDir, file), 'utf8'));
              customData.push(data);
              logger(`Loaded definitions from ${file}`);
            } catch (e) {}
          }
        });
      }

      const htmlService = getLanguageService({ customDataProviders: customData });

      const meldTemplateService = {
        getCompletionsAtPosition(context: any, position: any) {
          // Simplified LSP logic for RC scaffold
          return htmlService.doComplete(context, position, htmlService.parseHTMLDocument(context));
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
