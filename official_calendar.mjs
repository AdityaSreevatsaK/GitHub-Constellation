/**
 * Official GitHub GraphQL contribution-calendar collector.
 * Unlike contract v1, contributionCount is not a fabricated commit event.
 * The values represent only what this authenticated API request exposes.
 */
const DAY = 86_400_000;
const levels = new Set(['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const loginPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export function dateMillis(date) {
  if (typeof date !== 'string' || !datePattern.test(date)) throw Error('Expected an ISO calendar date');
  const stamp = Date.parse(date + 'T00:00:00Z');
  if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== date) throw Error('Invalid calendar date');
  return stamp;
}
const iso = timestamp => new Date(timestamp).toISOString().slice(0, 10);
const addDays = (date, delta) => iso(dateMillis(date) + delta * DAY);

export function calendarWindow(asOf) {
  const end = dateMillis(asOf);
  const start = end - (52 * 7 + new Date(end).getUTCDay()) * DAY;
  return {start: iso(start), end: asOf, expectedDays: Math.round((end - start) / DAY) + 1};
}

/** Split into two < one-year GraphQL windows; all 365-371 visible days stay covered. */
export function queryWindows(asOf) {
  const {start, end} = calendarWindow(asOf);
  const midpoint = addDays(start, 13);
  if (dateMillis(midpoint) >= dateMillis(end)) throw Error('Invalid contribution window');
  return [{from: start, to: midpoint}, {from: addDays(midpoint, 1), to: end}];
}

const QUERY = [
  'query ConstellationCalendar($login: String!, $from: DateTime!, $to: DateTime!) {',
  '  user(login: $login) {',
  '    login',
  '    contributionsCollection(from: $from, to: $to) {',
  '      contributionCalendar {',
  '        totalContributions',
  '        weeks { firstDay contributionDays { date weekday contributionCount contributionLevel } }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

function validateLogin(login) {
  if (typeof login !== 'string' || !loginPattern.test(login) || login.includes('--')) throw Error('Invalid GitHub username');
  return login;
}
const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);

/** Validate complete authorised GraphQL results; do not fill absent dates with zero. */
export function normaliseContributionResponses(responses, {login, asOf, fetchedAt}) {
  validateLogin(login);
  dateMillis(asOf);
  if (!Array.isArray(responses) || responses.length !== 2) throw Error('Expected two official calendar windows');
  const windows = queryWindows(asOf);
  const collected = new Map();
  for (let index = 0; index < responses.length; index++) {
    const response = responses[index];
    if (!isObject(response) || (Array.isArray(response.errors) && response.errors.length)) throw Error('GitHub GraphQL reported an error');
    const user = response.data?.user;
    if (!isObject(user) || typeof user.login !== 'string' || user.login.toLowerCase() !== login.toLowerCase()) throw Error('GitHub returned a different or missing user');
    const collection = user.contributionsCollection?.contributionCalendar;
    if (!isObject(collection) || !Array.isArray(collection.weeks)) throw Error('Missing official GitHub calendar weeks');
    const {from, to} = windows[index];
    for (const week of collection.weeks) {
      if (!isObject(week) || !Array.isArray(week.contributionDays)) throw Error('Invalid GitHub calendar week');
      for (const day of week.contributionDays) {
        if (!isObject(day)) throw Error('Invalid GitHub calendar day');
        const stamp = dateMillis(day.date);
        if (!Number.isSafeInteger(day.contributionCount) || day.contributionCount < 0 || day.contributionCount > 1_000_000) throw Error('Invalid official contribution count');
        if (!levels.has(day.contributionLevel)) throw Error('Unrecognised GitHub contribution level');
        if (day.weekday !== new Date(stamp).getUTCDay()) throw Error('GitHub weekday/date mismatch');
        if ((day.contributionCount === 0) !== (day.contributionLevel === 'NONE')) throw Error('Contradictory GitHub contribution count and level');
        if (day.date < from || day.date > to) continue; // Week-boundary padding is not source coverage.
        if (collected.has(day.date)) throw Error('Duplicate GitHub calendar day');
        collected.set(day.date, {date: day.date, contribution_count: day.contributionCount, contribution_level: day.contributionLevel});
      }
    }
  }
  const {start, expectedDays} = calendarWindow(asOf);
  const days = [];
  for (let i = 0; i < expectedDays; i++) {
    const date = addDays(start, i);
    const day = collected.get(date);
    if (!day) throw Error('Incomplete GitHub contribution calendar: missing ' + date);
    days.push(day);
  }
  if (collected.size !== days.length) throw Error('Unexpected calendar coverage');
  const fetched = fetchedAt ?? new Date().toISOString();
  if (typeof fetched !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(fetched) || !Number.isFinite(Date.parse(fetched))) throw Error('Invalid fetched timestamp');
  return {
    schema_version: '2-official-calendar',
    source: 'github_contribution_calendar',
    user: {login, url: 'https://github.com/' + login},
    as_of: asOf,
    fetched_at: fetched,
    visibility: 'api_visible',
    window: {from: start, to: asOf},
    calendar_days: days,
    displayed_contributions: days.reduce((sum, day) => sum + day.contribution_count, 0),
  };
}

export async function fetchOfficialCalendar({login, asOf = new Date().toISOString().slice(0, 10), token, fetchImpl = fetch}) {
  validateLogin(login);
  const currentUTC = new Date().toISOString().slice(0, 10);
  dateMillis(asOf);
  if (asOf > currentUTC) throw Error('Cannot collect contributions from a future date');
  if (typeof token !== 'string' || !token.trim()) throw Error('GITHUB_TOKEN or GH_TOKEN is required for official collection');
  const windows = queryWindows(asOf), responses = [];
  for (const {from, to} of windows) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetchImpl('https://api.github.com/graphql', {
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json', 'User-Agent': 'GitHub-Constellation'},
        body: JSON.stringify({query: QUERY, variables: {
          login, from: from + 'T00:00:00Z', to: to + 'T23:59:59Z',
        }}),
        signal: controller.signal,
      });
      if (!response.ok) throw Error('GitHub GraphQL request failed (HTTP ' + Number(response.status) + ')');
      const data = await response.json();
      if (!isObject(data)) throw Error('GitHub returned an invalid JSON response');
      responses.push(data);
    } catch (error) {
      if (error.name === 'AbortError') throw Error('GitHub GraphQL request timed out');
      // Never expose a token, response body, or raw GraphQL error details in logs.
      if (error.message?.startsWith('GitHub ')) throw error;
      throw Error('Unable to fetch GitHub contribution calendar');
    } finally {
      clearTimeout(timeout);
    }
  }
  return normaliseContributionResponses(responses, {login, asOf, fetchedAt: new Date().toISOString()});
}
