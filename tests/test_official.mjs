import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calendarWindow,queryWindows,normaliseContributionResponses,fetchOfficialCalendar,dateMillis} from '../official_calendar.mjs';
import {constellationEngine} from '../engine.mjs';
const api=constellationEngine(),asOf='2026-11-18',login='AdityaSreevatsaK',DAY=86400000;
const iso=t=>new Date(t).toISOString().slice(0,10), copy=x=>structuredClone(x);
const level=n=>n===0?'NONE':n>=7?'FOURTH_QUARTILE':n>=3?'SECOND_QUARTILE':'FIRST_QUARTILE';
function sample(){
  const start=dateMillis(calendarWindow(asOf).start);
  return queryWindows(asOf).map(({from,to})=>{
    const days=[];
    for(let ms=dateMillis(from);ms<=dateMillis(to);ms+=DAY){
      const i=(ms-start)/DAY,contributionCount=i%11===0?7:i%5===0?3:i%3===0?1:0;
      days.push({date:iso(ms),weekday:new Date(ms).getUTCDay(),contributionCount,contributionLevel:level(contributionCount)});
    }
    return {data:{user:{login,contributionsCollection:{contributionCalendar:{totalContributions:0,weeks:[{firstDay:from,contributionDays:days}]}}}}};
  });
}
const valid=()=>normaliseContributionResponses(sample(),{login,asOf,fetchedAt:'2026-11-18T13:00:00Z'});

test('fixed Sunday-first official calendar and split within one-year windows',()=>{
  assert.equal(calendarWindow(asOf).expectedDays,368);
  assert.equal(new Date(dateMillis(calendarWindow(asOf).start)).getUTCDay(),0);
  assert.equal(queryWindows(asOf)[1].to,asOf);
});
test('normalise date/count/level without inventing repository events',()=>{
  const p=valid(),m=api.parse(p);
  assert.equal(p.calendar_days.length,368);
  assert.equal(p.visibility,'api_visible');
  assert.equal(p.displayed_contributions,m.totalUnits);
  assert.equal(m.metric,'official');
  assert.equal(m.visibleEvents.length,0);
  assert.equal(m.cells.length,371);
  assert.equal(m.cells.at(-1).future,true);
  assert.equal(m.active.length,p.calendar_days.filter(d=>d.contribution_count>0).length);
});
test('all six variants render a source-specific GitHub legend and exact cells',()=>{
  const p=valid();
  for(const design of ['comet','cartographer','starforge'])for(const theme of ['night','paper']){
    const svg=api.render(p,{design,theme,animated:true});
    assert.ok(svg.includes('GITHUB API CONTRIBUTION LEVEL'));
    assert.ok(svg.includes('data-source="github_contribution_calendar"'));
    assert.ok(svg.includes('PRIVATE VISIBILITY VARIES'));
    assert.ok(!svg.includes('UNLIT = NOT IN SAMPLE'));
    assert.equal((svg.match(/class="calendar-cell"/g)||[]).length,371);
    assert.ok(!svg.includes('recorded events,'));
  }
});
test('missing/duplicate days and identity mismatches fail closed',()=>{
  const missing=sample();missing[0].data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays.pop();
  assert.throws(()=>normaliseContributionResponses(missing,{login,asOf}),/Incomplete/);
  const duplicate=sample(),ds=duplicate[0].data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays;
  ds.push({...ds[0]});
  assert.throws(()=>normaliseContributionResponses(duplicate,{login,asOf}),/Duplicate/);
  const wrong=sample();wrong[0].data.user.login='someone-else';
  assert.throws(()=>normaliseContributionResponses(wrong,{login,asOf}),/different/);
});
test('malformed day values and misleading official snapshot fields are rejected',()=>{
  for(const mutate of [
    d=>d.weekday=8,d=>d.contributionCount=-1,d=>d.contributionCount=1.5,
    d=>d.contributionLevel='OTHER',d=>{d.contributionCount=0;d.contributionLevel='FIRST_QUARTILE';},
  ]){
    const data=sample();mutate(data[0].data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0]);
    assert.throws(()=>normaliseContributionResponses(data,{login,asOf}));
  }
  for(const mutate of [
    p=>p.displayed_contributions++,p=>p.calendar_days[10].date='2026-01-01',
    p=>p.calendar_days.pop(),p=>p.visibility='private',p=>p.window.from='2000-01-01',
  ]){const p=copy(valid());mutate(p);assert.throws(()=>api.parse(p));}
});
test('legitimate week padding ignored without creating dates',()=>{
  const data=sample(),ms=dateMillis(calendarWindow(asOf).start)-DAY;
  data[0].data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays.unshift({
    date:iso(ms),weekday:new Date(ms).getUTCDay(),contributionCount:0,contributionLevel:'NONE',
  });
  assert.deepEqual(normaliseContributionResponses(data,{login,asOf}).calendar_days,valid().calendar_days);
});
test('rendering is deterministic and links to validated owner identity',()=>{
  const p=valid(),s=api.render(p,{design:'comet',animated:false});
  assert.equal(s,api.render(p,{design:'comet',animated:false}));
  assert.ok(s.includes('GITHUB CALENDAR ·'));
  assert.ok(s.includes('href="https://github.com/AdityaSreevatsaK"'));
});
test('collector fetches in two authenticated windows but never writes token to output',async()=>{
  const data=sample();let calls=0;
  const fetchImpl=async(url,options)=>{
    assert.equal(url,'https://api.github.com/graphql');
    assert.equal(options.headers.Authorization,'Bearer SAMPLE_SECRET');
    const payload=JSON.parse(options.body);
    assert.equal(payload.variables.login,login);
    assert.ok(payload.variables.from.endsWith('T00:00:00Z'));
    assert.ok(payload.variables.to.endsWith('T23:59:59Z'));
    return {ok:true,status:200,json:async()=>data[calls++]};
  };
  const snapshot=await fetchOfficialCalendar({login,asOf,token:'SAMPLE_SECRET',fetchImpl});
  assert.equal(calls,2);assert.ok(!JSON.stringify(snapshot).includes('SAMPLE_SECRET'));
});
test('collector refuses missing token, future dates and HTTP rejection',async()=>{
  await assert.rejects(fetchOfficialCalendar({login,asOf,token:''}),/required/);
  await assert.rejects(fetchOfficialCalendar({login,asOf:'2999-01-01',token:'t'}),/future/);
  await assert.rejects(fetchOfficialCalendar({login,asOf,token:'t',fetchImpl:async()=>({ok:false,status:403})}),/HTTP 403/);
});
