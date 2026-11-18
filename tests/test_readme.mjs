import {test} from 'node:test';
import assert from 'node:assert/strict';
import {updateReadmeSummary} from '../update_readme_stats.mjs';
import {calendarWindow,dateMillis} from '../official_calendar.mjs';

const asOf='2026-11-18';
function officialSnapshot() {
  const {start,expectedDays}=calendarWindow(asOf);
  const days=Array.from({length:expectedDays},(_,i)=>{
    const date=new Date(dateMillis(start)+i*86400000).toISOString().slice(0,10);
    return {date,contribution_count:i===1?3:0,contribution_level:i===1?'SECOND_QUARTILE':'NONE'};
  });
  return {schema_version:'2-official-calendar',source:'github_contribution_calendar',user:{login:'ExampleUser',url:'https://github.com/ExampleUser'},
    as_of:asOf,fetched_at:'2026-11-18T14:24:00.000Z',visibility:'api_visible',
    window:{from:start,to:asOf},calendar_days:days,displayed_contributions:3};
}
const README='Header\n<!-- CONSTELLATION_SUMMARY_START -->\nOld\n<!-- CONSTELLATION_SUMMARY_END -->\nFooter';
test('verified README summary displays correct API counts, dates and traceability',()=>{
  const text=updateReadmeSummary(README,officialSnapshot());
  assert.ok(text.startsWith('Header\n'));
  assert.ok(text.endsWith('\nFooter'));
  assert.ok(text.includes('18 November')===false); // exact UTC timestamp avoids locale ambiguity
  assert.ok(text.includes('2026-11-18 14:24 UTC'));
  assert.ok(text.includes('3 API-visible GitHub contributions'));
  assert.ok(text.includes('1 active dates'));
  assert.ok(text.includes('0 consecutive active-day runs'));
  assert.ok(!text.includes('\nOld\n'));
  assert.equal(updateReadmeSummary(text,officialSnapshot()),text);
});
test('untrusted and invalid source data cannot replace published summary',()=>{
  const source=officialSnapshot();
  for(const modify of [
    p=>p.source='demo',
    p=>p.displayed_contributions=99,
    p=>p.calendar_days.pop(),
    p=>p.user.login='<script>',
    p=>p.fetched_at='not-a-date',
  ]){const altered=structuredClone(source);modify(altered);assert.throws(()=>updateReadmeSummary(README,altered));}
});
test('README marker duplication, omission or reversal is rejected',()=>{
  const p=officialSnapshot();
  for(const text of ['no marker',README+README,README.replace('<!-- CONSTELLATION_SUMMARY_END -->',''),README.replace('<!-- CONSTELLATION_SUMMARY_START -->','')]){
    assert.throws(()=>updateReadmeSummary(text,p),/marker/);
  }
});
