import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
// Pass the Lighthouse module installed by npm exec; it is not a product dependency.
const { default: lighthouse } = await import(
  pathToFileURL(process.argv[2]).href
);
const browser = await chromium.launch({
  args: ['--remote-debugging-port=9222'],
});
try {
  const result = await lighthouse(process.argv[3] || 'http://127.0.0.1:4173/', {
    port: 9222,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  await writeFile('docs/qa/lighthouse-menu.json', result.report);
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(result.lhr.categories).map(([id, c]) => [
          id,
          Math.round(c.score * 100),
        ]),
      ),
    ),
  );
} finally {
  await browser.close();
}
