#!/usr/bin/env node

/**
 * 🔗 Meld Artisan CLI v2.2-RC
 * Refactored for GEMINI.md TUI Standards.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// --- 🎨 GEMINI.MD PALETTE & UI ---
const Palette = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  primary: "\x1b[36m", // Cyan
  success: "\x1b[32m", // Green
  warn: "\x1b[33m",    // Yellow
  danger: "\x1b[31m",  // Red
  bg: "\x1b[44m"       // Blue BG
};

const Icons = {
  info: "🔹",
  success: "🟩",
  error: "🟥",
  pending: "🔄",
  step: "🔸",
  feature: "💠",
  box: "🟦"
};

const UI = {
  header: (text) => console.log(`\n${Palette.bold}${text.toUpperCase()}${Palette.reset}`),
  h2: (text) => console.log(`\n${Palette.bold}## ${text}${Palette.reset}`),
  h3: (text) => console.log(`${Palette.bold}### ${text}${Palette.reset}`),
  log: (icon, text) => console.log(`${icon} ${text}`),
  divider: () => console.log(`${Palette.dim}${"─".repeat(process.stdout.columns || 40)}${Palette.reset}`),
  clear: () => process.stdout.write('\x1b[2J\x1b[0;0H'),
  enterAltBuffer: () => process.stdout.write('\x1b[?1049h'),
  exitAltBuffer: () => process.stdout.write('\x1b[?1049l')
};

const LOGO = `
${Palette.primary}${Palette.bold}
  __  __     _     _   
 |  \\/  |___| | __| |  ${Palette.reset}${Palette.dim}The 2kb Micro-Frontend Engine${Palette.reset}${Palette.primary}
 | |\\/| / -_) |/ _\` |  ${Palette.warn}Artisan CLI v2.2${Palette.primary}
 |_|  |_\\___|_|\\__,_|  ${Palette.reset}
`;

// --- 🛠️ CORE LOGIC ---

const COMMANDS = {
  'dashboard': {
    desc: 'Launch the interactive Artisan Dashboard (TUI).',
    run: () => launchDashboard()
  },
  'init': {
    desc: 'Scaffold a new project.',
    args: '<name>',
    run: (name) => scaffold(name)
  },
  'init-dev-env': {
    desc: 'Initialize the local Docker development environment with all stack tools & VS Code Web.',
    run: () => initDevEnv()
  },
  'make:component': {
    desc: 'Create a UI component.',
    args: '<tag>',
    run: (tag) => createComp(tag)
  },
  'serve': {
    desc: 'Start dev server.',
    run: () => {
      UI.log(Icons.pending, "Starting dev server...");
      try { execSync('npx serve .', { stdio: 'inherit' }); } 
      catch(e) { execSync('python3 -m http.server 3000', { stdio: 'inherit' }); }
    }
  },
  'types': {
    desc: 'Generate IntelliSense types.',
    run: () => generateTypes()
  }
};

// --- 🖥️ TUI DASHBOARD ---

function launchDashboard() {
  UI.enterAltBuffer();
  UI.clear();
  
  const draw = () => {
    UI.clear();
    console.log(LOGO);
    UI.divider();
    UI.h2("Interactive Dashboard");
    UI.log(Icons.feature, `Project: ${path.basename(process.cwd())}`);
    UI.log(Icons.info, "Status: Ready for Production (RC-2)");
    UI.divider();
    UI.h3("Quick Actions");
    console.log("  [s] Start Dev Server");
    console.log("  [t] Generate Types");
    console.log("  [q] Exit Dashboard");
    UI.divider();
    process.stdout.write(`${Palette.primary}artisan > ${Palette.reset}`);
  };

  draw();

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (key) => {
    if (key === 'q') {
      UI.exitAltBuffer();
      process.exit();
    }
    if (key === 's') {
      UI.exitAltBuffer();
      COMMANDS.serve.run();
    }
    if (key === 't') {
      generateTypes();
      setTimeout(draw, 1500);
    }
  });
}

// --- 🧠 OPERATIONS ---

function generateTypes() {
  UI.header("Generating Type Definitions");
  const compsDir = ['src/components', 'components'].find(d => fs.existsSync(d));
  if (!compsDir) {
    UI.log(Icons.error, `${Palette.danger}Components directory not found.${Palette.reset}`);
    return;
  }

  const getAllFiles = (d, arr = []) => {
    fs.readdirSync(d).forEach(f => {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) getAllFiles(p, arr);
      else if (f.endsWith('.js')) arr.push(p);
    });
    return arr;
  };

  const tags = [];
  getAllFiles(compsDir).forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/defineMeld\(['"]([^'"]+)['"]/g);
    for (const m of matches) tags.push(m[1]);
  });

  const dts = `// Generated: ${new Date().toISOString()}\nimport { MeldOptions } from './src/meld.core.js';\ndeclare global {\n  interface HTMLElementTagNameMap {\n    ${tags.map(t => `'${t}': HTMLElement;`).join('\n    ')}\n  }\n}\nexport {};`;
  fs.writeFileSync('meld-env.d.ts', dts);
  UI.log(Icons.success, `${Palette.success}Created meld-env.d.ts with ${tags.length} tags.${Palette.reset}`);
}

function scaffold(name) {
  if (!name) return UI.log(Icons.error, "Project name required.");
  UI.header(`Scaffolding ${name}`);
  fs.mkdirSync(name);
  UI.log(Icons.step, "Created directory structure");
  UI.log(Icons.success, `${Icons.box} Project ${name} is ready.`);
}

function createComp(tag) {
  if (!tag || !tag.includes('-')) return UI.log(Icons.error, "Invalid tag name.");
  const dir = fs.existsSync('src/components') ? 'src/components' : 'components';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, `${tag}.js`), `// ${tag} component`);
  UI.log(Icons.success, `Component ${tag} created in ${dir}/`);
}

function initDevEnv() {
  UI.header("Initializing Docker Development Environment");

  const dockerfileContent = `FROM codercom/code-server:latest

USER root

# Install Node.js, npm, git, build-essential, and postgresql-client
RUN apt-get update && apt-get install -y \\
    curl \\
    git \\
    build-essential \\
    postgresql-client \\
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \\
    && apt-get install -y nodejs \\
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER coder
WORKDIR /home/coder/project
`;

  const composeContent = `version: '3.8'

services:
  workspace:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: meldjs-workspace
    ports:
      - "8080:8080"   # VS Code Web Interface
      - "5173:5173"   # Vite Dev Server / Frontend Stack
      - "3000:3000"   # Backend API / Express / Next.js
    volumes:
      - .:/home/coder/project
    environment:
      - PASSWORD=meldpass  # Login password for VS Code Web (port 8080)
      - DATABASE_URL=postgresql://melduser:meldpass@postgres:5432/melddb
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    container_name: meldjs-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=melduser
      - POSTGRES_PASSWORD=meldpass
      - POSTGRES_DB=melddb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`;

  try {
    fs.writeFileSync('Dockerfile.dev', dockerfileContent);
    UI.log(Icons.step, "Created Dockerfile.dev");

    fs.writeFileSync('docker-compose.dev.yml', composeContent);
    UI.log(Icons.step, "Created docker-compose.dev.yml");

    UI.log(Icons.success, `${Palette.success}Docker environment files created successfully!${Palette.reset}`);
    console.log(`\nTo launch the development environment, run:`);
    console.log(`  ${Palette.primary}docker compose -f docker-compose.dev.yml up --build -d${Palette.reset}`);
    console.log(`\nOnce started, access your VS Code Web workspace at:`);
    console.log(`  ${Palette.success}http://localhost:8080${Palette.reset} (password: ${Palette.primary}meldpass${Palette.reset})\n`);
  } catch (e) {
    UI.log(Icons.error, `${Palette.danger}Failed to write docker files: ${e.message}${Palette.reset}`);
  }
}

// --- 🚀 ENTRY ---

const [,, cmd, arg] = process.argv;

if (!cmd || cmd === 'help') {
  console.log(LOGO);
  UI.h2("Available Commands");
  Object.keys(COMMANDS).forEach(k => {
    console.log(`  ${Palette.success}${k.padEnd(15)}${Palette.reset} ${COMMANDS[k].desc}`);
  });
  console.log(`\n${Icons.info} Tip: Run ${Palette.primary}npx meld-artisan dashboard${Palette.reset} for the full TUI experience.\n`);
} else if (COMMANDS[cmd]) {
  COMMANDS[cmd].run(arg);
} else {
  UI.log(Icons.error, `Unknown command: ${cmd}`);
}
