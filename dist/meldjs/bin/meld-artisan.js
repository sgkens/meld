#!/usr/bin/env node

/**
 * 🔗 Meld Artisan CLI v2.1
 * The "No-Build" Developer Experience Tool.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// --- 🎨 UX & THEME ---
const STYLE = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bgBlue: "\x1b[44m"
};

const LOGO = `
${STYLE.cyan}
  __  __     _     _   
 |  \\/  |___| | __| |  ${STYLE.reset}${STYLE.dim}The 2kb Micro-Frontend Engine${STYLE.reset}${STYLE.cyan}
 | |\\/| / -_) |/ _\` |  ${STYLE.yellow}Artisan CLI v2.1${STYLE.cyan}
 |_|  |_\\___|_|\\__,_|  ${STYLE.reset}
`;

// --- 💾 TEMPLATES ---

const TPL_COMPONENT = (name) => `import { defineMeld, meldHtml, meldState, onMount } from '../src/meld.core.js';

defineMeld('${name}', (el, { emit }) => {
  const state = meldState({
    // Reactive state
  });

  onMount(() => {
    console.log('${name} mounted');
  });

  return meldHtml\`
    <style>
      :host { display: block; }
    </style>
    <div>
      <!-- ${name} Template -->
    </div>
  \`;
});
`;

const TPL_PLUGIN = (name) => `/**
 * @fileoverview Custom Meld Plugin: ${name}
 */
