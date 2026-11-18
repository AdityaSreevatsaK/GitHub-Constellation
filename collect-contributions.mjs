#!/usr/bin/env node
/** Trusted-side read-only official GitHub contribution collection CLI. */
import {writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fetchOfficialCalendar} from './official_calendar.mjs';

const args = process.argv.slice(2);
const value = name => {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1] || args[index + 1].startsWith('--')) throw Error('Missing ' + name);
  return args[index + 1];
};
if (args.includes('--help')) {
  console.log('node collect-contributions.mjs --username USER --out PATH [--as-of YYYY-MM-DD]');
  process.exit(0);
}
try {
  const allowed = new Set(['--username', '--out', '--as-of']);
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed.has(args[i]) || i + 1 >= args.length) throw Error('Invalid collector argument');
  }
  const login = value('--username'), target = resolve(value('--out'));
  const asOf = args.includes('--as-of') ? value('--as-of') : new Date().toISOString().slice(0, 10);
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const snapshot = await fetchOfficialCalendar({login, asOf, token});
  mkdirSync(dirname(target), {recursive: true});
  writeFileSync(target, JSON.stringify(snapshot, null, 2) + '\n', {encoding: 'utf8', mode: 0o600});
  console.log('Official calendar verified for @' + snapshot.user.login + ': ' +
    snapshot.calendar_days.length + ' dated cells, ' + snapshot.displayed_contributions +
    ' API-visible contributions (private activity visibility depends on token and GitHub settings).');
  console.log('Wrote validated snapshot to ' + target);
} catch (error) {
  console.error('Official collection failed: ' + error.message);
  process.exitCode = 1;
}
