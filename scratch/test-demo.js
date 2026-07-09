import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const vite = spawn('npx', ['vite', '--port', '5188', '--host', '127.0.0.1'], {
  stdio: 'pipe'
});

vite.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(`[Vite] ${str.trim()}`);
});

vite.stderr.on('data', (data) => {
  console.error(`[Vite Error] ${data.toString().trim()}`);
});

// Wait for Vite to start
await new Promise(resolve => setTimeout(resolve, 2000));

try {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  await page.goto('http://127.0.0.1:5188/demo-taskmanager/index.html');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const bodyHTML = await page.evaluate(() => {
    const root = document.querySelector('app-root');
    if (!root) return 'No app-root element found';
    let output = `--- APP-ROOT SHADOW HTML ---\n${root.shadowRoot ? root.shadowRoot.innerHTML : 'No shadowRoot on app-root'}\n`;
    const view = root.shadowRoot ? root.shadowRoot.querySelector('meld-view') : null;
    if (view) {
      output += `\n--- MELD-VIEW SHADOW HTML ---\n${view.shadowRoot ? view.shadowRoot.innerHTML : 'No shadowRoot on meld-view'}\n`;
    }
    return output;
  });
  console.log('\n' + bodyHTML + '-------------------------\n');

  await browser.close();
} catch (e) {
  console.error('Puppeteer run failed:', e);
} finally {
  vite.kill();
}
