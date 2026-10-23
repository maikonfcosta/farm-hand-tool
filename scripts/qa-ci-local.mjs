import { spawnSync } from 'node:child_process';
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this script with npm run qa-ci-local.');
const selected = process.argv.slice(2);
for (const task of selected.length
  ? selected
  : ['lint', 'typecheck', 'test', 'build', 'test:e2e']) {
  const r = spawnSync(process.execPath, [npmCli, 'run', task], {
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status || 1);
}