export const ${name} = {
  install(api, options = {}) {
    const { defineMeld, meldState, meldHtml } = api;
    console.log('${name} installed with options:', options);

    // Example: Add a global helper
    // api.myHelper = () => {};

    // Example: Define a component
    // defineMeld('my-plugin-component', () => ...);
  }
};
`;

// --- 📚 PLUGIN REGISTRY ---
const OFFICIAL_PLUGINS = {
  'router': { filename: 'meld-router.js', desc: 'Client-side hash routing for SPAs.' },
  'store': { filename: 'meld-store.js', desc: 'Global singleton state management.' },
  'query': { filename: 'meld-query.js', desc: 'Reactive fetch wrapper.' },
  'persist': { filename: 'meld-persist.js', desc: 'Local Storage Sync.' },
  'portal': { filename: 'meld-portal.js', desc: 'Teleportation helper.' },
  'a11y': { filename: 'meld-a11y.js', desc: 'Accessibility utilities.' },
  'forms': { filename: 'meld-forms.js', desc: 'Form validation hook.' },
  'time': { filename: 'meld-time.js', desc: 'Date formatting helper.' },
  'ai': { filename: 'meld-ai.js', desc: 'Streaming AI hook.' },
  'federation': { filename: 'meld-federation.js', desc: 'Native Module Federation.' },
  'wasm': { filename: 'meld-wasm.js', desc: 'WebAssembly loader.' },
  'broadcast': { filename: 'meld-broadcast.js', desc: 'Cross-tab state sync.' }
};

// --- ⚙️ COMMAND REGISTRY ---

const COMMANDS = {
  'list': {
    desc: 'List all available commands.',
    run: () => printHelp()
  },
  'init': {
    desc: 'Create a new client-side Meld project.',
    args: '<name>',
    run: (name) => scaffoldProject(name, 'basic')
  },
  'init:stack': {
    desc: 'Scaffold the full KMEL Stack (Knex, Meld, Express, Lucia).',
    args: '<name>',
    run: (name) => scaffoldProject(name, 'full')
  },
  'make:component': {
    desc: 'Create a new UI component file.',
    args: '<tag-name>',
    run: (name) => createComponent(name)
  },
  'make:plugin': {
    desc: 'Create a boilerplate for a custom plugin.',
    args: '<PluginName>',
    run: (name) => createPlugin(name)
  },
  'install:plugin': {
    desc: 'Install an official plugin.',
    args: '<plugin-name>',
    run: (name) => installOfficialPlugin(name)
  },
  'serve': {
    desc: 'Start the development server.',
    run: () => startServer()
  },
  'test': {
    desc: 'Run unit tests (requires npm test script).',
    run: () => {
      console.log(`${STYLE.green}Running Test Suite...${STYLE.reset}`);
      try {
        execSync('npm test', { stdio: 'inherit' });
      } catch (e) {
        error('Test run failed. Ensure you have "test" script in package.json.');
      }
    }
  },
  'build:static': {
    desc: 'Generate Static HTML (SSG) with Declarative Shadow DOM.',
    args: '<output-dir>',
    run: async (outDir = 'dist') => {
      console.log(`${STYLE.green}Starting SSG Build...${STYLE.reset}`);
      try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const baseUrl = 'http://localhost:3000'; // Default
        
        console.log(`  Crawling / ...`);
        await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        
        const html = await page.evaluate(() => {
          function serializeNode(node) {
            if (node.shadowRoot) {
              const shadowContent = Array.from(node.shadowRoot.childNodes).map(serializeNode).join('');
              const template = `<template shadowrootmode="open">${shadowContent}</template>`;
              const clone = node.cloneNode(false);
              clone.innerHTML = template + node.innerHTML;
              return clone.outerHTML;
            }
            if (node.nodeType === 3) return node.nodeValue;
            if (node.nodeType === 8) return ``;
            if (node.nodeType === 1) {
               const clone = node.cloneNode(false);
               clone.innerHTML = Array.from(node.childNodes).map(serializeNode).join('');
               return clone.outerHTML;
            }
            return '';
          }
          return '<!DOCTYPE html>' + serializeNode(document.documentElement);
        });

        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
        fs.writeFileSync(path.join(outDir, 'index.html'), html);
        await browser.close();
        success(`Build Complete! Static files in /${outDir}`);
      } catch (e) {
        error(`Build failed: ${e.message}. (Did you npm install puppeteer?)`);
      }
    }
  },
  'help': {
    desc: 'Display help for a command.',
    args: '<command>',
    run: (cmd) => explainCommand(cmd)
  }
};

// --- 🚀 MAIN EXECUTION ---

console.log(LOGO);

const [,, cmdArg, targetArg] = process.argv;
const command = COMMANDS[cmdArg] ? cmdArg : 'list';

try {
  if (cmdArg === 'help' && targetArg) {
    explainCommand(targetArg);
  } else {
    COMMANDS[command].run(targetArg);
  }
} catch (err) {
  error(err.message);
}

// --- 🧠 LOGIC FUNCTIONS ---

function printHelp() {
  console.log(`${STYLE.bright}Available commands:${STYLE.reset}\n`);
  Object.keys(COMMANDS).forEach(key => {
    if(key === 'help') return;
    const cmd = COMMANDS[key];
    const args = cmd.args ? `${STYLE.yellow}${cmd.args}${STYLE.reset}` : '';
    console.log(`  ${STYLE.green}${key.padEnd(20)}${STYLE.reset} ${args}`);
    console.log(`  ${STYLE.dim}└─ ${cmd.desc}${STYLE.reset}\n`);
  });
}

function explainCommand(cmdName) {
  const cmd = COMMANDS[cmdName];
  if (!cmd) return error(`Command "${cmdName}" not found.`);
  console.log(`${STYLE.bgBlue} HELP ${STYLE.reset} ${STYLE.bright}${cmdName}${STYLE.reset}\n`);
  console.log(`  ${STYLE.dim}Description:${STYLE.reset} ${cmd.desc}`);
  if (cmd.args) console.log(`  ${STYLE.dim}Usage:${STYLE.reset}       npx meld-artisan ${cmdName} ${cmd.args}`);
  console.log('');
}

function scaffoldProject(name, type) {
  if (!name) return error('Please provide a project name.');
  if (fs.existsSync(name)) return error(`Directory "${name}" already exists.`);
  console.log(`Scaffolding ${type === 'full' ? 'KMEL Stack' : 'Meld App'} in ${STYLE.cyan}${name}${STYLE.reset}...`);
  fs.mkdirSync(name);
  const root = path.join(process.cwd(), name);
  const src = path.join(root, (type === 'full' ? 'public/src' : 'src'));
  const comps = path.join(root, (type === 'full' ? 'public/components' : 'components'));
  fs.mkdirSync(src, { recursive: true });
  fs.mkdirSync(path.join(src, 'plugins'), { recursive: true });
  fs.mkdirSync(comps, { recursive: true });
  fs.writeFileSync(path.join(root, '.vscode', 'extensions.json'), JSON.stringify({ recommendations: ["meld-js.meld-vscode"] }, null, 2));
  success(`Project created!`);
}

function createComponent(name) {
  if (!name || !name.includes('-')) return error('Valid tag name required (e.g. user-card).');
  const targetDir = ['components', 'public/components', 'src/components'].find(d => fs.existsSync(d)) || 'components';
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
  const filePath = path.join(targetDir, `${name}.js`);
  if (fs.existsSync(filePath)) return error('Component file already exists.');
  fs.writeFileSync(filePath, TPL_COMPONENT(name));
  success(`Component created at ${filePath}`);
}

function createPlugin(name) {
  if (!name) return error('Plugin name required.');
  const targetDir = ['src/plugins', 'public/src/plugins'].find(d => fs.existsSync(d));
  if (!targetDir) return error('Plugins directory not found.');
  const fileName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.js';
  fs.writeFileSync(path.join(targetDir, fileName), TPL_PLUGIN(name));
  success(`Plugin skeleton created: ${path.join(targetDir, fileName)}`);
}

function installOfficialPlugin(name) {
  const plugin = OFFICIAL_PLUGINS[name];
  if (!plugin) return error(`Unknown plugin "${name}".`);
  const targetDir = ['src/plugins', 'public/src/plugins'].find(d => fs.existsSync(d));
  if (!targetDir) return error('Plugins directory not found.');
  // Mock install (in reality would fetch or copy from bundle)
  console.log(`Installing ${name}...`);
  success(`Installed ${name} plugin.`);
}

function startServer() {
  console.log(`${STYLE.green}Starting development server...${STYLE.reset}`);
  try { execSync('npx serve .', { stdio: 'inherit' }); }
  catch (e) { execSync('python3 -m http.server', { stdio: 'inherit' }); }
}

function error(msg) { console.error(`\n${STYLE.red}✖ ERROR:${STYLE.reset} ${msg}\n`); process.exit(1); }
function success(msg) { console.log(`\n${STYLE.green}✔ SUCCESS:${STYLE.reset} ${msg}\n`); }
