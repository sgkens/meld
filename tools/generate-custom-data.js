import fs from 'node:fs';
import path from 'node:path';

const CORE_DESCRIPTIONS = {
  "m-button": {
    description: "Meld UI Button component.",
    attributes: {
      "variant": "Visual variant: 'primary', 'secondary', 'danger', or 'ghost'.",
      "disabled": "Disables user interaction.",
      "loading": "Displays a loading spinner and disables interaction.",
      "size": "Button sizing: 'sm', 'md', 'lg'."
    }
  },
  "m-input": {
    description: "Meld UI Text Input component.",
    attributes: {
      "label": "Heading label text.",
      "placeholder": "Placeholder helper text.",
      "value": "Current text value.",
      "type": "Input element type (e.g. 'text', 'password', 'email')."
    }
  },
  "m-select": {
    description: "Meld UI Dropdown Select component.",
    attributes: {
      "label": "Heading label text.",
      "value": "Currently selected option value."
    }
  },
  "m-switch": {
    description: "Meld UI Toggle Switch component.",
    attributes: {
      "label": "Beside-switch label text.",
      "checked": "Boolean state."
    }
  },
  "m-drawer": {
    description: "Meld UI Slide-out Side Drawer component.",
    attributes: {
      "position": "Edge slide direction: 'left' or 'right'.",
      "open": "Visual open state."
    }
  },
  "m-badge": {
    description: "Meld UI Category or Status Badge.",
    attributes: {
      "variant": "Theme variant: 'info', 'success', 'warning', 'danger'."
    }
  },
  "m-alert": {
    description: "Meld UI Alert banner notice.",
    attributes: {
      "variant": "Theme variant: 'info', 'success', 'warning', 'danger'."
    }
  },
  "m-stack": {
    description: "Meld UI Vertical Stack Layout component.",
    attributes: {
      "gap": "Vertical spacing gap size: 'sm', 'md', 'lg'."
    }
  },
  "m-group": {
    description: "Meld UI Horizontal Group Layout component.",
    attributes: {
      "gap": "Horizontal spacing gap size: 'sm', 'md', 'lg'."
    }
  }
};

const getAllFiles = (dir, ext = '.js', arr = []) => {
  if (!fs.existsSync(dir)) return arr;
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) getAllFiles(p, ext, arr);
    else if (file.endsWith(ext)) arr.push(p);
  });
  return arr;
};

export function generateCustomData() {
  const rootDir = process.cwd();
  const searchDirs = [
    path.join(rootDir, 'src', 'components'),
    path.join(rootDir, 'src', 'plugins'),
    path.join(rootDir, 'components')
  ];

  const tags = [];
  const processedTags = new Set();

  searchDirs.forEach(dir => {
    const files = getAllFiles(dir);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      const defineMeldRegex = /defineMeld\(\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = defineMeldRegex.exec(content)) !== null) {
        const tagName = match[1];
        if (processedTags.has(tagName)) continue;
        processedTags.add(tagName);

        const defineIndex = match.index;
        const beforeDefine = content.slice(0, defineIndex);
        const jsdocMatch = beforeDefine.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
        
        let description = "";
        if (jsdocMatch) {
          description = jsdocMatch[1]
            .replace(/^\s*\*\s?/gm, '')
            .replace(/@\w+[\s\S]*/g, '')
            .trim();
        }

        if (!description && CORE_DESCRIPTIONS[tagName]) {
          description = CORE_DESCRIPTIONS[tagName].description;
        }
        if (!description) {
          description = `Meld custom component <${tagName}>.`;
        }

        const attributes = [];
        const seenAttrs = new Set();

        const getAttrRegex = /el\.(?:get|has)Attribute\(\s*['"]([^'"]+)['"]/g;
        let attrMatch;
        while ((attrMatch = getAttrRegex.exec(content)) !== null) {
          const attrName = attrMatch[1];
          if (!seenAttrs.has(attrName)) {
            seenAttrs.add(attrName);
            let attrDesc = "";
            if (CORE_DESCRIPTIONS[tagName] && CORE_DESCRIPTIONS[tagName].attributes[attrName]) {
              attrDesc = CORE_DESCRIPTIONS[tagName].attributes[attrName];
            } else {
              attrDesc = `Attribute '${attrName}' on <${tagName}>.`;
            }
            attributes.push({ name: attrName, description: attrDesc });
          }
        }

        const reactiveAttrRegex = /attrs\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        while ((attrMatch = reactiveAttrRegex.exec(content)) !== null) {
          const attrName = attrMatch[1];
          if (!seenAttrs.has(attrName)) {
            seenAttrs.add(attrName);
            let attrDesc = "";
            if (CORE_DESCRIPTIONS[tagName] && CORE_DESCRIPTIONS[tagName].attributes[attrName]) {
              attrDesc = CORE_DESCRIPTIONS[tagName].attributes[attrName];
            } else {
              attrDesc = `Reactive attribute '${attrName}' on <${tagName}>.`;
            }
            attributes.push({ name: attrName, description: attrDesc });
          }
        }

        const observedAttrRegex = /observedAttributes\s*:\s*\[([^\]]+)\]/g;
        let observedMatch;
        while ((observedMatch = observedAttrRegex.exec(content)) !== null) {
          const attrList = observedMatch[1]
            .split(',')
            .map(s => s.replace(/['"\s]/g, ''))
            .filter(Boolean);
          attrList.forEach(attrName => {
            if (!seenAttrs.has(attrName)) {
              seenAttrs.add(attrName);
              let attrDesc = "";
              if (CORE_DESCRIPTIONS[tagName] && CORE_DESCRIPTIONS[tagName].attributes[attrName]) {
                attrDesc = CORE_DESCRIPTIONS[tagName].attributes[attrName];
              } else {
                attrDesc = `Observed attribute '${attrName}' on <${tagName}>.`;
              }
              attributes.push({ name: attrName, description: attrDesc });
            }
          });
        }

        tags.push({
          name: tagName,
          description,
          attributes
        });
      }
    });
  });

  if (!processedTags.has('meld-slot')) {
    tags.push({ name: 'meld-slot', description: 'Slot projection target for Shadow DOM composition.', attributes: [] });
  }
  if (!processedTags.has('meld-portal')) {
    tags.push({ name: 'meld-portal', description: 'Teleports content to the document body.', attributes: [] });
  }

  const customData = {
    version: 1.1,
    tags,
    globalAttributes: [
      { name: 'ref', description: 'Get a direct reference to the DOM element.' }
    ]
  };

  const outputPath = path.join(rootDir, 'html.customData.json');
  fs.writeFileSync(outputPath, JSON.stringify(customData, null, 2));
  console.log(`Successfully generated ${outputPath} with ${tags.length} tags.`);
}

if (process.argv[1] && (process.argv[1] === import.meta.filename || process.argv[1].endsWith('generate-custom-data.js'))) {
  generateCustomData();
}
